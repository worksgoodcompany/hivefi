import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { generateObject, composeContext, ModelClass } from "@elizaos/core";
import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import type { SwapContent } from "../types/swap";
import { isSwapContent, SwapSchema } from "../types/swap";
import AgniRouterABI from "../abi/AgniRouter.json";

// Agni Router contract address on Mantle
const AGNI_ROUTER_ADDRESS = "0x319B69888b0d11cEC22caA5034e25FfFBDc88421";

// Token addresses on Mantle
const TOKEN_ADDRESSES = {
    MNT: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", // WMNT
    USDT: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
    USDC: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
    WETH: "0xdEaddEaDdeadDEadDEADDEAddEADDEAddead1111",
    WBTC: "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2",
} as const;

// Token decimals
const TOKEN_DECIMALS = {
    MNT: 18,
    USDT: 6,
    USDC: 6,
    WETH: 18,
    WBTC: 8,
} as const;

// Define Mantle chain configuration
const mantleChain = {
    ...mainnet,
    id: 5000,
    name: 'Mantle',
    network: 'mantle',
    nativeCurrency: {
        decimals: 18,
        name: 'MNT',
        symbol: 'MNT',
    },
    rpcUrls: {
        default: { http: ['https://rpc.mantle.xyz'] },
        public: { http: ['https://rpc.mantle.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.mantle.xyz' },
    },
} as const;

// Add ERC20 ABI for approvals
const ERC20_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Add helper functions
async function approveToken(
    client: WalletClient,
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint
): Promise<`0x${string}`> {
    return client.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, amount]
    });
}

export const swap: Action = {
    name: "SWAP_MANTLE",
    description: "Swap tokens using Agni DEX on Mantle network",
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "swap 0.1 MNT for USDT on Mantle",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The swap has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "0.1 MNT swapped for USDT: {hash}",
                },
            },
        ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        initialMessage: Memory,
        initialState?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        const state = initialState
            ? await runtime.updateRecentMessageState(initialState)
            : await runtime.composeState(initialMessage);

        const context = composeContext({
            state,
            template: swapTemplate,
        });

        const content = await generateObject({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
            schema: SwapSchema,
        });

        if (!isSwapContent(content.object)) {
            throw new Error("Invalid swap content");
        }

        const swapContent = content.object;
        const { amount, fromToken, toToken } = swapContent.params;

        // Send initial confirmation
        if (callback) {
            callback({
                text: `The swap of ${amount} ${fromToken} for ${toToken} on Agni DEX has been initiated. You will receive a confirmation once the transaction is complete.`,
            });
        }

        try {
            const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
            if (!privateKey) {
                throw new Error("Wallet not configured. Please set EVM_PRIVATE_KEY.");
            }

            const rpcUrl = runtime.getSetting("EVM_RPC_URL") || "https://rpc.mantle.xyz";
            const account = privateKeyToAccount(privateKey as `0x${string}`);

            const client = createWalletClient({
                account,
                chain: mantleChain,
                transport: http(rpcUrl),
            });

            // Get token addresses and setup
            const tokenIn = TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES];
            const tokenOut = TOKEN_ADDRESSES[toToken as keyof typeof TOKEN_ADDRESSES];
            const decimalsIn = TOKEN_DECIMALS[fromToken as keyof typeof TOKEN_DECIMALS];
            const amountIn = parseUnits(amount.toString(), decimalsIn);
            const path = [tokenIn, tokenOut];
            const to = account.address;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60); // 20 minutes
            const slippage = 0.5; // 0.5%

            // Check if dealing with native MNT
            const isNativeMNTIn = fromToken === 'MNT';
            const isNativeMNTOut = toToken === 'MNT';

            // Get amounts out for slippage calculation
            const amountsOut = await client.readContract({
                address: AGNI_ROUTER_ADDRESS as `0x${string}`,
                abi: AgniRouterABI.abi,
                functionName: 'getAmountsOut',
                args: [amountIn, path]
            });

            const amountOutMin = (amountsOut[1] * BigInt(1000 - Math.floor(slippage * 10))) / BigInt(1000);

            let hash: `0x${string}`;

            if (isNativeMNTIn) {
                // Swapping MNT for tokens
                hash = await client.writeContract({
                    address: AGNI_ROUTER_ADDRESS as `0x${string}`,
                    abi: AgniRouterABI.abi,
                    functionName: 'swapExactMNTForTokens',
                    args: [amountOutMin, path, to, deadline],
                    value: amountIn
                });
            } else if (isNativeMNTOut) {
                // Approve tokens first
                const approvalHash = await approveToken(
                    client,
                    tokenIn,
                    AGNI_ROUTER_ADDRESS,
                    amountIn
                );
                await client.waitForTransactionReceipt({ hash: approvalHash });

                // Swap tokens for MNT
                hash = await client.writeContract({
                    address: AGNI_ROUTER_ADDRESS as `0x${string}`,
                    abi: AgniRouterABI.abi,
                    functionName: 'swapExactTokensForMNT',
                    args: [amountIn, amountOutMin, path, to, deadline]
                });
            } else {
                // Approve tokens first
                const approvalHash = await approveToken(
                    client,
                    tokenIn,
                    AGNI_ROUTER_ADDRESS,
                    amountIn
                );
                await client.waitForTransactionReceipt({ hash: approvalHash });

                // Swap tokens for tokens
                hash = await client.writeContract({
                    address: AGNI_ROUTER_ADDRESS as `0x${string}`,
                    abi: AgniRouterABI.abi,
                    functionName: 'swapExactTokensForTokens',
                    args: [amountIn, amountOutMin, path, to, deadline]
                });
            }

            // Wait for transaction receipt
            await client.waitForTransactionReceipt({ hash });

            if (callback) {
                callback({
                    text: `${amount} ${fromToken} swapped for ${toToken}: ${hash}`,
                    content: { hash }
                });
            }

            return true;
        } catch (error) {
            console.error("Swap failed:", error);
            if (callback) {
                callback({
                    text: error instanceof Error ? error.message : "Unknown error occurred",
                });
            }
            return false;
        }
    },
    similes: [
        "like trading tokens on Agni DEX",
        "like exchanging assets on Mantle",
        "like swapping tokens through Agni",
    ],
};
