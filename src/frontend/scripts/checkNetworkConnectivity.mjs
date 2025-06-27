import https from 'https';
import { promisify } from 'util';

console.log("🌐 Network Connectivity Check");
console.log("=============================");

async function checkConnection(hostname, port = 443, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request({
      hostname,
      port,
      method: 'HEAD',
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; connectivity-check)'
      }
    }, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        success: true,
        status: res.statusCode,
        duration,
        hostname
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        duration,
        hostname
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: 'Timeout',
        duration,
        hostname
      });
    });

    req.end();
  });
}

async function checkDNS(hostname) {
  try {
    const dns = await import('dns');
    const lookup = promisify(dns.lookup);
    const result = await lookup(hostname);
    return {
      success: true,
      ip: result.address,
      family: result.family
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  const services = [
    { name: "Google (general)", hostname: "google.com" },
    { name: "Google APIs", hostname: "googleapis.com" },
    { name: "Gemini API", hostname: "generativelanguage.googleapis.com" },
    { name: "Twitter", hostname: "twitter.com" },
    { name: "GitHub", hostname: "github.com" }
  ];

  console.log("🔍 Testing DNS resolution...");
  for (const service of services) {
    const dnsResult = await checkDNS(service.hostname);
    if (dnsResult.success) {
      console.log(`✅ ${service.name}: ${service.hostname} → ${dnsResult.ip}`);
    } else {
      console.log(`❌ ${service.name}: DNS failed - ${dnsResult.error}`);
    }
  }

  console.log("\n🔗 Testing HTTPS connections...");
  for (const service of services) {
    const result = await checkConnection(service.hostname);
    if (result.success) {
      console.log(`✅ ${service.name}: Connected (${result.duration}ms, status: ${result.status})`);
    } else {
      console.log(`❌ ${service.name}: Failed - ${result.error} (${result.duration}ms)`);
    }
  }

  console.log("\n💡 Diagnosis:");
  
  // Check if all Google services are failing
  const googleServices = ["google.com", "googleapis.com", "generativelanguage.googleapis.com"];
  const googleResults = await Promise.all(
    googleServices.map(hostname => checkConnection(hostname))
  );
  
  const allGoogleFailed = googleResults.every(result => !result.success);
  const allTimeouts = googleResults.every(result => result.error === 'Timeout');
  
  if (allGoogleFailed) {
    if (allTimeouts) {
      console.log("🚨 All Google services are timing out");
      console.log("   This suggests:");
      console.log("   - Firewall blocking Google services");
      console.log("   - Geographic restrictions (China, etc.)");
      console.log("   - ISP blocking Google");
      console.log("   - Corporate network restrictions");
    } else {
      console.log("🚨 All Google services are failing");
      console.log("   This suggests network connectivity issues");
    }
    
    console.log("\n🔧 Solutions:");
    console.log("   1. Try using a VPN");
    console.log("   2. Check firewall settings");
    console.log("   3. Try a different network (mobile hotspot)");
    console.log("   4. Contact your ISP or network administrator");
    console.log("   5. Consider using a different AI provider (OpenAI, Anthropic)");
  } else {
    console.log("✅ Some connections are working");
    console.log("   The issue might be temporary or specific to Gemini API");
    console.log("   Try again in a few minutes");
  }
}

main().catch(console.error);
