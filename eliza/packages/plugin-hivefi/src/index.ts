import { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./providers/coingecko";
import { defiLlamaProvider } from "./providers/defillama";
import { agniProvider } from "./providers/agni";
import { izumiProvider } from "./providers/izumi";
import { initializeWalletProvider } from "./providers/wallet";
import { transfer } from "./actions/transfer";
import { erc20Transfer } from "./actions/erc20Transfer";
import { swap } from "./actions/swap";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Mantle DeFi Agent Swarm",
    actions: [transfer, erc20Transfer, swap],
    evaluators: [],
    providers: (runtime) => [
        coinGeckoProvider,
        defiLlamaProvider,
        agniProvider,
        izumiProvider,
        initializeWalletProvider(runtime)
    ],
};

export default hivefiPlugin;

