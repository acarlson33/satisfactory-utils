import Link from "next/link";
import { Factory, Zap, BookOpen, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Factory Planner",
    description:
      "Calculate optimal production chains with visual factory layouts. Choose your target items and see exactly what buildings and resources you need.",
    icon: Factory,
    href: "/factory",
    color: "text-satisfactory-orange",
    bgColor: "bg-satisfactory-orange/10",
  },
  {
    title: "Power Planner",
    description:
      "Plan your power infrastructure with any fuel type. Calculate generator counts, fuel consumption, and handle nuclear waste management.",
    icon: Zap,
    href: "/power",
    color: "text-satisfactory-blue",
    bgColor: "bg-satisfactory-blue/10",
  },
  {
    title: "Codex",
    description:
      "Browse all items, recipes, and buildings in the game. Search, filter, and explore production possibilities including alternate recipes.",
    icon: BookOpen,
    href: "/codex",
    color: "text-satisfactory-green",
    bgColor: "bg-satisfactory-green/10",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-primary">Satisfactory</span> Utils
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Plan your factories, calculate production chains, and optimize your
          power infrastructure. Built for Satisfactory 1.0 and beyond.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex rounded-lg p-3 ${feature.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h2 className="mb-2 text-xl font-semibold">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary">
                Get started
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Quick Stats */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          Game Data Coverage
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">151+</div>
            <div className="text-sm text-muted-foreground">Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">300+</div>
            <div className="text-sm text-muted-foreground">Recipes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">113</div>
            <div className="text-sm text-muted-foreground">
              Alternate Recipes
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">6</div>
            <div className="text-sm text-muted-foreground">
              Power Generators
            </div>
          </div>
        </div>
      </section>

      {/* Version Info */}
      <section className="text-center text-sm text-muted-foreground">
        <p>
          Data sourced from{" "}
          <a
            href="https://satisfactory.wiki.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Satisfactory Wiki
          </a>
          . Updated for game version 1.0.
        </p>
      </section>
    </div>
  );
}
