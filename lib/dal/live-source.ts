// lib/dal/live-source.ts
// Live NASA Data Source adapter with deterministic fallback to static seed data

import {
  Block,
  BlockMetrics,
  Alert,
  TimeSeriesPoint,
  DistrictSummary,
  IrrigationPlan,
  Severity,
  AlertType,
} from "./types";
import {
  fetchBlocks as fetchStaticBlocks,
  fetchBlock as fetchStaticBlock,
  fetchBlockMetrics as fetchStaticMetrics,
  fetchTimeSeries as fetchStaticTimeSeries,
  fetchAlerts as fetchStaticAlerts,
  computeDistrictSummary as computeStaticSummary,
  computeIrrigationPlan as computeStaticPlan,
} from "./static-source";
import {
  getCachedLiveMetrics,
  getCachedLiveTimeSeries,
  getCachedLiveAlerts,
  saveLiveDataset,
  isLiveCacheStale,
  getSyncMetadata,
} from "@/lib/nasa/cache-manager";
import { fetchPowerPoint, processPowerResponse } from "@/lib/nasa/power-client";
import {
  fetchLiveFirmsAlerts,
  fetchLiveFirmsDetections,
  findNearestBlockId,
} from "@/lib/nasa/firms-client";
import { LiveSyncResult, NasaFirmsRecord } from "@/lib/nasa/types";

/**
 * Triggers a live sync against NASA POWER and FIRMS endpoints
 */
export async function syncNasaTelemetry(force: boolean = false): Promise<LiveSyncResult> {
  const blocks = await fetchStaticBlocks("kurigram");
  const staticAlerts = await fetchStaticAlerts();

  const timestamp = new Date().toISOString();
  const liveMetricsList: BlockMetrics[] = [];
  const liveTimeSeriesMap: Record<string, TimeSeriesPoint[]> = {};
  const errors: string[] = [];

  // 1. Fetch live FIRMS fire detections
  let liveFirmsAlerts: Alert[] = [];
  let liveFirmsRecords: NasaFirmsRecord[] = [];
  try {
    liveFirmsAlerts = await fetchLiveFirmsAlerts();
    liveFirmsRecords = await fetchLiveFirmsDetections();
  } catch (err) {
    errors.push("NASA FIRMS query failed; maintaining active alerts.");
  }

  // 2. Fetch NASA POWER daily agroclimatology for each block centroid
  // Use sequential or throttled parallel requests to respect NASA rate limits
  for (const block of blocks) {
    try {
      const [lon, lat] = block.centroid;
      const rawPower = await fetchPowerPoint(lon, lat, 30);
      const staticM = await fetchStaticMetrics(block.id);

      if (rawPower && staticM) {
        const processed = processPowerResponse(
          block.id,
          block.centroid,
          rawPower,
          staticM.soilMoistureRootZone.baseline,
          staticM.ndvi.baseline
        );

        // Check for any active FIRMS detections for this block
        const blockFirms = liveFirmsRecords.filter(
          (r) => findNearestBlockId(r.latitude, r.longitude) === block.id
        );
        const maxFrp = blockFirms.length > 0 ? Math.max(...blockFirms.map((r) => r.frp)) : 0;

        // Harmonize with domain model
        const updatedMetric: BlockMetrics = {
          ...staticM,
          asOf: processed.asOf,
          lst: processed.t2mCurrent,
          precip7dActual: processed.precip7dActual,
          precip7dForecast: processed.precip7dForecast,
          cwsi: processed.cwsi,
          thermalFrp: maxFrp > 0 ? maxFrp : staticM.thermalFrp ?? 0,
          sources: [
            {
              metric: "weather_and_solar",
              dataset: "NASA POWER Daily (GEOS-FP)",
              resolution: "0.5deg x 0.625deg",
              lastUpdate: processed.lastUpdate,
            },
            ...(maxFrp > 0
              ? [
                  {
                    metric: "thermal",
                    dataset: "NASA FIRMS VIIRS 375m",
                    resolution: "375m",
                    lastUpdate: processed.lastUpdate,
                  },
                ]
              : []),
            ...staticM.sources.filter((s) => s.metric !== "weather_and_solar" && s.metric !== "thermal"),
          ],
        };

        liveMetricsList.push(updatedMetric);
        liveTimeSeriesMap[block.id] = processed.timeSeries;
      } else if (staticM) {
        // Fallback to static metrics for this block
        liveMetricsList.push(staticM);
        const staticTs = await fetchStaticTimeSeries(block.id, 30);
        liveTimeSeriesMap[block.id] = staticTs;
      }
    } catch (err) {
      errors.push(`Failed telemetry sync for block ${block.id}`);
      const staticM = await fetchStaticMetrics(block.id);
      if (staticM) liveMetricsList.push(staticM);
    }
  }

  // Combine static weather alerts with any live FIRMS detections
  const combinedAlerts = [...staticAlerts, ...liveFirmsAlerts];

  // Save to live cache
  await saveLiveDataset(
    liveMetricsList,
    liveTimeSeriesMap,
    combinedAlerts,
    {
      lastSyncAt: timestamp,
      source: "NASA POWER + FIRMS Live Telemetry",
      mode: liveMetricsList.length > 0 ? "live" : "fallback",
      blocksUpdated: liveMetricsList.length,
      alertsCount: combinedAlerts.length,
    }
  );

  return {
    success: liveMetricsList.length > 0,
    timestamp,
    mode: "live",
    blocksUpdated: liveMetricsList.length,
    alertsGenerated: liveFirmsAlerts.length,
    sources: [
      {
        metric: "weather",
        dataset: "NASA POWER Daily REST",
        resolution: "0.5 deg",
        lastUpdate: timestamp,
      },
      {
        metric: "thermal",
        dataset: "NASA FIRMS VIIRS 375m",
        resolution: "375m",
        lastUpdate: timestamp,
      },
    ],
    message: `Synchronized ${liveMetricsList.length} blocks with NASA telemetry.`,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Public live DAL reader for Block Metrics
 */
export async function fetchLiveBlockMetrics(id: string): Promise<BlockMetrics | null> {
  const cached = getCachedLiveMetrics(id);
  if (cached && !Array.isArray(cached) && typeof cached === "object" && "blockId" in cached) {
    return cached as BlockMetrics;
  }

  // Fallback to static seed
  return fetchStaticMetrics(id);
}

/**
 * Public live DAL reader for Time Series
 */
export async function fetchLiveTimeSeries(
  id: string,
  days: number = 30
): Promise<TimeSeriesPoint[]> {
  const cached = getCachedLiveTimeSeries(id);
  if (cached && cached.length > 0) {
    return cached.slice(-days);
  }

  return fetchStaticTimeSeries(id, days);
}

/**
 * Public live DAL reader for Alerts
 */
export async function fetchLiveAlerts(filter?: {
  districtId?: string;
  severity?: Severity | "all";
  type?: AlertType | "all";
  period?: "24h" | "7d" | "30d";
}): Promise<Alert[]> {
  const cached = getCachedLiveAlerts();
  if (cached && cached.length > 0) {
    let result = cached;
    if (filter) {
      if (filter.severity && filter.severity !== "all") {
        result = result.filter((a) => a.severity === filter.severity);
      }
      if (filter.type && filter.type !== "all") {
        result = result.filter((a) => a.type === filter.type);
      }
    }
    return result;
  }

  return fetchStaticAlerts(filter);
}
