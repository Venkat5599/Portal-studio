# MantleGuard SDK

Developer SDK for integrating MantleGuard as an on-chain AI firewall.

The SDK calls a real MantleGuard API. It does not ship mocked risk scores or
simulated transaction hashes.

```ts
import { createMantleGuardFirewall } from "@mantleguard/sdk";

const firewall = createMantleGuardFirewall({
  apiUrl: "https://your-mantleguard-deployment.com",
  chainId: 5003,
});

const verdict = await firewall.beforeTransaction({
  from: user,
  to: router,
  data: calldata,
  value: "0",
});

if (verdict.verdict === "Block") {
  throw new Error(verdict.summary);
}
```
