import { parseEther, getContract } from "viem";
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
import { repayTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };

export class RepayAction {
    constructor(private walletProvider: WalletProvider) {}

    async repay(params: GetRwaParams): Promise<Transaction> {
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

            const hash = await rentLendingContract.write.repay([tokenId]);

            return {
                hash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
            };
        } catch (error) {
            throw new Error(`Repay call failed: ${error instanceof Error ? error.message : "unknown error"}`);
        }
    }
}

export const repayAction: Action = {
    name: "repay",
    description: "Repay an RWA loan and retrieve your RWA token",
    handler: async (runtime, message, state, _options, callback) => {
        state = state ? await runtime.updateRecentMessageState(state) : await runtime.composeState(message);

        const walletProvider = await initWalletProvider(runtime);
        const action = new RepayAction(walletProvider);

        const params = await generateObjectDeprecated({
            runtime,
            context: composeContext({ state, template: repayTemplate }),
            modelClass: ModelClass.SMALL,
        }) as GetRwaParams;

        try {
            const tx = await action.repay(params);
            callback?.({
                text: `Successfully repaid loan for tokenId: ${params.rwaKey}`,
                content: { success: true, hash: tx.hash },
            });
            return true;
        } catch (error) {
            callback?.({
                text: `Repay failed: ${error instanceof Error ? error.message : "unknown error"}`,
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
    similes: ["REPAY"],
};