# IDM-VTON Python backend launcher
$Py = "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe"
if (-not (Test-Path $Py)) { $Py = "python" }

Set-Location $PSScriptRoot

Write-Host "Installing dependencies..."
& $Py -m pip install -q -r requirements.txt

# Set to 'false' for real Hugging Face IDM-VTON inference (2–5 min per try-on)
if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"')
      Set-Item -Path "env:$name" -Value $value
    }
  }
}
if (-not $env:VTON_MOCK) { $env:VTON_MOCK = "true" }
if (-not $env:VTON_GPU_FALLBACK) { $env:VTON_GPU_FALLBACK = "true" }
if (-not $env:VTON_PORT) { $env:VTON_PORT = "8010" }

Write-Host "Starting VTON backend at http://127.0.0.1:$env:VTON_PORT (VTON_MOCK=$env:VTON_MOCK, VTON_GPU_FALLBACK=$env:VTON_GPU_FALLBACK, HF_TOKEN=$(if ($env:HF_TOKEN) { 'set' } else { 'missing' }))"
& $Py -m uvicorn main:app --host 127.0.0.1 --port $env:VTON_PORT
