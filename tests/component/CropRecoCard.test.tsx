import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CropRecoCard } from "@/components/farmer/CropRecoCard";
import { CropRecommendation } from "@/lib/dal/types";

const mockReco: CropRecommendation = {
  crop: {
    id: "lentil_bari",
    name: { en: "Lentil (Masur)", bn: "মসুর ডাল" },
    category: "legume",
    soilMoisture: { min: 18.0, max: 28.0 },
    temperature: { min: 14.0, max: 25.0 },
    waterRequirementMm: 220,
    solarMJ: 16.0,
    daysToHarvest: { early: 95, standard: 102, late: 110 },
    marketDemand: "high",
    roiPerHectare: { min: 850, max: 1300 },
    notes: { en: "Extremely drought-tolerant pulse crop.", bn: "অত্যন্ত খরা সহনশীল ডাল জাতীয় ফসল।" },
  },
  css: 88,
  subScores: {
    soilMoisture: 0.9,
    temperature: 0.95,
    rainfall: 0.85,
    solar: 0.8,
    ndvi: 0.8,
  },
  whyThisLand: {
    en: "Current soil moisture (22%) is optimal for root nodules.",
    bn: "বর্তমান মাটির আর্দ্রতা (২২%) শিকড়ের জন্য অনুকূল।",
  },
  riskNote: {
    en: "Avoid waterlogging if early pre-monsoon shower occurs.",
    bn: "অকাল বৃষ্টি হলে পানি নিষ্কাশনের ব্যবস্থা রাখুন।",
  },
  bestHarvestWindow: {
    start: "Feb 15",
    end: "Mar 05",
  },
};

describe("CropRecoCard component", () => {
  it("renders crop name, category, and CSS score", () => {
    render(<CropRecoCard reco={mockReco} defaultCollapsed={true} />);

    expect(screen.getByText("Lentil (Masur)")).toBeDefined();
    expect(screen.getByText("legume")).toBeDefined();
    expect(screen.getByText("88")).toBeDefined();
    expect(screen.getByText("CSS Score")).toBeDefined();
  });

  it("toggles expanded details on click", () => {
    render(<CropRecoCard reco={mockReco} defaultCollapsed={true} />);

    // Initially collapsed: "Why this land?" shouldn't be rendered
    expect(screen.queryByText("Why this land?")).toBeNull();

    // Click header button to expand
    const button = screen.getByRole("button", { name: /lentil/i });
    fireEvent.click(button);

    // Now expanded
    expect(screen.getByText("Why this land?")).toBeDefined();
    expect(screen.getByText("Current soil moisture (22%) is optimal for root nodules.")).toBeDefined();
    expect(screen.getByText("Risk Note")).toBeDefined();
    expect(screen.getByText("95-110 days")).toBeDefined();

    // Click again to collapse
    fireEvent.click(button);
    expect(screen.queryByText("Why this land?")).toBeNull();
  });
});
