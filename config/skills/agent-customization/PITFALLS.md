# Agent Customization Known Pitfalls & Failure Parables

> **Tier 2 Empirical Scar Tissue**: Read this ledger before modifying, creating, or auditing any skills, hooks, rules, or plugins. When an entry reaches 4 to 5 occurrences, promote it to a constitutional law in root `GEMINI.md` and add an executable CI verification test.

---

## Failure Parables

### `[PF-001]` Frontmatter Workflow Leakage (Occurrences: 3)

- **Trigger**: Authoring frontmatter `description` for a multi-step skill or procedural runbook.
- **Wrong Behavior (Root Cause)**: Narrating ordered execution steps inside the YAML `description` (e.g. *"First inspect files, run the lint script, update config, then verify tests"*). The model reads the Level 1 system prompt, executes the shallow summary directly, and skips reading `SKILL.md` or its `references/` leaves off disk entirely.
- **Correct Behavior (Prevention Rule)**: Restrict frontmatter `description` strictly to **what** the skill covers and **when** it should trigger using the **Trigger Triad** (capability statement + `"Use when..."` lexical bait & import paths + `"Do NOT use for..."` negative boundaries). Keep execution steps exclusively inside the Markdown body.

---

### `[PF-002]` YAML Colon Parsing Crash in Description (Occurrences: 2)

- **Trigger**: Writing natural language descriptions containing unquoted colons (e.g., `description: Plans migrations: table changes, index additions`).
- **Wrong Behavior (Root Cause)**: YAML parsers interpret an unquoted colon followed by a space as a mapping key delimiter, breaking frontmatter parsing and causing agent runtimes to drop the skill or load empty metadata.
- **Correct Behavior (Prevention Rule)**: Use YAML block scalar syntax (`>-`) for multi-line strings, or wrap single-line descriptions containing colons in double quotes (`"`).

---

### `[PF-003]` Broad Domain Grab & Catch-All Over-Triggering (Occurrences: 4 — GRADUATED TO GEMINI.MD)

- **Trigger**: Authoring descriptions with broad, generic verbs (e.g. *"Use when writing code, reviewing style, or creating files in JavaScript"*).
- **Wrong Behavior (Root Cause)**: The skill matches 100% of user sessions, burning thousands of tokens on irrelevant procedural directives, polluting conversation context, and applying incorrect domain constraints.
- **Correct Behavior (Prevention Rule)**: Constrain the capability statement with domain-specific terms, append concrete `"Use when..."` imperatives, and declare explicit `"Do NOT use for..."` negative boundaries pointing to competing sibling skills.

---

### `[PF-004]` Multi-Hop Reference Traversal Failure (Occurrences: 3)

- **Trigger**: Structuring skill documentation across chained nested files (`SKILL.md` $\rightarrow$ `references/a.md` $\rightarrow$ `references/b.md`).
- **Wrong Behavior (Root Cause)**: Probabilistic agents routinely halt after following the first reference link, never opening the second-hop leaf and hallucinating missing parameters.
- **Correct Behavior (Prevention Rule)**: Enforce the **One-Hop Reference Boundary**. `SKILL.md` must link directly to targeted reference leaves (e.g. `[matrix](./references/lock-matrix.md)`) or executable scripts (`[script](./scripts/check.js)`).

---

### `[PF-005]` Rule Fragmentation vs Sovereign Single-Authority (Occurrences: 5 — GRADUATED TO GEMINI.MD)

- **Trigger**: Creating ad-hoc `.agents/rules/*.md` files or standalone instruction files scattered throughout subdirectories.
- **Wrong Behavior (Root Cause)**: Multiple scattered rule files lead to conflicting constraints, rule drift, and silent override bugs during directory traversal.
- **Correct Behavior (Prevention Rule)**: Maintain root `GEMINI.md` / `AGENTS.md` as the sole persistent rule authority. For domain-specific procedural runbooks, use on-demand `skills/<name>/SKILL.md` loaded via progressive disclosure.
