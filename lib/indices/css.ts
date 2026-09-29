// lib/indices/css.ts
// Pure Crop Suitability Score (CSS) engine per tech spec §5.2 and product doc §4.1

import { BlockMetrics, CropKnowledge, CropRecommendation, Range } from "@/lib/dal/types";
import { CSS_WEIGHTS } from "./thresholds";
import { clamp } from "./formulas";
import { CROP_KNOWLEDGE_BASE } from "@/lib/crops/knowledge-base";

/**
 * Evaluates how well a measured value matches an optimal [min, max] range.
 * Returns 1.0 if inside range; drops linearly to 0.0 outside range.
 */
function scoreRangeMatch(val: number, range: Range): number {
  if (val >= range.min && val <= range.max) {
    return 1.0;
  }
  const width = Math.max(range.max - range.min, 1.0);
  const dist = val < range.min ? range.min - val : val - range.max;
  return clamp(1.0 - dist / width, 0.0, 1.0);
}

/**
 * Pure function: Scores a single crop against a block's telemetry.
 */
export function scoreCrop(
  block: BlockMetrics,
  crop: CropKnowledge,
  asOfDate: string = block.asOf
): CropRecommendation {
  // 1. Soil Moisture Sub-Score (surface + root zone average)
  const avgMoisture = (block.soilMoistureSurface.value + block.soilMoistureRootZone.value) / 2.0;
  const smSub = scoreRangeMatch(avgMoisture, crop.soilMoisture);

  // 2. Temperature Sub-Score
  const tempSub = scoreRangeMatch(block.lst, crop.temperature);

  // 3. Rainfall Match (7-day forecast extrapolated + actual vs seasonal requirement)
  const seasonalRainEst = (block.precip7dActual + block.precip7dForecast) * 8; // approx 16-week cycle
  const targetRainMm = crop.waterRequirementMm;
  const rainDiff = Math.abs(seasonalRainEst - targetRainMm);
  const rainSub = clamp(1.0 - rainDiff / targetRainMm, 0.0, 1.0);

  // 4. Solar Irradiance Sub-Score (approx from LST & seasonal index)
  const estSolarMJ = clamp(block.lst * 0.62, 10, 24);
  const solarDiff = Math.abs(estSolarMJ - crop.solarMJ);
  const solarSub = clamp(1.0 - solarDiff / 10.0, 0.0, 1.0);

  // 5. Vegetation Recovery / Field Condition Sub-Score (from NDVI baseline & anomaly)
  const ndviSub = clamp(block.ndvi.value / Math.max(block.ndvi.baseline, 0.3), 0.0, 1.0);

  const subScores = {
    soilMoisture: Number(smSub.toFixed(2)),
    temperature: Number(tempSub.toFixed(2)),
    rainfall: Number(rainSub.toFixed(2)),
    solar: Number(solarSub.toFixed(2)),
    ndvi: Number(ndviSub.toFixed(2)),
  };

  const rawScore =
    CSS_WEIGHTS.soilMoisture * subScores.soilMoisture +
    CSS_WEIGHTS.temperature * subScores.temperature +
    CSS_WEIGHTS.rainfall * subScores.rainfall +
    CSS_WEIGHTS.solar * subScores.solar +
    CSS_WEIGHTS.ndvi * subScores.ndvi;

  const css = Math.round(clamp(rawScore * 100, 0, 100));

  // Determine top two contributing dimensions
  const scoreEntries = [
    { key: "soilMoisture", val: subScores.soilMoisture, weight: CSS_WEIGHTS.soilMoisture },
    { key: "temperature", val: subScores.temperature, weight: CSS_WEIGHTS.temperature },
    { key: "rainfall", val: subScores.rainfall, weight: CSS_WEIGHTS.rainfall },
    { key: "solar", val: subScores.solar, weight: CSS_WEIGHTS.solar },
    { key: "ndvi", val: subScores.ndvi, weight: CSS_WEIGHTS.ndvi },
  ];
  scoreEntries.sort((a, b) => b.val * b.weight - a.val * a.weight);

  const top1 = scoreEntries[0].key;
  const top2 = scoreEntries[1].key;

  // Template string interpolation (No LLM!)
  const whyNarratives: Record<string, { en: string; bn: string }> = {
    soilMoisture: {
      en: `Soil moisture at ${avgMoisture.toFixed(1)}% VWC aligns closely with optimal range (${crop.soilMoisture.min}–${crop.soilMoisture.max}%).`,
      bn: `মাটির আর্দ্রতা ${avgMoisture.toFixed(1)}% ভিডব্লিউসি এই ফসলের অনুকূল সীমার (${crop.soilMoisture.min}–${crop.soilMoisture.max}%) সাথে মানানসই।`,
    },
    temperature: {
      en: `Surface temperature (${block.lst.toFixed(1)}°C) provides favorable conditions for crop germination.`,
      bn: `জমির তাপমাত্রা (${block.lst.toFixed(1)}°সে) অঙ্কুরোদগমের জন্য অত্যন্ত সহায়ক।`,
    },
    rainfall: {
      en: `Forecast precipitation pattern covers early growth requirements with minimal supplemental pumping.`,
      bn: `বৃষ্টিপাতের পূর্বাভাস প্রাথমিক বৃদ্ধি পর্যায় সম্পন্ন করতে সহায়ক হবে।`,
    },
    solar: {
      en: `High solar irradiance supports strong photosynthetic vegetative activity.`,
      bn: `পর্যাপ্ত সূর্যালোক উদ্ভিদের সালোকসংশ্লেষণ প্রক্রিয়ার জন্য আদর্শ।`,
    },
    ndvi: {
      en: `Field vegetation index (${block.ndvi.value.toFixed(2)}) confirms healthy organic soil recovery.`,
      bn: `জমির উদ্ভিজ্জ সূচক (${block.ndvi.value.toFixed(2)}) পর্যাপ্ত জৈব পুনরুদ্ধারের প্রমাণ দেয়।`,
    },
  };

  const whyThisLand = {
    en: `${whyNarratives[top1].en} ${whyNarratives[top2].en}`,
    bn: `${whyNarratives[top1].bn} ${whyNarratives[top2].bn}`,
  };

  // Risk note if any sub-score < 0.5
  let riskNote: { en: string; bn: string } | null = null;
  const weakest = [...scoreEntries].sort((a, b) => a.val - b.val)[0];
  if (weakest.val < 0.5) {
    const riskTemplates: Record<string, { en: string; bn: string }> = {
      soilMoisture: {
        en: `Soil moisture is outside ideal bounds. Supplemental irrigation or drainage management will be required.`,
        bn: `মাটির আর্দ্রতা অনুকূল মাত্রার বাইরে। সম্পূরক সেচ বা নিকাশী ব্যবস্থা নিশ্চিত করতে হবে।`,
      },
      temperature: {
        en: `Surface temperature exceeds typical comfort threshold. Monitor for early thermal stress.`,
        bn: `জমির তাপমাত্রা সহনীয় মাত্রার চেয়ে বেশি। তাপীয় চাপের দিকে নজর রাখুন।`,
      },
      rainfall: {
        en: `Projected rainfall diverges from seasonal water requirement. Active water scheduling required.`,
        bn: `বৃষ্টিপাতের পরিমাণ চাহিদার চেয়ে ভিন্ন। নিয়মিত সেচ পরিকল্পনা আবশ্যক।`,
      },
      solar: {
        en: `Sub-optimal solar irradiance may lengthen days to harvest.`,
        bn: `স্বল্প সূর্যালোকের কারণে ফসল পরিপক্ক হতে বাড়তি সময় লাগতে পারে।`,
      },
      ndvi: {
        en: `Sub-baseline vegetation index detected. Organic compost addition strongly recommended.`,
        bn: `জমির উদ্ভিজ্জ সূচক তুলনামূলক কম। জমিতে পর্যাপ্ত জৈব সার প্রয়োগের পরামর্শ দেওয়া হচ্ছে।`,
      },
    };
    riskNote = riskTemplates[weakest.key] || null;
  }

  // Calculate harvest window based on daysToHarvest
  const baseDate = new Date(asOfDate);
  const harvestStart = new Date(baseDate.getTime() + crop.daysToHarvest.early * 86400000);
  const harvestEnd = new Date(baseDate.getTime() + crop.daysToHarvest.late * 86400000);

  return {
    crop,
    css,
    subScores,
    whyThisLand,
    riskNote,
    bestHarvestWindow: {
      start: harvestStart.toISOString().split("T")[0],
      end: harvestEnd.toISOString().split("T")[0],
    },
  };
}

/**
 * Pure function: Scores all crops in the knowledge base and returns top N ranked recommendations.
 */
export function recommendTop(
  block: BlockMetrics,
  n: number = 7,
  asOfDate: string = block.asOf
): CropRecommendation[] {
  const scored = CROP_KNOWLEDGE_BASE.map((crop) => scoreCrop(block, crop, asOfDate));
  scored.sort((a, b) => b.css - a.css);
  return scored.slice(0, n);
}
