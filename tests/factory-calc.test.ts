// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
  calculateChain,
  SOMERSLOOP_OUTPUT_MULTIPLIER,
} from "@/lib/calculators/factory-calc";

const basePayload = {
  clockSpeed: 100,
  enabledAlternates: new Set<string>(),
  selectedRecipes: {},
  buildingOverrides: {} as Record<
    string,
    { clockSpeed?: number; somersloop?: boolean }
  >,
  disabledBaseRecipes: new Set<string>(),
  byproductHandlers: {},
};

describe("factory calculateChain", () => {
  it("calculates a simple chain for reinforced iron plates", () => {
    const { nodes, edges, byproducts } = calculateChain({
      ...basePayload,
      targetItemId: "reinforced-iron-plate",
      targetRate: 30,
    });

    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
    // target node should exist with matching rate
    const target = nodes.find((n) => n.itemId === "reinforced-iron-plate");
    expect(target?.actualRate).toBeCloseTo(30, 3);
    expect(byproducts.length).toBeGreaterThanOrEqual(0);
  });

  it("reduces machine count when Somersloop is applied", () => {
    const base = calculateChain({
      ...basePayload,
      targetItemId: "reinforced-iron-plate",
      targetRate: 30,
    });

    const boosted = calculateChain({
      ...basePayload,
      targetItemId: "reinforced-iron-plate",
      targetRate: 30,
      buildingOverrides: {
        assembler: { somersloop: true },
      },
      somersloopOutputMultiplier: SOMERSLOOP_OUTPUT_MULTIPLIER,
    });

    const baseAssembler = base.nodes.find((n) => n.buildingId === "assembler");
    const boostedAssembler = boosted.nodes.find(
      (n) => n.buildingId === "assembler"
    );

    expect(baseAssembler).toBeDefined();
    expect(boostedAssembler).toBeDefined();
    if (baseAssembler && boostedAssembler) {
      expect(baseAssembler.buildingCount).toBeGreaterThan(
        boostedAssembler.buildingCount
      );
    }
  });

  it("selects alternate recipes when enabled", () => {
    const base = calculateChain({
      ...basePayload,
      targetItemId: "screw",
      targetRate: 200,
    });

    const castScrew = calculateChain({
      ...basePayload,
      targetItemId: "screw",
      targetRate: 200,
      enabledAlternates: new Set(["cast-screw"]),
    });

    const baseNode = base.nodes.find((n) => n.itemId === "screw");
    const altNode = castScrew.nodes.find((n) => n.itemId === "screw");

    expect(baseNode?.recipeId).toBe("screw");
    expect(altNode?.recipeId).toBe("cast-screw");
    if (baseNode && altNode) {
      expect(altNode.buildingCount).toBeLessThan(baseNode.buildingCount);
    }
  });

  it("falls back to alternates when base recipe is disabled", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "screw",
      targetRate: 200,
      disabledBaseRecipes: new Set(["screw"]),
    });

    const node = chain.nodes.find((n) => n.itemId === "screw");
    expect(node).toBeDefined();
    expect(node?.recipeId).not.toBe("screw");
    expect(node?.recipeId).toBe("cast-screw");
  });

  it("honors per-building clock speed overrides", () => {
    const base = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 60,
    });

    const overclocked = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 60,
      buildingOverrides: {
        constructor: { clockSpeed: 200 },
      },
    });

    const baseNode = base.nodes.find((n) => n.itemId === "iron-plate");
    const ocNode = overclocked.nodes.find((n) => n.itemId === "iron-plate");

    expect(baseNode?.clockSpeed).toBeCloseTo(100, 3);
    expect(ocNode?.clockSpeed).toBeCloseTo(200, 3);
    if (baseNode && ocNode) {
      expect(ocNode.buildingCount).toBeLessThan(baseNode.buildingCount);
    }
  });

  it("clamps overclock to 250%", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 120,
      buildingOverrides: {
        constructor: { clockSpeed: 400 },
      },
    });

    const node = chain.nodes.find((n) => n.itemId === "iron-plate");
    expect(node?.clockSpeed).toBeCloseTo(250, 3);
  });

  it("clamps underclock to minimum 1%", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 1,
      buildingOverrides: {
        constructor: { clockSpeed: 0 },
      },
    });

    const node = chain.nodes.find((n) => n.itemId === "iron-plate");
    expect(node?.clockSpeed).toBeCloseTo(1, 3);
  });

  it("creates an underclocked machine when demand is fractional", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 30, // 1.5 constructors at 100% would satisfy this
    });

    const node = chain.nodes.find((n) => n.itemId === "iron-plate");
    expect(node).toBeDefined();
    if (node) {
      expect(node.fullMachines).toBe(1);
      expect(node.underclockedMachines).toBe(1);
      expect(node.underclockClock).toBeGreaterThan(40);
      expect(node.underclockClock).toBeLessThanOrEqual(250);
    }
  });

  it("uses explicit selected recipes even when alternates are available", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "screw",
      targetRate: 200,
      selectedRecipes: { screw: "screw" },
      enabledAlternates: new Set(["cast-screw"]),
    });

    const node = chain.nodes.find((n) => n.itemId === "screw");
    expect(node?.recipeId).toBe("screw");
  });

  it("marks somersloop power multiplier on nodes when override enabled", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "reinforced-iron-plate",
      targetRate: 30,
      buildingOverrides: { assembler: { somersloop: true } },
      somersloopPowerMultiplier: 1.5,
    });

    const node = chain.nodes.find((n) => n.buildingId === "assembler");
    expect(node?.somersloopPowerMultiplier).toBeCloseTo(1.5, 3);
  });

  it("returns empty results when target rate is zero", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "iron-plate",
      targetRate: 0,
    });

    expect(chain.nodes.length).toBe(0);
    expect(chain.edges.length).toBe(0);
    expect(chain.byproducts.length).toBe(0);
  });

  it("handles raw resource targets without recipes", () => {
    const { nodes, edges } = calculateChain({
      ...basePayload,
      targetItemId: "iron-ore",
      targetRate: 120,
    });

    expect(nodes.length).toBe(1);
    expect(edges.length).toBe(0);
    expect(nodes[0].isRawResource).toBe(true);
    expect(nodes[0].actualRate).toBeCloseTo(120, 3);
  });

  it("returns byproducts for recipes that emit them", () => {
    const { byproducts } = calculateChain({
      ...basePayload,
      targetItemId: "computer",
      targetRate: 20,
    });

    expect(byproducts.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps byproducts when handler recipe is missing", () => {
    const chain = calculateChain({
      ...basePayload,
      targetItemId: "plastic",
      targetRate: 20,
      byproductHandlers: {
        "heavy-oil-residue": "non-existent-recipe",
      },
    });

    const hor = chain.byproducts.find((b) => b.itemId === "heavy-oil-residue");
    expect(hor).toBeDefined();
  });

  it("routes byproducts through configured handler recipes", () => {
    const base = calculateChain({
      ...basePayload,
      targetItemId: "plastic",
      targetRate: 20,
    });

    const horByproduct = base.byproducts.find(
      (b) => b.itemId === "heavy-oil-residue"
    );
    expect(horByproduct).toBeDefined();

    const handled = calculateChain({
      ...basePayload,
      targetItemId: "plastic",
      targetRate: 20,
      byproductHandlers: {
        "heavy-oil-residue": "diluted-fuel",
      },
    });

    const handledHor = handled.byproducts.find(
      (b) => b.itemId === "heavy-oil-residue"
    );
    expect(handledHor).toBeUndefined();
  });
});
