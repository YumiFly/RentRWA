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
import type { LendUsdcParams, Transaction } from "../types/index.ts";
import { lendUsdcTemplate } from "../templates/index.ts";
import rentLendingJson from "../artifacts/RentLending.json" with { type: "json" };
import usdcJson from "../artifacts/FiatTokenProxy.json" with { type: "json" };

import { createPublicClient, http} from "viem";
import { keccak256, toBytes, decodeEventLog } from "viem";
import { avalancheFuji } from "viem/chains";
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
const lendUsdcEvent = {
    type: "event",
    name: "LendUSDC",
    inputs: [
        {indexed:true, name:"tokenId",type:"uint256"},
        { indexed: false, name: "amount", type: "uint256" },
    ],
} as const;

// Extend Transaction type to include requestId
interface ExtendedTransaction extends Transaction {
    tokenId?: Number; // Add tokenId field
    amountUsdc?: Number;
}

export class LendUsdcAction {
    constructor(private walletProvider: WalletProvider) {}

    async lendUsdc(params: LendUsdcParams): Promise<ExtendedTransaction> {
        const chainName = "avalancheFuji";
        if(!process.env.RENT_LENDING_CONTRACT_ADDRESS||!process.env.AVAL_USDC_CONTRACT_ADDRESS){
            throw new Error("RENT_LENDING_CONTRACT_ADDRESS is not set");
        }
        const rent_lending_contractAddress: `0x${string}` = process.env.RENT_LENDING_CONTRACT_ADDRESS as `0x${string}`;
        const aval_usdc_contract_address: `0x${string}` = process.env.AVAL_USDC_CONTRACT_ADDRESS as `0x${string}`;

        if (rent_lending_contractAddress === "0x00"||aval_usdc_contract_address === "0x00") {
            throw new Error("Contract address is not set");
        }

        console.log(`Get rwa token  Id: ${params.tokenId} and lend usdc amount (${params.amountUsdc}) `);


        this.walletProvider.switchChain(chainName);
        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const abi = usdcJson;
            const amount = BigInt(params.amountUsdc); 
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

            const getRentLendingContractAddr = getContract({
                address: rent_lending_contractAddress,
                abi: rentLendingJson,
                client: walletClient,
            });

            const lendUsdcTxHash = await getRentLendingContractAddr.write.lendUSDC([BigInt(params.tokenId), amount]);
            console.log(`lendUsdc transaction hash: ${lendUsdcTxHash}`);
            // Wait for the transaction receipt
            const lendUsdcReceipt = await publicClient.waitForTransactionReceipt({ hash: lendUsdcTxHash });
            console.log(` mined in block: ${lendUsdcReceipt.blockNumber}`);

            const decodedEvents = decodeEventLog({
                abi: [lendUsdcEvent],
                data: lendUsdcReceipt.logs[0].data,
                topics: lendUsdcReceipt.logs[0].topics, // Add topics to the decoded event
            })
            const amountUsdc = decodedEvents.args.amount;
            
            return {
                hash:lendUsdcTxHash,
                from: walletClient.account!.address,
                to: rent_lending_contractAddress,
                value: parseEther("0"),
                data: "0x",
                tokenId: params.tokenId,
                amountUsdc: Number(amountUsdc),
            };
        } catch (error) {
            throw new Error(`Lend USDC call failed: ${error instanceof Error ? error.message : "unknown error"}`);
        }
    }
}

const buildFunctionCallDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<LendUsdcParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: lendUsdcTemplate,
    });

    const functionCallDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as LendUsdcParams;

    return functionCallDetails;
};


export const lendUsdcAction: Action = {
    name: "lend usdc",
    description: "Given a tokenId and amountUsdc, lend USDC to get RWA tokens",
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

         // Prefer twitterUserName as xid if available, otherwise fallback to xid
        const xid = (state as any).twitterUserName;
        if (xid) {
            try {
                await walletProvider.switchAccountByXid(xid);
                console.log(`🔑 Switched wallet account for xid: ${xid}`);
            } catch (e) {
                console.error(`⚠️ Failed to switch account by xid ${xid}:`, e);
            }
        }
        const action = new LendUsdcAction(walletProvider);

        const lendRwaParams: LendUsdcParams = await buildFunctionCallDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const callFunctionResp = await action.lendUsdc(lendRwaParams);
            if (callback) {
                callback({
                    text: `Successfully called lendUsdc with tokenId ${callFunctionResp.tokenId} \n the amount of USDC to approve:${callFunctionResp.amountUsdc}`,
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
            console.error("Error during lendUsdc call:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error lendUsdc calling: ${error.message}`,
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
                    action: "LEND_USDC",
                },
            },
            {
                user: "user",
                content: {
                    text: "I'd like to use 2 USDC to buy the RWA token with ID 13",
                    action: "LEND_USDC",
                },
            },
            {
                user: "user",
                content: {
                    text: "I’d like to use 4 USDC to buy the RWA token with ID 3",
                    action: "USDC_LEND",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to purchase the RWA token with token ID 1 using 5 USDC.",
                    action: "PUT_UP_USDC",
                },
            },
            {
                user: "user",
                content: {
                    text: "Go ahead ! Token #1234 is good to go — lend out XXX USDC. Let’s support. That’s what RWA is for. 💖",
                    action: "APPROVE_USDC",
                },
            },
            {
                user: "user",
                content: {
                    text: " here — I’m greenlighting the USDC loan. Token ID: 1234, amount: XXX. send it over to trust . 🤝",
                    action: "USDC_APPROVE",
                },
            }
        ],
    ],
    similes: ["LEND_USDC","USDC_LEND","PUT_UP_USDC","APPROVE_USDC","USDC_APPROVE","BUY_RWA","PURCHASE_RWA","USE_USDC","PAY_USDC"],
};