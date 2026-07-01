"""Gradio Client factory — Hugging Face auth via environment variables only."""

import os

from gradio_client import Client

_HF_ENV_KEYS = ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HUGGINGFACE_TOKEN")


def ensure_hf_token_env() -> bool:
    """Normalize HF token aliases into HF_TOKEN for gradio_client / huggingface_hub."""
    existing = os.getenv("HF_TOKEN", "").strip()
    if existing:
        return True

    for key in _HF_ENV_KEYS[1:]:
        value = os.getenv(key, "").strip()
        if value:
            os.environ["HF_TOKEN"] = value
            return True

    return False


def is_hf_token_configured() -> bool:
    return ensure_hf_token_env()


def create_gradio_client(space: str) -> Client:
    """
    Connect to a Hugging Face Gradio space.

    Do not pass tokens to Client().__init__ — set HF_TOKEN in the environment
  (e.g. vton-backend/.env) and gradio_client will pick it up automatically.
    """
    ensure_hf_token_env()
    return Client(space)
