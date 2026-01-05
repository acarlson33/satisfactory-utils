/**
 * Item type definitions for Satisfactory
 */

export type ItemCategory =
  | "ore"
  | "ingot"
  | "mineral"
  | "component"
  | "electronics"
  | "fluid"
  | "packaged-fluid"
  | "material"
  | "container"
  | "fuel"
  | "nuclear"
  | "project-part"
  | "equipment"
  | "biomass"
  | "special";

export interface Item {
  /** Unique identifier, e.g., "iron-ingot" */
  id: string;
  /** Display name, e.g., "Iron Ingot" */
  name: string;
  /** In-game description */
  description?: string;
  /** Item category for filtering */
  category: ItemCategory;
  /** Maximum stack size (undefined for fluids) */
  stackSize?: number;
  /** AWESOME Sink point value */
  sinkPoints?: number;
  /** Unlock tier (0-9) */
  tier: number;
  /** Whether this item is a fluid */
  isFluid?: boolean;
  /** Path to icon image */
  iconPath?: string;
  /** Internal class name from game */
  className?: string;
}

export interface ItemWithRate extends Item {
  /** Production/consumption rate in items per minute */
  rate: number;
}

/**
 * Lookup map for quick item access by ID
 */
export type ItemMap = Map<string, Item>;

/**
 * Group items by category
 */
export type ItemsByCategory = Record<ItemCategory, Item[]>;
