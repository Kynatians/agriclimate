// lib/crops/knowledge-base.ts
// Curated regional crop agronomic dataset per tech spec §4, §6.4 and product doc §4.2

import { CropKnowledge } from "@/lib/dal/types";

export const CROP_KNOWLEDGE_BASE: CropKnowledge[] = [
  {
    id: "rice_boro",
    name: { en: "Boro Rice (BRRI dhan29)", bn: "বোরো ধান (ব্রি ধান২৯)" },
    category: "grain",
    soilMoisture: { min: 35.0, max: 48.0 },
    temperature: { min: 22.0, max: 32.0 },
    waterRequirementMm: 1200,
    solarMJ: 18.5,
    daysToHarvest: { early: 140, standard: 155, late: 165 },
    marketDemand: "high",
    roiPerHectare: { min: 580, max: 820 },
    notes: {
      en: "High yielding irrigated winter paddy; requires continuous shallow water depth.",
      bn: "উচ্চ ফলনশীল সেচ নির্ভর বোরো ধান; চারার বৃদ্ধিতে নিয়মিত হালকা পানির স্তর প্রয়োজন।"
    }
  },
  {
    id: "rice_aman",
    name: { en: "T. Aman Rice (BRRI dhan49)", bn: "রোপা আমন ধান (ব্রি ধান৪৯)" },
    category: "grain",
    soilMoisture: { min: 32.0, max: 45.0 },
    temperature: { min: 24.0, max: 34.0 },
    waterRequirementMm: 950,
    solarMJ: 17.0,
    daysToHarvest: { early: 125, standard: 135, late: 145 },
    marketDemand: "high",
    roiPerHectare: { min: 480, max: 710 },
    notes: {
      en: "Rainfed monsoon paddy; vulnerable to late-season dry spells.",
      bn: "বৃষ্টি নির্ভর রোপা আমন; মৌসুমের শেষে খরা প্রবণতায় সম্পূরক সেচ জরুরি।"
    }
  },
  {
    id: "rice_aus",
    name: { en: "Aus Rice (BRRI dhan48)", bn: "আউশ ধান (ব্রি ধান৪৮)" },
    category: "grain",
    soilMoisture: { min: 28.0, max: 40.0 },
    temperature: { min: 25.0, max: 35.0 },
    waterRequirementMm: 650,
    solarMJ: 19.0,
    daysToHarvest: { early: 100, standard: 110, late: 120 },
    marketDemand: "medium",
    roiPerHectare: { min: 380, max: 540 },
    notes: {
      en: "Early summer crop; tolerant to moderate dry spells during vegetative stage.",
      bn: "স্বল্পমেয়াদী প্রাক-খরিপ ধান; মাঝারী খরা সহনশীল।"
    }
  },
  {
    id: "wheat_kanchan",
    name: { en: "Wheat (BARI Gom-33)", bn: "গম (বারি গম-৩৩)" },
    category: "grain",
    soilMoisture: { min: 22.0, max: 32.0 },
    temperature: { min: 16.0, max: 25.0 },
    waterRequirementMm: 350,
    solarMJ: 16.5,
    daysToHarvest: { early: 105, standard: 112, late: 120 },
    marketDemand: "high",
    roiPerHectare: { min: 420, max: 620 },
    notes: {
      en: "Blast resistant zinc-enriched wheat; ideal for post-monsoon dry soils.",
      bn: "ব্লাস্ট রোগ প্রতিরোধী ও জিংকসমৃদ্ধ আধুনিক জাত; আমন পরবর্তী শুকনো জমিতে উপযোগী।"
    }
  },
  {
    id: "maize_hybrid",
    name: { en: "Hybrid Maize (BARI Bhutta-9)", bn: "হাইব্রিড ভুট্টা (বারি ভুট্টা-৯)" },
    category: "grain",
    soilMoisture: { min: 24.0, max: 34.0 },
    temperature: { min: 20.0, max: 30.0 },
    waterRequirementMm: 500,
    solarMJ: 20.0,
    daysToHarvest: { early: 130, standard: 145, late: 155 },
    marketDemand: "high",
    roiPerHectare: { min: 650, max: 950 },
    notes: {
      en: "Extremely responsive to solar radiation; excellent cash grain for poultry feed.",
      bn: "সূর্যালোক সংবেদনশীল ও লাভজনক রবি শস্য; পোল্ট্রি শিল্পের জন্য উচ্চ চাহিদাসম্পন্ন।"
    }
  },
  {
    id: "jute_tossa",
    name: { en: "Tossa Jute (O-9897)", bn: "তোষা পাট (ও-৯৮৯৭)" },
    category: "cash",
    soilMoisture: { min: 30.0, max: 42.0 },
    temperature: { min: 26.0, max: 36.0 },
    waterRequirementMm: 800,
    solarMJ: 18.0,
    daysToHarvest: { early: 110, standard: 120, late: 130 },
    marketDemand: "high",
    roiPerHectare: { min: 520, max: 760 },
    notes: {
      en: "Golden fiber; thrives in alluvial char silt soils during humid summer.",
      bn: "সোনালী আঁশ; ব্রহ্মপুত্র ও তিস্তার পলিমাটিতে চমৎকার ফলন দেয়।"
    }
  },
  {
    id: "mustard_tori",
    name: { en: "Mustard (BARI Sarisha-14)", bn: "সরিষা (বারি সরিষা-১৪)" },
    category: "cash",
    soilMoisture: { min: 20.0, max: 30.0 },
    temperature: { min: 14.0, max: 24.0 },
    waterRequirementMm: 220,
    solarMJ: 16.0,
    daysToHarvest: { early: 75, standard: 82, late: 88 },
    marketDemand: "high",
    roiPerHectare: { min: 390, max: 580 },
    notes: {
      en: "Short duration oilseed; fits snugly into the Aman-Boro crop rotation window.",
      bn: "স্বল্পকালীন তেল ফসল; আমন ও বোরোর মধ্যবর্তী সময়ে চাষের উপযুক্ত।"
    }
  },
  {
    id: "lentil_bari",
    name: { en: "Lentil (BARI Masur-8)", bn: "মসুর ডাল (বারি মসুর-৮)" },
    category: "legume",
    soilMoisture: { min: 18.0, max: 28.0 },
    temperature: { min: 15.0, max: 24.0 },
    waterRequirementMm: 200,
    solarMJ: 15.5,
    daysToHarvest: { early: 95, standard: 105, late: 112 },
    marketDemand: "high",
    roiPerHectare: { min: 460, max: 680 },
    notes: {
      en: "Drought hardy pulse fixing soil nitrogen; requires low input irrigation.",
      bn: "মাটির নাইট্রোজেন বৃদ্ধিকারী পুষ্টিকর ডাল ফসল; কম সেচেও নির্ভরযোগ্য ফলন দেয়।"
    }
  },
  {
    id: "potato_cardinal",
    name: { en: "Potato (Cardinal/Diamant)", bn: "আলু (কার্ডিনাল/ডায়মন্ড)" },
    category: "vegetable",
    soilMoisture: { min: 25.0, max: 35.0 },
    temperature: { min: 16.0, max: 24.0 },
    waterRequirementMm: 400,
    solarMJ: 17.0,
    daysToHarvest: { early: 85, standard: 95, late: 105 },
    marketDemand: "high",
    roiPerHectare: { min: 900, max: 1400 },
    notes: {
      en: "High commercial value winter tuber; requires well-drained sandy loam soil.",
      bn: "উচ্চ মুনাফাযুক্ত প্রধান শীতকালীন ফসল; সুনিষ্কাশিত বেলে দোআঁশ মাটিতে ভালো হয়।"
    }
  },
  {
    id: "chili_hot",
    name: { en: "Green Chili (Bindu)", bn: "কাঁচা মরিচ (বিন্দু)" },
    category: "cash",
    soilMoisture: { min: 22.0, max: 32.0 },
    temperature: { min: 22.0, max: 32.0 },
    waterRequirementMm: 450,
    solarMJ: 19.0,
    daysToHarvest: { early: 70, standard: 90, late: 120 },
    marketDemand: "high",
    roiPerHectare: { min: 850, max: 1300 },
    notes: {
      en: "Prime char land cash crop; continuous pickings with high localized market value.",
      bn: "চরাঞ্চলের অন্যতম লাভজনক অর্থকরী ফসল; একাধিকবার সংগ্রহযোগ্য।"
    }
  },
  {
    id: "eggplant_brinjal",
    name: { en: "Brinjal / Eggplant (Uttara)", bn: "বেগুন (উত্তরা)" },
    category: "vegetable",
    soilMoisture: { min: 26.0, max: 36.0 },
    temperature: { min: 22.0, max: 30.0 },
    waterRequirementMm: 500,
    solarMJ: 17.5,
    daysToHarvest: { early: 75, standard: 90, late: 110 },
    marketDemand: "medium",
    roiPerHectare: { min: 620, max: 980 },
    notes: {
      en: "Year-round staple vegetable; needs steady soil moisture without water stagnation.",
      bn: "নিয়মিত ফলনশীল সবজি; পর্যাপ্ত আর্দ্রতা ও সুনিষ্কাশিত জমি আবশ্যক।"
    }
  },
  {
    id: "chickpea_chola",
    name: { en: "Chickpea (BARI Chola-9)", bn: "ছোলা (বারি ছোলা-৯)" },
    category: "legume",
    soilMoisture: { min: 16.0, max: 26.0 },
    temperature: { min: 15.0, max: 25.0 },
    waterRequirementMm: 180,
    solarMJ: 16.0,
    daysToHarvest: { early: 115, standard: 125, late: 135 },
    marketDemand: "medium",
    roiPerHectare: { min: 410, max: 600 },
    notes: {
      en: "Exceptional deep root drought resistance; thrives in residual moisture.",
      bn: "অত্যন্ত খরা সহনশীল গভীর মূলী ডাল; মাটির অবশিষ্ট রসে বেড়ে ওঠে।"
    }
  },
  {
    id: "groundnut_badam",
    name: { en: "Groundnut (BARI Chinabadam-8)", bn: "চীনাবাদাম (বারি চীনাবাদাম-৮)" },
    category: "cash",
    soilMoisture: { min: 20.0, max: 30.0 },
    temperature: { min: 22.0, max: 32.0 },
    waterRequirementMm: 350,
    solarMJ: 19.5,
    daysToHarvest: { early: 120, standard: 135, late: 145 },
    marketDemand: "high",
    roiPerHectare: { min: 550, max: 800 },
    notes: {
      en: "Char island sand-soil champion; stabilizes shifting silt soils.",
      bn: "চরাঞ্চলের বালুময় চরে উৎকৃষ্ট তৈলবীজ; বালুচর মাটির পুষ্টি বাড়ায়।"
    }
  },
  {
    id: "cabbage_green",
    name: { en: "Cabbage (Atlas-70)", bn: "বাঁধাকপি (অ্যাটলাস-৭০)" },
    category: "vegetable",
    soilMoisture: { min: 28.0, max: 38.0 },
    temperature: { min: 15.0, max: 22.0 },
    waterRequirementMm: 380,
    solarMJ: 15.0,
    daysToHarvest: { early: 65, standard: 75, late: 85 },
    marketDemand: "medium",
    roiPerHectare: { min: 700, max: 1050 },
    notes: {
      en: "Crisp winter vegetable; thrives under mild temperature and frequent light waterings.",
      bn: "জনপ্রিয় শীতকালীন সবজি; হালকা শীত ও নিয়মিত সেচে দ্রুত বৃদ্ধি পায়।"
    }
  },
  {
    id: "cauliflower_white",
    name: { en: "Cauliflower (Rupa)", bn: "ফুলকপি (রূপা)" },
    category: "vegetable",
    soilMoisture: { min: 28.0, max: 38.0 },
    temperature: { min: 16.0, max: 23.0 },
    waterRequirementMm: 400,
    solarMJ: 15.0,
    daysToHarvest: { early: 70, standard: 80, late: 90 },
    marketDemand: "high",
    roiPerHectare: { min: 750, max: 1150 },
    notes: {
      en: "High return curds; sensitive to temperature spikes during curd formation.",
      bn: "লাভজনক শীতকালীন কপি; কুঁড়ি গঠনের সময় অনুকূল ঠান্ডা আবহাওয়া প্রয়োজন।"
    }
  },
  {
    id: "tomato_roma",
    name: { en: "Tomato (BARI Tomato-14)", bn: "টমেটো (বারি টমেটো-১৪)" },
    category: "vegetable",
    soilMoisture: { min: 24.0, max: 34.0 },
    temperature: { min: 18.0, max: 26.0 },
    waterRequirementMm: 450,
    solarMJ: 17.0,
    daysToHarvest: { early: 90, standard: 105, late: 120 },
    marketDemand: "high",
    roiPerHectare: { min: 950, max: 1500 },
    notes: {
      en: "High yield firm fruits; excellent for local wholesale and distant urban markets.",
      bn: "উচ্চ ফলনশীল জাত; স্থানীয় বাজার ও দূরবর্তী জেলায় পরিবহনে টেকসই।"
    }
  },
  {
    id: "onion_taherpuri",
    name: { en: "Onion (Taherpuri / BARI Piaz-1)", bn: "পেঁয়াজ (তাহেরপুরী / বারি পেঁয়াজ-১)" },
    category: "cash",
    soilMoisture: { min: 22.0, max: 32.0 },
    temperature: { min: 16.0, max: 26.0 },
    waterRequirementMm: 350,
    solarMJ: 18.0,
    daysToHarvest: { early: 100, standard: 115, late: 130 },
    marketDemand: "high",
    roiPerHectare: { min: 1100, max: 1800 },
    notes: {
      en: "Essential spice crop with long storability and high domestic market demand.",
      bn: "সংরক্ষণযোগ্য প্রধান মসলা ফসল; দেশে সারা বছর প্রচুর চাহিদা থাকে।"
    }
  },
  {
    id: "garlic_desi",
    name: { en: "Garlic (BARI Roshun-2)", bn: "রসুন (বারি রসুন-২)" },
    category: "cash",
    soilMoisture: { min: 20.0, max: 30.0 },
    temperature: { min: 15.0, max: 25.0 },
    waterRequirementMm: 300,
    solarMJ: 17.0,
    daysToHarvest: { early: 120, standard: 135, late: 145 },
    marketDemand: "high",
    roiPerHectare: { min: 1000, max: 1650 },
    notes: {
      en: "Zero-tillage relay spice in rice stubbles; minimizes land preparation costs.",
      bn: "বিনা চাষে আমনের খড়ে রোপণযোগ্য অর্থকরী মসলা; উৎপাদন খরচ কম।"
    }
  },
  {
    id: "mungbean_bari",
    name: { en: "Mungbean (BARI Mung-6)", bn: "মুগ ডাল (বারি মুগ-৬)" },
    category: "legume",
    soilMoisture: { min: 22.0, max: 32.0 },
    temperature: { min: 24.0, max: 34.0 },
    waterRequirementMm: 280,
    solarMJ: 18.0,
    daysToHarvest: { early: 60, standard: 65, late: 72 },
    marketDemand: "high",
    roiPerHectare: { min: 480, max: 700 },
    notes: {
      en: "Ultra short duration summer pulse; enriches soil and produces high market value.",
      bn: "স্বল্পমেয়াদী প্রাক-খরিপ ডাল; মাটির জৈব শক্তি বাড়ায় ও ভালো দামে বিক্রি হয়।"
    }
  },
  {
    id: "sweet_potato",
    name: { en: "Orange-fleshed Sweet Potato (BARI SP-12)", bn: "মিষ্টি আলু (কমলা বারি মিষ্টি আলু-১২)" },
    category: "vegetable",
    soilMoisture: { min: 20.0, max: 30.0 },
    temperature: { min: 20.0, max: 30.0 },
    waterRequirementMm: 320,
    solarMJ: 18.5,
    daysToHarvest: { early: 105, standard: 120, late: 135 },
    marketDemand: "medium",
    roiPerHectare: { min: 450, max: 680 },
    notes: {
      en: "Vitamin A biofortified tuber; thrives in sandy riverbanks with minimal fertilizer.",
      bn: "ভিটামিন-এ সমৃদ্ধ পুষ্টিকর কন্দ ফসল; চরের বেলে মাটিতে সামান্য সারেও প্রচুর হয়।"
    }
  }
];

export function getCropById(id: string): CropKnowledge | undefined {
  return CROP_KNOWLEDGE_BASE.find((c) => c.id === id);
}
