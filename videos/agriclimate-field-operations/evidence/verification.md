# AgriClimate film — factual verification

Verified against the checked-out source and data on 2026-10-03. No application source or seed/live dataset was changed. No live NASA synchronization or mutating application request was made by this verifier.

## Headline facts and real checks

- **12 monitoring blocks; 4,245 farmers; 44 pump assets**: sums of `data/generated/blocks.json`. These are dataset counts, not verified adoption/deployment counts. The composer has a stale hardcoded district label of 3,420 farmers; do not quote it.
- **20 crops, not 21**: evaluated `CROP_KNOWLEDGE_BASE.length`. Actual Chilmari South seed ranking: **Mungbean (BARI Mung-6), 91; Groundnut, 87; Green Chili, 83**. Boro Rice is not the top recommendation. Scores use weights 0.30 moisture / 0.25 temperature / 0.20 rainfall / 0.15 estimated solar / 0.10 NDVI. Explanations are templates, not LLM calls. Risk notes appear only when the weakest subscore is below 0.5; harvest dates are estimates. See `verification-crop-ranking.json` and `lib/indices/css.ts`.
- **7 map overlays**, not seven independently live satellite feeds: NDVI, root-zone soil-moisture anomaly, flood score, crop water stress, rainfall forecast, pump priority, fire/heat. Four basemaps and an SVG fallback exist. Seed NDVI anomaly is an absolute difference (-0.12), although the map labels it as percent; do not imply a scientifically verified ten-year baseline or label all metrics live. Dataset source/resolution strings also disagree between seed records and layer metadata.
- Chilmari South **seed** values: NDVI **0.42**, CWSI **0.72**, LST **33.4°C**, surface moisture **24.5** against **35** baseline, anomaly **-10.5 percentage points**. Rowmari Char seed flood score **0.88**, not 0.84 (0.84 belongs to Char Rajibpur Riparian). Seed dates are 2026-09-28; these are not today's measurements. Current live cache values may differ.
- `alrt_001` genuinely states **138 mm over 48 hours**, 48-hour lead time, upstream runoff and acute inundation risk. It is a **seed scenario**, issued 2026-09-28 and expired 2026-09-30. Do not narrate certain flooding or a newly measured live emergency. Rowmari's separate metric is `precip7dForecast: 138`; distinguish the two horizons.
- **Actual GET** `http://localhost:3457/api/irrigation?districtId=kurigram` returned HTTP 200, **3 deficit blocks, 44 pumps**. Chilmari South severity **84 / 34 hours**; Rajarhat Central **64 / 26 hours**; Ulipur West **32 / 13 hours**. Raw payload and headers: `api-irrigation.json`, `api-irrigation.headers.txt`.
- **Actual `pnpm test`: 34 passed, 2 failed, 36 total; 8 files passed, 1 failed** (exit 1). Both failures are text-query assertions in `FarmerHomeSimplification.test.tsx`, for `Field Status: Normal & Monitored` and `Field Health & Climate Trends`. This evidence does not prove all other behavior correct. Full output: `tests-vitest.log`.

## Scene-critical corrections

### Dispatch, language and delivery (scenes 6–7)

`AlertComposer.tsx` sends English and Bengali fields and updates the same browser's Zustand store before API success. The API preserves provided fields, or supplies generic Bengali text; **it does not translate**. With no bilingual alert prefill, the composer sets `detail.bn = systemText`, so an English custom message remains English in that field. With prefill, Bengali text is retained even if English is edited, and can become mismatched. A faithful bilingual demonstration must use existing bilingual seed text / explicitly prepared bilingual fields, and say “supplied Bengali text.”

The dispatch route only writes JSON to disk. SMS, push and IVR are **selected channel metadata**: no telecom/push provider is called. Success/toast wording overclaims transmission. No device delivery or 90-second latency was measured. Farmer alerts filter `isOfficerDispatched`, current block/all and dismissed IDs. Alerts are fetched **on mount**, not periodically polled; same-browser mode switching also shares local state. The officer queue fetches on mount; the farmer requests fetch on mount/block change. There is no guaranteed cross-device instant update.

There are **123 dictionary leaves per language**, not 139; English is the default (`locale: "en"`), with persisted English/Bengali selection. Numerous visible labels remain hardcoded English. Do not say Bengali-default or fully translated.

### Daily decisions and pump workflow (scenes 8–11)

The home grid contains **three cards** and four visual components: soil strata plus pumping dial in one card, weather, and crop care. The dial's **17:30–19:30, 2 hours, 3.2 litres saved are hardcoded illustrations**, not computed by the irrigation plan. Several weather/crop values are heuristic or fixed. Not every number is measured telemetry. Seed timeseries have uneven lengths: 30 / 8 / 4 / 3 / 3 / 3 / 3 / 3 / 3 / 3 / 3 / 3, not twelve complete 30-day series.

Pump POST computes `round(CWSI * 100)`, clamped 0–100, from the active DAL metric. Chilmari seed CWSI implies **72**, but actual live-cache request values may differ. PATCH persists approval/rejection and officer notes. This is a prototype request/approval workflow, not proof of pump deployment or automatic device synchronization.

Irrigation always uses **static seed metrics**, including in hybrid/live mode. Deficit means surface moisture anomaly **below -2 percentage points**. Severity is `min(100, round(abs(anomaly) * 8))`; hours `round(severity * .4)`. Pump identifiers are illustrative, recycled over six labels, not a capacity-constrained routing optimizer for all 44 assets. `revalidate = 3600` is a **cache configuration**, not a background job or hourly NASA sync; runtime cache effectiveness was not benchmarked.

### NASA and caching (scenes 5, 12–13)

The FIRMS client exists: NOAA-20 and Suomi-NPP VIIRS 375m, optional FIRMS key, FRP thresholds >50 high and >10 medium. Block assignment uses coordinate thresholds, **not a nearest-distance calculation**. No current fire was verified and no fresh sync was run. Do not show invented 52.3 MW or fabricated successful POST output; use source-code evidence or clearly labelled stored/seed data. Geography is hardcoded to Kurigram, so a key alone does not adapt the app to another district.

POWER specifies 4.5-second timeouts, two retries and six-hour fetch revalidation. Retry delays are **linear, not exponential**. FIRMS uses a different four-second timeout and one-hour fetch revalidation, so do not say every external call has POWER's policy. Missing temperature dates are filtered and invalid other values substituted. POWER supplies recent daily weather; NDVI/soil series and forward rain are local heuristics, not newly downloaded MODIS/SMAP measurements or an independent forecast. Water stress uses Tetens VPD plus a **baseline-soil-moisture term**, not the timeseries depletion output.

Cache writes are plain `writeFileSync` calls, **not atomic file replacement** despite source comments. Metrics/timeseries are retained in memory after first load; alerts reread disk, so not every read is in-memory. No sub-millisecond benchmark exists. Seed Zod validation is **lazy first-use**, not module-load. Both `live` and `hybrid` fall back to seed; `live` is **not strict live-only**. Summary and irrigation always use seed. No auto-sync path was established; a stale helper exists but readers do not enforce freshness. Sync metadata such as `mode: live` and `blocksUpdated: 12` can include seed fallbacks, so it does not prove twelve fresh satellite observations. Installed Next.js route-handler documentation also says GET handlers are not cached by default; do not infer effective hourly response caching from the lone revalidate export. This is server-side resilience, not a guarantee against blank screens.

### Offline, voice, licensing (scenes 14–15)

OfflineBanner listens to navigator connectivity and displays a notice; Zustand persists selected UI state. **No service worker / offline app-shell or tile cache exists.** Already-loaded information may remain visible, but reload and network actions are not guaranteed offline. The banner’s default last-sync label is also illustrative. Voice query is an explicit **HTTP 501 placeholder**.

README claims MIT, but there is **no checked-in LICENSE file or package license field**. Do not display an MIT mark or assert verified open-source licensing; say “source available on GitHub.” Seed startup needs no NASA key. FIRMS needs a key for fire fetches; NASA POWER itself does not. The outro should say **20 crops** and show English/Bengali as supported rather than Bengali-default.

## Audio preflight

Verbatim auth status:

> Not signed in to HeyGen (non-interactive).
> Set HEYGEN_API_KEY to use HeyGen, or workflows fall back to local engines (Kokoro voice · MusicGen music).

The requested local/free Kokoro route was used successfully. HyperFrames initially reported that `kokoro-onnx` was not installed; `uv` installed kokoro-onnx 0.6.1 and soundfile in `/tmp/agriclimate-kokoro-venv`, and HyperFrames downloaded Kokoro model/voices to the user cache. The application package was not changed. Provider: **local Kokoro-82M via HyperFrames 0.8.102, voice af_heart, American English**. No HeyGen, Edge, or paid generation calls were used.

All **15 WAVs** are complete under `assets/voice/scene-01.wav` through `scene-15.wav`: **48 kHz mono PCM16**, normalized for speech with a **-2 dBFS peak**, **230.528 seconds** of measured speech across the **246-second** scene layout. Every file is at least **0.677 seconds shorter than its scene** (the required minimum is 0.6). Suggested placement is 0.3 seconds after each scene starts. Synthesis speeds are 1.12–1.20; **no post-generation time stretching, truncation, or silence padding** was used.

Technical lines were tightened against actual synthesis timing rather than forcing the original word budget at an excessive rate. Some scenes consequently have lower whitespace-word counts than a nominal 165–180 wpm budget; numerical compounds and letter-by-letter initialisms also make raw word counts imperfect. Exact transcripts, durations, speeds, and per-scene correction notes are in `narration.json`, `audio_request.json`, and `audio_meta.json`.

`node scripts/narration-verify.mjs` passed all automated checks: exact 15 scene slots totaling 246 seconds, metadata/text agreement, duration ceiling, WAV format, successful decoding, non-silence, and no clipping. Results and SHA-256 hashes are in `evidence/verification-audio.json`. No human listening session or word-level forced alignment was performed. The first generation log records superseded overlong takes; `verification-narration-revisions.log` and the final audio QA report describe the delivered files.

## Assembly-time follow-up

After the independent verification, a separate copy of the unchanged app was run on port 3458. Its actual NASA synchronization returned HTTP 200, 12 blocks updated and zero new fire alerts. The new weather-source timestamps were present for all 12 cached records. This did not mutate the original app cache. See `sync-response.json`, `sync-provenance.json`, and `sync-result-block-metrics.json`. The capture agent also completed all final UI flows, including a genuine cached 5.5 MW fire tactical overlay.
