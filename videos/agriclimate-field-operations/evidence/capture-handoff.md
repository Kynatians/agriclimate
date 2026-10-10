# AgriClimate browser capture handoff

## Ready assets

- **18 scene MP4s** (H.264, CRF 18, no audio), totaling **378.92 seconds** of real app coverage.
- **49 PNG screenshots**, including **2 clearly flagged superseded diagnostic screenshots** (`editorialUse: false`).
- **5 original Playwright WebM recordings** retained for alternative trims.
- All media: `videos/agriclimate-field-operations/assets/captures/`
- Editorial manifest: `evidence/captures.json` — dimensions, durations, source ranges, per-action useful ranges, descriptions, provenance, caveats.
- Real network evidence: `evidence/capture-api.json`.
- Verification: `evidence/capture-verification.json`.
- Backup/restoration hashes: `evidence/capture-restoration.json`.

## Scene mapping

| Scene | Primary video | Coverage |
|---|---|---|
| 01 | `01-dark-officer-map.mp4` | Dark officer shell and actual district map |
| 02 | `02-mode-switch.mp4` | Officer → farmer → officer in one recording |
| 03 | `03-chilmari-officer.mp4` | Real map tooltip, then Chilmari South selected via district roster |
| 04 | `04-seven-layers-basemap.mp4` | All seven real layer selections, then satellite basemap |
| 05 | `05-cached-fire-overlay.mp4` | 5.5 MW FRP cached fire beacon → composer → tactical overlay |
| 06 | `06-rowmari-broadcast.mp4` | Rowmari selection → typed advisory → actual POST 200 confirmation |
| 07 | `07-farmer-bengali-alert.mp4` | Bengali farmer bulletin → same payload in English |
| 08 | `08-mobile-decisions-telemetry.mp4` | Mobile daily cards and telemetry detail |
| 08 alt | `08-desktop-daily-cards.mp4` | All three cards together, large telemetry modal |
| 09 | `09-crop-recommendations.mp4` | Mobile crop rankings and rationale |
| 09 alt | `09-desktop-crop-modal.mp4` | Large, legible crop recommendation detail |
| 10a | `10a-pump-request-submit.mp4` | Farmer demo request → POST 201, deficitSeverity 72 |
| 10b | `10b-officer-pump-approval.mp4` | Queue → review note → PATCH 200 approval |
| 10c | `10c-farmer-pump-approved.mp4` | Farmer reload/refetch → approved and same note |
| 11 | `11-irrigation-modal.mp4` | Mobile irrigation protocol and computed allocation |
| 11 alt | `11-desktop-irrigation-modal.mp4` | Large irrigation modal |
| 14 | `14-mobile-320-offline-voice.mp4` | Real 320px view → offline event → planned voice dialog |
| 15 | `15-app-overview.mp4` | District overview and farmer desktop overview |

## Important editorial truth

1. The cached fire is **5.5 MW**, not the script's example 52.3 MW. Its cached issue date is **2026-09-30**, expiry **2026-10-01**. Do not present it as a fresh live detection. No NASA sync POST was run.
2. The brand-new advisory's Bengali headline is the app's **generic Bengali fallback**. English guidance remains English. The language switch is genuine, but there is no automatic translation of newly typed guidance.
3. Dispatch success establishes **local JSON persistence**, not real telecom SMS/push delivery.
4. Farmer approval was shown after **reload/refetch**, not push delivery or a measured latency guarantee.
5. The current top crop is **Mungbean (BARI Mung-6), CSS 91**; Groundnut 87, Green Chili 83. Not Boro Rice. The UI does not show the five weight bars described by the draft.
6. The daily UI has **three cards**. Soil and solar-pump instruments share the water card. The real **Telemetry (5)** button opens telemetry; tapping the soil/water card opens irrigation.
7. The 320px top header has **existing horizontal overflow**. The offline shot demonstrates retaining an **already-loaded page**, not cold offline startup.
8. Voice is a **planned feature dialog**. Opening it does not issue an API request.
9. Scene 03's hover tooltip happens to be **Ulipur East**; the subsequent selected detail is **Chilmari South**, through the right-side district roster. Both are real UI interaction.
10. Only the Next.js development badge was hidden (`nextjs-portal { display:none!important }`). No app DOM content, layout, data, API response, or rendering was fabricated.

## Safety and verification

- Backed up every `data/live` file before mutation.
- Created only demo advisory `dispatched_1791008540623` and demo pump request `pr_1791008643039`; no real personal name entered.
- All **six live files match original SHA-256 hashes** after restoration; dispatched/pump files restored byte-for-byte.
- App source was not edited. Root dependencies/package files were not changed.
- Existing app server remains running at `http://localhost:3457`; final GET returned **200**.
- Verified all 18 MP4s with ffprobe and first-frame decode, all 49 PNG dimensions/signatures, and inspected representative screenshots/video frames. No final flow is blocked; failed earlier attempts remain documented as superseded.

## Reproduction scripts

- `scripts/capture-app.cjs`: primary flows, real API evidence, backups/restoration.
- `scripts/capture-pickups.cjs`: read-only desktop supplements.
- `scripts/capture-fire.cjs`: read-only fire-beacon pickup.
- `scripts/capture-finalize.cjs`: merges successful fire pickup and truthful metadata.
- `scripts/capture-convert.cjs`: full-frame source trims to H.264 MP4.
- `scripts/capture-verify.cjs`: asset and evidence verification.

Scripts use cached Playwright from `/home/tahsin/.npm/_npx/9833c18b2d85bc59/node_modules/playwright`, system Chromium and ffmpeg, without altering the app's dependencies.
