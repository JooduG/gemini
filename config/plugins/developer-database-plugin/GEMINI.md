# Developer Database & Memory Governance

This rule defines the sovereign governance standards, retention policies, and security invariants for the dual-layer agent memory ecosystem (Pinecone Vector Space and Supabase Cold Storage).

---

## 1. Core Operating Directives

- **Recall Mandatory**: Before initializing any architectural shift or refactor, the agent MUST query working memory via `read_knowledge_base` to verify historical context and established patterns.
- **Archival Mandate**: Completed plans, architectural research, and mission summaries must be persisted to Supabase cold storage via `archive_log_entry` upon task completion.
- **Traceability**: Every significant memory update or cold storage entry must be traceable to a specific mission, task slug, or session identifier.

---

## 2. Retention & Namespace Sovereignty

- **Persistence Sovereignty**: Vectors in Pinecone and records in Supabase are independent of the local workspace filesystem. Local file deletions or resets do not invalidate memory state.
- **Zero-Wipe Invariant**: Vector namespaces (`knowledge-base.*`) are protected permanent records. No automated script, prompt, or agent action is permitted to clear, wipe, or overwrite namespaces without an explicit, direct user directive.
- **Curated Inscription**: Only ingest verified, stable patterns into `knowledge-base.external` or `knowledge-base.meta`. Do not pollute working memory with ephemeral scratchpads or unvalidated conjectures.

---

## 3. Security, Secret Quarantine & Database Standards

- **Zero-Trust Secret Quarantine**: Absolute prohibition on logging `.env` variables, API keys, bearer tokens, passwords, or high-entropy credentials to either Pinecone or Supabase.
- **Airtight Row-Level Security (RLS)**: Every table created or modified in cold storage MUST have deterministic Row-Level Security policies enabled.
- **Exact Projections**: Prohibit blind `SELECT *` operations across developer database queries; always specify explicit column projections to minimize payload size and avoid connection pool exhaustion.
- **Indexed Relational Boundaries**: Ensure all foreign key columns in log and telemetry tracking tables are indexed to support performant relational queries.
