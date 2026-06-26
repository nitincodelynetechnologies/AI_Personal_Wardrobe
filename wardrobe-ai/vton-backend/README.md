# Python IDM-VTON Backend

FastAPI service that calls **yisol/IDM-VTON** via `gradio_client`.

> **Note:** The NestJS API gateway is in `../backend/`. This folder is the **Python AI** service only.

## Setup

```powershell
cd wardrobe-ai/vton-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn gradio_client python-multipart
```

## Run (port 8000)

```powershell
# Optional mock (no Hugging Face) for UI testing:
$env:VTON_MOCK = "true"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Health: http://localhost:8000/health  
- Try-on: `POST http://localhost:8000/api/try-on`  
  - `multipart/form-data`: `user_image`, `garment_image`, optional `garment_description`

## Real IDM-VTON

```powershell
$env:VTON_MOCK = "false"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

First request may take 1–3+ minutes (Gradio queue).
