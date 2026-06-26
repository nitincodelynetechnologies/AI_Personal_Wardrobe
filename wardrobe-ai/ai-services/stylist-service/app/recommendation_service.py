import logging
import math
import random
from functools import lru_cache

import numpy as np

from app.config import get_settings
from app.schemas.outfits import FashionDnaInput, OutfitRecommendRequest, WardrobeItemInput

logger = logging.getLogger(__name__)

REQUIRED_CATEGORIES = ("Top", "Bottom", "Footwear")
VALID_SEASONS = ("Summer", "Winter", "Spring", "Fall", "All")
TOP_ITEM_POOL_SIZE = 5
TOP_COMBO_POOL_SIZE = 20
COMBO_SCORE_EPSILON = 0.05
MIN_DIVERSE_POOL = 3

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

        tops = buckets["Top"]
        bottoms = buckets["Bottom"]
        footwear = buckets["Footwear"]

        top_pool = self._build_item_pool(
            tops,
            bottoms,
            footwear,
            slot="top",
            fashion_dna=payload.fashion_dna,
            season=season,
        )
        bottom_pool = self._build_item_pool(
            bottoms,
            tops,
            footwear,
            slot="bottom",
            fashion_dna=payload.fashion_dna,
            season=season,
        )
        footwear_pool = self._build_item_pool(
            footwear,
            tops,
            bottoms,
            slot="footwear",
            fashion_dna=payload.fashion_dna,
            season=season,
        )

        logger.info(
            "Generating combination from pool sizes: tops=%s bottoms=%s footwear=%s",
            len(top_pool),
            len(bottom_pool),
            len(footwear_pool),
        )

        scored_combos: list[
            tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]
        ] = []
        for top in top_pool:
            for bottom in bottom_pool:
                for shoe in footwear_pool:
                    score = self._score_outfit(top, bottom, shoe, payload.fashion_dna, season)
                    score += random.uniform(0, 0.008)
                    scored_combos.append((score, top, bottom, shoe))

        excluded_keys = self._build_excluded_combo_keys(payload.exclude_combos)
        available_combos = self._filter_excluded_combos(scored_combos, excluded_keys)

        if not available_combos:
            total_unique = len(
                {
                    self._combo_key(combo[1], combo[2], combo[3])
                    for combo in scored_combos
                }
            )
            if total_unique <= 1:
                raise RecommendationServiceError(
                    "NO_NEW_COMBINATIONS",
                    "Your wardrobe only has one possible outfit. Add more tops, bottoms, or shoes for variety.",
                )
            raise RecommendationServiceError(
                "NO_NEW_COMBINATIONS",
                "All recent outfit combinations have been used. Add more wardrobe items or delete saved looks to refresh.",
            )

        candidate_pool = self._select_top_combos(available_combos)
        selected = self._weighted_pick(candidate_pool)
        if selected is None:
            raise RecommendationServiceError(
                "RECOMMENDATION_FAILED",
                "Unable to recommend an outfit from the provided wardrobe.",
            )

        best_score, top, bottom, footwear_item = selected
        style_score = self._to_style_score(best_score)
        logger.info(
            "Recommended outfit top=%s bottom=%s footwear=%s score=%s combo_pool=%s",
            top.id,
            bottom.id,
            footwear_item.id,
            style_score,
            len(candidate_pool),
        )

        return {
            "top_id": top.id,
            "bottom_id": bottom.id,
            "footwear_id": footwear_item.id,
            "style_score": style_score,
        }

    def _build_item_pool(
        self,
        items: list[WardrobeItemInput],
        partners_a: list[WardrobeItemInput],
        partners_b: list[WardrobeItemInput],
        slot: str,
        fashion_dna: FashionDnaInput | None,
        season: str,
        pool_size: int = TOP_ITEM_POOL_SIZE,
    ) -> list[WardrobeItemInput]:
        if not items:
            return []

        if len(items) <= pool_size:
            return list(items)

        scored_items: list[tuple[float, WardrobeItemInput]] = []
        for item in items:
            best_score = 0.0
            for partner_a in partners_a:
                for partner_b in partners_b:
                    if slot == "top":
                        score = self._score_outfit(item, partner_a, partner_b, fashion_dna, season)
                    elif slot == "bottom":
                        score = self._score_outfit(partner_a, item, partner_b, fashion_dna, season)
                    else:
                        score = self._score_outfit(partner_a, partner_b, item, fashion_dna, season)
                    best_score = max(best_score, score)
            scored_items.append((best_score, item))

        scored_items.sort(key=lambda entry: entry[0], reverse=True)

        top_slots = min(max(pool_size - 2, 2), len(scored_items))
        pool: list[WardrobeItemInput] = []
        seen: set[str] = set()

        for _, item in scored_items[:top_slots]:
            if item.id in seen:
                continue
            seen.add(item.id)
            pool.append(item)

        remainder = [item for _, item in scored_items[top_slots:] if item.id not in seen]
        random.shuffle(remainder)
        for item in remainder:
            seen.add(item.id)
            pool.append(item)
            if len(pool) >= pool_size:
                break

        return pool or list(items)

    def _build_excluded_combo_keys(
        self,
        exclude_combos: list,
    ) -> set[str]:
        return {
            self._combo_key_from_ids(combo.top_id, combo.bottom_id, combo.footwear_id)
            for combo in exclude_combos
        }

    def _combo_key(
        self,
        top: WardrobeItemInput,
        bottom: WardrobeItemInput,
        footwear: WardrobeItemInput,
    ) -> str:
        return self._combo_key_from_ids(top.id, bottom.id, footwear.id)

    def _combo_key_from_ids(self, top_id: str, bottom_id: str, footwear_id: str) -> str:
        return f"{top_id}|{bottom_id}|{footwear_id}"

    def _filter_excluded_combos(
        self,
        scored_combos: list[tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]],
        excluded_keys: set[str],
    ) -> list[tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]]:
        if not excluded_keys:
            return scored_combos

        return [
            combo
            for combo in scored_combos
            if self._combo_key(combo[1], combo[2], combo[3]) not in excluded_keys
        ]

    def _select_top_combos(
        self,
        scored_combos: list[tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]],
    ) -> list[tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]]:
        if not scored_combos:
            return []

        scored_combos.sort(key=lambda entry: entry[0], reverse=True)
        best_score = scored_combos[0][0]
        threshold = best_score - COMBO_SCORE_EPSILON
        near_best = [combo for combo in scored_combos if combo[0] >= threshold]

        if len(near_best) < MIN_DIVERSE_POOL:
            near_best = scored_combos[: max(MIN_DIVERSE_POOL, min(TOP_COMBO_POOL_SIZE, len(scored_combos)))]

        return near_best[:TOP_COMBO_POOL_SIZE] or scored_combos[:1]

    def _weighted_pick(
        self,
        items: list[tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput]],
    ) -> tuple[float, WardrobeItemInput, WardrobeItemInput, WardrobeItemInput] | None:
        if not items:
            return None

        if len(items) == 1:
            return items[0]

        weights = [max(entry[0], 0.05) for entry in items]
        return random.choices(items, weights=weights, k=1)[0]

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
