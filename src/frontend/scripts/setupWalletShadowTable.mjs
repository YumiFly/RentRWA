import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("🗄️  Wallet Shadow Table Setup");
console.log("=============================");

async function checkTableExists() {
  console.log("🔍 Checking if wallet_shadow table exists...");
  
  try {
    const { data, error } = await supabase
      .from("wallet_shadow")
      .select("*")
      .limit(1);
    
    if (error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("❌ wallet_shadow table does not exist");
        return false;
      } else {
        console.error("❌ Error checking table:", error.message);
        return false;
      }
    }
    
    console.log("✅ wallet_shadow table exists");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return false;
  }
}

async function showTableStructure() {
  console.log("\n📋 Current table structure:");
  
  try {
    const { data, error } = await supabase
      .from("wallet_shadow")
      .select("*")
      .limit(5);
    
    if (error) {
      console.error("❌ Error fetching data:", error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log("✅ Sample records:");
      data.forEach((record, index) => {
        console.log(`${index + 1}. XID: ${record.xid}`);
        console.log(`   Private Key: ${record.private_key?.substring(0, 10)}...`);
        console.log(`   Created: ${record.created_at}`);
        console.log("");
      });
    } else {
      console.log("ℹ️  Table is empty");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function createTableSQL() {
  console.log("\n📝 SQL to create wallet_shadow table:");
  console.log(`
-- Create wallet_shadow table
CREATE TABLE IF NOT EXISTS wallet_shadow (
  id SERIAL PRIMARY KEY,
  xid TEXT UNIQUE NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_shadow_xid ON wallet_shadow(xid);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE wallet_shadow ENABLE ROW LEVEL SECURITY;

-- Example: Create policy to allow all operations (adjust as needed)
-- CREATE POLICY "Allow all operations on wallet_shadow" ON wallet_shadow
--   FOR ALL USING (true);
  `);
}

async function testCreateWallet() {
  console.log("\n🧪 Testing wallet creation...");
  
  const testXid = `test_user_${Date.now()}`;
  
  try {
    // Generate a test private key (in real implementation, this would be done securely)
    const testPrivateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    const { data, error } = await supabase
      .from("wallet_shadow")
      .insert({
        xid: testXid,
        private_key: testPrivateKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error("❌ Error creating test wallet:", error.message);
      return false;
    }
    
    console.log("✅ Test wallet created successfully:");
    console.log(`   XID: ${testXid}`);
    console.log(`   Private Key: ${testPrivateKey.substring(0, 10)}...`);
    
    // Clean up test data
    await supabase
      .from("wallet_shadow")
      .delete()
      .eq("xid", testXid);
    
    console.log("✅ Test data cleaned up");
    return true;
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function main() {
  try {
    const tableExists = await checkTableExists();
    
    if (tableExists) {
      await showTableStructure();
      await testCreateWallet();
    } else {
      await createTableSQL();
      console.log("\n⚠️  Please run the SQL above in your Supabase SQL editor to create the table.");
      console.log("   Then run this script again to test the functionality.");
    }
    
    console.log("\n💡 Usage in ElizaOS:");
    console.log("   User: 'I need a new wallet for RWA operations'");
    console.log("   Bot: Creates wallet, stores in DB, returns address");
    console.log("");
    console.log("🔧 Integration points:");
    console.log("   - Twitter xid is automatically extracted from context");
    console.log("   - Private key is securely generated and stored");
    console.log("   - Wallet address is returned for immediate use");
    console.log("   - Existing wallets are detected and returned");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

main().catch(console.error);
