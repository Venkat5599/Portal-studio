import type { ApiPromise } from "@polkadot/api";

let apiInstance: ApiPromise | null = null;
let apiPromise: Promise<ApiPromise> | null = null;

export async function getApi(rpcUrl: string): Promise<ApiPromise> {
  if (apiInstance?.isConnected) return apiInstance;
  if (apiPromise) return apiPromise;

  apiPromise = (async () => {
    const { ApiPromise, WsProvider } = await import("@polkadot/api");
    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider });
    await api.isReady;
    apiInstance = api;
    return api;
  })();

  return apiPromise;
}

export function disconnectApi(): void {
  apiInstance?.disconnect();
  apiInstance = null;
  apiPromise = null;
}
