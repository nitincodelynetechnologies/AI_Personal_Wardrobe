import os

import pytest
from fastapi.testclient import TestClient

os.environ["STYLIST_MOCK"] = "true"

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "stylist-service"


def test_analyze_clothing_returns_expected_shape(client):
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
        b"\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    response = client.post(
        "/v1/clothing/analyze",
        files={"image": ("sample.png", png_bytes, "image/png")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["category"] in {"Top", "Bottom", "Footwear", "Accessory"}
    assert body["color_hex"].startswith("#")
    assert len(body["embedding"]) == 512


def test_remove_background_returns_png(client):
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
        b"\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    response = client.post(
        "/v1/clothing/remove-background",
        files={"image": ("sample.png", png_bytes, "image/png")},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(b"\x89PNG\r\n\x1a\n")


def test_recommend_outfit_returns_ids(client):
    payload = {
        "season": "All",
        "fashion_dna": {
            "style_score": 75,
            "color_affinity": {"navy": 0.8, "black": 0.6},
        },
        "items": [
            {"id": "top-1", "category": "Top", "color_hex": "#112233", "season": "All"},
            {"id": "bottom-1", "category": "Bottom", "color_hex": "#AABBCC", "season": "All"},
            {"id": "footwear-1", "category": "Footwear", "color_hex": "#000000", "season": "All"},
        ],
    }
    response = client.post("/v1/outfits/recommend", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["top_id"] == "top-1"
    assert body["bottom_id"] == "bottom-1"
    assert body["footwear_id"] == "footwear-1"
    assert 70 <= body["style_score"] <= 99


def test_recommend_outfit_rejects_insufficient_wardrobe(client):
    payload = {
        "season": "All",
        "items": [{"id": "top-1", "category": "Top", "color_hex": "#112233", "season": "All"}],
    }
    response = client.post("/v1/outfits/recommend", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INSUFFICIENT_WARDROBE"
