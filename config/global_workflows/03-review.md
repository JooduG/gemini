---
name: 03-review
description: Comprehensive review workflow — supports targeted code & wiring inspections as well as full 5-axis track quality gates.
---

# 🔍 Review Protocol (`/review` / `/03-review`)

> **Objective**: Perform a clinical, forensic dissection of code, wiring, or completed milestone tracks. Inspect system wiring, detect latent bugs, verify architectural compliance (Svelte 5 Runes & P4 Pre-Beta Purity), and propose high-leverage improvements.

---

## 1.0 Adaptive Operational Modes

This workflow adapts automatically to the user's intent and active scope:

| Trigger / Context                                            | Selected Mode                        | Scope & Objective                                                                                                          |
| :----------------------------------------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Ad-Hoc / Targeted** (`/review [file/diff]`)                | **Mode A: Code & Wiring Inspection** | Deep dive into specific files, recent git diffs, or uncommitted work. Focus on bugs, wiring, edge cases, and code quality. |
| **Track / Milestone Gate** (`/03-review` or `/review track`) | **Mode B: Five-Axis Track Gate**     | Full quality audit of a completed track blueprint in `tasks/FUTURE.md` across the 5 sovereign axes before `/04-release`.   |

---

## 2.0 Execution Protocols

### Mode A: Targeted Code & Wiring Inspection

#### 1. Wiring & Integration Integrity

- **Unidirectional Flow**: Trace data flow downward strictly (`src/ui` ➔ `src/state` ➔ `src/intelligence` ➔ `src/data` ➔ `src/platform`). No upward layer imports.
- **Reactive Lifecycle**: Verify Svelte 5 Runes bindings (`$state()`, `$derived()`, `$effect()`), event listeners, and async subscriptions are properly initialized and torn down.
- **Dependency Health**: Confirm imports/exports resolve cleanly with zero circular dependencies or broken barrels.

#### 2. Bug & Edge-Case Detection

- **Defensive Resilience**: Check for `null`/`undefined` hazards, unhandled promise rejections, race conditions, or state desyncs.
- **Resource Leaks**: Guard against untracked timers, unclosed `AudioContext` nodes, or unbounded caches (e.g. bounded LRU limits).
- **Silent Failures**: Audit try/catch blocks to ensure errors are meaningfully surfaced or recovered rather than swallowed silently.

#### 3. Sovereign Standards & Lexical Compliance

- **Svelte 5 Purity**: Runes exclusively (`$state`, `$derived`, `$effect`, `{@render snippet}`). Strictly zero legacy `export let`, `$:`, `writable()`, or `<slot />`.
- **Nomenclature Mandate**: Strict kebab-case files, PascalCase components, snake_case variables, and Full-Name & Anti-Abbreviation compliance.
- **Pre-Beta Purity (P4)**: Zero backwards-compatibility ballast, legacy aliases, deprecated wrappers, or schema shims. Refactor consumers immediately.

#### 4. Undeniable Architectural Improvements

- Spot high-leverage simplifications, duplicate logic, or performance bottlenecks.
- Focus on tangible, clean architecture upgrades; avoid superficial style nitpicks.

---

### Mode B: Five-Axis Track Quality Gate

When auditing a completed track blueprint (`tasks/FUTURE.md`):

1. **Discovery & Diff**:
   - Apply **[SOP-08: Review Forensics](../skills/planning/SKILL.md#L169)**. Resolve the track's commit revision range from the first checkpoint to the final SHA in `tasks/FUTURE.md`.
   - Run `git diff --shortstat` and inspect the diff payload.

2. **The Five Sovereign Axes**:
   - **Axis 1: Sovereignty (Intent Alignment)**: Does the implementation satisfy all success criteria in `tasks/FUTURE.md`? Are all steps marked `[x] <sha>`?
   - **Axis 2: Infrastructure & Architecture (`GEMINI.md` & `DESIGN.md`)**: Strict adherence to layer boundaries, Svelte 5 Runes, and design token sovereignty.
   - **Axis 3: Compliance & Security (`GEMINI.md`)**: `DOMPurify` on all external inputs, zero committed secrets, low-cardinality logging.
   - **Axis 4: Intelligence & Verification (TDD Proof)**: Verify Red-Green-Refactor test coverage. Ensure all code changes are paired with unit/integration tests.
   - **Axis 5: Sensory & Aesthetics**: Fluid micro-motion, zero raw CSS hex/pixel values, and performance budget compliance (LCP < 2.5s).

---

## 3.0 Verification Step

Establish baseline health with the active test suite:

```bash
npm run verify
```

_(Or `npm run test:unit` for fast targeted diagnostics)._

---

## 4.0 Report Formats

### For Mode A (Targeted Review)

```markdown
## 🔍 Code & Wiring Review Summary

- 🔴 **Critical / Broken Wiring**: [Real bugs, unhandled crashes, or disconnected logic]
- 🟡 **Subtle Risks & Edge Cases**: [Race conditions, missing guards, or state desyncs]
- 💡 **Undeniable Improvements**: [High-leverage refactorings, cleaner abstractions, or performance gains]
- ✅ **Strengths**: [Solid wiring, clean Runes, robust test coverage]
```

### For Mode B (Track Quality Gate)

```markdown
## 📋 Sovereign Track Review Summary

## ✅ Audit Result: [Pass / Fail]

| Axis               | Status      | Findings  |
| :----------------- | :---------- | :-------- |
| **Sovereignty**    | [Pass/Fail] | [Summary] |
| **Infrastructure** | [Pass/Fail] | [Summary] |
| **Compliance**     | [Pass/Fail] | [Summary] |
| **Intelligence**   | [Pass/Fail] | [Summary] |
| **Sensory**        | [Pass/Fail] | [Summary] |

## 🔍 Detailed Findings & Next Actions

- [Findings with relative file links and exact line references]
```
