import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    type SendTransactionParameters,
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";

// Token addresses on Mantle
const TOKEN_ADDRESSES = {
    USDT: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
    USDC: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
    WETH: "0xdEaddEaDdeadDEadDEADDEAddEADDEAddead1111",
    METH: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
    CMETH: "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA",
    WMNT: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
    WBTC: "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2",
    AGNI: "0x45579918686B26951b899A1A5e7282e53f4c8136",
} as const;

// Token decimals
const TOKEN_DECIMALS = {
    USDT: 6,
    USDC: 6,
    WETH: 18,
    METH: 18,
    CMETH: 18,
    WMNT: 18,
    WBTC: 8,
    AGNI: 18,
} as const;

interface TransferEntities {
    amount?: string | number;
    to?: string;
    token?: string;
}

export const erc20Transfer: Action = {
    name: "SEND_TOKEN_MANTLE",
    description: "Send ERC20 tokens (USDT, USDC, WETH, WMNT, WBTC, AGNI) on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Send 0.01 USDC to 0x1234567890123456789012345678901234567890",
                    entities: {
                        amount: "0.01",
                        to: "0x1234567890123456789012345678901234567890",
                        token: "USDC",
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
                    text: "0.01 USDC sent to 0x1234...: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        let amount = "0";
        let tokenSymbol = "";
        let to = "0x0000000000000000000000000000000000000000" as `0x${string}`;

        try {
            // First try the "Send X TOKEN to ADDRESS on Mantle" format
            let content = message.content?.text?.match(
                /Send ([\d.]+) ([A-Za-z]+) to (0x[a-fA-F0-9]{40}) on Mantle/i
            );

            // If that doesn't match, try the simpler "Send X TOKEN to ADDRESS" format
            if (!content) {
                content = message.content?.text?.match(
                    /Send ([\d.]+) ([A-Za-z]+) to (0x[a-fA-F0-9]{40})/i
                );
            }

            // If still no match, try the most basic format
            if (!content) {
                const text = message.content?.text || '';
                const parts = text.split(' ');
                if (parts.length >= 4) {
                    const tempAmount = parts[1];
                    const tempToken = parts[2];
                    const tempTo = parts[3];
                    if (tempAmount && tempToken && tempTo && /^0x[a-fA-F0-9]{40}$/i.test(tempTo)) {
                        content = [text, tempAmount, tempToken, tempTo];
                    }
                }
            }

            if (!content) {
                callback?.({
                    text: "Could not parse transfer details. Please use one of these formats:\n" +
                         "1. Send <amount> <token> to <address> on Mantle\n" +
                         "2. Send <amount> <token> to <address>\n" +
                         "3. Send <amount> <token> <address>",
                });
                return false;
            }

            amount = content[1];
            tokenSymbol = content[2].toUpperCase();
            to = content[3].toLowerCase() as `0x${string}`;

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
                    text: "Invalid address format. Address must be a valid Ethereum-style address.",
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
                text: `The transaction of ${amount} ${tokenSymbol} to ${to} on Mantle has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            // Get wallet client
            const walletClient = provider.getWalletClient();

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

            // Send transaction
            const hash = await walletClient.sendTransaction({
                chain: mantleChain,
                account: provider.getAccount(),
                to: TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES] as `0x${string}`,
                data: data as `0x${string}`,
            });

            callback?.({
                text: `${amount} ${tokenSymbol} sent to ${to}\nTransaction Hash: ${hash}\nView on Explorer: https://explorer.mantle.xyz/tx/${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to send tokens on Mantle:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            callback?.({
                text: `Failed to send ${amount} ${tokenSymbol} to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your wallet has sufficient balance and is properly configured.`,
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
