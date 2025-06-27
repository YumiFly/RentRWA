import dotenv from "dotenv";
import { Scraper } from "agent-twitter-client";

dotenv.config();

console.log("🐦 Simple Twitter Login Test");
console.log("============================");

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL;

console.log(`Username: ${username}`);
console.log(`Email: ${email}`);
console.log(`Password: ${password ? "*".repeat(password.length) : "NOT SET"}`);
console.log("");

if (!username || !password || !email) {
  console.error("❌ Missing credentials in .env file");
  process.exit(1);
}

async function testLogin() {
  const scraper = new Scraper();
  
  try {
    console.log("🔐 Attempting login...");
    
    // Add timeout to prevent hanging
    const loginPromise = scraper.login(username, password, email);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Login timeout after 30 seconds")), 30000)
    );
    
    await Promise.race([loginPromise, timeoutPromise]);
    
    console.log("✅ Login completed, checking status...");
    
    const isLoggedIn = await scraper.isLoggedIn();
    
    if (isLoggedIn) {
      console.log("🎉 Successfully logged in!");
      
      try {
        const profile = await scraper.getProfile(username);
        console.log(`👤 Profile: ${profile.name} (@${username})`);
        console.log(`🆔 User ID: ${profile.userId}`);
        return true;
      } catch (profileError) {
        console.log(`⚠️  Login successful but profile fetch failed: ${profileError.message}`);
        return true;
      }
    } else {
      console.log("❌ Login failed - not authenticated");
      return false;
    }
    
  } catch (error) {
    console.error("❌ Login error:", error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes("fetch failed")) {
      console.log("\n💡 Troubleshooting 'fetch failed' error:");
      console.log("   1. Check your internet connection");
      console.log("   2. Try using a different network or VPN");
      console.log("   3. Check if Twitter is accessible from your location");
      console.log("   4. Verify no firewall is blocking the connection");
    } else if (error.message.includes("timeout")) {
      console.log("\n💡 Troubleshooting timeout:");
      console.log("   1. Your network might be slow");
      console.log("   2. Twitter servers might be overloaded");
      console.log("   3. Try again in a few minutes");
    } else if (error.message.includes("authentication") || error.message.includes("login")) {
      console.log("\n💡 Troubleshooting authentication:");
      console.log("   1. Verify your username, password, and email are correct");
      console.log("   2. Try logging in manually on twitter.com first");
      console.log("   3. Check if your account requires 2FA");
      console.log("   4. Make sure your account is not suspended or locked");
    }
    
    return false;
  }
}

async function main() {
  const success = await testLogin();
  
  if (success) {
    console.log("\n✅ Twitter login test passed!");
    console.log("   You can now restart your ElizaOS application.");
  } else {
    console.log("\n❌ Twitter login test failed.");
    console.log("\n🔧 Next steps:");
    console.log("   1. Fix the issues mentioned above");
    console.log("   2. Wait 5-10 minutes before retrying");
    console.log("   3. Consider using a different Twitter account for testing");
    console.log("   4. Check Twitter's status page for any outages");
  }
}

main().catch(console.error);
