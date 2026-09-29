// lib/nasa/types.ts
// Data contracts and interfaces for live NASA satellite services

import { DataSourceRef } from "@/lib/dal/types";

/**
 * NASA POWER API Daily Point Response
 * Endpoint: https://power.larc.nasa.gov/api/temporal/daily/point
 */
export interface NasaPowerPointResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, alt]
  };
  properties: {
    parameter: {
      T2M?: Record<string, number>;            // 2m air temp (°C)
      PRECTOTCORR?: Record<string, number>;    // Precipitation (mm/day)
      ALLSKY_SFC_SW_DWN?: Record<string, number>; // Solar irradiance (MJ/m²/day)
      RH2M?: Record<string, number>;           // Relative humidity (%)
      WS2M?: Record<string, number>;           // Wind speed (m/s)
      [key: string]: Record<string, number> | undefined;
    };
  };
  header: {
    title: string;
    api_version: string;
    start: string;
    end: string;
  };
  messages?: string[];
}

/**
 * NASA FIRMS VIIRS Active Fire Detection CSV Record
 * Endpoint: https://firms.modaps.eosdis.nasa.gov/api/area/csv/
 */
export interface NasaFirmsRecord {
  latitude: number;
  longitude: number;
  bright_ti4: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string; // "nominal" | "low" | "high"
  version: string;
  bright_ti5: number;
  frp: number; // Fire Radiative Power (MW)
  daynight: string; // "D" | "N"
}

/**
 * Live Synchronization Result Payload
 */
export interface LiveSyncResult {
  success: boolean;
  timestamp: string;
  mode: "live" | "cached" | "fallback";
  blocksUpdated: number;
  alertsGenerated: number;
  sources: DataSourceRef[];
  message: string;
  errors?: string[];
}
