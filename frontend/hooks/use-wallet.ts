"use client";

import { useCallback, useState } from "react";
import type { WalletAccount } from "@/types/polkadot";

export function useWallet() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selected, setSelected] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("PalletMan");

      if (extensions.length === 0) {
        setError("No Polkadot wallet extension found. Install Polkadot.js extension.");
        return;
      }

      const allAccounts = await web3Accounts();
      const mapped: WalletAccount[] = allAccounts.map((acc) => ({
        address: acc.address,
        name: acc.meta.name ?? acc.address.slice(0, 8),
        source: acc.meta.source,
      }));

      setAccounts(mapped);
      if (mapped.length > 0) setSelected(mapped[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccounts([]);
    setSelected(null);
  }, []);

  return { accounts, selected, setSelected, connecting, error, connect, disconnect };
}
