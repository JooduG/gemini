# Developer Database & Dual-Layer Memory (`developer-database-plugin`)

Unified Antigravity plugin providing dual-layer persistent developer memory across **Pinecone** (Living Vector Space) and **Supabase** (Relational Cold Storage).

## Included Components

- **MCP Server (`developer-database`)**: 6-tool memory engine (`search`, `ingest`, `status`, `prune`, `archive`, `search_archive`) with automated Supabase keepalive heartbeats.
- **Rules (`rules/AGENTS.md`)**: Compact memory safety and secret quarantine invariants active when the plugin is enabled.
- **3 Domain Skills (`skills/`)**:
  1. `developer-database`: Primary memory router coordinating semantic recall (`search`), codebase ingestion (`ingest`), and mission archival (`archive` / `search_archive`).
  2. `pinecone`: Vector database specialist covering `multilingual-e5-large` integrated embeddings, `<project>` and `global.docs` namespace isolation, flat metadata filtering, and batch constraints.
  3. `supabase`: Supabase platform specialist covering `development_logs` cold storage, PostgREST Data API security, Row-Level Security (RLS) policies, and GoTrue auth boundaries.
