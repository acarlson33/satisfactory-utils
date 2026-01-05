// @ts-nocheck
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Mock d3-sankey with a tiny deterministic layout generator
vi.mock("d3-sankey", () => {
  const sankey = () => {
    const gen: any = (input: any) => {
      const nodes = input.nodes.map((n: any, idx: number) => ({
        ...n,
        x0: 10,
        x1: 24,
        y0: idx * 20,
        y1: idx * 20 + 12,
      }));
      const links = input.links.map((l: any) => ({
        ...l,
        width: Math.max(1, l.value),
      }));
      return { nodes, links };
    };
    gen.nodeId = () => gen;
    gen.nodeAlign = () => gen;
    gen.nodePadding = () => gen;
    gen.nodeWidth = () => gen;
    gen.extent = () => gen;
    return gen;
  };

  const sankeyLinkHorizontal = () => () => "M0,0C1,1 2,2 3,3";
  const sankeyLeft = () => "left";

  return { sankey, sankeyLinkHorizontal, sankeyLeft };
});

let currentState = {
  productionNodes: [],
  productionEdges: [],
  targetItemId: null,
};
vi.mock("@/lib/stores", () => ({
  useFactoryStore: (selector: any) => selector(currentState),
  __setSankeyState: (next: any) => {
    currentState = next;
  },
}));

beforeEach(() => {
  currentState = {
    productionNodes: [],
    productionEdges: [],
    targetItemId: null,
  };
});

describe("SankeyView", () => {
  it("shows empty state when no production chain exists", async () => {
    const { default: SankeyView } = await import(
      "@/components/flow/SankeyView"
    );
    const markup = renderToStaticMarkup(<SankeyView />);
    expect(markup).toContain(
      "No production chain yet. Calculate a plan to see the Sankey view."
    );
  });

  it("renders nodes and links with labels when data is present", async () => {
    const store = await import("@/lib/stores");
    store.__setSankeyState({
      productionNodes: [
        {
          id: "n1",
          itemId: "iron-ore",
          itemName: "Iron Ore",
          recipeId: null,
          recipeName: null,
          buildingId: null,
          buildingCount: 1.5,
          fullMachines: 1,
          underclockedMachines: 0,
          underclockClock: null,
          machinesNeeded: 1.5,
          clockSpeed: 120,
          somersloop: false,
          targetRate: 60,
          actualRate: 60,
          inputs: [],
          outputs: [{ itemId: "iron-ore", rate: 60 }],
          isRawResource: true,
          position: { x: 0, y: 0 },
        },
        {
          id: "n2",
          itemId: "iron-ingot",
          itemName: "Iron Ingot",
          recipeId: "iron-ingot",
          recipeName: "Iron Ingot",
          buildingId: "smelter",
          buildingCount: 2,
          fullMachines: 2,
          underclockedMachines: 0,
          underclockClock: null,
          machinesNeeded: 2,
          clockSpeed: 100,
          somersloop: false,
          targetRate: 30,
          actualRate: 30,
          inputs: [{ itemId: "iron-ore", rate: 30 }],
          outputs: [{ itemId: "iron-ingot", rate: 30 }],
          isRawResource: false,
          position: { x: 0, y: 0 },
        },
      ],
      productionEdges: [
        { id: "e1", source: "n1", target: "n2", itemId: "iron-ore", rate: 30 },
      ],
      targetItemId: "iron-ingot",
    });

    const { default: SankeyView } = await import(
      "@/components/flow/SankeyView"
    );
    const markup = renderToStaticMarkup(<SankeyView />);

    expect(markup).toContain("Sankey diagram of production chain");
    expect(markup).toContain("Condensed view");
    expect(markup).toContain("Iron Ore");
    expect(markup).toContain("Iron Ingot");
    expect(markup).toContain("Iron Ore · 60.0/min");
    expect(markup).toContain("Iron Ore: 30.0/min");
  });
});
