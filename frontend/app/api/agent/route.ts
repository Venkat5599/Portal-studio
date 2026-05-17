import { ragCorpus } from "@/lib/rag-corpus";
import {
  DeepSeekModelClient,
  runMantleGuardOrchestrator,
} from "@mantleguard/agents";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AgentRequest = {
  message?: string;
  wallet?: string;
  chainId?: number;
};

async function readMantleBlock(): Promise<string> {
  const endpoint =
    process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "eth_blockNumber",
      params: [],
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || data.error || !data.result) {
    throw new Error(data.error?.message ?? "Mantle RPC block read failed.");
  }

  return String(Number.parseInt(data.result, 16));
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as AgentRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Ask MantleGuard a real security or integration question." },
      { status: 400 }
    );
  }

  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_API_BASE_URL ??
    "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env.AI_MODEL ?? "deepseek/deepseek-v4-flash";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI_API_KEY is not configured. MantleGuard will not generate simulated agent responses.",
        setup: "Copy .env.example to .env.local and set AI_API_KEY.",
      },
      { status: 503 }
    );
  }

  let latestBlock = "unavailable";
  try {
    latestBlock = await readMantleBlock();
  } catch (error) {
    latestBlock =
      error instanceof Error ? `RPC error: ${error.message}` : "RPC error";
  }

  try {
    const result = await runMantleGuardOrchestrator(
      {
        message,
        wallet: body.wallet,
        chainId: body.chainId,
        liveMantleBlock: latestBlock,
      },
      {
        sources: ragCorpus,
        modelClient: new DeepSeekModelClient({
          apiKey,
          baseUrl,
          model,
        }),
      }
    );

    return NextResponse.json(
      {
        model: result.model,
        answer: result.answer,
        intent: result.intent,
        policyVerdict: result.policyVerdict,
        protectionSignals: result.protectionSignals,
        gasSuggestions: result.gasSuggestions,
        citations: result.ragHits.map((doc) => ({
          id: doc.id,
          title: doc.title,
          sourceType: doc.sourceType,
        })),
        liveMantleBlock: latestBlock,
        toolPlan: result.toolPlan,
        toolExecutions: result.toolExecutions,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "MantleGuard agent orchestration failed.",
      },
      { status: 502 }
    );
  }
}
