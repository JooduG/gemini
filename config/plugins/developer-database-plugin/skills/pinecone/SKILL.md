---
name: pinecone
description: Pinecone vector database & living memory specialist skill. Governs vector indexing, serverless architecture, multilingual-e5 embeddings, namespace isolation, metadata filtering, similarity search, batch ingestion constraints, and index diagnostics. Load this skill when performing semantic search, embedding codebases, configuring namespaces, tuning similarity thresholds, or debugging Pinecone API responses.
---

# Pinecone Vector Living Memory Specialist

> **Persona: The High-Dimensional Vector Cartographer**  
> _"I map high-dimensional semantic spaces, manage multi-tenant namespace partitions, orchestrate integrated embedding pipelines, and deliver high-precision similarity recall."_

---

## 1. Scope & Primary Domain

This specialist skill provides authoritative execution patterns for **Pinecone** within the developer memory ecosystem:

1. **Living Vector Memory**: Managing semantic recall for framework logic, coding standards, and architectural blueprints.
2. **Integrated Inference**: Leveraging hosted embedding models (`multilingual-e5-large`) without external model providers.
3. **Partition-Level Isolation**: Segmenting project-scoped memory (`<project>.knowledge-base.meta`) from global standards (`knowledge-base.external`).
4. **Metadata & Similarity Queries**: Executing top-K semantic search, cosine similarity ranking, and MongoDB-style metadata filtering.
5. **Batch Ingestion Mechanics**: Handling chunking, sha256 deterministic IDs, safe batch sizing, and write-visibility windows.

---

## 2. Core Operational Invariants

### 2.1 Mandatory Rules

1. **Mandatory Flat Metadata**: Pinecone strictly prohibits nested objects in vector metadata. Use flat key-value pairs (strings, numbers, booleans, or lists of strings).
2. **Explicit Namespaces**: Every query, upsert, and delete operation MUST declare its explicit namespace.
3. **Write-Visibility Window (5–10s)**: Indexing in serverless partitions is asynchronous. Allow up to 10 seconds after upserting before executing verification search probes.
4. **Batch Limits**: Text embedding batches must not exceed **96 items** per call; raw vector upsert batches must not exceed **1,000 vectors** or **2 MB** payload size. Our engine standardizes on batches of **50**.
5. **No Blind Index Wipes**: Namespaces represent durable developer memory. Clearing or wiping namespaces is strictly prohibited without explicit user instruction.

---

## 3. Tool Usage Recipes

```bash
# Search technical patterns across active namespaces (default: active project + global.docs)
call_mcp_tool ServerName: "developer-database" ToolName: "search" Arguments: {
  "query": "Svelte 5 Runes state management patterns",
  "top_k": 5
}

# Inspect index status, health, and vector count per namespace
call_mcp_tool ServerName: "developer-database" ToolName: "status" Arguments: {}

# Ingest and embed architectural patterns from files into project memory
call_mcp_tool ServerName: "developer-database" ToolName: "ingest" Arguments: {
  "paths": ["GEMINI.md", "ARCHITECTURE.md", "src"]
}

# Prune vectors by file source or wipe namespace
call_mcp_tool ServerName: "developer-database" ToolName: "prune" Arguments: {
  "namespace": "rpglitch",
  "source": "old-file.md"
}
```

---

## 4. Architectural References

Consult specialized vector guides in [`references/`](file:///C:/Users/johng/.gemini/config/plugins/developer-database-plugin/skills/pinecone/references/):

- **[metadata-filtering.md](references/metadata-filtering.md)**: MongoDB-style operators (`$eq`, `$in`, `$gte`, `$and`, `$or`), string-list filtering, and schema auto-indexing.
- **[embedding-models.md](references/embedding-models.md)**: Integrated `/embed` API, asymmetric `input_type` (`"passage"` vs `"query"`), and chunk sizing.
- **[namespace-strategies.md](references/namespace-strategies.md)**: Project-scoped isolation (`<project>.knowledge-base.meta`) vs global library standards (`knowledge-base.external`).

---

## 5. Verification Checklist

- [ ] Query specifies explicit namespace target(s).
- [ ] Metadata attached to vectors is strictly flat (no nested JSON structures).
- [ ] Batch sizes during bulk ingestion remain $\le 50$ to avoid HTTP payload limits.
- [ ] Asymmetric input types respected (`"passage"` for ingestion, `"query"` for search).
- [ ] Verification probes account for the 5–10 second asynchronous index visibility delay.
