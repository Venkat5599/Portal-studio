"use client";

import { CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { TxResult, TxStatus } from "@/types/polkadot";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PORTALDOT_EXPLORER } from "@/constants/network";

const STATUS_LABELS: Record<TxStatus, string> = {
  idle: "Idle",
  building: "Building",
  signing: "Awaiting signature",
  ready: "In mempool",
  inblock: "In block",
  finalized: "Finalized",
  error: "Failed",
};

function StatusIcon({ status }: { status: TxStatus }): ReactNode {
  if (status === "finalized") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  if (status === "error") return <XCircle className="h-5 w-5 text-red-500" />;
  if (["building", "signing", "ready", "inblock"].includes(status)) return <Spinner size={18} />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
}

function TxCard({ tx, expanded, onToggle }: { tx: TxResult; expanded: boolean; onToggle: () => void }): ReactNode {
  return (
    <div className="rounded-2xl border border-border bg-frame overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted transition text-left"
      >
        <StatusIcon status={tx.status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {tx.pallet}.{tx.extrinsic}
          </p>
          <p className="text-xs text-muted-foreground">
            {STATUS_LABELS[tx.status]} · {new Date(tx.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Badge
          variant={
            tx.status === "finalized" ? "success" :
            tx.status === "error" ? "error" :
            tx.status === "inblock" ? "warning" : "muted"
          }
        >
          {STATUS_LABELS[tx.status]}
        </Badge>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {tx.blockHash && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Block hash</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground truncate">{tx.blockHash}</p>
                <a
                  href={`${PORTALDOT_EXPLORER}/block/${tx.blockHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {tx.error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {tx.error}
            </div>
          )}

          {tx.events.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Events ({tx.events.length})</p>
              <div className="space-y-1.5">
                {tx.events.map((ev, i) => (
                  <div key={i} className="rounded-xl bg-muted px-3 py-2">
                    <p className="text-xs font-medium text-foreground">
                      {ev.section}.{ev.method}
                    </p>
                    {ev.data.length > 0 && (
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all">
                        {ev.data.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(tx.params).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Params</p>
              <pre className="rounded-xl bg-muted px-3 py-2 text-xs font-mono text-foreground overflow-x-auto">
                {JSON.stringify(tx.params, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResultPanel({
  current,
  history,
  embedded = false,
}: {
  current: TxResult | null;
  history: TxResult[];
  embedded?: boolean;
}): ReactNode {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const allTx = current
    ? [current, ...history.filter((h) => h.id !== current.id)]
    : history;

  const inner = (
    <>
      {!embedded && (
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Result & History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last {allTx.length} transactions</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {allTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Clock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Select an extrinsic and submit it.</p>
          </div>
        ) : (
          allTx.map((tx) => (
            <TxCard
              key={tx.id}
              tx={tx}
              expanded={expandedId === tx.id}
              onToggle={() => toggleExpand(tx.id)}
            />
          ))
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col h-full overflow-hidden">{inner}</div>;
  }

  return (
    <aside className="w-80 shrink-0 flex flex-col border-l border-border bg-background h-full overflow-hidden">
      {inner}
    </aside>
  );
}
