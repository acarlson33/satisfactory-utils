import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRecipeById,
  getRecipeRate,
  getItemById,
  getBuildingById,
  getRecipesByOutput,
  getRecipesByInput,
} from "@/lib/data";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

const formatRate = (value: number) => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(1);
};

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) return notFound();

  const building = getBuildingById(recipe.buildingId || recipe.building || "");
  const { inputs, outputs } = getRecipeRate(recipe);
  const powerLabel = building?.variablePower
    ? `${building.variablePower.min}-${building.variablePower.max} MW`
    : building?.powerConsumption
    ? `${building.powerConsumption} MW`
    : "Unknown";
  const powerExponent = building?.powerConsumptionExponent ?? 1.6;
  const maxOverclock = building?.maxOverclock ?? 250;
  const somersloopSlots = building?.somersloopSlots ?? 0;
  const craftTime = recipe.craftTime;
  const primaryOutput = recipe.outputs[0]?.itemId;
  const relatedByOutput = primaryOutput
    ? getRecipesByOutput(primaryOutput).filter((r) => r.id !== recipe.id)
    : [];
  const relatedByInput = recipe.inputs.length
    ? getRecipesByInput(recipe.inputs[0].itemId).filter(
        (r) => r.id !== recipe.id
      )
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{recipe.name}</h1>
            {recipe.isAlternate && (
              <span className="rounded-full bg-purple-500/15 px-2 py-1 text-xs text-purple-300">
                Alternate
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Crafted in {building?.name ?? "Unknown building"} · Tier{" "}
            {recipe.tier ?? "?"}
          </p>
        </div>
        <Link
          href="/codex/recipes"
          className="text-sm text-primary hover:underline"
        >
          ← Back to recipes
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Building</h2>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Used in</span>
              {building ? (
                <Link
                  href={`/codex/buildings/${building.id}`}
                  className="text-primary hover:underline"
                >
                  {building.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Unknown building</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Power</span>
              <span className="font-semibold text-foreground">
                {powerLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Power exponent</span>
              <span>{powerExponent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Max overclock</span>
              <span>{maxOverclock}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Somersloop slots</span>
              <span>{somersloopSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Craft time</span>
              <span>{craftTime}s</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Inputs per minute</h2>
          <div className="flex flex-col gap-2">
            {inputs.map((input) => {
              const item = getItemById(input.itemId);
              return (
                <div
                  key={input.itemId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {input.isFluid ? "Fluid" : "Item"}
                    </span>
                    <span>{item?.name ?? input.itemId}</span>
                  </div>
                  <span className="font-semibold">
                    {formatRate(input.amount)} / min
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Outputs per minute</h2>
          <div className="flex flex-col gap-2">
            {outputs.map((output) => {
              const item = getItemById(output.itemId);
              return (
                <div
                  key={output.itemId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {output.isFluid ? "Fluid" : "Item"}
                    </span>
                    <span>{item?.name ?? output.itemId}</span>
                  </div>
                  <span className="font-semibold">
                    {formatRate(output.amount)} / min
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Other recipes for this output</h3>
            {primaryOutput && (
              <span className="text-xs text-muted-foreground">
                {primaryOutput}
              </span>
            )}
          </div>
          {relatedByOutput.length ? (
            <div className="flex flex-col gap-2">
              {relatedByOutput.map((r) => (
                <Link
                  key={r.id}
                  href={`/codex/recipes/${r.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60"
                >
                  <span>{r.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.isAlternate ? "Alt" : "Default"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No other recipes produce this output.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              Other recipes using the first input
            </h3>
            {recipe.inputs[0] && (
              <span className="text-xs text-muted-foreground">
                {recipe.inputs[0].itemId}
              </span>
            )}
          </div>
          {relatedByInput.length ? (
            <div className="flex flex-col gap-2">
              {relatedByInput.map((r) => (
                <Link
                  key={r.id}
                  href={`/codex/recipes/${r.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60"
                >
                  <span>{r.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.isAlternate ? "Alt" : "Default"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No related recipes found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
