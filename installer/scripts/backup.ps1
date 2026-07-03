param(
  [string]$ConfigPath = ".\config.json",
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ConfigPath)) { throw "Config file not found: $ConfigPath" }
$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

if (-not $OutputDir) { $OutputDir = [string]$config.server.backupDir }
if (-not $OutputDir) { $OutputDir = "C:\PostSalesIoT\backups" }
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$sqlFile = Join-Path $OutputDir "postsales-db-$stamp.sql"
$uploadZip = Join-Path $OutputDir "postsales-uploads-$stamp.zip"

$mysqldump = "mysqldump.exe"
$args = @(
  "-h", [string]$config.database.host,
  "-P", [string]$config.database.port,
  "-u", [string]$config.database.user,
  "--default-character-set=utf8mb4",
  [string]$config.database.name
)
if ($config.database.password) {
  $args = @("-p$($config.database.password)") + $args
}

& $mysqldump @args | Set-Content -Path $sqlFile -Encoding UTF8

if (Test-Path $config.server.uploadDir) {
  Compress-Archive -Path (Join-Path $config.server.uploadDir "*") -DestinationPath $uploadZip -Force
}

Write-Host "Backup complete:" -ForegroundColor Green
Write-Host $sqlFile
if (Test-Path $uploadZip) { Write-Host $uploadZip }
