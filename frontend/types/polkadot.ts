export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type PalletMeta = {
  name: string;
  extrinsics: ExtrinsicMeta[];
  storage: StorageItemMeta[];
  events: string[];
};

export type ExtrinsicMeta = {
  name: string;
  palletName: string;
  params: ParamMeta[];
  docs: string;
};

export type ParamMeta = {
  name: string;
  typeName: string;
  fieldType: FieldType;
  isOptional: boolean;
};

export type FieldType =
  | "text"
  | "address"
  | "number"
  | "balance"
  | "bool"
  | "hex"
  | "enum"
  | "json";

export type StorageItemMeta = {
  name: string;
  palletName: string;
  keyType: string | null;
  valueType: string;
  docs: string;
};

export type TxStatus =
  | "idle"
  | "building"
  | "signing"
  | "ready"
  | "inblock"
  | "finalized"
  | "error";

export type TxResult = {
  id: string;
  pallet: string;
  extrinsic: string;
  params: Record<string, string>;
  status: TxStatus;
  blockHash?: string;
  blockNumber?: number;
  events: DecodedEvent[];
  error?: string;
  timestamp: number;
  fee?: string;
};

export type DecodedEvent = {
  section: string;
  method: string;
  data: string[];
};

export type WalletAccount = {
  address: string;
  name: string;
  source: string;
};

export type StorageResult = {
  pallet: string;
  item: string;
  key?: string;
  value: string;
  timestamp: number;
};
