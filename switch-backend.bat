@echo off
echo ========================================
echo Rail Madad - Backend Configuration
echo ========================================
echo.
echo Choose backend configuration:
echo 1. Local Backend (http://localhost:8001)
echo 2. Production Backend (https://rail-madad-backend.onrender.com)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo VITE_USE_LOCAL_BACKEND=true > frontend\.env.local
    echo VITE_API_BASE_URL=http://localhost:8001 >> frontend\.env.local
    echo VITE_DEBUG_MODE=true >> frontend\.env.local
    echo VITE_ALLOW_INSECURE_HTTP=true >> frontend\.env.local
    echo VITE_NODE_ENV=development >> frontend\.env.local
    echo.
    echo ✅ Configured to use LOCAL backend
    echo Make sure to start your Django server: python manage.py runserver 8001
) else if "%choice%"=="2" (
    echo VITE_USE_LOCAL_BACKEND=false > frontend\.env.local
    echo VITE_API_BASE_URL=https://rail-madad-backend.onrender.com >> frontend\.env.local
    echo VITE_DEBUG_MODE=true >> frontend\.env.local
    echo VITE_ALLOW_INSECURE_HTTP=false >> frontend\.env.local
    echo VITE_NODE_ENV=development >> frontend\.env.local
    echo.
    echo ✅ Configured to use PRODUCTION backend
    echo No local Django server needed
) else (
    echo Invalid choice. Please run again and choose 1 or 2.
    pause
    exit /b 1
)

echo.
echo Configuration updated! Restart your dev server if it's running.
pause
