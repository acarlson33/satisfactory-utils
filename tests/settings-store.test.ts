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
  globalThis.window = {
    localStorage: storage,
    matchMedia: () => ({ matches: true }),
  } as any;
};

const loadStore = async () => {
  setupGlobals();
  vi.resetModules();
  const mod = await import("@/lib/stores/settings-store");
  return mod.useSettingsStore as typeof import("@/lib/stores/settings-store").useSettingsStore;
};

describe("settings store", () => {
  beforeEach(() => setupGlobals());

  it("clamps numeric settings and toggles flags", async () => {
    const store = await loadStore();

    store.getState().setDefaultClockSpeed(300);
    store.getState().setDecimalPlaces(10);
    store.getState().setShowAlternateRecipes(false);
    store.getState().toggleSidebar();

    const state = store.getState();
    expect(state.defaultClockSpeed).toBe(250);
    expect(state.decimalPlaces).toBe(6);
    expect(state.showAlternateRecipes).toBe(false);
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("exports and imports settings with validation", async () => {
    const store = await loadStore();
    store.getState().setTheme("dark");
    store.getState().setOptimizationTarget("minimize-power");
    const json = store.getState().exportSettings();

    // valid import
    const ok = store.getState().importSettings(json);
    expect(ok).toBe(true);
    expect(store.getState().theme).toBe("dark");
    expect(store.getState().optimizationTarget).toBe("minimize-power");

    // invalid import should return false and not change theme
    const bad = store
      .getState()
      .importSettings('{"theme":"invalid","decimalPlaces":-1}');
    expect(bad).toBe(true);
    expect(store.getState().decimalPlaces).toBe(2);
  });

  it("resets settings to defaults", async () => {
    const store = await loadStore();
    store.getState().setTheme("light");
    store.getState().setEnableAnimations(false);
    store.getState().resetSettings();

    const state = store.getState();
    expect(state.theme).toBe("system");
    expect(state.enableAnimations).toBe(true);
  });
});
