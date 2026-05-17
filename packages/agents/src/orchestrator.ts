import { suggestGasOptimizations } from "./gas-optimizer";
import { classifyIntent } from "./intent-classifier";
import { evaluatePolicy } from "./policy-engine";
import { retrieveContext } from "./retrieval";
import { planSecurityTools } from "./tool-planner";
import { ConfigurationOnlyToolRunner } from "./tool-runner";
import { analyzeTradingRisk } from "./trading-risk";
import type {
  AgentQuery,
  AgentResult,
  ModelClient,
  RagSource,
  ToolRunner,
} from "./types";

export type OrchestratorConfig = {
  sources: RagSource[];
  modelClient: ModelClient;
  toolRunner?: ToolRunner;
};

const systemPrompt = [
  "You are MantleGuard AI, a RAG-based on-chain AI firewall for Mantle.",
  "Pipeline: User Query -> Agent Orchestrator -> RAG Retrieval -> DeepSeek V4 Flash -> Security Tool Calls -> Risk Analysis + Patch Suggestions.",
  "Never fabricate Slither, Foundry, Mythril, Echidna, Tenderly, deployment, score, exploit, or transaction output.",
  "If tools are not configured or were not run, explicitly say that tool execution is pending.",
  "Give practical risk analysis and patch suggestions grounded in retrieved context and available live chain data.",
].join("\n");

export async function runMantleGuardOrchestrator(
  query: AgentQuery,
  config: OrchestratorConfig
): Promise<AgentResult> {
  const ragHits = retrieveContext(query, config.sources);
  const intent = classifyIntent(query);
  const toolPlan = planSecurityTools(query);
  const toolRunner = config.toolRunner ?? new ConfigurationOnlyToolRunner();
  const toolExecutions = await Promise.all(
    toolPlan.map((tool) => toolRunner.run(tool, query))
  );
  const protectionSignals = analyzeTradingRisk(query, intent);
  const gasSuggestions = suggestGasOptimizations(query, intent);
  const policyVerdict = evaluatePolicy(
    protectionSignals,
    gasSuggestions,
    toolExecutions
  );

  const modelResult = await config.modelClient.complete({
    system: systemPrompt,
    user: JSON.stringify({
      userQuery: query.message,
      wallet: query.wallet ?? "not connected",
      chainId: query.chainId ?? null,
      liveMantleBlock: query.liveMantleBlock ?? "unavailable",
      parsedIntent: intent,
      ragRetrieval: ragHits,
      deterministicProtectionSignals: protectionSignals,
      deterministicGasSuggestions: gasSuggestions,
      deterministicPolicyVerdict: policyVerdict,
      toolPlan,
      toolExecutions,
      requiredOutput: {
        verdict: policyVerdict.verdict,
        riskScore: policyVerdict.riskScore,
        sections: [
          "firewall verdict",
          "risk analysis",
          "agentic protection rationale",
          "smart gas optimization",
          "patch suggestions",
          "tool status",
          "next actions",
        ],
      },
    }),
  });

  return {
    answer: modelResult.answer,
    model: modelResult.model,
    intent,
    protectionSignals,
    gasSuggestions,
    policyVerdict,
    ragHits,
    toolPlan,
    toolExecutions,
  };
}
