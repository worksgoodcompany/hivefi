import type { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./providers/coingecko";
import { defiLlamaProvider } from "./providers/defillama";
import { agniProvider } from "./providers/agni";
import { izumiProvider } from "./providers/izumi";
import { getWalletProvider } from "./providers/wallet";
import { transfer } from "./actions/transfer";
import { erc20Transfer } from "./actions/erc20Transfer";
import { swap } from "./actions/swap";

// Create a default wallet provider that will show configuration instructions
const defaultWalletProvider = getWalletProvider(null);

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

