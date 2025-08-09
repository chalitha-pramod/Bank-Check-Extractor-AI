@echo off
echo ========================================
echo    Bank Check AI - Express React App
echo ========================================
echo.

echo 🚀 Starting the application...
echo.

echo 📡 Starting Backend Server (Express.js)...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server (React.js)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting...
echo.
echo 📊 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo.
echo 🔧 API Health Check: http://localhost:5000/api/health
echo.
echo 💡 The application will open automatically in your browser
echo.

pause 