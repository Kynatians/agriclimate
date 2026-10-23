import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertFeed } from "@/components/officer/AlertFeed";
import { Alert, Block, BlockMetrics } from "@/lib/dal/types";

const mockAlert: Alert = {
  id: "alrt_test_01",
  blockId: "blk_test_01",
  type: "flood",
  severity: "high",
  leadTimeHours: 48,
  headline: {
    en: "Flash Flood Warning: Rapid Water Influx",
    bn: "আকস্মিক বন্যা সতর্কতা",
  },
  detail: {
    en: "Brahmaputra upstream surge expected to inundate char fields within 48 hours.",
    bn: "ব্রহ্মপুত্র নদের পানি বৃদ্ধির আশঙ্কা।",
  },
  issuedAt: "2026-09-28T05:00:00Z",
  expiresAt: "2026-09-30T18:00:00Z",
};

const mockBlock: Block = {
  id: "blk_test_01",
  name: "Chilmari South",
  districtId: "kurigram",
  subDistrict: "Chilmari",
  geometry: {
    type: "Polygon",
    coordinates: [[[89.6, 25.5], [89.7, 25.5], [89.7, 25.6], [89.6, 25.5]]],
  },
  centroid: [89.65, 25.55],
  farmerCount: 3420,
  pumpAssetCount: 6,
  primaryCrop: "rice_boro",
  cropStage: "vegetative",
};

const mockMetrics: Record<string, BlockMetrics> = {
  blk_test_01: {
    blockId: "blk_test_01",
    asOf: "2026-09-28",
    ndvi: { value: 0.72, baseline: 0.65, anomaly: 0.07, trend: "stable" },
    soilMoistureSurface: { value: 42.5, baseline: 30.0, anomaly: 12.5, trend: "improving" },
    soilMoistureRootZone: { value: 38.0, baseline: 28.0, anomaly: 10.0, trend: "improving" },
    precip7dActual: 45.0,
    precip7dForecast: 138.0,
    lst: 29.5,
    spi: 1.8,
    cwsi: 0.22,
    floodScore: 0.84,
    sources: [],
  },
};

describe("AlertFeed Component - Incident Details & Pre-Approval Review", () => {
  it("renders active incident alerts with Details and Annotate buttons", () => {
    const handleAnnotate = vi.fn();

    render(
      <AlertFeed
        alerts={[mockAlert]}
        blocks={[mockBlock]}
        metricsMap={mockMetrics}
        onAnnotateAlert={handleAnnotate}
      />
    );

    expect(screen.getByText(/Active Incident Alerts/i)).toBeDefined();
    expect(screen.getByText("Flash Flood Warning: Rapid Water Influx")).toBeDefined();
    expect(screen.getByText("Target: Chilmari South")).toBeDefined();
    expect(screen.getByRole("button", { name: /Details/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Annotate : SMS/i })).toBeDefined();
  });

  it("opens IncidentDetailModal when Details button is clicked, showing telemetry and protocols", () => {
    const handleAnnotate = vi.fn();

    render(
      <AlertFeed
        alerts={[mockAlert]}
        blocks={[mockBlock]}
        metricsMap={mockMetrics}
        onAnnotateAlert={handleAnnotate}
      />
    );

    const detailsButton = screen.getByRole("button", { name: /Details/i });
    fireEvent.click(detailsButton);

    // Modal title & content
    expect(screen.getByText("Incident Alert Verification & Pre-Approval")).toBeDefined();
    expect(screen.getByText("Ground Telemetry & Satellite Triggers")).toBeDefined();
    expect(screen.getByText("Surface Soil Moisture")).toBeDefined();
    expect(screen.getByText("42.5%")).toBeDefined();
    expect(screen.getByText("Recommended Field Mitigation Protocols")).toBeDefined();
    expect(screen.getByText(/Elevate harvested grain sacks/i)).toBeDefined();
  });

  it("approves and broadcasts alert from inside IncidentDetailModal", () => {
    const handleAnnotate = vi.fn();

    render(
      <AlertFeed
        alerts={[mockAlert]}
        blocks={[mockBlock]}
        metricsMap={mockMetrics}
        onAnnotateAlert={handleAnnotate}
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /Details/i }));

    // Click Approve button inside modal
    const approveBtn = screen.getByRole("button", { name: /Approve & Broadcast SMS Advisory/i });
    fireEvent.click(approveBtn);

    expect(handleAnnotate).toHaveBeenCalledTimes(1);
    expect(handleAnnotate).toHaveBeenCalledWith(mockAlert);
  });
});
