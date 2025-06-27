export * from "./providers/wallet.ts";
export * from "./types/index.ts";
export * from "./actions/createWallet.ts";

import type { Plugin } from "@elizaos/core";
import { evmWalletProvider } from "./providers/wallet.ts";
import { getRwaAction } from "./actions/getRwa.ts";
import { lendRwaAction } from "./actions/lendRwa.ts";
import { lendUsdcAction } from "./actions/lendUsdc.ts";
import { repayAction } from "./actions/repay.ts";
import { createWalletAction } from "./actions/createWallet.ts";

export const getRwaPlugin: Plugin = {
    name: "getRwa",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [getRwaAction, lendRwaAction, lendUsdcAction, repayAction, createWalletAction],
};

export default getRwaPlugin;
