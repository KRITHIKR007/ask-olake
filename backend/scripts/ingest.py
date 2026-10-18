"""Ingestion script — fetches OLake docs, generates embeddings, builds search index."""

import asyncio
import logging
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ingestion import run_ingestion
from app.generation import generate_embeddings
from app.retrieval import RetrievalEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def main():
    logger.info("=== Ask OLake — Document Ingestion Pipeline ===\n")

    # Step 1: Fetch and chunk documents
    logger.info("Step 1: Fetching and chunking documents...")
    chunks = run_ingestion()

    if not chunks:
        logger.error("No chunks were generated. Check network connectivity and source URLs.")
        sys.exit(1)

    logger.info(f"\nTotal chunks to embed: {len(chunks)}")

    # Step 2: Generate embeddings
    logger.info("\nStep 2: Generating embeddings...")
    texts = [c.content for c in chunks]
    embeddings = await generate_embeddings(texts)
    logger.info(f"Embeddings shape: {embeddings.shape}")

    # Step 3: Build search index
    logger.info("\nStep 3: Building search index...")
    engine = RetrievalEngine()
    engine.build_index(chunks, embeddings)

    # Step 4: Save index to disk
    logger.info("\nStep 4: Saving index to disk...")
    engine.save_index()

    # Step 5: Verify
    logger.info("\nStep 5: Verification...")
    engine2 = RetrievalEngine()
    loaded = engine2.load_index()
    if loaded:
        logger.info(f"✓ Index verified: {engine2.num_chunks} chunks loaded from disk")
    else:
        logger.error("✗ Failed to load saved index")
        sys.exit(1)

    logger.info("\n=== Ingestion Complete ===")
    logger.info(f"Chunks indexed: {len(chunks)}")

    # Show breakdown by source
    from collections import Counter
    types = Counter(c.content_type for c in chunks)
    logger.info(f"By type: {dict(types)}")

    sources = Counter(c.source_url.split('/')[2] if '/' in c.source_url else 'unknown' for c in chunks)
    logger.info(f"By domain: {dict(sources)}")


if __name__ == "__main__":
    asyncio.run(main())
