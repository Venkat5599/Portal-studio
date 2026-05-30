# PalletMan

## Project Overview

**Problem Statement:** Portaldot developers have no browser-based tool to explore the chain, test extrinsics, or submit transactions without writing code. Interacting with any pallet requires the Python SDK, a local dev environment, and knowledge of SCALE encoding — a steep barrier for new builders and a slow feedback loop for experienced ones.

**Solution:** PalletMan is a visual extrinsic studio for Portaldot — Postman, but for on-chain pallets. Connect your wallet, auto-discover every pallet from live runtime metadata, fill typed parameter forms, estimate POT fees, sign and submit transactions directly from the browser. A Saved Calls panel (backed by a deployed ink! v5 smart contract) lets developers save named call configurations on-chain and reload them any time from any device.

**Blockchain Relevance:** Smart contracts (ink! v5), real-time Portaldot node interaction via WebSocket, POT micro-payments for on-chain call storage, runtime metadata introspection, Polkadot.js wallet extension signing.

---

## Technical Architecture

```
[Browser — Next.js]
     │  Polkadot.js extension (wallet signing)
     │  @polkadot/api WebSocket
     ▼
[Portaldot Node — ws://localhost:9944]
     │  auto-discovers all pallets + extrinsics + storage items
     │
     └── [PalletManRegistry — ink! v5 contract]
              save_call / get_calls / delete_call / total_saves
```

**3-panel studio layout:**
- **Left** — Pallet sidebar: browse every pallet, pick extrinsic or storage item
- **Center** — Extrinsic panel: typed param fields (address, balance, bool, JSON, hex), Estimate Fee, Sign & Submit
- **Right** — Tabbed: Results (tx history) | Saved Calls (on-chain registry)

**Core tech stack:**
- **Blockchain platform:** Portaldot (Substrate / substrate-contracts-node)
- **Smart contract language:** ink! v5 (Rust)
- **Frontend framework:** Next.js + React
- **Other components:** `@polkadot/api` WebSocket client, `@polkadot/extension-dapp` wallet integration, `@polkadot/api-contract` for ink! contract interaction

---

## Smart Contracts

**Contract file directory:** `contracts/palletman-registry/lib.rs`

**Key contracts:**

| Function | Description |
|---|---|
| `save_call(name, pallet, extrinsic, params_json)` | Stores a named extrinsic call config under the caller's account; small POT gas fee per save |
| `get_calls(account)` | Returns all saved call configs for a given account |
| `delete_call(index)` | Removes a saved call by 0-based index |
| `call_count(account)` | Returns count of saved calls for an account |
| `total_saves()` | Returns global total saves across all accounts |

**Deployment instructions:**

```bash
# Start local Portaldot node
substrate-contracts-node --dev

# Build contract
cd contracts/palletman-registry
cargo contract build

# Deploy (copy contract address from output)
cargo contract instantiate --suri //Alice --constructor new

# Paste address into frontend/constants/network.ts → REGISTRY_CONTRACT_ADDRESS
```

---

## Installation & Setup

**Requirements:**
- Node.js 18+
- Rust + cargo-contract
- substrate-contracts-node

**Steps:**

1. Clone the repository
```bash
git clone https://github.com/Venkat5599/Palletman
cd Palletman
```

2. Install dependencies
```bash
cd frontend
npm install
```

3. Compile & deploy contract
```bash
# In a separate terminal
substrate-contracts-node --dev

cd contracts/palletman-registry
cargo contract build
cargo contract instantiate --suri //Alice --constructor new
# Copy deployed contract address
```

4. Launch frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000/app
```

---

## Demo

**Video link:** https://youtu.be/mVH80GSLKuE?si=ZGclj_mIV6yzhTN3

**Live demo:** https://palletman.xyz

**Test accounts:**

| Account | Address |
|---|---|
| Alice (pre-funded, 1B POT) | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` |
| Bob (pre-funded, 1B POT) | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty` |

Mnemonic (dev only — never use on mainnet): `bottom drive obey lake curtain smoke basket hold race lonely fit walk` + `//Alice` or `//Bob` derivation path.

---

## Roadmap

**Completed features:**
- ink! v5 PalletManRegistry contract (save / load / delete call configs on-chain)
- 3-panel studio — pallet browser, extrinsic builder, results + saved calls
- Full Polkadot.js wallet extension signing (real accounts)
- Auto-discovery of all pallets and extrinsics from live runtime metadata
- Typed parameter fields (address, balance, bool, JSON, hex)
- Fee estimation before submission
- Storage query panel with decoded values
- Transaction lifecycle tracking (building → signing → ready → inblock → finalized)
- Transaction history (last 20 submissions)
- Real-time block counter in connection bar
- Landing page with features, how-it-works, FAQ
- Dark/light mode

**Next phase plans:**
- URL-shareable saved calls (encode pallet/extrinsic/params in URL)
- RPC endpoint switcher in the UI (no code changes needed to swap networks)
- Export any extrinsic as Python SDK snippet
- Batch extrinsic sequences
- Multi-network profiles (mainnet / testnet / local)

---

## Team

**Team name:** PalletMan

**Members & roles:**
- Venkata Ramana Komari — Solo builder (design, contract, frontend, deployment)

**Contact:** komarivenkataramana4@gmail.com

---

## License

MIT
