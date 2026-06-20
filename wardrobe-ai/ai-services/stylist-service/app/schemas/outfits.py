from typing import Any

from pydantic import BaseModel, Field


class WardrobeItemInput(BaseModel):
    id: str
    category: str
    color_hex: str | None = None
    season: str = "All"
    embedding: list[float] | None = None


class FashionDnaInput(BaseModel):
    style_score: float | None = None
    lifestyle_score: float | None = None
    color_affinity: dict[str, float] = Field(default_factory=dict)
    brand_affinity: dict[str, float] = Field(default_factory=dict)


class OutfitRecommendRequest(BaseModel):
    season: str = "All"
    fashion_dna: FashionDnaInput | None = None
    items: list[WardrobeItemInput] = Field(..., min_length=1)


class OutfitRecommendResponse(BaseModel):
    top_id: str
    bottom_id: str
    footwear_id: str
    style_score: int = Field(..., ge=70, le=99)


class ErrorResponse(BaseModel):
    detail: dict[str, str]
