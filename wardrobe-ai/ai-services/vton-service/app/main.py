import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.idm_vton_client import run_idm_vton

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    logger.info(
        "Starting vton-service (mock=%s, space=%s)",
        settings["use_mock"],
        settings["idm_space"],
    )
    yield


app = FastAPI(
    title="VTON Service",
    description="IDM-VTON virtual try-on via Gradio Client",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _read_image(upload: UploadFile) -> bytes:
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Images must be JPEG or PNG")
    data = await upload.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty image upload")
    return data


@app.get("/health")
async def health():
    settings = get_settings()
    return {"status": "ok", "service": "vton-service", "mock": settings["use_mock"]}


@app.post("/api/try-on")
async def process_vton(
    user_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    garment_description: str = Form("A stylish garment"),
):
    user_bytes = await _read_image(user_image)
    garment_bytes = await _read_image(garment_image)

    try:
        result = await asyncio.to_thread(
            run_idm_vton,
            user_bytes,
            garment_bytes,
            garment_description,
        )
        return result
    except Exception as exc:
        logger.exception("VTON processing failed")
        return {"success": False, "error": str(exc)}


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run("app.main:app", host=settings["host"], port=settings["port"], reload=True)
