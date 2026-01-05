"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Sparkles } from "lucide-react";
import {
  recipes as recipeData,
  getBuildingById,
  getItemById,
} from "@/lib/data";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [showAlternates, setShowAlternates] = useState<boolean | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const tiers = useMemo(() => {
    const set = new Set<number>();
    for (const r of recipeData) if (typeof r.tier === "number") set.add(r.tier);
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return recipeData.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(term) ||
        recipe.id.toLowerCase().includes(term);
      const matchesAlt =
        showAlternates === null ? true : showAlternates === recipe.isAlternate;
      const matchesTier = selectedTier === null || recipe.tier === selectedTier;
      return matchesSearch && matchesAlt && matchesTier;
    });
  }, [search, showAlternates, selectedTier]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-muted-foreground">
          Browse default and alternate recipes. Click a recipe to see detailed
          inputs/outputs per minute.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes by name or ID"
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={
              showAlternates === null ? "" : showAlternates ? "alt" : "default"
            }
            onChange={(e) => {
              const val = e.target.value;
              setShowAlternates(val === "" ? null : val === "alt");
            }}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">All recipes</option>
            <option value="default">Default only</option>
            <option value="alt">Alternate only</option>
          </select>

          <select
            value={selectedTier ?? ""}
            onChange={(e) =>
              setSelectedTier(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">All tiers</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                Tier {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {recipeData.length} recipes
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((recipe) => {
          const building = getBuildingById(
            recipe.buildingId || recipe.building || ""
          );
          const primaryOutput = recipe.outputs[0];
          const primaryOutputItem = primaryOutput
            ? getItemById(primaryOutput.itemId)
            : null;
          return (
            <Link
              key={recipe.id}
              href={`/codex/recipes/${recipe.id}`}
              className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-lg font-semibold truncate">
                  {recipe.name}
                </h2>
                {recipe.isAlternate && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-1 text-xs text-purple-300">
                    <Sparkles className="h-3 w-3" /> Alt
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {building?.name || "Unknown building"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Tier {recipe.tier ?? "?"}
              </div>
              {primaryOutputItem && (
                <div className="mt-3 text-sm text-primary">
                  Outputs: {primaryOutputItem.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
