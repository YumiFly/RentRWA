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
const issuedEvent = {
    type: "event",
    name: "Issued",
    inputs: [
        { indexed: false, name: "to", type: "address" },
        { indexed: false, name: "requestId", type: "bytes32" },
    ],
} as const;

// Extend Transaction type to include requestId
interface ExtendedTransaction extends Transaction {
    tokenId?: Number; // Add tokenId field
    amount?: Number;
}

type FractionalizedNft = {
    to: string;
    rwaKey: string;
    amount: bigint;
    deadline: bigint;
    proof: string;
    tokenId:bigint;
  };
/**
 * Class representing the GetRwaAction.
 */
export class GetRwaAction {
    constructor(private walletProvider: WalletProvider) {}

    /**
     * Sends a rwa request to the smart contract.
     * @param {GetRwaParams} params - The parameters for the rwa request.
     * @returns {Promise<ExtendedTransaction>} The transaction details.
     */
    async getRwa(params: GetRwaParams): Promise<ExtendedTransaction> {
        const chainName = "avalancheFuji";

        if(!process.env.RENT_ISSUE_CONTRACT_ADDRESS){
            throw new Error("RENT_ISSUE_CONTRACT_ADDRESS is not set");
        }
        const contractAddress: `0x${string}` = process.env.RENT_ISSUE_CONTRACT_ADDRESS as `0x${string}`;

        if (contractAddress === "0x00") {
            throw new Error("Contract address is not set");
        }

        console.log(`Get rwa with Id: ${params.rwaKey} and address (${params.address})`);

        this.walletProvider.switchChain(chainName);

        const walletClient = this.walletProvider.getWalletClient(chainName);

        try {
            const abi = getRwaJson;
            const args: string[] = [params.rwaKey];
            const userAddr = params.address;

            const getRentIssuerContract = getContract({
                address: contractAddress,
                abi,
                client: walletClient,
            });

            // Execute the contract's `issue` function
            const txHash = await getRentIssuerContract.write.issue([userAddr, args]);
            console.log(`Issue transaction hash: ${txHash}`);

            // Wait for the transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log(`Transaction mined in block: ${receipt.blockNumber}`);

            // Poll for the Issued event
            async function waitForIssuedEvent(address: string, startBlock: bigint): Promise<string | undefined> {
                const maxAttempts = 10; // Poll for ~90 seconds (30 * 3s)
                // Initial delay to allow blockchain to advance
                for (let i = 0; i < maxAttempts; i++) {
                    const currentBlock = await publicClient.getBlockNumber();
                    const toBlock = currentBlock >= startBlock ? currentBlock : startBlock;
                  
                    let logs;
                    try {
                      logs = await publicClient.getLogs({
                        address: contractAddress,
                        event: issuedEvent,
                        fromBlock: startBlock,
                        toBlock,
                      });
                    } catch (error) {
                      console.error(`Error fetching logs (attempt ${i + 1}):`, error);
                      continue;
                    }
                  
                    console.log(`Fetched ${logs.length} logs`);
                  
                    for (const log of logs) {
                      try {
                        const decoded = decodeEventLog({
                          abi: [issuedEvent],
                          data: log.data,
                          topics: log.topics,
                        });
                  
                        if (
                          decoded.args &&
                          "to" in decoded.args &&
                          (decoded.args.to as string).toLowerCase() === address.toLowerCase()
                        ) {
                          console.log("✅ Found Issued event. Request ID:", decoded.args.requestId);
                          return decoded.args.requestId as string;
                        }
                      } catch (e) {
                        console.warn("Failed to decode log:", e);
                      }
                    }
                  
                    console.log(`⏳ Waiting for Issued event (attempt ${i + 1}/${maxAttempts})...`);
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                  }
            
            }

            // Start polling
            const requestId = await waitForIssuedEvent(userAddr, receipt.blockNumber);

            let mintTokenHash;
            let tokenId
            let amount
            if (requestId!==undefined){
                // mint token
                mintTokenHash = await getRentIssuerContract.write.RentTokenMint([requestId]);
                console.log(`Mint token transaction hash: ${mintTokenHash}`);

                await publicClient.waitForTransactionReceipt({ hash: mintTokenHash });

                const result = await publicClient.readContract({
                    address: contractAddress,
                    abi,
                    functionName: 's_issuesInProgress',
                    args: [requestId],
                  });
                  
                  console.log('📦 Chain data:', result);

                  const resultArr = result as unknown as [
                    string, string, bigint, bigint, string, bigint
                  ];
                  
                  const fractionalized: FractionalizedNft = {
                    to: resultArr[0],
                    rwaKey: resultArr[1],
                    amount: resultArr[2],
                    deadline: resultArr[3],
                    proof: resultArr[4],
                    tokenId: resultArr[5],
                  };
                  
                  console.log("📥 to:", fractionalized.to);
                  console.log("🆔 tokenId:", fractionalized.tokenId);

                  tokenId = Number(fractionalized.tokenId);
                  amount = Number(fractionalized.amount);
            }

            return {
                hash: mintTokenHash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
                tokenId,
                amount
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

    console.log("Generated context for AI model:", context);

    try {
        const response = await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });

        console.log("Raw AI model response:", response);

        if (!response || typeof response !== "object" || !("rwaKey" in response) || !("address" in response)) {
            throw new Error("Invalid GetRwaParams response from AI model");
        }

        const functionCallDetails = response as GetRwaParams;

        if (!functionCallDetails.rwaKey || typeof functionCallDetails.rwaKey !== "string") {
            throw new Error("Invalid or missing rwaKey in response");
        }
        if (!functionCallDetails.address || !functionCallDetails.address.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error("Invalid or missing address in response");
        }

        console.log("Parsed GetRwaParams:", functionCallDetails);

        return functionCallDetails;
    } catch (error) {
        console.error("Error in buildFunctionCallDetails:", error);
        console.error("Context sent to model:", context);
        throw error;
    }
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
        //Prefer twitterUserName as xid if available, otherwise fallback to xid
        const xid = (state as any).twitterUserName;
        if (xid) {
            try {
                await walletProvider.switchAccountByXid(xid);
                console.log(`🔑 Switched wallet account for xid: ${xid}`);
            } catch (e) {
                console.error(`⚠️ Failed to switch account by xid ${xid}:`, e);
            }
        }
        const action = new GetRwaAction(walletProvider);

        try {
            const rwaParams: GetRwaParams = await buildFunctionCallDetails(state, runtime, walletProvider);
            const callFunctionResp = await action.getRwa(rwaParams);
            if (callback) {
                callback({
                    text: `Successfully called function with params of rwa key: ${rwaParams.rwaKey} and address: ${rwaParams.address}\n 📥 Transaction Hash: ${callFunctionResp.hash}\n 🆔 RWA TokenId: ${callFunctionResp.tokenId} \n  📦 RWA Token amount: ${callFunctionResp.amount} \n`,
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
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error get rwa calling: ${error.message}`,
                        content: { error: error.message },
                    });
                }
            } else {
                console.error("Unknown error");
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
                    text: "Give me the rwa token to address 0x1234567890123456789012345678901234567890, key for rwa is 1010",
                    action: "RWA_GIVE",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can I get the rwa token to address 0x1234567890123456789012345678901234567890, my rwa key is 898770",
                    action: "SEND_RWA",
                },
            },
            {
                user: "user",
                content: {
                    text: "I have a real-world asset ready for tokenization. My wallet: 0x…abcd. RWA Key: XXXX. Can you help me make it blockchain-worthy? ",
                    action: "TOKEN_RWA",
                },
            },
            {
                user: "user",
                content: {
                    text: "I’d like to mint an RWA token. Wallet: 0x…de3. RWA Key: Nbbu…1Z4Z4. Let’s digitize reality.",
                    action: "RWA_TOKEN",
                },
            },
        ],
    ],
    similes: ["GET_RWA", "RWA_GIVE", "SEND_RWA","TOKEN_RWA","RWA_TOKEN"],
};