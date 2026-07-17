export const nodeTypes = ["Input", "AI Task", "Host Action", "Condition", "Transform", "Asset", "Wait", "Approval", "Output"];

export function createLinearWorkflow(workflowId, nodes) {
  return {
    workflowId,
    schemaVersion: "0.3.0",
    nodes,
    edges: nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id })),
    approvalPolicy: "manual"
  };
}
