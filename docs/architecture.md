# MantleGuard Architecture

MantleGuard is organized as a monorepo so product areas can grow independently.

```text
apps/frontend            Next.js app, landing page, RAG agent UI, API routes
packages/contracts       Solidity contracts for on-chain attestations
packages/sdk             Developer SDK for integrating the AI firewall
packages/agents          RAG orchestrator, model clients, security tool planning
docs                     Product, architecture, deployment, and demo notes
```

The current vertical slice is intentionally real-data-first:

- AI responses require a configured provider key.
- Mantle status comes from a real RPC endpoint.
- On-chain attestations require a deployed contract address.
- The app does not fabricate findings, alerts, scores, or transaction hashes.

## Agent Pipeline

```text
User Query
  -> Agent Orchestrator
  -> Intent Classifier (trade, approval, deployment, admin, audit)
  -> RAG Retrieval (audit dataset + docs + past exploits)
  -> Deterministic Protection Agents (trading risk, approval risk, gas)
  -> DeepSeek V4 Flash through OpenRouter
  -> Tool Calls (Slither, Foundry, Mythril, Echidna, Tenderly)
  -> Allow / Warn / Block + Risk Analysis + Patch Suggestions
```

Security tools are planned by the orchestrator today, but execution stays in
`not_configured` status until real local or hosted runners are attached. This is
intentional: MantleGuard should report missing tool infrastructure instead of
inventing scanner output.

## Agentic Protection

MantleGuard is a pre-execution firewall for AI agents, trading bots, wallets,
and dApps. Developers call SDK hooks such as `beforeTrade`,
`beforeApproval`, `beforeTransaction`, and `beforeDeploy` before execution. The
agent returns a deterministic policy verdict, gas suggestions, RAG citations,
tool status, and an LLM explanation grounded in the retrieved context.

The verdict can be attested on Mantle with `attestFirewallVerdict`, storing only
hashes and metadata on-chain while preserving a verifiable audit trail.
