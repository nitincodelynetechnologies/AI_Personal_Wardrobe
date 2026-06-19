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

function Initialize-QdrantCollection {
    param(
        [string]$Name,
        [int]$VectorSize,
        [string[]]$PayloadIndexes,
        [string]$SchemaFile
    )

    Write-Host "Initializing Qdrant collection: $Name at $QdrantUrl"

    try {
        Invoke-RestMethod -Uri "$QdrantUrl/collections/$Name" -Method Get -ErrorAction Stop | Out-Null
        Write-Host "  Collection '$Name' already exists - skipping creation"
    } catch {
        $body = @{ vectors = @{ size = $VectorSize; distance = 'Cosine' } } | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$QdrantUrl/collections/$Name" -Method Put -Body $body -ContentType 'application/json' | Out-Null
        Write-Host ('  Created collection {0} with {1} dimensions (Cosine)' -f $Name, $VectorSize)
    }

    foreach ($field in $PayloadIndexes) {
        try {
            $indexBody = @{ field_name = $field; field_schema = 'keyword' } | ConvertTo-Json
            Invoke-RestMethod -Uri "$QdrantUrl/collections/$Name/index" -Method Put -Body $indexBody -ContentType 'application/json' | Out-Null
            Write-Host "  Payload index on '$field' (keyword)"
        } catch {
            Write-Host "  Payload index on '$field' already exists or skipped"
        }
    }

    Write-Host "  Schema reference: $SchemaFile"
    Write-Host ''
}

$FashionDnaName = if ($env:QDRANT_COLLECTION_FASHION_DNA) { $env:QDRANT_COLLECTION_FASHION_DNA } else { 'fashion_dna_vectors' }
$RecommendationName = if ($env:QDRANT_COLLECTION_RECOMMENDATIONS) { $env:QDRANT_COLLECTION_RECOMMENDATIONS } else { 'recommendation_vectors' }
$FashionDnaSize = if ($env:QDRANT_FASHION_DNA_VECTOR_SIZE) { [int]$env:QDRANT_FASHION_DNA_VECTOR_SIZE } else { 512 }
$RecommendationSize = if ($env:QDRANT_RECOMMENDATION_VECTOR_SIZE) { [int]$env:QDRANT_RECOMMENDATION_VECTOR_SIZE } else { 512 }

Initialize-QdrantCollection `
    -Name $FashionDnaName `
    -VectorSize $FashionDnaSize `
    -PayloadIndexes @('user_id', 'fashion_dna_id', 'fashion_style') `
    -SchemaFile (Join-Path $ScriptDir 'collections\fashion_dna_vectors.json')

Initialize-QdrantCollection `
    -Name $RecommendationName `
    -VectorSize $RecommendationSize `
    -PayloadIndexes @('user_id', 'item_id', 'category', 'source') `
    -SchemaFile (Join-Path $ScriptDir 'collections\recommendation_vectors.json')

Write-Host 'Qdrant Phase 2 collections initialization complete.'
