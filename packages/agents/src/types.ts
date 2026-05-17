export type AgentQuery = {
  message: string;
  wallet?: string | undefined;
  chainId?: number | undefined;
  liveMantleBlock?: string | undefined;
};

export type IntentKind =
  | "trade"
  | "approval"
  | "deployment"
  | "admin-action"
  | "monitoring"
  | "audit"
  | "general";

export type ParsedIntent = {
  kind: IntentKind;
  confidence: number;
  action: string;
  assets: string[];
  protocols: string[];
  addresses: string[];
};

export type RagSource = {
  id: string;
  title: string;
  content: string;
  sourceType: "audit-dataset" | "docs" | "past-exploit" | "protocol-context";
};

export type RagHit = RagSource & {
  score: number;
};

export type SecurityToolName =
  | "slither"
  | "foundry"
  | "mythril"
  | "echidna"
  | "tenderly";

export type ToolRequest = {
  name: SecurityToolName;
  reason: string;
  inputKind: "solidity-source" | "repository" | "transaction" | "address";
  required: boolean;
};

export type ToolExecution = ToolRequest & {
  status: "not_configured" | "skipped" | "completed" | "failed";
  output?: string;
  error?: string;
};

export type ProtectionSignal = {
  id: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  category:
    | "trading-risk"
    | "approval-risk"
    | "contract-risk"
    | "gas-optimization"
    | "transparency"
    | "tooling";
  title: string;
  detail: string;
};

export type GasSuggestion = {
  id: string;
  impact: "low" | "medium" | "high";
  title: string;
  detail: string;
};

export type PolicyVerdict = {
  verdict: "Allow" | "Warn" | "Block";
  riskScore: number;
  reasons: string[];
  requiredActions: string[];
};

export type ModelRequest = {
  system: string;
  user: string;
};

export type ModelResult = {
  answer: string;
  model: string;
};

export type AgentResult = {
  answer: string;
  model: string;
  intent: ParsedIntent;
  protectionSignals: ProtectionSignal[];
  gasSuggestions: GasSuggestion[];
  policyVerdict: PolicyVerdict;
  ragHits: RagHit[];
  toolPlan: ToolRequest[];
  toolExecutions: ToolExecution[];
};

export type ModelClient = {
  complete: (request: ModelRequest) => Promise<ModelResult>;
};

export type ToolRunner = {
  run: (request: ToolRequest, query: AgentQuery) => Promise<ToolExecution>;
};
