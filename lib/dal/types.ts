// lib/dal/types.ts
// Single source of truth for AgriClimate domain model per tech spec §4

export type LocalizedText = Record<string, string>; // e.g. { en: "...", bn: "..." }

export type AlertType = "drought" | "flood" | "cyclone" | "waterlogging" | "fire";
export type Severity = "low" | "medium" | "high";

export interface DataSourceRef {
  metric: string;                // e.g. "soilMoisture", "ndvi"
  dataset: string;               // e.g. "NASA SMAP L3", "MODIS MOD13Q1"
  resolution: string;            // e.g. "500m", "250m", "10km"
  lastUpdate: string;            // ISO timestamp
}

export interface MetricValue {
  value: number;
  baseline: number;
  anomaly: number;               // value - baseline
  trend: "improving" | "stable" | "declining";
}

export interface Block {
  id: string;                    // e.g. "blk_kurigram_01"
  name: string;                  // e.g. "Chilmari South"
  districtId: string;            // e.g. "kurigram"
  subDistrict: string;           // e.g. "Chilmari"
  geometry: {
    type: "Polygon";
    coordinates: number[][][];   // GeoJSON Polygon coordinates in EPSG:4326 [lng, lat]
  };
  centroid: [number, number];    // [lng, lat]
  farmerCount: number;
  pumpAssetCount: number;
  primaryCrop: CropId | null;
  cropStage: CropStage | null;
}

export interface BlockMetrics {
  blockId: string;
  asOf: string;                  // ISO date of the snapshot
  ndvi: MetricValue;
  soilMoistureSurface: MetricValue;   // % VWC (0-100)
  soilMoistureRootZone: MetricValue;  // % VWC (0-100)
  precip7dActual: number;        // mm
  precip7dForecast: number;      // mm
  lst: number;                   // Land surface temp in °C
  spi: number;                   // Standardized Precipitation Index (-3.0 to +3.0)
  cwsi: number;                  // Crop Water Stress Index (0 to 1)
  floodScore: number;            // Flood Susceptibility Score FSS (0 to 1)
  thermalFrp?: number;           // Fire Radiative Power (MW) from NASA FIRMS VIIRS
  sources: DataSourceRef[];      // Data provenance per metric
}

export interface Alert {
  id: string;
  blockId: string;
  type: AlertType;
  severity: Severity;
  leadTimeHours: number;         // e.g. 48, 72
  headline: LocalizedText;       // { en: "...", bn: "..." }
  detail: LocalizedText;
  issuedAt: string;              // ISO timestamp
  expiresAt: string;             // ISO timestamp
  dispatchedBy?: string;         // e.g. "Upazila Agriculture Office (DAE)"
  officerNote?: string;          // Specific officer advice attached during dispatch
  channels?: string[];           // ["sms", "push", "ivr"]
  isOfficerDispatched?: boolean; // true if reviewed & broadcasted from officer panel
}

export interface TimeSeriesPoint {
  date: string;                  // YYYY-MM-DD
  ndvi: number;
  soilMoisture: number;          // % VWC
  precip: number;                // mm
  lst: number;                   // °C
}

// Crop Domain
export type CropId = string;     // e.g. "rice_boro", "wheat_kanchan", "jute_tossa"
export type CropCategory = "grain" | "legume" | "vegetable" | "cash";
export type CropStage = "sowing" | "vegetative" | "flowering" | "maturity" | "harvest";

export interface Range {
  min: number;
  max: number;
}

export interface CropKnowledge {
  id: CropId;
  name: LocalizedText;
  category: CropCategory;
  soilMoisture: Range;           // optimal % VWC
  temperature: Range;            // optimal °C
  waterRequirementMm: number;    // total mm per season
  solarMJ: number;               // MJ/m²/day
  daysToHarvest: {
    early: number;
    standard: number;
    late: number;
  };
  marketDemand: "high" | "medium" | "low";
  roiPerHectare: Range;          // USD/hectare
  notes: LocalizedText;
}

export interface CropRecommendation {
  crop: CropKnowledge;
  css: number;                   // Crop Suitability Score 0-100
  subScores: Record<"soilMoisture" | "temperature" | "rainfall" | "solar" | "ndvi", number>;
  whyThisLand: LocalizedText;    // Template-interpolated narrative
  riskNote: LocalizedText | null;
  bestHarvestWindow: {
    start: string;
    end: string;
  };
}

// Irrigation & Pump Planning
export interface PumpAsset {
  id: string;
  name: string;
  blockId: string;
  capacityLps: number;           // liters per second
  powerSource: "solar" | "diesel" | "electric";
  status: "available" | "deployed" | "maintenance";
  currentLocation: [number, number]; // [lng, lat]
}

export interface PumpDeployment {
  pumpId: string;
  targetBlockId: string;
  targetBlockName: string;
  deficitSeverity: number;       // 0-100
  estimatedCoverageHours: number;
  suggestedSequence: number;
}

export interface IrrigationPlan {
  districtId: string;
  generatedAt: string;
  totalDeficitBlocks: number;
  availablePumps: number;
  deployments: PumpDeployment[];
}

// District Overview & Reports
export interface DistrictSummary {
  districtId: string;
  districtName: LocalizedText;
  totalBlocks: number;
  totalFarmers: number;
  totalPumps: number;
  averageNdvi: MetricValue;
  averageSoilMoisture: MetricValue;
  activeAlertCount: {
    drought: number;
    flood: number;
    cyclone: number;
    waterlogging: number;
    fire: number;
    total: number;
  };
  topStressedBlocks: {
    blockId: string;
    blockName: string;
    cwsi: number;
    status: string;
  }[];
  asOf: string;
}

export interface DistrictReport {
  districtId: string;
  districtName: LocalizedText;
  reportDate: string;
  summary: DistrictSummary;
  blockMetricsList: {
    block: Block;
    metrics: BlockMetrics;
  }[];
  activeAlerts: Alert[];
  irrigationPlan: IrrigationPlan;
}

// Pump Request & Transfer Workflow
export type PumpRequestType = "new_pump" | "transfer";
export type PumpRequestStatus = "pending" | "approved" | "rejected";

export interface PumpRequest {
  id: string;                          // e.g. "pr_1696123456789"
  type: PumpRequestType;               // "new_pump" or "transfer"
  status: PumpRequestStatus;
  requesterBlockId: string;            // block the farmer is requesting FROM (their active block)
  requesterBlockName: string;
  targetBlockId?: string;              // for "transfer" type: the block they want the pump moved TO
  targetBlockName?: string;
  reason: string;                      // farmer's free-text reason
  urgency: Severity;                   // "low" | "medium" | "high"
  deficitSeverity?: number;            // auto-computed from block metrics (0-100)
  requestedAt: string;                 // ISO timestamp
  resolvedAt?: string;                 // ISO timestamp (set when approved/rejected)
  officerNote?: string;                // officer's response note
  resolvedBy?: string;                 // e.g. "Upazila Agriculture Office (DAE)"
}
