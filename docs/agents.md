# HiveFi Agent System

## Overview

HiveFi employs a Multi-Agent System (MAS) architecture where specialized agents collaborate to handle specific DeFi operations on Mantle. Each agent is designed for optimal performance in its designated role, enabling modular, scalable, and efficient operations.

## Agent Types

### Internal Agents
HiveFi-owned agents that handle platform operations and can be replicated in private deployments.

### Public Agents
Single instances that can be used by multiple users, typically charged per task/usage.

### Private Agents
Dedicated instances for specific users/organizations as part of their custom swarm deployment.

## Agent Categories

### Internal Agents (Platform Operations)

These agents handle HiveFi's core platform operations and can be replicated in private deployments.

1. #### Sales Agent
- **Type**: Internal
- **Status**: Active ✅
- **Category**: Operations
- **Description**: Manages HiveFi's customer relations and sales pipeline through intelligent lead qualification, personalized onboarding, and proactive account management
- **Capabilities**:
  - Lead qualification and scoring
  - Automated onboarding assistance
  - Support ticket prioritization and escalation
  - Account health monitoring and management
  - Sales pipeline optimization
  - Customer success tracking
- **Example Usage**:
  ```
  Tell me about HiveFi's features
  How do I get started with HiveFi?
  What are the deployment options?
  ```

2. #### Meme Agent
- **Type**: Internal
- **Status**: Active ✅
- **Category**: Marketing
- **Description**: Creates and manages HiveFi's social media presence through data-driven content strategy
- **Capabilities**:
  - AI-powered meme generation and curation
  - Multi-platform content scheduling
  - Real-time engagement monitoring and analytics
  - Brand voice consistency enforcement
  - Trend-based content optimization
  - Community sentiment analysis
- **Example Usage**:
  ```
  Create a meme about HiveFi's features
  Generate social media content
  ```

3. #### Demo Agent
- **Type**: Internal
- **Status**: Active ✅
- **Category**: Education
- **Description**: Interactive platform guide designed to showcase HiveFi's capabilities and features through hands-on demonstrations
- **Capabilities**:
  - Feature demonstrations and walkthroughs
  - Interactive platform tutorials
  - Use case presentations
  - Custom workflow demonstrations
  - Integration examples
  - Best practices guidance
- **Example Usage**:
  ```
  Show me how to use HiveFi
  Demonstrate token swapping
  Walk me through wallet integration
  ```

### Public Agents (Shared Services)

4. #### Metrics Agent
- **Type**: Public
- **Status**: Active ✅
- **Category**: Analytics
- **Description**: Comprehensive analytics platform providing real-time insights for Mantle protocols
- **Capabilities**:
  - Real-time TVL tracking and forecasting
  - Cross-protocol APY monitoring
  - Advanced protocol analytics and comparisons
  - Market trend identification and analysis
  - Custom metric dashboard creation
- **Example Usage**:
  ```
  Get TVL metrics for Mantle
  Show me token prices
  Display protocol statistics
  ```

5. #### Alpha Agent
- **Type**: Public
- **Status**: Coming Soon 🔄
- **Category**: Research
- **Description**: Advanced market opportunity discovery through multi-source analysis
- **Planned Capabilities**:
  - Multi-platform social media analysis
  - Pattern-based trend detection
  - Algorithmic signal generation
  - Comprehensive market research
  - Sentiment analysis integration

6. #### Analyst Agent
- **Type**: Public
- **Status**: Coming Soon 🔄
- **Category**: Research
- **Description**: Comprehensive market analysis with advanced risk assessment capabilities
- **Planned Capabilities**:
  - In-depth market analysis
  - Risk assessment and modeling
  - Quantitative trend analysis
  - Technical indicator analysis
  - Detailed report generation
  - Portfolio risk evaluation
  - Correlation analysis

7. #### NFTs Agent
- **Type**: Public
- **Status**: Coming Soon 🔄
- **Category**: Analytics
- **Description**: Comprehensive NFT market intelligence and collection analysis platform
- **Planned Capabilities**:
  - NFT Trading Assistant
  - Real-time collection tracking
  - Dynamic floor price monitoring
  - Advanced rarity scoring
  - Market trend prediction
  - Whale wallet tracking

8. #### KOL Agent
- **Type**: Public
- **Status**: Active ✅
- **Category**: Marketing
- **Description**: Professional key opinion leader service optimizing crypto project visibility
- **Capabilities**:
  - Strategic content creation
  - Engagement rate optimization
  - Multi-platform campaign management
  - Performance analytics reporting
  - Influencer network coordination

9. #### Token Deployer
- **Type**: Public
- **Status**: Active ✅
- **Category**: Development
- **Description**: Intuitive natural language interface for secure token and liquidity pool deployment on Mantle
- **Capabilities**:
  - Custom token creation
  - Liquidity pool deployment
  - Automated contract verification
  - Advanced parameter configuration
  - Security audit integration

10. #### NFT Deployer
- **Type**: Public
- **Status**: Coming Soon 🔄
- **Category**: Development
- **Description**: Streamlined NFT collection deployment and management system on Mantle
- **Planned Capabilities**:
  - Collection smart contract deployment
  - Metadata generation and management
  - Minting configuration setup
  - Royalty management
  - IPFS integration

11. #### Mantle Expert
- **Type**: Public
- **Status**: Active ✅
- **Category**: Education
- **Description**: Advanced knowledge base and support system for Mantle ecosystem
- **Capabilities**:
  - Interactive documentation assistance
  - EVM compatibility guidance
  - Layer 2 optimization techniques
  - Cross-chain bridge support
  - Development best practices
  - Technical troubleshooting

12. #### Predictions Agent
- **Type**: Public
- **Status**: Coming Soon 🔄
- **Category**: Analytics
- **Description**: Advanced predictive analytics for market trends and behavior patterns
- **Planned Capabilities**:
  - Machine learning-based trend prediction
  - Behavioral pattern analysis
  - Market cycle identification
  - Social sentiment forecasting
  - Price movement prediction

### Private Agents (Custom Deployments)

13. #### Coordinator Agent
- **Type**: Private
- **Status**: Active ✅
- **Category**: Operations
- **Description**: Advanced orchestration system for multi-agent operations
- **Capabilities**:
  - Intelligent agent coordination
  - Dynamic task delegation
  - Real-time system monitoring
  - Performance optimization
  - Resource allocation

14. #### DeFi Agent
- **Type**: Private
- **Status**: Active ✅
- **Category**: Operations
- **Description**: Comprehensive DeFi operations and yield optimization system for Mantle
- **Current Capabilities**:
  - Token transfers
  - Token swaps on Merchant Moe
  - Transaction tracking
- **Coming Soon**:
  - Liquid staking on Mantle Staking
  - Lending on INIT Capital
  - Advanced yield farming strategies
  - Dynamic liquidity provision
  - Portfolio rebalancing

15. #### Trading Agent
- **Type**: Private
- **Status**: Active ✅
- **Category**: Operations
- **Description**: Sophisticated trading and position management system for Mantle
- **Current Capabilities**:
  - Token swaps on Merchant Moe
  - Basic position management
  - Transaction monitoring
- **Coming Soon**:
  - Advanced trading strategies
  - Market making strategies
  - Portfolio optimization
  - Risk management

16. #### Wallet Agent
- **Type**: Private
- **Status**: Active ✅
- **Category**: Operations
- **Description**: Comprehensive wallet operations and security management system for Mantle
- **Capabilities**:
  - EVM-compatible transaction management
  - Smart transaction routing
  - Gas optimization strategies
  - Real-time balance tracking
  - Multi-signature support

17. #### DAO Agent
- **Type**: Private
- **Status**: Coming Soon 🔄
- **Category**: Governance
- **Description**: Comprehensive DAO management and treasury optimization system
- **Planned Capabilities**:
  - Treasury management and analysis
  - Proposal creation and tracking
  - Voting analytics
  - Fund allocation optimization
  - Governance participation tracking

18. #### Advisor Agent
- **Type**: Private
- **Status**: Active ✅
- **Category**: Advisory
- **Description**: Personalized financial and business strategy advisor
- **Capabilities**:
  - Risk profile assessment
  - Custom strategy development
  - Investment portfolio planning
  - Business growth consulting
  - Performance tracking
  - Regular strategy adjustment

## Agent Interaction Guidelines

### Best Practices
1. Use clear, specific commands
2. One operation per request
3. Verify transaction details before execution
4. Monitor operation status
5. Check gas prices before transactions

### Security Considerations
1. Never share private keys
2. Verify addresses carefully
3. Start with small amounts
4. Monitor transaction status
5. Review permissions

## Development Status

### Currently Active Features
- Basic wallet operations
- Token transfers
- Token swaps on Merchant Moe
- Transaction tracking
- Market metrics
- Social media management
- Platform education
- Technical support

### Work in Progress Features
- Liquid staking on Mantle Staking
- Lending operations on INIT Capital
- Advanced trading strategies
- Portfolio management
- Cross-chain operations
- NFT operations
- DAO management

For implementation details and integration guides, see our [plugin documentation](plugin-hivefi.md).
