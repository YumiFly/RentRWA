import { createPublicClient, createWalletClient, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  type IAgentRuntime,
  type Provider,
  type Memory,
  type State,
  type ICacheManager,
  elizaLogger,
} from "@elizaos/core";
import type { Address, WalletClient, PublicClient, Chain, HttpTransport, Account, PrivateKeyAccount } from "viem";
import * as viemChains from "viem/chains";
import NodeCache from "node-cache";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

import type { SupportedChain } from "../types/index.ts";

export class WalletProvider {
  private cache: NodeCache;
  private cacheKey: string = "evm/wallet";
  private currentChain: SupportedChain = "mainnet";
  private CACHE_EXPIRY_SEC = 5;
  chains: Record<string, Chain> = { mainnet: viemChains.mainnet };
  account: PrivateKeyAccount;
  private runtime?: IAgentRuntime;

  constructor(
    accountOrPrivateKey: PrivateKeyAccount | `0x${string}`,
    private cacheManager: ICacheManager,
    chains?: Record<string, Chain>,
    runtime?: IAgentRuntime
  ) {
    if (typeof accountOrPrivateKey === "string") {
      this.account = privateKeyToAccount(accountOrPrivateKey);
    } else {
      this.account = accountOrPrivateKey;
    }
    this.runtime = runtime;
    this.setChains(chains);

    if (chains && Object.keys(chains).length > 0) {
      this.setCurrentChain(Object.keys(chains)[0] as SupportedChain);
    }

    this.cache = new NodeCache({ stdTTL: this.CACHE_EXPIRY_SEC });
  }

  getAddress(): Address {
    return this.account.address;
  }

  getCurrentChain(): Chain {
    return this.chains[this.currentChain];
  }

  getPublicClient(chainName: SupportedChain): PublicClient<HttpTransport, Chain, Account | undefined> {
    const transport = this.createHttpTransport(chainName);

    const publicClient = createPublicClient({
      chain: this.chains[chainName],
      transport,
    });
    return publicClient;
  }

  getWalletClient(chainName: SupportedChain): WalletClient {
    const transport = this.createHttpTransport(chainName);

    const walletClient = createWalletClient({
      chain: this.chains[chainName],
      transport,
      account: this.account,
    });

    return walletClient;
  }

  getChainConfigs(chainName: SupportedChain): Chain {
    const chain = viemChains[chainName];

    if (!chain?.id) {
      throw new Error("Invalid chain name");
    }

    return chain;
  }

  async getWalletBalance(): Promise<string | null> {
    const cacheKey = "walletBalance_" + this.currentChain;
    const cachedData = await this.getCachedData<string>(cacheKey);
    if (cachedData) {
      elizaLogger.log("Returning cached wallet balance for chain: " + this.currentChain);
      return cachedData;
    }

    try {
      const client = this.getPublicClient(this.currentChain);
      const balance = await client.getBalance({
        address: this.account.address,
      });
      const balanceFormatted = formatUnits(balance, 18);
      this.setCachedData<string>(cacheKey, balanceFormatted);
      elizaLogger.log("Wallet balance cached for chain: ", this.currentChain);
      return balanceFormatted;
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return null;
    }
  }

  async getWalletBalanceForChain(chainName: SupportedChain): Promise<string | null> {
    try {
      const client = this.getPublicClient(chainName);
      const balance = await client.getBalance({
        address: this.account.address,
      });
      return formatUnits(balance, 18);
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return null;
    }
  }

  addChain(chain: Record<string, Chain>) {
    this.setChains(chain);
  }

  switchChain(chainName: SupportedChain, customRpcUrl?: string) {
    if (!this.chains[chainName]) {
      const chain = WalletProvider.genChainFromName(chainName, customRpcUrl);
      this.addChain({ [chainName]: chain });
    }
    this.setCurrentChain(chainName);
  }

  /**
   * Dynamically switch the active account by querying Supabase.
   * The `wallet_shadow` table is expected to contain: { xid: string, private_key: text }
   *
   * @param xid - unique identifier of the wallet row (e.g. user id)
   * @throws Error if no record or `private_key` is missing
   */
  async switchAccountByXid(xid: string): Promise<void> {
    if (!this.runtime) {
      throw new Error("Runtime is not available. Cannot access Supabase.");
    }

    // Get Supabase credentials from runtime settings
    const supabaseUrl = this.runtime.getSetting("SUPABASE_URL");
    const supabaseAnonKey = this.runtime.getSetting("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      const { data, error } = await supabase
        .from("wallet_shadow")
        .select("private_key")
        .eq("xid", xid)
        .single();

      if (error || !data?.private_key) {
        throw new Error(
          `Could not load private key for xid=${xid}: ` +
            (error?.message ?? "no record found"),
        );
      }

      if (!data.private_key.startsWith("0x")) {
        throw new Error("Private key must start with 0x");
      }

      // Update runtime account in‑place
      this.setAccount(data.private_key as `0x${string}`);

      elizaLogger.info(`Successfully switched to account for xid: ${xid}`);
      elizaLogger.info(`New wallet address: ${this.getAddress()}`);

    } catch (error) {
      elizaLogger.error(`Error switching account for xid ${xid}:`, error);
      throw error;
    }
  }

  private async readFromCache<T>(key: string): Promise<T | null> {
    const cached = await this.cacheManager.get<T>(path.join(this.cacheKey, key));
    return cached ?? null;
  }

  private async writeToCache<T>(key: string, data: T): Promise<void> {
    await this.cacheManager.set(path.join(this.cacheKey, key), data, {
      expires: Date.now() + this.CACHE_EXPIRY_SEC * 1000,
    });
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    // Check in-memory cache first
    const cachedData = this.cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    // Check file-based cache
    const fileCachedData = await this.readFromCache<T>(key);
    if (fileCachedData) {
      // Populate in-memory cache
      this.cache.set(key, fileCachedData);
      return fileCachedData;
    }

    return null;
  }

  private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
    // Set in-memory cache
    this.cache.set(cacheKey, data);

    // Write to file-based cache
    await this.writeToCache(cacheKey, data);
  }

  private setAccount = (accountOrPrivateKey: PrivateKeyAccount | `0x${string}`) => {
    if (typeof accountOrPrivateKey === "string") {
      this.account = privateKeyToAccount(accountOrPrivateKey);
    } else {
      this.account = accountOrPrivateKey;
    }
  };

  private setChains = (chains?: Record<string, Chain>) => {
    if (!chains) {
      return;
    }
    Object.keys(chains).forEach((chain: string) => {
      this.chains[chain] = chains[chain];
    });
  };

  private setCurrentChain = (chain: SupportedChain) => {
    this.currentChain = chain;
  };

  private createHttpTransport = (chainName: SupportedChain) => {
    const chain = this.chains[chainName];

    if (chain.rpcUrls.custom) {
      return http(chain.rpcUrls.custom.http[0]);
    }
    return http(chain.rpcUrls.default.http[0]);
  };

  static genChainFromName(chainName: string, customRpcUrl?: string | null): Chain {
    const baseChain = viemChains[chainName];

    if (!baseChain?.id) {
      throw new Error("Invalid chain name");
    }

    const viemChain: Chain = customRpcUrl
      ? {
          ...baseChain,
          rpcUrls: {
            ...baseChain.rpcUrls,
            custom: {
              http: [customRpcUrl],
            },
          },
        }
      : baseChain;

    return viemChain;
  }
}

const genChainsFromRuntime = (runtime: IAgentRuntime): Record<string, Chain> => {
  const chainNames = (runtime.character.settings?.chains?.evm as SupportedChain[]) || [];
  const chains = {};

  chainNames.forEach(chainName => {
    const rpcUrl = runtime.getSetting("ETHEREUM_PROVIDER_" + chainName.toUpperCase());
    const chain = WalletProvider.genChainFromName(chainName, rpcUrl);
    chains[chainName] = chain;
  });

  const mainnet_rpcurl = runtime.getSetting("EVM_PROVIDER_URL");
  if (mainnet_rpcurl) {
    const chain = WalletProvider.genChainFromName("mainnet", mainnet_rpcurl);
    chains["mainnet"] = chain;
  }

  return chains;
};

export const initWalletProvider = async (runtime: IAgentRuntime) => {
  const chains = genChainsFromRuntime(runtime);

  const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
  if (!privateKey) {
    throw new Error("EVM_PRIVATE_KEY is missing");
  }

  if (!privateKey.startsWith("0x")) {
    throw new Error("EVM_PRIVATE_KEY must start with 0x");
  }

  return new WalletProvider(privateKey, runtime.cacheManager, chains, runtime);
};

export const evmWalletProvider: Provider = {
  async get(runtime: IAgentRuntime, _message: Memory, state?: State): Promise<string | null> {
    try {
      const walletProvider = await initWalletProvider(runtime);
      const address = walletProvider.getAddress();
      const balance = await walletProvider.getWalletBalance();
      const chain = walletProvider.getCurrentChain();
      const agentName = state?.agentName || "The agent";
      return `${agentName}'s EVM Wallet Address: ${address}\nBalance: ${balance} ${chain.nativeCurrency.symbol}\nChain ID: ${chain.id}, Name: ${chain.name}`;
    } catch (error) {
      console.error("Error in EVM wallet provider:", error);
      return null;
    }
  },
};
