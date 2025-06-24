# RentRWA - 线下合规+AI驱动的房租抵押借贷平台

一个创新的房地产租金收益代币化（Real World Asset Tokenization）平台，结合线下合规流程、ElizaOS AI代理和Chainlink预言机技术，让房东通过自然语言对话即可完成房租收益的代币化和抵押借贷。

## 🏗️ 项目架构

### 核心组件
- **线下合规层**: 门店审核、合同签订、数据录入
- **AI代理层**: 基于ElizaOS框架的智能助手，支持多平台交互
- **智能合约层**: 基于ERC1155的房租代币化和DeFi借贷协议
- **预言机层**: Chainlink Functions和Price Feeds集成
- **数据层**: Supabase数据库存储审核后的房地产信息

## 🤖 主要功能

### 1. 线下合规流程
- 房东到线下门店提供租赁合同和证明
- 工作人员审核评估，签订真实租金抵押合同
- 将房产信息录入Supabase数据库，生成唯一RWAKey

### 2. AI驱动的用户交互
- 基于ElizaOS框架的智能代理，支持自然语言处理
- 多平台支持：命令行聊天、Twitter社交媒体交互、HTTP API
- 智能参数提取和验证，一句话完成复杂DeFi操作

### 3. 房租收益代币化
- ERC1155标准的多代币合约，支持批量操作
- 通过Chainlink Functions自动获取审核后的房产数据
- 自动铸造基于真实房租收益的RWA代币

### 4. 完整的DeFi借贷生态
- **getRwa**: 房租代币化，AI调用智能合约铸造代币
- **lendRWA**: 质押借贷，房东质押RWA代币获得USDC
- **lendUSDC**: 流动性提供，USDC持有者提供流动性赚取利息
- **repay**: 还款赎回，完成借贷周期

### 5. 网络支持
- 部署在Avalanche Fuji测试网
- EVM兼容智能合约
- 支持跨链扩展

## 📁 项目结构

```
RentRWA/
├── src/
│   ├── contracts/                    # 智能合约层
│   │   ├── ERC1155Core.sol          # ERC1155基础合约
│   │   ├── RealRentToken.sol        # 房租收益代币合约
│   │   ├── RentIssuer.sol           # 代币发行合约(Chainlink Functions)
│   │   ├── RentLending.sol          # DeFi借贷合约(Price Feeds)
│   │   └── FunctionsSource.sol      # Chainlink Functions JavaScript代码
│   └── frontend/                    # AI代理层
│       ├── src/
│       │   ├── rwa-plugins/         # RWA专用插件
│       │   │   ├── actions/         # 四个核心action
│       │   │   │   ├── getRwa.ts    # 代币化action
│       │   │   │   ├── lendRwa.ts   # 质押借贷action
│       │   │   │   ├── lendUsdc.ts  # 流动性提供action
│       │   │   │   └── repay.ts     # 还款赎回action
│       │   │   ├── templates/       # AI模板
│       │   │   └── types/           # 类型定义
│       │   ├── light_twitter-clients/ # Twitter客户端
│       │   ├── chat/                # 命令行聊天
│       │   ├── clients/             # 多平台客户端
│       │   ├── database/            # 数据库适配器
│       │   └── config/              # 配置管理
│       ├── scripts/                 # 部署脚本
│       │   ├── uploadToDON.js       # Chainlink Functions密钥上传
│       │   └── testDBApi.js         # Supabase API测试
│       ├── characters/              # AI角色配置
│       └── package.json             # 依赖管理
├── docs/                            # 文档和演示材料
└── README.md
```

## 🔗 Chainlink集成文件

本项目深度集成了Chainlink的多项服务，以下是所有相关文件的链接：

### 智能合约中的Chainlink集成

#### 1. Chainlink Functions
- **[FunctionsSource.sol](src/contracts/FunctionsSource.sol)** - 定义JavaScript代码用于从Supabase获取房地产数据
- **[RentIssuer.sol](src/contracts/RentIssuer.sol)** - 使用Chainlink Functions自动铸造RWA代币 (部署在[Avalanche Fuji测试网](https://testnet.snowtrace.io/address/0x0382E466541f86a4Dcf73F2709aE8aF24B22dF4B#loaded))

#### 2. Chainlink Price Feeds
- **[RentLending.sol](src/contracts/RentLending.sol)** - 集成USDC/USD价格预言机用于借贷估值 (部署在[Avalanche Fuji测试网](https://testnet.snowtrace.io/address/0x0b5E917f561a23c57587243e21304D0263685Ed3#loaded))

#### 3. 房地产代币合约
- **[RealRentToken.sol](src/contracts/RealRentToken.sol)** - 基于ERC1155的房地产租金代币合约 (部署在[Avalanche Fuji测试网](https://testnet.snowtrace.io/address/0x2F4C90cab3fF7D6187F81447669E1eD9C6947BD8#loaded))

### 前端中的Chainlink集成

#### 1. ElizaOS AI代理插件
- **[getRwaPlugin](src/frontend/src/rwa-plugins/index.ts)** - 完整的RWA插件，包含四个核心action
- **[getRwa.ts](src/frontend/src/rwa-plugins/actions/getRwa.ts)** - AI代理调用Chainlink Functions合约
- **[lendRwa.ts](src/frontend/src/rwa-plugins/actions/lendRwa.ts)** - 质押借贷action
- **[lendUsdc.ts](src/frontend/src/rwa-plugins/actions/lendUsdc.ts)** - 流动性提供action
- **[repay.ts](src/frontend/src/rwa-plugins/actions/repay.ts)** - 还款赎回action

#### 2. Chainlink Functions工具包
- **[package.json](src/frontend/package.json)** - 依赖`@chainlink/functions-toolkit`
- **[uploadToDON.js](src/frontend/scripts/uploadToDON.js)** - 上传加密密钥到Chainlink DON网络
- **[testDBApi.js](src/frontend/scripts/testDBApi.js)** - 测试Supabase API连接（Chainlink Functions的数据源）

#### 3. AI模板和类型定义
- **[getRwaTemplate](src/frontend/src/rwa-plugins/templates/index.ts)** - AI自然语言处理模板
- **[types](src/frontend/src/rwa-plugins/types/index.ts)** - TypeScript类型定义

## 🚀 快速开始

### 环境要求
- Node.js >= 22
- pnpm
- Solidity 0.8.24

### 安装依赖
```bash
cd src/frontend
pnpm install
```

### 环境变量配置
创建 `.env` 文件（参考 `.env.example`）：
```env
# 必需的环境变量
GEMINI_API_KEY=your_google_gemini_api_key
EVM_PRIVATE_KEY=0x...
ETHEREUM_PROVIDER_AVALANCHEFUJI=your_avalanche_fuji_rpc_url
SUPABASE_API_KEY=your_supabase_public_anon_key

# Twitter集成 (可选)
TWITTER_USERNAME=your_bot_username
TWITTER_PASSWORD=your_bot_password
TWITTER_EMAIL=your@email.com
TWITTER_POLL_INTERVAL=30
TWITTER_DRY_RUN=false
TWITTER_RETRY_LIMIT=5
```

### 部署Chainlink Functions密钥
```bash
cd src/frontend
node scripts/uploadToDON.js
```

### 启动AI代理
```bash
pnpm start
```

## 💡 使用示例

### 完整业务流程

#### 第一步：线下合规（一次性）
1. 房东到线下门店，提供租赁合同和合法持有证明
2. 工作人员审核评估，签订租金抵押合同
3. 将房产信息录入Supabase数据库，生成唯一RWAKey

#### 第二步：AI代币化（30秒完成）
```
You: 我的钱包地址是0x208aa722aca42399eac5192ee778e4d42f4e5de3，
     RWA密钥是Nbbut8vlkKe9991Z4Z4，请帮我通证化租金收益

Agent: 正在为您处理房租代币化请求...
       📥 Transaction Hash: 0xdef456...
       🆔 RWA TokenId: 1
       📦 RWA Token amount: 1000
       成功！您的房租收益已代币化，现在可以用于抵押借贷获得USDC流动资金！
```

#### 第三步：DeFi借贷（可选）
```
You: 我想用RWA代币质押借贷USDC
Agent: 正在处理质押借贷请求...
Agent: 成功质押！您已获得USDC流动资金，交易哈希: 0xabc123...
```

### 多平台支持
- **命令行交互**：本地聊天界面，适合开发和测试
- **Twitter交互**：用户可以在Twitter上@机器人发送请求
- **HTTP API**：支持第三方应用集成

## 🔧 技术特性

### Chainlink集成亮点
1. **Functions**: 去中心化数据获取，从Supabase安全获取线下审核的房产信息
2. **Price Feeds**: 实时USDC/USD汇率用于DeFi借贷估值
3. **DON**: 去中心化预言机网络确保数据可信性和抗审查

### ElizaOS AI代理特性
1. **自然语言处理**: 智能提取钱包地址和RWA密钥，支持中英文
2. **多平台支持**: 命令行聊天、Twitter社交媒体、HTTP API
3. **完整插件系统**: 四个核心action（getRwa、lendRwa、lendUsdc、repay）
4. **角色系统**: 可配置的AI角色（Eliza、Trump、Tate等）
5. **错误处理**: 智能错误检测、参数验证和用户引导
6. **实时交互**: 支持多轮对话和上下文理解

## 🏦 完整的DeFi生态

### 四个核心功能模块

#### 1. 租金代币化 (getRwa)
- 房东提供RWAKey，AI代理调用RentIssuer合约
- Chainlink Functions查询Supabase获取审核后的房产数据
- 自动铸造ERC1155格式的房租收益代币

#### 2. 质押借贷 (lendRWA)
- 房东质押RWA代币到RentLending合约
- Chainlink Price Feeds获取USDC汇率进行估值
- 获得对应价值的USDC流动资金

#### 3. 流动性提供 (lendUSDC)
- USDC持有者向协议提供流动性
- 支持多个出借者参与同一笔贷款
- 获得借贷利息收入

#### 4. 还款赎回 (repay)
- 房东还款USDC给所有出借者
- 自动赎回质押的RWA代币
- 完成借贷周期

### 21步完整交易流程
1. **线下合规阶段（1-4步）**：门店审核 → 合同签订 → 数据录入 → RWAKey生成
2. **AI代币化阶段（5-14步）**：用户输入 → AI处理 → 合约调用 → Functions查询 → 代币铸造
3. **DeFi借贷阶段（15-18步）**：代币质押 → 价格估值 → 流动性提供 → 资金转移
4. **还款赎回阶段（19-21步）**：USDC还款 → 自动分配 → 代币赎回

## 🛡️ 安全特性

- **线下合规保障**: 真实合同签订，法律风险低
- **重入攻击保护**: 使用OpenZeppelin的ReentrancyGuard
- **权限控制**: 基于角色的访问控制，只有授权发行者可铸造代币
- **价格预言机**: Chainlink去中心化价格源，防止价格操纵
- **加密存储**: DON网络安全存储API密钥
- **参数验证**: AI代理智能验证钱包地址和RWAKey格式
- **多重签名**: 支持多方出借者的复杂借贷逻辑

## �️ 技术架构详解

### 智能合约架构
```
ERC1155Core (基础合约)
    ↓
RealRentToken (房租代币)
    ↓
RentIssuer (代币发行) ←→ Chainlink Functions
    ↓
RentLending (DeFi借贷) ←→ Chainlink Price Feeds
```

### AI代理架构
```
ElizaOS Framework
    ↓
getRwaPlugin (RWA插件)
    ↓
Actions: getRwa → lendRwa → lendUsdc → repay
    ↓
Multi-Platform: CLI + Twitter + HTTP API
```

### 数据流架构
```
线下门店 → Supabase数据库 → Chainlink Functions → 智能合约 → AI代理 → 用户
```

## �🌐 支持的网络

- **Avalanche Fuji** (测试网) - 主要部署网络
- **EVM兼容网络** - 可扩展到其他链
- **跨链支持** - 为未来CCIP集成预留接口

## 📄 许可证

MIT License

## ⚠️ 免责声明

这是一个示例项目，使用了硬编码值以便演示。请勿在生产环境中使用未经审计的代码。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系我们。