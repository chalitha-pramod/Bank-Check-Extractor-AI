@echo off
echo ========================================
echo    Google Gemini API Key Setup
echo ========================================
echo.

echo Current API Key: %GEMINI_API_KEY%
echo.

set /p NEW_API_KEY="Enter your Google Gemini API key: "

if "%NEW_API_KEY%"=="" (
    echo No API key entered. Setup cancelled.
    pause
    exit /b 1
)

echo.
echo Setting environment variable...
setx GEMINI_API_KEY "%NEW_API_KEY%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ API key set successfully!
    echo.
    echo 📝 Note: You may need to restart your terminal/command prompt
    echo    for the changes to take effect.
    echo.
    echo 🔧 To verify, run: echo %GEMINI_API_KEY%
    echo.
) else (
    echo.
    echo ❌ Failed to set API key. Please try again.
    echo.
)

pause 