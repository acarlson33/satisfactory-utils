import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getItemById,
  getRecipesByOutput,
  getRecipesByInput,
  getRecipeRate,
  getBuildingById,
} from "@/lib/data";
import { itemCategories } from "@/lib/data";
import { ItemIcon } from "@/components/shared/ItemIcon";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

const formatRate = (value: number) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) return notFound();

  const producers = getRecipesByOutput(item.id);
  const consumers = getRecipesByInput(item.id);
  const categoryMeta = itemCategories.find((c) => c.id === item.category);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ItemIcon id={item.id} name={item.name} size={56} />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">
              {categoryMeta ? categoryMeta.name : item.category} · Tier{" "}
              {item.tier}
            </p>
            {item.stackSize && (
              <p className="text-sm text-muted-foreground">
                Stack size: {item.stackSize}
              </p>
            )}
            {item.sinkPoints !== undefined && (
              <p className="text-sm text-muted-foreground">
                Sink points: {item.sinkPoints}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/codex/items"
          className="text-sm text-primary hover:underline"
        >
          ← Back to items
        </Link>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Produced by</h2>
        {producers.length ? (
          <div className="flex flex-col gap-2">
            {producers.map((recipe) => {
              const building = getBuildingById(
                recipe.buildingId || recipe.building || ""
              );
              const { outputs } = getRecipeRate(recipe);
              const output = outputs.find((o) => o.itemId === item.id);
              return (
                <Link
                  key={recipe.id}
                  href={`/codex/recipes/${recipe.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recipe.name}</span>
                    {recipe.isAlternate && (
                      <span className="rounded-full bg-purple-500/15 px-2 py-1 text-[10px] uppercase tracking-wide text-purple-300">
                        Alt
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {building?.name ?? "Unknown building"}
                    </span>
                  </div>
                  {output && (
                    <span className="text-xs text-muted-foreground">
                      {formatRate(output.amount)} / min
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recipes produce this item.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Consumed by</h2>
        {consumers.length ? (
          <div className="flex flex-col gap-2">
            {consumers.map((recipe) => {
              const building = getBuildingById(
                recipe.buildingId || recipe.building || ""
              );
              const { inputs } = getRecipeRate(recipe);
              const input = inputs.find((i) => i.itemId === item.id);
              return (
                <Link
                  key={recipe.id}
                  href={`/codex/recipes/${recipe.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recipe.name}</span>
                    {recipe.isAlternate && (
                      <span className="rounded-full bg-purple-500/15 px-2 py-1 text-[10px] uppercase tracking-wide text-purple-300">
                        Alt
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {building?.name ?? "Unknown building"}
                    </span>
                  </div>
                  {input && (
                    <span className="text-xs text-muted-foreground">
                      {formatRate(input.amount)} / min
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recipes consume this item.
          </p>
        )}
      </section>
    </div>
  );
}
