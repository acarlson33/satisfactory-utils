/**
 * Satisfactory Items Data
 *
 * Contains all items from Satisfactory 1.0
 * Items are categorized and include tier unlock information
 */

import type { Item, ItemCategory } from "@/types";

export const items: Item[] = [
  // ============== ORES ==============
  {
    id: "iron-ore",
    name: "Iron Ore",
    category: "ore",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "copper-ore",
    name: "Copper Ore",
    category: "ore",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "limestone",
    name: "Limestone",
    category: "ore",
    tier: 0,
    stackSize: 100,
  },
  { id: "coal", name: "Coal", category: "ore", tier: 3, stackSize: 100 },
  {
    id: "caterium-ore",
    name: "Caterium Ore",
    category: "ore",
    tier: 2,
    stackSize: 100,
  },
  {
    id: "raw-quartz",
    name: "Raw Quartz",
    category: "ore",
    tier: 3,
    stackSize: 100,
  },
  { id: "sulfur", name: "Sulfur", category: "ore", tier: 5, stackSize: 100 },
  { id: "bauxite", name: "Bauxite", category: "ore", tier: 5, stackSize: 100 },
  { id: "uranium", name: "Uranium", category: "ore", tier: 8, stackSize: 100 },
  { id: "sam", name: "SAM", category: "ore", tier: 7, stackSize: 100 },

  // ============== INGOTS ==============
  {
    id: "iron-ingot",
    name: "Iron Ingot",
    category: "ingot",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "copper-ingot",
    name: "Copper Ingot",
    category: "ingot",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "steel-ingot",
    name: "Steel Ingot",
    category: "ingot",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "caterium-ingot",
    name: "Caterium Ingot",
    category: "ingot",
    tier: 2,
    stackSize: 100,
  },
  {
    id: "aluminum-ingot",
    name: "Aluminum Ingot",
    category: "ingot",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "ficsite-ingot",
    name: "Ficsite Ingot",
    category: "ingot",
    tier: 9,
    stackSize: 100,
  },

  // ============== MINERALS ==============
  {
    id: "concrete",
    name: "Concrete",
    category: "mineral",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "quartz-crystal",
    name: "Quartz Crystal",
    category: "mineral",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "silica",
    name: "Silica",
    category: "mineral",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "compacted-coal",
    name: "Compacted Coal",
    category: "mineral",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "aluminum-scrap",
    name: "Aluminum Scrap",
    category: "mineral",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "petroleum-coke",
    name: "Petroleum Coke",
    category: "mineral",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "polymer-resin",
    name: "Polymer Resin",
    category: "mineral",
    tier: 5,
    stackSize: 100,
  },

  // ============== STANDARD PARTS ==============
  {
    id: "iron-plate",
    name: "Iron Plate",
    category: "component",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "iron-rod",
    name: "Iron Rod",
    category: "component",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "screw",
    name: "Screw",
    category: "component",
    tier: 0,
    stackSize: 500,
  },
  {
    id: "copper-sheet",
    name: "Copper Sheet",
    category: "component",
    tier: 2,
    stackSize: 100,
  },
  {
    id: "steel-beam",
    name: "Steel Beam",
    category: "component",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "steel-pipe",
    name: "Steel Pipe",
    category: "component",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "aluminum-casing",
    name: "Aluminum Casing",
    category: "component",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "ficsite-trigon",
    name: "Ficsite Trigon",
    category: "component",
    tier: 9,
    stackSize: 100,
  },

  // ============== INDUSTRIAL PARTS ==============
  {
    id: "reinforced-iron-plate",
    name: "Reinforced Iron Plate",
    category: "component",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "modular-frame",
    name: "Modular Frame",
    category: "component",
    tier: 2,
    stackSize: 50,
  },
  {
    id: "heavy-modular-frame",
    name: "Heavy Modular Frame",
    category: "component",
    tier: 4,
    stackSize: 50,
  },
  {
    id: "fused-modular-frame",
    name: "Fused Modular Frame",
    category: "component",
    tier: 7,
    stackSize: 50,
  },
  {
    id: "encased-industrial-beam",
    name: "Encased Industrial Beam",
    category: "component",
    tier: 4,
    stackSize: 100,
  },
  {
    id: "alclad-aluminum-sheet",
    name: "Alclad Aluminum Sheet",
    category: "component",
    tier: 5,
    stackSize: 100,
  },

  // ============== ELECTRONIC PARTS ==============
  { id: "wire", name: "Wire", category: "component", tier: 0, stackSize: 500 },
  {
    id: "cable",
    name: "Cable",
    category: "component",
    tier: 0,
    stackSize: 200,
  },
  {
    id: "quickwire",
    name: "Quickwire",
    category: "component",
    tier: 2,
    stackSize: 500,
  },
  {
    id: "circuit-board",
    name: "Circuit Board",
    category: "component",
    tier: 4,
    stackSize: 200,
  },
  {
    id: "ai-limiter",
    name: "AI Limiter",
    category: "component",
    tier: 4,
    stackSize: 100,
  },
  {
    id: "high-speed-connector",
    name: "High-Speed Connector",
    category: "component",
    tier: 6,
    stackSize: 100,
  },

  // ============== MOTORS & POWER ==============
  {
    id: "rotor",
    name: "Rotor",
    category: "component",
    tier: 2,
    stackSize: 100,
  },
  {
    id: "stator",
    name: "Stator",
    category: "component",
    tier: 3,
    stackSize: 100,
  },
  { id: "motor", name: "Motor", category: "component", tier: 4, stackSize: 50 },
  {
    id: "turbo-motor",
    name: "Turbo Motor",
    category: "component",
    tier: 8,
    stackSize: 50,
  },
  {
    id: "battery",
    name: "Battery",
    category: "component",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "cooling-system",
    name: "Cooling System",
    category: "component",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "heat-sink",
    name: "Heat Sink",
    category: "component",
    tier: 5,
    stackSize: 100,
  },

  // ============== ELECTRONICS ==============
  {
    id: "computer",
    name: "Computer",
    category: "electronics",
    tier: 5,
    stackSize: 50,
  },
  {
    id: "supercomputer",
    name: "Supercomputer",
    category: "electronics",
    tier: 7,
    stackSize: 50,
  },
  {
    id: "quantum-computer",
    name: "Quantum Computer",
    category: "electronics",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "crystal-oscillator",
    name: "Crystal Oscillator",
    category: "electronics",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "radio-control-unit",
    name: "Radio Control Unit",
    category: "electronics",
    tier: 6,
    stackSize: 50,
  },

  // ============== COMMUNICATION ==============
  {
    id: "electromagnetic-control-rod",
    name: "Electromagnetic Control Rod",
    category: "component",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "neural-quantum-processor",
    name: "Neural-Quantum Processor",
    category: "electronics",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "superposition-oscillator",
    name: "Superposition Oscillator",
    category: "electronics",
    tier: 9,
    stackSize: 50,
  },

  // ============== FLUIDS ==============
  { id: "water", name: "Water", category: "fluid", tier: 3, isFluid: true },
  {
    id: "crude-oil",
    name: "Crude Oil",
    category: "fluid",
    tier: 5,
    isFluid: true,
  },
  {
    id: "heavy-oil-residue",
    name: "Heavy Oil Residue",
    category: "fluid",
    tier: 5,
    isFluid: true,
  },
  { id: "fuel", name: "Fuel", category: "fluid", tier: 5, isFluid: true },
  {
    id: "turbofuel",
    name: "Turbofuel",
    category: "fluid",
    tier: 5,
    isFluid: true,
  },
  {
    id: "rocket-fuel",
    name: "Rocket Fuel",
    category: "fluid",
    tier: 7,
    isFluid: true,
  },
  {
    id: "ionized-fuel",
    name: "Ionized Fuel",
    category: "fluid",
    tier: 9,
    isFluid: true,
  },
  {
    id: "nitrogen-gas",
    name: "Nitrogen Gas",
    category: "fluid",
    tier: 7,
    isFluid: true,
  },
  {
    id: "nitric-acid",
    name: "Nitric Acid",
    category: "fluid",
    tier: 7,
    isFluid: true,
  },
  {
    id: "sulfuric-acid",
    name: "Sulfuric Acid",
    category: "fluid",
    tier: 7,
    isFluid: true,
  },
  {
    id: "alumina-solution",
    name: "Alumina Solution",
    category: "fluid",
    tier: 5,
    isFluid: true,
  },
  {
    id: "dissolved-silica",
    name: "Dissolved Silica",
    category: "fluid",
    tier: 9,
    isFluid: true,
  },
  {
    id: "excited-photonic-matter",
    name: "Excited Photonic Matter",
    category: "fluid",
    tier: 9,
    isFluid: true,
  },
  {
    id: "dark-matter-residue",
    name: "Dark Matter Residue",
    category: "fluid",
    tier: 9,
    isFluid: true,
  },

  // ============== PACKAGED FLUIDS ==============
  {
    id: "packaged-water",
    name: "Packaged Water",
    category: "packaged-fluid",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "packaged-oil",
    name: "Packaged Oil",
    category: "packaged-fluid",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "packaged-fuel",
    name: "Packaged Fuel",
    category: "packaged-fluid",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "packaged-turbofuel",
    name: "Packaged Turbofuel",
    category: "packaged-fluid",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "packaged-heavy-oil-residue",
    name: "Packaged Heavy Oil Residue",
    category: "packaged-fluid",
    tier: 5,
    stackSize: 100,
  },
  {
    id: "packaged-nitrogen-gas",
    name: "Packaged Nitrogen Gas",
    category: "packaged-fluid",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "packaged-nitric-acid",
    name: "Packaged Nitric Acid",
    category: "packaged-fluid",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "packaged-sulfuric-acid",
    name: "Packaged Sulfuric Acid",
    category: "packaged-fluid",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "packaged-alumina-solution",
    name: "Packaged Alumina Solution",
    category: "packaged-fluid",
    tier: 5,
    stackSize: 100,
  },

  // ============== OIL PRODUCTS ==============
  {
    id: "plastic",
    name: "Plastic",
    category: "material",
    tier: 5,
    stackSize: 200,
  },
  {
    id: "rubber",
    name: "Rubber",
    category: "material",
    tier: 5,
    stackSize: 200,
  },
  {
    id: "empty-canister",
    name: "Empty Canister",
    category: "container",
    tier: 3,
    stackSize: 100,
  },
  {
    id: "empty-fluid-tank",
    name: "Empty Fluid Tank",
    category: "container",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "pressure-conversion-cube",
    name: "Pressure Conversion Cube",
    category: "container",
    tier: 8,
    stackSize: 50,
  },

  // ============== NUCLEAR ==============
  {
    id: "encased-uranium-cell",
    name: "Encased Uranium Cell",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "uranium-fuel-rod",
    name: "Uranium Fuel Rod",
    category: "nuclear",
    tier: 8,
    stackSize: 50,
  },
  {
    id: "uranium-waste",
    name: "Uranium Waste",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "plutonium-pellet",
    name: "Plutonium Pellet",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "encased-plutonium-cell",
    name: "Encased Plutonium Cell",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "plutonium-fuel-rod",
    name: "Plutonium Fuel Rod",
    category: "nuclear",
    tier: 8,
    stackSize: 50,
  },
  {
    id: "plutonium-waste",
    name: "Plutonium Waste",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "non-fissile-uranium",
    name: "Non-fissile Uranium",
    category: "nuclear",
    tier: 8,
    stackSize: 100,
  },
  {
    id: "ficsonium",
    name: "Ficsonium",
    category: "nuclear",
    tier: 9,
    stackSize: 100,
  },
  {
    id: "ficsonium-fuel-rod",
    name: "Ficsonium Fuel Rod",
    category: "nuclear",
    tier: 9,
    stackSize: 50,
  },

  // ============== PROJECT PARTS ==============
  {
    id: "smart-plating",
    name: "Smart Plating",
    category: "project-part",
    tier: 2,
    stackSize: 50,
  },
  {
    id: "versatile-framework",
    name: "Versatile Framework",
    category: "project-part",
    tier: 3,
    stackSize: 50,
  },
  {
    id: "automated-wiring",
    name: "Automated Wiring",
    category: "project-part",
    tier: 4,
    stackSize: 50,
  },
  {
    id: "modular-engine",
    name: "Modular Engine",
    category: "project-part",
    tier: 5,
    stackSize: 50,
  },
  {
    id: "adaptive-control-unit",
    name: "Adaptive Control Unit",
    category: "project-part",
    tier: 6,
    stackSize: 50,
  },
  {
    id: "assembly-director-system",
    name: "Assembly Director System",
    category: "project-part",
    tier: 7,
    stackSize: 50,
  },
  {
    id: "magnetic-field-generator",
    name: "Magnetic Field Generator",
    category: "project-part",
    tier: 8,
    stackSize: 50,
  },
  {
    id: "thermal-propulsion-rocket",
    name: "Thermal Propulsion Rocket",
    category: "project-part",
    tier: 8,
    stackSize: 50,
  },
  {
    id: "nuclear-pasta",
    name: "Nuclear Pasta",
    category: "project-part",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "biochemical-sculptor",
    name: "Biochemical Sculptor",
    category: "project-part",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "ballistic-warp-drive",
    name: "Ballistic Warp Drive",
    category: "project-part",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "ai-expansion-server",
    name: "AI Expansion Server",
    category: "project-part",
    tier: 9,
    stackSize: 50,
  },

  // ============== BIOMASS ==============
  {
    id: "leaves",
    name: "Leaves",
    category: "biomass",
    tier: 0,
    stackSize: 500,
  },
  { id: "wood", name: "Wood", category: "biomass", tier: 0, stackSize: 200 },
  {
    id: "biomass",
    name: "Biomass",
    category: "biomass",
    tier: 0,
    stackSize: 200,
  },
  {
    id: "solid-biofuel",
    name: "Solid Biofuel",
    category: "biomass",
    tier: 0,
    stackSize: 200,
  },
  {
    id: "fabric",
    name: "Fabric",
    category: "biomass",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "mycelia",
    name: "Mycelia",
    category: "biomass",
    tier: 0,
    stackSize: 200,
  },
  {
    id: "alien-protein",
    name: "Alien Protein",
    category: "biomass",
    tier: 0,
    stackSize: 100,
  },
  {
    id: "alien-dna-capsule",
    name: "Alien DNA Capsule",
    category: "biomass",
    tier: 0,
    stackSize: 50,
  },

  // ============== SPECIAL ITEMS ==============
  {
    id: "power-shard",
    name: "Power Shard",
    category: "special",
    tier: 2,
    stackSize: 100,
  },
  {
    id: "somersloop",
    name: "Somersloop",
    category: "special",
    tier: 0,
    stackSize: 1,
  },
  {
    id: "mercer-sphere",
    name: "Mercer Sphere",
    category: "special",
    tier: 0,
    stackSize: 1,
  },
  {
    id: "reanimated-sam",
    name: "Reanimated SAM",
    category: "special",
    tier: 7,
    stackSize: 100,
  },
  {
    id: "sam-fluctuator",
    name: "SAM Fluctuator",
    category: "special",
    tier: 9,
    stackSize: 100,
  },
  {
    id: "singularity-cell",
    name: "Singularity Cell",
    category: "special",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "time-crystal",
    name: "Time Crystal",
    category: "special",
    tier: 9,
    stackSize: 50,
  },
  {
    id: "dark-matter-crystal",
    name: "Dark Matter Crystal",
    category: "special",
    tier: 9,
    stackSize: 100,
  },
  {
    id: "diamonds",
    name: "Diamonds",
    category: "special",
    tier: 9,
    stackSize: 100,
  },
];

// Helper functions
export const getItemById = (id: string): Item | undefined => {
  return items.find((item) => item.id === id);
};

export const getItemsByCategory = (category: ItemCategory): Item[] => {
  return items.filter((item) => item.category === category);
};

export const getItemsByTier = (tier: number): Item[] => {
  return items.filter((item) => item.tier === tier);
};

export const searchItems = (query: string): Item[] => {
  const lower = query.toLowerCase();
  return items.filter(
    (item) => item.name.toLowerCase().includes(lower) || item.id.includes(lower)
  );
};

// Category metadata
export const itemCategories: {
  id: ItemCategory;
  name: string;
  icon: string;
}[] = [
  { id: "ore", name: "Ores", icon: "⛏️" },
  { id: "ingot", name: "Ingots", icon: "🪙" },
  { id: "mineral", name: "Minerals", icon: "💎" },
  { id: "component", name: "Components", icon: "⚙️" },
  { id: "electronics", name: "Electronics", icon: "🔌" },
  { id: "fluid", name: "Fluids", icon: "💧" },
  { id: "packaged-fluid", name: "Packaged Fluids", icon: "🛢️" },
  { id: "material", name: "Materials", icon: "📦" },
  { id: "container", name: "Containers", icon: "🗃️" },
  { id: "nuclear", name: "Nuclear", icon: "☢️" },
  { id: "project-part", name: "Project Parts", icon: "🚀" },
  { id: "biomass", name: "Biomass", icon: "🌿" },
  { id: "special", name: "Special", icon: "✨" },
];
