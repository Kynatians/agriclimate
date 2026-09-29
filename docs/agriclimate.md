# AgriSentinel
## NASA Satellite-Powered Climate Intelligence Platform for Agricultural Resilience

**Document Type:** Product & Technical Planning Document
**Version:** 2.3
**Date:** September 2026
**Organization:** Kynatium Labs

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Market & Competitive Landscape](#3-market--competitive-landscape)
4. [Proposed Solution](#4-proposed-solution)
5. [NASA Data Sources & Technical Foundation](#5-nasa-data-sources--technical-foundation)
6. [Core Feature Modules](#6-core-feature-modules)
7. [Application Design & Interface Architecture](#7-application-design--interface-architecture)
8. [Technical Stack & System Design](#8-technical-stack--system-design)
9. [Accessibility & Inclusivity Design](#9-accessibility--inclusivity-design)
10. [Impact Projections](#10-impact-projections)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Executive Summary

Climate change has fundamentally disrupted agricultural production cycles globally, threatening farming economies across Asia, Africa, Latin America, and beyond. Long-term droughts, sudden flash floods, cyclones, and erratic rainfall patterns are destroying harvests, destabilizing food supply chains, and threatening rural livelihoods at scale.

**AgriSentinel** is a NASA satellite data-powered climate intelligence and early warning platform designed for two complementary user groups: smallholder farmers who need simple, actionable guidance; and agricultural extension officers who need deep analytical control. Rather than building two separate applications, AgriSentinel uses a **single unified application** with a **mode-switching architecture** — a persistent toggle that transitions between the Farmer View and the Officer Control Panel, sharing the same underlying data engine while presenting radically different interfaces optimised for each user's cognitive context and device capability.

The platform leverages NASA's orbital remote-sensing infrastructure — including MODIS, Landsat, SMAP, GPM, and POWER datasets — to deliver **block-level precision climate and soil intelligence** that ground-based weather station networks are structurally incapable of providing.

The platform's core value proposition:

- **Precision over proximity**: Satellite-derived data at field/block resolution (≤1 km²), eliminating dependence on distant weather stations.
- **Proactive over reactive**: AI-driven early warning systems for drought, flood, and cyclone events with 48–72 hour lead times.
- **Two modes, one truth**: Officers and farmers access the same data layer through interfaces built for their respective contexts, maintaining consistency without duplication.
- **Accessible by design**: SMS fallback, 2G-compatible, and fully localized in the user's language. A voice command button is included in the interface as a design placeholder indicating planned future capability.

---

## 2. Problem Statement

### 2.1 Climate Disruption of Agricultural Cycles

Global climate change has shattered the predictability of seasonal agricultural cycles. Farming communities that relied on monsoon patterns and temperature norms for generations now face:

- **Prolonged droughts** lasting weeks beyond historical norms, depleting root-zone soil moisture and triggering cascading crop failure.
- **Extreme short-duration rainfall events** producing flash floods, waterlogging, and topsoil erosion that destroy standing crops within hours.
- **Increased cyclone and extreme storm frequency** across tropical and subtropical agricultural zones, wiping out harvests and damaging irrigation infrastructure.
- **Irregular seasonal onset**, making seed sowing and harvest planning statistically unreliable.

These are no longer exceptional weather events. They are the new baseline.

### 2.2 The Irrigation & Soil Management Problem

Water management for crops has become a precision challenge without available precision tools:

- Different crop varieties and block microclimates require calibrated irrigation volumes that vary weekly.
- Soil moisture data at field level is entirely unavailable to most farmers in the region.
- Solar-powered irrigation pump assets are distributed inefficiently — not routed to the highest-deficit blocks.
- Over-irrigation and under-irrigation coexist in adjacent fields, both causing yield loss by different mechanisms.

### 2.3 Food Security & Economic Threat

For agrarian nations across South Asia, Southeast Asia, Sub-Saharan Africa, and Latin America — where agriculture represents a significant share of both GDP and rural employment — sustained crop failure produces cascading consequences:

- Household-level food insecurity and acute nutrition deficits.
- Rural income collapse and debt accumulation by smallholder families.
- Increased dependence on costly food imports, widening trade deficits.
- Internal migration pressure and long-term social instability.

This is not a marginal concern. It is one of the defining economic risks of the coming decade for agricultural Asia.

---

## 3. Market & Competitive Landscape

### 3.1 Existing Systems

Several platforms currently address portions of the agricultural climate intelligence space:

| Platform | Region | Primary Approach |
|---|---|---|
| **BAMIS** (Bangladesh Agrometeorological Information Service) | Bangladesh (regional example) | Ground station-based agro-weather data |
| **Weather4Farmers** | South Asia (regional example) | SMS-based weather advisory |
| **FFWC** (Flood Forecasting & Warning Centre) | Bangladesh (regional example) | Flood forecasting via hydrological models |
| **iFarmers** | Bangladesh (regional example) | Market price and agricultural input advisory |

### 3.2 Shared Limitations

Despite their utility, existing platforms share five critical structural weaknesses:

1. **Coarse spatial resolution**: Ground station data grids often represent 20–50 km² per reading. A specific village block, union, or farm field cannot be accurately characterized from that resolution. What is true for a district headquarters may be climatically irrelevant to a field 30 km away.

2. **Latency in real-time event detection**: Ground stations cannot capture sudden cloud movement, localized convective rainfall cells, or micro-scale weather events that develop within hours. Satellite sensors with sub-hourly revisit rates can.

3. **Smartphone and internet dependency**: Most app-based solutions assume a modern Android device and stable 4G connectivity — infrastructure absent across large parts of rural South Asia. When connectivity drops, the advisory disappears.

4. **Language and literacy barriers**: Existing platforms are often English-first or limited to one dominant regional language, excluding large farmer populations who speak minority or local languages. Voice navigation is absent from every major platform in this category.

5. **Reactive, not predictive**: Most alerts are dispatched when events are already underway or imminent. The 48–72 hour advance warning window consistently achievable through satellite modeling is not being utilized.

### 3.3 AgriSentinel's Differentiation

| Capability | BAMIS / Existing | AgriSentinel |
|---|---|---|
| Data resolution | District / 20–50 km² | Block / ≤1 km² |
| Data source | Ground weather stations | NASA orbital satellites |
| Real-time event detection | Hours to days lag | Sub-hourly (GPM/MODIS) |
| Drought early warning | 1–2 days | 7–10 days |
| Flood/cyclone warning lead | 12–24 hours | 48–72 hours |
| Offline capability | None | Full offline mode |
| Voice interface | None | Local language voice command + TTS (planned) |
| Soil moisture data | None | SMAP, block-level |
| Irrigation advisory | None | AI-routed pump scheduling |
| Crop input advisory | None | Satellite-derived compound recommendations |
| Officer control panel | Static reports | Real-time annotated dispatch |

---

## 4. Proposed Solution

**AgriSentinel** is a unified, dual-mode climate intelligence platform with the following components:

- A **single mobile and web application** with a mode switch — **Farmer View** and **Officer Control Panel** — within the same codebase and data layer.
- An **SMS alert system** for non-smartphone users who cannot access the app.
- A **voice command and TTS interface** embedded in the Farmer View for low-literacy accessibility.
- An **AI-powered crop calendar and soil analysis engine** running on multi-year NASA POWER time-series data.
- A **satellite-derived irrigation router** mapping soil moisture deficits to available solar pump assets.
- A **crop input intelligence engine** generating block-level compound and nutrient recommendations from NDVI and SMAP anomalies.

The unified app model is a deliberate architectural choice for a prototype context: it reduces build and maintenance overhead while allowing officers and farmers to share the same device, session, and data truth. Role assignment is handled at account registration. The mode toggle is always visible; switching is instant.

**Prototype Philosophy**: This prototype is built to demonstrate the concept, not to deliver production infrastructure. Where a full system would run live ML inference or real-time NLP, the prototype uses pre-analyzed historical data displayed as representative output. The interface, data layer design, and user flows are treated as production-quality — the goal is to make the idea fully legible and convincing. Features that are not implemented (voice STT/NLP, live ML inference) are present as clearly-labelled UI placeholders so evaluators understand the intended direction without mistaking scope for ambition.

---

## 5. NASA Data Sources & Technical Foundation

### 5.1 NASA Dataset Inventory

| Dataset | Platform | Parameters Derived | Use Case in AgriSentinel |
|---|---|---|---|
| **MODIS** (MOD11/MOD13) | Terra & Aqua | Land Surface Temperature, NDVI, Cloud Fraction | Drought stress, vegetation health, cloud tracking |
| **Landsat 8/9** (OLI/TIRS) | Landsat | NDVI, NDWI, LST, Soil Reflectance | Crop mapping, water body extent, soil composition |
| **SMAP** (L3/L4) | SMAP satellite | Surface & Root-zone Soil Moisture | Irrigation scheduling, drought/waterlogging detection |
| **GPM IMERG** | Multi-satellite | Precipitation rate, Rainfall accumulation | Flood risk, cyclone rainfall prediction, SPI computation |
| **NASA POWER** | Reanalysis product | Solar irradiance, Wind speed, Humidity, Temp, Precip | AI crop calendar, solar pump optimization |
| **FIRMS** (MODIS/VIIRS) | Terra/Aqua/SNPP | Active fire, Burned area extent | Crop fire loss detection and farmer alert |
| **SRTM DEM** | Shuttle Radar | Terrain elevation, Slope, Flow direction | Flood routing, catchment susceptibility modeling |

### 5.2 Data Pipeline Architecture

```
NASA Earthdata API / LAADS DAAC / GES DISC / NSIDC DAAC
          │
          ▼
   ┌─────────────────────────────┐
   │     Data Ingestion Layer    │
   │  Python · GDAL · xarray     │
   │  NetCDF/HDF5/GeoTIFF parse  │
   └────────────┬────────────────┘
                │
                ▼
   ┌─────────────────────────────┐
   │  Preprocessing & Tiling     │
   │  Block-level spatial grid   │
   │  (~500m tiles, union-level) │
   │  Reprojection → EPSG:4326   │
   └────────────┬────────────────┘
                │
                ▼
   ┌──────────────────────────────────┐
   │   Feature Store / Time-Series DB │
   │   PostGIS + TimescaleDB          │
   │   NDVI · SoilMoisture · Precip   │
   │   per block, per day             │
   └────────────┬─────────────────────┘
                │
                ▼
   ┌──────────────────────────────────┐
   │     AI / ML Analysis Engine      │
   │  Drought Index · Flood Score     │
   │  Crop Health · CWSI · SPI        │
   │  Crop Calendar · Pump Routing    │
   └──┬───────────┬───────────┬───────┘
      │           │           │
      ▼           ▼           ▼
  App API     SMS Engine   Alert Trigger
  (FastAPI)   (Dispatch)   (Push / IVR)
      │
      ▼
  Farmer View ↔ Officer Control Panel
  (Mode Switch — same app)
```

### 5.3 Key Derived Indices

**NDVI (Normalized Difference Vegetation Index)**
Derived from Landsat/MODIS Red and NIR bands. Quantifies vegetation density and crop health at block level. NDVI below seasonal baseline triggers crop stress flag.

**SPI (Standardized Precipitation Index)**
Derived from GPM IMERG accumulation data. Compares current precipitation totals to long-term monthly mean. SPI ≤ −1.0 triggers drought advisory; SPI ≤ −1.5 triggers drought warning.

**Soil Moisture Anomaly**
Derived from SMAP L3. Compares current surface and root-zone soil moisture to a 5-year rolling seasonal baseline. Flags both deficit (irrigation needed) and excess (waterlogging risk) zones.

**Flood Susceptibility Score (FSS)**
A composite index: GPM IMERG precipitation forecast (weight 0.4) + SMAP soil saturation ratio (weight 0.35) + SRTM terrain slope and flow accumulation (weight 0.25). Computed per block. FSS ≥ 0.7 triggers flood early warning.

**Crop Water Stress Index (CWSI)**
Combines MODIS land surface temperature with SMAP soil moisture and vapor pressure deficit from NASA POWER. Quantifies plant water stress severity on a 0–1 scale. CWSI > 0.6 triggers irrigation advisory.

---

## 6. Core Feature Modules

### Module 1: Real-Time Climate Monitoring

**Function**: Delivers current and 7-day forecast climate parameters at block level to both user modes.

**Data Sources**: MODIS, GPM IMERG, NASA POWER

**Key Outputs**:
- 7-day rainfall forecast with uncertainty bands.
- Land surface temperature map with anomaly overlay.
- Near-real-time cloud movement layer (30-minute MODIS composite).
- Seasonal deviation comparison: current conditions vs. 10-year monthly norms.

**Officer view**: Full spatial map with all layers toggleable. Data source labels on each layer. Block-level statistics panel on the right.

**Farmer view**: Simple card — today's weather, rain probability, temperature, and a plain-language soil condition summary in the user's configured language.

---

### Module 2: Drought & Flood Early Warning System

**Function**: Detects and forecasts drought stress and flood/cyclone events 48–72 hours in advance and dispatches multi-channel alerts.

**Data Sources**: SMAP (soil moisture), GPM IMERG (precipitation), NASA POWER (atmospheric), SRTM DEM (terrain)

**Detection Logic**:

- **Drought**: Soil moisture anomaly < −20% of seasonal baseline sustained over 5 days AND SPI ≤ −1.0 → drought advisory. CWSI > 0.7 on 3 consecutive readings → drought warning.
- **Flood**: FSS ≥ 0.7 with GPM forecast rainfall > 80mm/48h → flood warning. SMAP soil saturation > 90% combined with GPM forecast → waterlogging advisory.
- **Cyclone**: GPM detects convective organization with rotation signature + POWER wind shear anomaly → cyclone watch; escalates to warning as track and intensity solidify.

**Alert Delivery**:
- In-app push notification in the user's configured language.
- SMS alert dispatched to registered farmer phone numbers.
- IVR voice call broadcast for non-smartphone registrations.
- Officer panel alert feed with block-level severity map.

**Lead Time Targets**: 48–72 hours for flood and cyclone events; 7–10 days for drought trend warnings.

---

### Module 3: Smart Crop Mapping & Suitability Analysis

**Function**: Identifies optimal crop types and current crop health for each block.

**Data Sources**: Landsat NDVI/NDWI, SMAP soil moisture, MODIS LST, NASA POWER

**Outputs**:
- Block-level crop suitability map (rice, wheat, maize, lentils, vegetables, jute).
- NDVI-based current crop health status with trend (improving / stable / declining).
- Soil moisture adequacy index — blocks color-coded as surplus, adequate, or deficit.
- Recommended crop types for next sowing cycle based on projected soil and climate.

**Officer use**: Displayed as an interactive map canvas layer; blocks clickable to reveal full suitability breakdown.

**Farmer use**: "Your field is showing [health status]. Best crop to plant next: [crop name]." Delivered as a simple advisory card.

---

### Module 4: Crop Recommendation Engine

**Function**: Given a selected land block, recommends 5–7 crops best suited to its current soil, climate, and seasonal conditions — and for each crop, provides a structured advisory covering estimated ROI, market demand, days to harvest, optimal harvesting period, and a data-backed explanation of why it suits that specific land.

**No AI required.** The system has sufficient environmental and soil data to compute crop suitability entirely through deterministic rule-based scoring. Each candidate crop is scored against the block's measured parameters using agronomic thresholds sourced from established crop science literature. The highest-scoring crops are returned as the recommendation set.

**Data Sources**: SMAP soil moisture (L3/L4), MODIS Land Surface Temperature, Landsat NDVI + NDWI, NASA POWER (temperature range, solar irradiance, rainfall), internal crop knowledge base

---

#### 4.1 Suitability Scoring Logic

For each candidate crop in the knowledge base, a **Crop Suitability Score (CSS)** is computed per block by evaluating five input dimensions against that crop's known agronomic requirements:

| Input Dimension | Data Source | What Is Evaluated |
|---|---|---|
| Soil moisture | SMAP L3/L4 | Current root-zone moisture vs. crop's optimal moisture range |
| Soil temperature | MODIS LST (calibrated) | Current land surface temperature vs. crop's germination + growth temp range |
| Rainfall pattern | NASA POWER + GPM | Seasonal rainfall total and distribution vs. crop's water requirement |
| Solar irradiance | NASA POWER | Average daily solar radiation vs. crop's light requirement |
| Vegetation index | Landsat NDVI | Previous-cycle NDVI trend used to infer soil organic condition and field recovery state |

Each dimension produces a sub-score (0–1). The five sub-scores are weighted and summed to produce the CSS (0–100). Crops are ranked by CSS; the top 5–7 are returned as the recommendation set.

**Weighting defaults** (adjustable per crop class):

| Dimension | Default Weight |
|---|---|
| Soil moisture match | 30% |
| Temperature match | 25% |
| Rainfall pattern match | 20% |
| Solar irradiance match | 15% |
| NDVI / field condition | 10% |

---

#### 4.2 Crop Knowledge Base

A structured internal dataset covering each supported crop with the following fields:

- Optimal soil moisture range (% volumetric water content)
- Optimal temperature range (min / max °C for germination and growth)
- Water requirement per growth stage (mm)
- Solar irradiance requirement (MJ/m²/day)
- Days to harvest (by variety class: early / standard / late)
- Seasonal suitability (which planting windows per hemisphere / climate zone)
- Market demand tier (high / medium / low — updated periodically from agricultural market data)
- Estimated ROI range (per hectare, by input cost class)
- Region-specific notes (soil type affinity, common disease risk in wet/dry conditions)

This knowledge base is maintained as a structured JSON/database table and is the sole non-satellite input into the recommendation engine. It is region-agnostic and extensible — new crops and regional varieties can be added without changes to the scoring logic.

---

#### 4.3 Per-Crop Output Card

For each of the 5–7 recommended crops, the system generates a structured advisory card:

```
┌──────────────────────────────────────────────────────┐
│  🌾  Crop Name          CSS Score: 87 / 100          │
│──────────────────────────────────────────────────────│
│  ⏱  Days to Harvest     90–110 days                  │
│  📅  Best Harvest Window Nov 15 – Dec 10              │
│  💰  Estimated ROI       ~$420–$560 / hectare         │
│  📈  Market Demand       High (regional + export)     │
│──────────────────────────────────────────────────────│
│  ✅  Why this land?                                   │
│  Soil moisture at 38% VWC — within optimal range     │
│  (35–45%). Avg temp 26°C — ideal for germination.    │
│  7-day rainfall forecast (48mm) covers early-stage   │
│  water requirement without irrigation. NDVI trend    │
│  stable — field has adequate recovery from last      │
│  cycle.                                              │
│──────────────────────────────────────────────────────│
│  ⚠️  Risk Note                                        │
│  Soil moisture slightly below lower bound in Block   │
│  sub-zone 3. Supplemental irrigation recommended     │
│  in first 2 weeks.                                   │
└──────────────────────────────────────────────────────┘
```

The "Why this land?" field is auto-generated from the scoring breakdown — it reads the highest-contributing sub-scores and translates them into plain-language justifications in the user's configured language. This is string interpolation from pre-written templates, not LLM generation.

---

#### 4.4 Interface Integration

**Farmer View**: Accessible via a "What to plant?" card on the Home screen or the Calendar tab. Farmer selects their registered block; the system returns a ranked list of crop cards. Each card is collapsible — the farmer sees the crop name and CSS score by default, taps to expand for full detail.

**Officer Panel**: Available as a map layer ("Crop Recommendation Overlay") — each block on the canvas is colored by its top-recommended crop category (grain / legume / vegetable / cash crop). Clicking a block opens the full ranked recommendation list in the right data panel. Officers can use this layer to identify which blocks in their district are aligned for which crops in a given season, enabling coordinated input distribution and market-linkage planning.

**Prototype note**: The crop knowledge base will be pre-populated with a curated set of 20–30 common crops for the pilot region. The scoring engine runs entirely on pre-fetched block data — no live satellite API calls are made at query time. Results are computed on data already stored in the feature store.

---

### Module 5: Crop Calendar (Historical Data Demonstration)

**Function**: Demonstrates what a risk-adjusted crop calendar looks like by surfacing pre-analyzed historical NASA POWER data as representative "predictions." The prototype does not run a live ML model — instead, it replays recorded seasonal data from past years to illustrate what the full system would produce.

**Prototype Approach**: The app is intentionally set in the past. A curated dataset of NASA POWER historical records (temperature, rainfall, solar irradiance, humidity) for a set of pilot blocks is pre-processed offline. These analyzed records are stored as static advisories and displayed as if they are live predictions. The goal is to communicate what the concept makes possible — not to run inference in real time.

**Data Sources**: NASA POWER historical daily records (pre-downloaded, pre-analyzed)

**What Is Displayed** (as pre-loaded advisories, not live computation):
- Optimal sowing date windows with associated risk labels (e.g., "Sow Oct 12–18 — historically low-risk window").
- Seasonal irrigation schedule by crop type and growth stage.
- Harvest window range based on historical climate patterns.
- Historical heat stress and late-rain event flags per growth stage.

> **Prototype Note**: In a production system, this module would be powered by an LSTM or Prophet time-series model trained on multi-year NASA POWER records with real-time SMAP and GPM inputs. For this prototype, the output format and UI are identical — only the data source (pre-recorded vs. live inference) differs. This distinction is intentional: the prototype demonstrates the interface and concept fidelity, not ML infrastructure.

---

### Module 6: Precision Irrigation Intelligence & Solar Pump Routing

**Function**: Identifies blocks with soil moisture deficit and recommends targeted irrigation, dynamically routing registered solar pump assets to highest-priority zones.

**Data Sources**: SMAP L3/L4, Landsat NDWI, MODIS CWSI

**Logic**:
1. SMAP soil moisture deficit per block computed relative to crop-specific optimal range.
2. CWSI overlaid to confirm plant-level water stress.
3. Each block receives a Deficit Severity Score (0–100).
4. Registered solar irrigation pumps within a defined radius are retrieved from the asset registry.
5. Routing algorithm (shortest path + highest deficit priority) generates a deployment sequence.
6. Farmer or officer receives routing instructions with estimated coverage time.

**Output**: Irrigation priority heatmap + sequential pump deployment schedule, updated daily.

---

### Module 7: Crop Input Intelligence (Compound & Nutrient Advisor)

**Function**: Identifies what organic or chemical compounds are required for specific crops in specific blocks based on satellite-derived soil and vegetation stress indicators, and recommends type, application method, and quantity per unit area.

**Data Sources**: NDVI anomaly (Landsat), SMAP soil moisture anomaly, MODIS LST, local crop-type registry

**Advisory Logic**:

| Detected Condition | Likely Deficiency | Recommended Compound Class | Dosage Basis |
|---|---|---|---|
| NDVI well below baseline | Nitrogen deficiency | Urea / organic compost | Per hectare, per growth stage |
| NDVI low + soil moisture adequate | Phosphorus or iron deficiency | DAP / micronutrient mix | Per hectare |
| SMAP moisture excess | Nitrogen leaching risk | Split-dose nitrogen; potassium-based compound | Fractionated schedule |
| SMAP moisture deficit | Poor water retention | Organic mulch; potassium silicate | Per hectare |
| High CWSI + high LST | Heat/drought stress | Bio-stimulants; seaweed extract | Application at dusk |

**Output**: Block-level compound advisory card — compound name, organic/synthetic classification, application method, quantity per unit area. Delivered in the user's configured language. Flagged as advisory, not a substitute for agronomist consultation.

---

## 7. Application Design & Interface Architecture

### 7.1 Unified App with Mode Switch

AgriSentinel is a single application — one codebase, one data session, one login — that presents two distinct interfaces via a persistent **mode toggle** in the top navigation bar. The toggle is always accessible regardless of the current screen.

```
┌─────────────────────────────────────────────────────────┐
│  🌾 AgriSentinel          [ FARMER | OFFICER ]   🔔  👤 │
└─────────────────────────────────────────────────────────┘
```

- **FARMER** is the default mode on first launch.
- **OFFICER** mode requires an officer-role account. If a farmer-role account taps the toggle, they see a permission prompt explaining the mode is for registered officers only.
- Switching modes is instant — no reload, no separate login. The data layer is shared; only the presentation layer changes.
- On a shared device (e.g., a community kiosk), the last active mode and profile are preserved per session.

---

### 7.2 Farmer View — Minimal, Action-Oriented Interface

The Farmer View is designed for clarity, low cognitive load, and rapid information access under field conditions — typically a small Android screen, direct sunlight, and limited time.

#### Design Principles

- **One screen, one decision**: Each screen presents a single piece of actionable information. No data overload.
- **Large text, high contrast**: Minimum 18sp body text. Color contrast ratio ≥ 4.5:1. Designed for outdoor visibility.
- **Local language-first**: All content rendered in the user's configured language by default. Language is selected at registration and changeable in settings.
- **Icon + text pairing**: Every data point is paired with an icon so low-literacy users can recognize content type without reading.
- **Voice-always**: A persistent microphone button is present on every screen. Tap it to speak; the app reads the current screen aloud.

#### Farmer View — Screen Layout

```
┌───────────────────────────────────────┐
│  🌾 AgriSentinel      [FARMER|Officer]│
│─────────────────────────────────────  │
│  📍 [Region], [Block Name] — Tue 27 Sep│
│                                       │
│  ┌───────────┐  ┌───────────────────┐ │
│  │ 🌦 Weather│  │ 🌱 Crop Condition │ │
│  │ 28°C      │  │ Moderate stress   │ │
│  │ Rain: 40% │  │ Water deficit     │ │
│  └───────────┘  └───────────────────┘ │
│                                       │
│  ┌───────────────────────────────────┐│
│  │ ⚠️  ALERT: Heavy rain expected   ││
│  │  Wed 29 Sep — 120mm in 6 hours   ││
│  │  [View Details]  [Dismiss]        ││
│  └───────────────────────────────────┘│
│                                       │
│  ┌───────────┐  ┌───────────────────┐ │
│  │ 💧 Irrig. │  │ 🌿 Compound Tip  │ │
│  │ Needed    │  │ Apply urea 50kg/ha│ │
│  │ Today     │  │ before next rain  │ │
│  └───────────┘  └───────────────────┘ │
│                                       │
│  📅 Crop Calendar  →                  │
│  Sow boro rice: Oct 14–19 (83% safe)  │
│                                       │
│─────────────────────────────────────  │
│  🏠 Home   🗺 Map   📅 Calendar  🎤  │
└───────────────────────────────────────┘
```

#### Farmer View — Navigation Tabs

| Tab | Content |
|---|---|
| **Home** | Current weather card + active alerts + top soil condition |
| **Map** | Simplified block map centered on registered farm. No data layers — just block outline, color-coded current status (green / yellow / red). Tap block → see condition summary. |
| **Calendar** | AI crop calendar. Sowing recommendation + irrigation schedule for registered crops. |
| **Alerts** | History of all alerts received. Badge count on icon. |
| **Voice (🎤)** | Persistent floating button on all screens. **UI placeholder only in this prototype** — button is present and tappable but has no STT/NLP implementation. Indicates planned voice query capability for production. |

#### Farmer View — Voice Button (Prototype Placeholder)

A persistent 🎤 button is present on every Farmer View screen and is included in the prototype UI. **It has no backend implementation in this build.** Tapping it in the prototype shows a static "Coming Soon" state or a disabled microphone animation.

In a production system, this button would trigger speech-to-text recognition in the user's configured language (Android SpeechRecognizer API) and route voice queries to the data layer — for example:

| Intended Command | Intended Response |
|---|---|
| "আমার মাঠের কী অবস্থা?" | Reads current block status aloud |
| "কবে বৃষ্টি হবে?" | Gives rainfall forecast for next 7 days |
| "কতটুকু সেচ দিতে হবে?" | Reads irrigation advisory |
| "কোন সার দিতে হবে?" | Reads compound recommendation |
| "বন্যার কোনো সতর্কতা আছে?" | Reads active flood warnings |

The button's placement and visual design are fully implemented. The STT, NLP intent parsing, and TTS response pipeline are out of scope for the prototype.

---

### 7.3 Officer Control Panel — Three-Column Command Interface

The Officer Control Panel is a full-screen, information-dense interface designed for desktop and large-tablet use by agricultural extension officers. It follows a **left-center-right three-column layout** reminiscent of a professional GIS control environment.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  🌾 AgriSentinel                          [Farmer | OFFICER]           🔔 15  👤 Officer │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌──────────────────┐  ┌──────────────────────────────────────────┐  ┌──────────────┐ │
│  │  CONTROL PANEL   │  │              MAP CANVAS                  │  │  DATA PANEL  │ │
│  │  (Left Column)   │  │          (Center — primary view)         │  │ (Right Col.) │ │
│  │                  │  │                                          │  │              │ │
│  │  [Data Layers]   │  │   [Interactive satellite map — PostGIS]  │  │  District:   │ │
│  │  ─────────────   │  │                                          │  │  [District]  │ │
│  │  ☑ NDVI Layer    │  │   Block polygons rendered as choropleth  │  │  Blocks: 84  │ │
│  │  ☑ Soil Moisture │  │   per selected layer.                    │  │              │ │
│  │  ☐ Flood Risk    │  │                                          │  │  ─────────── │ │
│  │  ☐ Crop Health   │  │   On hover: tooltip with block name,     │  │  NDVI avg:   │ │
│  │  ☐ Precip Fcst   │  │   current index value, data source,      │  │  0.42 ↓      │ │
│  │  ☐ Pump Routing  │  │   last update timestamp.                 │  │  (−0.08 vs   │ │
│  │  ☐ Fire Events   │  │                                          │  │   baseline)  │ │
│  │                  │  │   On click: opens block detail drawer    │  │              │ │
│  │  [Actions]       │  │   from right panel.                      │  │  Soil Moist: │ │
│  │  ─────────────   │  │                                          │  │  34% ↓       │ │
│  │  📤 Send Alert   │  │   ┌──────────────────────────────────┐   │  │  (−12% anom) │ │
│  │  📋 Gen. Report  │  │   │ LAYER: Soil Moisture (SMAP L3)   │   │  │              │ │
│  │  💬 SMS Dispatch │  │   │ Source: NASA SMAP · 27 Sep 2026  │   │  │  Active Alrt:│ │
│  │  🔁 Refresh Data │  │   │ Res: 500m · Last pull: 08:42 UTC │   │  │  ⚠️ 3 flood  │ │
│  │                  │  │   └──────────────────────────────────┘   │  │  ⚠️ 1 drought│ │
│  │  [Filters]       │  │                                          │  │              │ │
│  │  ─────────────   │  │   Legend:                                │  │  Farmers:    │ │
│  │  Severity: ALL ▼ │  │   ████ High  ████ Mid  ████ Low  ░ N/D  │  │  2,847 reg.  │ │
│  │  Crop:   Rice ▼  │  │                                          │  │              │ │
│  │  Period: 7d   ▼  │  │                                          │  │  [Block Det] │ │
│  │                  │  │                                          │  │  ─────────── │ │
│  │  [Alerts Feed]   │  │                                          │  │  Select a    │ │
│  │  ─────────────   │  │                                          │  │  block on    │ │
│  │  🔴 Block 14     │  │                                          │  │  the map to  │ │
│  │  Flood risk HIGH │  │                                          │  │  view detail │ │
│  │  [Annotate→SMS]  │  │                                          │  │              │ │
│  │                  │  │                                          │  │              │ │
│  │  🟡 Block 22     │  │                                          │  │              │ │
│  │  Drought watch   │  │                                          │  │              │ │
│  │  [Annotate→SMS]  │  │                                          │  │              │ │
│  └──────────────────┘  └──────────────────────────────────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 7.3.1 Left Column — Control Panel

The left column is the officer's action sidebar. It is organized into four sections:

**Data Layer Toggles**
Checkboxes that add or remove layers on the map canvas. Each layer toggles independently. Active layers are visually highlighted; inactive ones are greyed out. Layers available:

| Layer | Data Source | Visual Representation |
|---|---|---|
| NDVI | Landsat / MODIS | Green-to-brown choropleth |
| Soil Moisture | SMAP L3 | Blue-to-orange choropleth |
| Flood Risk Score | GPM + SMAP + DEM | Red severity zones |
| Crop Health Index | MODIS + NDVI anomaly | Traffic-light coloring |
| Precipitation Forecast | GPM IMERG | Rainfall intensity heatmap |
| Pump Routing | Asset registry + SMAP | Pump icons + routing lines |
| Fire Events | FIRMS (MODIS/VIIRS) | Orange fire point markers |

**Action Buttons**

| Button | Function |
|---|---|
| 📤 Send Alert | Opens alert composition modal — select blocks, write message, choose channels (push / SMS / IVR) |
| 📋 Generate Report | Creates PDF district report for current date range and selected layers |
| 💬 SMS Dispatch | Quick SMS dispatch to all registered farmers in selected blocks |
| 🔁 Refresh Data | Forces data pull from NASA API for current viewport |

**Filters**
Dropdowns to filter the map and alerts feed by: alert severity (all / high / medium / low), crop type (all / rice / wheat / maize / vegetables), and time period (24h / 7d / 30d).

**Alert Feed**
A live-updating list of active alerts for the officer's assigned district. Each alert card shows: block name, alert type, severity badge, timestamp, and an "Annotate → SMS" button that opens the annotation and dispatch workflow.

#### 7.3.2 Center Column — Map Canvas

The map canvas is the primary workspace of the Officer Control Panel. It is a full-height, interactive satellite map (Mapbox GL JS / Maplibre) with the following properties:

**Base Map**
- Satellite imagery base layer with administrative boundary overlays (district, upazila, union, block).
- Block polygons rendered as a choropleth on top, colored according to the active data layer.
- Block boundaries remain visible as outlines even when a data layer is active.

**Data Source Label**
A persistent label at the bottom of the canvas showing the active layer's name, data source, spatial resolution, and last update timestamp (e.g., "Soil Moisture · NASA SMAP L3 · 500m · Updated: 27 Sep 2026, 08:42 UTC").

**On-Hover Tooltip**
When the cursor hovers over any block, a tooltip appears showing:
- Block name and administrative hierarchy (e.g., Block 14 · [Sub-district] · [District])
- Active layer value for that block (e.g., Soil Moisture: 31% · Anomaly: −14%)
- Secondary indices (e.g., NDVI: 0.38, CWSI: 0.61)
- Data source and last update time
- Number of registered farmers in the block

**On-Click Block Detail Drawer**
Clicking a block locks the tooltip and expands the right panel into a full block detail view (see right column below). A selected block is highlighted with a blue border.

**Map Controls**
- Zoom in/out
- Full-screen toggle
- Layer opacity slider (per active layer)
- Draw selection tool (to select multiple blocks for bulk alert dispatch)
- Screenshot export (exports map canvas as PNG for report attachment)

**Visual Design Notes**
- Color scales use colorblind-safe palettes (CARTO's "ArmyRose" for diverging, "Sunset" for sequential).
- Choropleth transitions animate smoothly (300ms) when switching layers.
- Fire event markers pulse with a subtle animation to draw attention without being distracting.
- Cyclone track overlays (when active) show projected path cone with confidence shading.

#### 7.3.3 Right Column — Data Panel

In default state, the right panel shows district-wide aggregate statistics:

- District name and total block count.
- Current NDVI average and anomaly vs. baseline.
- Current soil moisture average and anomaly.
- Active alert count by type.
- Registered farmer count.

When a block is clicked on the map canvas, the right panel transitions into a **Block Detail View**:

```
┌───────────────────────────┐
│  Block 14 · [Sub-district]│
│  [District]               │
│─────────────────────────── │
│  🌱 NDVI: 0.38            │
│  Trend: ↓ Declining       │
│  Baseline: 0.51           │
│                            │
│  💧 Soil Moisture: 31%    │
│  Status: Deficit (−14%)   │
│  Root zone: 28%           │
│                            │
│  🌧 Precip (7d): 18mm     │
│  Forecast (7d): 142mm     │
│  Flood FSS: 0.74 ⚠️        │
│                            │
│  🌡 LST: 34.2°C           │
│  CWSI: 0.63 (Stressed)    │
│                            │
│  🌾 Crops: Aman rice      │
│  Stage: Vegetative        │
│  Health: Moderate         │
│                            │
│  👥 Farmers: 186          │
│  Pump assets: 2           │
│                            │
│  ─────────────────────    │
│  Compound Advisory:       │
│  Apply 60kg/ha urea +     │
│  30kg/ha DAP before       │
│  next rainfall event.     │
│                            │
│  ─────────────────────    │
│  ✏️  Add Officer Note     │
│  [text area]              │
│                            │
│  [📤 Send SMS to 186]     │
│  [📋 Add to Report]       │
└───────────────────────────┘
```

#### 7.3.4 Officer Report & Annotated SMS Dispatch

The auto-report and SMS dispatch workflow is central to the Officer Panel's value as a field coordination tool.

**Auto-Generated Reports**
- The system generates a daily district summary report at 06:00 local time.
- Content: NDVI heatmap, soil moisture status, active alerts with severity, irrigation priority ranking, compound advisories, registered farmer count per block.
- Format: PDF (printable A4) + on-screen dashboard version.
- Officer receives an in-app notification when the report is ready.

**Annotated SMS Dispatch Workflow**
1. Officer receives an alert in the alert feed or reviews the auto-report.
2. Officer taps **[Annotate → SMS]** on an alert or block.
3. A modal opens showing the system-generated alert text in the officer's configured language.
4. Officer adds a personal note (e.g., field observation, local context, action instruction).
5. The combined message (system data + officer annotation) is previewed.
6. Officer selects target: all farmers in block / farmers with specific crops / custom selection.
7. SMS is dispatched via the gateway. Delivery receipt is logged.

This workflow ensures that satellite-derived data intelligence is supplemented by local human expertise before it reaches farmers — closing the gap between remote-sensing output and on-the-ground relevance.

---

### 7.4 Shared UI Components (Both Modes)

| Component | Description |
|---|---|
| **Notification Bell** | Badge count of unread alerts. Shared across both modes. |
| **Mode Toggle** | Always visible in the top nav. Transitions between Farmer View and Officer Control Panel. Permission-gated for officer mode. |
| **Profile / Settings** | Account info, language setting (any supported language), notification preferences, registered block assignment. |
| **Offline Indicator** | Yellow banner when device is offline. Last sync timestamp displayed. Cached data is used. |

---

### 7.5 App Version Strategy (Prototype Phase)

For the prototype build, the Officer Control Panel is optimized for **tablet (≥10 inch) and web browser** use. On a phone-sized screen, the Officer Panel collapses the three columns into a **tab-based layout**:

- Tab 1: Control (layers + filters + alert feed)
- Tab 2: Map Canvas (full-screen map)
- Tab 3: Data Panel (stats + block detail)

The Farmer View is optimized for **Android phones (5–6.5 inch screens)** and also works on low-end tablets.

---

## 8. Technical Stack & System Design

### 8.1 Backend

| Layer | Technology |
|---|---|
| Primary language | Python 3.11+ |
| API framework | FastAPI |
| Satellite data processing | GDAL, Rasterio, NumPy, xarray, pyproj |
| ML/AI models | scikit-learn, PyTorch (LSTM for crop calendar), Prophet (seasonal forecasting) |
| Index computation | Custom Python modules per index (SPI, FSS, CWSI, NDVI anomaly) |
| Task scheduling | Celery + Redis (hourly GPM pulls, daily NDVI/SMAP processing) |
| Spatial database | PostgreSQL 15 + PostGIS 3 |
| Time-series database | TimescaleDB (hypertables per block × dataset) |
| Object storage | MinIO (self-hosted) or AWS S3 (raster tiles, report PDFs) |
| Authentication | JWT-based; role fields: `farmer`, `officer`, `admin` |

### 8.2 Frontend

| Layer | Technology |
|---|---|
| Mobile app | React Native (Android-first; iOS secondary) |
| Web interface (Officer Panel) | Next.js 14 (App Router) |
| Map canvas | Maplibre GL JS (open-source Mapbox alternative) |
| Tile server | Martin (PostGIS MVT tile server) |
| Offline storage | MMKV (React Native) / IndexedDB (web) |
| State management | Zustand |
| Voice interface | **Not implemented in prototype** — 🎤 button is a UI placeholder; production would use Expo Speech (TTS) + React Native Voice (STT) |
| UI component library | Custom design system; NativeBase base for RN |

### 8.3 Communication Layer

| Channel | Technology |
|---|---|
| SMS dispatch | Twilio (global) / regional SMS gateway per deployment country |
| Push notifications | Firebase Cloud Messaging |
| IVR voice alerts | Twilio Programmable Voice or local IVR operator |
| Email (officer reports) | AWS SES or SendGrid |

### 8.4 Data Refresh Cadence

| Dataset | Source Pull Frequency | Processing Latency |
|---|---|---|
| GPM IMERG Early | Every 30 minutes | ~4 hour latency from NASA |
| MODIS Land Surface Temp | Daily | ~1 day latency |
| SMAP L3 Soil Moisture | Daily | 2–3 day latency |
| Landsat NDVI | 16-day revisit | Supplemented by Sentinel-2 (5-day revisit) |
| NASA POWER | Daily | ~1 day latency |
| FIRMS Fire Events | Every 3 hours | ~3 hour latency |

### 8.5 Security Considerations

- All API endpoints are JWT-authenticated. Officer endpoints require `officer` or `admin` role.
- Satellite raster data served as pre-rendered MVT tiles (vector tiles); raw HDF5/NetCDF files never exposed to the client.
- SMS dispatch logs are stored with officer ID, timestamp, block ID, and message content for audit.
- GDPR-equivalent data handling for farmer PII (name, phone number, location) — stored encrypted at rest.

---

## 9. Accessibility & Inclusivity Design

### 9.1 Multi-Device & Multi-Channel Strategy

| Channel | Target User | Interface |
|---|---|---|
| Android smartphone app | Farmers with basic Android devices | Farmer View — minimal, visual |
| Web browser (large screen) | Officers at district offices | Officer Control Panel — full three-column |
| Tablet | Officers in field | Officer Control Panel — tab-collapsed layout |
| SMS (any phone) | Farmers without smartphones | Automated alert + advisory text in the user's configured language |
| IVR voice call | Farmers with no literacy | Voice broadcast of alerts in the user's configured language |

### 9.2 Connectivity Optimization

- Farmer app targets **2G/3G network performance** as baseline. Map tiles are low-resolution by default (512px); high-res loaded only on Wi-Fi.
- **Offline mode**: Core farm profile, last-fetched weather data, active alerts, and crop calendar cached locally. App remains functional for 48 hours without network.
- API responses are compressed (Brotli) and paginated aggressively.
- Officer Panel web app uses SWR for cache-first data fetching — stale data is shown immediately while fresh data loads in the background.

### 9.3 Language & Localization

- Language is configured at account registration and applied across all interfaces — no assumption of a default language.
- All alerts, advisories, compound recommendations, and crop calendar entries are generated in the user's configured language.
- Localization strings managed via i18n JSON files; any language can be added by supplying a translation file.
- The platform is designed to be language-agnostic: adding a new locale requires no architectural changes, only a translation layer update.

### 9.4 Voice Interface (Prototype Placeholder)

A **persistent floating microphone button** (🎤) is present on every Farmer View screen as a UI element. It is large (56dp), high-contrast, and fixed at bottom-right — always visible regardless of the current screen.

**In this prototype, the button has no functional implementation.** It is included to communicate the intended accessibility direction: a production build would connect this button to speech-to-text recognition in the user's configured language, intent parsing, and text-to-speech output so that farmers with low literacy can navigate the app and receive advisories entirely by voice.

The button is implemented visually and interactively (tap response, animation state) but the STT/NLP/TTS backend pipeline is deferred to a post-prototype phase.

---

## 10. Impact Projections

| Metric | Prototype / Pilot Target |
|---|---|
| Farmers onboarded | 50,000+ (pilot deployment, target region TBD) |
| Districts / blocks covered | 10 pilot districts |
| Early warning lead time — flood/cyclone | 48–72 hours |
| Early warning lead time — drought | 7–10 days |
| Estimated crop loss reduction | 15–25% in pilot regions |
| Irrigation efficiency gain | 20–30% reduction in water use via precision routing |
| Officer panels active | 10 district offices (pilot) |
| SMS alerts dispatched (Year 1 estimate) | 500,000+ |
| Solar pump assets tracked | 500+ (pilot deployment) |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| NASA data latency or API downtime | Medium | High | Local raster cache with 72-hour TTL; Sentinel-2 as NDVI fallback; GPM Early Run as precipitation fallback |
| Low farmer smartphone adoption | High | High | SMS and IVR channels serve as primary delivery for non-smartphone farmers; app is supplementary not mandatory |
| ML model prediction accuracy in novel conditions | Medium | Medium | Ensemble modeling (multiple algorithms); officer override capability on all AI-generated advisories |
| Government data-sharing or regulatory barriers | Medium | Medium | Position platform as a public good; engage national agricultural extension departments early in each deployment country |
| Local language NLP quality for voice commands | Medium | Low | Curated command phrase library per locale; human-reviewed intent mapping; text input fallback on voice failure |
| Connectivity gaps in remote char / haor areas | High | Medium | Offline-first app design; community kiosk deployment with field officer device sharing model |
| Funding continuity beyond prototype | Medium | High | Apply for NASA DEVELOP / SERVIR grant; FAO Digital Agriculture grant; ADB climate resilience fund |
| SMAP soil moisture 2–3 day data latency | High | Medium | SMAP L4 (model-assimilated, lower latency) as operational layer; SMAP L3 as validation layer |

---

## Appendix A: NASA Data Access

All NASA datasets listed in this document are publicly accessible with a free NASA Earthdata account:

- **NASA Earthdata Portal**: [earthdata.nasa.gov](https://earthdata.nasa.gov)
- **LAADS DAAC** (MODIS/VIIRS): [ladsweb.modaps.eosdis.nasa.gov](https://ladsweb.modaps.eosdis.nasa.gov)
- **NSIDC DAAC** (SMAP): [nsidc.org/daac](https://nsidc.org/daac)
- **GES DISC** (GPM IMERG, NASA POWER): [disc.gsfc.nasa.gov](https://disc.gsfc.nasa.gov)
- **NASA POWER API** (direct REST access, no auth required): [power.larc.nasa.gov/api](https://power.larc.nasa.gov/api)
- **FIRMS** (Fire events, near-real-time): [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov)

NASA datasets are free to access and redistribute for non-commercial, research, and public-good applications. No per-request or per-dataset licensing costs apply.

---

*AgriSentinel — Prepared by Kynatium Labs | v2.0 | September 2026*
