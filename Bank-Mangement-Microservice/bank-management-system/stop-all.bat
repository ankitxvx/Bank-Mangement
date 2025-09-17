@echo off
REM Stop all running Bank Management microservice java processes

setlocal
set KILL_COUNT=0

echo [INFO] Searching for running microservice JVMs...
for %%S in (employee-service customer-service account-service auth-service) do (
  for /f "tokens=2 delims==" %%P in ('wmic process where "CommandLine like '%%java%%%%S%%'" get ProcessId /value 2^>nul ^| find "ProcessId="') do (
    echo [STOP] Terminating %%S (PID %%P)
    taskkill /PID %%P /F >nul 2>&1
    if not errorlevel 1 set /a KILL_COUNT+=1
  )
)

echo.
echo [INFO] Processes terminated: %KILL_COUNT%
if %KILL_COUNT%==0 echo [INFO] No matching microservice processes were found.
exit /b 0
