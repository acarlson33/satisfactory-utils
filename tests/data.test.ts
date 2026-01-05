// @ts-nocheck
import { describe, expect, it } from "vitest";
import {
  getItemById,
  getItemsByCategory,
  getItemsByTier,
  searchItems,
  searchRecipes,
  getRecipesByOutput,
  getRecipesByInput,
  getRecipesByBuilding,
  getRecipeRate,
  getRecipeById,
  getAlternateRecipes,
  getDefaultRecipes,
  getBuildingById,
  getBuildingsByCategory,
  getBuildingsByTier,
  calculatePowerAtClockSpeed,
  calculateBuildingsNeeded,
  getGeneratorById,
  getFuelsForGenerator,
  getGeneratorsForFuel,
  calculateFuelConsumption,
  calculateWaterConsumption,
  calculateGeneratorsNeeded,
  calculateFuelForDuration,
  getResourceLimit,
} from "@/lib/data";
import { fuelTypes, generatorCategories } from "@/lib/data/generators";
const ironOre = getItemById("iron-ore")!;
const coalFuel = fuelTypes.find((f) => f.id === "coal")!;
const coalGenerator = getGeneratorById("coal-generator")!;
const smelter = getBuildingById("smelter")!;

describe("data helpers", () => {
  it("finds items by id, category, and search", () => {
    expect(ironOre.name).toBe("Iron Ore");
    expect(getItemsByCategory("ore").length).toBeGreaterThan(3);
    expect(searchItems("plate").some((i) => i.id === "iron-plate")).toBe(true);
    expect(getItemsByTier(0).length).toBeGreaterThan(3);
    expect(searchItems("IRON").some((i) => i.id === "iron-ore")).toBe(true);
    expect(getItemsByTier(99).length).toBe(0);
  });

  it("finds recipes by input/output and computes rates", () => {
    const plasticRecipes = getRecipesByOutput("plastic");
    expect(plasticRecipes.map((r) => r.id)).toContain("plastic");

    const smelterRecipes = getRecipesByBuilding("smelter");
    expect(smelterRecipes.every((r) => r.buildingId === "smelter")).toBe(true);
    expect(smelterRecipes.length).toBeGreaterThan(0);

    const heavyOilConsumers = getRecipesByInput("heavy-oil-residue");
    expect(heavyOilConsumers.length).toBeGreaterThan(0);

    const plasticRecipe = getRecipeById("plastic")!;
    const rates = getRecipeRate(plasticRecipe);
    const plasticPerMinute = rates.outputs.find(
      (o) => o.itemId === "plastic"
    )?.amount;
    const horPerMinute = rates.outputs.find(
      (o) => o.itemId === "heavy-oil-residue"
    )?.amount;

    expect(plasticPerMinute).toBeCloseTo(20, 5);
    expect(horPerMinute).toBeCloseTo(10, 5);

    const search = searchRecipes("screw");
    expect(
      search.some((r) => r.outputs.some((o) => o.itemId === "screw"))
    ).toBe(true);

    const emptySearch = searchRecipes("nonexistent-item-fragment");
    expect(emptySearch.length).toBe(0);

    const fuelRecipe = getRecipeById("fuel")!;
    const fuelRates = getRecipeRate(fuelRecipe);
    const fuelOut = fuelRates.outputs.find((o) => o.itemId === "fuel")?.amount;
    const resinOut = fuelRates.outputs.find(
      (o) => o.itemId === "polymer-resin"
    )?.amount;
    expect(fuelOut).toBeCloseTo(40, 5);
    expect(resinOut).toBeCloseTo(30, 5);
  });

  it("filters buildings and categories", () => {
    expect(getBuildingsByCategory("production").length).toBeGreaterThan(0);
    expect(getBuildingsByTier(0).length).toBeGreaterThan(0);

    expect(generatorCategories.length).toBeGreaterThanOrEqual(3);
    expect(generatorCategories.some((g) => g.id === "nuclear")).toBe(true);
  });

  it("separates default and alternate recipes", () => {
    const alternates = getAlternateRecipes();
    const defaults = getDefaultRecipes();
    expect(alternates.every((r) => r.isAlternate)).toBe(true);
    expect(defaults.every((r) => !r.isAlternate)).toBe(true);
    expect(defaults.length).toBeGreaterThan(alternates.length);
  });

  it("computes building power and counts", () => {
    const powerAt200 = calculatePowerAtClockSpeed(smelter, 200);
    expect(powerAt200).toBeCloseTo(4 * Math.pow(2, 1.6), 5);

    const powerAt1 = calculatePowerAtClockSpeed(smelter, 1);
    expect(powerAt1).toBeGreaterThan(0);

    const buildingsNeeded = calculateBuildingsNeeded(
      { craftTime: 4, outputs: [{ amount: 2 }] },
      60,
      100
    );
    expect(buildingsNeeded).toBeCloseTo(2);
  });

  it("resolves generator fuels and consumption", () => {
    expect(getFuelsForGenerator("coal-generator").length).toBeGreaterThan(0);
    expect(
      getGeneratorsForFuel("coal").some((g) => g.id === "coal-generator")
    ).toBe(true);

    const consumption = calculateFuelConsumption(coalGenerator, coalFuel, 100);
    expect(consumption).toBeCloseTo((coalGenerator.powerOutput * 60) / 300, 5);

    const water = calculateWaterConsumption(coalGenerator, 150);
    expect(water).toBeCloseTo(45 * 1.5, 5);

    const fuelGen = getGeneratorById("fuel-generator")!;
    expect(calculateWaterConsumption(fuelGen, 120)).toBe(0);

    const generatorsFor1000MW = calculateGeneratorsNeeded(
      coalGenerator,
      1000,
      100
    );
    expect(generatorsFor1000MW).toBeGreaterThan(0);

    const fuelForHour = calculateFuelForDuration(
      coalGenerator,
      coalFuel,
      60,
      100
    );
    expect(fuelForHour).toBeCloseTo(
      calculateFuelConsumption(coalGenerator, coalFuel, 100) * 60,
      5
    );

    const zeroClockFuel = calculateFuelConsumption(coalGenerator, coalFuel, 1);
    expect(zeroClockFuel).toBeLessThan(consumption);

    const roundedGenerators = calculateGeneratorsNeeded(coalGenerator, 76, 100);
    expect(roundedGenerators).toBe(2);

    const halfClockFuel = calculateFuelForDuration(
      coalGenerator,
      coalFuel,
      10,
      50
    );
    expect(halfClockFuel).toBeLessThan(fuelForHour);
  });

  it("returns resource limits by id", () => {
    const coalLimit = getResourceLimit("coal");
    expect(coalLimit?.maxRate).toBeGreaterThan(30000);
    expect(getResourceLimit("non-existent")).toBeNull();
    const oilLimit = getResourceLimit("crude-oil");
    expect(oilLimit?.isFluid).toBe(true);
  });
});
