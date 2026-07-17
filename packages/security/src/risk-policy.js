export function requiresConfirmation(riskLevel) {
  return riskLevel >= 1;
}

export function requiresTypedConfirmation(riskLevel) {
  return riskLevel >= 5;
}
