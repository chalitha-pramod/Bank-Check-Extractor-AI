const https = require('https');
const http = require('http');

console.log('🌐 Testing network connectivity to Google APIs...\n');

// Test basic internet connectivity
function testBasicConnectivity() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing basic internet connectivity...');
    
    const req = http.get('http://www.google.com', (res) => {
      console.log('✅ Basic internet connectivity: OK');
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

// Test Google API connectivity
function testGoogleAPI() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing Google API connectivity...');
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'User-Agent': 'Bank-Check-AI/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('✅ Google API connectivity: OK (Status:', res.statusCode, ')');
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Google API connectivity: FAILED');
      console.log('   Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(15000, () => {
      console.log('❌ Google API connectivity: TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test with API key
function testWithAPIKey() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing with API key...');
    
    const apiKey = 'AIzaSyClcpePrez8PSNc5NY6zczRhj6P2ZJR5Sw';
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1/models?key=${apiKey}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Bank-Check-AI/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API key test: OK');
          try {
            const models = JSON.parse(data);
            console.log('   Available models:', models.data?.length || 0);
          } catch (e) {
            console.log('   Response received but not JSON');
          }
        } else {
          console.log('❌ API key test: FAILED (Status:', res.statusCode, ')');
        }
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ API key test: FAILED');
      console.log('   Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(15000, () => {
      console.log('❌ API key test: TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main test function
async function runNetworkTests() {
  console.log('🔍 Starting network diagnostics...\n');
  
  const basicConnectivity = await testBasicConnectivity();
  console.log('');
  
  const googleAPI = await testGoogleAPI();
  console.log('');
  
  const apiKeyTest = await testWithAPIKey();
  console.log('');
  
  // Summary
  console.log('📊 Network Test Summary:');
  console.log('   Basic connectivity:', basicConnectivity ? '✅ OK' : '❌ FAILED');
  console.log('   Google API access:', googleAPI ? '✅ OK' : '❌ FAILED');
  console.log('   API key validation:', apiKeyTest ? '✅ OK' : '❌ FAILED');
  
  if (!basicConnectivity) {
    console.log('\n💡 Solution: Check your internet connection');
  } else if (!googleAPI) {
    console.log('\n💡 Solution: Your network might be blocking Google APIs');
    console.log('   Try using a VPN or check firewall settings');
  } else if (!apiKeyTest) {
    console.log('\n💡 Solution: API key might be invalid or restricted');
    console.log('   Check your Google AI Studio settings');
  } else {
    console.log('\n✅ All tests passed! The issue might be with the Node.js fetch implementation.');
  }
}

// Run the tests
runNetworkTests(); 