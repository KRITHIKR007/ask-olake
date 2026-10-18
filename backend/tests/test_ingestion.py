"""Tests for document ingestion and chunking."""

import pytest
from app.ingestion import chunk_text, extract_doc_content, DocumentChunk


class TestChunking:
    def test_empty_text_returns_no_chunks(self):
        assert chunk_text("", "Test") == []

    def test_short_text_returns_no_chunks(self):
        assert chunk_text("hi", "Test") == []

    def test_single_paragraph_returns_one_chunk(self):
        text = "This is a test paragraph with enough content to be meaningful. " * 5
        chunks = chunk_text(text, "Test Title")
        assert len(chunks) >= 1
        assert chunks[0]["section_heading"] == "Test Title"

    def test_heading_creates_section(self):
        text = "## My Heading\n\nSome content here that is long enough to be a chunk. " * 3
        chunks = chunk_text(text, "Root")
        assert len(chunks) >= 1
        assert any(c["section_heading"] == "My Heading" for c in chunks)

    def test_large_text_creates_multiple_chunks(self):
        text = "Paragraph content. " * 500
        chunks = chunk_text(text, "Test", chunk_size=200)
        assert len(chunks) > 1


class TestDocumentChunk:
    def test_chunk_generates_id(self):
        chunk = DocumentChunk(
            content="test content",
            source_url="https://olake.io/docs/",
            source_title="Test",
        )
        assert chunk.chunk_id
        assert len(chunk.chunk_id) == 32  # MD5 hex

    def test_chunk_generates_timestamp(self):
        chunk = DocumentChunk(
            content="test",
            source_url="https://olake.io/docs/",
            source_title="Test",
        )
        assert chunk.ingestion_timestamp
        assert "T" in chunk.ingestion_timestamp


class TestHTMLExtraction:
    def test_extracts_title(self):
        html = "<html><head><title>My Page | OLake</title></head><body><main><p>Hello</p></main></body></html>"
        title, content = extract_doc_content(html, "https://olake.io/test")
        assert title == "My Page"

    def test_removes_nav_and_footer(self):
        html = "<html><body><nav>Nav</nav><main><p>Content</p></main><footer>Foot</footer></body></html>"
        title, content = extract_doc_content(html, "https://olake.io/test")
        assert "Nav" not in content
        assert "Foot" not in content
