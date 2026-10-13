---
name: postgresql
description: "Authoritative PostgreSQL performance, schema design, and query optimization skill. Load this skill BEFORE writing or altering anything in a PostgreSQL database: designing schemas, adding columns, creating composite or partial indexes, writing complex SQL queries, tuning execution plans with EXPLAIN ANALYZE, configuring connection pooling, handling concurrency/locks, and auditing Row-Level Security (RLS) policies. Applicable to PostgreSQL running anywhere (Supabase, AWS RDS, Neon, Docker, local, or self-hosted)."
---

# PostgreSQL Performance & Schema Optimization

> **Persona: The Relational Database Architect**  
> _"I enforce mathematical query optimization, covering indexes, deadlock prevention, performant connection pooling, and resilient schema constraints across all PostgreSQL environments."_

---

## 1. When to Apply

Reference these guidelines when:

- Writing SQL queries or designing relational schemas.
- Designing indexes (B-tree, GIN for JSONB, GiST, BRIN, composite, partial).
- Debugging slow queries, timeouts, locks, or analyzing `EXPLAIN (ANALYZE, BUFFERS)` plans.
- Mitigating concurrency issues (deadlocks, advisory locks, `FOR UPDATE SKIP LOCKED`).
- Designing database constraints, foreign keys, partition strategies, and primary keys.
- Tuning connection pooling (PgBouncer, serverless limits, idle timeouts).
- Auditing Row-Level Security (RLS) policies for performance and security leakage.

---

## 2. Rule Categories by Priority

| Priority | Category                     |     Impact      |   Prefix    | Focus Area                                                                 |
| :------: | :--------------------------- | :-------------: | :---------: | :------------------------------------------------------------------------- |
|  **1**   | **Query Performance**        |  **CRITICAL**   |  `query-`   | Missing indexes, composite order, covering indexes, index types.           |
|  **2**   | **Connection Management**    |  **CRITICAL**   |   `conn-`   | Connection pooling, max limits, idle timeouts, prepared statements.        |
|  **3**   | **Security & RLS**           |  **CRITICAL**   | `security-` | RLS performance, ownership predicates, privilege hardening.                |
|  **4**   | **Schema Design**            |    **HIGH**     |  `schema-`  | Primary keys, foreign key indexing, data types, constraints, partitioning. |
|  **5**   | **Concurrency & Locking**    | **MEDIUM-HIGH** |   `lock-`   | Short transactions, deadlock prevention, advisory locks, skip locked.      |
|  **6**   | **Data Access Patterns**     |   **MEDIUM**    |   `data-`   | N+1 query elimination, batch inserts, upsert conflicts, pagination.        |
|  **7**   | **Monitoring & Diagnostics** | **LOW-MEDIUM**  | `monitor-`  | `EXPLAIN ANALYZE`, `pg_stat_statements`, `VACUUM ANALYZE`.                 |
|  **8**   | **Advanced Features**        |     **LOW**     | `advanced-` | Full-text search (tsvector/tsquery), JSONB indexing (`jsonb_path_ops`).    |

---

## 3. Reference Runbooks

Read individual runbook files in [`references/`](file:///C:/Users/johng/.gemini/config/skills/postgresql/references/) for exact SQL examples, bad vs good patterns, and query plans:

- **1. Query Performance**:
  - [query-missing-indexes.md](references/query-missing-indexes.md)
  - [query-composite-indexes.md](references/query-composite-indexes.md)
  - [query-covering-indexes.md](references/query-covering-indexes.md)
  - [query-partial-indexes.md](references/query-partial-indexes.md)
  - [query-index-types.md](references/query-index-types.md)
- **2. Connection Management**:
  - [conn-pooling.md](references/conn-pooling.md)
  - [conn-limits.md](references/conn-limits.md)
  - [conn-idle-timeout.md](references/conn-idle-timeout.md)
  - [conn-prepared-statements.md](references/conn-prepared-statements.md)
- **3. Security & RLS**:
  - [security-rls-basics.md](references/security-rls-basics.md)
  - [security-rls-performance.md](references/security-rls-performance.md)
  - [security-privileges.md](references/security-privileges.md)
- **4. Schema Design**:
  - [schema-primary-keys.md](references/schema-primary-keys.md)
  - [schema-foreign-key-indexes.md](references/schema-foreign-key-indexes.md)
  - [schema-constraints.md](references/schema-constraints.md)
  - [schema-data-types.md](references/schema-data-types.md)
  - [schema-partitioning.md](references/schema-partitioning.md)
  - [schema-lowercase-identifiers.md](references/schema-lowercase-identifiers.md)
- **5. Concurrency & Locking**:
  - [lock-short-transactions.md](references/lock-short-transactions.md)
  - [lock-deadlock-prevention.md](references/lock-deadlock-prevention.md)
  - [lock-advisory.md](references/lock-advisory.md)
  - [lock-skip-locked.md](references/lock-skip-locked.md)
- **6. Data Access Patterns**:
  - [data-n-plus-one.md](references/data-n-plus-one.md)
  - [data-batch-inserts.md](references/data-batch-inserts.md)
  - [data-upsert.md](references/data-upsert.md)
  - [data-pagination.md](references/data-pagination.md)
- **7. Monitoring & Diagnostics**:
  - [monitor-explain-analyze.md](references/monitor-explain-analyze.md)
  - [monitor-pg-stat-statements.md](references/monitor-pg-stat-statements.md)
  - [monitor-vacuum-analyze.md](references/monitor-vacuum-analyze.md)
- **8. Advanced Features**:
  - [advanced-full-text-search.md](references/advanced-full-text-search.md)
  - [advanced-jsonb-indexing.md](references/advanced-jsonb-indexing.md)

---

## 4. Universal Engineering Laws for PostgreSQL

1. **Every Foreign Key Must Have An Index**: Unindexed foreign keys cause full table locks or sequential scans when deleting or updating parent rows.
2. **Explicit Column Projections**: Never execute `SELECT *` across application boundaries. Project only the required columns.
3. **Use Composite Index Column Order Strictly**: Order columns by equality conditions first, then range conditions (`WHERE tenant_id = 1 AND created_at > ...` $\rightarrow$ `(tenant_id, created_at)`).
4. **Wrap Invocations in Short Transactions**: Never perform external HTTP requests, filesystem I/O, or long loops inside an open database transaction.
