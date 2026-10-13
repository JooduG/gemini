# Pinecone Namespace Strategies & Multi-Tenancy

Namespaces provide partition-level multitenancy inside a single Pinecone index. Queries and operations in one namespace are completely isolated from records in all other namespaces with zero cross-tenant leakage.

---

## 1. Developer Database Namespace Taxonomy

In the `developer-database` architecture, vector memory is split into two primary scopes:

```text
knowledge-library (Pinecone Serverless Index)
├── knowledge-base.external                <-- Shared Global Standards
└── <project>.knowledge-base.meta          <-- Project-Specific Living Memory
    ├── joodug-rpglitch.knowledge-base.meta
    ├── joodug-imageglitch.knowledge-base.meta
    └── ...
```

### 1.1 `knowledge-base.external` (Global Knowledge)

- **Scope**: Cross-project and persistent across workspaces.
- **Contents**:
  - Svelte 5 Sovereignty (Runes, snippets, migration contracts).
  - External library intelligence (Bits UI, Dexie.js, Tailwind v4, Web Audio API).
  - Web platform standards and architectural patterns.

### 1.2 `<project>.knowledge-base.meta` (Living Memory)

- **Scope**: Partitioned strictly per active project/repository (e.g. `joodug-rpglitch`).
- **Contents**:
  - Project architecture specifications (`ARCHITECTURE.md`, `DESIGN.md`).
  - Active engineering rules, prompt contracts, and system blueprints.
  - Core engine dynamics and memory laws.

---

## 2. Namespace Lifecycle & Operating Rules

1. **Auto-Creation on Upsert**:
   - Pinecone automatically creates a namespace upon upserting the first vector into that namespace. No explicit index creation step is required.
2. **Mandatory Explicit Namespace Call**:
   - Every read and write query must explicitly specify its target namespace. Do not rely on ambiguous defaults.
3. **Partition Isolation**:
   - A query directed at `<project>.knowledge-base.meta` will never inspect or return vectors from `knowledge-base.external`. To search both, execute parallel queries and rerank results by similarity score.
4. **Namespace Stats Inspection**:
   - Calling `/describe_index_stats` returns the total record count and a breakdown of vector counts per namespace, enabling index health audits without performing vector scans.
