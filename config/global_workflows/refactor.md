---
name: refactor
description: Universal Ground-Up Refactor & Harmonization Protocol — (1) Boundaries & Relocation, (2) Ground-Up Logic & Svelte 5 Rune Rebuild, (3) Nomenclature & Descriptive Renaming, (4) P4 Zero Backwards-Compatibility Purge.
---

# 🔄 Ground-Up Refactor & Harmonization Protocol (`/refactor` / `/harmonize`)

> **Objective**: Systematically optimize an individual file or module through a structured 4-phase progression: clean layer boundaries and code relocation, a ground-up structural refactor (Runes, DOM flattening, token alignment), crisp descriptive nomenclature alignment, and ruthless debt settlement / zero backwards-compatibility purging.

---

## 📋 The 4-Step Refactor Pipeline

```text
[Step 0: Pre-Flight Audit & Plan] ➔ [Step 1: Boundaries & Relocation] ➔ [Step 2: Ground-Up Rebuild] ➔ [Step 3: Nomenclature & Renaming] ➔ [Step 4: P4 Compatibility & Debt Purge]
```

---

### Step 0: Pre-Flight Audit & User Verification Gate

**Goal**: Inspect the target file, diagnose issues across all dimensions, and present a concise bulletpoint plan to the user before making any modifications.

1. **Perform Initial Audit**:
   - Inspect the target file, its downstream callers, and test files to identify boundary bleeds, refactoring targets, naming discrepancies, and dead code/debt.
2. **Present Short Bulletpoint Plan**:
   - Outline proposed changes in a concise plan covering each phase:
     - **Relocation**: Logic to move in or out.
     - **Rebuild**: Logic flow, Svelte 5 Runes optimization, DOM flattening, Design tokens.
     - **Renaming**: Full-Name & Anti-Abbreviation adjustments.
     - **Debt/P4 Purge**: Legacy shims and dead code to eliminate.
3. **Wait for Verification**:
   - **STOP immediately after presenting the plan and wait for the user's explicit verification and approval before modifying code**.

---

### Step 1: Boundaries & Code Relocation (Move In / Move Out)

**Goal**: Ensure the file strictly owns its single domain responsibility, without hoarding alien logic or missing closely coupled primitives.

1. **Move Out (Purge Boundary Bleed)**:
   - Identify logic, helpers, state mutations, or queries that belong to a different architectural layer (e.g., UI code in `@state`, state mutations in `@ui`, raw IndexedDB calls in components).
   - Relocate misplaced logic to its canonical owner (`src/ui/`, `src/state/`, `src/intelligence/`, `src/data/`, `src/media/`, `src/platform/`, `src/utils/`).
2. **Move In (Consolidate Domain Logic)**:
   - Consolidate companion utilities, single-caller helper functions, or tightly coupled data definitions scattered across other files into this target module.
3. **Verify Imports & Hierarchy**:
   - Update all import/export paths across downstream consumers immediately. Enforce unidirectional downward layer hierarchy (`ui` ➔ `state` ➔ `intelligence` ➔ `data` ➔ `platform`).

---

### Step 2: Logic Optimization & Clean-Slate Rebuild

**Goal**: Execute a complete structural deconstruction and linear rebuild of the file for maximum readability, performance, and purity. Do not patch incrementally—rebuild from the ground up.

1. **Universal File Architecture**:
   - **Instructional Header Block**: Top comment block explaining purpose, schema/props, dependencies, and modification rules.
   - **Organized Body with Dividers**: Clear section dividers (`// ============================================================================`).
   - **Changelog Footer**: Document historical refactors and rationale at the bottom.
2. **Svelte 5 Runes Sovereignty** (for `.svelte` and `.svelte.js`):
   - Replace any legacy syntax with modern runes: `$state()`, `$derived()`, `$effect()`, `{@render snippet}`.
   - Purge deprecated stores (`writable`, `readable`), `$:` reactive blocks, `<slot />`, and `createEventDispatcher`.
   - Utilize `$inspect` exclusively for debugging; purge all inline console logs.
3. **Logic & State Flattening**:
   - Break down deeply nested state objects into flat, tracked primitives or discrete Runes-driven classes.
   - Replace imperative loops (`for`, `while`) and destructive mutations with declarative array methods (`.map()`, `.filter()`, `.reduce()`).
   - Flatten Promise chains into linear `async/await` blocks with safe error encapsulation (`try/catch`).
4. **DOM Streamlining & Token Harmonization**:
   - **Tree Flattening**: Prune non-semantic wrapper nodes while maintaining strict 1:1 visual UI parity.
   - **Design Token Sovereignty**: Purge hardcoded values, local custom dimensions, and raw hex colors. Replace strictly with tokens from `DESIGN.md` (e.g., `--radius-standard`, `--duration-fast`).
   - **Pattern Registry Alignment**: Drop local styles duplicating global patterns (e.g., `.glass-elevated`, `.interactable`) and apply global classes directly.

---

### Step 3: Rename for Clarity, Descriptiveness & Nomenclature

**Goal**: Eliminate ambiguity, strictly enforce constitutional lexical standards, and ensure names self-document their true domain behavior.

1. **Constitutional Lexical Standards**:
   - **`kebab-case`**: Folders & files (e.g., `card-conversion.js`, `story-pipeline.js`, `simulation-engine/`).
   - **`PascalCase`**: Svelte components (e.g., `StoryPanel.svelte`, `TelemetryCard.svelte`).
   - **`snake_case`**: Variables, parameters, functions, and process state (e.g., `init_db()`, `current_character`, `resolve_speaking_style()`).
   - **`question_snake`**: Booleans (e.g., `is_active`, `has_token`, `can_stream`).
   - **`SCREAMING_SNAKE`**: Constants & globals (e.g., `MAX_ENTROPY`, `SPEAKING_STYLES`, `SIGNATURE_COLORS`).
   - **Full-Name & Anti-Abbreviation Mandate**: **Strictly avoid abbreviations, truncated stems, and clipped names**. Always prefer the full descriptive word:
     - `developer` over `dev`
     - `configuration` over `config`
     - `parameters` over `params`
     - `temporary` over `tmp`
     - `character` over `char`
     - `application` over `app`
     - `repository` over `repo`
     - `element` over `el`
     - `button` over `btn`
     - `message` over `msg`
     - `context` over `ctx`
     - `previous` over `prev`
     - `reference` over `ref`
     - _(Exceptions strictly reserved for standard platform primitives: `id`, `html`, `css`, `ui`, `url`, `tts`, `db`)._
2. **Descriptive Verbs & Intent Alignment**:
   - Replace generic shorthand verbs (`init`, `handle`, `process`, `data`, `item`) with descriptive, unambiguous domain terms (`init_database`, `parse_character_card`, `set_quiesce_state`).
3. **Synchronize Downstream Consumers**:
   - Update re-exports in index barrels and test file imports immediately.

---

### Step 4: Debt Settlement & P4 Zero Backwards Compatibility Purge

**Goal**: Ruthlessly dissolve historical technical debt, purge dead code, and enforce the Pre-Beta Purity Law (**P4: Zero Backwards Compatibility**).

1. **P4 Compatibility Purge**:
   - **No Legacy Shims & Aliases**: Delete deprecated function wrappers, backward-compatible property fallbacks, and schema shims.
   - **Refactor Callers Directly**: When an abstraction or key changes, update all downstream consumers immediately instead of supporting legacy shapes.
2. **Dead Code & Zombie Pruning**:
   - Sweep the file and test file for unused imports, dead mock helpers, obsolete test fixtures, and unreachable branches.
3. **Verification & Audit Gate**:
   - Run verification pipeline:

     ```bash
     npm run test
     npm run audit:nomenclature
     npm run lint
     ```

   - Ensure **100% green pass with 0 errors and 0 warnings**.
