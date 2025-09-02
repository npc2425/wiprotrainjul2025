@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Starting Full Stack Environment
echo ============================================

:: ---------- START MYSQL ----------
echo.
echo [INFO] Starting MySQL services...

for %%S in (mysql mysql80 mysql94) do (
    sc query %%S >nul 2>&1
    if !errorlevel! == 0 (
        echo   Starting %%S...
        net start %%S >nul 2>&1
        if !errorlevel! == 0 (
            echo   %%S is already running.
        ) else (
            echo   %%S started successfully.
        )
    ) else (
        echo   Service %%S not found, skipping.
    )
)

:: ---------- START KAFKA ----------
echo.
echo [INFO] Starting Kafka...
start "Kafka Server" cmd /k "cd /d C:\kafka\kafka_2.13-4.0.0 & bin\windows\zookeeper-server-start.bat config\zookeeper.properties"
timeout /t 10 >nul
start "Kafka Server" cmd /k "cd /d C:\kafka\kafka_2.13-4.0.0 & bin\windows\kafka-server-start.bat config\server.properties"

:: ---------- START BACKEND ----------
echo.
echo [INFO] Starting Backend Services...

start "Order Management" cmd /k "cd backend\order-management & mvn spring-boot:run"
start "Product Management" cmd /k "cd backend\product-management & mvn spring-boot:run"
start "User Management" cmd /k "cd backend\user-management & mvn spring-boot:run"

:: ---------- START FRONTEND ----------
echo.
echo [INFO] Starting Frontend...
start "Frontend" cmd /k "cd frontend & npm run start"

echo.
echo ============================================
echo All services have been started in new windows
echo ============================================
pause
