// lib/map/palettes.ts
// Colorblind-safe map palettes per tech-spec §10.1 and product doc §7.3.2

export interface PaletteStop {
  value: number;
  color: string;
  label: string;
}

/**
 * CARTO ArmyRose (Diverging Palette)
 * Ideal for anomalies where baseline = zero/neutral.
 * Values: Purple/Deficit -> Neutral Light -> Green/Surplus
 */
export const ARMY_ROSE_PALETTE: PaletteStop[] = [
  { value: -20, color: "#7b3294", label: "Extreme Deficit" },
  { value: -10, color: "#c2a5cf", label: "Moderate Deficit" },
  { value: 0,   color: "#f7f7f7", label: "Seasonal Baseline" },
  { value: 10,  color: "#a6dba0", label: "Moderate Surplus" },
  { value: 20,  color: "#008837", label: "High Surplus" },
];

/**
 * CARTO Sunset (Sequential Palette)
 * Ideal for risk indices and cumulative values.
 * Values: Low -> Moderate -> High -> Severe
 */
export const SUNSET_PALETTE: PaletteStop[] = [
  { value: 0.1, color: "#ffffcc", label: "Minimal" },
  { value: 0.4, color: "#ffb061", label: "Moderate" },
  { value: 0.7, color: "#e65518", label: "Elevated" },
  { value: 1.0, color: "#800026", label: "Critical" },
];

/**
 * CWSI Water Stress Palette (Sequential)
 */
export const CWSI_PALETTE: PaletteStop[] = [
  { value: 0.2, color: "#a6dba0", label: "No Stress (<0.3)" },
  { value: 0.4, color: "#ffffcc", label: "Mild (0.3-0.5)" },
  { value: 0.6, color: "#ffb061", label: "Moderate (0.5-0.7)" },
  { value: 0.8, color: "#e65518", label: "Severe (>0.7)" },
];

/**
 * Flood Risk (FSS) Palette
 */
export const FLOOD_PALETTE: PaletteStop[] = [
  { value: 0.25, color: "#e0f3f8", label: "Low Inundation" },
  { value: 0.50, color: "#91bfdb", label: "Moderate Risk" },
  { value: 0.75, color: "#4575b4", label: "High Risk" },
  { value: 1.00, color: "#313695", label: "Severe Inundation" },
];

/**
 * Interpolate or step to color for a numeric value
 */
export function getMetricColor(
  value: number,
  palette: PaletteStop[]
): string {
  if (value <= palette[0].value) return palette[0].color;
  for (let i = 1; i < palette.length; i++) {
    if (value <= palette[i].value) {
      return palette[i].color;
    }
  }
  return palette[palette.length - 1].color;
}
