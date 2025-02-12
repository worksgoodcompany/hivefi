import {
    createPublicClient,
    createWalletClient,
    http,
    formatEther,
    type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';

// Define Mantle chain configuration
const mantleChain = {
    id: 5000,
    name: 'Mantle',
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
} as const satisfies Chain;

// Create a public client for read-only operations
const publicClient = createPublicClient({
    chain: mantleChain,
    transport: http("https://rpc.mantle.xyz"),
});

function normalizePrivateKey(rawKey: string): `0x${string}` {
    const trimmedKey = rawKey.trim();
    const keyWithPrefix = !trimmedKey.startsWith('0x') ? `0x${trimmedKey}` : trimmedKey;

    // Ensure it's a valid 32-byte (64 character) private key
    if (!/^0x[a-fA-F0-9]{64}$/.test(keyWithPrefix)) {
        throw new Error('Invalid private key format');
    }
    return keyWithPrefix as `0x${string}`;
}

type WalletClientReturn = {
    walletClient: ReturnType<typeof createWalletClient>;
    account: ReturnType<typeof privateKeyToAccount>;
    getAddress: () => string;
    getBalance: (address?: `0x${string}`) => Promise<string>;
    getTokenBalance: (tokenAddress: `0x${string}`, address?: `0x${string}`) => Promise<string>;
} | null;

export function getWalletClient(runtime: {
    settings: Record<string, string>;
}): WalletClientReturn {
    try {
        const privateKey = runtime.settings?.EVM_PRIVATE_KEY;
        if (!privateKey) {
            console.debug("No EVM_PRIVATE_KEY found in settings");
            return null;
        }

        // Normalize and validate private key
        const normalizedKey = normalizePrivateKey(privateKey);

        const rpcUrl = runtime.settings?.EVM_RPC_URL || "https://rpc.mantle.xyz";
        console.debug("Using RPC URL:", rpcUrl);

        // Create wallet client for transactions
        const account = privateKeyToAccount(normalizedKey);
        const walletClient = createWalletClient({
            account,
            chain: mantleChain,
            transport: http(rpcUrl),
        });

        return {
            walletClient,
            account,
            getAddress: () => account.address,
            getBalance: async (address?: `0x${string}`) => {
                try {
                    const balance = await publicClient.getBalance({
                        address: address || account.address,
                    });
                    return formatEther(balance);
                } catch (error) {
                    console.error("Error fetching Mantle balance:", error);
                    throw error;
                }
            },
            getTokenBalance: async (tokenAddress: `0x${string}`, address?: `0x${string}`) => {
                try {
                    const balance = await publicClient.readContract({
                        address: tokenAddress,
                        abi: [{
                            name: 'balanceOf',
                            type: 'function',
                            stateMutability: 'view',
                            inputs: [{ name: 'account', type: 'address' }],
                            outputs: [{ name: 'balance', type: 'uint256' }],
                        }],
                        functionName: 'balanceOf',
                        args: [address || account.address],
                    });
                    return formatEther(balance as bigint);
                } catch (error) {
                    console.error("Error fetching token balance:", error);
                    throw error;
                }
            }
        };
    } catch (error) {
        console.error("Error initializing wallet client:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        return null;
    }
}

// Helper function to validate and format address
function validateAndFormatAddress(address: string): `0x${string}` | null {
    try {
        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) return null;
        return address.toLowerCase() as `0x${string}`;
    } catch {
        return null;
    }
}

export function getWalletProvider(
    walletClient: ReturnType<typeof getWalletClient>
): Provider {
    return {
        async get(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
            try {
                // Check if there's a specific address in the message
                const addressMatch = message.content?.text?.match(/0x[a-fA-F0-9]{40}/i);
                const requestedAddress = addressMatch ? validateAndFormatAddress(addressMatch[0]) : null;

                if (requestedAddress) {
                    // Public balance check for any address
                    try {
                        const balance = await publicClient.getBalance({ address: requestedAddress });
                        return [
                            'Mantle Address Information:',
                            `Address: ${requestedAddress}`,
                            `Balance: ${formatEther(balance)} MNT`,
                            '',
                            `View on Explorer: https://explorer.mantle.xyz/address/${requestedAddress}`
                        ].join('\n');
                    } catch (error) {
                        console.error("Error fetching balance:", error);
                        return `Error fetching balance for ${requestedAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                }

                // If no specific address requested, show configured wallet info
                if (!walletClient) {
                    return [
                        "Mantle wallet not configured. To view your wallet:",
                        "1. Set EVM_PRIVATE_KEY in your environment variables (64 characters hexadecimal, with or without 0x prefix)",
                        "2. Optionally set EVM_RPC_URL (defaults to https://rpc.mantle.xyz)",
                        "",
                        "You can still check any address balance by providing the address.",
                    ].join('\n');
                }

                const address = walletClient.getAddress();
                const balance = await walletClient.getBalance();

                return [
                    'Mantle Wallet Information:',
                    `Address: ${address}`,
                    `Balance: ${balance} MNT`,
                    '',
                    'Your wallet is properly configured and ready for transactions.',
                    `View on Explorer: https://explorer.mantle.xyz/address/${address}`
                ].join('\n');
            } catch (error) {
                console.error("Error in Mantle wallet provider:", error);
                if (error instanceof Error) {
                    console.error("Error details:", error.message, error.stack);
                }
                return `Error accessing wallet information: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your configuration is correct.`;
            }
        },
    };
}

// Initialize the wallet provider
export function initializeWalletProvider(runtime: IAgentRuntime): Provider {
    try {
        console.debug("Initializing wallet provider...");

        // Get settings from runtime
        const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
        const rpcUrl = runtime.getSetting('EVM_RPC_URL');

        const settings: Record<string, string> = {};
        if (privateKey) settings.EVM_PRIVATE_KEY = privateKey;
        if (rpcUrl) settings.EVM_RPC_URL = rpcUrl;

        console.debug("Wallet provider settings:", {
            hasPrivateKey: !!privateKey,
            rpcUrl: rpcUrl || "https://rpc.mantle.xyz"
        });

        const walletClient = getWalletClient({ settings });
        return getWalletProvider(walletClient);
    } catch (error) {
        console.error("Error initializing wallet provider:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message, error.stack);
        }
        // Return a provider that explains the error
        return {
            async get(): Promise<string> {
                return `Error initializing wallet provider: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your configuration.`;
            }
        };
    }
}
