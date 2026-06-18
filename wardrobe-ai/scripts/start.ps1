#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $RootDir

if (-not (Test-Path '.env')) {
    Write-Host 'Creating .env from .env.example...'
    Copy-Item '.env.example' '.env'
    Write-Host 'Update passwords in .env before production use.'
}

Write-Host 'Starting Wardrobe AI infrastructure...'
docker compose up -d

Write-Host 'Waiting for services to become healthy...'
Start-Sleep -Seconds 10

docker compose ps

Write-Host ''
Write-Host 'Initializing Qdrant collections...'
& "$PSScriptRoot\init-qdrant.ps1"

Write-Host ''
Write-Host 'All services are running.'
Write-Host '  PostgreSQL : localhost:5432'
Write-Host '  Redis      : localhost:6379'
Write-Host '  Qdrant     : localhost:6333'
Write-Host '  MinIO API  : localhost:9000'
Write-Host '  MinIO UI   : localhost:9001'
