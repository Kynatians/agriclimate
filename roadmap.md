# AgriClimate — Project Roadmap

> NASA satellite-powered climate intelligence & early warning platform for agricultural resilience.
> **Kynatium Labs** · Apache 2.0 License

---

## Overview

AgriClimate bridges NASA Earth observation data with agricultural decision-making in vulnerable riverine basins (pilot: **Kurigram District, Bangladesh**). The platform serves two user groups via a mode-switching system:

- **Farmer View** — Touch-optimized, bilingual (EN/BN) advisory interface for smallholder farmers.
- **Officer Panel** — Three-column GIS cockpit with 7 satellite layers, alert dispatch, and district reporting.

Data flows through a pluggable **Data Access Layer** operating in `static`, `live`, or `hybrid` (default) mode with automatic fallback on network failure.

---

## Phase Summary

| Phase | Scope | Release | Status |
|:---:|---|---|:---:|
| 0 | Scaffold, tooling & OKLCH design system | v1.0 | ✅ Complete |
| 1 | Domain contracts, seed data & pluggable DAL | v1.0 | ✅ Complete |
| 2 | Agronomic scoring engine (CSS, FSS, SPI, CWSI) & crop KB | v1.0 | ✅ Complete |
| 3 | Internal route handlers & telemetry API | v1.0 | ✅ Complete |
| 4 | Shared shell components & i18n (EN/BN) | v1.0 | ✅ Complete |
| 5 | Farmer view (home, map, calendar, recommendations, alerts) | v1.0 | ✅ Complete |
| 6 | Officer GIS control panel (cockpit, alerts, reports) | v1.0 | ✅ Complete |
| 7 | Live NASA ingestion pipeline & freshness telemetry | v1.1 | 🔄 85% |
| 8 | QA, automated tests & hardening | v1.1 | 🔄 80% |
| 9 | Production scaling, telecom gateways & hardware bridge | v2.0 | ⏳ 10% |

---

## Phase Details

### Phase 0 — Foundation & Design System ✅

- [x] Next.js 16.3 + React 19 + TypeScript + Tailwind CSS scaffold with Vitest ([vitest.config.ts](./vitest.config.ts))
- [x] OKLCH semantic tokens in [globals.css](./app/globals.css) — light/dark themes, WCAG AAA contrast, status scales
- [x] Accessible UI primitives in [components/ui/](./components/ui) — button, badge, card, dialog, sheet, select, switch, tabs, textarea, tooltip, skeleton

### Phase 1 — Data Contracts & DAL ✅

- [x] Domain models & Zod schemas — [types.ts](./lib/dal/types.ts), [schemas.ts](./lib/dal/schemas.ts)
- [x] Kurigram seed data — 12 blocks with GeoJSON polygons, soil profiles, time-series, alerts ([data/generated/](./data/generated))
- [x] DAL unified API — [static-source.ts](./lib/dal/static-source.ts), [index.ts](./lib/dal/index.ts) · validated in [dal-validation.test.ts](./tests/unit/dal-validation.test.ts)

### Phase 2 — Scoring Engine & Crop KB ✅

- [x] Index formulas — FSS, SPI, CWSI, deficit severity · [formulas.ts](./lib/indices/formulas.ts), [thresholds.ts](./lib/indices/thresholds.ts) · tested in [formulas.test.ts](./tests/unit/formulas.test.ts)
- [x] 24-crop regional knowledge base — [knowledge-base.ts](./lib/crops/knowledge-base.ts)
- [x] Crop Suitability Score (CSS) algorithm with bilingual narratives — [css.ts](./lib/indices/css.ts) · tested in [css.test.ts](./tests/unit/css.test.ts)

### Phase 3 — Route Handlers & API ✅

- [x] Read-only endpoints — `/api/blocks`, `/api/blocks/[id]`, `/api/blocks/[id]/metrics`, `/api/timeseries/[blockId]`, `/api/alerts`, `/api/recommendations/[blockId]`, `/api/irrigation`, `/api/report/[districtId]`
- [x] Interactive endpoints — `POST /api/alerts/dispatch`, pump request CRUD (`/api/pump-requests`), voice query stub (`/api/voice/query`), live sync trigger (`/api/sync/live-nasa`)

### Phase 4 — Shared Shell & i18n ✅

- [x] Top bar, mode toggle, permission dialog, language switcher, notification bell, offline banner, source labels — [components/shared/](./components/shared)
- [x] Bilingual dictionaries — [en.json](./locales/en.json), [bn.json](./locales/bn.json) · client loader in [client.ts](./lib/i18n/client.ts)

### Phase 5 — Farmer View ✅

- [x] Shell & bottom nav (Home / Map / Calendar / Alerts) — [FarmerView.tsx](./components/farmer/FarmerView.tsx), [BottomNav.tsx](./components/farmer/BottomNav.tsx), [VoiceFab.tsx](./components/farmer/VoiceFab.tsx)
- [x] Home dashboard — weather, soil strata, crop condition, daily decisions, solar pump dial, trends chart, radar summary
- [x] Detail modals — weather, crop care, irrigation, pump request, telemetry
- [x] Map tab — [FarmerBlockMap.tsx](./components/farmer/FarmerBlockMap.tsx) · Calendar tab — [CropCalendarView.tsx](./components/farmer/CropCalendarView.tsx) · Alerts tab — [AlertsListView.tsx](./components/farmer/AlertsListView.tsx)
- [x] Crop recommendations — [CropRecoCard.tsx](./components/farmer/CropRecoCard.tsx), [CropRecommendationModal.tsx](./components/farmer/CropRecommendationModal.tsx)

### Phase 6 — Officer Control Panel ✅

- [x] 3-column cockpit (desktop) / tabbed collapse (mobile) — [OfficerShell.tsx](./components/officer/OfficerShell.tsx)
- [x] MapLibre GL engine + 7 satellite layers (NDVI, soil moisture, flood risk, CWSI, precip forecast, pump rota, thermal) — [MapCanvas.tsx](./components/map/MapCanvas.tsx), [layers.ts](./lib/map/layers.ts)
- [x] Control panel with layer toggles & alert feed — [ControlPanel.tsx](./components/officer/ControlPanel.tsx), [AlertFeed.tsx](./components/officer/AlertFeed.tsx)
- [x] Data panel — district summary & block detail with sparklines — [DataPanel.tsx](./components/officer/DataPanel.tsx)
- [x] Alert composer + SMS dispatch — [AlertComposer.tsx](./components/officer/AlertComposer.tsx) · District reporting — [ReportModal.tsx](./components/officer/ReportModal.tsx)
- [x] Pump request triage queue — [PumpRequestQueue.tsx](./components/officer/PumpRequestQueue.tsx)

### Phase 7 — Live NASA Ingestion 🔄

- [x] TypeScript clients — [power-client.ts](./lib/nasa/power-client.ts) (POWER API), [firms-client.ts](./lib/nasa/firms-client.ts) (FIRMS API), [cache-manager.ts](./lib/nasa/cache-manager.ts)
- [x] DAL live adapter with resilient fallback — [live-source.ts](./lib/dal/live-source.ts)
- [x] Python ingest scripts — [fetch_power.py](./scripts/ingest/fetch_power.py), [fetch_firms.py](./scripts/ingest/fetch_firms.py), [fetch_landsat_stac.py](./scripts/ingest/fetch_landsat_stac.py)
- [ ] AppEEARS ingestion — `fetch_appeears.py` (MOD13Q1 NDVI, SPL4SMGP soil moisture)
- [ ] Zonal harmonization — `build_live_dataset.py` (raster-to-vector extraction)
- [x] On-demand sync endpoint + officer cockpit integration — [route.ts](./app/api/sync/live-nasa/route.ts)

### Phase 8 — QA & Hardening 🔄

- [x] Unit tests (Vitest) — CSS scoring, formulas, DAL validation, NASA client parsers
- [x] Component tests (Testing Library) — CropRecoCard, FarmerHome, LayerToggleList, MapCanvas, ModeToggle
- [x] CI — [ci.yml](./.github/workflows/ci.yml) · Browser capture scripts in `scripts/`
- [ ] Playwright E2E smoke suite — `tests/e2e/smoke.spec.ts`
- [ ] Axe-Core accessibility scanning in CI

### Phase 9 — Production Horizon ⏳

- [ ] Multilingual voice AI — STT/NLP/TTS pipeline for regional Bengali dialects
- [ ] Telecom SMS & IVR broadcast gateways (Banglalink, Grameenphone, Robi, Twilio)
- [ ] IoT solar pump telemetry bridge (MQTT/Modbus)
- [ ] Cloud-optimized raster tiling (COG/PMTiles)
- [ ] Enterprise auth & government SSO (replace [mock-session.ts](./lib/auth/mock-session.ts))
- [ ] PWA with 48-hour offline service worker
- [ ] National scaling — all 64 districts, 495 upazilas

---

## NASA Satellite Integration

| Dataset | Product | Resolution | Use Case | Status |
|---|---|---|---|:---:|
| POWER | Daily Point REST (GEOS-FP) | 0.5° / daily | Solar, temp, humidity, wind, rainfall | ✅ Live |
| FIRMS | VIIRS 375m NRT | 375 m / NRT | Fire & thermal anomaly alerts | ✅ Live |
| Landsat 8/9 | Collection 2 L2 | 30 m / 16-day | Vegetation change via STAC | ✅ STAC |
| GPM IMERG | 3B-DAY | 0.1° / daily | Flood warnings, SPI | ✅ Seed |
| SMAP | L4 Root-Zone | ~9 km / 3-day | Soil moisture deficit | ✅ Seed |
| MODIS | MOD13Q1 250m | 250 m / 16-day | NDVI anomaly baselines | ✅ Seed |
| SRTM DEM | 30m static | 30 m / static | Terrain slope & flood vectors | ✅ Seed |

---

## Quick Reference

| Resource | Path |
|---|---|
| Product spec | [agriclimate.md](./docs/agriclimate.md) |
| Tech spec | [agriclimate-tech-spec.md](./docs/agriclimate-tech-spec.md) |
| Frontend plan | [frontend-implementation-plan.md](./docs/plans/frontend-implementation-plan.md) |
| NASA data plan | [live-nasa-data-plan.md](./docs/plans/live-nasa-data-plan.md) |
| App shell | [page.tsx](./app/page.tsx) · [layout.tsx](./app/layout.tsx) |
| Design tokens | [globals.css](./app/globals.css) |
| State store | [ui.ts](./lib/stores/ui.ts) |
| DAL | [index.ts](./lib/dal/index.ts) |
| Scoring | [css.ts](./lib/indices/css.ts) · [formulas.ts](./lib/indices/formulas.ts) |
| Crop KB | [knowledge-base.ts](./lib/crops/knowledge-base.ts) |
| Map engine | [MapCanvas.tsx](./components/map/MapCanvas.tsx) |
| Officer cockpit | [OfficerShell.tsx](./components/officer/OfficerShell.tsx) |
| Farmer view | [FarmerView.tsx](./components/farmer/FarmerView.tsx) |
