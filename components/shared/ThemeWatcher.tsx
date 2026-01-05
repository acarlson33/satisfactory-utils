"use client";

import { useEffect } from "react";
import {
  useSettingsStore,
  getEffectiveTheme,
  getSystemTheme,
} from "@/lib/stores/settings-store";

export function ThemeWatcher() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const applyTheme = () => {
      const effective = getEffectiveTheme(theme);
      document.documentElement.classList.toggle("dark", effective === "dark");
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    applyTheme();
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, [theme]);

  return null;
}
