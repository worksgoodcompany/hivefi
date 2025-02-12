import {
    createPublicClient,
    createWalletClient,
    http,
    formatEther,
    type PublicClient,
    type WalletClient,
    type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';

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
} as const satisfies Chain;

export function getWalletClient(runtime: {
    settings: Record<string, string>;
}) {
    const privateKey = runtime.settings.EVM_PRIVATE_KEY;
    if (!privateKey) return null;

    const rpcUrl = runtime.settings.EVM_RPC_URL || "https://rpc.mantle.xyz";
    if (!rpcUrl) return null;

    const publicClient = createPublicClient({
        chain: mantleChain,
        transport: http(rpcUrl),
    });

    const account = privateKeyToAccount(privateKey as `0x${string}`);

    return {
        publicClient,
        account,
        getAddress: () => account.address,
        getBalance: async (address?: string) => {
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
        getTokenBalance: async (tokenAddress: string, address?: string) => {
            try {
                const balance = await publicClient.readContract({
                    address: tokenAddress as `0x${string}`,
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
}

export function getWalletProvider(
    walletClient: ReturnType<typeof getWalletClient>
): Provider {
    return {
        async get(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
            if (!walletClient) {
                return "Mantle wallet not configured. Please set EVM_PRIVATE_KEY and EVM_RPC_URL.";
            }

            try {
                const address = walletClient.getAddress();
                const balance = await walletClient.getBalance();

                return [
                    'Mantle Wallet Information:',
                    `Address: ${address}`,
                    `Balance: ${balance} MNT`,
                ].join('\n');
            } catch (error) {
                console.error("Error in Mantle wallet provider:", error);
                return `Error fetching wallet information: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    };
}

// Initialize the wallet provider
export function initializeWalletProvider(runtime: { settings: Record<string, string> }) {
    const walletClient = getWalletClient(runtime);
    return getWalletProvider(walletClient);
}
