import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import {
  getBuildingById,
  buildingCategories,
  getRecipesByBuilding,
  getRecipeRate,
  getItemById,
} from "@/lib/data";
import { ItemIcon } from "@/components/shared/ItemIcon";

interface BuildingPageProps {
  params: Promise<{ id: string }>;
}

const formatRate = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

export default async function BuildingDetailPage({
  params,
}: BuildingPageProps) {
  const { id } = await params;
  const building = getBuildingById(id);
  if (!building) return notFound();

  const categoryMeta = buildingCategories.find(
    (c) => c.id === building.category
  );
  const recipes = getRecipesByBuilding(building.id);
  const hasSomersloop = (building.somersloopSlots ?? 0) > 0;

  const powerLabel = building.variablePower
    ? `${building.variablePower.min}-${building.variablePower.max} MW`
    : `${building.powerConsumption} MW`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ItemIcon id={building.id} name={building.name} size={56} />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">{building.name}</h1>
            <p className="text-muted-foreground">
              {categoryMeta ? categoryMeta.name : building.category} · Tier{" "}
              {building.tier}
            </p>
            {building.somersloopSlots !== undefined && (
              <p className="text-sm text-muted-foreground">
                Somersloop slots: {building.somersloopSlots}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/codex/buildings"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to buildings
        </Link>
      </div>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <div className="flex flex-col leading-tight">
            <span className="text-foreground">Power</span>
            <span>{powerLabel}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="text-foreground">Overclock</span>
          <span>{building.maxOverclock}% max</span>
          {building.powerConsumptionExponent && (
            <span>Power exponent {building.powerConsumptionExponent}</span>
          )}
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="text-foreground">Somersloop</span>
          <span>
            {hasSomersloop
              ? `${building.somersloopSlots} slot${
                  building.somersloopSlots === 1 ? "" : "s"
                }`
              : "Not supported"}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recipes in this building</h2>
          <span className="text-sm text-muted-foreground">
            {recipes.length} recipes
          </span>
        </div>
        {recipes.length ? (
          <div className="flex flex-col gap-2">
            {recipes.map((recipe) => {
              const rates = getRecipeRate(recipe);
              const outputs = rates.outputs
                .map((o) => {
                  const item = getItemById(o.itemId);
                  const label = item ? item.name : o.itemId;
                  return `${label} (${formatRate(o.amount)}/min)`;
                })
                .join(", ");

              return (
                <Link
                  key={recipe.id}
                  href={`/codex/recipes/${recipe.id}`}
                  className="flex flex-col gap-1 rounded border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recipe.name}</span>
                    {recipe.isAlternate && (
                      <span className="rounded-full bg-purple-500/15 px-2 py-1 text-[10px] uppercase tracking-wide text-purple-300">
                        Alt
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Tier {recipe.tier}
                    </span>
                    {recipe.craftTime && (
                      <span className="text-xs text-muted-foreground">
                        {recipe.craftTime}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {outputs}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recipes found for this building.
          </p>
        )}
      </section>
    </div>
  );
}
