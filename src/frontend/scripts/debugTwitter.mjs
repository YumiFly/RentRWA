import dotenv from "dotenv";
import { Scraper, SearchMode } from "agent-twitter-client";

dotenv.config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL;

if (!username || !password || !email) {
  console.error("❌ Twitter credentials not found in .env file");
  console.log("Required: TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_EMAIL");
  process.exit(1);
}

console.log("🐦 Twitter Debug Tool");
console.log("====================");
console.log(`Username: ${username}`);
console.log(`Email: ${email}`);
console.log("");

const scraper = new Scraper();

async function testTwitterLogin() {
  console.log("🔐 Testing Twitter login...");
  
  try {
    await scraper.login(username, password, email);
    
    if (await scraper.isLoggedIn()) {
      console.log("✅ Successfully logged in to Twitter!");
      return true;
    } else {
      console.log("❌ Login failed - not logged in");
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return false;
  }
}

async function testFetchMentions() {
  console.log(`\n🔍 Testing mention search for @${username}...`);
  
  try {
    const result = await scraper.fetchSearchTweets(
      `@${username}`,
      10,
      SearchMode.Latest
    );
    
    console.log(`✅ Found ${result.tweets.length} mentions`);
    
    if (result.tweets.length > 0) {
      console.log("\n📝 Recent mentions:");
      result.tweets.slice(0, 3).forEach((tweet, index) => {
        console.log(`${index + 1}. @${tweet.username}: ${tweet.text?.substring(0, 100)}...`);
        console.log(`   ID: ${tweet.id}, Time: ${new Date(tweet.timestamp * 1000).toLocaleString()}`);
        console.log("");
      });
    } else {
      console.log("ℹ️  No recent mentions found. Try:");
      console.log(`   1. Tweet something mentioning @${username}`);
      console.log(`   2. Wait a few minutes`);
      console.log(`   3. Run this script again`);
    }
    
    return result.tweets;
  } catch (error) {
    console.error("❌ Error fetching mentions:", error.message);
    return [];
  }
}

async function testProfile() {
  console.log(`\n👤 Testing profile fetch for ${username}...`);
  
  try {
    const profile = await scraper.getProfile(username);
    console.log("✅ Profile fetched successfully:");
    console.log(`   User ID: ${profile.userId}`);
    console.log(`   Name: ${profile.name}`);
    console.log(`   Bio: ${profile.biography?.substring(0, 100)}...`);
    return profile;
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    return null;
  }
}

async function testHomeTimeline() {
  console.log("\n🏠 Testing home timeline fetch...");
  
  try {
    const timeline = await scraper.fetchHomeTimeline(5, []);
    console.log(`✅ Fetched ${timeline.length} tweets from home timeline`);
    
    if (timeline.length > 0) {
      console.log("\n📰 Recent timeline tweets:");
      timeline.slice(0, 2).forEach((tweet, index) => {
        const tweetObj = {
          id: tweet.rest_id,
          username: tweet.core?.user_results?.result?.legacy?.screen_name,
          text: tweet.legacy?.full_text,
          timestamp: tweet.legacy?.created_at
        };
        console.log(`${index + 1}. @${tweetObj.username}: ${tweetObj.text?.substring(0, 80)}...`);
      });
    }
    
    return timeline;
  } catch (error) {
    console.error("❌ Error fetching timeline:", error.message);
    return [];
  }
}

async function checkRateLimits() {
  console.log("\n⏱️  Checking rate limits...");
  
  try {
    // Try multiple quick requests to see if we hit rate limits
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        scraper.fetchSearchTweets(`@${username}`, 1, SearchMode.Latest)
      );
    }
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful requests: ${successful}`);
    console.log(`❌ Failed requests: ${failed}`);
    
    if (failed > 0) {
      console.log("⚠️  You may be hitting rate limits. Consider:");
      console.log("   - Increasing TWITTER_POLL_INTERVAL to 120+ seconds");
      console.log("   - Reducing the number of requests");
    }
    
  } catch (error) {
    console.error("❌ Rate limit check failed:", error.message);
  }
}

async function main() {
  try {
    // Test login
    const loginSuccess = await testTwitterLogin();
    if (!loginSuccess) {
      console.log("\n❌ Cannot proceed without successful login");
      return;
    }
    
    // Test profile
    await testProfile();
    
    // Test mentions
    const mentions = await testFetchMentions();
    
    // Test timeline
    await testHomeTimeline();
    
    // Check rate limits
    await checkRateLimits();
    
    console.log("\n🎉 Debug complete!");
    console.log("\n💡 Tips for better Twitter integration:");
    console.log("   1. Make sure TWITTER_POLL_INTERVAL is at least 120 seconds");
    console.log("   2. Check that your bot account can see mentions");
    console.log("   3. Verify the account isn't shadowbanned or restricted");
    console.log("   4. Try mentioning the bot from a different account");
    
  } catch (error) {
    console.error("❌ Debug script failed:", error);
  }
}

main().catch(console.error);
