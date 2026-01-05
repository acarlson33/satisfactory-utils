/**
 * Satisfactory Buildings Data
 *
 * Contains all production and extraction buildings from Satisfactory 1.0
 */

import type { ProductionBuilding, BuildingId } from "@/types";

export const buildings: ProductionBuilding[] = [
  // ============== SMELTERS ==============
  {
    id: "smelter",
    name: "Smelter",
    description: "Smelts ore into ingots. Can be automated with a Miner.",
    powerConsumption: 4,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 1,
    tier: 0,
    category: "production",
  },
  {
    id: "foundry",
    name: "Foundry",
    description: "Smelts two types of ore or ingots into alloy ingots.",
    powerConsumption: 16,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 2,
    tier: 3,
    category: "production",
  },

  // ============== PRODUCTION BUILDINGS ==============
  {
    id: "constructor",
    name: "Constructor",
    description: "Crafts basic components from a single input material.",
    powerConsumption: 4,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 1,
    tier: 0,
    category: "production",
  },
  {
    id: "assembler",
    name: "Assembler",
    description: "Combines two input types into one output type.",
    powerConsumption: 15,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 2,
    tier: 2,
    category: "production",
  },
  {
    id: "manufacturer",
    name: "Manufacturer",
    description:
      "Combines up to four input types into one or more output types.",
    powerConsumption: 55,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 4,
    tier: 4,
    category: "production",
  },

  // ============== FLUID PROCESSING ==============
  {
    id: "refinery",
    name: "Refinery",
    description:
      "Processes fluids alone or in combination with solid materials.",
    powerConsumption: 30,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 2,
    tier: 5,
    category: "fluid",
  },
  {
    id: "blender",
    name: "Blender",
    description:
      "Combines up to four fluid and solid inputs into one or two outputs.",
    powerConsumption: 75,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 4,
    tier: 7,
    category: "fluid",
  },
  {
    id: "packager",
    name: "Packager",
    description:
      "Packages fluids into containers or unpacks them back into fluids.",
    powerConsumption: 10,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 5,
    category: "fluid",
  },

  // ============== ADVANCED PRODUCTION ==============
  {
    id: "particle-accelerator",
    name: "Particle Accelerator",
    description: "Uses massive amounts of power to create exotic matter.",
    powerConsumption: 250, // Variable: 250-1500 MW
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 4,
    tier: 8,
    category: "advanced",
    variablePower: { min: 250, max: 1500 },
  },
  {
    id: "converter",
    name: "Converter",
    description: "Converts resources using high energy processes.",
    powerConsumption: 400,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 4,
    tier: 9,
    category: "advanced",
  },
  {
    id: "quantum-encoder",
    name: "Quantum Encoder",
    description: "Creates quantum-level components using massive power.",
    powerConsumption: 500, // Variable: 500-2000 MW
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 4,
    tier: 9,
    category: "advanced",
    variablePower: { min: 500, max: 2000 },
  },

  // ============== EXTRACTION ==============
  {
    id: "miner-mk1",
    name: "Miner Mk.1",
    description:
      "Extracts solid resources from resource nodes at 60/min on normal nodes.",
    powerConsumption: 5,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 0,
    category: "extraction",
  },
  {
    id: "miner-mk2",
    name: "Miner Mk.2",
    description:
      "Extracts solid resources from resource nodes at 120/min on normal nodes.",
    powerConsumption: 12,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 2,
    category: "extraction",
  },
  {
    id: "miner-mk3",
    name: "Miner Mk.3",
    description:
      "Extracts solid resources from resource nodes at 240/min on normal nodes.",
    powerConsumption: 30,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 1,
    tier: 5,
    category: "extraction",
  },
  {
    id: "oil-extractor",
    name: "Oil Extractor",
    description:
      "Extracts Crude Oil from oil nodes at 120 m³/min on normal nodes.",
    powerConsumption: 40,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 5,
    category: "extraction",
  },
  {
    id: "water-extractor",
    name: "Water Extractor",
    description: "Pumps water from water bodies at 120 m³/min.",
    powerConsumption: 20,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 3,
    category: "extraction",
  },
  {
    id: "resource-well-pressurizer",
    name: "Resource Well Pressurizer",
    description: "Pressurizes resource wells to enable satellite extraction.",
    powerConsumption: 150,
    powerConsumptionExponent: 1.6,
    maxOverclock: 250,
    somersloopSlots: 0,
    tier: 7,
    category: "extraction",
  },
  {
    id: "resource-well-extractor",
    name: "Resource Well Extractor",
    description: "Extracts resources from pressurized resource wells.",
    powerConsumption: 0,
    powerConsumptionExponent: 1.6,
    maxOverclock: 100, // Cannot be overclocked
    somersloopSlots: 0,
    tier: 7,
    category: "extraction",
  },
];

// Building lookup helpers
export const getBuildingById = (
  id: BuildingId | string
): ProductionBuilding | undefined => {
  return buildings.find((building) => building.id === id);
};

export const getBuildingsByCategory = (
  category: ProductionBuilding["category"]
): ProductionBuilding[] => {
  return buildings.filter((building) => building.category === category);
};

export const getBuildingsByTier = (tier: number): ProductionBuilding[] => {
  return buildings.filter((building) => building.tier === tier);
};

/**
 * Calculate power consumption at a given clock speed
 * Formula: basePower * (clockSpeed / 100) ^ exponent
 */
export const calculatePowerAtClockSpeed = (
  building: ProductionBuilding,
  clockSpeedPercent: number
): number => {
  const clockMultiplier = clockSpeedPercent / 100;
  return (
    building.powerConsumption *
    Math.pow(clockMultiplier, building.powerConsumptionExponent)
  );
};

/**
 * Calculate number of buildings needed for a target production rate
 */
export const calculateBuildingsNeeded = (
  recipe: { craftTime: number; outputs: { amount: number }[] },
  targetRatePerMinute: number,
  clockSpeedPercent: number = 100
): number => {
  const baseRatePerMinute = (60 / recipe.craftTime) * recipe.outputs[0].amount;
  const adjustedRate = baseRatePerMinute * (clockSpeedPercent / 100);
  return targetRatePerMinute / adjustedRate;
};

// Building categories metadata
export const buildingCategories = [
  { id: "production", name: "Production", icon: "🏭" },
  { id: "fluid", name: "Fluid Processing", icon: "💧" },
  { id: "advanced", name: "Advanced", icon: "⚡" },
  { id: "extraction", name: "Extraction", icon: "⛏️" },
] as const;
