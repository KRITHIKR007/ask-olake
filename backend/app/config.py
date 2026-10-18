"""Configuration management for Ask OLake backend."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
INDEX_DIR = DATA_DIR / "index"
DOCS_DIR = DATA_DIR / "docs"

# Load environment variables from backend or root .env
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")
load_dotenv()

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
INDEX_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

# OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
CHAT_MODEL = os.getenv("CHAT_MODEL", "openrouter/auto")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "google/gemini-embedding-exp")
EMBEDDING_API_ENABLED = os.getenv("EMBEDDING_API_ENABLED", "false").lower() in ("true", "1")

# Retrieval settings
TOP_K_RETRIEVAL = int(os.getenv("TOP_K_RETRIEVAL", "10"))
TOP_K_FINAL = int(os.getenv("TOP_K_FINAL", "5"))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
EMBEDDING_DIMENSION = int(os.getenv("EMBEDDING_DIMENSION", "3072"))

# API settings
MAX_QUESTION_LENGTH = int(os.getenv("MAX_QUESTION_LENGTH", "1000"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "60"))
RATE_LIMIT = os.getenv("RATE_LIMIT", "60/minute")

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Ingestion sources
OLAKE_DOCS_URLS = [
    "https://olake.io/docs/",
    "https://olake.io/docs/getting-started/quickstart/",
    "https://olake.io/docs/getting-started/olake-ui",
    "https://olake.io/docs/connectors/postgres/overview",
    "https://olake.io/docs/connectors/mongodb/overview",
    "https://olake.io/docs/connectors/mysql/overview",
    "https://olake.io/docs/connectors/oracle/overview",
    "https://olake.io/docs/connectors/mssql/overview",
    "https://olake.io/docs/connectors/kafka/overview",
    "https://olake.io/docs/connectors/s3/overview",
    "https://olake.io/docs/connectors/db2/overview",
    "https://olake.io/docs/fusion/getting-started/overview/",
    "https://olake.io/docs/fusion/getting-started/quickstart/",
    "https://olake.io/docs/fusion/configuration/",
    "https://olake.io/docs/fusion/operations/compaction/",
    "https://olake.io/docs/fusion/operations/expire-snapshots/",
    "https://olake.io/docs/fusion/operations/remove-orphans/",
    "https://olake.io/docs/getting-started/architecture/",
    "https://olake.io/docs/destinations/apache-iceberg/",
    "https://olake.io/docs/destinations/apache-parquet/",
    "https://olake.io/docs/sync-modes/cdc/",
    "https://olake.io/docs/sync-modes/full-refresh/",
    "https://olake.io/docs/sync-modes/incremental/",
    "https://olake.io/docs/deploy/helm/",
    "https://olake.io/docs/deploy/docker/",
    "https://olake.io/docs/deploy/kubernetes/",
    "https://olake.io/docs/catalogs/glue/",
    "https://olake.io/docs/catalogs/hive/",
    "https://olake.io/docs/catalogs/rest/",
    "https://olake.io/docs/catalogs/hadoop/",
    "https://olake.io/docs/integrations/trino/",
    "https://olake.io/docs/integrations/athena/",
    "https://olake.io/docs/integrations/spark/",
]

GITHUB_REPOS = [
    {
        "name": "olake",
        "url": "https://github.com/datazip-inc/olake",
        "raw_base": "https://raw.githubusercontent.com/datazip-inc/olake/master",
        "important_files": ["README.md", "CONTRIBUTING.md"],
    },
    {
        "name": "olake-ui",
        "url": "https://github.com/datazip-inc/olake-ui",
        "raw_base": "https://raw.githubusercontent.com/datazip-inc/olake-ui/master",
        "important_files": ["README.md"],
    },
    {
        "name": "olake-helm",
        "url": "https://github.com/datazip-inc/olake-helm",
        "raw_base": "https://raw.githubusercontent.com/datazip-inc/olake-helm/master",
        "important_files": ["README.md", "charts/olake/values.yaml", "charts/olake/Chart.yaml"],
    },
    {
        "name": "olake-fusion",
        "url": "https://github.com/datazip-inc/olake-fusion",
        "raw_base": "https://raw.githubusercontent.com/datazip-inc/olake-fusion/master",
        "important_files": ["README.md"],
    },
]
