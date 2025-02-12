import type { Action, Memory } from "@elizaos/core";
import {
    createWalletClient,
    http,
    parseUnits,
    type SendTransactionParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

// Token addresses on Mantle
const TOKEN_ADDRESSES = {
    USDT: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
    USDC: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
    WETH: "0xdEaddEaDdeadDEadDEADDEAddEADDEAddead1111",
    WMNT: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
    WBTC: "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2",
    AGNI: "0x45579918686B26951b899A1A5e7282e53f4c8136",
} as const;

// Token decimals
const TOKEN_DECIMALS = {
    USDT: 6,
    USDC: 6,
    WETH: 18,
    WMNT: 18,
    WBTC: 8,
    AGNI: 18,
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

export const erc20Transfer: Action = {
    name: "SEND_TOKEN_MANTLE",
    description: "Send ERC20 tokens (USDT, USDC, WETH, WMNT, WBTC, AGNI) on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Send 10 USDT to 0x1234... on Mantle",
                    entities: {
                        amount: "10",
                        to: "0x1234567890123456789012345678901234567890",
                        token: "USDT",
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
                    text: "10 USDT sent to 0x1234...: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract entities from the message
        const content = message.content?.text?.match(
            /Send ([\d.]+) ([A-Za-z]+) to (0x[a-fA-F0-9]+) on Mantle/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse transfer details. Please use format: Send <amount> <token> to <address> on Mantle",
            });
            return false;
        }

        const amount = content[1];
        const tokenSymbol = content[2].toUpperCase();
        const to = content[3].toLowerCase();

        // Validate token
        if (!Object.keys(TOKEN_ADDRESSES).includes(tokenSymbol)) {
            callback?.({
                text: `Invalid token symbol. Supported tokens: ${Object.keys(TOKEN_ADDRESSES).join(", ")}`,
            });
            return false;
        }

        // Validate address
        if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
            callback?.({
                text: `Invalid address format. Address must be a valid Ethereum-style address.`,
            });
            return false;
        }

        try {
            const privateKey = runtime.settings.EVM_PRIVATE_KEY;
            if (!privateKey) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY.",
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The transaction of ${amount} ${tokenSymbol} to ${to} on Mantle has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            const rpcUrl = runtime.settings.EVM_RPC_URL || "https://rpc.mantle.xyz";
            const account = privateKeyToAccount(privateKey as `0x${string}`);

            const client = createWalletClient({
                account,
                chain: mantleChain,
                transport: http(rpcUrl),
            });

            // ERC20 transfer function signature
            const transferFunctionSignature = "a9059cbb";
            const cleanTo = to.toLowerCase().replace("0x", "");
            const amountHex = parseUnits(
                amount,
                TOKEN_DECIMALS[tokenSymbol as keyof typeof TOKEN_DECIMALS]
            )
                .toString(16)
                .padStart(64, "0");

            // Construct data parameter
            const data = `0x${transferFunctionSignature}${"000000000000000000000000"}${cleanTo}${amountHex}`;

            const hash = await client.sendTransaction({
                to: TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES] as `0x${string}`,
                data: data as `0x${string}`,
            });

            callback?.({
                text: `${amount} ${tokenSymbol} sent to ${to}: ${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to send tokens on Mantle:", error);
            callback?.({
                text: `Failed to send ${amount} ${tokenSymbol} to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like sending tokens through the Mantle network",
        "like making a token transfer in the Mantle ecosystem",
        "like beaming tokens across Mantle",
    ],
};
