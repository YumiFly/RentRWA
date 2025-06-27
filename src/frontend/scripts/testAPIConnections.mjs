import dotenv from "dotenv";
import https from 'https';

dotenv.config();

console.log("🔌 API Connection Test");
console.log("======================");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log(`OpenAI API Key: ${OPENAI_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log(`Gemini API Key: ${GEMINI_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log("");

async function testOpenAI() {
  if (!OPENAI_API_KEY) {
    console.log("❌ OpenAI API Key not set, skipping test");
    return false;
  }

  console.log("🤖 Testing OpenAI API...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ OpenAI API accessible (${data.data?.length || 0} models available)`);
      return true;
    } else {
      console.log(`❌ OpenAI API error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenAI API connection failed: ${error.message}`);
    return false;
  }
}

async function testGemini() {
  if (!GEMINI_API_KEY) {
    console.log("❌ Gemini API Key not set, skipping test");
    return false;
  }

  console.log("🧠 Testing Gemini API...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`, {
      method: "GET",
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Gemini API accessible (${data.models?.length || 0} models available)`);
      return true;
    } else {
      console.log(`❌ Gemini API error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Gemini API connection failed: ${error.message}`);
    return false;
  }
}

async function testBasicConnectivity() {
  console.log("🌐 Testing basic connectivity...");
  
  const services = [
    "google.com",
    "openai.com", 
    "api.openai.com",
    "generativelanguage.googleapis.com"
  ];

  for (const service of services) {
    try {
      const response = await fetch(`https://${service}`, {
        method: "HEAD",
        timeout: 5000
      });
      console.log(`✅ ${service}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${service}: ${error.message}`);
    }
  }
}

async function main() {
  await testBasicConnectivity();
  console.log("");
  
  const openaiWorks = await testOpenAI();
  const geminiWorks = await testGemini();
  
  console.log("\n📊 Results:");
  console.log("===========");
  
  if (openaiWorks) {
    console.log("✅ OpenAI API is working - RECOMMENDED");
    console.log("   Your character.ts is now configured to use OpenAI");
    console.log("   You can start the application with: pnpm start");
  } else if (geminiWorks) {
    console.log("✅ Gemini API is working");
    console.log("   You can switch back to Gemini in character.ts if preferred");
  } else {
    console.log("❌ Both APIs are failing");
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check your internet connection");
    console.log("   2. Try using a VPN");
    console.log("   3. Check if your firewall is blocking API requests");
    console.log("   4. Verify your API keys are correct");
    console.log("   5. Try again in a few minutes");
  }
  
  if (openaiWorks || geminiWorks) {
    console.log("\n🚀 Next steps:");
    console.log("   1. Run: pnpm start");
    console.log("   2. Test Twitter integration");
    console.log("   3. Try the createWallet action");
  }
}

main().catch(console.error);
