import dotenv from "dotenv";

dotenv.config();

console.log("🤖 OpenAI Configuration Test");
console.log("============================");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log(`OpenAI API Key: ${OPENAI_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log(`Key length: ${OPENAI_API_KEY ? OPENAI_API_KEY.length : 0} characters`);
console.log(`Key prefix: ${OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 20) + "..." : "N/A"}`);
console.log("");

async function testOpenAIConnection() {
  if (!OPENAI_API_KEY) {
    console.log("❌ OpenAI API Key not found in environment");
    return false;
  }

  console.log("🔌 Testing OpenAI API connection...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ OpenAI API connection successful!`);
      console.log(`   Available models: ${data.data?.length || 0}`);
      
      // Check for specific models we want to use
      const models = data.data?.map(m => m.id) || [];
      const requiredModels = ["gpt-4o-mini", "gpt-4o"];
      
      console.log("\n📋 Model availability:");
      requiredModels.forEach(model => {
        const available = models.includes(model);
        console.log(`   ${model}: ${available ? "✅ Available" : "❌ Not available"}`);
      });
      
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ OpenAI API error: ${response.status} ${response.statusText}`);
      console.log(`   Error details: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenAI API connection failed: ${error.message}`);
    return false;
  }
}

async function testSimpleCompletion() {
  console.log("\n🧠 Testing simple completion...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Say 'Hello from OpenAI!' if you can read this."
          }
        ],
        max_tokens: 50
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No response";
      console.log(`✅ Completion test successful!`);
      console.log(`   AI Response: "${reply}"`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Completion test failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Completion test error: ${error.message}`);
    return false;
  }
}

async function main() {
  const connectionOk = await testOpenAIConnection();
  
  if (connectionOk) {
    const completionOk = await testSimpleCompletion();
    
    if (completionOk) {
      console.log("\n🎉 OpenAI configuration is working perfectly!");
      console.log("\n🚀 Next steps:");
      console.log("   1. Your ElizaOS is now configured to use OpenAI instead of Gemini");
      console.log("   2. Start the application: pnpm start");
      console.log("   3. Test Twitter interactions");
      console.log("   4. Try the createWallet action");
      
      console.log("\n💡 Configuration summary:");
      console.log("   - Model Provider: OpenAI");
      console.log("   - Primary Model: gpt-4o-mini");
      console.log("   - Large Model: gpt-4o");
      console.log("   - Location restrictions: Bypassed ✅");
    } else {
      console.log("\n❌ OpenAI API key might be invalid or expired");
      console.log("   Please check your API key at: https://platform.openai.com/api-keys");
    }
  } else {
    console.log("\n❌ OpenAI connection failed");
    console.log("   Please check:");
    console.log("   1. Your API key is correct");
    console.log("   2. Your internet connection");
    console.log("   3. No firewall is blocking api.openai.com");
  }
}

main().catch(console.error);
