---
name: tailwind
description: >-
  Build scalable design systems with Tailwind CSS v4, CSS-first @theme tokens, OKLCH
  palettes, and responsive utility patterns. Use when configuring Tailwind v4 @theme
  blocks, migrating v3 configs, or styling component libraries. Do NOT use for plain
  CSS/HTML layout without Tailwind (use `modern-web-guidance`), Svelte 5 reactive state
  architecture (use `svelte`), or workspace-specific visual token pipelines (use local
  `design` if present).
---

# Tailwind CSS v4 Design Systems

## 1. Invocation Precedence & Bright-Line Constraints

- **Native CSS First**: Only scaffold Tailwind CSS when explicitly requested or in a pre-existing Tailwind codebase. Target **Tailwind CSS v4** (`@import "tailwindcss";` and `@theme`).
- **DO NOT** create `tailwind.config.js`/`tailwind.config.ts` or use legacy `@tailwind base/components/utilities` directives in v4 projects.
- **DO NOT** use `@apply` for general styling; compose atomic utilities directly or extract reusable components.
- **DO NOT** import `clsx` or `cn()` in Svelte 5 components—use native Svelte 5 array/object class syntax (`class={['base', active && 'bg-primary']}` or `class={{ 'bg-primary': is_active }}`).
- **DO NOT** hardcode raw hex values in components; map semantic `--color-*` tokens inside `@theme` using OKLCH palettes.
- **DO** use `@custom-variant dark (&:where(.dark, .dark *));` for class-based dark mode and native CSS `@starting-style` + `@keyframes` inside `@theme` for entry/exit animations.

## 2. Key v3-to-v4 Shifts

| v3 Pattern | v4 Pattern |
| :--- | :--- |
| `tailwind.config.ts` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss";` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `theme.extend.colors` | `@theme { --color-*: oklch(...); }` |
| `require("tailwindcss-animate")` | CSS `@keyframes` in `@theme` + `@starting-style` |

## 3. Core Patterns & Anti-Slop Rules

### 1. Design Token Hierarchy

`Brand Tokens (oklch(...))` -> `Semantic Tokens (--color-primary)` -> `Utility Classes (bg-primary)`

### 2. Svelte 5 Integration (Zero `clsx`/`cn`)

Bind Tailwind utilities directly onto Bits UI / Svelte 5 elements using native array or object `class` expressions rather than helper wrappers. See the full `app.css` `@theme` starter and `Button.svelte` example in [references/details.md](./references/details.md).

### 3. Anti-Slop Visual Discipline

- **No Default Purple Glow**: Avoid unsolicited violet/purple glowing buttons and neon gradient mesh backgrounds.
- **Uniform Radii & Safe Viewports**: Stick to one border-radius scale per system and prefer `min-h-[100dvh]` over `h-screen` / `min-h-screen`.
- **Tactile Feedback**: Pair `active:scale-[0.97] transition-transform duration-150 ease-out` on pressables and gate hover states with `hover:`.

## 4. Reference Manuals (1-Hop)

- **CSS-First `app.css` Starter, `Button.svelte`, & Component Patterns**: [references/details.md](./references/details.md)
- **Advanced `@utility`, `@theme inline/static`, Container Queries, & v3->v4 Migration Checklist**: [references/advanced-patterns.md](./references/advanced-patterns.md)
