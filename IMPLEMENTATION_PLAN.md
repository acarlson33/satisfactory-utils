# Satisfactory Utils - Implementation Plan

A comprehensive web application for Satisfactory factory planning and power management.

## ✅ Implementation Progress

### Completed

- [x] Project scaffolding and configuration (Next.js, TypeScript, Tailwind, Bun)
- [x] Type definitions for all data models (items, recipes, buildings, power)
- [x] Game data files (items, recipes, buildings, generators, fuel types)
- [x] Zustand stores (factory-store, power-store, settings-store)
- [x] React Flow visualization components (ItemNode, RecipeNode, FactoryFlow)
- [x] Factory Planner page with interactive UI
- [x] Power Planner page with generator configuration
- [x] Power planner keyboard shortcuts and hints
- [x] Codex pages (items, recipes, buildings browsers)
- [x] Settings page with preferences UI
- [x] Factory plan import/export JSON
- [x] Navigation and layout components
- [x] Home page with feature overview
- [x] Raw resource limit display in Factory planner
- [x] Factory plan sharing via URL
- [x] Sankey diagram alternative view (with tooltips and rate labels)
- [x] Global clock speed control in Factory planner
- [x] Settings import/export and clear-all across settings, factory, and power
- [x] Somersloop overrides and calculator support (factory + codex detail pages)
- [x] Factory calculator offloaded to a Web Worker with typed requests/responses
- [x] Factory calculation memoization for repeated inputs
- [x] Factory planner accessibility polish (aria live statuses and toggle state)
- [x] Recipe detail pages
- [x] Building detail pages
- [x] Dark/light theme toggle integration
- [x] Production chain calculation refinement (100%-first allocation with per-recipe underclock display)
- [x] Underclocking strategy visibility (per-building and per-recipe clocks shown)
- [x] Byproduct handling and routing (handlers, surplus edges, sink nodes)
- [x] Graph polish: recipe labels on item nodes, purple byproduct flows, legend
- [x] Item icons and images (wiki fetcher, ItemIcon loader, assets in public/images/items)
- [x] Advanced calculator options (Somersloop amplification tuning end-to-end)
- [x] Factory calculation profiling toggle (runtime switch + worker/main logs)

### In Progress

- [ ] —

### Todo

- [ ] Performance profiling and hotspots investigation
- [ ] Further accessibility and keyboard navigation polish
- [ ] Automated tests (unit + Playwright workflows)

---

## 📋 Project Overview

### Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Toolchain**: Bun (package manager, runtime, test runner)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (for complex factory state)
- **Visualization**: React Flow (for factory graphs) + D3.js (for Sankey diagrams)
- **Data Storage**: LocalStorage + IndexedDB (for larger saves)
- **Data Format**: JSON for game data, shareable URL state

### Key Features

1. **Factory Planner** - Visual production chain calculator with optimization
2. **Power Planner** - Fuel and generator calculator for power plants
3. **Recipe Browser** - Codex-like interface for items, recipes, and buildings
4. **Alternate Recipe Manager** - Enable/disable alternate recipes for calculations

---

## 🗂️ Project Structure

```
satisfactory-utils/
├── app/
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Home/landing page
│   ├── factory/
│   │   ├── page.tsx              # Factory planner main view
│   │   └── [id]/page.tsx         # Shareable factory plan
│   ├── power/
│   │   └── page.tsx              # Power planner
│   ├── codex/
│   │   ├── page.tsx              # Codex browser
│   │   ├── items/
│   │   │   └── [slug]/page.tsx   # Item detail page
│   │   ├── recipes/
│   │   │   └── [slug]/page.tsx   # Recipe detail page
│   │   └── buildings/
│   │       └── [slug]/page.tsx   # Building detail page
│   └── settings/
│       └── page.tsx              # App settings, alternate recipes
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── factory/
│   │   ├── FactoryCanvas.tsx     # React Flow canvas
│   │   ├── ProductionNode.tsx    # Factory building node
│   │   ├── ResourceNode.tsx      # Input/output resource node
│   │   ├── ItemSelector.tsx      # Item search/select component
│   │   ├── RecipeSelector.tsx    # Recipe picker with alternates
│   │   ├── ProductionSidebar.tsx # Configuration sidebar
│   │   └── SankeyDiagram.tsx     # Optional Sankey view
│   ├── power/
│   │   ├── PowerCalculator.tsx   # Main power calculator
│   │   ├── GeneratorCard.tsx     # Generator type selector
│   │   ├── FuelSelector.tsx      # Fuel type picker
│   │   └── PowerSummary.tsx      # Power stats display
│   ├── codex/
│   │   ├── ItemCard.tsx          # Item display card
│   │   ├── RecipeCard.tsx        # Recipe display card
│   │   ├── BuildingCard.tsx      # Building display card
│   │   └── SearchFilter.tsx      # Search and filter component
│   └── shared/
│       ├── Navigation.tsx        # Main navigation
│       ├── ItemIcon.tsx          # Item icon component
│       ├── RateDisplay.tsx       # Items/min display
│       └── Tabs.tsx              # Tab management
├── lib/
│   ├── data/
│   │   ├── items.ts              # Item definitions
│   │   ├── recipes.ts            # Recipe definitions
│   │   ├── alternate-recipes.ts  # Alternate recipe definitions
│   │   ├── buildings.ts          # Production building definitions
│   │   ├── generators.ts         # Power generator definitions
│   │   └── fuels.ts              # Fuel definitions
│   ├── calculator/
│   │   ├── production.ts         # Production chain calculator
│   │   ├── optimizer.ts          # Recipe optimization logic
│   │   ├── power.ts              # Power calculation logic
│   │   └── ratios.ts             # Ratio/rate calculations
│   ├── stores/
│   │   ├── factory-store.ts      # Factory planner state
│   │   ├── power-store.ts        # Power planner state
│   │   └── settings-store.ts     # App settings (alternate recipes)
│   └── utils/
│       ├── serialization.ts      # URL/save serialization
│       ├── formatting.ts         # Number/rate formatting
│       └── search.ts             # Fuzzy search utilities
├── public/
│   └── images/
│       ├── items/                # Item icons (64x64 PNG)
│       └── buildings/            # Building icons
├── types/
│   ├── item.ts                   # Item type definitions
│   ├── recipe.ts                 # Recipe type definitions
│   ├── building.ts               # Building type definitions
│   ├── factory.ts                # Factory plan types
│   └── power.ts                  # Power plan types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 📊 Data Models

### Items

```typescript
interface Item {
  id: string; // e.g., "iron-ingot"
  name: string; // e.g., "Iron Ingot"
  description: string;
  category: ItemCategory; // "ore" | "ingot" | "component" | "fluid" | etc.
  stackSize: number;
  sinkPoints: number | null; // AWESOME Sink points
  tier: number | null; // Unlock tier
  isFluid: boolean;
  iconPath: string;
}

type ItemCategory =
  | "ore"
  | "ingot"
  | "component"
  | "fluid"
  | "fuel"
  | "nuclear"
  | "project-part"
  | "equipment"
  | "special";
```

### Recipes

```typescript
interface Recipe {
  id: string; // e.g., "iron-ingot-default"
  name: string; // e.g., "Iron Ingot"
  isAlternate: boolean;
  building: BuildingId;
  craftTime: number; // seconds
  inputs: RecipeIO[];
  outputs: RecipeIO[];
  powerConsumption: number; // MW (can be variable for some buildings)
  powerConsumptionRange?: [number, number]; // For Particle Accelerator etc.
  unlockRequirements: UnlockRequirement[];
}

interface RecipeIO {
  itemId: string;
  amount: number; // per craft
  perMinute: number; // calculated rate
}

interface UnlockRequirement {
  type: "milestone" | "mam" | "alternate-recipe";
  id: string;
  name: string;
}
```

### Buildings (Production)

```typescript
interface ProductionBuilding {
  id: string; // e.g., "constructor"
  name: string; // e.g., "Constructor"
  category: "production" | "extraction" | "power" | "logistics";
  powerConsumption: number; // MW at 100%
  powerConsumptionExponent: number; // For overclock calculations
  maxClockSpeed: number; // Usually 250%
  inputSlots: number;
  outputSlots: number;
  canUseAmplifier: boolean; // Somersloop support
  iconPath: string;
}
```

### Power Generators

```typescript
interface PowerGenerator {
  id: string; // e.g., "coal-generator"
  name: string; // e.g., "Coal-Powered Generator"
  basePowerOutput: number; // MW at 100%
  powerOutputExponent: number; // For overclock calculations
  fuelTypes: FuelType[];
  waterConsumption?: number; // m³/min for water-cooled generators
  supplementalResource?: SupplementalResource;
  unlockTier: number;
}

interface FuelType {
  itemId: string;
  energyValue: number; // MJ
  burnTime: number; // seconds at 100%
  consumptionRate: number; // items or m³ per minute at 100%
  byproducts?: RecipeIO[]; // For nuclear waste
}

interface SupplementalResource {
  itemId: string; // e.g., "water"
  consumptionRate: number; // per minute
}
```

### Factory Plan

```typescript
interface FactoryPlan {
  id: string;
  name: string;
  version: string; // Game version
  createdAt: Date;
  updatedAt: Date;
  targets: ProductionTarget[];
  enabledAlternates: string[]; // Recipe IDs
  nodes: FactoryNode[];
  edges: FactoryEdge[];
  settings: FactorySettings;
}

interface ProductionTarget {
  itemId: string;
  mode: "exact" | "maximize";
  targetRate?: number; // items/min for exact mode
  maxInput?: ResourceLimit[]; // For maximize mode
}

interface ResourceLimit {
  itemId: string;
  maxRate: number; // items/min
}

interface FactoryNode {
  id: string;
  type: "building" | "input" | "output" | "splitter" | "merger";
  position: { x: number; y: number };
  data: BuildingNodeData | ResourceNodeData;
}

interface BuildingNodeData {
  buildingId: string;
  recipeId: string;
  clockSpeed: number; // 1-250%
  amplified: boolean; // Somersloop active
  machineCount: number; // Number of machines needed
}

interface FactoryEdge {
  id: string;
  source: string;
  target: string;
  itemId: string;
  rate: number; // items/min
}
```

### Power Plan

```typescript
interface PowerPlan {
  id: string;
  name: string;
  targetPower: number; // MW target
  generators: GeneratorSetup[];
  totalPower: number; // Calculated
  totalFuelConsumption: FuelConsumption[];
}

interface GeneratorSetup {
  generatorId: string;
  fuelId: string;
  count: number;
  clockSpeed: number;
}

interface FuelConsumption {
  itemId: string;
  rate: number; // items or m³ per minute
  isFluid: boolean;
}
```

---

## 🎮 Game Data Reference (Version 1.0+)

### Production Buildings

| Building             | Power (MW) | Inputs | Outputs |
| -------------------- | ---------- | ------ | ------- |
| Smelter              | 4          | 1      | 1       |
| Foundry              | 16         | 2      | 1       |
| Constructor          | 4          | 1      | 1       |
| Assembler            | 15         | 2      | 1       |
| Manufacturer         | 55         | 4      | 1       |
| Refinery             | 30         | 2      | 2       |
| Blender              | 75         | 4      | 2       |
| Packager             | 10         | 2      | 2       |
| Particle Accelerator | 250-1500   | 2      | 1-2     |
| Converter            | 100-400    | 2      | 2       |
| Quantum Encoder      | 0-2000     | 2      | 2       |

### Power Generators

| Generator              | Power (MW) | Fuel Types                                                    |
| ---------------------- | ---------- | ------------------------------------------------------------- |
| Biomass Burner         | 30         | Leaves, Wood, Biomass, Solid Biofuel, Packaged Liquid Biofuel |
| Coal-Powered Generator | 75         | Coal, Compacted Coal, Petroleum Coke                          |
| Fuel-Powered Generator | 250        | Fuel, Liquid Biofuel, Turbofuel, Rocket Fuel, Ionized Fuel    |
| Geothermal Generator   | 100-600    | (None - placed on geysers)                                    |
| Nuclear Power Plant    | 2500       | Uranium Fuel Rod, Plutonium Fuel Rod, Ficsonium Fuel Rod      |
| Alien Power Augmenter  | Boost      | Power Shards (augments existing power)                        |

### Fuel Energy Values (Key Fuels)

| Fuel               | Energy (MJ) | Generator      | Burn Time (s) |
| ------------------ | ----------- | -------------- | ------------- |
| Coal               | 300         | Coal Generator | 4             |
| Compacted Coal     | 630         | Coal Generator | 8.4           |
| Petroleum Coke     | 180         | Coal Generator | 2.4           |
| Fuel               | 750         | Fuel Generator | 3             |
| Liquid Biofuel     | 750         | Fuel Generator | 3             |
| Turbofuel          | 2000        | Fuel Generator | 8             |
| Rocket Fuel        | 3000        | Fuel Generator | 12            |
| Ionized Fuel       | 5000        | Fuel Generator | 20            |
| Uranium Fuel Rod   | 750,000     | Nuclear        | 300           |
| Plutonium Fuel Rod | 1,500,000   | Nuclear        | 600           |
| Ficsonium Fuel Rod | 1,500,000   | Nuclear        | 600           |

---

## 🔧 Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up project structure and core data

#### Tasks:

1. **Project Setup**

   - [ ] Initialize Next.js project with Bun
   - [ ] Configure TypeScript
   - [ ] Set up Tailwind CSS + shadcn/ui
   - [ ] Configure ESLint + Prettier
   - [ ] Set up project structure

2. **Game Data**

   - [ ] Create TypeScript types for all data models
   - [ ] Import/create item data (151+ items)
   - [ ] Import/create recipe data (300+ recipes including alternates)
   - [ ] Import/create building data
   - [ ] Import/create fuel/generator data
   - [ ] Add item icons (from game assets or recreated)

3. **Core Components**
   - [ ] Build Navigation component
   - [ ] Build ItemIcon component with lazy loading
   - [ ] Build SearchFilter component
   - [ ] Build RateDisplay component

### Phase 2: Codex Browser (Week 2-3)

**Goal**: Create a browsable database of game items

#### Tasks:

1. **Item Browser**

   - [ ] Item list with categories
   - [ ] Item search with fuzzy matching
   - [ ] Item detail page with recipes

2. **Recipe Browser**

   - [ ] Recipe list with filtering
   - [ ] Default vs Alternate toggle
   - [ ] Recipe detail with production info

3. **Building Browser**
   - [ ] Production buildings list
   - [ ] Building detail with recipes

### Phase 3: Factory Planner Core (Week 3-5)

**Goal**: Build the production calculator engine

#### Tasks:

1. **Calculator Engine**

   - [ ] Production rate calculator
   - [ ] Recipe chain resolver
   - [ ] Resource optimization (minimize raw resources)
   - [ ] Handle circular recipes (e.g., recycled rubber/plastic)

2. **State Management**

   - [ ] Zustand store for factory state
   - [ ] Undo/redo support
   - [ ] Local storage persistence

3. **Basic UI**
   - [ ] Production target selector
   - [ ] Recipe override panel
   - [ ] Results summary table

### Phase 4: Visual Factory Graph (Week 5-7)

**Goal**: Interactive visual factory representation

#### Tasks:

1. **React Flow Integration**

   - [ ] Custom node types (building, input, output)
   - [ ] Custom edge types with item flow
   - [ ] Auto-layout algorithm

2. **Interaction**

   - [ ] Click node to configure
   - [ ] Drag to reorganize
   - [ ] Zoom and pan

3. **Visualization**
   - [ ] Item rate labels on edges
   - [ ] Color coding by item type
   - [ ] Bottleneck highlighting

### Phase 5: Alternate Recipe Manager (Week 7-8)

**Goal**: Enable/disable alternate recipes

#### Tasks:

1. **Settings Store**

   - [ ] Global alternate recipe preferences
   - [ ] Per-factory overrides
   - [ ] Unlock status tracking

2. **UI Integration**
   - [ ] Settings page with recipe toggles
   - [ ] Recipe selector with alternates
   - [ ] Visual indicator for alternate recipes

### Phase 6: Power Planner (Week 8-10)

**Goal**: Complete power plant planning tool

#### Tasks:

1. **Power Calculator**

   - [ ] Generator selection
   - [ ] Fuel selection per generator
   - [ ] Overclock support
   - [ ] Total power output calculation

2. **Fuel Requirements**

   - [ ] Calculate fuel consumption rates
   - [ ] Show raw resource requirements
   - [ ] Display production chain for fuels

3. **Power UI**
   - [ ] Generator cards with configuration
   - [ ] Summary statistics
   - [ ] Nuclear waste tracking

### Phase 7: Advanced Features (Week 10-12)

**Goal**: Polish and advanced functionality

#### Tasks:

1. **Sharing**

   - [ ] URL-based factory sharing
   - [ ] Import/export JSON
   - [ ] Shareable screenshots

2. **Sankey Diagram**

   - [ ] D3.js Sankey view
   - [ ] Toggle between graph and Sankey

3. **Optimization**

   - [ ] Multiple optimization modes
   - [ ] Minimize power consumption
   - [ ] Minimize building count

4. **Tab Management**
   - [ ] Multiple factory tabs
   - [ ] Drag to reorder
   - [ ] Tab persistence

---

## 🧪 Testing Strategy

### Unit Tests

- Calculator functions (production rates, power)
- Data validation (recipes, items)
- Utility functions (formatting, serialization)

### Component Tests

- UI components with React Testing Library
- State management integration

### E2E Tests (Playwright)

- Full factory planning workflow
- Power calculation workflow
- Codex browsing

---

## 🚀 Deployment

### Hosting Options

1. **Vercel** (Recommended for Next.js)
2. **Cloudflare Pages**
3. **Netlify**

### CI/CD

- GitHub Actions for testing
- Automatic deployment on main branch
- Preview deployments for PRs

---

## 📚 Data Sources

### Game Data Extraction

- **Satisfactory Docs.json** - Community-maintained JSON export of game data
  - NPM: `@satisfactory-dev/docs.json.ts`
- **Wiki Data** - Reference for verification
  - https://satisfactory.wiki.gg

### Icon Assets

- Game asset extraction (for personal/non-commercial use)
- Community-created icon packs
- SVG recreations

---

## 🔗 Reference Projects

- [SatisfactoryTools](https://www.satisfactorytools.com) - Production calculator
- [Satisfactory Calculator](https://satisfactory-calculator.com) - Multi-tool suite
- [FactorioLab](https://factoriolab.github.io/satisfactory) - Advanced planner
- [FICSIT Companion](https://adepierre.github.io/ficsit-companion/) - Node-based planner

---

## ✅ MVP Checklist

### Must Have (v1.0)

- [x] Browse items and recipes
- [x] Calculate production for single item
- [x] Visual factory graph
- [x] Enable/disable alternate recipes
- [x] Basic power calculator
- [x] Local save/load

### Should Have (v1.1)

- [ ] Multiple factory tabs
- [x] URL sharing
- [ ] Maximize mode with resource limits
- [ ] Nuclear power with waste tracking
- [x] Sankey diagram view

### Nice to Have (v2.0)

- [ ] Multi-factory logistics
- [ ] Train network planning
- [ ] Compare recipes side-by-side
- [ ] Mobile-responsive design
- [ ] Dark/light theme toggle
- [ ] Localization

---

## 📝 Notes

### Game Version Support

Initially targeting **Satisfactory 1.0** (stable release). Structure data to support version switching for experimental builds.

### Performance Considerations

- Lazy load item icons
- Virtualize large lists
- Memoize expensive calculations
- Use Web Workers for heavy optimization

### Accessibility

- Keyboard navigation for graph
- Screen reader support for data tables
- High contrast mode option
