import { describe, it, expect } from "vitest";
import { scoreCrop, recommendTop } from "@/lib/indices/css";
import { getCropById } from "@/lib/crops/knowledge-base";
import metricsData from "@/data/generated/block-metrics.json";
import { BlockMetrics } from "@/lib/dal/types";

describe("Crop Suitability Score (CSS) Engine", () => {
  const dryBlock = metricsData.find((m) => m.blockId === "blk_kurigram_01") as BlockMetrics;
  const moistBlock = metricsData.find((m) => m.blockId === "blk_kurigram_03") as BlockMetrics;

  it("scores crops deterministically between 0 and 100", () => {
    const boroCrop = getCropById("rice_boro")!;
    const rec = scoreCrop(dryBlock, boroCrop);

    expect(rec.css).toBeGreaterThanOrEqual(0);
    expect(rec.css).toBeLessThanOrEqual(100);
    expect(rec.whyThisLand.en).toBeTruthy();
    expect(rec.whyThisLand.bn).toBeTruthy();
    expect(rec.bestHarvestWindow.start).toBeTruthy();
    expect(rec.bestHarvestWindow.end).toBeTruthy();
  });

  it("yields higher CSS for drought-hardy crops than water-hungry paddy on dry soil", () => {
    const lentilCrop = getCropById("lentil_bari")!;
    const boroCrop = getCropById("rice_boro")!;

    const lentilRec = scoreCrop(dryBlock, lentilCrop);
    const boroRec = scoreCrop(dryBlock, boroCrop);

    // Lentil thrives at ~20% moisture; Boro rice needs 35-48% moisture
    expect(lentilRec.css).toBeGreaterThan(boroRec.css);
    expect(boroRec.riskNote).not.toBeNull();
  });

  it("yields high CSS for Boro rice on well-irrigated moist block", () => {
    const boroCrop = getCropById("rice_boro")!;
    const boroRec = scoreCrop(moistBlock, boroCrop);

    expect(boroRec.css).toBeGreaterThanOrEqual(70);
  });

  it("recommendTop returns sorted top N crops with descending scores", () => {
    const recs = recommendTop(moistBlock, 5);
    expect(recs.length).toBe(5);

    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].css).toBeGreaterThanOrEqual(recs[i + 1].css);
    }
  });
});
