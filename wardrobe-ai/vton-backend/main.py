"""
IDM-VTON Virtual Try-On API (FastAPI + gradio_client)

Run:
  pip install fastapi uvicorn gradio_client python-multipart
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Note: This is the Python AI backend. The NestJS API gateway lives in ../backend/
"""

from __future__ import annotations

import base64
import logging
import os
import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import handle_file

from gradio_client_compat import create_gradio_client, is_hf_token_configured

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IDM_VTON_SPACE = os.getenv("IDM_VTON_SPACE", "yisol/IDM-VTON")
IDM_VTON_API_NAME = os.getenv("IDM_VTON_API_NAME", "/tryon")
TEMP_DIR = Path(os.getenv("VTON_TEMP_DIR", ".vton-temp"))
USE_MOCK = os.getenv("VTON_MOCK", "false").lower() == "true"
GPU_FALLBACK = os.getenv("VTON_GPU_FALLBACK", "true").lower() == "true"

_client = None


def _mock_tryon_response(user_bytes: bytes, mime: str, *, gpu_fallback: bool = False) -> dict:
    encoded = base64.b64encode(user_bytes).decode("ascii")
    payload = {
        "success": True,
        "mock": True,
        "result_image_url": f"data:{mime};base64,{encoded}",
    }
    if gpu_fallback:
        payload["gpu_fallback"] = True
        payload["fallback_reason"] = (
            "Hugging Face IDM-VTON has no free GPU right now. Showing dev pairing — retry later for real AI."
        )
    return payload


def _is_hf_capacity_error(exc: Exception | str) -> bool:
    message = str(exc).lower()
    return any(
        token in message
        for token in (
            "no gpu",
            "gpu was",
            "retry later",
            "queue",
            "busy",
            "rate limit",
            "overloaded",
            "zerogpu",
            "quota exceeded",
            "quota",
        )
    )


def _gpu_fallback_or_error(user_bytes: bytes, mime: str, exc: Exception) -> dict:
    if GPU_FALLBACK and user_bytes and _is_hf_capacity_error(exc):
        logger.warning("HF capacity error — falling back to dev mock pairing: %s", exc)
        return _mock_tryon_response(user_bytes, mime, gpu_fallback=True)
    return {"success": False, "error": str(exc)}


def get_client():
    global _client
    if _client is None:
        token_configured = is_hf_token_configured()
        logger.info(
            "Connecting to Gradio space: %s (HF_TOKEN env=%s)",
            IDM_VTON_SPACE,
            "set" if token_configured else "missing",
        )
        if not token_configured:
            logger.warning(
                "HF_TOKEN not set in environment — unauthenticated requests use strict public ZeroGPU limits"
            )
        _client = create_gradio_client(IDM_VTON_SPACE)
    return _client


def _resolve_result_image(result_item) -> str:
    if result_item is None:
        raise ValueError("IDM-VTON returned an empty result")

    if isinstance(result_item, dict):
        for key in ("url", "path", "name"):
            value = result_item.get(key)
            if isinstance(value, str) and value:
                result_item = value
                break

    if isinstance(result_item, str):
        if result_item.startswith(("http://", "https://", "data:")):
            return result_item
        if os.path.isfile(result_item):
            encoded = base64.b64encode(Path(result_item).read_bytes()).decode("ascii")
            mime = "image/png" if result_item.lower().endswith(".png") else "image/jpeg"
            return f"data:{mime};base64,{encoded}"

    raise ValueError(f"Unsupported IDM-VTON output: {type(result_item)!r}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("VTON backend ready (mock=%s)", USE_MOCK)
    yield


app = FastAPI(title="IDM-VTON Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "idm-vton",
        "mock": USE_MOCK,
        "gpu_fallback": GPU_FALLBACK,
        "hf_authenticated": is_hf_token_configured(),
    }


@app.post("/api/try-on")
async def process_vton(
    user_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    garment_description: str = Form("A stylish garment"),
):
    user_path = None
    garment_path = None
    user_bytes = b""
    garment_bytes = b""

    try:
        user_bytes = await user_image.read()
        garment_bytes = await garment_image.read()

        if not user_bytes or not garment_bytes:
            return {"success": False, "error": "Both user_image and garment_image are required"}

        if USE_MOCK:
            mime = user_image.content_type or "image/jpeg"
            return _mock_tryon_response(user_bytes, mime)

        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        user_path = str(TEMP_DIR / f"user_{uuid.uuid4().hex}.jpg")
        garment_path = str(TEMP_DIR / f"garment_{uuid.uuid4().hex}.jpg")

        with open(user_path, "wb") as buffer:
            buffer.write(user_bytes)
        with open(garment_path, "wb") as buffer:
            buffer.write(garment_bytes)

        client = get_client()
        result = client.predict(
            dict={"background": handle_file(user_path), "layers": [], "composite": None},
            garm_img=handle_file(garment_path),
            garment_des=garment_description or "A stylish garment",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=int(os.getenv("VTON_DENOISE_STEPS", "30")),
            seed=int(os.getenv("VTON_SEED", "42")),
            api_name=IDM_VTON_API_NAME,
        )

        output = result[0] if isinstance(result, (list, tuple)) and result else result
        result_image_url = _resolve_result_image(output)

        return {"success": True, "result_image_url": result_image_url}

    except Exception as exc:
        logger.exception("VTON processing failed")
        return _gpu_fallback_or_error(user_bytes, user_image.content_type or "image/jpeg", exc)
    finally:
        for path in (user_path, garment_path):
            if path and os.path.isfile(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
