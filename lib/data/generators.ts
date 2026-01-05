/**
 * Satisfactory Power Generators Data
 *
 * Contains all power generators and their fuel configurations
 */

import type { PowerGenerator, FuelType } from "@/types";

export const fuelTypes: FuelType[] = [
  // Biomass fuels
  {
    id: "leaves",
    name: "Leaves",
    energyValue: 15, // MJ
    burnTime: 0.5, // seconds in Biomass Burner at 100%
    category: "biomass",
  },
  {
    id: "wood",
    name: "Wood",
    energyValue: 100,
    burnTime: 3.33,
    category: "biomass",
  },
  {
    id: "biomass",
    name: "Biomass",
    energyValue: 180,
    burnTime: 6,
    category: "biomass",
  },
  {
    id: "solid-biofuel",
    name: "Solid Biofuel",
    energyValue: 450,
    burnTime: 15,
    category: "biomass",
  },
  {
    id: "packaged-liquid-biofuel",
    name: "Packaged Liquid Biofuel",
    energyValue: 750,
    burnTime: 25,
    category: "biomass",
  },

  // Coal fuels
  {
    id: "coal",
    name: "Coal",
    energyValue: 300,
    burnTime: 4,
    category: "coal",
  },
  {
    id: "compacted-coal",
    name: "Compacted Coal",
    energyValue: 630,
    burnTime: 8.4,
    category: "coal",
  },
  {
    id: "petroleum-coke",
    name: "Petroleum Coke",
    energyValue: 180,
    burnTime: 2.4,
    category: "coal",
  },

  // Liquid fuels
  {
    id: "fuel",
    name: "Fuel",
    energyValue: 750, // MJ per m³
    burnTime: 3, // seconds per m³ at 100%
    category: "liquid",
    isFluid: true,
  },
  {
    id: "turbofuel",
    name: "Turbofuel",
    energyValue: 2000,
    burnTime: 8,
    category: "liquid",
    isFluid: true,
  },
  {
    id: "rocket-fuel",
    name: "Rocket Fuel",
    energyValue: 1500,
    burnTime: 6,
    category: "liquid",
    isFluid: true,
  },
  {
    id: "ionized-fuel",
    name: "Ionized Fuel",
    energyValue: 4000,
    burnTime: 16,
    category: "liquid",
    isFluid: true,
  },

  // Nuclear fuels
  {
    id: "uranium-fuel-rod",
    name: "Uranium Fuel Rod",
    energyValue: 750000,
    burnTime: 300, // 5 minutes
    category: "nuclear",
    byproducts: [{ itemId: "uranium-waste", amount: 10 }],
  },
  {
    id: "plutonium-fuel-rod",
    name: "Plutonium Fuel Rod",
    energyValue: 1500000,
    burnTime: 600, // 10 minutes
    category: "nuclear",
    byproducts: [{ itemId: "plutonium-waste", amount: 1 }],
  },
  {
    id: "ficsonium-fuel-rod",
    name: "Ficsonium Fuel Rod",
    energyValue: 1500000,
    burnTime: 600,
    category: "nuclear",
    // No waste byproduct
  },
];

export const generators: PowerGenerator[] = [
  {
    id: "biomass-burner",
    name: "Biomass Burner",
    description:
      "Burns biomass materials to generate power. Must be manually fed until automated with a Conveyor Belt.",
    powerOutput: 30,
    fuelTypes: [
      "leaves",
      "wood",
      "biomass",
      "solid-biofuel",
      "packaged-liquid-biofuel",
    ],
    tier: 0,
    requiresWater: false,
    category: "biomass",
  },
  {
    id: "coal-generator",
    name: "Coal Generator",
    description:
      "Burns coal-based fuels along with water to generate power efficiently.",
    powerOutput: 75,
    fuelTypes: ["coal", "compacted-coal", "petroleum-coke"],
    tier: 3,
    requiresWater: true,
    waterConsumption: 45, // m³/min
    category: "fossil",
  },
  {
    id: "fuel-generator",
    name: "Fuel Generator",
    description: "Burns liquid fuels to generate a large amount of power.",
    powerOutput: 250,
    fuelTypes: ["fuel", "turbofuel", "rocket-fuel", "ionized-fuel"],
    tier: 5,
    requiresWater: false,
    category: "fossil",
  },
  {
    id: "geothermal-generator",
    name: "Geothermal Generator",
    description:
      "Generates power from geothermal geysers. Output varies based on geyser purity.",
    powerOutput: 200, // Average; actual is 100-600 MW
    fuelTypes: [], // No fuel needed
    tier: 5,
    requiresWater: false,
    category: "renewable",
    variablePower: {
      impure: { min: 50, max: 150 },
      normal: { min: 100, max: 300 },
      pure: { min: 200, max: 600 },
    },
  },
  {
    id: "nuclear-power-plant",
    name: "Nuclear Power Plant",
    description:
      "Generates massive amounts of power from nuclear fuel rods. Produces radioactive waste.",
    powerOutput: 2500,
    fuelTypes: ["uranium-fuel-rod", "plutonium-fuel-rod", "ficsonium-fuel-rod"],
    tier: 8,
    requiresWater: true,
    waterConsumption: 300, // m³/min
    category: "nuclear",
  },
  {
    id: "alien-power-augmenter",
    name: "Alien Power Augmenter",
    description:
      "Uses Power Shards to boost nearby generator output. Does not generate power on its own.",
    powerOutput: 0, // Boost only
    fuelTypes: [], // Uses Power Shards for configuration
    tier: 9,
    requiresWater: false,
    category: "special",
    boostPercent: 100, // Doubles output of connected generators
  },
];

// Helper functions
export const getGeneratorById = (id: string): PowerGenerator | undefined => {
  return generators.find((g) => g.id === id);
};

export const getFuelTypeById = (id: string): FuelType | undefined => {
  return fuelTypes.find((f) => f.id === id);
};

export const getFuelsForGenerator = (generatorId: string): FuelType[] => {
  const generator = getGeneratorById(generatorId);
  if (!generator) return [];
  return fuelTypes.filter((f) => generator.fuelTypes.includes(f.id));
};

export const getGeneratorsForFuel = (fuelId: string): PowerGenerator[] => {
  return generators.filter((g) => g.fuelTypes.includes(fuelId));
};

/**
 * Calculate fuel consumption rate for a generator
 * @param generator The power generator
 * @param fuelType The fuel being used
 * @param clockSpeedPercent Clock speed percentage (100 = normal)
 * @returns Fuel consumption in items/min (or m³/min for fluids)
 */
export const calculateFuelConsumption = (
  generator: PowerGenerator,
  fuelType: FuelType,
  clockSpeedPercent: number = 100
): number => {
  const clockMultiplier = clockSpeedPercent / 100;
  const effectivePower = generator.powerOutput * clockMultiplier;
  // Power = Energy / Time, so consumption rate = Power / Energy Value * 60 (to get per minute)
  return (effectivePower * 60) / fuelType.energyValue;
};

/**
 * Calculate water consumption for generators that need it
 */
export const calculateWaterConsumption = (
  generator: PowerGenerator,
  clockSpeedPercent: number = 100
): number => {
  if (!generator.requiresWater || !generator.waterConsumption) return 0;
  return generator.waterConsumption * (clockSpeedPercent / 100);
};

/**
 * Calculate how many generators are needed for a target power output
 */
export const calculateGeneratorsNeeded = (
  generator: PowerGenerator,
  targetPowerMW: number,
  clockSpeedPercent: number = 100
): number => {
  const effectivePower = generator.powerOutput * (clockSpeedPercent / 100);
  return Math.ceil(targetPowerMW / effectivePower);
};

/**
 * Calculate total fuel needed for a duration
 */
export const calculateFuelForDuration = (
  generator: PowerGenerator,
  fuelType: FuelType,
  durationMinutes: number,
  clockSpeedPercent: number = 100
): number => {
  const consumptionRate = calculateFuelConsumption(
    generator,
    fuelType,
    clockSpeedPercent
  );
  return consumptionRate * durationMinutes;
};

// Generator categories for UI
export const generatorCategories = [
  { id: "biomass", name: "Biomass", color: "#22c55e" },
  { id: "fossil", name: "Fossil Fuel", color: "#f59e0b" },
  { id: "renewable", name: "Renewable", color: "#06b6d4" },
  { id: "nuclear", name: "Nuclear", color: "#a855f7" },
  { id: "special", name: "Special", color: "#ec4899" },
] as const;
