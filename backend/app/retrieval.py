"""Hybrid retrieval engine combining FAISS vector search and BM25 lexical search."""

import json
import logging
import pickle
from pathlib import Path

import numpy as np
import faiss
from rank_bm25 import BM25Okapi

from app.config import INDEX_DIR, TOP_K_RETRIEVAL, TOP_K_FINAL, EMBEDDING_DIMENSION
from app.ingestion import DocumentChunk, load_chunks_from_disk

logger = logging.getLogger(__name__)


def tokenize(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer for BM25."""
    import re
    text = text.lower()
    tokens = re.findall(r"[a-z0-9_\-\.]+", text)
    return tokens


class RetrievalEngine:
    """Hybrid retrieval combining dense (FAISS) and sparse (BM25) search."""

    def __init__(self):
        self.chunks: list[DocumentChunk] = []
        self.faiss_index: faiss.IndexFlatIP | None = None
        self.bm25: BM25Okapi | None = None
        self.embeddings: np.ndarray | None = None
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded and len(self.chunks) > 0

    @property
    def num_chunks(self) -> int:
        return len(self.chunks)

    def build_index(self, chunks: list[DocumentChunk], embeddings: np.ndarray):
        """Build both FAISS and BM25 indexes from chunks and their embeddings."""
        self.chunks = chunks
        self.embeddings = embeddings

        # Build FAISS index (inner product for cosine similarity on normalized vectors)
        dim = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dim)

        # Normalize embeddings for cosine similarity
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)
        normalized = embeddings / norms
        self.faiss_index.add(normalized.astype(np.float32))

        # Build BM25 index
        tokenized_corpus = [tokenize(c.content) for c in chunks]
        self.bm25 = BM25Okapi(tokenized_corpus)

        self._loaded = True
        logger.info(f"Index built: {len(chunks)} chunks, {dim}-dim embeddings")

    def save_index(self):
        """Save index to disk."""
        if not self._loaded:
            raise RuntimeError("No index to save")

        # Save FAISS index
        faiss.write_index(self.faiss_index, str(INDEX_DIR / "faiss.index"))

        # Save BM25 index
        with open(INDEX_DIR / "bm25.pkl", "wb") as f:
            pickle.dump(self.bm25, f)

        # Save embeddings
        np.save(str(INDEX_DIR / "embeddings.npy"), self.embeddings)

        # Save chunk metadata
        chunks_meta = []
        for c in self.chunks:
            chunks_meta.append({
                "content": c.content,
                "source_url": c.source_url,
                "source_title": c.source_title,
                "repository": c.repository,
                "file_path": c.file_path,
                "section_heading": c.section_heading,
                "content_type": c.content_type,
                "chunk_index": c.chunk_index,
                "ingestion_timestamp": c.ingestion_timestamp,
                "chunk_id": c.chunk_id,
            })
        with open(INDEX_DIR / "chunks_meta.json", "w", encoding="utf-8") as f:
            json.dump(chunks_meta, f, ensure_ascii=False)

        logger.info(f"Index saved to {INDEX_DIR}")

    def load_index(self) -> bool:
        """Load index from disk. Returns True if successful."""
        faiss_path = INDEX_DIR / "faiss.index"
        bm25_path = INDEX_DIR / "bm25.pkl"
        embeddings_path = INDEX_DIR / "embeddings.npy"
        meta_path = INDEX_DIR / "chunks_meta.json"

        if not all(p.exists() for p in [faiss_path, bm25_path, embeddings_path, meta_path]):
            logger.warning("Index files not found on disk")
            return False

        try:
            self.faiss_index = faiss.read_index(str(faiss_path))

            with open(bm25_path, "rb") as f:
                self.bm25 = pickle.load(f)

            self.embeddings = np.load(str(embeddings_path))

            with open(meta_path, "r", encoding="utf-8") as f:
                chunks_meta = json.load(f)
            self.chunks = [DocumentChunk(**m) for m in chunks_meta]

            self._loaded = True
            logger.info(f"Index loaded: {len(self.chunks)} chunks")
            return True
        except Exception as e:
            logger.error(f"Failed to load index: {e}")
            return False

    def search_vector(self, query_embedding: np.ndarray, top_k: int = TOP_K_RETRIEVAL) -> list[tuple[int, float]]:
        """Search using FAISS vector similarity. Returns (index, score) pairs."""
        if self.faiss_index is None:
            return []

        # Normalize query
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm

        query = query_embedding.reshape(1, -1).astype(np.float32)
        scores, indices = self.faiss_index.search(query, min(top_k, len(self.chunks)))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0:
                results.append((int(idx), float(score)))
        return results

    def search_bm25(self, query: str, top_k: int = TOP_K_RETRIEVAL) -> list[tuple[int, float]]:
        """Search using BM25 lexical matching. Returns (index, score) pairs."""
        if self.bm25 is None:
            return []

        tokens = tokenize(query)
        scores = self.bm25.get_scores(tokens)

        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = [(int(idx), float(scores[idx])) for idx in top_indices if scores[idx] > 0]
        return results

    def hybrid_search(
        self,
        query: str,
        query_embedding: np.ndarray,
        top_k: int = TOP_K_FINAL,
        vector_weight: float = 0.6,
        bm25_weight: float = 0.4,
    ) -> list[dict]:
        """Perform hybrid search combining vector and BM25 results.
        Returns list of dicts with chunk data and relevance scores.
        """
        if not self._loaded:
            return []

        # Get results from both engines
        vector_results = self.search_vector(query_embedding, TOP_K_RETRIEVAL)
        bm25_results = self.search_bm25(query, TOP_K_RETRIEVAL)

        # Normalize scores using reciprocal rank fusion (RRF)
        scores: dict[int, float] = {}
        rrf_k = 60  # Standard RRF constant

        for rank, (idx, _) in enumerate(vector_results):
            scores[idx] = scores.get(idx, 0) + vector_weight / (rrf_k + rank + 1)

        for rank, (idx, _) in enumerate(bm25_results):
            scores[idx] = scores.get(idx, 0) + bm25_weight / (rrf_k + rank + 1)

        # Sort by combined score
        sorted_indices = sorted(scores.keys(), key=lambda i: scores[i], reverse=True)

        # Deduplicate by source URL + section
        seen_sources = set()
        results = []
        for idx in sorted_indices:
            if len(results) >= top_k:
                break

            chunk = self.chunks[idx]
            dedup_key = f"{chunk.source_url}:{chunk.section_heading}"

            if dedup_key in seen_sources:
                continue
            seen_sources.add(dedup_key)

            results.append({
                "content": chunk.content,
                "source_url": chunk.source_url,
                "source_title": chunk.source_title,
                "section_heading": chunk.section_heading,
                "repository": chunk.repository,
                "file_path": chunk.file_path,
                "content_type": chunk.content_type,
                "relevance_score": scores[idx],
            })

        return results


# Global singleton
retrieval_engine = RetrievalEngine()
