"use client";

import { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ItemNode, { type ItemNodeData } from "./ItemNode";
import RecipeNode, { type RecipeNodeData } from "./RecipeNode";
import {
  useFactoryStore,
  type ProductionNode,
  type ProductionEdge,
} from "@/lib/stores";
import { type Byproduct } from "@/lib/calculators/factory-calc";

// Define custom node types
const nodeTypes = {
  item: ItemNode,
  recipe: RecipeNode,
};

// Convert production nodes to React Flow nodes
export function convertToFlowNodes(
  productionNodes: ProductionNode[],
  targetItemId: string | null,
  byproducts: Byproduct[]
): Node[] {
  const baseNodes = productionNodes.map((pNode) => {
    const isRaw = pNode.isRawResource;
    const isTarget = pNode.itemId === targetItemId;

    const node: Node<ItemNodeData> = {
      id: pNode.id,
      type: "item",
      position: pNode.position,
      data: {
        itemId: pNode.itemId,
        rate: pNode.actualRate,
        isRawResource: isRaw,
        isTarget,
        recipeName: pNode.recipeName,
      },
    };

    return node;
  });

  if (!byproducts.length) return baseNodes;

  const maxX = baseNodes.reduce(
    (max, node) => Math.max(max, node.position.x),
    0
  );

  const byproductNodes: Node<ItemNodeData>[] = byproducts.map((bp, index) => {
    const producerYs: number[] = [];
    for (const node of productionNodes) {
      if (node.outputs.some((output) => output.itemId === bp.itemId)) {
        producerYs.push(node.position.y);
      }
    }
    const avgY =
      producerYs.length > 0
        ? producerYs.reduce((sum, y) => sum + y, 0) / producerYs.length
        : index * 180;

    return {
      id: `byproduct-${bp.itemId}`,
      type: "item",
      position: { x: maxX + 260, y: avgY },
      data: {
        itemId: bp.itemId,
        rate: bp.rate,
        isRawResource: false,
        isTarget: false,
        isByproduct: true,
        recipeName: null,
      },
    };
  });

  return [...baseNodes, ...byproductNodes];
}

// Convert production edges to React Flow edges
export function convertToFlowEdges(
  productionEdges: ProductionEdge[],
  productionNodes: ProductionNode[],
  byproducts: Byproduct[]
): Edge[] {
  const baseEdges: Edge[] = productionEdges.map((pEdge) => ({
    id: pEdge.id,
    source: pEdge.source,
    target: pEdge.target,
    type: "smoothstep",
    animated: true,
    style: {
      stroke: "#f5a623",
      strokeWidth: 2,
    },
    label: `${pEdge.rate.toFixed(1)}/min`,
    labelStyle: { fill: "#9ca3af", fontSize: 10 },
    labelBgStyle: { fill: "#1f2937", fillOpacity: 0.8 },
  }));

  const outgoingBySource = new Map<string, Map<string, number>>();
  for (const edge of productionEdges) {
    const map = outgoingBySource.get(edge.source) ?? new Map<string, number>();
    map.set(edge.itemId, (map.get(edge.itemId) ?? 0) + edge.rate);
    outgoingBySource.set(edge.source, map);
  }

  const incomingByTarget = new Map<string, Map<string, number>>();
  for (const edge of productionEdges) {
    const map = incomingByTarget.get(edge.target) ?? new Map<string, number>();
    map.set(edge.itemId, (map.get(edge.itemId) ?? 0) + edge.rate);
    incomingByTarget.set(edge.target, map);
  }

  const byproductEdges: Edge[] = [];

  for (const bp of byproducts) {
    const producers = productionNodes
      .map((node) => {
        const output =
          node.outputs.find((o) => o.itemId === bp.itemId)?.rate ?? 0;
        const sent = outgoingBySource.get(node.id)?.get(bp.itemId) ?? 0;
        const surplus = output - sent;
        return { node, surplus };
      })
      .filter(({ surplus }) => surplus > 0.0001)
      .sort((a, b) => b.surplus - a.surplus);

    const sinkId = `byproduct-${bp.itemId}`;
    let remaining = bp.rate;

    const consumers = productionNodes
      .map((node) => {
        const need = node.inputs
          .filter((input) => input.itemId === bp.itemId)
          .reduce((sum, input) => sum + input.rate, 0);
        if (!need) return null;
        const already = incomingByTarget.get(node.id)?.get(bp.itemId) ?? 0;
        const pending = Math.max(0, need - already);
        return pending > 0.0001 ? { node, pending } : null;
      })
      .filter(Boolean) as { node: ProductionNode; pending: number }[];

    for (const consumer of consumers) {
      for (const { node, surplus } of producers) {
        if (consumer.pending <= 0.0001 || remaining <= 0.0001) break;
        if (surplus <= 0.0001) continue;
        const amount = Math.min(consumer.pending, surplus, remaining);
        if (amount <= 0.0001) continue;
        byproductEdges.push({
          id: `byprod-${node.id}-${consumer.node.id}-${bp.itemId}`,
          source: node.id,
          target: consumer.node.id,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#a855f7",
            strokeWidth: 2,
            strokeDasharray: "6 3",
          },
          label: `${amount.toFixed(1)}/min byproduct`,
          labelStyle: { fill: "#c4b5fd", fontSize: 10 },
          labelBgStyle: { fill: "#1f2937", fillOpacity: 0.85 },
        });
        consumer.pending -= amount;
        remaining -= amount;
      }
    }

    // Any leftovers go to a sink node for clarity
    for (const { node, surplus } of producers) {
      if (remaining <= 0.0001) break;
      if (surplus <= 0.0001) continue;
      const amount = Math.min(surplus, remaining);
      byproductEdges.push({
        id: `byprod-sink-${node.id}-${bp.itemId}`,
        source: node.id,
        target: sinkId,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#a855f7",
          strokeWidth: 2,
          strokeDasharray: "6 3",
        },
        label: `${amount.toFixed(1)}/min byproduct`,
        labelStyle: { fill: "#c4b5fd", fontSize: 10 },
        labelBgStyle: { fill: "#1f2937", fillOpacity: 0.85 },
      });
      remaining -= amount;
    }

    if (remaining > 0.0001 && producers.length === 0 && productionNodes[0]) {
      byproductEdges.push({
        id: `byprod-unlinked-${bp.itemId}`,
        source: productionNodes[0].id,
        target: sinkId,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#a855f7",
          strokeWidth: 2,
          strokeDasharray: "6 3",
        },
        label: `${remaining.toFixed(1)}/min byproduct`,
        labelStyle: { fill: "#c4b5fd", fontSize: 10 },
        labelBgStyle: { fill: "#1f2937", fillOpacity: 0.85 },
      });
    }
  }

  // If a byproduct gets fully consumed by its handler, the byproducts array is empty and no edges are created.
  // Fill any remaining missing demand on nodes by routing from producers with surplus outputs.
  const missingEdges: Edge[] = [];

  // Track available surplus per producer/item after existing edges.
  const producerItemSurplus = new Map<string, Map<string, number>>();
  for (const node of productionNodes) {
    for (const output of node.outputs) {
      const sent = outgoingBySource.get(node.id)?.get(output.itemId) ?? 0;
      const surplus = output.rate - sent;
      if (surplus <= 0.0001) continue;
      const map = producerItemSurplus.get(node.id) ?? new Map<string, number>();
      map.set(output.itemId, surplus);
      producerItemSurplus.set(node.id, map);
    }
  }

  for (const consumer of productionNodes) {
    for (const input of consumer.inputs) {
      const incoming =
        incomingByTarget.get(consumer.id)?.get(input.itemId) ?? 0;
      const need = input.rate - incoming;
      if (need <= 0.0001) continue;

      // Build a list of producers with surplus for this item.
      const candidates = productionNodes
        .map((node) => {
          const surplus =
            producerItemSurplus.get(node.id)?.get(input.itemId) ?? 0;
          return { node, surplus };
        })
        .filter(({ surplus }) => surplus > 0.0001)
        .sort((a, b) => b.surplus - a.surplus);

      let remainingNeed = need;
      for (const { node, surplus } of candidates) {
        if (remainingNeed <= 0.0001) break;
        const take = Math.min(surplus, remainingNeed);
        if (take <= 0.0001) continue;

        // Deduct from available surplus
        const map = producerItemSurplus.get(node.id)!;
        map.set(input.itemId, surplus - take);

        missingEdges.push({
          id: `auto-${node.id}-${consumer.id}-${input.itemId}`,
          source: node.id,
          target: consumer.id,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#a855f7",
            strokeWidth: 2,
            strokeDasharray: "6 3",
          },
          label: `${take.toFixed(1)}/min byproduct`,
          labelStyle: { fill: "#c4b5fd", fontSize: 10 },
          labelBgStyle: { fill: "#1f2937", fillOpacity: 0.85 },
        });
        remainingNeed -= take;
      }
    }
  }

  return [...baseEdges, ...byproductEdges, ...missingEdges];
}

interface FactoryFlowProps {
  className?: string;
}

export default function FactoryFlow({ className }: FactoryFlowProps) {
  const productionNodes = useFactoryStore((state) => state.productionNodes);
  const productionEdges = useFactoryStore((state) => state.productionEdges);
  const byproducts = useFactoryStore((state) => state.byproducts);
  const targetItemId = useFactoryStore((state) => state.targetItemId);

  // Convert store nodes/edges to React Flow format
  const flowNodes = useMemo(
    () => convertToFlowNodes(productionNodes, targetItemId, byproducts),
    [productionNodes, targetItemId, byproducts]
  );
  const flowEdges = useMemo(
    () => convertToFlowEdges(productionEdges, productionNodes, byproducts),
    [productionEdges, productionNodes, byproducts]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Sync with store changes
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const hasNodes = productionNodes.length > 0;

  return (
    <div className={`relative h-full w-full ${className || ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-900"
        style={{ width: "100%", height: "100%" }}
        aria-label="Factory production graph"
        tabIndex={0}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
        />
        <Controls
          position="bottom-left"
          className="controls-themed"
          style={{
            color: "hsl(var(--foreground))",
            background: "hsl(var(--muted))",
            borderColor: "hsl(var(--border))",
          }}
          aria-label="Graph pan and zoom controls"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as ItemNodeData;
            if (data.isByproduct) return "#a855f7";
            if (data.isTarget) return "#f5a623";
            if (data.isRawResource) return "#10b981";
            return "#00a6ed";
          }}
          className="!bg-gray-800 !border-gray-600"
        />

        {/* Empty state */}
        {!hasNodes && (
          <Panel position="top-center" className="!mt-8">
            <div className="bg-gray-800/90 backdrop-blur px-6 py-4 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-300 text-lg mb-2">
                No production chain yet
              </p>
              <p className="text-gray-400 text-sm">
                Select a target item and rate above to calculate your factory
              </p>
            </div>
          </Panel>
        )}

        {/* Stats panel */}
        {hasNodes && (
          <Panel position="top-left" className="!mt-2 !ml-2">
            <div
              className="bg-gray-800/90 backdrop-blur px-4 py-3 rounded-lg border border-gray-600 text-sm"
              aria-live="polite"
            >
              <div className="text-gray-400">Production Nodes</div>
              <div className="text-white font-mono text-xl">
                {productionNodes.length}
              </div>
            </div>
          </Panel>
        )}

        {/* Keyboard help */}
        {hasNodes && (
          <Panel position="bottom-left" className="!mb-2 !ml-2">
            <div
              className="bg-gray-800/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-600 text-[11px] text-gray-200 space-y-1"
              role="note"
            >
              <div className="text-xs font-semibold text-gray-100">
                Keyboard navigation
              </div>
              <div>Tab to focus nodes and legend.</div>
              <div>Shift+Wheel or trackpad to pan; +/- to zoom.</div>
            </div>
          </Panel>
        )}

        {/* Legend */}
        {hasNodes && (
          <Panel position="bottom-right" className="!mb-2 !mr-2">
            <div className="bg-gray-800/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-600 text-[11px] text-gray-200 space-y-1">
              <div className="text-xs font-semibold text-gray-100">Legend</div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-5 rounded-sm border border-purple-400 border-dashed bg-purple-500/30"
                  aria-hidden
                />
                <span>Byproduct flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#a855f7]" aria-hidden />
                <span>Byproduct sink</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#f5a623]" aria-hidden />
                <span>Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#10b981]" aria-hidden />
                <span>Raw resource</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-sm bg-[#00a6ed]" aria-hidden />
                <span>Intermediate</span>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
