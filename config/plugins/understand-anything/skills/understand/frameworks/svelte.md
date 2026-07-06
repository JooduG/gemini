# Svelte 5 Framework Addendum

> Injected into file-analyzer and architecture-analyzer prompts when Svelte is detected.
> Do NOT use as a standalone prompt — always appended to the base prompt template.

## Svelte 5 (Runes) Project Structure

When analyzing a Svelte 5 project, apply these additional conventions on top of the base analysis rules, focusing heavily on Svelte 5's Runes paradigm (`$state`, `$derived`, `$effect`, `{@render}`).

### Canonical File Roles

| File / Pattern | Role | Tags |
|---|---|---|
| `+layout.svelte`, `+page.svelte` | Route layouts and pages (SvelteKit) | `ui`, `routing` |
| `*.svelte.js`, `*.svelte.ts` | Universal reactive state modules (Runes outside of components) | `state`, `reactive` |
| `components/*.svelte`, `ui/*.svelte` | Reusable Svelte components | `ui`, `component` |
| `actions/*.js`, `actions/*.ts` | Svelte actions (functions returned with `update`/`destroy` for DOM nodes) | `ui`, `action` |
| `stores/*.js`, `state/*.js` | Global/shared reactive state definitions using `$state` or classes | `state`, `service` |
| `utils/*.ts`, `lib/*.ts` | Pure utility functions and engine mechanics | `utility` |

### Edge Patterns to Look For

**Component composition** — When a parent component renders a child component `<Child />` in its markup, create `contains` edges from the parent to the child component file.

**Snippets rendering** — When a component passes a Svelte 5 snippet `{#snippet ...}` to another component, create a `publishes` edge from the parent, or a `contains` edge to indicate complex UI tree nesting.

**Reactive State Sharing (`*.svelte.js`)** — When a component imports shared state variables or reactive classes from a `.svelte.js` file, create `reads_from` or `depends_on` edges from the consumer to the state module.

**Context provider/consumer** — When components use `setContext` and `getContext` to pass reactive boundaries, create `publishes` edges from the provider and `subscribes` edges from the consumer to the context key definition.

**Svelte Actions (`use:action`)** — When a DOM element uses a Svelte action (e.g., `<div use:clickOutside>`), create `depends_on` edges from the component to the action definition.

### Architectural Layers for Svelte

Assign nodes to these layers when detected:

| Layer ID | Layer Name | What Goes Here |
|---|---|---|
| `layer:ui` | UI Layer | `*.svelte` files, components, routes, atoms, molecules, organisms |
| `layer:state` | State Layer | `*.svelte.js`/`.ts` files containing `$state` and `$derived` logic |
| `layer:service` | Service Layer | API calls, data fetching, async lifecycle managers |
| `layer:utility` | Utility Layer | Pure functions, formatters, type definitions |
| `layer:config` | Config Layer | `svelte.config.js`, `vite.config.js`, `tailwind.config.js` |

### Notable Patterns to Capture in languageLesson

- **Svelte 5 Runes**: State management uses fine-grained reactivity via `$state` and `$derived` macros instead of traditional stores or `export let`.
- **Reactive Classes**: Instead of complex store subscriptions, Svelte 5 often uses ES6 classes with `$state` properties to encapsulate reactive domains.
- **Snippets (`{@render}`)**: Passing reusable blocks of markup into components, replacing older `<slot>` patterns for higher performance and type safety.
- **Svelte Actions**: DOM-level lifecycle hooks (`use:`) that encapsulate direct DOM manipulation without cluttering the component logic.
