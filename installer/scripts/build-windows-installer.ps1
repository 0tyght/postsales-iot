param(
  [string]$InnoCompiler = "iscc.exe",
  [string]$OutputDir = ".\release\customer-local"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")

Push-Location $root
try {
  powershell -ExecutionPolicy Bypass -File .\installer\scripts\package-customer-edition.ps1 -OutputDir $OutputDir
  & $InnoCompiler .\installer\windows\PostSalesIoT.iss
  Write-Host "Windows installer build complete." -ForegroundColor Green
} finally {
  Pop-Location
}
