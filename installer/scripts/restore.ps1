param(
  [string]$ConfigPath = ".\config.json",
  [Parameter(Mandatory=$true)][string]$SqlFile,
  [string]$UploadsZip = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ConfigPath)) { throw "Config file not found: $ConfigPath" }
if (-not (Test-Path $SqlFile)) { throw "SQL backup not found: $SqlFile" }

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$mysql = "mysql.exe"
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

Get-Content $SqlFile | & $mysql @args

if ($UploadsZip -and (Test-Path $UploadsZip)) {
  New-Item -ItemType Directory -Path $config.server.uploadDir -Force | Out-Null
  Expand-Archive -Path $UploadsZip -DestinationPath $config.server.uploadDir -Force
}

Write-Host "Restore complete." -ForegroundColor Green
