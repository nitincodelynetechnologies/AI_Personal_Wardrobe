from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):
    category: str = Field(..., examples=["Top"])
    color_hex: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$", examples=["#1A2B3C"])
    embedding: list[float] = Field(..., min_length=512, max_length=512)


class ErrorResponse(BaseModel):
    detail: dict[str, str]
