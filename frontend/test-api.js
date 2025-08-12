#!/usr/bin/env node

// Simple API test script to verify endpoints are working
const https = require('https');

const API_BASE = 'https://bank-check-extractor-ai-backend.vercel.app';

// Test function
function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'bank-check-extractor-ai-backend.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const dbTest = await testEndpoint('/api/test-db');
    console.log(`   Status: ${dbTest.status}`);
    console.log(`   Response: ${JSON.stringify(dbTest.data, null, 2)}\n`);
    
    // Test 2: Health check (if available)
    console.log('2. Testing health endpoint...');
    try {
      const healthTest = await testEndpoint('/api/health');
      console.log(`   Status: ${healthTest.status}`);
      console.log(`   Response: ${JSON.stringify(healthTest.data, null, 2)}\n`);
    } catch (error) {
      console.log('   Health endpoint not available or failed\n');
    }
    
    // Test 3: Authentication endpoint (should return 400 for missing data)
    console.log('3. Testing authentication endpoint...');
    try {
      const authTest = await testEndpoint('/api/auth/login', 'POST', {});
      console.log(`   Status: ${authTest.status}`);
      console.log(`   Response: ${JSON.stringify(authTest.data, null, 2)}\n`);
    } catch (error) {
      console.log('   Authentication endpoint failed\n');
    }
    
    console.log('✅ API tests completed!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('- Database connection: ' + (dbTest.status === 200 ? '✅ Working' : '❌ Failed'));
    console.log('- API endpoints: ' + (dbTest.status < 500 ? '✅ Accessible' : '❌ Server Error'));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the backend is running');
    console.log('2. Verify the API URL is correct');
    console.log('3. Check network connectivity');
    console.log('4. Look for CORS or firewall issues');
  }
}

// Run the tests
runTests();
