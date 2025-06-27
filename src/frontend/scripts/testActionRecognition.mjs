import dotenv from "dotenv";
dotenv.config();

// Mock the ElizaOS action recognition logic
const actions = [
  {
    name: "get rwa",
    description: "Get RWA tokens by providing wallet address and RWA key",
    similes: ["GET_RWA", "MINT_RWA", "ISSUE_RWA", "CREATE_RWA", "GENERATE_RWA"]
  },
  {
    name: "lend rwa", 
    description: "Given a tokenId and amountRwa, lend the corresponding RWA NFT to the lending contract",
    similes: ["LEND_RWA", "RWA_LEND", "PUT_UP_RWA", "STAKE_RWA", "RWA_STAKE"]
  },
  {
    name: "lend usdc",
    description: "Given a tokenId and amountUsdc, lend USDC to get RWA tokens", 
    similes: ["LEND_USDC", "USDC_LEND", "PUT_UP_USDC", "APPROVE_USDC", "USDC_APPROVE", "BUY_RWA", "PURCHASE_RWA", "USE_USDC", "PAY_USDC"]
  },
  {
    name: "repay",
    description: "Repay RWA loan with USDC",
    similes: ["REPAY", "PAY_BACK", "RETURN_LOAN", "SETTLE_DEBT"]
  }
];

const testCases = [
  "I'd like to use 2 USDC to buy the RWA token with ID 13",
  "I want to purchase the RWA token with token ID 1 using 5 USDC",
  "I'd like to use 4 USDC to buy the RWA token with ID 3",
  "I intend to purchase the RWA token identified by token ID 1 by paying 5 USDC",
  "I want to lend 10 RWA tokens with token ID 1 for USDC",
  "I would like to exchange 2 RWA tokens for some USDC. My tokenId is 2",
  "I intend to lend 10 RWA tokens under token ID 1 in exchange for USDC",
  "my wallet address is 0x208aa722aca42399eac5192ee778e4d42f4e5de3 and my rwa key is Nbbut8vlkKe9991Z4Z4",
  "I would like to repay my RWA loan with token ID 1, total 5 USDC"
];

function analyzeIntent(text) {
  const lowerText = text.toLowerCase();
  
  // Keywords for different actions
  const keywords = {
    lendUsdc: ["use usdc", "buy rwa", "purchase rwa", "pay usdc", "using usdc", "with usdc", "usdc to buy", "usdc to get"],
    lendRwa: ["lend rwa", "exchange rwa", "rwa tokens for", "rwa for usdc", "stake rwa"],
    getRwa: ["wallet address", "rwa key", "mint", "issue", "generate rwa"],
    repay: ["repay", "pay back", "return loan", "settle"]
  };
  
  // Score each action based on keyword matches
  const scores = {
    lendUsdc: 0,
    lendRwa: 0, 
    getRwa: 0,
    repay: 0
  };
  
  for (const [action, actionKeywords] of Object.entries(keywords)) {
    for (const keyword of actionKeywords) {
      if (lowerText.includes(keyword)) {
        scores[action] += 1;
      }
    }
  }
  
  // Find the action with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return "unknown";
  
  const predictedAction = Object.entries(scores).find(([_, score]) => score === maxScore)[0];
  return predictedAction;
}

function extractParameters(text, action) {
  const params = {};
  
  // Extract tokenId/ID
  const idMatch = text.match(/(?:token\s*id|id)\s*:?\s*(\d+)/i) || 
                  text.match(/with\s*id\s*(\d+)/i) ||
                  text.match(/token\s*(\d+)/i);
  if (idMatch) {
    params.tokenId = parseInt(idMatch[1]);
  }
  
  // Extract amounts
  const usdcMatch = text.match(/(\d+)\s*usdc/i);
  if (usdcMatch) {
    params.amountUsdc = parseInt(usdcMatch[1]);
  }
  
  const rwaMatch = text.match(/(\d+)\s*rwa/i);
  if (rwaMatch) {
    params.amountRwa = parseInt(rwaMatch[1]);
  }
  
  // Extract wallet address
  const addressMatch = text.match(/(0x[a-fA-F0-9]{40})/);
  if (addressMatch) {
    params.address = addressMatch[1];
  }
  
  // Extract RWA key
  const keyMatch = text.match(/rwa\s*key\s*(?:is\s*)?([a-zA-Z0-9]+)/i);
  if (keyMatch) {
    params.rwaKey = keyMatch[1];
  }
  
  return params;
}

console.log("🤖 Action Recognition Test");
console.log("==========================");
console.log("");

console.log("Available Actions:");
actions.forEach(action => {
  console.log(`- ${action.name}: ${action.description}`);
  console.log(`  Similes: ${action.similes.join(", ")}`);
  console.log("");
});

console.log("Test Cases:");
console.log("-----------");

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. "${testCase}"`);
  
  const predictedAction = analyzeIntent(testCase);
  const params = extractParameters(testCase, predictedAction);
  
  console.log(`   Predicted Action: ${predictedAction}`);
  console.log(`   Extracted Params: ${JSON.stringify(params)}`);
  
  // Expected action based on manual analysis
  let expected = "unknown";
  if (testCase.includes("use") && testCase.includes("USDC") && testCase.includes("buy")) {
    expected = "lendUsdc";
  } else if (testCase.includes("lend") && testCase.includes("RWA")) {
    expected = "lendRwa";
  } else if (testCase.includes("wallet address") && testCase.includes("rwa key")) {
    expected = "getRwa";
  } else if (testCase.includes("repay")) {
    expected = "repay";
  }
  
  const isCorrect = predictedAction === expected;
  console.log(`   Expected: ${expected} ${isCorrect ? "✅" : "❌"}`);
  console.log("");
});

console.log("💡 Analysis:");
console.log("- The issue might be that both 'lend rwa' and 'lend usdc' actions had the same name");
console.log("- We've now fixed this by changing 'lend usdc' action name to 'lend usdc'");
console.log("- Added more specific keywords and examples for 'lend usdc' action");
console.log("- The AI should now better distinguish between lending RWA vs lending USDC");
console.log("");
console.log("🔧 Next steps:");
console.log("1. Restart the ElizaOS application");
console.log("2. Test with the exact phrase: 'I'd like to use 2 USDC to buy the RWA token with ID 13'");
console.log("3. Check the logs to see which action is being triggered");
