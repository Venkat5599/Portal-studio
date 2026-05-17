# PalletMan

**Postman for Portaldot.** Explore every pallet, build any extrinsic, query live storage, and submit signed transactions using POT as gas — all from your browser. No code required.

Submitted to the **Portaldot Mini Hackathon Online Season 1 (2026)** — Builder Tools track.

---

## What it does

Portaldot developers today have to read docs, write scripts, and dig through runtime metadata just to test a single extrinsic call. PalletMan removes all of that friction.

Open the app, connect your Polkadot.js wallet, and you get:

- **Pallet Explorer** — auto-fetches all pallets and extrinsics directly from the live Portaldot node metadata
- **Extrinsic Builder** — auto-generates the correct input form for every parameter with the right types
- **Fee Estimator** — estimates the POT fee before you sign anything
- **Sign & Submit** — signs and broadcasts the transaction via your connected wallet; POT is used as gas
- **Storage Queries** — query any storage item from any pallet and see the decoded live value
- **Transaction History** — tracks every submission with block hash, events, and final status

---

## Demo

> Live: [palletman.xyz](https://palletman.xyz)

**Full flow:**
1. Open the studio
2. Connect your Polkadot.js wallet extension
3. Pick a pallet from the sidebar (e.g. `Balances`)
4. Select an extrinsic (e.g. `transfer`)
5. Fill in the auto-generated form
6. Hit **Estimate fee** → **Sign & Submit**
7. Watch the transaction finalize on Portaldot in real time

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Chain | `@polkadot/api` |
| Wallet | `@polkadot/extension-dapp` |
| Network | Portaldot (`wss://rpc.portaldot.io`) |
| Gas | POT (Portaldot native token) |

---

## Run locally

```bash
git clone https://github.com/Venkat5599/Portal-studio.git
cd Portal-studio/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You need the **Polkadot.js browser extension** installed to connect a wallet and submit transactions.

---

## Project structure

```
portaldot/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   └── app/page.tsx       # Studio (main tool)
│   ├── components/
│   │   ├── studio/            # Core tool components
│   │   │   ├── pallet-sidebar.tsx
│   │   │   ├── extrinsic-panel.tsx
│   │   │   ├── storage-panel.tsx
│   │   │   ├── result-panel.tsx
│   │   │   └── wallet-button.tsx
│   │   └── ...                # Landing page sections
│   ├── hooks/
│   │   ├── use-polkadot-api.ts  # Chain connection + metadata parsing
│   │   ├── use-wallet.ts        # Polkadot.js extension integration
│   │   └── use-extrinsic.ts     # Fee estimation + tx submission
│   ├── lib/
│   │   ├── polkadot.ts          # API singleton
│   │   └── type-mapper.ts       # Runtime type → form field mapping
│   └── constants/
│       └── network.ts           # RPC endpoint, POT decimals
└── docs/
    └── architecture.md
```

---

## How POT is used as gas

Every extrinsic submitted through PalletMan goes through the live Portaldot node. The fee is paid in POT automatically — the tool calls `paymentInfo()` to estimate the fee before you sign, and `signAndSend()` via your wallet extension to broadcast it. No wrapped tokens, no bridging.

---

## AI disclosure

This project was built with AI assistance (Claude). The architecture, business logic, and Portaldot-specific integration were designed by the developer. AI was used to accelerate boilerplate and UI implementation.

---

## License

MIT
