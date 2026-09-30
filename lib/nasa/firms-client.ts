// lib/nasa/firms-client.ts
// Live client for NASA FIRMS (Fire Information for Resource Management System)
// Queries VIIRS 375m NRT thermal anomalies and converts detections to Alert entities.

import { NasaFirmsRecord } from "./types";
import { Alert } from "@/lib/dal/types";

const KURIGRAM_REGIONAL_BBOX = {
  west: 89.2,
  south: 25.3,
  east: 90.6,
  north: 26.3,
};

/**
 * Maps geographic coordinates to the nearest Kurigram monitoring block ID
 */
export function findNearestBlockId(lat: number, lon: number): string {
  if (lat >= 26.05) return "blk_kurigram_10"; // Bhurungamari Border
  if (lat >= 25.95) return "blk_kurigram_09"; // Nageshwari North
  if (lat >= 25.88) return "blk_kurigram_08"; // Nageshwari South
  if (lat >= 25.80 && lon >= 89.62) return "blk_kurigram_05"; // Kurigram Sadar East
  if (lat >= 25.80 && lon < 89.62) return "blk_kurigram_06"; // Kurigram Sadar West
  if (lat >= 25.75 && lon < 89.55) return "blk_kurigram_07"; // Rajarhat Central
  if (lat >= 25.72 && lon >= 89.65) return "blk_kurigram_02"; // Chilmari North
  if (lat >= 25.68 && lon >= 89.65) return "blk_kurigram_01"; // Chilmari South
  if (lat >= 25.68 && lon >= 89.58) return "blk_kurigram_03"; // Ulipur East
  if (lat >= 25.68 && lon < 89.58) return "blk_kurigram_04"; // Ulipur West
  if (lat >= 25.55) return "blk_kurigram_11"; // Rowmari Char
  return "blk_kurigram_12"; // Char Rajibpur Riparian
}

/**
 * Parses raw FIRMS CSV format into typed objects
 */
export function parseFirmsCsv(csvText: string): NasaFirmsRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const records: NasaFirmsRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((val) => val.trim());
    if (row.length < headers.length) continue;

    const recordObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      recordObj[h] = row[idx];
    });

    records.push({
      latitude: parseFloat(recordObj.latitude || "0"),
      longitude: parseFloat(recordObj.longitude || "0"),
      bright_ti4: parseFloat(recordObj.bright_ti4 || "0"),
      scan: parseFloat(recordObj.scan || "0"),
      track: parseFloat(recordObj.track || "0"),
      acq_date: recordObj.acq_date || "",
      acq_time: recordObj.acq_time || "",
      satellite: recordObj.satellite || "VIIRS",
      confidence: recordObj.confidence || "nominal",
      version: recordObj.version || "NRT",
      bright_ti5: parseFloat(recordObj.bright_ti5 || "0"),
      frp: parseFloat(recordObj.frp || "0"),
      daynight: recordObj.daynight || "D",
    });
  }

  return records;
}

/**
 * Fetch raw VIIRS detections from NASA FIRMS across NOAA-20 and SNPP satellites
 */
export async function fetchLiveFirmsDetections(
  mapApiKey?: string,
  dayRange: number = 5
): Promise<NasaFirmsRecord[]> {
  const apiKey = mapApiKey || process.env.FIRMS_MAP_KEY;
  if (!apiKey || apiKey === "your_firms_map_key_here") {
    return [];
  }

  const { west, south, east, north } = KURIGRAM_REGIONAL_BBOX;
  const sources = ["VIIRS_NOAA20_NRT", "VIIRS_SNPP_NRT"];
  const allRecords: NasaFirmsRecord[] = [];

  for (const src of sources) {
    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/${src}/${west},${south},${east},${north}/${dayRange}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "text/csv" },
        next: { revalidate: 3600 },
      });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        const records = parseFirmsCsv(text);
        allRecords.push(...records);
      }
    } catch {
      // Continue to next source
    }
  }

  return allRecords;
}

/**
 * Fetch active VIIRS thermal anomalies for Kurigram District as Alert entities
 */
export async function fetchLiveFirmsAlerts(
  mapApiKey?: string,
  dayRange: number = 5
): Promise<Alert[]> {
  const records = await fetchLiveFirmsDetections(mapApiKey, dayRange);

  return records.map((rec, idx) => {
    const isHigh = rec.frp > 50;
    const isMedium = rec.frp > 10;
    const severity = isHigh ? "high" : isMedium ? "medium" : "low";
    const assignedBlockId = findNearestBlockId(rec.latitude, rec.longitude);

    return {
      id: `alert_firms_${rec.acq_date.replace(/-/g, "")}_${idx}`,
      blockId: assignedBlockId,
      type: "fire",
      severity,
      leadTimeHours: 6,
      headline: {
        en: `Thermal Anomaly Detected (${rec.frp.toFixed(1)} MW FRP)`,
        bn: `তাপীয় অসঙ্গতি ও আগুন সনাক্ত হয়েছে (${rec.frp.toFixed(1)} মেগাওয়াট)`,
      },
      detail: {
        en: `NASA ${rec.satellite === "N20" ? "NOAA-20" : "Suomi-NPP"} VIIRS 375m sensor detected thermal activity at [${rec.latitude.toFixed(3)}°N, ${rec.longitude.toFixed(3)}°E] with brightness temperature ${rec.bright_ti4.toFixed(1)} K. Crop residue or biomass burn alert.`,
        bn: `নাসা ভিআইআইআরএস ৩৭৫মি সেন্সরে [${rec.latitude.toFixed(3)}°উ, ${rec.longitude.toFixed(3)}°পূ] অবস্থানে ${rec.bright_ti4.toFixed(1)} কেলভিন তাপমাত্রার তাপীয় উপস্থিতি সনাক্ত হয়েছে। খড় পোড়ানোর সতর্কতা।`,
      },
      issuedAt: `${rec.acq_date}T${rec.acq_time.slice(0, 2)}:${rec.acq_time.slice(2, 4)}:00Z`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  });
}
