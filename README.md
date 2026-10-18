# Ask OLake

**AI-powered technical documentation assistant for OLake.**

Ask OLake helps developers understand, configure, deploy, and troubleshoot OLake by answering natural language questions grounded in actual OLake documentation and source code.

![Ask OLake](https://olake.io/img/logo/olake-blue.svg)

## Problem Statement

OLake is a powerful open-source platform for replicating databases to Apache Iceberg, but its documentation spans multiple repositories and documentation sites. Developers often struggle to find the right configuration options, troubleshoot issues, or understand the interplay between OLake Go (ingestion) and OLake Fusion (table maintenance).

**Ask OLake** solves this by providing an intelligent search and Q&A interface that:
- Retrieves relevant documentation from multiple OLake sources
- Generates accurate, grounded answers with proper citations
- Honestly communicates when information is insufficient

## Features

- **Hybrid Search**: Combines semantic vector search (FAISS) with lexical search (BM25) via Reciprocal Rank Fusion
- **Grounded Answers**: LLM responses are constrained to retrieved evidence from official OLake documentation
- **Verifiable Citations**: Every answer includes clickable source URLs from actual documentation
- **Honest Uncertainty**: Clearly communicates when evidence is insufficient rather than fabricating answers
- **Production API**: RESTful `POST /ask` endpoint with proper validation, rate limiting, and error handling
- **Embeddable Chat UI**: Polished, responsive chat interface suitable for embedding in documentation sites
- **Multi-Source Indexing**: Ingests docs from olake.io, GitHub repos (olake, olake-ui, olake-helm, olake-fusion)
- **Markdown Rendering**: Properly formatted code blocks, tables, and syntax highlighting

## Architecture

```
┌──────────────────┐     ┌─────────────────────────────────────────────┐
│                  │     │              Backend (FastAPI)              │
│   Frontend       │     │                                             │
│   (Next.js)      │────▶│  POST /ask                                 │
│                  │     │    │                                        │
│  - Chat UI       │     │    ├─ Query Embedding (OpenRouter)          │
│  - Markdown      │     │    ├─ Hybrid Retrieval                     │
│  - Citations     │     │    │   ├─ FAISS (semantic)                  │
│  - Embed mode    │     │    │   └─ BM25 (lexical)                   │
│                  │     │    ├─ RRF Score Fusion                      │
│                  │◀────│    ├─ Context Assembly                     │
│                  │     │    └─ LLM Generation (OpenRouter)           │
└──────────────────┘     │                                             │
                         │  Knowledge Index                            │
                         │    ├─ FAISS vector index                    │
                         │    ├─ BM25 lexical index                    │
                         │    └─ Chunk metadata (source URLs, etc.)    │
                         └─────────────────────────────────────────────┘

                         ┌─────────────────────────────────────────────┐
                         │         Ingestion Pipeline                   │
                         │                                              │
                         │  1. Fetch OLake docs (olake.io/docs/*)      │
                         │  2. Fetch GitHub repos (README, configs)     │
                         │  3. Extract & chunk content                  │
                         │  4. Generate embeddings                      │
                         │  5. Build FAISS + BM25 indexes               │
                         │  6. Save to disk with metadata               │
                         └─────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Python, FastAPI | API server, request handling |
| **Retrieval** | FAISS, BM25 (rank-bm25) | Hybrid vector + lexical search |
| **LLM** | OpenRouter API | Chat completions + embeddings |
| **Validation** | Pydantic | Request/response schema validation |
| **Frontend** | Next.js, TypeScript, React | Chat interface |
| **Styling** | Tailwind CSS | Responsive design |
| **Markdown** | react-markdown, react-syntax-highlighter | Rich answer rendering |
| **Rate Limiting** | slowapi | API abuse protection |

## Data Ingestion Workflow

1. **Fetch**: Crawl ~30+ OLake documentation pages and GitHub repo files
2. **Extract**: Parse HTML to markdown, preserving headings, code blocks, and structure
3. **Chunk**: Split into semantically meaningful chunks at heading boundaries (~1000 chars)
4. **Embed**: Generate vector embeddings via OpenRouter embedding API
5. **Index**: Build FAISS vector index + BM25 lexical index
6. **Store**: Save indexes and chunk metadata to disk for fast startup

Each chunk retains:
- Source URL (canonical documentation link)
- Source title
- Section heading
- Repository name and file path
- Content type (documentation, readme, config, source_code)
- Ingestion timestamp

## Retrieval and Citation Strategy

1. **Query Processing**: User question → embedding generation + tokenization
2. **Dual Retrieval**: Parallel FAISS vector search + BM25 keyword search
3. **Score Fusion**: Reciprocal Rank Fusion (RRF) combines both result sets
4. **Deduplication**: Remove near-duplicate chunks from the same source section
5. **Context Assembly**: Top-K results assembled with source metadata
6. **Grounded Generation**: LLM generates answer constrained to retrieved context
7. **Citation Validation**: Source URLs verified against retrieved evidence only

## API

### `POST /ask`

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I configure PostgreSQL CDC?"}'
```

**Request:**
```json
{
  "question": "How do I configure PostgreSQL CDC?"
}
```

**Response:**
```json
{
  "answer": "To configure PostgreSQL CDC in OLake, you need to...",
  "sources": [
    "https://olake.io/docs/connectors/postgres/overview",
    "https://olake.io/docs/sync-modes/cdc/"
  ]
}
```

### `GET /health`

```json
{
  "status": "ok",
  "version": "1.0.0",
  "index_loaded": true,
  "indexed_chunks": 150
}
```

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenRouter API key

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Build the knowledge index
python scripts/ingest.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set API URL
cp .env.example .env.local
# Edit .env.local if backend URL is different

# Start dev server
npm run dev
```

Visit http://localhost:3000 to use Ask OLake.

### Embedding in a Docs Site

Use the `/embed` route in an iframe:

```html
<iframe
  src="https://your-frontend-url.vercel.app/embed"
  width="400"
  height="600"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
  title="Ask OLake"
></iframe>
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key for LLM and embeddings |
| `CHAT_MODEL` | No | `google/gemini-2.5-flash-preview` | Chat model identifier |
| `EMBEDDING_MODEL` | No | `google/gemini-embedding-exp` | Embedding model identifier |
| `TOP_K_RETRIEVAL` | No | `10` | Number of candidates from each search engine |
| `TOP_K_FINAL` | No | `5` | Number of final context chunks for LLM |
| `RATE_LIMIT` | No | `20/minute` | API rate limit per IP |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for CORS |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Backend API URL (frontend) |

## Testing

### Backend Tests

```bash
cd backend
.\.venv\Scripts\activate  # or source .venv/bin/activate
pytest tests/ -v
```

### Evaluation

```bash
# Start the API server first, then:
python scripts/evaluate.py
```

Results are saved to `evaluation/results.json`.

## Known Limitations

1. **Documentation Scope**: Only indexes publicly accessible OLake documentation pages. Some pages may return 404 and are skipped with a warning.
2. **Embedding Quality**: Dependent on the configured embedding model's quality. Fallback hash-based embeddings are not semantically meaningful.
3. **LLM Hallucination**: While constrained to retrieved context, the LLM may occasionally make inferences beyond the evidence. Always verify against official docs.
4. **Rate Limits**: OpenRouter API has its own rate limits that may affect response times.
5. **Real-time Updates**: Index must be rebuilt when documentation changes. No automatic refresh.
6. **Single Session**: Chat history is per-browser-session only, not persisted.

## Security Considerations

- API keys stored in backend environment variables only, never in frontend code
- `.env` files excluded from git via `.gitignore`
- Input validation on all API endpoints
- Rate limiting to prevent abuse
- No arbitrary code execution or filesystem access through the API
- Retrieved documents treated as untrusted data (prompt injection protection in system prompt)
- CORS configured for the deployed frontend origin

## Future Improvements

- Incremental index updates when source docs change
- Conversation context for follow-up questions
- Streaming responses for better perceived latency
- Document-level relevance feedback
- Admin dashboard for index management
- More sophisticated chunking with overlap-aware deduplication
- Query expansion for better recall on ambiguous questions

## Source Attribution

This project indexes content from the following open-source repositories and documentation:

- [OLake Go](https://github.com/datazip-inc/olake) — Main data replication engine
- [OLake UI](https://github.com/datazip-inc/olake-ui) — Web interface
- [OLake Helm](https://github.com/datazip-inc/olake-helm) — Kubernetes Helm charts
- [OLake Fusion](https://github.com/datazip-inc/olake-fusion) — Iceberg table maintenance
- [OLake Documentation](https://olake.io/docs/) — Official documentation

Built for the **Hacktoberfest Hack Day Bengaluru × OLake** hackathon.

## License

MIT
