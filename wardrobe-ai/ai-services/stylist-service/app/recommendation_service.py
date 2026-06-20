import logging
import math
from functools import lru_cache

import numpy as np

from app.config import get_settings
from app.schemas.outfits import FashionDnaInput, OutfitRecommendRequest, WardrobeItemInput

logger = logging.getLogger(__name__)

REQUIRED_CATEGORIES = ("Top", "Bottom", "Footwear")
VALID_SEASONS = ("Summer", "Winter", "Spring", "Fall", "All")

COLOR_NAME_RGB: dict[str, tuple[int, int, int]] = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "gray": (128, 128, 128),
    "grey": (128, 128, 128),
    "navy": (0, 0, 128),
    "blue": (0, 102, 204),
    "red": (204, 0, 0),
    "green": (0, 128, 64),
    "brown": (139, 90, 43),
    "beige": (245, 245, 220),
    "pink": (255, 105, 180),
    "yellow": (255, 215, 0),
    "orange": (255, 140, 0),
    "purple": (128, 0, 128),
}


class RecommendationServiceError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class RecommendationService:
    def __init__(self):
        self._settings = get_settings()

    def recommend(self, payload: OutfitRecommendRequest) -> dict[str, object]:
        season = payload.season if payload.season in VALID_SEASONS else "All"
        buckets = self._bucket_items(payload.items, season)

        if any(not buckets[category] for category in REQUIRED_CATEGORIES):
            raise RecommendationServiceError(
                "INSUFFICIENT_WARDROBE",
                "Not enough items in wardrobe to generate an outfit.",
            )

        best_score = -1.0
        best_combo: tuple[WardrobeItemInput, WardrobeItemInput, WardrobeItemInput] | None = None

        for top in buckets["Top"]:
            for bottom in buckets["Bottom"]:
                for footwear in buckets["Footwear"]:
                    score = self._score_outfit(top, bottom, footwear, payload.fashion_dna, season)
                    if score > best_score:
                        best_score = score
                        best_combo = (top, bottom, footwear)

        if best_combo is None:
            raise RecommendationServiceError(
                "RECOMMENDATION_FAILED",
                "Unable to recommend an outfit from the provided wardrobe.",
            )

        style_score = self._to_style_score(best_score)
        top, bottom, footwear = best_combo
        logger.info(
            "Recommended outfit top=%s bottom=%s footwear=%s score=%s",
            top.id,
            bottom.id,
            footwear.id,
            style_score,
        )

        return {
            "top_id": top.id,
            "bottom_id": bottom.id,
            "footwear_id": footwear.id,
            "style_score": style_score,
        }

    def _bucket_items(
        self,
        items: list[WardrobeItemInput],
        season: str,
    ) -> dict[str, list[WardrobeItemInput]]:
        buckets = {category: [] for category in (*REQUIRED_CATEGORIES, "Accessory")}

        for item in items:
            if item.category not in buckets:
                continue
            if self._matches_season(item.season, season):
                buckets[item.category].append(item)

        for category in REQUIRED_CATEGORIES:
            if buckets[category]:
                continue
            buckets[category] = [item for item in items if item.category == category]

        return buckets

    def _matches_season(self, item_season: str, target_season: str) -> bool:
        if target_season == "All" or item_season == "All":
            return True
        return item_season == target_season

    def _score_outfit(
        self,
        top: WardrobeItemInput,
        bottom: WardrobeItemInput,
        footwear: WardrobeItemInput,
        fashion_dna: FashionDnaInput | None,
        season: str,
    ) -> float:
        score = 0.0
        score += 0.25 * self._season_score(top.season, season)
        score += 0.25 * self._season_score(bottom.season, season)
        score += 0.20 * self._season_score(footwear.season, season)
        score += 0.20 * self._color_complement_score(top.color_hex, bottom.color_hex)
        score += 0.10 * self._color_complement_score(top.color_hex, footwear.color_hex)

        if fashion_dna:
            score += 0.15 * self._fashion_dna_color_score(
                [top.color_hex, bottom.color_hex, footwear.color_hex],
                fashion_dna,
            )
            score += 0.10 * self._embedding_similarity_score(top, bottom, footwear, fashion_dna)

        return min(score, 1.0)

    def _season_score(self, item_season: str, target_season: str) -> float:
        if target_season == "All" or item_season == "All":
            return 1.0
        return 1.0 if item_season == target_season else 0.35

    def _color_complement_score(self, color_a: str | None, color_b: str | None) -> float:
        if not color_a or not color_b:
            return 0.6

        rgb_a = self._hex_to_rgb(color_a)
        rgb_b = self._hex_to_rgb(color_b)
        distance = math.sqrt(sum((left - right) ** 2 for left, right in zip(rgb_a, rgb_b)))
        normalized = min(distance / 441.67, 1.0)
        return 0.35 + (0.65 * normalized)

    def _fashion_dna_color_score(
        self,
        colors: list[str | None],
        fashion_dna: FashionDnaInput,
    ) -> float:
        if not fashion_dna.color_affinity:
            return 0.5

        matches = []
        for color_hex in colors:
            if not color_hex:
                continue
            rgb = self._hex_to_rgb(color_hex)
            best = 0.0
            for name, affinity in fashion_dna.color_affinity.items():
                target = COLOR_NAME_RGB.get(name.lower())
                if not target:
                    continue
                distance = math.sqrt(sum((left - right) ** 2 for left, right in zip(rgb, target)))
                similarity = max(0.0, 1.0 - (distance / 441.67))
                best = max(best, similarity * float(affinity))
            matches.append(best)

        return float(np.mean(matches)) if matches else 0.5

    def _embedding_similarity_score(
        self,
        top: WardrobeItemInput,
        bottom: WardrobeItemInput,
        footwear: WardrobeItemInput,
        fashion_dna: FashionDnaInput,
    ) -> float:
        vectors = [item.embedding for item in (top, bottom, footwear) if item.embedding]
        if len(vectors) < 2:
            return 0.5

        dna_vector = self._fashion_dna_to_vector(fashion_dna)
        if dna_vector is None:
            pairwise = []
            for index in range(len(vectors)):
                for other in range(index + 1, len(vectors)):
                    pairwise.append(self._cosine_similarity(vectors[index], vectors[other]))
            return float(np.mean(pairwise))

        outfit_vector = np.mean(np.array(vectors, dtype=float), axis=0)
        return max(0.0, self._cosine_similarity(outfit_vector.tolist(), dna_vector))

    def _fashion_dna_to_vector(self, fashion_dna: FashionDnaInput) -> list[float] | None:
        style = float(fashion_dna.style_score or 55)
        lifestyle = float(fashion_dna.lifestyle_score or 55)
        seed = f"{style}:{lifestyle}:{sorted(fashion_dna.color_affinity.items())}"
        digest = seed.encode("utf-8")

        vector = []
        for index in range(512):
            byte = digest[index % len(digest)]
            vector.append((byte / 127.5) - 1)

        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else None

    def _cosine_similarity(self, left: list[float], right: list[float]) -> float:
        if len(left) != len(right):
            return 0.0
        dot = sum(a * b for a, b in zip(left, right))
        norm_left = math.sqrt(sum(a * a for a in left))
        norm_right = math.sqrt(sum(b * b for b in right))
        if norm_left == 0 or norm_right == 0:
            return 0.0
        return dot / (norm_left * norm_right)

    def _to_style_score(self, normalized_score: float) -> int:
        minimum = self._settings["style_score_min"]
        maximum = self._settings["style_score_max"]
        scaled = minimum + (normalized_score * (maximum - minimum))
        return int(round(max(minimum, min(maximum, scaled))))

    def _hex_to_rgb(self, color_hex: str) -> tuple[int, int, int]:
        value = color_hex.lstrip("#")
        return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


@lru_cache
def get_recommendation_service() -> RecommendationService:
    return RecommendationService()
