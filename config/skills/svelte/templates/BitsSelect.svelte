<script lang="ts">
  import { Select } from "bits-ui";

  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: Option[];
    value?: string;
    placeholder?: string;
    label?: string;
    name?: string;
    onchange?: (val: string) => void;
  }

  let {
    options,
    value = $bindable(""),
    placeholder = "Select option...",
    label,
    name,
    onchange
  }: Props = $props();
</script>

<div class="flex w-full max-w-xs flex-col gap-1.5">
  {#if label}
    <label class="font-mono text-xs font-semibold text-zinc-400">{label}</label>
  {/if}

  <Select.Root
    type="single"
    bind:value
    {name}
    onValueChange={(val) => onchange?.(val)}
  >
    <Select.Trigger
      class="flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white shadow-sm focus:border-amber-500 focus:outline-none"
    >
      <Select.Value {placeholder}>
        {#snippet child({ props, selection, placeholder: ph })}
          <div {...props} class="flex items-center gap-1.5 truncate">
            {#if selection.type === "single" && selection.selected}
              <span class="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                {selection.selected.label}
              </span>
            {:else}
              <span class="text-zinc-500">{ph}</span>
            {/if}
          </div>
        {/snippet}
      </Select.Value>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content
        class="z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 p-1 text-white shadow-md"
      >
        <Select.Viewport class="p-1">
          {#each options as option (option.value)}
            <Select.Item
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              class="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-zinc-800 data-[highlighted]:text-amber-400 data-[disabled]:opacity-50"
            >
              {#snippet children({ selected })}
                {#if selected}
                  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-amber-500">
                    ✓
                  </span>
                {/if}
                {option.label}
              {/snippet}
            </Select.Item>
          {/each}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</div>
