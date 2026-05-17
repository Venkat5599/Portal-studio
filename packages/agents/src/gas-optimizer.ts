import type { AgentQuery, GasSuggestion, ParsedIntent } from "./types";

export function suggestGasOptimizations(
  query: AgentQuery,
  intent: ParsedIntent
): GasSuggestion[] {
  const lower = query.message.toLowerCase();
  const suggestions: GasSuggestion[] = [];

  if (intent.kind === "approval" || lower.includes("approve")) {
    suggestions.push({
      id: "exact-approval",
      impact: "medium",
      title: "Use exact approvals",
      detail:
        "Approve the exact spend amount for the next action instead of issuing a repeated or unlimited approval.",
    });
  }

  if (intent.kind === "trade" && lower.includes("rebalance")) {
    suggestions.push({
      id: "batch-rebalance",
      impact: "high",
      title: "Batch rebalance actions",
      detail:
        "Combine dependent rebalance steps where possible so the agent avoids redundant approvals and intermediate state writes.",
    });
  }

  if (intent.kind === "deployment" || lower.includes("storage")) {
    suggestions.push({
      id: "storage-packing",
      impact: "medium",
      title: "Review storage layout",
      detail:
        "Pack small values and prefer immutable configuration for deployment-time constants to reduce recurring gas costs.",
    });
  }

  if (lower.includes("calldata") || lower.includes("sdk")) {
    suggestions.push({
      id: "calldata-minimization",
      impact: "low",
      title: "Minimize calldata",
      detail:
        "Pass compact policy identifiers and hashes on-chain; keep full reports in content-addressed off-chain storage.",
    });
  }

  return suggestions;
}
