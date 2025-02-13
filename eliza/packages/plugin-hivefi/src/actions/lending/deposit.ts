// WIP

import type { Action, Memory } from "@elizaos/core";
import { createPublicClient, http, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { mantleChain } from '../../config/chains';
import { initWalletProvider } from '../../providers/wallet';
import { TOKENS } from '../../config/tokens';
import { INIT_CORE, INIT_CORE_ABI, POOLS, ERC20_ABI, parseAmountAndToken } from './utils';

export const deposit: Action = {
    name: "DEPOSIT_LENDING",
    description: "Deposit tokens into INIT Capital lending pools on Mantle",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Supply 100 USDC to lending pool",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The deposit transaction has been initiated. You will receive a confirmation once complete.",
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
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: mantleChain,
                transport: http("https://rpc.mantle.xyz")
            });

            // Parse the deposit request
            const content = message.content?.text?.toLowerCase();
            if (!content) {
                callback?.({
                    text: "Could not parse deposit request. Please use format: Supply <amount> <token> to lending pool",
                });
                return false;
            }

            // Extract amount and token
            const { amount, tokenSymbol } = parseAmountAndToken(content);

            if (!tokenSymbol || !POOLS[tokenSymbol]) {
                const supportedTokens = Object.keys(POOLS).join(', ');
                callback?.({
                    text: `Invalid token. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            const token = TOKENS[tokenSymbol];
            if (!token || token.type !== 'erc20') {
                callback?.({
                    text: `Token ${tokenSymbol} not configured properly or not an ERC20 token.`,
                });
                return false;
            }

            // Get pool address
            const poolAddress = POOLS[tokenSymbol];
            const userAddress = provider.getAddress() as `0x${string}`;

            // Convert amount using proper decimals
            const amountInWei = parseUnits(amount, token.decimals);

            // Check token balance first
            const balance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [userAddress]
            });

            if (balance < amountInWei) {
                const formattedBalance = formatUnits(balance, token.decimals);
                callback?.({
                    text: `Insufficient ${tokenSymbol} balance. You have ${formattedBalance} ${tokenSymbol}, but trying to deposit ${amount} ${tokenSymbol}`,
                });
                return false;
            }

            // Check allowance and approve if needed
            const allowance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [userAddress, poolAddress]
            });

            if (allowance < amountInWei) {
                try {
                    callback?.({
                        text: `Approving ${tokenSymbol} for pool...`,
                    });

                    const approvalHash = await walletClient.writeContract({
                        address: token.address,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [poolAddress, amountInWei],
                        chain: mantleChain,
                        account: provider.getAccount()
                    });

                    await publicClient.waitForTransactionReceipt({
                        hash: approvalHash
                    });

                    callback?.({
                        text: `${tokenSymbol} approved successfully for pool.`,
                    });
                } catch (error) {
                    console.error('Approval failed:', error);
                    callback?.({
                        text: `Failed to approve ${tokenSymbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    });
                    return false;
                }
            }

            // Send initial confirmation
            callback?.({
                text: `Preparing to deposit ${amount} ${tokenSymbol} to lending pool...`,
            });

            try {
                // First create position
                callback?.({
                    text: "Creating new lending position...",
                });

                const createPosHash = await walletClient.writeContract({
                    address: INIT_CORE,
                    abi: INIT_CORE_ABI,
                    functionName: 'createPos',
                    args: [1, userAddress],
                    chain: mantleChain,
                    account: provider.getAccount()
                });

                const createPosReceipt = await publicClient.waitForTransactionReceipt({
                    hash: createPosHash,
                    confirmations: 2
                });

                // Get position ID from the logs
                if (!createPosReceipt.logs || createPosReceipt.logs.length === 0) {
                    throw new Error('No logs found in create position receipt');
                }

                const positionIdHex = createPosReceipt.logs[0].data;
                // Remove '0x' prefix if present and take last 64 characters
                const cleanHex = positionIdHex.replace('0x', '').slice(-64);
                const positionId = BigInt(`0x${cleanHex}`);
                console.log('Position ID:', positionId.toString());

                // Then transfer tokens
                callback?.({
                    text: `Transferring ${amount} ${tokenSymbol} to pool...`,
                });

                const transferHash = await walletClient.writeContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [poolAddress, amountInWei],
                    chain: mantleChain,
                    account: provider.getAccount()
                });

                await publicClient.waitForTransactionReceipt({ hash: transferHash });

                // Then mint inTokens and collateralize in one transaction
                callback?.({
                    text: "Minting inTokens and adding as collateral...",
                });

                // Prepare multicall data for INIT Core operations
                const mintData = encodeFunctionData({
                    abi: INIT_CORE_ABI,
                    functionName: 'mintTo',
                    args: [poolAddress, userAddress]
                });

                const collateralizeData = encodeFunctionData({
                    abi: INIT_CORE_ABI,
                    functionName: 'collateralize',
                    args: [positionId, poolAddress]
                });

                const finalHash = await walletClient.writeContract({
                    address: INIT_CORE,
                    abi: INIT_CORE_ABI,
                    functionName: 'multicall',
                    args: [[mintData, collateralizeData]],
                    chain: mantleChain,
                    account: provider.getAccount()
                });

                await publicClient.waitForTransactionReceipt({ hash: finalHash });

                callback?.({
                    text: `Successfully completed deposit flow for ${amount} ${tokenSymbol} in position #${positionId}\nView on Explorer: https://explorer.mantle.xyz/tx/${finalHash}`,
                    content: { hash: finalHash },
                });

                return true;
            } catch (error) {
                console.error('Deposit failed:', error);
                callback?.({
                    text: `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure you have sufficient balance and the token is approved.`,
                });
                return false;
            }
        } catch (error) {
            console.error('Deposit failed:', error);
            callback?.({
                text: `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure you have sufficient balance and the token is approved.`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like depositing assets into a savings account",
        "like providing liquidity to earn interest",
        "like supplying tokens to a lending pool",
    ],
};
