import { Character, Clients, defaultCharacter, ModelProviderName } from "@elizaos/core";
import getRwaPlugin from "./rwa-plugins/index.ts";
import supabaseAdapter from "@elizaos-plugins/adapter-supabase";

export const character: Character = {
  ...defaultCharacter,
  // name: "Eliza",
  plugins: [getRwaPlugin, supabaseAdapter],
  clients: [], // [Clients.TWITTER]
  modelProvider: ModelProviderName.GOOGLE,
  settings: {
    secrets: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    },
    voice: {
      model: "en_US-hfc_female-medium",
    },
    chains: {
      evm: ["avalancheFuji"],
    },
  },
};
