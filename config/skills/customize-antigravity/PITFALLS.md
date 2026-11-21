# Customize Antigravity Known Pitfalls & Failure Parables

> **Tier 2 Empirical Scar Tissue**: Read this ledger before modifying, creating, or auditing any skills, hooks, rules, or plugins. When an entry reaches 4 to 5 recurring failures, graduate it into an automated check in `scripts/audit-customizations.js` or a workspace CI gate.

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

### `[PF-003]` Broad Domain Grab & Catch-All Over-Triggering (Occurrences: 3 (Enforced by audit-customizations.js))

- **Trigger**: Authoring descriptions with broad, generic verbs (e.g. *"Use when writing code, reviewing style, or creating files in JavaScript"*).
- **Wrong Behavior (Root Cause)**: The skill matches 100% of user sessions, burning thousands of tokens on irrelevant procedural directives, polluting conversation context, and applying incorrect domain constraints.
- **Correct Behavior (Prevention Rule)**: Constrain the capability statement with domain-specific terms, append concrete `"Use when..."` imperatives, and declare explicit `"Do NOT use for..."` negative boundaries pointing to competing sibling skills.

---

### `[PF-004]` Multi-Hop Reference Traversal Failure (Occurrences: 3)

- **Trigger**: Structuring skill documentation across chained nested files (`SKILL.md` -> `references/a.md` -> `references/b.md`).
- **Wrong Behavior (Root Cause)**: Probabilistic agents routinely halt after following the first reference link, never opening the second-hop leaf and hallucinating missing parameters.
- **Correct Behavior (Prevention Rule)**: Enforce the **One-Hop Reference Boundary**. `SKILL.md` must link directly to targeted reference leaves (e.g. `references/lock-matrix.md`) or executable scripts (`scripts/check.js`).

---

### `[PF-005]` Rule Fragmentation vs. Sovereign Single-Authority (Occurrences: 3 (Enforced by audit-customizations.js))

- **Trigger**: Creating ad-hoc `.agents/rules/*.md` files or standalone instruction files scattered throughout subdirectories.
- **Wrong Behavior (Root Cause)**: Multiple scattered rule files lead to conflicting constraints, rule drift, and silent override bugs during directory traversal.
- **Correct Behavior (Prevention Rule)**: Maintain root `GEMINI.md` / `AGENTS.md` as the sole persistent rule authority (keeping each rule file well under the `24,000`-byte runtime limit). For domain-specific procedural runbooks, use on-demand `skills/<name>/SKILL.md` loaded via progressive disclosure.

---

### `[PF-006]` Windows UTF-8 BOM Crash in Go Parser (Occurrences: 3 (Enforced by audit-customizations.js))

- **Trigger**: Generating or editing `plugin.json`, `SKILL.md`, or `agents/*.md` on Windows using PowerShell `Set-Content`, `Out-File`, or standard redirection (`>`).
- **Wrong Behavior (Root Cause)**: Windows PowerShell prepends a UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`) or writes UTF-16LE. Antigravity's Go language server fails to parse the JSON or YAML frontmatter, silently dropping the plugin, skill, or agent from discovery without an explicit compiler error.
- **Correct Behavior (Prevention Rule)**: Always write files as clean UTF-8 without BOM using `write_file`/`edit_file`, Node `fs.writeFileSync(..., 'utf8')`, Python `open(path, 'w', encoding='utf-8')`, or explicit .NET `New-Object System.Text.UTF8Encoding $false`.

---

### `[PF-007]` Plugin Rules Discovery Invariant (Occurrences: 3)

- **Trigger**: Bundling persistent prompt rules inside a plugin under `plugins/<name>/rules/` using arbitrary filenames (e.g. `rules/orchestrator.md`).
- **Wrong Behavior (Root Cause)**: The plugin scanner specifically binds `rules/AGENTS.md` (or `rules/GEMINI.md`). Custom or arbitrary filenames in `rules/` are ignored during discovery, resulting in silent rule omission.
- **Correct Behavior (Prevention Rule)**: Always name plugin rules `rules/AGENTS.md`. Never place arbitrary `.md` filenames in the plugin's `rules/` directory.

---

### `[PF-008]` Non-Standard Frontmatter Property Suppression (Occurrences: 3 (Enforced by audit-customizations.js))

- **Trigger**: Adding custom or third-party frontmatter fields to `SKILL.md` or `agents/*.md` (e.g. `disable-model-invocation: true`, `license: Apache-2.0`, `user-facing: true`).
- **Wrong Behavior (Root Cause)**: Antigravity validates frontmatter against its internal schema. Unrecognized fields trigger compliance findings or risk parser rejection/suppression.
- **Correct Behavior (Prevention Rule)**: Restrict `SKILL.md` and `agents/*.md` frontmatter strictly to `name` and `description`.

---

### `[PF-009]` One-Shot Skill Authoring from Memory (Polanyi's Paradox) (Occurrences: 2)

- **Trigger**: Authoring a procedural skill from a blank prompt or human memory without grounding in an executed session.
- **Wrong Behavior (Root Cause)**: People remember an idealized version of their workflow and omit tacit judgment calls, intermediate validation checks, and edge-case exceptions (Polanyi's Paradox). The resulting skill fails in practice.
- **Correct Behavior (Prevention Rule)**: Always use one of the 4 verified authoring branches: (A) Post-Task Transcript Extraction (`transcript.jsonl` replay), (B) Example-Driven Reverse-Engineering (`seen`/`inferred`/`unknown` tags with blind holdouts), (C) Idea-First Socratic Interview (`/grill-me` process probe), or (D) Deletion-Test Pruning + Clean-Room Subagent Eval.

---

### `[PF-010]` Broken `customization://` Links & Restricted Plugin RPCs (Occurrences: 2)

- **Trigger**: Linking to installed plugins in chat or attempting to toggle/install plugins programmatically.
- **Wrong Behavior (Root Cause)**: Keying links on `plugin.json`'s `name` instead of the install directory name `dir` (`customization://<dir>`), hand-editing `~/.gemini/config/config.json` (risks clobbering concurrent `userSettings`), or calling restricted language server mutation RPCs (`JetboxWriteState`, `DeletePlugin`, `InstallCustomization`) from `run_command`.
- **Correct Behavior (Prevention Rule)**: Always resolve `dir` from `lsrpc GetAllPlugins` (the last path segment) for `customization://<dir>` links. Never call restricted mutation RPCs or hand-edit `config.json`; guide the user to the UI link or render `<plugin-card catalog-id="...">`.

---

### `[PF-011]` Unfiltered `GetAllPlugins` Context Flood & Relative MCP `cwd` (Occurrences: 2)

- **Trigger**: Querying installed plugins via Language Server Connect RPC, or declaring relative working directories in plugin `mcp_config.json`.
- **Wrong Behavior (Root Cause)**: Reading `lsrpc GetAllPlugins` unfiltered inlines the full text of every installed `SKILL.md`, flooding context with tens of thousands of tokens. In plugin `mcp_config.json`, relative `cwd` paths resolve against the plugin directory and receive no variable substitution.
- **Correct Behavior (Prevention Rule)**: Always pipe `lsrpc GetAllPlugins` through `jq` to extract only metadata (`name`, `dir`, `disabled`, `skills`, `mcp`). Make every `cwd` in `mcp_config.json` absolute, and declare any `${X}` placeholders in `variables`.

---

### `[PF-012]` In-Session `hooks.json` Path Caching on Hook Directory Renames (Occurrences: 1)

- **Trigger**: Renaming or moving a skill directory referenced by `.agents/hooks.json` (or plugin `hooks.json`) while an active Antigravity session is running.
- **Wrong Behavior (Root Cause)**: Expecting live edits to `hooks.json` to take effect immediately on the next `run_command` call, or adding temporary backwards-compatibility shims at the old path to silence `MODULE_NOT_FOUND`. Antigravity loads and caches `hooks.json` at session startup, so subsequent `run_command` calls in the same session still execute the old cached hook path.
- **Correct Behavior (Prevention Rule)**: Update `gates.js` and regenerate/update `hooks.json` on disk cleanly (zero compatibility shims), complete remaining file edits (`write_file` / `edit_file` do not fire `run_command` hooks), and instruct the user to reload the Antigravity window / start a fresh session before running verification commands.
