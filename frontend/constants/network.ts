export const PORTALDOT_RPC = "wss://drip-node-production.up.railway.app";
export const PORTALDOT_RPC_FALLBACK = "wss://drip-backend-production-8d86.up.railway.app/node";
// Local substrate-contracts-node (run via Docker for ink! v5 support)
export const PORTALDOT_LOCAL_RPC = "ws://127.0.0.1:9944";
export const PORTALDOT_EXPLORER = "https://explorer.portaldot.io";
export const POT_DECIMALS = 12;
export const POT_SYMBOL = "POT";
export const NETWORK_NAME = "Portaldot";

// Deployed PalletMan Registry contract address (substrate-contracts-node local)
// Update this after deploying: cargo contract instantiate --url ws://127.0.0.1:9944 --suri //Alice
export const REGISTRY_CONTRACT_ADDRESS = "";
