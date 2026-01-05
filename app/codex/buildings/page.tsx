"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Search, Zap } from "lucide-react";
import { buildings, buildingCategories } from "@/lib/data";
import { ItemIcon } from "@/components/shared/ItemIcon";

export default function BuildingsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const tiers = useMemo(() => {
    const set = new Set<number>();
    for (const b of buildings) if (typeof b.tier === "number") set.add(b.tier);
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return buildings.filter((building) => {
      const matchesSearch =
        building.name.toLowerCase().includes(term) ||
        building.id.toLowerCase().includes(term);
      const matchesCategory =
        !selectedCategory || building.category === selectedCategory;
      const matchesTier =
        selectedTier === null || building.tier === selectedTier;
      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [search, selectedCategory, selectedTier]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof buildings> = {};
    filtered.forEach((b) => {
      if (!map[b.category]) map[b.category] = [];
      map[b.category].push(b);
    });
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Buildings</h1>
        <p className="text-muted-foreground">
          Browse all production, power, and logistics buildings.
        </p>
      </header>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search buildings by name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">All Categories</option>
            {buildingCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTier ?? ""}
            onChange={(e) =>
              setSelectedTier(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">All Tiers</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                Tier {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {buildings.length} buildings
      </p>

      {buildingCategories.map((cat) => {
        const section = grouped[cat.id];
        if (!section || !section.length) return null;
        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.map((building) => {
                const powerLabel = building.variablePower
                  ? `${building.variablePower.min}-${building.variablePower.max} MW`
                  : `${building.powerConsumption} MW`;
                return (
                  <Link
                    key={building.id}
                    href={`/codex/buildings/${building.id}`}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-md"
                  >
                    <ItemIcon id={building.id} name={building.name} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">
                          {building.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          Tier {building.tier}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {building.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        <span>{powerLabel}</span>
                        <span>·</span>
                        <span>Overclock to {building.maxOverclock}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
