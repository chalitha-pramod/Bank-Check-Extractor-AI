const https = require('https');
const http = require('http');
const dns = require('dns');
const { promisify } = require('util');

const lookup = promisify(dns.lookup);

console.log('🔍 Bank Check AI - Network Diagnostic Tool\n');

// Test DNS resolution
async function testDNS() {
  console.log('1️⃣ Testing DNS resolution...');
  try {
    const result = await lookup('generativelanguage.googleapis.com');
    console.log('✅ DNS resolution successful');
    console.log(`   IP Address: ${result.address}`);
    console.log(`   Family: ${result.family === 4 ? 'IPv4' : 'IPv6'}`);
    return true;
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    return false;
  }
}

// Test basic internet connectivity
function testBasicConnectivity() {
  return new Promise((resolve) => {
    console.log('\n2️⃣ Testing basic internet connectivity...');
    
    const req = http.get('http://www.google.com', (res) => {
      console.log('✅ Basic internet connectivity: OK');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Basic internet connectivity: FAILED');
      console.log('   Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Basic internet connectivity: TIMEOUT');
      req.destroy();
      resolve(false);
    });
  });
}

// Test Google API connectivity with different configurations
function testGoogleAPI(family = null) {
  return new Promise((resolve) => {
    const familyText = family === 4 ? 'IPv4' : family === 6 ? 'IPv6' : 'Auto';
    console.log(`\n3️⃣ Testing Google API connectivity (${familyText})...`);
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'User-Agent': 'Bank-Check-AI/1.0'
      },
      timeout: 15000
    };
    
    if (family) {
      options.family = family;
    }
    
    const req = https.request(options, (res) => {
      console.log(`✅ Google API connectivity (${familyText}): OK`);
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Google API connectivity (${familyText}): FAILED`);
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(15000, () => {
      console.log(`❌ Google API connectivity (${familyText}): TIMEOUT`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test with API key
function testWithAPIKey(family = null) {
  return new Promise((resolve) => {
    const familyText = family === 4 ? 'IPv4' : family === 6 ? 'IPv6' : 'Auto';
    console.log(`\n4️⃣ Testing with API key (${familyText})...`);
    
    const apiKey = 'AIzaSyClcpePrez8PSNc5NY6zczRhj6P2ZJR5Sw';
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1/models?key=${apiKey}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Bank-Check-AI/1.0'
      },
      timeout: 15000
    };
    
    if (family) {
      options.family = family;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ API key test (${familyText}): OK`);
          try {
            const models = JSON.parse(data);
            console.log(`   Available models: ${models.data?.length || 0}`);
          } catch (e) {
            console.log('   Response received but not JSON');
          }
        } else {
          console.log(`❌ API key test (${familyText}): FAILED (Status: ${res.statusCode})`);
        }
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ API key test (${familyText}): FAILED`);
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(15000, () => {
      console.log(`❌ API key test (${familyText}): TIMEOUT`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test proxy detection
function testProxyDetection() {
  console.log('\n5️⃣ Checking for proxy configuration...');
  
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
  let hasProxy = false;
  
  proxyVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   Found proxy: ${varName} = ${process.env[varName]}`);
      hasProxy = true;
    }
  });
  
  if (!hasProxy) {
    console.log('   No proxy configuration detected');
  }
  
  return hasProxy;
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('🚀 Starting comprehensive network diagnostics...\n');
  
  const dnsResult = await testDNS();
  const basicConnectivity = await testBasicConnectivity();
  const googleAPIAuto = await testGoogleAPI();
  const googleAPIIPv4 = await testGoogleAPI(4);
  const googleAPIIPv6 = await testGoogleAPI(6);
  const apiKeyAuto = await testWithAPIKey();
  const apiKeyIPv4 = await testWithAPIKey(4);
  const apiKeyIPv6 = await testWithAPIKey(6);
  const hasProxy = testProxyDetection();
  
  // Summary
  console.log('\n📊 Network Diagnostic Summary:');
  console.log('   DNS resolution:', dnsResult ? '✅ OK' : '❌ FAILED');
  console.log('   Basic connectivity:', basicConnectivity ? '✅ OK' : '❌ FAILED');
  console.log('   Google API (Auto):', googleAPIAuto ? '✅ OK' : '❌ FAILED');
  console.log('   Google API (IPv4):', googleAPIIPv4 ? '✅ OK' : '❌ FAILED');
  console.log('   Google API (IPv6):', googleAPIIPv6 ? '✅ OK' : '❌ FAILED');
  console.log('   API Key (Auto):', apiKeyAuto ? '✅ OK' : '❌ FAILED');
  console.log('   API Key (IPv4):', apiKeyIPv4 ? '✅ OK' : '❌ FAILED');
  console.log('   API Key (IPv6):', apiKeyIPv6 ? '✅ OK' : '❌ FAILED');
  console.log('   Proxy detected:', hasProxy ? '⚠️ YES' : '✅ NO');
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!dnsResult) {
    console.log('   • Check your DNS settings or try using 8.8.8.8 (Google DNS)');
  }
  
  if (!basicConnectivity) {
    console.log('   • Check your internet connection');
    console.log('   • Try disabling firewall temporarily');
  }
  
  if (googleAPIIPv4 && !googleAPIIPv6) {
    console.log('   • IPv6 connectivity issues detected - forcing IPv4 in code');
  }
  
  if (googleAPIIPv6 && !googleAPIIPv4) {
    console.log('   • IPv4 connectivity issues detected - forcing IPv6 in code');
  }
  
  if (!googleAPIAuto && (googleAPIIPv4 || googleAPIIPv6)) {
    console.log('   • Auto-detection failing but specific IP family works');
  }
  
  if (hasProxy) {
    console.log('   • Proxy detected - may need to configure proxy settings');
  }
  
  if (apiKeyAuto || apiKeyIPv4 || apiKeyIPv6) {
    console.log('   • API connectivity working - the issue might be in the application code');
  } else {
    console.log('   • API connectivity failing - check API key and network restrictions');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('   1. If IPv4 works but IPv6 doesn\'t, the updated code should fix this');
  console.log('   2. If all tests fail, check your network/firewall settings');
  console.log('   3. Try running the application with the updated network handling');
}

// Run diagnostics
runDiagnostics().catch(console.error); 