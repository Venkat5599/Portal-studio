import type { FieldType } from "@/types/polkadot";

const ADDRESS_TYPES = new Set([
  "AccountId",
  "AccountId32",
  "Address",
  "MultiAddress",
  "LookupSource",
]);

const BALANCE_TYPES = new Set([
  "Balance",
  "BalanceOf",
  "Compact<Balance>",
  "Compact<BalanceOf>",
  "u128",
  "Compact<u128>",
]);

const NUMBER_TYPES = new Set([
  "u8","u16","u32","u64",
  "i8","i16","i32","i64",
  "Compact<u32>","Compact<u64>","BlockNumber",
  "Weight","Perbill","Permill",
]);

const BOOL_TYPES = new Set(["bool", "Bool"]);

const HEX_TYPES = new Set([
  "Bytes","Vec<u8>","H256","H160","Hash",
  "CallHash","OpaqueCall",
]);

export function mapTypeToField(typeName: string): FieldType {
  const clean = typeName.replace(/\s/g, "");

  if (ADDRESS_TYPES.has(clean)) return "address";
  if (BALANCE_TYPES.has(clean)) return "balance";
  if (BOOL_TYPES.has(clean)) return "bool";
  if (NUMBER_TYPES.has(clean)) return "number";
  if (HEX_TYPES.has(clean)) return "hex";
  if (clean.startsWith("Vec<") || clean.startsWith("Option<")) return "json";

  return "text";
}

export function formatBalance(raw: string, decimals: number): string {
  try {
    const n = BigInt(raw);
    const divisor = BigInt(10 ** decimals);
    const whole = n / divisor;
    const frac = n % divisor;
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    return fracStr ? `${whole}.${fracStr}` : whole.toString();
  } catch {
    return raw;
  }
}

export function parseBalanceInput(input: string, decimals: number): string {
  try {
    const [whole = "0", frac = ""] = input.split(".");
    const fracPadded = frac.padEnd(decimals, "0").slice(0, decimals);
    return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(fracPadded || "0")).toString();
  } catch {
    return input;
  }
}
