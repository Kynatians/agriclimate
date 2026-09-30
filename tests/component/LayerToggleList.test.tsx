import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayerToggleList } from "@/components/officer/LayerToggleList";
import { useUiStore } from "@/lib/stores/ui";

describe("LayerToggleList Component", () => {
  beforeEach(() => {
    useUiStore.setState({
      activeLayers: ["ndvi", "soilMoisture"],
      activeLayerId: "ndvi",
    });
  });

  it("renders all 7 GIS satellite overlays with their metadata and data sources", () => {
    render(<LayerToggleList />);

    expect(screen.getByText(/GIS Satellite Overlays/i)).toBeDefined();
    expect(screen.getByText("NDVI Anomaly")).toBeDefined();
    expect(screen.getByText("Soil Moisture")).toBeDefined();
    expect(screen.getByText("Flood Risk (FSS)")).toBeDefined();
    expect(screen.getByText("Water Stress")).toBeDefined();
    expect(screen.getByText("7d Precip")).toBeDefined();
    expect(screen.getByText("Pump Priority")).toBeDefined();
    expect(screen.getByText("Fire / Heat")).toBeDefined();

    // Data sources
    expect(screen.getByText(/MODIS \(MOD13Q1\) 250m/i)).toBeDefined();
    expect(screen.getByText(/NASA SMAP L4 \(9km\)/i)).toBeDefined();
  });

  it("switches active viewing layer when an overlay card is clicked", () => {
    render(<LayerToggleList />);

    // Click Flood Risk row
    const floodRiskText = screen.getByText("Flood Risk (FSS)");
    const row = floodRiskText.closest("[role='button']")!;
    fireEvent.click(row);

    // activeLayerId is now floodRisk
    expect(useUiStore.getState().activeLayerId).toBe("floodRisk");
    expect(useUiStore.getState().activeLayers).toContain("floodRisk");
  });

  it("toggles layer visibility when eye button is clicked", () => {
    render(<LayerToggleList />);

    // Toggle off NDVI visibility via eye button
    const toggleButton = screen.getByLabelText(/Toggle visibility of NDVI Anomaly/i);
    fireEvent.click(toggleButton);

    expect(useUiStore.getState().activeLayers).not.toContain("ndvi");
    // Switches active viewing layer to the next remaining layer (soilMoisture)
    expect(useUiStore.getState().activeLayerId).toBe("soilMoisture");
  });
});
