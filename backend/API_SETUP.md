# Google Gemini API Setup Guide

## Why is AI extraction failing?

The error "fetch failed" indicates that the Google Gemini API is not accessible. This can happen for several reasons:

1. **No API key configured**
2. **Invalid API key**
3. **Network connectivity issues**
4. **API quota exceeded**
5. **API service unavailable**

## How to Fix the Issue

### Step 1: Get a Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure the API Key

#### Option A: Environment Variable (Recommended)

**Windows:**
```cmd
set GEMINI_API_KEY=your-api-key-here
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY=your-api-key-here
```

#### Option B: .env File

1. Create a file named `.env` in the backend directory
2. Add the following line:
```
GEMINI_API_KEY=your-api-key-here
```

#### Option C: Direct Configuration

Edit `backend/routes/checks.js` and replace the API key on line 13:
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-actual-api-key-here';
```

### Step 3: Restart the Backend Server

After setting the API key, restart your backend server:

```bash
cd backend
npm start
```

### Step 4: Test the API

You can test if the API is working by running:

```bash
cd backend
node test-gemini.js
```

## Troubleshooting

### If you still get "fetch failed" error:

1. **Check your internet connection**
2. **Verify the API key is correct**
3. **Check if the API key has the necessary permissions**
4. **Try using a different network (some corporate networks block API calls)**
5. **Check if you've exceeded your API quota**

### Alternative: Manual Entry Mode

If you can't get the API working, the system will automatically fall back to manual entry mode. You can still:

1. Upload check images
2. Manually enter the check details
3. View and manage your checks
4. Export data to CSV/PDF

## API Key Security

⚠️ **Important Security Notes:**

- Never commit your API key to version control
- Use environment variables or .env files (add .env to .gitignore)
- Rotate your API key regularly
- Monitor your API usage to avoid unexpected charges

## Support

If you continue to have issues:

1. Check the Google AI Studio documentation
2. Verify your API key permissions
3. Test with a simple API call first
4. Check the backend console for detailed error messages 