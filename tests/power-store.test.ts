// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
};

const setupGlobals = () => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage as any;
  globalThis.window = { localStorage: storage } as any;
  globalThis.performance = { now: () => 0 } as any;
};

const loadStore = async () => {
  setupGlobals();
  vi.resetModules();
  const mod = await import("@/lib/stores/power-store");
  return mod.usePowerStore as typeof import("@/lib/stores/power-store").usePowerStore;
};

describe("power store", () => {
  beforeEach(() => setupGlobals());

  it("adds generators and calculates power", async () => {
    const store = await loadStore();
    store.getState().addGenerator("coal-generator", "coal");

    const state = store.getState();
    expect(state.generators.length).toBe(1);
    expect(state.calculation?.totalPower).toBeGreaterThan(0);
  });

  it("auto-calculates for a target power", async () => {
    const store = await loadStore();
    store.getState().setTargetPower(150);
    store.getState().autoCalculateForTarget();

    const state = store.getState();
    expect(state.generators.length).toBe(1);
    expect(state.generators[0].generatorId).toBe("coal-generator");
    expect(state.calculation?.totalPower).toBeGreaterThanOrEqual(150);
  });

  it("plans from fuel with clamped clock speeds", async () => {
    const store = await loadStore();
    const ok = store.getState().planFromFuel("coal", 500, 500);
    expect(ok).toBe(true);

    const state = store.getState();
    expect(state.generators[0].clockSpeed).toBeLessThanOrEqual(250);
    expect(state.calculation?.fuelConsumption[0]?.fuelId).toBe("coal");
  });

  it("updates generator counts and clock speeds with clamping", async () => {
    const store = await loadStore();
    store.getState().addGenerator("coal-generator", "coal");
    const id = store.getState().generators[0].id;

    store.getState().setGeneratorCount(id, 0);
    store.getState().setGeneratorClockSpeed(id, 500);

    const state = store.getState();
    expect(state.generators[0].count).toBe(1);
    expect(state.generators[0].clockSpeed).toBe(250);
  });

  it("exports and imports plans round-trip", async () => {
    const store = await loadStore();
    store.getState().addGenerator("coal-generator", "coal");
    store.getState().setTargetPower(300);

    const snapshot = store.getState().exportPlan();
    const json = JSON.stringify(snapshot);

    const ok = store.getState().importPlan(json);
    expect(ok).toBe(true);
    expect(store.getState().calculation).not.toBeNull();
  });
});
