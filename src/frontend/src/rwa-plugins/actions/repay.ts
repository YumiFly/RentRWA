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
import type { RepayParams, Transaction } from "../types/index.ts";
import { repayTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };
import usdcJson from "../artifacts/FiatTokenProxy.json" with { type: "json" };

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { keccak256, toBytes, decodeEventLog } from "viem";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI) {
    throw new Error("Missing AVALANCHE_FUJI_RPC_URL in .env");
}

// Create public client
const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI!), // Reliable Fuji provider
});

// Explicitly define the Issued event ABI for type safety
const repayedEvent = {
    type: "event",
    name: "Repayed",
    inputs: [
        { indexed: true, name: "tokenId", type: "uint256" },
        { indexed: false, name: "amount", type: "uint256" },
    ],
} as const;

// Extend Transaction type to include requestId
interface ExtendedTransaction extends Transaction {
    tokenId?: Number; // Add tokenId field
    amount?: Number;
}
export class RepayAction {
    constructor(private walletProvider: WalletProvider) {}

    async repay(params: RepayParams): Promise<ExtendedTransaction> {
        const chainName = "avalancheFuji";
        if(!process.env.RENT_LENDING_CONTRACT_ADDRESS||!process.env.AVAL_USDC_CONTRACT_ADDRESS){
            throw new Error("RENT_LENDING_CONTRACT_ADDRESS is not set");
        }
        const rent_lending_contractAddress: `0x${string}` = process.env.RENT_LENDING_CONTRACT_ADDRESS as `0x${string}`;
        const aval_usdc_contract_address: `0x${string}` = process.env.AVAL_USDC_CONTRACT_ADDRESS as `0x${string}`;

        if (rent_lending_contractAddress === "0x00"||aval_usdc_contract_address === "0x00") {
            throw new Error("Contract address is not set");
        }

        console.log(`Get rwa token  Id: ${params.tokenId}`);


        this.walletProvider.switchChain(chainName);
        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const abi = usdcJson;
            const amount = params.amountUsdc;
            const spender = rent_lending_contractAddress;

            const getAvalancheFujiUsdcContractAddr = getContract({
                address: aval_usdc_contract_address,
                abi,
                client: walletClient,
            });

            // Execute the contract's `issue` function
            const txHash = await getAvalancheFujiUsdcContractAddr.write.approve([spender, amount]);
            console.log(`approve transaction hash: ${txHash}`);

            // Wait for the transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log(` mined in block: ${receipt.blockNumber}`);

            const rentLendingContract = getContract({
                address: rent_lending_contractAddress,
                abi: rentLendingJson,
                client: walletClient
            });

            const tokenId = params.tokenId;

            const rentLendingTxHash = await rentLendingContract.write.repay([tokenId]);
            const repayReceipt = await publicClient.waitForTransactionReceipt({ hash: rentLendingTxHash });
            console.log(`repay transaction mined in block: ${repayReceipt.blockNumber}`);


            const decodedEvents = decodeEventLog({
                abi: [repayedEvent],
                data: repayReceipt.logs[0].data,
                topics: repayReceipt.logs[0].topics, // Add topics to the decoded event
            })
            const amountUsdc = decodedEvents.args.amount;

            console.log("repay the USDC is ",amountUsdc)
            
            return {
                hash: rentLendingTxHash,
                from: walletClient.account!.address,
                to: rent_lending_contractAddress,
                value: parseEther("0"),
                data: "0x",
                tokenId: Number(tokenId),
                amount: Number(amountUsdc),
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
        }) as RepayParams;

        try {
            const tx = await action.repay(params);
            callback?.({
                text: `Successfully repaid loan for tokenId: ${params.tokenId} ,and the amount of USDC is ${tx.amount}`,
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
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you call function on contract",
                    action: "REPAY_USDC",
                },
            },
            {
                user: "user",
                content: {
                    text: "I’d like to repay the 4 USDC with token ID 3",
                    action: "USDC_REPAY",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to repay the 4 USDC with token ID 3.",
                    action: "PUT_UP_USDC",
                },
            },
        ],
    ],
    similes: ["REPAY"],
};