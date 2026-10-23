import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertComposer } from "@/components/officer/AlertComposer";
import { Alert, Block, BlockMetrics } from "@/lib/dal/types";

const mockAlert: Alert = {
  id: "alrt_test_composer_01",
  blockId: "blk_test_01",
  type: "drought",
  severity: "high",
  leadTimeHours: 120,
  headline: {
    en: "Drought Stress Warning: Severe Deficit",
    bn: "খরা সতর্কতা",
  },
  detail: {
    en: "Soil moisture deficit sustained over 6 days. CWSI exceeds 0.70.",
    bn: "মাটিতে তীব্র আর্দ্রতা ঘাটতি।",
  },
  issuedAt: "2026-09-28T05:00:00Z",
  expiresAt: "2026-10-04T12:00:00Z",
};

const mockBlock: Block = {
  id: "blk_test_01",
  name: "Kurigram Sadar",
  districtId: "kurigram",
  subDistrict: "Kurigram Sadar",
  geometry: {
    type: "Polygon",
    coordinates: [[[89.6, 25.5], [89.7, 25.5], [89.7, 25.6], [89.6, 25.5]]],
  },
  centroid: [89.65, 25.55],
  farmerCount: 3420,
  pumpAssetCount: 4,
  primaryCrop: "rice_boro",
  cropStage: "vegetative",
};

const mockMetrics: Record<string, BlockMetrics> = {
  blk_test_01: {
    blockId: "blk_test_01",
    asOf: "2026-09-28",
    ndvi: { value: 0.58, baseline: 0.70, anomaly: -0.12, trend: "declining" },
    soilMoistureSurface: { value: 18.2, baseline: 32.0, anomaly: -13.8, trend: "declining" },
    soilMoistureRootZone: { value: 20.1, baseline: 30.0, anomaly: -9.9, trend: "declining" },
    precip7dActual: 2.0,
    precip7dForecast: 4.5,
    lst: 34.2,
    spi: -2.1,
    cwsi: 0.74,
    floodScore: 0.1,
    sources: [],
  },
};

describe("AlertComposer Pre-Approval Incident Verification", () => {
  it("displays pre-approval telemetry and incident details card when prefillAlert is present", () => {
    const handleOpenChange = vi.fn();

    render(
      <AlertComposer
        open={true}
        onOpenChange={handleOpenChange}
        prefillAlert={mockAlert}
        blocks={[mockBlock]}
        metricsMap={mockMetrics}
      />
    );

    // Verify incident verification card is present
    expect(screen.getByText("Pre-Approval Incident Details & Telemetry")).toBeDefined();
    expect(screen.getByText(/Soil moisture deficit sustained over 6 days/i)).toBeDefined();
    expect(screen.getByText("18.2%")).toBeDefined(); // soil moisture
    expect(screen.getByText("74%")).toBeDefined(); // water stress cwsi
    expect(screen.getByText(/Sentinel\/NASA Telemetry Verified/i)).toBeDefined();
  });
});
