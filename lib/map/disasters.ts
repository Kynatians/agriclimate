// lib/map/disasters.ts
// Domain definitions and geographic vector data for active disaster zones in Kurigram

export type DisasterType = "flood" | "drought" | "erosion" | "heat";

export interface DisasterZone {
  id: string;
  name: string;
  type: DisasterType;
  severity: "high" | "medium" | "low";
  headline: {
    en: string;
    bn: string;
  };
  detail: {
    en: string;
    bn: string;
  };
  affectedBlocks: string[];
  areaHectares: number;
  estFarmersAffected: number;
  keyMetricLabel: string;
  keyMetricValue: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  centroid: [number, number];
}

export const DISASTER_ZONES: DisasterZone[] = [
  {
    id: "disaster_brahmaputra_flood",
    name: "Brahmaputra Riparian Inundation Corridor",
    type: "flood",
    severity: "high",
    headline: {
      en: "Acute Inundation & Riparian Surge Along Brahmaputra Chars",
      bn: "ব্রহ্মপুত্র চরাঞ্চলে তীব্র প্লাবন ও নদীভাঙন সতর্কতা",
    },
    detail: {
      en: "GPM satellite telemetry detects 138mm 48-hr cumulative rainfall coupled with upstream snowmelt surge. Active inundation threat across char agricultural plots.",
      bn: "উপগ্রহ তথ্যে আগামী ৪৮ ঘণ্টায় ১৩৮ মিমি বৃষ্টিপাত ও উজানের ঢলের পূর্বাভাস পাওয়া গেছে। নিম্নাঞ্চল দ্রুত তলিয়ে যাওয়ার ঝুঁকি রয়েছে।",
    },
    affectedBlocks: ["blk_kurigram_11", "blk_kurigram_12", "blk_kurigram_01"],
    areaHectares: 18450,
    estFarmersAffected: 4280,
    keyMetricLabel: "Flood Risk (FSS)",
    keyMetricValue: "0.88 (Severe)",
    centroid: [89.755, 25.615],
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [89.715, 25.510],
          [89.745, 25.550],
          [89.775, 25.600],
          [89.782, 25.660],
          [89.765, 25.710],
          [89.735, 25.745],
          [89.695, 25.735],
          [89.680, 25.690],
          [89.692, 25.635],
          [89.705, 25.570],
          [89.715, 25.510],
        ],
      ],
    },
  },
  {
    id: "disaster_rajarhat_drought",
    name: "Rajarhat-Ulipur Moisture Depletion Corridor",
    type: "drought",
    severity: "high",
    headline: {
      en: "Critical Root-Zone Soil Moisture Deficit",
      bn: "মাটির মূল অঞ্চলে মারাত্মক আর্দ্রতা ঘাটতি",
    },
    detail: {
      en: "NASA SMAP L4 reveals 28% root-zone moisture deficit below 10-year seasonal baseline sustained for 8 days. Evaporative stress CWSI index at 0.74.",
      bn: "নাসা এসএমএপি উপগ্রহ চিত্রে মাটির আর্দ্রতা স্বাভাবিকের চেয়ে ২৮% কম দেখা যাচ্ছে যা ৮ দিন ধরে চলছে। ধান ও রবি ফসলে অবিলম্বে সেচ প্রয়োজন।",
    },
    affectedBlocks: ["blk_kurigram_07", "blk_kurigram_04", "blk_kurigram_06"],
    areaHectares: 12800,
    estFarmersAffected: 3620,
    keyMetricLabel: "CWSI Stress Index",
    keyMetricValue: "0.74 (Acute)",
    centroid: [89.525, 25.745],
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [89.495, 25.720],
          [89.530, 25.710],
          [89.560, 25.735],
          [89.565, 25.785],
          [89.545, 25.825],
          [89.510, 25.830],
          [89.485, 25.795],
          [89.480, 25.755],
          [89.495, 25.720],
        ],
      ],
    },
  },
  {
    id: "disaster_dharla_surge",
    name: "Dharla-Dudhkumar Confluence Surge Zone",
    type: "flood",
    severity: "medium",
    headline: {
      en: "Flash River Swell & Embankment Pressure Advisory",
      bn: "ধরলা ও দুধকুমার নদীর পানি বৃদ্ধি ও বাঁধ সতর্কতা",
    },
    detail: {
      en: "Combined tributary discharge causing water levels to reach 0.45m below danger line. Soil saturation index at 92%.",
      bn: "উজানের অববাহিকা থেকে পানি দ্রুত নামায় নদীসংলগ্ন কৃষি জমি প্লাবিত হওয়ার উপক্রম হয়েছে। বাঁধ ও নিকাশী ব্যবস্থার ওপর নজর রাখা হচ্ছে।",
    },
    affectedBlocks: ["blk_kurigram_08", "blk_kurigram_05"],
    areaHectares: 9400,
    estFarmersAffected: 2150,
    keyMetricLabel: "Saturation Index",
    keyMetricValue: "92% (Warning)",
    centroid: [89.695, 25.885],
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [89.650, 25.845],
          [89.695, 25.860],
          [89.735, 25.885],
          [89.745, 25.925],
          [89.720, 25.955],
          [89.675, 25.940],
          [89.645, 25.905],
          [89.638, 25.865],
          [89.650, 25.845],
        ],
      ],
    },
  },
];
