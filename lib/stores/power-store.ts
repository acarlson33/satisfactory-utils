/**
 * Power Planner Store
 *
 * Manages state for the power planning feature including:
 * - Generator configurations
 * - Fuel selections
 * - Power calculations
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeneratorId } from "@/types";
import {
  getGeneratorById,
  getFuelTypeById,
  calculateFuelConsumption,
  calculateWaterConsumption,
  getGeneratorsForFuel,
} from "@/lib/data";

export interface GeneratorConfig {
  id: string;
  generatorId: GeneratorId;
  fuelId: string;
  count: number;
  clockSpeed: number; // percentage (100 = normal)
}

export interface PowerPlanSnapshot {
  targetPower: number | null;
  generators: GeneratorConfig[];
}

export interface PowerCalculation {
  totalPower: number;
  generatorBreakdown: {
    generatorId: GeneratorId;
    generatorName: string;
    count: number;
    powerPerUnit: number;
    totalPower: number;
  }[];
  fuelConsumption: {
    fuelId: string;
    fuelName: string;
    rate: number;
    isFluid: boolean;
  }[];
  waterConsumption: number;
  wasteProduction: {
    itemId: string;
    itemName: string;
    rate: number;
  }[];
}

interface PowerState {
  // Target configuration
  targetPower: number | null;

  // Generator configurations
  generators: GeneratorConfig[];

  // Calculated results
  calculation: PowerCalculation | null;

  // UI state
  isCalculating: boolean;

  // Actions
  setTargetPower: (power: number | null) => void;
  addGenerator: (generatorId: GeneratorId, fuelId: string) => void;
  removeGenerator: (configId: string) => void;
  updateGenerator: (
    configId: string,
    updates: Partial<GeneratorConfig>
  ) => void;
  setGeneratorCount: (configId: string, count: number) => void;
  setGeneratorClockSpeed: (configId: string, clockSpeed: number) => void;
  setGeneratorFuel: (configId: string, fuelId: string) => void;
  calculatePower: () => void;
  clearGenerators: () => void;
  autoCalculateForTarget: () => void;
  planFromFuel: (
    fuelId: string,
    availableRate: number,
    clockSpeed?: number
  ) => boolean;
  exportPlan: () => PowerPlanSnapshot;
  importPlan: (json: string) => boolean;
}

let configIdCounter = 0;

function generateConfigId(): string {
  return `gen-config-${++configIdCounter}-${Date.now()}`;
}

function calculatePowerPlan(generators: GeneratorConfig[]): PowerCalculation {
  let totalPower = 0;
  const generatorBreakdown: PowerCalculation["generatorBreakdown"] = [];
  const fuelConsumptionMap = new Map<
    string,
    { rate: number; name: string; isFluid: boolean }
  >();
  let waterConsumption = 0;
  const wasteMap = new Map<string, { rate: number; name: string }>();

  for (const config of generators) {
    const generator = getGeneratorById(config.generatorId);
    const fuel = config.fuelId ? getFuelTypeById(config.fuelId) : null;

    if (!generator) continue;

    const clockMultiplier = config.clockSpeed / 100;
    const powerPerUnit = generator.powerOutput * clockMultiplier;
    const totalGeneratorPower = powerPerUnit * config.count;

    totalPower += totalGeneratorPower;

    // Add to breakdown
    const existing = generatorBreakdown.find(
      (b) => b.generatorId === config.generatorId
    );
    if (existing) {
      existing.count += config.count;
      existing.totalPower += totalGeneratorPower;
    } else {
      generatorBreakdown.push({
        generatorId: config.generatorId,
        generatorName: generator.name,
        count: config.count,
        powerPerUnit,
        totalPower: totalGeneratorPower,
      });
    }

    // Calculate fuel consumption
    if (fuel) {
      const fuelRate =
        calculateFuelConsumption(generator, fuel, config.clockSpeed) *
        config.count;
      const existingFuel = fuelConsumptionMap.get(config.fuelId);
      if (existingFuel) {
        existingFuel.rate += fuelRate;
      } else {
        fuelConsumptionMap.set(config.fuelId, {
          rate: fuelRate,
          name: fuel.name,
          isFluid: !!fuel.isFluid,
        });
      }

      // Calculate waste for nuclear
      if (fuel.byproducts) {
        for (const byproduct of fuel.byproducts) {
          // Waste rate based on fuel burn rate
          const burnRate = fuelRate;
          const wasteRate = byproduct.amount * burnRate;
          const existingWaste = wasteMap.get(byproduct.itemId);
          if (existingWaste) {
            existingWaste.rate += wasteRate;
          } else {
            wasteMap.set(byproduct.itemId, {
              rate: wasteRate,
              name: byproduct.itemId
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            });
          }
        }
      }
    }

    // Calculate water consumption
    if (generator.requiresWater) {
      waterConsumption +=
        calculateWaterConsumption(generator, config.clockSpeed) * config.count;
    }
  }

  return {
    totalPower,
    generatorBreakdown,
    fuelConsumption: Array.from(fuelConsumptionMap.entries()).map(
      ([fuelId, data]) => ({
        fuelId,
        fuelName: data.name,
        rate: data.rate,
        isFluid: data.isFluid,
      })
    ),
    waterConsumption,
    wasteProduction: Array.from(wasteMap.entries()).map(([itemId, data]) => ({
      itemId,
      itemName: data.name,
      rate: data.rate,
    })),
  };
}

export const usePowerStore = create<PowerState>()(
  persist(
    (set, get) => ({
      // Initial state
      targetPower: null,
      generators: [],
      calculation: null,
      isCalculating: false,

      // Actions
      setTargetPower: (power) => {
        set({ targetPower: power });
      },

      addGenerator: (generatorId, fuelId) => {
        const newConfig: GeneratorConfig = {
          id: generateConfigId(),
          generatorId,
          fuelId,
          count: 1,
          clockSpeed: 100,
        };
        set((state) => ({
          generators: [...state.generators, newConfig],
        }));
        get().calculatePower();
      },

      removeGenerator: (configId) => {
        set((state) => ({
          generators: state.generators.filter((g) => g.id !== configId),
        }));
        get().calculatePower();
      },

      updateGenerator: (configId, updates) => {
        set((state) => ({
          generators: state.generators.map((g) =>
            g.id === configId ? { ...g, ...updates } : g
          ),
        }));
        get().calculatePower();
      },

      setGeneratorCount: (configId, count) => {
        set((state) => ({
          generators: state.generators.map((g) =>
            g.id === configId ? { ...g, count: Math.max(1, count) } : g
          ),
        }));
        get().calculatePower();
      },

      setGeneratorClockSpeed: (configId, clockSpeed) => {
        set((state) => ({
          generators: state.generators.map((g) =>
            g.id === configId
              ? { ...g, clockSpeed: Math.min(250, Math.max(1, clockSpeed)) }
              : g
          ),
        }));
        get().calculatePower();
      },

      setGeneratorFuel: (configId, fuelId) => {
        set((state) => ({
          generators: state.generators.map((g) =>
            g.id === configId ? { ...g, fuelId } : g
          ),
        }));
        get().calculatePower();
      },

      calculatePower: () => {
        const { generators } = get();
        set({ isCalculating: true });

        const calculation = calculatePowerPlan(generators);

        set({
          calculation,
          isCalculating: false,
        });
      },

      clearGenerators: () => {
        set({
          generators: [],
          calculation: null,
        });
      },

      autoCalculateForTarget: () => {
        const { targetPower } = get();
        if (!targetPower || targetPower <= 0) return;

        // Simple auto-calculation: use coal generators as default
        const coalGenerator = getGeneratorById("coal-generator");
        if (!coalGenerator) return;

        const count = Math.ceil(targetPower / coalGenerator.powerOutput);

        set({
          generators: [
            {
              id: generateConfigId(),
              generatorId: "coal-generator",
              fuelId: "coal",
              count,
              clockSpeed: 100,
            },
          ],
        });
        get().calculatePower();
      },

      planFromFuel: (fuelId, availableRate, clockSpeed = 100) => {
        const fuel = getFuelTypeById(fuelId);
        if (!fuel || !availableRate || availableRate <= 0) return false;

        const [generator] = getGeneratorsForFuel(fuelId);
        if (!generator) return false;

        const clampedClock = Math.min(250, Math.max(1, clockSpeed));
        const perGenConsumption = calculateFuelConsumption(
          generator,
          fuel,
          clampedClock
        );
        const count = Math.max(
          1,
          Math.floor(availableRate / perGenConsumption)
        );

        set({
          generators: [
            {
              id: generateConfigId(),
              generatorId: generator.id,
              fuelId,
              count,
              clockSpeed: clampedClock,
            },
          ],
        });
        get().calculatePower();
        return true;
      },

      exportPlan: () => {
        const state = get();
        return {
          targetPower: state.targetPower,
          generators: state.generators,
        };
      },

      importPlan: (json) => {
        try {
          const data = JSON.parse(json) as PowerPlanSnapshot;
          set({
            targetPower: data.targetPower ?? null,
            generators: Array.isArray(data.generators) ? data.generators : [],
          });
          get().calculatePower();
          return true;
        } catch (error) {
          console.error("Failed to import power plan", error);
          return false;
        }
      },
    }),
    {
      name: "satisfactory-power-store",
      partialize: (state) => ({
        targetPower: state.targetPower,
        generators: state.generators,
      }),
    }
  )
);
