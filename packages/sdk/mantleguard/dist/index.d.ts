import { type Address, type Hex } from "viem";
export type MantleGuardVerdict = "Safe" | "Warn" | "Block";
export type FirewallInput = {
    from: Address;
    to: Address;
    data: Hex;
    value?: string;
    context?: string;
};
export type TradeInput = {
    from: Address;
    router: Address;
    sellAsset: string;
    buyAsset: string;
    amount: string;
    maxSlippageBps: number;
    strategy?: string;
};
export type ApprovalInput = {
    owner: Address;
    spender: Address;
    token: Address;
    amount: string;
    context?: string;
};
export type DeploymentInput = {
    deployer: Address;
    contractName: string;
    sourceHash: Hex;
    constructorArgs?: string;
    context?: string;
};
export type FirewallVerdict = {
    verdict: MantleGuardVerdict;
    riskScore: number;
    summary: string;
    model?: string;
    reasons?: string[];
    gasSuggestions?: Array<{
        title: string;
        impact: string;
        detail?: string;
    }>;
    raw: unknown;
};
export type MantleGuardConfig = {
    apiUrl: string;
    chainId: number;
    fetcher?: typeof fetch;
};
export type AttestationInput = {
    subjectHash: Hex;
    sourceHash: Hex;
    reportHash: Hex;
    riskScore: number;
    verdict: MantleGuardVerdict;
    model: string;
    reportURI?: string;
};
declare const attestorAbi: readonly [{
    readonly type: "function";
    readonly name: "attestAnalysis";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "subjectHash";
        readonly type: "bytes32";
    }, {
        readonly name: "sourceHash";
        readonly type: "bytes32";
    }, {
        readonly name: "reportHash";
        readonly type: "bytes32";
    }, {
        readonly name: "riskScore";
        readonly type: "uint8";
    }, {
        readonly name: "verdict";
        readonly type: "string";
    }, {
        readonly name: "model";
        readonly type: "string";
    }, {
        readonly name: "reportURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "attestFirewallVerdict";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "subjectHash";
        readonly type: "bytes32";
    }, {
        readonly name: "intentHash";
        readonly type: "bytes32";
    }, {
        readonly name: "verdictHash";
        readonly type: "bytes32";
    }, {
        readonly name: "riskScore";
        readonly type: "uint8";
    }, {
        readonly name: "verdict";
        readonly type: "string";
    }, {
        readonly name: "model";
        readonly type: "string";
    }, {
        readonly name: "reportURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
    }];
}];
export declare function createMantleGuardFirewall(config: MantleGuardConfig): {
    ask(message: string, wallet?: Address): Promise<string>;
    requestVerdict(message: string, wallet?: Address): Promise<FirewallVerdict>;
    beforeTransaction(input: FirewallInput): Promise<FirewallVerdict>;
    beforeTrade(input: TradeInput): Promise<FirewallVerdict>;
    beforeApproval(input: ApprovalInput): Promise<FirewallVerdict>;
    beforeDeploy(input: DeploymentInput): Promise<FirewallVerdict>;
    hashReport(report: unknown): Promise<Hex>;
    encodeAttestation(input: AttestationInput): Hex;
    encodeFirewallVerdict(input: AttestationInput & {
        intentHash: Hex;
    }): Hex;
};
export { attestorAbi };
