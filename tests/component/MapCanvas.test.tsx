import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { Block, BlockMetrics } from "@/lib/dal/types";

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
          [89.65, 25.68],
          [89.72, 25.68],
          [89.72, 25.73],
          [89.65, 25.73],
          [89.65, 25.68],
        ],
      ],
    },
    centroid: [89.685, 25.705],
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

describe("MapCanvas Component", () => {
  it("renders map container with accessible ARIA region label", () => {
    render(<MapCanvas blocks={mockBlocks} metricsMap={mockMetrics} />);

    const region = screen.getByRole("region", {
      name: /Interactive Agricultural Map/i,
    });
    expect(region).toBeDefined();
    expect(screen.getByText(/Kurigram District GIS/i)).toBeDefined();
  });

  it("renders block centroid label and map controls", () => {
    render(<MapCanvas blocks={mockBlocks} metricsMap={mockMetrics} />);

    expect(screen.getByText("Chilmari South")).toBeDefined();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeDefined();
  });
});
