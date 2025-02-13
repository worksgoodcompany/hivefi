# AI Workforce Suite (AIWS)

## Overview

The AI Workforce Suite (AIWS) is a comprehensive framework for building and deploying specialized AI agent swarms across various industries and use cases. Each swarm is a collection of purpose-built agents designed to work together to automate and enhance specific domains. HiveFi, our DeFi-focused swarm for Mantle, represents the first implementation of this framework.

## Vision

AIWS aims to revolutionize workforce automation through modular, specialized AI swarms that can operate independently or in concert to handle complex tasks across different sectors. The framework provides the foundation for developing, deploying, and managing these intelligent agent networks.

## Swarm Architecture

### Current Implementation

#### HiveFi (Mantle DeFi Operations)
Our first production swarm, focused on Mantle DeFi operations. Features include:

##### Current Features (Active ✅)
- Token transfers (ETH, USDT, MNT, custom tokens)
- Token swaps on Merchant Moe
- Transaction tracking and monitoring
- Gas optimization
- Real-time TVL metrics via DefiLlama
- Token price tracking via CoinGecko
- Protocol analytics
- Market statistics
- Content creation and management
- Community engagement
- Technical documentation

##### Coming Soon Features 🔄
- Liquid staking on Mantle Staking
- Lending operations on INIT Capital
- Advanced trading strategies
- Portfolio management
- Cross-chain operations

For complete technical specifications, see our [technical documentation](specs.md).

### Future Swarms

#### DeFi Swarms
- EthereumHive: Ethereum ecosystem operations
- PolygonHive: Polygon network operations
- OptimismHive: Optimism network operations
- ArbitrumHive: Arbitrum network operations
- BaseHive: Base network operations

## Core Framework

### Multi-Agent Architecture
AIWS provides a flexible foundation for building specialized swarms:

1. Modular Design
   - 18 specialized agents
   - Three agent categories (Internal, Public, Private)
   - Independent agent development
   - Swarm-specific customization
   - Resource sharing

2. Swarm Intelligence
   - Task orchestration via Coordinator Agent
   - Resource optimization
   - Learning capabilities
   - Gas optimization
   - Performance monitoring

3. Integration Framework
   - EVM compatibility
   - Protocol integrations
   - API standardization
   - Data interchange
   - Error handling

### Common Components

1. Base Agent Framework
   - Character system
   - Task management
   - Communication protocols
   - State handling
   - Gas management

2. Swarm Management
   - Deployment tools
   - Monitoring systems
   - Resource allocation
   - Performance tracking
   - Error handling

3. Integration Layer
   - EVM integration
   - Protocol support
   - API management
   - Data handling
   - Security protocols

## Development Guidelines

### Swarm Development
1. Domain Analysis
   - Use case identification
   - Requirements gathering
   - Architecture planning
   - Agent specification
   - Protocol integration

2. Agent Design
   - Role definition
   - Capability mapping
   - Interaction modeling
   - Security planning
   - Gas optimization

3. Integration
   - EVM compatibility
   - Protocol implementation
   - Service connection
   - Testing framework
   - Error handling

### Best Practices
1. Architecture
   - EVM-compatible design
   - Secure communications
   - Fault tolerance
   - Gas efficiency
   - Error handling

2. Development
   - TypeScript best practices
   - Documentation standards
   - Testing requirements
   - Performance optimization
   - Gas optimization

3. Operations
   - Monitoring guidelines
   - Maintenance procedures
   - Update protocols
   - Support structure
   - Security updates

## Getting Started

### Deployment Options

1. Self-Hosted Deployment (Recommended)
   - Full control over infrastructure
   - Direct access to all features
   - Community support via Discord
   - Open-source codebase
   - Customizable setup

### Requirements
- Node.js 23+
- Git
- pnpm
- Basic TypeScript/Node.js knowledge
- API keys for required services

### For Developers
1. Choose agent categories to implement
2. Fork the repository
3. Set up required APIs:
   - OpenAI (required)
   - Anthropic Claude (optional)
   - CoinGecko
   - DefiLlama
   - Mantle RPC endpoint
4. Configure environment:
   ```env
   # Required
   EVM_PRIVATE_KEY=your_private_key
   EVM_PROVIDER_URL=https://rpc.mantle.xyz
   OPENAI_API_KEY=your_openai_key

   # Optional
   ANTHROPIC_API_KEY=your_claude_key
   COINGECKO_API_KEY=your_coingecko_key
   DEFILLAMA_API_KEY=your_defillama_key
   ```
5. Deploy and monitor

### For Users
1. Fork the repository
2. Install dependencies
3. Configure environment
4. Start with demo agent
5. Join Discord community

## Support and Resources

### Documentation
- [Technical Specifications](specs.md)
- [Plugin Documentation](plugin-hivefi.md)
- [Agents Documentation](agents.md)
- [Services Documentation](services.md)

### Community
- [Discord Community](https://discord.gg/APAKDaUYAM)
- [GitHub Discussions](https://github.com/worksgoodcompany/hivefi/discussions)
- [X (Twitter)](https://x.com/HiveFiAgent)