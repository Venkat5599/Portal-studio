<p align="center">
  <img src="./banner.png" alt="PalletMan Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🟣-PalletMan-7C3AED?style=for-the-badge&labelColor=0a0f12" alt="PalletMan" />
</p>

<h1 align="center">PalletMan</h1>

<p align="center">
  <strong>Postman for Portaldot — Browser-Based Pallet Explorer & Transaction Builder</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🟢_LIVE-Portaldot_Testnet-00FF88?style=for-the-badge" alt="Live on Portaldot" />
  <img src="https://img.shields.io/badge/Track-Builder_Tools-7C3AED?style=for-the-badge" alt="Builder Tools" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

---

## 📋 Project Overview

**PalletMan** is the first browser-based developer tool for the Portaldot blockchain. It auto-discovers every pallet from a live node, generates transaction forms automatically, and lets developers submit signed transactions — all without writing a single line of code.

> The only existing way to interact with Portaldot today is the official Python SDK. PalletMan is the GUI alternative.

### What It Does

- **Auto-discovers pallets** — connects to any Portaldot node via WebSocket and reads live metadata
- **Generates extrinsic forms** — pick a pallet, pick a call, fill the form — no ABI files needed
- **Queries live storage** — read chain state in one click, no RPC calls to write
- **Estimates fees** — shows exact POT cost before signing
- **Submits signed transactions** — integrates with Portaldot wallet extension
- **Saves calls** — bookmark common extrinsics like a Postman collection

### Key Innovation

```
Before PalletMan:   Developer → Write Python SDK code → Submit → Debug
With PalletMan:     Developer → Open browser → Click → Done
```

---

## 🌐 Why This Matters for Portaldot

| Problem | PalletMan Solution |
|---|---|
| Interacting with pallets requires writing Python SDK code | Browser GUI — no code needed |
| No visual way to explore what pallets/extrinsics exist | Auto-discovers and lists everything from live node |
| Testing transactions requires a full dev environment | Works in any browser with a wallet extension |
| No way to share common calls across a team | Saved Calls panel — reuse and share extrinsics |
| Fee estimation requires manual calculation | Built-in fee estimator before every submit |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- Portaldot wallet extension installed in your browser
- A running Portaldot node (local or remote)

### Run a Local Portaldot Node (WSL2 / Linux)

```bash
# Download the node binary
cd ~
wget https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod +x portaldot_dev

# Terminal 1 — Start Alice node
./portaldot_dev --dev --alice --name MyNode --base-path /tmp/alice

# Terminal 2 — Start Bob node (paste Alice's Peer ID from Terminal 1 logs)
./portaldot_dev --dev --bob --name MyNode_Bob \
  --base-path /tmp/bob \
  --port 30334 \
  --rpc-port 9945 \
  --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<ALICE_PEER_ID>
```

Success: both terminals show `💤 Idle (1 peers)`

### Run the Frontend

```bash
# 1. Clone the repository
git clone https://github.com/Venkat5599/Portal-studio.git
cd Portal-studio/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000/app
```

---

## 🖥️ Demo Flow

**1. Connect** — wallet auto-detected, pallets load from live chain

**2. Browse pallets** — sidebar lists all pallets with extrinsic and storage counts

**3. Build a transaction**
   - Click `Balances` → `transfer`
   - Fill `dest` (recipient address) and `value` (amount in planck)
   - Click **Estimate Fee** — see exact POT cost before signing

**4. Submit** — wallet signs, transaction finalizes on chain, result appears in Results panel with block hash and events

**5. Query storage** — switch to Storage tab → `Balances` → `Account` → paste an address → see live balance

**6. Save calls** — click Saved Calls tab, save the transfer, reload it anytime — like a Postman collection

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (PalletMan)                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Pallet       │  │  Extrinsic   │  │  Results  │  │
│  │ Sidebar      │  │  Form Panel  │  │  + Saved  │  │
│  │              │  │              │  │  Calls    │  │
│  │ api.tx/query │  │ Auto-built   │  │  Panel    │  │
│  │ parsed live  │  │ from params  │  │           │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┘  │
│         │                 │                          │
│         └────────┬────────┘                          │
│                  ▼                                   │
│         ┌─────────────────┐                          │
│         │  @polkadot/api  │                          │
│         │  WebSocket RPC  │                          │
│         └────────┬────────┘                          │
└──────────────────┼──────────────────────────────────┘
                   │ ws://
                   ▼
┌─────────────────────────────────────────────────────┐
│              Portaldot Node                          │
│         (local WSL2 or remote VM)                   │
│                                                      │
│   Alice (port 9944)  ←→  Bob (port 9945)            │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Portal-studio/
└── frontend/
    ├── app/
    │   ├── page.tsx              # Landing page
    │   └── app/page.tsx          # Main Studio page
    ├── components/
    │   └── studio/
    │       ├── pallet-sidebar.tsx    # Pallet browser
    │       ├── extrinsic-panel.tsx   # Transaction form builder
    │       ├── storage-panel.tsx     # Storage query panel
    │       ├── result-panel.tsx      # Tx results + history
    │       ├── registry-panel.tsx    # Saved calls
    │       └── wallet-button.tsx     # Wallet connect
    ├── hooks/
    │   ├── use-polkadot-api.ts   # Node connection + metadata parsing
    │   ├── use-wallet.ts         # Wallet extension integration
    │   ├── use-extrinsic.ts      # Tx submission + fee estimation
    │   └── use-registry.ts       # Saved calls storage
    ├── constants/
    │   └── network.ts            # RPC endpoints + chain config
    └── lib/
        └── type-mapper.ts        # Substrate type → form field mapping
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Blockchain** | @polkadot/api, @polkadot/extension-dapp |
| **Node** | Portaldot testnet (Substrate-based) |
| **Wallet** | Portaldot browser extension |

---

## 🧪 Test Accounts (Dev Mode)

When running a local `--dev` node, these accounts are pre-funded:

| Account | Address | Balance |
|---|---|---|
| **Alice** | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` | 1B POT |
| **Bob** | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty` | 1B POT |

Import Alice into your wallet:
```
Mnemonic: bottom drive obey lake curtain smoke basket hold race lonely fit walk
Derivation path: //Alice
```

---

## 📈 Roadmap

- [x] Live pallet browser — auto-discovers from node
- [x] Extrinsic form builder — zero config
- [x] Storage query panel
- [x] Fee estimation
- [x] Transaction submission + result display
- [x] Saved Calls panel
- [x] Portaldot wallet integration
- [ ] Share saved calls via URL
- [ ] Multi-node support (switch RPC from UI)
- [ ] ink! contract interaction panel
- [ ] Export calls as Python SDK snippets

---

## 🤖 AI Disclosure

Built with AI assistance (Claude). Architecture, business logic, and Portaldot-specific integration were designed by the developer. AI was used to accelerate implementation.

---

## 📄 License

MIT

---

<div align="center">

## Built for Portaldot Mini Hackathon — Builder Tools Track 🏆

*The first browser-based developer tool for Portaldot*

**No code. No setup. Just click and build.**

</div>
