param(
  [string]$ConfigPath = ".\config.json",
  [string]$CloudflaredPath = ".\tools\cloudflared.exe",
  [string]$TunnelConfigDir = "C:\PostSalesIoT\cloudflared"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ConfigPath)) { throw "Config file not found: $ConfigPath" }
if (-not (Test-Path $CloudflaredPath)) { throw "cloudflared.exe not found: $CloudflaredPath" }

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$publicUrl = ([string]$config.domain.publicUrl).TrimEnd("/")
$hostname = $publicUrl -replace "^https?://", ""
$tunnelName = [string]$config.domain.cloudflareTunnelName
$localUrl = "http://127.0.0.1:$($config.server.port)"

if (-not $hostname) { throw "domain.publicUrl is required, example: https://service.customer.com" }
if (-not $tunnelName) { throw "domain.cloudflareTunnelName is required" }

New-Item -ItemType Directory -Path $TunnelConfigDir -Force | Out-Null

Write-Host "Cloudflare login is required if this machine has not logged in before." -ForegroundColor Yellow
Write-Host "Creating tunnel: $tunnelName"
& $CloudflaredPath tunnel create $tunnelName

$tunnelList = & $CloudflaredPath tunnel list
$tunnelIdLine = $tunnelList | Select-String $tunnelName | Select-Object -First 1
if (-not $tunnelIdLine) { throw "Cannot find tunnel after create: $tunnelName" }
$tunnelId = ($tunnelIdLine.ToString().Trim() -split "\s+")[0]

$configYaml = @"
tunnel: $tunnelId
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

ingress:
  - hostname: $hostname
    service: $localUrl
  - service: http_status:404
"@

$configPathOut = Join-Path $TunnelConfigDir "config.yml"
Set-Content -Path $configPathOut -Value $configYaml -Encoding UTF8

Write-Host "Routing DNS: $hostname -> $tunnelName"
& $CloudflaredPath tunnel route dns $tunnelName $hostname

Write-Host "Installing Cloudflare Tunnel service"
& $CloudflaredPath service install --config $configPathOut

Write-Host "Cloudflare Tunnel installed for $publicUrl" -ForegroundColor Green
Write-Host "LINE Webhook URL: $publicUrl/linebot/webhook.php" -ForegroundColor Cyan
