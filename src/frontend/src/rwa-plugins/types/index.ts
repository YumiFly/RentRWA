import * as viemChains from "viem/chains";
import { Hash, Address } from "viem";

const _SupportedChainList = Object.keys(viemChains) as Array<
    keyof typeof viemChains
>;
export type SupportedChain = (typeof _SupportedChainList)[number];

export interface GetRwaParams {
    address: `0x${string}`;
    rwaKey: string;
}

export interface LendRwaParams {
    tokenId: number;
    amountRwa: number;
}

export interface LendUsdcParams {
    tokenId: number;
    amountUsdc: number; // in USDC
}

export interface RepayParams {
    tokenId: number; // in USDC
    amountUsdc: number;
}

export interface CreateWalletParams {
    xid: string;
}

export interface CreateWalletResult {
    xid: string;
    address: `0x${string}`;
    success: boolean;
    message?: string;
}

export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
}