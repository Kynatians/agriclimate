import { describe, it, expect } from "vitest";
import { BlockSchema, BlockMetricsSchema, AlertSchema, TimeSeriesPointSchema } from "@/lib/dal/schemas";
import blocksData from "@/data/generated/blocks.json";
import metricsData from "@/data/generated/block-metrics.json";
import timeseriesData from "@/data/generated/timeseries.json";
import alertsData from "@/data/generated/alerts.json";

describe("Seed Data Integrity (Zod Validation)", () => {
  it("validates all blocks in blocks.json", () => {
    expect(Array.isArray(blocksData)).toBe(true);
    expect(blocksData.length).toBeGreaterThanOrEqual(10);
    for (const block of blocksData) {
      const parsed = BlockSchema.safeParse(block);
      expect(parsed.success, `Block ${block.id} failed validation: ${JSON.stringify(parsed.error)}`).toBe(true);
    }
  });

  it("validates all block metrics in block-metrics.json", () => {
    expect(Array.isArray(metricsData)).toBe(true);
    for (const metric of metricsData) {
      const parsed = BlockMetricsSchema.safeParse(metric);
      expect(parsed.success, `Metric for ${metric.blockId} failed validation: ${JSON.stringify(parsed.error)}`).toBe(true);
    }
  });

  it("validates timeseries points in timeseries.json", () => {
    expect(typeof timeseriesData).toBe("object");
    for (const [blockId, points] of Object.entries(timeseriesData)) {
      expect(Array.isArray(points), `Points for ${blockId} must be an array`).toBe(true);
      for (const pt of points) {
        const parsed = TimeSeriesPointSchema.safeParse(pt);
        expect(parsed.success, `Point in ${blockId} failed validation: ${JSON.stringify(parsed.error)}`).toBe(true);
      }
    }
  });

  it("validates all alerts in alerts.json", () => {
    expect(Array.isArray(alertsData)).toBe(true);
    for (const alert of alertsData) {
      const parsed = AlertSchema.safeParse(alert);
      expect(parsed.success, `Alert ${alert.id} failed validation: ${JSON.stringify(parsed.error)}`).toBe(true);
    }
  });
});
