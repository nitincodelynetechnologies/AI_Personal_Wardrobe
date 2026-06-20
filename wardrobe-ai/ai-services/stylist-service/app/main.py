import asyncio
import base64
import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.analysis_service import AnalysisServiceError, AnalysisService, get_analysis_service
from app.config import get_settings
from app.recommendation_service import (
    RecommendationService,
    RecommendationServiceError,
    get_recommendation_service,
)
from app.schemas.clothing import AnalyzeResponse, ErrorResponse
from app.schemas.outfits import OutfitRecommendRequest, OutfitRecommendResponse

logger = logging.getLogger(__name__)

clothing_router = APIRouter(prefix="/v1/clothing", tags=["clothing"])
outfits_router = APIRouter(prefix="/v1/outfits", tags=["outfits"])


@asynccontextmanager
async def lifespan(_app):
    settings = get_settings()
    logger.info("Starting stylist-service (mock_models=%s)", settings["use_mock_models"])
    if not settings["use_mock_models"]:
        get_analysis_service()._ensure_model()
    yield


async def _decode_upload(upload: UploadFile) -> bytes:
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_IMAGE_FORMAT", "detail": "Image must be JPEG or PNG"},
        )
    return await upload.read()


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


@clothing_router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Analyze clothing image for category, color, and embedding",
)
async def analyze_clothing(
    file: UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    images: UploadFile | None = File(None),
    image_base64: str | None = Form(None),
    service: AnalysisService = Depends(get_analysis_service),
):
    raw = await _resolve_image_bytes(file, image, images, image_base64)
    try:
        result = service.analyze(raw)
    except AnalysisServiceError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "detail": exc.message}) from exc

    return AnalyzeResponse(**result)


@clothing_router.post(
    "/remove-background",
    responses={
        400: {"model": ErrorResponse},
        200: {"content": {"image/png": {}}},
    },
    summary="Remove clothing image background",
)
async def remove_clothing_background(
    file: UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    images: UploadFile | None = File(None),
    image_base64: str | None = Form(None),
    service: AnalysisService = Depends(get_analysis_service),
):
    raw = await _resolve_image_bytes(file, image, images, image_base64)
    try:
        result = await asyncio.to_thread(service.remove_background, raw)
    except AnalysisServiceError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "detail": exc.message}) from exc

    return Response(content=result, media_type="image/png")


@outfits_router.post(
    "/recommend",
    response_model=OutfitRecommendResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Recommend the best outfit combination from wardrobe items",
)
async def recommend_outfit(
    payload: OutfitRecommendRequest,
    service: RecommendationService = Depends(get_recommendation_service),
):
    try:
        result = service.recommend(payload)
    except RecommendationServiceError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "detail": exc.message}) from exc

    return OutfitRecommendResponse(**result)


app = FastAPI(
    title=get_settings()["app_name"],
    description="AI clothing analysis and smart outfit recommendation for AI Personal Wardrobe Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(clothing_router)
app.include_router(outfits_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "stylist-service"}
