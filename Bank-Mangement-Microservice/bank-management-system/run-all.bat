@echo off
REM Build and run all microservices concurrently
REM Usage: double-click or run from cmd inside bank-management-system directory

setlocal enabledelayedexpansion

REM Detect Maven
where mvn >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Maven not found in PATH. Please install Maven or open a Maven-enabled terminal.
  exit /b 1
)

echo [INFO] Building all modules (this may take a while on first run)...
call mvn -q clean package -DskipTests
if errorlevel 1 (
  echo [ERROR] Maven build failed. Aborting.
  exit /b 1
)

echo [INFO] Launching services...

:startServices
for %%S in (employee-service customer-service account-service auth-service) do (
  call :runService %%S || goto :error
)

echo.
echo [INFO] All services started. Summary:
echo   Employee Service -> http://localhost:8081
echo   Customer Service -> http://localhost:8082
echo   Account Service  -> http://localhost:8083
echo   Auth Service     -> http://localhost:8084

echo.
echo [TIP] Press CTRL+C in each window to stop a service. H2 Consoles available at /h2-console
exit /b 0

:runService
set SVC=%1
set PORT=
if "%SVC%"=="employee-service" set PORT=8081
if "%SVC%"=="customer-service" set PORT=8082
if "%SVC%"=="account-service" set PORT=8083
if "%SVC%"=="auth-service" set PORT=8084

if not exist %SVC%\target (
  echo [WARN] Target folder for %SVC% not found. Skipping.
  exit /b 0
)
for /f "delims=" %%J in ('dir /b %SVC%\target\%SVC%-*.jar 2^>nul ^| findstr /v /i original') do (
  set JAR=%%J
)
if not defined JAR (
  echo [WARN] Jar for %SVC% not found. Expected pattern %SVC%-*.jar
  exit /b 0
)

echo [START] %SVC% (port %PORT%) -> %JAR%
start "RUN %SVC%" cmd /c "java -jar %SVC%\target\%JAR%"
exit /b 0

:error
echo [ERROR] Failed to start one of the services.
exit /b 1
