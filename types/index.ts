/**
 * Central type exports for Satisfactory Utils
 */

// Item types
export type {
  Item,
  ItemCategory,
  ItemWithRate,
  ItemMap,
  ItemsByCategory,
} from "./item";

// Recipe types
export type {
  Recipe,
  RecipeIO,
  RecipeWithMachines,
  UnlockRequirement,
  RecipeMap,
  RecipesByOutput,
  RecipesByBuilding,
} from "./recipe";

// Building types
export type {
  ProductionBuilding,
  BuildingCategory,
  BuildingId,
  BuildingMap,
} from "./building";

export {
  calculatePowerAtClockSpeed,
  calculateProductionRate,
} from "./building";

// Power types
export type {
  PowerGenerator,
  GeneratorId,
  FuelType,
  FuelByproduct,
  FuelCategory,
  GeneratorCategory,
  GeneratorSetup,
  FuelConsumption,
  PowerPlan,
  GeneratorMap,
} from "./power";

export { calculateGeneratorPower, calculateFuelConsumption } from "./power";

// Factory types
export type {
  FactoryPlan,
  FactoryNode,
  FactoryEdge,
  FactoryNodeType,
  FactorySettings,
  FactorySummary,
  ProductionTarget,
  ProductionMode,
  ResourceLimit,
  Position,
  BuildingNodeData,
  ResourceNodeData,
  LogisticsNodeData,
  SerializedFactoryPlan,
} from "./factory";

export { DEFAULT_FACTORY_SETTINGS } from "./factory";
