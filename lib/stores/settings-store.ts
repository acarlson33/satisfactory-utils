/**
 * Settings Store
 *
 * Manages user preferences and app settings
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type GameVersion = "1.0" | "experimental";
export type OptimizationTarget =
  | "minimize-buildings"
  | "minimize-power"
  | "minimize-resources";

interface SettingsState {
  // Display settings
  theme: Theme;
  gameVersion: GameVersion;

  // Calculator settings
  defaultClockSpeed: number;
  showAlternateRecipes: boolean;
  optimizationTarget: OptimizationTarget;
  includePowerCalculations: boolean;
  showPowerShardOptions: boolean;
  showSomersloopOptions: boolean;
  preferUnderclocking: boolean;

  // Unit preferences
  usePerMinute: boolean; // vs per second
  showItemsPerMinute: boolean;
  decimalPlaces: number;

  // UI preferences
  sidebarCollapsed: boolean;
  showWelcomeMessage: boolean;
  enableAnimations: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setGameVersion: (version: GameVersion) => void;
  setDefaultClockSpeed: (speed: number) => void;
  setShowAlternateRecipes: (show: boolean) => void;
  setOptimizationTarget: (target: OptimizationTarget) => void;
  setIncludePowerCalculations: (include: boolean) => void;
  setShowPowerShardOptions: (show: boolean) => void;
  setShowSomersloopOptions: (show: boolean) => void;
  setPreferUnderclocking: (prefer: boolean) => void;
  setUsePerMinute: (usePerMinute: boolean) => void;
  setShowItemsPerMinute: (show: boolean) => void;
  setDecimalPlaces: (places: number) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowWelcomeMessage: (show: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const defaultSettings = {
  theme: "system" as Theme,
  gameVersion: "1.0" as GameVersion,
  defaultClockSpeed: 100,
  showAlternateRecipes: true,
  optimizationTarget: "minimize-buildings" as OptimizationTarget,
  includePowerCalculations: true,
  showPowerShardOptions: true,
  showSomersloopOptions: true,
  preferUnderclocking: false,
  usePerMinute: true,
  showItemsPerMinute: true,
  decimalPlaces: 2,
  sidebarCollapsed: false,
  showWelcomeMessage: true,
  enableAnimations: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Actions
      setTheme: (theme) => set({ theme }),

      setGameVersion: (gameVersion) => set({ gameVersion }),

      setDefaultClockSpeed: (defaultClockSpeed) =>
        set({
          defaultClockSpeed: Math.min(250, Math.max(1, defaultClockSpeed)),
        }),

      setShowAlternateRecipes: (showAlternateRecipes) =>
        set({ showAlternateRecipes }),

      setOptimizationTarget: (optimizationTarget) =>
        set({ optimizationTarget }),

      setIncludePowerCalculations: (includePowerCalculations) =>
        set({ includePowerCalculations }),

      setShowPowerShardOptions: (showPowerShardOptions) =>
        set({ showPowerShardOptions }),

      setShowSomersloopOptions: (showSomersloopOptions) =>
        set({ showSomersloopOptions }),

      setPreferUnderclocking: (preferUnderclocking) =>
        set({ preferUnderclocking }),

      setUsePerMinute: (usePerMinute) => set({ usePerMinute }),

      setShowItemsPerMinute: (showItemsPerMinute) =>
        set({ showItemsPerMinute }),

      setDecimalPlaces: (decimalPlaces) =>
        set({ decimalPlaces: Math.min(6, Math.max(0, decimalPlaces)) }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      setShowWelcomeMessage: (showWelcomeMessage) =>
        set({ showWelcomeMessage }),

      setEnableAnimations: (enableAnimations) => set({ enableAnimations }),

      resetSettings: () => set(defaultSettings),

      exportSettings: () => {
        const state = get();
        const exportData = {
          theme: state.theme,
          gameVersion: state.gameVersion,
          defaultClockSpeed: state.defaultClockSpeed,
          showAlternateRecipes: state.showAlternateRecipes,
          optimizationTarget: state.optimizationTarget,
          includePowerCalculations: state.includePowerCalculations,
          showPowerShardOptions: state.showPowerShardOptions,
          showSomersloopOptions: state.showSomersloopOptions,
          preferUnderclocking: state.preferUnderclocking,
          usePerMinute: state.usePerMinute,
          showItemsPerMinute: state.showItemsPerMinute,
          decimalPlaces: state.decimalPlaces,
          enableAnimations: state.enableAnimations,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: (json) => {
        try {
          const data = JSON.parse(json);
          const validSettings: Partial<SettingsState> = {};

          if (["light", "dark", "system"].includes(data.theme)) {
            validSettings.theme = data.theme;
          }
          if (["1.0", "experimental"].includes(data.gameVersion)) {
            validSettings.gameVersion = data.gameVersion;
          }
          if (
            typeof data.defaultClockSpeed === "number" &&
            data.defaultClockSpeed >= 1 &&
            data.defaultClockSpeed <= 250
          ) {
            validSettings.defaultClockSpeed = data.defaultClockSpeed;
          }
          if (typeof data.showAlternateRecipes === "boolean") {
            validSettings.showAlternateRecipes = data.showAlternateRecipes;
          }
          if (
            [
              "minimize-buildings",
              "minimize-power",
              "minimize-resources",
            ].includes(data.optimizationTarget)
          ) {
            validSettings.optimizationTarget = data.optimizationTarget;
          }
          if (typeof data.includePowerCalculations === "boolean") {
            validSettings.includePowerCalculations =
              data.includePowerCalculations;
          }
          if (typeof data.showPowerShardOptions === "boolean") {
            validSettings.showPowerShardOptions = data.showPowerShardOptions;
          }
          if (typeof data.showSomersloopOptions === "boolean") {
            validSettings.showSomersloopOptions = data.showSomersloopOptions;
          }
          if (typeof data.preferUnderclocking === "boolean") {
            validSettings.preferUnderclocking = data.preferUnderclocking;
          }
          if (typeof data.usePerMinute === "boolean") {
            validSettings.usePerMinute = data.usePerMinute;
          }
          if (typeof data.showItemsPerMinute === "boolean") {
            validSettings.showItemsPerMinute = data.showItemsPerMinute;
          }
          if (
            typeof data.decimalPlaces === "number" &&
            data.decimalPlaces >= 0 &&
            data.decimalPlaces <= 6
          ) {
            validSettings.decimalPlaces = data.decimalPlaces;
          }
          if (typeof data.enableAnimations === "boolean") {
            validSettings.enableAnimations = data.enableAnimations;
          }

          set(validSettings);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "satisfactory-settings",
    }
  )
);

// Utility hook for applying theme
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}
