"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { items, itemCategories } from "@/lib/data";
import { ItemIcon } from "@/components/shared/ItemIcon";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const tiers = useMemo(() => {
    const set = new Set<number>();
    for (const item of items)
      if (typeof item.tier === "number") set.add(item.tier);
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      const matchesTier = selectedTier === null || item.tier === selectedTier;
      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [search, selectedCategory, selectedTier]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Items</h1>
        <p className="text-muted-foreground">
          Browse all {items.length} items in Satisfactory
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
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
            {itemCategories.map((cat) => (
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

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {items.length} items
      </p>

      {/* Item Grid */}
      {itemCategories.map((cat) => {
        const categoryItems = groupedItems[cat.id];
        if (!categoryItems || categoryItems.length === 0) return null;
        return (
          <section key={cat.id}>
            <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoryItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/codex/items/${item.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <ItemIcon id={item.id} name={item.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Tier {item.tier}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
