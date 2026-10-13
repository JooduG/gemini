# Developer Database & Memory Governance

This document defines the sovereign governance standards, retention policies, architecture invariants, and security rules for the dual-layer agent memory ecosystem (Pinecone Vector Space and Supabase Cold Storage).

---

## 1. Core Operating Directives

- **Recall Mandatory**: Before initializing any architectural shift, schema migration, or structural refactor, the agent MUST query working memory via `read_knowledge_base` to verify historical context and established patterns.
- **Archival Mandate**: Completed plans, architectural research, and mission summaries must be persisted to Supabase cold storage via `archive_log_entry` upon task completion.
- **Traceability**: Every significant memory update or cold storage entry must be traceable to a specific mission, task slug, or session identifier.
- **Heartbeat Invariant**: Maintain dual-layer platform liveness. Whenever Pinecone working memory is engaged, trigger the non-blocking background keepalive ping against Supabase cold storage (`GET /rest/v1/development_logs?select=id&limit=1`, 10-minute throttle) to prevent automated project dormancy.

---

## 2. Retention & Namespace Sovereignty

- **Persistence Sovereignty**: Vectors in Pinecone and records in Supabase are independent of the local workspace filesystem. Local file deletions or resets do not invalidate memory state.
- **Zero-Wipe Invariant**: Vector namespaces are protected permanent records. No automated script, prompt, or agent action is permitted to clear, wipe, or overwrite namespaces without an explicit, direct user directive.
- **Namespace Taxonomy & Isolation**:
  - `knowledge-base.external`: Global external library standards, framework best practices, and universal runbooks.
  - `<corpus_name>.knowledge-base.meta`: Project-isolated living memory (e.g., `joodug-rpglitch.knowledge-base.meta`), containing hashed codebase specs, local architecture rules, and active invariants.
- **Curated Inscription**: Only ingest verified, stable patterns into living memory via `write_knowledge_base`. Do not pollute vector space with transient scratchpads, ephemeral test runs, or unvalidated conjectures.

---

## 3. Querying & Metadata Filtering Standards

- **Metadata Filters**: When querying `read_knowledge_base`, leverage MongoDB-style `filter` parameters (e.g., `{"source": {"$eq": "ARCHITECTURE.md"}}` or `{"category": {"$in": ["security", "physics"]}}`) to eliminate noise and constrain semantic recall.
- **Top-K Tuning**: Calibrate `top_k` according to task breadth (default 5 for focused lookups, 10-15 for broad exploratory scans).
- **Documentation Routing**: Technical SDK, syntax, or platform API documentation lookups for Pinecone or Supabase must route through **Context7** (`resolve-library-id` / `query-docs`) rather than duplicate administrative MCP servers.

---

## 4. Security, Secret Quarantine & Database Standards

- **Zero-Trust Secret Quarantine**: Absolute prohibition on logging `.env` variables, API keys, bearer tokens, passwords, or high-entropy credentials to either Pinecone or Supabase.
- **Airtight Row-Level Security (RLS)**: Every table created or modified in cold storage MUST have deterministic Row-Level Security policies enabled.
- **Exact Projections**: Prohibit blind `SELECT *` operations across developer database queries; always specify explicit column projections to minimize payload size and avoid connection pool exhaustion.
- **Indexed Relational Boundaries**: Ensure all foreign key columns in log and telemetry tracking tables are indexed to support performant relational queries.
