# Advanced Svelte 5 Reactive & Async Patterns

## Attachments (`{@attach}`)

Attachments run lifecycle code when an element is mounted to the DOM or when read state updates. Available in Svelte 5.29+.

```svelte
<script lang="ts">
  function tooltip(content: string) {
    return (element: HTMLElement) => {
      const instance = tippy(element, { content });
      return () => instance.destroy(); // Teardown callback
    };
  }

  let text = $state("Hover message");
</script>

<button {@attach tooltip(text)}>Hover Me</button>
```

Attachments can be passed to components. Component prop spreading forwards attachments mapped via internal Symbols:

```svelte
<!-- Button.svelte -->
<script lang="ts">
  let { children, ...props } = $props();
</script>

<button {...props}>{@render children?.()}</button>
```

---

## Async Svelte (`experimental.async`)

Enable `compilerOptions.experimental.async = true` in `svelte.config.js` to use `await` directly in top-level scripts, `$derived(...)`, and inline markup:

```svelte
<script lang="ts">
  import { fetchUser } from "$lib/api";

  let id = $state(1);
  let user = $derived(await fetchUser(id));
</script>

<svelte:boundary>
  <p>User: {user.name}</p>

  {#snippet pending()}
    <p>Loading user data...</p>
  {/snippet}
</svelte:boundary>
```

### Loading Boundaries & Utilities

- `<svelte:boundary>`: Mandatory boundary wrapper with a `pending` snippet when using async expressions.
- `settled()`: Returns a promise that resolves when all pending reactive DOM updates finish.
- `fork(fn)`: Preloads speculative async rendering paths (e.g., hover-triggered navigation).

---

## Hydratable API (`hydratable`)

Prevents duplicate client-side data fetching during SSR hydration by serializing server results into the document head:

```svelte
<script lang="ts">
  import { hydratable } from "svelte";
  import { fetchUser } from "$lib/db";

  const user = await hydratable("user-data", () => fetchUser());
</script>

<h1>{user.name}</h1>
```

---

## Event Subscribers (`createSubscriber`)

Integrates external non-Svelte event sources (WebSockets, MediaQueries, ResizeObservers) into Svelte's signal runtime:

```ts
import { createSubscriber } from "svelte/reactivity";
import { on } from "svelte/events";

export class MediaQuery {
  #query: MediaQueryList;
  #subscribe: () => void;

  constructor(query: string) {
    this.#query = window.matchMedia(`(${query})`);
    this.#subscribe = createSubscriber((update) => {
      const off = on(this.#query, "change", update);
      return () => off();
    });
  }

  get current() {
    this.#subscribe();
    return this.#query.matches;
  }
}
```
