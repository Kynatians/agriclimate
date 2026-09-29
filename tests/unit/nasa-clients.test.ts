import { describe, it, expect } from "vitest";
import { processPowerResponse } from "@/lib/nasa/power-client";
import { parseFirmsCsv } from "@/lib/nasa/firms-client";
import { fetchLiveBlockMetrics } from "@/lib/dal/live-source";
import { NasaPowerPointResponse } from "@/lib/nasa/types";

describe("NASA POWER Client & Processing", () => {
  const mockPowerResponse: NasaPowerPointResponse = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [89.685, 25.705, 24.0],
    },
    header: {
      title: "NASA POWER Daily Agroclimatology",
      api_version: "v2.5.1",
      start: "20260301",
      end: "20260305",
    },
    properties: {
      parameter: {
        T2M: {
          "20260301": 24.5,
          "20260302": 26.2,
          "20260303": 25.8,
          "20260304": 27.1,
          "20260305": 28.0,
        },
        PRECTOTCORR: {
          "20260301": 0.0,
          "20260302": 4.5,
          "20260303": 12.0,
          "20260304": 0.5,
          "20260305": 0.0,
        },
        ALLSKY_SFC_SW_DWN: {
          "20260301": 18.2,
          "20260302": 15.4,
          "20260303": 12.8,
          "20260304": 19.5,
          "20260305": 20.1,
        },
        RH2M: {
          "20260301": 65.0,
          "20260302": 72.0,
          "20260303": 85.0,
          "20260304": 60.0,
          "20260305": 58.0,
        },
      },
    },
  };

  it("processes daily parameters into TimeSeriesPoint and derives CWSI and 7d precip", () => {
    const result = processPowerResponse(
      "blk_kurigram_01",
      [89.685, 25.705],
      mockPowerResponse,
      32.0,
      0.58
    );

    expect(result.blockId).toBe("blk_kurigram_01");
    expect(result.timeSeries.length).toBe(5);
    expect(result.t2mCurrent).toBe(28.0);
    expect(result.precip7dActual).toBe(17.0); // 0 + 4.5 + 12.0 + 0.5 + 0
    expect(result.cwsi).toBeGreaterThanOrEqual(0.0);
    expect(result.cwsi).toBeLessThanOrEqual(1.0);
    expect(result.asOf).toBe("2026-03-05");
  });
});

describe("NASA FIRMS CSV Parser", () => {
  const sampleCsv = `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,confidence,version,bright_ti5,frp,daynight
25.712,89.691,335.2,0.4,0.4,2026-03-28,0745,VIIRS-SNPP,nominal,2.0NRT,298.4,18.5,D
25.805,89.620,348.8,0.5,0.4,2026-03-28,0745,VIIRS-SNPP,high,2.0NRT,305.1,62.4,D`;

  it("parses CSV rows into typed FIRMS detection records", () => {
    const records = parseFirmsCsv(sampleCsv);
    expect(records.length).toBe(2);

    expect(records[0].latitude).toBe(25.712);
    expect(records[0].longitude).toBe(89.691);
    expect(records[0].frp).toBe(18.5);
    expect(records[0].confidence).toBe("nominal");

    expect(records[1].frp).toBe(62.4);
    expect(records[1].confidence).toBe("high");
  });

  it("handles empty or malformed CSV safely", () => {
    expect(parseFirmsCsv("")).toEqual([]);
    expect(parseFirmsCsv("latitude,longitude")).toEqual([]);
  });
});

describe("Live DAL Adapter Deterministic Fallback", () => {
  it("falls back to static seed data when live cache is empty", async () => {
    const metrics = await fetchLiveBlockMetrics("blk_kurigram_01");
    expect(metrics).not.toBeNull();
    if (metrics) {
      expect(metrics.blockId).toBe("blk_kurigram_01");
      expect(metrics.soilMoistureRootZone).toBeDefined();
      expect(metrics.cwsi).toBeGreaterThan(0);
    }
  });
});
