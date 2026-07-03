param(
  [string]$ConfigPath = ".\config.json",
  [switch]$SkipDatabase,
  [switch]$SkipNpmInstall,
  [switch]$InstallService,
  [switch]$InstallTunnel
)

$ErrorActionPreference = "Stop"

function Resolve-PathSafe([string]$PathValue) {
  if ([System.IO.Path]::IsPathRooted($PathValue)) { return $PathValue }
  return (Resolve-Path $PathValue).Path
}

if (-not (Test-Path $ConfigPath)) {
  throw "Config file not found: $ConfigPath"
}

$configPathFull = Resolve-PathSafe $ConfigPath
$packageRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$config = Get-Content $configPathFull -Raw | ConvertFrom-Json
$installDir = [string]$config.server.installDir
$nodeExe = if ($config.server.nodeExe) { [string]$config.server.nodeExe } else { "node" }
$npmCmd = if ($config.server.npmCmd) { [string]$config.server.npmCmd } else { "npm.cmd" }
$mysqlExe = if ($config.server.mysqlExe) { [string]$config.server.mysqlExe } else { "mysql.exe" }

Write-Host "Post-Sales IoT Local Server Installer" -ForegroundColor Cyan
Write-Host "Company: $($config.company.name)"
Write-Host "Public URL: $($config.domain.publicUrl)"
Write-Host "Install dir: $installDir"

New-Item -ItemType Directory -Path $installDir -Force | Out-Null
New-Item -ItemType Directory -Path $config.server.uploadDir -Force | Out-Null
New-Item -ItemType Directory -Path $config.server.backupDir -Force | Out-Null

Write-Host "Copying application files..." -ForegroundColor Cyan
@("server", "apps", "database", "installer", "editions") | ForEach-Object {
  $source = Join-Path $packageRoot $_
  $target = Join-Path $installDir $_
  if (Test-Path $source) {
    if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
    Copy-Item -Path (Join-Path $source "*") -Destination $target -Recurse -Force
  }
}

$installedConfig = Join-Path $installDir "installer\config.json"
Copy-Item -Path $configPathFull -Destination $installedConfig -Force

Write-Host "Generating server .env..." -ForegroundColor Cyan
$renderScript = Join-Path $installDir "installer\scripts\render-env.ps1"
$templatePath = Join-Path $installDir "editions\customer-local\server.env.template"
$envPath = Join-Path $installDir "server\.env"
& powershell -ExecutionPolicy Bypass -File $renderScript -ConfigPath $installedConfig -TemplatePath $templatePath -OutputPath $envPath

Write-Host "Writing portal runtime config..." -ForegroundColor Cyan
$portalDir = Join-Path $installDir "apps\portal-web"
if (Test-Path $portalDir) {
  $runtime = @{
    apiBaseUrl = "$(([string]$config.domain.publicUrl).TrimEnd('/'))/api"
    updatedAt = (Get-Date).ToString("o")
    edition = "customer_local"
  } | ConvertTo-Json -Depth 5
  Set-Content -Path (Join-Path $portalDir "runtime-config.json") -Value $runtime -Encoding UTF8
}

if (-not $SkipNpmInstall) {
  Write-Host "Installing server dependencies..." -ForegroundColor Cyan
  Push-Location (Join-Path $installDir "server")
  & $npmCmd install --omit=dev
  Pop-Location
}

if (-not $SkipDatabase) {
  Write-Host "Creating database schema..." -ForegroundColor Cyan
  $dbArgsBase = @("-h", [string]$config.database.host, "-P", [string]$config.database.port, "-u", [string]$config.database.user, "--default-character-set=utf8mb4")
  if ($config.database.password) { $dbArgsBase = @("-p$($config.database.password)") + $dbArgsBase }
  Get-Content (Join-Path $installDir "database\create_database.sql") | & $mysqlExe @dbArgsBase
  Get-Content (Join-Path $installDir "database\create_tables.sql") | & $mysqlExe @dbArgsBase

  Write-Host "Creating first admin user..." -ForegroundColor Cyan
  Push-Location (Join-Path $installDir "server")
  & $nodeExe .\src\tools\createAdmin.js
  Pop-Location
}

if ($InstallTunnel) {
  $tunnelScript = Join-Path $installDir "installer\scripts\install-cloudflare-tunnel.ps1"
  $cloudflared = Join-Path $installDir "installer\tools\cloudflared.exe"
  & powershell -ExecutionPolicy Bypass -File $tunnelScript -ConfigPath $installedConfig -CloudflaredPath $cloudflared
}

if ($InstallService) {
  $serviceScript = Join-Path $installDir "installer\scripts\install-windows-service.ps1"
  $nssm = Join-Path $installDir "installer\tools\nssm.exe"
  & powershell -ExecutionPolicy Bypass -File $serviceScript -InstallDir $installDir -NssmPath $nssm
}

Write-Host ""
Write-Host "Post-Sales IoT Local Server installed." -ForegroundColor Green
Write-Host "Public URL: $($config.domain.publicUrl)"
Write-Host "LINE Webhook: $(([string]$config.domain.publicUrl).TrimEnd('/'))/linebot/webhook.php"
Write-Host "Install dir: $installDir"
Write-Host ""
Write-Host "If Windows Service was not installed, start manually:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File `"$installDir\installer\scripts\start-postsales-server.ps1`" -InstallDir `"$installDir`""
