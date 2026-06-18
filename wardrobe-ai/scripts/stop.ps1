#Requires -Version 5.1
$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $RootDir
docker compose down
Write-Host 'All Wardrobe AI containers stopped.'
