---
name: architecture
description: System architecture, first-principles design, dialectic trade-off analysis, and blast-radius evaluation. Use when designing subsystems, making high-impact structural decisions, resolving open design ambiguity, or evaluating competing architectural options.
---

# System Architecture & First-Principles Design

Use this playbook for structural design, cross-boundary contracts, major refactors, and high-stakes trade-off decisions.

---

## 1. Context Grounding Ladder

Before proposing an architecture, ground yourself in order:

1. **Codebase Reality**: Read the actual source modules, imports, and build configs. Never guess how a module works from memory.
2. **Project Specifications**: Check root `README.md` (and `DESIGN.md`, `SECURITY.md`, `ROADMAP.md` where present).
3. **Living Memory**: Query `developer-database` (`search` for active patterns/rules, `search_archive` for past architectural decisions).
4. **Current Docs**: Verify external library/framework behavior via `context7` or `search_web` rather than relying on stale training memory.

---

## 2. Socratic Alignment (When Requirements Are Open)

When an architectural direction has multiple valid paths or open constraints:

1. **Ground First**: Never ask the user something answered by existing files or specs—cite what you found (_"I see X in `file.js`; keep or replace?"_).
2. **One Branch at a Time**: Walk the decision tree sequentially with a `(Recommended)` option and brief rationale rather than dumping a wall of questions.
3. **Exhaust Branches**: Resolve edge cases and branch conditions before locking the design.
4. **Playback Summary**: Before transitioning to implementation, verify alignment on `GOAL`, `INPUT`, `PROCESS`, `OUTPUT`, and `EDGE CASES`.

---

## 3. First Principles & Inversion Thinking

1. **Strip Accidental Complexity**: Separate true runtime/domain constraints from legacy conventions or speculative abstractions.
2. **Inversion**: Ask _"What assumptions or coupling would guarantee failure, data corruption, or high maintenance cost?"_ and eliminate those failure modes first.
3. **Theory of Constraints & 80/20**: Identify the critical-path bottleneck (e.g., schema contract, state boundary, concurrency invariant) and lock it down before designing peripheral helpers or UI.

---

## 4. Dialectic Synthesis & Epistemic Cartography

Avoid jumping to the first plausible pattern or settling on vague compromises.

### Dialectic Loop

```text
[Thesis: Proposed Pattern]  vs.  [Antithesis: Competing Pattern / Edge Case]
                                 │
                                 ▼
                    [Synthesis: Conditional Design]
```

Conclude evaluations with explicit conditional boundaries rather than generic "winners":

- _"Choose X when `[constraint A]`; choose Y when `[constraint B]`."_

### Evidentiary Tiers

Separate claims into four tiers so assumptions never masquerade as facts:

1. **Hard Constraints**: Explicit user requirements, runtime limits, and non-negotiable invariants.
2. **Empirical Evidence**: Observed code behavior, benchmarks, or docs. When synthesizing patterns from examples, count occurrences (`seen: N of M`) and hold out 1–2 cases to verify against unseen reality.
3. **Inferences**: Logical extrapolations—label explicitly as inferred until verified.
4. **Unknowns**: Unverified variables—state the exact measurement or spike needed to settle each one.

### Stress-Test Lenses

- **Assumption Reframing**: Check for XY problems, false dichotomies, or flawed premises.
- **Failure & Maintenance Audit**: Compare options head-to-head on identical axes (coupling, failure modes, testability, migration cost).

---

## 5. Blast Radius & Migration Slicing

Evaluate ripple effects across four boundaries before editing:

1. **State & Data**: Schema versioning, migrations, or local storage/IndexedDB compatibility.
2. **Security & Trust**: Untrusted input boundaries, sanitization, or credential exposure.
3. **Performance**: Bundle size, startup cost, memory, or render budgets.
4. **Downstream Consumers**: All callers, barrels, and tests affected (update all consumers cleanly; avoid legacy shims).

### Impact Matrix & Vertical Slices

Map changes cleanly before execution:

| File | Action (`[NEW]`, `[EDIT]`, `[DELETE]`) | Rationale |
| :--- | :------------------------------------- | :-------- |

Break large migrations into independently testable vertical slices of **$\le 5$ files** each, verifying tests pass after every slice. If an approach breaks down mid-flight, revert cleanly (`git checkout -- <file>`) rather than layering patches over a broken state.
