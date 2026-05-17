# PalletMan Registry — ink! Smart Contract

An ink! v5 smart contract that lets Portaldot users save, retrieve, and delete extrinsic call configurations on-chain — like Postman Collections, stored in POT.

## What it does

| Message | Mutates | Description |
|---------|---------|-------------|
| `save_call(name, pallet, extrinsic, params_json)` | Yes | Save a call config on-chain. Costs a small POT storage deposit. |
| `get_calls(account)` | No | Retrieve all saved calls for any account. |
| `delete_call(index)` | Yes | Delete a saved call by index. Reclaims storage deposit. |
| `call_count(account)` | No | Number of saved calls for an account. |
| `total_saves()` | No | Total saves across all accounts. |

## Build

Install the ink! toolchain:

```bash
rustup target add wasm32-unknown-unknown
cargo install cargo-contract
```

Build the contract:

```bash
cd contracts/palletman-registry
cargo contract build --release
```

This produces:
- `target/ink/palletman_registry.wasm` — the contract bytecode
- `target/ink/palletman_registry.json` — the ABI/metadata
- `target/ink/palletman_registry.contract` — bundle (use this to deploy)

## Deploy (local node)

Start a local Portaldot / substrate-contracts-node:

```bash
substrate-contracts-node --dev
```

Deploy using `cargo contract`:

```bash
cargo contract instantiate \
  --contract target/ink/palletman_registry.contract \
  --constructor new \
  --suri //Alice \
  --url ws://127.0.0.1:9944
```

Copy the deployed contract address and paste it into PalletMan Studio → Registry panel.

## Run tests

```bash
cargo test
```
