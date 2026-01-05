/// <reference lib="webworker" />
import { calculateChain } from "@/lib/calculators/factory-calc";
import type {
  FactoryWorkerMessage,
  FactoryWorkerResponse,
} from "@/lib/workers/factory-calc-worker.types";

declare const self: DedicatedWorkerGlobalScope;

const ENV_PROFILE_FACTORY =
  process.env.NEXT_PUBLIC_PROFILE_FACTORY_CALC === "true";

self.addEventListener("message", (event) => {
  const data = event.data as FactoryWorkerMessage;
  if (!data || data.type !== "calc") return;

  const profile = data.payload.profile ?? ENV_PROFILE_FACTORY;

  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const started = now();

  try {
    const { nodes, edges, byproducts } = calculateChain({
      ...data.payload,
      enabledAlternates: new Set(data.payload.enabledAlternates),
      disabledBaseRecipes: new Set(data.payload.disabledBaseRecipes),
    });
    const response: FactoryWorkerResponse = {
      type: "calc-result",
      id: data.id,
      nodes,
      edges,
      byproducts,
    };

    self.postMessage(response satisfies FactoryWorkerResponse);

    if (profile) {
      const durationMs = Number((now() - started).toFixed(2));
      console.info("[factory-prof][worker]", {
        target: data.payload.targetItemId,
        rate: data.payload.targetRate,
        nodes: nodes.length,
        edges: edges.length,
        byproducts: byproducts.length,
        ms: durationMs,
      });
    }
  } catch (error) {
    const failure: FactoryWorkerResponse = {
      type: "calc-error",
      id: data.id,
      error: error instanceof Error ? error.message : "Calculation failed",
    };

    self.postMessage(failure satisfies FactoryWorkerResponse);

    if (profile) {
      const durationMs = Number((now() - started).toFixed(2));
      console.info("[factory-prof][worker-error]", {
        target: data.payload.targetItemId,
        rate: data.payload.targetRate,
        ms: durationMs,
        error:
          error instanceof Error ? error.message : "Unknown worker calc error",
      });
    }
  }
});
