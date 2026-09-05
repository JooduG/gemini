---
name: refactor
description: Universal ground-up refactor, architectural migration, and harmonization protocol. Deconstructs modules from the ground up, enforcing clean layer boundaries, modern framework runes/signals, descriptive domain nomenclature, and ruthless P4 Zero Backwards-Compatibility purging. Use when refactoring components, modernizing architecture, upgrading schemas, or eliminating technical debt.
---

# Ground-Up Refactoring & Architectural Migration

> **Persona: The Craftsman & Navigator**  
> *"I refactor from the ground up and systematically dismantle the obsolete. I eliminate boundary bleed, rebuild with modern framework runes, enforce nomenclature, and purge legacy ballast so code remains an asset, never a liability."*

---

## 1.0 Sovereign Mandate & Philosophy

The `refactor` skill governs structural evolution and ground-up modernization across the codebase. It eliminates technical decay through clean layer isolation, architectural deconstruction, and uncompromising P4 Zero Backwards Compatibility.

### Core Engineering Laws

1. **P4 Zero Backwards Compatibility (Pre-Beta Purity)**:
   Never introduce backwards-compatible fallbacks, legacy aliases, deprecated wrappers, or schema shims. When an abstraction, key, or format changes, refactor all downstream consumers immediately and prune dead code in the same stroke.
2. **Ground-Up Rebuild Over Patchwork**:
   Avoid patching flawed code with incremental wrappers. Deconstruct the module to first principles and rebuild cleanly.
3. **Atomic Cutover**:
   Do not leave transitional bridges lingering across turns. Complete the migration across all affected modules within the active task increment.
4. **Zero Dead Code**:
   A refactor is incomplete as long as obsolete functions, dead files, or orphaned schema keys remain in the repository.
5. **Contract Invariance**:
   Preserve core functional and state contracts across the cutover. The new contract must be strictly more capable, more readable, and better tested than what it replaces.

---

## 2.0 The 5-Stage Refactor Protocol

Triggered during code modernization or explicitly via `/refactor`.

```text
[Stage 1: Pre-Flight Audit & Plan] ➔ [Stage 2: Boundaries & Relocation] ➔ [Stage 3: Ground-Up Rebuild] ➔ [Stage 4: Nomenclature & P4 Purge] ➔ [Stage 5: Verification & Mission Board Pulse]
```

---

### Stage 1: Pre-Flight Audit & Specification Gate

Diagnose issues across all dimensions and align with the user before touching code:

1. **Target Inspection**:
   * Read the target source file, its downstream callers, and test files using line ranges.
   * Inspect boundary bleeds, state models, nomenclature deviations, and technical debt.
2. **Present Concise 4-Axis Plan**:
   * Present a focused bulletpoint plan covering:
     * **Relocation**: Code to move in (consolidate) or move out (purge boundary bleed).
     * **Rebuild**: Framework modernization (Runes/signals), state flattening, token harmonization.
     * **Nomenclature**: Full-Name & Anti-Abbreviation renaming targets.
     * **P4 Purge**: Legacy aliases, schema shims, and dead code to eliminate.
3. **Approval Gate**:
   * Stop and wait for the user's explicit confirmation before executing modifications.

---

### Stage 2: Boundaries & Code Relocation (Move In / Move Out)

Ensure the module strictly owns its single domain responsibility without boundary leakage:

1. **Move Out (Purge Boundary Bleed)**:
   * Identify logic belonging to a different architectural layer (e.g. UI rendering in stores, raw database queries in components).
   * Relocate misplaced logic to its canonical layer (`src/ui/`, `src/state/`, `src/intelligence/`, `src/data/`, `src/platform/`).
2. **Move In (Consolidate Co-Located Domain Logic)**:
   * Consolidate single-caller helpers, companion utilities, or tightly coupled data definitions scattered across other files into this module.
3. **Synchronize Layer Imports**:
   * Update all import/export paths immediately. Enforce downward unidirectional flow:
     `src/ui` ➔ `src/state` ➔ `src/intelligence` ➔ `src/data` ➔ `src/platform`.

---

### Stage 3: Logic Optimization & Ground-Up Rebuild

Execute a clean structural deconstruction and rebuild rather than incremental patching:

1. **Universal File Architecture**:
   * **Instructional Header**: Top comment explaining purpose, props/schema, dependencies, and rules.
   * **Organized Body**: Clear section dividers (`// ============================================================================`).
   * **Changelog Footer**: Bottom comment documenting refactor rationale and milestones.
2. **Modern Framework Sovereignty**:
   * Replace legacy syntax with modern runes/signals: `$state()`, `$derived()`, `$effect()`, `{@render snippet}`.
   * Purge deprecated stores (`writable`, `readable`), `$:` reactive statements, `<slot />`, and `createEventDispatcher`.
   * Run the framework autofixer if available (e.g. `svelte-autofixer`).
3. **Logic & State Flattening**:
   * Flatten deeply nested objects into tracked primitives or discrete state machines.
   * Replace imperative loops with declarative array operations (`.map()`, `.filter()`, `.reduce()`).
   * Flatten Promise chains into linear `async/await` blocks with robust error handling.
4. **DOM Streamlining & Token Harmonization**:
   * Prune redundant wrapper nodes while maintaining 1:1 visual parity.
   * Purge raw CSS hex colors and pixel values; bind strictly to `DESIGN.md` design tokens.

---

### Stage 4: Nomenclature & P4 Zero Backwards Compatibility Purge

Eliminate ambiguity, enforce lexical standards, and dissolve historical debt:

1. **Constitutional Lexical Standards**:
   * **`kebab-case`**: Folders & files (e.g. `card-conversion.js`, `story-pipeline.js`).
   * **`PascalCase`**: Components (e.g. `StoryPanel.svelte`).
   * **`snake_case`**: Variables, parameters, and functions (e.g. `init_database()`, `current_character`).
   * **`question_snake`**: Booleans (e.g. `is_active`, `has_token`).
   * **`SCREAMING_SNAKE`**: Constants & globals (e.g. `MAX_ENTROPY`, `SPEAKING_STYLES`).
   * **Full-Name Mandate**: Zero abbreviations (`character` not `char`, `parameters` not `params`, `temporary` not `tmp`, `developer` not `dev`, `element` not `el`, `button` not `btn`, `context` not `ctx`).
2. **P4 Zero Backwards Compatibility Purge**:
   * Delete deprecated wrappers, backward-compatible property fallbacks, and schema shims.
   * Refactor downstream consumers directly instead of preserving legacy adapters.
3. **Dead Code Pruning**:
   * Remove unused imports, dead test mocks, obsolete fixtures, and unreachable branches.

---

### Stage 5: Verification & Mission Board Pulse

Certify the refactor with automated tests and synchronize temporal state:

1. **Automated Verification**:

   ```bash
   npm run test:hooks
   npm run verify
   ```

   * Confirm all hook contracts pass and 0 lint/test/nomenclature errors exist.

2. **Synchronize Mission Board (`tasks/PRESENT.md`)**:
   * Update `### 🩺 System & Session Readiness` with the latest audit timestamp.
   * Record an entry in `## 📜 Past` summarizing the refactored module, active skills (`refactor`), and status `✅ Completed`.
3. **Optional Semantic Commit**:
   * Stage modified code, downstream consumers, tests, and `tasks/PRESENT.md`:

     ```bash
     git commit -m "track(refactor): modernize <module-name> (framework runes, nomenclature, P4 purge)"
     ```

4. **Handoff**:
   * Present a concise summary of the modernized module and wait for user instructions.

---

## 3.0 Anti-Patterns & Operational Reality

| Agent Rationalization | Operational Reality Check |
| :--- | :--- |
| *"I will leave the old method as a fallback for safety."* | **Violates P4 Pre-Beta Purity.** Fallbacks create shadow execution paths, hide bugs, and become technical debt. Refactor all consumers and delete the old method. |
| *"I'll add a `@deprecated` annotation and delete it later."* | **Deferred deletion is permanent debt.** Delete the obsolete code in the exact same turn it is superseded. |
| *"Migrating all consumers touches too many files."* | **Subdivide the task.** Slice the migration into logical phases, but never leave a half-migrated shim in production code. |
| *"The old schema keys can coexist with the new keys."* | Coexisting duplicate keys cause state desynchronization and payload bloat. Normalize persistence to a single canonical schema. |
