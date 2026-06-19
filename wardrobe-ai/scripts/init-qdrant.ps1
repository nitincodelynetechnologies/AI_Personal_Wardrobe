#Requires -Version 5.1
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

& (Join-Path $ScriptDir '..\database\qdrant\init_users_face_vectors.ps1')
& (Join-Path $ScriptDir '..\database\qdrant\init_phase2_collections.ps1')
& (Join-Path $ScriptDir '..\database\qdrant\init_phase3_collections.ps1')
