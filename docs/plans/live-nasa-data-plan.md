# AgriSentinel: Live NASA Satellite Data Ingestion Plan

**Author:** Lead Frontend & Systems Architect, Kynatium Labs  
**Target:** Live NASA Satellite Telemetry Integration (NASA POWER, FIRMS, SMAP, MODIS, GPM IMERG, Landsat)  
**Status:** Approved Implementation Architecture  
**Governing Documents:** `docs/agriclimate-tech-spec.md`, `docs/agriclimate.md`, `docs/plans/frontend-implementation-plan.md`  

---

## 1. Executive Summary & Architectural Strategy

### 1.1 The Challenge
NASA satellite missions operate on diverse orbits, revisit intervals, data formats, and access protocols:
- **NASA POWER:** REST API (JSON), instant point/regional daily weather, solar radiation, temperature, zero authentication.
- **NASA FIRMS:** REST API (CSV), near-real-time 3-hour active fire and thermal anomalies, authenticated via free MAP_KEY.
- **NASA SMAP (L3/L4):** Volumetric soil moisture (0-5cm surface, 0-100cm root zone), 9km to 36km HDF5/NetCDF, authenticated via NASA Earthdata Login (CMR / AppEEARS).
- **MODIS (MOD13Q1 / MOD11A1):** 16-day 250m NDVI and daily 1km LST surface temperature composites, GeoTIFF/HDF, authenticated via Earthdata.
- **GPM IMERG (GPM_3IMERGDF):** 0.1 degree half-hourly and daily calibrated precipitation, authenticated via Earthdata GES DISC.
- **Landsat 8/9 (Collection 2 Level 2):** 30m surface reflectance, accessed without NASA auth via Microsoft Planetary Computer STAC API.

### 1.2 The Core Architectural Rule
**Runtime users (farmers on 2G/3G mobile devices or officers during field briefings) must never wait for remote NASA APIs or download heavy HDF5/NetCDF raster files at request time.**
- Calling NASA APIs directly during SSR or client render causes 2s to 12s latency spikes, rate-limiting (HTTP 429), and layout instability.
- Heavy scientific rasters (50MB+ HDF5 granules) cannot be parsed in the browser.

### 1.3 The Solution: The Hybrid Ingestion & DAL Adapter Architecture
AgriSentinel will implement a dual-layer live data architecture:
1. **Server-Side Ingestion Pipeline (`scripts/ingest/` & `/api/sync/live-nasa`):**
   - High-performance, scheduled background fetchers for all target NASA datasets across the Kurigram District bounding box (`[89.5, 25.6, 89.9, 26.05]`) and the 12 block centroids.
   - Spatial zonal sampling: transforms raw rasters/time-series into typed block metrics (`BlockMetrics`, `TimeSeriesPoint[]`).
   - Computes baseline anomalies (`value - 10yr_baseline`), SPI precipitation indices, CWSI plant water stress, and FSS flood susceptibility.
   - Evaluates risk thresholds and generates live `Alert` records.
2. **Pluggable Data Access Layer Adapter (`lib/dal/live-source.ts`):**
   - Extends the existing DAL (`lib/dal/index.ts`) with a unified source provider.
   - Controlled via environment configuration: `DATA_SOURCE_MODE="live" | "static" | "hybrid"`.
   - **Stale-While-Revalidate (SWR) File & Memory Cache:** Returns freshly ingested telemetry immediately (<10ms). If live feeds are momentarily unreachable or rate-limited, the system falls back gracefully to the validated static seed dataset with zero downtime.
   - Every metric retains strict `DataSourceRef` provenance stamps (`dataset`, `resolution`, `lastUpdate`).

---

## 2. NASA Satellite Data Feeds & Endpoints

| Feed Name | Satellite / Instrument | Temporal Revisit | Spatial Resolution | Access Method & Endpoint | Auth Required | Parameters Mapped to Domain Model |
|---|---|---|---|---|---|---|
| **NASA POWER (Agroclimatology)** | GEOS-FP / MERRA-2 assimilation | Daily (latency ~12-24h) | 0.5° x 0.625° | REST JSON:<br>`https://power.larc.nasa.gov/api/temporal/daily/point` | None | `T2M` (LST temp), `PRECTOTCORR` (Precip), `ALLSKY_SFC_SW_DWN` (Solar MJ), `RH2M` (Humidity), `WS2M` (Wind) |
| **NASA FIRMS** | VIIRS (S-NPP & NOAA-20) / MODIS | NRT (3-hour latency) | 375m | REST CSV:<br>`https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/...` | Free MAP_KEY | `latitude`, `longitude`, `frp` (Fire Radiative Power), `confidence` -> Thermal alert generation |
| **NASA AppEEARS** | MODIS (MOD13Q1, MOD11A1), SMAP (SPL4SMGP) | Daily to 16-day | 250m - 9km | REST API JSON & GeoTIFF extract:<br>`https://appeears.earthdatacloud.nasa.gov/api/` | Earthdata Login (Bearer Token) | `_250m_16_days_NDVI`, `LST_Day_1km`, `Soil_Moisture_Surface`, `Soil_Moisture_Root_Zone` |
| **Microsoft Planetary Computer STAC** | Landsat 8/9 C2 L2 | 8-16 days | 30m | STAC API (SpatioTemporal Asset Catalog):<br>`https://planetarycomputer.microsoft.com/api/stac/v1` | None | Band 4 (Red) + Band 5 (NIR) -> High-res 30m NDVI polygon zonal statistics |
| **NASA CMR / earthaccess** | SMAP, GPM IMERG | 3-day to daily | 9km - 10km | Python `earthaccess` client / CMR search:<br>`https://cmr.earthdata.nasa.gov/search/granules` | Earthdata Login (`.netrc` / env) | Direct granule extraction fallback when AppEEARS queue is busy |

---

## 3. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                            EXTERNAL NASA DATA SERVICES                            |
|                                                                                   |
|  [NASA POWER REST]     [NASA FIRMS CSV]    [AppEEARS API]    [Planetary Computer] |
|   (Daily Weather)       (Fire Alerts)       (SMAP & MODIS)     (Landsat 30m STAC) |
+-----------+--------------------+------------------+-------------------+-----------+
            |                    |                  |                   |
            +--------------------+---------+--------+-------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        INGESTION & SAMPLING ENGINE                                |
|                                                                                   |
|   1. Python Pipeline (`scripts/ingest/`):                                         |
|      - `fetch_power.py`       -> Queries POWER daily point for 12 centroids       |
|      - `fetch_firms.py`       -> Queries active VIIRS detections in Kurigram bbox |
|      - `fetch_appeears.py`    -> Samples MODIS NDVI (MOD13Q1) & SMAP (SPL4SMGP)   |
|      - `fetch_landsat.py`     -> Planetary Computer STAC zonal stats for char     |
|      - `build_telemetry.py`   -> Harmonizes metrics, computes anomaly, validates  |
|                                                                                   |
|   2. Next.js Internal Sync Route (`app/api/sync/live-nasa/route.ts`):             |
|      - On-demand officer refresh & GitHub Action / CRON background worker         |
|      - Direct TypeScript fetcher for lightweight NASA POWER & FIRMS endpoints     |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                          NORMALIZATION & VALIDATION                               |
|                                                                                   |
|   - Compute Anomaly: `anomaly = value - seasonal_baseline`                        |
|   - Pure Mathematical Engines:                                                    |
|     - `lib/indices/formulas.ts`: SPI precipitation index, CWSI, FSS flood score   |
|     - `lib/indices/css.ts`: Crop Suitability Score for 24 regional crops          |
|   - Zod Schema Enforcement: `BlockMetricsSchema.parse()`, `AlertSchema.parse()`   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         DATA ACCESS LAYER (DAL) ADAPTER                           |
|                                                                                   |
|   `lib/dal/live-source.ts`                                                        |
|   - Checks memory / file cache (`data/live/` or Redis)                            |
|   - SWR Cache with configurable TTL (POWER: 6h, FIRMS: 1h, AppEEARS: 24h)         |
|   - Resilient Fallback: If NASA feeds timeout (>4s) or return 5xx/429:             |
|     Falls back immediately to `data/generated/` static seed                       |
+------------------------------------------+----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
     +------------------------------+             +-------------------------------+
     |         FARMER VIEW          |             |     OFFICER CONTROL PANEL     |
     | - Real-time 7d forecast      |             | - 7 GIS satellite overlays    |
     | - Live soil moisture status  |             | - Live VIIRS fire / flood FSS |
     | - Dynamic CSS crop rankings  |             | - Real-time alert feed        |
     | - Provenance source label    |             | - "Sync Live Telemetry" button|
     +------------------------------+             +-------------------------------+
```

---

## 4. Secret Management & Authentication Configuration

Ingestion credentials must be strictly isolated from client-side bundles and version control.

### 4.1 Environment Variables Matrix (`.env.local` / `.env`)

```bash
# ==============================================================================
# AgriSentinel Live NASA Data Integration Credentials
# ==============================================================================

# Data Source Mode: 'static' (frozen seed data), 'live' (direct live NASA), 'hybrid' (live with seed fallback)
DATA_SOURCE_MODE=hybrid

# NASA Earthdata Login (Used by earthaccess & AppEEARS API)
# Free registration at: https://urs.earthdata.nasa.gov
EARTHDATA_USERNAME=your_earthdata_username
EARTHDATA_PASSWORD=your_earthdata_password

# NASA FIRMS Map Key (Used for VIIRS/MODIS fire & thermal anomalies)
# Free instant key generation at: https://firms.modaps.eosdis.nasa.gov/api/map_key/
FIRMS_MAP_KEY=your_firms_map_key_here

# NASA POWER (Zero authentication required, public REST API)
# Base endpoint: https://power.larc.nasa.gov/api/
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api/temporal/daily/point

# Microsoft Planetary Computer (Zero authentication required for public STAC search)
PLANETARY_COMPUTER_STAC_URL=https://planetarycomputer.microsoft.com/api/stac/v1

# Ingestion Cache TTL Settings (in seconds)
CACHE_TTL_POWER=21600      # 6 hours
CACHE_TTL_FIRMS=3600       # 1 hour
CACHE_TTL_SATELLITE=86400  # 24 hours (MODIS/SMAP)

# Cron Security Token for Automated Ingest Trigger
CRON_SECRET_KEY=agrisentinel_cron_secure_token_sample
```

---

## 5. Detailed Implementation Breakdown

### Phase L1: Lightweight Live NASA Ingestion Client (TypeScript Runtime)
*Goal: Provide instant, zero-credential live weather, soil moisture proxies, and fire telemetry directly within Next.js API routes without external Python dependencies.*

#### Files to Create:
1. `lib/nasa/types.ts`: TypeScript contracts for NASA POWER JSON response, FIRMS CSV records, and AppEEARS bundle schemas.
2. `lib/nasa/power-client.ts`:
   - Pure HTTP client fetching NASA POWER daily point data for all 12 block centroids:
     - Parameters: `T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M`
     - Query range: Past 30 days up to yesterday + current week forecast extrapolation.
     - Parses daily parameter dictionaries into `TimeSeriesPoint[]`.
     - Derives CWSI (Crop Water Stress Index) using VPD calculated from `T2M` and `RH2M`.
3. `lib/nasa/firms-client.ts`:
   - Queries NASA FIRMS REST API for the Kurigram bounding box (`89.5, 25.6, 89.9, 26.05`).
   - Converts active thermal detections into `Alert` domain entities with severity calculated from Fire Radiative Power (FRP > 50 MW -> "high", FRP > 15 MW -> "medium").
4. `lib/nasa/cache-manager.ts`:
   - In-memory and file-based atomic cache stored in `data/live/`.
   - Reads/writes `block-metrics-live.json`, `timeseries-live.json`, and `alerts-live.json`.
   - Respects configurable TTL with stale-while-revalidate semantics.

### Phase L2: DAL Live Adapter & Resilient Fallback Engine
*Goal: Seamlessly connect the existing Data Access Layer to live NASA data with 100% backward-compatible fallback to static seed data.*

#### Files to Create/Modify:
1. `lib/dal/live-source.ts`:
   - Implementation of data readers (`fetchLiveBlocks`, `fetchLiveBlockMetrics`, `fetchLiveTimeSeries`, `fetchLiveAlerts`).
   - Orchestrates cache check -> remote live NASA fetch -> Zod validation.
   - If any NASA endpoint times out (> 4000ms), returns HTTP 429/500, or fails schema validation, logs a warning and falls back immediately to `static-source.ts`.
2. `lib/dal/index.ts`:
   - Inspects `process.env.DATA_SOURCE_MODE`.
   - Exports unified async DAL functions (`listBlocks`, `getBlockMetrics`, `getTimeSeries`, `listAlerts`, `getDistrictSummary`).
   - Stamps every metric with real-time `DataSourceRef` provenance including `lastUpdate: new Date().toISOString()`.

### Phase L3: Heavy Geospatial Ingestion Pipeline (Python / AppEEARS / Planetary Computer)
*Goal: High-resolution satellite raster extraction (SMAP 9km soil moisture, MODIS 250m NDVI, Landsat 30m surface reflectance).*

#### Files to Create in `scripts/ingest/`:
1. `scripts/ingest/requirements.txt`:
   - `requests>=2.31.0`, `pydantic>=2.5.0`, `pystac-client>=0.7.5`, `planetary-computer>=1.0.0`, `shapely>=2.0.0`, `geopandas>=0.14.0`, `numpy>=1.26.0`.
2. `scripts/ingest/fetch_appeears.py`:
   - Submits task requests to NASA AppEEARS API using Earthdata Login credentials.
   - Products requested:
     - `MOD13Q1.061` (NDVI 250m 16-day)
     - `MOD11A1.061` (LST 1km daily)
     - `SPL4SMGP.007` (SMAP L4 Surface & Root-Zone Soil Moisture 9km)
   - Performs zonal statistics across the 12 block polygon geometries from `data/generated/blocks.json`.
3. `scripts/ingest/fetch_landsat_stac.py`:
   - Connects to Microsoft Planetary Computer STAC endpoint (no credentials needed).
   - Searches `landsat-c2-l2` collection for Kurigram bounding box with cloud cover < 20%.
   - Computes top-of-atmosphere and surface reflectance NDVI for char land vegetation monitoring.
4. `scripts/ingest/build_live_dataset.py`:
   - Harmonizes all ingested feeds into unified files matching domain schemas:
     - `data/live/block-metrics.json`
     - `data/live/timeseries.json`
     - `data/live/alerts.json`
     - `data/live/district-summary.json`
   - Runs `zod-validate.ts` to ensure 100% schema compliance before committing to cache.

### Phase L4: On-Demand Sync Route & Officer Cockpit UI Integration
*Goal: Allow agricultural officers to trigger real-time satellite telemetry synchronization directly from the Control Panel.*

#### Files to Create/Modify:
1. `app/api/sync/live-nasa/route.ts`:
   - Protected endpoint (supports officer session and CRON bearer token).
   - Triggers `power-client.ts` and `firms-client.ts` live query.
   - Updates cache and returns refreshed telemetry status, timestamp, and affected blocks count.
2. `components/officer/ControlPanel.tsx`:
   - Adds a "Sync Live NASA Telemetry" button with spin animation during fetch, last-sync timestamp, and success toast.
3. `components/shared/SourceLabel.tsx`:
   - Enhances provenance badge to display live sync indicator (e.g., green pulsing dot for live telemetry under 6 hours old).

---

## 6. Mathematical Synthesis & Anomaly Detection

To turn raw NASA telemetry into actionable farmer advisories, the ingestion engine calculates three critical derived indices:

### 6.1 Baseline Anomaly Calculation
Each block maintains a 10-year historical monthly baseline:
- `ndvi.anomaly = ((ndvi.current - ndvi.baseline) / ndvi.baseline) * 100`
- `soilMoisture.anomaly = soilMoisture.current - soilMoisture.baseline`

### 6.2 CWSI (Crop Water Stress Index) Formulation
Derived from NASA POWER air temperature (`T2M`), relative humidity (`RH2M`), and solar radiation (`ALLSKY_SFC_SW_DWN`):
1. Compute saturated vapor pressure:  
   `e_sat = 0.61078 * exp((17.27 * T2M) / (T2M + 237.3))` (kPa)
2. Compute actual vapor pressure:  
   `e_act = e_sat * (RH2M / 100)` (kPa)
3. Vapor pressure deficit:  
   `VPD = e_sat - e_act`
4. CWSI normalization:  
   `CWSI = clamp(0.25 * (VPD / 2.5) + 0.75 * (1.0 - soilMoistureRootZone / 45.0), 0.0, 1.0)`

### 6.3 Automated Threshold Risk Rules
- If `CWSI > 0.68` for 3 consecutive days: Emit `type="drought"`, `severity="high"` alert with lead time 48h.
- If `GPM IMERG 72h precip > 120mm` and `SRTM slope < 1.5%`: Emit `type="flood"`, `severity="high"` alert with lead time 24h.
- If `soilMoistureSurface > 48% VWC` for > 48 hours: Emit `type="waterlogging"`, `severity="medium"` alert with drainage advice.
- If `VIIRS FRP > 30 MW`: Emit `type="fire"`, `severity="medium"` stubble burn advisory.

---

## 7. Step-by-Step Execution Plan

```
+-------------------------------------------------------------------------------+
|                           STEP-BY-STEP ROADMAP                                |
+-------------------------------------------------------------------------------+
| Step 1: NASA Types & Client Contracts (`lib/nasa/types.ts`)                   |
|         - Define exact schemas for POWER, FIRMS, and AppEEARS payloads.       |
|                                                                               |
| Step 2: NASA POWER Client (`lib/nasa/power-client.ts`)                       |
|         - Build resilient fetcher for 12 centroids with retry & timeout logic.|
|         - Derive daily time series and CWSI stress indices.                   |
|                                                                               |
| Step 3: NASA FIRMS Client (`lib/nasa/firms-client.ts`)                       |
|         - Parse VIIRS NRT CSV detections in Kurigram bounding box.            |
|         - Map fire radiative power to domain alerts.                          |
|                                                                               |
| Step 4: Live Cache Manager & Storage (`lib/nasa/cache-manager.ts`)            |
|         - File-based atomic JSON storage in `data/live/` with SWR TTL.        |
|                                                                               |
| Step 5: DAL Live Source Adapter (`lib/dal/live-source.ts`)                    |
|         - Connect public DAL to cache manager with fallback to static seed.   |
|         - Verify zero breaking changes to existing components and tests.      |
|                                                                               |
| Step 6: Route Handler for Live Sync (`app/api/sync/live-nasa/route.ts`)       |
|         - Build authenticated endpoint for officer trigger and scheduled cron.|
|                                                                               |
| Step 7: Officer Cockpit Live Sync UI Integration                              |
|         - Add "Sync Live Telemetry" button to ControlPanel.                   |
|         - Add live indicator to SourceLabel and TopBar status.                |
|                                                                               |
| Step 8: Offline Python Ingestion Scripts (`scripts/ingest/`)                  |
|         - Provide AppEEARS and Planetary Computer STAC scripts for batch runs.|
|                                                                               |
| Step 9: Verification, Tests & Build Validation                                |
|         - Unit tests for NASA response parsing and anomaly derivation.        |
|         - Mock network failure test verifying instant seed data fallback.     |
|         - Verify `pnpm test` and `pnpm build` pass with zero errors.          |
+-------------------------------------------------------------------------------+
```

---

## 8. Verification & Acceptance Criteria

1. **Deterministic Fallback (100% Uptime Guarantee):**
   - If network is disconnected or NASA endpoints return 500/429/timeout, `lib/dal` must seamlessly return cached seed data without throwing errors or breaking UI rendering.
2. **Schema Integrity:**
   - 100% of live metrics transformed from NASA feeds must pass Zod validation against `BlockMetricsSchema`, `TimeSeriesPointSchema`, and `AlertSchema`.
3. **Performance Budget:**
   - All page loads must complete in under 500ms by reading from local SWR cache. Remote NASA queries only run in background workers or during explicit officer sync actions.
4. **Data Provenance:**
   - Every live metric card and tooltip must display authentic provenance (`dataset`, `resolution`, `lastUpdate`).
5. **Anti-Slop Compliance:**
   - Zero em-dashes (`U+2014`) allowed in any generated alert text, code, or documentation.

---
*Implementation Plan authored by Lead Frontend & Systems Architect - Kynatians Labs · Ready for User Sign-Off.*
