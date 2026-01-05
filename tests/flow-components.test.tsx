// @ts-nocheck
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Lightweight stubs so React Flow components do not require a browser environment.
vi.mock("@xyflow/react", () => ({
  Handle: ({ type, position }: any) => (
    <div data-handle-type={type} data-handle-position={position} />
  ),
  Position: { Top: "top", Bottom: "bottom" },
}));

const items = {
  "iron-ore": { id: "iron-ore", name: "Iron Ore", tier: 0 },
  "iron-ingot": { id: "iron-ingot", name: "Iron Ingot", tier: 1 },
  water: { id: "water", name: "Water", tier: 0 },
};

const buildings = {
  constructor: { id: "constructor", name: "Constructor", powerConsumption: 10 },
  assembler: { id: "assembler", name: "Assembler", powerConsumption: 15 },
};

const recipes = {
  "alt-screws": {
    id: "alt-screws",
    name: "Alt Screws",
    isAlternate: true,
    building: "constructor",
    inputs: [{ itemId: "iron-ingot", amount: 10 }],
    outputs: [{ itemId: "screw", amount: 40 }],
  },
  "base-frame": {
    id: "base-frame",
    name: "Base Frame",
    isAlternate: false,
    building: "assembler",
    inputs: [{ itemId: "iron-rod", amount: 10 }],
    outputs: [{ itemId: "frame", amount: 5 }],
  },
};

vi.mock("@/lib/data", () => ({
  getItemById: (id: string) => items[id] ?? { id, name: id, tier: 3 },
  getRecipeById: (id: string) => recipes[id] ?? null,
  getBuildingById: (id: string) => buildings[id] ?? null,
}));

describe("ItemNode", () => {
  it("labels byproducts and omits source handle", async () => {
    const { default: ItemNode } = await import("@/components/flow/ItemNode");

    const markup = renderToStaticMarkup(
      <ItemNode
        data={{
          itemId: "water",
          rate: 5,
          isRawResource: false,
          isTarget: false,
          recipeName: "Cooling",
          isByproduct: true,
        }}
      />
    );

    expect(markup).toContain(
      "Item Water, byproduct, rate 5.00 per minute via Cooling"
    );
    expect(markup).toContain('data-handle-type="target"');
    expect(markup).not.toContain('data-handle-type="source"');
  });

  it("shows raw resource and target handle combinations", async () => {
    const { default: ItemNode } = await import("@/components/flow/ItemNode");

    const rawMarkup = renderToStaticMarkup(
      <ItemNode
        data={{
          itemId: "iron-ore",
          rate: 60,
          isRawResource: true,
          isTarget: false,
          recipeName: null,
          isByproduct: false,
        }}
      />
    );
    expect(rawMarkup).toContain(
      "Item Iron Ore, raw resource, rate 60.00 per minute"
    );
    expect(rawMarkup).not.toContain('data-handle-type="target"');
    expect(rawMarkup).toContain('data-handle-type="source"');

    const targetMarkup = renderToStaticMarkup(
      <ItemNode
        data={{
          itemId: "iron-ingot",
          rate: 45,
          isRawResource: false,
          isTarget: true,
          recipeName: "Iron Smelting",
          isByproduct: false,
        }}
      />
    );
    expect(targetMarkup).toContain(
      "Item Iron Ingot, target, rate 45.00 per minute via Iron Smelting"
    );
    const handleCount = (targetMarkup.match(/data-handle-type=/g) ?? []).length;
    expect(handleCount).toBe(1);
    expect(targetMarkup).not.toContain('data-handle-type="source"');
  });
});

describe("RecipeNode", () => {
  it("renders alternate recipe details, badge, and power math", async () => {
    const { default: RecipeNode } = await import(
      "@/components/flow/RecipeNode"
    );

    const markup = renderToStaticMarkup(
      <RecipeNode
        data={{
          recipeId: "alt-screws",
          buildingCount: 2.5,
          clockSpeed: 150,
        }}
      />
    );

    expect(markup).toContain(
      'aria-label="Recipe Alt Screws (alternate) in Constructor, machines 2.50, clock 150%"'
    );
    expect(markup).toContain("Alt Recipe");
    expect(markup).toContain("150%");
    expect(markup).toContain("Power: ");
    expect(markup).toContain("47.8 MW");

    const handleCount = (markup.match(/data-handle-type=/g) ?? []).length;
    expect(handleCount).toBe(2);
  });

  it("falls back to base recipe styling when not alternate", async () => {
    const { default: RecipeNode } = await import(
      "@/components/flow/RecipeNode"
    );

    const markup = renderToStaticMarkup(
      <RecipeNode
        data={{
          recipeId: "base-frame",
          buildingCount: 1,
          clockSpeed: 100,
        }}
      />
    );

    expect(markup).toContain(
      'aria-label="Recipe Base Frame in Assembler, machines 1.00, clock 100%"'
    );
    expect(markup).toContain("Recipe");
    expect(markup).not.toContain("Alt Recipe");
  });
});
