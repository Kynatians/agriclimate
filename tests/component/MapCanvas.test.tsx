import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { Block, BlockMetrics, Alert } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";

const mockBlocks: Block[] = [
  {
    id: "blk_kurigram_01",
    name: "Chilmari South",
    districtId: "kurigram",
    subDistrict: "Chilmari",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [89.638, 25.665],
          [89.685, 25.670],
          [89.734, 25.698],
          [89.721, 25.738],
          [89.664, 25.735],
          [89.638, 25.665],
        ],
      ],
    },
    centroid: [89.682, 25.702],
    farmerCount: 284,
    pumpAssetCount: 4,
    primaryCrop: "rice_boro",
    cropStage: "vegetative",
  },
];

const mockMetrics: Record<string, BlockMetrics> = {
  blk_kurigram_01: {
    blockId: "blk_kurigram_01",
    asOf: "2026-03-28",
    ndvi: { value: 0.62, baseline: 0.58, anomaly: 0.04, trend: "improving" },
    soilMoistureSurface: { value: 32.5, baseline: 30.0, anomaly: 2.5, trend: "improving" },
    soilMoistureRootZone: { value: 29.8, baseline: 28.0, anomaly: 1.8, trend: "stable" },
    precip7dActual: 14.5,
    precip7dForecast: 22.0,
    lst: 28.4,
    spi: 0.35,
    cwsi: 0.38,
    floodScore: 0.22,
    sources: [
      {
        metric: "ndvi",
        dataset: "MODIS MOD13Q1",
        resolution: "250m",
        lastUpdate: "2026-03-28T04:00:00Z",
      },
    ],
  },
};

const mockAlerts: Alert[] = [
  {
    id: "alrt_001",
    blockId: "blk_kurigram_01",
    type: "flood",
    severity: "high",
    leadTimeHours: 48,
    headline: {
      en: "Flash Flood Warning: Rapid Water Influx Expected",
      bn: "আকস্মিক বন্যা সতর্কতা",
    },
    detail: {
      en: "Brahmaputra basin runoff predicted.",
      bn: "পানি বৃদ্ধির আশঙ্কা।",
    },
    issuedAt: "2026-09-28T05:00:00Z",
    expiresAt: "2026-09-30T18:00:00Z",
  },
];

describe("MapCanvas Component", () => {
  it("renders map container with accessible ARIA region label and satellite status", () => {
    render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    const region = screen.getByRole("region", {
      name: /Interactive Agricultural Map/i,
    });
    expect(region).toBeDefined();
    expect(screen.getByText(/Kurigram District GIS/i)).toBeDefined();
    expect(screen.getAllByText(/openstreetmap/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders block centroid label, basemap switcher, and navigation controls", () => {
    render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    expect(screen.getByText("Chilmari South")).toBeDefined();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /change openstreetmap basemap style/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle map features and hazard overlays/i })).toBeDefined();
  });

  it("renders disaster hazard indicators and alert beacon layer", () => {
    render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    // Disaster zone indicators
    expect(screen.getAllByText(/🌊 Inundation/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/☀️ Drought Deficit/i)).toBeDefined();

    // Map Legend indicators
    expect(screen.getByText(/Active Map Indicators/i)).toBeDefined();
    expect(screen.getByText(/Flood Inundation/i)).toBeDefined();
    expect(screen.getByText(/High Alert/i)).toBeDefined();
  });

  it("dynamically switches active GIS satellite overlay when activeLayerId updates", () => {
    act(() => {
      useUiStore.getState().setActiveLayer("floodRisk");
    });

    const { rerender } = render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    // Layer header banner updates to Flood Risk
    expect(screen.getByText(/Layer: Flood Risk \(FSS\)/i)).toBeDefined();
    // Legend updates to Flood Risk stops
    expect(screen.getAllByText(/Flood Risk \(FSS\)/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Soil Moisture
    act(() => {
      useUiStore.getState().setActiveLayer("soilMoisture");
    });

    rerender(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );
    expect(screen.getAllByText(/Layer: Soil Moisture/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Hidden/i)).toBeNull();
  });

  it("ensures area indicator visual overlay is visible by default without (Hidden) status", () => {
    act(() => {
      useUiStore.getState().setActiveLayer("ndvi");
    });

    render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    // Layer name should be clearly visible and not marked as Hidden
    expect(screen.getByText("Layer: NDVI Anomaly")).toBeDefined();
    expect(screen.queryByText(/NDVI Anomaly \(Hidden\)/i)).toBeNull();
  });

  it("handles toggling block boundaries visibility properly", () => {
    act(() => {
      useUiStore.setState({ showBlockBoundaries: false });
    });

    const { rerender } = render(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    // When boundaries are explicitly disabled, it shows (Hidden)
    expect(screen.getByText(/Layer: NDVI Anomaly \(Hidden\)/i)).toBeDefined();

    // Toggle boundaries back on
    act(() => {
      useUiStore.setState({ showBlockBoundaries: true });
    });

    rerender(
      <MapCanvas
        blocks={mockBlocks}
        metricsMap={mockMetrics}
        alerts={mockAlerts}
      />
    );

    // When boundaries are restored, the active visual layer is shown
    expect(screen.getByText("Layer: NDVI Anomaly")).toBeDefined();
  });
});
