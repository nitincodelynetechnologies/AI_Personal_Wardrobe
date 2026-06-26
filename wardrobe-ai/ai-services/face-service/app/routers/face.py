import base64
import io
import logging

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image

from app.config import get_settings
from app.schemas.face import EmbedResponse, ErrorResponse
from app.services.insightface_engine import FaceEngineError, InsightFaceEngine, get_face_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1/face", tags=["face"])


async def _decode_upload(upload: UploadFile) -> bytes:
    content_type = (upload.content_type or '').lower()
    filename = (upload.filename or '').lower()

    allowed_type = content_type.startswith('image/')
    allowed_name = filename.endswith(('.jpg', '.jpeg', '.png', '.webp'))

    if not allowed_type and not allowed_name:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_IMAGE_FORMAT", "detail": "Image must be JPEG or PNG"},
        )

    return await upload.read()


def _validate_image_bytes(data: bytes) -> np.ndarray:
    settings = get_settings()

    if not data:
        raise HTTPException(
            status_code=400,
            detail={"code": "MISSING_IMAGE", "detail": "Image data is required"},
        )

    if len(data) > settings["max_image_bytes"]:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IMAGE_TOO_LARGE",
                "detail": f"Image exceeds {settings['max_image_bytes'] // (1024 * 1024)} MB limit",
            },
        )

    try:
        with Image.open(io.BytesIO(data)) as img:
            if img.format not in settings["allowed_formats"]:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "code": "INVALID_IMAGE_FORMAT",
                        "detail": "Image must be JPEG or PNG",
                    },
                )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_IMAGE_FORMAT", "detail": "Unable to read image file"},
        ) from exc

    nparr = np.frombuffer(data, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_IMAGE_FORMAT", "detail": "Unable to decode image bytes"},
        )

    return image_bgr


async def _resolve_image_bytes(
    file: UploadFile | None,
    image: UploadFile | None,
    images: UploadFile | None,
    image_base64: str | None,
) -> bytes:
    upload = file or image or images
    if upload is not None:
        return await _decode_upload(upload)

    if image_base64:
        try:
            payload = image_base64.split(",", 1)[-1]
            return base64.b64decode(payload, validate=True)
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_BASE64", "detail": "Invalid base64 image payload"},
            ) from exc

    raise HTTPException(
        status_code=400,
        detail={
            "code": "MISSING_IMAGE",
            "detail": "Provide multipart file (file/image/images) or image_base64 form field",
        },
    )


@router.post(
    "/embed",
    response_model=EmbedResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation or face detection error"},
    },
    summary="Extract 512-dimensional face embedding",
)
async def embed_face(
    file: UploadFile | None = File(None, description="Primary image upload field"),
    image: UploadFile | None = File(None, description="Alternate image upload field"),
    images: UploadFile | None = File(None, description="NestJS gateway compatibility field"),
    image_base64: str | None = Form(None, description="Base64-encoded JPEG/PNG image"),
    engine: InsightFaceEngine = Depends(get_face_engine),
):
    raw = await _resolve_image_bytes(file, image, images, image_base64)
    image_bgr = _validate_image_bytes(raw)

    try:
        embedding = engine.extract_embedding(image_bgr)
    except FaceEngineError as exc:
        logger.info("Face extraction rejected: %s", exc.code)
        raise HTTPException(status_code=400, detail={"code": exc.code, "detail": exc.message}) from exc

    return EmbedResponse(embedding=embedding)
