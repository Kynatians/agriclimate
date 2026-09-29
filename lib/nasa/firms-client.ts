// lib/nasa/firms-client.ts
// Live client for NASA FIRMS (Fire Information for Resource Management System)
// Queries VIIRS 375m NRT thermal anomalies and converts detections to Alert entities.

import { NasaFirmsRecord } from "./types";
import { Alert } from "@/lib/dal/types";

const KURIGRAM_BBOX = {
  west: 89.5,
  south: 25.6,
  east: 89.9,
  north: 26.05,
};

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
      satellite: recordObj.satellite || "VIIRS-SNPP",
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
 * Fetch active VIIRS thermal anomalies for Kurigram District
 */
export async function fetchLiveFirmsAlerts(
  mapApiKey?: string,
  dayRange: number = 2
): Promise<Alert[]> {
  const apiKey = mapApiKey || process.env.FIRMS_MAP_KEY;

  if (!apiKey || apiKey === "your_firms_map_key_here") {
    // No active API key: return safe empty list without failing
    return [];
  }

  const { west, south, east, north } = KURIGRAM_BBOX;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/${dayRange}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "text/csv" },
      next: { revalidate: 3600 }, // 1-hour cache
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`NASA FIRMS query returned status: ${res.status}`);
      return [];
    }

    const csvText = await res.text();
    const records = parseFirmsCsv(csvText);

    // Transform VIIRS detections into domain Alert entities
    return records.map((rec, idx) => {
      const isHigh = rec.frp > 50;
      const isMedium = rec.frp > 15;
      const severity = isHigh ? "high" : isMedium ? "medium" : "low";

      return {
        id: `alert_firms_${rec.acq_date.replace(/-/g, "")}_${idx}`,
        blockId: "all",
        type: "fire",
        severity,
        leadTimeHours: 6,
        headline: {
          en: `Thermal Anomaly Detected (${rec.frp.toFixed(1)} MW FRP)`,
          bn: `তাপীয় অসঙ্গতি ও আগুন সনাক্ত হয়েছে (${rec.frp.toFixed(1)} মেগাওয়াট)`,
        },
        detail: {
          en: `VIIRS 375m sensor detected thermal activity at [${rec.latitude.toFixed(3)}, ${rec.longitude.toFixed(3)}]. Possible stubble burning or char-land fire event.`,
          bn: `ভিআইআইআরএস ৩৭৫মি সেন্সরে [${rec.latitude.toFixed(3)}, ${rec.longitude.toFixed(3)}] অবস্থানে তাপীয় উপস্থিতি সনাক্ত হয়েছে। খড় পোড়ানো অথবা চরাঞ্চলে আগুন লাগার সম্ভাবনা।`,
        },
        issuedAt: `${rec.acq_date}T${rec.acq_time.slice(0, 2)}:${rec.acq_time.slice(2, 4)}:00Z`,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
    });
  } catch (err) {
    console.warn("Failed to fetch live NASA FIRMS alerts:", err);
    return [];
  }
}
