import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("🧪 Create Wallet Action Test");
console.log("============================");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateCreateWallet(xid) {
  console.log(`\n🔧 Simulating wallet creation for xid: ${xid}`);
  
  try {
    // Step 1: Check if wallet already exists
    console.log("1️⃣ Checking for existing wallet...");
    const { data: existingWallet, error: checkError } = await supabase
      .from("wallet_shadow")
      .select("xid, private_key")
      .eq("xid", xid)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking existing wallet: ${checkError.message}`);
    }

    if (existingWallet) {
      const account = privateKeyToAccount(existingWallet.private_key);
      console.log("✅ Wallet already exists!");
      console.log(`   Address: ${account.address}`);
      return {
        xid,
        address: account.address,
        success: true,
        isNew: false
      };
    }

    // Step 2: Generate new wallet
    console.log("2️⃣ Generating new wallet...");
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    
    console.log(`   Generated address: ${account.address}`);
    console.log(`   Private key: ${privateKey.substring(0, 10)}...`);

    // Step 3: Store in database
    console.log("3️⃣ Storing in database...");
    const { error: insertError } = await supabase
      .from("wallet_shadow")
      .insert({
        xid: xid,
        private_key: privateKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Error storing wallet: ${insertError.message}`);
    }

    console.log("✅ Wallet created and stored successfully!");
    
    return {
      xid,
      address: account.address,
      success: true,
      isNew: true
    };

  } catch (error) {
    console.error("❌ Error:", error.message);
    return {
      xid,
      address: null,
      success: false,
      error: error.message
    };
  }
}

async function testActionRecognition() {
  console.log("\n🎯 Testing action recognition patterns:");
  
  const testCases = [
    "I need a new wallet for RWA operations",
    "Create a wallet for me",
    "I want to set up a new wallet", 
    "Generate a new wallet address",
    "I need a wallet to start using RWA",
    "Make me a wallet",
    "Set up wallet"
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. "${testCase}"`);
    
    // Simple keyword matching (similar to what the AI would do)
    const keywords = ["wallet", "create", "new", "generate", "setup", "set up", "make"];
    const matches = keywords.filter(keyword => 
      testCase.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const shouldTrigger = matches.length >= 1;
    console.log(`   Keywords found: ${matches.join(", ")}`);
    console.log(`   Should trigger: ${shouldTrigger ? "✅ YES" : "❌ NO"}`);
    console.log("");
  });
}

async function cleanupTestData() {
  console.log("\n🧹 Cleaning up test data...");
  
  try {
    const { error } = await supabase
      .from("wallet_shadow")
      .delete()
      .like("xid", "test_%");
    
    if (error) {
      console.error("❌ Cleanup error:", error.message);
    } else {
      console.log("✅ Test data cleaned up");
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

async function main() {
  try {
    // Test action recognition
    await testActionRecognition();
    
    // Test wallet creation
    const testXid = `test_${Date.now()}`;
    const result1 = await simulateCreateWallet(testXid);
    
    if (result1.success) {
      console.log(`\n✅ First creation result:`);
      console.log(`   XID: ${result1.xid}`);
      console.log(`   Address: ${result1.address}`);
      console.log(`   Is New: ${result1.isNew}`);
      
      // Test duplicate creation
      console.log(`\n🔄 Testing duplicate creation...`);
      const result2 = await simulateCreateWallet(testXid);
      
      console.log(`\n✅ Second creation result:`);
      console.log(`   XID: ${result2.xid}`);
      console.log(`   Address: ${result2.address}`);
      console.log(`   Is New: ${result2.isNew}`);
      console.log(`   Same address: ${result1.address === result2.address ? "✅ YES" : "❌ NO"}`);
    }
    
    // Cleanup
    await cleanupTestData();
    
    console.log("\n🎉 Test completed!");
    console.log("\n💡 Integration notes:");
    console.log("   - The createWallet action will be triggered by wallet-related keywords");
    console.log("   - XID is automatically extracted from Twitter context");
    console.log("   - Existing wallets are detected and returned");
    console.log("   - New wallets are securely generated and stored");
    console.log("   - The wallet address is returned for immediate use in other actions");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch(console.error);
