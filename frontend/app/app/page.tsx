"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, Radio, Wifi, WifiOff, ArrowLeft, LayoutGrid, BookMarked, Clock } from "lucide-react";
import type { PalletMeta, ExtrinsicMeta, StorageItemMeta } from "@/types/polkadot";
import { usePolkadotApi } from "@/hooks/use-polkadot-api";
import { useWallet } from "@/hooks/use-wallet";
import { useExtrinsic } from "@/hooks/use-extrinsic";
import type { SavedCall } from "@/hooks/use-registry";
import { PalletSidebar } from "@/components/studio/pallet-sidebar";
import { ExtrinsicPanel } from "@/components/studio/extrinsic-panel";
import { StoragePanel } from "@/components/studio/storage-panel";
import { ResultPanel } from "@/components/studio/result-panel";
import { RegistryPanel } from "@/components/studio/registry-panel";
import { WalletButton } from "@/components/studio/wallet-button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { NETWORK_NAME, PORTALDOT_LOCAL_RPC, REGISTRY_CONTRACT_ADDRESS } from "@/constants/network";

type ActiveSelection =
  | { pallet: string; type: "extrinsic"; name: string }
  | { pallet: string; type: "storage"; name: string }
  | null;

function ConnectionBar({
  status,
  chainName,
  blockNumber,
  onConnect,
}: {
  status: string;
  chainName: string;
  blockNumber: number;
  onConnect: () => void;
}): ReactNode {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isError = status === "error";

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-frame text-sm">
      <div className="flex items-center gap-2">
        {isConnecting ? (
          <Spinner size={14} />
        ) : isConnected ? (
          <Wifi className="h-4 w-4 text-emerald-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-muted-foreground">
          {isConnecting
            ? "Connecting to Portaldot…"
            : isConnected
            ? chainName || NETWORK_NAME
            : isError
            ? "Connection failed"
            : "Disconnected"}
        </span>
      </div>

      {isConnected && blockNumber > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Radio className="h-3 w-3 text-accent" />
          <span className="text-xs font-mono">#{blockNumber.toLocaleString()}</span>
        </div>
      )}

      {isConnected && (
        <Badge variant="success">Live</Badge>
      )}

      {(status === "disconnected" || isError) && (
        <button
          onClick={onConnect}
          suppressHydrationWarning
          className="ml-auto text-xs font-medium text-foreground hover:text-foreground/70 underline underline-offset-2 transition"
        >
          Connect
        </button>
      )}

      {isError && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs ml-2">
          <AlertCircle className="h-3.5 w-3.5" />
          Check RPC endpoint
        </div>
      )}
    </div>
  );
}

function EmptyState(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Select a pallet</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Choose a pallet from the sidebar, then pick an extrinsic to build and submit, or a storage item to query live.
      </p>
    </div>
  );
}

type RightTab = "results" | "registry";

export default function StudioPage(): ReactNode {
  const { api, status, pallets, chainName, blockNumber, connect } = usePolkadotApi();
  const wallet = useWallet();
  const { status: txStatus, result, history, submit, estimateFee, reset } = useExtrinsic();

  const [active, setActive] = useState<ActiveSelection>(null);
  const [estimatedFee, setEstimatedFee] = useState("");
  const [rightTab, setRightTab] = useState<RightTab>("results");
  const [lastParams, setLastParams] = useState<Record<string, string>>({});

  useEffect(() => {
    void connect(PORTALDOT_LOCAL_RPC);
  }, [connect]);

  useEffect(() => {
    setEstimatedFee("");
    reset();
  }, [active, reset]);

  const getActivePallet = (): PalletMeta | undefined =>
    pallets.find((p) => p.name === active?.pallet);

  const getActiveExtrinsic = (): ExtrinsicMeta | undefined => {
    if (active?.type !== "extrinsic") return undefined;
    return getActivePallet()?.extrinsics.find((e) => e.name === active.name);
  };

  const getActiveStorage = (): StorageItemMeta | undefined => {
    if (active?.type !== "storage") return undefined;
    return getActivePallet()?.storage.find((s) => s.name === active.name);
  };

  const handleEstimateFee = async (params: Record<string, string>) => {
    if (!api || !wallet.selected || !active || active.type !== "extrinsic") return;
    setLastParams(params);
    const fee = await estimateFee(api, active.pallet, active.name, params, wallet.selected.address);
    setEstimatedFee(fee);
  };

  const handleSubmit = (params: Record<string, string>) => {
    if (!api || !wallet.selected || !active || active.type !== "extrinsic") return;
    setLastParams(params);
    void submit(api, active.pallet, active.name, params, wallet.selected.address);
  };

  const handleStorageResult = () => {};

  const handleLoadSavedCall = (call: SavedCall) => {
    setActive({ pallet: call.pallet, type: "extrinsic", name: call.extrinsic });
    setRightTab("results");
  };

  const activeExtrinsic = getActiveExtrinsic();
  const activeStorage = getActiveStorage();

  const pendingCall =
    active?.type === "extrinsic"
      ? { pallet: active.pallet, extrinsic: active.name, paramsJson: JSON.stringify(lastParams) }
      : undefined;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-border bg-frame shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
              PM
            </div>
            <span className="text-base font-semibold text-foreground">PalletMan</span>
          </Link>
          <Badge variant="accent">Studio</Badge>
        </div>

        <WalletButton
          accounts={wallet.accounts}
          selected={wallet.selected}
          connecting={wallet.connecting}
          error={wallet.error}
          onConnect={wallet.connect}
          onDisconnect={wallet.disconnect}
          onSelect={wallet.setSelected}
        />
      </nav>

      {/* Connection bar */}
      <ConnectionBar
        status={status}
        chainName={chainName}
        blockNumber={blockNumber}
        onConnect={() => void connect(PORTALDOT_LOCAL_RPC)}
      />

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <PalletSidebar
          pallets={pallets}
          active={active}
          onSelect={setActive}
        />

        {/* Center panel */}
        <main className="flex-1 overflow-hidden">
          {activeExtrinsic ? (
            <ExtrinsicPanel
              extrinsic={activeExtrinsic}
              api={api}
              wallet={wallet.selected}
              txStatus={txStatus}
              estimatedFee={estimatedFee}
              onEstimateFee={(p) => void handleEstimateFee(p)}
              onSubmit={handleSubmit}
            />
          ) : activeStorage ? (
            <StoragePanel
              item={activeStorage}
              api={api}
              onResult={handleStorageResult}
            />
          ) : (
            <EmptyState />
          )}
        </main>

        {/* Right panel — Results or Saved Calls */}
        <div className="w-80 shrink-0 flex flex-col border-l border-border bg-background h-full overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setRightTab("results")}
              suppressHydrationWarning
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                rightTab === "results"
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Results
            </button>
            <button
              onClick={() => setRightTab("registry")}
              suppressHydrationWarning
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                rightTab === "registry"
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookMarked className="h-3.5 w-3.5" />
              Saved Calls
            </button>
          </div>

          {/* Tab content — full height, overflow managed inside each panel */}
          <div className="flex-1 overflow-hidden">
            {rightTab === "results" ? (
              <ResultPanel current={result} history={history} embedded />
            ) : (
              <RegistryPanel
                api={api}
                walletAddress={wallet.selected?.address}
                onLoad={handleLoadSavedCall}
                {...(pendingCall ? { pendingCall } : {})}
                {...(REGISTRY_CONTRACT_ADDRESS ? { defaultContractAddress: REGISTRY_CONTRACT_ADDRESS } : {})}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
