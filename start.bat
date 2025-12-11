@echo off
echo Starting Gravity System...

:: Check if PM2 is installed
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo PM2 not found. Installing globally...
    npm install -g pm2
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Build the project
echo Building project...
call npm run build

:: Start with PM2
echo Starting with PM2...
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo System started successfully!
pause
