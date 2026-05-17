export type RagDocument = {
  id: string;
  title: string;
  content: string;
  sourceType: "audit-dataset" | "docs" | "past-exploit" | "protocol-context";
};

export const ragCorpus: RagDocument[] = [
  {
    id: "prd-loop",
    title: "MantleGuard autonomous loop",
    sourceType: "docs",
    content:
      "MantleGuard AI follows an autonomous smart contract intelligence workflow: Observe, Analyze, Generate Fix, Validate, Monitor, Alert. The product must reason about Solidity, produce explainable security output, generate remediation plans, validate changes, and monitor deployed Mantle contracts.",
  },
  {
    id: "forta-style-monitoring",
    title: "Forta-style monitoring requirements",
    sourceType: "docs",
    content:
      "Monitoring agents analyze transaction patterns, detect exploit signatures, identify suspicious behavior, track abnormal liquidity movements, watch privileged actions, and generate explainable alerts. Alerts must not be fabricated; they must be grounded in live chain or submitted contract evidence.",
  },
  {
    id: "attestation-contract",
    title: "On-chain attestation contract",
    sourceType: "protocol-context",
    content:
      "MantleGuardAttestor stores AI security analysis attestations. Each attestation includes reporter, subjectHash, sourceHash, reportHash, riskScore, verdict, model, reportURI, blockNumber, and timestamp. Duplicate report hashes are rejected.",
  },
  {
    id: "sdk-policy",
    title: "Developer SDK policy",
    sourceType: "docs",
    content:
      "The SDK should let developers call MantleGuard before sensitive actions, retrieve an AI verdict, enforce Safe/Warn/Block policies, and optionally record the result on-chain. It must expose deterministic hashes and calldata for attestAnalysis rather than hiding on-chain mechanics.",
  },
  {
    id: "no-mocks",
    title: "No simulation rule",
    sourceType: "docs",
    content:
      "The product must not use mocked security findings, fake alerts, fake scores, fake transaction hashes, or simulated chain state. Missing provider keys, RPC failures, and undeployed contracts should be surfaced as setup errors.",
  },
  {
    id: "mantle-context",
    title: "Mantle ecosystem context",
    sourceType: "protocol-context",
    content:
      "MantleGuard is designed for Mantle smart contracts, agentic wallets, DeFi protocols, RWA applications, AI DevTools, and on-chain infrastructure. It should emphasize Mantle-native security, verification, and live monitoring.",
  },
  {
    id: "pipeline-security-tools",
    title: "MantleGuard security tool pipeline",
    sourceType: "audit-dataset",
    content:
      "User queries flow through an agent orchestrator, RAG retrieval over audit datasets, docs, and past exploits, DeepSeek V4 Flash, and configured tool calls for Slither, Foundry, Mythril, Echidna, and Tenderly before producing risk analysis and patch suggestions.",
  },
  {
    id: "past-exploit-patterns",
    title: "Past exploit patterns for RAG",
    sourceType: "past-exploit",
    content:
      "Relevant exploit patterns include reentrancy around external calls, unchecked privileged function access, oracle manipulation, unsafe approvals, missing slippage checks, weak invariant coverage, and upgrade authorization mistakes.",
  },
  {
    id: "agentic-protection",
    title: "Agentic protection policy",
    sourceType: "docs",
    content:
      "MantleGuard acts as a pre-execution firewall for autonomous agents. Before trades, approvals, deployments, or admin actions, it classifies intent, retrieves security context, checks policy, plans tool execution, and returns Allow, Warn, or Block with auditable reasons.",
  },
  {
    id: "trading-risk-controls",
    title: "Trading risk controls",
    sourceType: "audit-dataset",
    content:
      "Agentic trading protection should check high slippage, leverage and liquidation exposure, unverified routers, unsafe approvals, missing stop conditions, oracle manipulation risk, and whether the strategy reduces opacity for retail users.",
  },
  {
    id: "smart-gas-optimization",
    title: "Smart gas optimization guidance",
    sourceType: "docs",
    content:
      "Smart gas optimization focuses on exact approvals, batching dependent actions, reducing redundant state writes, compact calldata, storage packing, immutable configuration, and recording hashes on-chain while keeping full reports off-chain.",
  },
];

export function retrieveRagContext(query: string, limit = 4): RagDocument[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  return ragCorpus
    .map((doc) => {
      const haystack = `${doc.title} ${doc.content}`.toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0
      );
      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.doc);
}
