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

      const [chain, meta] = await Promise.all([
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
    const meta = api.runtimeMetadata.asLatest;

    for (const pallet of meta.pallets) {
      const palletName = pallet.name.toString();
      const extrinsics: ExtrinsicMeta[] = [];
      const storage: StorageItemMeta[] = [];
      const events: string[] = [];

      if (pallet.calls.isSome) {
        const callsType = pallet.calls.unwrap();
        const callsDef = meta.lookup.getTypeDef(callsType.type);

        if (callsDef.sub && Array.isArray(callsDef.sub)) {
          for (const call of callsDef.sub) {
            const callName = call.name?.toString() ?? "";
            const params = Array.isArray(call.sub)
              ? call.sub.map((p) => ({
                  name: p.name?.toString() ?? "",
                  typeName: p.type?.toString() ?? "unknown",
                  fieldType: mapTypeToField(p.type?.toString() ?? ""),
                  isOptional: p.type?.toString().startsWith("Option<") ?? false,
                }))
              : [];

            extrinsics.push({
              name: callName,
              palletName,
              params,
              docs: "",
            });
          }
        }
      }

      if (pallet.storage.isSome) {
        const storageItems = pallet.storage.unwrap().items;
        for (const item of storageItems) {
          storage.push({
            name: item.name.toString(),
            palletName,
            keyType: item.type.isMap ? item.type.asMap.key.toString() : null,
            valueType: item.type.isMap
              ? item.type.asMap.value.toString()
              : item.type.isNMap
              ? item.type.asNMap.value.toString()
              : item.type.asPlain.toString(),
            docs: item.docs.join(" "),
          });
        }
      }

      result.push({ name: palletName, extrinsics, storage, events });
    }
  } catch (err) {
    console.error("Metadata parse error:", err);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
