/**
 * Factory Planner Store
 *
 * Manages state for the factory planning feature including:
 * - Target item and production rate
 * - Enabled/disabled alternate recipes
 * - Calculated production chain
 * - React Flow nodes and edges
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDefaultRecipes } from "@/lib/data";
import {
  calculateChain,
  SOMERSLOOP_OUTPUT_MULTIPLIER,
  SOMERSLOOP_POWER_MULTIPLIER,
  type ProductionNode,
  type ProductionEdge,
  type EnabledRecipes,
  type BuildingOverride,
  type Byproduct,
} from "@/lib/calculators/factory-calc";
import type {
  FactoryWorkerRequest,
  FactoryWorkerResponse,
  WorkerCalculatePayload,
} from "@/lib/workers/factory-calc-worker.types";

const PROFILE_FLAG_STORAGE_KEY = "satisfactory-profile-factory-calc";
const ENV_PROFILE_FACTORY =
  process.env.NEXT_PUBLIC_PROFILE_FACTORY_CALC === "true" ||
  process.env.NODE_ENV === "development";

const shouldProfileFactory = () => {
  if (typeof window === "undefined") return ENV_PROFILE_FACTORY;

  const stored = window.localStorage.getItem(PROFILE_FLAG_STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;

  const params = new URLSearchParams(window.location.search);
  if (
    params.get("profileFactory") === "1" ||
    params.get("profileFactory") === "true"
  ) {
    return true;
  }

  return ENV_PROFILE_FACTORY;
};

let factoryWorker: Worker | null = null;
let workerRequestId = 0;
let lastCalcKey: string | null = null;
let lastCalcResult: {
  nodes: ProductionNode[];
  edges: ProductionEdge[];
  byproducts: Byproduct[];
} | null = null;

const getFactoryWorker = () => {
  if (typeof window === "undefined") return null;
  if (factoryWorker) return factoryWorker;

  try {
    factoryWorker = new Worker(
      new URL("../workers/factory-calc.worker.ts", import.meta.url),
      { type: "module" }
    );
    factoryWorker.addEventListener("error", () => {
      factoryWorker?.terminate();
      factoryWorker = null;
    });
    return factoryWorker;
  } catch (error) {
    console.error("Failed to start factory worker", error);
    factoryWorker = null;
    return null;
  }
};

export type { ProductionNode, ProductionEdge, EnabledRecipes };

export interface FactoryPlanSnapshot {
  targetItemId: string | null;
  targetRate: number;
  clockSpeed: number;
  enabledAlternates: string[];
  selectedRecipes: EnabledRecipes;
  customResourceLimits?: Record<string, number>;
  buildingOverrides?: Record<string, BuildingOverride>;
  disabledBaseRecipes?: string[];
  byproductHandlers?: Record<string, string | null>;
  somersloopOutputMultiplier?: number;
  somersloopPowerMultiplier?: number;
}

export type { BuildingOverride };

interface FactoryState {
  // Target configuration
  targetItemId: string | null;
  targetRate: number;
  clockSpeed: number; // percentage (0-250)

  // Recipe selection
  enabledAlternates: Set<string>; // Set of enabled alternate recipe IDs
  selectedRecipes: EnabledRecipes; // User's recipe choices per output item
  disabledBaseRecipes: Set<string>;

  // Calculated production chain
  productionNodes: ProductionNode[];
  productionEdges: ProductionEdge[];
  byproducts: Byproduct[];
  byproductHandlers: Record<string, string | null>;

  // Somersloop tuning
  somersloopOutputMultiplier: number;
  somersloopPowerMultiplier: number;

  // Resource limit overrides keyed by itemId
  customResourceLimits: Record<string, number>;

  // Per-building overrides keyed by buildingId
  buildingOverrides: Record<string, BuildingOverride>;

  // UI state
  isCalculating: boolean;
  lastError: string | null;

  // Actions
  setTargetItem: (itemId: string | null) => void;
  setTargetRate: (rate: number) => void;
  setClockSpeed: (speed: number) => void;
  toggleAlternateRecipe: (recipeId: string) => void;
  enableAlternateRecipe: (recipeId: string) => void;
  disableAlternateRecipe: (recipeId: string) => void;
  toggleBaseRecipe: (recipeId: string) => void;
  enableBaseRecipe: (recipeId: string) => void;
  disableBaseRecipe: (recipeId: string) => void;
  setSelectedRecipe: (itemId: string, recipeId: string) => void;
  calculateProductionChain: () => void;
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
  resetFactory: () => void;
  exportPlan: () => FactoryPlanSnapshot;
  importPlan: (json: string) => boolean;

  setCustomResourceLimit: (itemId: string, maxRate: number | null) => void;
  clearCustomResourceLimits: () => void;

  setBuildingOverrideClock: (
    buildingId: string,
    clockSpeed: number | null
  ) => void;
  setBuildingOverrideSomersloop: (
    buildingId: string,
    somersloop: boolean
  ) => void;
  clearBuildingOverrides: () => void;

  setSomersloopMultiplier: (multiplier: number) => void;

  setByproductHandler: (itemId: string, recipeId: string | null) => void;
  clearByproductHandlers: () => void;
}

export { SOMERSLOOP_OUTPUT_MULTIPLIER, SOMERSLOOP_POWER_MULTIPLIER };

export const useFactoryStore = create<FactoryState>()(
  persist(
    (set, get) => {
      let calcTimeout: ReturnType<typeof setTimeout> | null = null;

      const buildCalcKey = (payload: WorkerCalculatePayload) => {
        const sortedAlternates = [...payload.enabledAlternates].sort();
        const sortedRecipes = Object.entries(payload.selectedRecipes || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, v]);
        const sortedOverrides = Object.entries(payload.buildingOverrides || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, v]);
        const sortedDisabled = [...(payload.disabledBaseRecipes || [])].sort();
        const sortedHandlers = Object.entries(payload.byproductHandlers || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, v]);

        return JSON.stringify({
          targetItemId: payload.targetItemId,
          targetRate: payload.targetRate,
          clockSpeed: payload.clockSpeed,
          somersloopOutputMultiplier: payload.somersloopOutputMultiplier,
          somersloopPowerMultiplier: payload.somersloopPowerMultiplier,
          enabledAlternates: sortedAlternates,
          selectedRecipes: sortedRecipes,
          buildingOverrides: sortedOverrides,
          disabledBaseRecipes: sortedDisabled,
          byproductHandlers: sortedHandlers,
        });
      };

      const queueRecalc = () => {
        if (calcTimeout) clearTimeout(calcTimeout);
        calcTimeout = setTimeout(() => get().calculateProductionChain(), 120);
      };

      return {
        // Initial state
        targetItemId: null,
        targetRate: 10,
        clockSpeed: 100,
        enabledAlternates: new Set(),
        selectedRecipes: {},
        disabledBaseRecipes: new Set(),
        productionNodes: [],
        productionEdges: [],
        byproducts: [],
        byproductHandlers: {},
        somersloopOutputMultiplier: SOMERSLOOP_OUTPUT_MULTIPLIER,
        somersloopPowerMultiplier: SOMERSLOOP_POWER_MULTIPLIER,
        customResourceLimits: {},
        buildingOverrides: {},
        isCalculating: false,
        lastError: null,

        // Actions
        setTargetItem: (itemId) => {
          set({ targetItemId: itemId });
          queueRecalc();
        },

        setTargetRate: (rate) => {
          set({ targetRate: Math.max(0.1, rate) });
          queueRecalc();
        },

        setClockSpeed: (speed) => {
          const clamped = Math.max(1, Math.min(speed, 250));
          set({ clockSpeed: clamped });
          queueRecalc();
        },

        toggleAlternateRecipe: (recipeId) => {
          const { enabledAlternates } = get();
          const newSet = new Set(enabledAlternates);
          if (newSet.has(recipeId)) {
            newSet.delete(recipeId);
          } else {
            newSet.add(recipeId);
          }
          set({ enabledAlternates: newSet });
          queueRecalc();
        },

        toggleBaseRecipe: (recipeId) => {
          const { disabledBaseRecipes } = get();
          const next = new Set(disabledBaseRecipes);
          if (next.has(recipeId)) {
            next.delete(recipeId);
          } else {
            next.add(recipeId);
          }
          set({ disabledBaseRecipes: next });
          queueRecalc();
        },

        enableBaseRecipe: (recipeId) => {
          const { disabledBaseRecipes } = get();
          if (!disabledBaseRecipes.has(recipeId)) return;
          const next = new Set(disabledBaseRecipes);
          next.delete(recipeId);
          set({ disabledBaseRecipes: next });
          queueRecalc();
        },

        disableBaseRecipe: (recipeId) => {
          const { disabledBaseRecipes } = get();
          if (disabledBaseRecipes.has(recipeId)) return;
          const next = new Set(disabledBaseRecipes);
          next.add(recipeId);
          set({ disabledBaseRecipes: next });
          queueRecalc();
        },

        enableAlternateRecipe: (recipeId) => {
          const { enabledAlternates } = get();
          const newSet = new Set(enabledAlternates);
          newSet.add(recipeId);
          set({ enabledAlternates: newSet });
          queueRecalc();
        },

        disableAlternateRecipe: (recipeId) => {
          const { enabledAlternates } = get();
          const newSet = new Set(enabledAlternates);
          newSet.delete(recipeId);
          set({ enabledAlternates: newSet });
          queueRecalc();
        },

        setSelectedRecipe: (itemId, recipeId) => {
          set((state) => ({
            selectedRecipes: {
              ...state.selectedRecipes,
              [itemId]: recipeId,
            },
          }));
          queueRecalc();
        },

        calculateProductionChain: () => {
          const {
            targetItemId,
            targetRate,
            clockSpeed,
            enabledAlternates,
            selectedRecipes,
            buildingOverrides,
            disabledBaseRecipes,
            byproductHandlers,
          } = get();

          const now = () =>
            typeof performance !== "undefined" ? performance.now() : Date.now();
          const calcStarted = now();
          const logPerf = (
            label: string,
            meta: Record<string, unknown> = {}
          ) => {
            if (!shouldProfileFactory()) return;
            // Compact profiling trace
            console.info(`[factory-prof] ${label}`, {
              ms: Number((now() - calcStarted).toFixed(2)),
              ...meta,
            });
          };

          let workerDispatchedAt: number | null = null;

          if (!targetItemId) {
            set({ productionNodes: [], productionEdges: [] });
            return;
          }

          const payload: WorkerCalculatePayload = {
            targetItemId,
            targetRate,
            clockSpeed,
            somersloopOutputMultiplier: get().somersloopOutputMultiplier,
            somersloopPowerMultiplier: get().somersloopPowerMultiplier,
            enabledAlternates: Array.from(enabledAlternates),
            selectedRecipes,
            buildingOverrides,
            disabledBaseRecipes: Array.from(disabledBaseRecipes),
            byproductHandlers,
            profile: shouldProfileFactory(),
          };

          const payloadKey = buildCalcKey(payload);
          if (payloadKey && payloadKey === lastCalcKey && lastCalcResult) {
            set({
              productionNodes: lastCalcResult.nodes,
              productionEdges: lastCalcResult.edges,
              byproducts: lastCalcResult.byproducts,
              isCalculating: false,
              lastError: null,
            });
            logPerf("cache-hit", {
              nodes: lastCalcResult.nodes.length,
              edges: lastCalcResult.edges.length,
            });
            return;
          }

          const handleLocalCalculation = () => {
            try {
              const { nodes, edges, byproducts } = calculateChain({
                targetItemId,
                targetRate,
                clockSpeed,
                enabledAlternates,
                selectedRecipes,
                buildingOverrides,
                disabledBaseRecipes,
                byproductHandlers,
              });
              set({
                productionNodes: nodes,
                productionEdges: edges,
                byproducts,
                isCalculating: false,
              });
              lastCalcKey = payloadKey;
              lastCalcResult = { nodes, edges, byproducts };
              logPerf("local-calc", {
                nodes: nodes.length,
                edges: edges.length,
              });
            } catch (error) {
              set({
                lastError:
                  error instanceof Error ? error.message : "Calculation failed",
                isCalculating: false,
              });
              logPerf("local-calc-error", {
                message: error instanceof Error ? error.message : String(error),
              });
            }
          };

          set({ isCalculating: true, lastError: null });

          const worker = getFactoryWorker();
          if (!worker) {
            logPerf("worker-unavailable-fallback");
            handleLocalCalculation();
            return;
          }

          const requestId = ++workerRequestId;

          const cleanup = () => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
          };

          const onMessage = (event: MessageEvent<FactoryWorkerResponse>) => {
            const data = event.data;
            if (!data || data.id !== requestId) return;

            if (data.type === "calc-result") {
              cleanup();
              set({
                productionNodes: data.nodes,
                productionEdges: data.edges,
                byproducts: data.byproducts,
                isCalculating: false,
              });
              lastCalcKey = payloadKey;
              lastCalcResult = {
                nodes: data.nodes,
                edges: data.edges,
                byproducts: data.byproducts,
              };
              logPerf("worker-result", {
                nodes: data.nodes.length,
                edges: data.edges.length,
                workerMs:
                  workerDispatchedAt !== null
                    ? Number((now() - workerDispatchedAt).toFixed(2))
                    : undefined,
              });
            } else if (data.type === "calc-error") {
              cleanup();
              set({
                lastError: data.error || "Calculation failed",
                isCalculating: false,
              });
              logPerf("worker-error", { message: data.error });
            }
          };

          const onError = (event: ErrorEvent) => {
            console.error("Factory worker error", event);
            cleanup();
            logPerf("worker-crash-fallback", {
              message: event.message,
            });
            handleLocalCalculation();
          };

          worker.addEventListener("message", onMessage);
          worker.addEventListener("error", onError);

          try {
            const message: FactoryWorkerRequest = {
              type: "calc",
              id: requestId,
              payload,
            };

            workerDispatchedAt = now();
            worker.postMessage(message);
          } catch (error) {
            console.error("Failed to post calculation to worker", error);
            cleanup();
            logPerf("worker-post-failed", {
              message: error instanceof Error ? error.message : String(error),
            });
            handleLocalCalculation();
          }
        },

        updateNodePosition: (nodeId, position) => {
          set((state) => ({
            productionNodes: state.productionNodes.map((node) =>
              node.id === nodeId ? { ...node, position } : node
            ),
          }));
        },

        resetFactory: () => {
          set({
            targetItemId: null,
            targetRate: 10,
            clockSpeed: 100,
            selectedRecipes: {},
            disabledBaseRecipes: new Set(),
            productionNodes: [],
            productionEdges: [],
            customResourceLimits: {},
            buildingOverrides: {},
            byproductHandlers: {},
            somersloopOutputMultiplier: SOMERSLOOP_OUTPUT_MULTIPLIER,
            somersloopPowerMultiplier: SOMERSLOOP_POWER_MULTIPLIER,
            lastError: null,
          });
        },

        exportPlan: () => {
          const state = get();
          return {
            targetItemId: state.targetItemId,
            targetRate: state.targetRate,
            clockSpeed: state.clockSpeed,
            somersloopOutputMultiplier: state.somersloopOutputMultiplier,
            somersloopPowerMultiplier: state.somersloopPowerMultiplier,
            enabledAlternates: Array.from(state.enabledAlternates),
            selectedRecipes: state.selectedRecipes,
            customResourceLimits: state.customResourceLimits,
            buildingOverrides: state.buildingOverrides,
            disabledBaseRecipes: Array.from(state.disabledBaseRecipes),
            byproductHandlers: state.byproductHandlers,
          };
        },

        importPlan: (json) => {
          try {
            const data = JSON.parse(json) as FactoryPlanSnapshot;
            set({
              targetItemId: data.targetItemId ?? null,
              targetRate: Math.max(0.1, data.targetRate ?? 0),
              clockSpeed: Math.max(1, Math.min(data.clockSpeed ?? 100, 250)),
              somersloopOutputMultiplier:
                data.somersloopOutputMultiplier ?? SOMERSLOOP_OUTPUT_MULTIPLIER,
              somersloopPowerMultiplier:
                data.somersloopPowerMultiplier ?? SOMERSLOOP_POWER_MULTIPLIER,
              enabledAlternates: new Set(data.enabledAlternates ?? []),
              selectedRecipes: data.selectedRecipes ?? {},
              customResourceLimits: data.customResourceLimits ?? {},
              buildingOverrides: data.buildingOverrides ?? {},
              disabledBaseRecipes: new Set(data.disabledBaseRecipes ?? []),
              byproductHandlers: data.byproductHandlers ?? {},
            });
            get().calculateProductionChain();
            return true;
          } catch (error) {
            console.error("Failed to import factory plan", error);
            return false;
          }
        },

        setCustomResourceLimit: (itemId, maxRate) => {
          set((state) => {
            const next = { ...state.customResourceLimits };
            if (maxRate === null || Number.isNaN(maxRate) || maxRate <= 0) {
              delete next[itemId];
            } else {
              next[itemId] = maxRate;
            }
            return { customResourceLimits: next };
          });
          queueRecalc();
        },

        clearCustomResourceLimits: () => {
          set({ customResourceLimits: {} });
          queueRecalc();
        },

        setBuildingOverrideClock: (buildingId, clockSpeed) => {
          set((state) => {
            const next = { ...state.buildingOverrides };
            if (clockSpeed === null || Number.isNaN(clockSpeed)) {
              const existing = next[buildingId];
              if (existing?.somersloop) {
                next[buildingId] = { somersloop: existing.somersloop };
              } else {
                delete next[buildingId];
              }
            } else {
              const clamped = Math.max(1, Math.min(clockSpeed, 250));
              next[buildingId] = {
                ...next[buildingId],
                clockSpeed: clamped,
              };
            }
            return { buildingOverrides: next };
          });
          queueRecalc();
        },

        setBuildingOverrideSomersloop: (buildingId, somersloop) => {
          set((state) => {
            const next = { ...state.buildingOverrides };
            if (somersloop) {
              next[buildingId] = {
                ...next[buildingId],
                somersloop,
              };
            } else {
              const existing = next[buildingId];
              if (existing?.clockSpeed !== undefined) {
                next[buildingId] = { clockSpeed: existing.clockSpeed };
              } else {
                delete next[buildingId];
              }
            }
            return { buildingOverrides: next };
          });
          queueRecalc();
        },

        setSomersloopMultiplier: (multiplier) => {
          const clamped = Math.max(1, Math.min(multiplier, 2));
          set({
            somersloopOutputMultiplier: clamped,
            somersloopPowerMultiplier: clamped,
          });
          queueRecalc();
        },

        clearBuildingOverrides: () => {
          set({ buildingOverrides: {} });
          queueRecalc();
        },

        setByproductHandler: (itemId, recipeId) => {
          set((state) => ({
            byproductHandlers: {
              ...state.byproductHandlers,
              [itemId]: recipeId || null,
            },
          }));
          queueRecalc();
        },

        clearByproductHandlers: () => {
          set({ byproductHandlers: {} });
          queueRecalc();
        },
      };
    },
    {
      name: "satisfactory-factory-store",
      partialize: (state) => ({
        targetItemId: state.targetItemId,
        targetRate: state.targetRate,
        clockSpeed: state.clockSpeed,
        somersloopOutputMultiplier: state.somersloopOutputMultiplier,
        somersloopPowerMultiplier: state.somersloopPowerMultiplier,
        enabledAlternates: Array.from(state.enabledAlternates),
        selectedRecipes: state.selectedRecipes,
        customResourceLimits: state.customResourceLimits,
        buildingOverrides: state.buildingOverrides,
        disabledBaseRecipes: Array.from(state.disabledBaseRecipes),
        byproductHandlers: state.byproductHandlers,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<FactoryState> & {
          enabledAlternates?: string[];
          customResourceLimits?: Record<string, number>;
          buildingOverrides?: Record<string, BuildingOverride>;
          disabledBaseRecipes?: string[];
          byproductHandlers?: Record<string, string | null>;
          somersloopOutputMultiplier?: number;
          somersloopPowerMultiplier?: number;
        };
        return {
          ...current,
          ...persistedState,
          enabledAlternates: new Set(persistedState.enabledAlternates || []),
          customResourceLimits: persistedState.customResourceLimits || {},
          buildingOverrides: persistedState.buildingOverrides || {},
          disabledBaseRecipes: new Set(
            persistedState.disabledBaseRecipes || []
          ),
          byproductHandlers: persistedState.byproductHandlers || {},
          somersloopOutputMultiplier:
            persistedState.somersloopOutputMultiplier ??
            current.somersloopOutputMultiplier,
          somersloopPowerMultiplier:
            persistedState.somersloopPowerMultiplier ??
            current.somersloopPowerMultiplier,
          clockSpeed: Math.max(
            1,
            Math.min(persistedState.clockSpeed || 100, 250)
          ),
        };
      },
    }
  )
);
