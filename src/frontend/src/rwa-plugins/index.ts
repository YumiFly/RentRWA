export * from "./providers/wallet.ts";
export * from "./types/index.ts";

import type { Plugin } from "@elizaos/core";
import { evmWalletProvider } from "./providers/wallet.ts";
import { getRwaAction } from "./actions/getRwa.ts";

export const getRwaPlugin: Plugin = {
    name: "getRwa",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [getRwaAction],
};

export default getRwaPlugin;
