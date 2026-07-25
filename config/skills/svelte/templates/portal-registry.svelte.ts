import { setContext, getContext, flushSync } from "svelte";

class PortalRegistry {
  #nodes = $state<Map<string, HTMLElement>>(new Map());
  #limboContainers = $state<Map<string, HTMLElement>>(new Map());
  #layoutTargets = $state<Map<string, string>>(new Map());

  registerNode(id: string, node: HTMLElement, limboContainer: HTMLElement) {
    this.#nodes.set(id, node);
    this.#limboContainers.set(id, limboContainer);
    if (!this.#layoutTargets.has(id)) {
      this.#layoutTargets.set(id, "");
    }
  }

  unregisterNode(id: string) {
    this.#nodes.delete(id);
    this.#limboContainers.delete(id);
    this.#layoutTargets.delete(id);
  }

  getCurrentTarget(id: string): string {
    return this.#layoutTargets.get(id) || "";
  }

  getNodeReference(id: string): HTMLElement | undefined {
    return this.#nodes.get(id);
  }

  repositionElement(id: string, targetPortalId: string) {
    if (!document.startViewTransition) {
      this.#layoutTargets.set(id, targetPortalId);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        this.#layoutTargets.set(id, targetPortalId);
      });
    });
  }

  reclaimToLimbo(id: string, portalId: string) {
    if (this.#layoutTargets.get(id) === portalId) {
      this.#layoutTargets.set(id, "");
      const element = this.#nodes.get(id);
      const limbo = this.#limboContainers.get(id);
      if (element && limbo) {
        limbo.appendChild(element);
      }
    }
  }
}

const REGISTRY_SYMBOL = Symbol("PORTAL_REGISTRY");

export function initPortalRegistry(): PortalRegistry {
  const registry = new PortalRegistry();
  setContext(REGISTRY_SYMBOL, registry);
  return registry;
}

export function usePortalRegistry(): PortalRegistry {
  return getContext<PortalRegistry>(REGISTRY_SYMBOL);
}
