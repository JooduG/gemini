---
name: customize-antigravity
description: >-
  Authoring, epistemic governance, and 5-tier auditing for Antigravity custom skills,
  PITFALLS.md ledgers, rules, and plugins. Use when creating or refactoring skills,
  maintaining Tier 2 PITFALLS.md scar tissue, running audit-customizations.js, or
  enforcing 2-field frontmatter and Trigger Triads. Do NOT use for platform discovery
  basics (use built-in `agy-customizations`), plugin lifecycle management (use built-in
  `plugin`), scheduled tasks (use `automation`), or ad-hoc coding tasks.
---

# Customize Antigravity (Governance & Authoring)

Extends Antigravity's built-in customization platform (`agy-customizations`, `plugin`, `automation`, `ui-plugin-navigation`) with your custom authoring standards, Three-Tier Epistemic Promotion Pipeline, and deterministic 5-tier detox tooling.

## 1. Mandatory Top Invariants

1. **Read Co-Located Scar Tissue First**: Inspect [PITFALLS.md](./PITFALLS.md) before modifying or auditing any `SKILL.md`, `GEMINI.md`, `hooks.json`, or `plugin.json` (`[PF-001]`–`[PF-012]`).
2. **Strict 2-Field Frontmatter (`[PF-008]`)**: `SKILL.md` and `agents/*.md` allow strictly `name` and `description` (wrapped with `>-` when multi-line or containing colons). Never add `license`, `disable-model-invocation`, `subagent`, or HTML comment header/footer blocks to frontmattered files.
3. **Trigger Triad (`[PF-001]` / `[PF-003]`)**: Pack capability + `"Use when..."` lexical bait + `"Do NOT use for..."` sibling exclusions into `description`. Never leak ordered workflow steps into frontmatter.
4. **One-Hop Reference Boundary (`[PF-004]`)**: Link directly from `SKILL.md` to leaf files in `references/` or executable scripts in `scripts/`. Keep critical invariants in the top 100 lines to survive compaction.
5. **Rule Byte Ceiling (`24,000` Bytes)**: Keep each always-on `GEMINI.md` file well under Antigravity's `24,000`-byte cap (`agy-customizations/docs/rules.md`) so the tail is never silently truncated. Keep rules consolidated in root `GEMINI.md` (no scattered `.agents/rules/*.md` `[PF-005]`).
6. **Direct External Archival**: Retire superseded skills and references directly into `~/.gemini/archive/YYYY-MM/` — never stage `backup/` or `detox-backup/` folders inside `~/.gemini/config/` where discovery scanners traverse.

## 2. Built-in Platform Delegation (Zero Duplication)

- **Discovery, Precedence, Rules, Hooks & MCP Config Format**: Provided by built-in `agy-customizations` and `antigravity_guide`.
- **Plugin Lifecycle (`lsrpc GetAllPlugins`, `customization://<dir>`, `<plugin-card>`, `plugin.json`)**: Provided by built-in `plugin`.
- **Sidecar UI Navigation (`sidecar://`) & Scheduled Crons**: Provided by built-in `ui-plugin-navigation` and `automation`.

## 3. Custom Authoring & Governance Reference Map (1-Hop)

- **Skill Authoring, 4-Branch Extraction & Deletion Test**: See [references/skills.md](./references/skills.md).
- **Three-Tier Epistemic Promotion & CI Graduation (`PITFALLS.md` -> CI at 4–5 occ.)**: See [references/epistemic-management.md](./references/epistemic-management.md).
- **Two-Tier Meta-Skill Router & Compaction Reorientation**: See [references/router-architecture.md](./references/router-architecture.md).
- **5-Layer Detox & `~/.gemini/archive/` Playbook**: See [references/audit-and-detox.md](./references/audit-and-detox.md).
- **File Architecture & Keep-a-Changelog Templates**: See [references/file-architecture.md](./references/file-architecture.md).
- **Deterministic 5-Tier Scanner**: Run `node ~/.gemini/config/skills/customize-antigravity/scripts/audit-customizations.js --workspace "<repo>" --summary --format json` (see [scripts/audit-customizations.js](./scripts/audit-customizations.js)).

## 4. The 4-Branch Skill Authoring & Extraction Router

Never author procedural skills from ungrounded memory (`[PF-009]`):

1. **Branch A (Post-Task Transcript Replay)**: Extract real inputs, steps, pass/fail gates, and exceptions from `transcript.jsonl` after a successful run.
2. **Branch B (Example-Driven Reverse-Engineering)**: Quantify `seen: N of M` patterns across best/worst examples, hold back `1–2` blind holdouts, and emit `scripts/validate.js` when `>= 3` rules are deterministic.
3. **Branch C (Idea-First `/grill-me`)**: Ground in workspace files first, ask one targeted question at a time with a recommended default, and confirm `GOAL / INPUT / PROCESS / OUTPUT / EDGE CASES`.
4. **Branch D (Deletion-Test Pruning & Clean-Room Eval)**: Strip every paragraph the base model already knows from pre-training, then test against a clean-context `research` subagent.

## 5. Three-Tier Skill Discovery Gate

Before authoring a new global skill:

1. Check existing skills/plugins via `lsrpc GetAllPlugins | jq` (built-in `plugin` recipe).
2. Search Antigravity Marketplace via `search_marketplace` and offer `<plugin-card catalog-id="...">`.
3. If pulling from `skills.sh` (`npx skills find`), sanitize to strict 2-field YAML frontmatter, complete Trigger Triad, clean UTF-8 without BOM (`[PF-006]`), and co-located `PITFALLS.md`.
