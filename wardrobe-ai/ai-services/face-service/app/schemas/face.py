from pydantic import BaseModel, Field


class EmbedResponse(BaseModel):
    embedding: list[float] = Field(
        ...,
        description="512-dimensional face embedding vector",
        min_length=512,
        max_length=512,
    )


class ErrorResponse(BaseModel):
    detail: str
    code: str
