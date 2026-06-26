import os
from functools import lru_cache


@lru_cache
def get_settings() -> dict:
    hf_token = None
    for key in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HUGGINGFACE_TOKEN"):
        value = os.getenv(key, "").strip()
        if value:
            hf_token = value
            break

    return {
        "app_name": "vton-service",
        "host": os.getenv("VTON_SERVICE_HOST", "0.0.0.0"),
        "port": int(os.getenv("VTON_SERVICE_PORT", "8002")),
        "use_mock": os.getenv("VTON_MOCK", "false").lower() == "true",
        "idm_space": os.getenv("IDM_VTON_SPACE", "yisol/IDM-VTON"),
        "denoise_steps": int(os.getenv("VTON_DENOISE_STEPS", "30")),
        "seed": int(os.getenv("VTON_SEED", "42")),
        "temp_dir": os.getenv("VTON_TEMP_DIR", ".vton-temp"),
        "hf_token": hf_token,
    }
