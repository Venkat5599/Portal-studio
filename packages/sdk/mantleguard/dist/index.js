import { encodeFunctionData } from "viem";
const attestorAbi = [
    {
        type: "function",
        name: "attestAnalysis",
        stateMutability: "nonpayable",
        inputs: [
            { name: "subjectHash", type: "bytes32" },
            { name: "sourceHash", type: "bytes32" },
            { name: "reportHash", type: "bytes32" },
            { name: "riskScore", type: "uint8" },
            { name: "verdict", type: "string" },
            { name: "model", type: "string" },
            { name: "reportURI", type: "string" },
        ],
        outputs: [{ name: "id", type: "uint256" }],
    },
    {
        type: "function",
        name: "attestFirewallVerdict",
        stateMutability: "nonpayable",
        inputs: [
            { name: "subjectHash", type: "bytes32" },
            { name: "intentHash", type: "bytes32" },
            { name: "verdictHash", type: "bytes32" },
            { name: "riskScore", type: "uint8" },
            { name: "verdict", type: "string" },
            { name: "model", type: "string" },
            { name: "reportURI", type: "string" },
        ],
        outputs: [{ name: "id", type: "uint256" }],
    },
];
async function sha256Hex(value) {
    const encoded = new TextEncoder().encode(value);
    const digestInput = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
    const digest = await crypto.subtle.digest("SHA-256", digestInput);
    const hex = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return `0x${hex}`;
}
export function createMantleGuardFirewall(config) {
    const fetcher = config.fetcher ?? fetch;
    const apiUrl = config.apiUrl.replace(/\/$/, "");
    return {
        async ask(message, wallet) {
            const response = await fetcher(`${apiUrl}/api/agent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, wallet, chainId: config.chainId }),
            });
            const data = (await response.json());
            if (!response.ok || data.error) {
                throw new Error(data.error ?? "MantleGuard agent request failed.");
            }
            if (!data.answer) {
                throw new Error("MantleGuard agent returned no answer.");
            }
            return data.answer;
        },
        async requestVerdict(message, wallet) {
            const response = await fetcher(`${apiUrl}/api/agent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, wallet, chainId: config.chainId }),
            });
            const data = (await response.json());
            if (!response.ok || data.error) {
                throw new Error(data.error ?? "MantleGuard firewall request failed.");
            }
            const answer = data.answer ?? "";
            const blockMatch = answer.match(/\b(Block|Warn|Safe)\b/i);
            const scoreMatch = answer.match(/(?:risk score|score)\D+(\d{1,3})/i);
            return {
                verdict: data.policyVerdict?.verdict ??
                    blockMatch?.[1] ??
                    "Warn",
                riskScore: data.policyVerdict?.riskScore ??
                    Math.min(100, Math.max(0, Number.parseInt(scoreMatch?.[1] ?? "50", 10))),
                summary: answer,
                model: data.model,
                reasons: data.policyVerdict?.reasons,
                gasSuggestions: data.gasSuggestions,
                raw: data,
            };
        },
        async beforeTransaction(input) {
            return this.requestVerdict([
                "Assess this transaction before execution.",
                `from=${input.from}`,
                `to=${input.to}`,
                `value=${input.value ?? "0"}`,
                `data=${input.data}`,
                input.context ? `context=${input.context}` : "",
            ]
                .filter(Boolean)
                .join("\n"), input.from);
        },
        async beforeTrade(input) {
            return this.requestVerdict([
                "Assess this agentic trade before execution.",
                `from=${input.from}`,
                `router=${input.router}`,
                `sellAsset=${input.sellAsset}`,
                `buyAsset=${input.buyAsset}`,
                `amount=${input.amount}`,
                `maxSlippageBps=${input.maxSlippageBps}`,
                input.strategy ? `strategy=${input.strategy}` : "",
            ]
                .filter(Boolean)
                .join("\n"), input.from);
        },
        async beforeApproval(input) {
            return this.requestVerdict([
                "Assess this token approval before execution.",
                `owner=${input.owner}`,
                `spender=${input.spender}`,
                `token=${input.token}`,
                `amount=${input.amount}`,
                input.context ? `context=${input.context}` : "",
            ]
                .filter(Boolean)
                .join("\n"), input.owner);
        },
        async beforeDeploy(input) {
            return this.requestVerdict([
                "Assess this smart contract deployment before execution.",
                `deployer=${input.deployer}`,
                `contractName=${input.contractName}`,
                `sourceHash=${input.sourceHash}`,
                input.constructorArgs ? `constructorArgs=${input.constructorArgs}` : "",
                input.context ? `context=${input.context}` : "",
            ]
                .filter(Boolean)
                .join("\n"), input.deployer);
        },
        async hashReport(report) {
            return sha256Hex(JSON.stringify(report));
        },
        encodeAttestation(input) {
            return encodeFunctionData({
                abi: attestorAbi,
                functionName: "attestAnalysis",
                args: [
                    input.subjectHash,
                    input.sourceHash,
                    input.reportHash,
                    Math.min(100, Math.max(0, Math.round(input.riskScore))),
                    input.verdict,
                    input.model,
                    input.reportURI ?? "",
                ],
            });
        },
        encodeFirewallVerdict(input) {
            return encodeFunctionData({
                abi: attestorAbi,
                functionName: "attestFirewallVerdict",
                args: [
                    input.subjectHash,
                    input.intentHash,
                    input.reportHash,
                    Math.min(100, Math.max(0, Math.round(input.riskScore))),
                    input.verdict,
                    input.model,
                    input.reportURI ?? "",
                ],
            });
        },
    };
}
export { attestorAbi };
