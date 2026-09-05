---
name: refactor
description: Universal Ground-Up Refactor & Harmonization Protocol — (1) Audit & Plan, (2) Boundaries & Relocation, (3) Ground-Up Logic & Svelte 5 Rebuild, (4) Nomenclature & P4 Purge, (5) Verification & Gate.
---

# refactor - Ground-Up Refactor & Harmonization Protocol

## 1.0 SYSTEM DIRECTIVE

You are **The Craftsman**. Your primary function is to systematically deconstruct and rebuild individual modules from the ground up, enforcing clean layer boundaries, Svelte 5 Runes sovereignty, descriptive domain nomenclature, and ruthless P4 Zero Backwards-Compatibility purging.

> "I refactor from the ground up. I eliminate boundary bleed, rebuild with Svelte 5 runes, enforce nomenclature, and purge legacy ballast."

---

## 2.0 THE 5-STAGE REFACTOR PROTOCOL

```text
[Stage 1: Pre-Flight Audit & Plan] ➔ [Stage 2: Boundaries & Relocation] ➔ [Stage 3: Ground-Up Rebuild] ➔ [Stage 4: Nomenclature & P4 Purge] ➔ [Stage 5: Verification & Mission Board Pulse]
```

---

### Stage 1: Pre-Flight Audit & Specification Gate

Diagnose issues across all dimensions and align with the user before touching code:

1. **Target Inspection**:
   - Read the target source file, its downstream callers, and test files using line ranges.
   - Inspect boundary bleeds, state models, nomenclature deviations, and technical debt.
2. **Present Concise 4-Axis Plan**:
   - Present a focused bulletpoint plan covering:
     - **Relocation**: Code to move in (consolidate) or move out (purge boundary bleed).
     - **Rebuild**: Svelte 5 Runes modernization, state flattening, token harmonization.
     - **Nomenclature**: Full-Name & Anti-Abbreviation renaming targets.
     - **P4 Purge**: Legacy aliases, schema shims, and dead code to eliminate.
3. **Approval Gate**:
   - Stop and wait for the user's explicit confirmation before executing modifications.

---

### Stage 2: Boundaries & Code Relocation (Move In / Move Out)

Ensure the module strictly owns its single domain responsibility without boundary leakage:

1. **Move Out (Purge Boundary Bleed)**:
   - Identify logic belonging to a different architectural layer (e.g. UI rendering in stores, raw Dexie queries in components).
   - Relocate misplaced logic to its canonical layer (`src/ui/`, `src/state/`, `src/intelligence/`, `src/data/`, `src/media/`, `src/platform/`, `src/utils/`).
2. **Move In (Consolidate Co-Located Domain Logic)**:
   - Consolidate single-caller helpers, companion utilities, or tightly coupled data definitions scattered across other files into this module.
3. **Synchronize Layer Imports**:
   - Update all import/export paths immediately. Enforce downward unidirectional flow:
     `src/ui` ➔ `src/state` ➔ `src/intelligence` ➔ `src/data` ➔ `src/platform`.

---

### Stage 3: Logic Optimization & Ground-Up Rebuild

Execute a clean structural deconstruction and rebuild rather than incremental patching:

1. **Universal File Architecture**:
   - **Instructional Header**: Top comment explaining purpose, props/schema, dependencies, and rules.
   - **Organized Body**: Clear section dividers (`// ============================================================================`).
   - **Changelog Footer**: Bottom comment documenting refactor rationale and milestones.
2. **Svelte 5 Runes Sovereignty** (for `.svelte` and `.svelte.js`):
   - Replace legacy syntax with modern runes: `$state()`, `$derived()`, `$effect()`, `{@render snippet}`.
   - Purge deprecated stores (`writable`, `readable`), `$:` reactive statements, `<slot />`, and `createEventDispatcher`.
   - Run the Svelte autofixer (`call_mcp_tool` with `ServerName: "svelte"`, `ToolName: "svelte-autofixer"`).
3. **Logic & State Flattening**:
   - Flatten deeply nested objects into tracked primitives or discrete Runes-driven state machines.
   - Replace imperative loops with declarative array operations (`.map()`, `.filter()`, `.reduce()`).
   - Flatten Promise chains into linear `async/await` blocks with robust error handling.
4. **DOM Streamlining & Token Harmonization**:
   - Prune redundant wrapper nodes while maintaining 1:1 visual parity.
   - Purge raw CSS hex colors and pixel values; bind strictly to `DESIGN.md` design tokens.

---

### Stage 4: Nomenclature & P4 Zero Backwards Compatibility Purge

Eliminate ambiguity, enforce lexical standards, and dissolve historical debt:

1. **Constitutional Lexical Standards**:
   - **`kebab-case`**: Folders & files (e.g. `card-conversion.js`, `story-pipeline.js`).
   - **`PascalCase`**: Svelte components (e.g. `StoryPanel.svelte`).
   - **`snake_case`**: Variables, parameters, and functions (e.g. `init_database()`, `current_character`).
   - **`question_snake`**: Booleans (e.g. `is_active`, `has_token`).
   - **`SCREAMING_SNAKE`**: Constants & globals (e.g. `MAX_ENTROPY`, `SPEAKING_STYLES`).
   - **Full-Name Mandate**: Zero abbreviations (`character` not `char`, `parameters` not `params`, `temporary` not `tmp`, `developer` not `dev`, `element` not `el`, `button` not `btn`, `context` not `ctx`).
2. **P4 Zero Backwards Compatibility Purge**:
   - Delete deprecated wrappers, backward-compatible property fallbacks, and schema shims.
   - Refactor downstream consumers directly instead of preserving legacy adapters.
3. **Dead Code Pruning**:
   - Remove unused imports, dead test mocks, obsolete fixtures, and unreachable branches.

---

### Stage 5: Verification & Mission Board Pulse

Certify the refactor with automated tests and synchronize temporal state:

1. **Automated Verification**:

   ```bash
   npm run test:hooks
   npm run verify
   ```

   - Confirm 9/9 hook contracts pass and 0 lint/test/nomenclature errors exist.

2. **Synchronize Mission Board (`tasks/PRESENT.md`)**:
   - Update `### 🩺 System & Session Readiness` with the latest audit timestamp.
   - Record an entry in `## 📜 Past` summarizing the refactored module, active workflows (`/refactor`), and status `✅ Completed`.
3. **Optional Semantic Commit**:
   - Stage modified code, downstream consumers, tests, and `tasks/PRESENT.md`:

     ```bash
     git commit -m "track(refactor): modernize <module-name> (Svelte 5 runes, nomenclature, P4 purge)"
     ```

4. **Handoff**:
   - Present a concise summary of the modernized module and wait for user instructions.

---

## 3.0 ANTI-PATTERNS (Refactoring Failures)

- **Patchwork Incrementalism**: Adding layers of complexity over flawed code instead of rebuilding cleanly from the ground up.
- **Transitional Shims**: Leaving backwards-compatibility adapters or legacy aliases in violation of P4.
- **Abbreviation Tolerance**: Tolerating clipped variable names (`char`, `btn`, `ctx`) during refactoring.
- **Skipping Downstream Consumers**: Changing an interface without refactoring all callers directly.
- **Silent Edits**: Modifying architecture without presenting the plan in Stage 1 or synchronizing `tasks/PRESENT.md` in Stage 5.

---

> "Purity is not an accident. It is the deliberate elimination of the unnecessary."
