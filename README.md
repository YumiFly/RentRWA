# RentRWA - AI驱动的房地产租金代币化平台

一个基于区块链的房地产租金收益代币化（Real World Asset Tokenization）平台，结合AI代理和Chainlink预言机技术，让用户通过自然语言对话即可完成复杂的DeFi操作。

## 🏗️ 项目架构

### 核心组件
- **智能合约层**: 基于ERC1155的房地产租金代币化协议
- **AI代理层**: 基于ElizaOS框架的智能助手
- **预言机层**: Chainlink Functions和Price Feeds集成
- **数据层**: Supabase数据库存储房地产信息

## 🤖 主要功能

### 1. AI驱动的用户交互
- 自然语言处理，用户可通过对话获取RWA代币
- 支持命令行聊天和Twitter社交媒体交互
- 智能参数提取和验证

### 2. 房地产代币化
- ERC1155标准的多代币合约
- 自动铸造基于真实房地产数据的代币
- 支持批量操作和元数据管理

### 3. DeFi借贷协议
- RWA代币抵押借贷USDC
- 多方出借者参与
- Chainlink价格预言机集成

### 4. 跨链支持
- 基于Chainlink CCIP的跨链功能
- 支持Avalanche Fuji测试网
- EVM兼容网络扩展

## 📁 项目结构

```
RentRWA/
├── src/
│   ├── contracts/           # 智能合约
│   │   ├── ERC1155Core.sol
│   │   ├── RealRentToken.sol
│   │   ├── RentIssuer.sol
│   │   ├── RentLending.sol
│   │   └── FunctionsSource.sol
│   └── frontend/            # AI代理前端
│       ├── src/
│       │   ├── rwa-plugins/
│       │   ├── chat/
│       │   ├── clients/
│       │   └── database/
│       ├── scripts/
│       └── characters/
└── README.md
```

## 🔗 Chainlink集成文件

本项目深度集成了Chainlink的多项服务，以下是所有相关文件的链接：

### 智能合约中的Chainlink集成

#### 1. Chainlink Functions
- **[FunctionsSource.sol](src/contracts/FunctionsSource.sol)** - 定义JavaScript代码用于从Supabase获取房地产数据
- **[RentIssuer.sol](src/contracts/RentIssuer.sol)** - 使用Chainlink Functions自动铸造RWA代币

#### 2. Chainlink Price Feeds
- **[RentLending.sol](src/contracts/RentLending.sol)** - 集成USDC/USD价格预言机用于借贷估值

#### 3. Chainlink CCIP (跨链互操作协议)
- **[RealRentToken.sol](src/contracts/RealRentToken.sol)** - 集成CCIP路由器支持跨链功能

### 前端中的Chainlink集成

#### 1. Chainlink Functions工具包
- **[package.json](src/frontend/package.json)** - 依赖`@chainlink/functions-toolkit`
- **[uploadToDON.js](src/frontend/scripts/uploadToDON.js)** - 上传加密密钥到Chainlink DON网络
- **[getRwa.ts](src/frontend/src/rwa-plugins/actions/getRwa.ts)** - AI代理调用Chainlink Functions合约

#### 2. 数据库API测试
- **[testDBApi.js](src/frontend/scripts/testDBApi.js)** - 测试Supabase API连接（Chainlink Functions的数据源）

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
创建 `.env` 文件：
```env
# Chainlink相关
ETHEREUM_PROVIDER_AVALANCHEFUJI=your_rpc_url
EVM_PRIVATE_KEY=0x...
SUPABASE_API_KEY=your_supabase_key

# AI模型
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Twitter (可选)
TWITTER_USERNAME=your_bot_username
TWITTER_PASSWORD=your_bot_password
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

### 命令行交互
```
You: 我的钱包地址是0x1234...，RWA密钥是ABC123，请帮我获取代币
Agent: 正在为您处理RWA代币请求...
Agent: 成功调用合约！交易哈希: 0xdef456...
```

### Twitter交互
用户可以在Twitter上@机器人并发送类似请求，AI代理会自动处理并回复交易结果。

## 🔧 技术特性

### Chainlink集成亮点
1. **Functions**: 去中心化数据获取，从Supabase安全获取房地产信息
2. **Price Feeds**: 实时USDC/USD汇率用于借贷估值
3. **CCIP**: 跨链代币转移和数据同步
4. **DON**: 去中心化预言机网络确保数据可信性

### AI代理特性
1. **自然语言处理**: 智能提取钱包地址和RWA密钥
2. **多平台支持**: 命令行、Twitter、HTTP API
3. **角色系统**: 可配置的AI角色和对话风格
4. **错误处理**: 智能错误检测和用户引导

## 🏦 DeFi协议功能

### 代币发行流程
1. 用户提供RWA密钥和钱包地址
2. Chainlink Functions查询Supabase数据库
3. 验证房地产信息和截止时间
4. 自动铸造对应数量的RWA代币

### 借贷流程
1. RWA代币持有者抵押代币
2. Chainlink Price Feeds获取USDC汇率
3. 计算可借贷金额
4. USDC出借者提供流动性
5. 借款人还款后赎回抵押品

## 🛡️ 安全特性

- **重入攻击保护**: 使用OpenZeppelin的ReentrancyGuard
- **权限控制**: 基于角色的访问控制
- **价格预言机**: Chainlink去中心化价格源
- **加密存储**: DON网络安全存储API密钥

## 🌐 支持的网络

- Avalanche Fuji (测试网)
- 可扩展到其他EVM兼容网络

## 📄 许可证

MIT License

## ⚠️ 免责声明

这是一个示例项目，使用了硬编码值以便演示。请勿在生产环境中使用未经审计的代码。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系我们。