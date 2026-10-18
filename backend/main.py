"""Vercel Python ASGI entrypoint for Ask OLake FastAPI backend."""

from app.main import app

__all__ = ["app"]
