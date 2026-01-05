/**
 * Maximum obtainable base resource rates from the default map.
 *
 * Source: Satisfactory Wiki resource node tables (base map, Update 8/1.0).
 * Rates assume Miner Mk.3 or Oil Extractor at 250% clock where applicable.
 */

export interface ResourceLimitInfo {
  /** Item ID for the raw resource */
  itemId: string;
  /** Display name */
  name: string;
  /** Count of impure nodes */
  impure?: number;
  /** Count of normal nodes */
  normal?: number;
  /** Count of pure nodes */
  pure?: number;
  /** Maximum total extraction rate across all nodes (items or m³ per minute) */
  maxRate: number;
  /** True when resource is extracted as a fluid */
  isFluid?: boolean;
  /** Extra note for context */
  note?: string;
}

export const resourceLimits: ResourceLimitInfo[] = [
  {
    itemId: "iron-ore",
    name: "Iron Ore",
    impure: 39,
    normal: 42,
    pure: 46,
    maxRate: 72780,
  },
  {
    itemId: "copper-ore",
    name: "Copper Ore",
    impure: 13,
    normal: 29,
    pure: 13,
    maxRate: 31440,
  },
  {
    itemId: "limestone",
    name: "Limestone",
    impure: 15,
    normal: 49,
    pure: 30,
    maxRate: 57300,
  },
  {
    itemId: "coal",
    name: "Coal",
    impure: 15,
    normal: 31,
    pure: 16,
    maxRate: 35580,
  },
  {
    itemId: "caterium-ore",
    name: "Caterium Ore",
    normal: 9,
    pure: 8,
    maxRate: 11640,
  },
  {
    itemId: "raw-quartz",
    name: "Raw Quartz",
    impure: 3,
    normal: 7,
    pure: 7,
    maxRate: 10560,
  },
  {
    itemId: "sulfur",
    name: "Sulfur",
    impure: 6,
    normal: 5,
    pure: 5,
    maxRate: 9480,
  },
  {
    itemId: "bauxite",
    name: "Bauxite",
    impure: 5,
    normal: 6,
    pure: 6,
    maxRate: 9780,
  },
  {
    itemId: "uranium",
    name: "Uranium",
    impure: 3,
    normal: 2,
    pure: 0,
    maxRate: 2100,
  },
  {
    itemId: "sam",
    name: "SAM Ore",
    impure: 10,
    normal: 6,
    pure: 3,
    maxRate: 8940,
  },
  {
    itemId: "crude-oil",
    name: "Crude Oil",
    impure: 10,
    normal: 12,
    pure: 8,
    maxRate: 9900,
    isFluid: true,
    note: "Oil Extractors only; resource wells can add more",
  },
];

const resourceLimitMap = new Map(
  resourceLimits.map((limit) => [limit.itemId, limit])
);

export function getResourceLimit(itemId: string): ResourceLimitInfo | null {
  return resourceLimitMap.get(itemId) ?? null;
}
