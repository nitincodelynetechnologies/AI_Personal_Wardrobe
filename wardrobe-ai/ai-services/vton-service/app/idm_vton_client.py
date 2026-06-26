import base64
import logging
import os
import uuid
from pathlib import Path

from gradio_client import Client, handle_file

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: Client | None = None


def _get_hf_token() -> str | None:
    for key in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HUGGINGFACE_TOKEN"):
        value = os.getenv(key, "").strip()
        if value:
            return value
    return None


def get_gradio_client() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        hf_token = settings.get("hf_token")
        logger.info(
            "Connecting to IDM-VTON space: %s (hf_token=%s)",
            settings["idm_space"],
            "set" if hf_token else "missing",
        )
        if hf_token:
            _client = Client(settings["idm_space"], hf_token=hf_token)
        else:
            _client = Client(settings["idm_space"])
    return _client


def _ensure_temp_dir() -> Path:
    settings = get_settings()
    path = Path(settings["temp_dir"])
    path.mkdir(parents=True, exist_ok=True)
    return path


def _write_temp(data: bytes, suffix: str) -> str:
    temp_dir = _ensure_temp_dir()
    file_path = temp_dir / f"{uuid.uuid4().hex}{suffix}"
    file_path.write_bytes(data)
    return str(file_path)


def _cleanup_paths(*paths: str | None) -> None:
    for path in paths:
        if not path:
            continue
        try:
            if os.path.isfile(path):
                os.remove(path)
        except OSError:
            logger.debug("Failed to remove temp file: %s", path)


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

    raise ValueError(f"Unsupported IDM-VTON output type: {type(result_item)!r}")


def run_idm_vton(
    user_bytes: bytes,
    garment_bytes: bytes,
    garment_description: str = "A stylish garment",
) -> dict:
    settings = get_settings()

    if settings["use_mock"]:
        encoded = base64.b64encode(user_bytes).decode("ascii")
        return {
            "success": True,
            "mock": True,
            "result_image_url": f"data:image/jpeg;base64,{encoded}",
            "message": "VTON_MOCK=true — echoing user image",
        }

    user_path = None
    garment_path = None

    try:
        user_path = _write_temp(user_bytes, ".jpg")
        garment_path = _write_temp(garment_bytes, ".jpg")

        client = get_gradio_client()
        result = client.predict(
            dict={"background": handle_file(user_path), "layers": [], "composite": None},
            garm_img=handle_file(garment_path),
            garment_des=garment_description or "A stylish garment",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=settings["denoise_steps"],
            seed=settings["seed"],
            api_name="/tryon",
        )

        output = result[0] if isinstance(result, (list, tuple)) and result else result
        result_image_url = _resolve_result_image(output)

        return {
            "success": True,
            "mock": False,
            "result_image_url": result_image_url,
        }
    finally:
        _cleanup_paths(user_path, garment_path)
