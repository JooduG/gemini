<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { Dialog, type WithoutChildrenOrChild } from "bits-ui";

  type Props = WithoutChildrenOrChild<Dialog.ContentProps> & {
    title: string;
    description?: string;
    open?: boolean;
    trigger?: Snippet;
    children?: Snippet;
    escapeKeydownBehavior?: "close" | "ignore" | "defer-otherwise-close" | "defer-otherwise-ignore";
    interactOutsideBehavior?: "close" | "ignore" | "defer-otherwise-close" | "defer-otherwise-ignore";
  };

  let {
    title,
    description,
    open = $bindable(false),
    trigger,
    children,
    escapeKeydownBehavior = "close",
    interactOutsideBehavior = "close",
    ...restProps
  }: Props = $props();
</script>

<Dialog.Root bind:open>
  {#if trigger}
    <Dialog.Trigger>
      {#snippet child({ props })}
        <div {...props} style="display: inline-block;">
          {@render trigger()}
        </div>
      {/snippet}
    </Dialog.Trigger>
  {/if}

  <Dialog.Portal>
    <Dialog.Overlay forceMount>
      {#snippet child({ props, open: isOpen })}
        {#if isOpen}
          <div
            {...props}
            transition:fade={{ duration: 150 }}
            class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          ></div>
        {/if}
      {/snippet}
    </Dialog.Overlay>

    <Dialog.Content
      forceMount
      {escapeKeydownBehavior}
      {interactOutsideBehavior}
      {...restProps}
    >
      {#snippet child({ props, open: isOpen })}
        {#if isOpen}
          <div
            {...props}
            transition:fly={{ y: 12, duration: 200 }}
            class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-[calc(50%-var(--bits-dialog-nested-count,0)*1rem)] scale-[calc(1-var(--bits-dialog-nested-count,0)*0.04)] rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl transition-all focus:outline-none"
            style="filter: blur(calc(var(--bits-dialog-nested-count, 0) * 1.5px));"
          >
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <Dialog.Title class="font-mono text-lg font-bold text-amber-500">
                  {title}
                </Dialog.Title>
                {#if description}
                  <Dialog.Description class="mt-1 text-sm text-zinc-400">
                    {description}
                  </Dialog.Description>
                {/if}
              </div>

              <Dialog.Close
                class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </Dialog.Close>
            </div>

            <div class="py-4">
              {@render children?.()}
            </div>
          </div>
        {/if}
      {/snippet}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
