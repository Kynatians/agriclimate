// lib/dal/index.ts
// Public Data Access Layer (DAL) interface per tech spec §6.1

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
  fetchBlocks,
  fetchBlock,
  fetchBlockMetrics,
  fetchTimeSeries,
  fetchAlerts,
  computeDistrictSummary,
  computeIrrigationPlan,
} from "./static-source";

export * from "./types";
export * from "./schemas";

export async function listBlocks(districtId?: string): Promise<Block[]> {
  return fetchBlocks(districtId);
}

export async function getBlock(id: string): Promise<Block | null> {
  return fetchBlock(id);
}

export async function getBlockMetrics(id: string): Promise<BlockMetrics | null> {
  return fetchBlockMetrics(id);
}

export async function getTimeSeries(id: string, days: number = 30): Promise<TimeSeriesPoint[]> {
  return fetchTimeSeries(id, days);
}

export async function listAlerts(filter?: {
  districtId?: string;
  severity?: Severity | "all";
  type?: AlertType | "all";
  period?: "24h" | "7d" | "30d";
}): Promise<Alert[]> {
  return fetchAlerts(filter);
}

export async function getDistrictSummary(districtId: string = "kurigram"): Promise<DistrictSummary> {
  return computeDistrictSummary(districtId);
}

export async function getIrrigationPlan(districtId: string = "kurigram"): Promise<IrrigationPlan> {
  return computeIrrigationPlan(districtId);
}
