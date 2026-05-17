"use client";

import { Search, ChevronRight, Database, Layers } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { PalletMeta } from "@/types/polkadot";

type ActiveItem = { pallet: string; type: "extrinsic"; name: string } | { pallet: string; type: "storage"; name: string } | null;

export function PalletSidebar({
  pallets,
  active,
  onSelect,
}: {
  pallets: PalletMeta[];
  active: ActiveItem;
  onSelect: (item: ActiveItem) => void;
}): ReactNode {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<"extrinsics" | "storage">("extrinsics");

  const filtered = pallets.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleExpand = (name: string) =>
    setExpanded((prev) => (prev === name ? null : name));

  return (
    <aside className="flex h-full flex-col border-r border-border bg-frame w-64 shrink-0">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search pallets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("extrinsics")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition ${tab === "extrinsics" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Layers className="h-3.5 w-3.5" />
          Extrinsics
        </button>
        <button
          onClick={() => setTab("storage")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition ${tab === "storage" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Database className="h-3.5 w-3.5" />
          Storage
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {pallets.length === 0 ? "Connecting to Portaldot…" : "No pallets match"}
          </p>
        )}
        {filtered.map((pallet) => {
          const items = tab === "extrinsics" ? pallet.extrinsics : pallet.storage;
          const isExpanded = expanded === pallet.name;

          return (
            <div key={pallet.name}>
              <button
                onClick={() => toggleExpand(pallet.name)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium text-foreground transition group"
              >
                <span className="truncate">{pallet.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-3">
                  {items.map((item) => {
                    const isActive =
                      active?.pallet === pallet.name &&
                      active?.type === tab.slice(0, -1) &&
                      active?.name === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() =>
                          onSelect({
                            pallet: pallet.name,
                            type: tab === "extrinsics" ? "extrinsic" : "storage",
                            name: item.name,
                          })
                        }
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition truncate ${
                          isActive
                            ? "bg-accent text-black font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="px-2 py-1 text-xs text-muted-foreground italic">None</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
