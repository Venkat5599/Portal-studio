import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  source?: string;
  filename?: string;
  subject?: string;
};

type ProviderMessage = {
  content?: string;
};

type ProviderChoice = {
  message?: ProviderMessage;
};

type ProviderResponse = {
  choices?: ProviderChoice[];
  error?: {
    message?: string;
  };
};

const SYSTEM_PROMPT = `You are MantleGuard AI, an autonomous smart contract security and optimization engine for Mantle.
Analyze the submitted Solidity source as a real security review artifact.
Return strict JSON only with this shape:
{
  "riskScore": number from 0 to 100,
  "verdict": "Safe" | "Warn" | "Block",
  "summary": string,
  "findings": [{"severity":"Critical"|"High"|"Medium"|"Low"|"Info","title":string,"evidence":string,"recommendation":string}],
  "gasOptimizations": [{"title":string,"impact":string,"recommendation":string}],
  "patch": {"available": boolean, "description": string, "diff": string},
  "validationPlan": string[],
  "monitoringHeuristics": string[],
  "reasoningTimeline": string[]
}
Do not fabricate tool output, test results, gas numbers, deployments, transaction hashes, or explorer links.`;

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as AnalyzeRequest;
  const source = body.source?.trim();

  if (!source) {
    return NextResponse.json(
      { error: "Upload or paste Solidity source before analysis." },
      { status: 400 }
    );
  }

  if (!source.includes("contract ") && !source.includes("library ")) {
    return NextResponse.json(
      { error: "The submitted file does not look like Solidity source." },
      { status: 400 }
    );
  }

  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_API_BASE_URL ?? "https://api.deepseek.com/chat/completions";
  const model = process.env.AI_MODEL ?? "deepseek-chat";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI_API_KEY is not configured. MantleGuard will not generate fake AI results.",
        setup: "Copy .env.example to .env.local and set AI_API_KEY.",
      },
      { status: 503 }
    );
  }

  const providerResponse = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            filename: body.filename ?? "Submitted.sol",
            subject: body.subject ?? "",
            source,
          }),
        },
      ],
    }),
  });

  const providerJson = (await providerResponse.json()) as ProviderResponse;

  if (!providerResponse.ok) {
    return NextResponse.json(
      {
        error:
          providerJson.error?.message ??
          `AI provider returned HTTP ${providerResponse.status}.`,
      },
      { status: 502 }
    );
  }

  const content = providerJson.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "AI provider returned no analysis content." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({
      model,
      analysis: extractJson(content),
    });
  } catch {
    return NextResponse.json(
      {
        error: "AI provider returned non-JSON content.",
        raw: content,
      },
      { status: 502 }
    );
  }
}
