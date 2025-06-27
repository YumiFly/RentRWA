import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { CreateWalletParams, CreateWalletResult } from "../types/index.ts";
import { createWalletTemplate } from "../templates/index.ts";
import { createClient } from "@supabase/supabase-js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export class CreateWalletAction {
    constructor(private walletProvider: WalletProvider) {}

    async createWallet(params: CreateWalletParams, runtime: IAgentRuntime): Promise<CreateWalletResult> {
        try {
            // Get Supabase credentials from runtime settings
            const supabaseUrl = runtime.getSetting("SUPABASE_URL");
            const supabaseAnonKey = runtime.getSetting("SUPABASE_ANON_KEY");

            if (!supabaseUrl || !supabaseAnonKey) {
                throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured");
            }

            // Create Supabase client
            const supabase = createClient(supabaseUrl, supabaseAnonKey);

            // Check if wallet already exists for this xid
            const { data: existingWallet, error: checkError } = await supabase
                .from("wallet_shadow")
                .select("xid, private_key")
                .eq("xid", params.xid)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw new Error(`Error checking existing wallet: ${checkError.message}`);
            }

            if (existingWallet) {
                // Wallet already exists, return the existing address
                const account = privateKeyToAccount(existingWallet.private_key as `0x${string}`);
                elizaLogger.info(`Wallet already exists for xid: ${params.xid}, address: ${account.address}`);
                
                return {
                    xid: params.xid,
                    address: account.address,
                    success: true,
                    message: `Wallet already exists for user ${params.xid}. Address: ${account.address}`
                };
            }

            // Generate new wallet
            const privateKey = generatePrivateKey();
            const account = privateKeyToAccount(privateKey);

            elizaLogger.info(`Generated new wallet for xid: ${params.xid}, address: ${account.address}`);

            // Store in Supabase
            const { error: insertError } = await supabase
                .from("wallet_shadow")
                .insert({
                    xid: params.xid,
                    private_key: privateKey,
                    public_key: account.address,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                throw new Error(`Error storing wallet in database: ${insertError.message}`);
            }

            elizaLogger.info(`Successfully stored wallet for xid: ${params.xid} in database`);

            return {
                xid: params.xid,
                address: account.address,
                success: true,
                message: `New wallet created successfully for user ${params.xid}. Address: ${account.address}`
            };

        } catch (error) {
            elizaLogger.error(`Create wallet failed for xid ${params.xid}:`, error);
            return {
                xid: params.xid,
                address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
                success: false,
                message: `Failed to create wallet: ${error instanceof Error ? error.message : "unknown error"}`
            };
        }
    }
}

const buildFunctionCallDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<CreateWalletParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    // Get xid from Twitter context
    const xid = (state as any).twitterUserName || (state as any).xid;
    
    if (!xid) {
        throw new Error("Cannot determine user identifier (xid) from context");
    }

    const context = composeContext({
        state: {
            ...state,
            xid: xid
        },
        template: createWalletTemplate,
    });

    const functionCallDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as CreateWalletParams;

    // Ensure xid is set from context if not extracted by AI
    if (!functionCallDetails.xid && xid) {
        functionCallDetails.xid = xid;
    }

    return functionCallDetails;
};

export const createWalletAction: Action = {
    name: "create wallet",
    description: "Create a new wallet for RWA operations, generating address and private key, storing in Supabase",
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

        elizaLogger.info("Create wallet action handler called");
        const walletProvider = await initWalletProvider(runtime);

        const action = new CreateWalletAction(walletProvider);

        try {
            const createWalletParams: CreateWalletParams = await buildFunctionCallDetails(
                state,
                runtime,
                walletProvider
            );

            elizaLogger.info(`Creating wallet for xid: ${createWalletParams.xid}`);

            const result = await action.createWallet(createWalletParams, runtime);

            if (callback) {
                if (result.success) {
                    callback({
                        text: result.message || `Successfully created wallet for ${result.xid}. Your wallet address is: ${result.address}`,
                        content: {
                            success: true,
                            xid: result.xid,
                            address: result.address,
                            action: "CREATE_WALLET"
                        },
                    });
                } else {
                    callback({
                        text: result.message || `Failed to create wallet for ${result.xid}`,
                        content: {
                            success: false,
                            error: result.message,
                            action: "CREATE_WALLET"
                        },
                    });
                }
            }
            return result.success;
        } catch (error) {
            elizaLogger.error("Error during create wallet:", error);
            if (callback) {
                callback({
                    text: `Error creating wallet: ${error instanceof Error ? error.message : "unknown error"}`,
                    content: { 
                        success: false,
                        error: error instanceof Error ? error.message : "unknown error",
                        action: "CREATE_WALLET"
                    },
                });
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const supabaseUrl = runtime.getSetting("SUPABASE_URL");
        const supabaseAnonKey = runtime.getSetting("SUPABASE_ANON_KEY");
        return !!(supabaseUrl && supabaseAnonKey);
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you create a new wallet for RWA operations",
                    action: "CREATE_WALLET",
                },
            },
            {
                user: "user",
                content: {
                    text: "I need a new wallet for RWA operations",
                    action: "CREATE_WALLET",
                },
            },
            {
                user: "user",
                content: {
                    text: "Create a wallet for me",
                    action: "NEW_WALLET",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to set up a new wallet",
                    action: "SETUP_WALLET",
                },
            },
            {
                user: "user",
                content: {
                    text: "Generate a new wallet address",
                    action: "GENERATE_WALLET",
                },
            },
            {
                user: "user",
                content: {
                    text: "I need a wallet to start using RWA",
                    action: "WALLET_SETUP",
                },
            }
        ],
    ],
    similes: ["CREATE_WALLET", "NEW_WALLET", "SETUP_WALLET", "GENERATE_WALLET", "WALLET_SETUP", "MAKE_WALLET"],
};
