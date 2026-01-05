"use client";

import { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyLeft,
  type SankeyNodeMinimal,
  type SankeyLinkMinimal,
} from "d3-sankey";
import { items } from "@/lib/data";
import { useFactoryStore } from "@/lib/stores";

interface NodeDatum extends SankeyNodeMinimal<NodeDatum, LinkDatum> {
  id: string;
  name: string;
  itemId: string;
  isRaw: boolean;
  isTarget: boolean;
  value?: number;
  buildingCount?: number;
  clockSpeed?: number;
  category?: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface LinkDatum extends SankeyLinkMinimal<NodeDatum, LinkDatum> {
  value: number;
  itemId: string;
}

const itemNameMap = new Map(items.map((i) => [i.id, i.name] as const));
const itemCategoryMap = new Map(items.map((i) => [i.id, i.category] as const));

const categoryColors: Record<string, string> = {
  ore: "#60a5fa",
  ingot: "#34d399",
  component: "#f472b6",
  fluid: "#38bdf8",
  fuel: "#f59e0b",
  nuclear: "#a855f7",
  "project-part": "#f97316",
  equipment: "#fb7185",
  special: "#22c55e",
};

const formatRate = (value?: number) =>
  typeof value === "number" ? `${value.toFixed(1)}/min` : "";

export default function SankeyView() {
  const productionNodes = useFactoryStore((state) => state.productionNodes);
  const productionEdges = useFactoryStore((state) => state.productionEdges);
  const targetItemId = useFactoryStore((state) => state.targetItemId);

  const [compact, setCompact] = useState(false);

  const width = 960;
  const height = 560;

  const layout = useMemo(() => {
    if (!productionNodes.length) return null;

    const nodes: NodeDatum[] = productionNodes.map((n) => ({
      id: n.id,
      name: itemNameMap.get(n.itemId) ?? n.itemId,
      itemId: n.itemId,
      isRaw: n.isRawResource,
      isTarget: n.itemId === targetItemId,
      value: n.actualRate,
      buildingCount: n.buildingCount,
      clockSpeed: n.clockSpeed,
      category: itemCategoryMap.get(n.itemId),
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
    }));

    const links: LinkDatum[] = productionEdges.map((e) => ({
      source: e.source,
      target: e.target,
      value: e.rate,
      itemId: e.itemId,
    })) as LinkDatum[];

    const sankeyGen = sankey<NodeDatum, LinkDatum>()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyLeft)
      .nodePadding(compact ? 10 : 18)
      .nodeWidth(14)
      .extent([
        [24, 24],
        [width - 24, height - 24],
      ]);

    return sankeyGen({ nodes: nodes.map((d) => ({ ...d })), links });
  }, [compact, height, productionEdges, productionNodes, targetItemId, width]);

  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-400">
        No production chain yet. Calculate a plan to see the Sankey view.
      </div>
    );
  }

  const nodeColor = (n: NodeDatum) => {
    if (n.isTarget) return "#f59e0b";
    if (n.isRaw) return "#10b981";
    if (n.category && categoryColors[n.category])
      return categoryColors[n.category];
    return "#38bdf8";
  };

  const resolveNodeId = (node: LinkDatum["source"]) => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    return node.id;
  };

  return (
    <div className="relative h-full w-full rounded-xl border border-gray-700 bg-gray-900/80">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={() => setCompact((v) => !v)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-200 hover:border-gray-500 hover:bg-gray-700"
        >
          {compact ? "Expanded view" : "Condensed view"}
        </button>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        className="h-full w-full"
        aria-label="Sankey diagram of production chain"
      >
        <defs>
          <linearGradient
            id="sankey-link"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="1"
          >
            <stop stopColor="#f97316" stopOpacity={0.85} offset="0" />
            <stop stopColor="#fde68a" stopOpacity={0.85} offset="1" />
          </linearGradient>
        </defs>

        <g fill="none" strokeOpacity={0.6}>
          {layout.links.map((link, idx) => (
            <path
              key={`${resolveNodeId(link.source)}-${resolveNodeId(
                link.target
              )}-${idx}`}
              d={
                sankeyLinkHorizontal<NodeDatum, LinkDatum>()(link) ?? undefined
              }
              stroke="url(#sankey-link)"
              strokeWidth={Math.max(1, link.width || 1)}
            >
              <title>
                {`${
                  itemNameMap.get(link.itemId) ?? link.itemId
                }: ${link.value.toFixed(1)}/min`}
              </title>
            </path>
          ))}
        </g>

        <g fontFamily="Inter, system-ui, sans-serif" fontSize={12}>
          {layout.nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x0}
                y={node.y0}
                width={Math.max(1, node.x1 - node.x0)}
                height={Math.max(6, node.y1 - node.y0)}
                fill={nodeColor(node)}
                fillOpacity={0.9}
                stroke="#0f172a"
                strokeWidth={1}
                rx={3}
              >
                <title>
                  {[
                    `${node.name} (${formatRate(node.value)})`,
                    node.buildingCount
                      ? ` | Machines: ${Math.ceil(node.buildingCount)}`
                      : "",
                    node.clockSpeed
                      ? ` | Clock: ${node.clockSpeed.toFixed(0)}%`
                      : "",
                    node.isRaw ? " | Raw input" : "",
                  ].join("")}
                </title>
              </rect>
              <text
                x={node.x1 + 8}
                y={(node.y0 + node.y1) / 2}
                dy="0.35em"
                fill="#e5e7eb"
              >
                {compact
                  ? node.name
                  : `${node.name} · ${formatRate(node.value)}`}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
