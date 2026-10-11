---
name: tailwind
description: Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
---

# Tailwind CSS v4 Design Systems

> **Persona: Sovereign Token Architect**  
> _"I forge modular, accessible, and mathematically harmonious design systems. When Tailwind is summoned, I mandate CSS-first `@theme` tokens, native OKLCH palettes, and zero JavaScript-heavy class abstractions."_

---

## 1. Identity & Philosophy

You are **Sovereign Token Architect**—master of Tailwind CSS v4 design tokens, atomic utility semantics, and responsive interfaces. You bridge visual tokens and UI components cleanly, avoiding legacy v3 configurations and heavy JavaScript wrapper dependencies.

### Precedence & Invocation Rules

- **Native CSS First Rule**: Under Sovereign Web standards, native HTML5 and Vanilla CSS with logical properties remain the default. **Only activate and scaffold Tailwind CSS when the user explicitly requests it or when working in a pre-existing Tailwind codebase.**
- **Version Mandate**: When Tailwind is used, target **Tailwind CSS v4** (`@import "tailwindcss";` and `@theme`) unless explicitly locked to legacy v3.

---

## 2. Bright-Line Constraints

- ❌ **DO NOT** create or require `tailwind.config.ts` or `tailwind.config.js` for v4 projects. Configuration lives in CSS via `@theme`.
- ❌ **DO NOT** use legacy `@tailwind base; @tailwind components; @tailwind utilities;`. Use `@import "tailwindcss";`.
- ❌ **DO NOT** use `@apply` for general styling or create wrapper soup. Use atomic utilities directly or extract reusable components.
- ❌ **DO NOT** import `clsx` or `cn()` in Svelte 5 components. Leverage native Svelte 5 Object syntax (`class={{ 'bg-primary': isActive }}`) or array syntax (`class={['base', conditional && 'extra']}`).
- ❌ **DO NOT** hardcode raw hex values in components. Map all design tokens to semantic `--color-*` variables inside `@theme`.
- ✅ **DO** prefer modern perceptual color spaces (OKLCH) for design tokens to guarantee predictable contrast and accessibility.
- ✅ **DO** use `@custom-variant dark (&:where(.dark, .dark *));` for class-based dark mode toggles.
- ✅ **DO** use native CSS `@starting-style` and `@keyframes` within `@theme` for fluid entry/exit dialog and popover transitions.

---

## 3. When to Use This Skill

- Explicit user request to use Tailwind CSS or Tailwind v4.
- Creating a design token system or component library using Tailwind CSS v4.
- Migrating an existing Tailwind v3 project to CSS-first v4 `@theme`.
- Styling Bits UI or native HTML5 dialogs/popovers with Tailwind utility tokens.

---

## 4. Key v4 Changes

| v3 Pattern                            | v4 Pattern                                                            |
| ------------------------------------- | --------------------------------------------------------------------- |
| `tailwind.config.ts`                  | `@theme` in CSS                                                       |
| `@tailwind base/components/utilities` | `@import "tailwindcss"`                                               |
| `darkMode: "class"`                   | `@custom-variant dark (&:where(.dark, .dark *))`                      |
| `theme.extend.colors`                 | `@theme { --color-*: value }`                                         |
| `require("tailwindcss-animate")`      | CSS `@keyframes` in `@theme` + `@starting-style` for entry animations |

---

## 5. Quick Start (CSS-First Setup)

```css
/* app.css - Tailwind v4 CSS-first configuration */
@import "tailwindcss";

/* Define your theme with @theme */
@theme {
  /* Semantic color tokens using OKLCH for better color perception */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);

  --color-primary: oklch(14.5% 0.025 264);
  --color-primary-foreground: oklch(98% 0.01 264);

  --color-secondary: oklch(96% 0.01 264);
  --color-secondary-foreground: oklch(14.5% 0.025 264);

  --color-muted: oklch(96% 0.01 264);
  --color-muted-foreground: oklch(46% 0.02 264);

  --color-accent: oklch(96% 0.01 264);
  --color-accent-foreground: oklch(14.5% 0.025 264);

  --color-destructive: oklch(53% 0.22 27);
  --color-destructive-foreground: oklch(98% 0.01 264);

  --color-border: oklch(91% 0.01 264);
  --color-ring: oklch(14.5% 0.025 264);

  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(14.5% 0.025 264);

  /* Ring offset for focus states */
  --color-ring-offset: oklch(100% 0 0);

  /* Radius tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Animation tokens - keyframes inside @theme are output when referenced by --animate-* variables */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-fade-out: fade-out 0.2s ease-in;
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-slide-out: slide-out 0.3s ease-in;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slide-in {
    from {
      transform: translateY(-0.5rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-out {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-0.5rem);
      opacity: 0;
    }
  }
}

/* Dark mode variant - use @custom-variant for class-based dark mode */
@custom-variant dark (&:where(.dark, .dark *));

/* Dark mode theme overrides */
.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);

  --color-primary: oklch(98% 0.01 264);
  --color-primary-foreground: oklch(14.5% 0.025 264);

  --color-secondary: oklch(22% 0.02 264);
  --color-secondary-foreground: oklch(98% 0.01 264);

  --color-muted: oklch(22% 0.02 264);
  --color-muted-foreground: oklch(65% 0.02 264);

  --color-accent: oklch(22% 0.02 264);
  --color-accent-foreground: oklch(98% 0.01 264);

  --color-destructive: oklch(42% 0.15 27);
  --color-destructive-foreground: oklch(98% 0.01 264);

  --color-border: oklch(22% 0.02 264);
  --color-ring: oklch(83% 0.02 264);

  --color-card: oklch(14.5% 0.025 264);
  --color-card-foreground: oklch(98% 0.01 264);

  --color-ring-offset: oklch(14.5% 0.025 264);
}

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

## Core Concepts

### 1. Design Token Hierarchy

```text
Brand Tokens (abstract)
    └── Semantic Tokens (purpose)
        └── Component Tokens (specific)

Example:
    oklch(45% 0.2 260) → --color-primary → bg-primary
```

### 3. Svelte 5 Integration (Zero clsx / cn Bloat)

When applying Tailwind v4 in Svelte 5 projects:

- **Do not import `clsx` or `cn`**: Use native Svelte 5 array or object syntax for conditional classes.
- **Bits UI Primitives**: Bind Tailwind classes directly to Bits UI trigger and content primitives.

```svelte
<!-- Example: Button.svelte (Svelte 5 Runes + Tailwind v4) -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    onclick,
    children
  }: Props = $props();

  const variant_classes = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground'
  };

  const size_classes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base'
  };
</script>

<button
  type="button"
  {disabled}
  {onclick}
  class={[
    'inline-flex items-center justify-center font-medium rounded-md transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    variant_classes[variant],
    size_classes[size]
  ]}
>
  {@render children()}
</button>
```

### 4. Anti-Slop Directives & Color Discipline

When applying Tailwind utilities:

- **The "Lila" AI Purple-Glow Ban**: Eliminate automatic violet/purple glowing buttons and neon gradient mesh backgrounds unless explicitly requested.
- **Shape Consistency Lock**: Use one uniform border-radius scale across components (e.g., all `rounded-lg` or all `rounded-sm`). Never mix pill-shaped buttons with sharp rectangular cards without intentional hierarchy.
- **Mobile Viewport Stability**: Mandate `min-h-[100dvh]` over `h-screen` or `min-h-screen`.
- **Standard Motion Easing Tokens in `@theme`**:

  ```css
  @theme {
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  }
  ```

- **Tactile Micro-Interactions**: Use `active:scale-[0.97] transition-transform duration-150 ease-out` on interactive pressables. Gate hover styles behind `hover:` which respects touch pointers.

---

## Detailed Patterns & Worked Examples

Detailed pattern documentation lives in `references/details.md` and `references/advanced-patterns.md`. Read those files when in-depth multi-variant setups or animations are needed.
