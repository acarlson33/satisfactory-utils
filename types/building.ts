/**
 * Building type definitions for Satisfactory
 */

export type BuildingCategory =
  | "production"
  | "fluid"
  | "advanced"
  | "extraction"
  | "power"
  | "logistics"
  | "organization"
  | "special";

export type BuildingId =
  // Production buildings
  | "smelter"
  | "foundry"
  | "constructor"
  | "assembler"
  | "manufacturer"
  | "refinery"
  | "blender"
  | "packager"
  | "particle-accelerator"
  | "converter"
  | "quantum-encoder"
  // Extraction buildings
  | "miner-mk1"
  | "miner-mk2"
  | "miner-mk3"
  | "oil-extractor"
  | "water-extractor"
  | "resource-well-pressurizer"
  | "resource-well-extractor"
  // Power generators
  | "biomass-burner"
  | "coal-generator"
  | "fuel-generator"
  | "geothermal-generator"
  | "nuclear-power-plant"
  | "alien-power-augmenter";

export interface ProductionBuilding {
  /** Unique identifier */
  id: BuildingId;
  /** Display name, e.g., "Constructor" */
  name: string;
  /** In-game description */
  description?: string;
  /** Building category */
  category: BuildingCategory;
  /** Power consumption in MW at 100% clock speed */
  powerConsumption: number;
  /** Exponent for power scaling with clock speed (typically 1.6) */
  powerConsumptionExponent: number;
  /** Maximum clock speed percentage (usually 250%) */
  maxOverclock: number;
  /** Number of Somersloop slots (0 if not supported) */
  somersloopSlots: number;
  /** Unlock tier */
  tier: number;
  /** Variable power range for buildings like Particle Accelerator */
  variablePower?: { min: number; max: number };
  /** Path to icon image */
  iconPath?: string;
  /** Internal class name from game */
  className?: string;
}

/**
 * Calculate power consumption at a given clock speed
 */
export function calculatePowerAtClockSpeed(
  basePower: number,
  clockSpeed: number,
  exponent: number
): number {
  return basePower * Math.pow(clockSpeed, exponent);
}

/**
 * Calculate production rate at a given clock speed with optional amplification
 */
export function calculateProductionRate(
  baseRate: number,
  clockSpeed: number,
  amplified: boolean = false
): number {
  const amplificationMultiplier = amplified ? 2 : 1;
  return baseRate * clockSpeed * amplificationMultiplier;
}

/**
 * Lookup map for quick building access by ID
 */
export type BuildingMap = Map<BuildingId, ProductionBuilding>;
