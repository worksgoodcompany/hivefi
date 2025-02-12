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
import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { mantleChain } from "../config/chains";

class WalletProvider {
    private account: ReturnType<typeof privateKeyToAccount>;
    private publicClient: PublicClient;
    private walletClient: WalletClient;

    constructor(privateKey: `0x${string}`, rpcUrl: string = "https://rpc.mantle.xyz") {
        this.account = privateKeyToAccount(privateKey);

        this.publicClient = createPublicClient({
            chain: mantleChain,
            transport: http(rpcUrl),
        });

        this.walletClient = createWalletClient({
            account: this.account,
            chain: mantleChain,
            transport: http(rpcUrl),
        });
    }

    getAddress(): string {
        return this.account.address;
    }

    async getBalance(): Promise<string> {
        try {
            const balance = await this.publicClient.getBalance({
                address: this.account.address,
            });
            return formatEther(balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    }

    getWalletClient(): WalletClient {
        return this.walletClient;
    }
}

export function initWalletProvider(runtime: IAgentRuntime): WalletProvider | null {
    try {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        if (!privateKey) {
            console.error("EVM_PRIVATE_KEY is not set");
            return null;
        }

        const normalizedKey = privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`;
        const rpcUrl = runtime.getSetting("EVM_RPC_URL") || "https://rpc.mantle.xyz";

        return new WalletProvider(normalizedKey, rpcUrl);
    } catch (error) {
        console.error("Error initializing wallet provider:", error);
        return null;
    }
}

// Create a public client for read-only operations
const publicClient = createPublicClient({
    chain: mantleChain,
    transport: http("https://rpc.mantle.xyz"),
});

// Export the provider for use in the plugin
export const walletProvider: Provider = {
    async get(runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
        try {
            // Check if there's a specific address in the message
            const addressMatch = message.content?.text?.match(/0x[a-fA-F0-9]{40}/i);
            if (addressMatch) {
                const address = addressMatch[0].toLowerCase() as `0x${string}`;
                try {
                    const balance = await publicClient.getBalance({ address });
                    return [
                        'Mantle Address Information:',
                        `Address: ${address}`,
                        `Balance: ${formatEther(balance)} MNT`,
                        '',
                        `View on Explorer: https://explorer.mantle.xyz/address/${address}`
                    ].join('\n');
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    return `Error fetching balance for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            }

            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                return [
                    "It seems like there is still an issue with accessing your Mantle wallet details. Please ensure the following configurations are set correctly:",
                    "",
                    "1.",
                    "EVM_PRIVATE_KEY: This should be a 64-character hexadecimal string set in your environment variables. It's crucial for wallet access.",
                    "",
                    "2.",
                    "EVM_RPC_URL: This should be set to https://rpc.mantle.xyz, which is the default endpoint for Mantle transactions.",
                    "",
                    "If both are configured correctly and the issue persists, there might be a need to double-check your environment setup or restart your application to ensure all settings are applied. Let me know if you need further help!"
                ].join('\n');
            }

            try {
                const address = provider.getAddress();
                const balance = await provider.getBalance();
                return [
                    'Mantle Wallet Information:',
                    `Address: ${address}`,
                    `Balance: ${balance} MNT`,
                    '',
                    'Your wallet is properly configured and ready for transactions.',
                    `View on Explorer: https://explorer.mantle.xyz/address/${address}`
                ].join('\n');
            } catch (error) {
                console.error("Error in wallet provider:", error);
                return `Error accessing wallet information: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        } catch (error) {
            console.error("Error in wallet provider:", error);
            return "Error accessing wallet information. Please ensure your configuration is correct.";
        }
    },
};
