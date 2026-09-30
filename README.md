# AgriClimate
## NASA Satellite-Powered Climate Intelligence Platform for Agricultural Resilience

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-6.x-blueviolet.svg?style=flat)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AgriClimate** is a NASA satellite data-powered climate intelligence and early warning platform designed for two complementary user groups:
1. **Smallholder Farmers:** Minimal, high-contrast, action-oriented advisory on weather, crop conditions, irrigation scheduling, and extreme weather alerts.
2. **Agricultural Extension Officers:** Tactical GIS command center with block-level satellite layers, time-series anomaly monitoring, broadcast warning dispatch, and district telemetry reports.

Rather than fragmenting into separate apps, **AgriClimate** provides a unified application with a seamless **mode-switching architecture** — sharing a robust data access layer (DAL) while tailoring interfaces to each user's context and device.

---

## Key Capabilities

- **NASA Satellite Telemetry:** Integrates orbital data streams from:
  - **MODIS (Terra & Aqua):** 250m Normalized Difference Vegetation Index (NDVI) & Land Surface Temperature (LST).
  - **Landsat 8 & 9:** High-resolution 30m multi-spectral surface reflectance & water indices via Microsoft Planetary Computer STAC.
  - **SMAP (Soil Moisture Active Passive):** 0–5 cm surface and 0–100 cm root-zone volumetric soil moisture.
  - **GPM IMERG:** Sub-hourly calibrated precipitation rates and 7-day accumulation for Standardized Precipitation Index (SPI) tracking.
  - **NASA POWER:** Reanalysis climatology (solar irradiance, wind speed, relative humidity, temperature).
  - **NASA FIRMS:** Near-real-time VIIRS 375m active fire & thermal anomaly alerts for stubble burn detection.
- **Dual-Mode User Interface:**
  - **Farmer View:** Touch-friendly, low-cognitive-load cards, local language default (বাংলা / English), offline caching, and voice interface placeholder.
  - **Officer Control Panel:** 3-column GIS dashboard with interactive MapLibre choropleth layers, tabular block metrics, telemetry export, and alert composition.
- **Predictive Early Warnings:** 48–72 hour advance lead times for flash floods, severe droughts, cyclone rainfall, and waterlogging.
- **Solar Irrigation Hydro-Scheduler:** Allocates irrigation rotations based on Crop Water Stress Index (CWSI) and root-zone moisture deficits.
- **Hybrid Data Access Layer (DAL):** Operates deterministically with pre-computed offline seed data, with pluggable live NASA synchronization (`DATA_SOURCE_MODE=hybrid`).

---

## System Architecture

```
                 OFFLINE / INGESTION PIPELINE
┌──────────────────────────────────────────────────────────────┐
│  scripts/ingest/  (Python / TypeScript)                      │
│  NASA POWER · GPM · SMAP · MODIS · Landsat · FIRMS · SRTM    │
│      │  fetch & spatial zonal sampling                       │
│      ▼  compute indices (NDVI anom, SPI, FSS, CWSI)          │
│  writes → data/generated/*.json                              │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
                   RUNTIME (Next.js App Router)
┌──────────────────────────────────────────────────────────────┐
│  app/api/*        Route handlers (Sync & dispatch)           │
│      │                                                       │
│      ▼                                                       │
│  lib/dal/         Pluggable DAL (Seed data + live adapters)  │
│  lib/indices/     Crop suitability scoring & risk formulas   │
│      │                                                       │
│      ▼                                                       │
│  app/(farmer) · app/(officer)   Responsive React UI          │
│      MapLibre GL · TanStack Query · Zustand · i18n           │
└──────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
agriclimate/
├── app/                          # Next.js App Router
│   ├── (farmer)/                 # Farmer View routes (Home, Map, Calendar, Alerts)
│   ├── (officer)/                # Officer Control Panel GIS routes
│   ├── api/                      # Route handlers & Live NASA sync endpoints
│   ├── layout.tsx                # App shell, fonts, providers, metadata
│   └── globals.css               # Design system tokens & OKLCH color palettes
├── components/
│   ├── farmer/                   # Farmer View specialized components
│   ├── officer/                  # Officer GIS, table, feed & modal components
│   ├── map/                      # MapLibre GL map engine & tactical overlays
│   └── shared/                   # TopBar, ModeToggle, LanguageSwitcher, OfflineBanner
├── data/
│   ├── generated/                # Deterministic block-level telemetry & geojson
│   └── live/                     # Ephemeral cached live satellite feeds
├── docs/
│   ├── agriclimate.md            # Product & Planning Specification (v2.3)
│   ├── agriclimate-tech-spec.md  # Engineering Build Contract & Architecture (v1.0)
│   └── plans/                    # Frontend and Live NASA Ingestion Plans
├── lib/
│   ├── dal/                      # Data Access Layer & Live Data Adapters
│   ├── i18n/                     # Internationalization client (en / bn)
│   ├── nasa/                     # NASA API clients (POWER, FIRMS, Landsat)
│   └── stores/                   # Zustand state stores (UI, Map layers, Auth)
├── locales/
│   ├── en.json                   # English locale strings
│   └── bn.json                   # Bengali (বাংলা) locale strings
├── public/                       # Static assets & MapLibre Web Workers
├── scripts/                      # Satellite data ingestion pipelines
└── tests/                        # Vitest unit & component test suites
```

---

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- `pnpm` (version 10 or 11 recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kynatians/agriclimate.git
   cd agriclimate
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Defaults are pre-configured to operate in `hybrid` mode using deterministic seed data with zero setup).*

4. Run the development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run unit & component test suites
pnpm test

# Run linter
pnpm lint
```

---

## Documentation

For full technical specifications and background research, see:
- [Product & Planning Specification (`docs/agriclimate.md`)](docs/agriclimate.md)
- [Engineering Technical Specification (`docs/agriclimate-tech-spec.md`)](docs/agriclimate-tech-spec.md)
- [Frontend Implementation Plan (`docs/plans/frontend-implementation-plan.md`)](docs/plans/frontend-implementation-plan.md)
- [Live NASA Satellite Ingestion Plan (`docs/plans/live-nasa-data-plan.md`)](docs/plans/live-nasa-data-plan.md)

---

## License

This project is developed under Kynatium Labs. Licensed under the MIT License.
NASA datasets are open and publicly accessible according to NASA EOSDIS Open Data Policy.
