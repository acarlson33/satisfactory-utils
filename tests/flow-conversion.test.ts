// @ts-nocheck
import { describe, expect, it } from "vitest";
import {
  convertToFlowNodes,
  convertToFlowEdges,
} from "@/components/flow/FactoryFlow";

const baseProductionNode = (overrides = {}) => ({
  id: "node",
  itemId: "item",
  itemName: "Item",
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
  targetRate: 0,
  actualRate: 0,
  inputs: [],
  outputs: [],
  isRawResource: false,
  position: { x: 0, y: 0 },
  ...overrides,
});

describe("convertToFlowNodes", () => {
  it("creates base and byproduct nodes with correct flags and positioning", () => {
    const productionNodes = [
      baseProductionNode({
        id: "n1",
        itemId: "iron-ore",
        actualRate: 60,
        isRawResource: true,
        position: { x: 100, y: 80 },
      }),
      baseProductionNode({
        id: "n2",
        itemId: "iron-ingot",
        actualRate: 30,
        recipeName: "Iron Ingot",
        outputs: [
          { itemId: "iron-ingot", rate: 30 },
          { itemId: "water", rate: 15 },
        ],
        position: { x: 340, y: 200 },
      }),
    ];

    const byproducts = [{ itemId: "water", rate: 15 }];

    const flowNodes = convertToFlowNodes(
      productionNodes,
      "iron-ingot",
      byproducts
    );

    expect(flowNodes).toHaveLength(3);

    const targetNode = flowNodes.find((n) => n.id === "n2");
    expect(targetNode?.data.isTarget).toBe(true);
    expect(targetNode?.data.isRawResource).toBe(false);

    const byproductNode = flowNodes.find((n) => n.id === "byproduct-water");
    expect(byproductNode).toBeDefined();
    expect(byproductNode?.position.x).toBeCloseTo(340 + 260);
    expect(byproductNode?.position.y).toBeCloseTo(200);
    expect(byproductNode?.data).toMatchObject({
      itemId: "water",
      rate: 15,
      isByproduct: true,
      isTarget: false,
      isRawResource: false,
      recipeName: null,
    });
  });

  it("returns only base nodes when there are no byproducts", () => {
    const productionNodes = [
      baseProductionNode({ id: "n1", itemId: "iron-ore", actualRate: 30 }),
      baseProductionNode({ id: "n2", itemId: "screw", actualRate: 40 }),
    ];

    const flowNodes = convertToFlowNodes(productionNodes, null, []);

    expect(flowNodes).toHaveLength(2);
    expect(flowNodes.every((n) => !n.data.isByproduct)).toBe(true);
    expect(flowNodes.map((n) => n.id)).toEqual(["n1", "n2"]);
  });
});

describe("convertToFlowEdges", () => {
  it("routes byproduct flows to consumers and sinks while preserving base edges", () => {
    const productionNodes = [
      baseProductionNode({
        id: "producer",
        outputs: [
          { itemId: "water", rate: 20 },
          { itemId: "iron-ingot", rate: 30 },
        ],
        position: { x: 0, y: 0 },
      }),
      baseProductionNode({
        id: "consumer",
        inputs: [{ itemId: "water", rate: 8 }],
        position: { x: 200, y: 100 },
      }),
    ];

    const productionEdges = [
      {
        id: "edge-base",
        source: "producer",
        target: "consumer",
        itemId: "iron-ingot",
        rate: 30,
      },
    ];

    const byproducts = [{ itemId: "water", rate: 20 }];

    const edges = convertToFlowEdges(
      productionEdges,
      productionNodes,
      byproducts
    );

    const baseEdge = edges.find((e) => e.id === "edge-base");
    expect(baseEdge).toBeDefined();
    expect(baseEdge?.label).toBe("30.0/min");

    const consumerEdge = edges.find((e) =>
      e.id.startsWith("byprod-producer-consumer-water")
    );
    expect(consumerEdge).toBeDefined();
    expect(consumerEdge?.target).toBe("consumer");
    expect(consumerEdge?.label).toBe("8.0/min byproduct");

    const sinkEdge = edges.find((e) => e.id === "byprod-sink-producer-water");
    expect(sinkEdge).toBeDefined();
    expect(sinkEdge?.target).toBe("byproduct-water");
    expect(sinkEdge?.label).toBe("12.0/min byproduct");
  });

  it("creates auto-wiring edges for unmet input demand", () => {
    const productionNodes = [
      baseProductionNode({
        id: "source",
        outputs: [{ itemId: "iron-ore", rate: 30 }],
      }),
      baseProductionNode({
        id: "sink",
        inputs: [{ itemId: "iron-ore", rate: 20 }],
      }),
    ];

    const edges = convertToFlowEdges([], productionNodes, []);

    const autoEdge = edges.find((e) => e.id === "auto-source-sink-iron-ore");
    expect(autoEdge).toBeDefined();
    expect(autoEdge?.label).toBe("20.0/min byproduct");
    expect(autoEdge?.source).toBe("source");
    expect(autoEdge?.target).toBe("sink");
  });

  it("creates an unlinked sink edge when no producers supply a byproduct", () => {
    const productionNodes = [
      baseProductionNode({
        id: "only",
        outputs: [{ itemId: "iron-ore", rate: 10 }],
      }),
    ];

    const edges = convertToFlowEdges([], productionNodes, [
      { itemId: "water", rate: 5 },
    ]);

    const sinkEdge = edges.find((e) => e.id === "byprod-unlinked-water");
    expect(sinkEdge).toBeDefined();
    expect(sinkEdge?.target).toBe("byproduct-water");
    expect(sinkEdge?.label).toBe("5.0/min byproduct");
  });

  it("routes surplus to multiple consumers when filling missing edges", () => {
    const productionNodes = [
      baseProductionNode({
        id: "a",
        outputs: [{ itemId: "iron-ore", rate: 10 }],
      }),
      baseProductionNode({
        id: "b",
        outputs: [{ itemId: "iron-ore", rate: 5 }],
      }),
      baseProductionNode({
        id: "c",
        inputs: [{ itemId: "iron-ore", rate: 12 }],
      }),
      baseProductionNode({
        id: "d",
        inputs: [{ itemId: "iron-ore", rate: 3 }],
      }),
    ];

    const edges = convertToFlowEdges([], productionNodes, []);

    const toC = edges.filter((e) => e.target === "c");
    expect(toC.map((e) => e.label)).toContain("10.0/min byproduct");
    expect(toC.map((e) => e.label)).toContain("2.0/min byproduct");

    const toD = edges.find((e) => e.target === "d");
    expect(toD?.label).toBe("3.0/min byproduct");

    // Total edges created should match each consumption chunk (3 edges)
    const autoEdges = edges.filter((e) => e.id.startsWith("auto-"));
    expect(autoEdges).toHaveLength(3);
  });
});
