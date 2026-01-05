/**
 * Factory plan type definitions for Satisfactory
 */

import type { BuildingId } from "./building";

/**
 * Production target modes
 */
export type ProductionMode = "exact" | "maximize";

/**
 * Resource limit for maximize mode
 */
export interface ResourceLimit {
  /** Item ID of the raw resource */
  itemId: string;
  /** Maximum input rate in items/min or m³/min */
  maxRate: number;
}

/**
 * Production target for a factory
 */
export interface ProductionTarget {
  /** Item ID to produce */
  itemId: string;
  /** Production mode */
  mode: ProductionMode;
  /** Target rate for exact mode (items/min) */
  targetRate?: number;
  /** Resource limits for maximize mode */
  maxInputs?: ResourceLimit[];
  /** Priority when multiple targets compete for resources */
  priority?: number;
}

/**
 * Node types in the factory graph
 */
export type FactoryNodeType =
  | "building"
  | "input"
  | "output"
  | "splitter"
  | "merger";

/**
 * Position in the factory graph
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Data for a building node
 */
export interface BuildingNodeData {
  /** Building type ID */
  buildingId: BuildingId;
  /** Recipe being produced */
  recipeId: string;
  /** Clock speed (0.01-2.5) */
  clockSpeed: number;
  /** Whether Somersloop amplification is active */
  amplified: boolean;
  /** Number of machines needed (can be fractional for display) */
  machineCount: number;
  /** Actual power consumption */
  powerConsumption: number;
}

/**
 * Data for an input/output resource node
 */
export interface ResourceNodeData {
  /** Item ID */
  itemId: string;
  /** Rate in items/min */
  rate: number;
  /** Whether this is an external input (raw resource) */
  isExternal: boolean;
}

/**
 * Data for splitter/merger nodes
 */
export interface LogisticsNodeData {
  /** Number of outputs (for splitter) or inputs (for merger) */
  connectionCount: number;
}

/**
 * A node in the factory graph
 */
export interface FactoryNode {
  /** Unique node ID */
  id: string;
  /** Node type */
  type: FactoryNodeType;
  /** Position in the graph */
  position: Position;
  /** Node-specific data */
  data: BuildingNodeData | ResourceNodeData | LogisticsNodeData;
}

/**
 * An edge connecting two nodes
 */
export interface FactoryEdge {
  /** Unique edge ID */
  id: string;
  /** Source node ID */
  source: string;
  /** Source handle/port ID */
  sourceHandle?: string;
  /** Target node ID */
  target: string;
  /** Target handle/port ID */
  targetHandle?: string;
  /** Item being transported */
  itemId: string;
  /** Rate in items/min */
  rate: number;
  /** Whether this edge represents a belt (true) or pipe (false) */
  isBelt: boolean;
}

/**
 * Factory settings
 */
export interface FactorySettings {
  /** Default clock speed for new buildings */
  defaultClockSpeed: number;
  /** Whether to prefer fewer machines over power efficiency */
  preferFewerMachines: boolean;
  /** Whether to use alternate recipes by default when enabled */
  preferAlternates: boolean;
  /** Maximum number of Somersloops to use */
  maxSomersloops: number;
}

/**
 * Complete factory plan
 */
export interface FactoryPlan {
  /** Unique identifier */
  id: string;
  /** Factory name */
  name: string;
  /** Game version this plan was created for */
  version: string;
  /** Created timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt: Date;
  /** Production targets */
  targets: ProductionTarget[];
  /** Enabled alternate recipe IDs */
  enabledAlternates: string[];
  /** Factory graph nodes */
  nodes: FactoryNode[];
  /** Factory graph edges */
  edges: FactoryEdge[];
  /** Factory settings */
  settings: FactorySettings;
}

/**
 * Summary statistics for a factory plan
 */
export interface FactorySummary {
  /** Total power consumption in MW */
  totalPower: number;
  /** Total number of buildings by type */
  buildingCounts: Record<BuildingId, number>;
  /** Raw resource inputs */
  rawInputs: Array<{
    itemId: string;
    name: string;
    rate: number;
    isFluid: boolean;
  }>;
  /** Final outputs */
  outputs: Array<{
    itemId: string;
    name: string;
    rate: number;
    isFluid: boolean;
  }>;
  /** Total Somersloops used */
  somersloopsUsed: number;
  /** Total Power Shards used */
  powerShardsUsed: number;
}

/**
 * Serialized factory plan for URL sharing
 */
export interface SerializedFactoryPlan {
  /** Compressed plan data */
  data: string;
  /** Version of the serialization format */
  formatVersion: number;
}

/**
 * Default factory settings
 */
export const DEFAULT_FACTORY_SETTINGS: FactorySettings = {
  defaultClockSpeed: 1,
  preferFewerMachines: false,
  preferAlternates: true,
  maxSomersloops: 0,
};
