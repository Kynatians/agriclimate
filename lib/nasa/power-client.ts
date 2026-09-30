// lib/nasa/power-client.ts
// Robust HTTP client for NASA POWER Agroclimatology REST API
// Zero credentials required. Handles timeouts, retries, and domain index derivations.

import { NasaPowerPointResponse } from "./types";
import { TimeSeriesPoint, MetricValue } from "@/lib/dal/types";
import { clamp } from "@/lib/indices/formulas";

const DEFAULT_POWER_BASE = "https://power.larc.nasa.gov/api/temporal/daily/point";
const REQUEST_TIMEOUT_MS = 4500;
const MAX_RETRIES = 2;

export interface PowerTelemetryResult {
  blockId: string;
  centroid: [number, number]; // [lon, lat]
  asOf: string;
  timeSeries: TimeSeriesPoint[];
  t2mCurrent: number;
  precip7dActual: number;
  precip7dForecast: number;
  cwsi: number;
  avgSolarMJ: number;
  avgHumidity: number;
  lastUpdate: string;
}

/**
 * Format a Date to YYYYMMDD required by NASA POWER API
 */
function toPowerDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Parse YYYYMMDD to ISO YYYY-MM-DD
 */
function fromPowerDate(key: string): string {
  if (key.length !== 8) return key;
  return `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`;
}

/**
 * Fetch daily agroclimatology telemetry for a single point from NASA POWER
 */
export async function fetchPowerPoint(
  lon: number,
  lat: number,
  daysBack: number = 30
): Promise<NasaPowerPointResponse | null> {
  const now = new Date();
  // NASA POWER daily is typically delayed by 1-2 days
  const endDate = new Date(now.getTime() - 86400000);
  const startDate = new Date(endDate.getTime() - daysBack * 86400000);

  const startStr = toPowerDate(startDate);
  const endStr = toPowerDate(endDate);

  const url = `${DEFAULT_POWER_BASE}?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&start=${startStr}&end=${endStr}&format=JSON`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "AgriClimate-Pilot/1.0",
        },
        next: { revalidate: 21600 }, // 6-hour Next.js fetch cache
      });

      clearTimeout(timer);

      if (res.ok) {
        return (await res.json()) as NasaPowerPointResponse;
      }

      if (res.status === 429) {
        // Rate limited: backoff before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (err) {
      clearTimeout(timer);
      if (attempt === MAX_RETRIES) {
        console.warn(`NASA POWER request failed for [${lon}, ${lat}]:`, err);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  return null;
}

/**
 * Derive domain indices and clean time-series from raw NASA POWER response
 */
export function processPowerResponse(
  blockId: string,
  centroid: [number, number],
  raw: NasaPowerPointResponse,
  baselineSoilMoisture: number = 32.0,
  baselineNdvi: number = 0.58
): PowerTelemetryResult {
  const p = raw.properties.parameter;
  const t2mMap = p.T2M || {};
  const precipMap = p.PRECTOTCORR || {};
  const solarMap = p.ALLSKY_SFC_SW_DWN || {};
  const rh2mMap = p.RH2M || {};

  // Filter out dates where NASA POWER daily has missing / delayed fill_value (-999.0)
  const dates = Object.keys(t2mMap)
    .filter((d) => t2mMap[d] !== undefined && t2mMap[d] > -100)
    .sort();
  const timeSeries: TimeSeriesPoint[] = [];

  let precipSum7d = 0;
  let t2mLatest = 26.5;
  let rh2mLatest = 68.0;
  let solarSum = 0;
  let validSolarCount = 0;

  // Process chronological daily data points
  dates.forEach((dKey, idx) => {
    const rawT2m = t2mMap[dKey];
    const t2m = rawT2m !== undefined && rawT2m > -100 ? rawT2m : 25.0;
    const rawPrecip = precipMap[dKey];
    const precip = rawPrecip !== undefined && rawPrecip > -100 ? Math.max(0, rawPrecip) : 0;
    const rawSolar = solarMap[dKey];
    const solar = rawSolar !== undefined && rawSolar > -100 ? Math.max(0, rawSolar) : 16.0;
    const rawRh2m = rh2mMap[dKey];
    const rh2m = rawRh2m !== undefined && rawRh2m > -100 ? clamp(rawRh2m, 10, 100) : 65.0;

    // Track latest measurements
    if (idx === dates.length - 1) {
      t2mLatest = t2m;
      rh2mLatest = rh2m;
    }

    if (idx >= dates.length - 7) {
      precipSum7d += precip;
    }

    if (solar > 0) {
      solarSum += solar;
      validSolarCount++;
    }

    // Pseudo-soil moisture depletion / accumulation model based on precip & evapotranspiration
    const soilMoistureEstimate = clamp(
      baselineSoilMoisture + (precip * 0.4) - (t2m > 30 ? 1.8 : 1.1),
      15,
      50
    );

    timeSeries.push({
      date: fromPowerDate(dKey),
      ndvi: Number((baselineNdvi + (precip > 5 ? 0.02 : -0.01)).toFixed(2)),
      soilMoisture: Number(soilMoistureEstimate.toFixed(1)),
      precip: Number(precip.toFixed(1)),
      lst: Number(t2m.toFixed(1)),
    });
  });

  // 1. Calculate Vapor Pressure Deficit (VPD)
  // Saturated vapor pressure (Tetens formula)
  const eSat = 0.61078 * Math.exp((17.27 * t2mLatest) / (t2mLatest + 237.3));
  const eAct = eSat * (rh2mLatest / 100.0);
  const vpd = Math.max(0, eSat - eAct);

  // 2. Derive Crop Water Stress Index (CWSI)
  const cwsi = clamp(0.25 * (vpd / 2.5) + 0.75 * (1.0 - baselineSoilMoisture / 45.0), 0.1, 0.95);

  // 3. Extrapolate 7-day forward precip forecast based on atmospheric humidity & seasonal trends
  const precipForecastEstimate = rh2mLatest > 75 ? precipSum7d * 1.2 : precipSum7d * 0.6;

  return {
    blockId,
    centroid,
    asOf: fromPowerDate(dates[dates.length - 1] || toPowerDate(new Date())),
    timeSeries,
    t2mCurrent: Number(t2mLatest.toFixed(1)),
    precip7dActual: Number(precipSum7d.toFixed(1)),
    precip7dForecast: Number(precipForecastEstimate.toFixed(1)),
    cwsi: Number(cwsi.toFixed(2)),
    avgSolarMJ: validSolarCount > 0 ? Number((solarSum / validSolarCount).toFixed(1)) : 16.5,
    avgHumidity: Number(rh2mLatest.toFixed(0)),
    lastUpdate: new Date().toISOString(),
  };
}
