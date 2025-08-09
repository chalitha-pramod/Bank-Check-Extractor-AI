const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Test the API key with automatic extraction
const GEMINI_API_KEY = config.GEMINI_API_KEY;

console.log('🔍 Testing Google Gemini API connection...');
console.log('API Key:', GEMINI_API_KEY.substring(0, 10) + '...');

async function testGeminiAPI() {
  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Test both models
    const models = ['gemini-1.5-pro', 'gemini-1.5-flash'];
    
    for (const modelName of models) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Test with a simple text prompt
        const prompt = 'Hello, can you respond with "API test successful" if you can read this?';
        
        console.log('📤 Sending test request...');
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log('📥 Response received:', response);
        console.log(`✅ ${modelName} is working correctly!`);
        
        // If we get here, the model works, so we can use it
        return modelName;
        
      } catch (modelError) {
        console.log(`❌ ${modelName} failed:`, modelError.message);
        continue;
      }
    }
    
    throw new Error('All models failed');
    
  } catch (error) {
    console.error('❌ Google Gemini API test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if your API key is valid');
      console.log('2. Make sure you have enabled the Gemini API in Google AI Studio');
      console.log('3. Verify your API key has the correct permissions');
      console.log('4. Check if you have exceeded your API quota');
    } else if (error.message.includes('fetch failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify you can access https://generativelanguage.googleapis.com');
      console.log('3. Check if there are any firewall or proxy issues');
      console.log('4. Try using a VPN if you\'re in a restricted region');
    } else if (error.message.includes('model')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. The model name might be incorrect');
      console.log('2. Try using "gemini-1.5-pro" instead of "gemini-1.5-flash"');
      console.log('3. Check if the model is available in your region');
    }
  }
}

// Run the test
testGeminiAPI(); 