<script lang="ts">
  import { onDestroy } from "svelte";
  import { usePortalRegistry } from "./portal-registry.svelte";

  interface Props {
    portalId: string;
    nodeId: string;
  }

  let { portalId, nodeId }: Props = $props();
  const registry = usePortalRegistry();
  let targetContainer = $state<HTMLDivElement | null>(null);

  $effect(() => {
    const currentTarget = registry.getCurrentTarget(nodeId);
    const element = registry.getNodeReference(nodeId);

    if (currentTarget === portalId && element && targetContainer) {
      if (targetContainer.firstElementChild !== element) {
        targetContainer.appendChild(element);
      }
    }
  });

  onDestroy(() => {
    registry.reclaimToLimbo(nodeId, portalId);
  });
</script>

<div class="portal-slot-wrapper contents" bind:this={targetContainer} data-portal-id={portalId}></div>
