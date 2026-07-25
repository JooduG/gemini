<script lang="ts">
  import { onMount, onDestroy, type Snippet } from "svelte";
  import { usePortalRegistry } from "./portal-registry.svelte";

  interface Props {
    nodeId: string;
    children: Snippet;
  }

  let { nodeId, children }: Props = $props();
  const registry = usePortalRegistry();
  let containerElement = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (containerElement && containerElement.firstElementChild) {
      const liveNode = containerElement.firstElementChild as HTMLElement;
      registry.registerNode(nodeId, liveNode, containerElement);
    }
  });

  onDestroy(() => {
    registry.unregisterNode(nodeId);
  });
</script>

<div class="hidden-limbo" style="display: none;" bind:this={containerElement}>
  <div class="contents-wrapper" style="display: contents;">
    {@render children()}
  </div>
</div>
