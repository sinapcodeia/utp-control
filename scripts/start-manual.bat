@echo off
echo ==========================================
echo   MANUAL PRODUCTION START (NO DOCKER)
echo ==========================================
echo.

echo 1. Starting API (Port 3001)...
start "UTP API (Prod)" cmd /k "cd apps\api && set NODE_ENV=production && node dist/src/main"

echo 2. Starting Web (Port 3003)...
start "UTP Web (Prod)" cmd /k "cd apps\web && set NODE_ENV=production && pnpm start -p 3003"

echo.
echo Services started in background windows.
echo Frontend: http://localhost:3003
echo API: http://localhost:3001
echo.
pause
