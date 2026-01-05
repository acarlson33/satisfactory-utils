// @ts-nocheck
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Mock @xyflow/react to avoid browser-only behavior
vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: any) => <div className="reactflow">{children}</div>,
  Background: ({ children }: any) => (
    <div className="background">{children}</div>
  ),
  Controls: ({ children }: any) => <div className="controls">{children}</div>,
  MiniMap: ({ children }: any) => <div className="minimap">{children}</div>,
  Panel: ({ children }: any) => <div className="panel">{children}</div>,
  BackgroundVariant: { Dots: "dots" },
  useNodesState: (initial: any) => [initial, () => {}, () => {}],
  useEdgesState: (initial: any) => [initial, () => {}, () => {}],
  addEdge: (_: any, eds: any) => eds,
  Position: { Top: "top", Bottom: "bottom" },
}));

// Mock the factory store so FactoryFlow receives controlled input
const mockStateEmpty = {
  productionNodes: [],
  productionEdges: [],
  byproducts: [],
  targetItemId: null,
};

let currentState = mockStateEmpty;

vi.mock("@/lib/stores", () => ({
  useFactoryStore: (selector: any) => selector(currentState),
  __setFactoryState: (s: any) => {
    currentState = s;
  },
}));

beforeEach(() => {
  currentState = mockStateEmpty;
});

describe("FactoryFlow component", () => {
  it("renders empty state prompt when no production nodes", async () => {
    const { default: FactoryFlow } = await import(
      "@/components/flow/FactoryFlow"
    );

    const markup = renderToStaticMarkup(<FactoryFlow />);

    expect(markup).toContain("No production chain yet");
    expect(markup).toContain(
      "Select a target item and rate above to calculate your factory"
    );
  });

  it("renders stats panel and legend when production nodes exist", async () => {
    // Switch the mocked store to a populated state
    const populated = {
      productionNodes: [
        {
          id: "node-1",
          itemId: "iron-ore",
          itemName: "Iron Ore",
          recipeId: null,
          recipeName: null,
          buildingId: null,
          buildingCount: 0,
          fullMachines: 0,
          underclockedMachines: 0,
          underclockClock: null,
          machinesNeeded: 0,
          clockSpeed: 100,
          somersloop: false,
          targetRate: 60,
          actualRate: 60,
          inputs: [],
          outputs: [{ itemId: "iron-ore", rate: 60 }],
          isRawResource: true,
          position: { x: 0, y: 0 },
        },
      ],
      productionEdges: [],
      byproducts: [],
      targetItemId: "iron-ore",
    };

    const store = await import("@/lib/stores");
    store.__setFactoryState(populated);

    const { default: FactoryFlow } = await import(
      "@/components/flow/FactoryFlow"
    );
    const markup = renderToStaticMarkup(<FactoryFlow />);

    // Stats panel should show the number of production nodes
    expect(markup).toContain("Production Nodes");
    expect(markup).toContain("1");

    // Legend is present
    expect(markup).toContain("Legend");
    expect(markup).toContain("Byproduct flow");
  });

  it("shows keyboard help when the graph has nodes", async () => {
    const populated = {
      productionNodes: [
        {
          id: "node-1",
          itemId: "iron-ore",
          itemName: "Iron Ore",
          recipeId: null,
          recipeName: null,
          buildingId: null,
          buildingCount: 0,
          fullMachines: 0,
          underclockedMachines: 0,
          underclockClock: null,
          machinesNeeded: 0,
          clockSpeed: 100,
          somersloop: false,
          targetRate: 60,
          actualRate: 60,
          inputs: [],
          outputs: [{ itemId: "iron-ore", rate: 60 }],
          isRawResource: true,
          position: { x: 0, y: 0 },
        },
      ],
      productionEdges: [],
      byproducts: [],
      targetItemId: "iron-ore",
    };

    const store = await import("@/lib/stores");
    store.__setFactoryState(populated);

    const { default: FactoryFlow } = await import(
      "@/components/flow/FactoryFlow"
    );
    const markup = renderToStaticMarkup(<FactoryFlow />);

    expect(markup).toContain("Keyboard navigation");
    expect(markup).toContain("Tab to focus nodes and legend.");
  });
});
