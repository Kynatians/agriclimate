# AgriClimate — Technical Specification

**Companion to:** `agriclimate.md` (Product & Planning, v2.3)
**Doc type:** Engineering spec — build contract for developers and coding agents
**Version:** 1.0 · September 2026 · Kynatium Labs
**Status:** Locked for prototype build

---

## 0. How to use this document

This is the **build contract**. The product doc says *what* and *why*; this says *how*, precisely enough that a developer or a coding agent can generate an implementation plan and write code without guessing.

**For coding agents:** Each module in §7–§11 is self-contained with explicit inputs, outputs, file paths, and acceptance criteria. Treat a `### Task` block as one unit of work. Do not invent dependencies, endpoints, or abstractions not listed here. When a value is `TBD`, ask; do not assume.

**For developers:** §4 (stack), §5 (repo layout), §12 (conventions) are the non-negotiables. Everything else is the target design.

**Locked decisions** (do not relitigate without a version bump):

| # | Decision | Value |
|---|---|---|
| D1 | Platform | Single responsive **web app**. No React Native. Farmer View = mobile-responsive; Officer Panel = desktop three-column; same codebase, same data. |
| D2 | Backend | **Next.js route handlers + static pre-fetched data.** No FastAPI, PostGIS, TimescaleDB, Celery, or MinIO in the prototype. |
| D3 | NASA data | **Pre-fetched offline**, committed as static data. App makes **zero** live NASA calls at request time. |
| D4 | Frontend | **Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + MapLibre GL + TanStack Query + Zustand + i18next + Recharts.** |

> **Prototype boundary:** Live ML inference, STT/NLP/TTS voice, SMS/IVR dispatch, and PWA offline sync are **UI placeholders or out of scope**. They are speced as interfaces so production can fill them, but carry no runtime implementation. Every placeholder is visibly labelled in-app.

---

## 1. System architecture

```
                 OFFLINE (run once, by a human, before demo)
┌──────────────────────────────────────────────────────────────┐
│  scripts/ingest/  (Python)                                     │
│  NASA POWER · GPM · SMAP · MODIS · Landsat · FIRMS · SRTM      │
│      │  fetch (earthaccess / AppEEARS / POWER REST)            │
│      ▼  compute indices (NDVI anom, SPI, FSS, CWSI, SM anom)   │
│      ▼  reshape to block-level records                         │
│  writes → data/generated/*.json  (committed to repo)          │
└──────────────────────────────────────────────────────────────┘
                              │  (static files, versioned)
                              ▼
                  RUNTIME (Next.js on Vercel)
┌──────────────────────────────────────────────────────────────┐
│  app/api/*        Route handlers (thin controllers)            │
│      │  call                                                   │
│      ▼                                                         │
│  lib/dal/         Data Access Layer  (reads data/generated)    │
│  lib/indices/     CSS crop-suitability scoring (pure TS, live) │
│      │                                                         │
│      ▼  typed JSON                                             │
│  app/(farmer) · app/(officer)   React Server + Client comps    │
│      MapLibre canvas · shadcn UI · TanStack Query · Zustand    │
└──────────────────────────────────────────────────────────────┘
```

**Two rules that define the architecture:**

1. **The app never processes rasters or calls NASA at request time.** All heavy geospatial work happens in `scripts/ingest` and is frozen into `data/generated`. The runtime only reads typed JSON and does light arithmetic (CSS scoring, filtering).
2. **The data source is hidden behind `lib/dal`.** Everything reads through the DAL. Today it reads static JSON; swapping to SQLite/Postgres later touches only the DAL, not a single component or route. This is the one abstraction we build up front because it has a real second implementation.

---

## 2. Tech stack (locked versions)

| Concern | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | Vercel default |
| Framework | Next.js (App Router) | 15.x | RSC by default; client comps only where interactive |
| Language | TypeScript | 5.x | `strict: true`, no implicit `any` |
| Styling | Tailwind CSS | 3.4+ | Design tokens via CSS vars (§10.1) |
| Components | shadcn/ui (Radix + Tailwind) | latest | Owned in-repo, not a dependency lock-in |
| Map | MapLibre GL JS | 4.x | Free; vector/GeoJSON layers |
| Server state | TanStack Query | 5.x | Cache-first, matches the "SWR" intent in product doc |
| UI/mode state | Zustand | 4.x | Mode toggle, layer toggles, filters, selected block |
| i18n | i18next + react-i18next | latest | JSON locale files; language-agnostic (§10.4) |
| Charts | Recharts | 2.x | Trend sparklines, anomaly bars |
| Forms/validation | React Hook Form + Zod | latest | Zod also validates DAL output at the boundary |
| Icons | lucide-react | latest | Consistent stroke icons |
| Tables | TanStack Table | 8.x | Officer data grids (headless) |
| Tests | Vitest + Testing Library + Playwright | latest | Unit + component + one e2e smoke |
| Lint/format | ESLint (next config) + Prettier | latest | CI-enforced |
| Ingestion (offline) | Python 3.11 + earthaccess + rasterio + xarray | — | `scripts/ingest` only; NOT a runtime dep |
| Deploy | Vercel | — | Static data bundled at build |

> **Not in the prototype (speced, not built):** FastAPI, PostGIS, TimescaleDB, Celery, Redis, MinIO, Twilio, FCM, PyTorch/Prophet, native mobile. See §14 for the production migration path.

---

## 3. Repository structure

```
agriclimate/
├── app/
│   ├── (marketing)/              # optional landing; low priority
│   ├── (farmer)/                 # Farmer View route group
│   │   ├── layout.tsx            # farmer shell (bottom nav, voice FAB)
│   │   ├── page.tsx              # Home
│   │   ├── map/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── alerts/page.tsx
│   ├── (officer)/                # Officer Panel route group (role-gated)
│   │   ├── layout.tsx            # three-column shell / tab-collapse
│   │   └── page.tsx              # command dashboard
│   ├── api/                      # route handlers = the "backend"
│   │   ├── blocks/route.ts
│   │   ├── blocks/[id]/route.ts
│   │   ├── timeseries/[blockId]/route.ts
│   │   ├── alerts/route.ts
│   │   ├── recommendations/[blockId]/route.ts
│   │   ├── irrigation/route.ts
│   │   └── report/[districtId]/route.ts
│   ├── layout.tsx                # root: theme, i18n, query provider, mode toggle
│   └── globals.css               # Tailwind + design tokens
├── components/
│   ├── ui/                       # shadcn primitives (button, card, dialog…)
│   ├── shared/                   # ModeToggle, NotificationBell, OfflineBanner, StatTile
│   ├── farmer/                   # WeatherCard, AlertCard, CropConditionCard, VoiceFab
│   ├── officer/                  # ControlPanel, MapCanvas, DataPanel, BlockDetail, AlertFeed
│   └── map/                      # MapLibre wrapper, layer defs, legend, tooltip
├── lib/
│   ├── dal/                      # Data Access Layer (the ONLY data reader)
│   │   ├── index.ts              # public API: getBlock, listBlocks, getTimeSeries…
│   │   ├── static-source.ts      # current impl: reads data/generated
│   │   └── types.ts              # domain types (§6.1) — single source of truth
│   ├── indices/                  # pure functions, unit-tested
│   │   ├── css.ts                # Crop Suitability Score (runs at request time)
│   │   ├── formulas.ts           # SPI, FSS, CWSI, NDVI/SM anomaly (shared defs)
│   │   └── thresholds.ts         # alert thresholds, index constants
│   ├── crops/knowledge-base.ts   # crop KB (§6.4) — typed, extensible
│   ├── i18n/                     # config + locale loader
│   └── utils.ts                  # cn(), formatters
├── data/
│   ├── generated/                # OUTPUT of ingestion — committed, read-only at runtime
│   │   ├── blocks.json           # geometry + static block attrs
│   │   ├── block-metrics.json    # latest per-block index values
│   │   ├── timeseries.json       # per-block daily records
│   │   └── alerts.json           # precomputed active alerts
│   └── locales/{en,bn,…}.json
├── scripts/ingest/               # OFFLINE Python — not shipped to runtime
│   ├── fetch_power.py            # NASA POWER REST (no auth)
│   ├── fetch_earthdata.py        # SMAP/GPM/MODIS via earthaccess (auth)
│   ├── fetch_firms.py            # FIRMS fire CSV (map key)
│   ├── compute_indices.py        # NDVI anom, SPI, FSS, CWSI, SM anomaly
│   ├── build_blocks.py           # reshape → data/generated/*.json
│   └── README.md                 # how to re-run the pipeline + creds setup
├── locales/                      # i18n JSON (mirror of data/locales if preferred)
├── tests/
├── public/
└── package.json
```

**Path aliases** (`tsconfig.json`): `@/components`, `@/lib`, `@/data`, `@/app`.

---

## 4. Domain model (single source of truth: `lib/dal/types.ts`)

All layers use these types. Route handlers validate DAL output against Zod schemas derived from them, so a malformed data file fails loudly at the boundary, not silently in the UI.

```ts
// Administrative hierarchy: District → Sub-district → Block
export interface Block {
  id: string;                    // "blk_014"
  name: string;                  // "Block 14"
  districtId: string;
  subDistrict: string;
  geometry: GeoJSON.Polygon;     // EPSG:4326
  centroid: [number, number];    // [lng, lat]
  farmerCount: number;
  pumpAssetCount: number;
  primaryCrop: CropId | null;
  cropStage: CropStage | null;
}

export interface BlockMetrics {
  blockId: string;
  asOf: string;                  // ISO date of the data snapshot
  ndvi: MetricValue;             // value + baseline + anomaly + trend
  soilMoistureSurface: MetricValue;   // % VWC
  soilMoistureRootZone: MetricValue;
  precip7dActual: number;        // mm
  precip7dForecast: number;      // mm
  lst: number;                   // °C, land surface temp
  spi: number;                   // Standardized Precipitation Index
  cwsi: number;                  // 0–1
  floodScore: number;            // FSS 0–1
  sources: DataSourceRef[];      // provenance per metric (shown in UI)
}

export interface MetricValue {
  value: number;
  baseline: number;
  anomaly: number;               // value − baseline (or %)
  trend: "improving" | "stable" | "declining";
}

export interface DataSourceRef {
  metric: string;                // "soilMoisture"
  dataset: string;               // "NASA SMAP L3"
  resolution: string;            // "500m"
  lastUpdate: string;            // "2026-09-27T08:42:00Z"
}

export type AlertType = "drought" | "flood" | "cyclone" | "waterlogging" | "fire";
export type Severity = "low" | "medium" | "high";

export interface Alert {
  id: string;
  blockId: string;
  type: AlertType;
  severity: Severity;
  leadTimeHours: number;         // 48–72 flood/cyclone; drought in days*24
  headline: LocalizedText;       // keyed by locale
  detail: LocalizedText;
  issuedAt: string;
  expiresAt: string;
}

export type LocalizedText = Record<string, string>; // { en: "...", bn: "..." }

export interface TimeSeriesPoint {
  date: string;
  ndvi: number; soilMoisture: number; precip: number; lst: number;
}
```

**Crop domain** (used by Module 4 / CSS):

```ts
export type CropId = string;               // "rice_boro"
export type CropCategory = "grain" | "legume" | "vegetable" | "cash";
export type CropStage = "sowing" | "vegetative" | "flowering" | "maturity" | "harvest";

export interface CropKnowledge {
  id: CropId; name: LocalizedText; category: CropCategory;
  soilMoisture: Range;           // optimal % VWC
  temperature: Range;            // °C germination+growth
  waterRequirementMm: number;    // total per cycle
  solarMJ: number;               // MJ/m²/day
  daysToHarvest: { early: number; standard: number; late: number };
  marketDemand: "high" | "medium" | "low";
  roiPerHectare: Range;          // USD
  notes: LocalizedText;
}
export interface Range { min: number; max: number; }

export interface CropRecommendation {
  crop: CropKnowledge;
  css: number;                   // 0–100
  subScores: Record<"soilMoisture"|"temperature"|"rainfall"|"solar"|"ndvi", number>;
  whyThisLand: LocalizedText;    // template-interpolated, NOT LLM
  riskNote: LocalizedText | null;
  bestHarvestWindow: { start: string; end: string };
}
```

---

## 5. Derived indices & scoring

Two categories, split by *where* they run:

- **Precomputed offline** (in `scripts/ingest/compute_indices.py`, frozen into `block-metrics.json`): NDVI anomaly, SPI, Soil Moisture anomaly, CWSI, FSS. The app displays these; it does not recompute them.
- **Computed at request time** (in `lib/indices/css.ts`, pure TS): the Crop Suitability Score, because it depends on the crop the user picks and runs only on already-stored block data (Module 4's explicit design).

`lib/indices/formulas.ts` holds the canonical definitions **and their TS reference implementations**, so the Python and TS sides agree and either can be unit-tested against the same fixtures.

### 5.1 Formula reference

| Index | Formula | Trigger |
|---|---|---|
| **NDVI** | `(NIR − Red) / (NIR + Red)` | below seasonal baseline → crop stress flag |
| **NDVI anomaly** | `ndvi − seasonalBaseline` | `< −0.1` contributes to stress |
| **SPI** | z-score of precip vs long-term monthly mean (fitted gamma → standard normal) | `≤ −1.0` advisory · `≤ −1.5` warning |
| **Soil moisture anomaly** | `(current − 5yrSeasonalMean) / 5yrSeasonalMean` | `< −0.20` deficit · `> +0.90` saturation |
| **CWSI** | normalized `f(LST, soilMoisture, VPD)` → 0–1 | `> 0.6` irrigation advisory · `> 0.7` drought warning |
| **FSS** | `0.40·precipForecastNorm + 0.35·soilSaturationRatio + 0.25·terrainFlowNorm` | `≥ 0.7` flood warning |
| **Deficit Severity** | `100 · clamp(deficit / optimalRange, 0, 1)` | drives pump routing priority |

> VPD (vapor pressure deficit) is derived from NASA POWER `T2M` + `RH2M`. All weights are constants in `lib/indices/thresholds.ts` so they are tunable in one place — **never inline a threshold**.

### 5.2 Crop Suitability Score (CSS) — runtime, pure

```ts
// lib/indices/css.ts
export function scoreCrop(block: BlockMetrics, crop: CropKnowledge): CropRecommendation;
```

Contract:

- Five sub-scores in `[0,1]`, each a triangular match of a block metric against the crop's `Range`:
  `sub = 1 − clamp(distanceOutsideRange / rangeWidth, 0, 1)` (1.0 when inside range).
- Weighted sum → `css = round(100 · Σ wᵢ·subᵢ)`. Default weights (in `thresholds.ts`):
  soilMoisture `0.30`, temperature `0.25`, rainfall `0.20`, solar `0.15`, ndvi `0.10`.
- `whyThisLand`: pick the top-2 contributing sub-scores, interpolate a pre-written template per locale. **String interpolation, not LLM.**
- `riskNote`: emitted only when any sub-score `< 0.5`; names the weakest dimension.
- `recommendTop(block, n=7)` maps over the KB, sorts by CSS desc, returns top `n`.

**Must be a pure function** (no I/O, no `Date.now()` inside — pass `asOf`). This makes it trivially testable and deterministic for agents. One `css.test.ts` with fixtures is required (§13).

---

## 6. Data Access Layer (`lib/dal`)

The DAL is the **only** module that reads `data/generated`. Route handlers and Server Components call the DAL; nothing else touches the JSON files. This is the seam that lets production swap in Postgres/PostGIS without touching the UI.

### 6.1 Public interface (`lib/dal/index.ts`)

```ts
export function listBlocks(districtId?: string): Promise<Block[]>;
export function getBlock(id: string): Promise<Block | null>;
export function getBlockMetrics(id: string): Promise<BlockMetrics | null>;
export function getTimeSeries(id: string, days: number): Promise<TimeSeriesPoint[]>;
export function listAlerts(filter?: {
  districtId?: string; severity?: Severity; type?: AlertType; period?: "24h"|"7d"|"30d";
}): Promise<Alert[]>;
export function getDistrictSummary(districtId: string): Promise<DistrictSummary>;
```

Rules:
- Every function is `async` (even though the impl is sync JSON reads) so the interface survives a DB swap.
- Output is validated with Zod on first read, then cached in-module (`data/generated` is immutable per deploy).
- No business logic here — filtering/aggregation only. Index math lives in `lib/indices`.

### 6.2 Static source impl (`lib/dal/static-source.ts`)

Reads JSON via `import` (bundled at build) or `fs` (read at runtime from the deployed file). Prefer static `import` so Vercel bundles it and there is no filesystem dependency. `ponytail: static JSON now; when queries need joins/filters at scale, replace this file with a SQLite/libSQL reader — the interface in index.ts does not change.`

---

## 7. Internal API (Next.js route handlers)

Thin controllers: parse params → call DAL/indices → return typed JSON. No data access logic inline. All responses `application/json`; errors use `{ error: { code, message } }` with proper status.

| Method + Route | Purpose | Query / Params | Returns |
|---|---|---|---|
| `GET /api/blocks` | list blocks (map choropleth source) | `?districtId` | `Block[]` |
| `GET /api/blocks/[id]` | block geometry + static attrs | `id` | `Block` |
| `GET /api/blocks/[id]/metrics` | latest index values | `id` | `BlockMetrics` |
| `GET /api/timeseries/[blockId]` | daily records for charts | `?days=30` | `TimeSeriesPoint[]` |
| `GET /api/alerts` | active alerts (feed + badges) | `?districtId&severity&type&period` | `Alert[]` |
| `GET /api/recommendations/[blockId]` | ranked crop cards (CSS) | `?n=7&locale=bn` | `CropRecommendation[]` |
| `GET /api/irrigation` | deficit heatmap + pump sequence | `?districtId` | `IrrigationPlan` |
| `GET /api/report/[districtId]` | district summary payload | `?date` | `DistrictReport` |

**Placeholders (return `501` + `{ placeholder: true }`, rendered as "Coming soon" in UI):**
`POST /api/alerts/dispatch` (SMS/IVR), `POST /api/voice/query` (STT/NLP).

**Conventions:**
- Prefer **React Server Components** calling the DAL directly for initial render; use these HTTP routes for client-side refetch (TanStack Query) and for the officer's interactive filtering.
- Cache: `export const revalidate = 3600;` on read routes (data is static per deploy).
- Validate query params with Zod; reject unknown with `400`.
- Never expose raw dataset files or stack traces.

---

## 8. External API reference (NASA) — used **only** in `scripts/ingest`

These are called offline during ingestion, never from the running app. All datasets are free. Auth splits into three tiers: **none** (POWER), **map key** (FIRMS), **Earthdata Login** (everything else).

### 8.1 Earthdata Login (shared credential)

Most datasets require a free account at `urs.earthdata.nasa.gov`. Programmatic access uses either a `~/.netrc` entry or a bearer token. **Do not hand-roll HTTP** — use the `earthaccess` Python library, which handles auth, search (CMR), and download.

```python
import earthaccess
earthaccess.login()  # reads EARTHDATA_USERNAME / EARTHDATA_PASSWORD env or .netrc
results = earthaccess.search_data(short_name="SPL3SMP", temporal=("2025-06-01","2025-06-30"),
                                  bounding_box=(88.0, 24.0, 92.7, 26.6))
files = earthaccess.download(results, "raw/smap/")
```

Store creds in `.env` (git-ignored): `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`. Never commit.

### 8.2 Dataset endpoints

| Dataset | Access | Identifier / Endpoint | Auth |
|---|---|---|---|
| **NASA POWER** | REST (JSON) | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M&community=AG&latitude={lat}&longitude={lng}&start={YYYYMMDD}&end={YYYYMMDD}&format=JSON` | **None** |
| **SMAP L3** (soil moisture) | earthaccess / CMR | `short_name="SPL3SMP"` | Earthdata |
| **SMAP L4** (assimilated, lower latency) | earthaccess | `short_name="SPL4SMGP"` | Earthdata |
| **GPM IMERG** (precip) | earthaccess / GES DISC | `short_name="GPM_3IMERGDF"` (daily) / `GPM_3IMERGHH` (30-min) | Earthdata |
| **MODIS LST** | earthaccess / LP DAAC | `short_name="MOD11A1"` | Earthdata |
| **MODIS NDVI** | earthaccess / LP DAAC | `short_name="MOD13Q1"` (250m, 16-day) | Earthdata |
| **Landsat 8/9** | STAC | Microsoft Planetary Computer STAC `landsat-c2-l2` (no NASA auth) **or** USGS M2M | MPC: none |
| **FIRMS** (fire) | REST (CSV) | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/{west,south,east,north}/{dayRange}/{date}` | **Map key** (free) |
| **SRTM DEM** | earthaccess | `short_name="SRTMGL1"` (30m) | Earthdata |

> **Prototype tip:** For point/area sampling without wrangling HDF/NetCDF, use **AppEEARS** (`appeears.earthdatacloud.nasa.gov`) — submit an area request for the pilot blocks, get back tidy CSV/GeoTIFF for MODIS/SMAP/Landsat. This is the fastest path to `data/generated` and is the recommended default for the ingest scripts. `earthaccess` is the fallback when you need a dataset AppEEARS doesn't serve.
> **Landsat tip:** Microsoft Planetary Computer's STAC API serves Landsat Collection-2 L2 with no NASA auth and a clean Python `pystac-client` flow — prefer it for NDVI/NDWI unless USGS-native is required.

### 8.3 POWER parameter map (used across modules)

| POWER param | Meaning | Feeds |
|---|---|---|
| `T2M` | 2m air temp (°C) | CWSI, VPD, crop calendar, CSS temperature |
| `PRECTOTCORR` | corrected precipitation (mm/day) | SPI, rainfall match |
| `ALLSKY_SFC_SW_DWN` | solar irradiance (MJ/m²/day) | CSS solar, pump optimization |
| `RH2M` | relative humidity (%) | VPD → CWSI |
| `WS2M` | wind speed (m/s) | cyclone signal, evapotranspiration |

### 8.4 Provenance requirement

Every metric surfaced in the UI carries a `DataSourceRef` (dataset, resolution, `lastUpdate`). Ingestion **must** stamp these when writing `block-metrics.json`. The officer canvas and tooltips render them verbatim (product doc §7.3.2). No unsourced numbers in the UI.

---

## 9. Frontend architecture

### 9.1 Rendering strategy

- **Default to Server Components.** Pages fetch via the DAL on the server for the first paint (fast, no client waterfall). Mark a component `"use client"` **only** when it needs state, effects, event handlers, or the map.
- Client interactivity (officer filters, block selection, layer toggles, refetch) uses **TanStack Query** against the `/api` routes.
- Charts, MapLibre, and Zustand consumers are client components; keep them leaf-level so the tree above stays server-rendered.

### 9.2 State — three clearly separated stores

| Concern | Tool | Scope |
|---|---|---|
| Server data (blocks, metrics, alerts, recs) | TanStack Query | cached, keyed, refetchable |
| UI/session state | Zustand | mode, selectedBlockId, activeLayers, filters, locale |
| Form state | React Hook Form | officer note, alert composer |

**Zustand store shape (`lib/stores/ui.ts`):**

```ts
interface UiState {
  mode: "farmer" | "officer";
  setMode(m: UiState["mode"]): void;      // permission-gated in the toggle component
  selectedBlockId: string | null;
  activeLayers: LayerId[];                 // officer map toggles
  filters: { severity: Severity|"all"; crop: CropId|"all"; period: "24h"|"7d"|"30d" };
  locale: string;
}
```

**TanStack Query keys (stable, documented so agents don't invent them):**
`["blocks", districtId]`, `["block", id]`, `["metrics", id]`, `["timeseries", id, days]`,
`["alerts", filters]`, `["recommendations", blockId, n, locale]`.

### 9.3 Mode-switch architecture (product doc §7.1)

- Root layout renders the persistent top bar with `<ModeToggle/>`, `<NotificationBell/>`, profile.
- Route groups `(farmer)` and `(officer)` hold the two shells. The toggle sets `mode` in Zustand **and** navigates (`router.push`) to the group root. Switch is instant — no reload, no re-login; data cache is shared.
- **Role gate:** officer routes check the (mocked, prototype) session role. A farmer tapping "Officer" gets a permission dialog, not the panel. In the prototype, role is a value on a mocked auth context (`lib/auth/mock-session.ts`); production swaps this for JWT.

### 9.4 Localization (§9.3 of product doc)

- `i18next` with `data/locales/{locale}.json`. **No hardcoded user-facing strings** — every label goes through `t()`.
- Locale is chosen at (mocked) registration, stored in Zustand + `localStorage`, applied app-wide. Adding a language = adding one JSON file, zero code changes.
- Alert/advisory/recommendation text is stored as `LocalizedText` in the data and selected by current locale — the app does not translate at runtime.
- Number/date formatting via `Intl`. RTL-ready (Tailwind logical properties).

---

## 10. Design system & component library

### 10.1 Tokens (defined once in `globals.css` as CSS vars, consumed via Tailwind)

- **Color:** semantic tokens only — `--bg`, `--surface`, `--fg`, `--muted`, `--primary`, `--danger`, `--warning`, `--success`. Light/dark via `[data-theme]`. Components never hardcode hex.
- **Status scale (colorblind-safe):** green/yellow/red for block status; diverging **ArmyRose** and sequential **Sunset** (CARTO) for choropleth (product doc §7.3.2). Defined as a shared `lib/map/palettes.ts`.
- **Type:** farmer body min **18px**, contrast **≥ 4.5:1** (§11). Fluid type scale.
- **Spacing/radius/shadow:** 4px base grid; tokens `--radius`, elevation presets.

### 10.2 Component layers

1. **`components/ui/`** — shadcn primitives (Button, Card, Dialog, Tabs, Select, Tooltip, Badge, Sheet, Switch, Skeleton). Accessible by default (Radix). Do not restyle ad-hoc; extend via variants.
2. **`components/shared/`** — cross-mode composites (below).
3. **`components/farmer/`**, **`components/officer/`**, **`components/map/`** — feature components.

**No component duplication across modes.** If both modes need it, it lives in `shared/` and takes props for the variation.

### 10.3 Reusable component contracts

Each entry is a build target. Props are the contract; keep components pure and presentational (data comes from props/hooks, not fetched inside leaf components unless noted).

| Component | Location | Props (contract) | Notes |
|---|---|---|---|
| `StatTile` | shared | `{ icon, label, value, unit?, delta?, trend?, source? }` | The atom of every dashboard. Renders anomaly arrow + colored delta. Used in farmer cards and officer data panel. |
| `MetricBadge` | shared | `{ severity, children }` | Severity-colored pill. |
| `SourceLabel` | shared | `{ source: DataSourceRef }` | "SMAP L3 · 500m · 08:42 UTC". Provenance everywhere. |
| `ModeToggle` | shared | `{}` (reads store) | Permission-gated; opens dialog for unauthorized farmer. |
| `NotificationBell` | shared | `{ count }` | Badge; opens alerts sheet. |
| `OfflineBanner` | shared | `{ lastSync }` | Yellow banner (prototype: driven by `navigator.onLine`). |
| `WeatherCard` | farmer | `{ metrics: BlockMetrics }` | Today's temp, rain %, plain-language soil summary (localized). |
| `CropConditionCard` | farmer | `{ metrics }` | Stress level from CWSI/NDVI, icon + text. |
| `AlertCard` | farmer | `{ alert: Alert; onView; onDismiss }` | Large, high-contrast, localized. |
| `CropRecoCard` | farmer | `{ reco: CropRecommendation; defaultCollapsed }` | Collapsible; header = name + CSS; matches product doc §4.3 layout. |
| `VoiceFab` | farmer | `{}` | 56dp fixed FAB. **Placeholder** — tap shows "Coming soon" (§11/§0). |
| `ControlPanel` | officer | `{}` | Left column: layer toggles, actions, filters, alert feed. |
| `LayerToggleList` | officer | `{ layers: LayerDef[]; active; onToggle }` | Drives map layers via store. |
| `MapCanvas` | map | `{ blocks; metrics; activeLayers; selectedId; onSelect; onHover }` | MapLibre wrapper (§10.4). |
| `MapLegend` | map | `{ layer: LayerDef }` | Colorblind-safe scale. |
| `BlockTooltip` | map | `{ block; metrics; layer }` | Hover card (product doc §7.3.2). |
| `DataPanel` | officer | `{ districtSummary; selectedBlock? }` | Right column; district stats → block detail on select. |
| `BlockDetail` | officer | `{ block; metrics; recos }` | Full detail drawer (product doc §7.3.3 layout). |
| `AlertFeed` | officer | `{ alerts; onAnnotate }` | Live list; "Annotate → SMS" opens composer (placeholder dispatch). |
| `AlertComposer` | officer | `{ preset; onSend }` | Modal: system text + officer note + channel select. Send = placeholder `501`. |
| `TrendSparkline` | shared | `{ points: TimeSeriesPoint[]; metric }` | Recharts; used in tiles and detail. |

### 10.4 Map architecture (`components/map`)

- **`MapCanvas`** wraps MapLibre GL in a client component. Base: satellite raster + admin boundary lines. Blocks rendered as a **GeoJSON source** with a data-driven `fill-color` expression keyed off the active layer's metric.
- **Layers are data, not components:** `lib/map/layers.ts` exports a `LayerDef[]` — `{ id, label, metricKey, palette, type: "choropleth"|"points"|"lines" }` for NDVI, Soil Moisture, Flood Risk, Crop Health, Precip Forecast, Pump Routing, Fire Events. Adding a layer = one array entry + a palette. No new component.
- Toggling a layer in the store recomputes the paint expression; transitions animate 300ms.
- Hover → `BlockTooltip`; click → set `selectedBlockId` (drives `DataPanel`). Selected block gets a blue outline layer.
- Controls: zoom, fullscreen, per-layer opacity slider, draw-select (multi-block for bulk actions), PNG export (`map.getCanvas().toDataURL()`).
- **Phone collapse (product doc §7.5):** officer three columns → shadcn `Tabs` (Control / Map / Data). Same components, responsive container only.

---

## 11. Engineering standards (non-negotiable)

- **TypeScript strict.** No `any`; use `unknown` + narrowing. Domain types come from `lib/dal/types.ts` — never redefine a shape locally.
- **Validate at boundaries.** Zod-validate DAL output and route params. Trust nothing crossing a process/file boundary; internal function calls stay typed and unvalidated.
- **Pure where possible.** Index/scoring functions are pure and unit-tested. Side effects (fetch, store writes) live at the edges.
- **One source of truth per concept.** Thresholds in `thresholds.ts`, palettes in `palettes.ts`, strings in locale files, types in `types.ts`. Duplication is a bug.
- **Server-first.** No `"use client"` unless the component needs interactivity. No data fetching in `useEffect` when a Server Component or TanStack Query can do it.
- **No inline magic numbers/strings** in components — reference tokens/constants.
- **Naming:** components `PascalCase`, hooks `useX`, files kebab-case except components (`PascalCase.tsx`). Route handlers `route.ts`. Test files `*.test.ts(x)`.
- **Errors:** components render `error.tsx`/`loading.tsx` (App Router) and Skeletons; never a blank screen. Routes return structured errors.
- **Commits:** conventional commits; small, reviewable diffs.
- **Accessibility & security are not optional** and are not simplified away (see §11.1, §12).

### 11.1 Accessibility (product doc §9)

- Contrast **≥ 4.5:1**; farmer body text **≥ 18px**. Verified in CI (axe on key screens).
- Every interactive element keyboard-reachable, visible focus ring, correct ARIA role/label. Radix (shadcn) gives most of this — don't break it.
- Icon + text pairing for farmer data points (low-literacy support). Icons are never the sole signifier.
- Map is not the only path to data: block info is also reachable as a list/table (screen-reader + no-map fallback).
- `VoiceFab` is a labelled placeholder with an accessible "coming soon" state — visible and honest, no dead silent button.

---

## 12. Security

- **Auth (prototype):** mocked session with `role` in `farmer|officer|admin`. Officer routes/pages check role server-side. `lib/auth/mock-session.ts` is the single seam; production replaces it with JWT — route guards and the role check API stay identical.
- **No secrets in the app.** The runtime has no NASA creds (all data pre-fetched). Ingestion creds live in `scripts/ingest/.env`, git-ignored. `.env.example` documents keys with empty values.
- **PII:** farmer name/phone/location are **mocked/synthetic** in the prototype — no real personal data committed. Types reserve where encryption-at-rest goes in production.
- **Route hygiene:** validate/whitelist params, no stack traces to client, no raw file paths in responses, security headers via `next.config` (CSP allowing MapLibre tiles/workers).
- **Dependencies:** pinned versions; `npm audit` in CI; no unvetted packages for what a few lines do.
- **Placeholder endpoints** (`dispatch`, `voice`) return `501` — they never silently no-op, so no one ships thinking SMS works.

---

## 13. Testing

Minimum bar (ponytail: one runnable check per non-trivial logic path, not a suite per function):

| Layer | Tool | What must exist |
|---|---|---|
| Index/scoring | Vitest | `css.test.ts` + `formulas.test.ts` with fixtures asserting known inputs → known CSS/SPI/FSS. This is the highest-value test — the money path. |
| DAL | Vitest | one test that Zod-validates every file in `data/generated` (catches bad data before the UI does). |
| Components | Testing Library | render + a11y (axe) smoke on `CropRecoCard`, `MapCanvas` mount, `ModeToggle` permission gate. |
| E2e | Playwright | one smoke: load farmer home → switch to officer (as officer role) → select a block → see detail. |

No fixtures/frameworks beyond these. Trivial presentational components need no test.

---

## 14. Implementation roadmap (agent-consumable tasks)

Ordered by dependency. Each phase is shippable and independently verifiable. A coding agent can take one `T#` as a work unit; the "Done when" line is its acceptance test.

### Phase 0 — Scaffold
- **T0.1** `create-next-app` (TS, App Router, Tailwind, ESLint) + path aliases. **Done when** dev server renders a root layout with the top bar shell.
- **T0.2** Install & init shadcn/ui; add base primitives (§10.2). Add lucide, TanStack Query provider, i18next provider, Zustand store. **Done when** a demo page uses a shadcn `Button` and reads `mode` from the store.
- **T0.3** Define design tokens in `globals.css` + Tailwind theme (§10.1). **Done when** light/dark toggle flips semantic tokens.

### Phase 1 — Data contract & DAL (blocks everything)
- **T1.1** Author `lib/dal/types.ts` (§4) + Zod schemas. **Done when** types compile and schemas parse a sample record.
- **T1.2** Commit **seed** `data/generated/*.json` — hand-authored realistic sample for ~10 blocks / 1 district (unblocks frontend before real ingestion). **Done when** files validate against T1.1 schemas.
- **T1.3** Implement `lib/dal` static source (§6). **Done when** `getBlock`, `listBlocks`, `getBlockMetrics`, `listAlerts` return typed data + DAL validation test passes.

### Phase 2 — Indices & crops
- **T2.1** `lib/indices/thresholds.ts` + `formulas.ts` reference impls (§5.1) + `formulas.test.ts`.
- **T2.2** `lib/crops/knowledge-base.ts` — 20–30 crops (product doc §4.2), typed.
- **T2.3** `lib/indices/css.ts` `scoreCrop`/`recommendTop` + `css.test.ts` (§5.2). **Done when** fixtures assert a known block+crop → expected CSS and `whyThisLand`.

### Phase 3 — API routes
- **T3.1** Implement all `GET` routes in §7 as thin controllers over DAL/indices + Zod param validation + `revalidate`. **Done when** each returns valid typed JSON and rejects bad params with 400.
- **T3.2** Placeholder `POST` routes return `501 {placeholder:true}`.

### Phase 4 — Shared UI + i18n
- **T4.1** Build `components/shared/*` (§10.3) + tokens usage. **T4.2** `en` + one more locale JSON; wire `t()` everywhere; locale switch in settings. **Done when** switching locale re-renders all shared components with no hardcoded strings.

### Phase 5 — Farmer View
- **T5.1** Farmer shell (bottom nav, `VoiceFab` placeholder) + Home (weather, condition, alert, compound tip, calendar teaser — product doc §7.2 layout).
- **T5.2** Map tab (simplified block map, status colors, tap → summary). **T5.3** Calendar tab (historical advisories from data). **T5.4** Alerts tab. **T5.5** "What to plant?" → `CropRecoCard` list from `/api/recommendations`. **Done when** a farmer flow is fully navigable, responsive at 360px, a11y-clean.

### Phase 6 — Officer Panel
- **T6.1** Three-column shell + phone tab-collapse. **T6.2** `MapCanvas` + `lib/map/layers.ts` + legend + tooltip + selection. **T6.3** `ControlPanel` (layer toggles, filters, actions, alert feed). **T6.4** `DataPanel` + `BlockDetail`. **T6.5** `AlertComposer` (dispatch = placeholder). **T6.6** Report payload view (`/api/report`). **Done when** load → toggle layers → filter → select block → see detail → open composer works end-to-end.

### Phase 7 — Ingestion (real data) & hardening
- **T7.1** `scripts/ingest` Python: POWER (no auth) first, then AppEEARS/earthaccess for SMAP/GPM/MODIS/Landsat, FIRMS by map key (§8). **T7.2** `compute_indices.py` → regenerate `data/generated`. **Done when** real pilot-district data replaces the seed and the app renders it unchanged (proves the DAL seam).
- **T7.3** Playwright smoke (§13), axe pass, security headers, deploy to Vercel.

> **Parallelizable:** Phases 4/5/6 depend only on Phases 1–3. Once the seed data (T1.2) and routes (T3) exist, frontend and ingestion proceed independently — the DAL guarantees the app never knows which data source it's on.

---

## 15. AI agent tooling & skills

Guidance for a coding agent (Claude Code) building this repo: **which skill to invoke at which phase, which MCP servers to connect, and the checklist every change is verified against.** Skills are named as they exist in this environment; invoke with the Skill tool or `/name`.

### 15.1 Skill → phase map

| Skill / agent | Use at | Why |
|---|---|---|
| `init` | before Phase 0 | Generate `CLAUDE.md` from §0/§11 so every later agent inherits the conventions and locked decisions. |
| `Plan` (agent) | start of any `T#` | Decompose a task into ordered steps against the real file tree before editing. |
| `Explore` (agent) | any "where is…" | Locate code/patterns across the repo without dumping files into context. |
| `vercel:nextjs` | Phases 0, 3, 5, 6 | Next.js 15 App Router correctness — RSC vs client, route handlers, caching/`revalidate`. |
| `vercel:react-best-practices` | all frontend | Server-first rendering, hook discipline, client-boundary placement (§9.1). |
| `vercel:shadcn` | T0.2 + component work | Add shadcn/ui primitives correctly from the registry; don't hand-roll. |
| `frontend-design` | Phases 5–6 | The "non-sloppy UI" bar — layout, hierarchy, spacing, states. |
| `dataviz` | T5.3, T6.2 | Recharts trend charts **and** the colorblind-safe choropleth/legend palettes (§10.1, §10.4). |
| `ponytail` (active) | all coding | YAGNI ladder — no speculative abstraction; shortest working diff. |
| `simplify` | after each `T#` | Prune over-engineering before marking done. |
| `code-review` | end of each phase | Correctness pass before merge. |
| `security-review` | Phase 7 | Param validation, headers, no secrets, no live NASA calls in runtime (§12). |
| `vercel:deploy` / `vercel:vercel-cli` | T7.3 | Ship to Vercel with static data bundled. |
| `commit-commands:commit-push-pr` | per phase | Small, conventional-commit PRs. |

> Order per task: **Plan → implement (with ponytail) → simplify → code-review → commit.** Do not skip simplify/review on "trivial" tasks — that is where scope creep hides.

### 15.2 NASA data MCP servers

These MCPs are for the **offline ingestion phase only** (`scripts/ingest`, Phase 7) — an agent uses them to discover dataset `short_name`s, verify granule availability for the pilot bbox/dates, and pull data. **They are never wired into the Next.js runtime** — decision D3 stands: the app makes zero NASA calls. Do not add these to `app/` or `lib/`.

**Primary — official NASA CMR (discovery), hosted, no local setup, no auth for metadata:**

```bash
claude mcp add --transport http earthdata-cmr https://cmr.earthdata.nasa.gov/mcp/v1
```
Tools: `get_keywords`, `get_collections`, `get_granules`, `get_services`, `get_tools`, `get_citations`, `get_variables`. Enforces a **Discover → Verify → Access** flow. Use it to resolve colloquial terms → official vocabulary and to confirm the exact collections before downloading.

**Secondary — Earthdata granule search + download (needs Earthdata Login):**

```bash
claude mcp add earthdata-download -- \
  docker run -i --rm -e EARTHDATA_USERNAME -e EARTHDATA_PASSWORD \
  datalayer/earthdata-mcp-server:latest
```
Tools: `search_earth_datasets`, `search_earth_datagranules`, `download_earth_data_granules` (modes: `manifest` = preview, `script` = emit Python to run, `download` = write files). Only the download tool needs creds; pass them via env, keep the client config protected, never commit.

**NASA POWER — no MCP, no auth:** it is a plain REST endpoint (§8.2). Call it directly from `fetch_power.py`; an MCP would be overhead.

**Agent ingestion workflow:**
1. `earthdata-cmr` → resolve `short_name`s: `SPL3SMP`/`SPL4SMGP` (SMAP), `GPM_3IMERGDF` (GPM), `MOD11A1`/`MOD13Q1` (MODIS), `SRTMGL1` (DEM). Landsat via Planetary Computer STAC (§8.2).
2. `earthdata-cmr get_granules` → verify coverage for the pilot bbox + season.
3. `earthdata-download` (`script` or `download`) **or** AppEEARS/`earthaccess` → fetch to `scripts/ingest/raw/`.
4. `compute_indices.py` → `data/generated/*.json`. Runtime reads only these.

### 15.3 Clean-architecture & best-practices checklist

Verify every change against this before marking a `T#` done. It makes §11 mechanically checkable.

- [ ] **Dependency rule:** imports flow `app → lib → data` only, never reverse. Components never import from `scripts/` or read `data/generated` directly.
- [ ] **DAL is the only reader:** no `fs`/JSON import of `data/generated` outside `lib/dal`. (grep-checkable)
- [ ] **No live NASA in runtime:** no NASA host string anywhere in `app/` or `lib/`. (grep-checkable)
- [ ] **Types from one place:** shapes imported from `lib/dal/types.ts`, never redefined locally.
- [ ] **Single source of truth:** thresholds → `thresholds.ts`, palettes → `palettes.ts`, strings → locale JSON. No inline magic values.
- [ ] **Purity:** index/scoring functions are pure (no I/O, no `Date.now()` inside) and carry a test.
- [ ] **Boundary validation:** Zod on route params and DAL output; internal typed calls stay unvalidated.
- [ ] **Server-first:** `"use client"` only on interactive/map/store-consuming leaves.
- [ ] **No duplication across modes:** shared UI lives in `components/shared/` and varies by props.
- [ ] **Provenance:** every displayed metric renders a `SourceLabel`.
- [ ] **Honest placeholders:** unimplemented features return `501` and show a labelled "coming soon" state.
- [ ] **A11y on touched screens:** ≥18px farmer body, ≥4.5:1 contrast, keyboard-reachable, correct ARIA.
- [ ] **Ran `simplify` + `code-review`** and addressed findings.

---

## 16. Production migration path (speced, not built)

Each prototype seam maps to a production component with **no UI rewrite**:

| Prototype seam | Production swap |
|---|---|
| `lib/dal/static-source.ts` (JSON) | PostGIS + TimescaleDB reader behind the same `lib/dal` interface |
| Pre-fetched `data/generated` | Celery/Redis scheduled ingestion (cadence in product doc §8.4) |
| `lib/indices/css.ts` (static block data) | same functions, fed live feature-store rows |
| Crop Calendar static advisories | LSTM/Prophet inference service |
| `POST /api/alerts/dispatch` `501` | Twilio SMS/IVR + FCM push |
| `POST /api/voice/query` `501` | STT (locale) → intent parse → TTS |
| `lib/auth/mock-session.ts` | JWT auth, roles `farmer/officer/admin` |
| Vercel static | containerized Next + Python API alongside |

---

## Appendix A — Environment variables

**Runtime (`.env.local`)** — no secrets needed for the static prototype:
```
NEXT_PUBLIC_MAP_STYLE_URL=       # MapLibre style / tile source
NEXT_PUBLIC_DEFAULT_LOCALE=en
```
**Ingestion (`scripts/ingest/.env`, git-ignored):**
```
EARTHDATA_USERNAME=
EARTHDATA_PASSWORD=
FIRMS_MAP_KEY=
```
Commit a `.env.example` for both with empty values.

## Appendix B — Global acceptance criteria

- App builds with `strict` TS, zero ESLint errors, `npm audit` clean of highs.
- **Zero** live NASA calls at request time (grep: no NASA hosts in `app/` or `lib/`).
- Every user-facing string resolves through `t()`; adding a locale needs no code change.
- Every displayed metric shows a `SourceLabel`.
- Farmer flow passes axe at 360px width, ≥18px body, ≥4.5:1 contrast.
- Officer flow: layer toggle → filter → block select → detail works; placeholders are visibly labelled and return `501`.
- All `data/generated` files validate against `lib/dal/types.ts` schemas (CI-checked).

## Appendix C — Glossary

NDVI (vegetation index) · NDWI (water index) · SPI (precipitation index) · FSS (flood susceptibility) · CWSI (crop water stress) · CSS (crop suitability score) · VWC (volumetric water content) · VPD (vapor pressure deficit) · LST (land surface temperature) · MVT (map vector tile) · DAL (data access layer) · RSC (React Server Component).

---

*AgriClimate Technical Specification — Kynatium Labs · v1.0 · Sept 2026. Companion to product doc v2.3. Locked decisions D1–D4 govern; changes require a version bump.*
