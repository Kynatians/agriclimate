import { describe, it, expect } from "vitest";
import { computeFss, computeSpi, computeCwsi, computeDeficitSeverity, clamp } from "@/lib/indices/formulas";

describe("Index Formulas Reference Implementations", () => {
  it("clamp respects bounds correctly", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("computes Flood Susceptibility Score (FSS) correctly", () => {
    // 0.40 * (80/100) + 0.35 * (45/50) + 0.25 * 0.5 = 0.32 + 0.315 + 0.125 = 0.76
    const fss = computeFss(80, 45, 50, 0.5);
    expect(fss).toBeGreaterThanOrEqual(0.7);
    expect(fss).toBeLessThanOrEqual(1.0);

    // Low rainfall and low moisture should yield low FSS
    const lowFss = computeFss(10, 20, 50, 0.2);
    expect(lowFss).toBeLessThan(0.4);
  });

  it("computes Standardized Precipitation Index (SPI) correctly", () => {
    const spiNormal = computeSpi(100, 100, 25);
    expect(spiNormal).toBe(0);

    const spiDrought = computeSpi(50, 100, 25);
    expect(spiDrought).toBe(-2.0); // Extreme drought
  });

  it("computes Crop Water Stress Index (CWSI) correctly", () => {
    // High temp and low moisture -> high CWSI
    const highStress = computeCwsi(35, 15, 35);
    expect(highStress).toBeGreaterThan(0.6);

    // Optimal moisture and mild temp -> low CWSI
    const lowStress = computeCwsi(25, 35, 35);
    expect(lowStress).toBe(0);
  });

  it("computes Deficit Severity correctly", () => {
    const severity = computeDeficitSeverity(10, 35);
    expect(severity).toBe(29);
  });
});
