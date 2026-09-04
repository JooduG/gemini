---
description: Comprehensive repository and memory housekeeping — audits .env and secrets, reconciles ignore layers, synchronizes dual-layer developer memory, cleans workspace debris, and validates build health.
---

# 🧹 Housekeeping Protocol (`/housekeeping`)

> **Objective**: Conduct systematic repository and workspace hygiene. Eliminate configuration drift, protect secrets, synchronize developer memory (Pinecone & Supabase), purge transient debris, and verify that the engine remains pristine, lean, and 100% green.

---

## 1.0 Execution Phases

```text
[Phase 1: Secrets & Config] ➔ [Phase 2: Memory & Knowledge] ➔ [Phase 3: Workspace Hygiene] ➔ [Phase 4: Verification Gate]
```

---

### Phase 1: Environment & Secrets Audit

1. **Audit `.env` vs `.env.example`**:
   - Check for redundant, duplicate, or orphaned keys in `.env`.
   - Verify that all active keys have corresponding sanitized placeholders in `.env.example`.
   - Ensure no private tokens, API keys, or high-entropy credentials exist in `.env.example`.

2. **Ignore Layer Synchronization**:
   - Verify `ignores.master.json` catches all sensitive and temporary patterns.
   - Run ignore reconciliation:

     ```bash
     npm run sync:ignores
     ```

   - Confirm via `git check-ignore -v .env .env.example` that secrets remain strictly ignored while `.env.example` remains tracked.

---

### Phase 2: Dual-Layer Memory & Knowledge Sync

1. **Living Memory (Pinecone Vector DB)**:
   - Check vector allocation status via `describe_knowledge_base`.
   - If significant architectural documents, skills, rules, or task blueprints have changed, refresh the working memory:

     ```bash
     npm run knowledge:upsert
     ```

   - Run a test semantic query (`read_knowledge_base`) to confirm high-fidelity retrieval.

2. **Cold Storage (Supabase Relational Logs)**:
   - Verify API connectivity and table status via `query_cold_storage`.
   - If the project was recently paused or keys rotated, verify that both the publishable and secret keys in `.env` and `mcp_config.json` are active.
   - Ensure completed tracks and milestone summaries are properly archived.

---

### Phase 3: Workspace Hygiene & Dead Code Audit

1. **Workspace Hygiene**:
   - Check for stray scratch files, logs, or diagnostic dumps in the project root.
   - **Enforce Workspace Hygiene Law**: All temporary diagnostics belong strictly in `tmp/**`.
   - Clean up stale test outputs or orphaned artifacts in `tmp/`.

2. **P4 Pre-Beta Purity & Dead Code**:
   - Scan for unused imports, dead aliases, legacy shims, or deprecated backwards-compatibility wrappers.
   - Prune dead code immediately rather than maintaining legacy wrappers.
   - Inspect uncommitted changes with `git status` to ensure working tree cleanliness.

---

### Phase 4: Build & Verification Gate

1. **Run Local Verification**:
   - Execute the standard preparation and audit pipeline:

     ```bash
     npm run deploy:prepare
     ```

   - (Or `npm run verify` for lightweight validation).

2. **Quality Invariants**:
   - **0 errors, 0 warnings**.
   - 100% passing test suites across unit, design, and integration tests.
   - Clean single-file production build generation.

---

## 2.0 Housekeeping Report Format

Conclude the housekeeping session with a categorized status table:

| Domain               | Status     | Actions Taken / Observations                                     |
| :------------------- | :--------- | :--------------------------------------------------------------- |
| **Secrets & Config** | 🟢 Healthy | `.env` and `.env.example` synchronized; ignore layers reconciled |
| **Living Memory**    | 🟢 Healthy | Pinecone vector index up to date; allocation verified            |
| **Cold Storage**     | 🟢 Healthy | Supabase REST endpoint responsive; logs queried/verified         |
| **Hygiene & Debris** | 🟢 Healthy | Project root clean; zero dead backwards-compatibility shims      |
| **Build & CI**       | 🟢 Passing | `npm run deploy:prepare` passed (100% green)                     |

---

## 3.0 Commit Standard

When committing housekeeping improvements to version control:

- Follow Conventional Commits with the **`chore`** scope:

  ```bash
  git commit -m "chore(housekeeping): audit environment configs, reconcile ignore layers, and sync memory"
  ```
