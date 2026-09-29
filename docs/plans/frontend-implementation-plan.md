# AgriSentinel — Frontend Implementation Plan
**Platform:** NASA Satellite-Powered Climate Intelligence Platform for Agricultural Resilience  
**Author:** Lead Frontend Engineer & Planner, AgriSentinel (Kynatium Labs)  
**Date:** September 2026  
**Status:** Ready for Review (Draft Implementation Plan — Code Implementation Blocked Pending Approval)  
**Target Repository:** `kynatians/agriclimate`  
**Governing Documents:** `docs/agriclimate-tech-spec.md` (v1.0), `docs/agriclimate.md` (v2.3), `.agents/` conventions, `AGENTS.md`

---

## 1. Source Audit

A comprehensive review of all configuration rules, agent skills, project documentation, and repository files was conducted prior to drafting this plan.

### 1.1 Files Audited

| Category | File Path | Key Insights & Binding Frontend Directives |
|---|---|---|
| **Root Rules** | `AGENTS.md` | **Next.js 16 breaking changes notice**: Server Components conventions, async `params`/`searchParams`, metadata APIs, and route handler conventions must adhere to Next.js 16 runtime guides (`node_modules/next/dist/docs/`). No outdated Next.js 13/14 assumptions. |
| **Root Context** | `CLAUDE.md`, `README.md` | Project initialized with `create-next-app` under pnpm. References `AGENTS.md`. |
| **Agent Skills** | `.agents/skills/design-taste/SKILL.md` | Non-negotiable aesthetic floor: Iron Law ("never ship the first version"), Design Read declaration, dials definition, typography scales, single accent lock, OKLCH/semantic neutrals, no pure `#000`/`#fff`. |
| **Design Ref** | `.agents/skills/design-taste/reference/anti-slop.md` | **Hard bans**: ZERO em-dashes (`U+2014`) anywhere in copy or code; no side-stripe borders; no gradient text; no default glassmorphism; no generic 3-column identical card rows; no fake div-based screenshots; no over-rounded cards (>16px); no decorative status dots without real semantic state; no placeholder names like "John Doe" or "Acme". |
| **Design Ref** | `.agents/skills/design-taste/reference/core-rules.md` | Typography contrast ratio >= 1.25; body measure 65-75ch; one accent color locked across whole page; corner radius consistency lock; no purple/blue AI glow; real visual assets / real SVG icons from libraries (lucide-react); no hand-rolled decorative SVG vectors. |
| **Design Ref** | `.agents/skills/design-taste/reference/design-systems.md` | System choice: Radix/shadcn + Tailwind tokens. Dials for Operate mode (Variance 3-5, Motion 3-4, Density 5-7/8-9). One design system per project. Responsive grids without arbitrary breakpoint hacks. |
| **Design Ref** | `.agents/skills/design-taste/reference/interaction-states.md` | Mandatory 8 states for all interactive elements: default, hover, focus-visible, active (`scale(0.97)` / `translate-y`), disabled, loading (skeletons, not mid-screen spinners), error, success. Labels above inputs; native `<dialog>` or popovers. Touch targets >= 44px (farmer view >= 48px). |
| **Design Ref** | `.agents/skills/design-taste/reference/motion.md` | Emil Kowalski motion framework: UI transitions <= 250ms, ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`), entry from `scale(0.95)` + opacity (never `scale(0)`), exit faster than enter, **NEVER animate keyboard-initiated actions**, strict `prefers-reduced-motion` fallbacks. |
| **Design Ref** | `.agents/skills/design-taste/reference/pre-flight.md` | Pre-flight matrices for Universal Core and Operate surfaces: contrast checks, descender clipping reserve, table-based Before/After review format, mechanical scans for banned patterns. |
| **Design Ref** | `.agents/skills/emil-design-eng/SKILL.md` | Tactile feedback, component craftsmanship, transform hardware acceleration, popover transform origins matched to trigger. |
| **Design Ref** | `.agents/skills/impeccable/SKILL.md` | Production-grade code, deep domain fit, bounded verification passes, "The brief wins", Operate mode scanability and task focus. |
| **Product Doc** | `docs/agriclimate.md` (v2.3) | Product requirements for NASA climate resilience platform. Problem statement, 7 core feature modules, single unified app with mode-switching architecture (Farmer View vs Officer Control Panel), SMS/IVR fallback, voice UI placeholder (56dp FAB), CARTO colorblind palettes, 48-72h lead-time early warning, crop recommendation cards, pump routing, compound advisory. |
| **Tech Spec** | `docs/agriclimate-tech-spec.md` (v1.0) | **Binding build contract**: Locked decisions D1-D4 (single web app, Next.js route handlers + static data, zero live NASA calls at runtime, Next.js App Router + TypeScript + Tailwind + shadcn/ui + MapLibre GL + TanStack Query + Zustand + i18next + Recharts). DAL contract (`lib/dal`), domain types (`lib/dal/types.ts`), internal API routes, CSS scoring pure formula (`lib/indices/css.ts`), component props contracts (§10.3), engineering standards (§11), a11y standards (>=18px farmer body, >=4.5:1 contrast), testing bar (§13), phased roadmap (§14). |
| **Repo Config** | `package.json`, `pnpm-lock.yaml` | Current dependencies: `next: 16.3.6`, `react: 19.2.8`, `react-dom: 19.2.8`, `tailwindcss: ^4`, `@tailwindcss/postcss: ^4`, `typescript: ^5`. Package manager: `pnpm@11.3.0`. |
| **Repo Config** | `tsconfig.json`, `next.config.ts` | Strict mode enabled, `@/*` path aliases to root. App Router structure in `app/`. |

### 1.2 Extracted Non-Negotiable Rules Governing Frontend Work

1. **Zero Runtime External API Calls (D3, tech-spec §0, §1, §8)**: The frontend and internal route handlers must NEVER invoke NASA servers or external geospatial APIs directly. All data flows strictly through `lib/dal`, which reads bundled, pre-analyzed JSON records in `data/generated/`.
2. **Strict DAL Boundary (tech-spec §1, §6, §15.3)**: No React component or route handler may import from `data/generated/` directly or use filesystem `fs` calls. `lib/dal` is the single public API.
3. **Server-First Architecture (tech-spec §9.1, §11, §15.3)**: React Server Components (RSC) by default for initial page loads and static layouts. Mark `"use client"` exclusively on leaf components requiring browser hooks, MapLibre canvas, Zustand subscriptions, or local DOM events.
4. **Three Independent State Stores (tech-spec §9.2)**:
   - Server Cache: TanStack Query (v5) with documented deterministic keys.
   - UI / Session State: Zustand (`lib/stores/ui.ts`) for mode, selected block, active map layers, filters, locale.
   - Form State: React Hook Form + Zod for officer note and alert composer.
5. **Mode-Switch Architecture (tech-spec §0 D1, §9.3; product doc §7.1)**: Unified application shell. Persistent top bar with `<ModeToggle />`. Instant switching without reload or re-authentication. Role-gated via `lib/auth/mock-session.ts` (unauthorized farmer receives an explanatory dialog).
6. **Design Tokens Defined Once (tech-spec §10.1; design-taste §4)**: All colors, typography steps, radii, elevations, and status scales defined as CSS variables in `app/globals.css`. Zero hardcoded hex values or arbitrary ad-hoc Tailwind numbers.
7. **Accessibility & Farmer Usability (tech-spec §10.1, §11.1; product doc §7.2, §9)**:
   - Farmer View body text minimum 18px (`1.125rem`), high contrast >= 4.5:1.
   - Touch targets minimum 48px on mobile (Voice FAB 56dp).
   - Icon + text pairing on every farmer data point (low-literacy accessibility).
   - Non-map tabular/list alternative for all geospatial data so screen readers and low-bandwidth users have 100% feature access.
8. **Anti-Slop & Craft Hygiene (.agents/skills/design-taste/reference/anti-slop.md)**:
   - Absolute ban on em-dashes (`U+2014`). Use standard hyphens, colons, or parentheses.
   - No generic cards with decorative side-strip borders (`border-l-4`).
   - No AI-purple/blue glow or gradient text.
   - Skeletons for every loading state; structured empty and error states.
   - Realistic, localized domain data (Kurigram/Rangpur district, real crop names, genuine metric ranges).
9. **Honest Placeholders (tech-spec §0, §7, §10.3, §12, §15.3)**: Unimplemented capabilities (Voice STT/NLP, SMS dispatch, automated PDF generator) must render visibly labeled as "Coming Soon" / prototype placeholders, and their corresponding API routes must return HTTP `501 Not Implemented` with `{ placeholder: true }`.

---

## 2. Requirements Traceability Matrix

Every requirement across `docs/agriclimate-tech-spec.md` (tech-spec) and `docs/agriclimate.md` (product doc) is indexed below and mapped to its concrete implementation unit, file location, phase task, and acceptance check.

| Req ID | Document & Section | Requirement Description | Implementing Component / Route / File | Phase & Task | Scope Status | Acceptance Check |
|---|---|---|---|---|---|---|
| **R-01** | tech-spec §0 D1, §9.3; product doc §7.1 | Unified dual-mode app with persistent top-bar mode toggle (Farmer vs Officer) | `components/shared/ModeToggle.tsx`, `components/shared/TopBar.tsx`, `app/layout.tsx` | Phase 4 (T4.1) | Full | Clicking toggle switches mode in Zustand store and routes between `(farmer)` and `(officer)` shells instantly without full reload. |
| **R-02** | tech-spec §9.3, §12; product doc §7.1 | Role-gated mode switch; farmer role attempting Officer view receives permission dialog | `lib/auth/mock-session.ts`, `components/shared/ModeToggle.tsx`, `components/shared/PermissionDialog.tsx` | Phase 4 (T4.1) | Full (mocked session) | When session role is `farmer`, tapping "Officer" displays permission modal explaining restricted access; when session is `officer`, switches view immediately. |
| **R-03** | tech-spec §10.3; product doc §7.4 | Notification bell with unread badge count, opening notification sheet | `components/shared/NotificationBell.tsx`, `components/shared/AlertsSheet.tsx` | Phase 4 (T4.1) | Full | Bell displays badge count of active high/medium alerts; clicking opens slide-over sheet listing current alerts with dismiss action. |
| **R-04** | tech-spec §10.3; product doc §7.4, §9.2 | Offline banner with last sync timestamp when device loses connectivity | `components/shared/OfflineBanner.tsx` | Phase 4 (T4.1) | Full | Fires when `navigator.onLine` turns false; displays yellow banner with formatted timestamp of last data fetch. |
| **R-05** | tech-spec §4, §8.4, §10.3; product doc §7.3.2 | Provenance source badge for every displayed metric (dataset, resolution, timestamp) | `components/shared/SourceLabel.tsx` | Phase 4 (T4.1) | Full | Renders "SMAP L3 · 500m · 08:42 UTC" style label matching `DataSourceRef`. Renders in all metric tiles, cards, and tooltips. |
| **R-06** | tech-spec §10.3 | Atomic dashboard metric tile with icon, value, unit, delta, trend, and source | `components/shared/StatTile.tsx` | Phase 4 (T4.1) | Full | Renders metric value with anomaly arrow (green/red based on agronomic impact), optional trend sparkline, and source label. |
| **R-07** | tech-spec §10.3 | Metric severity badge with colorblind-safe styling | `components/shared/MetricBadge.tsx` | Phase 4 (T4.1) | Full | Renders severity pill ("high", "medium", "low") with compliant background, text contrast, and accessible border. |
| **R-08** | tech-spec §10.3 | Historical trend sparkline chart for metrics | `components/shared/TrendSparkline.tsx` | Phase 4 (T4.1) | Full | Renders miniature Recharts SVG line with zero layout shift, responsive width, and no axis clutter. |
| **R-09** | tech-spec §9.4; product doc §7.4, §9.3 | Global localization support (English & Bengali) with language switcher | `lib/i18n/*`, `locales/en.json`, `locales/bn.json`, `components/shared/LanguageSwitcher.tsx` | Phase 4 (T4.2) | Full | All user-facing text wrapped in `t()`. Switching language updates entire UI immediately without page reload. |
| **R-10** | tech-spec §10.3; product doc §7.2 | Farmer mobile shell with persistent bottom navigation bar and voice FAB | `app/(farmer)/layout.tsx`, `components/farmer/BottomNav.tsx` | Phase 5 (T5.1) | Full | Bottom bar with 4 tabs (Home, Map, Calendar, Alerts), active state styling, minimum 48px touch targets. |
| **R-11** | tech-spec §0, §7, §10.3, §11.1; product doc §7.2, §9.4 | 56dp floating voice microphone button (Voice FAB) with prototype placeholder modal | `components/farmer/VoiceFab.tsx` | Phase 5 (T5.1) | Visibly labeled Placeholder | Fixed at bottom-right, 56dp size, accessible aria-label; tapping opens dialog explaining voice recognition is a planned production feature. |
| **R-12** | tech-spec §10.3; product doc §6 M1, §7.2 | Farmer WeatherCard showing temperature, rain probability, plain-language soil condition | `components/farmer/WeatherCard.tsx`, `app/(farmer)/page.tsx` | Phase 5 (T5.1) | Full | Displays 2m temperature (°C), 7-day precipitation forecast, and localized qualitative soil status (e.g. "Adequate moisture"). Body text >= 18px. |
| **R-13** | tech-spec §10.3; product doc §6 M3, §7.2 | Farmer CropConditionCard showing crop health stress level from CWSI/NDVI | `components/farmer/CropConditionCard.tsx`, `app/(farmer)/page.tsx` | Phase 5 (T5.1) | Full | Renders vegetation status (improving/stable/declining), plant water stress level, icon + text pairing. |
| **R-14** | tech-spec §10.3; product doc §6 M2, §7.2 | Farmer AlertCard for urgent climate/hazard early warnings | `components/farmer/AlertCard.tsx`, `app/(farmer)/page.tsx` | Phase 5 (T5.1) | Full | High-contrast banner with severity styling, event lead time ("48h lead time"), localized detail text, "View Details" and "Dismiss" buttons. |
| **R-15** | tech-spec §10.3; product doc §6 M6, §7.2 | Farmer Irrigation & Compound quick tiles on Home screen | `components/farmer/HomeActionTiles.tsx`, `app/(farmer)/page.tsx` | Phase 5 (T5.1) | Full | Two high-visibility cards: "Irrigation Needed Today" (from SMAP deficit) and "Compound Tip" (e.g. "Apply urea 50kg/ha before next rain"). |
| **R-16** | tech-spec §10.3; product doc §6 M5, §7.2 | Farmer Crop Calendar preview teaser card on Home screen | `components/farmer/CalendarTeaserCard.tsx`, `app/(farmer)/page.tsx` | Phase 5 (T5.1) | Full | Shows upcoming optimal sowing window with risk confidence percentage (e.g., "Sow boro rice: Oct 14-19 (83% safe)"). Links to Calendar tab. |
| **R-17** | tech-spec §10.3, §10.4; product doc §7.2 | Farmer Map tab: simplified block outline map with traffic-light status | `app/(farmer)/map/page.tsx`, `components/farmer/FarmerBlockMap.tsx` | Phase 5 (T5.2) | Full | Centered on user's registered block. Simple green/yellow/red status fill. Tapping block opens slide-up summary drawer. Non-map accessible list fallback included. |
| **R-18** | tech-spec §10.3; product doc §6 M5, §7.2 | Farmer Calendar tab with seasonal crop calendar, historical advisories, irrigation schedule | `app/(farmer)/calendar/page.tsx`, `components/farmer/CropCalendarView.tsx` | Phase 5 (T5.3) | Full (demonstration replay) | Replays multi-year historical NASA POWER advisories: sowing windows, growth stages, scheduled irrigation events, and heat/rain risk flags. |
| **R-19** | tech-spec §10.3; product doc §6 M2, §7.2 | Farmer Alerts tab: history of active and past alerts | `app/(farmer)/alerts/page.tsx`, `components/farmer/AlertsListView.tsx` | Phase 5 (T5.4) | Full | Filterable list of all alerts (drought, flood, cyclone, waterlogging, fire) with severity badges, timestamps, and full advisory advice. |
| **R-20** | tech-spec §4, §5.2, §10.3; product doc §4, §6 M4, §7.2 | "What to plant?" recommendation flow rendering ranked `CropRecoCard` list | `components/farmer/CropRecoCard.tsx`, `components/farmer/CropRecommendationModal.tsx` | Phase 5 (T5.5) | Full | Collapsible card per recommended crop: CSS score (0-100), days to harvest, harvest window, estimated ROI, market demand, template "Why this land?", and conditional risk note. |
| **R-21** | tech-spec §10.3, §10.4; product doc §7.3, §7.5 | Officer Panel three-column command interface with responsive phone collapse to tabs | `app/(officer)/layout.tsx`, `app/(officer)/page.tsx`, `components/officer/OfficerShell.tsx` | Phase 6 (T6.1) | Full | Desktop (>=1024px): 3 columns (Control | Map | Data). Mobile (<1024px): 3 tabs (Control, Map, Data) via shadcn `Tabs`. |
| **R-22** | tech-spec §10.3, §10.4; product doc §7.3.2 | MapLibre MapCanvas with satellite base, admin boundaries, choropleth layer rendering | `components/map/MapCanvas.tsx`, `lib/map/layers.ts` | Phase 6 (T6.2) | Full | Vector/GeoJSON choropleth rendering for 7 layers (NDVI, Soil Moisture, Flood Risk, Crop Health, Precip Forecast, Pump Routing, Fire Events) with 300ms transition. |
| **R-23** | tech-spec §10.1, §10.4; product doc §7.3.2 | Colorblind-safe map palettes and dynamic legend | `lib/map/palettes.ts`, `components/map/MapLegend.tsx` | Phase 6 (T6.2) | Full | CARTO "ArmyRose" (diverging) and "Sunset" (sequential) palettes. Dynamic legend reflecting active layer metric steps. |
| **R-24** | tech-spec §10.3, §10.4; product doc §7.3.2 | Map hover tooltip showing block name, metric value, anomaly, source, farmer count | `components/map/BlockTooltip.tsx` | Phase 6 (T6.2) | Full | Interactive hover card displaying block hierarchy, active layer value, secondary indices (NDVI, CWSI), and provenance timestamp. |
| **R-25** | tech-spec §10.3, §10.4; product doc §7.3.2 | Map click block selection with blue border highlight, driving right panel detail | `components/map/MapCanvas.tsx`, `lib/stores/ui.ts` | Phase 6 (T6.2) | Full | Clicking a polygon updates `selectedBlockId` in Zustand, triggers blue outline highlight layer on map, and populates `BlockDetail` in right column. |
| **R-26** | tech-spec §10.4; product doc §7.3.2 | Map canvas controls: zoom, fullscreen, layer opacity slider, draw-select, PNG export | `components/map/MapControls.tsx` | Phase 6 (T6.2) | Full | Zoom +/- controls, fullscreen toggle, opacity range slider, polygon lasso/multi-select, and `canvas.toDataURL()` PNG screenshot export. |
| **R-27** | tech-spec §10.3; product doc §7.3.1 | Officer Left Column: `ControlPanel` containing layer toggles, actions, filters, alert feed | `components/officer/ControlPanel.tsx`, `components/officer/LayerToggleList.tsx` | Phase 6 (T6.3) | Full | Checkboxes for all 7 layers, action buttons (Send Alert, Gen Report, SMS Dispatch, Refresh Data), dropdown filters (severity, crop, period). |
| **R-28** | tech-spec §10.3; product doc §7.3.1 | Officer AlertFeed with live items, severity badges, and "Annotate → SMS" action | `components/officer/AlertFeed.tsx` | Phase 6 (T6.3) | Full | Lists active district alerts. Clicking "Annotate → SMS" opens `AlertComposer` pre-populated with alert details. |
| **R-29** | tech-spec §10.3; product doc §7.3.3 | Officer Right Column: `DataPanel` showing district summary aggregates in default state | `components/officer/DataPanel.tsx`, `components/officer/DistrictSummaryView.tsx` | Phase 6 (T6.4) | Full | Default state displays district name, total blocks, average NDVI + anomaly, average soil moisture + anomaly, active alert counts, and registered farmer total. |
| **R-30** | tech-spec §10.3; product doc §6 M7, §7.3.3 | Officer `BlockDetail` drawer/view showing complete metrics, trends, crops, compound tip | `components/officer/BlockDetail.tsx` | Phase 6 (T6.4) | Full | Appears when block is selected: NDVI + trend, soil moisture surface + root zone, precip actual + forecast, FSS flood score, LST, CWSI, crop stage, compound advisory, officer note textarea. |
| **R-31** | tech-spec §0, §7, §10.3, §12; product doc §7.3.4 | Officer `AlertComposer` modal with system text, officer note, channel select, dispatch | `components/officer/AlertComposer.tsx`, `app/api/alerts/dispatch/route.ts` | Phase 6 (T6.5) | Visibly labeled Placeholder (501) | Modal enables writing note and previewing message; clicking "Send Dispatch" calls `/api/alerts/dispatch`, receives 501, and displays toast confirming placeholder status. |
| **R-32** | tech-spec §7, §10.3; product doc §7.3.4 | Officer Report generation preview modal for district summary payload | `components/officer/ReportModal.tsx`, `app/api/report/[districtId]/route.ts` | Phase 6 (T6.6) | Full (on-screen report view) | Displays formatted printable/downloadable on-screen district report with NDVI heatmap summary, soil moisture stats, irrigation ranking, and farmer roster. |
| **R-33** | tech-spec §4, §6; product doc §5.2 | Data Access Layer (`lib/dal`) providing typed async access to seed datasets | `lib/dal/index.ts`, `lib/dal/static-source.ts`, `lib/dal/types.ts` | Phase 1 (T1.1, T1.3) | Full | Exposes `listBlocks`, `getBlock`, `getBlockMetrics`, `getTimeSeries`, `listAlerts`, `getDistrictSummary`. Pure async contract, Zod validated. |
| **R-34** | tech-spec §5.1, §5.2; product doc §6 M4 | Pure TypeScript Crop Suitability Scoring (CSS) engine | `lib/indices/css.ts`, `lib/indices/formulas.ts`, `lib/indices/thresholds.ts` | Phase 2 (T2.1, T2.3) | Full | Implements 5-dimension weighted match (moisture 30%, temp 25%, rainfall 20%, solar 15%, ndvi 10%), string interpolation for `whyThisLand`, and `riskNote`. Pure function, unit-tested. |
| **R-35** | tech-spec §4, §6.4; product doc §4.2 | Typed Crop Knowledge Base of 20-30 pilot regional crops | `lib/crops/knowledge-base.ts` | Phase 2 (T2.2) | Full | Structured JSON/TS dataset with optimal moisture/temp ranges, water requirements, solar needs, days to harvest, ROI, market demand, and localized notes. |
| **R-36** | tech-spec §7; product doc §5.2 | Next.js API route handlers acting as thin controllers over DAL and scoring | `app/api/*` | Phase 3 (T3.1, T3.2) | Full | Implement `GET /api/blocks`, `GET /api/blocks/[id]`, `GET /api/blocks/[id]/metrics`, `GET /api/timeseries/[blockId]`, `GET /api/alerts`, `GET /api/recommendations/[blockId]`, `GET /api/irrigation`, `GET /api/report/[districtId]`. Zod validated queries, `revalidate = 3600`. |
| **R-37** | tech-spec §0, §7, §12; product doc §4, §9.4 | Placeholder route handlers for SMS dispatch and Voice query | `app/api/alerts/dispatch/route.ts`, `app/api/voice/query/route.ts` | Phase 3 (T3.2) | Visibly labeled Placeholder (501) | Both return HTTP `501 Not Implemented` with `{ placeholder: true, message: "..." }`. |
| **R-38** | tech-spec §11.1; product doc §9.1, §9.2 | High contrast WCAG AA (>= 4.5:1), large text, keyboard reachability, screen-reader table fallbacks | `app/globals.css`, all components | Phase 7 (T7.3) | Full | Axe-core CI audit pass with 0 critical or serious violations. Full tab navigation and focus indicators across officer panel. |

---

## 3. Gap and Conflict Report

An engineering audit comparing `docs/agriclimate.md` (product doc), `docs/agriclimate-tech-spec.md` (tech spec), `.agents/` rules, and the active repository identified the following tensions, ambiguities, and TBD values.

### 3.1 Gaps, Ambiguities & Contradictions Matrix

| Item # | Topic | Tech Spec (v1.0) | Product Doc (v2.3) | Current Repo State | Engineering Resolution & Recommendation | User Decision Status |
|---|---|---|---|---|---|---|
| **GC-1** | **Next.js & React Version** | §2: Next.js 15.x, React 19, TypeScript 5.x | §8.2: Next.js 14 App Router | `package.json`: `next: 16.3.6`, `react: 19.2.8`, `eslint-config-next: 16.3.6` | **Adopt Next.js 16 conventions as mandated by `AGENTS.md`**. `AGENTS.md` explicitly warns: *"This is NOT the Next.js you know... breaking changes in Next.js 16"*. Specifically: page/route `params` and `searchParams` are now async Promises; Server Components must `await params`. Next.js 16 with React 19 is fully compatible with our architectural goals. | **Resolved** (follows `AGENTS.md` + repo reality) |
| **GC-2** | **Tailwind CSS Version** | §2: Tailwind CSS 3.4+ (`globals.css` CSS vars) | Not specified | `package.json`: `tailwindcss: ^4`, `@tailwindcss/postcss: ^4`, `globals.css`: `@import "tailwindcss"; @theme inline { ... }` | **Support Tailwind v4 CSS variable architecture**. Tailwind v4 uses standard CSS `@theme` and `@utility` blocks instead of `tailwind.config.js`. We will define all semantic color and typography tokens in `app/globals.css` using standard CSS custom properties mapped through `@theme inline`, perfectly satisfying tech-spec §10.1 without downgrading Tailwind. | **Resolved** (follows repo reality) |
| **GC-3** | **Architecture: Runtime vs Prototype** | §0 D1-D4: Single Next.js web app. No FastAPI, PostGIS, TimescaleDB, Celery, or React Native. Static JSON via DAL. | §5.2, §8.1-8.2: Mentions FastAPI, PostGIS, TimescaleDB, Celery, MinIO, React Native. | Repo is a Next.js web application. | **Follow Tech Spec Locked Decisions D1-D4 strictly**. The tech spec is the binding build contract for this prototype. FastAPI, PostGIS, and React Native are documented as the production migration path (tech-spec §16), not the prototype build. | **Resolved** (governed by D1-D4) |
| **GC-4** | **Pilot Region & Seed Geography** | §14 T1.2: 10 blocks / 1 district seed data. | §10: 10 pilot districts, target region TBD. Context cites Bangladesh char/haor areas (Kurigram/Rangpur). | No seed data files yet. | **Adopt Kurigram District (Rangpur Division) as primary pilot**. Kurigram represents a flood-prone, drought-vulnerable agricultural district with haor/char lands, 9 upazilas (sub-districts), and 84 unions/blocks. We will author 12 realistic blocks for Kurigram (e.g. Chilmari, Ulipur, Nageshwari, Rajarhat, Kurigram Sadar) with genuine agricultural crops (Aman rice, Boro rice, wheat, jute, maize, lentils, mustard). | **Question 1 for User** |
| **GC-5** | **Secondary Language & Locale** | §3, §4: `en` and `bn` (English and Bengali). | §7.2, §9.3: Quotes Bengali voice commands and advisories. | No locale files yet. | **Implement English (`en`) and Bengali (`bn`) as the two standard locales**. All schema types use `LocalizedText: Record<string, string>`. Locales will live in `locales/en.json` and `locales/bn.json`. | **Question 2 for User** |
| **GC-6** | **MapLibre Basemap & Tile Source** | §10.4, App. A: `NEXT_PUBLIC_MAP_STYLE_URL` in `.env.local`. | §7.3.2: Satellite imagery base layer with boundary lines. | `.env` is currently empty. | **Use high-availability free vector basemap style with satellite raster fallback**. We will configure a public CartoDB Positron / OpenFreeMap vector style with fallback to an Esri World Imagery satellite raster tile URL (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`), ensuring the map operates out of the box without requiring paid Mapbox API keys. | **Question 3 for User** |
| **GC-7** | **Voice FAB & SMS Dispatch Execution** | §0, §7, §10.3, §12: UI placeholders returning 501. | §4, §7.2: Voice button and SMS dispatch. | No routes yet. | **Render fully interactive UI with explicit prototype placeholder badges**. Clicking Voice FAB opens an accessible "Feature Preview" modal explaining voice navigation is planned. Clicking "Send SMS" in the alert composer submits to `/api/alerts/dispatch`, receives `501 Not Implemented`, and renders an informative toast confirmation. | **Resolved** (follows tech-spec §0/§12) |

---

## 4. Design Direction

In strict accordance with `.agents/skills/design-taste/SKILL.md` and `.agents/skills/impeccable/SKILL.md`, we declare our foundational design read before detailing interface tokens and layouts:

> **Design Read:** *Reading this as: Dual-mode public-sector climate intelligence platform for smallholder farmers (mobile, high-contrast, tactile, low-cognitive-load) and agricultural extension officers (desktop, high-density, analytical GIS cockpit), with an authoritative, utilitarian, trust-first language, leaning toward a tailored Radix/Tailwind design system using OKLCH earth neutrals, high-visibility status tokens, and disciplined motion.*

### 4.1 Intensity Dials

| Mode / Surface | DESIGN_VARIANCE (1–10) | MOTION_INTENSITY (1–10) | VISUAL_DENSITY (1–10) | Justification |
|---|---|---|---|---|
| **Farmer View** | **3 (Disciplined & Familiar)** | **2 (Subtle & Instant)** | **4 (Airy & Legible)** | Farmers need immediate clarity in direct sunlight on low-end screens. No decorative layout chaos or sluggish animation. Big cards, clear icons, minimum 18px body. |
| **Officer Control Panel** | **3 (Strict Structural Grid)** | **3 (State-Conveying Only)** | **8 (Dense Command Center)** | Extension officers manage 80+ blocks across large monitors. Dense tabular metrics, compact toolbars, rich map controls, fast keyboard navigation. |

### 4.2 Color Palette & Semantic Tokens (OKLCH Base)

In adherence to the **single accent lock** and **no pure black/white** rules, AgriSentinel uses a tailored palette anchored in earthy slate neutrals, an authoritative forest-emerald primary accent, and colorblind-safe semantic status tokens.

```css
/* app/globals.css */
:root {
  /* Surfaces & Backgrounds (Off-white / Slate-tinted Neutral) */
  --bg-app: oklch(0.985 0.005 130);
  --bg-surface: oklch(1.0 0 0);
  --bg-surface-subtle: oklch(0.965 0.008 130);
  --bg-surface-elevated: oklch(1.0 0 0);

  /* Typography & Ink (Off-black) */
  --fg-primary: oklch(0.18 0.015 140);     /* Deep graphite */
  --fg-secondary: oklch(0.42 0.02 140);   /* Muted readable slate */
  --fg-muted: oklch(0.55 0.015 140);       /* Subtle metadata */
  --fg-inverted: oklch(0.98 0.005 130);

  /* Borders & Dividers */
  --border-subtle: oklch(0.91 0.008 130);
  --border-strong: oklch(0.82 0.015 140);

  /* Brand Primary Accent (Locked across entire surface: Deep Agro Emerald) */
  --primary: oklch(0.45 0.12 148);
  --primary-hover: oklch(0.40 0.13 148);
  --primary-active: oklch(0.36 0.14 148);
  --primary-subtle: oklch(0.94 0.03 148);
  --primary-fg: oklch(0.98 0.005 130);

  /* Semantic Status Scale (Colorblind-Safe) */
  --status-success: oklch(0.55 0.14 142);     /* Green (Safe / Optimal) */
  --status-success-bg: oklch(0.95 0.04 142);
  --status-warning: oklch(0.72 0.14 78);      /* Amber / Orange (Advisory / Watch) */
  --status-warning-bg: oklch(0.96 0.05 78);
  --status-danger: oklch(0.55 0.19 28);       /* Crimson (Alert / Severe) */
  --status-danger-bg: oklch(0.95 0.05 28);
  --status-info: oklch(0.52 0.12 240);        /* Sky Blue (Neutral Informational) */
  --status-info-bg: oklch(0.95 0.04 240);

  /* Radii Scale (Consistency Lock) */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;      /* Standard card corner (max 14px, never over-rounded) */
  --radius-pill: 9999px;  /* Pill buttons & badges only */

  /* Shadows (Tinted, soft, no heavy black glow) */
  --shadow-sm: 0 1px 2px oklch(0.18 0.015 140 / 0.05);
  --shadow-md: 0 4px 12px oklch(0.18 0.015 140 / 0.07);
  --shadow-lg: 0 10px 24px oklch(0.18 0.015 140 / 0.09);

  /* Z-Index Hierarchy (Strict systemic scale) */
  --z-base: 1;
  --z-sticky-nav: 20;
  --z-map-controls: 30;
  --z-drawer: 40;
  --z-modal-backdrop: 50;
  --z-modal: 51;
  --z-toast: 60;
  --z-tooltip: 70;
}

[data-theme="dark"] {
  --bg-app: oklch(0.14 0.012 140);
  --bg-surface: oklch(0.18 0.015 140);
  --bg-surface-subtle: oklch(0.22 0.015 140);
  --bg-surface-elevated: oklch(0.24 0.018 140);

  --fg-primary: oklch(0.95 0.005 130);
  --fg-secondary: oklch(0.75 0.015 130);
  --fg-muted: oklch(0.55 0.015 130);
  --fg-inverted: oklch(0.14 0.012 140);

  --border-subtle: oklch(0.26 0.015 140);
  --border-strong: oklch(0.35 0.02 140);

  --primary: oklch(0.60 0.13 148);
  --primary-hover: oklch(0.65 0.14 148);
  --primary-active: oklch(0.70 0.15 148);
  --primary-subtle: oklch(0.24 0.04 148);
  --primary-fg: oklch(0.12 0.01 140);

  --status-success: oklch(0.68 0.15 142);
  --status-success-bg: oklch(0.22 0.05 142);
  --status-warning: oklch(0.78 0.15 78);
  --status-warning-bg: oklch(0.24 0.06 78);
  --status-danger: oklch(0.65 0.20 28);
  --status-danger-bg: oklch(0.22 0.06 28);
}
```

### 4.3 Typography System

- **Primary Sans:** Geist Sans (`var(--font-geist-sans)`), optimized for high tabular legibility and clean UI geometry.
- **Monospace:** Geist Mono (`var(--font-geist-mono)`), for coordinates, ISO timestamps, metric values, and raw index numbers.
- **Farmer Scale:** Minimum body size is 18px (`text-lg`), line-height 1.5, weight 500/600 for effortless outdoor readability.
- **Officer Scale:** Tight tabular scale (12px caption, 13px small, 14px body, 18px section header, 24px panel title). Headings use tight line-height (1.15). Line length capped at 65ch for prose.
- **Zero Em-Dashes:** Strictly enforced across all UI copy, badges, titles, and data labels. Standard hyphens (`-`) or colons (`:`) used exclusively.

### 4.4 Geospatial & Map Visual Language (`lib/map/palettes.ts`)

Per product doc §7.3.2 and tech-spec §10.1:
1. **Diverging Scale (NDVI Anomaly, Soil Moisture Anomaly):** CARTO **ArmyRose** colorblind-safe palette:
   - Extreme Deficit: `#7b3294` (Purple/Brown)
   - Moderate Deficit: `#c2a5cf`
   - Baseline / Normal: `#f7f7f7`
   - Moderate Surplus: `#a6dba0`
   - High Surplus / Healthy: `#008837` (Rich Green)
2. **Sequential Scale (Precipitation Forecast, CWSI, Flood Risk FSS):** CARTO **Sunset** colorblind-safe palette:
   - Low: `#ffffcc`
   - Moderate: `#ffb061`
   - High: `#e65518`
   - Severe: `#800026`
3. **Choropleth Polygon Boundaries:** Outlines styled at `1.2px` solid `--border-strong` (`#334155`). Active selected block receives a `3px` solid high-contrast blue ring (`oklch(0.55 0.20 245)`) with an outer halo for unmistakable selection state.
4. **Transition Physics:** Map paint property transitions set to `300ms ease-out` for smooth color morphing when toggling layers.

### 4.5 Component States Inventory (The 8 Mandatory States)

Every interactive button, card, input, and selector must explicitly implement all 8 states:
1. **Default:** Crisp contrast, clear label/icon.
2. **Hover:** Tinted background shift (10%), zero layout shift. Guarded by `@media (hover: hover)`.
3. **Focus-Visible:** Prominent 2px offset ring (`outline: 2px solid var(--primary); outline-offset: 2px`).
4. **Active:** Tactile press feedback (`transform: scale(0.97)` on buttons, `-translate-y-px` on cards).
5. **Disabled:** Opacity 50%, `cursor: not-allowed`, no hover/active triggers, `aria-disabled="true"`.
6. **Loading:** Skeletons matching exact layout geometry (never raw centered spinning wheels in content containers).
7. **Error:** High-contrast alert state with inline error text, icon, and retry trigger.
8. **Success / Selected:** Distinct active indicator (e.g. checkmark icon, solid primary border, active badge).

---

## 5. Architecture and File Plan

### 5.1 Repository File Tree

The following tree represents the exact planned structure of all frontend and internal data handling code, following the locked structure in tech-spec §3.

```
agrisentinel/
├── app/
│   ├── (farmer)/
│   │   ├── layout.tsx                     # Farmer shell: mobile viewport container, bottom nav, VoiceFab
│   │   ├── page.tsx                       # Farmer Home: weather, condition, alerts, actions, calendar teaser
│   │   ├── map/
│   │   │   └── page.tsx                   # Farmer Map: simplified block status map + summary drawer
│   │   ├── calendar/
│   │   │   └── page.tsx                   # Farmer Calendar: historical climate sowing & irrigation schedule
│   │   ├── alerts/
│   │   │   └── page.tsx                   # Farmer Alerts: full filterable alert history list
│   │   └── recommendations/
│   │       └── page.tsx                   # Farmer "What to plant?" ranked crop cards flow
│   ├── (officer)/
│   │   ├── layout.tsx                     # Officer shell: full-width three-column container / tab collapse
│   │   └── page.tsx                       # Officer Command Dashboard
│   ├── api/                               # Thin route handlers (App Router)
│   │   ├── blocks/
│   │   │   ├── route.ts                   # GET /api/blocks
│   │   │   └── [id]/
│   │   │       ├── route.ts               # GET /api/blocks/[id]
│   │   │       └── metrics/
│   │   │           └── route.ts           # GET /api/blocks/[id]/metrics
│   │   ├── timeseries/
│   │   │   └── [blockId]/
│   │   │       └── route.ts               # GET /api/timeseries/[blockId]
│   │   ├── alerts/
│   │   │   ├── route.ts                   # GET /api/alerts
│   │   │   └── dispatch/
│   │   │       └── route.ts               # POST /api/alerts/dispatch (501 Placeholder)
│   │   ├── recommendations/
│   │   │   └── [blockId]/
│   │   │       └── route.ts               # GET /api/recommendations/[blockId]
│   │   ├── irrigation/
│   │   │   └── route.ts                   # GET /api/irrigation
│   │   ├── report/
│   │   │   └── [districtId]/
│   │   │       └── route.ts               # GET /api/report/[districtId]
│   │   └── voice/
│   │       └── query/
│   │           └── route.ts               # POST /api/voice/query (501 Placeholder)
│   ├── layout.tsx                         # Root layout: font providers, i18n, query provider, TopBar
│   ├── globals.css                        # Design tokens, Tailwind v4 theme, font variables
│   └── error.tsx                          # Root error boundary
├── components/
│   ├── ui/                                # Base primitives (Radix UI / shadcn style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── tooltip.tsx
│   │   ├── badge.tsx
│   │   ├── switch.tsx
│   │   ├── skeleton.tsx
│   │   └── textarea.tsx
│   ├── shared/                            # Cross-mode components
│   │   ├── TopBar.tsx                     # Persistent header with logo, ModeToggle, Bell, Profile
│   │   ├── ModeToggle.tsx                 # Persistent Farmer | Officer switch with role-gating
│   │   ├── PermissionDialog.tsx           # Informative modal shown when farmer attempts officer mode
│   │   ├── NotificationBell.tsx           # Badge count + alert sheet trigger
│   │   ├── AlertsSheet.tsx                # Slide-over sheet for recent notifications
│   │   ├── OfflineBanner.tsx              # Yellow banner when navigator.onLine is false
│   │   ├── SourceLabel.tsx                # Metric data provenance stamp
│   │   ├── StatTile.tsx                   # Atomic metric card with delta, trend, source
│   │   ├── MetricBadge.tsx                # Severity pill badge
│   │   ├── TrendSparkline.tsx             # Miniature Recharts line chart
│   │   └── LanguageSwitcher.tsx           # English / Bengali dropdown selector
│   ├── farmer/                            # Farmer View components
│   │   ├── BottomNav.tsx                  # 4-tab mobile navigation bar
│   │   ├── VoiceFab.tsx                   # 56dp floating mic button + placeholder modal
│   │   ├── WeatherCard.tsx                # Today's weather + rain probability + soil summary
│   │   ├── CropConditionCard.tsx          # Vegetation stress index & plant water status
│   │   ├── AlertCard.tsx                  # High-visibility early warning card
│   │   ├── HomeActionTiles.tsx            # Irrigation needed & Compound tip tiles
│   │   ├── CalendarTeaserCard.tsx         # Sowing window confidence card
│   │   ├── CropRecoCard.tsx               # Collapsible crop recommendation card (CSS score)
│   │   ├── CropRecommendationModal.tsx    # "What to plant?" drawer/modal
│   │   ├── FarmerBlockMap.tsx             # Simplified status outline map
│   │   ├── CropCalendarView.tsx           # Timeline view of seasonal advisories & growth stages
│   │   └── AlertsListView.tsx             # Searchable/filterable farmer alerts view
│   ├── officer/                           # Officer Control Panel components
│   │   ├── OfficerShell.tsx               # Responsive 3-column / 3-tab layout wrapper
│   │   ├── ControlPanel.tsx               # Left column: layers, actions, filters, alert feed
│   │   ├── LayerToggleList.tsx            # 7-layer checkbox list with active highlight
│   │   ├── AlertFeed.tsx                  # Live alert list with "Annotate -> SMS" action
│   │   ├── DataPanel.tsx                  # Right column: District summary or Block detail
│   │   ├── DistrictSummaryView.tsx        # Aggregate district KPI metrics
│   │   ├── BlockDetail.tsx                # Full block telemetry, crop stage, notes, actions
│   │   ├── AlertComposer.tsx              # Annotation modal: system alert + officer note + dispatch
│   │   └── ReportModal.tsx                # On-screen district PDF preview modal
│   └── map/                               # Geospatial map engine
│       ├── MapCanvas.tsx                  # MapLibre GL JS wrapper (client component)
│       ├── MapControls.tsx                # Zoom, fullscreen, opacity slider, draw-select, PNG export
│       ├── MapLegend.tsx                  # Dynamic colorblind-safe scale legend
│       └── BlockTooltip.tsx               # Hover card with block telemetry & provenance
├── lib/
│   ├── dal/                               # Data Access Layer (the ONLY data reader)
│   │   ├── index.ts                       # Public DAL API functions
│   │   ├── static-source.ts               # Static JSON reader (bundled at build)
│   │   ├── types.ts                       # Domain TypeScript interfaces (Single Source of Truth)
│   │   └── schemas.ts                     # Zod validation schemas for all domain entities
│   ├── indices/                           # Pure mathematical scoring functions
│   │   ├── css.ts                         # Crop Suitability Score runtime pure function
│   │   ├── formulas.ts                    # Reference implementations for SPI, FSS, CWSI, anomalies
│   │   └── thresholds.ts                  # Centralized scoring weights & advisory thresholds
│   ├── crops/
│   │   └── knowledge-base.ts              # Curated 20-30 crop varieties dataset
│   ├── auth/
│   │   └── mock-session.ts                # Session context with role ('farmer' | 'officer' | 'admin')
│   ├── stores/
│   │   └── ui.ts                          # Zustand UI state store (mode, layers, selection, filters)
│   ├── map/
│   │   ├── layers.ts                      # LayerDef[] array for all 7 map overlays
│   │   └── palettes.ts                    # CARTO ArmyRose & Sunset palette constants
│   ├── i18n/
│   │   └── client.ts                      # i18next client configuration and hook wrapper
│   └── utils.ts                           # Tailwind `cn()` helper, date/number formatters
├── data/
│   ├── generated/                         # Committed, static, pre-analyzed JSON records
│   │   ├── blocks.json                    # GeoJSON polygons & static block attributes
│   │   ├── block-metrics.json             # Latest telemetry indices & data provenance
│   │   ├── timeseries.json                # Daily historical records for charts
│   │   └── alerts.json                    # Active precomputed hazard alerts
│   └── locales/
│       ├── en.json                        # English UI translation strings
│       └── bn.json                        # Bengali UI translation strings
├── tests/
│   ├── unit/
│   │   ├── css.test.ts                    # Pure CSS math fixtures test
│   │   ├── formulas.test.ts               # SPI/FSS/CWSI formula assertions
│   │   └── dal-validation.test.ts         # Zod validation test on data/generated/*.json
│   ├── component/
│   │   ├── CropRecoCard.test.tsx          # Component render & accessibility test
│   │   └── ModeToggle.test.tsx            # Permission gate interaction test
│   └── e2e/
│       └── smoke.spec.ts                  # Playwright smoke test: Farmer -> Officer -> Block detail
├── locales/                               # Symlink or mirror to data/locales
├── public/                                # Static images & vector assets
└── docs/plans/
    └── frontend-implementation-plan.md    # This plan
```

### 5.2 State Store Specifications

#### 1. UI / Session Store (`lib/stores/ui.ts` via Zustand)
```ts
export type AppMode = "farmer" | "officer";
export type LayerId = "ndvi" | "soilMoisture" | "floodRisk" | "cropHealth" | "precipForecast" | "pumpRouting" | "fireEvents";
export type AlertSeverityFilter = "all" | "high" | "medium" | "low";
export type CropFilter = "all" | "rice" | "wheat" | "maize" | "vegetable" | "cash";
export type TimePeriodFilter = "24h" | "7d" | "30d";

interface UiState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
  activeLayers: LayerId[];
  toggleLayer: (layer: LayerId) => void;
  setLayerOpacity: (layer: LayerId, opacity: number) => void;
  layerOpacities: Record<LayerId, number>;
  filters: {
    severity: AlertSeverityFilter;
    crop: CropFilter;
    period: TimePeriodFilter;
  };
  setFilter: <K extends keyof UiState["filters"]>(key: K, value: UiState["filters"][K]) => void;
  locale: string;
  setLocale: (locale: string) => void;
}
```

#### 2. Server Data Cache (TanStack Query v5)
Query keys are centralized to prevent arbitrary strings:
- `["blocks", districtId]`
- `["block", id]`
- `["metrics", id]`
- `["timeseries", id, days]`
- `["alerts", filters]`
- `["recommendations", blockId, count, locale]`
- `["irrigation", districtId]`
- `["report", districtId, date]`

Stale time defaults to `1000 * 60 * 60` (1 hour), since data is static per deployment.

#### 3. Form Store (React Hook Form + Zod)
Used in `AlertComposer.tsx`:
```ts
const alertComposerSchema = z.object({
  blockId: z.string().min(1),
  channel: z.enum(["sms", "push", "ivr"]),
  targetAudience: z.enum(["all_farmers", "affected_crops", "custom"]),
  officerNote: z.string().min(5, "Note must be at least 5 characters").max(200, "Max 200 characters for SMS limit"),
});
```

---

## 6. Phased Task Breakdown

Following the roadmap in tech-spec §14, tasks are sequenced strictly by dependency. Tasks marked **[Parallel]** may be developed concurrently once prerequisites are satisfied.

### Phase 0: Foundation & Design System Setup
*Prerequisite: Clean repository audit. Unblocks: All subsequent phases.*

- **Task T0.1: Package Dependencies Installation & Setup**
  - **Inputs:** `package.json`, locked stack in tech-spec §2.
  - **Outputs:** Installed packages: `@tanstack/react-query`, `zustand`, `lucide-react`, `recharts`, `maplibre-gl`, `i18next`, `react-i18next`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-table`. Dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `axe-core`, `@axe-core/playwright`, `@playwright/test`.
  - **Files:** `package.json`, `pnpm-lock.yaml`.
  - **Acceptance Criteria:** `pnpm install` succeeds without dependency peer conflicts; `pnpm build` executes cleanly.

- **Task T0.2: Design Tokens & Tailwind v4 Theme Configuration**
  - **Inputs:** Tech spec §10.1, `.agents/skills/design-taste/reference/core-rules.md`.
  - **Outputs:** Complete semantic CSS variable tokens for light/dark modes, status scales, font definitions, and radii in `globals.css`.
  - **Files:** `app/globals.css`.
  - **Acceptance Criteria:** Inspecting `:root` renders all required variables; switching `data-theme="dark"` flips backgrounds, borders, and foreground ink without unstyled flashes.

- **Task T0.3: Base UI Primitives (shadcn/Radix)**
  - **Inputs:** Tech spec §10.2.
  - **Outputs:** Accessible primitives: `button`, `card`, `dialog`, `sheet`, `tabs`, `select`, `tooltip`, `badge`, `switch`, `skeleton`, `textarea`.
  - **Files:** `components/ui/*.tsx`.
  - **Acceptance Criteria:** Each component implements hover, focus-visible ring, disabled, and active states; zero broken imports.

### Phase 1: Data Contracts, Seed Data & Data Access Layer (DAL)
*Prerequisite: Phase 0. Unblocks: Phases 2, 3, 4, 5, 6.*

- **Task T1.1: Domain Models & Zod Schemas**
  - **Inputs:** Tech spec §4, §6.1.
  - **Outputs:** Single source of truth TypeScript types and matching Zod validation schemas.
  - **Files:** `lib/dal/types.ts`, `lib/dal/schemas.ts`.
  - **Acceptance Criteria:** `Block`, `BlockMetrics`, `Alert`, `TimeSeriesPoint`, `CropKnowledge`, `CropRecommendation`, `DistrictSummary` interfaces exported and verified by TypeScript compiler in strict mode.

- **Task T1.2: Seed Dataset Creation (Kurigram District Pilot)**
  - **Inputs:** Tech spec §14 T1.2, product doc §10.
  - **Outputs:** Hand-authored, realistic seed data covering 12 blocks of Kurigram District with realistic NASA-derived indices (NDVI 0.38-0.65, Soil Moisture 24%-42%, GPM rainfall, FIRMS fire events, active drought/flood alerts).
  - **Files:** `data/generated/blocks.json`, `data/generated/block-metrics.json`, `data/generated/timeseries.json`, `data/generated/alerts.json`.
  - **Acceptance Criteria:** `vitest tests/unit/dal-validation.test.ts` asserts that 100% of seed JSON files pass Zod schema validation.

- **Task T1.3: Data Access Layer (DAL) Implementation**
  - **Inputs:** Tech spec §6.
  - **Outputs:** Async public DAL API backed by `static-source.ts`. Cached in-module, Zod-validated on initial read.
  - **Files:** `lib/dal/index.ts`, `lib/dal/static-source.ts`.
  - **Acceptance Criteria:** Functions `listBlocks()`, `getBlock(id)`, `getBlockMetrics(id)`, `getTimeSeries(id, days)`, `listAlerts(filters)`, `getDistrictSummary(id)` return typed data with zero runtime errors.

### Phase 2: Agronomic Scoring Engine & Crop Knowledge Base
*Prerequisite: Phase 1. Unblocks: Phase 3, Phase 5.*

- **Task T2.1: Index Formulas & Thresholds**
  - **Inputs:** Tech spec §5.1, product doc §5.3.
  - **Outputs:** Centralized agronomic weights, trigger thresholds, and pure TS formula implementations for SPI, FSS, CWSI, and anomalies.
  - **Files:** `lib/indices/thresholds.ts`, `lib/indices/formulas.ts`.
  - **Acceptance Criteria:** `vitest tests/unit/formulas.test.ts` passes known test fixtures for SPI gamma conversion, CWSI calculation, and FSS weighting.

- **Task T2.2: Curated Crop Knowledge Base**
  - **Inputs:** Tech spec §4, product doc §4.2.
  - **Outputs:** Structured dataset of 24 regional crops (Aman rice, Boro rice, Aus rice, wheat, maize, lentils, mustard, jute, potato, chili, eggplant, cabbage, etc.) with agronomic ranges, days to harvest, ROI, and localized notes.
  - **Files:** `lib/crops/knowledge-base.ts`.
  - **Acceptance Criteria:** Dataset passes `CropKnowledgeSchema.array().parse()`.

- **Task T2.3: Crop Suitability Score (CSS) Pure Function**
  - **Inputs:** Tech spec §5.2, product doc §4.1.
  - **Outputs:** Pure function `scoreCrop(block, crop)` and `recommendTop(block, n, locale)`. Weighted 5-dimension matching, template string interpolation for `whyThisLand`, risk note generation.
  - **Files:** `lib/indices/css.ts`.
  - **Acceptance Criteria:** `vitest tests/unit/css.test.ts` passes fixture asserting that a dry soil block yields lower CSS for Boro rice and higher CSS for wheat/lentils, with matching explanatory text.

### Phase 3: Route Handlers (Internal API)
*Prerequisite: Phase 1 & 2. Unblocks: Phase 5 & 6 client fetching.*

- **Task T3.1: Thin Controller GET Routes**
  - **Inputs:** Tech spec §7.
  - **Outputs:** Handlers for `GET /api/blocks`, `/api/blocks/[id]`, `/api/blocks/[id]/metrics`, `/api/timeseries/[blockId]`, `/api/alerts`, `/api/recommendations/[blockId]`, `/api/irrigation`, `/api/report/[districtId]`.
  - **Files:** `app/api/**/route.ts`.
  - **Acceptance Criteria:** All routes validate query params via Zod, call DAL/indices, set `export const revalidate = 3600`, and return typed JSON. Unknown params return `400 Bad Request`.

- **Task T3.2: Prototype Placeholder POST Routes**
  - **Inputs:** Tech spec §7, §12.
  - **Outputs:** Handlers for `POST /api/alerts/dispatch` and `POST /api/voice/query`.
  - **Files:** `app/api/alerts/dispatch/route.ts`, `app/api/voice/query/route.ts`.
  - **Acceptance Criteria:** Both return HTTP `501 Not Implemented` with `{ placeholder: true, message: "..." }`.

### Phase 4: Shared Components, Top Bar & Localization (i18n)
*Prerequisite: Phase 0 & 1. Unblocks: Phase 5 & 6.*

- **Task T4.1: Shared Shell & Composite Components**
  - **Inputs:** Tech spec §10.3.
  - **Outputs:** `TopBar`, `ModeToggle`, `PermissionDialog`, `NotificationBell`, `AlertsSheet`, `OfflineBanner`, `SourceLabel`, `StatTile`, `MetricBadge`, `TrendSparkline`.
  - **Files:** `components/shared/*.tsx`, `lib/auth/mock-session.ts`, `lib/stores/ui.ts`.
  - **Acceptance Criteria:** `ModeToggle` switches view; farmer role tapping "Officer" opens `PermissionDialog`; `NotificationBell` renders unread count; `SourceLabel` displays formatted provenance.

- **Task T4.2: Localization Setup (English & Bengali) [Parallel]**
  - **Inputs:** Tech spec §9.4, product doc §9.3.
  - **Outputs:** `locales/en.json`, `locales/bn.json`, i18next loader, `LanguageSwitcher.tsx`.
  - **Files:** `lib/i18n/client.ts`, `locales/en.json`, `locales/bn.json`, `components/shared/LanguageSwitcher.tsx`.
  - **Acceptance Criteria:** Switching locale changes all navigation, buttons, and alert text dynamically without hardcoded English remnants.

### Phase 5: Farmer View Implementation
*Prerequisite: Phase 2, 3, 4. Unblocks: End-to-end Farmer experience.*

- **Task T5.1: Farmer Shell & Home View Layout**
  - **Inputs:** Tech spec §10.3, product doc §7.2.
  - **Outputs:** Mobile layout shell, `BottomNav`, `VoiceFab` (with 56dp size and "Coming Soon" dialog), `WeatherCard`, `CropConditionCard`, `AlertCard`, `HomeActionTiles`, `CalendarTeaserCard`.
  - **Files:** `app/(farmer)/layout.tsx`, `app/(farmer)/page.tsx`, `components/farmer/*.tsx`.
  - **Acceptance Criteria:** Visual hierarchy matches product doc §7.2; body font >= 18px; touch targets >= 48px; high contrast >= 4.5:1.

- **Task T5.2: Farmer Map Tab [Parallel]**
  - **Inputs:** Tech spec §10.3, product doc §7.2.
  - **Outputs:** Simplified block map view showing registered farm, traffic-light status colors, tap-to-inspect summary drawer, and accessible list view toggle.
  - **Files:** `app/(farmer)/map/page.tsx`, `components/farmer/FarmerBlockMap.tsx`.
  - **Acceptance Criteria:** Renders block outline; tapping displays condition summary; accessible list view available for screen readers.

- **Task T5.3: Farmer Calendar Tab [Parallel]**
  - **Inputs:** Tech spec §10.3, product doc §6 M5, §7.2.
  - **Outputs:** Historical advisory replay timeline: optimal sowing windows, growth stages, scheduled irrigations, risk warnings.
  - **Files:** `app/(farmer)/calendar/page.tsx`, `components/farmer/CropCalendarView.tsx`.
  - **Acceptance Criteria:** Displays pre-analyzed NASA POWER advisory records with clear visual stage markers.

- **Task T5.4: Farmer Alerts Tab [Parallel]**
  - **Inputs:** Tech spec §10.3, product doc §6 M2, §7.2.
  - **Outputs:** Full history of active and past climate alerts, filterable by severity with dismissal capabilities.
  - **Files:** `app/(farmer)/alerts/page.tsx`, `components/farmer/AlertsListView.tsx`.
  - **Acceptance Criteria:** Renders all block alerts with lead-time countdowns and actionable guidance.

- **Task T5.5: "What to Plant?" Recommendation Flow**
  - **Inputs:** Tech spec §5.2, §10.3, product doc §4.3, §4.4.
  - **Outputs:** `CropRecoCard` with collapsible detail, CSS score circle, days to harvest, ROI, market demand, "Why this land?" narrative, and risk note.
  - **Files:** `app/(farmer)/recommendations/page.tsx`, `components/farmer/CropRecoCard.tsx`, `components/farmer/CropRecommendationModal.tsx`.
  - **Acceptance Criteria:** Ranked list of top crops rendered; expanding card displays agronomic rationale.

### Phase 6: Officer Control Panel Implementation
*Prerequisite: Phase 2, 3, 4. Unblocks: End-to-end Officer experience.*

- **Task T6.1: Three-Column Command Layout & Mobile Tab-Collapse**
  - **Inputs:** Tech spec §10.3, §10.4, product doc §7.3, §7.5.
  - **Outputs:** Desktop 3-column layout (Control | Map | Data); mobile viewport (<1024px) collapse to 3 tabs (`Control`, `Map`, `Data`).
  - **Files:** `app/(officer)/layout.tsx`, `app/(officer)/page.tsx`, `components/officer/OfficerShell.tsx`.
  - **Acceptance Criteria:** Full viewport height utilization; zero horizontal page scroll; smooth tab collapse on smaller screens.

- **Task T6.2: MapLibre MapCanvas, Layers & Controls**
  - **Inputs:** Tech spec §10.3, §10.4, product doc §7.3.2.
  - **Outputs:** `MapCanvas` client wrapper, `LayerDef[]` data-driven paint expressions for 7 layers, CARTO ArmyRose/Sunset palettes, `MapLegend`, `BlockTooltip`, `MapControls` (zoom, fullscreen, opacity, lasso, PNG screenshot export).
  - **Files:** `components/map/*.tsx`, `lib/map/*.ts`.
  - **Acceptance Criteria:** Layer toggle smoothly re-renders choropleth in 300ms; hovering shows tooltip; clicking selects block with blue border.

- **Task T6.3: Officer Left Column (ControlPanel & AlertFeed)**
  - **Inputs:** Tech spec §10.3, product doc §7.3.1.
  - **Outputs:** `ControlPanel`, `LayerToggleList`, filter dropdowns (severity, crop, period), `AlertFeed` with "Annotate -> SMS" action buttons.
  - **Files:** `components/officer/ControlPanel.tsx`, `components/officer/LayerToggleList.tsx`, `components/officer/AlertFeed.tsx`.
  - **Acceptance Criteria:** Checkboxes drive map active layers; filters update store; tapping "Annotate -> SMS" opens `AlertComposer`.

- **Task T6.4: Officer Right Column (DataPanel & BlockDetail)**
  - **Inputs:** Tech spec §10.3, product doc §7.3.3.
  - **Outputs:** `DataPanel` showing district aggregates in default state; transitions to `BlockDetail` when block is clicked, showing telemetry, trends, crop status, compound advisory, and officer note field.
  - **Files:** `components/officer/DataPanel.tsx`, `components/officer/DistrictSummaryView.tsx`, `components/officer/BlockDetail.tsx`.
  - **Acceptance Criteria:** Deselecting block restores district summary; selecting block displays full telemetry and trends.

- **Task T6.5: Alert Annotation & SMS Dispatch Workflow**
  - **Inputs:** Tech spec §10.3, §12, product doc §7.3.4.
  - **Outputs:** `AlertComposer` modal. Pre-fills system alert text; allows adding officer note; channel selection (SMS/push/IVR); dispatch button triggers `/api/alerts/dispatch` (501) with toast.
  - **Files:** `components/officer/AlertComposer.tsx`.
  - **Acceptance Criteria:** Modal validates form inputs; dispatch returns 501 and shows clear prototype placeholder notification.

- **Task T6.6: District Auto-Report Payload View**
  - **Inputs:** Tech spec §7, §10.3, product doc §7.3.4.
  - **Outputs:** `ReportModal` rendering formatted printable on-screen district summary from `/api/report/[districtId]`.
  - **Files:** `components/officer/ReportModal.tsx`.
  - **Acceptance Criteria:** Displays full district report with NDVI heatmap summary, soil moisture rankings, and export button.

### Phase 7: Quality, Verification, Accessibility & Hardening
*Prerequisite: Phase 5 & 6. Final pre-ship gating.*

- **Task T7.1: Comprehensive Unit & Component Test Suite**
  - **Inputs:** Tech spec §13.
  - **Outputs:** Vitest unit tests for scoring formulas (`css.test.ts`, `formulas.test.ts`), DAL schema validator, Testing Library component tests (`CropRecoCard.test.tsx`, `ModeToggle.test.tsx`, `MapCanvas.test.tsx`).
  - **Files:** `tests/unit/*.test.ts`, `tests/component/*.test.tsx`.
  - **Acceptance Criteria:** `pnpm test` runs with 100% pass rate.

- **Task T7.2: End-to-End Playwright Smoke Test**
  - **Inputs:** Tech spec §13.
  - **Outputs:** Smoke test verifying user flow: load Farmer view -> toggle to Officer mode -> toggle map layers -> select block -> verify block detail drawer.
  - **Files:** `tests/e2e/smoke.spec.ts`.
  - **Acceptance Criteria:** Playwright test executes headlessly and passes.

- **Task T7.3: Accessibility Audit, Bundle Discipline & Pre-Flight Review**
  - **Inputs:** Tech spec §11.1, App. B, `.agents/skills/design-taste/reference/pre-flight.md`.
  - **Outputs:** Automated axe-core scan on key routes; bundle analyzer pass; mechanical pre-flight verification (zero em-dashes, no unstyled states, contrast verification).
  - **Files:** Whole project.
  - **Acceptance Criteria:** 0 axe violations; farmer body text >= 18px; contrast >= 4.5:1; zero live NASA host strings in codebase.

---

## 7. Quality and Verification Plan

### 7.1 Test Strategy & Suites

| Test Level | Tool | Target Files | Verification Scope | Success Criteria |
|---|---|---|---|---|
| **Unit** | Vitest | `tests/unit/css.test.ts`, `tests/unit/formulas.test.ts` | Pure mathematical scoring: CSS score calculation, SPI gamma index, FSS flood weighting, CWSI stress calculation. | Known inputs produce deterministic expected score and template text. |
| **Data Integrity** | Vitest | `tests/unit/dal-validation.test.ts` | Zod validation of all static files in `data/generated/*.json`. | 100% of seed JSON files adhere strictly to domain TypeScript interfaces. |
| **Component & A11y** | Testing Library + axe-core | `tests/component/*.test.tsx` | `CropRecoCard` expand/collapse, `ModeToggle` permission dialog, `SourceLabel` rendering, accessibility violations. | Zero axe-core accessibility errors; all ARIA roles present. |
| **E2E Smoke** | Playwright | `tests/e2e/smoke.spec.ts` | Critical user journey: Load Farmer Home -> Switch to Officer Panel (role verified) -> Toggle Map Layer -> Click Block -> Verify Block Detail. | Playwright smoke suite passes in under 30 seconds. |

### 7.2 Accessibility (a11y) Verification Matrix

In strict compliance with tech-spec §11.1 and product doc §9:
- **Contrast:** Every text element against its rendered background must exceed `4.5:1` (WCAG AA). Tested via automated axe-core and manual color-picker sampling.
- **Farmer Body Size:** Verified minimum `18px` (`1.125rem`) on body text in `(farmer)` routes.
- **Outdoor Sunlight Readability:** Tested under high brightness; high-contrast borders (`--border-strong`) around all cards and interactive controls.
- **Keyboard Navigation:** Full tab order traversal across the Officer Control Panel (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape` to close drawers/modals). Focus rings visible on every focused element (`outline: 2px solid var(--primary)`).
- **Screen Reader Support:** All interactive controls carry `aria-label` or `aria-labelledby`. Non-map tabular fallback provided on all map views.

### 7.3 Internationalization (i18n) Coverage Check

- Automated regex scan: `grep -r ">[A-Za-z]" app/ components/` to detect any hardcoded user-facing strings outside `t('...')`.
- Parity audit between `locales/en.json` and `locales/bn.json` ensuring 100% key parity (zero missing keys in Bengali).

### 7.4 Performance Budgets & Bundle Discipline

- **Dynamic Lazy Loading:** MapLibre GL JS (`components/map/MapCanvas.tsx`) and Recharts (`components/shared/TrendSparkline.tsx`) must be loaded via `next/dynamic` with `{ ssr: false }` to avoid bundling heavy client graphics in initial server HTML.
- **Core Web Vitals Budget:**
  - Largest Contentful Paint (LCP): `< 2.0s`
  - Interaction to Next Paint (INP): `< 150ms`
  - Cumulative Layout Shift (CLS): `< 0.05` (rigid skeleton heights, zero layout jumps on map load)
- **Zero Live Remote Calls:** Grep test `grep -ri "nasa.gov" app/ lib/` must return ZERO matches.

### 7.5 Definition of Done (DoD) per Phase

A phase task is only marked **Done** when:
1. All files listed in the task are created and adhere to TypeScript strict mode with zero compiler warnings.
2. The acceptance criteria specified in §6 are demonstrated and verified.
3. Zero em-dashes (`U+2014`) exist in the committed code or copy.
4. Loading (skeletons), error, empty, and offline states are implemented for the touched views.
5. All user-facing strings resolve through the localization layer.
6. The clean-architecture checklist in tech-spec §15.3 is verified.

---

## 8. Risks and Mitigations

| Risk | Consequence if Ignored | Prevention & Mitigation Control in Plan |
|---|---|---|
| **MapLibre GL SSR Hydration Failure** | Next.js server crash or hydration mismatch error (`window is not defined`). | `MapCanvas.tsx` is strictly dynamic-imported via `next/dynamic` with `{ ssr: false }`. Leaf boundary isolation ensures parent server components remain unaffected. |
| **Next.js 16 Breaking Async Changes** | Runtime exceptions when accessing page or route handler params (`params` / `searchParams`). | As mandated by `AGENTS.md`, all route parameters in App Router are typed and handled as Promises (`await params`). |
| **Tailwind v4 Variable Desynchronization** | Broken styles or unstyled components due to missing v4 theme mapping. | CSS variables defined directly in `globals.css` with `@theme inline` block mapping, ensuring zero reliance on deprecated `tailwind.config.js`. |
| **Sloppy "AI Template" Aesthetic** | Interface looks like generic shadcn demo, lacking domain authenticity. | Concrete tokens, OKLCH palette, tight typography hierarchy, deliberate card density, strict anti-slop rules (no em-dashes, no gradient text, no side-stripe borders, no fake div screenshots). |
| **Leaking Live NASA Calls into Runtime** | Violates locked decision D3; causes API rate-limiting or latency crashes. | Architecture isolates data access strictly behind `lib/dal/static-source.ts`. CI grep check asserts zero `nasa.gov` hostnames in runtime code. |
| **Scope Creep into Live Inference / SMS** | Project fails to complete due to attempting live ML training or live SMS gateways. | Honest placeholders returning HTTP 501 with clear in-app "Coming Soon" badges, strictly fulfilling tech spec prototype boundaries. |
| **Farmer Interface Unusable on Low-End Phones** | Small touch targets and tiny text render the app unusable in field conditions. | Strict 360px mobile viewport testing, minimum 18px body font, 48px touch targets, icon+text pairing, and high contrast >= 4.5:1. |

---

## 9. Open Questions & Alignment Decisions

Before commencing frontend code implementation, user approval is requested on the following design alignments:

1. **Pilot Geography (Seed Data):**
   - *Proposal:* We recommend **Kurigram District (Rangpur Division, Bangladesh)** as the canonical seed district. It features flood haor/char lands, drought vulnerability, 12 realistic blocks (Chilmari, Ulipur, Nageshwari, Rajarhat, etc.), and authentic regional crops (Aman rice, Boro rice, wheat, jute, mustard, lentils).
   - *Alternative:* Another target agricultural district if preferred.

2. **Locales & Translations:**
   - *Proposal:* We will configure **English (`en`)** as default and **Bengali (`bn`)** as the secondary locale, with full bilingual dictionary coverage.
   - *Alternative:* Specify if another regional language should be supported alongside English.

3. **Map Basemap Style:**
   - *Proposal:* We will configure free public CartoDB Positron / OpenFreeMap vector basemap with an Esri World Imagery satellite raster tile fallback (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`), ensuring instant, zero-cost satellite rendering without Mapbox access tokens.
   - *Alternative:* Provide a specific private Mapbox or MapTiler style URL if desired.

---
*Implementation Plan authored by Lead Frontend Engineer & Planner — Kynatium Labs · Ready for User Sign-Off.*
