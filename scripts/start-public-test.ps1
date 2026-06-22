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
$deadline = (Get-Date).AddSeconds(20)
while ((-not (Test-Port 5000)) -and (Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
}
if (-not (Test-Port 5000)) { throw 'API server failed to start' }

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
$url = $null
$lastTunnelError = $null

for ($attempt = 1; $attempt -le 4 -and -not $url; $attempt++) {
  $attemptFailure = $null
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $outLog = Join-Path $root ".tools\portal-$stamp-attempt$attempt.out.log"
  $errorLog = Join-Path $root ".tools\portal-$stamp-attempt$attempt.err.log"
  Write-Host "Starting Cloudflare Quick Tunnel (attempt $attempt/4)..." -ForegroundColor Cyan

  $tunnelProcess = Start-Process -FilePath $cloudflared -ArgumentList 'tunnel','--url','http://127.0.0.1:5000','--no-autoupdate' -WorkingDirectory $root -RedirectStandardOutput $outLog -RedirectStandardError $errorLog -WindowStyle Hidden -PassThru
  $deadline = (Get-Date).AddSeconds(45)

  while (-not $url -and (Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 1
    $logText = ((Get-Content $outLog,$errorLog -ErrorAction SilentlyContinue) -join "`n")
    $match = [regex]::Match($logText, 'https://[a-z0-9-]+\.trycloudflare\.com')
    if ($match.Success) {
      $url = $match.Value
      break
    }

    if ($tunnelProcess.HasExited) { break }
  }

  if ($url) {
    Write-Host 'Waiting for tunnel DNS and API health check...' -ForegroundColor DarkGray
    $health = $null
    $healthError = $null
    $healthDeadline = (Get-Date).AddSeconds(60)
    $tunnelHost = ([Uri]$url).Host
    do {
      try {
        # Query a public resolver directly. Windows may cache the initial NXDOMAIN
        # response while a new Quick Tunnel hostname is still propagating.
        $tunnelIp = Resolve-DnsName $tunnelHost -Server '1.1.1.1' -DnsOnly -Type A -ErrorAction Stop |
          Where-Object { $_.IPAddress } |
          Select-Object -ExpandProperty IPAddress -First 1
        if (-not $tunnelIp) { throw 'Cloudflare DNS has not published an IPv4 address yet.' }

        $healthJson = & curl.exe --silent --show-error --fail --max-time 15 --resolve "${tunnelHost}:443:$tunnelIp" "$url/api/health" 2>&1
        if ($LASTEXITCODE -ne 0) { throw ($healthJson -join ' ') }
        $health = ($healthJson -join "`n") | ConvertFrom-Json
        if ($health.success) {
          Start-Sleep -Seconds 3
          $confirmJson = & curl.exe --silent --show-error --fail --max-time 15 --resolve "${tunnelHost}:443:$tunnelIp" "$url/api/health" 2>&1
          if ($LASTEXITCODE -eq 0 -and (($confirmJson -join "`n") | ConvertFrom-Json).success) { break }
          $health = $null
          throw 'Tunnel health confirmation failed.'
        }
      } catch {
        $healthError = $_.Exception.Message
        Start-Sleep -Seconds 3
      }
    } while ((-not $tunnelProcess.HasExited) -and (Get-Date) -lt $healthDeadline)

    if (-not $health.success) {
      $attemptFailure = "Tunnel URL was created but DNS/API was unavailable: $healthError"
      $url = $null
    }
  }

  if (-not $url) {
    if (-not $tunnelProcess.HasExited) {
      Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
    $lastTunnelError = ((Get-Content $errorLog -ErrorAction SilentlyContinue) -join "`n")
    $summary = $attemptFailure
    if (-not $summary) {
      $summary = ($lastTunnelError -split "`n" | Where-Object { $_ -match 'ERR|failed|error code' } | Select-Object -Last 2) -join ' '
    }
    if (-not $summary) { $summary = 'Cloudflare did not return a tunnel URL in time.' }
    Write-Warning "Cloudflare attempt $attempt failed: $summary"
    if ($attempt -lt 4) { Start-Sleep -Seconds (5 * $attempt) }
  }
}

if (-not $url) {
  throw "Cloudflare Quick Tunnel failed after 4 attempts. This is usually a temporary Cloudflare error. Please wait a few minutes and run this command again. Latest log: $errorLog"
}

$runtimeConfig = [ordered]@{
  apiBaseUrl = "$url/api"
  portalUrl = 'https://0tyght.github.io/postsales-iot/'
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
Write-Host 'Portal: https://0tyght.github.io/postsales-iot/'
Write-Host "API:    $url/api"
Write-Host "Config: https://raw.githubusercontent.com/0tyght/postsales-iot/main/runtime-config.json"

if ($Background) {
  Write-Host 'Mode: background (servers continue running after this window closes)'
  return
}

Write-Host ''
Write-Host 'Server monitor is running. Press Q to stop API and tunnel.' -ForegroundColor Cyan
Write-Host 'You can also press Ctrl+C; the script will attempt to stop all services.' -ForegroundColor DarkGray

try {
  while ($true) {
    $apiState = if (Test-Port 5000) { 'ONLINE' } else { 'OFFLINE' }
    $tunnelState = if (Get-Process cloudflared -ErrorAction SilentlyContinue) { 'ONLINE' } else { 'OFFLINE' }
    Write-Host ("[{0}] API: {1} | Tunnel: {2}" -f (Get-Date -Format 'HH:mm:ss'),$apiState,$tunnelState)

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
  Stop-PortProcess 5000
  Write-Host 'API and tunnel are stopped.' -ForegroundColor Green
}
