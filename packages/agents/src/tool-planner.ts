import type { AgentQuery, ToolRequest } from "./types";

export function planSecurityTools(query: AgentQuery): ToolRequest[] {
  const message = query.message.toLowerCase();
  const wantsContractAnalysis =
    message.includes("contract") ||
    message.includes("solidity") ||
    message.includes("audit") ||
    message.includes("vulnerability");
  const wantsExploitSimulation =
    message.includes("exploit") ||
    message.includes("simulate") ||
    message.includes("transaction") ||
    message.includes("fork") ||
    message.includes("swap") ||
    message.includes("trade") ||
    message.includes("approval") ||
    message.includes("approve");
  const wantsInvariantTesting =
    message.includes("invariant") ||
    message.includes("property") ||
    message.includes("fuzz") ||
    message.includes("echidna");

  const plan: ToolRequest[] = [];

  if (wantsContractAnalysis) {
    plan.push(
      {
        name: "slither",
        reason: "Static analysis for Solidity vulnerabilities and code smells.",
        inputKind: "solidity-source",
        required: true,
      },
      {
        name: "mythril",
        reason: "Symbolic execution for deeper vulnerability discovery.",
        inputKind: "solidity-source",
        required: false,
      },
      {
        name: "foundry",
        reason: "Compile and run tests/gas reports before patch recommendations.",
        inputKind: "repository",
        required: true,
      }
    );
  }

  if (wantsInvariantTesting) {
    plan.push({
      name: "echidna",
      reason: "Property-based fuzzing for invariants and state-machine risk.",
      inputKind: "repository",
      required: false,
    });
  }

  if (wantsExploitSimulation) {
    plan.push({
      name: "tenderly",
      reason: "Fork simulation and trace analysis before agentic execution.",
      inputKind: "transaction",
      required: true,
    });
  }

  return plan;
}
