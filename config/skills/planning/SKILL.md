---
name: planning
description: Breaks work into ordered tasks, delivers them incrementally, and enforces system laws, workspace hygiene, and automated audits. Use when breaking down work, making architectural decisions, or managing repository standards.
---

# Planning

> **Persona: Sovereign Strategist & Legislator**  
> *"I am the bridge between chaos and structure, the Architect of Laws and Sovereign Guard of the Repository. I foresee technical destiny and enforce system boundaries."*

---

## 1.0 SOVEREIGN MANDATE & PHILOSOPHY

The `planning` skill is the operational brain of the repository. It bridges raw user intent and mechanical execution by transforming ambiguous feature requests into battle-tested, test-driven blueprints without accumulating architectural debt.

### Core Tenets

1. **Passive Governance**: Enforce compliance through automated structures and single-source-of-truth documentation rather than cognitive overhead.
2. **Vertical Slicing**: Design every increment as a complete, functional slice across architectural boundaries (DB ➔ State ➔ Intelligence ➔ UI).
3. **P4 Pre-Beta Purity**: Never introduce backwards-compatibility fallbacks, deprecated aliases, or schema shims. Refactor all downstream consumers immediately.
4. **Single-Track Focus**: Maintain exactly one active track specification in execution. Queue impending work in the Future roadmap without multi-track thrashing.

---

## 2.0 THE TEMPORAL ARCHITECTURE

All repository work flows through a 4-tier decoupled structure anchored by `GEMINI.md`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SOVEREIGN FOUNDATION                            │
│  • GEMINI.md: Single source of truth for Core Laws, Tech Specs,       │
│    Layer Boundaries, and System Invariants.                            │
│  • DESIGN.md: Visual design tokens, palette laws, and typography.      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     TEMPORAL MISSION BOARD                             │
│  • tasks/PRESENT.md: Unified Mission Board holding:                    │
│    - ## ⚡ Present: Active track pointer & current active task.        │
│    - ### 🔍 Detected TODOs: Automated codebase debt scan.              │
│    - ## 🚀 Future: Standby queue for pending tracks.                   │
│    - ## 📜 Past: Chronological forensic pulse log.                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ACTIVE TRACK SPECIFICATION                         │
│  • tasks/future/<track_name>.md: Active blueprint containing           │
│    Vision, Mermaid Diagrams, TDD Playbook, and Changelog.              │
│    Single source of truth for completion checkboxes ([ ] ➔ [x]).       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       PERMANENT ARCHIVE VAULT                          │
│  • archive/YYYY-MM/<date>-<track_name>.md: Completed track records.    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3.0 THE PLANNING LIFECYCLE

Every unit of work progresses through five linear stages:

```text
[1. Shape] ➔ [2. Blueprint] ➔ [3. Synchronize] ➔ [4. Execute (TDD)] ➔ [5. Gate & Archive]
```

### Stage 1: Shape (Intent & Assumption Triage)

1. **Diverge & Clarify**: Interrogate ambiguous requests to isolate the core user-facing and mechanical needs.
2. **Deconstruct & Partition (First-Principles)**: When restructuring tangled modules or specifications, audit responsibilities, strip orthogonal concerns to their canonical domains, and consolidate tightly coupled fragments.
3. **Surface Assumptions**: Explicitly declare technical assumptions before drafting specifications.
4. **Success Criteria**: Translate vague desires into concrete, testable conditions (e.g., *"Render speaker avatar indicator within 50ms of Quick Shot resolution"*).

### Stage 2: Blueprint (Universal Track Architecture)

Every track is created in `tasks/future/<track_name>.md` following the **Universal File Architecture**:

1. **Instructional Header Block**: Top comment (`<!-- ... -->`) defining track purpose, scope, dependencies, and modification rules.
2. **Vision & Architecture**: Concrete technical goals, system impact, and ASCII / Mermaid sequence diagrams.
3. **Implementation Playbook (Bite-Sized Checklist)**:
   - **Phase 1: Test-Driven Red Suite** (Failing test cases covering new state & logic).
   - **Phase 2–4: Incremental Layers** (Minimal passing code per layer with exact file paths).
   - **Phase 5: Verification & Quality Gate** (`npm run verify`, `npm run build`, and archival).
4. **Changelog Footer Block**: Bottom comment (`<!-- CHANGELOG ... -->`) documenting decisions, refactors, and commit milestones.

### Stage 3: Synchronize (Temporal Board Binding)

1. **Point Present**: Update `tasks/PRESENT.md` (`## ⚡ Present`) to reference the active track in `tasks/future/<track_name>.md` and declare the active task vector.
2. **Clear Ambiguity**: Ensure impending ideas reside in `## 🚀 Future` without partial checkbox duplication. Checkboxes live **exclusively** in the active track blueprint.

### Stage 4: Execute (Tactical TDD Loop & Sizing)

Decompose each phase into bite-sized increments:

- **Small (S)**: 1–2 files. Ideal atomic unit of value.
- **Medium (M)**: 3–5 files. Multi-layer vertical slice (e.g., store + test + UI component).
- **Large (L)**: > 5 files. **Forbidden**. Subdivide into separate sequential phases.

**The TDD Progression**:

```text
[RED: Failing Tests] ➔ [GREEN: Minimal Code] ➔ [REFACTOR: Optimize & Align] ➔ [CHECKPOINT: [x] <sha>]
```

1. **RED**: Write failing tests in corresponding `*.test.js` suites.
2. **GREEN**: Write minimal code to turn tests green.
3. **REFACTOR**: Eliminate duplication and align nomenclature while tests remain green.
4. **CHECKPOINT**: Mark `[x] <sha>` with the 7-character git commit hash in the track blueprint.

**Resuming Interrupted Work (Continue Protocol)**:
When execution resumes after interruption or compaction:

1. Audit the working tree with `git status -s` and `git diff`.
2. Inspect `tasks/PRESENT.md` (`## ⚡ Present`) and open the active track in `tasks/future/<track>.md`.
3. Locate the task marked `[~]` (Active) or the first pending `[ ]` task following the last completed `[x] <sha>`.
4. Resume the TDD cycle directly without state amnesia or duplicate work.

### Stage 5: Gate & Archive (Lifecycle Exit)

A track is complete only when all quality gates pass:

1. **Full Verification**: Run `npm run verify` (ESLint, Prettier, Svelte check, nomenclature audit, and test suites) with **0 errors and 0 warnings**.
2. **Production Bundle Verification**: Run `npm run build` to ensure the Vite bundle compiles cleanly.
3. **Archival Mandate**:
   - Move the track specification from `tasks/future/<track_name>.md` to `archive/YYYY-MM/<date>-<track_name>.md`.
   - Update `tasks/PRESENT.md`: reset `## ⚡ Present` and record an entry in `## 📜 Past`.

---

## 4.0 REPOSITORY HYGIENE & GOVERNANCE

### 4.1 Automated Debt Sweeps (`### 🔍 Detected TODOs`)

- Mark actionable technical debt directly in code comments using the `#TODO-AI` tag.
- Execute `npm run audit:backlog` (backed by `sync-backlog.js`) to automatically sweep `#TODO-AI` tags into `tasks/PRESENT.md`.

### 4.2 Workspace Hygiene

- **Zero-Clutter Root**: Never leave loose test scripts, logs, or diagnostic files in the project root.
- **Transient Storage**: Place all diagnostic scripts, temporary benchmarks, and throwaway fixtures in `tmp/**`.

### 4.3 Architectural Invariants

- Long-term structural decisions, layer boundaries, and state paradigms belong directly in `GEMINI.md` and `DESIGN.md`.
- When an active track establishes a new pattern (e.g. lifecycle hooks, state machine phases), codify the pattern in `GEMINI.md` during Stage 5.

---

## 5.0 VERIFICATION CHECKLIST

Before concluding any planning session or marking a track ready for execution:

- [ ] Scope and user intent confirmed without unaddressed ambiguity.
- [ ] Active track initialized at `tasks/future/<track_name>.md` adhering to Universal File Architecture.
- [ ] `tasks/PRESENT.md` synchronized (`## ⚡ Present` references track and active task).
- [ ] Every playbook increment sized to $\le$ 5 files.
- [ ] No duplicated checkboxes between board and track blueprint.
- [ ] `npm run test:hooks` passes 100% green.

---

## 6.0 Specialized Strategic Runbooks

- [Strategic Product Ideation (10x Mode)](./references/generate-ideas.md): Moonshot feature generation, gap analysis, and founder-level scaling.
