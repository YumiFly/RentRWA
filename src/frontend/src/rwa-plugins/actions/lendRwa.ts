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
import type { LendRwaParams, Transaction } from "../types/index.ts";
import { lendRwaTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };
import realRentTokenJson from "../artifacts/RealRentToken.json" with { type: "json" };


import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { keccak256, toBytes, decodeEventLog } from "viem";
import * as dotenv from "dotenv";
import { Indexed } from "ethers/lib/utils";
dotenv.config();

// Create public client
const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI!), // Reliable Fuji provider
});

// Explicitly define the Issued event ABI for type safety
const lendRWAEvent = {
    type: "event",
    name: "LendRWA",
    inputs: [
        { indexed: true, name:"tokenId",type:"uint256"},
        { indexed: false, name: "amountRwa", type: "uint256" },
        { indexed: false, name: "amountUsdc", type: "uint256" },
    ],
} as const;

// Extend Transaction type to include requestId
interface ExtendedTransaction extends Transaction {
    tokenId?: Number; // Add tokenId field
    amountRwa?: Number;
    amountUsdc?: Number;
    lendAddr?:`0x${string}`; // Add requestId field
}
export class LendRwaAction {
    constructor(private walletProvider: WalletProvider) {}

    async lendRwa(params: LendRwaParams): Promise<ExtendedTransaction> {
        const chainName = "avalancheFuji";

        if(!process.env.RENT_LENDING_CONTRACT_ADDRESS||!process.env.REAL_RENT_TOKEN_CONTRACT_ADDRESS){
            throw new Error("RENT_LENDING_CONTRACT_ADDRESS is not set");
        }
        const rent_lending_contractAddress: `0x${string}` = process.env.RENT_LENDING_CONTRACT_ADDRESS as `0x${string}`;
        const real_rent_token_contract_address: `0x${string}` = process.env.REAL_RENT_TOKEN_CONTRACT_ADDRESS as `0x${string}`;

        if (rent_lending_contractAddress === "0x00"||real_rent_token_contract_address === "0x00") {
            throw new Error("Contract address is not set");
        }

        console.log(`Get rwa token  Id: ${params.tokenId}  and lend rwa amount (${params.amountRwa}) `);

        this.walletProvider.switchChain(chainName);

        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const abi  =realRentTokenJson
            const realRentTokenContract = getContract({
                address: real_rent_token_contract_address,
                abi,
                client: walletClient
            });

            const tokenId = params.tokenId; // assuming rwaKey is a tokenId
            const amount = params.amountRwa; // assuming amount is a BigInt

            const opTxHash = await realRentTokenContract.write.setApprovalForAll([rent_lending_contractAddress, true]);

            const opReceipt = await publicClient.waitForTransactionReceipt({ hash: opTxHash });
            console.log(`OP Transaction mined in block: ${opReceipt.blockNumber}`);

            const rentLendingContract = getContract({
                address: rent_lending_contractAddress,
                abi: rentLendingJson,
                client: walletClient
            })
            const rentLendingTxHash = await rentLendingContract.write.lendRWA([tokenId, amount]);

            const rentLendingReceipt = await publicClient.waitForTransactionReceipt({ hash: rentLendingTxHash });
            console.log(`RentLending Transaction mined in block: ${rentLendingReceipt.blockNumber}`);

            const decodedEvents = decodeEventLog({
                abi: [lendRWAEvent],
                data: rentLendingReceipt.logs[0].data,
                topics: rentLendingReceipt.logs[0].topics, // Add topics to the decoded event
            })
            const amountRwa = decodedEvents.args.amountRwa;
            const amountUsdc = decodedEvents.args.amountUsdc;

            return {
                hash:rentLendingTxHash,
                from: walletClient.account!.address,
                to: rent_lending_contractAddress,
                value: parseEther("0"),
                data: "0x",
                tokenId:params.tokenId,
                amountRwa: Number(amountRwa),
                amountUsdc: Number(amountUsdc),
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
): Promise<LendRwaParams> => {
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
    })) as LendRwaParams;

    return functionCallDetails;
};

export const lendRwaAction: Action = {
    name: "lend rwa",
    description: "Given a tokenId and amountRwa, lend the corresponding RWA NFT to the lending contract",
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

        const lendRwaParams: LendRwaParams = await buildFunctionCallDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const callFunctionResp = await action.lendRwa(lendRwaParams);
            if (callback) {
                callback({
                    text: `Successfully called lendRWA with tokenId ${callFunctionResp.tokenId} , \n the amount of RWA to lend: ${callFunctionResp.amountRwa},\n the amount of USDC to get:${callFunctionResp.amountUsdc}`,
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
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you call function on contract",
                    action: "LEND_RWA",
                },
            },
            {
                user: "user",
                content: {
                    text: "“I hereby agree to pledge 5 RWA tokens as collateral to support a USDC loan for the lending contract . The tokenId I own is 1.”",
                    action: "RWA_LEND",
                },
            },
            {
                user: "user",
                content: {
                    text: "I’m putting up 2 RWA tokens id: 3 as collateral so lending contract can borrow USDC.",
                    action: "PUT_UP_RWA",
                },
            },
        ],
    ],
    similes: ["LEND_RWA","RWA_LEND","PUT_UP_RWA"],
};