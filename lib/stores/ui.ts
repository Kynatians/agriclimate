// lib/stores/ui.ts
// Zustand store for UI, layout, layer toggles, and mode state per tech spec §9.2

import { create } from "zustand";

export type AppMode = "farmer" | "officer";

export type LayerId =
  | "ndvi"
  | "soilMoisture"
  | "floodRisk"
  | "cropHealth"
  | "precipForecast"
  | "pumpRouting"
  | "fireEvents";

export type SeverityFilter = "all" | "high" | "medium" | "low";
export type CropFilter = "all" | "rice" | "wheat" | "maize" | "vegetable" | "cash";
export type PeriodFilter = "24h" | "7d" | "30d";

export type MapBasemap = "osm" | "satellite" | "hybrid" | "topo";

export interface UiState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
  selectedDisasterId: string | null;
  setSelectedDisasterId: (id: string | null) => void;
  activeLayers: LayerId[];
  activeLayerId: LayerId;
  setActiveLayer: (layer: LayerId) => void;
  toggleLayer: (layer: LayerId) => void;
  layerOpacities: Record<LayerId, number>;
  setLayerOpacity: (layer: LayerId, opacity: number) => void;
  mapBasemap: MapBasemap;
  setMapBasemap: (basemap: MapBasemap) => void;
  showDisasterZones: boolean;
  toggleDisasterZones: () => void;
  showAlertBeacons: boolean;
  toggleAlertBeacons: () => void;
  showBlockBoundaries: boolean;
  toggleBlockBoundaries: () => void;
  filters: {
    severity: SeverityFilter;
    crop: CropFilter;
    period: PeriodFilter;
  };
  setFilter: <K extends keyof UiState["filters"]>(key: K, value: UiState["filters"][K]) => void;
  locale: "en" | "bn";
  setLocale: (loc: "en" | "bn") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: "farmer",
  setMode: (mode) => set({ mode }),
  selectedBlockId: "blk_kurigram_01",
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  hoveredBlockId: null,
  setHoveredBlockId: (id) => set({ hoveredBlockId: id }),
  selectedDisasterId: null,
  setSelectedDisasterId: (id) => set({ selectedDisasterId: id }),
  activeLayers: [
    "ndvi",
    "soilMoisture",
    "floodRisk",
    "cropHealth",
    "precipForecast",
    "pumpRouting",
    "fireEvents",
  ],
  activeLayerId: "ndvi",
  setActiveLayer: (layer) =>
    set((state) => ({
      activeLayerId: layer,
      activeLayers: state.activeLayers.includes(layer)
        ? state.activeLayers
        : [...state.activeLayers, layer],
    })),
  toggleLayer: (layer) =>
    set((state) => {
      const exists = state.activeLayers.includes(layer);
      if (exists) {
        const nextActiveLayers = state.activeLayers.filter((l) => l !== layer);
        const nextActiveId =
          state.activeLayerId === layer
            ? (nextActiveLayers[0] ?? layer)
            : state.activeLayerId;
        return {
          activeLayers: nextActiveLayers,
          activeLayerId: nextActiveId,
        };
      } else {
        return {
          activeLayers: [...state.activeLayers, layer],
          activeLayerId: layer,
        };
      }
    }),
  layerOpacities: {
    ndvi: 0.75,
    soilMoisture: 0.75,
    floodRisk: 0.8,
    cropHealth: 0.75,
    precipForecast: 0.7,
    pumpRouting: 0.9,
    fireEvents: 0.9,
  },
  setLayerOpacity: (layer, opacity) =>
    set((state) => ({
      layerOpacities: { ...state.layerOpacities, [layer]: opacity },
    })),
  mapBasemap: "osm",
  setMapBasemap: (mapBasemap) => set({ mapBasemap }),
  showDisasterZones: true,
  toggleDisasterZones: () =>
    set((state) => ({ showDisasterZones: !state.showDisasterZones })),
  showAlertBeacons: true,
  toggleAlertBeacons: () =>
    set((state) => ({ showAlertBeacons: !state.showAlertBeacons })),
  showBlockBoundaries: true,
  toggleBlockBoundaries: () =>
    set((state) => ({ showBlockBoundaries: !state.showBlockBoundaries })),
  filters: {
    severity: "all",
    crop: "all",
    period: "7d",
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  locale: "en",
  setLocale: (locale) => set({ locale }),
  theme: "light",
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", next);
      }
      return { theme: next };
    }),
}));

