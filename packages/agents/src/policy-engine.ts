import type {
  GasSuggestion,
  PolicyVerdict,
  ProtectionSignal,
  ToolExecution,
} from "./types";

const severityWeight = {
  info: 2,
  low: 8,
  medium: 18,
  high: 32,
  critical: 48,
} as const;

export function evaluatePolicy(
  signals: ProtectionSignal[],
  gasSuggestions: GasSuggestion[],
  toolExecutions: ToolExecution[]
): PolicyVerdict {
  const signalScore = signals.reduce(
    (total, signal) => total + severityWeight[signal.severity],
    0
  );
  const requiredToolsPending = toolExecutions.some(
    (tool) => tool.required && tool.status !== "completed"
  );
  const toolPenalty = requiredToolsPending ? 18 : 0;
  const riskScore = Math.min(100, signalScore + toolPenalty);
  const hasCritical = signals.some((signal) => signal.severity === "critical");

  const verdict = hasCritical || riskScore >= 75 ? "Block" : riskScore >= 35 ? "Warn" : "Allow";
  const reasons = signals.map((signal) => signal.title);

  if (requiredToolsPending) {
    reasons.push("Required security tool execution is pending");
  }

  const requiredActions = [
    ...signals
      .filter((signal) => signal.severity === "high" || signal.severity === "critical")
      .map((signal) => signal.detail),
    ...gasSuggestions
      .filter((suggestion) => suggestion.impact !== "low")
      .map((suggestion) => suggestion.detail),
  ];

  if (requiredToolsPending) {
    requiredActions.push(
      "Run the required configured scanner or simulation before treating this as execution-safe."
    );
  }

  return {
    verdict,
    riskScore,
    reasons,
    requiredActions,
  };
}
