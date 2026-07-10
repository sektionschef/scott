# Scott (Camogli) - Project Guide

This repository contains a browser-first generative art codebase with two active runtimes:

1. `index.html` + `index.js`: original 2D SVG stroke system (fxhash-style global scripts).
2. `camogli-3d.html` + `camogli-3d.js`: modern 3D composition and SVG export studio (ES modules with Three.js + cannon-es).

The goal of this README is fast onboarding for human collaborators and coding agents (for example Claude Code).

## Quick Start

### Local server

Serve the project root (no build step required):

```bash
python3 -m http.server 3301
```

### Primary URLs

- Main 2D renderer: `http://localhost:3301/`
- 3D studio: `http://localhost:3301/camogli-3d.html`
- Paper texture lab: `http://localhost:3301/debugPaperBackground.html`
- Noisy paper spike playgrounds:
  - `http://localhost:3301/noisy_paper_spike/svg_filter_playground.html`
  - `http://localhost:3301/noisy_paper_spike/svg_filter_playground_2.html`
  - `http://localhost:3301/noisy_paper_spike/svg_filter_playground_3.html`

## Tech Stack

- Plain JavaScript in browser.
- SVG-heavy rendering and filter composition.
- Deterministic randomness via fxhash (`$fx.rand`) in main paths.
- No bundler for the main 2D runtime.
- ES modules + vendor folders for the 3D runtime.

## Project Modes At A Glance

### A) 2D generative renderer (`index.html` / `index.js`)

Pipeline summary:

1. Build geometric blueprint (`BlueprintNew`) for 8 groups.
2. Convert blueprint polygons into ordered shape loops (`Shapes`).
3. Build stripe/grid sampling and stroke candidates (`Grid`).
4. Clip/split paths against polygons (`strokeSystem` + `containedPath`).
5. Draw each accepted segment as a filled ribbon stroke (`filledPath`).
6. Composite paper/pencil/noise/light filters.

Output is an SVG in the page (`#svgNode`) and can be exported with `E` key.

### B) 3D composition + export studio (`camogli-3d.html` / `camogli-3d.js`)

- Uses Three.js + cannon-es.
- Lets you settle cube stacks, tune export controls, and export layered SVG variants.
- Supports shadow extraction modes, hatching controls, and preset persistence in localStorage.

## Source Map (Important Files)

### Core 2D runtime

- `index.html`: global script load order and app entry.
- `index.js`: runtime constants, debug switches, orchestration, export hotkey (`E`).
- `blueprintNew.js`: main geometric tile definitions (A-H faces, densities, order).
- `blueprint.js`: legacy blueprint variant.
- `shapes.js`: converts blueprint data to `loopMaterial` ordering.
- `grid.js`: generates stripe boxes and candidate stroke vectors.
- `strokeSystem.js`: repeatedly classifies/splits candidates until drawable segments remain.
- `containedPath.js`: point-in-polygon checks and edge intersection splitting logic.
- `filledPath.js`: filled ribbon stroke geometry (currently `swingspitz` profile).
- `circlePath.js`: filled/outlined organic circle primitive (used in hatching debug modes).
- `utilsSVG.js`: math helpers, random helpers, polygon tests, SVG export helpers.

### Filters and paper surface

- `paperFilter.js`: base paper relief texture filter.
- `pencilFilter.js`: displacement/noise distortion for drawn marks.
- `noiseDotFilter.js`: grain/specular noise overlay layer.
- `paperLightFilter.js`: paper light + grain blend overlay.
- `paperBackgroundTexture.js`: reusable, configurable paper background generator.
- `debugPaperBackground.html` + `debugPaperBackground.js`: full UI lab for paper tuning.

### 3D studio and related files

- `camogli-3d.html`: studio shell + controls UI.
- `camogli-3d.js`: physics, camera, controls, shadow/hatching export logic.
- `debugCubeAxes.js`: debugging helpers for cube principal axes/hatching direction.
- `vendor/three/*`: Three.js runtime modules.
- `vendor/cannon-es/*`: physics engine.

### Test/debug scripts (browser-driven)

These are not automated test-runner tests; they are helper functions used by debug flags:

- `blueprint.test.js`
- `blueprintNew.test.js`
- `grid.test.js`
- `shapes.test.js`
- `strokeSystemContainedPath.test.js`
- `filledPath.test.js`
- `debugHatching.js`
- `debugComposition.js`

## Debug Entry Points (2D Runtime)

Set query params on `index.html`:

- `?debugGrid=1` or `?debug=grid`
- `?debugCube=1` or `?debug=cube`
- `?debugStroke=1` or `?debug=stroke`
- `?debugFilledPath=1` or `?debug=filledPath`
- `?debugFilledPathParams=1` or `?debug=filledPathParams`
- `?debugSingleCircle=1`
- `?debugHatchingStudio=1&embeddedDebugStudio=1`
- `?zoom=1` swaps to `stylesZoomIn.css`

Notes:

- If any debug mode is active, `TEST = true` in `index.js` and normal render path is bypassed.
- Legacy hatching debug URL redirects to `camogli-3d.html` unless embedded flag is also set.

## Rendering/Layer Order (Normal 2D Mode)

When `TEST == false`, visual stack is:

1. Background rect with paper filter (`filterPaper`).
2. Main stroke group (`groupB`) with `pencilFilter`.
3. Dot noise overlay (`noiseDotFilter`, `rectDot`).
4. Paper light overlay (`paperLightFilter`).

## Runtime Characteristics and Conventions

- Global scope architecture: many files rely on globals (`svgNode`, `defs`, constants from `index.js`).
- Script order matters in `index.html`; modules are not imported/exported in 2D runtime.
- Randomness:
  - Main flow sets `Math.random = $fx.rand` and seeds `noise` with `$fx.rand()`.
  - Some debug paths use custom seeded PRNG helpers.
- Geometry assumptions are pixel-space and often depend on `SHORTSIDE`, `RESOLUTIONBOXCOUNT`, `STRIPEHEIGHT`.

## Where To Change What

- Change overall composition density/character:
  - `index.js` grid configs (`stepCountRes`, `vectorMagnitude`, `angleRadiansGain`, etc.)
  - `blueprintNew.js` face `density` and point layouts.
- Change path clipping/splitting behavior:
  - `containedPath.js` (`uncertaintyShift`, `minimalFactor`, intersection logic).
- Change stroke look:
  - `filledPath.js` profile geometry (`swingspitz`) and jitter/bend/width behavior.
- Change paper and finishing look:
  - `paperFilter.js`, `paperLightFilter.js`, `noiseDotFilter.js`, `pencilFilter.js`, `paperBackgroundTexture.js`.
- Change 3D export behavior and controls:
  - `camogli-3d.js`.

## Packaging and Mirrors

- `fxhash-camogli-package/` is a packaging-oriented copy of the 3D setup and utilities.
- Keep this folder in sync when shipping fxhash-ready artifacts for that path.

## Known Oddities / Legacy Notes

- `pointInPolygon.js` currently exists but is empty; active `pointInPolygon` implementation is in `utilsSVG.js`.
- Several legacy or archive files remain (`index_bak.js`, `strokeSystem_old.js`, `strokeSplitter copy.js`, etc.).
- Main runtime uses class names with lowercase starts in places (for example `strokeSystem`, `containedPath`), which is intentional legacy style.

## How To Verify Changes Quickly

1. Start local server.
2. Open `index.html` for baseline render.
3. Open at least one debug mode relevant to your change (for example `?debugFilledPath=1`).
4. Open `camogli-3d.html` if changes touched 3D/export/hatching.
5. Use `E` in 2D runtime to verify SVG export still works.

## AI Agent Onboarding Tips

If you are an automated coding agent entering this repo:

1. Read `index.js` first for global constants and mode switches.
2. Read `index.html` to understand script load order dependencies.
3. Treat `*.test.js` files as manual debug harnesses, not CI tests.
4. Avoid introducing module syntax into the 2D runtime unless you migrate all dependent files together.
5. Prefer minimal, localized edits because many files share implicit globals.

## License

See `LICENSE`.
