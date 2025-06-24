import { Character, Clients, defaultCharacter, ModelProviderName } from "@elizaos/core";
import getRwaPlugin from "./rwa-plugins/index.ts";

export const character: Character = {
  ...defaultCharacter,
  // name: "Eliza",
  plugins: [getRwaPlugin],
  clients: [], // [Clients.TWITTER]
  modelProvider: ModelProviderName.GOOGLE,
  settings: {
    secrets: {},
    voice: {
      model: "en_US-hfc_female-medium",
    },
    chains: {
      evm: ["avalancheFuji"],
    },
  },
};
