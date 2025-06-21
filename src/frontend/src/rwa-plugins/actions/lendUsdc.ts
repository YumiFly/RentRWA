import { formatEther, parseEther, getContract } from "viem";
import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { GetRwaParams, Transaction } from "../types/index.ts";
import { lendUsdcTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };

export class LendUsdcAction {
    constructor(private walletProvider: WalletProvider) {}

    async lendUsdc(params: GetRwaParams): Promise<Transaction> {
        const chainName = "avalancheFuji";
        const contractAddress: `0x${string}` = "0x00"; // TODO: Replace with deployed address

        this.walletProvider.switchChain(chainName);
        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const { abi } = rentLendingJson["contracts"]["RentLending.sol:RentLending"];
            const rentLendingContract = getContract({
                address: contractAddress,
                abi,
                client: walletClient
            });

            const tokenId = BigInt(params.rwaKey);
            const usdcAmount = parseEther("10"); // TODO: Make this configurable

            const hash = await rentLendingContract.write.lendUSDC([tokenId, usdcAmount]);

            return {
                hash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
            };
        } catch (error) {
            throw new Error(`Lend USDC call failed: ${error instanceof Error ? error.message : "unknown error"}`);
        }
    }
}

export const lendUsdcAction: Action = {
    name: "lend usdc",
    description: "Lend USDC to an RWA token owner using RentLending contract",
    handler: async (runtime, message, state, _options, callback) => {
        state = state ? await runtime.updateRecentMessageState(state) : await runtime.composeState(message);

        const walletProvider = await initWalletProvider(runtime);
        const action = new LendUsdcAction(walletProvider);

        const params = await generateObjectDeprecated({
            runtime,
            context: composeContext({ state, template: lendUsdcTemplate }),
            modelClass: ModelClass.SMALL,
        }) as GetRwaParams;

        try {
            const tx = await action.lendUsdc(params);
            callback?.({
                text: `Lent USDC for tokenId: ${params.rwaKey}`,
                content: { success: true, hash: tx.hash },
            });
            return true;
        } catch (error) {
            callback?.({
                text: `Failed to lend USDC: ${error instanceof Error ? error.message : "unknown error"}`,
                content: { error },
            });
            return false;
        }
    },
    validate: async (runtime) => {
        const pk = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof pk === "string" && pk.startsWith("0x");
    },
    examples: [],
    similes: ["LEND_USDC"],
};