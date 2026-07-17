from __future__ import annotations

import base64
import ctypes
import json
import os
import sys
from ctypes import wintypes
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

from config import workspace_root

LEGACY_SECRET_STORE_PATH = "apps/local-service/data/provider-secrets.json"
DPAPI_SECRET_STORE_PATH = "apps/local-service/data/provider-secrets.dpapi.json"
DPAPI_DESCRIPTION = "Kuroii Motion AI Provider Secret"
DPAPI_ENTROPY = b"Kuroii Motion AI Suite/provider-secrets/v1"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def provider_secret_ref(provider_id: str) -> str:
    safe_id = "".join(char if char.isalnum() or char in {"-", "_"} else "-" for char in provider_id)
    return f"provider:{safe_id}:apiKey"


def provider_profile_secret_ref(profile_id: str) -> str:
    safe_id = "".join(char if char.isalnum() or char in {"-", "_"} else "-" for char in profile_id)
    return f"provider-profile:{safe_id}:apiKey"


def secret_status(value: str | None) -> dict[str, Any]:
    text = str(value or "")
    return {
        "configured": bool(text),
        "preview": f"{text[:4]}…{text[-4:]}" if len(text) >= 8 else ("••••" if text else ""),
    }


class SecretStore(Protocol):
    backend: str

    def get(self, secret_ref: str) -> str:
        ...

    def set(self, secret_ref: str, provider_id: str, value: str) -> None:
        ...

    def delete(self, secret_ref: str) -> None:
        ...

    def metadata(self) -> dict[str, Any]:
        ...


class _DataBlob(ctypes.Structure):
    _fields_ = [("cbData", wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_byte))]


def _blob_from_bytes(data: bytes) -> tuple[_DataBlob, Any]:
    buffer = ctypes.create_string_buffer(data)
    blob = _DataBlob(len(data), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_byte)))
    return blob, buffer


def _dpapi_protect(value: str) -> str:
    if sys.platform != "win32":
        raise RuntimeError("Windows DPAPI is only available on Windows.")
    plaintext_blob, plaintext_buffer = _blob_from_bytes(value.encode("utf-8"))
    entropy_blob, entropy_buffer = _blob_from_bytes(DPAPI_ENTROPY)
    encrypted_blob = _DataBlob()
    crypt32 = ctypes.WinDLL("Crypt32.dll")
    kernel32 = ctypes.WinDLL("Kernel32.dll")
    ok = crypt32.CryptProtectData(
        ctypes.byref(plaintext_blob),
        DPAPI_DESCRIPTION,
        ctypes.byref(entropy_blob),
        None,
        None,
        0,
        ctypes.byref(encrypted_blob),
    )
    _ = plaintext_buffer, entropy_buffer
    if not ok:
        raise ctypes.WinError()
    try:
        encrypted = ctypes.string_at(encrypted_blob.pbData, encrypted_blob.cbData)
        return base64.b64encode(encrypted).decode("ascii")
    finally:
        kernel32.LocalFree(encrypted_blob.pbData)


def _dpapi_unprotect(ciphertext: str) -> str:
    if sys.platform != "win32":
        raise RuntimeError("Windows DPAPI is only available on Windows.")
    encrypted_blob, encrypted_buffer = _blob_from_bytes(base64.b64decode(ciphertext))
    entropy_blob, entropy_buffer = _blob_from_bytes(DPAPI_ENTROPY)
    plaintext_blob = _DataBlob()
    crypt32 = ctypes.WinDLL("Crypt32.dll")
    kernel32 = ctypes.WinDLL("Kernel32.dll")
    ok = crypt32.CryptUnprotectData(
        ctypes.byref(encrypted_blob),
        None,
        ctypes.byref(entropy_blob),
        None,
        None,
        0,
        ctypes.byref(plaintext_blob),
    )
    _ = encrypted_buffer, entropy_buffer
    if not ok:
        raise ctypes.WinError()
    try:
        plaintext = ctypes.string_at(plaintext_blob.pbData, plaintext_blob.cbData)
        return plaintext.decode("utf-8")
    finally:
        kernel32.LocalFree(plaintext_blob.pbData)


class WindowsDpapiSecretStore:
    backend = "windows-dpapi"

    def __init__(self, path: Path) -> None:
        self.path = path

    def _read(self) -> dict[str, Any]:
        if not self.path.is_file():
            return {"version": 2, "backend": self.backend, "scope": "current-user", "secrets": {}, "updatedAt": None}
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {"version": 2, "backend": self.backend, "scope": "current-user", "secrets": {}, "updatedAt": None}
        if not isinstance(data, dict):
            return {"version": 2, "backend": self.backend, "scope": "current-user", "secrets": {}, "updatedAt": None}
        secrets = data.get("secrets")
        return {
            "version": 2,
            "backend": self.backend,
            "scope": "current-user",
            "secrets": secrets if isinstance(secrets, dict) else {},
            "updatedAt": data.get("updatedAt"),
        }

    def _write(self, store: dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        store["version"] = 2
        store["backend"] = self.backend
        store["scope"] = "current-user"
        store["updatedAt"] = utc_now()
        temporary_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
        temporary_path.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")
        os.replace(temporary_path, self.path)

    def get(self, secret_ref: str) -> str:
        item = self._read().get("secrets", {}).get(secret_ref, {})
        ciphertext = item.get("ciphertext") if isinstance(item, dict) else ""
        if not ciphertext:
            return ""
        try:
            return _dpapi_unprotect(str(ciphertext))
        except (ValueError, OSError, RuntimeError):
            return ""

    def set(self, secret_ref: str, provider_id: str, value: str) -> None:
        store = self._read()
        store.setdefault("secrets", {})[secret_ref] = {
            "kind": "apiKey",
            "providerId": provider_id,
            "ciphertext": _dpapi_protect(value),
            "updatedAt": utc_now(),
        }
        self._write(store)

    def delete(self, secret_ref: str) -> None:
        store = self._read()
        if store.setdefault("secrets", {}).pop(secret_ref, None) is not None:
            self._write(store)

    def metadata(self) -> dict[str, Any]:
        return {
            "backend": self.backend,
            "scope": "current-user",
            "path": str(self.path.relative_to(workspace_root())).replace("\\", "/"),
            "encryptedAtRest": True,
        }


class VolatileSecretStore:
    backend = "volatile-memory"

    def __init__(self) -> None:
        self.secrets: dict[str, str] = {}

    def get(self, secret_ref: str) -> str:
        return self.secrets.get(secret_ref, "")

    def set(self, secret_ref: str, provider_id: str, value: str) -> None:
        _ = provider_id
        self.secrets[secret_ref] = value

    def delete(self, secret_ref: str) -> None:
        self.secrets.pop(secret_ref, None)

    def metadata(self) -> dict[str, Any]:
        return {"backend": self.backend, "scope": "process", "path": None, "encryptedAtRest": False}


_SECRET_STORE: SecretStore | None = None


def legacy_secret_store_path() -> Path:
    override = os.environ.get("KUROII_LEGACY_SECRET_STORE_PATH")
    return Path(override) if override else workspace_root() / LEGACY_SECRET_STORE_PATH


def dpapi_secret_store_path() -> Path:
    override = os.environ.get("KUROII_SECRET_STORE_PATH")
    return Path(override) if override else workspace_root() / DPAPI_SECRET_STORE_PATH


def _migrate_legacy_store(store: SecretStore) -> None:
    legacy_path = legacy_secret_store_path()
    if not legacy_path.is_file():
        return
    try:
        legacy = json.loads(legacy_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return
    secrets = legacy.get("secrets") if isinstance(legacy, dict) else None
    if not isinstance(secrets, dict):
        return
    migrated = False
    for secret_ref, item in secrets.items():
        if not isinstance(item, dict):
            continue
        value = str(item.get("value", "") or "")
        provider_id = str(item.get("providerId", "") or "")
        if value and provider_id:
            store.set(str(secret_ref), provider_id, value)
            if store.get(str(secret_ref)) != value:
                raise RuntimeError(f"Secret migration verification failed: {secret_ref}")
            migrated = True
    if migrated or not secrets:
        legacy_path.unlink(missing_ok=True)


def get_secret_store() -> SecretStore:
    global _SECRET_STORE
    if _SECRET_STORE is not None:
        return _SECRET_STORE
    backend = os.environ.get("KUROII_SECRET_STORE_BACKEND", "auto").strip().lower()
    if backend == "memory":
        _SECRET_STORE = VolatileSecretStore()
    elif sys.platform == "win32" and backend in {"auto", "windows-dpapi", "dpapi"}:
        _SECRET_STORE = WindowsDpapiSecretStore(dpapi_secret_store_path())
    else:
        _SECRET_STORE = VolatileSecretStore()
    _migrate_legacy_store(_SECRET_STORE)
    return _SECRET_STORE


def reset_secret_store_for_tests() -> None:
    global _SECRET_STORE
    _SECRET_STORE = None


def secret_store_metadata() -> dict[str, Any]:
    return get_secret_store().metadata()


def save_provider_secret(provider_id: str, api_key: str) -> dict[str, Any]:
    secret_ref = provider_secret_ref(provider_id)
    get_secret_store().set(secret_ref, provider_id, api_key)
    return {"apiKeyRef": secret_ref, "apiKeyStatus": secret_status(api_key)}


def save_provider_profile_secret(provider_id: str, profile_id: str, api_key: str) -> dict[str, Any]:
    secret_ref = provider_profile_secret_ref(profile_id)
    get_secret_store().set(secret_ref, provider_id, api_key)
    return {"apiKeyRef": secret_ref, "apiKeyStatus": secret_status(api_key)}


def delete_provider_profile_secret(profile_id: str) -> None:
    get_secret_store().delete(provider_profile_secret_ref(profile_id))


def get_provider_secret(provider_id: str, api_key_ref: str | None = None) -> str:
    secret_ref = api_key_ref or provider_secret_ref(provider_id)
    return get_secret_store().get(secret_ref)


def get_provider_secret_status(provider_id: str, api_key_ref: str | None = None) -> dict[str, Any]:
    return secret_status(get_provider_secret(provider_id, api_key_ref))
