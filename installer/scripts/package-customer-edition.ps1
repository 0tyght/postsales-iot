param(
  [string]$ConfigPath = ".\installer\config.example.json",
  [string]$OutputDir = ".\release\customer-local"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$output = Join-Path $root $OutputDir

Write-Host "Packaging Post-Sales IoT Customer Local Edition" -ForegroundColor Cyan
Write-Host "Root: $root"
Write-Host "Output: $output"

if (Test-Path $output) {
  Remove-Item -LiteralPath $output -Recurse -Force
}

New-Item -ItemType Directory -Path $output | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output "server") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output "apps") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output "database") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output "installer") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output "editions") | Out-Null

Copy-Item -Path (Join-Path $root "server\src") -Destination (Join-Path $output "server\src") -Recurse
Copy-Item -Path (Join-Path $root "server\package.json") -Destination (Join-Path $output "server\package.json")
Copy-Item -Path (Join-Path $root "database\*") -Destination (Join-Path $output "database") -Recurse
Copy-Item -Path (Join-Path $root "installer\README.md") -Destination (Join-Path $output "installer\README.md")
Copy-Item -Path (Join-Path $root "installer\config.example.json") -Destination (Join-Path $output "installer\config.example.json")
Copy-Item -Path (Join-Path $root "installer\install-customer-local.bat") -Destination (Join-Path $output "installer\install-customer-local.bat")
Copy-Item -Path (Join-Path $root "installer\install-customer-local-no-service.bat") -Destination (Join-Path $output "installer\install-customer-local-no-service.bat")
New-Item -ItemType Directory -Path (Join-Path $output "installer\scripts") | Out-Null
@(
  "render-env.ps1",
  "install-local-server.ps1",
  "start-postsales-server.ps1",
  "install-windows-service.ps1",
  "install-cloudflare-tunnel.ps1",
  "backup.ps1",
  "restore.ps1"
) | ForEach-Object {
  Copy-Item -Path (Join-Path $root "installer\scripts\$_") -Destination (Join-Path $output "installer\scripts\$_")
}
Copy-Item -Path (Join-Path $root "editions\customer-local") -Destination (Join-Path $output "editions\customer-local") -Recurse

if (Test-Path (Join-Path $root "apps\admin-web\dist")) {
  Copy-Item -Path (Join-Path $root "apps\admin-web\dist") -Destination (Join-Path $output "apps\portal-web") -Recurse
} else {
  Write-Warning "apps/admin-web/dist not found. Run npm.cmd run build in apps/admin-web before packaging."
}

Write-Host "Customer edition package scaffold created." -ForegroundColor Green
Write-Host "Next: turn this folder into a signed Windows installer." -ForegroundColor Yellow
