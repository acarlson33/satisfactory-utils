/**
 * Power system type definitions for Satisfactory
 */

export type GeneratorId =
  | "biomass-burner"
  | "coal-generator"
  | "fuel-generator"
  | "geothermal-generator"
  | "nuclear-power-plant"
  | "alien-power-augmenter";

export type FuelCategory = "biomass" | "coal" | "liquid" | "nuclear";

export interface FuelType {
  /** Unique fuel identifier */
  id: string;
  /** Display name */
  name: string;
  /** Energy content in MJ */
  energyValue: number;
  /** Burn time in seconds at 100% clock speed */
  burnTime: number;
  /** Fuel category for filtering */
  category: FuelCategory;
  /** Whether this fuel is a fluid */
  isFluid?: boolean;
  /** Byproducts generated (e.g., nuclear waste) */
  byproducts?: FuelByproduct[];
}

export interface FuelByproduct {
  /** Item ID of the byproduct */
  itemId: string;
  /** Amount produced per fuel item consumed */
  amount: number;
}

export type GeneratorCategory =
  | "biomass"
  | "fossil"
  | "renewable"
  | "nuclear"
  | "special";

export interface PowerGenerator {
  /** Unique identifier */
  id: GeneratorId;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Base power output in MW at 100% clock speed */
  powerOutput: number;
  /** Compatible fuel type IDs */
  fuelTypes: string[];
  /** Generator category */
  category: GeneratorCategory;
  /** Unlock tier */
  tier: number;
  /** Whether generator requires water */
  requiresWater: boolean;
  /** Water consumption in m³/min at 100% */
  waterConsumption?: number;
  /** Variable power output range (for Geothermal) */
  variablePower?: {
    impure: { min: number; max: number };
    normal: { min: number; max: number };
    pure: { min: number; max: number };
  };
  /** Boost percent for Alien Power Augmenter */
  boostPercent?: number;
  /** Path to icon image */
  iconPath?: string;
}

/**
 * A configured generator in a power plan
 */
export interface GeneratorSetup {
  /** Generator type ID */
  generatorId: GeneratorId;
  /** Selected fuel type item ID */
  fuelId: string;
  /** Number of generators */
  count: number;
  /** Clock speed (1-2.5) */
  clockSpeed: number;
  /** Power shards used */
  powerShardsUsed: number;
}

/**
 * Calculated fuel consumption for a generator setup
 */
export interface FuelConsumption {
  /** Item ID of the fuel */
  itemId: string;
  /** Consumption rate in items/min or m³/min */
  rate: number;
  /** Whether this is a fluid */
  isFluid: boolean;
  /** Item display name */
  name: string;
}

/**
 * Complete power plan
 */
export interface PowerPlan {
  /** Unique identifier */
  id: string;
  /** Plan name */
  name: string;
  /** Target power output in MW */
  targetPower: number;
  /** Generator configurations */
  generators: GeneratorSetup[];
  /** Calculated total power output */
  totalPower: number;
  /** Calculated fuel consumption */
  fuelConsumption: FuelConsumption[];
  /** Calculated byproduct generation */
  byproductGeneration: FuelConsumption[];
  /** Water consumption for water-cooled generators */
  waterConsumption: number;
  /** Created timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * Calculate power output at a given clock speed
 */
export function calculateGeneratorPower(
  basePower: number,
  clockSpeed: number,
  exponent: number
): number {
  return basePower * Math.pow(clockSpeed, exponent);
}

/**
 * Calculate fuel consumption at a given clock speed
 */
export function calculateFuelConsumption(
  baseConsumption: number,
  clockSpeed: number
): number {
  // Fuel consumption scales linearly with clock speed for generators
  return baseConsumption * clockSpeed;
}

/**
 * Lookup map for quick generator access by ID
 */
export type GeneratorMap = Map<GeneratorId, PowerGenerator>;
