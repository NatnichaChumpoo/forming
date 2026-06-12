@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Forming Monitor - Start Local
echo ============================================
echo.

REM ── 1. Check Docker CLI is installed ──
where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM ── 2. Check if Docker engine is running, start Docker Desktop if not ──
docker info >nul 2>nul
if errorlevel 1 (
    echo Docker Desktop is not running. Starting it now...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo Waiting for Docker to be ready, please wait...
    :waitloop
    timeout /t 3 >nul
    docker info >nul 2>nul
    if errorlevel 1 (
        echo   ... still starting Docker, please wait
        goto waitloop
    )
)

echo Docker is ready.
echo.

REM ── 3. Start containers ──
echo Starting containers (docker compose up -d)...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] docker compose up failed. See messages above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Done! Containers are running.
echo   Dashboard : http://localhost
echo   Backend   : http://localhost:4000/api/health
echo ============================================
echo.

REM ── 4. Open dashboard in default browser ──
start "" http://localhost

pause
