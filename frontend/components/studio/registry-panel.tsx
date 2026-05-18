"use client";

import {
  BookMarked,
  Plug,
  PlugZap,
  Trash2,
  Play,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import type { ApiPromise } from "@polkadot/api";
import type { SavedCall } from "@/hooks/use-registry";
import { useRegistry } from "@/hooks/use-registry";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type RegistryPanelProps = {
  api: ApiPromise | null;
  walletAddress: string | undefined;
  /** Called when the user clicks "Load" on a saved call */
  onLoad: (call: SavedCall) => void;
  /** The extrinsic currently displayed in the center panel — offered for saving */
  pendingCall?: {
    pallet: string;
    extrinsic: string;
    paramsJson: string;
  };
  /** Pre-deployed contract address — auto-connects on mount if provided */
  defaultContractAddress?: string;
};

function ConnectForm({
  onConnect,
  connecting,
  error,
  defaultAddress,
}: {
  onConnect: (addr: string) => void;
  connecting: boolean;
  error: string | null;
  defaultAddress: string | undefined;
}): ReactNode {
  const [addr, setAddr] = useState(defaultAddress ?? "");

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Enter the address of a deployed{" "}
        <span className="font-mono text-foreground">PalletManRegistry</span> contract to save and
        sync your calls on-chain.
      </p>
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        placeholder="5G…contract address"
        className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition"
      />
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={() => onConnect(addr)}
        disabled={!addr.trim() || connecting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {connecting ? <Spinner size={14} /> : <PlugZap className="h-4 w-4" />}
        {connecting ? "Connecting…" : "Connect Registry"}
      </button>
    </div>
  );
}

function SaveCallRow({
  call,
  index,
  onLoad,
  onDelete,
  deleting,
}: {
  call: SavedCall;
  index: number;
  onLoad: (call: SavedCall) => void;
  onDelete: (index: number) => void;
  deleting: boolean;
}): ReactNode {
  const [expanded, setExpanded] = useState(false);
  const savedDate = new Date(call.savedAt * 1000).toLocaleDateString();

  return (
    <div className="rounded-2xl border border-border bg-frame overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition text-left"
      >
        <Database className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{call.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {call.pallet}.{call.extrinsic}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-2">
          <p className="text-xs text-muted-foreground">Saved {savedDate}</p>
          {call.paramsJson && call.paramsJson !== "{}" && (
            <pre className="rounded-xl bg-muted px-3 py-2 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
              {call.paramsJson}
            </pre>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onLoad(call)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition"
            >
              <Play className="h-3.5 w-3.5" />
              Load
            </button>
            <button
              onClick={() => onDelete(index)}
              disabled={deleting}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveCurrentCall({
  pendingCall,
  walletAddress,
  onSave,
}: {
  pendingCall: RegistryPanelProps["pendingCall"];
  walletAddress: string | undefined;
  onSave: (name: string) => Promise<boolean>;
}): ReactNode {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!pendingCall || !walletAddress) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const ok = await onSave(name.trim());
    setSaving(false);
    if (ok) {
      setSaved(true);
      setName("");
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="border-t border-border p-3 space-y-2">
      <p className="text-xs font-medium text-foreground">Save current call</p>
      <p className="text-xs text-muted-foreground font-mono">
        {pendingCall.pallet}.{pendingCall.extrinsic}
      </p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Label…"
          className="flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition"
        />
        <button
          onClick={() => void handleSave()}
          disabled={!name.trim() || saving}
          className="flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}

export function RegistryPanel({
  api,
  walletAddress,
  onLoad,
  pendingCall,
  defaultContractAddress,
}: RegistryPanelProps): ReactNode {
  const registry = useRegistry(api);
  const { connect: registryConnect, fetchCalls, status: registryStatus } = registry;
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Auto-connect if a pre-deployed address is provided and api is ready
  useEffect(() => {
    if (defaultContractAddress && api && registryStatus === "disconnected") {
      void registryConnect(defaultContractAddress).then(() => {
        if (walletAddress) void fetchCalls(walletAddress);
      });
    }
  }, [defaultContractAddress, api, registryStatus, registryConnect, fetchCalls, walletAddress]);

  const handleConnect = async (addr: string) => {
    await registryConnect(addr);
    if (walletAddress) await fetchCalls(walletAddress);
  };

  const handleDelete = async (index: number) => {
    if (!walletAddress) return;
    setDeletingIndex(index);
    await registry.deleteCall(index, walletAddress);
    setDeletingIndex(null);
  };

  const handleSave = async (name: string): Promise<boolean> => {
    if (!pendingCall || !walletAddress) return false;
    return registry.saveCall(name, pendingCall.pallet, pendingCall.extrinsic, pendingCall.paramsJson, walletAddress);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Saved Calls</h3>
          </div>
          <div className="flex items-center gap-2">
            {registry.status === "ready" && (
              <Badge variant="success">On-chain</Badge>
            )}
            {registry.status === "connecting" && (
              <Badge variant="muted">Connecting</Badge>
            )}
            {registry.status === "error" && (
              <Badge variant="error">Error</Badge>
            )}
            {registry.status === "ready" && (
              <button
                onClick={registry.disconnect}
                title="Disconnect registry"
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Plug className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {registry.status === "ready" && (
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
            {registry.contractAddress.slice(0, 16)}…
          </p>
        )}
      </div>

      {/* Body */}
      {registry.status !== "ready" ? (
        <ConnectForm
          onConnect={(addr) => void handleConnect(addr)}
          connecting={registryStatus === "connecting"}
          error={registry.error}
          defaultAddress={defaultContractAddress}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {registry.savedCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <BookMarked className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No saved calls yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Load an extrinsic, fill in params, then save it here.
              </p>
            </div>
          ) : (
            registry.savedCalls.map((call, i) => (
              <SaveCallRow
                key={i}
                call={call}
                index={i}
                onLoad={onLoad}
                onDelete={(idx) => void handleDelete(idx)}
                deleting={deletingIndex === i}
              />
            ))
          )}
        </div>
      )}

      {/* Save current call footer */}
      {registry.status === "ready" && (
        <SaveCurrentCall
          pendingCall={pendingCall}
          walletAddress={walletAddress}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
