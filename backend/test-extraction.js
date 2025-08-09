const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Test the extraction functionality with automatic extraction
const GEMINI_API_KEY = config.GEMINI_API_KEY;

console.log('🧪 Testing AI Extraction Functionality\n');

async function testExtraction() {
  try {
    console.log('1️⃣ Initializing Google AI...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try to get a model
    let model;
    const modelOptions = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'];
    
    for (const modelName of modelOptions) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Model initialized: ${modelName}`);
        break;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        continue;
      }
    }
    
    if (!model) {
      throw new Error('No available models found');
    }
    
    console.log('\n2️⃣ Testing text generation...');
    const textResult = await model.generateContent('Hello, can you respond with "Text test successful"?');
    const textResponse = textResult.response.text();
    console.log(`✅ Text generation: ${textResponse}`);
    
    console.log('\n3️⃣ Testing image analysis...');
    
    // Create a simple test image (1x1 pixel) for testing
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const base64Image = testImageBuffer.toString('base64');
    
    const prompt = 'This is a test image. Please respond with "Image test successful" if you can process this image.';
    
    const imageResult = await model.generateContent([
      prompt, 
      { inlineData: { data: base64Image, mimeType: 'image/png' } }
    ]);
    
    const imageResponse = imageResult.response.text();
    console.log(`✅ Image analysis: ${imageResponse}`);
    
    console.log('\n🎉 All tests passed! AI extraction should work correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 API Key Issues:');
      console.log('   • Check if your API key is valid');
      console.log('   • Make sure you have enabled the Gemini API in Google AI Studio');
      console.log('   • Verify your API key has the correct permissions');
    } else if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
      console.log('\n💡 Network Issues:');
      console.log('   • Check your internet connection');
      console.log('   • Try running the network diagnostic: node diagnose-network.js');
      console.log('   • The updated code should handle IPv4/IPv6 issues');
    } else if (error.message.includes('model')) {
      console.log('\n💡 Model Issues:');
      console.log('   • The model might not be available in your region');
      console.log('   • Try using a different model');
    }
  }
}

// Run the test
testExtraction(); 