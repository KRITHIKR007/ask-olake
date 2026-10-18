"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field, field_validator


class AskRequest(BaseModel):
    """Request schema for POST /ask endpoint."""
    question: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The technical question about OLake",
        examples=["How do I configure a PostgreSQL connector?"],
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty or whitespace only")
        return v


class AskResponse(BaseModel):
    """Response schema for POST /ask endpoint - matches required contract."""
    answer: str = Field(
        ...,
        description="Grounded technical answer based on OLake documentation",
    )
    sources: list[str] = Field(
        default_factory=list,
        description="List of source URLs that support the answer",
    )


class HealthResponse(BaseModel):
    """Response schema for GET /health endpoint."""
    status: str = "ok"
    version: str = "1.0.0"
    index_loaded: bool = False
    indexed_chunks: int = 0


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: str | None = None
