# Two-Tier Router Architecture & Lifecycle Governance

> **Authority: Tier 3 Reference Guide**  
> *"Route before you execute. Never allow probabilistic models to infer intent, select tools, and draft code in a single unconstrained pass."*

---

## 1. When to Employ a Meta-Skill Router

When a workspace library grows beyond 20 to 30 skills, flat Level 1 discovery encounters token overhead and semantic collisions between sibling capabilities. A **Two-Tier Meta-Skill Router** (`skill-router/SKILL.md`) resolves this by acting as a deterministic dispatcher across specialized domain skills.

### Architectural Core Rules

1. **Exploration-First Sequencing (Anti-Premature-Anchoring)**:
   * **Mandate**: Always inspect the project directory structure, `package.json`, and local configuration files *before* invoking a skill or reading documentation leaves.
   * **Failure Mode Prevented**: Loading generic documentation templates prematurely anchors the model's pattern-matching, causing it to overlook repo-specific wrappers and local configurations.
2. **Single Primary Skill per Turn**:
   * Direct the turn to one specialized skill rather than loading multiple bulky `SKILL.md` bodies into the same context window.
3. **Execution Modes**:
   * `[auto]`: Narrow, read-only, or idempotent domain skills triggered automatically by intent matching.
   * `[human]`: Stateful, destructive, or ritual workflows (e.g. database migrations, deployment pushes, session wrap-ups) requiring explicit operator confirmation before loading.

---

## 2. Meta-Skill Router Specification (`skill-router/SKILL.md`)

```markdown
---
name: skill-router
description: Master routing index and control-plane dispatcher for workspace agent skills. Use when orienting a new task, when unsure which specialized workflow applies, or when the operator asks "which skill should I use for X?"
---

# Workspace Meta-Skill Router

## Routing Protocol

1. **Explore Before Routing**: Inspect target directories and active files before loading domain skills.
2. **Evaluate Boundaries**: Check the *When to Reach & Boundary Tiebreaker* column below to select the single highest-confidence skill.

## Domain Routing Table

| Skill Identifier | Mode | Primary Capability | When to Reach & Boundary Tiebreaker |
| :--- | :--- | :--- | :--- |
| `reorient` | `[auto]` | Post-compaction context recovery | Reach immediately after context compaction or when task state is lost. |
| `postgres-migration` | `[auto]` | Safe DDL schema changes & locks | Reach when editing `db/migrations/**`. Tiebreaker vs `query-tuning`: use migration for DDL, query-tuning for SELECTs. |
| `deslop` | `[human]` | Diff hygiene & boilerplate linter | Reach before committing a PR or completing a large refactor. |
```

---

## 3. Context Compaction & Lifecycle Re-Anchoring

### The Compaction Hazard

During long-running sessions, context auto-compaction summarizes conversation history. In standard setups, this summarizes away previously loaded `SKILL.md` runbooks, leaving the model with amnesia regarding non-negotiable rules, exit contracts, or safety checklists.

### Antigravity Lifecycle Protection Mechanisms

1. **Top-100-Line Front-Loading**:
   * All critical constraints, safety guardrails, and dispatch tables must reside within the **first 100 lines** of `SKILL.md`. When compaction truncates active skills to their top tokens, essential invariants survive.
2. **Pre-Invocation State Serialization (`hooks.json`)**:
   * Leverage Antigravity lifecycle hooks to serialize active file paths, task goals, and uncommitted state into `.agents/scratchpad/compact-state.json`.
3. **Reorientation Workflow (`reorient`)**:
   * When returning to a compacted session, run a fast read-only reorientation sequence:
     1. Read active task brief from `.agents/scratchpad/compact-state.json`.
     2. Inspect current `git status --short`.
     3. Emit a terse 5-line orientation block (role, current task, active blockers, next action).
     4. Halt without side effects, returning execution control to the operator.
