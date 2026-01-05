import type { Recipe } from "@/types";
import { getRecipesByOutput, getRecipeRate, recipes } from "@/lib/data";

export interface ProductionNode {
  id: string;
  itemId: string;
  itemName: string;
  recipeId: string | null;
  recipeName: string | null;
  buildingId: string | null;
  buildingCount: number;
  fullMachines: number;
  underclockedMachines: number;
  underclockClock: number | null;
  machinesNeeded: number;
  /** Effective clock speed applied to this node (percentage) */
  clockSpeed: number;
  /** Whether Somersloop amplification is applied (assumed multiplier) */
  somersloop: boolean;
  somersloopOutputMultiplier?: number;
  somersloopPowerMultiplier?: number;
  targetRate: number; // items per minute
  actualRate: number;
  inputs: { itemId: string; rate: number }[];
  outputs: { itemId: string; rate: number }[];
  isRawResource: boolean;
  position: { x: number; y: number };
}

export interface ProductionEdge {
  id: string;
  source: string;
  target: string;
  itemId: string;
  rate: number;
}

export interface Byproduct {
  itemId: string;
  rate: number;
}

export interface EnabledRecipes {
  [itemId: string]: string; // Maps item ID to selected recipe ID
}

export interface BuildingOverride {
  clockSpeed?: number; // 1-250
  somersloop?: boolean;
}

// Assumed Somersloop throughput and power multipliers when enabled.
// These are placeholders until in-game values are confirmed.
export const SOMERSLOOP_OUTPUT_MULTIPLIER = 1.2;
export const SOMERSLOOP_POWER_MULTIPLIER = 1.2;

// Raw resources that don't need recipes
const RAW_RESOURCES = new Set([
  "iron-ore",
  "copper-ore",
  "limestone",
  "coal",
  "caterium-ore",
  "raw-quartz",
  "sulfur",
  "bauxite",
  "uranium",
  "sam",
  "water",
  "crude-oil",
  "nitrogen-gas",
  "leaves",
  "wood",
  "mycelia",
]);

export interface CalculateChainInput {
  targetItemId: string;
  targetRate: number;
  clockSpeed: number;
  enabledAlternates: Set<string>;
  selectedRecipes: EnabledRecipes;
  buildingOverrides: Record<string, BuildingOverride>;
  disabledBaseRecipes: Set<string>;
  /** Optional handlers to burn or re-use byproducts via specific recipes keyed by the byproduct item id. */
  byproductHandlers?: Record<string, string | null>;
  /** Optional overrides for Somersloop multipliers (defaults exported below). */
  somersloopOutputMultiplier?: number;
  somersloopPowerMultiplier?: number;
}

export function calculateChain({
  targetItemId,
  targetRate,
  clockSpeed,
  enabledAlternates,
  selectedRecipes,
  buildingOverrides,
  disabledBaseRecipes,
  byproductHandlers = {},
  somersloopOutputMultiplier,
  somersloopPowerMultiplier,
}: CalculateChainInput): {
  nodes: ProductionNode[];
  edges: ProductionEdge[];
  byproducts: Byproduct[];
} {
  const outputMult = somersloopOutputMultiplier ?? SOMERSLOOP_OUTPUT_MULTIPLIER;
  const powerMult = somersloopPowerMultiplier ?? SOMERSLOOP_POWER_MULTIPLIER;
  const nodes: ProductionNode[] = [];
  const edges: ProductionEdge[] = [];
  const producedTotals = new Map<string, number>();
  const consumedTotals = new Map<string, number>();
  const recipeRateCache = new Map<string, ReturnType<typeof getRecipeRate>>();
  const recipeById = new Map<string, Recipe>();
  let nodeIdCounter = 0;

  for (const recipe of recipes) {
    recipeById.set(recipe.id, recipe);
  }

  const getRates = (recipe: Recipe) => {
    const cached = recipeRateCache.get(recipe.id);
    if (cached) return cached;
    const rates = getRecipeRate(recipe);
    recipeRateCache.set(recipe.id, rates);
    return rates;
  };

  function processItem(
    itemId: string,
    requiredRate: number,
    depth: number
  ): string {
    if (RAW_RESOURCES.has(itemId)) {
      const nodeId = `node-${nodeIdCounter++}`;
      const node: ProductionNode = {
        id: nodeId,
        itemId,
        itemName: itemId
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
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
        targetRate: requiredRate,
        actualRate: requiredRate,
        inputs: [],
        outputs: [{ itemId, rate: requiredRate }],
        isRawResource: true,
        position: { x: depth * 300, y: nodes.length * 150 },
      };
      nodes.push(node);
      return nodeId;
    }

    const availableRecipes = getRecipesByOutput(itemId);
    const enabledRecipes = availableRecipes.filter(
      (recipe) => recipe.isAlternate || !disabledBaseRecipes.has(recipe.id)
    );

    if (enabledRecipes.length === 0) {
      const nodeId = `node-${nodeIdCounter++}`;
      const node: ProductionNode = {
        id: nodeId,
        itemId,
        itemName: itemId
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
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
        targetRate: requiredRate,
        actualRate: requiredRate,
        inputs: [],
        outputs: [{ itemId, rate: requiredRate }],
        isRawResource: true,
        position: { x: depth * 300, y: nodes.length * 150 },
      };
      nodes.push(node);
      return nodeId;
    }

    let selectedRecipe: Recipe;
    if (selectedRecipes[itemId]) {
      selectedRecipe =
        enabledRecipes.find((r) => r.id === selectedRecipes[itemId]) ||
        enabledRecipes[0];
    } else {
      const enabledAlternate = enabledRecipes.find(
        (r) => r.isAlternate && enabledAlternates.has(r.id)
      );
      const defaultRecipe = enabledRecipes.find((r) => !r.isAlternate);
      selectedRecipe = enabledAlternate || defaultRecipe || enabledRecipes[0];
    }

    const recipeRates = getRates(selectedRecipe);
    const outputItem = recipeRates.outputs.find((o) => o.itemId === itemId);
    if (!outputItem) {
      throw new Error(`Recipe ${selectedRecipe.id} doesn't output ${itemId}`);
    }

    const buildingId = selectedRecipe.buildingId || selectedRecipe.building;
    const override = buildingId ? buildingOverrides[buildingId] : undefined;
    const effectiveClock = Math.max(
      1,
      Math.min(override?.clockSpeed ?? clockSpeed, 250)
    );
    const speedFactor = Math.max(0.01, effectiveClock) / 100;
    const somersloop = Boolean(override?.somersloop);
    const throughputMultiplier = somersloop ? outputMult : 1;

    const perMachineRate =
      outputItem.amount * speedFactor * throughputMultiplier;
    const machinesNeeded = requiredRate / perMachineRate;
    const fullMachines = Math.floor(machinesNeeded + 1e-6);
    const remainderRate = requiredRate - fullMachines * perMachineRate;
    const hasRemainder = remainderRate > 0.0001;
    const underclockedMachines = hasRemainder ? 1 : 0;
    const fraction = hasRemainder ? remainderRate / perMachineRate : 0;
    const underclockClock = hasRemainder
      ? Math.max(1, Math.min(250, effectiveClock * fraction))
      : null;
    const buildingCount = fullMachines + (hasRemainder ? 1 : 0);
    const actualRate = requiredRate;

    const nodeId = `node-${nodeIdCounter++}`;
    const node: ProductionNode = {
      id: nodeId,
      itemId,
      itemName: itemId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      buildingId: selectedRecipe.buildingId || selectedRecipe.building || null,
      buildingCount,
      fullMachines,
      underclockedMachines,
      underclockClock,
      machinesNeeded,
      clockSpeed: effectiveClock,
      somersloop,
      somersloopOutputMultiplier: somersloop ? outputMult : 1,
      somersloopPowerMultiplier: somersloop ? powerMult : 1,
      targetRate: requiredRate,
      actualRate,
      inputs: recipeRates.inputs.map((i) => ({
        itemId: i.itemId,
        rate: i.amount * machinesNeeded * speedFactor * throughputMultiplier,
      })),
      outputs: recipeRates.outputs.map((o) => ({
        itemId: o.itemId,
        rate: o.amount * machinesNeeded * speedFactor * throughputMultiplier,
      })),
      isRawResource: false,
      position: { x: depth * 300, y: nodes.length * 150 },
    };
    nodes.push(node);

    for (const input of node.inputs) {
      consumedTotals.set(
        input.itemId,
        (consumedTotals.get(input.itemId) ?? 0) + input.rate
      );
      const sourceNodeId = processItem(input.itemId, input.rate, depth + 1);
      edges.push({
        id: `edge-${sourceNodeId}-${nodeId}`,
        source: sourceNodeId,
        target: nodeId,
        itemId: input.itemId,
        rate: input.rate,
      });
    }

    for (const output of node.outputs) {
      producedTotals.set(
        output.itemId,
        (producedTotals.get(output.itemId) ?? 0) + output.rate
      );
    }

    return nodeId;
  }

  if (targetItemId && targetRate > 0) {
    // Treat the target as a consumption so net zero when satisfied.
    consumedTotals.set(
      targetItemId,
      (consumedTotals.get(targetItemId) ?? 0) + targetRate
    );
    processItem(targetItemId, targetRate, 0);
  }

  const initialSurplus = new Map<string, number>();
  for (const [itemId, produced] of producedTotals.entries()) {
    const consumed = consumedTotals.get(itemId) ?? 0;
    const surplus = produced - consumed;
    if (surplus > 0.0001) {
      initialSurplus.set(itemId, surplus);
    }
  }

  for (const [itemId, recipeId] of Object.entries(byproductHandlers)) {
    if (!recipeId) continue;
    const surplus = initialSurplus.get(itemId);
    if (!surplus) continue;

    const handlerRecipe = recipeById.get(recipeId);
    if (!handlerRecipe) continue;

    const handlerRates = getRates(handlerRecipe);
    const targetInput = handlerRates.inputs.find((i) => i.itemId === itemId);
    if (!targetInput) continue;

    const buildingId = handlerRecipe.buildingId || handlerRecipe.building;
    const override = buildingId ? buildingOverrides[buildingId] : undefined;
    const effectiveClock = Math.max(
      1,
      Math.min(override?.clockSpeed ?? clockSpeed, 250)
    );
    const speedFactor = Math.max(0.01, effectiveClock) / 100;
    const somersloop = Boolean(override?.somersloop);
    const throughputMultiplier = somersloop ? outputMult : 1;

    const perMachineByproduct =
      targetInput.amount * speedFactor * throughputMultiplier;
    if (perMachineByproduct <= 0) continue;

    const machinesNeeded = surplus / perMachineByproduct;
    if (machinesNeeded <= 0.0001) continue;

    const fullMachines = Math.floor(machinesNeeded + 1e-6);
    const remainderConsume = surplus - fullMachines * perMachineByproduct;
    const hasRemainder = remainderConsume > 0.0001;
    const underclockedMachines = hasRemainder ? 1 : 0;
    const fraction = hasRemainder ? remainderConsume / perMachineByproduct : 0;
    const underclockClock = hasRemainder
      ? Math.max(1, Math.min(250, effectiveClock * fraction))
      : null;
    const buildingCount = fullMachines + (hasRemainder ? 1 : 0);

    const inputs = handlerRates.inputs.map((input) => ({
      itemId: input.itemId,
      rate: input.amount * machinesNeeded * speedFactor * throughputMultiplier,
    }));

    const outputs = handlerRates.outputs.map((output) => ({
      itemId: output.itemId,
      rate: output.amount * machinesNeeded * speedFactor * throughputMultiplier,
    }));

    const nodeId = `node-${nodeIdCounter++}`;
    const primaryOutput = outputs[0]?.itemId ?? handlerRecipe.id;
    const node: ProductionNode = {
      id: nodeId,
      itemId: primaryOutput,
      itemName: primaryOutput
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      recipeId: handlerRecipe.id,
      recipeName: handlerRecipe.name,
      buildingId: buildingId ?? null,
      buildingCount,
      fullMachines,
      underclockedMachines,
      underclockClock,
      machinesNeeded,
      clockSpeed: effectiveClock,
      somersloop,
      somersloopOutputMultiplier: somersloop ? outputMult : 1,
      somersloopPowerMultiplier: somersloop ? powerMult : 1,
      targetRate: outputs[0]?.rate ?? surplus,
      actualRate: outputs[0]?.rate ?? surplus,
      inputs,
      outputs,
      isRawResource: false,
      position: { x: 600, y: nodes.length * 150 },
    };
    nodes.push(node);

    for (const input of inputs) {
      consumedTotals.set(
        input.itemId,
        (consumedTotals.get(input.itemId) ?? 0) + input.rate
      );

      if (input.itemId === itemId) {
        // This input is satisfied by surplus byproduct; no new production chain.
        continue;
      }

      const sourceNodeId = processItem(input.itemId, input.rate, 1);
      edges.push({
        id: `edge-${sourceNodeId}-${nodeId}`,
        source: sourceNodeId,
        target: nodeId,
        itemId: input.itemId,
        rate: input.rate,
      });
    }

    for (const output of outputs) {
      // Outputs of a byproduct handler are treated as neutralized by default so they don't reappear as new byproducts
      // unless another part of the plan explicitly consumes them.
      consumedTotals.set(
        output.itemId,
        (consumedTotals.get(output.itemId) ?? 0) + output.rate
      );
      producedTotals.set(
        output.itemId,
        (producedTotals.get(output.itemId) ?? 0) + output.rate
      );
    }
  }

  const byproducts: Byproduct[] = [];
  for (const [itemId, produced] of producedTotals.entries()) {
    const consumed = consumedTotals.get(itemId) ?? 0;
    const surplus = produced - consumed;
    if (surplus > 0.0001) {
      byproducts.push({ itemId, rate: surplus });
    }
  }

  return { nodes, edges, byproducts };
}
