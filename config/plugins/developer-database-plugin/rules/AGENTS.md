# Developer Database Routing & Invariants

When querying or updating developer memory via the `developer-database` MCP server (`search`, `ingest`, `status`, `prune`, `archive`, `search_archive`), enforce these invariants:

- **Secret Quarantine**: Never ingest or archive `.env` variables, API keys, tokens, or high-entropy secrets into Pinecone or Supabase.
- **Namespace Protection**: Living memory is partitioned into `<project>` (`category: "docs"` and `"src"`) and `global.docs`. Never wipe or prune a namespace without an explicit user directive.
- **On-Demand Skill Routing**: Load `developer-database` for memory lifecycle orchestration, `pinecone` for vector indexing and metadata filtering (`$eq`, `$in`), or `supabase` for `development_logs` cold storage and Row-Level Security (RLS) policies.
