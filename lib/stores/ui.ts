// lib/stores/ui.ts
// Zustand store with persistent state & URL sync for UI, layout, layer toggles, mode, tabs, and alerts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Alert, PumpRequest } from "@/lib/dal/types";

export type AppMode = "farmer" | "officer";
export type FarmerTab = "home" | "map" | "calendar" | "alerts";
export type OfficerTab = "map" | "control" | "data";

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
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  farmerTab: FarmerTab;
  setFarmerTab: (tab: FarmerTab) => void;
  officerTab: OfficerTab;
  setOfficerTab: (tab: OfficerTab) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
  selectedDisasterId: string | null;
  setSelectedDisasterId: (id: string | null) => void;
  dispatchedAlerts: Alert[];
  addDispatchedAlert: (alert: Alert) => void;
  removeDispatchedAlert: (id: string) => void;
  dismissedAlertIds: string[];
  dismissAlert: (id: string) => void;
  pumpRequests: PumpRequest[];
  addPumpRequest: (request: PumpRequest) => void;
  updatePumpRequest: (id: string, updates: Partial<PumpRequest>) => void;
  removePumpRequest: (id: string) => void;
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

// Runtime-safe localStorage wrapper that prevents SSR freeze in Next.js
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

// URL Hash synchronizer so browser refresh / back / forward keeps the exact page and section
export function syncLocationHash(mode: AppMode, farmerTab: FarmerTab, blockId: string | null) {
  if (typeof window === "undefined") return;
  const section = mode === "officer" ? "officer" : farmerTab;
  const blockParam = blockId ? `?block=${blockId}` : "";
  const targetHash = `#${section}${blockParam}`;
  if (window.location.hash !== targetHash) {
    try {
      window.history.replaceState(null, "", targetHash);
    } catch {
      window.location.hash = targetHash;
    }
  }
}

export function restoreStateFromUrl(): { mode?: AppMode; tab?: FarmerTab; blockId?: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;

  const [section, query] = hash.split("?");
  const params = new URLSearchParams(query || "");
  const blockId = params.get("block") || undefined;

  if (section === "officer") {
    return { mode: "officer", blockId };
  }
  if (section === "alerts" || section === "map" || section === "calendar" || section === "home") {
    return { mode: "farmer", tab: section as FarmerTab, blockId };
  }
  return null;
}

export function initStoreSync() {
  if (typeof window === "undefined") return () => {};

  const applyFromUrl = () => {
    const fromUrl = restoreStateFromUrl();
    if (fromUrl) {
      useUiStore.setState((prev) => ({
        mode: fromUrl.mode ?? prev.mode,
        farmerTab: fromUrl.tab ?? prev.farmerTab,
        selectedBlockId: fromUrl.blockId ?? prev.selectedBlockId,
      }));
    } else {
      const state = useUiStore.getState();
      syncLocationHash(state.mode, state.farmerTab, state.selectedBlockId);
    }
  };

  applyFromUrl();
  window.addEventListener("hashchange", applyFromUrl);
  return () => {
    window.removeEventListener("hashchange", applyFromUrl);
  };
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      mode: "farmer",
      setMode: (mode) =>
        set((state) => {
          syncLocationHash(mode, state.farmerTab, state.selectedBlockId);
          return { mode };
        }),
      farmerTab: "home",
      setFarmerTab: (farmerTab) =>
        set((state) => {
          syncLocationHash(state.mode, farmerTab, state.selectedBlockId);
          return { farmerTab };
        }),
      officerTab: "map",
      setOfficerTab: (officerTab) => set({ officerTab }),
      selectedBlockId: "blk_kurigram_01",
      setSelectedBlockId: (selectedBlockId) =>
        set((state) => {
          syncLocationHash(state.mode, state.farmerTab, selectedBlockId);
          return { selectedBlockId };
        }),
      hoveredBlockId: null,
      setHoveredBlockId: (hoveredBlockId) => set({ hoveredBlockId }),
      selectedDisasterId: null,
      setSelectedDisasterId: (selectedDisasterId) => set({ selectedDisasterId }),
      dispatchedAlerts: [],
      addDispatchedAlert: (alert) =>
        set((state) => ({
          dispatchedAlerts: [
            alert,
            ...state.dispatchedAlerts.filter((a) => a.id !== alert.id),
          ],
        })),
      removeDispatchedAlert: (id) =>
        set((state) => ({
          dispatchedAlerts: state.dispatchedAlerts.filter((a) => a.id !== id),
        })),
      dismissedAlertIds: [],
      dismissAlert: (id) =>
        set((state) => ({
          dismissedAlertIds: state.dismissedAlertIds.includes(id)
            ? state.dismissedAlertIds
            : [...state.dismissedAlertIds, id],
        })),
      pumpRequests: [],
      addPumpRequest: (request) =>
        set((state) => ({
          pumpRequests: [
            request,
            ...state.pumpRequests.filter((r) => r.id !== request.id),
          ],
        })),
      updatePumpRequest: (id, updates) =>
        set((state) => ({
          pumpRequests: state.pumpRequests.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      removePumpRequest: (id) =>
        set((state) => ({
          pumpRequests: state.pumpRequests.filter((r) => r.id !== id),
        })),
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
    }),
    {
      name: "agriclimate-ui-storage",
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.theme && typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
        // If the URL has a hash, let URL take priority over stored state on refresh
        const fromUrl = restoreStateFromUrl();
        if (fromUrl && state) {
          if (fromUrl.mode) state.setMode(fromUrl.mode);
          if (fromUrl.tab) state.setFarmerTab(fromUrl.tab);
          if (fromUrl.blockId) state.setSelectedBlockId(fromUrl.blockId);
        }
      },
      partialize: (state) => ({
        mode: state.mode,
        farmerTab: state.farmerTab,
        officerTab: state.officerTab,
        selectedBlockId: state.selectedBlockId,
        dispatchedAlerts: state.dispatchedAlerts,
        dismissedAlertIds: state.dismissedAlertIds,
        pumpRequests: state.pumpRequests,
        activeLayerId: state.activeLayerId,
        activeLayers: state.activeLayers,
        layerOpacities: state.layerOpacities,
        mapBasemap: state.mapBasemap,
        showDisasterZones: state.showDisasterZones,
        showAlertBeacons: state.showAlertBeacons,
        showBlockBoundaries: state.showBlockBoundaries,
        filters: state.filters,
        locale: state.locale,
        theme: state.theme,
      }),
    }
  )
);
