"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useFactoryStore } from "@/lib/stores";
import {
  items,
  buildings,
  getAlternateRecipes,
  getResourceLimit,
  getRecipesByInput,
  getDefaultRecipes,
} from "@/lib/data";
import type { Item } from "@/types";

const FactoryFlow = dynamic(() => import("@/components/flow/FactoryFlow"), {
  ssr: false,
  loading: () => <FlowLoadingState />,
});

const SankeyView = dynamic(() => import("@/components/flow/SankeyView"), {
  ssr: false,
  loading: () => <FlowLoadingState />,
});

function FlowLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-900 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-satisfactory-orange mx-auto mb-4" />
        <p className="text-gray-400">Loading factory graph...</p>
      </div>
    </div>
  );
}

const encodePlan = (snapshot: unknown) =>
  btoa(JSON.stringify(snapshot))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const decodePlan = (value: string) => {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return atob(base64);
};

function FactoryPageImpl() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRecipePanel, setShowRecipePanel] = useState(false);
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "sankey">("graph");
  const [showAlternateSearch, setShowAlternateSearch] = useState(false);
  const [alternateSearch, setAlternateSearch] = useState("");
  const [showBaseRecipeFilter, setShowBaseRecipeFilter] = useState(false);
  const [baseRecipeSearch, setBaseRecipeSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planAppliedRef = useRef(false);

  const targetItemId = useFactoryStore((state) => state.targetItemId);
  const targetRate = useFactoryStore((state) => state.targetRate);
  const clockSpeed = useFactoryStore((state) => state.clockSpeed);
  const enabledAlternates = useFactoryStore((state) => state.enabledAlternates);
  const disabledBaseRecipes = useFactoryStore(
    (state) => state.disabledBaseRecipes
  );
  const productionNodes = useFactoryStore((state) => state.productionNodes);
  const byproducts = useFactoryStore((state) => state.byproducts);
  const byproductHandlers = useFactoryStore((state) => state.byproductHandlers);
  const customResourceLimits = useFactoryStore(
    (state) => state.customResourceLimits
  );
  const buildingOverrides = useFactoryStore((state) => state.buildingOverrides);
  const somersloopOutputMultiplier = useFactoryStore(
    (state) => state.somersloopOutputMultiplier
  );
  const somersloopPowerMultiplier = useFactoryStore(
    (state) => state.somersloopPowerMultiplier
  );
  const isCalculating = useFactoryStore((state) => state.isCalculating);
  const lastError = useFactoryStore((state) => state.lastError);

  const setTargetItem = useFactoryStore((state) => state.setTargetItem);
  const setTargetRate = useFactoryStore((state) => state.setTargetRate);
  const setClockSpeed = useFactoryStore((state) => state.setClockSpeed);
  const toggleAlternateRecipe = useFactoryStore(
    (state) => state.toggleAlternateRecipe
  );
  const calculateProductionChain = useFactoryStore(
    (state) => state.calculateProductionChain
  );
  const exportPlan = useFactoryStore((state) => state.exportPlan);
  const importPlan = useFactoryStore((state) => state.importPlan);
  const resetFactory = useFactoryStore((state) => state.resetFactory);
  const setCustomResourceLimit = useFactoryStore(
    (state) => state.setCustomResourceLimit
  );
  const clearCustomResourceLimits = useFactoryStore(
    (state) => state.clearCustomResourceLimits
  );
  const setBuildingOverrideClock = useFactoryStore(
    (state) => state.setBuildingOverrideClock
  );
  const setBuildingOverrideSomersloop = useFactoryStore(
    (state) => state.setBuildingOverrideSomersloop
  );
  const clearBuildingOverrides = useFactoryStore(
    (state) => state.clearBuildingOverrides
  );
  const setSomersloopMultiplier = useFactoryStore(
    (state) => state.setSomersloopMultiplier
  );
  const setByproductHandler = useFactoryStore(
    (state) => state.setByproductHandler
  );
  const toggleBaseRecipe = useFactoryStore((state) => state.toggleBaseRecipe);

  const alternateRecipes = useMemo(() => {
    return getAlternateRecipes()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const baseRecipes = useMemo(() => {
    return getDefaultRecipes()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const itemNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) map.set(item.id, item.name);
    return map;
  }, []);

  const buildingMeta = useMemo(() => {
    const map = new Map<string, (typeof buildings)[number]>();
    for (const building of buildings) map.set(building.id, building);
    return map;
  }, []);

  const somersloopPresets = [1, 1.25, 1.5, 1.75, 2];

  const byproductOptions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRecipesByInput>>();
    for (const entry of byproducts) {
      map.set(entry.itemId, getRecipesByInput(entry.itemId));
    }
    return map;
  }, [byproducts]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items.slice(0, 20);
    const term = searchTerm.toLowerCase();
    return items
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 20);
  }, [searchTerm]);

  const selectedItem = useMemo(() => {
    if (!targetItemId) return null;
    return items.find((item) => item.id === targetItemId) ?? null;
  }, [targetItemId]);

  useEffect(() => {
    if (targetItemId && targetRate > 0 && productionNodes.length === 0) {
      calculateProductionChain();
    }
  }, [
    calculateProductionChain,
    productionNodes.length,
    targetItemId,
    targetRate,
  ]);

  useEffect(() => {
    if (planAppliedRef.current) return;
    const shared = searchParams.get("plan");
    if (!shared) return;

    planAppliedRef.current = true;
    try {
      const json = decodePlan(shared);
      const ok = importPlan(json);
      if (ok) {
        setStatus("Loaded shared plan");
        setErrorStatus(null);
        router.replace("/factory", { scroll: false });
      } else {
        setErrorStatus("Shared plan link is invalid or corrupted.");
        router.replace("/404", { scroll: false });
      }
    } catch (error) {
      console.error("Failed to load shared plan", error);
      setErrorStatus("Shared plan link could not be read.");
      router.replace("/404", { scroll: false });
    }
  }, [importPlan, router, searchParams]);

  const stats = useMemo(() => {
    const rawTotals = new Map<string, number>();
    const buildingTotals = new Map<
      string,
      {
        id: string;
        name: string;
        count: number;
        powerMin: number;
        powerMax: number;
        powerKnown: boolean;
        hasVariable: boolean;
        hasSomersloop: boolean;
      }
    >();
    const underclockMap = new Map<
      string,
      {
        id: string;
        name: string;
        totalMachines: number;
        underclockedMachines: number;
        underclockClockSum: number;
        baseClock: number;
      }
    >();
    const underclockDetails: {
      id: string;
      name: string;
      recipeName: string;
      underclocked: number;
      total: number;
      clock: number;
    }[] = [];

    for (const node of productionNodes) {
      if (node.isRawResource) {
        rawTotals.set(
          node.itemId,
          (rawTotals.get(node.itemId) ?? 0) + node.actualRate
        );
        continue;
      }

      if (!node.buildingId) continue;
      const meta = buildingMeta.get(node.buildingId);
      const count = Math.ceil(node.buildingCount);
      const powerExponent = meta?.powerConsumptionExponent ?? 1.6;
      const somerPower =
        node.somersloopPowerMultiplier ?? somersloopPowerMultiplier;
      const powerScale =
        Math.pow(Math.max(0.01, node.clockSpeed) / 100, powerExponent) *
        (node.somersloop ? somerPower : 1);

      const underclockEntry = underclockMap.get(node.buildingId) ?? {
        id: node.buildingId,
        name: meta?.name ?? node.buildingId,
        totalMachines: 0,
        underclockedMachines: 0,
        underclockClockSum: 0,
        baseClock: node.clockSpeed,
      };
      underclockEntry.totalMachines += count;
      if (node.underclockedMachines > 0) {
        underclockEntry.underclockedMachines += node.underclockedMachines;
        underclockEntry.underclockClockSum +=
          (node.underclockClock ?? node.clockSpeed) * node.underclockedMachines;

        underclockDetails.push({
          id: node.id,
          name: meta?.name ?? node.buildingId,
          recipeName: node.recipeName ?? node.itemName,
          underclocked: node.underclockedMachines,
          total: node.buildingCount,
          clock: node.underclockClock ?? node.clockSpeed,
        });
      }
      underclockMap.set(node.buildingId, underclockEntry);

      const existing = buildingTotals.get(node.buildingId) ?? {
        id: node.buildingId,
        name: meta?.name ?? node.buildingId,
        count: 0,
        powerMin: 0,
        powerMax: 0,
        powerKnown: Boolean(meta?.powerConsumption || meta?.variablePower),
        hasVariable: Boolean(meta?.variablePower),
        hasSomersloop: false,
      };

      existing.count += count;
      if (node.somersloop) existing.hasSomersloop = true;

      if (meta?.variablePower) {
        existing.powerMin += meta.variablePower.min * powerScale * count;
        existing.powerMax += meta.variablePower.max * powerScale * count;
      } else if (typeof meta?.powerConsumption === "number") {
        const scaled = meta.powerConsumption * powerScale;
        existing.powerMin += scaled * count;
        existing.powerMax += scaled * count;
      } else {
        const fallback = 15 * powerScale * count;
        existing.powerMin += fallback;
        existing.powerMax += fallback;
        existing.powerKnown = false;
      }

      buildingTotals.set(node.buildingId, existing);
    }

    const buildingSummary = Array.from(buildingTotals.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );

    let totalBuildings = 0;
    let totalPowerMin = 0;
    let totalPowerMax = 0;
    let estimatedPower = false;

    for (const b of buildingSummary) {
      totalBuildings += b.count;
      totalPowerMin += b.powerMin;
      totalPowerMax += b.powerMax;
      if (!b.powerKnown) estimatedPower = true;
      if (b.hasVariable) estimatedPower = true;
    }

    const rawResources = Array.from(rawTotals.entries())
      .map(([itemId, rate]) => {
        const limit = getResourceLimit(itemId);
        const customCap = customResourceLimits[itemId];
        const maxRate =
          typeof customCap === "number" && customCap > 0
            ? customCap
            : limit?.maxRate ?? null;
        return {
          itemId,
          name: itemNameMap.get(itemId) ?? itemId,
          rate,
          maxRate,
          exceeds: maxRate ? rate > maxRate : false,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const underclocked = Array.from(underclockMap.values())
      .map((entry) => {
        const avgClock =
          entry.underclockedMachines > 0
            ? entry.underclockClockSum / entry.underclockedMachines
            : entry.baseClock;
        return {
          id: entry.id,
          name: entry.name,
          underclocked: entry.underclockedMachines,
          total: entry.totalMachines,
          suggestedClock: avgClock,
          baseClock: entry.baseClock,
        };
      })
      .filter((entry) => entry.underclocked > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      totalBuildings,
      totalPowerMin,
      totalPowerMax,
      estimatedPower,
      rawResources,
      buildingSummary,
      underclocked,
      underclockDetails,
    };
  }, [productionNodes, itemNameMap, customResourceLimits, buildingMeta]);

  const handleItemSelect = (item: Item) => {
    setTargetItem(item.id);
    setSearchTerm("");
  };

  const handleCalculate = useCallback(() => {
    if (targetItemId && targetRate > 0) calculateProductionChain();
  }, [calculateProductionChain, targetItemId, targetRate]);

  const handleExport = useCallback(async () => {
    const snapshot = exportPlan();
    const json = JSON.stringify(snapshot, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      setStatus("Plan copied to clipboard");
    } catch {
      setImportText(json);
      setStatus("Copy failed: JSON ready below");
    }
  }, [exportPlan]);

  const handleShare = useCallback(async () => {
    const snapshot = exportPlan();
    const encoded = encodePlan(snapshot);
    const url = `${window.location.origin}/factory?plan=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("Share link copied to clipboard");
    } catch {
      setImportText(url);
      setStatus("Copy failed: URL ready below");
    }
  }, [exportPlan]);

  const handleImport = useCallback(() => {
    if (!importText.trim()) return;
    try {
      const ok = importPlan(importText);
      setStatus(ok ? "Plan imported" : "Invalid plan JSON");
      setErrorStatus(ok ? null : "Invalid plan JSON");
    } catch (error) {
      console.error("Failed to import plan", error);
      setStatus(null);
      setErrorStatus(
        "Plan import failed. Please check the JSON and try again."
      );
    }
  }, [importPlan, importText]);

  const handleReset = useCallback(() => {
    resetFactory();
    setImportText("");
    setStatus("Factory reset");
    setErrorStatus(null);
  }, [resetFactory]);

  return (
    <div className="flex flex-col gap-4">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Factory Planner</h1>
        <p className="text-gray-400">
          Calculate production chains and visualize your factory layout
        </p>
      </header>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px] max-w-md relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Target Item
          </label>
          <div className="relative">
            <input
              type="text"
              ref={searchInputRef}
              value={selectedItem ? selectedItem.name : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedItem) setTargetItem(null);
              }}
              onFocus={() => {
                if (selectedItem) {
                  setSearchTerm(selectedItem.name);
                  setTargetItem(null);
                }
              }}
              placeholder="Search for an item..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-satisfactory-orange focus:border-transparent text-white"
            />
            {searchTerm && !selectedItem && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No items found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Rate (per min)
          </label>
          <input
            type="number"
            value={targetRate}
            onChange={(e) =>
              setTargetRate(Math.max(0, parseFloat(e.target.value) || 0))
            }
            min="0"
            step="0.5"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-satisfactory-orange focus:border-transparent text-white"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Clock speed (%)
          </label>
          <input
            type="number"
            value={clockSpeed}
            onChange={(e) =>
              setClockSpeed(Math.max(1, parseFloat(e.target.value) || 0))
            }
            min="1"
            max="250"
            step="1"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-satisfactory-orange focus:border-transparent text-white"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleCalculate}
            disabled={!targetItemId || targetRate <= 0}
            className="px-6 py-2 bg-satisfactory-orange text-black font-semibold rounded-lg hover:bg-satisfactory-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Calculate
          </button>
        </div>

        <div className="flex items-end">
          <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${
                viewMode === "graph"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setViewMode("graph")}
              aria-pressed={viewMode === "graph"}
              aria-label="Show factory graph"
            >
              Graph
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                viewMode === "sankey"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setViewMode("sankey")}
              aria-pressed={viewMode === "sankey"}
              aria-label="Show Sankey view"
            >
              Sankey
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setShowRecipePanel((prev) => !prev)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              showRecipePanel
                ? "border-purple-500 bg-purple-500/20 text-purple-400"
                : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
            }`}
            aria-expanded={showRecipePanel}
            aria-controls="recipe-panel"
          >
            Recipes ({enabledAlternates.size} alt)
          </button>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Export
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Share link
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-2 text-xs text-gray-500 flex flex-wrap gap-4">
        <span>Keyboard: / focus item search</span>
        <span>Alt+C calculate</span>
        <span>Alt+V toggle graph/Sankey</span>
        <span>Alt+A toggle recipes</span>
        <span>Alt+E export</span>
        <span>Alt+L share link</span>
      </div>

      {lastError && (
        <div
          className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          Calculation error: {lastError}
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        {status && (
          <span
            className="text-sm text-gray-400"
            role="status"
            aria-live="polite"
          >
            {status}
          </span>
        )}
        {errorStatus && (
          <span
            className="text-sm text-red-400"
            role="alert"
            aria-live="assertive"
          >
            {errorStatus}
          </span>
        )}
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste exported plan JSON here to import"
          className="w-full min-h-[90px] max-h-40 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-100"
          aria-label="Import or edit factory plan JSON"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div
          className="relative w-full rounded-xl overflow-hidden border border-gray-700 h-[640px] flex"
          aria-busy={isCalculating}
        >
          {viewMode === "graph" ? (
            <FactoryFlow className="h-full w-full" />
          ) : (
            <SankeyView />
          )}
          {isCalculating && (
            <div className="pointer-events-none absolute inset-0 flex justify-end">
              <div className="m-3 rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 shadow-lg">
                Calculating... worker offload
              </div>
            </div>
          )}
        </div>

        {showRecipePanel && (
          <div
            id="recipe-panel"
            className="w-full lg:w-80 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col max-h-[640px]"
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">
                    Alternate Recipes
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Enable alternate recipes to use in calculations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAlternateSearch(true)}
                    className="px-3 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700/60 transition-colors text-sm"
                    aria-label="Search alternate recipes"
                  >
                    🔍 Search
                  </button>
                  <button
                    onClick={() => setShowBaseRecipeFilter(true)}
                    className="px-3 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700/60 transition-colors text-sm"
                    aria-label="Disable base recipes"
                    title="Disable base recipes"
                  >
                    🚫 Base recipes
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {alternateRecipes.map((recipe) => (
                <label
                  key={recipe.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabledAlternates.has(recipe.id)}
                    onChange={() => toggleAlternateRecipe(recipe.id)}
                    className="mt-1 rounded border-gray-600 bg-gray-700 text-satisfactory-orange focus:ring-satisfactory-orange"
                  />
                  <div>
                    <div className="text-sm text-white">{recipe.name}</div>
                    <div className="text-xs text-gray-400">
                      {recipe.outputs.map((output) => output.itemId).join(", ")}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {productionNodes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-xl">
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-gray-400 text-sm">Total Buildings</span>
              <div className="text-2xl font-bold text-white">
                {stats.totalBuildings}
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-sm">Power</span>
              <div className="text-2xl font-bold text-yellow-400 flex items-baseline gap-2">
                <span>
                  {stats.totalPowerMin === stats.totalPowerMax
                    ? `${stats.totalPowerMin.toFixed(0)} MW`
                    : `${stats.totalPowerMin.toFixed(
                        0
                      )}-${stats.totalPowerMax.toFixed(0)} MW`}
                </span>
                {stats.estimatedPower && (
                  <span className="text-xs text-gray-400">(est)</span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <span className="text-gray-400 text-sm">Raw Resources</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {stats.rawResources.map(
                  ({ itemId, name, rate, maxRate, exceeds }) => (
                    <div
                      key={itemId}
                      className={`px-3 py-2 rounded-lg text-sm border ${
                        exceeds
                          ? "border-red-500/40 bg-red-500/10 text-red-100"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{name}</span>
                        {exceeds && (
                          <span className="text-[11px] bg-red-600/70 text-white px-2 py-0.5 rounded">
                            Over cap
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {rate.toFixed(1)}/min
                        {maxRate
                          ? ` of ${maxRate.toLocaleString()}/min cap`
                          : ""}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-300">
                        <label className="text-gray-400">Custom cap:</label>
                        <input
                          type="number"
                          className="w-28 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white"
                          value={customResourceLimits[itemId] ?? ""}
                          placeholder={maxRate ? maxRate.toString() : ""}
                          onChange={(e) => {
                            const next = parseFloat(e.target.value);
                            setCustomResourceLimit(
                              itemId,
                              Number.isNaN(next) ? null : next
                            );
                          }}
                        />
                        <button
                          onClick={() => setCustomResourceLimit(itemId, null)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              {stats.rawResources.length > 0 && (
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <button
                    onClick={() => clearCustomResourceLimits()}
                    className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 text-gray-200"
                  >
                    Clear all custom caps
                  </button>
                  <span>
                    Leave blank to fall back to default map limits; set 0 or
                    empty to remove an override.
                  </span>
                </div>
              )}
            </div>
          </div>

          {byproducts.length > 0 ? (
            <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-blue-100">
                  Byproducts
                </div>
                <div className="text-xs text-blue-200/80">
                  Outputs not consumed downstream
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {byproducts.map(({ itemId, rate }) => {
                  const candidates = byproductOptions.get(itemId) || [];
                  const handler = byproductHandlers[itemId] ?? "";
                  return (
                    <div
                      key={itemId}
                      className="px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-sm text-white flex flex-col gap-1 min-w-[240px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold truncate">
                          {itemNameMap.get(itemId) ?? itemId}
                        </div>
                        <div className="text-xs text-blue-100/80 whitespace-nowrap">
                          {rate.toFixed(1)}/min
                        </div>
                      </div>
                      {candidates.length > 0 ? (
                        <label className="text-xs text-blue-100/80 flex flex-col gap-1">
                          <span>Route through:</span>
                          <select
                            value={handler}
                            onChange={(e) =>
                              setByproductHandler(
                                itemId,
                                e.target.value ? e.target.value : null
                              )
                            }
                            className="w-full bg-gray-900 border border-blue-500/30 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="">No handling</option>
                            {candidates.map((recipe) => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <div className="text-xs text-blue-200/60">
                          No recipes consume this item
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/40 px-4 py-3 text-sm text-gray-400">
              No byproducts detected for this plan.
            </div>
          )}

          {stats.underclockDetails.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-amber-100">
                  Underclocking in use
                </div>
                <div className="text-xs text-amber-200/80">
                  Rounded machine counts; set these clocks
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.underclockDetails.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{entry.name}</span>
                        <span className="text-xs text-amber-200/80">
                          {entry.recipeName}
                        </span>
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-100 border border-amber-500/30">
                          x{entry.underclocked}
                        </span>
                      </div>
                      <div className="text-xs text-amber-200/80">
                        {entry.underclocked} underclocked machine
                        {entry.underclocked === 1 ? "" : "s"}
                        {entry.total > entry.underclocked
                          ? ` of ${entry.total} total`
                          : ""}
                      </div>
                    </div>
                    <div className="text-right text-sm text-amber-100">
                      <div className="font-semibold">
                        {entry.clock.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-amber-200/80">
                Run the listed machines at these clocks to hit the requested
                rates without extra math.
              </p>
            </div>
          )}

          {stats.buildingSummary.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Buildings needed</span>
                <span className="text-xs text-gray-500">
                  Based on current recipes and rates
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.buildingSummary.map((b) => {
                  const powerText =
                    b.powerMin === b.powerMax
                      ? `${b.powerMin.toFixed(0)} MW`
                      : `${b.powerMin.toFixed(0)}-${b.powerMax.toFixed(0)} MW`;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          {b.name}
                        </span>
                        <span className="text-xs text-gray-500">{b.id}</span>
                        {b.hasSomersloop && (
                          <span className="text-[11px] text-emerald-300">
                            Somersloop boost active
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          x{b.count}
                        </div>
                        <div className="text-xs text-gray-400">
                          {powerText}
                          {!b.powerKnown && " (est)"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.buildingSummary.length > 0 && (
            <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Per-building overrides
                  </h3>
                  <p className="text-sm text-gray-400">
                    Override machine clock speed or toggle Somersloop boost for
                    each building type. Defaults to {clockSpeed}%.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <label
                      className="text-xs text-gray-400"
                      htmlFor="somersloop-preset"
                    >
                      Somersloop preset
                    </label>
                    <select
                      id="somersloop-preset"
                      value={somersloopOutputMultiplier}
                      onChange={(e) =>
                        setSomersloopMultiplier(Number(e.target.value))
                      }
                      className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
                    >
                      {somersloopPresets.map((value) => (
                        <option key={value} value={value}>{`x${value.toFixed(
                          2
                        )}`}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-gray-500">
                      Throughput & power multiplier
                    </span>
                  </div>
                  <button
                    onClick={() => clearBuildingOverrides()}
                    className="rounded border border-gray-700 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
                  >
                    Clear overrides
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {stats.buildingSummary.map((b) => {
                  const meta = buildingMeta.get(b.id);
                  const override = buildingOverrides[b.id];
                  const somersloopSupported = (meta?.somersloopSlots ?? 0) > 0;
                  const clockValue = override?.clockSpeed ?? clockSpeed;

                  return (
                    <div
                      key={b.id}
                      className="grid items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/60 p-3 md:grid-cols-[1.2fr,1.2fr,auto]"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {b.name}
                          </span>
                          {override && (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-200">
                              Override
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{b.id}</span>
                        {somersloopSupported && (
                          <span className="text-[11px] text-emerald-300">
                            {meta?.somersloopSlots} Somersloop slot
                            {meta?.somersloopSlots === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-300">
                          Clock speed
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="250"
                          value={clockValue}
                          onChange={(e) =>
                            setBuildingOverrideClock(
                              b.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-40"
                        />
                        <input
                          type="number"
                          min="1"
                          max="250"
                          value={clockValue}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setBuildingOverrideClock(b.id, null);
                              return;
                            }
                            const next = Number(raw);
                            if (Number.isNaN(next)) {
                              setBuildingOverrideClock(b.id, null);
                              return;
                            }
                            setBuildingOverrideClock(b.id, next);
                          }}
                          className="w-20 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
                        />
                        <button
                          onClick={() => setBuildingOverrideClock(b.id, null)}
                          className="text-xs text-gray-400 hover:text-gray-200"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        {somersloopSupported ? (
                          <label className="flex items-center gap-2 text-sm text-gray-200">
                            <input
                              type="checkbox"
                              checked={override?.somersloop ?? false}
                              onChange={(e) =>
                                setBuildingOverrideSomersloop(
                                  b.id,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-emerald-400 focus:ring-emerald-400"
                            />
                            Somersloop boost (x
                            {somersloopOutputMultiplier.toFixed(2)})
                          </label>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No Somersloop slots
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Somersloop boosts use a preset multiplier (currently x
                {somersloopOutputMultiplier.toFixed(2)}) for both throughput and
                power draw.
              </p>
            </div>
          )}
        </div>
      )}

      {showAlternateSearch && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search alternate recipes"
        >
          <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <span className="text-lg">🔍</span>
                <input
                  autoFocus
                  value={alternateSearch}
                  onChange={(e) => setAlternateSearch(e.target.value)}
                  placeholder="Search alternates by name or output"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full md:max-w-sm focus:outline-none focus:ring-2 focus:ring-satisfactory-orange"
                />
              </div>
              <button
                onClick={() => {
                  setShowAlternateSearch(false);
                  setAlternateSearch("");
                }}
                className="ml-auto rounded border border-gray-700 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
                aria-label="Close search"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 max-h-[calc(80vh-110px)]">
              {alternateRecipes
                .filter((recipe) => {
                  if (!alternateSearch.trim()) return true;
                  const q = alternateSearch.toLowerCase();
                  if (recipe.name.toLowerCase().includes(q)) return true;
                  return recipe.outputs.some((o) =>
                    (itemNameMap.get(o.itemId) ?? o.itemId)
                      .toLowerCase()
                      .includes(q)
                  );
                })
                .map((recipe) => (
                  <label
                    key={recipe.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/70 cursor-pointer border border-transparent hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={enabledAlternates.has(recipe.id)}
                      onChange={() => toggleAlternateRecipe(recipe.id)}
                      className="mt-1 rounded border-gray-600 bg-gray-700 text-satisfactory-orange focus:ring-satisfactory-orange"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold">
                        {recipe.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {recipe.outputs
                          .map(
                            (output) =>
                              itemNameMap.get(output.itemId) ?? output.itemId
                          )
                          .join(", ")}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Building: {recipe.buildingId || recipe.building}
                      </div>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        </div>
      )}

      {showBaseRecipeFilter && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Disable base recipes"
        >
          <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <span className="text-lg">🚫</span>
                <input
                  autoFocus
                  value={baseRecipeSearch}
                  onChange={(e) => setBaseRecipeSearch(e.target.value)}
                  placeholder="Search base recipes to disable"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full md:max-w-sm focus:outline-none focus:ring-2 focus:ring-satisfactory-orange"
                />
              </div>
              <button
                onClick={() => {
                  setShowBaseRecipeFilter(false);
                  setBaseRecipeSearch("");
                }}
                className="ml-auto rounded border border-gray-700 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
                aria-label="Close base recipe filter"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 max-h-[calc(80vh-110px)]">
              {baseRecipes
                .filter((recipe) => {
                  if (!baseRecipeSearch.trim()) return true;
                  const q = baseRecipeSearch.toLowerCase();
                  if (recipe.name.toLowerCase().includes(q)) return true;
                  return recipe.outputs.some((o) =>
                    (itemNameMap.get(o.itemId) ?? o.itemId)
                      .toLowerCase()
                      .includes(q)
                  );
                })
                .map((recipe) => (
                  <label
                    key={recipe.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/70 cursor-pointer border border-transparent hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={disabledBaseRecipes.has(recipe.id)}
                      onChange={() => toggleBaseRecipe(recipe.id)}
                      className="mt-1 rounded border-gray-600 bg-gray-700 text-satisfactory-orange focus:ring-satisfactory-orange"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold flex items-center gap-2">
                        {recipe.name}
                        {disabledBaseRecipes.has(recipe.id) && (
                          <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] text-red-200 border border-red-500/40">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {recipe.outputs
                          .map(
                            (output) =>
                              itemNameMap.get(output.itemId) ?? output.itemId
                          )
                          .join(", ")}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Building: {recipe.buildingId || recipe.building}
                      </div>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FactoryPage() {
  return (
    <Suspense fallback={<FlowLoadingState />}>
      <FactoryPageImpl />
    </Suspense>
  );
}
