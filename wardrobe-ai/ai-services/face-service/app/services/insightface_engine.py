import logging

import numpy as np
from insightface.app import FaceAnalysis

from app.config import get_settings

logger = logging.getLogger(__name__)


class FaceEngineError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class InsightFaceEngine:
    """Wraps InsightFace model initialization and single-face embedding extraction."""

    def __init__(self):
        settings = get_settings()
        self._det_size = (settings["det_size"], settings["det_size"])
        self._app = FaceAnalysis(
            name=settings["model_name"],
            providers=["CPUExecutionProvider"],
        )
        self._app.prepare(ctx_id=settings["ctx_id"], det_size=self._det_size)
        logger.info("InsightFace model '%s' loaded", settings["model_name"])

    def extract_embedding(self, image_bgr: np.ndarray) -> list[float]:
        faces = self._app.get(image_bgr)

        if len(faces) == 0:
            raise FaceEngineError("NO_FACE_DETECTED", "No face detected in the image")

        if len(faces) > 1:
            raise FaceEngineError(
                "MULTIPLE_FACES_DETECTED",
                "Multiple faces detected; exactly one face is required",
            )

        embedding = faces[0].embedding
        if embedding is None or len(embedding) != 512:
            raise FaceEngineError(
                "EMBEDDING_FAILED",
                f"Expected 512-dim embedding, got {len(embedding) if embedding is not None else 0}",
            )

        vector = embedding.astype(float).tolist()
        norm = float(np.linalg.norm(embedding))
        if norm > 0:
            vector = (embedding / norm).astype(float).tolist()

        return vector


_engine: InsightFaceEngine | None = None


def get_face_engine() -> InsightFaceEngine:
    global _engine
    if _engine is None:
        _engine = InsightFaceEngine()
    return _engine
