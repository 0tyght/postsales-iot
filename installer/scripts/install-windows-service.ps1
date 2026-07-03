param(
  [string]$InstallDir = "C:\PostSalesIoT",
  [string]$ServiceName = "PostSalesIoT",
  [string]$NssmPath = ".\tools\nssm.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $NssmPath)) {
  throw "nssm.exe not found: $NssmPath. Put nssm.exe in installer\tools before installing the Windows Service."
}

$startScript = Join-Path $InstallDir "installer\scripts\start-postsales-server.ps1"
if (-not (Test-Path $startScript)) {
  throw "Start script not found: $startScript"
}

& $NssmPath stop $ServiceName 2>$null | Out-Null
& $NssmPath remove $ServiceName confirm 2>$null | Out-Null

& $NssmPath install $ServiceName "powershell.exe" "-ExecutionPolicy Bypass -File `"$startScript`" -InstallDir `"$InstallDir`""
& $NssmPath set $ServiceName AppDirectory $InstallDir
& $NssmPath set $ServiceName DisplayName "Post-Sales IoT Local Server"
& $NssmPath set $ServiceName Description "Runs the Post-Sales IoT API server on the customer local server."
& $NssmPath set $ServiceName Start SERVICE_AUTO_START
& $NssmPath start $ServiceName

Write-Host "Windows Service installed and started: $ServiceName" -ForegroundColor Green
