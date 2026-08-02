// Test script to check available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('🔑 API Key found (first 10 chars):', apiKey.substring(0, 10) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log('\n🧪 Testing gemini-3.5-flash-lite...\n');
    
    // Test gemini-3.5-flash-lite directly
    try {
      const testModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
      const result = await testModel.generateContent('Say "Hello, I am working!" in one sentence.');
      const response = result.response.text();
      console.log(`✅ gemini-3.5-flash-lite works! Response: ${response}`);
      console.log('\n✅ RECOMMENDED: Use gemini-3.5-flash-lite');
      return;
    } catch (error) {
      console.log(`❌ gemini-3.5-flash-lite failed: ${error.message}`);
    }
    
    // Try alternative models
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.0-flash',
      'gemini-flash',
      'gemini-1.5-pro', // Fallback, though we prefer Flash
    ];
    
    console.log('\n🔍 Trying alternative models...\n');
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`  Testing ${modelName}...`);
        const testModel = genAI.getGenerativeModel({ model: modelName });
        const result = await testModel.generateContent('Say "Hello" in one word.');
        const response = result.response.text();
        console.log(`  ✅ ${modelName} works!`);
        console.log(`\n✅ RECOMMENDED: Use ${modelName}`);
        return;
      } catch (error) {
        console.log(`  ❌ ${modelName} failed: ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n❌ No suitable models found. Check API key and billing.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status) {
      console.error('   Status:', error.status);
    }
    process.exit(1);
  }
}

testAvailableModels();
