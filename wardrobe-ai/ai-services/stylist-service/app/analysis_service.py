import hashlib
import io
import logging
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

from app.config import get_settings

logger = logging.getLogger(__name__)

VALID_CATEGORIES = ("Top", "Bottom", "Footwear", "Accessory")
EMBEDDING_SIZE = 512

# Selected ImageNet-1k indices mapped to wardrobe categories (MVP heuristic).
_IMAGENET_CATEGORY_HINTS: dict[str, tuple[int, ...]] = {
    "Top": (610, 614, 617, 624, 625, 626, 631, 632, 633, 634, 635, 636, 638, 639, 640),
    "Bottom": (608, 609, 615, 616, 619, 620, 621, 622, 623),
    "Footwear": (514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 630),
    "Accessory": (414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428,
                  429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443,
                  444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458,
                  459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473,
                  474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488,
                  489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503,
                  504, 505, 506, 507, 508, 509, 510, 511, 512, 513),
}


class AnalysisServiceError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class AnalysisService:
    def __init__(self):
        self._settings = get_settings()
        self._backbone = None
        self._classifier = None
        self._preprocess = None
        self._rembg_session = None
        self._projection = self._build_projection_matrix()

    def analyze(self, image_bytes: bytes) -> dict[str, object]:
        image_bgr = self._decode_image(image_bytes)
        color_hex = self._extract_dominant_color(image_bgr)

        if self._settings["use_mock_models"]:
            return {
                "category": self._mock_category(image_bytes),
                "color_hex": color_hex,
                "embedding": self._mock_embedding(image_bytes),
            }

        self._ensure_model()
        category = self._classify_category(image_bgr)
        embedding = self._generate_embedding(image_bgr)
        return {"category": category, "color_hex": color_hex, "embedding": embedding}

    def remove_background(self, image_bytes: bytes) -> bytes:
        if not image_bytes:
            raise AnalysisServiceError("MISSING_IMAGE", "Image data is required")

        if len(image_bytes) > self._settings["max_image_bytes"]:
            limit_mb = self._settings["max_image_bytes"] // (1024 * 1024)
            raise AnalysisServiceError("IMAGE_TOO_LARGE", f"Image exceeds {limit_mb} MB limit")

        if self._settings["use_mock_models"]:
            return self._mock_remove_background(image_bytes)

        self._ensure_rembg_session()

        from rembg import remove

        try:
            output = remove(image_bytes, session=self._rembg_session)
        except Exception as exc:
            raise AnalysisServiceError(
                "BACKGROUND_REMOVAL_FAILED",
                "Unable to remove image background",
            ) from exc

        if not output:
            raise AnalysisServiceError("BACKGROUND_REMOVAL_FAILED", "Background removal returned empty data")

        return self._as_png_bytes(output)

    def _ensure_rembg_session(self) -> None:
        if self._rembg_session is not None:
            return

        from rembg import new_session

        self._rembg_session = new_session("u2net")
        logger.info("U-2-Net rembg session initialized (model cached after first download)")

    def _mock_remove_background(self, image_bytes: bytes) -> bytes:
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                rgba = img.convert("RGBA")
                buf = io.BytesIO()
                rgba.save(buf, format="PNG", optimize=True)
                return buf.getvalue()
        except Exception as exc:
            raise AnalysisServiceError("INVALID_IMAGE_FORMAT", "Unable to read image file") from exc

    def _as_png_bytes(self, data: bytes) -> bytes:
        with Image.open(io.BytesIO(data)) as img:
            rgba = img.convert("RGBA")
            buf = io.BytesIO()
            rgba.save(buf, format="PNG", optimize=True)
            return buf.getvalue()

    def _ensure_model(self) -> None:
        if self._backbone is not None:
            return

        import torch
        from torchvision import models

        weights = models.MobileNet_V2_Weights.DEFAULT
        model = models.mobilenet_v2(weights=weights)
        model.eval()

        self._classifier = model
        self._backbone = torch.nn.Sequential(
            model.features,
            torch.nn.AdaptiveAvgPool2d((1, 1)),
            torch.nn.Flatten(),
        )
        self._preprocess = weights.transforms()
        logger.info("MobileNetV2 loaded for clothing analysis")

    def _decode_image(self, data: bytes) -> np.ndarray:
        if not data:
            raise AnalysisServiceError("MISSING_IMAGE", "Image data is required")

        if len(data) > self._settings["max_image_bytes"]:
            limit_mb = self._settings["max_image_bytes"] // (1024 * 1024)
            raise AnalysisServiceError("IMAGE_TOO_LARGE", f"Image exceeds {limit_mb} MB limit")

        try:
            with Image.open(io.BytesIO(data)) as img:
                if img.format not in self._settings["allowed_formats"]:
                    raise AnalysisServiceError("INVALID_IMAGE_FORMAT", "Image must be JPEG or PNG")
        except AnalysisServiceError:
            raise
        except Exception as exc:
            raise AnalysisServiceError("INVALID_IMAGE_FORMAT", "Unable to read image file") from exc

        nparr = np.frombuffer(data, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image_bgr is None:
            raise AnalysisServiceError("INVALID_IMAGE_FORMAT", "Unable to decode image bytes")
        return image_bgr

    def _extract_dominant_color(self, image_bgr: np.ndarray) -> str:
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        sample = rgb.reshape(-1, 3)
        if sample.shape[0] > 5000:
            indices = np.random.default_rng(42).choice(sample.shape[0], 5000, replace=False)
            sample = sample[indices]

        kmeans = KMeans(n_clusters=min(3, len(sample)), n_init=10, random_state=42)
        labels = kmeans.fit_predict(sample)
        dominant = kmeans.cluster_centers_[int(np.argmax(np.bincount(labels)))]
        r, g, b = [int(np.clip(channel, 0, 255)) for channel in dominant]
        return f"#{r:02X}{g:02X}{b:02X}"

    def _to_tensor(self, image_bgr: np.ndarray):
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        return self._preprocess(Image.fromarray(rgb)).unsqueeze(0)

    def _classify_category(self, image_bgr: np.ndarray) -> str:
        import torch

        with torch.no_grad():
            logits = self._classifier(self._to_tensor(image_bgr))
            probabilities = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        scores = {
            category: float(np.sum(probabilities[list(indices)]))
            for category, indices in _IMAGENET_CATEGORY_HINTS.items()
        }
        best = max(scores, key=scores.get)
        if scores[best] > 0.01:
            return best

        height, width = image_bgr.shape[:2]
        if height > width * 1.15:
            return "Bottom"
        if width > height * 1.15:
            return "Top"
        return "Top"

    def _generate_embedding(self, image_bgr: np.ndarray) -> list[float]:
        import torch

        with torch.no_grad():
            features = self._backbone(self._to_tensor(image_bgr)).squeeze(0).cpu().numpy()

        projected = np.dot(features, self._projection)
        norm = np.linalg.norm(projected)
        if norm == 0:
            return self._mock_embedding(image_bgr.tobytes())
        return (projected / norm).astype(float).tolist()

    def _build_projection_matrix(self) -> np.ndarray:
        rng = np.random.default_rng(42)
        matrix = rng.standard_normal((1280, EMBEDDING_SIZE)).astype(np.float32)
        matrix /= np.linalg.norm(matrix, axis=0, keepdims=True)
        return matrix

    def _mock_category(self, data: bytes) -> str:
        digest = hashlib.sha256(data).hexdigest()
        return ("Top", "Bottom", "Footwear")[int(digest[:8], 16) % 3]

    def _mock_embedding(self, data: bytes) -> list[float]:
        digest = hashlib.sha256(data).digest()
        vector = np.array([(digest[i % len(digest)] / 127.5) - 1 for i in range(EMBEDDING_SIZE)])
        norm = np.linalg.norm(vector)
        return (vector / norm).astype(float).tolist() if norm else [0.0] * EMBEDDING_SIZE


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService()
