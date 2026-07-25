# Solid-State View Transitions in Svelte 5

## The Limbo-Portal Pattern

When moving components across layout slots or pages, standard unmounting destroys active state and breaks View Transitions, causing a fallback cross-fade. The Limbo-Portal pattern solves this by reparenting DOM nodes in-place without unmounting.

### Structure

1. **Limbo Container**: Persistent hidden container (`display: none`) mounted high in the app hierarchy that keeps live DOM nodes alive in memory.
2. **Portal Slots**: Target placeholders in active layout views.
3. **Teleportation Registry**: Reactive module (`.svelte.ts`) tracking node assignments and migrating nodes via native `appendChild`.

```text
[ Application Root Shell ]
   ├── [ Limbo Container ] (Holds persistent live nodes)
   └── [ Active View Layout ]
          └── [ Target Portal Slot ] <── (Migrates node via appendChild)
```

---

## Synchronous State Execution (`flushSync`)

Force synchronous DOM flushes inside `document.startViewTransition()` so the browser captures the updated visual state:

```typescript
import { flushSync } from "svelte";

document.startViewTransition(() => {
  flushSync(() => {
    activeLayout = targetLayout;
  });
});
```

---

## CSS Rigid-Body Morphing Rules

Suppress default opacity blending to enforce geometric scaling/translation morphs:

```css
::view-transition-old(machinery-card) {
  animation: none;
  opacity: 0 !important;
  mix-blend-mode: normal !important;
}

::view-transition-new(machinery-card) {
  animation: none;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
  height: 100% !important;
  width: 100% !important;
}

::view-transition-group(machinery-card) {
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Set nested child `view-transition-name` assignments to `"none"` during macro layout shifts to prevent child elements from drifting outside parent boundaries.
