import os
from functools import lru_cache


@lru_cache
def get_settings():
    return {
        "app_name": os.getenv("APP_NAME", "Stylist Service"),
        "max_image_bytes": int(os.getenv("MAX_IMAGE_SIZE_MB", "10")) * 1024 * 1024,
        "allowed_formats": {"JPEG", "PNG", "JPG", "WEBP"},
        "embedding_size": int(os.getenv("EMBEDDING_SIZE", "512")),
        "style_score_min": int(os.getenv("STYLE_SCORE_MIN", "70")),
        "style_score_max": int(os.getenv("STYLE_SCORE_MAX", "99")),
        "use_mock_models": os.getenv("STYLIST_MOCK", "false").lower() == "true",
    }
