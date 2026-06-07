<script lang="ts">
    /**
     * ⚡ Svelte 5 Component Standard
     * Separation of Concerns: Logic / Structure / Style
     */

    interface Props {
        title: string
        onUpdate?: (val: number) => void
        children?: import("svelte").Snippet
    }

    // 1. Props (Runes)
    let { title, onUpdate, children }: Props = $props()

    // 2. State (Runes)
    let count = $state(0)
    let isHovered = $state(false)

    // 3. Derived (Runes)
    let double = $derived(count * 2)

    // 4. Logic
    function increment() {
        count += 1
        onUpdate?.(count)
    }
</script>

<article
    class="c-card"
    role="group"
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
>
    <header class="c-card__header">
        <h2 class="c-card__title">{title}</h2>
    </header>

    <div class="c-card__body">
        <p>Value: {count} (Double: {double})</p>

        {#if children}
            <div class="c-card__content">
                {@render children()}
            </div>
        {/if}
    </div>

    <footer class="c-card__footer">
        <button class="c-btn" onclick={increment}> Increment </button>
    </footer>
</article>

<style>
    /* Church & State: Styles belong here, scoped. Enforce token-based styling. */

    .c-card {
        background: var(--color-bg-card, #fff);
        border-radius: var(--border-radius-m, 4px);
        padding: var(--spacing-m, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-s, 8px);
    }

    .c-card__title {
        font-size: var(--font-size-h5, 1.25rem);
        font-weight: var(--font-weight-bold, bold);
    }

    .c-card__footer {
        display: flex;
        justify-content: flex-end;
    }

    .c-btn {
        background: var(--color-primary, #0070f3);
        color: var(--color-text-on-primary, #fff);
        padding: var(--spacing-xs, 8px) var(--spacing-s, 16px);
        border-radius: var(--border-radius-s, 4px);
        transition: opacity 0.2s ease;
    }

    .c-btn:hover {
        opacity: 0.85;
    }
</style>
