import dotenv from "dotenv";
import { Scraper, SearchMode } from "agent-twitter-client";

dotenv.config();

// Twitter configuration
const twitterConfig = {
  TWITTER_USERNAME: process.env.TWITTER_USERNAME,
  TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
  TWITTER_EMAIL: process.env.TWITTER_EMAIL,
  TWITTER_POLL_INTERVAL: parseInt(process.env.TWITTER_POLL_INTERVAL) || 120,
  TWITTER_DRY_RUN: process.env.TWITTER_DRY_RUN === 'true',
  TWITTER_RETRY_LIMIT: parseInt(process.env.TWITTER_RETRY_LIMIT) || 5,
};

console.log("🤖 ElizaOS Twitter Integration Test");
console.log("===================================");
console.log(`Username: ${twitterConfig.TWITTER_USERNAME}`);
console.log(`Poll Interval: ${twitterConfig.TWITTER_POLL_INTERVAL} seconds`);
console.log(`Dry Run: ${twitterConfig.TWITTER_DRY_RUN}`);
console.log("");

const scraper = new Scraper();
let profile = null;

async function initializeTwitter() {
  console.log("🔐 Initializing Twitter connection...");
  
  try {
    await scraper.login(
      twitterConfig.TWITTER_USERNAME,
      twitterConfig.TWITTER_PASSWORD,
      twitterConfig.TWITTER_EMAIL
    );
    
    if (await scraper.isLoggedIn()) {
      console.log("✅ Successfully logged in to Twitter!");
      
      // Fetch profile
      profile = await scraper.getProfile(twitterConfig.TWITTER_USERNAME);
      console.log(`✅ Profile loaded: ${profile.name} (@${twitterConfig.TWITTER_USERNAME})`);
      console.log(`   User ID: ${profile.userId}`);
      
      return true;
    } else {
      console.log("❌ Login failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Twitter initialization failed:", error.message);
    return false;
  }
}

async function simulateInteractionLoop() {
  console.log("\n🔄 Simulating Twitter interaction loop...");
  console.log("This mimics what the ElizaOS TwitterInteractionClient does:");
  
  try {
    // Step 1: Check for mentions
    console.log(`\n1️⃣ Checking for mentions of @${twitterConfig.TWITTER_USERNAME}...`);
    const mentionCandidates = await scraper.fetchSearchTweets(
      `@${twitterConfig.TWITTER_USERNAME}`,
      20,
      SearchMode.Latest
    );
    
    console.log(`   Found ${mentionCandidates.tweets.length} mention candidates`);
    
    if (mentionCandidates.tweets.length === 0) {
      console.log("   ℹ️  No mentions found. To test:");
      console.log(`      - Tweet something like: "Hello @${twitterConfig.TWITTER_USERNAME}!"`);
      console.log("      - Wait a few minutes and run this script again");
      return;
    }
    
    // Step 2: Process mentions
    console.log("\n2️⃣ Processing mentions...");
    
    let lastCheckedTweetId = null;
    const processedTweets = [];
    
    for (const tweet of mentionCandidates.tweets) {
      console.log(`\n   📝 Processing tweet ${tweet.id}:`);
      console.log(`      From: @${tweet.username} (${tweet.name})`);
      console.log(`      Text: ${tweet.text?.substring(0, 100)}...`);
      console.log(`      Time: ${new Date(tweet.timestamp * 1000).toLocaleString()}`);
      console.log(`      URL: ${tweet.permanentUrl}`);
      
      // Check if this is a new tweet (simulate lastCheckedTweetId logic)
      if (!lastCheckedTweetId || BigInt(tweet.id) > BigInt(lastCheckedTweetId)) {
        console.log(`      ✅ New tweet - would process`);
        
        // Simulate response generation
        if (!twitterConfig.TWITTER_DRY_RUN) {
          console.log(`      🤖 Would generate AI response here...`);
          console.log(`      📤 Would send reply tweet...`);
        } else {
          console.log(`      🔍 DRY RUN - not actually responding`);
        }
        
        processedTweets.push(tweet);
        lastCheckedTweetId = tweet.id;
      } else {
        console.log(`      ⏭️  Already processed - skipping`);
      }
    }
    
    console.log(`\n✅ Processed ${processedTweets.length} new tweets`);
    
    // Step 3: Check for target users (if configured)
    const targetUsers = process.env.TWITTER_TARGET_USERS?.split(',').filter(Boolean) || [];
    if (targetUsers.length > 0) {
      console.log(`\n3️⃣ Checking target users: ${targetUsers.join(', ')}`);
      // This would fetch tweets from specific users
    } else {
      console.log("\n3️⃣ No target users configured");
    }
    
  } catch (error) {
    console.error("❌ Error in interaction loop:", error.message);
  }
}

async function testMentionDetection() {
  console.log("\n🎯 Testing mention detection...");
  
  try {
    // Test different search queries
    const queries = [
      `@${twitterConfig.TWITTER_USERNAME}`,
      `@${twitterConfig.TWITTER_USERNAME.toLowerCase()}`,
      twitterConfig.TWITTER_USERNAME,
    ];
    
    for (const query of queries) {
      console.log(`\n   Testing query: "${query}"`);
      const result = await scraper.fetchSearchTweets(query, 5, SearchMode.Latest);
      console.log(`   Found ${result.tweets.length} tweets`);
      
      if (result.tweets.length > 0) {
        const latestTweet = result.tweets[0];
        console.log(`   Latest: @${latestTweet.username}: ${latestTweet.text?.substring(0, 60)}...`);
      }
    }
    
  } catch (error) {
    console.error("❌ Mention detection test failed:", error.message);
  }
}

async function checkAccountStatus() {
  console.log("\n🔍 Checking account status...");
  
  try {
    if (!profile) {
      console.log("❌ Profile not loaded");
      return;
    }
    
    console.log("✅ Account information:");
    console.log(`   Name: ${profile.name}`);
    console.log(`   Username: @${twitterConfig.TWITTER_USERNAME}`);
    console.log(`   User ID: ${profile.userId}`);
    console.log(`   Bio: ${profile.biography?.substring(0, 100)}...`);
    
    // Check if account can post
    console.log("\n   Testing account permissions...");
    
    // Try to fetch own tweets
    const ownTweets = await scraper.getUserTweets(profile.userId, 3);
    console.log(`   ✅ Can fetch own tweets: ${ownTweets.tweets.length} found`);
    
    // Check if account is restricted
    if (ownTweets.tweets.length === 0) {
      console.log("   ⚠️  No recent tweets found - account might be restricted");
    }
    
  } catch (error) {
    console.error("❌ Account status check failed:", error.message);
  }
}

async function main() {
  try {
    // Initialize Twitter
    const initSuccess = await initializeTwitter();
    if (!initSuccess) {
      console.log("\n❌ Cannot proceed without successful Twitter initialization");
      return;
    }
    
    // Check account status
    await checkAccountStatus();
    
    // Test mention detection
    await testMentionDetection();
    
    // Simulate the interaction loop
    await simulateInteractionLoop();
    
    console.log("\n🎉 Test complete!");
    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Make sure someone has actually mentioned your bot recently");
    console.log("   2. Check that TWITTER_POLL_INTERVAL is reasonable (120+ seconds)");
    console.log("   3. Verify your bot account isn't shadowbanned or restricted");
    console.log("   4. Try mentioning the bot from a different account");
    console.log("   5. Check the ElizaOS logs for any error messages");
    console.log("\n📝 Next steps:");
    console.log("   - If mentions are detected here but not in ElizaOS, check the logs");
    console.log("   - If no mentions are detected, try tweeting at the bot");
    console.log("   - Make sure your .env configuration matches what's shown above");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch(console.error);
