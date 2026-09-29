// lib/indices/thresholds.ts
// Centralized weights, trigger thresholds, and agronomic bounds per tech spec §5.1, §5.2

export const CSS_WEIGHTS = {
  soilMoisture: 0.30,
  temperature: 0.25,
  rainfall: 0.20,
  solar: 0.15,
  ndvi: 0.10,
} as const;

export const ALERT_THRESHOLDS = {
  // Drought triggers
  droughtSoilMoistureAnomalyMin: -20, // < -20% sustained
  droughtSpiAdvisory: -1.0,           // SPI <= -1.0
  droughtSpiWarning: -1.5,            // SPI <= -1.5
  droughtCwsiWarning: 0.70,           // CWSI > 0.70

  // Irrigation advisory
  irrigationCwsiAdvisory: 0.60,       // CWSI > 0.60

  // Flood triggers
  floodFssWarning: 0.70,              // FSS >= 0.70
  floodPrecip48hMm: 80,               // > 80mm in 48h
  waterloggingSoilSaturationPct: 90,  // > 90% saturation
} as const;

export const FSS_WEIGHTS = {
  precipForecast: 0.40,
  soilSaturation: 0.35,
  terrainFlow: 0.25,
} as const;
