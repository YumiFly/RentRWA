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
import { lendRwaTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };

export class LendRwaAction {
    constructor(private walletProvider: WalletProvider) {}

    async lendRwa(params: GetRwaParams): Promise<Transaction> {
        const chainName = "avalancheFuji";
        const contractAddress: `0x${string}` = "0x00"; // TODO: Replace with actual address

        console.log(`Lend RWA with key: ${params.rwaKey} and address: ${params.address}`);

        this.walletProvider.switchChain(chainName);

        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const { abi } = rentLendingJson["contracts"]["RentLending.sol:RentLending"];
            const rentLendingContract = getContract({
                address: contractAddress,
                abi,
                client: walletClient
            });

            const tokenId = BigInt(params.rwaKey); // assuming rwaKey is a tokenId
            const amount = BigInt(1); // TODO: Make this configurable
            const data = "0x";

            const hash = await rentLendingContract.write.lendRWA([tokenId, amount, data]);

            return {
                hash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Function call failed: ${error.message}`);
            } else {
                throw new Error(`Function call failed: unknown error`);
            }
        }
    }
}

const buildFunctionCallDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<GetRwaParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: lendRwaTemplate,
    });

    const functionCallDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as GetRwaParams;

    return functionCallDetails;
};

export const lendRwaAction: Action = {
    name: "lend rwa",
    description: "Given a wallet address and rwa key, lend the corresponding RWA NFT to the RentLending contract",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options?: any,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Lend RWA action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new LendRwaAction(walletProvider);

        const rwaParams: GetRwaParams = await buildFunctionCallDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const callFunctionResp = await action.lendRwa(rwaParams);
            if (callback) {
                callback({
                    text: `Successfully called lendRWA with tokenId: ${rwaParams.rwaKey}`,
                    content: {
                        success: true,
                        hash: callFunctionResp.hash,
                        amount: formatEther(callFunctionResp.value),
                        recipient: callFunctionResp.to,
                        chain: "avalanchefuji",
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during lendRWA call:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error lendRWA calling: ${error.message}`,
                        content: { error: error.message },
                    });
                }
            } else {
                console.error("unknown error");
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [],
    similes: ["LEND_RWA"],
};