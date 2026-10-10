# AgriClimate — production storyboard

15 scenes · 1920×1080 · 30 fps · 246 seconds

Concept: evidence becomes action. Long holds on records, hard cuts between human roles.

## Frame 1
- status: animated
- src: compositions/s01.html
- start: 0
- duration: 14
- beat: Two days to act.
- narrativeRole: LEAD TIME
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: data/generated/alerts.json · alrt_001 · archived seed alert
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 2
- status: animated
- src: compositions/s02.html
- start: 14
- duration: 12
- beat: One app. Two ways to act.
- narrativeRole: TWO MODES
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: AppModeSwitch · shared data access layer · repository demo records
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 3
- status: animated
- src: compositions/s03.html
- start: 26
- duration: 16
- beat: The field, in context.
- narrativeRole: OFFICER / OBSERVE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: OfficerShell → MapCanvas → DataPanel · recorded application
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 4
- status: animated
- src: compositions/s04.html
- start: 42
- duration: 18
- beat: Seven layers. One map.
- narrativeRole: OFFICER / OBSERVE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: lib/map/layers.ts · seven layer definitions · recorded application
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 5
- status: animated
- src: compositions/s05.html
- start: 60
- duration: 14
- beat: A thermal signal from orbit.
- narrativeRole: OFFICER / OBSERVE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: NASA FIRMS client · actual sync response · captured cache labeled
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 6
- status: animated
- src: compositions/s06.html
- start: 74
- duration: 18
- beat: Turn a signal into advice.
- narrativeRole: OFFICER / DISPATCH
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: AlertComposer → POST /api/alerts/dispatch · recorded local demo
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 7
- status: animated
- src: compositions/s07.html
- start: 92
- duration: 16
- beat: The warning reaches the field.
- narrativeRole: FARMER / RECEIVE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: FarmerView → GET /api/alerts/dispatch · recorded reload, not push delivery
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 8
- status: animated
- src: compositions/s08.html
- start: 108
- duration: 18
- beat: What should I do today?
- narrativeRole: FARMER / DECIDE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: DailyDecisionsGrid · recorded application · block-level advice
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 9
- status: animated
- src: compositions/s09.html
- start: 126
- duration: 20
- beat: A score. And a reason.
- narrativeRole: FARMER / PLAN
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: lib/indices/css.ts · crop knowledge base · deterministic scoring
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 10
- status: animated
- src: compositions/s10.html
- start: 146
- duration: 22
- beat: From request to approval.
- narrativeRole: FIELD / COORDINATE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: POST /api/pump-requests → PATCH /api/pump-requests/[id]
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 11
- status: animated
- src: compositions/s11.html
- start: 168
- duration: 14
- beat: Prioritize the water deficit.
- narrativeRole: DISTRICT / ALLOCATE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: GET /api/irrigation?districtId=kurigram · actual local response
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 12
- status: animated
- src: compositions/s12.html
- start: 182
- duration: 20
- beat: Satellites in. Agronomy out.
- narrativeRole: ENGINEERING / INGEST
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: lib/nasa/power-client.ts · verbatim code excerpts
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 13
- status: animated
- src: compositions/s13.html
- start: 202
- duration: 16
- beat: A fallback is part of the design.
- narrativeRole: ENGINEERING / RESILIENCE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: lib/dal · cache-manager · source-grounded architecture diagram
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 14
- status: animated
- src: compositions/s14.html
- start: 218
- duration: 14
- beat: Show the working parts. And the gaps.
- narrativeRole: ENGINEERING / EVIDENCE
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: pnpm test · actual run · OfflineBanner · voice endpoint placeholder
- capture: real local application where available; engineering annotations are source-grounded.

## Frame 15
- status: animated
- src: compositions/s15.html
- start: 232
- duration: 14
- beat: The satellites are already watching.
- narrativeRole: GET STARTED
- rules: viewport-change, discrete-text-sequence, stat-bars-and-fills
- source: github.com/kynatians/agriclimate · local setup instructions
- capture: real local application where available; engineering annotations are source-grounded.
