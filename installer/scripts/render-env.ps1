param(
  [string]$ConfigPath = ".\config.json",
  [string]$TemplatePath = "..\editions\customer-local\server.env.template",
  [string]$OutputPath = ".\build\server\.env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ConfigPath)) { throw "Config file not found: $ConfigPath" }
if (-not (Test-Path $TemplatePath)) { throw "Template file not found: $TemplatePath" }

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$template = Get-Content $TemplatePath -Raw

function New-RandomSecret {
  $bytes = New-Object byte[] 48
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  [Convert]::ToBase64String($bytes)
}

$values = @{
  SERVER_PORT = [string]$config.server.port
  DB_HOST = [string]$config.database.host
  DB_PORT = [string]$config.database.port
  DB_USER = [string]$config.database.user
  DB_PASSWORD = [string]$config.database.password
  DB_NAME = [string]$config.database.name
  JWT_SECRET = if ($config.server.jwtSecret) { [string]$config.server.jwtSecret } else { New-RandomSecret }
  COMPANY_NAME = [string]$config.company.name
  SUPPORT_PHONE = [string]$config.company.supportPhone
  ADMIN_USERNAME = [string]$config.admin.username
  ADMIN_PASSWORD = [string]$config.admin.password
  ADMIN_FULL_NAME = [string]$config.admin.fullName
  ADMIN_PHONE = [string]$config.admin.phone
  PUBLIC_APP_URL = ([string]$config.domain.publicUrl).TrimEnd('/')
  PORTAL_DIST_DIR = Join-Path ([string]$config.server.installDir) "apps\portal-web"
  LINE_CUSTOMER_CHANNEL_SECRET = [string]$config.line.customerChannelSecret
  LINE_CUSTOMER_CHANNEL_ACCESS_TOKEN = [string]$config.line.customerChannelAccessToken
  LINE_CUSTOMER_BASIC_ID = [string]$config.line.customerBasicId
  LINE_TEAM_CHANNEL_ACCESS_TOKEN = [string]$config.line.teamChannelAccessToken
  LINE_TEAM_TARGET_ID = [string]$config.line.teamTargetId
  LICENSE_KEY = [string]$config.license.licenseKey
  LICENSE_SERVER_URL = ([string]$config.license.licenseServerUrl).TrimEnd('/')
  LICENSE_PLAN = if ($config.license.plan) { [string]$config.license.plan } else { "local-business" }
  LICENSE_EXPIRES_AT = if ($config.license.expiresAt) { [string]$config.license.expiresAt } else { "" }
}

foreach ($key in $values.Keys) {
  $template = $template.Replace("{{$key}}", $values[$key])
}

$outDir = Split-Path $OutputPath -Parent
if ($outDir -and -not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

Set-Content -Path $OutputPath -Value $template -Encoding UTF8
Write-Host "Generated env file: $OutputPath" -ForegroundColor Green
