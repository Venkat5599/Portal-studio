"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiPromise } from "@polkadot/api";

export type SavedCall = {
  name: string;
  pallet: string;
  extrinsic: string;
  paramsJson: string;
  savedAt: number;
};

type RegistryStatus = "disconnected" | "connecting" | "ready" | "error";

export function useRegistry(api: ApiPromise | null) {
  const [contractAddress, setContractAddressState] = useState<string>("");
  const [status, setStatus] = useState<RegistryStatus>("disconnected");
  const [savedCalls, setSavedCalls] = useState<SavedCall[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("palletman_registry_address");
    if (stored) setContractAddressState(stored);
  }, []);

  const connect = useCallback(
    async (address: string) => {
      if (!api || !address.trim()) return;
      setStatus("connecting");
      setError(null);
      try {
        const { ContractPromise } = await import("@polkadot/api-contract");
        const { REGISTRY_ABI } = await import("@/lib/registry-abi");
        const contract = new ContractPromise(api, REGISTRY_ABI, address.trim());
        // Verify the contract exists by calling total_saves (read-only, no signer needed)
        await contract.query.totalSaves("", { gasLimit: -1 });
        localStorage.setItem("palletman_registry_address", address.trim());
        setContractAddressState(address.trim());
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect to contract");
        setStatus("error");
      }
    },
    [api]
  );

  const disconnect = useCallback(() => {
    localStorage.removeItem("palletman_registry_address");
    setContractAddressState("");
    setSavedCalls([]);
    setStatus("disconnected");
    setError(null);
  }, []);

  const fetchCalls = useCallback(
    async (accountAddress: string) => {
      if (!api || !contractAddress || status !== "ready") return;
      try {
        const { ContractPromise } = await import("@polkadot/api-contract");
        const { REGISTRY_ABI } = await import("@/lib/registry-abi");
        const contract = new ContractPromise(api, REGISTRY_ABI, contractAddress);
        const { output } = await contract.query.getCalls("", { gasLimit: -1 }, accountAddress);
        if (output?.isOk) {
          const raw = output.asOk.toJSON() as Array<{
            name: string;
            pallet: string;
            extrinsic: string;
            paramsJson: string;
            savedAt: number;
          }>;
          setSavedCalls(
            raw.map((c) => ({
              name: c.name,
              pallet: c.pallet,
              extrinsic: c.extrinsic,
              paramsJson: c.paramsJson,
              savedAt: c.savedAt,
            }))
          );
        }
      } catch {
        // silently fail — calls list just won't update
      }
    },
    [api, contractAddress, status]
  );

  const saveCall = useCallback(
    async (
      name: string,
      pallet: string,
      extrinsic: string,
      paramsJson: string,
      senderAddress: string
    ): Promise<boolean> => {
      if (!api || !contractAddress || status !== "ready") return false;
      try {
        const { ContractPromise } = await import("@polkadot/api-contract");
        const { REGISTRY_ABI } = await import("@/lib/registry-abi");
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        const contract = new ContractPromise(api, REGISTRY_ABI, contractAddress);
        const injector = await web3FromAddress(senderAddress);

        const { gasRequired } = await contract.query.saveCall(
          senderAddress,
          { gasLimit: -1 },
          name,
          pallet,
          extrinsic,
          paramsJson
        );

        await new Promise<void>((resolve, reject) => {
          void contract.tx
            .saveCall({ gasLimit: gasRequired }, name, pallet, extrinsic, paramsJson)
            .signAndSend(senderAddress, { signer: injector.signer }, ({ status: txStatus }) => {
              if (txStatus.isFinalized) resolve();
            })
            .catch(reject);
        });

        await fetchCalls(senderAddress);
        return true;
      } catch {
        return false;
      }
    },
    [api, contractAddress, fetchCalls, status]
  );

  const deleteCall = useCallback(
    async (index: number, senderAddress: string): Promise<boolean> => {
      if (!api || !contractAddress || status !== "ready") return false;
      try {
        const { ContractPromise } = await import("@polkadot/api-contract");
        const { REGISTRY_ABI } = await import("@/lib/registry-abi");
        const { web3FromAddress } = await import("@polkadot/extension-dapp");
        const contract = new ContractPromise(api, REGISTRY_ABI, contractAddress);
        const injector = await web3FromAddress(senderAddress);

        const { gasRequired } = await contract.query.deleteCall(
          senderAddress,
          { gasLimit: -1 },
          index
        );

        await new Promise<void>((resolve, reject) => {
          void contract.tx
            .deleteCall({ gasLimit: gasRequired }, index)
            .signAndSend(senderAddress, { signer: injector.signer }, ({ status: txStatus }) => {
              if (txStatus.isFinalized) resolve();
            })
            .catch(reject);
        });

        await fetchCalls(senderAddress);
        return true;
      } catch {
        return false;
      }
    },
    [api, contractAddress, fetchCalls, status]
  );

  return {
    contractAddress,
    status,
    error,
    savedCalls,
    connect,
    disconnect,
    fetchCalls,
    saveCall,
    deleteCall,
  };
}
