# Satisfactory Utils

Interactive factory planning and power management tools for Satisfactory, built with modern Next.js and React Flow visuals.

## Features

- 🏭 **Factory Planner** – Visual production chains with per-building detail and Sankey flow view
- ⚡ **Power Planner** – Fuel/generator calculators with totals and byproducts
- 📚 **Recipe Browser** – Items, recipes, buildings, and alternates
- 🎛️ **Toggles & Overrides** – Alternate recipes, clock speeds, and building overrides

## Tech Stack

- **Next.js 15** (App Router, Turbopack dev) on **React 19**
- **TypeScript** + **Zustand** for state and calculations
- **React Flow** + **d3-sankey** for graph and flow visuals
- **Tailwind CSS** and **shadcn/ui** components
- **Vitest** + **jsdom** for unit tests

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1+ (recommended for scripts) and Node.js 18+

### Install & Run

```bash
git clone https://github.com/yourusername/satisfactory-utils.git
cd satisfactory-utils

bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Scripts

- `bun dev` – Start the Next.js dev server (Turbopack)
- `bun run build` – Production build
- `bun start` – Serve production build
- `bun run lint` – ESLint
- `bun run type-check` – TypeScript type checking
- `bun run test` – Run Vitest suite once
- `bun run test:watch` – Watch mode for tests

## Project Structure

```
satisfactory-utils/
├── app/                  # Next.js routes (App Router)
├── components/           # UI components (flow nodes, Sankey view, etc.)
├── lib/
│   ├── calculator/       # Production/power math
│   ├── data/             # Items, recipes, buildings
│   └── stores/           # Zustand stores
├── tests/                # Vitest unit tests (jsdom)
├── types/                # Shared TypeScript types
└── public/               # Static assets
```

## Data Sources

- [Satisfactory Wiki](https://satisfactory.wiki.gg/)
- [@satisfactory-dev/docs.json.ts](https://www.npmjs.com/package/@satisfactory-dev/docs.json.ts)

## Contributing

Contributions are welcome! See the [Implementation Plan](./IMPLEMENTATION_PLAN.md) for the roadmap and guidelines.

## License

MIT License – see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [Coffee Stain Studios](https://www.coffeestainstudios.com/) for Satisfactory
- [SatisfactoryTools](https://www.satisfactorytools.com/) for UI inspiration
- The Satisfactory modding community for data extraction tools
