"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { getItemById } from "@/lib/data";

export interface ItemNodeData extends Record<string, unknown> {
  itemId: string;
  rate: number;
  isRawResource: boolean;
  isTarget: boolean;
  recipeName?: string | null;
  isByproduct?: boolean;
}

interface ItemNodeProps {
  data: ItemNodeData;
}

function ItemNode({ data }: ItemNodeProps) {
  const item = getItemById(data.itemId);
  const { rate, isRawResource, isTarget, recipeName, isByproduct } = data;

  const bgColor = isByproduct
    ? "bg-purple-500/20 border-purple-400"
    : isTarget
    ? "bg-satisfactory-orange/20 border-satisfactory-orange"
    : isRawResource
    ? "bg-emerald-500/20 border-emerald-500"
    : "bg-satisfactory-blue/20 border-satisfactory-blue";

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] ${bgColor}`}
      role="group"
      tabIndex={0}
      aria-label={`Item ${item?.name || data.itemId}, ${
        isByproduct
          ? "byproduct"
          : isRawResource
          ? "raw resource"
          : isTarget
          ? "target"
          : "intermediate"
      }, rate ${rate.toFixed(2)} per minute${
        recipeName ? ` via ${recipeName}` : ""
      }`}
    >
      {/* Input handle */}
      {!isRawResource && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-white !border-2 !border-gray-600 !w-3 !h-3"
        />
      )}

      {/* Content */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">
          {isByproduct
            ? "Byproduct"
            : isTarget
            ? "Target"
            : isRawResource
            ? "Raw Resource"
            : "Item"}
        </div>
        <div className="font-bold text-white text-center">
          {item?.name || data.itemId}
        </div>
        {recipeName && !isByproduct && (
          <div className="text-[11px] text-gray-300 text-center">
            {recipeName}
          </div>
        )}
        <div className="text-satisfactory-orange font-mono text-lg">
          {rate.toFixed(2)}/min
        </div>
        {item?.tier && (
          <div className="text-xs text-gray-400">Tier {item.tier}</div>
        )}
      </div>

      {/* Output handle */}
      {!isTarget && !isByproduct && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-white !border-2 !border-gray-600 !w-3 !h-3"
        />
      )}
    </div>
  );
}

export default memo(ItemNode);
