# AgriClimate — 28-second silent final cut

Separate short edition; the original long-form project is unchanged.

## Final export

`../agriclimate-28s-silent-final.mp4`

- 1920×1080
- 30 fps
- Exactly 28 seconds
- No voice, music, sound effects, or audio stream

## Visual sequence

| Time | Beat |
|---|---|
| 0–3 | 48-hour seed warning; real repository block geometry, animated scan |
| 3–6 | Officer/farmer split; 3D product screen entrance |
| 6–9 | Seven map layers; captured palette changes and cached FIRMS annotation |
| 9–13 | Officer advisory → Bengali farmer bulletin; animated packet handoff |
| 13–17 | Soil, solar, weather, growth; 20-crop scoring and Mungbean91 |
| 17–21 | Farmer request → officer review → farmer approval; computed deficit72 |
| 21–24 | NASA safeguards, irrigation plan, fallback, actual test tally/stubs |
| 24–28 | Product identity, verified dataset counts, GitHub and setup |

Source screens are actual local application captures. Some screenshots are cropped for legibility; the source ledger is `assets/provenance.json`. Graphic callouts are editorial, not additional app features. Seed warnings, cached fire data, prototype delivery limits, and dataset counts are labelled accurately.

## Rebuild / verify

```sh
python prepare-assets.py
python build.py
npm run check
npm run render
```

`build.py` writes the eight editable HyperFrames scenes in `compositions/` and the silent master `index.html`. All source video tags are muted. It never references narration or music from the longer film.

The visual treatment adapts the installed telemetry-HUD bracket draw, screen-flow carousel movement and directional-wipe concepts, plus kinetic type, SVG path animation, deterministic approval particles, and 3D screen transforms. There are no render-time network dependencies.
