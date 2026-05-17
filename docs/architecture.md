# PalletMan Architecture

PalletMan is a single Next.js application that connects directly to the Portaldot network via WebSocket RPC.

## Structure

```
frontend/
├── app/
│   ├── page.tsx          # Landing page
│   └── app/page.tsx      # Studio — the main tool
├── components/
│   ├── studio/           # Core tool UI
│   │   ├── pallet-sidebar.tsx    # Lists all pallets + extrinsics/storage
│   │   ├── extrinsic-panel.tsx   # Form builder for any extrinsic
│   │   ├── storage-panel.tsx     # Storage query interface
│   │   ├── result-panel.tsx      # Transaction result + history
│   │   └── wallet-button.tsx     # Polkadot.js wallet connection
│   └── ...               # Landing page sections
├── hooks/
│   ├── use-polkadot-api.ts   # WS connection, metadata parsing, block subscription
│   ├── use-wallet.ts          # Polkadot.js extension integration
│   └── use-extrinsic.ts       # Fee estimation + tx signing + broadcasting
├── lib/
│   ├── polkadot.ts        # ApiPromise singleton
│   └── type-mapper.ts     # Substrate type → HTML input field mapping
└── constants/
    └── network.ts         # RPC endpoint, POT decimals
```

## How it works

1. On load, `use-polkadot-api` opens a WebSocket to `wss://rpc.portaldot.io` via `@polkadot/api`
2. It fetches runtime metadata and parses every pallet, extrinsic, and storage item
3. `type-mapper` converts Substrate types (e.g. `AccountId32`, `u128`, `Bytes`) into appropriate form fields
4. The user selects a pallet and extrinsic — `extrinsic-panel` renders the auto-generated form
5. `use-extrinsic` calls `paymentInfo()` for fee estimation and `signAndSend()` via the Polkadot.js extension
6. POT is used as gas — no other token, no bridging
7. Storage queries use `api.query[pallet][item]()` and decode the result via `@polkadot/types`

## Key design decisions

- **No backend** — everything runs client-side. The only network call is the WebSocket to the Portaldot RPC.
- **Metadata-driven** — the UI is fully generated from the chain's own runtime metadata. No hardcoded pallet lists.
- **POT native** — all fee estimation and submission uses Portaldot's native token as gas.
