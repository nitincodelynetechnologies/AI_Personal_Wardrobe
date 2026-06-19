#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir '..\..')
$EnvFile = Join-Path $RootDir '.env'

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
}

$QdrantUrl = if ($env:QDRANT_URL -and $env:QDRANT_URL -notmatch '\$\{') {
    $env:QDRANT_URL
} else {
    $qdrantHost = if ($env:QDRANT_HOST) { $env:QDRANT_HOST } else { 'localhost' }
    $qdrantPort = if ($env:QDRANT_PORT) { $env:QDRANT_PORT } else { '6333' }
    "http://${qdrantHost}:${qdrantPort}"
}

$CollectionName = if ($env:QDRANT_COLLECTION_CLOTHING_ITEMS) {
    $env:QDRANT_COLLECTION_CLOTHING_ITEMS
} else {
    'clothing_item_vectors'
}

$VectorSize = if ($env:QDRANT_CLOTHING_ITEM_VECTOR_SIZE) {
    [int]$env:QDRANT_CLOTHING_ITEM_VECTOR_SIZE
} else {
    512
}

Write-Host "Initializing Qdrant collection: $CollectionName at $QdrantUrl"

try {
    Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName" -Method Get -ErrorAction Stop | Out-Null
    Write-Host "  Collection '$CollectionName' already exists - skipping creation"
} catch {
    $body = @{ vectors = @{ size = $VectorSize; distance = 'Cosine' } } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName" -Method Put -Body $body -ContentType 'application/json' | Out-Null
    Write-Host ('  Created collection {0} ({1}-dim, Cosine)' -f $CollectionName, $VectorSize)
}

foreach ($field in @('user_id', 'clothing_id', 'category', 'color_hex')) {
    try {
        $indexBody = @{ field_name = $field; field_schema = 'keyword' } | ConvertTo-Json
        Invoke-RestMethod -Uri "$QdrantUrl/collections/$CollectionName/index" -Method Put -Body $indexBody -ContentType 'application/json' | Out-Null
        Write-Host "  Payload index on '$field' (keyword)"
    } catch {
        Write-Host "  Payload index on '$field' already exists or skipped"
    }
}

Write-Host ''
Write-Host "Schema reference: $(Join-Path $ScriptDir 'collections\clothing_item_vectors.json')"
Write-Host 'Qdrant Phase 3 collections initialization complete.'
