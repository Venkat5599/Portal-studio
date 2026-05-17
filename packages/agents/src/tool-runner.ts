import type { AgentQuery, ToolExecution, ToolRequest, ToolRunner } from "./types";

export class ConfigurationOnlyToolRunner implements ToolRunner {
  async run(request: ToolRequest, _query: AgentQuery): Promise<ToolExecution> {
    return {
      ...request,
      status: "not_configured",
      error:
        "Tool execution is not configured in this environment. MantleGuard will not fabricate tool output.",
    };
  }
}
