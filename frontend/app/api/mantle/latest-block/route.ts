import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RpcResponse<T> = {
  result?: T;
  error?: {
    message?: string;
  };
};

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const endpoint =
    process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as RpcResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `RPC ${method} failed.`);
  }

  if (data.result === undefined) {
    throw new Error(`RPC ${method} returned no result.`);
  }

  return data.result;
}

export async function GET(): Promise<Response> {
  try {
    const latestBlockHex = await rpc<string>("eth_blockNumber");
    const block = await rpc<{
      number: string;
      hash: string;
      timestamp: string;
      transactions: string[];
      miner?: string;
      gasUsed: string;
      gasLimit: string;
    }>("eth_getBlockByNumber", [latestBlockHex, false]);

    return NextResponse.json({
      chainId: Number(
        process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID ?? process.env.MANTLE_CHAIN_ID ?? "5003"
      ),
      number: Number.parseInt(block.number, 16),
      hash: block.hash,
      timestamp: Number.parseInt(block.timestamp, 16),
      transactionCount: block.transactions.length,
      gasUsed: Number.parseInt(block.gasUsed, 16),
      gasLimit: Number.parseInt(block.gasLimit, 16),
      rpcUrl: process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to read Mantle RPC data.",
      },
      { status: 502 }
    );
  }
}
