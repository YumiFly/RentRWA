# RentRWA - Chromion Chainlink Hackathon 演示PPT

## 幻灯片1: 标题页
---
### RentRWA
**AI驱动的房地产租金代币化平台**

*Chromion Chainlink Hackathon 2025*

**Building the Future of Onchain Finance**

---

## 幻灯片2: 问题陈述
---
### 当前痛点

🏠 **房租收益流动性不足**
- 房东持有租赁合同，但资金被锁定
- 房租收益无法快速变现获得流动性

🔧 **传统抵押流程复杂**
- 银行抵押手续繁琐，周期长
- DeFi操作对普通用户门槛高

📊 **缺乏可信的链上房租数据**
- 线下租赁合同无法直接上链
- 缺乏去中心化的租金数据验证机制

---

## 幻灯片3: 解决方案
---
### RentRWA = 线下合规 + AI + Chainlink + 房租抵押借贷

#### **💬 线下到线上无缝衔接**
"我的地址是0x123..., RWA密钥是ABC123，请帮我通证化租金收益"

#### **🔗 Chainlink多服务深度集成**
🔧 **Chainlink Functions**
- 从Supabase安全获取房租收益数据
- JavaScript代码在DON网络执行
- 加密存储API密钥

📈 **Chainlink Price Feeds**
- 实时USDC/USD汇率
- 借贷估值计算
- 防止价格操纵

🌐 **Chainlink DON**
- 去中心化预言机网络
- 数据可信性保证
- 抗审查和故障

#### **🤖 ElizaOS AI代理智能化交互**
🧠 **自然语言处理**
- 智能提取钱包地址和RWA密钥
- 上下文理解和多轮对话
- 错误检测和用户引导

🔄 **自动化流程**
- 参数验证和格式检查
- 智能合约调用
- 交易状态跟踪

📱 **多平台支持**
- 命令行聊天界面
- Twitter社交媒体集成
- HTTP API接口

#### **⚡ 用户交互流程**
**用户输入:**
```
"我的钱包地址是0x208aa722aca42399eac5192ee778e4d42f4e5de3，
RWA密钥是Nbbut8vlkKe9991Z4Z4，请帮我代币化房产"
```

**AI代理处理:**
1. � 智能提取参数
2. ✅ 验证地址和密钥格式
3. 🌐 调用Chainlink Functions查询房产数据
4. ⚡ 自动铸造RWA代币
5. 💰 代币可用于抵押借贷USDC

**结果:**
```
"成功调用合约！交易哈希: 0xdef456..."
```

---

## 幻灯片4: 完整业务流程架构
---
### 线下+线上结合的创新模式

```mermaid
graph TB
    subgraph "线下合规流程"
        A1[房东持有租赁合同] --> A2[到线下门店]
        A2 --> A3[提供合法持有证明<br/>和租赁合同]
        A3 --> A4[门店工作人员评估]
        A4 --> A5[签订租金抵押合同]
        A5 --> A6[录入Supabase数据库<br/>房屋信息+抵押金额]
        A6 --> A7[生成RWAKey<br/>告知用户]
    end

    subgraph "线上AI流程"
        B1[用户Twitter/命令行输入<br/>地址+RWAKey]
        B2[ElizaOS AI代理<br/>自然语言处理]
        B3[智能参数提取<br/>和验证]
        B4[调用RentIssuer合约]
    end

    subgraph "Chainlink预言机"
        C1[Chainlink Functions<br/>查询Supabase]
        C2[DON网络<br/>去中心化执行]
        C3[返回房产数据<br/>价格+截止时间+证明]
    end

    subgraph "DeFi生态"
        D1[铸造RWA代币<br/>ERC1155]
        D2[质押RWA代币<br/>获得USDC]
        D3[USDC流动性<br/>提供者参与]
        D4[还款赎回<br/>完成周期]
    end

    A7 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4

    classDef offline fill:#ffe0e0,stroke:#ff6b6b,stroke-width:2px
    classDef ai fill:#e1f5fe,stroke:#2196f3,stroke-width:2px
    classDef oracle fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef defi fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px

    class A1,A2,A3,A4,A5,A6,A7 offline
    class B1,B2,B3,B4 ai
    class C1,C2,C3 oracle
    class D1,D2,D3,D4 defi
```

---

## 幻灯片5: Chainlink集成深度
---
### 多服务深度集成

🔧 **Chainlink Functions**
- 从Supabase安全获取房租收益数据
- JavaScript代码在DON网络执行
- 加密存储API密钥

📈 **Chainlink Price Feeds**
- 实时USDC/USD汇率
- 借贷估值计算
- 防止价格操纵

🌐 **Chainlink DON**
- 去中心化预言机网络
- 数据可信性保证
- 抗审查和故障

---

## 幻灯片6: ElizaOS AI代理
---
### 智能化用户交互

🧠 **自然语言处理**
- 智能提取钱包地址和RWA密钥
- 上下文理解和多轮对话
- 错误检测和用户引导

🔄 **自动化流程**
- 参数验证和格式检查
- 智能合约调用
- 交易状态跟踪

📱 **多平台支持**
- 命令行聊天界面
- Twitter社交媒体集成
- HTTP API接口

---

## 幻灯片7: 用户交互流程
---
### 一句话完成代币化

**用户输入:**
```
"我的钱包地址是0x208aa722aca42399eac5192ee778e4d42f4e5de3，
RWA密钥是Nbbut8vlkKe9991Z4Z4，请帮我代币化房产"
```

**AI代理处理:**
1. 🔍 智能提取参数
2. ✅ 验证地址和密钥格式
3. 🌐 调用Chainlink Functions查询房产数据
4. ⚡ 自动铸造RWA代币
5. � 代币可用于抵押借贷USDC

**结果:**
```
"成功调用合约！交易哈希: 0xdef456..."
```

---

## 幻灯片8: 完整的DeFi生态
---
### 完整的DeFi交易流程

```mermaid
sequenceDiagram
    participant 房东 as 🏠 房东
    participant 门店 as 🏢 线下门店
    participant 数据库 as 🗄️ Supabase数据库
    participant AI as 🤖 ElizaOS AI代理
    participant 合约 as 📄 RentIssuer合约
    participant Functions as 🔗 Chainlink Functions
    participant 借贷 as 🏦 RentLending合约
    participant 出借者 as 💰 USDC出借者

    Note over 房东,数据库: 线下合规阶段
    房东->>门店: 1. 提供租赁合同和证明
    门店->>门店: 2. 审核评估
    门店->>数据库: 3. 录入房产信息
    门店->>房东: 4. 提供RWAKey

    Note over 房东,Functions: 线上AI代币化阶段
    房东->>AI: 5. "地址0x123, RWAKey ABC123"
    AI->>AI: 6. 智能提取参数
    AI->>合约: 7. 调用issue()函数
    合约->>Functions: 8. 发起Functions请求
    Functions->>数据库: 9. 查询房产数据
    数据库-->>Functions: 10. 返回价格、截止时间
    Functions-->>合约: 11. 返回编码数据
    合约->>合约: 12. 铸造RWA代币
    合约-->>AI: 13. 返回交易哈希
    AI-->>房东: 14. "成功！交易哈希: 0xdef456"

    Note over 房东,出借者: DeFi借贷阶段
    房东->>借贷: 15. 质押RWA代币
    借贷->>借贷: 16. Price Feeds估值
    出借者->>借贷: 17. 提供USDC流动性
    借贷->>房东: 18. 转移USDC给房东
    
    Note over 房东,出借者: 还款赎回阶段
    房东->>借贷: 19. 还款USDC
    借贷->>出借者: 20. 分配USDC给出借者
    借贷->>房东: 21. 返还RWA代币
```

**核心特点：**
- 🔄 **完整闭环**：四个模块形成完整的DeFi生态循环
- 🤖 **AI驱动**：ElizaOS智能代理简化用户操作
- 🔗 **Chainlink保障**：Functions和Price Feeds确保数据可信
- 💰 **多方共赢**：房东获得流动性，出借者获得收益

---

## 幻灯片9: 技术实现展示
---
### 核心代码实现

**1. Chainlink Functions数据获取:**
```javascript
// FunctionsSource.sol - 从Supabase获取房产数据
const apiResponse = await Functions.makeHttpRequest({
    url: "https://sjqyhjmhwtjbwfolqznu.supabase.co/rest/v1/rent_rwa_lend?select=*",
    method: "GET",
    headers: { "apikey": secrets.apikey }
});
const item = apiResponse.data.find(item => item.rwa_id == rwaKey);
return abiCoder.encode(['uint256','uint256','string'],
    [deadlineTime, item.price, item.proof_url]);
```

**2. AI代理智能合约调用:**
```typescript
// getRwa.ts - ElizaOS插件实现
const getRentIssuerContract = getContract({
    address: contractAddress,
    abi,
    client: walletClient
});
const hash = await getRentIssuerContract.write.issue(userAddr, [rwaKey]);
```

**3. 自然语言处理模板:**
```typescript
// getRwaTemplate - AI智能提取参数
"Your goal is to extract: 1. rwa code, 2. Wallet address"
// AI自动识别: "地址是0x123..., RWA密钥是ABC123"
// 输出: {rwaKey: "ABC123", address: "0x123..."}
```

---

## 幻灯片10: 创新亮点
---
### 技术创新与突破

🚀 **业务模式创新**
- 线下合规+线上便捷的房租抵押借贷
- 四个完整功能模块：代币化→质押→出借→还款
- 传统金融与DeFi的完美结合

🤖 **AI技术创新**
- ElizaOS框架深度集成，支持Twitter等多平台
- 自然语言智能提取钱包地址和RWAKey
- 一句话完成复杂的智能合约调用

🔗 **Chainlink集成创新**
- Functions获取线下审核的房产数据
- Price Feeds实现精确的USDC估值
- DON网络确保数据去中心化可信

---

## 幻灯片11: 市场价值
---
### 巨大的市场潜力

📈 **市场规模**
- 全球房地产市场: $280万亿
- RWA代币化市场快速增长
- DeFi总锁仓量: $1000亿+

👥 **用户群体扩展**
- 小额投资者参与房租收益
- 降低房租投资门槛
- 提升房租收益流动性

💡 **商业价值**
- 交易手续费收入
- 数据服务费
- AI代理订阅模式

---

## 幻灯片12: 技术路线图
---
### 未来发展规划

**Q2 2025: 核心功能**
- ✅ Chainlink Functions集成
- ✅ AI代理基础功能
- ✅ 基础借贷协议

**Q3 2025: 功能扩展**
- 🔄 Chainlink CCIP跨链功能
- 🏢 更多RWA资产类型
- 🤖 高级AI功能

**Q4 2025: 生态建设**
- 🌐 多链部署
- 🏦 机构合作
- 📱 移动端应用

---

## 幻灯片13: 商业模式
---
### 可持续的盈利模式

💰 **收入来源**
- 代币铸造手续费: 0.5%
- 借贷协议手续费: 0.3%
- AI代理订阅费: $10/月

📊 **成本结构**
- Chainlink服务费用
- 云服务和存储
- 开发和运营成本

🎯 **盈利预测**
- 年交易量目标: $100M
- 预期年收入: $500K
- 用户增长: 10K+ 活跃用户

---

## 幻灯片14: 结尾
---
### 谢谢观看！

🌟 **RentRWA - 让房地产投资像聊天一样简单**

📱 **联系我们:**
- GitHub: https://github.com/YumiFly/RentRWA

🏆 **Chromion Chainlink Hackathon 2025**
*Building the Future, Onchain*

**让我们一起用AI和Chainlink重新定义房地产投资！**

---
