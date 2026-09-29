// lib/dal/index.ts
// Public Data Access Layer (DAL) interface per tech spec §6.1 and live NASA data plan

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
  fetchLiveBlockMetrics,
  fetchLiveTimeSeries,
  fetchLiveAlerts,
  syncNasaTelemetry,
} from "./live-source";

export * from "./types";
export * from "./schemas";
export { syncNasaTelemetry } from "./live-source";

function isLiveMode(): boolean {
  const mode = process.env.DATA_SOURCE_MODE || "hybrid";
  return mode === "live" || mode === "hybrid";
}

export async function listBlocks(districtId?: string): Promise<Block[]> {
  return fetchStaticBlocks(districtId);
}

export async function getBlock(id: string): Promise<Block | null> {
  return fetchStaticBlock(id);
}

export async function getBlockMetrics(id: string): Promise<BlockMetrics | null> {
  if (isLiveMode()) {
    try {
      const live = await fetchLiveBlockMetrics(id);
      if (live) return live;
    } catch {
      // Fallback cleanly to static
    }
  }
  return fetchStaticMetrics(id);
}

export async function getTimeSeries(id: string, days: number = 30): Promise<TimeSeriesPoint[]> {
  if (isLiveMode()) {
    try {
      const live = await fetchLiveTimeSeries(id, days);
      if (live && live.length > 0) return live;
    } catch {
      // Fallback cleanly to static
    }
  }
  return fetchStaticTimeSeries(id, days);
}

export async function listAlerts(filter?: {
  districtId?: string;
  severity?: Severity | "all";
  type?: AlertType | "all";
  period?: "24h" | "7d" | "30d";
}): Promise<Alert[]> {
  if (isLiveMode()) {
    try {
      const live = await fetchLiveAlerts(filter);
      if (live && live.length > 0) return live;
    } catch {
      // Fallback cleanly to static
    }
  }
  return fetchStaticAlerts(filter);
}

export async function getDistrictSummary(districtId: string = "kurigram"): Promise<DistrictSummary> {
  return computeStaticSummary(districtId);
}

export async function getIrrigationPlan(districtId: string = "kurigram"): Promise<IrrigationPlan> {
  return computeStaticPlan(districtId);
}
