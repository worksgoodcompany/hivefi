import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    createPublicClient,
    http,
    type Address,
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import { TOKENS, getTokenBySymbol, isERC20Token, type TokenConfig } from "../config/tokens";
import AgniRouterABI from "../abi/AgniRouter.json";

// Agni Router contract address on Mantle
const AGNI_ROUTER_ADDRESS = "0x319B69888b0d11cEC22caA5034e25FfFBDc88421" as const;

// ERC20 ABI for approvals
const ERC20_ABI = [{
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
}] as const;

export const swap: Action = {
    name: "SWAP_MANTLE",
    description: "Swap tokens using Agni DEX on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Swap 0.1 MNT for USDT",
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
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Parse the swap request
            const content = message.content?.text?.match(
                /swap ([\d.]+) ([A-Za-z]+) (?:for|to) ([A-Za-z]+)/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse swap details. Please use format: Swap <amount> <fromToken> for <toToken>",
                });
                return false;
            }

            const amount = content[1];
            const fromTokenSymbol = content[2].toUpperCase();
            const toTokenSymbol = content[3].toUpperCase();

            // Get token configs and validate
            const fromToken = getTokenBySymbol(fromTokenSymbol);
            const toToken = getTokenBySymbol(toTokenSymbol);

            if (!fromToken || !toToken) {
                const supportedTokens = Object.keys(TOKENS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Mantle wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The swap of ${amount} ${fromTokenSymbol} for ${toTokenSymbol} on Agni DEX has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: mantleChain,
                transport: http("https://rpc.mantle.xyz")
            });

            // Setup swap parameters
            const wmnt = TOKENS.WMNT;
            if (!isERC20Token(wmnt)) throw new Error("WMNT token not found");

            // Check if dealing with native MNT
            const isNativeMNTIn = fromToken.type === 'native';
            const isNativeMNTOut = toToken.type === 'native';

            // Get token addresses
            const fromTokenAddress = isERC20Token(fromToken) ? fromToken.address : wmnt.address;
            const toTokenAddress = isERC20Token(toToken) ? toToken.address : wmnt.address;

            // Setup swap path
            let path: Address[];

            // Check if both tokens are stablecoins (USDC/USDT)
            const isStablecoinSwap =
                (fromTokenSymbol === 'USDC' || fromTokenSymbol === 'USDT') &&
                (toTokenSymbol === 'USDC' || toTokenSymbol === 'USDT');

            if (isStablecoinSwap) {
                // Direct path for stablecoin pairs
                path = [fromTokenAddress, toTokenAddress];
            } else if (isNativeMNTIn) {
                // If swapping from native MNT, try direct path first
                path = [wmnt.address, toTokenAddress];

                // For other tokens, try routing through WMNT
                if (toTokenSymbol !== 'USDC' && toTokenSymbol !== 'USDT') {
                    const meth = TOKENS.METH;
                    if (isERC20Token(meth)) {
                        path = [wmnt.address, meth.address, toTokenAddress];
                    }
                }
            } else if (isNativeMNTOut) {
                // If swapping to native MNT, try direct path first
                path = [fromTokenAddress, wmnt.address];

                // For other tokens, try routing through WMNT
                if (fromTokenSymbol !== 'USDC' && fromTokenSymbol !== 'USDT') {
                    const meth = TOKENS.METH;
                    if (isERC20Token(meth)) {
                        path = [fromTokenAddress, meth.address, wmnt.address];
                    }
                }
            } else {
                // For non-stablecoin pairs, try routing through WMNT
                path = [fromTokenAddress, wmnt.address, toTokenAddress];
            }

            const to = provider.getAddress() as Address;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60); // 20 minutes
            const slippage = 0.5; // 0.5%

            // Parse amount with correct decimals
            const decimals = fromToken.decimals;
            const amountIn = parseUnits(amount, decimals);

            let amountOutMin: bigint;
            try {
                // Get amounts out for slippage calculation
                const amountsOut = await publicClient.readContract({
                    address: AGNI_ROUTER_ADDRESS as Address,
                    abi: AgniRouterABI.abi,
                    functionName: 'getAmountsOut',
                    args: [amountIn, path]
                }) as bigint[];

                amountOutMin = (amountsOut[amountsOut.length - 1] * BigInt(1000 - Math.floor(slippage * 10))) / BigInt(1000);
            } catch (error) {
                console.error("Failed to get amounts out:", error);
                callback?.({
                    text: "Failed to calculate swap amounts. This pair might not have enough liquidity. Try a different token pair or amount.",
                });
                return false;
            }

            let hash: `0x${string}`;
            const account = provider.getAccount();

            try {
                if (isNativeMNTIn) {
                    // Swapping MNT for tokens
                    hash = await walletClient.writeContract({
                        address: AGNI_ROUTER_ADDRESS as Address,
                        abi: AgniRouterABI.abi,
                        functionName: 'swapExactMNTForTokens',
                        args: [amountOutMin, path, to, deadline],
                        value: amountIn,
                        chain: mantleChain,
                        account
                    });
                } else if (isNativeMNTOut) {
                    // Approve tokens first if swapping to MNT
                    const approvalHash = await walletClient.writeContract({
                        address: fromTokenAddress,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [AGNI_ROUTER_ADDRESS as Address, amountIn],
                        chain: mantleChain,
                        account
                    });

                    // Wait for approval
                    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

                    // Swap tokens for MNT
                    hash = await walletClient.writeContract({
                        address: AGNI_ROUTER_ADDRESS as Address,
                        abi: AgniRouterABI.abi,
                        functionName: 'swapExactTokensForMNT',
                        args: [amountIn, amountOutMin, path, to, deadline],
                        chain: mantleChain,
                        account
                    });
                } else {
                    // Approve tokens first for token-to-token swap
                    const approvalHash = await walletClient.writeContract({
                        address: fromTokenAddress,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [AGNI_ROUTER_ADDRESS as Address, amountIn],
                        chain: mantleChain,
                        account
                    });

                    // Wait for approval
                    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

                    // Swap tokens for tokens
                    hash = await walletClient.writeContract({
                        address: AGNI_ROUTER_ADDRESS as Address,
                        abi: AgniRouterABI.abi,
                        functionName: 'swapExactTokensForTokens',
                        args: [amountIn, amountOutMin, path, to, deadline],
                        chain: mantleChain,
                        account
                    });
                }

                // Wait for swap transaction
                await publicClient.waitForTransactionReceipt({ hash });

                callback?.({
                    text: `${amount} ${fromTokenSymbol} swapped for ${toTokenSymbol}\nTransaction Hash: ${hash}\nView on Explorer: https://explorer.mantle.xyz/tx/${hash}`,
                    content: { hash },
                });
                return true;
            } catch (error) {
                console.error("Failed to execute swap:", error);
                callback?.({
                    text: `Failed to execute swap: ${error instanceof Error ? error.message : 'Unknown error'}. This might be due to insufficient balance, slippage, or liquidity issues.`,
                });
                return false;
            }
        } catch (error) {
            console.error("Failed to swap tokens on Mantle:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            callback?.({
                text: `Failed to swap tokens: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your wallet has sufficient balance and is properly configured.`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like trading tokens on Agni DEX",
        "like exchanging assets on Mantle",
        "like swapping tokens through Agni",
    ],
};
