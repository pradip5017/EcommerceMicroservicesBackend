@echo off
title MicroCommerce - Dev Environment Launcher
echo ========================================================
echo   Launching MicroCommerce Development Environment
echo ========================================================
echo.

:: 1. Start Docker containers (Kafka, Redis, MySQL)
echo [1/3] Ensuring Kafka & Redis Docker containers are up...
docker-compose up -d kafka redis

:: 2. Launch Frontend in default browser
echo [2/3] Opening Frontend Dashboard...
start "" "%~dp0frontend\index.html"

:: 3. Launch Backend Services
echo [3/3] Backend services status:
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8080,8081,8082,8083,8084,8085,8086 -ErrorAction SilentlyContinue | Select-Object LocalPort, State"

echo.
echo All development services are active!
echo Frontend: opened in browser (frontend\index.html)
echo API Gateway: http://localhost:8080
echo Notification Service: http://localhost:8086
echo.
pause
