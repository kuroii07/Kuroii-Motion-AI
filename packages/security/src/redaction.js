export function redactSecret(value) {
  if (!value) return value;
  const text = String(value);
  if (text.length <= 8) return "****";
  return `${text.slice(0, 4)}…${text.slice(-4)}`;
}
