// lib/nasa/cache-manager.ts
// In-memory and atomic file-based cache manager for live NASA satellite data.
// Compatible with Vercel serverless read-only root filesystems via /tmp caching.

import fs from "fs";
import path from "path";
import { BlockMetrics, TimeSeriesPoint, Alert } from "@/lib/dal/types";
import { logger } from "@/lib/logger";

const log = logger.child("CACHE");

const IS_VERCEL = Boolean(process.env.VERCEL);
const SEED_DATA_DIR = path.join(process.cwd(), "data", "live");
const WRITABLE_DATA_DIR = IS_VERCEL
  ? path.join("/tmp", "agriclimate-live")
  : SEED_DATA_DIR;

const METRICS_FILENAME = "block-metrics.json";
const TIMESERIES_FILENAME = "timeseries.json";
const ALERTS_FILENAME = "alerts.json";
const META_FILENAME = "sync-meta.json";
const DISPATCHED_FILENAME = "dispatched-alerts.json";

function resolveReadFile(filename: string): string | null {
  // Check writable /tmp directory first
  const writablePath = path.join(WRITABLE_DATA_DIR, filename);
  if (fs.existsSync(writablePath)) {
    return writablePath;
  }
  // Check read-only seed directory next
  const seedPath = path.join(SEED_DATA_DIR, filename);
  if (fs.existsSync(seedPath)) {
    return seedPath;
  }
  return null;
}

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

function ensureWritableDirExists() {
  try {
    if (!fs.existsSync(WRITABLE_DATA_DIR)) {
      fs.mkdirSync(WRITABLE_DATA_DIR, { recursive: true });
      log.info(`Created live data cache directory at ${WRITABLE_DATA_DIR}`);
    }
  } catch (err) {
    log.error("Failed to ensure cache directory exists", err, { dir: WRITABLE_DATA_DIR });
  }
}

/**
 * Returns sync metadata or null if no sync has occurred
 */
export function getSyncMetadata(): SyncMetadata | null {
  if (memoryMeta) return memoryMeta;
  try {
    const targetPath = resolveReadFile(META_FILENAME);
    if (targetPath) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      memoryMeta = JSON.parse(raw);
      log.debug("Read sync metadata", { sourcePath: targetPath, lastSyncAt: memoryMeta?.lastSyncAt });
      return memoryMeta;
    }
  } catch (err) {
    log.warn("Could not read sync metadata", { error: String(err) });
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
  const isStale = ageMs > maxAgeSeconds * 1000;
  if (isStale) {
    log.info(`Live cache is stale (age: ${(ageMs / 1000).toFixed(0)}s, max: ${maxAgeSeconds}s)`);
  }
  return isStale;
}

/**
 * Read cached block metrics from memory or file
 */
export function getCachedLiveMetrics(blockId?: string): Record<string, BlockMetrics> | BlockMetrics | null {
  if (!memoryMetrics) {
    try {
      const targetPath = resolveReadFile(METRICS_FILENAME);
      if (targetPath) {
        const raw = fs.readFileSync(targetPath, "utf-8");
        const list: BlockMetrics[] = JSON.parse(raw);
        const map: Record<string, BlockMetrics> = {};
        list.forEach((m) => {
          map[m.blockId] = m;
        });
        memoryMetrics = map;
        log.info("Loaded live metrics from disk into memory", {
          sourcePath: targetPath,
          blocksCount: list.length,
        });
      }
    } catch (err) {
      log.warn("Could not read live metrics cache", { error: String(err) });
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
      const targetPath = resolveReadFile(TIMESERIES_FILENAME);
      if (targetPath) {
        const raw = fs.readFileSync(targetPath, "utf-8");
        memoryTimeSeries = JSON.parse(raw);
        log.info("Loaded live timeseries from disk into memory", {
          sourcePath: targetPath,
          blocks: Object.keys(memoryTimeSeries || {}).length,
        });
      }
    } catch (err) {
      log.warn("Could not read live timeseries cache", { error: String(err) });
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
    const targetPath = resolveReadFile(ALERTS_FILENAME);
    if (targetPath) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      memoryAlerts = JSON.parse(raw);
    }
  } catch (err) {
    log.warn("Could not read live alerts cache", { error: String(err) });
  }

  // Also merge any dispatched alerts from dispatched-alerts.json
  try {
    const dispatchedPath = resolveReadFile(DISPATCHED_FILENAME);
    if (dispatchedPath) {
      const rawDispatched = fs.readFileSync(dispatchedPath, "utf-8");
      const dispatchedList: Alert[] = JSON.parse(rawDispatched);
      if (dispatchedList && dispatchedList.length > 0) {
        const map = new Map<string, Alert>();
        (memoryAlerts || []).forEach((a) => map.set(a.id, a));
        dispatchedList.forEach((a) => map.set(a.id, a));
        return Array.from(map.values());
      }
    }
  } catch (err) {
    log.warn("Could not read dispatched alerts file", { error: String(err) });
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
  ensureWritableDirExists();

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
    const metricsPath = path.join(WRITABLE_DATA_DIR, METRICS_FILENAME);
    const tsPath = path.join(WRITABLE_DATA_DIR, TIMESERIES_FILENAME);
    const alertsPath = path.join(WRITABLE_DATA_DIR, ALERTS_FILENAME);
    const metaPath = path.join(WRITABLE_DATA_DIR, META_FILENAME);

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), "utf-8");
    fs.writeFileSync(tsPath, JSON.stringify(timeSeriesMap, null, 2), "utf-8");
    fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2), "utf-8");
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");

    log.info("Persisted live dataset to cache directory", {
      targetDir: WRITABLE_DATA_DIR,
      blocksCount: metrics.length,
      alertsCount: alerts.length,
    });
  } catch (err) {
    log.error("Could not persist live dataset to disk", err, { targetDir: WRITABLE_DATA_DIR });
  }
}
