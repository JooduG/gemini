---
name: /refactor
description: Universal Ground-Up Refactor, Svelte Rune Optimization, & DOM/CSS Harmonization.
---

# SYSTEM DIRECTIVE: The Ground-Up Refactor Engine

## OBJECTIVE

Execute a complete structural deconstruction and linear rebuild of the provided file (.svelte, .js, .svelte.js, or .css). Do not patch or tweak incrementally. Instead, analyze the core intent, dissolve technical debt, and reconstruct the codebase from scratch to achieve an optimal logical flow, immaculate readability, and absolute structural robustness.

---

## PIER-TO-OUTPUT EXECUTION PIPELINE

### 1. Forensic Deconstruction & Analysis

- **Intent Mapping**: Determine the exact purpose, upstream/downstream callers, and edge cases of the target code before writing a single line.
- **Complexity Audit**: Target deeply nested blocks, high cyclomatic complexity, unoptimized loops, and ambiguous naming conventions.
- **DOM & Style Scan**: Identify redundant wrapper elements, custom CSS overrides duplicating global styles, and missing design token implementations.

### 2. Logic Optimization & Clean-Slate Rebuild

- **Atomic Reconstruction**: Rebuild the logic sequentially as if starting the file from scratch, introducing helpers and guard clauses one by one.
- **Svelte Runes Enforcement**: Convert all legacy state (`let`, `$:`) to modern Svelte Runes (`$state`, `$derived`, `$effect`). Utilize `$inspect` exclusively for debugging; purge all inline console logs.
- **State Flattening**: Break down complex, deeply nested state objects into flat, tracked primitives or discrete Runes-driven classes to maximize reactivity efficiency.
- **Declarative Paradigm**: Replace imperative loops (`for`, `while`) and destructive mutations with declarative array methods (`.map()`, `.filter()`, `.reduce()`).
- **Asynchronous Streamlining**: Flatten complex Promise chains and callback hell into linear `async/await` blocks, protected by safe `try/catch` error encapsulation.

### 3. DOM Streamlining (Zero-Design-Drift)

- **Tree Flattening**: Aggressively prune the HTML/markup by removing non-semantic wrapper nodes and structural clutter.
- **Visual Parity Guarantee**: Ensure the structural optimization maintains a strict 1:1 layout match. The visual UI/UX and layout integrity must remain entirely unchanged.

### 4. CSS Nomenclature & Token Harmonization

- **Ultra-Lean Standard**: Standardize all class names around a flat, semantic, and functional naming convention reflecting internal component structure (e.g., `.wrapper`, `.header`, `.body`, `.actions`, `.status`).
- **Design Token Sovereignty**: Purge hardcoded values, local custom dimensions, and custom colors. Replace them strictly with tokens from `DESIGN.md` (e.g., `--radius-standard`, `--duration-fast`).
- **Pattern Registry Alignment**: If local styling closely mimics a standard registry pattern (e.g., `.glass-elevated`, `.interactable`), drop the local declarations completely and apply the global utility classes directly.
- **Zero-Redundancy Inheritance**: Do not re-declare inherited or global styles within local `<style>` blocks. Let native CSS inheritance do the work.
- **Svelte Prop Binding**: Apply custom utility classes to child components exclusively via standard Svelte `class` prop bindings. Never use React-style `className` attributes.

---

## STRICT ANTI-PATTERNS

- **Feature Creep**: Do not alter, add, or remove functional behavior or external APIs while refactoring.
- **Monolithic Refactoring**: Avoid modifying massive blocks of code simultaneously. Maintain an incremental micro-verification workflow.

---

## REQUIRED OUTPUT FORMAT

Your response must follow this exact two-part layout:

1. **Production-Ready Code**: The complete, fully refactored, and beautifully formatted file.
2. **Refactor Changelog**: A highly concise, bulleted summary mapping out:
   - Logical & architectural improvements made during the rebuild.
   - Specific Svelte Runes conversions executed.
   - Total DOM nodes eliminated / flattened.
   - Custom CSS classes successfully mapped to the generic token system.
