# HiveFi Services

## Overview

HiveFi is an open-source Multi-Agent System (MAS) designed for Mantle Network. Our primary focus is providing a robust, self-hosted solution that empowers users to run their own agent swarms. For detailed agent specifications, see our [agents documentation](agents.md).

## Current Services

### Core Services (Self-Hosted)

1. #### DeFi Operations
- **Status**: Active ✅
- **Features**:
  - Token transfers (ETH, USDT, MNT, custom tokens)
  - Token swaps on Merchant Moe
  - Transaction tracking
  - Gas optimization
- **Coming Soon**:
  - Liquid staking on Mantle Staking
  - Lending & Borrowing on Lendle

2. #### Analytics Services
- **Status**: Active ✅
- **Features**:
  - Real-time TVL metrics
  - Token price tracking
  - Protocol analytics
  - Market statistics
- **Data Sources**:
  - CoinGecko integration
  - DefiLlama integration

3. #### Social Services
- **Status**: Active ✅
- **Features**:
  - Content creation
  - Community management
  - Brand development
  - Social engagement

4. #### Development Services
- **Status**: Active ✅
- **Features**:
  - Technical documentation
  - Development support
  - Best practices guidance
  - EVM compatibility support

## Deployment Options

### Self-Hosted Solution (Recommended)
- **Status**: Active ✅
- **Features**:
  - Full control over infrastructure
  - Access to all agents and features
  - Community support via Discord
  - Direct access to updates
- **Requirements**:
  - Basic server/cloud instance
  - API keys for required services
  - Basic TypeScript/Node.js knowledge
- **Support**:
  - Detailed documentation
  - Community support
  - GitHub issues
  - Setup guidance

### Future Service Packages (Coming Soon)

Note: The following packages will be available in future releases.

1. #### DeFi Trader Package 🔄
- Private Trading Agent
- Private DeFi Agent
- Analytics Suite
- Strategy Optimization

2. #### Social Influencer Package 🔄
- KOL Agent
- Content Strategy
- Analytics Tools
- Performance Tracking

3. #### Developer Package 🔄
- Token Deployment Tools
- Technical Support
- Documentation Access
- Security Tools

4. #### Enterprise Package 🔄
- Custom Agent Deployment
- White-label Options
- Advanced Security
- SLA Support

## Support Services

### Community Support (Active ✅)
- Discord Community
- GitHub Discussions
- Documentation
- Setup Guides

### Technical Support (Active ✅)
- Implementation Guidance
- Troubleshooting Help
- Best Practices
- Security Guidelines

### Development Support (Active ✅)
- Code Examples
- Integration Guides
- Security Practices
- Gas Optimization Tips

## Getting Started

### Prerequisites
- [Node.js 23+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [pnpm](https://pnpm.io/)

### Basic Setup
```bash
# Clone the repository
git clone https://github.com/worksgoodcompany/hivefi
cd hivefi/eliza

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
```

### Required Configuration
```env
# Mantle Configuration
EVM_PRIVATE_KEY=your_private_key
EVM_PROVIDER_URL=https://rpc.mantle.xyz

# AI Provider (Choose One)
OPENAI_API_KEY=           # OpenAI API key
ANTHROPIC_API_KEY=        # Claude API key (optional)

# Optional: Enhanced Features
COINGECKO_API_KEY=        # For extended price data
DEFILLAMA_API_KEY=        # For extended TVL data
```

## Best Practices

### Security
1. Use secure environment variables
2. Implement proper access controls
3. Regular security updates
4. Monitor transactions
5. Validate inputs

### Performance
1. Optimize gas usage
2. Cache frequent data
3. Batch operations
4. Monitor resources
5. Regular maintenance

### Development
1. Follow TypeScript best practices
2. Implement proper error handling
3. Write comprehensive tests
4. Document code changes
5. Regular backups

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

For technical implementation details, see our [plugin documentation](plugin-hivefi.md).
