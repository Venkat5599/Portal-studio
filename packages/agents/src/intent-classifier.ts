import type { AgentQuery, ParsedIntent } from "./types";

const addressPattern = /0x[a-fA-F0-9]{40}/g;
const assetPattern = /\b(?:MNT|ETH|USDT|USDC|mETH|fBTC|USDY|USDe)\b/g;

function findMatches(pattern: RegExp, value: string): string[] {
  return Array.from(new Set(value.match(pattern) ?? []));
}

export function classifyIntent(query: AgentQuery): ParsedIntent {
  const message = query.message;
  const lower = message.toLowerCase();
  const addresses = findMatches(addressPattern, message);
  const assets = findMatches(assetPattern, message);
  const protocols = ["bybit", "byreal", "merchant moe", "agni", "fluxion"]
    .filter((protocol) => lower.includes(protocol))
    .map((protocol) => protocol.replace(/\b\w/g, (char) => char.toUpperCase()));

  if (/\b(approve|approval|allowance|permit|spender)\b/.test(lower)) {
    return {
      kind: "approval",
      confidence: 0.82,
      action: "Token approval or allowance change",
      assets,
      protocols,
      addresses,
    };
  }

  if (/\b(swap|trade|long|short|rebalance|arbitrage|market.?make|position|leverage|liquidat)\b/.test(lower)) {
    return {
      kind: "trade",
      confidence: 0.8,
      action: "Trading or portfolio execution",
      assets,
      protocols,
      addresses,
    };
  }

  if (/\b(deploy|bytecode|constructor|solidity contract|smart contract)\b/.test(lower)) {
    return {
      kind: "deployment",
      confidence: 0.78,
      action: "Contract deployment or pre-deploy review",
      assets,
      protocols,
      addresses,
    };
  }

  if (/\b(owner|admin|upgrade|pause|unpause|role|governance|privileged)\b/.test(lower)) {
    return {
      kind: "admin-action",
      confidence: 0.76,
      action: "Privileged protocol action",
      assets,
      protocols,
      addresses,
    };
  }

  if (/\b(monitor|alert|watch|detect|exploit|anomaly)\b/.test(lower)) {
    return {
      kind: "monitoring",
      confidence: 0.72,
      action: "Monitoring or exploit detection",
      assets,
      protocols,
      addresses,
    };
  }

  if (/\b(audit|slither|foundry|mythril|echidna|vulnerability|reentrancy)\b/.test(lower)) {
    return {
      kind: "audit",
      confidence: 0.74,
      action: "Security audit request",
      assets,
      protocols,
      addresses,
    };
  }

  return {
    kind: "general",
    confidence: 0.5,
    action: "General MantleGuard question",
    assets,
    protocols,
    addresses,
  };
}
