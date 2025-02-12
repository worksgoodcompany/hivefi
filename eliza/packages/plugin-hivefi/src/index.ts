import { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./providers/coingecko";
import { defiLlamaProvider } from "./providers/defillama";
import { agniProvider } from "./providers/agni";
import { izumiProvider } from "./providers/izumi";
import { initializeWalletProvider } from "./providers/wallet";
import { transfer } from "./actions/transfer";
import { erc20Transfer } from "./actions/erc20Transfer";
import { swap } from "./actions/swap";

// Initialize wallet provider with default settings
// It will be re-initialized with proper runtime settings when loaded
const defaultWalletProvider = initializeWalletProvider({ settings: {} });

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Mantle DeFi Agent Swarm",
    actions: [transfer, erc20Transfer, swap],
    evaluators: [],
    providers: [
        coinGeckoProvider,
        defiLlamaProvider,
        agniProvider,
        izumiProvider,
        defaultWalletProvider
    ]
};

export default hivefiPlugin;

