import { create } from "zustand";
import type { Theme } from "@/types";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem("lifeboard-theme") as Theme | null;
  return saved ?? "dark";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lifeboard-theme", theme);
};

// Apply on load
applyTheme(getInitialTheme());

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => { applyTheme(theme); set({ theme }); },
  toggle: () => { const next = get().theme === "dark" ? "light" : "dark"; applyTheme(next); set({ theme: next }); },
}));
