# VTON Service (IDM-VTON)

Python FastAPI microservice that calls the public [yisol/IDM-VTON](https://huggingface.co/spaces/yisol/IDM-VTON) model via `gradio_client`.

## Prerequisites

```powershell
cd wardrobe-ai/ai-services/vton-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run locally

```powershell
# Optional: skip Hugging Face / Gradio calls during UI development
$env:VTON_MOCK = "true"

uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

Health: http://localhost:8002/health  
Try-on: `POST http://localhost:8002/api/try-on` (`multipart/form-data`: `user_image`, `garment_image`, optional `garment_description`)

The NestJS gateway proxies authenticated requests from `POST /api/vton/try-on` to this service.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VTON_MOCK` | `false` | Echo user image without calling IDM-VTON |
| `VTON_SERVICE_PORT` | `8002` | HTTP port |
| `IDM_VTON_SPACE` | `yisol/IDM-VTON` | Gradio space id |
| `VTON_DENOISE_STEPS` | `30` | Diffusion steps |
| `VTON_SEED` | `42` | Random seed |
