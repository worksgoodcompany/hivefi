# Technical Specifications

## System Overview

HiveFi is built on a modular Multi-Agent System (MAS) architecture, designed for scalability, security, and extensibility on the Mantle Network. This document outlines the technical specifications of the current implementation.

## Core Technologies

### Runtime Environment
- **Node.js**: Version 23+
- **TypeScript**: Strict mode enabled
- **Package Manager**: pnpm

### Framework & Libraries
- **Core Framework**: ElizaOS
- **Web Framework**: Next.js App Router
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js/Web3.js
- **AI Integration**: OpenAI/Claude

### Infrastructure Requirements
- Basic server/cloud instance
- Git version control
- Node.js runtime
- pnpm package manager
- Required API keys

## Protocol Integration

### Mantle Network
- **Status**: Active ✅
- Layer 2 scaling solution
- EVM compatibility
- Gas optimization
- Transaction management

### Current Integrations
1. **Merchant Moe DEX** (Active ✅)
   - Token swaps
   - Price discovery
   - Slippage management
   - Transaction monitoring

2. **Lending & Borrowing on Lendle** (Active ✅)
   - Lending platform integration
   - Supply/withdraw functionality
   - Borrowing operations
   - Position management

3. **Mantle Staking** (Coming Soon 🔄)
   - Liquid staking interface
   - Reward tracking
   - Position management
   - Withdrawal handling



## Data Providers

### Active Integrations
1. **CoinGecko** (Active ✅)
   - Real-time price data
   - Market statistics
   - Token metadata
   - Historical data

2. **DefiLlama** (Active ✅)
   - Protocol TVL data
   - Market analytics
   - Protocol metrics
   - Performance data

## Agent System Architecture

### Agent Framework
- Event-driven architecture
- Modular design
- State management
- Inter-agent communication
- Task orchestration

### Agent Categories
1. **Internal Agents**
   - Platform operations
   - System management
   - User interaction

2. **Public Agents**
   - Shared services
   - Data analytics
   - Market operations

3. **Private Agents**
   - Custom deployments
   - User-specific operations
   - Strategy execution

For detailed agent specifications, see our [agents documentation](agents.md).

## Core Components

### Action Framework
- **Status**: Active ✅
- Event handling
- Transaction management
- Error handling
- Gas optimization
- State management

### Provider System
- **Status**: Active ✅
- Data integration
- Protocol connectivity
- Service management
- Resource allocation

## Security Implementation

### Authentication & Authorization
- Environment-based configuration
- API key management
- Access control
- Session handling

### Transaction Security
- Gas optimization
- Slippage protection
- Error handling
- Transaction verification
- Recovery procedures

### Data Security
- Secure configuration
- Input validation
- Error logging
- State management
- Backup procedures

## Development Standards

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Unit test coverage
- Documentation requirements

### Development Process
- Git workflow
- Code review process
- CI/CD pipeline
- Documentation updates
- Security reviews

### Testing Requirements
- Unit tests
- Integration tests
- End-to-end tests
- Security tests
- Performance tests

## API Integration

### Required APIs
1. **Blockchain**
   - Mantle RPC endpoint
   - Web3 provider

2. **AI Services**
   - OpenAI API (required)
   - Claude API (optional)

3. **Data Services**
   - CoinGecko API
   - DefiLlama API

### API Configuration
```typescript
interface APIConfig {
  // Blockchain Configuration
  rpcUrl: string;              // Mantle RPC URL
  privateKey?: string;         // Optional: Private key
  
  // AI Provider Configuration
  openaiKey: string;          // OpenAI API key
  anthropicKey?: string;      // Optional: Claude API key
  
  // Data Provider Configuration
  coingeckoKey?: string;      // Optional: CoinGecko API key
  defillamaKey?: string;      // Optional: DefiLlama API key
}
```

## Performance Specifications

### Transaction Processing
- Optimal gas usage
- Transaction batching
- Error recovery
- State consistency

### Resource Management
- Memory optimization
- CPU utilization
- Network efficiency
- Storage optimization

### Monitoring
- Performance metrics
- Error tracking
- Resource usage
- System health

## Development Status

### Currently Active
- Basic wallet operations
- Token transfers
- Token swaps on Merchant Moe
- Transaction tracking
- Market metrics
- Social media management
- Platform education
- Technical support

### Work in Progress
- Liquid staking on Mantle Staking
- Advanced trading strategies
- Portfolio management
- Cross-chain operations

For implementation details, see our [plugin documentation](plugin-hivefi.md).
For service offerings, see our [services documentation](services.md).
