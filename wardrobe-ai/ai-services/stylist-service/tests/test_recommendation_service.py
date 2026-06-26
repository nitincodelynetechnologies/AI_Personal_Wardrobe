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


def test_recommendation_randomizes_within_top_scoring_pool():
    service = RecommendationService()
    payload = OutfitRecommendRequest(
        season="All",
        items=[
            WardrobeItemInput(id="top-a", category="Top", color_hex="#112233", season="All"),
            WardrobeItemInput(id="top-b", category="Top", color_hex="#223344", season="All"),
            WardrobeItemInput(id="top-c", category="Top", color_hex="#334455", season="All"),
            WardrobeItemInput(id="bottom-a", category="Bottom", color_hex="#AABBCC", season="All"),
            WardrobeItemInput(id="bottom-b", category="Bottom", color_hex="#BBCCDD", season="All"),
            WardrobeItemInput(id="shoe-a", category="Footwear", color_hex="#000000", season="All"),
            WardrobeItemInput(id="shoe-b", category="Footwear", color_hex="#222222", season="All"),
        ],
    )

    top_ids = {service.recommend(payload)["top_id"] for _ in range(24)}
    assert len(top_ids) > 1


def test_recommendation_excludes_recent_combos():
    service = RecommendationService()
    payload = OutfitRecommendRequest(
        season="All",
        items=[
            WardrobeItemInput(id="top-a", category="Top", color_hex="#112233", season="All"),
            WardrobeItemInput(id="top-b", category="Top", color_hex="#223344", season="All"),
            WardrobeItemInput(id="bottom-a", category="Bottom", color_hex="#AABBCC", season="All"),
            WardrobeItemInput(id="bottom-b", category="Bottom", color_hex="#BBCCDD", season="All"),
            WardrobeItemInput(id="shoe-a", category="Footwear", color_hex="#000000", season="All"),
            WardrobeItemInput(id="shoe-b", category="Footwear", color_hex="#222222", season="All"),
        ],
        exclude_combos=[
            {"top_id": "top-a", "bottom_id": "bottom-a", "footwear_id": "shoe-a"},
            {"top_id": "top-a", "bottom_id": "bottom-a", "footwear_id": "shoe-b"},
            {"top_id": "top-a", "bottom_id": "bottom-b", "footwear_id": "shoe-a"},
            {"top_id": "top-a", "bottom_id": "bottom-b", "footwear_id": "shoe-b"},
            {"top_id": "top-b", "bottom_id": "bottom-a", "footwear_id": "shoe-a"},
            {"top_id": "top-b", "bottom_id": "bottom-a", "footwear_id": "shoe-b"},
            {"top_id": "top-b", "bottom_id": "bottom-b", "footwear_id": "shoe-a"},
        ],
    )

    result = service.recommend(payload)
    assert result["top_id"] == "top-b"
    assert result["bottom_id"] == "bottom-b"
    assert result["footwear_id"] == "shoe-b"


def test_recommendation_raises_when_no_new_combos():
    service = RecommendationService()
    payload = OutfitRecommendRequest(
        season="All",
        items=[
            WardrobeItemInput(id="top-1", category="Top", color_hex="#111111", season="All"),
            WardrobeItemInput(id="bottom-1", category="Bottom", color_hex="#222222", season="All"),
            WardrobeItemInput(id="shoe-1", category="Footwear", color_hex="#333333", season="All"),
        ],
        exclude_combos=[
            {"top_id": "top-1", "bottom_id": "bottom-1", "footwear_id": "shoe-1"},
        ],
    )

    with pytest.raises(Exception) as exc:
        service.recommend(payload)

    assert exc.value.code == "NO_NEW_COMBINATIONS"


def test_recommendation_builds_item_pools():
    service = RecommendationService()
    tops = [
        WardrobeItemInput(id=f"top-{index}", category="Top", color_hex="#111111", season="All")
        for index in range(8)
    ]
    bottoms = [
        WardrobeItemInput(id="bottom-1", category="Bottom", color_hex="#AABBCC", season="All")
    ]
    footwear = [
        WardrobeItemInput(id="shoe-1", category="Footwear", color_hex="#000000", season="All")
    ]

    pool = service._build_item_pool(
        tops,
        bottoms,
        footwear,
        slot="top",
        fashion_dna=None,
        season="All",
        pool_size=5,
    )

    assert len(pool) == 5
