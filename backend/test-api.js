const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Test API key with automatic extraction
const API_KEY = config.GEMINI_API_KEY;

console.log('🔍 Testing Google Gemini API...');
console.log('API Key:', API_KEY.substring(0, 10) + '...');

async function testAPI() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('✅ API initialized successfully');
    
    const result = await model.generateContent('Hello, can you respond with "API is working"?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API response received:', text);
    console.log('🎉 API is working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify your API key is correct');
      console.log('3. Try using a different network');
      console.log('4. Check if your firewall is blocking the connection');
    } else if (error.message.includes('API key')) {
      console.log('\n💡 API key issue detected:');
      console.log('1. Get a new API key from: https://makersuite.google.com/app/apikey');
      console.log('2. Set it as environment variable: set GEMINI_API_KEY=your-key');
      console.log('3. Or replace YOUR_ACTUAL_API_KEY_HERE in the code');
    }
  }
}

testAPI(); 