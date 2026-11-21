---
name: ground-context
description: >-
  JIT context engineering, grounding sequence, MCP tool routing, evidentiary tiers,
  and dual-layer memory lifecycle. Use when starting non-trivial investigations,
  querying dev-database or context7-mcp, checking modern-web-guidance, routing across
  MCP servers, or verifying claims before implementation. Do NOT use for modifying
  Svelte/CSS/audio source files directly without research, or managing plugin lifecycle
  (use plugin).
---

# Ground Context & JIT Retrieval

Retrieve verified local code, project specs, living vector memory, and current library documentation Just-In-Time before proposing designs or writing code.

## 1. The 4-Step Context Grounding Ladder

Execute in strict order—never assume file structure, APIs, or conventions from training memory:

1. **Codebase Reality**: Locate symbols and read bounded line ranges (`read_file` with `StartLine`/`EndLine`), or inspect `package.json`, build configs, and dependency graphs (`graph-it` in supported workspaces).
2. **Project Specifications**: Read authoritative local docs when present (`README.md`, `DESIGN.md`, `SECURITY.md`, `ROADMAP.md`, `GEMINI.md`).
3. **Living Memory (`developer-database-plugin`)**: Query Pinecone living memory (`search`) for established patterns/rules and Supabase cold storage (`search_archive`) for past architectural decisions.
4. **Live External Documentation**: Verify fast-changing APIs and web platform standards before writing code via `context7-mcp`, `modern-web-guidance`, `deepwiki`, or `firecrawl-mcp`.

## 2. Cognitive & MCP Tool Routing Matrix

| Deficit / Need | Primary Tool / Skill | When to Use |
| :--- | :--- | :--- |
| **Project patterns & past decisions** | `dev-database` (`search`, `search_archive`), `dev-pinecone`, `dev-supabase` | Before reading wide swaths of files or guessing historical architecture rationale |
| **Library / SDK APIs & versions** | `context7-mcp` (`resolve-library-id`, `query-docs`) | Library setup, API signatures, defaults, version migrations (React, Svelte, Vite, Dexie, etc.) |
| **Modern HTML / CSS / Client JS / A11y** | `modern-web-guidance` (`npx -y modern-web-guidance@latest search/retrieve`) | Modals, popovers, CSS layout, container queries, view transitions, CWV performance, sanitization |
| **External GitHub repo architecture** | `deepwiki` (`read_wiki_structure`, `ask_wiki_question`) | Inspecting architecture of open-source repositories |
| **Web pages / raw technical docs** | `firecrawl-mcp` (`firecrawl_scrape`, `firecrawl_search`) | Extracting clean markdown from external docs or articles |
| **Multi-step root-cause reasoning** | `mcp-sequentialthinking-tools` | Ambiguous bugs, conflicting constraints, or adaptive hypothesis revision |
| **Large codebase call-graph / impact** | Workspace `graph-it` (when present) or parallel `research` subagents | "What calls this?", blast radius, or multi-module exploration |

## 3. Evidentiary Tiers (Separate Facts from Assumptions)

Label claims accurately so assumptions never masquerade as verified code behavior:

1. **Hard Constraints**: Explicit user requirements, runtime limits, and non-negotiable invariants.
2. **Empirical Evidence**: Directly observed file paths, line numbers, tool outputs, or test runs. When synthesizing patterns from examples, count occurrences (`seen: N of M`) and check `1–2` holdout cases.
3. **Inferences**: Logical extrapolations from partial reads—mark explicitly as inferred until checked.
4. **Unknowns**: Unverified variables—name the exact read, grep, or measurement spike required to settle each one.

## 4. Autonomous Memory Lifecycle

1. **Recall (Pre-Flight)**: Call `dev-database` `search` before proposing architectural changes when living memory is indexed for the active workspace.
2. **Inscribe (Post-Verification)**: Store newly established, stable conventions via `ingest` (never `.env`, keys, tokens, or transient scratchpad notes).
3. **Archive (Milestone Close)**: Persist completed plans, retrospectives, and trade-off rationales to cold storage via `archive` (`task_slug`, `session_id`, `content`, `metadata`).

## 5. Bright-Line Rules

- **Hard Stop on Truncation**: Whenever search or command output reports truncation (`...N more results not shown`, `truncated=true`), narrow filters recursively until 100% of matches are audited.
- **No Unbounded Reads**: Locate target symbols first, then read bounded line ranges instead of loading entire large files blindly.
- **Zero-Noise Grounding**: Cite exact file paths, line numbers, and symbols observed in this session—never fabricate or cite unverified symbols from memory.
