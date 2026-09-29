// lib/dal/static-source.ts
// Static implementation of DAL data reader bundled at build time

import { Block, BlockMetrics, Alert, TimeSeriesPoint, DistrictSummary, IrrigationPlan } from "./types";
import { BlockSchema, BlockMetricsSchema, AlertSchema, TimeSeriesPointSchema } from "./schemas";
import rawBlocks from "@/data/generated/blocks.json";
import rawMetrics from "@/data/generated/block-metrics.json";
import rawTimeSeries from "@/data/generated/timeseries.json";
import rawAlerts from "@/data/generated/alerts.json";

// In-module cached, validated records
let validatedBlocks: Block[] | null = null;
let validatedMetrics: Map<string, BlockMetrics> | null = null;
let validatedTimeSeries: Map<string, TimeSeriesPoint[]> | null = null;
let validatedAlerts: Alert[] | null = null;

function getValidatedBlocks(): Block[] {
  if (!validatedBlocks) {
    validatedBlocks = (rawBlocks as unknown[]).map((item) => BlockSchema.parse(item) as Block);
  }
  return validatedBlocks;
}

function getValidatedMetrics(): Map<string, BlockMetrics> {
  if (!validatedMetrics) {
    const map = new Map<string, BlockMetrics>();
    for (const item of rawMetrics as unknown[]) {
      const parsed = BlockMetricsSchema.parse(item) as BlockMetrics;
      map.set(parsed.blockId, parsed);
    }
    validatedMetrics = map;
  }
  return validatedMetrics;
}

function getValidatedTimeSeries(): Map<string, TimeSeriesPoint[]> {
  if (!validatedTimeSeries) {
    const map = new Map<string, TimeSeriesPoint[]>();
    for (const [blockId, points] of Object.entries(rawTimeSeries)) {
      const parsedPoints = (points as unknown[]).map((pt) => TimeSeriesPointSchema.parse(pt) as TimeSeriesPoint);
      map.set(blockId, parsedPoints);
    }
    validatedTimeSeries = map;
  }
  return validatedTimeSeries;
}

function getValidatedAlerts(): Alert[] {
  if (!validatedAlerts) {
    validatedAlerts = (rawAlerts as unknown[]).map((item) => AlertSchema.parse(item) as Alert);
  }
  return validatedAlerts;
}

export async function fetchBlocks(districtId?: string): Promise<Block[]> {
  const blocks = getValidatedBlocks();
  if (districtId) {
    return blocks.filter((b) => b.districtId.toLowerCase() === districtId.toLowerCase());
  }
  return blocks;
}

export async function fetchBlock(id: string): Promise<Block | null> {
  const blocks = getValidatedBlocks();
  return blocks.find((b) => b.id === id) || null;
}

export async function fetchBlockMetrics(id: string): Promise<BlockMetrics | null> {
  const metricsMap = getValidatedMetrics();
  return metricsMap.get(id) || null;
}

export async function fetchTimeSeries(id: string, days: number = 30): Promise<TimeSeriesPoint[]> {
  const tsMap = getValidatedTimeSeries();
  const points = tsMap.get(id) || [];
  return points.slice(-days);
}

export async function fetchAlerts(filter?: {
  districtId?: string;
  severity?: string;
  type?: string;
  period?: "24h" | "7d" | "30d";
}): Promise<Alert[]> {
  let alerts = getValidatedAlerts();
  const blocks = getValidatedBlocks();

  if (filter?.districtId) {
    const validBlockIds = new Set(
      blocks.filter((b) => b.districtId.toLowerCase() === filter.districtId?.toLowerCase()).map((b) => b.id)
    );
    alerts = alerts.filter((a) => validBlockIds.has(a.blockId));
  }

  if (filter?.severity && filter.severity !== "all") {
    alerts = alerts.filter((a) => a.severity === filter.severity);
  }

  if (filter?.type && filter.type !== "all") {
    alerts = alerts.filter((a) => a.type === filter.type);
  }

  return alerts;
}

export async function computeDistrictSummary(districtId: string = "kurigram"): Promise<DistrictSummary> {
  const blocks = await fetchBlocks(districtId);
  const metricsMap = getValidatedMetrics();
  const alerts = await fetchAlerts({ districtId });

  let totalFarmers = 0;
  let totalPumps = 0;
  let ndviSum = 0;
  let ndviBaselineSum = 0;
  let smSum = 0;
  let smBaselineSum = 0;
  let metricCount = 0;

  const stressedList: { blockId: string; blockName: string; cwsi: number; status: string }[] = [];

  for (const block of blocks) {
    totalFarmers += block.farmerCount;
    totalPumps += block.pumpAssetCount;

    const m = metricsMap.get(block.id);
    if (m) {
      ndviSum += m.ndvi.value;
      ndviBaselineSum += m.ndvi.baseline;
      smSum += m.soilMoistureSurface.value;
      smBaselineSum += m.soilMoistureSurface.baseline;
      metricCount++;

      if (m.cwsi > 0.5) {
        stressedList.push({
          blockId: block.id,
          blockName: block.name,
          cwsi: m.cwsi,
          status: m.cwsi > 0.7 ? "Severe Water Stress" : "Moderate Water Stress",
        });
      }
    }
  }

  const avgNdvi = metricCount > 0 ? ndviSum / metricCount : 0.5;
  const avgNdviBaseline = metricCount > 0 ? ndviBaselineSum / metricCount : 0.52;
  const avgSm = metricCount > 0 ? smSum / metricCount : 32.0;
  const avgSmBaseline = metricCount > 0 ? smBaselineSum / metricCount : 34.0;

  stressedList.sort((a, b) => b.cwsi - a.cwsi);

  const activeAlertCount = {
    drought: alerts.filter((a) => a.type === "drought").length,
    flood: alerts.filter((a) => a.type === "flood").length,
    cyclone: alerts.filter((a) => a.type === "cyclone").length,
    waterlogging: alerts.filter((a) => a.type === "waterlogging").length,
    fire: alerts.filter((a) => a.type === "fire").length,
    total: alerts.length,
  };

  return {
    districtId,
    districtName: {
      en: "Kurigram District",
      bn: "কুড়িগ্রাম জেলা",
    },
    totalBlocks: blocks.length,
    totalFarmers,
    totalPumps,
    averageNdvi: {
      value: Number(avgNdvi.toFixed(2)),
      baseline: Number(avgNdviBaseline.toFixed(2)),
      anomaly: Number((avgNdvi - avgNdviBaseline).toFixed(2)),
      trend: avgNdvi >= avgNdviBaseline ? "stable" : "declining",
    },
    averageSoilMoisture: {
      value: Number(avgSm.toFixed(1)),
      baseline: Number(avgSmBaseline.toFixed(1)),
      anomaly: Number((avgSm - avgSmBaseline).toFixed(1)),
      trend: avgSm >= avgSmBaseline ? "stable" : "declining",
    },
    activeAlertCount,
    topStressedBlocks: stressedList.slice(0, 5),
    asOf: new Date().toISOString(),
  };
}

export async function computeIrrigationPlan(districtId: string = "kurigram"): Promise<IrrigationPlan> {
  const blocks = await fetchBlocks(districtId);
  const metricsMap = getValidatedMetrics();

  const deficitBlocks: {
    blockId: string;
    blockName: string;
    deficitSeverity: number;
    hours: number;
  }[] = [];

  let totalAvailablePumps = 0;

  for (const block of blocks) {
    totalAvailablePumps += block.pumpAssetCount;
    const m = metricsMap.get(block.id);
    if (m && m.soilMoistureSurface.anomaly < -2) {
      const deficit = Math.abs(m.soilMoistureSurface.anomaly);
      const severity = Math.min(100, Math.round(deficit * 8));
      deficitBlocks.push({
        blockId: block.id,
        blockName: block.name,
        deficitSeverity: severity,
        hours: Math.round(severity * 0.4),
      });
    }
  }

  deficitBlocks.sort((a, b) => b.deficitSeverity - a.deficitSeverity);

  const deployments = deficitBlocks.map((b, idx) => ({
    pumpId: `pump_solar_0${(idx % 6) + 1}`,
    targetBlockId: b.blockId,
    targetBlockName: b.blockName,
    deficitSeverity: b.deficitSeverity,
    estimatedCoverageHours: b.hours,
    suggestedSequence: idx + 1,
  }));

  return {
    districtId,
    generatedAt: new Date().toISOString(),
    totalDeficitBlocks: deficitBlocks.length,
    availablePumps: totalAvailablePumps,
    deployments,
  };
}
