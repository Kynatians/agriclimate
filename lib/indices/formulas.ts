// lib/indices/formulas.ts
// Reference mathematical implementations for derived satellite indices

import { FSS_WEIGHTS } from "./thresholds";

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Flood Susceptibility Score (FSS) per tech spec §5.1
 * FSS = 0.40 * precipForecastNorm + 0.35 * soilSaturationRatio + 0.25 * terrainFlowNorm
 */
export function computeFss(
  precipForecastMm: number,
  soilMoistureVwc: number,
  soilSaturationLimit: number = 50.0,
  terrainFlowNorm: number = 0.5
): number {
  const precipForecastNorm = clamp(precipForecastMm / 100.0, 0, 1);
  const soilSaturationRatio = clamp(soilMoistureVwc / soilSaturationLimit, 0, 1);
  const flowNorm = clamp(terrainFlowNorm, 0, 1);

  const score =
    FSS_WEIGHTS.precipForecast * precipForecastNorm +
    FSS_WEIGHTS.soilSaturation * soilSaturationRatio +
    FSS_WEIGHTS.terrainFlow * flowNorm;

  return Number(clamp(score, 0, 1).toFixed(2));
}

/**
 * Standardized Precipitation Index (SPI) approximation
 * Compares current precipitation total to long-term normal
 */
export function computeSpi(actualPrecipMm: number, meanPrecipMm: number, stdDevMm: number): number {
  if (stdDevMm <= 0) return 0;
  const z = (actualPrecipMm - meanPrecipMm) / stdDevMm;
  return Number(clamp(z, -3.5, 3.5).toFixed(2));
}

/**
 * Crop Water Stress Index (CWSI) approximation from LST, Soil Moisture, and VPD
 */
export function computeCwsi(lstC: number, soilMoistureVwc: number, optimalMoistureVwc: number): number {
  const moistureStress = clamp(1 - soilMoistureVwc / optimalMoistureVwc, 0, 1);
  const tempExcess = clamp((lstC - 25.0) / 15.0, 0, 1);
  const cwsi = 0.6 * moistureStress + 0.4 * tempExcess;
  return Number(clamp(cwsi, 0, 1).toFixed(2));
}

/**
 * Deficit Severity calculation for pump routing (0-100)
 */
export function computeDeficitSeverity(deficitVwc: number, optimalVwc: number): number {
  if (optimalVwc <= 0) return 0;
  const ratio = clamp(deficitVwc / optimalVwc, 0, 1);
  return Math.round(100 * ratio);
}
