/**
 * @fileoverview This file contains the implementation of the GetRwaAction class and the GetRwaAction handler.
 * It interacts with a smart contract on the Avalanche Fuji testnet to send a rwa request.
 */

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
import { getRwaTemplate } from "../templates/index.ts";
import getRwaJson from "../artifacts/RentIssuer.json" with { type: "json" };

/**
 * Class representing the GetRwaAction.
 */
export class GetRwaAction {
    /**
     * Creates an instance of GetRwaAction.
     * @param {WalletProvider} walletProvider - The wallet provider instance.
     */
    constructor(private walletProvider: WalletProvider) {}

    /**
     * Sends a rwa request to the smart contract.
     * @param {GetRwaParams} params - The parameters for the rwa request.
     * @returns {Promise<Transaction>} The transaction details.
     * @throws Will throw an error if contract address, slot ID, version, or subscription ID is not set.
     */
    async getRwa(params: GetRwaParams): Promise<Transaction> {
        const chainName = "avalancheFuji";
        const contractAddress: `0x${string}` =  "0x00" // dev TODO
        // const donHostedSecretsSlotID:number = 0 // dev TODO
        // const donHostedSecretsVersion:number = 1749628006 // dev TODO
        const clSubId:number = 15576 // dev TODO

        // if (contractAddress === "0x00" || donHostedSecretsSlotID === Infinity || donHostedSecretsVersion === Infinity || clSubId === Infinity) {
        //     throw new Error("Contract address, slot ID, version, or subscription ID is not set");
        // }

        console.log(
            `Get rwa with Id: ${params.rwaKey} and address (${params.address})`
        );

        this.walletProvider.switchChain(chainName);

        const walletClient = this.walletProvider.getWalletClient(
            chainName
        );

        try {
            const { abi } = getRwaJson["contracts"]["RentIssuer.sol:RentIssuer"]
            const getRentIssuerContract = getContract({
                address: contractAddress,
                abi,
                client: walletClient
            })

            const args: string[] = [params.rwaKey];
            const userAddr = params.address;

            const hash = await getRentIssuerContract.write.issue(userAddr, args);

            return {
                hash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
            };
        } catch (error) {
            if(error instanceof Error) {
                throw new Error(`Function call failed: ${error.message}`);
            } else {
                throw new Error(`Function call failed: unknown error`);
            }
        }
    }
}

/**
 * Builds the function call details required for the getrwa action.
 * @param {State} state - The current state.
 * @param {IAgentRuntime} runtime - The agent runtime.
 * @param {WalletProvider} wp - The wallet provider.
 * @returns {Promise<GetRwaParams>} The parameters for the rwa request.
 */
const buildFunctionCallDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<GetRwaParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: getRwaTemplate,
    });

    const functionCallDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as GetRwaParams;

    return functionCallDetails;
};

/**
 * The GetRwaAction handler.
 * @type {Action}
 */
export const getRwaAction: Action = {
    name: "get rwa",
    description: "Given a wallet address and rwa key, extract that data and call a function on the Functions Consumer Smart Contract and send request",
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

        console.log("Get rwa action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new GetRwaAction(walletProvider);

        // Compose functionCall context
        const rwaParams:GetRwaParams = await buildFunctionCallDetails(
            state,
            runtime,
            walletProvider
        );


        try {
            const callFunctionResp = await action.getRwa(rwaParams);
            if (callback) {
                callback({
                    text: `Successfully called function with params of rwa key : ${rwaParams.rwaKey} and address: ${rwaParams.address}\nTransaction Hash: ${callFunctionResp.hash}`,
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
            console.error("Error during get rwa call:", error);
            if(error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error get rwa calling: ${error.message}`,
                        content: { error: error.message },
                    });
                }
            } else {
                console.error("unknow error")
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you call function on contract",
                    action: "GET_RWA",
                },
            },
            {
                user: "user",
                content: {
                    text: "Give me the rwa to address 0x1234567890123456789012345678901234567890, key for rwa is 1010",
                    action: "GET_RWA",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can I get the rwa to address 0x1234567890123456789012345678901234567890, my rwa key is 898770",
                    action: "GET_RWA",
                },
            },
        ],
    ],
    similes: ["GET_RWA", "RWA_GIVE", "SEND_RWA"],
};
