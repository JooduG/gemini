---
name: supabase
description: >-
  Comprehensive Supabase platform specialist skill. Use when designing Supabase
  BaaS architecture (Database, Auth, Storage, Edge Functions, Realtime), configuring
  `@supabase/supabase-js` or `@supabase/ssr`, securing PostgREST Data APIs, authoring
  Row-Level Security (RLS) policies, or persisting/querying cold storage logs via
  `archive` and `search_archive`. Do NOT use for Pinecone vector embeddings (use
  `pinecone`) or generic non-Supabase PostgreSQL query tuning (use `postgresql`).
---

# Supabase Platform Specialist

> **Persona: The Supabase Cloud Architect**  
> _"I orchestrate the Supabase ecosystem: securing Data API endpoints, configuring authentication lifecycles, governing storage buckets, and managing durable cold storage persistence."_

---

## 0. Empirical Pitfalls & Scar Tissue (Top Invariants)

| Trigger | Wrong Behavior | Correct Behavior |
| :--- | :--- | :--- |
| **Deprecated `auth.role()` in RLS** | Writing `using (auth.role() = 'authenticated')` in RLS policies. | Use the policy `TO authenticated` or `TO anon` clause directly and wrap `(select auth.uid()) = user_id` for query plan caching. |
| **UPDATE Policy Without SELECT** | Defining an `UPDATE` RLS policy without a matching `SELECT` policy. | PostgreSQL requires `SELECT` visibility to locate rows before updating; always pair `UPDATE` with `SELECT` and include both `USING` and `WITH CHECK`. |
| **Auth Checks on `user_metadata`** | Reading `raw_user_meta_data` to grant role/tier permissions. | `user_metadata` can be modified by the client; store authorization claims exclusively in `app_metadata`. |
| **Stale Cold Storage Tool Names** | Calling `archive_log_entry` or `query_cold_storage`. | Always call `archive` and `search_archive` on the `developer-database` MCP server. |

---

## 1. Scope & Primary Domain

This specialist skill provides authoritative execution patterns for the **Supabase Platform & BaaS Ecosystem**:

1. **Relational Cold Storage**: Storage and retrieval of mission logs, task retrospectives, forensic traces, and decision records in `development_logs`.
2. **PostgREST Data (REST) API**: Safely exposing schemas, querying tables via REST, and setting request headers (`Prefer: return=minimal`).
3. **Authentication & Authorization**: GoTrue auth, JWT tokens, session management, and `app_metadata` vs `user_metadata` security boundaries.
4. **Supabase Row-Level Security (RLS)**: Enforcing platform-level RLS policies on exposed schemas (`public`), role boundaries (`TO authenticated` vs `TO anon`), and ownership predicates.
5. **Database Foundations**: For deep PostgreSQL indexing, execution plans, connection pooling, and locking, this skill delegates directly to the global **[`postgresql`](../../../../skills/postgresql/SKILL.md)** skill.

---

## 2. Core Operating Principles

### 2.1 The Data (REST) API & Exposed Schemas

- **Role Exposure**: Tables in the `public` schema are reachable through PostgREST. Both `anon` (publishable key) and `authenticated` access must be explicitly secured.
- **Mandatory RLS**: Every table in any exposed schema **MUST** have Row-Level Security enabled:

  ```sql
  alter table public.development_logs enable row level security;
  ```

- **Service Role Isolation**: Never expose `service_role` secrets in frontend or public code. `service_role` bypasses RLS and is strictly reserved for authenticated server-side administrative jobs and daemon scripts.

### 2.2 Security Traps to Prevent

- **No `auth.role()`**: Deprecated. Use the `TO` clause on the policy directly (e.g., `TO authenticated` or `TO anon`).
- **Authorization with Authentication**: `TO authenticated` alone only checks the role; it does NOT restrict rows. Always combine with ownership predicates:

  ```sql
  create policy "Users can view own logs" on public.development_logs
    for select
    to authenticated
    using ( (select auth.uid()) = user_id );
  ```

- **UPDATE Requires SELECT**: In PostgreSQL RLS, an `UPDATE` policy requires a matching `SELECT` policy to locate the row before updating. Without `SELECT`, updates silently return 0 rows.
- **Both USING and WITH CHECK for UPDATE**: Prevent users from reassigning ownership keys:

  ```sql
  create policy "Users can update own logs" on public.development_logs
    for update
    to authenticated
    using ( (select auth.uid()) = user_id )
    with check ( (select auth.uid()) = user_id );
  ```

- **Avoid `user_metadata` for Authorization**: `raw_user_meta_data` is user-editable and unsafe. Store authorization and tier data strictly in `app_metadata`.

---

## 3. Relational Cold Storage (`development_logs`)

The canonical relational table for developer telemetry and mission retrospectives:

```sql
create table if not exists public.development_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  session_id text not null,
  task_slug text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb not null
);

-- Indexing for rapid historical lookups and forensics
create index if not exists idx_development_logs_task_slug on public.development_logs(task_slug);
create index if not exists idx_development_logs_created_at on public.development_logs(created_at desc);
create index if not exists idx_development_logs_project on public.development_logs((metadata->>'project'));
```

### Tool Recipes

```bash
# Archive mission post-mortem or blueprint decision
call_mcp_tool ServerName: "developer-database" ToolName: "archive" Arguments: {
  "session_id": "session-2026-10-30",
  "task_slug": "audio-standardization",
  "content": "Standardized Web Audio registry and lifecycle hooks across all views.",
  "metadata": { "status": "complete", "tests": 13 }
}

# Query historical decisions by query or task_slug
call_mcp_tool ServerName: "developer-database" ToolName: "search_archive" Arguments: {
  "task_slug": "audio-standardization",
  "limit": 5
}
```

---

## 4. Deep PostgreSQL Delegation

For comprehensive SQL query optimization, composite index tuning, connection pool limits, and locking rules, consult the global PostgreSQL skill:

$\rightarrow$ **[skills/postgresql/SKILL.md](../../../../skills/postgresql/SKILL.md)**

---

## 5. Verification Checklist

- [ ] All table changes in public schemas have RLS enabled with explicit `USING` and `WITH CHECK` clauses.
- [ ] No `auth.role()` references used in policies; `TO authenticated` or `TO anon` applied instead.
- [ ] Foreign keys explicitly indexed to prevent full-table sequential scans during joins and deletes.
- [ ] Projections use explicit columns (no blind `SELECT *` across network boundaries).
- [ ] Archival queries checked for project scoping (`metadata->>'project'`).
- [ ] Deep SQL performance validated against the global `postgresql` runbooks.
