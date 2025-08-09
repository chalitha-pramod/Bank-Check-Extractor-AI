# Automatic API Key Extraction Setup Guide

## 🎯 What's New

Your application now supports **automatic API key extraction** from environment variables! No more manual entry required.

## 🚀 Quick Setup

### Option 1: Use the Setup Script (Windows)
1. Double-click `setup-api-key.bat`
2. Enter your Google Gemini API key when prompted
3. Restart your terminal/command prompt
4. Done! 🎉

### Option 2: Manual Environment Variable Setup

#### Windows:
```cmd
set GEMINI_API_KEY=AIzaSyAQZeDyTtG29GGwLYB8eLtbpdfR_J4Xjvw
```

#### Mac/Linux:
```bash
export GEMINI_API_KEY=AIzaSyAQZeDyTtG29GGwLYB8eLtbpdfR_J4Xjvw
```

### Option 3: .env File (Python App)
Create a `.env` file in the `bank check ai/` directory:
```
GEMINI_API_KEY=AIzaSyAQZeDyTtG29GGwLYB8eLtbpdfR_J4Xjvw
```

## 🔧 How It Works

### Python Application (`bank check ai/app.py`)
- ✅ Automatically loads from environment variables
- ✅ Supports `.env` file (if python-dotenv is installed)
- ✅ Falls back to your provided API key if not set
- ✅ Shows helpful warnings if API key is missing

### Node.js Backend (`backend/`)
- ✅ Uses centralized config (`config.js`)
- ✅ Automatically extracts from environment variables
- ✅ Falls back to your provided API key
- ✅ All test files updated to use automatic extraction

## 📋 Files Updated

### Python Files:
- `bank check ai/app.py` - Added automatic environment variable extraction
- `bank check ai/requirements.txt` - Added python-dotenv dependency

### Node.js Files:
- `backend/config.js` - Updated with your API key
- `backend/routes/checks.js` - Uses config file instead of hardcoded values
- `backend/test-gemini.js` - Updated for automatic extraction
- `backend/test-extraction.js` - Updated for automatic extraction
- `backend/test-api.js` - Updated for automatic extraction

### New Files:
- `setup-api-key.bat` - Windows setup script
- `AUTO_API_SETUP.md` - This guide

## 🧪 Testing

### Test Python Setup:
```bash
cd "bank check ai"
python app.py
```

### Test Node.js Setup:
```bash
cd backend
node test-gemini.js
```

## 🔍 Verification

### Check if API key is set:
```cmd
echo %GEMINI_API_KEY%
```

### Check Python environment:
```python
import os
print(os.getenv('GEMINI_API_KEY'))
```

## 🛠️ Troubleshooting

### "API key not configured" warning:
1. Make sure you've set the environment variable
2. Restart your terminal/command prompt
3. Check if the variable is set: `echo %GEMINI_API_KEY%`

### Python dotenv not working:
```bash
pip install python-dotenv
```

### Node.js config not loading:
1. Make sure you're in the correct directory
2. Check if `config.js` exists
3. Verify the file path in your imports

## 🎉 Benefits

- ✅ **No more manual entry** - API key is automatically extracted
- ✅ **Secure** - API key stored in environment variables
- ✅ **Flexible** - Multiple setup options available
- ✅ **Consistent** - Same API key used across all components
- ✅ **User-friendly** - Clear warnings and helpful messages

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for production
- The fallback key is for development only
- Consider using a secrets manager for production

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Run the test files to verify setup
3. Ensure all dependencies are installed
4. Verify your API key is valid

---

**Your API key is now automatically extracted! No more manual configuration required.** 🎉 