import type { Action, Memory } from "@elizaos/core";
import {
    createPublicClient,
    createWalletClient,
    http,
    parseEther,
    type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

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

export const transfer: Action = {
    name: "SEND_MNT",
    description: "Send MNT on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Send 0.1 MNT to 0x1234... on Mantle",
                    entities: {
                        amount: "0.1",
                        to: "0x1234567890123456789012345678901234567890",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The transaction has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "0.1 MNT sent to 0x1234...: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract entities from the message
        const content = message.content?.text?.match(
            /Send ([\d.]+) MNT to (0x[a-fA-F0-9]{40}) on Mantle/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse transfer details. Please use format: Send <amount> MNT to <address> on Mantle",
            });
            return false;
        }

        const amount = content[1];
        const to = content[2];

        // Validate address - must be a 0x prefixed address
        if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
            callback?.({
                text: `Invalid Mantle address format. Address must be a valid Ethereum-style address.`,
            });
            return false;
        }

        try {
            const privateKey = runtime.settings.EVM_PRIVATE_KEY;
            if (!privateKey) {
                callback?.({
                    text: "Mantle wallet not configured. Please set EVM_PRIVATE_KEY.",
                });
                return false;
            }

            // Send initial confirmation without hash
            callback?.({
                text: `The transaction of ${amount} MNT to the address ${to} on the Mantle network has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            const rpcUrl = runtime.settings.EVM_RPC_URL || "https://rpc.mantle.xyz";

            const account = privateKeyToAccount(privateKey as `0x${string}`);

            const client = createWalletClient({
                account,
                chain: mantleChain,
                transport: http(rpcUrl),
            });

            const hash = await client.sendTransaction({
                to: to as `0x${string}`,
                value: parseEther(amount),
            });

            // Send only the actual transaction hash
            callback?.({
                text: `${amount} MNT sent to ${to}: ${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to send MNT:", error);
            callback?.({
                text: `Failed to send ${amount} MNT to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like sending digital cash through the Mantle network",
        "like making an instant transfer in the Mantle ecosystem",
        "like beaming MNT through the network",
    ],
};
