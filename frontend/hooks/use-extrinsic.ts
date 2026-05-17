"use client";

import { useCallback, useState } from "react";
import type { ApiPromise } from "@polkadot/api";
import type { DecodedEvent, TxResult, TxStatus } from "@/types/polkadot";
import { parseBalanceInput, formatBalance } from "@/lib/type-mapper";
import { POT_DECIMALS, POT_SYMBOL } from "@/constants/network";

export function useExtrinsic() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [result, setResult] = useState<TxResult | null>(null);
  const [history, setHistory] = useState<TxResult[]>([]);

  const estimateFee = useCallback(
    async (
      api: ApiPromise,
      palletName: string,
      extrinsicName: string,
      params: Record<string, string>,
      senderAddress: string
    ): Promise<string> => {
      try {
        const palletKey = palletName.charAt(0).toLowerCase() + palletName.slice(1);
        const extrinsicKey = extrinsicName
          .split("_")
          .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
          .join("");

        const txModule = (api.tx as Record<string, Record<string, (...args: unknown[]) => unknown>>)[palletKey];
        if (!txModule) return "unknown";
        const txFn = txModule[extrinsicKey];
        if (!txFn) return "unknown";

        const args = buildArgs(params);
        const tx = txFn(...args) as { paymentInfo: (addr: string) => Promise<{ partialFee: { toString: () => string } }> };
        const info = await tx.paymentInfo(senderAddress);
        const fee = formatBalance(info.partialFee.toString(), POT_DECIMALS);
        return `${fee} ${POT_SYMBOL}`;
      } catch {
        return "~0.001 POT";
      }
    },
    []
  );

  const submit = useCallback(
    async (
      api: ApiPromise,
      palletName: string,
      extrinsicName: string,
      params: Record<string, string>,
      senderAddress: string
    ) => {
      const id = `${Date.now()}`;
      const txResult: TxResult = {
        id,
        pallet: palletName,
        extrinsic: extrinsicName,
        params,
        status: "building",
        events: [],
        timestamp: Date.now(),
      };

      setStatus("building");
      setResult({ ...txResult });

      try {
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        const injector = await web3FromAddress(senderAddress);

        const palletKey = palletName.charAt(0).toLowerCase() + palletName.slice(1);
        const extrinsicKey = extrinsicName
          .split("_")
          .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
          .join("");

        const txModule = (api.tx as Record<string, Record<string, (...args: unknown[]) => unknown>>)[palletKey];
        const txFn = txModule?.[extrinsicKey];
        if (!txFn) throw new Error(`Extrinsic ${palletName}.${extrinsicName} not found`);

        const args = buildArgs(params);
        const tx = txFn(...args) as {
          signAndSend: (
            addr: string,
            opts: { signer: unknown },
            cb: (result: { status: { isReady: boolean; isInBlock: boolean; isFinalized: boolean; asInBlock: { toString: () => string }; asFinalized: { toString: () => string } }; dispatchError?: { isModule: boolean; asModule: unknown }; events: Array<{ event: { section: { toString: () => string }; method: { toString: () => string }; data: { toHuman: () => unknown } } }> }) => void
          ) => Promise<() => void>;
        };

        setStatus("signing");
        setResult((prev) => prev ? { ...prev, status: "signing" } : prev);

        await tx.signAndSend(senderAddress, { signer: injector.signer }, ({ status: txStatus, dispatchError, events: txEvents }) => {
          if (txStatus.isReady) {
            setStatus("ready");
            setResult((prev) => prev ? { ...prev, status: "ready" } : prev);
          }

          if (txStatus.isInBlock) {
            const blockHash = txStatus.asInBlock.toString();
            const decoded: DecodedEvent[] = txEvents.map(({ event }) => ({
              section: event.section.toString(),
              method: event.method.toString(),
              data: Object.values(event.data.toHuman() as Record<string, string>).map(String),
            }));

            setStatus("inblock");
            setResult((prev) =>
              prev ? { ...prev, status: "inblock", blockHash, events: decoded } : prev
            );
          }

          if (txStatus.isFinalized) {
            const blockHash = txStatus.asFinalized.toString();
            const decoded: DecodedEvent[] = txEvents.map(({ event }) => ({
              section: event.section.toString(),
              method: event.method.toString(),
              data: Object.values(event.data.toHuman() as Record<string, string>).map(String),
            }));

            const hasError = dispatchError?.isModule;
            const finalStatus: TxStatus = hasError ? "error" : "finalized";
            const finalResult: TxResult = {
              ...txResult,
              status: finalStatus,
              blockHash,
              events: decoded,
              error: hasError ? "Dispatch error occurred" : undefined,
              timestamp: Date.now(),
            };

            setStatus(finalStatus);
            setResult(finalResult);
            setHistory((prev) => [finalResult, ...prev].slice(0, 20));
          }
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Transaction failed";
        const failResult: TxResult = { ...txResult, status: "error", error: errorMsg };
        setStatus("error");
        setResult(failResult);
        setHistory((prev) => [failResult, ...prev].slice(0, 20));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { status, result, history, submit, estimateFee, reset };
}

function buildArgs(params: Record<string, string>): unknown[] {
  return Object.values(params).map((v) => {
    try {
      const parsed = JSON.parse(v);
      return parsed;
    } catch {
      return v;
    }
  });
}
