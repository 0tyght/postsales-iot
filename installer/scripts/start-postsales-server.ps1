param(
  [string]$InstallDir = "C:\PostSalesIoT"
)

$ErrorActionPreference = "Stop"
$serverDir = Join-Path $InstallDir "server"
$envPath = Join-Path $serverDir ".env"

if (-not (Test-Path $serverDir)) { throw "Server directory not found: $serverDir" }
if (-not (Test-Path $envPath)) { throw "Server .env not found: $envPath" }

Set-Location $serverDir
node .\src\server.js
