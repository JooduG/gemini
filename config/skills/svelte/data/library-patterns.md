# Community Patterns & Library Integration (Svelte 5)

## Bits UI

- Use `Snippet` for reusable components (e.g., Dialog titles).
- Render delegation via `{#snippet child({ props })}`.
- Components like `Accordion` use `$state` for expansion.

## Dexie.js

- Use `liveQuery` for reactive data fetching.
- In Svelte 5, wrap `liveQuery` in a way that respects rune-based reactivity if needed, or use `$()` for store-like behavior in legacy mode.
- Preferred pattern: Fetch data in `load` functions and pass to components as props.

---

## Svelte 5 Runes & State Management

### Overview

Runes are keywords in Svelte 5 that control the compiler. They have a `$` prefix and enable fine-grained reactivity.

### $state

- Creates deeply reactive state proxies for objects and arrays.
- Classes can use `$state` in fields.
- Use `$state.raw` for non-deep reactivity (reassignment only).
- Use `$state.snapshot` to get a non-proxy version of state.

### $derived

- Computed state that automatically updates when its dependencies change.
- Side-effect free. Use `$derived.by` for complex logic.

### $effect

- Handles side effects (DOM, network, timers).
- Use sparingly; prefer `$derived` for state synchronization.
- `$effect.pre` runs before DOM updates.

### $props and $bindable

- `$props()` receives data from parents.
- `$bindable()` allows two-way binding for specific props.

### Migration Guide

- Replace `export let` with `$props()`.
- Replace `$`:`statements with`$derived` or `$effect`.
- Replace Svelte stores with universal reactivity (`.svelte.js` files).

---

## 💎 Svelte 5 Runes & Headless UI Patterns

This guide consolidates the fundamental reactivity macros (Runes) and the architectural patterns for integrating headless component libraries (Bits UI) within the project engine.

### 🌀 Core Runes

| Rune              | Usage                                  | Context                              |
| :---------------- | :------------------------------------- | :----------------------------------- |
| `$state(val)`     | Deeply reactive state proxies.         | Objects, Arrays, Classes.            |
| `$state.raw(val)` | Shalow reactivity (reassignment only). | Performance-critical arrays/objects. |
| `$derived(logic)` | Computed state.                        | Automatic dependency tracking.       |
| `$effect(fn)`     | Side effects (DOM/Network).            | Use sparingly; prefer `$derived`.    |
| `$props()`        | Component inputs.                      | Replacing `export let`.              |
| `$bindable()`     | Two-way binding.                       | Prop-level opt-in.                   |

#### 🔄 Reactivity Snapshots

Use `$state.snapshot(proxy)` to create a non-reactive clone of a state object, ensuring safe external mutations or serialization.

---

### 🏗️ Headless UI Integration

The project utilizes **Bits UI** for accessible, unstyled interaction primitives.

#### Bits UI: The Snippet Pattern

- **Delegation**: Utilize `{#snippet child({ props })}` to delegate rendering to child components while maintaining logic in the headless layer.
- **State Integration**: Use `$state` prompts within snippet logic (e.g., Accordion expansion states).

---

> "Logic is the shape of reality; the UI is merely its expression."
