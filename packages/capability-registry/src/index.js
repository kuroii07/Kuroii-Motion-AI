export function findCapability(registry, capabilityId) {
  return registry.capabilities.find((capability) => capability.id === capabilityId) || null;
}
