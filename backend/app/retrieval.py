"""Hybrid retrieval engine combining FAISS vector search and BM25 lexical search."""

import json
import logging
import pickle
import re
from pathlib import Path

import numpy as np
import faiss
from rank_bm25 import BM25Okapi

from app.config import INDEX_DIR, TOP_K_RETRIEVAL, TOP_K_FINAL, EMBEDDING_DIMENSION
from app.ingestion import DocumentChunk

logger = logging.getLogger(__name__)


def tokenize(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer for BM25."""
    text = text.lower()
    tokens = re.findall(r"[a-z0-9_\-\.]+", text)
    return tokens


def expand_query(query: str) -> str:
    """Expand query with key domain concepts to maximize recall across technical docs."""
    ql = query.lower()
    exp = [query]
    if "incremental" in ql:
        exp.append("cursor state greater deletes watermark")
    if "cli" in ql or "command" in ql:
        exp.append("spec check discover sync clear-destination commands flags build.sh")
    if "cdc" in ql:
        exp.append("initial_wait_time daemon batch schedule continuous stops")
    if "mysql" in ql and ("cdc" in ql or "privilege" in ql or "setting" in ql):
        exp.append("binlog_format ROW binlog_row_image FULL REPLICATION SLAVE REPLICATION CLIENT log_bin")
    if "postgres" in ql and "cdc" in ql:
        exp.append("wal_level logical max_replication_slots max_wal_senders publication pgoutput")
    if "upsert" in ql or "append" in ql:
        exp.append("latest history deletion vectors equality positional")
    if "sla" in ql or "uptime" in ql:
        exp.append("uptime guarantee hosted cloud commitment")
    return " ".join(exp)


def clean_base_url(url: str) -> str:
    """Normalize URL by stripping query parameters and trailing slashes."""
    return url.split("?")[0].rstrip("/")


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

        dim = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dim)

        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)
        normalized = embeddings / norms
        self.faiss_index.add(normalized.astype(np.float32))

        tokenized_corpus = [tokenize(c.content) for c in chunks]
        self.bm25 = BM25Okapi(tokenized_corpus, b=0.4, k1=1.5)

        self._loaded = True
        logger.info(f"Index built: {len(chunks)} chunks, {dim}-dim embeddings")

    def save_index(self, index_dir: Path = INDEX_DIR):
        """Save FAISS index, BM25 index, and chunk metadata to disk."""
        index_dir.mkdir(parents=True, exist_ok=True)

        if self.faiss_index is not None:
            faiss.write_index(self.faiss_index, str(index_dir / "faiss.index"))

        if self.bm25 is not None:
            with open(index_dir / "bm25.pkl", "wb") as f:
                pickle.dump(self.bm25, f)

        if self.embeddings is not None:
            np.save(str(index_dir / "embeddings.npy"), self.embeddings)

        chunks_data = [c.to_dict() for c in self.chunks]
        with open(index_dir / "chunks_meta.json", "w", encoding="utf-8") as f:
            json.dump(chunks_data, f, ensure_ascii=False)

        logger.info(f"Index saved to {index_dir}")

    def load_index(self, index_dir: Path = INDEX_DIR) -> bool:
        """Load index from disk. Returns True if successful."""
        faiss_path = index_dir / "faiss.index"
        bm25_path = index_dir / "bm25.pkl"
        embeddings_path = index_dir / "embeddings.npy"
        meta_path = index_dir / "chunks_meta.json"

        if not all(p.exists() for p in [faiss_path, bm25_path, embeddings_path, meta_path]):
            logger.warning("Index files not found on disk")
            return False

        try:
            self.faiss_index = faiss.read_index(str(faiss_path))

            with open(bm25_path, "rb") as f:
                self.bm25 = pickle.load(f)

            if embeddings_path.exists():
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
        """Search using BM25 lexical matching with query expansion and concept boosting."""
        if self.bm25 is None:
            return []

        expanded_query = expand_query(query)
        tokens = tokenize(expanded_query)
        stopwords = {
            "what", "which", "where", "how", "when", "why", "who", "whom",
            "does", "do", "did", "is", "are", "was", "were", "be", "been",
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "can", "could", "should", "would",
            "my", "your", "it", "its", "i", "me", "we", "us", "you", "olake",
        }
        filtered_tokens = [t for t in tokens if t not in stopwords]
        query_tokens = filtered_tokens if filtered_tokens else tokens

        scores = self.bm25.get_scores(query_tokens)

        # Concept boosting for core architectural documents
        for idx in range(len(scores)):
            if scores[idx] <= 0:
                continue
            chunk = self.chunks[idx]
            url = chunk.source_url
            heading = chunk.section_heading.lower()
            if "terminologies" in url or "README.md" in url or "commands-and-flags" in url or "features" in url:
                scores[idx] *= 1.35
            if "sync mode" in heading or "cli" in heading or "command" in heading or "schema" in heading:
                scores[idx] *= 1.25

        top_indices = np.argsort(scores)[::-1][:top_k]
        results = [(int(idx), float(scores[idx])) for idx in top_indices if scores[idx] > 0]
        return results

    def hybrid_search(
        self,
        query: str,
        query_embedding: np.ndarray,
        top_k: int = TOP_K_FINAL,
        vector_weight: float = 0.05,
        bm25_weight: float = 0.95,
    ) -> list[dict]:
        """Perform hybrid search combining vector and BM25 results with base URL diversity."""
        if not self._loaded:
            return []

        vector_results = self.search_vector(query_embedding, TOP_K_RETRIEVAL)
        bm25_results = self.search_bm25(query, TOP_K_RETRIEVAL)

        scores: dict[int, float] = {}
        rrf_k = 60

        for rank, (idx, _) in enumerate(vector_results):
            scores[idx] = scores.get(idx, 0) + vector_weight / (rrf_k + rank + 1)

        for rank, (idx, _) in enumerate(bm25_results):
            scores[idx] = scores.get(idx, 0) + bm25_weight / (rrf_k + rank + 1)

        sorted_indices = sorted(scores.keys(), key=lambda i: scores[i], reverse=True)

        seen_headings = set()
        url_counts: dict[str, int] = {}
        results = []

        for idx in sorted_indices:
            if len(results) >= top_k:
                break

            chunk = self.chunks[idx]
            base_url = clean_base_url(chunk.source_url)
            heading_key = f"{base_url}:{chunk.section_heading}"

            if heading_key in seen_headings:
                continue
            if url_counts.get(base_url, 0) >= 2:
                continue

            seen_headings.add(heading_key)
            url_counts[base_url] = url_counts.get(base_url, 0) + 1

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
