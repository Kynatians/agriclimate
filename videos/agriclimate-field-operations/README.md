# AgriClimate — Field Operations

**1920×1080 · 30 fps · 15 scenes · 246 seconds (4:06)**

Editable HyperFrames launch walkthrough built from the supplied Brag storyboard, real local application recordings, real test/API results, and the repository's source. The local `brag` skill was not installed; the supplied scene format is preserved in the long-form `general-video` workflow.

## Preview and render

```sh
cd videos/agriclimate-field-operations
npm run dev
```

The final preview must be approved before rendering:

```sh
npx hyperframes@0.8.114 render --quality delivery --workers 4 --output renders/agriclimate-field-operations.mp4
ffprobe -v error -show_format -show_streams renders/agriclimate-field-operations.mp4
```

The scaffold initially pinned 0.8.102. It was upgraded to **0.8.114** and checked on that version.

## Sources and editing

- `index.html`: assembled timeline, narration, music, and SFX.
- `compositions/s01.html` … `s15.html`: editable scene sub-compositions.
- `STORYBOARD.md`, `timeline.json`, `design.md`, `BRIEF.md`: production and design records.
- `narration.json`: corrected, timing-fitted English script.
- `assets/voice/`: fifteen locally generated Kokoro `af_heart` WAVs, 48 kHz mono.
- `assets/captures/`: actual browser recordings and screenshots, including raw source takes.
- `assets/edits/`: source-range editorial trims. No substitute UI was drawn.
- `evidence/edit-decision-list.json`: source windows and retiming for each edit.
- `evidence/verification.md`: source audit and corrections to the supplied script.
- `evidence/tests-vitest.log`: actual failing and passing tests, retained as recorded.
- `evidence/api-irrigation.json`: actual endpoint output.
- `evidence/sync-response.json`: actual isolated NASA synchronization response.
- `evidence/sync-provenance.json`: isolation details. The original app's cache was not synchronized or overwritten.

The capture scripts and raw transaction/restoration records are under the repository's `scripts/capture-*` and `evidence/capture*` paths. They restore demo-only data mutations and do not modify application source.

To rebuild the authored scene HTML after editing the generator:

```sh
python scripts/build-film.py
node ../../.agents/skills/hyperframes-audio/scripts/carve.mjs --comp index.html
npm run check
```

Rebuilding replaces `index.html` and scene HTML; it must be followed by the audio carve again. For normal manual edits, change scene HTML directly instead of regenerating.

## Audio and provenance

Narration is **local Kokoro-82M**, not a human recording. No paid generation calls were made. The background instrumental is an original deterministic 80 BPM additive-synthesis keys/pad composition (`scripts/make-bed.py`), used because no authenticated music catalog was available. UI tick and notification chime were resolved from HyperFrames' local library. Music is dynamically carved against the narration group; no trailer risers or cinematic impacts are used.

No footage color grade is applied: preserving the product's own color and status semantics is intentional. Crops, time compression, final-frame holds, and graphic annotations are editorial, not application features.

## Material factual corrections

- 20 crops, not 21; Chilmari's top seed recommendation is Mungbean at 91.
- 12 blocks, 4,245 farmer records and 44 pump records are dataset counts, not measured adoption.
- The 138 mm / 48-hour warning is an expired **seed scenario**, explicitly labelled.
- The actual sync returned 12 records updated and **zero new fire alerts**. That does not prove an absence of fires.
- Dispatch persists advisory records. SMS/push selections are metadata, not connected delivery services.
- Bengali/English fields are supplied or prefilled, not automatically translated. Fetches occur on view mount.
- The home pumping dial is illustrative. Irrigation allocation is seed-based; hourly revalidation is not an automatic NASA sync.
- File writes are not atomic, and browser offline support is not a complete offline application.
- 34 tests pass and 2 fail in this run. Voice query is a 501 placeholder.
- README claims MIT, but no checked-in license corroborates it, so the film says source available rather than showing an MIT mark.

## Capture limitations

All final requested UI flows were captured. The cached fire popup is a successful real pickup (earlier unsuccessful takes are flagged and excluded). The existing 320px header overflow remains visible; offline coverage is an already-loaded page, not a cold offline start. Terminal panels typeset actual saved response excerpts for legibility; the final clone/install/dev commands are clearly labelled setup instructions, not a claimed fresh installation.
