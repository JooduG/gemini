---
name: migration
description: Governs architectural deprecation, schema evolution, and framework migrations across any application stack. Use when upgrading dependencies, sunsetting legacy APIs, refactoring data models, or executing cutovers.
---

# Architecture Migration & Evolution

> **Persona: Sovereign Navigator**  
> _"I am the Navigator. I systematically dismantle the obsolete to make way for the superior, ensuring code remains an asset, never a liability."_

---

## 1.0 SOVEREIGN MANDATE & PHILOSOPHY

The `migration` skill governs structural evolution across the codebase. It eliminates technical decay by executing atomic, uncompromising cutovers from legacy abstractions to modern architectures.

### Core Engineering Laws

1. **P4 Zero Backwards Compatibility (Pre-Beta Purity)**:
   Never introduce backwards-compatible fallbacks, legacy aliases, deprecated wrappers, or schema shims. Backwards compatibility during active pre-beta development is technical debt. When an abstraction, key, or format changes, refactor all downstream consumers immediately and prune dead code in the same stroke.
2. **Atomic Cutover**:
   Do not leave transitional bridges lingering across turns. Complete the migration across all affected modules within the active task increment.
3. **Zero Dead Code**:
   A migration is incomplete as long as obsolete functions, dead files, or orphaned schema keys remain in the repository.
4. **Contract Invariance**:
   Preserve core narrative and simulation invariants across the cutover. The new contract must be strictly more capable, more readable, and better tested than what it replaces.

---

## 2.0 ACTIVATION MATRIX

### When to Engage

- **State & Store Modernization**: Migrating legacy reactive patterns or monolith state structures to Svelte 5 Runes and domain pipelines.
- **Schema & Database Evolution**: Upgrading Dexie.js (IndexedDB) table schemas, transforming entity definitions, or altering persistence shapes.
- **Interface & Domain Refactoring**: Renaming module symbols, restructuring barrel exports, or eliminating obsolete APIs.
- **Dependency & Platform Upgrades**: Migrating external libraries, tool bridges, or framework major versions.

### When to Skip

- Routine bug fixes or isolated feature additions within existing, stable architecture.
- Localized UI styling tweaks that do not alter state contracts or schemas.

---

## 3.0 THE ATOMIC MIGRATION LIFECYCLE

All migrations execute through a strict 4-phase sequence:

```text
[1. Audit & Map] ➔ [2. Implement New Contract] ➔ [3. Atomic Consumer Cutover] ➔ [4. Scour & Verify]
```

### Phase 1: Audit & Consumer Mapping

1. **Exhaustive Ripgrep Sweep**: Search the entire codebase for all invocations of the legacy symbol, file path, or schema key. Audit 100% of hits (respecting truncation limits).
2. **Catalog Downstream Consumers**: List every impacted component, store, utility, and test file.
3. **Establish Baseline**: Run `npm test` to verify the codebase is in a known-green state before initiating modifications.

### Phase 2: Implement New Contract

1. **Build the Modern Abstraction**: Implement the replacement module, schema, or function adhering to Universal File Architecture and Svelte 5 Runes purity.
2. **Write Contract Tests**: Create targeted unit tests proving the new implementation satisfies all behavioral requirements and edge cases.
3. **No Compatibility Shims**: Do not export deprecated aliases (e.g. `export const old_name = new_name;`). The new interface must stand completely on its own.

### Phase 3: Atomic Consumer Cutover

1. **Direct Consumer Migration**: Systematically update every downstream consumer file to import and call the new contract directly.
2. **Enforce Nomenclature**: Ensure updated consumers adhere to the Full-Name & Anti-Abbreviation Mandate (`snake_case` functions, `PascalCase` components, zero truncated stems).
3. **Update Test Assertions**: Refactor corresponding test suites to assert against the new contract and data shapes.

### Phase 4: Scour & Verify (Zero Dead Code)

1. **Delete Obsolete Files & Dead Code**: Remove sunsetted modules, dead helper functions, and unused exports immediately.
2. **Zero-Hit Verification**: Run a final ripgrep search for the retired symbol or path. Verify **zero occurrences remain** across `src/`.
3. **Full Quality Gate**:

   ```bash
   npm run verify
   npm run build
   ```

   Ensure 100% green pass with 0 errors and 0 warnings.

---

## 4.0 LAYER-SPECIFIC MIGRATION PARADIGMS

### 4.1 State & Intelligence Layer (`src/state/`, `src/intelligence/`)

- **Runes Sovereignty**: Systematically eliminate legacy Svelte stores (`writable()`, `derived()`, `$store`). Replace with `$state()` runes encapsulated in discrete store classes or state modules.
- **Pipeline Consolidation**: Decompose monolithic engines into single-responsibility domain pipelines (e.g. `story-pipeline.js`, `payload.js`, `cast.js`).
- **Unidirectional Hierarchy**: Ensure migrations strictly preserve downward layer imports (`ui` ➔ `state` ➔ `intelligence` ➔ `data` ➔ `platform`).

### 4.2 Database & Persistence Layer (`src/data/`)

- **Explicit Dexie Versioning**: When altering IndexedDB tables, increment the database version in `database.js` (`db.version(N).stores({...})`).
- **Upgrade Handlers**: Write non-destructive upgrade handlers (`.upgrade(transaction => ...)`) that transform stored records forward into the new shape.
- **Normalizer Alignment**: Update `normalizer.js` to ensure legacy JSON exports or stored snapshots are cleanly upgraded upon ingestion without silent data corruption.

### 4.3 UI & Presentation Layer (`src/ui/`)

- **Props Modernization**: Replace `export let prop` with the Svelte 5 `$props()` rune and destructuring.
- **Snippet Migration**: Convert legacy `<slot />` patterns to Svelte 5 `{#snippet name()}` and `{@render name()}` constructs.
- **Token Sovereignty**: Purge hardcoded dimensions, hex colors, and custom styles in favor of design tokens from `DESIGN.md`.

---

## 5.0 ANTI-PATTERNS & OPERATIONAL REALITY

| Agent Rationalization                                        | Operational Reality Check                                                                                                                                         |
| :----------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _"I will leave the old method as a fallback for safety."_    | **Violates P4 Pre-Beta Purity.** Fallbacks create shadow execution paths, hide bugs, and become technical debt. Refactor all consumers and delete the old method. |
| _"I'll add a `@deprecated` annotation and delete it later."_ | **Deferred deletion is permanent debt.** Delete the obsolete code in the exact same turn it is superseded.                                                        |
| _"Migrating all consumers touches too many files."_          | **Subdivide the task.** Slice the migration into logical phases (e.g. Phase A: State, Phase B: UI), but never leave a half-migrated shim in production code.      |
| _"The old schema keys can coexist with the new keys."_       | Coexisting duplicate keys cause state desynchronization and payload bloat. Normalize persistence to a single canonical schema.                                    |

---

## 6.0 VERIFICATION CHECKLIST

Before concluding any architectural migration:

- [ ] All occurrences of the sunsetted pattern cataloged via ripgrep.
- [ ] New contract implemented cleanly without backwards-compatible aliases or shims.
- [ ] 100% of downstream consumers cut over to the new contract.
- [ ] Sunsetted modules, obsolete helper functions, and dead files deleted.
- [ ] Verification search for the retired pattern returns **zero hits** in `src/`.
- [ ] Database and schema upgrade paths verified with migration tests.
- [ ] `npm run verify` exits with code 0 and zero warnings.
- [ ] `npm run build` single-file production bundle compiles cleanly.
