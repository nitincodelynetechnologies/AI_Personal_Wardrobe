import pytest

from app.recommendation_service import RecommendationService
from app.schemas.outfits import FashionDnaInput, OutfitRecommendRequest, WardrobeItemInput


def test_recommendation_scores_complementary_colors():
    service = RecommendationService()
    payload = OutfitRecommendRequest(
        season="Summer",
        fashion_dna=FashionDnaInput(style_score=80, color_affinity={"blue": 0.9}),
        items=[
            WardrobeItemInput(id="t1", category="Top", color_hex="#0033AA", season="Summer"),
            WardrobeItemInput(id="t2", category="Top", color_hex="#0033AB", season="Summer"),
            WardrobeItemInput(id="b1", category="Bottom", color_hex="#FFCC00", season="Summer"),
            WardrobeItemInput(id="f1", category="Footwear", color_hex="#111111", season="All"),
        ],
    )

    result = service.recommend(payload)
    assert result["top_id"] in {"t1", "t2"}
    assert result["bottom_id"] == "b1"
    assert result["footwear_id"] == "f1"
    assert 70 <= result["style_score"] <= 99


def test_recommendation_requires_core_categories():
    service = RecommendationService()
    payload = OutfitRecommendRequest(
        items=[WardrobeItemInput(id="t1", category="Top", color_hex="#111111")],
    )

    with pytest.raises(Exception) as exc:
        service.recommend(payload)

    assert exc.value.code == "INSUFFICIENT_WARDROBE"
