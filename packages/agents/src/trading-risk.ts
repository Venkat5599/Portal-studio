import type { AgentQuery, ParsedIntent, ProtectionSignal } from "./types";

function includesAny(value: string, words: string[]): boolean {
  return words.some((word) => value.includes(word));
}

export function analyzeTradingRisk(
  query: AgentQuery,
  intent: ParsedIntent
): ProtectionSignal[] {
  const lower = query.message.toLowerCase();
  const signals: ProtectionSignal[] = [];

  if (intent.kind === "approval" && includesAny(lower, ["unlimited", "infinite", "max approval", "uint256.max"])) {
    signals.push({
      id: "unlimited-approval",
      severity: "critical",
      category: "approval-risk",
      title: "Unlimited approval requested",
      detail:
        "Agentic execution should avoid unlimited approvals unless the spender is verified and scoped by policy.",
    });
  }

  if (intent.kind === "trade" && /\b([1-9]\d?)\s?%\s*(slippage|slip)\b/.test(lower)) {
    const match = lower.match(/\b([1-9]\d?)\s?%\s*(slippage|slip)\b/);
    const slippage = Number.parseInt(match?.[1] ?? "0", 10);
    if (slippage >= 5) {
      signals.push({
        id: "high-slippage",
        severity: slippage >= 10 ? "critical" : "high",
        category: "trading-risk",
        title: "High slippage tolerance",
        detail:
          "Large slippage tolerances can expose retail users and autonomous agents to sandwiching or poor execution.",
      });
    }
  }

  if (intent.kind === "trade" && includesAny(lower, ["leverage", "long", "short", "perp", "liquidation"])) {
    signals.push({
      id: "liquidation-risk",
      severity: "high",
      category: "trading-risk",
      title: "Leveraged trading risk",
      detail:
        "The strategy should define liquidation thresholds, max loss, and stop conditions before agent execution.",
    });
  }

  if (includesAny(lower, ["unknown router", "unknown contract", "unverified", "not verified"])) {
    signals.push({
      id: "unverified-counterparty",
      severity: "critical",
      category: "contract-risk",
      title: "Unverified counterparty",
      detail:
        "MantleGuard should block execution until the contract address, source, and intended call path are verified.",
    });
  }

  if (intent.kind === "trade" || intent.kind === "approval") {
    signals.push({
      id: "bga-transparency",
      severity: "medium",
      category: "transparency",
      title: "Strategy transparency required",
      detail:
        "The decision should produce an auditable rationale so users can inspect why the agent allowed, warned, or blocked execution.",
    });
  }

  return signals;
}
