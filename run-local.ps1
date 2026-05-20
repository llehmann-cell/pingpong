$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WebPort = if ($env:WEB_PORT) { $env:WEB_PORT } else { "8081" }
$ApiPort = if ($env:API_PORT) { $env:API_PORT } else { "4000" }
$HostName = if ($env:HOST) { $env:HOST } else { "127.0.0.1" }
$ApiUrl = if ($env:EXPO_PUBLIC_API_URL) { $env:EXPO_PUBLIC_API_URL } else { "http://${HostName}:${ApiPort}" }
$BackendProcess = $null
$WebProcess = $null

function Stop-ChildProcesses {
  if ($null -ne $WebProcess -and -not $WebProcess.HasExited) {
    Stop-Process -Id $WebProcess.Id -Force -ErrorAction SilentlyContinue
  }
  if ($null -ne $BackendProcess -and -not $BackendProcess.HasExited) {
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
  }
}

try {
  Set-Location $RootDir

  if (-not (Test-Path "node_modules")) {
    npm install
  }

  if (-not (Test-Path "server/node_modules")) {
    npm --prefix server install
  }

  if ((Test-Path "server/.env") -or $env:DATABASE_URL) {
    Write-Host "Starting API on http://${HostName}:${ApiPort}"
    $env:PORT = $ApiPort
    $BackendProcess = Start-Process npm `
      -ArgumentList @("--prefix", "server", "run", "dev") `
      -NoNewWindow `
      -PassThru `
      -WorkingDirectory $RootDir
  } else {
    Write-Host "Skipping API: create server/.env from server/.env.example to enable backend/auth."
  }

  Write-Host "Building web preview with EXPO_PUBLIC_API_URL=${ApiUrl}"
  $env:EXPO_PUBLIC_API_URL = $ApiUrl
  npx expo export --platform web

  Write-Host "Starting web preview on http://${HostName}:${WebPort}"
  $WebProcess = Start-Process python `
    -ArgumentList @("-m", "http.server", $WebPort, "--bind", $HostName, "-d", "dist") `
    -NoNewWindow `
    -PassThru `
    -WorkingDirectory $RootDir

  Write-Host ""
  Write-Host "Open: http://${HostName}:${WebPort}"
  if ($null -ne $BackendProcess) {
    Write-Host "API:  http://${HostName}:${ApiPort}"
  }
  Write-Host "Press Ctrl+C to stop."

  while ($true) {
    Start-Sleep -Seconds 1
    if ($null -ne $WebProcess -and $WebProcess.HasExited) {
      throw "Web preview stopped unexpectedly."
    }
    if ($null -ne $BackendProcess -and $BackendProcess.HasExited) {
      throw "Backend stopped unexpectedly."
    }
  }
} finally {
  Stop-ChildProcesses
}
