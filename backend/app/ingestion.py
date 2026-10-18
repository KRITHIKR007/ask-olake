"""Document ingestion pipeline for OLake documentation and repositories."""

import json
import hashlib
import logging
import re
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path

import httpx
from bs4 import BeautifulSoup
import html2text

from app.config import (
    OLAKE_DOCS_URLS,
    GITHUB_REPOS,
    DOCS_DIR,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)

logger = logging.getLogger(__name__)

h2t = html2text.HTML2Text()
h2t.ignore_links = False
h2t.ignore_images = True
h2t.body_width = 0
h2t.ignore_emphasis = False


@dataclass
class DocumentChunk:
    """A single chunk of documentation with source metadata."""
    content: str
    source_url: str
    source_title: str
    repository: str = ""
    file_path: str = ""
    section_heading: str = ""
    content_type: str = "documentation"  # documentation, readme, source_code, config
    chunk_index: int = 0
    ingestion_timestamp: str = ""
    chunk_id: str = ""

    def __post_init__(self):
        if not self.chunk_id:
            h = hashlib.md5(f"{self.source_url}:{self.chunk_index}:{self.content[:100]}".encode()).hexdigest()
            self.chunk_id = h
        if not self.ingestion_timestamp:
            self.ingestion_timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def fetch_html(url: str, timeout: float = 30.0) -> str | None:
    """Fetch HTML content from a URL."""
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(url, headers={"User-Agent": "AskOLake/1.0 (documentation-indexer)"})
            if resp.status_code == 200:
                return resp.text
            logger.warning(f"HTTP {resp.status_code} for {url}")
            return None
    except Exception as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return None


def fetch_raw_text(url: str, timeout: float = 30.0) -> str | None:
    """Fetch raw text content (e.g., from GitHub raw URLs)."""
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(url, headers={"User-Agent": "AskOLake/1.0 (documentation-indexer)"})
            if resp.status_code == 200:
                return resp.text
            logger.warning(f"HTTP {resp.status_code} for {url}")
            return None
    except Exception as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return None


def extract_doc_content(html: str, url: str) -> tuple[str, str]:
    """Extract main documentation content from OLake docs HTML.
    Returns (title, markdown_content).
    """
    soup = BeautifulSoup(html, "html.parser")

    # Get title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else url
    # Clean up title
    title = title.replace(" | OLake", "").strip()

    # Remove nav, footer, sidebar
    for tag in soup.find_all(["nav", "footer", "script", "style", "noscript"]):
        tag.decompose()

    # Try to find main content area (Docusaurus structure)
    main = soup.find("main") or soup.find("article") or soup.find("div", class_="theme-doc-markdown")
    if not main:
        # Fallback: look for the docusaurus content div
        main = soup.find("div", {"id": "__docusaurus"})
    if not main:
        main = soup.find("body")

    if main is None:
        return title, ""

    # Convert to markdown
    md = h2t.handle(str(main))

    # Clean up excessive whitespace
    md = re.sub(r"\n{3,}", "\n\n", md)
    md = md.strip()

    return title, md


def chunk_text(text: str, source_title: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """Split text into chunks respecting paragraph and heading boundaries.
    Returns list of dicts with content and section_heading.
    """
    if not text.strip():
        return []

    # If text has very long lines without newlines, split them into sub-lines
    lines = []
    for raw_line in text.split("\n"):
        if len(raw_line) > chunk_size:
            words = raw_line.split(" ")
            sub_line = []
            sub_len = 0
            for w in words:
                if sub_len + len(w) + 1 > chunk_size and sub_line:
                    lines.append(" ".join(sub_line))
                    sub_line = [w]
                    sub_len = len(w)
                else:
                    sub_line.append(w)
                    sub_len += len(w) + 1
            if sub_line:
                lines.append(" ".join(sub_line))
        else:
            lines.append(raw_line)

    chunks = []
    current_chunk = []
    current_heading = source_title
    current_size = 0

    def make_chunk_content(heading: str, raw_body: str) -> str:
        parts = []
        if source_title:
            parts.append(f"# {source_title}")
        if heading and heading != source_title:
            parts.append(f"## {heading}")
        if parts:
            return "\n".join(parts) + "\n\n" + raw_body
        return raw_body

    for line in lines:
        # Detect headings
        heading_match = re.match(r"^(#{1,4})\s+(.+)", line)
        if heading_match:
            # If we have accumulated content, save it as a chunk
            if current_chunk and current_size > 50:
                raw_body = "\n".join(current_chunk).strip()
                chunks.append({
                    "content": make_chunk_content(current_heading, raw_body),
                    "section_heading": current_heading,
                })
                # Keep overlap
                overlap_lines = []
                overlap_size = 0
                for cl in reversed(current_chunk):
                    overlap_size += len(cl)
                    if overlap_size > overlap:
                        break
                    overlap_lines.insert(0, cl)
                current_chunk = overlap_lines
                current_size = sum(len(l) for l in current_chunk)

            current_heading = heading_match.group(2).strip()

        current_chunk.append(line)
        current_size += len(line) + 1

        # Check if chunk is large enough to split
        if current_size >= chunk_size:
            raw_body = "\n".join(current_chunk).strip()
            chunks.append({
                "content": make_chunk_content(current_heading, raw_body),
                "section_heading": current_heading,
            })
            # Keep overlap
            overlap_lines = []
            overlap_size = 0
            for cl in reversed(current_chunk):
                overlap_size += len(cl)
                if overlap_size > overlap:
                    break
                overlap_lines.insert(0, cl)
            current_chunk = overlap_lines
            current_size = sum(len(l) for l in current_chunk)

    # Add remaining content
    if current_chunk:
        raw_body = "\n".join(current_chunk).strip()
        if raw_body and len(raw_body) > 30:
            chunks.append({
                "content": make_chunk_content(current_heading, raw_body),
                "section_heading": current_heading,
            })

    return chunks


def ingest_docs_page(url: str) -> list[DocumentChunk]:
    """Ingest a single documentation page."""
    logger.info(f"Ingesting docs page: {url}")
    html = fetch_html(url)
    if not html:
        logger.warning(f"Skipping {url}: no content fetched")
        return []

    title, content = extract_doc_content(html, url)
    if not content or len(content) < 50:
        logger.warning(f"Skipping {url}: insufficient content extracted (length={len(content)})")
        return []

    raw_chunks = chunk_text(content, title)
    chunks = []
    for i, rc in enumerate(raw_chunks):
        chunks.append(DocumentChunk(
            content=rc["content"],
            source_url=url,
            source_title=title,
            section_heading=rc["section_heading"],
            content_type="documentation",
            chunk_index=i,
        ))

    logger.info(f"  → {len(chunks)} chunks from {url}")
    return chunks


def ingest_github_file(repo: dict, file_path: str) -> list[DocumentChunk]:
    """Ingest a single file from a GitHub repository."""
    raw_url = f"{repo['raw_base']}/{file_path}"
    logger.info(f"Ingesting GitHub file: {repo['name']}/{file_path}")

    content = fetch_raw_text(raw_url)
    if not content:
        logger.warning(f"Skipping {repo['name']}/{file_path}: no content fetched")
        return []

    # Determine content type
    if file_path.endswith(".md"):
        content_type = "readme"
    elif file_path.endswith((".yaml", ".yml", ".json", ".toml")):
        content_type = "config"
    else:
        content_type = "source_code"

    # GitHub URL for the file
    github_url = f"{repo['url']}/blob/master/{file_path}"
    title = f"{repo['name']}/{file_path}"

    raw_chunks = chunk_text(content, title)
    chunks = []
    for i, rc in enumerate(raw_chunks):
        chunks.append(DocumentChunk(
            content=rc["content"],
            source_url=github_url,
            source_title=title,
            repository=repo["name"],
            file_path=file_path,
            section_heading=rc["section_heading"],
            content_type=content_type,
            chunk_index=i,
        ))

    logger.info(f"  → {len(chunks)} chunks from {repo['name']}/{file_path}")
    return chunks


def run_ingestion() -> list[DocumentChunk]:
    """Run the full ingestion pipeline. Returns all document chunks."""
    all_chunks: list[DocumentChunk] = []
    failed_sources: list[str] = []

    # 1. Ingest OLake documentation pages
    logger.info("=== Ingesting OLake documentation ===")
    for url in OLAKE_DOCS_URLS:
        try:
            chunks = ingest_docs_page(url)
            all_chunks.extend(chunks)
        except Exception as e:
            logger.error(f"Failed to ingest {url}: {e}")
            failed_sources.append(url)
        time.sleep(0.5)  # Be polite

    # 2. Ingest GitHub repository files
    logger.info("=== Ingesting GitHub repositories ===")
    for repo in GITHUB_REPOS:
        for file_path in repo["important_files"]:
            try:
                chunks = ingest_github_file(repo, file_path)
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"Failed to ingest {repo['name']}/{file_path}: {e}")
                failed_sources.append(f"{repo['name']}/{file_path}")
            time.sleep(0.3)

    # 3. Save chunks to disk
    chunks_file = DOCS_DIR / "chunks.json"
    chunks_data = [asdict(c) for c in all_chunks]
    with open(chunks_file, "w", encoding="utf-8") as f:
        json.dump(chunks_data, f, indent=2, ensure_ascii=False)

    # 4. Report
    logger.info(f"\n=== Ingestion Complete ===")
    logger.info(f"Total chunks: {len(all_chunks)}")
    logger.info(f"Failed sources: {len(failed_sources)}")
    if failed_sources:
        for s in failed_sources:
            logger.warning(f"  FAILED: {s}")

    return all_chunks


def load_chunks_from_disk() -> list[DocumentChunk]:
    """Load previously ingested chunks from disk."""
    chunks_file = DOCS_DIR / "chunks.json"
    if not chunks_file.exists():
        return []

    with open(chunks_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    return [DocumentChunk(**d) for d in data]
