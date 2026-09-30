// lib/dal/schemas.ts
// Zod schemas corresponding to lib/dal/types.ts for boundary validation

import { z } from "zod";

export const LocalizedTextSchema = z.record(z.string(), z.string());

export const AlertTypeSchema = z.enum(["drought", "flood", "cyclone", "waterlogging", "fire"]);
export const SeveritySchema = z.enum(["low", "medium", "high"]);

export const DataSourceRefSchema = z.object({
  metric: z.string(),
  dataset: z.string(),
  resolution: z.string(),
  lastUpdate: z.string(),
});

export const MetricValueSchema = z.object({
  value: z.number(),
  baseline: z.number(),
  anomaly: z.number(),
  trend: z.enum(["improving", "stable", "declining"]),
});

export const BlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  districtId: z.string(),
  subDistrict: z.string(),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.array(z.number()))),
  }),
  centroid: z.tuple([z.number(), z.number()]),
  farmerCount: z.number().int().nonnegative(),
  pumpAssetCount: z.number().int().nonnegative(),
  primaryCrop: z.string().nullable(),
  cropStage: z.enum(["sowing", "vegetative", "flowering", "maturity", "harvest"]).nullable(),
});

export const BlockMetricsSchema = z.object({
  blockId: z.string(),
  asOf: z.string(),
  ndvi: MetricValueSchema,
  soilMoistureSurface: MetricValueSchema,
  soilMoistureRootZone: MetricValueSchema,
  precip7dActual: z.number(),
  precip7dForecast: z.number(),
  lst: z.number(),
  spi: z.number(),
  cwsi: z.number().min(0).max(1),
  floodScore: z.number().min(0).max(1),
  thermalFrp: z.number().optional(),
  sources: z.array(DataSourceRefSchema),
});

export const AlertSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  type: AlertTypeSchema,
  severity: SeveritySchema,
  leadTimeHours: z.number().nonnegative(),
  headline: LocalizedTextSchema,
  detail: LocalizedTextSchema,
  issuedAt: z.string(),
  expiresAt: z.string(),
  dispatchedBy: z.string().optional(),
  officerNote: z.string().optional(),
  channels: z.array(z.string()).optional(),
  isOfficerDispatched: z.boolean().optional(),
});

export const TimeSeriesPointSchema = z.object({
  date: z.string(),
  ndvi: z.number(),
  soilMoisture: z.number(),
  precip: z.number(),
  lst: z.number(),
});

export const RangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const CropKnowledgeSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  category: z.enum(["grain", "legume", "vegetable", "cash"]),
  soilMoisture: RangeSchema,
  temperature: RangeSchema,
  waterRequirementMm: z.number().nonnegative(),
  solarMJ: z.number().nonnegative(),
  daysToHarvest: z.object({
    early: z.number(),
    standard: z.number(),
    late: z.number(),
  }),
  marketDemand: z.enum(["high", "medium", "low"]),
  roiPerHectare: RangeSchema,
  notes: LocalizedTextSchema,
});
