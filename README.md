# RentRWA - Offline Compliance + AI-Driven Rental Collateral Lending Platform

**English | [中文版本](README_CN.md)**

An innovative Real World Asset Tokenization platform for rental income, combining offline compliance processes, ElizaOS AI agents, and Chainlink oracle technology, enabling landlords to complete rental income tokenization and collateral lending through natural language conversations.

## 🏗️ Project Architecture

### Core Components
- **Offline Compliance Layer**: Store auditing, contract signing, data entry
- **AI Agent Layer**: ElizaOS framework-based intelligent assistant with multi-platform support
- **Smart Contract Layer**: ERC1155-based rental tokenization and DeFi lending protocol
- **Oracle Layer**: Chainlink Functions and Price Feeds integration
- **Data Layer**: Supabase database storing audited real estate information

## 🤖 Main Features

### 1. Offline Compliance Process
- Landlords visit offline stores to provide lease contracts and proof of ownership
- Staff audit and evaluate, sign real rental collateral contracts
- Input property information into Supabase database, generate unique RWAKey

### 2. AI-Driven User Interaction
- ElizaOS framework-based intelligent agent with natural language processing
- Multi-platform support: command line chat, Twitter social media interaction, HTTP API
- Intelligent parameter extraction and validation, complete complex DeFi operations with one sentence

### 3. Rental Income Tokenization
- ERC1155 standard multi-token contract with batch operation support
- Automatically obtain audited property data through Chainlink Functions
- Automatically mint RWA tokens based on real rental income

### 4. Complete DeFi Lending Ecosystem
- **getRwa**: Rental tokenization, AI calls smart contracts to mint tokens
- **lendRWA**: Collateral lending, landlords stake RWA tokens to get USDC
- **lendUSDC**: Liquidity provision, USDC holders provide liquidity to earn interest
- **repay**: Repayment and redemption, complete lending cycle

### 5. Network Support
- Deployed on Avalanche Fuji testnet
- EVM-compatible smart contracts
- Support for cross-chain expansion

## 📁 Project Structure

```
RentRWA/
├── src/
│   ├── contracts/                    # Smart Contract Layer
│   │   ├── ERC1155Core.sol          # ERC1155 base contract
│   │   ├── RealRentToken.sol        # Rental income token contract
│   │   ├── RentIssuer.sol           # Token issuance contract (Chainlink Functions)
│   │   ├── RentLending.sol          # DeFi lending contract (Price Feeds)
│   │   └── FunctionsSource.sol      # Chainlink Functions JavaScript code
│   └── frontend/                    # AI Agent Layer
│       ├── src/
│       │   ├── rwa-plugins/         # RWA-specific plugins
│       │   │   ├── actions/         # Four core actions
│       │   │   │   ├── getRwa.ts    # Tokenization action
│       │   │   │   ├── lendRwa.ts   # Collateral lending action
│       │   │   │   ├── lendUsdc.ts  # Liquidity provision action
│       │   │   │   └── repay.ts     # Repayment redemption action
│       │   │   ├── templates/       # AI templates
│       │   │   └── types/           # Type definitions
│       │   ├── light_twitter-clients/ # Twitter client
│       │   ├── chat/                # Command line chat
│       │   ├── clients/             # Multi-platform clients
│       │   ├── database/            # Database adapters
│       │   └── config/              # Configuration management
│       ├── scripts/                 # Deployment scripts
│       │   ├── uploadToDON.js       # Chainlink Functions key upload
│       │   └── testDBApi.js         # Supabase API testing
│       ├── characters/              # AI character configuration
│       └── package.json             # Dependency management
├── docs/                            # Documentation and presentation materials
└── README.md
```

## 🔗 Chainlink Integration Files

This project deeply integrates multiple Chainlink services. Here are links to all related files:

### Chainlink Integration in Smart Contracts

#### 1. Chainlink Functions
- **[FunctionsSource.sol](src/contracts/FunctionsSource.sol)** - Defines JavaScript code for fetching real estate data from Supabase
- **[RentIssuer.sol](src/contracts/RentIssuer.sol)** - Uses Chainlink Functions to automatically mint RWA tokens (Deployed on [Avalanche Fuji Testnet](https://testnet.snowtrace.io/address/0x0382E466541f86a4Dcf73F2709aE8aF24B22dF4B#loaded))

#### 2. Chainlink Price Feeds
- **[RentLending.sol](src/contracts/RentLending.sol)** - Integrates USDC/USD price oracle for lending valuation (Deployed on [Avalanche Fuji Testnet](https://testnet.snowtrace.io/address/0x0b5E917f561a23c57587243e21304D0263685Ed3#loaded))

#### 3. Real Estate Token Contract
- **[RealRentToken.sol](src/contracts/RealRentToken.sol)** - ERC1155-based real estate rental token contract (Deployed on [Avalanche Fuji Testnet](https://testnet.snowtrace.io/address/0x2F4C90cab3fF7D6187F81447669E1eD9C6947BD8#loaded))

### Chainlink Integration in Frontend

#### 1. ElizaOS AI Agent Plugins
- **[getRwaPlugin](src/frontend/src/rwa-plugins/index.ts)** - Complete RWA plugin containing four core actions
- **[getRwa.ts](src/frontend/src/rwa-plugins/actions/getRwa.ts)** - AI agent calls Chainlink Functions contract
- **[lendRwa.ts](src/frontend/src/rwa-plugins/actions/lendRwa.ts)** - Collateral lending action
- **[lendUsdc.ts](src/frontend/src/rwa-plugins/actions/lendUsdc.ts)** - Liquidity provision action
- **[repay.ts](src/frontend/src/rwa-plugins/actions/repay.ts)** - Repayment redemption action

#### 2. Chainlink Functions Toolkit
- **[package.json](src/frontend/package.json)** - Depends on `@chainlink/functions-toolkit`
- **[uploadToDON.js](src/frontend/scripts/uploadToDON.js)** - Upload encrypted keys to Chainlink DON network
- **[testDBApi.js](src/frontend/scripts/testDBApi.js)** - Test Supabase API connection (Chainlink Functions data source)

#### 3. AI Templates and Type Definitions
- **[getRwaTemplate](src/frontend/src/rwa-plugins/templates/index.ts)** - AI natural language processing templates
- **[types](src/frontend/src/rwa-plugins/types/index.ts)** - TypeScript type definitions

## 🚀 Quick Start

### Requirements
- Node.js >= 22
- pnpm
- Solidity 0.8.24

### Install Dependencies
```bash
cd src/frontend
pnpm install
```

### Environment Configuration
Create `.env` file (refer to `.env.example`):
```env
# Required environment variables
GEMINI_API_KEY=your_google_gemini_api_key
EVM_PRIVATE_KEY=0x...
ETHEREUM_PROVIDER_AVALANCHEFUJI=your_avalanche_fuji_rpc_url
SUPABASE_API_KEY=your_supabase_public_anon_key

# Twitter integration (optional)
TWITTER_USERNAME=your_bot_username
TWITTER_PASSWORD=your_bot_password
TWITTER_EMAIL=your@email.com
TWITTER_POLL_INTERVAL=30
TWITTER_DRY_RUN=false
TWITTER_RETRY_LIMIT=5
```

### Deploy Chainlink Functions Keys
```bash
cd src/frontend
node scripts/uploadToDON.js
```

### Start AI Agent
```bash
pnpm start
```

## 💡 Usage Examples

### Complete Business Process

#### Step 1: Offline Compliance (One-time)
1. Landlord visits offline store, provides lease contract and legal proof of ownership
2. Staff audit and evaluate, sign rental collateral contract
3. Input property information into Supabase database, generate unique RWAKey

#### Step 2: AI Tokenization (30 seconds)
```
You: My wallet address is 0x208aa722aca42399eac5192ee778e4d42f4e5de3,
     RWA key is Nbbut8vlkKe9991Z4Z4, please help me tokenize rental income

Agent: Processing your rental tokenization request...
       📥 Transaction Hash: 0xdef456...
       🆔 RWA TokenId: 1
       📦 RWA Token amount: 1000
       Success! Your rental income has been tokenized and can now be used for collateral lending to get USDC liquidity!
```

#### Step 3: DeFi Lending (Optional)
```
You: I want to use RWA tokens for collateral lending USDC
Agent: Processing collateral lending request...
Agent: Successfully staked! You have received USDC liquidity, transaction hash: 0xabc123...
```

### Multi-Platform Support
- **Command Line Interaction**: Local chat interface, suitable for development and testing
- **Twitter Interaction**: Users can send requests by @mentioning the bot on Twitter
- **HTTP API**: Support for third-party application integration

## 🔧 Technical Features

### Chainlink Integration Highlights
1. **Functions**: Decentralized data acquisition, securely obtaining offline-audited property information from Supabase
2. **Price Feeds**: Real-time USDC/USD exchange rates for DeFi lending valuation
3. **DON**: Decentralized oracle network ensuring data trustworthiness and censorship resistance

### ElizaOS AI Agent Features
1. **Natural Language Processing**: Intelligently extract wallet addresses and RWA keys, support Chinese and English
2. **Multi-Platform Support**: Command line chat, Twitter social media, HTTP API
3. **Complete Plugin System**: Four core actions (getRwa, lendRwa, lendUsdc, repay)
4. **Character System**: Configurable AI characters (Eliza, Trump, Tate, etc.)
5. **Error Handling**: Intelligent error detection, parameter validation, and user guidance
6. **Real-time Interaction**: Support for multi-turn conversations and context understanding

## 🏦 Complete DeFi Ecosystem

### Four Core Functional Modules

#### 1. Rental Tokenization (getRwa)
- Landlord provides RWAKey, AI agent calls RentIssuer contract
- Chainlink Functions queries Supabase to get audited property data
- Automatically mint ERC1155 format rental income tokens

#### 2. Collateral Lending (lendRWA)
- Landlord stakes RWA tokens to RentLending contract
- Chainlink Price Feeds get USDC exchange rate for valuation
- Obtain corresponding value of USDC liquidity

#### 3. Liquidity Provision (lendUSDC)
- USDC holders provide liquidity to the protocol
- Support multiple lenders participating in the same loan
- Earn lending interest income

#### 4. Repayment Redemption (repay)
- Landlord repays USDC to all lenders
- Automatically redeem staked RWA tokens
- Complete lending cycle

### 21-Step Complete Transaction Process
1. **Offline Compliance Stage (Steps 1-4)**: Store audit → Contract signing → Data entry → RWAKey generation
2. **AI Tokenization Stage (Steps 5-14)**: User input → AI processing → Contract call → Functions query → Token minting
3. **DeFi Lending Stage (Steps 15-18)**: Token staking → Price valuation → Liquidity provision → Fund transfer
4. **Repayment Redemption Stage (Steps 19-21)**: USDC repayment → Automatic distribution → Token redemption

## 🛡️ Security Features

- **Offline Compliance Guarantee**: Real contract signing, low legal risk
- **Reentrancy Attack Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Role-based access control, only authorized issuers can mint tokens
- **Price Oracle**: Chainlink decentralized price source, prevents price manipulation
- **Encrypted Storage**: DON network securely stores API keys
- **Parameter Validation**: AI agent intelligently validates wallet address and RWAKey format
- **Multi-signature**: Supports complex lending logic for multiple lenders

## 🏗️ Technical Architecture Details

### Smart Contract Architecture
```
ERC1155Core (Base Contract)
    ↓
RealRentToken (Rental Token)
    ↓
RentIssuer (Token Issuance) ←→ Chainlink Functions
    ↓
RentLending (DeFi Lending) ←→ Chainlink Price Feeds
```

### AI Agent Architecture
```
ElizaOS Framework
    ↓
getRwaPlugin (RWA Plugin)
    ↓
Actions: getRwa → lendRwa → lendUsdc → repay
    ↓
Multi-Platform: CLI + Twitter + HTTP API
```

### Data Flow Architecture
```
Offline Store → Supabase Database → Chainlink Functions → Smart Contract → AI Agent → User
```

## 🌐 Supported Networks

- **Avalanche Fuji** (Testnet) - Primary deployment network
- **EVM-Compatible Networks** - Expandable to other chains
- **Cross-Chain Support** - Reserved interface for future CCIP integration

## 📄 License

MIT License

## ⚠️ Disclaimer

This is an example project using hardcoded values for demonstration purposes. Do not use unaudited code in production environments.

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve the project.

## 📞 Contact

For questions or suggestions, please contact us through GitHub Issues.

---

## 🎯 Hackathon Information

**Chromion Chainlink Hackathon 2025**
*Building the Future, Onchain*

### Target Prize Tracks
- **Onchain Finance ($50,000)**: Real estate tokenization and DeFi lending
- **ElizaOS DeFi Agents ($16,500)**: AI agent-driven DeFi interactions
- **Avalanche Track ($10,000)**: Deployed on Avalanche network
- **Chainlink Grand Prize ($35,000)**: Deep integration of Functions and Price Feeds

### Key Innovation Points
1. **Compliance Assurance**: Offline store auditing, low legal risk
2. **User Experience Revolution**: Natural language replaces complex operations
3. **Complete Technology Stack**: AI + Blockchain + Oracle
4. **Real Problem Solving**: Genuine demand for rental liquidity

### Demo Links
- **Smart Contracts**: Deployed on Avalanche Fuji Testnet
- **AI Agent**: ElizaOS-based multi-platform support
- **Documentation**: Complete technical documentation and presentation materials

---

*RentRWA - Making real estate investment as simple as chatting!*
