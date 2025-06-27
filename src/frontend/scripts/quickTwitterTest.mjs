import dotenv from "dotenv";
import { Scraper, SearchMode } from "agent-twitter-client";

dotenv.config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL;

console.log("🐦 Quick Twitter Test");
console.log("====================");

if (!username || !password || !email) {
  console.error("❌ Missing Twitter credentials in .env file");
  process.exit(1);
}

const scraper = new Scraper();

async function quickTest() {
  try {
    console.log("🔐 Logging in...");
    await scraper.login(username, password, email);
    
    if (!(await scraper.isLoggedIn())) {
      console.error("❌ Login failed");
      return;
    }
    
    console.log("✅ Login successful");
    
    console.log(`🔍 Searching for mentions of @${username}...`);
    const mentions = await scraper.fetchSearchTweets(
      `@${username}`,
      10,
      SearchMode.Latest
    );
    
    console.log(`📊 Found ${mentions.tweets.length} mentions`);
    
    if (mentions.tweets.length > 0) {
      console.log("\n📝 Recent mentions:");
      mentions.tweets.slice(0, 3).forEach((tweet, i) => {
        console.log(`${i + 1}. @${tweet.username}: ${tweet.text?.substring(0, 80)}...`);
        console.log(`   Time: ${new Date(tweet.timestamp * 1000).toLocaleString()}`);
        console.log(`   ID: ${tweet.id}`);
        console.log("");
      });
    } else {
      console.log("ℹ️  No mentions found. Try:");
      console.log(`   1. Tweet: "Hello @${username}! 👋"`);
      console.log("   2. Wait 2-3 minutes");
      console.log("   3. Run this test again");
    }
    
    console.log("✅ Test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

quickTest();
