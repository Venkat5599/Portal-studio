# Portal Studio — Product Requirements Document

**Hackathon**: PortalDot Mini Hackathon Online Season 1  
**Track**: Builder Tools for Portaldot  
**Submission Deadline**: May 31, 2026 (UTC+0)  
**Team**: Solo / Small Team  

---

## 1. Problem Statement

Portaldot is a Substrate-based, Rust-first blockchain that is **not EVM-compatible**. Developers who want to interact with Portaldot pallets and extrinsics today face:

- No visual interface to explore available pallets and extrinsics
- Must manually read docs, encode SCALE types, and write code just to test a single call
- Polkadot.js Apps exists but is generic, complex, and not Portaldot-specific
- High barrier to entry slows ecosystem growth and discourages new builders

**The result**: Developers waste hours on setup and debugging instead of building products.

---

## 2. Solution — Portal Studio

> "Postman for Portaldot. Explore, test, and submit any pallet extrinsic from your browser in 30 seconds — no code required."

A browser-based developer tool that:
- Auto-fetches all pallets and extrinsics from the live Portaldot node
- Renders an auto-generated form UI for every extrinsic (no manual SCALE encoding)
- Connects to the user's wallet (Polkadot.js extension)
- Submits extrinsics to Portaldot using POT as gas
- Shows decoded results, events, and block hash in real time
- Queries any storage item live

---

## 3. Hackathon Rules Compliance

| Rule | How Portal Studio Complies |
|---|---|
| Built on PortalDot | Connects directly to Portaldot RPC node |
| Use POT as gas (mandatory) | Every extrinsic submitted uses POT as gas fee |
| Runnable MVP | Browser-based, zero install — opens and works immediately |
| Demo-ready | Live interactive demo, 60-second workflow |
| GitHub repo | Open source repository with full source code |
| Clear README | Setup guide, features, screenshots |
| Demo video | Recorded walkthrough of end-to-end flow |
| Core contracts open source | No contracts needed (pure frontend + RPC tool) — fully open source |
| No copying without changes | Original build, Portaldot-specific, not a fork |

---

## 4. Judging Criteria Mapping

| Criterion | Score Target | How We Hit It |
|---|---|---|
| PortalDot native deployment | Must-pass | Live RPC connection to Portaldot, POT gas on every call |
| MVP functionality & completeness | High | All core features working end-to-end |
| Real-world application / market potential | High | Every Portaldot developer needs this — permanent public good |
| Demo quality & presentation | High | Live browser demo judges can try themselves |

---

## 5. Target Users

- **Rust / Substrate developers** building on Portaldot
- **Web2 / Web3 builders** learning Portaldot for the first time
- **Smart contract auditors** inspecting pallet behavior
- **Hackathon participants** (including future Portaldot hackathon builders)

---

## 6. Core Features (MVP)

### 6.1 Pallet Explorer
- Auto-fetch runtime metadata from Portaldot node on load
- Left sidebar: searchable list of all pallets
- Click pallet → see all extrinsics and storage items

### 6.2 Extrinsic Builder
- Select an extrinsic → auto-generated form appears
- Each param type maps to the correct input:
  - `AccountId` → address input with validation
  - `Balance` → number input (displays in POT)
  - `bool` → toggle
  - `u32 / u64` → number input
  - `Vec<u8>` → hex or text input
  - `Enum` → dropdown
- Show estimated POT gas fee before submitting

### 6.3 Wallet Connection
- Connect via Polkadot.js browser extension
- Show connected address + POT balance
- Sign extrinsic with connected account

### 6.4 Submit & Result Viewer
- Submit signed extrinsic to Portaldot
- Show in real time:
  - Status: `Ready → InBlock → Finalized`
  - Block hash
  - Decoded events (e.g. `Transfer(from, to, amount)`)
  - Success ✅ or error ❌ with plain-English message

### 6.5 Storage Query
- Select pallet → select storage item → enter key if required → query
- Show decoded current value
- Example: `System.account(address)` → shows nonce, balance

### 6.6 Call History
- Last 10 extrinsics saved to localStorage
- Click to re-load any previous call

---

## 7. Out of Scope (MVP)

- Multi-chain support (Portaldot only for now)
- Custom RPC URL input (pre-configured to Portaldot)
- Backend server (fully static frontend)
- Mobile app
- ink! contract interaction (pallets only for MVP)

---

## 8. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React + TypeScript | Proven by IDL Space (Breakout winner) |
| Build tool | Vite | Fast dev server, static output |
| Styling | Tailwind CSS | Rapid UI, clean look |
| Chain connection | `@polkadot/api` | Standard Substrate RPC + metadata parsing |
| Wallet | `@polkadot/extension-dapp` | Polkadot.js extension signing |
| Types | `@polkadot/types` | SCALE type decoding |
| Deployment | Vercel / GitHub Pages | Zero-config static hosting |

---

## 9. 4-Week Build Plan

### Week 1 (May 4–10) — Foundation
- [ ] Scaffold Vite + React + TypeScript + Tailwind
- [ ] Install `@polkadot/api`, `@polkadot/extension-dapp`
- [ ] Connect to Portaldot RPC via `WsProvider`
- [ ] Fetch runtime metadata → parse all pallets
- [ ] Render pallet sidebar + extrinsic list

### Week 2 (May 11–17) — Core Features
- [ ] Auto-generate form UI from extrinsic param types
- [ ] Connect Polkadot.js wallet extension
- [ ] Build + sign + submit extrinsic
- [ ] Show result: status, events, block hash
- [ ] POT gas fee estimation

### Week 3 (May 18–24) — Storage + Polish
- [ ] Storage query tab per pallet
- [ ] Call history (localStorage)
- [ ] Plain-English error messages
- [ ] Loading states, empty states
- [ ] Export extrinsic as JSON

### Week 4 (May 25–31) — Demo Prep
- [ ] Pre-configure Portaldot RPC (auto-connected on load)
- [ ] Deploy to Vercel
- [ ] Record demo video
- [ ] Write README (setup, features, screenshots)
- [ ] Final UI polish + dark mode

---

## 10. Demo Flow (60 seconds)

1. Open Portal Studio in browser → auto-connected to Portaldot
2. **Storage query**: Click `System` → `account` → paste address → see POT balance instantly
3. **Extrinsic**: Click `Balances` → `transfer` → fill recipient + amount → estimated fee appears
4. Connect wallet → sign → submit → watch status: InBlock → Finalized ✅
5. Events panel shows `Transfer(from, to, amount)` decoded
6. Payoff line: *"This used to take hours of doc-reading. Now it's 30 seconds."*

---

## 11. Repository Structure

```
portal-studio/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Pallet list
│   │   ├── ExtrinsicForm.tsx    # Auto-generated form
│   │   ├── ResultPanel.tsx      # Events + status
│   │   ├── StorageQuery.tsx     # Storage tab
│   │   └── WalletConnect.tsx    # Wallet button
│   ├── hooks/
│   │   ├── useApi.ts            # Polkadot API connection
│   │   └── useWallet.ts         # Extension wallet
│   ├── utils/
│   │   └── typeMapper.ts        # SCALE type → form field
│   ├── App.tsx
│   └── main.tsx
├── public/
├── README.md
├── package.json
└── vite.config.ts
```

---

## 12. Success Metrics

- Judges can submit a live extrinsic during the demo without any setup
- Tool loads connected to Portaldot within 3 seconds
- At least 5 pallets fully explorable with working form submission
- Storage query returns live data for `System.account`
- Demo video under 3 minutes, clear narrative

---

## 13. Competitive Advantage

| Tool | Problem |
|---|---|
| Polkadot.js Apps | Generic for all Substrate chains, complex UI, overwhelming for new devs |
| Raw RPC calls | Requires code, no visual feedback |
| Reading docs | Static, no way to test directly |
| **Portal Studio** | ✅ Portaldot-specific, visual, instant, no code needed |

---

*Portal Studio is a public good for the Portaldot ecosystem — free, open source, and built to stay.*
