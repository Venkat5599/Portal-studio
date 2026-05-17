# Contracts

Smart contracts for Mantle Firewall / MantleGuard.

- `solidity/MantleGuardAttestor.sol` records real AI analysis and firewall verdict attestations on-chain.
- `solidity/MantleGuardPolicyRegistry.sol` stores protocol-owned AI firewall policies.

Deploy this contract to Mantle Sepolia or Mantle mainnet, verify it on the
explorer, then set the frontend environment variable:

```bash
NEXT_PUBLIC_MANTLE_GUARD_ATTESTOR_ADDRESS=0x...
```
