@echo off
echo ========================================
echo Bank Check AI Setup Script
echo ========================================
echo.

echo Setting up Backend...
cd backend
echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Setting up Frontend...
cd ..\frontend
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Before starting the app, you need to:
echo.
echo 1. Get a Google Gemini API key from:
echo    https://makersuite.google.com/app/apikey
echo.
echo 2. Update the API key in backend/routes/checks.js:
echo    Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
echo.
echo To start the application:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo The app will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
pause 