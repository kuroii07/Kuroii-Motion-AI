from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass(frozen=True)
class ServiceConfig:
    service_id: str = "kuroii-motion-ai-local-service"
    version: str = "0.3.4-alpha.0"
    host: str = "127.0.0.1"
    port: int = 17631
    session_token: str = "dev-local-token"
    payload_limit_bytes: int = 1024 * 1024
    redact_logs: bool = True
    mode: str = "mock"


def workspace_root() -> Path:
    return Path(__file__).resolve().parents[3]


def load_config(host: str | None = None, port: int | None = None, token: str | None = None) -> ServiceConfig:
    env_port = os.environ.get("KUROII_LOCAL_PORT")
    return ServiceConfig(
        host=host or os.environ.get("KUROII_LOCAL_HOST") or ServiceConfig.host,
        port=port or (int(env_port) if env_port else ServiceConfig.port),
        session_token=token or os.environ.get("KUROII_LOCAL_TOKEN") or ServiceConfig.session_token,
    )
