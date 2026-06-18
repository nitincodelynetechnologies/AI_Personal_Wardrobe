#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir '..\..')
$CollectionFile = Join-Path $ScriptDir 'collections\users_face_vectors.json'
$EnvFile = Join-Path $RootDir '.env'

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
}

$QdrantUrl = if ($env:QDRANT_URL) { $env:QDRANT_URL } else { 'http://localhost:6333' }
$CollectionName = if ($env:QDRANT_COLLECTION_FACES) { $env:QDRANT_COLLECTION_FACES } else { 'users_face_vectors' }
$VectorSize = 512

Write-Host "Initializing Qdrant collection: $CollectionName at $QdrantUrl"

try {
    Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName" -Method Get -ErrorAction Stop | Out-Null
    Write-Host "  Collection '$CollectionName' already exists — skipping creation"
} catch {
    $body = @{ vectors = @{ size = $VectorSize; distance = 'Cosine' } } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName" -Method Put -Body $body -ContentType 'application/json' | Out-Null
    Write-Host "  Created collection '$CollectionName' (${VectorSize}-dim, Cosine)"
}

function New-PayloadIndex {
    param([string]$Field, [string]$Schema = 'keyword')
    try {
        $indexBody = @{ field_name = $Field; field_schema = $Schema } | ConvertTo-Json
        Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName/index" -Method Put -Body $indexBody -ContentType 'application/json' | Out-Null
        Write-Host "  Payload index on '$Field' ($Schema)"
    } catch {
        Write-Host "  Payload index on '$Field' already exists or skipped"
    }
}

New-PayloadIndex -Field 'user_id'
New-PayloadIndex -Field 'email'
New-PayloadIndex -Field 'name'

Write-Host ""
Write-Host "Collection schema reference: $CollectionFile"
Write-Host 'Qdrant face vectors initialization complete.'
