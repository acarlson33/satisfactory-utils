/**
 * Central data exports for Satisfactory game data
 */

// Items
export {
  items,
  getItemById,
  getItemsByCategory,
  getItemsByTier,
  searchItems,
  itemCategories,
} from "./items";

// Resource limits (max obtainable from the map)
export { resourceLimits, getResourceLimit } from "./resource-limits";

// Recipes
export {
  recipes,
  getRecipeById,
  getRecipesByBuilding,
  getRecipesByOutput,
  getRecipesByInput,
  getAlternateRecipes,
  getDefaultRecipes,
  searchRecipes,
  getRecipeRate,
} from "./recipes";

// Buildings
export {
  buildings,
  getBuildingById,
  getBuildingsByCategory,
  getBuildingsByTier,
  calculatePowerAtClockSpeed,
  calculateBuildingsNeeded,
  buildingCategories,
} from "./buildings";

// Power Generators
export {
  generators,
  fuelTypes,
  getGeneratorById,
  getFuelTypeById,
  getFuelsForGenerator,
  getGeneratorsForFuel,
  calculateFuelConsumption,
  calculateWaterConsumption,
  calculateGeneratorsNeeded,
  calculateFuelForDuration,
  generatorCategories,
} from "./generators";
