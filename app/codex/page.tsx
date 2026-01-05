import Link from "next/link";
import { Package, BookOpen, Building } from "lucide-react";

const categories = [
  {
    title: "Items",
    description: "Browse all 151+ items including ores, components, and fluids",
    icon: Package,
    href: "/codex/items",
    count: "151+",
  },
  {
    title: "Recipes",
    description:
      "Explore default and alternate recipes for all craftable items",
    icon: BookOpen,
    href: "/codex/recipes",
    count: "300+",
  },
  {
    title: "Buildings",
    description: "View production buildings, extractors, and power generators",
    icon: Building,
    href: "/codex/buildings",
    count: "50+",
  },
];

export default function CodexPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Codex</h1>
        <p className="text-muted-foreground">
          Browse items, recipes, and buildings from Satisfactory
        </p>
      </header>

      {/* Category Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.href}
              href={category.href}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-muted-foreground">
                  {category.count}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{category.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Item Categories Preview */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Item Categories</h2>
        <div className="flex flex-wrap gap-2">
          {itemCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Tier Progress */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Game Tiers</h2>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => (
            <div
              key={tier}
              className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-lg font-semibold"
            >
              {tier}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Items and recipes are organized by unlock tier (0-9)
        </p>
      </section>
    </div>
  );
}

const itemCategories = [
  "Ores",
  "Ingots",
  "Components",
  "Fluids",
  "Fuels",
  "Nuclear",
  "Project Parts",
  "Equipment",
  "Biomass",
  "Special",
];
