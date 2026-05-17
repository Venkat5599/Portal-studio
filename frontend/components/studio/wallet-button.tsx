"use client";

import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { WalletAccount } from "@/types/polkadot";
import { Spinner } from "@/components/ui/spinner";

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletButton({
  accounts,
  selected,
  connecting,
  error,
  onConnect,
  onDisconnect,
  onSelect,
}: {
  accounts: WalletAccount[];
  selected: WalletAccount | null;
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelect: (acc: WalletAccount) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);

  if (!selected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={onConnect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/85 disabled:opacity-50"
        >
          {connecting ? <Spinner size={14} /> : <Wallet className="h-4 w-4" />}
          {connecting ? "Connecting…" : "Connect wallet"}
        </button>
        {error && <p className="text-xs text-red-500 max-w-48 text-right">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-frame px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        {selected.name || short(selected.address)}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-frame shadow-lg z-50 overflow-hidden">
          <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
            {accounts.map((acc) => (
              <button
                key={acc.address}
                onClick={() => { onSelect(acc); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition hover:bg-muted ${selected.address === acc.address ? "bg-muted" : ""}`}
              >
                <p className="font-medium text-foreground">{acc.name || "Account"}</p>
                <p className="text-xs text-muted-foreground font-mono">{short(acc.address)}</p>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2">
            <button
              onClick={() => { onDisconnect(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
