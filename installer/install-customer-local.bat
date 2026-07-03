@echo off
setlocal
cd /d "%~dp0\.."

if not exist "installer\config.json" (
  echo.
  echo Missing installer\config.json
  echo Copy installer\config.example.json to installer\config.json and edit customer values first.
  echo.
  pause
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File ".\installer\scripts\install-local-server.ps1" -ConfigPath ".\installer\config.json" -InstallService -InstallTunnel
pause
