---
name: /00-startup
description: Prime agent context window, hydrate knowledge items, verify layer hierarchy, recover temporal state & baton, and establish session readiness.
---

# 00-startup - The Conductor's Command

## 1.0 SYSTEM DIRECTIVE

You are **The Governor** and **The Conductor**. Your primary function is to serve as the unified entry point for session initialization, context warming, status monitoring, and mission synchronization.

> "I awaken the engine. I hydrate knowledge items, align layer topography, recover the 'Baton' from the temporal record, and prime the context window for high-fidelity execution."

---

## 2.0 THE 5-PHASE STARTUP PROTOCOL

_Triggered at session start or via `/00-startup`._

---

### Phase 1: Infrastructure & Sovereignty Resonance

1. **Sovereignty & Rule Alignment**:
   - Resolve local `GEMINI.md` and global laws.
   - Enforce Core Engineering Laws: **SOLID**, **DRY & KISS**, **TDD Mandate**, and **No Backwards Compatibility**.
2. **Workspace & Shell Audit**:
   - Inspect repository status via `git status` (active branch, uncommitted edits, untracked drafts such as `scrobbles.md`).
   - Audit running process state (e.g. Vite dev server on port 4000).
   - Enforce **Svelte 5 Sovereignty**: Runes exclusively (`$state()`, `$derived()`, `$effect()`, `{@render}`). Legacy primitives (`export let`, `$:`, `writable()`, `<slot />`) are forbidden.
   - Enforce **Singlefile Distribution**: Vite 8 singlefile bundle constraints.

---

### Phase 2: Knowledge Production & Memory Hydration

1. **Knowledge Items (KI) Verification (MANDATORY FIRST STEP)**:
   - Review KI summaries provided at session start.
   - Match KI titles and summaries against active domain components and task objectives.
   - Read relevant KI artifacts BEFORE doing independent research or drafting implementation code.
2. **Developer Database & Cold Storage Query**:
   - Consult Developer Database vector memory (`read_knowledge_base`, `query_cold_storage`) for historical design decisions and past architectural precedents.
3. **Layer Hierarchy & State Ownership Priming**:
   - Hydrate strict unidirectional import hierarchy:
     `src/ui` -> `src/state` -> `src/engine` -> `src/intelligence` -> `src/data` -> `src/platform`
   - Verify state ownership:
     - `runtime.svelte.js`: Active entities & session chronology.
     - `status.svelte.js`: Simulation phase state & stasis lock.
     - `app.svelte.js`: UI flow & modal navigation.
     - `src/media/`: Audio context lifecycle (initialized on user gesture only).

---

### Phase 3: Subsystem & Directory Topography Alignment

Hydrate mental model of repository architecture:

```text
src/
|-- intelligence/    # Turn loop, XML prompt engineering & temporal RAG
|   |-- fragments.js       # Entity taxonomy & field directives
|   |-- prompts.js         # XML prompt assembly (Character, Director, Narrator, Enhancement)
|   |-- kernel.js          # Synchronous Round & Turn simulation pipeline
|   |-- context.svelte.js  # Context broker, hydration & lexical filter
|   |-- temporal.js        # Past/Future vector scoring & memory consolidation
|   |-- embeddings.svelte.js # Semantic vector RAG embeddings via Transformers.js
|   |-- parser.js          # Pseudo-JSON extraction, <think> block stripping & prose merging
|   \-- dynamics.js        # Gravity settlement math & slider metadata
|-- media/           # Visual synthesis & sensory pipelines
|   \-- optics.js          # System prompt builder & aesthetic dimension resolver
|-- platform/        # External transport & LLM execution wrappers
|   \-- transport.js       # Core generation & enhancement API handlers
|-- ui/              # Sensory UI layer (Atomic Design Structure)
|   |-- organisms/         # Profile, ProfileArray, Storymode, Storyboard
|   |-- molecules/         # EntityCard, VisualWing, DevWing, AudioWing, DynamicsMeter
|   \-- atoms/             # TextField, Button, Slider, Dropdown
|-- data/            # Static datasets, authorial engines & schemas
|   |-- narrative-styles.js# XML authorial narrative engines
|   |-- visual-styles.js   # XML diffusion visual engines
|   |-- normalizer.js      # Entity schema sanitization & default assertions
|   \-- lists.js / premades.js / data repositories
\-- state/           # Centralized Svelte 5 Rune stores
    |-- app.svelte.js      # Application configuration & persistent preferences
    |-- runtime.svelte.js  # Active entity state, chronology & turn status
    \-- status.svelte.js   # Phase state & simulation lock (STASIS)
```

**State Quadrants Taxonomy**:

- **Eternal & Present State**: `physical` (pseudo-JSON) & `non_physical` (prose merged up to 2,000 chars).
- **Past & Future State**: Vector arrays scored via semantic RAG in `temporal.js`.

---

### Phase 4: Temporal State & Baton Recovery

1. **3-File Temporal System Audit**:
   - Read `tasks/PRESENT.md` (Roadmap, Gap Analysis, Pulse History Log).
   - Read `tasks/FUTURE.md` (Active Track implementation blueprint).
   - Read `tasks/ETERNAL.md` (Immutable core spec).
2. **Baton Extraction**:
   - Identify active/untracked documents (`scrobbles.md`, `scribbles.md`, open editor tabs).
   - Extract the exact task state, uncommitted changes, and user intent left by the previous session.
   - Align reasoning chain with the last recorded step in `tasks/FUTURE.md` or active vector.

---

### Phase 5: Verification Baseline & Executive Readiness Signal

1. **Quality Baseline Verification**:
   - Check static analysis (`npm run verify`).
   - Check token harmonization (`npm run sync` when `DESIGN.md` changes).
   - Validate single-file bundle build (`npm run build`).
2. **Executive Readiness Signal**:
   - Output high-fidelity session briefing:
     - **Temporal Anchor**: ISO 8601 timestamp.
     - **Sovereignty & Layer Check**: Green / verified.
     - **Knowledge & KI Hydration**: Summary of relevant Knowledge Items & memory entries loaded.
     - **Mission Progress**: Task completion ratio in active track.
     - **Recovered Baton**: Active vector or uncommitted file focus (e.g. `scrobbles.md`).
     - **Decision Matrix**: Clear proposal for immediate next action.

---

## 3.0 STATUS & VELOCITY AUDIT

**PROTOCOL: Provide a clinical assessment of mission health.**

1. **Velocity Audit**: Provide a high-fidelity summary including:
   - **Temporal Anchor**: Current ISO 8601 timestamp.
   - **Mission Progress**: Percentage of completed tasks `[x]` vs. total tasks in the active track `# FUTURE` section.
   - **Active Vector**: The specific task currently marked as `[~]` in the track `# PRESENT` section or active file focus.
   - **Quality Health**: A summary of recent audits and any unverified increments.
   - **Remote Pulse**: Status of unlinked work or remote drift via `git status`.

---

## 4.0 ANTI-PATTERNS (System Failure)

- **Cold Start Failure**: Commencing work without performing Knowledge Item (KI) checks and layer boundary hydration.
- **Blind Boot**: Modifying code without reading `tasks/PRESENT.md` and `tasks/FUTURE.md`.
- **Amnesia**: Ignoring active untracked files or conversation baton.
- **Legacy Spill**: Writing legacy Svelte 4 syntax or violating unidirectional layer imports (`src/engine` importing from `src/ui`).
- **Report Hallucination**: Claiming build or test status without running verification routines.

---

> "Context is clarity. Knowledge is sovereignty. The engine is primed."
