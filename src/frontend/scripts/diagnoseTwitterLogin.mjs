import dotenv from "dotenv";
import { Scraper } from "agent-twitter-client";

dotenv.config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL;

console.log("🔍 Twitter Login Diagnosis");
console.log("=========================");

async function checkNetworkConnectivity() {
  console.log("1️⃣ Checking network connectivity...");
  
  try {
    const response = await fetch("https://twitter.com", {
      method: "HEAD",
      timeout: 10000
    });
    
    if (response.ok) {
      console.log("✅ Can reach Twitter.com");
      return true;
    } else {
      console.log(`❌ Twitter.com returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function checkCredentials() {
  console.log("\n2️⃣ Checking credentials...");
  
  if (!username || !password || !email) {
    console.log("❌ Missing credentials:");
    console.log(`   Username: ${username ? "✅ Set" : "❌ Missing"}`);
    console.log(`   Password: ${password ? "✅ Set" : "❌ Missing"}`);
    console.log(`   Email: ${email ? "✅ Set" : "❌ Missing"}`);
    return false;
  }
  
  console.log("✅ All credentials are set");
  console.log(`   Username: ${username}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${"*".repeat(password.length)}`);
  return true;
}

async function testBasicLogin() {
  console.log("\n3️⃣ Testing basic login...");
  
  const scraper = new Scraper();
  
  try {
    console.log("   Attempting login...");
    await scraper.login(username, password, email);
    
    const isLoggedIn = await scraper.isLoggedIn();
    if (isLoggedIn) {
      console.log("✅ Login successful!");
      
      // Test basic functionality
      try {
        const profile = await scraper.getProfile(username);
        console.log(`✅ Profile loaded: ${profile.name} (@${username})`);
        return true;
      } catch (profileError) {
        console.log(`⚠️  Login successful but profile fetch failed: ${profileError.message}`);
        return true;
      }
    } else {
      console.log("❌ Login failed - not logged in");
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    
    // Check for specific error types
    if (error.message.includes("fetch failed")) {
      console.log("   💡 This suggests a network connectivity issue");
    } else if (error.message.includes("rate limit")) {
      console.log("   💡 This suggests rate limiting - wait before retrying");
    } else if (error.message.includes("authentication")) {
      console.log("   💡 This suggests credential issues");
    }
    
    return false;
  }
}

async function checkRateLimiting() {
  console.log("\n4️⃣ Checking for rate limiting...");
  
  try {
    // Try a simple request to see if we're rate limited
    const response = await fetch("https://api.twitter.com/1.1/help/configuration.json");
    
    if (response.status === 429) {
      console.log("❌ Rate limited by Twitter API");
      const resetTime = response.headers.get("x-rate-limit-reset");
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        console.log(`   Rate limit resets at: ${resetDate.toLocaleString()}`);
      }
      return false;
    } else {
      console.log("✅ No obvious rate limiting detected");
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Could not check rate limiting: ${error.message}`);
    return true; // Assume no rate limiting if we can't check
  }
}

async function suggestSolutions() {
  console.log("\n💡 Suggested Solutions:");
  console.log("=======================");
  
  console.log("1. **Network Issues:**");
  console.log("   - Check your internet connection");
  console.log("   - Try using a VPN if Twitter is blocked");
  console.log("   - Check if your firewall is blocking the connection");
  
  console.log("\n2. **Credential Issues:**");
  console.log("   - Verify username, password, and email are correct");
  console.log("   - Try logging in manually on twitter.com first");
  console.log("   - Check if your account requires 2FA (set TWITTER_2FA_SECRET)");
  
  console.log("\n3. **Rate Limiting:**");
  console.log("   - Wait 15-30 minutes before retrying");
  console.log("   - Increase TWITTER_POLL_INTERVAL to 300+ seconds");
  console.log("   - Reduce the number of login attempts");
  
  console.log("\n4. **Account Issues:**");
  console.log("   - Check if your account is suspended or restricted");
  console.log("   - Verify the account is not locked");
  console.log("   - Try using a different Twitter account");
  
  console.log("\n5. **Configuration Issues:**");
  console.log("   - Remove quotes from environment variables in .env");
  console.log("   - Restart the application completely");
  console.log("   - Clear any cached cookies/sessions");
}

async function main() {
  try {
    const networkOk = await checkNetworkConnectivity();
    const credentialsOk = await checkCredentials();
    
    if (!networkOk || !credentialsOk) {
      await suggestSolutions();
      return;
    }
    
    await checkRateLimiting();
    const loginOk = await testBasicLogin();
    
    if (!loginOk) {
      await suggestSolutions();
    } else {
      console.log("\n🎉 Login test successful!");
      console.log("   The issue might be intermittent or resolved.");
      console.log("   Try restarting your ElizaOS application.");
    }
    
  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
    await suggestSolutions();
  }
}

main().catch(console.error);
