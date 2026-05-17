"use client";

import { Search, Database } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ApiPromise } from "@polkadot/api";
import type { StorageItemMeta, StorageResult } from "@/types/polkadot";
import { Spinner } from "@/components/ui/spinner";

export function StoragePanel({
  item,
  api,
  onResult,
}: {
  item: StorageItemMeta;
  api: ApiPromise | null;
  onResult: (result: StorageResult) => void;
}): ReactNode {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const palletKey = item.palletName.charAt(0).toLowerCase() + item.palletName.slice(1);
      const storageModule = (api.query as Record<string, Record<string, unknown>>)[palletKey];

      if (!storageModule) throw new Error(`Pallet ${item.palletName} not found in api.query`);

      const queryFn = storageModule[item.name] as ((...args: unknown[]) => Promise<{ toHuman: () => unknown }>) | undefined;
      if (!queryFn) throw new Error(`Storage item ${item.name} not found`);

      const raw = item.keyType && key.trim()
        ? await queryFn(key.trim())
        : await (queryFn as () => Promise<{ toHuman: () => unknown }>)();

      const value = JSON.stringify(raw.toHuman(), null, 2);
      setResult(value);

      const storageResult: StorageResult = {
        pallet: item.palletName,
        item: item.name,
        key: key.trim() || undefined,
        value,
        timestamp: Date.now(),
      };
      onResult(storageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          {item.palletName}
          <span className="text-muted-foreground font-normal">.</span>
          {item.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {item.docs || `Query the ${item.name} storage item from the ${item.palletName} pallet.`}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Value type:</span>
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{item.valueType}</span>
        </div>
      </div>

      {item.keyType && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Key{" "}
            <span className="text-xs text-muted-foreground font-mono font-normal ml-1">{item.keyType}</span>
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={item.keyType.includes("AccountId") ? "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" : "Enter key…"}
            className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition"
          />
        </div>
      )}

      <button
        onClick={query}
        disabled={!api || loading || (!!item.keyType && !key.trim())}
        className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/85 transition disabled:opacity-40"
      >
        {loading ? <Spinner size={14} /> : <Search className="h-4 w-4" />}
        {loading ? "Querying…" : "Query storage"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {result !== null && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Result</span>
            <span className="ml-auto text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
          </div>
          <pre className="rounded-xl border border-border bg-muted px-4 py-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
