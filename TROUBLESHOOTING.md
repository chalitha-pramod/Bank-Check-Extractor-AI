# Troubleshooting Guide - Bank Check AI

## Common Issues and Solutions

### 1. Login/Signup Not Working

#### **Step 1: Check if the backend server is running**
```bash
# In the backend directory
cd backend
npm start
```

You should see:
```
🚀 Bank Check AI Server is running on port 5000
📊 Health check: http://localhost:5000/api/health
🔧 Database test: http://localhost:5000/api/test-db
🌐 Frontend should be running on: http://localhost:3000
```

#### **Step 2: Test the backend API**
Open your browser and go to:
- `http://localhost:5000/api/health` - Should show server status
- `http://localhost:5000/api/test-db` - Should show database connection

#### **Step 3: Check database**
Run the database test:
```bash
cd backend
node test-db.js
```

You should see:
```
✅ Database connection successful
✅ Users table exists
✅ Bank_checks table exists
✅ Test user inserted successfully
✅ Test user cleaned up
🎉 Database test completed successfully!
```

### 2. Database Issues

#### **Problem: Database not created**
**Solution:** The database should be created automatically when you start the server. If not:

1. Delete the `database.sqlite` file (if it exists)
2. Restart the server: `npm start`
3. Check if the file was created

#### **Problem: Tables not created**
**Solution:** Check the database.js file and ensure it's properly configured.

### 3. Frontend Issues

#### **Problem: Frontend can't connect to backend**
**Solution:** 
1. Make sure both servers are running:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

2. Check the proxy setting in `frontend/package.json`:
   ```json
   "proxy": "http://localhost:5000"
   ```

#### **Problem: CORS errors**
**Solution:** The backend already has CORS configured. If you still get CORS errors, restart both servers.

### 4. API Key Issues

#### **Problem: Google Gemini API not working**
**Solution:**
1. Get a valid API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set it as an environment variable:
   ```bash
   # Windows
   set GEMINI_API_KEY=your_api_key_here
   
   # Mac/Linux
   export GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the backend server

### 5. Common Error Messages

#### **"Database error"**
- Check if the database file exists
- Run `node test-db.js` to test database connection
- Check console logs for specific error messages

#### **"User already exists"**
- Try a different username/email
- Check if the user was actually created in the database

#### **"Invalid username or password"**
- Make sure you're using the correct username (not email)
- Check if the user exists in the database
- Try registering a new user first

#### **"Network Error"**
- Check if the backend server is running
- Check if the frontend proxy is correctly set
- Try accessing the health check endpoint directly

### 6. Testing Steps

#### **Step 1: Test Backend**
```bash
cd backend
npm start
```

#### **Step 2: Test Database**
```bash
cd backend
node test-db.js
```

#### **Step 3: Test API Endpoints**
- Health: `http://localhost:5000/api/health`
- Database: `http://localhost:5000/api/test-db`

#### **Step 4: Test Frontend**
```bash
cd frontend
npm start
```

#### **Step 5: Test Registration**
1. Go to `http://localhost:3000/register`
2. Fill in the form
3. Check browser console for errors
4. Check backend console for logs

#### **Step 6: Test Login**
1. Go to `http://localhost:3000/login`
2. Use the credentials from registration
3. Check browser console for errors
4. Check backend console for logs

### 7. Debug Mode

To enable debug mode, set the environment variable:
```bash
# Windows
set NODE_ENV=development

# Mac/Linux
export NODE_ENV=development
```

This will show more detailed error messages.

### 8. Reset Everything

If nothing works, try a complete reset:

1. **Stop all servers**
2. **Delete database:**
   ```bash
   cd backend
   rm database.sqlite
   ```
3. **Reinstall dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. **Start servers:**
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   cd frontend && npm start
   ```

### 9. Browser Console Errors

Check the browser console (F12) for:
- Network errors (404, 500, etc.)
- JavaScript errors
- CORS errors

### 10. Backend Console Logs

The backend now logs all requests. Look for:
- Request logs: `2024-01-01T12:00:00.000Z - POST /api/auth/login`
- Error logs: `❌ Database error: ...`
- Success logs: `✅ User created successfully`

## Still Having Issues?

If you're still experiencing problems:

1. **Check the console logs** (both browser and backend)
2. **Test the API endpoints** directly
3. **Verify the database** is working
4. **Check network connectivity** between frontend and backend
5. **Try the reset procedure** above

The most common issue is that the backend server isn't running or the database isn't properly initialized. 