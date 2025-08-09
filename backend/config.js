// Configuration file for Bank Check AI Backend

module.exports = {
  // Google Gemini AI Configuration - Automatic API Key Extraction
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyAQZeDyTtG29GGwLYB8eLtbpdfR_J4Xjvw',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  
  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite',
  
  // File Upload Configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Instructions for setting up Google Gemini API:
/*
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Set the environment variable:
   - Windows: set GEMINI_API_KEY=your-api-key-here
   - Mac/Linux: export GEMINI_API_KEY=your-api-key-here
   - Or create a .env file in the backend directory with:
     GEMINI_API_KEY=your-api-key-here

4. Restart the backend server after setting the API key
*/ 