# HiveFi Plugin

A comprehensive plugin for HiveFi that provides essential DeFi functionality and data integration with Mantle Network. This plugin serves as the core infrastructure for interacting with various DeFi protocols and services on Mantle.

## Features

### Core Actions

1. **Wallet Operations**
   - **Status**: Active ✅
   - EVM wallet integration
   - Transaction management
   - Balance tracking
   - Gas optimization

2. **Token Operations**
   - **Status**: Active ✅
   - ERC20 token transfers
   - Token balance tracking
   - Token metadata handling
   - Smart contract interaction

3. **Swap Operations**
   - **Status**: Active ✅
   - Token swaps on Merchant Moe
   - Price discovery
   - Slippage management
   - Transaction monitoring

4. **Staking Operations**
   - **Status**: Work in Progress 🔄
   - Liquid staking on Mantle Staking
   - Stake/unstake operations
   - Reward tracking
   - Position management

5. **Lending Operations**
   - **Status**: Work in Progress 🔄
   - Lending on INIT Capital
   - Supply/withdraw assets
   - Borrow/repay loans
   - Position management

### Providers

1. **Wallet Provider**
   - **Status**: Active ✅
   - **Features**:
     - EVM wallet integration
     - Transaction management
     - Key management
     - Gas optimization
   - **Usage**:
     ```typescript
     // Example wallet provider usage
     const balance = await walletProvider.getBalance(address);
     const tx = await walletProvider.sendTransaction(txParams);
     ```

2. **Token Provider**
   - **Status**: Active ✅
   - **Features**:
     - Token metadata and information
     - Token balance tracking
     - Token transfer history
     - Smart contract interaction
   - **Usage**:
     ```typescript
     // Example token provider usage
     const tokenBalance = await tokenProvider.getBalance(tokenAddress, walletAddress);
     const allowance = await tokenProvider.getAllowance(tokenAddress, spenderAddress);
     ```

3. **CoinGecko Provider**
   - **Status**: Active ✅
   - **Features**:
     - Real-time cryptocurrency prices
     - Market data and metrics
     - Token metadata
     - Historical price data
   - **Usage**:
     ```typescript
     // Example CoinGecko provider usage
     const price = await coingeckoProvider.getPrice('mantle');
     const marketData = await coingeckoProvider.getMarketData();
     ```

4. **DefiLlama Provider**
   - **Status**: Active ✅
   - **Features**:
     - Protocol TVL tracking
     - Token price feeds
     - DeFi protocol analytics
     - Market statistics
   - **Usage**:
     ```typescript
     // Example DefiLlama provider usage
     const tvl = await defillama.getTVL('mantle');
     const protocolMetrics = await defillama.getProtocolMetrics();
     ```

## Integration Guide

### Installation

```bash
# Using npm
npm install @hivefi/plugin-hivefi

# Using pnpm
pnpm add @hivefi/plugin-hivefi
```

### Basic Setup

```typescript
import { HiveFiPlugin } from '@hivefi/plugin-hivefi';

// Initialize the plugin
const hiveFi = new HiveFiPlugin({
  rpcUrl: 'https://rpc.mantle.xyz',
  privateKey: process.env.PRIVATE_KEY,
});
```

### Configuration

```typescript
// Plugin configuration options
interface HiveFiConfig {
  rpcUrl: string;              // Mantle RPC URL
  privateKey?: string;         // Optional: Private key for transactions
  apiKey?: string;            // Optional: API key for enhanced features
  gasMultiplier?: number;     // Optional: Gas price multiplier (default: 1.1)
  maxRetries?: number;        // Optional: Max transaction retry attempts
}
```

## Usage Examples

### Token Transfers

```typescript
// ERC20 Token Transfer
const transfer = await hiveFi.actions.transfer({
  token: '0x1234...', // Token address
  to: '0x5678...',    // Recipient address
  amount: '1.0'       // Amount to transfer
});

// Native Token (MNT) Transfer
const nativeTransfer = await hiveFi.actions.transfer({
  to: '0x5678...',
  amount: '0.1',
  isNative: true
});
```

### Token Swaps

```typescript
// Swap tokens on Merchant Moe
const swap = await hiveFi.actions.swap({
  fromToken: '0x1234...',  // Input token address
  toToken: '0x5678...',    // Output token address
  amount: '1.0',           // Input amount
  slippage: 0.5           // Max slippage percentage
});
```

### Market Data

```typescript
// Get token prices
const prices = await hiveFi.providers.coingecko.getPrices([
  'mantle',
  'ethereum'
]);

// Get protocol TVL
const tvl = await hiveFi.providers.defillama.getTVL('mantle');
```

## Error Handling

```typescript
try {
  const tx = await hiveFi.actions.transfer({...});
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.error('Insufficient balance for transfer');
  } else if (error instanceof NetworkError) {
    console.error('Network error occurred');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Gas Management**
   - Always check gas prices before transactions
   - Use appropriate gas limits
   - Consider using gas multiplier for faster confirmations

2. **Error Handling**
   - Implement proper try-catch blocks
   - Handle specific error types
   - Provide meaningful error messages
   - Implement retry mechanisms for failed transactions

3. **Security**
   - Never hardcode private keys
   - Use environment variables for sensitive data
   - Implement proper access controls
   - Validate all input parameters

4. **Performance**
   - Cache frequently used data
   - Batch requests when possible
   - Implement proper rate limiting
   - Monitor resource usage

## Development Status

### Currently Active
- Basic wallet operations
- Token transfers
- Token swaps on Merchant Moe
- Transaction tracking
- Market data integration
- Price feeds

### Work in Progress
- Liquid staking on Mantle Staking
- Lending operations on INIT Capital
- Advanced trading features
- Portfolio management
- Cross-chain operations

For more information about the agents and their capabilities, see our [agents documentation](agents.md).
