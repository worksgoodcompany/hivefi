import type { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./providers/coingecko";
import { defiLlamaProvider } from "./providers/defillama";
import { walletProvider } from "./providers/wallet";
import { transfer } from "./actions/transfer";
import { erc20Transfer } from "./actions/erc20Transfer";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Mantle DeFi Agent Swarm",
    actions: [
        transfer,
        erc20Transfer
    ],
    evaluators: [],
    providers: [
        coinGeckoProvider,
        defiLlamaProvider,
        walletProvider
    ]
};

export default hivefiPlugin;

