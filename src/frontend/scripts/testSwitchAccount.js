import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWalletShadowTable() {
  console.log("Testing wallet_shadow table...");
  
  try {
    // First, let's check if the table exists by trying to query it
    const { data, error } = await supabase
      .from("wallet_shadow")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error querying wallet_shadow table:", error.message);
      
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("\n❌ wallet_shadow table does not exist.");
        console.log("You need to create this table in your Supabase database with the following SQL:");
        console.log(`
CREATE TABLE wallet_shadow (
  id SERIAL PRIMARY KEY,
  xid TEXT UNIQUE NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample data
INSERT INTO wallet_shadow (xid, private_key) VALUES 
('user1', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
('user2', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
        `);
        return false;
      }
      return false;
    }
    
    console.log("✅ wallet_shadow table exists!");
    console.log("Current records:", data);
    return true;
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  }
}

async function testSwitchAccountLogic() {
  console.log("\nTesting switchAccountByXid logic...");
  
  const testXid = "user1";
  
  try {
    const { data, error } = await supabase
      .from("wallet_shadow")
      .select("private_key")
      .eq("xid", testXid)
      .single();
    
    if (error || !data?.private_key) {
      console.error(`❌ Could not load private key for xid=${testXid}:`, error?.message ?? "no record found");
      return false;
    }
    
    if (!data.private_key.startsWith("0x")) {
      console.error("❌ Private key must start with 0x");
      return false;
    }
    
    console.log(`✅ Successfully retrieved private key for xid=${testXid}`);
    console.log(`Private key: ${data.private_key.substring(0, 10)}...`);
    return true;
    
  } catch (error) {
    console.error("❌ Error in switchAccountByXid logic:", error);
    return false;
  }
}

async function main() {
  console.log("🧪 Testing Supabase wallet_shadow integration...\n");
  
  const tableExists = await testWalletShadowTable();
  
  if (tableExists) {
    await testSwitchAccountLogic();
  }
  
  console.log("\n✨ Test completed!");
}

main().catch(console.error);
