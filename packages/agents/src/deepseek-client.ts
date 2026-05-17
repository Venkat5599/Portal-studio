import type { ModelClient, ModelRequest, ModelResult } from "./types";

type ProviderResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export type DeepSeekClientConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  fetcher?: typeof fetch;
};

export class DeepSeekModelClient implements ModelClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetcher: typeof fetch;

  constructor(config: DeepSeekClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl =
      config.baseUrl ?? "https://openrouter.ai/api/v1/chat/completions";
    this.model = config.model ?? "deepseek/deepseek-v4-flash";
    this.fetcher = config.fetcher ?? fetch;
  }

  async complete(request: ModelRequest): Promise<ModelResult> {
    const response = await this.fetcher(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Venkat5599/Mantle-firewall",
        "X-Title": "MantleGuard AI Firewall",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
        response_format: { type: "text" },
      }),
    });

    const data = (await response.json()) as ProviderResponse;

    if (!response.ok) {
      throw new Error(
        data.error?.message ?? `DeepSeek provider returned HTTP ${response.status}.`
      );
    }

    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error("DeepSeek provider returned no agent answer.");
    }

    return {
      answer,
      model: this.model,
    };
  }
}
