import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.routers import face
from app.services.insightface_engine import get_face_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    logger.info("Loading InsightFace model: %s", settings["model_name"])
    get_face_engine()
    yield


app = FastAPI(
    title=get_settings()["app_name"],
    description="512-dimensional face embedding microservice for AI Personal Wardrobe Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(face.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "face-service"}
