"use client";

import { Send, Info, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { ApiPromise } from "@polkadot/api";
import type { ExtrinsicMeta, TxStatus } from "@/types/polkadot";
import type { WalletAccount } from "@/types/polkadot";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

type FieldProps = {
  param: ExtrinsicMeta["params"][0];
  value: string;
  onChange: (v: string) => void;
};

function Field({ param, value, onChange }: FieldProps): ReactNode {
  const base =
    "w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition font-mono";

  if (param.fieldType === "bool") {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded"
        />
        <span className="text-sm text-muted-foreground">{value === "true" ? "true" : "false"}</span>
      </label>
    );
  }

  if (param.fieldType === "json") {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`[]`}
        className={`${base} resize-none`}
      />
    );
  }

  return (
    <input
      type={param.fieldType === "number" || param.fieldType === "balance" ? "text" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={
        param.fieldType === "address"
          ? "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
          : param.fieldType === "balance"
          ? "1.5 (in POT)"
          : param.fieldType === "hex"
          ? "0x…"
          : param.typeName
      }
      className={base}
    />
  );
}

export function ExtrinsicPanel({
  extrinsic,
  api,
  wallet,
  txStatus,
  estimatedFee,
  onEstimateFee,
  onSubmit,
}: {
  extrinsic: ExtrinsicMeta;
  api: ApiPromise | null;
  wallet: WalletAccount | null;
  txStatus: TxStatus;
  estimatedFee: string;
  onEstimateFee: (params: Record<string, string>) => void;
  onSubmit: (params: Record<string, string>) => void;
}): ReactNode {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaults: Record<string, string> = {};
    for (const p of extrinsic.params) {
      defaults[p.name] = p.fieldType === "bool" ? "false" : "";
    }
    setValues(defaults);
  }, [extrinsic]);

  const isBusy = ["building", "signing", "ready", "inblock"].includes(txStatus);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-semibold text-foreground">
            {extrinsic.palletName}
            <span className="text-muted-foreground font-normal">.</span>
            {extrinsic.name}
          </h2>
          <Badge variant="muted">{extrinsic.params.length} params</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {extrinsic.docs || `Submit a ${extrinsic.name} extrinsic from the ${extrinsic.palletName} pallet.`}
        </p>
      </div>

      {extrinsic.params.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          This extrinsic takes no parameters.
        </div>
      ) : (
        <div className="space-y-5">
          {extrinsic.params.map((param) => (
            <div key={param.name}>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-foreground">{param.name}</label>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                  {param.typeName}
                </span>
                {param.isOptional && (
                  <span className="text-xs text-muted-foreground">optional</span>
                )}
              </div>
              <Field
                param={param}
                value={values[param.name] ?? ""}
                onChange={(v) => handleChange(param.name, v)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-border">
        {estimatedFee && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated fee</span>
            <span className="font-mono text-foreground">{estimatedFee}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onEstimateFee(values)}
            disabled={!api || !wallet}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            Estimate fee
          </button>

          <button
            onClick={() => onSubmit(values)}
            disabled={!api || !wallet || isBusy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/85 transition disabled:opacity-40"
          >
            {isBusy ? (
              <>
                <Spinner size={14} />
                {txStatus === "signing" ? "Signing…" : txStatus === "building" ? "Building…" : "Broadcasting…"}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {wallet ? "Sign & Submit" : "Connect wallet to submit"}
              </>
            )}
          </button>
        </div>

        {!wallet && (
          <p className="text-xs text-center text-muted-foreground">
            Connect your Polkadot.js wallet extension to submit extrinsics
          </p>
        )}
      </div>
    </div>
  );
}
