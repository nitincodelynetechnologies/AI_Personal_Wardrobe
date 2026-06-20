#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir

Write-Host "==> Checking Docker..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker CLI not found. Install Docker Desktop."
}

try {
  docker info | Out-Null
} catch {
  Write-Error "Docker daemon is not running. Start Docker Desktop and retry."
}

if (-not (Test-Path ".env")) {
  Write-Host "==> Creating .env from .env.example..."
  Copy-Item ".env.example" ".env"
  Write-Warning "Update secrets in .env before production deployment."
}

Write-Host "==> Cleaning dangling Docker networks..."
docker network prune -f 2>$null

Write-Host "==> Building and starting the platform stack..."
docker compose up --build -d

Write-Host "==> Waiting for services to stabilize (first run may take several minutes)..."
Start-Sleep -Seconds 45
docker compose ps

$noInit = $args -contains "--no-init"
if (-not $noInit) {
  Write-Host ""
  Write-Host "==> Running PostgreSQL migrations..."
  bash "$RootDir/scripts/run-postgres-migrations-docker.sh"

  Write-Host ""
  Write-Host "==> Initializing Qdrant collections..."
  bash "$RootDir/scripts/init-qdrant.sh"
}

$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$frontendPort = "3000"
$apiPort = "3001"
foreach ($line in $envContent) {
  if ($line -match "^FRONTEND_PORT=(.+)$") { $frontendPort = $Matches[1].Trim() }
  if ($line -match "^API_PORT=(.+)$") { $apiPort = $Matches[1].Trim() }
}

Write-Host ""
Write-Host "Platform is up."
Write-Host "  Frontend : http://localhost:$frontendPort"
Write-Host "  API      : http://localhost:$apiPort/api"
Write-Host "  Swagger  : http://localhost:$apiPort/api/docs"
Write-Host ""
Write-Host "Logs: docker compose logs -f"
Write-Host "Stop: docker compose down"
