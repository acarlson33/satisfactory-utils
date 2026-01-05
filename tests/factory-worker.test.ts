// @ts-nocheck
import { describe, expect, it, beforeEach } from "vitest";
import { vi } from "vitest"; // Added vi import

// Minimal self mock for worker global scope
class MockSelf {
  listeners: Record<string, (ev: any) => void> = {};
  messages: any[] = [];
  addEventListener(type: string, cb: (ev: any) => void) {
    this.listeners[type] = cb;
  }
  postMessage(msg: any) {
    this.messages.push(msg);
  }
}

const loadWorkerModule = async () => {
  const selfMock = new MockSelf();
  // @ts-ignore
  globalThis.self = selfMock as any;
  // @ts-ignore
  globalThis.DedicatedWorkerGlobalScope = function () {};
  // Bust cache so each test re-registers listener on fresh self
  vi.resetModules(); // Reset modules to ensure fresh import
  await import("@/lib/workers/factory-calc.worker"); // Import without dynamic query
  return selfMock;
};

const basePayload = {
  targetItemId: "iron-plate",
  targetRate: 60,
  clockSpeed: 100,
  enabledAlternates: [],
  selectedRecipes: {},
  buildingOverrides: {},
  disabledBaseRecipes: [],
  byproductHandlers: {},
};

describe("factory worker", () => {
  beforeEach(() => {
    // clean global to avoid bleed
    // @ts-ignore
    delete globalThis.self;
  });

  it("responds with calc-result for valid payloads", async () => {
    const selfMock = await loadWorkerModule();
    const listener = selfMock.listeners["message"];
    expect(listener).toBeDefined();

    listener({ data: { type: "calc", id: 1, payload: basePayload } });

    expect(selfMock.messages.length).toBe(1);
    expect(selfMock.messages[0].type).toBe("calc-result");
    expect(selfMock.messages[0].id).toBe(1);
    expect(Array.isArray(selfMock.messages[0].nodes)).toBe(true);
  });

  it("responds with calc-error when payload is invalid", async () => {
    const selfMock = await loadWorkerModule();
    const listener = selfMock.listeners["message"];
    expect(listener).toBeDefined();

    // invalid enabledAlternates triggers Set ctor error in worker
    listener({
      data: {
        type: "calc",
        id: 2,
        payload: { ...basePayload, enabledAlternates: 123 as any },
      },
    });

    expect(selfMock.messages.length).toBe(1);
    expect(selfMock.messages[0].type).toBe("calc-error");
    expect(selfMock.messages[0].id).toBe(2);
  });
});
