import { create } from "zustand";
import type { Settings } from "@/types";

interface SettingsStore {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
