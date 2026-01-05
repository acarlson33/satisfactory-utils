/**
 * Recipe type definitions for Satisfactory
 */

import type { BuildingId } from "./building.ts";

export interface RecipeIO {
  /** Item ID */
  itemId: string;
  /** Amount per craft cycle */
  amount: number;
  /** Calculated rate in items/min at 100% clock speed (optional, can be derived) */
  perMinute?: number;
  /** Whether this is a fluid */
  isFluid?: boolean;
}

export interface UnlockRequirement {
  /** Type of unlock requirement */
  type: "milestone" | "mam" | "alternate-recipe";
  /** ID of the requirement */
  id: string;
  /** Human-readable name */
  name: string;
}

export interface Recipe {
  /** Unique identifier, e.g., "iron-ingot-default" */
  id: string;
  /** Display name, e.g., "Iron Ingot" */
  name: string;
  /** Whether this is an alternate recipe from Hard Drives */
  isAlternate: boolean;
  /** Building that produces this recipe */
  building?: BuildingId;
  /** Building ID (alternative field name) */
  buildingId?: string;
  /** Time to complete one craft in seconds */
  craftTime: number;
  /** Input items/fluids */
  inputs: RecipeIO[];
  /** Output items/fluids */
  outputs: RecipeIO[];
  /** Power consumption in MW at 100% clock speed */
  powerConsumption?: number;
  /** Variable power range for buildings like Particle Accelerator */
  powerConsumptionRange?: [number, number];
  /** Requirements to unlock this recipe */
  unlockRequirements?: UnlockRequirement[];
  /** Unlock tier (simplified) */
  tier?: number;
  /** Internal class name from game */
  className?: string;
}

/**
 * A recipe with calculated machine count for a target production rate
 */
export interface RecipeWithMachines extends Recipe {
  /** Number of machines needed (can be fractional) */
  machineCount: number;
  /** Clock speed applied (1-2.5) */
  clockSpeed: number;
  /** Whether Somersloop amplification is active */
  amplified: boolean;
  /** Effective input rates */
  effectiveInputs: RecipeIO[];
  /** Effective output rates */
  effectiveOutputs: RecipeIO[];
}

/**
 * Lookup map for quick recipe access by ID
 */
export type RecipeMap = Map<string, Recipe>;

/**
 * Recipes grouped by their primary output item
 */
export type RecipesByOutput = Map<string, Recipe[]>;

/**
 * Recipes grouped by building
 */
export type RecipesByBuilding = Map<BuildingId, Recipe[]>;
