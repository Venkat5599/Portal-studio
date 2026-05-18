"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiPromise } from "@polkadot/api";
import type { ConnectionStatus, PalletMeta, ExtrinsicMeta, StorageItemMeta } from "@/types/polkadot";
import { mapTypeToField } from "@/lib/type-mapper";
import { PORTALDOT_RPC } from "@/constants/network";

export function usePolkadotApi() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [pallets, setPallets] = useState<PalletMeta[]>([]);
  const [chainName, setChainName] = useState<string>("");
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const unsubRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async (rpcUrl = PORTALDOT_RPC) => {
    setStatus("connecting");
    try {
      const { getApi } = await import("@/lib/polkadot");
      const instance = await getApi(rpcUrl);

      const [chain] = await Promise.all([
        instance.rpc.system.chain(),
        instance.rpc.state.getMetadata(),
      ]);

      setChainName(chain.toString());
      setApi(instance);
      setStatus("connected");

      const parsed = parseMetadata(instance);
      setPallets(parsed);

      const unsub = await instance.rpc.chain.subscribeNewHeads((header) => {
        setBlockNumber(header.number.toNumber());
      });
      unsubRef.current = unsub as unknown as () => void;
    } catch (err) {
      console.error("Connection failed:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  return { api, status, pallets, chainName, blockNumber, connect };
}

function parseMetadata(api: ApiPromise): PalletMeta[] {
  const result: PalletMeta[] = [];

  try {
    // Use api.tx / api.query — already decoded and version-normalised by @polkadot/api
    for (const [camelPallet, txMethods] of Object.entries(api.tx)) {
      const palletName = camelPallet.charAt(0).toUpperCase() + camelPallet.slice(1);
      const extrinsics: ExtrinsicMeta[] = [];
      const storage: StorageItemMeta[] = [];

      for (const [txName, txFn] of Object.entries(txMethods as Record<string, { meta: { args: { name: { toString(): string }; type: { toString(): string } }[]; docs: { toString(): string }[] } }>)) {
        try {
          const params = txFn.meta.args.map((arg) => ({
            name: arg.name.toString(),
            typeName: arg.type.toString(),
            fieldType: mapTypeToField(arg.type.toString()),
            isOptional: arg.type.toString().startsWith("Option<"),
          }));
          extrinsics.push({ name: txName, palletName, params, docs: txFn.meta.docs.map((d) => d.toString()).join(" ") });
        } catch { /* skip individual bad extrinsic */ }
      }

      const queryPallet = (api.query as Record<string, Record<string, { meta: { type: { isMap: boolean; asMap: { key: { toString(): string }; value: { toString(): string } }; asPlain: { toString(): string } }; docs: { toString(): string }[] } }>>)[camelPallet];
      if (queryPallet) {
        for (const [queryName, queryFn] of Object.entries(queryPallet)) {
          try {
            const t = queryFn.meta.type;
            storage.push({
              name: queryName,
              palletName,
              keyType: t.isMap ? t.asMap.key.toString() : null,
              valueType: t.isMap ? t.asMap.value.toString() : t.asPlain.toString(),
              docs: queryFn.meta.docs.map((d) => d.toString()).join(" "),
            });
          } catch { /* skip individual bad storage item */ }
        }
      }

      result.push({ name: palletName, extrinsics, storage, events: [] });
    }
  } catch (err) {
    console.error("Metadata parse error:", err);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
