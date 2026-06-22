param(
  [switch]$SkipGitPush,
  [switch]$Background
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cloudflared = Join-Path $root '.tools\cloudflared.exe'
$configPath = Join-Path $root 'runtime-config.json'

if (-not (Test-Path $cloudflared)) { throw "cloudflared.exe not found: $cloudflared" }

function Test-Port([int]$Port) {
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Stop-PortProcess([int]$Port) {
  $processIds = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

if (-not (Test-Port 5000)) {
  Start-Process -FilePath node -ArgumentList 'src/server.js' -WorkingDirectory (Join-Path $root 'server') -WindowStyle Hidden | Out-Null
}
if (-not (Test-Port 5173)) {
  Start-Process -FilePath npm.cmd -ArgumentList 'run','dev' -WorkingDirectory (Join-Path $root 'apps\admin-web') -WindowStyle Hidden | Out-Null
}

$deadline = (Get-Date).AddSeconds(20)
while ((-not (Test-Port 5000) -or -not (Test-Port 5173)) -and (Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
}
if (-not (Test-Port 5000) -or -not (Test-Port 5173)) { throw 'API or web server failed to start' }

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outLog = Join-Path $root ".tools\portal-$stamp.out.log"
$errorLog = Join-Path $root ".tools\portal-$stamp.err.log"
Start-Process -FilePath $cloudflared -ArgumentList 'tunnel','--url','http://127.0.0.1:5173','--no-autoupdate' -WorkingDirectory $root -RedirectStandardOutput $outLog -RedirectStandardError $errorLog -WindowStyle Hidden | Out-Null

$url = $null
$deadline = (Get-Date).AddSeconds(45)
while (-not $url -and (Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 1
  $logText = ((Get-Content $outLog,$errorLog -ErrorAction SilentlyContinue) -join "`n")
  $match = [regex]::Match($logText, 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($match.Success) { $url = $match.Value }
}
if (-not $url) { throw 'Cloudflare Quick Tunnel failed to start' }

$deadline = (Get-Date).AddSeconds(45)
do {
  try {
    $health = Invoke-RestMethod -TimeoutSec 10 "$url/api/health"
    if ($health.success) { break }
  } catch { Start-Sleep -Seconds 2 }
} while ((Get-Date) -lt $deadline)
if (-not $health.success) { throw "Tunnel is running but API is unavailable: $url" }

$runtimeConfig = [ordered]@{
  apiBaseUrl = "$url/api"
  portalUrl = $url
  updatedAt = (Get-Date).ToUniversalTime().ToString('o')
} | ConvertTo-Json
[IO.File]::WriteAllText($configPath, $runtimeConfig + [Environment]::NewLine, (New-Object Text.UTF8Encoding($false)))

if (-not $SkipGitPush) {
  git -C $root add runtime-config.json
  git -C $root diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git -C $root commit -m "chore: update temporary server URL"
    if ($LASTEXITCODE -ne 0) { throw 'Git commit failed' }
    git -C $root push origin main
    if ($LASTEXITCODE -ne 0) { throw 'Git push failed' }
  }
}

Write-Host ''
Write-Host 'Public test server is ready' -ForegroundColor Green
Write-Host "Portal: $url"
Write-Host "API:    $url/api"
Write-Host "Config: https://raw.githubusercontent.com/0tyght/postsales-iot/main/runtime-config.json"

if ($Background) {
  Write-Host 'Mode: background (servers continue running after this window closes)'
  return
}

Write-Host ''
Write-Host 'Server monitor is running. Press Q to stop API, web server, and tunnel.' -ForegroundColor Cyan
Write-Host 'You can also press Ctrl+C; the script will attempt to stop all services.' -ForegroundColor DarkGray

try {
  while ($true) {
    $apiState = if (Test-Port 5000) { 'ONLINE' } else { 'OFFLINE' }
    $webState = if (Test-Port 5173) { 'ONLINE' } else { 'OFFLINE' }
    $tunnelState = if (Get-Process cloudflared -ErrorAction SilentlyContinue) { 'ONLINE' } else { 'OFFLINE' }
    Write-Host ("[{0}] API: {1} | Web: {2} | Tunnel: {3}" -f (Get-Date -Format 'HH:mm:ss'),$apiState,$webState,$tunnelState)

    for ($step = 0; $step -lt 10; $step++) {
      try {
        if ([Console]::KeyAvailable -and [Console]::ReadKey($true).Key -eq [ConsoleKey]::Q) {
          throw [System.OperationCanceledException]::new('Stop requested')
        }
      } catch [System.OperationCanceledException] {
        throw
      } catch {
        # Some non-interactive terminals do not expose keyboard state; Ctrl+C still works.
      }
      Start-Sleep -Milliseconds 500
    }
  }
} catch [System.OperationCanceledException] {
  Write-Host 'Stop requested.' -ForegroundColor Yellow
} finally {
  Write-Host 'Stopping public test server...' -ForegroundColor Yellow
  Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
  Stop-PortProcess 5173
  Stop-PortProcess 5000
  Write-Host 'API, web server, and tunnel are stopped.' -ForegroundColor Green
}
