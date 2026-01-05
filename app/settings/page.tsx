"use client";

import { useEffect, useRef, useState } from "react";
import { Save, RotateCcw, Moon, Sun } from "lucide-react";
import {
  useSettingsStore,
  type Theme,
  type GameVersion,
  type OptimizationTarget,
} from "@/lib/stores/settings-store";
import { useFactoryStore, usePowerStore } from "@/lib/stores";

const PROFILE_FLAG_STORAGE_KEY = "satisfactory-profile-factory-calc";

const optimizationOptions: { value: OptimizationTarget; label: string }[] = [
  { value: "minimize-buildings", label: "Minimize Buildings" },
  { value: "minimize-power", label: "Minimize Power" },
  { value: "minimize-resources", label: "Minimize Resources" },
];

export default function SettingsPage() {
  const {
    gameVersion,
    theme,
    showAlternateRecipes,
    defaultClockSpeed,
    showPowerShardOptions,
    showSomersloopOptions,
    preferUnderclocking,
    optimizationTarget,
    setTheme,
    setGameVersion,
    setShowAlternateRecipes,
    setDefaultClockSpeed,
    setShowPowerShardOptions,
    setShowSomersloopOptions,
    setPreferUnderclocking,
    setOptimizationTarget,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const resetFactory = useFactoryStore((state) => state.resetFactory);
  const clearGenerators = usePowerStore((state) => state.clearGenerators);
  const setTargetPower = usePowerStore((state) => state.setTargetPower);

  const resolveInitialProfileFlag = () => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(PROFILE_FLAG_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("profileFactory") === "1" ||
      params.get("profileFactory") === "true"
    );
  };

  const [profileFactoryCalc, setProfileFactoryCalc] = useState<boolean>(() => {
    // lazy init for hydration
    return resolveInitialProfileFlag();
  });

  useEffect(() => {
    // Keep localStorage in sync when the toggle changes
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PROFILE_FLAG_STORAGE_KEY,
      profileFactoryCalc ? "true" : "false"
    );
  }, [profileFactoryCalc]);

  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    // Settings persist automatically; this just shows confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const handleReset = () => {
    resetSettings();
    resetFactory();
    clearGenerators();
    setTargetPower(null);
    setSaved(false);
    setStatus("Settings reset to defaults");
    setError(null);
  };

  const handleExportSettings = async () => {
    const json = exportSettings();
    try {
      await navigator.clipboard.writeText(json);
      setStatus("Settings copied to clipboard");
      setError(null);
    } catch {
      try {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "satisfactory-settings.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setStatus("Settings downloaded as JSON");
        setError(null);
      } catch (err) {
        console.error("Failed to export settings", err);
        setError("Export failed. Please try again.");
      }
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ok = importSettings(text);
      if (ok) {
        setStatus("Settings imported");
        setError(null);
      } else {
        setError("Import failed: invalid JSON");
        setStatus(null);
      }
    } catch (err) {
      console.error("Failed to import settings", err);
      setError("Import failed: could not read file");
    } finally {
      event.target.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearAllData = () => {
    resetSettings();
    resetFactory();
    clearGenerators();
    setTargetPower(null);
    setStatus("All data cleared (settings, factories, power)");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Satisfactory Utils preferences
          </p>
          {(status || error) && (
            <p
              className={`text-sm ${
                error ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {error ?? status}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      {/* Game Settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Game Settings</h2>
        <div className="flex flex-col gap-4">
          {/* Game Version */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Game Version</label>
              <p className="text-sm text-muted-foreground">
                Select which version of Satisfactory to use for recipes
              </p>
            </div>
            <select
              value={gameVersion}
              onChange={(e) => setGameVersion(e.target.value as GameVersion)}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="1.0">1.0 (Stable)</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          {/* Alternate Recipes */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Show Alternate Recipes</label>
              <p className="text-sm text-muted-foreground">
                Include alternate recipes unlocked via Hard Drives
              </p>
            </div>
            <input
              type="checkbox"
              checked={showAlternateRecipes}
              onChange={(e) => setShowAlternateRecipes(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
          </div>

          {/* Power Shard Options */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Power Shard Options</label>
              <p className="text-sm text-muted-foreground">
                Show overclocking options using Power Shards
              </p>
            </div>
            <input
              type="checkbox"
              checked={showPowerShardOptions}
              onChange={(e) => setShowPowerShardOptions(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
          </div>

          {/* Somersloop Options */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Somersloop Options</label>
              <p className="text-sm text-muted-foreground">
                Show production amplification using Somersloops
              </p>
            </div>
            <input
              type="checkbox"
              checked={showSomersloopOptions}
              onChange={(e) => setShowSomersloopOptions(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
          </div>
        </div>
      </section>

      {/* Calculator Settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Calculator Settings</h2>
        <div className="flex flex-col gap-4">
          {/* Default Clock Speed */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Default Clock Speed</label>
              <p className="text-sm text-muted-foreground">
                Default machine clock speed percentage (50-250%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={defaultClockSpeed}
                onChange={(e) => setDefaultClockSpeed(Number(e.target.value))}
                className="w-32"
              />
              <span className="w-12 text-right font-mono">
                {defaultClockSpeed}%
              </span>
            </div>
          </div>

          {/* Prefer Underclocking */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Prefer Underclocking</label>
              <p className="text-sm text-muted-foreground">
                Optimize for power efficiency by underclocking machines
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferUnderclocking}
              onChange={(e) => setPreferUnderclocking(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
          </div>

          {/* Optimization Target */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Optimization Target</label>
              <p className="text-sm text-muted-foreground">
                What to optimize factory calculations for
              </p>
            </div>
            <select
              value={optimizationTarget}
              onChange={(e) =>
                setOptimizationTarget(e.target.value as OptimizationTarget)
              }
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              {optimizationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Theme</label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>
          <div className="flex rounded-lg border border-border">
            {(["light", "dark", "system"] as Theme[]).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => setTheme(themeOption)}
                className={`flex items-center gap-2 px-4 py-2 capitalize transition-colors ${
                  theme === themeOption
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {themeOption === "light" && <Sun className="h-4 w-4" />}
                {themeOption === "dark" && <Moon className="h-4 w-4" />}
                {themeOption === "system" && "🖥️"}
                {themeOption}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Data Management</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Factory Profiling Logs</label>
              <p className="text-sm text-muted-foreground">
                Emit console timings for factory calculations (main + worker)
              </p>
            </div>
            <input
              type="checkbox"
              checked={profileFactoryCalc}
              onChange={(e) => setProfileFactoryCalc(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Export Settings</label>
              <p className="text-sm text-muted-foreground">
                Copy or download your settings as JSON
              </p>
            </div>
            <button
              onClick={handleExportSettings}
              className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
            >
              Export
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Import Settings</label>
              <p className="text-sm text-muted-foreground">
                Load settings from a JSON file
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={handleImportClick}
                className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
              >
                Import
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <label className="font-medium text-red-500">Clear All Data</label>
              <p className="text-sm text-muted-foreground">
                Delete all saved factories, power plans, and settings
              </p>
            </div>
            <button
              onClick={handleClearAllData}
              className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/10"
            >
              Clear Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
