<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    count?: number;
    headerSnippet?: Snippet<[title: string]>;
    onchange?: (newCount: number) => void;
  }

  let {
    title,
    count = $bindable(0),
    headerSnippet,
    onchange
  }: Props = $props();

  const uid = $props.id();
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
    onchange?.(count);
  }
</script>

<div class="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl">
  {#if headerSnippet}
    {@render headerSnippet(title)}
  {:else}
    <h2 id="{uid}-heading" class="font-mono text-lg font-bold text-amber-500">{title}</h2>
  {/if}

  <div class="mt-4 flex items-center gap-4">
    <button
      onclick={increment}
      class={{
        "rounded px-4 py-2 font-mono text-sm font-semibold transition-colors": true,
        "bg-amber-600 text-black hover:bg-amber-500": count < 10,
        "bg-emerald-600 text-white hover:bg-emerald-500": count >= 10
      }}
    >
      Increment Count
    </button>
    <span class="font-mono text-sm text-zinc-400">
      Value: <strong class="text-white">{count}</strong> (Doubled: <strong class="text-amber-400">{doubled}</strong>)
    </span>
  </div>
</div>
