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

# Ensure directories exist (safe for read-only serverless filesystems)
try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    pass

# OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
CHAT_MODEL = os.getenv("CHAT_MODEL", "openrouter/auto")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "google/gemini-embedding-exp")
EMBEDDING_API_ENABLED = os.getenv("EMBEDDING_API_ENABLED", "false").lower() in ("true", "1")

# Retrieval settings
TOP_K_RETRIEVAL = int(os.getenv("TOP_K_RETRIEVAL", "100"))
TOP_K_FINAL = int(os.getenv("TOP_K_FINAL", "10"))
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
    "https://olake.io/docs/api/olake-ui-api/",
    "https://olake.io/docs/community/channels/",
    "https://olake.io/docs/community/code-of-conduct/",
    "https://olake.io/docs/community/commands-and-flags/",
    "https://olake.io/docs/community/issues-and-prs/",
    "https://olake.io/docs/community/learning-modules/",
    "https://olake.io/docs/community/setting-up-a-dev-env/",
    "https://olake.io/docs/connectors/db2/",
    "https://olake.io/docs/connectors/db2/?config-type=olake-cli",
    "https://olake.io/docs/connectors/kafka/",
    "https://olake.io/docs/connectors/mssql/?config-type=olake-cli",
    "https://olake.io/docs/connectors/mysql/",
    "https://olake.io/docs/connectors/mysql/?config-type=olake-cli",
    "https://olake.io/docs/connectors/mysql/setup/aurora/",
    "https://olake.io/docs/connectors/mysql/setup/azure/",
    "https://olake.io/docs/connectors/mysql/setup/gcp/",
    "https://olake.io/docs/connectors/mysql/setup/local/",
    "https://olake.io/docs/connectors/oracle/?config-type=olake-cli",
    "https://olake.io/docs/connectors/postgres/",
    "https://olake.io/docs/connectors/postgres/?config-type=olake-cli",
    "https://olake.io/docs/connectors/postgres/setup/aurora/",
    "https://olake.io/docs/connectors/postgres/setup/azure/",
    "https://olake.io/docs/connectors/postgres/setup/gcp/",
    "https://olake.io/docs/connectors/postgres/setup/local/",
    "https://olake.io/docs/connectors/postgres/wal2json_plugin/",
    "https://olake.io/docs/connectors/s3/",
    "https://olake.io/docs/core/architecture/",
    "https://olake.io/docs/core/configs/catalog/",
    "https://olake.io/docs/core/configs/source/",
    "https://olake.io/docs/core/use-cases/",
    "https://olake.io/docs/features/schema/",
    "https://olake.io/docs/fusion/community/code-of-conduct/",
    "https://olake.io/docs/fusion/community/contributing/",
    "https://olake.io/docs/fusion/compaction/configuration/",
    "https://olake.io/docs/fusion/core/compatibility/query-engines/",
    "https://olake.io/docs/fusion/core/terminologies/",
    "https://olake.io/docs/fusion/getting-started/compaction/",
    "https://olake.io/docs/fusion/getting-started/overview/",
    "https://olake.io/docs/fusion/getting-started/quickstart/",
    "https://olake.io/docs/fusion/install/kubernetes-compaction/",
    "https://olake.io/docs/fusion/install/olake-ui/",
    "https://olake.io/docs/fusion/maintenance/runs-and-logs/",
    "https://olake.io/docs/getting-started/creating-first-pipeline/",
    "https://olake.io/docs/getting-started/job-level-properties/",
    "https://olake.io/docs/getting-started/playground/",
    "https://olake.io/docs/install/docker-cli/",
    "https://olake.io/docs/install/olake-ui/",
    "https://olake.io/docs/install/olake-ui/offline-environments-generic/",
    "https://olake.io/docs/release/ingestion/v0.1.0-v0.1.1/",
    "https://olake.io/docs/release/ingestion/v0.1.6-v0.1.8/",
    "https://olake.io/docs/release/ingestion/v0.1.9-v0.1.11/",
    "https://olake.io/docs/release/ingestion/v0.11.0/",
    "https://olake.io/docs/release/ingestion/v0.12.0/",
    "https://olake.io/docs/release/ingestion/v0.2.0-v0.2.1/",
    "https://olake.io/docs/release/ingestion/v0.2.10/",
    "https://olake.io/docs/release/ingestion/v0.2.5-v0.2.7/",
    "https://olake.io/docs/release/ingestion/v0.2.8/",
    "https://olake.io/docs/release/ingestion/v0.3.14/",
    "https://olake.io/docs/release/ingestion/v0.3.17/",
    "https://olake.io/docs/release/ingestion/v0.3.5/",
    "https://olake.io/docs/release/ingestion/v0.4.0/",
    "https://olake.io/docs/release/ingestion/v0.5.0/",
    "https://olake.io/docs/release/ingestion/v0.6.0/",
    "https://olake.io/docs/release/ingestion/v0.7.0/",
    "https://olake.io/docs/release/ingestion/v0.8.0/",
    "https://olake.io/docs/release/ingestion/v0.9.0/",
    "https://olake.io/docs/understanding/compatibility-catalogs/",
    "https://olake.io/docs/understanding/compatibility-engines/",
    "https://olake.io/docs/understanding/terminologies/general/",
    "https://olake.io/docs/understanding/terminologies/olake/",
    "https://olake.io/docs/writers/iceberg/azure/",
    "https://olake.io/docs/writers/iceberg/catalog/glue/",
    "https://olake.io/docs/writers/iceberg/catalog/hive/",
    "https://olake.io/docs/writers/iceberg/catalog/hive/?tab=hive-cli",
    "https://olake.io/docs/writers/iceberg/catalog/jdbc/",
    "https://olake.io/docs/writers/iceberg/catalog/rest/",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=biglake",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=biglake&tab=biglake-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=generic",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=generic&tab=rest-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=horizon",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=horizon&tab=horizon-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=lakekeeper",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=lakekeeper&tab=lakekeeper-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=nessie",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=polaris",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=polaris&tab=polaris-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=s3-tables",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=unity",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?rest-catalog=unity&tab=unity-cli",
    "https://olake.io/docs/writers/iceberg/catalog/rest/?tab=rest-cli",
    "https://olake.io/docs/writers/iceberg/partitioning/",
    "https://olake.io/docs/writers/iceberg/polaris-iam-setup/",
    "https://olake.io/docs/writers/iceberg/troubleshooting-local/",
    "https://olake.io/docs/writers/parquet/config/",
    "https://olake.io/docs/writers/parquet/config/?S3=OLake-CLI",
    "https://olake.io/docs/writers/parquet/partitioning/",
    "https://olake.io/docs/writers/parquet/permission/",
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
