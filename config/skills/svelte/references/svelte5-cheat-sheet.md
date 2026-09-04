# Svelte 5 Deep Reactivity & Syntax Cheat Sheet

## Core Runes Reference

### `$state`, `$state.raw`, & `$state.snapshot`

- `$state(initialValue)`: Creates fine-grained, deeply reactive state proxies. Mutating inner properties of objects/arrays triggers targeted UI updates.
- `$state.raw(initialValue)`: Creates shallow reactive state. Updates trigger ONLY on reassignment (`value = newObj`), avoiding proxy overhead for large immutable payloads.
- `$state.snapshot(state)`: Returns an unproxied, deep clone of a state object for safe external mutation or serialization.

### `$derived` & Direct Reassignment

- `$derived(expression)`: Synchronous computed signal that updates automatically when dependency signals mutate.
- `$derived.by(() => { ... })`: Used when computed logic requires multiple statements, loops, or local variables.
- **Direct Reassignment**: Derived state can be directly reassigned for features like optimistic UI. The assigned value persists until any dependency of the original `$derived` expression updates, at which point it automatically resets to the computed value:

  ```svelte
  <script lang="ts">
    let { post } = $props();
    let likes = $derived(post.likes);

    async function handleLike() {
      likes += 1; // Optimistic update
      try { await post.like(); } catch { likes -= 1; }
    }
  </script>
  ```

### `$effect`, `$effect.pre`, & `$inspect`

- `$effect(() => { ... })`: Runs side-effects (canvas drawing, DOM measurements, network requests). Do not mutate state inside effects.
- `$effect.pre(() => { ... })`: Executes side-effects *before* DOM updates are flushed to the document.
- `$inspect(value)`: Console logs reactive changes during development. Returns `.with((type, val) => ...)` for custom logging.
- `$inspect.trace(label)`: Must be the first statement in a function body to print which reactive dependencies caused an effect or derivation to re-run.

### `$props`, `$props.id()`, & `$bindable`

- `$props()`: Declares component inputs.
- `$props.id()`: Generates a unique, deterministic ID string for the component instance (e.g., for linking form labels to inputs):

```svelte
<script lang="ts">
  const uid = $props.id();
</script>
<label for="{uid}-input">Name</label>
<input id="{uid}-input" type="text" />
```

- `$bindable(defaultVal)`: Marks a prop as eligible for two-way binding (`bind:value`).

---

## Native Object Syntax for `class` Directives

Svelte 5 natively supports objects for the `class` attribute, toggling keys based on truthy boolean values:

```svelte
<script lang="ts">
  let { isActive = false, isDanger = false } = $props();
</script>

<div class={{
  "btn-base": true,
  "bg-amber-500 text-black": isActive,
  "border-red-500 text-red-500": isDanger
}}>
  Status
</div>
```

---

## Keyed Each Blocks & Function Bindings

### Keyed `{#each}` Blocks

Always provide a unique key expression (prefer IDs over indexes) to allow surgical insertion and removal of DOM nodes:

```svelte
{#each items as item (item.id)}
  <li>{item.name}</li>
{/each}
```

### Function Bindings (`bind:property={get, set}`)

Allows explicit validation and transformation during two-way binding:

```svelte
<input bind:value={() => value, (v) => (value = v.toLowerCase())} />
```

For read-only dimension bindings, set the `get` function to `null`:

```svelte
<div bind:clientWidth={null, (w) => (width = w)}></div>
```

---

## Snippets vs Slots

Snippets replace `<slot>` mechanics with typed markup blocks:

```svelte
{#snippet header(title: string)}
  <header><h1>{title}</h1></header>
{/snippet}

{@render header("System Overview")}
```

---

## Migration Matrix

| Legacy Svelte 4 Pattern          | Modern Svelte 5 Replacement                             |
| -------------------------------- | ------------------------------------------------------- |
| `export let title = "Default"`   | `let { title = "Default" } = $props()`                  |
| `$: double = count * 2`          | `let double = $derived(count * 2)`                      |
| `$: { console.log(count); }`     | `$effect(() => { console.log(count); })`                |
| `<slot name="header" />`         | `{#snippet header()}` + `{@render header()}`            |
| `on:click={handleClick}`         | `onclick={handleClick}`                                 |
| `createEventDispatcher()`        | Callback function props (`let { onsubmit } = $props()`) |
| `<svelte:component this={Comp}>` | `<Comp />`                                              |
| `writable(0)` / `readable()`     | Classes with `$state` fields in `.svelte.ts`            |
| Custom ID counters               | `$props.id()`                                           |
| `class:active={isActive}`        | `class={{ "active": isActive }}`                        |
