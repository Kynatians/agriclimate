import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FarmPulseBanner } from "@/components/farmer/FarmPulseBanner";
import { DailyDecisionsGrid } from "@/components/farmer/DailyDecisionsGrid";
import { PlanningAheadSection } from "@/components/farmer/PlanningAheadSection";
import { RegionalRadarSummary } from "@/components/farmer/RegionalRadarSummary";
import { FarmTrendsChart } from "@/components/farmer/FarmTrendsChart";
import { BlockMetrics, Block, CropRecommendation } from "@/lib/dal/types";

const mockMetrics: BlockMetrics = {
  blockId: "blk_kurigram_01",
  asOf: "2026-09-30T12:00:00Z",
  lst: 32.4,
  cwsi: 0.42,
  soilMoistureSurface: { value: 31.0, baseline: 30.0, anomaly: 1.0, trend: "stable" },
  soilMoistureRootZone: { value: 34.0, baseline: 35.0, anomaly: -1.0, trend: "stable" },
  ndvi: { value: 0.68, baseline: 0.64, anomaly: 0.04, trend: "improving" },
  precip7dActual: 35.0,
  precip7dForecast: 42.0,
  spi: -0.15,
  floodScore: 0.12,
  sources: [
    { metric: "lst", dataset: "NASA POWER", resolution: "0.5°", lastUpdate: "2026-09-30T00:00:00Z" },
    { metric: "precip", dataset: "NASA GPM IMERG", resolution: "10km", lastUpdate: "2026-09-30T06:00:00Z" },
  ],
};

const mockBlock: Block = {
  id: "blk_kurigram_01",
  name: "Kurigram Sadar",
  subDistrict: "Kurigram",
  districtId: "kurigram",
  farmerCount: 1240,
  pumpAssetCount: 14,
  primaryCrop: "rice_boro",
  cropStage: "vegetative",
  centroid: [89.65, 25.81],
  geometry: {
    type: "Polygon",
    coordinates: [[[89.65, 25.81], [89.66, 25.81], [89.66, 25.82], [89.65, 25.81]]],
  },
};

const mockRecos: CropRecommendation[] = [
  {
    crop: {
      id: "potato_diamond",
      name: { en: "Potato (Diamond)", bn: "গোল আলু" },
      category: "vegetable",
      soilMoisture: { min: 25.0, max: 35.0 },
      temperature: { min: 15.0, max: 24.0 },
      waterRequirementMm: 350,
      solarMJ: 18.0,
      daysToHarvest: { early: 85, standard: 90, late: 100 },
      marketDemand: "high",
      roiPerHectare: { min: 1100, max: 1600 },
      notes: { en: "High yield potential.", bn: "উচ্চ ফলনশীল।" },
    },
    css: 88,
    subScores: {
      soilMoisture: 0.9,
      temperature: 0.9,
      rainfall: 0.85,
      solar: 0.9,
      ndvi: 0.8,
    },
    whyThisLand: { en: "Ideal sandy loam soil.", bn: "দোআঁশ মাটি উপযোগী।" },
    riskNote: { en: "Monitor late blight risk.", bn: "লেট ব্লাইট রোগ খেয়াল রাখুন।" },
    bestHarvestWindow: { start: "Jan 10", end: "Jan 25" },
  },
];

describe("Farmer Home Simplification Flow", () => {
  it("renders FarmPulseBanner and triggers telemetry drawer callback", () => {
    const onOpenTelemetry = vi.fn();
    const onViewAlerts = vi.fn();

    render(
      <FarmPulseBanner
        metrics={mockMetrics}
        activeAlert={null}
        officerAlertsCount={0}
        blockName="Kurigram Sadar"
        onViewAlerts={onViewAlerts}
        onOpenTelemetry={onOpenTelemetry}
      />
    );

    expect(screen.getByText(/Field Status: Normal & Monitored/i)).toBeDefined();
    const telemetryBtn = screen.getByRole("button", { name: /telemetry/i });
    fireEvent.click(telemetryBtn);
    expect(onOpenTelemetry).toHaveBeenCalledTimes(1);
  });

  it("renders DailyDecisionsGrid and triggers Water, Weather, and Crop Care popups", () => {
    const onOpenIrrigation = vi.fn();
    const onOpenWeather = vi.fn();
    const onOpenCropCare = vi.fn();

    render(
      <DailyDecisionsGrid
        metrics={mockMetrics}
        block={mockBlock}
        onOpenIrrigation={onOpenIrrigation}
        onOpenWeather={onOpenWeather}
        onOpenCropCare={onOpenCropCare}
      />
    );

    // 1. Water decision
    expect(screen.getByText("Moisture Adequate")).toBeDefined();
    fireEvent.click(screen.getByText("Moisture Adequate"));
    expect(onOpenIrrigation).toHaveBeenCalledTimes(1);

    // 2. Weather decision
    expect(screen.getByText("32°C")).toBeDefined();
    fireEvent.click(screen.getByText("32°C"));
    expect(onOpenWeather).toHaveBeenCalledTimes(1);

    // 3. Crop care decision
    expect(screen.getByText("rice_boro")).toBeDefined();
    fireEvent.click(screen.getByText("rice_boro"));
    expect(onOpenCropCare).toHaveBeenCalledTimes(1);
  });

  it("renders PlanningAheadSection and handles calendar jump and crop reco modal trigger", () => {
    const onOpenCalendar = vi.fn();
    const onOpenRecommendations = vi.fn();

    render(
      <PlanningAheadSection
        recommendations={mockRecos}
        onOpenCalendar={onOpenCalendar}
        onOpenRecommendations={onOpenRecommendations}
      />
    );

    expect(screen.getByText(/Sow Boro Rice: Oct 14–19/i)).toBeDefined();
    fireEvent.click(screen.getByText(/Sow Boro Rice: Oct 14–19/i));
    expect(onOpenCalendar).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/#1 Top Pick: Potato \(Diamond\)/i)).toBeDefined();
    fireEvent.click(screen.getByText(/#1 Top Pick: Potato \(Diamond\)/i));
    expect(onOpenRecommendations).toHaveBeenCalledTimes(1);
  });

  it("renders RegionalRadarSummary and handles block selection and GIS map navigation", () => {
    const onSelectBlock = vi.fn();
    const onOpenMapTab = vi.fn();

    render(
      <RegionalRadarSummary
        blocks={[mockBlock]}
        metricsMap={{ [mockBlock.id]: mockMetrics }}
        activeBlockId={mockBlock.id}
        onSelectBlock={onSelectBlock}
        onOpenMapTab={onOpenMapTab}
      />
    );

    expect(screen.getByText(/Kurigram Regional Field Radar/i)).toBeDefined();

    const mapBtn = screen.getByRole("button", { name: /Open Full Interactive GIS Map/i });
    fireEvent.click(mapBtn);
    expect(onOpenMapTab).toHaveBeenCalledTimes(1);
  });

  it("renders FarmTrendsChart with safe zones and allows switching metric tabs", () => {
    const mockTimeSeries = [
      { date: "2026-09-20", ndvi: 0.65, soilMoisture: 32.0, precip: 0.0, lst: 31.0 },
      { date: "2026-09-21", ndvi: 0.66, soilMoisture: 31.5, precip: 4.5, lst: 30.5 },
      { date: "2026-09-22", ndvi: 0.67, soilMoisture: 31.0, precip: 0.0, lst: 31.8 },
      { date: "2026-09-23", ndvi: 0.68, soilMoisture: 31.0, precip: 0.0, lst: 32.4 },
    ];

    render(
      <FarmTrendsChart
        timeSeries={mockTimeSeries}
        metrics={mockMetrics}
        blockName="Kurigram Sadar"
      />
    );

    expect(screen.getByText(/Field Health & Climate Trends/i)).toBeDefined();
    expect(screen.getByText(/Soil Moisture Interpretation/i)).toBeDefined();

    // Switch to Rainfall metric
    const rainTab = screen.getByText(/Rainfall/i);
    fireEvent.click(rainTab);
    expect(screen.getByText(/Rainfall Interpretation/i)).toBeDefined();

    // Switch to Crop Greenness / NDVI metric
    const ndviTab = screen.getByText("NDVI Vegetation");
    fireEvent.click(ndviTab);
    expect(screen.getByText(/NDVI.*Interpretation/i)).toBeDefined();
  });
});
