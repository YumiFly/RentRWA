import dotenv from "dotenv";

dotenv.config();

console.log("🦙 Ollama Configuration Test");
console.log("============================");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

console.log(`Ollama Base URL: ${OLLAMA_BASE_URL}`);
console.log(`Ollama Model: ${OLLAMA_MODEL}`);
console.log("");

async function checkOllamaService() {
  console.log("🔌 Checking Ollama service...");
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Ollama service is running");
      console.log(`   Available models: ${data.models?.length || 0}`);
      
      if (data.models && data.models.length > 0) {
        console.log("\n📋 Installed models:");
        data.models.forEach(model => {
          console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
        });
      }
      
      return data.models || [];
    } else {
      console.log(`❌ Ollama service error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama: ${error.message}`);
    console.log("   Make sure Ollama is running: ollama serve");
    return null;
  }
}

async function testModelAvailability(models) {
  console.log(`\n🔍 Checking if model '${OLLAMA_MODEL}' is available...`);
  
  const modelExists = models.some(model => model.name === OLLAMA_MODEL);
  
  if (modelExists) {
    console.log(`✅ Model '${OLLAMA_MODEL}' is installed`);
    return true;
  } else {
    console.log(`❌ Model '${OLLAMA_MODEL}' is not installed`);
    console.log(`   Available models: ${models.map(m => m.name).join(", ")}`);
    console.log(`   To install: ollama pull ${OLLAMA_MODEL}`);
    return false;
  }
}

async function testCompletion() {
  console.log(`\n🧠 Testing completion with '${OLLAMA_MODEL}'...`);
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: "Say 'Hello from Ollama!' if you can read this.",
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Completion test successful!");
      console.log(`   AI Response: "${data.response?.trim() || 'No response'}"`);
      console.log(`   Generation time: ${data.total_duration ? (data.total_duration / 1000000).toFixed(0) : 'unknown'}ms`);
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

async function showInstallationInstructions() {
  console.log("\n📥 Ollama Installation Instructions:");
  console.log("===================================");
  
  console.log("1. **Install Ollama:**");
  console.log("   macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh");
  console.log("   Windows: Download from https://ollama.com");
  console.log("");
  
  console.log("2. **Start Ollama service:**");
  console.log("   ollama serve");
  console.log("");
  
  console.log("3. **Install a model:**");
  console.log("   ollama pull llama3.2:3b    # Small, fast model (2GB)");
  console.log("   ollama pull llama3.2:1b    # Ultra-fast model (1GB)");
  console.log("");
  
  console.log("4. **Or run the setup script:**");
  console.log("   chmod +x scripts/setupOllama.sh");
  console.log("   ./scripts/setupOllama.sh");
}

async function main() {
  const models = await checkOllamaService();
  
  if (models === null) {
    await showInstallationInstructions();
    return;
  }
  
  if (models.length === 0) {
    console.log("⚠️  No models installed");
    console.log("   Install a model: ollama pull llama3.2:3b");
    return;
  }
  
  const modelAvailable = await testModelAvailability(models);
  
  if (modelAvailable) {
    const completionOk = await testCompletion();
    
    if (completionOk) {
      console.log("\n🎉 Ollama configuration is working perfectly!");
      console.log("\n🚀 Next steps:");
      console.log("   1. Your ElizaOS is now configured to use Ollama (FREE!)");
      console.log("   2. Start the application: pnpm start");
      console.log("   3. Enjoy unlimited local AI processing");
      
      console.log("\n💡 Benefits of Ollama:");
      console.log("   ✅ Completely free");
      console.log("   ✅ No API quotas or limits");
      console.log("   ✅ Works offline");
      console.log("   ✅ No geographic restrictions");
      console.log("   ✅ Privacy-focused (data stays local)");
    }
  } else {
    console.log(`\n🔧 To fix: ollama pull ${OLLAMA_MODEL}`);
  }
}

main().catch(console.error);
