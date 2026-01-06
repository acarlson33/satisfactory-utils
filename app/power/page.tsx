"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePowerStore } from "@/lib/stores";
import { generators as generatorData, fuelTypes } from "@/lib/data";
import type { GeneratorId } from "@/types";

function PowerPageInner() {
  const [selectedGenerator, setSelectedGenerator] =
    useState<GeneratorId | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<string | null>(null);
  const [reverseFuel, setReverseFuel] = useState<string>("");
  const [reverseRate, setReverseRate] = useState<string>("");
  const [reverseClock, setReverseClock] = useState<string>("100");
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const targetPowerRef = useRef<HTMLInputElement | null>(null);

  // Store state
  const generatorConfigs = usePowerStore((state) => state.generators);
  const calculation = usePowerStore((state) => state.calculation);
  const targetPower = usePowerStore((state) => state.targetPower);
  const isCalculating = usePowerStore((state) => state.isCalculating);

  // Store actions
  const setTargetPower = usePowerStore((state) => state.setTargetPower);
  const addGenerator = usePowerStore((state) => state.addGenerator);
  const removeGenerator = usePowerStore((state) => state.removeGenerator);
  const setGeneratorCount = usePowerStore((state) => state.setGeneratorCount);
  const setGeneratorClockSpeed = usePowerStore(
    (state) => state.setGeneratorClockSpeed
  );
  const setGeneratorFuel = usePowerStore((state) => state.setGeneratorFuel);
  const clearGenerators = usePowerStore((state) => state.clearGenerators);
  const autoCalculateForTarget = usePowerStore(
    (state) => state.autoCalculateForTarget
  );
  const exportPlan = usePowerStore((state) => state.exportPlan);
  const importPlan = usePowerStore((state) => state.importPlan);
  const planFromFuel = usePowerStore((state) => state.planFromFuel);

  // Get available fuels for selected generator
  const availableFuels = useMemo(() => {
    if (!selectedGenerator) return [];
    const generator = generatorData.find((g) => g.id === selectedGenerator);
    if (!generator) return [];
    return fuelTypes.filter((f) => generator.fuelTypes.includes(f.id));
  }, [selectedGenerator]);

  const handleAddGenerator = () => {
    if (!selectedGenerator || !selectedFuel) return;
    addGenerator(selectedGenerator, selectedFuel);
    setSelectedGenerator(null);
    setSelectedFuel(null);
  };

  const handleExport = async () => {
    const snapshot = exportPlan();
    const json = JSON.stringify(snapshot, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setStatus("Power plan copied to clipboard");
    } catch {
      setImportText(json);
      setStatus("Copy failed: JSON ready below");
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importPlan(importText);
    setStatus(ok ? "Power plan imported" : "Invalid power plan JSON");
  };

  const handleReset = () => {
    clearGenerators();
    setImportText("");
    setStatus("Power planner reset");
  };

  const handleReversePlan = () => {
    if (!reverseFuel || !reverseRate.trim()) return;
    const parsedRate = parseFloat(reverseRate);
    const parsedClock = parseFloat(reverseClock) || 100;
    const ok = planFromFuel(reverseFuel, parsedRate, parsedClock);
    setStatus(
      ok
        ? "Plan generated from available fuel"
        : "Could not generate plan for that fuel"
    );
  };

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!el || !(el as HTMLElement).tagName) return false;
      const tag = (el as HTMLElement).tagName.toLowerCase();
      const editable = (el as HTMLElement).getAttribute("contenteditable");
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        editable === "" ||
        editable === "true"
      );
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey) return;
      if (!event.altKey) return;

      const key = event.key.toLowerCase();
      switch (key) {
        case "t": {
          event.preventDefault();
          targetPowerRef.current?.focus();
          targetPowerRef.current?.select();
          break;
        }
        case "c": {
          event.preventDefault();
          autoCalculateForTarget();
          break;
        }
        case "r": {
          event.preventDefault();
          handleReset();
          break;
        }
        case "e": {
          event.preventDefault();
          handleExport();
          break;
        }
        case "i": {
          event.preventDefault();
          handleImport();
          break;
        }
        case "f": {
          event.preventDefault();
          handleReversePlan();
          break;
        }
        case "a": {
          event.preventDefault();
          handleAddGenerator();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [
    autoCalculateForTarget,
    handleAddGenerator,
    handleExport,
    handleImport,
    handleReset,
    handleReversePlan,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Power Planner</h1>
        <p className="text-gray-400">
          Calculate generator counts and fuel requirements for your power needs
        </p>
      </header>

      {/* Target Power Input */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Target Power (MW)
            <p className="flex flex-wrap gap-3 text-slate-600">
              <span className="font-medium text-slate-700">
                Shortcuts (Alt+):
              </span>
              <span>t focus target</span>
              <span>c auto-calc</span>
              <span>r reset</span>
              <span>e export</span>
              <span>i import</span>
              <span>f plan from fuel</span>
              <span>a add generator</span>
            </p>
          </label>
          <input
            type="number"
            ref={targetPowerRef}
            value={targetPower || ""}
            onChange={(e) => setTargetPower(parseFloat(e.target.value) || null)}
            placeholder="e.g., 1000"
            className="w-40 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-satisfactory-blue focus:border-transparent text-white"
            aria-label="Target power in megawatts"
          />
        </div>
        <button
          onClick={autoCalculateForTarget}
          disabled={!targetPower || targetPower <= 0}
          className="px-4 py-2 bg-satisfactory-blue text-white font-semibold rounded-lg hover:bg-satisfactory-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Auto-Calculate
        </button>
        <button
          onClick={clearGenerators}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Export
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

      {/* Import/export status and textarea */}
      <div className="flex flex-col gap-2">
        {status && (
          <span
            className="text-sm text-gray-400"
            role="status"
            aria-live="polite"
          >
            {status}
          </span>
        )}
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste exported power plan JSON here to import"
          className="w-full min-h-[90px] max-h-40 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-100"
          aria-label="Import or edit power plan JSON"
        />
      </div>

      {/* Add Generator Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Add Generator</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Generator Type
            </label>
            <select
              value={selectedGenerator || ""}
              onChange={(e) => {
                setSelectedGenerator((e.target.value as GeneratorId) || null);
                setSelectedFuel(null);
              }}
              className="w-48 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select generator...</option>
              {generatorData.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name} ({gen.powerOutput} MW)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fuel Type
            </label>
            <select
              value={selectedFuel || ""}
              onChange={(e) => setSelectedFuel(e.target.value || null)}
              disabled={!selectedGenerator}
              className="w-48 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white disabled:opacity-50"
            >
              <option value="">Select fuel...</option>
              {availableFuels.map((fuel) => (
                <option key={fuel.id} value={fuel.id}>
                  {fuel.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddGenerator}
            disabled={!selectedGenerator || !selectedFuel}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Reverse power planning from available fuel */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fuel
            </label>
            <select
              value={reverseFuel}
              onChange={(e) => setReverseFuel(e.target.value)}
              className="w-56 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select fuel...</option>
              {fuelTypes.map((fuel) => (
                <option key={fuel.id} value={fuel.id}>
                  {fuel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Available rate (
              {reverseFuel &&
              fuelTypes.find((f) => f.id === reverseFuel)?.isFluid
                ? "m³/min"
                : "/min"}
              )
            </label>
            <input
              type="number"
              value={reverseRate}
              onChange={(e) => setReverseRate(e.target.value)}
              placeholder="e.g., 300"
              className="w-40 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Clock speed (%)
            </label>
            <input
              type="number"
              min="1"
              max="250"
              value={reverseClock}
              onChange={(e) => setReverseClock(e.target.value)}
              className="w-28 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <button
            onClick={handleReversePlan}
            className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Plan from fuel
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Chooses a compatible generator automatically and sizes the count to
          not exceed the provided fuel rate.
        </p>
      </div>

      {/* Generator Configurations */}
      {generatorConfigs.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Generator Configuration</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {generatorConfigs.map((config) => {
              const generator = generatorData.find(
                (g) => g.id === config.generatorId
              );
              const fuel = fuelTypes.find((f) => f.id === config.fuelId);

              return (
                <div key={config.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {generator?.name || config.generatorId}
                    </div>
                    <div className="text-sm text-gray-400">
                      Fuel: {fuel?.name || config.fuelId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Count:</label>
                    <input
                      type="number"
                      value={config.count}
                      onChange={(e) =>
                        setGeneratorCount(
                          config.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-center"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Clock:</label>
                    <input
                      type="number"
                      value={config.clockSpeed}
                      onChange={(e) =>
                        setGeneratorClockSpeed(
                          config.id,
                          parseInt(e.target.value) || 100
                        )
                      }
                      min="1"
                      max="250"
                      className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-center"
                    />
                    <span className="text-gray-400">%</span>
                  </div>

                  <button
                    onClick={() => removeGenerator(config.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculation Results */}
      {calculation && (
        <div
          className="grid gap-4 md:grid-cols-2"
          aria-busy={isCalculating}
          aria-live="polite"
        >
          {/* Power Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Power Output</h2>
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {calculation.totalPower.toFixed(0)} MW
            </div>
            {targetPower && (
              <div className="text-sm text-gray-400">
                Target: {targetPower} MW (
                {((calculation.totalPower / targetPower) * 100).toFixed(0)}%
                achieved)
              </div>
            )}
            <div className="mt-4 space-y-2">
              {calculation.generatorBreakdown.map((item) => (
                <div
                  key={item.generatorId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-300">
                    {item.generatorName} ×{item.count}
                  </span>
                  <span className="text-yellow-400">
                    {item.totalPower.toFixed(0)} MW
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fuel Requirements */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Fuel Requirements</h2>
            <div className="space-y-3">
              {calculation.fuelConsumption.map((fuel) => (
                <div
                  key={fuel.fuelId}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-300">{fuel.fuelName}</span>
                  <span className="text-satisfactory-orange font-mono">
                    {fuel.rate.toFixed(2)} {fuel.isFluid ? "m³/min" : "/min"}
                  </span>
                </div>
              ))}
              {calculation.waterConsumption > 0 && (
                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                  <span className="text-blue-400">Water</span>
                  <span className="text-blue-400 font-mono">
                    {calculation.waterConsumption.toFixed(1)} m³/min
                  </span>
                </div>
              )}
              {calculation.wasteProduction.length > 0 && (
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-sm text-gray-400 mb-2">
                    Nuclear Waste:
                  </div>
                  {calculation.wasteProduction.map((waste) => (
                    <div
                      key={waste.itemId}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-purple-400">{waste.itemName}</span>
                      <span className="text-purple-400 font-mono">
                        {waste.rate.toFixed(2)}/min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isCalculating && (
            <div className="pointer-events-none md:col-span-2 flex justify-end">
              <div className="m-2 rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 shadow-lg">
                Updating power totals...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generator Reference Cards */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-4">Generator Reference</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatorData.map((gen) => (
            <div
              key={gen.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
                  ⚡
                </div>
                <div>
                  <h3 className="font-semibold text-white">{gen.name}</h3>
                  <p className="text-sm text-yellow-400">
                    {gen.powerOutput} MW
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Fuels: {gen.fuelTypes.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PowerPage() {
  return (
    <Suspense
      fallback={<div className="text-center">Loading power planner...</div>}
    >
      <PowerPageInner />
    </Suspense>
  );
}
