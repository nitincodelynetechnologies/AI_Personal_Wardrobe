import os
from functools import lru_cache


@lru_cache
def get_settings():
    return {
        "app_name": os.getenv("APP_NAME", "Face Service"),
        "model_name": os.getenv("FACE_MODEL_NAME", "buffalo_l"),
        "det_size": int(os.getenv("FACE_DET_SIZE", "640")),
        "max_image_bytes": int(os.getenv("MAX_IMAGE_SIZE_MB", "10")) * 1024 * 1024,
        "allowed_formats": {"JPEG", "PNG", "JPG"},
        "ctx_id": int(os.getenv("INSIGHTFACE_CTX_ID", "-1")),
    }
