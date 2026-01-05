// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

// Simple in-memory storage for persist/localStorage
const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
};

class MockWorker {
  listeners: Record<string, ((ev: any) => void)[]> = { message: [], error: [] };

  addEventListener(type: "message" | "error", cb: (ev: any) => void) {
    this.listeners[type].push(cb);
  }

  removeEventListener(type: "message" | "error", cb: (ev: any) => void) {
    this.listeners[type] = this.listeners[type].filter((fn) => fn !== cb);
  }

  postMessage(message: any) {
    // Simulate async worker response on next tick
    queueMicrotask(() => {
      const response = {
        type: "calc-result",
        id: message.id,
        nodes: [
          {
            id: "n1",
            itemId: "reinforced-iron-plate",
            itemName: "Reinforced Iron Plate",
            recipeId: "reinforced-iron-plate",
            recipeName: "Reinforced Iron Plate",
            buildingId: "assembler",
            buildingCount: 1,
            fullMachines: 1,
            underclockedMachines: 0,
            underclockClock: null,
            machinesNeeded: 1,
            clockSpeed: 100,
            somersloop: false,
            targetRate: 30,
            actualRate: 30,
            inputs: [],
            outputs: [],
            isRawResource: false,
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        byproducts: [],
      };
      this.listeners.message.forEach((fn) => fn({ data: response }));
    });
  }

  terminate() {}
}

const setupGlobals = () => {
  const storage = createMemoryStorage();
  const perf = { now: () => 0 } as any;
  globalThis.localStorage = storage as any;
  globalThis.window = {
    localStorage: storage,
    location: { search: "" },
  } as any;
  globalThis.performance = perf;
};

const loadStore = async (useWorker: boolean) => {
  setupGlobals();
  if (useWorker) {
    globalThis.Worker = MockWorker as any;
  } else {
    // Provide a dummy Worker that returns null so getFactoryWorker falls back without errors
    globalThis.Worker = class NullWorker {
      constructor() {
        return null as any;
      }
    } as any;
  }

  vi.resetModules();
  const mod = await import("@/lib/stores/factory-store");
  return mod.useFactoryStore as typeof import("@/lib/stores/factory-store").useFactoryStore;
};

const setBasicTarget = (store: any) => {
  store.setState({
    targetItemId: "reinforced-iron-plate",
    targetRate: 30,
    clockSpeed: 100,
  });
};

describe("factory store", () => {
  beforeEach(() => {
    // isolate global state per test
    setupGlobals();
  });

  it("falls back to local calculation when worker is unavailable", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const store = await loadStore(false);
    setBasicTarget(store);

    store.getState().calculateProductionChain();

    const state = store.getState();
    expect(state.isCalculating).toBe(false);
    expect(state.productionNodes.length).toBeGreaterThan(0);
    expect(state.lastError).toBeNull();
    consoleError.mockRestore();
  });

  it("processes worker responses and caches results", async () => {
    const store = await loadStore(true);
    setBasicTarget(store);

    store.getState().calculateProductionChain();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const afterWorker = store.getState();
    expect(afterWorker.isCalculating).toBe(false);
    expect(afterWorker.productionNodes[0]?.itemId).toBe(
      "reinforced-iron-plate"
    );

    // Second call with identical payload should hit cache and remain consistent
    store.getState().calculateProductionChain();
    const cached = store.getState();
    expect(cached.productionNodes.length).toBe(
      afterWorker.productionNodes.length
    );
  });

  it("exports and imports plans with clamped values", async () => {
    const store = await loadStore(true);
    setBasicTarget(store);
    store.getState().setBuildingOverrideClock("constructor", 400);
    store.getState().setSomersloopMultiplier(3);

    const snapshot = store.getState().exportPlan();
    const imported = JSON.stringify({
      ...snapshot,
      clockSpeed: 999,
      targetRate: 0,
      somersloopOutputMultiplier: 5,
      somersloopPowerMultiplier: 5,
    });

    const ok = store.getState().importPlan(imported);
    expect(ok).toBe(true);

    const state = store.getState();
    expect(state.clockSpeed).toBeLessThanOrEqual(250);
    expect(state.targetRate).toBeGreaterThanOrEqual(0.1);
    expect(state.somersloopOutputMultiplier).toBe(5);
    expect(state.buildingOverrides.constructor.clockSpeed).toBe(250);
  });

  it("clamps building overrides and toggles byproduct handlers", async () => {
    const store = await loadStore(false);

    store.getState().setBuildingOverrideClock("assembler", 0);
    expect(store.getState().buildingOverrides.assembler.clockSpeed).toBe(1);

    store.getState().setBuildingOverrideClock("assembler", 200);
    store.getState().setBuildingOverrideSomersloop("assembler", true);
    expect(store.getState().buildingOverrides.assembler.somersloop).toBe(true);

    store.getState().setByproductHandler("heavy-oil-residue", "handler-recipe");
    expect(store.getState().byproductHandlers["heavy-oil-residue"]).toBe(
      "handler-recipe"
    );

    store.getState().clearByproductHandlers();
    expect(store.getState().byproductHandlers).toEqual({});
  });
});
