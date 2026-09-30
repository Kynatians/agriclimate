// lib/map/layers.ts
// Layer metadata, palette assignments, and accessors for the 7 GIS overlays

import { LayerId } from "@/lib/stores/ui";
import { BlockMetrics } from "@/lib/dal/types";
import {
  ARMY_ROSE_PALETTE,
  SUNSET_PALETTE,
  CWSI_PALETTE,
  FLOOD_PALETTE,
  PaletteStop,
  getMetricColor,
} from "./palettes";

export interface LayerDefinition {
  id: LayerId;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  source: string;
  paletteType: "diverging" | "sequential";
  stops: PaletteStop[];
  getValue: (metrics: BlockMetrics) => number;
  formatValue: (val: number) => string;
}

export const MAP_LAYERS: Record<LayerId, LayerDefinition> = {
  ndvi: {
    id: "ndvi",
    name: "NDVI Vegetation Anomaly",
    shortName: "NDVI Anomaly",
    unit: "% delta",
    description: "MODIS 16-day vegetation greenness deviation from 10-year seasonal baseline.",
    source: "MODIS (MOD13Q1) 250m",
    paletteType: "diverging",
    stops: ARMY_ROSE_PALETTE,
    getValue: (m) => m.ndvi.anomaly,
    formatValue: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
  },
  soilMoisture: {
    id: "soilMoisture",
    name: "Root-Zone Soil Moisture",
    shortName: "Soil Moisture",
    unit: "% VWC",
    description: "SMAP L4 0-100cm volumetric soil water content.",
    source: "NASA SMAP L4 (9km)",
    paletteType: "diverging",
    stops: ARMY_ROSE_PALETTE,
    getValue: (m) => m.soilMoistureRootZone.anomaly,
    formatValue: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}% delta`,
  },
  floodRisk: {
    id: "floodRisk",
    name: "Flood Susceptibility Score",
    shortName: "Flood Risk (FSS)",
    unit: "index (0-1)",
    description: "Composite inundation vulnerability incorporating GPM 72h accumulation and DEM slope.",
    source: "GPM IMERG + SRTM DEM",
    paletteType: "sequential",
    stops: FLOOD_PALETTE,
    getValue: (m) => m.floodScore,
    formatValue: (v) => v.toFixed(2),
  },
  cropHealth: {
    id: "cropHealth",
    name: "Crop Water Stress (CWSI)",
    shortName: "Water Stress",
    unit: "index (0-1)",
    description: "Evapotranspiration deficit ratio derived from Landsat/ECOSTRESS surface temperature.",
    source: "ECOSTRESS / MODIS LST",
    paletteType: "sequential",
    stops: CWSI_PALETTE,
    getValue: (m) => m.cwsi,
    formatValue: (v) => v.toFixed(2),
  },
  precipForecast: {
    id: "precipForecast",
    name: "7-Day Rainfall Forecast",
    shortName: "7d Precip",
    unit: "mm",
    description: "NASA GEOS-FP numerical weather prediction accumulated rainfall forecast.",
    source: "NASA GEOS-FP / POWER",
    paletteType: "sequential",
    stops: SUNSET_PALETTE,
    getValue: (m) => m.precip7dForecast / 100, // normalize for palette
    formatValue: (v) => `${(v * 100).toFixed(0)} mm`,
  },
  pumpRouting: {
    id: "pumpRouting",
    name: "Solar Pump Priority Schedule",
    shortName: "Pump Priority",
    unit: "tier",
    description: "Deterministic irrigation rota allocating solar hours to high-deficit blocks.",
    source: "AgriSentinel Hydro-Scheduler",
    paletteType: "sequential",
    stops: SUNSET_PALETTE,
    getValue: (m) => (m.cwsi > 0.65 ? 0.9 : m.cwsi > 0.4 ? 0.5 : 0.2),
    formatValue: (v) => (v > 0.7 ? "Critical Rotation" : v > 0.4 ? "Scheduled" : "Optimal"),
  },
  fireEvents: {
    id: "fireEvents",
    name: "Thermal Anomalies & Stubble Burn",
    shortName: "Fire / Heat",
    unit: "FRP (MW)",
    description: "VIIRS 375m active fire detections and crop residue burning alerts.",
    source: "NASA FIRMS VIIRS (375m)",
    paletteType: "sequential",
    stops: SUNSET_PALETTE,
    getValue: (m) => Math.min(1.0, (m.thermalFrp ?? 0) / 10),
    formatValue: (v) => `${(v * 10).toFixed(1)} MW`,
  },
};

/**
 * Computes polygon fill color for a block under the active layer
 */
export function getBlockFillColor(
  metrics: BlockMetrics | undefined,
  activeLayerId: LayerId
): string {
  if (!metrics) return "#94a3b8"; // fallback neutral
  const layer = MAP_LAYERS[activeLayerId];
  if (!layer) return "#94a3b8";
  const val = layer.getValue(metrics);
  return getMetricColor(val, layer.stops);
}
