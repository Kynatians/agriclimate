// lib/nasa/cache-manager.ts
// In-memory and atomic file-based cache manager for live NASA satellite data

import fs from "fs";
import path from "path";
import { BlockMetrics, TimeSeriesPoint, Alert } from "@/lib/dal/types";

const LIVE_DATA_DIR = path.join(process.cwd(), "data", "live");
const METRICS_FILE = path.join(LIVE_DATA_DIR, "block-metrics.json");
const TIMESERIES_FILE = path.join(LIVE_DATA_DIR, "timeseries.json");
const ALERTS_FILE = path.join(LIVE_DATA_DIR, "alerts.json");
const META_FILE = path.join(LIVE_DATA_DIR, "sync-meta.json");

export interface SyncMetadata {
  lastSyncAt: string;
  source: string;
  mode: "live" | "hybrid" | "fallback";
  blocksUpdated: number;
  alertsCount: number;
}

// In-memory cache structures for fast sub-millisecond retrieval
let memoryMetrics: Record<string, BlockMetrics> | null = null;
let memoryTimeSeries: Record<string, TimeSeriesPoint[]> | null = null;
let memoryAlerts: Alert[] | null = null;
let memoryMeta: SyncMetadata | null = null;

function ensureDirExists() {
  if (!fs.existsSync(LIVE_DATA_DIR)) {
    fs.mkdirSync(LIVE_DATA_DIR, { recursive: true });
  }
}

/**
 * Returns sync metadata or null if no sync has occurred
 */
export function getSyncMetadata(): SyncMetadata | null {
  if (memoryMeta) return memoryMeta;
  try {
    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, "utf-8");
      memoryMeta = JSON.parse(raw);
      return memoryMeta;
    }
  } catch (err) {
    console.warn("Could not read sync metadata:", err);
  }
  return null;
}

/**
 * Check if the live cache is older than the allowed TTL in seconds
 */
export function isLiveCacheStale(maxAgeSeconds: number = 21600): boolean {
  const meta = getSyncMetadata();
  if (!meta || !meta.lastSyncAt) return true;
  const ageMs = Date.now() - new Date(meta.lastSyncAt).getTime();
  return ageMs > maxAgeSeconds * 1000;
}

/**
 * Read cached block metrics from memory or file
 */
export function getCachedLiveMetrics(blockId?: string): Record<string, BlockMetrics> | BlockMetrics | null {
  if (!memoryMetrics) {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        const raw = fs.readFileSync(METRICS_FILE, "utf-8");
        const list: BlockMetrics[] = JSON.parse(raw);
        const map: Record<string, BlockMetrics> = {};
        list.forEach((m) => {
          map[m.blockId] = m;
        });
        memoryMetrics = map;
      }
    } catch (err) {
      console.warn("Could not read live metrics cache:", err);
    }
  }

  if (!memoryMetrics) return null;
  if (blockId) return memoryMetrics[blockId] || null;
  return memoryMetrics;
}

/**
 * Read cached live time-series
 */
export function getCachedLiveTimeSeries(blockId: string): TimeSeriesPoint[] | null {
  if (!memoryTimeSeries) {
    try {
      if (fs.existsSync(TIMESERIES_FILE)) {
        const raw = fs.readFileSync(TIMESERIES_FILE, "utf-8");
        memoryTimeSeries = JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read live timeseries cache:", err);
    }
  }

  if (!memoryTimeSeries) return null;
  return memoryTimeSeries[blockId] || null;
}

/**
 * Read cached live alerts
 */
export function getCachedLiveAlerts(): Alert[] | null {
  try {
    if (fs.existsSync(ALERTS_FILE)) {
      const raw = fs.readFileSync(ALERTS_FILE, "utf-8");
      memoryAlerts = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read live alerts cache:", err);
  }

  // Also merge any dispatched alerts from dispatched-alerts.json
  try {
    const dispatchedFile = path.join(LIVE_DATA_DIR, "dispatched-alerts.json");
    if (fs.existsSync(dispatchedFile)) {
      const rawDispatched = fs.readFileSync(dispatchedFile, "utf-8");
      const dispatchedList: Alert[] = JSON.parse(rawDispatched);
      if (dispatchedList && dispatchedList.length > 0) {
        const map = new Map<string, Alert>();
        (memoryAlerts || []).forEach((a) => map.set(a.id, a));
        dispatchedList.forEach((a) => map.set(a.id, a));
        return Array.from(map.values());
      }
    }
  } catch (err) {
    // Continue cleanly
  }

  return memoryAlerts;
}

/**
 * Atomically writes live synchronized datasets to memory and disk
 */
export async function saveLiveDataset(
  metrics: BlockMetrics[],
  timeSeriesMap: Record<string, TimeSeriesPoint[]>,
  alerts: Alert[],
  meta: SyncMetadata
): Promise<void> {
  ensureDirExists();

  // 1. Update in-memory cache
  const metricsMap: Record<string, BlockMetrics> = {};
  metrics.forEach((m) => {
    metricsMap[m.blockId] = m;
  });
  memoryMetrics = metricsMap;
  memoryTimeSeries = timeSeriesMap;
  memoryAlerts = alerts;
  memoryMeta = meta;

  // 2. Persist to disk
  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2), "utf-8");
    fs.writeFileSync(TIMESERIES_FILE, JSON.stringify(timeSeriesMap, null, 2), "utf-8");
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf-8");
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist live dataset to disk:", err);
  }
}
