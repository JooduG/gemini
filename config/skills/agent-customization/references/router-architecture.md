# Sovereign Governance Router Architecture & Lifecycle

> **Authority: Tier 3 Reference Guide**  
> _"Route before you execute. Never allow probabilistic models to infer intent, select tools, and draft code in a single unconstrained pass."_

---

## 1. When to Employ a Meta-Skill Router

## 1. Purpose of Meta-Governance & Intent Triage

When a workspace library grows beyond 20 to 30 skills, flat Level 1 discovery encounters token overhead and semantic collisions between sibling capabilities. A **Two-Tier Meta-Skill Router** (`skill-router/SKILL.md`) resolves this by acting as a deterministic dispatcher across specialized domain skills.
When an agent workspace grows beyond simple single-step commands, flat execution encounters ambiguity traps and token overhead. Rather than allowing an agent to jump directly from a prompt into writing speculative code, a **Meta-Governance Conductor** (governed by `core-orchestration` and `rules/AGENTS.md`) resolves intent and routes work deterministically.

### Architectural Core Rules

1. **Exploration-First Sequencing (Anti-Premature-Anchoring)**:
   - **Mandate**: Always inspect the project directory structure, `package.json`, and local configuration files _before_ invoking a skill or reading documentation leaves.
   - **Mandate**: Always inspect the project directory structure, `package.json`, and local configuration files _before_ invoking domain skills or reading heavy documentation leaves.
   - **Failure Mode Prevented**: Loading generic documentation templates prematurely anchors the model's pattern-matching, causing it to overlook repo-specific wrappers and local configurations.
2. **Single Primary Skill per Turn**:
   - Direct the turn to one specialized skill rather than loading multiple bulky `SKILL.md` bodies into the same context window.
3. **Execution Modes**:
   - `[auto]`: Narrow, read-only, or idempotent domain skills triggered automatically by intent matching.
   - `[human]`: Stateful, destructive, or ritual workflows (e.g. database migrations, deployment pushes, session wrap-ups) requiring explicit operator confirmation before loading.
4. **Ambiguity Gating ($A1$ to $A5$)**:
   - Grade intent clarity before decomposing tasks. If ambiguity is high ($A \ge 3$), halt immediately and invoke interactive `ask_question` rather than guessing or picking silently.
5. **Cynefin Complexity Routing (Levels 1 to 3)**:
   - **Level 1 (Simple / Low Risk)**: Route to `core-operations` / `core-operator` subagent for surgical TDD execution.
   - **Level 2 (Complicated / Medium Risk)**: Route to `core-tactics` / `core-tactician` subagent to author an implementation plan artifact.
   - **Level 3 (Complex / High Risk)**: Route to `core-strategy` / `core-strategist` subagent for architectural blueprinting.

---

## 2. Meta-Skill Router Specification (`skill-router/SKILL.md`)

## 2. Governance Triage Specification (`core-orchestration`)

```markdown
---
name: skill-router
description: Master routing index and control-plane dispatcher for workspace agent skills. Use when orienting a new task, when unsure which specialized workflow applies, or when the operator asks "which skill should I use for X?"
---

The Sovereign Governance suite (`core-governance-plugin`) organizes cognitive flow into four disciplined tiers:

# Workspace Meta-Skill Router

| Operational Tier | Discipline (Noun Skill) | Slash Command         | Persona (Subagent) | Scope & Risk Matrix                                           |
| :--------------- | :---------------------- | :-------------------- | :----------------- | :------------------------------------------------------------ |
| **Meta-Gov**     | `core-orchestration`    | `/core-orchestration` | Primary Conductor  | Ambiguity gating ($A1$–$A5$), Cynefin triage, loop breaking   |
| **Strategy**     | `core-strategy`         | `/core-strategy`      | `core-strategist`  | Level 3: Architecture blueprints, RFCs, system topology       |
| **Tactics**      | `core-tactics`          | `/core-tactics`       | `core-tactician`   | Level 2: Multi-step plans, Sequential Thinking, roadmap delta |
| **Operations**   | `core-operations`       | `/core-operations`    | `core-operator`    | Level 1: Surgical TDD execution, unit tests, code commits     |

## Routing Protocol

1. **Explore Before Routing**: Inspect target directories and active files before loading domain skills.
2. **Evaluate Boundaries**: Check the _When to Reach & Boundary Tiebreaker_ column below to select the single highest-confidence skill.

## Domain Routing Table

| Skill Identifier     | Mode      | Primary Capability                | When to Reach & Boundary Tiebreaker                                                                                   |
| :------------------- | :-------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `reorient`           | `[auto]`  | Post-compaction context recovery  | Reach immediately after context compaction or when task state is lost.                                                |
| `postgres-migration` | `[auto]`  | Safe DDL schema changes & locks   | Reach when editing `db/migrations/**`. Tiebreaker vs `query-tuning`: use migration for DDL, query-tuning for SELECTs. |
| `deslop`             | `[human]` | Diff hygiene & boilerplate linter | Reach before committing a PR or completing a large refactor.                                                          |
```

---

## 3. Context Compaction & Lifecycle Re-Anchoring

### The Compaction Hazard

During long-running sessions, context auto-compaction summarizes conversation history. In standard setups, this summarizes away previously loaded `SKILL.md` runbooks, leaving the model with amnesia regarding non-negotiable rules, exit contracts, or safety checklists.

### Antigravity Lifecycle Protection Mechanisms

1. **Top-100-Line Front-Loading**:
   - All critical constraints, safety guardrails, and dispatch tables must reside within the **first 100 lines** of `SKILL.md`. When compaction truncates active skills to their top tokens, essential invariants survive.
2. **Pre-Invocation State Serialization (`hooks.json`)**:
   - Leverage Antigravity lifecycle hooks to serialize active file paths, task goals, and uncommitted state into `.agents/scratchpad/compact-state.json`.
3. **Reorientation Workflow (`reorient`)**:
   - When returning to a compacted session, run a fast read-only reorientation sequence:
     1. Read active task brief from `.agents/scratchpad/compact-state.json`.
     2. Inspect current `git status --short`.
     3. Emit a terse 5-line orientation block (role, current task, active blockers, next action).
     4. Halt without side effects, returning execution control to the operator.
4. **Epistemic Promotion Pipeline**:
   - Candidate learnings append to Tier 1 scratchpad (`worklog.md`). Recurring empirical scar tissue is captured in co-located `PITFALLS.md` (Tier 2). When a pattern recurs 4–5 times, it graduates into verified canon (`GEMINI.md`) or automated CI tests (Tier 3).
