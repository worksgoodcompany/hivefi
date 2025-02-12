import type { Action, Memory } from "@elizaos/core";
import { formatEther, formatUnits, createPublicClient, http } from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import { TOKENS, getERC20Tokens } from "../config/tokens";
import axios from 'axios';

// ABI for ERC20 balanceOf
const ERC20_BALANCE_ABI = [{
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
}] as const;

// CoinGecko IDs mapping
const COINGECKO_IDS = {
    MNT: 'mantle',
    USDT: 'tether',
    USDC: 'usd-coin',
    WETH: 'weth',
    WMNT: 'wrapped-mantle',
    WBTC: 'wrapped-bitcoin',
    AGNI: 'agni-finance'
} as const;

interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    usdPrice: number;
    usdValue: number;
}

export const portfolio: Action = {
    name: "SHOW_PORTFOLIO",
    description: "Show your Mantle wallet portfolio with token balances and USD values",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Show my portfolio",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Here's your current portfolio on Mantle:\n\nMNT: 10.5 ($21.00)\nUSDC: 100 ($100.00)\nTotal Value: $121.00",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Mantle wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const address = provider.getAddress() as `0x${string}`;

            // Create a public client for reading data
            const publicClient = createPublicClient({
                chain: mantleChain,
                transport: http("https://rpc.mantle.xyz")
            });

            // Fetch native MNT balance
            const mntBalance = await publicClient.getBalance({ address });
            const mntBalanceFormatted = formatEther(mntBalance);

            // Fetch token balances
            const tokenBalances: TokenBalance[] = [];

            // Add MNT balance first
            tokenBalances.push({
                symbol: 'MNT',
                name: TOKENS.MNT.name,
                balance: mntBalanceFormatted,
                usdPrice: 0, // Will be updated
                usdValue: 0, // Will be updated
            });

            // Fetch ERC20 token balances
            const erc20Tokens = getERC20Tokens();
            for (const token of erc20Tokens) {
                try {
                    const balance = await publicClient.readContract({
                        address: token.address,
                        abi: ERC20_BALANCE_ABI,
                        functionName: 'balanceOf',
                        args: [address]
                    }) as bigint;

                    const formattedBalance = formatUnits(balance, token.decimals);

                    if (Number(formattedBalance) > 0) {
                        tokenBalances.push({
                            symbol: token.symbol,
                            name: token.name,
                            balance: formattedBalance,
                            usdPrice: 0, // Will be updated
                            usdValue: 0, // Will be updated
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching ${token.symbol} balance:`, error);
                }
            }

            // Fetch prices from CoinGecko
            try {
                const tokens = tokenBalances.map(t => TOKENS[t.symbol].coingeckoId).filter(Boolean);
                const pricesResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                    params: {
                        ids: tokens.join(','),
                        vs_currencies: 'usd'
                    }
                });

                // Update token balances with prices
                for (const token of tokenBalances) {
                    const geckoId = TOKENS[token.symbol].coingeckoId;
                    if (geckoId && pricesResponse.data[geckoId]) {
                        token.usdPrice = pricesResponse.data[geckoId].usd;
                        token.usdValue = Number(token.balance) * token.usdPrice;
                    }
                }
            } catch (error) {
                console.error('Error fetching prices:', error);
            }

            // Calculate total portfolio value
            const totalValue = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0);

            // Format the response
            const lines = [
                'Your Mantle Portfolio:',
                '',
                ...tokenBalances
                    .filter(token => Number(token.balance) > 0)
                    .map(token => {
                        const balanceStr = Number(token.balance).toLocaleString(undefined, {
                            maximumFractionDigits: token.symbol === 'USDT' || token.symbol === 'USDC' ? 2 : 6
                        });
                        const valueStr = token.usdValue.toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'USD'
                        });
                        return `• ${token.symbol} (${token.name}): ${balanceStr} (${valueStr})`;
                    }),
                '',
                `Total Portfolio Value: ${totalValue.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD'
                })}`,
                '',
                `View on Explorer: https://explorer.mantle.xyz/address/${address}`
            ];

            callback?.({
                text: lines.join('\n')
            });
            return true;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            callback?.({
                text: `Error fetching portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like checking your digital wallet's contents",
        "like getting a snapshot of your crypto holdings",
        "like viewing your investment portfolio on Mantle",
    ],
};
