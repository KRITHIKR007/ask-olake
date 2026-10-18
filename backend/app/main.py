"""Ask OLake — FastAPI application."""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import FRONTEND_URL, RATE_LIMIT, MAX_QUESTION_LENGTH
from app.schemas import AskRequest, AskResponse, HealthResponse, ErrorResponse
from app.retrieval import retrieval_engine
from app.generation import generate_answer, generate_query_embedding

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the search index on startup."""
    logger.info("Starting Ask OLake API...")
    loaded = retrieval_engine.load_index()
    if loaded:
        logger.info(f"Index loaded with {retrieval_engine.num_chunks} chunks")
    else:
        logger.warning("No index found. Run `python -m scripts.ingest` to build the index.")
    yield


# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# App
app = FastAPI(
    title="Ask OLake API",
    description="AI-powered technical documentation assistant for OLake",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Load index immediately if available on disk
if not retrieval_engine.is_loaded:
    retrieval_engine.load_index()

# CORS
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ask-olake.vercel.app",
    "https://*.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissive for hackathon; tighten in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["System"])
@app.get("/api/health", response_model=HealthResponse, tags=["System"], include_in_schema=False)
async def health_check():
    """Health check endpoint for deployment diagnostics."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        index_loaded=retrieval_engine.is_loaded,
        indexed_chunks=retrieval_engine.num_chunks,
    )


@app.post(
    "/ask",
    response_model=AskResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        429: {"description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
    tags=["Ask"],
    summary="Ask a question about OLake",
)
@app.post(
    "/api/ask",
    response_model=AskResponse,
    include_in_schema=False,
)
@limiter.limit(RATE_LIMIT)
async def ask_question(request: Request, body: AskRequest):
    """Main endpoint: accepts a question, retrieves relevant docs, generates grounded answer."""
    start_time = time.time()
    question = body.question.strip()

    # Validate question length
    if len(question) > MAX_QUESTION_LENGTH:
        return JSONResponse(
            status_code=400,
            content={"error": "Question too long", "detail": f"Maximum {MAX_QUESTION_LENGTH} characters allowed."},
        )

    # Check if index is loaded
    if not retrieval_engine.is_loaded:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Service unavailable",
                "detail": "The knowledge index has not been built yet. Please try again later.",
            },
        )

    try:
        # 1. Generate query embedding
        query_embedding = await generate_query_embedding(question)

        # 2. Hybrid retrieval
        retrieved_chunks = retrieval_engine.hybrid_search(
            query=question,
            query_embedding=query_embedding,
        )

        # 3. Handle no results
        if not retrieved_chunks:
            return AskResponse(
                answer=(
                    "I couldn't find relevant information in the OLake documentation to answer your question. "
                    "This might be because:\n"
                    "- The topic isn't covered in the current documentation\n"
                    "- The question might need to be rephrased\n\n"
                    "You can try browsing the [OLake documentation](https://olake.io/docs/) directly, "
                    "or ask in the [OLake Slack community](https://olake.io/slack/)."
                ),
                sources=["https://olake.io/docs/"],
            )

        # 4. Generate answer with citations
        answer, sources = await generate_answer(question, retrieved_chunks)

        elapsed = time.time() - start_time
        logger.info(f"Answered in {elapsed:.2f}s: {question[:80]}...")

        return AskResponse(answer=answer, sources=sources)

    except Exception as e:
        logger.error(f"Error processing question: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": "An unexpected error occurred while processing your question. Please try again.",
            },
        )


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Ask OLake API",
        "version": "1.0.0",
        "description": "AI-powered documentation assistant for OLake",
        "endpoints": {
            "POST /ask": "Ask a question about OLake",
            "GET /health": "Health check",
        },
    }
