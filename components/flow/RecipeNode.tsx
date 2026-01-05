"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { getRecipeById, getBuildingById } from "@/lib/data";

export interface RecipeNodeData extends Record<string, unknown> {
  recipeId: string;
  buildingCount: number;
  clockSpeed: number;
}

interface RecipeNodeProps {
  data: RecipeNodeData;
}

function RecipeNode({ data }: RecipeNodeProps) {
  const recipe = getRecipeById(data.recipeId);
  const buildingId = recipe?.building || recipe?.buildingId;
  const building = buildingId ? getBuildingById(buildingId) : null;
  const { buildingCount, clockSpeed } = data;

  const isAlternate = recipe?.isAlternate;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] ${
        isAlternate
          ? "bg-purple-500/20 border-purple-500"
          : "bg-gray-700/50 border-gray-500"
      }`}
      role="group"
      tabIndex={0}
      aria-label={`Recipe ${recipe?.name || data.recipeId}${
        isAlternate ? " (alternate)" : ""
      }${
        building ? ` in ${building.name}` : ""
      }, machines ${buildingCount.toFixed(2)}, clock ${clockSpeed}%`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !border-2 !border-gray-600 !w-3 !h-3"
      />

      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-400 font-medium">
            {isAlternate ? "Alt Recipe" : "Recipe"}
          </span>
          {clockSpeed !== 100 && (
            <span className="text-xs bg-satisfactory-orange/20 text-satisfactory-orange px-2 py-0.5 rounded">
              {clockSpeed}%
            </span>
          )}
        </div>

        <div className="font-bold text-white">
          {recipe?.name || data.recipeId}
        </div>

        {building && (
          <div className="text-sm text-gray-300 flex items-center gap-1">
            <span className="text-satisfactory-blue">{building.name}</span>
            <span className="text-gray-500">×</span>
            <span className="font-mono text-satisfactory-orange">
              {buildingCount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Inputs/Outputs summary */}
        {recipe && (
          <div className="flex gap-4 text-xs mt-1">
            <div className="text-gray-400">
              <span className="text-red-400">↓</span> {recipe.inputs.length}{" "}
              inputs
            </div>
            <div className="text-gray-400">
              <span className="text-green-400">↑</span> {recipe.outputs.length}{" "}
              outputs
            </div>
          </div>
        )}

        {building && (
          <div className="text-xs text-gray-400 border-t border-gray-600 pt-2 mt-1">
            Power:{" "}
            <span className="text-yellow-400">
              {(
                building.powerConsumption *
                (clockSpeed / 100) ** 1.6 *
                buildingCount
              ).toFixed(1)}{" "}
              MW
            </span>
          </div>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white !border-2 !border-gray-600 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(RecipeNode);
