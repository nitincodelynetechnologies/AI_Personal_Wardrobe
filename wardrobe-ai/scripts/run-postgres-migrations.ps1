#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$MigrationsDir = Join-Path $RootDir 'database\postgres\migrations'
$EnvFile = Join-Path $RootDir '.env'

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
}

$pgHost = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { 'localhost' }
$pgPort = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { '5432' }
$pgUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { 'wardrobe_user' }
$pgDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { 'wardrobe_db' }
$pgPassword = $env:POSTGRES_PASSWORD

if (-not $pgPassword) {
    throw 'POSTGRES_PASSWORD is required in .env'
}

$env:PGPASSWORD = $pgPassword

$migrationFiles = Get-ChildItem -Path $MigrationsDir -Filter '*.up.sql' | Sort-Object Name

if ($migrationFiles.Count -eq 0) {
    throw "No migration files found in $MigrationsDir"
}

Write-Host "Running PostgreSQL migrations from $MigrationsDir"
Write-Host "  Host: ${pgHost}:${pgPort}  Database: $pgDb  User: $pgUser"
Write-Host ''

foreach ($file in $migrationFiles) {
    Write-Host "Applying $($file.Name)..."
    & psql -h $pgHost -p $pgPort -U $pgUser -d $pgDb -v ON_ERROR_STOP=1 -f $file.FullName
    Write-Host ''
}

Write-Host 'All PostgreSQL migrations complete.'
