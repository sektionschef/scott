# AGENTS.md

## Quick Context

- Project has two active runtimes:
  - 2D SVG generator: `index.html` + `index.js` (global-script architecture).
  - 3D export studio: `camogli-3d.html` + `camogli-3d.js` (ES modules, Three.js + cannon-es).
- Start local server from repo root:
  - `python3 -m http.server 3301`

## Open These First

1. `README.md` for architecture + debug entry points.
2. `index.js` for global constants, mode switches, and orchestration.
3. `index.html` for script load order dependencies.

## Core 2D Pipeline

1. `blueprintNew.js` builds tile geometry/faces.
2. `shapes.js` creates ordered `loopMaterial`.
3. `grid.js` generates stroke candidates.
4. `strokeSystem.js` + `containedPath.js` clip/split paths.
5. `filledPath.js` draws organic ribbon strokes.
6. Filter stack: `paperFilter.js`, `pencilFilter.js`, `noiseDotFilter.js`, `paperLightFilter.js`.

## Important Reality Checks

- `*.test.js` files are browser debug harnesses, not CI unit tests.
- `pointInPolygon.js` is empty; active implementation is in `utilsSVG.js`.
- Main 2D runtime depends on shared globals and script order.

## Debug URLs (2D)

- `/?debugGrid=1`
- `/?debugStroke=1`
- `/?debugFilledPath=1`
- `/?debugFilledPathParams=1`
- `/?debugSingleCircle=1`

## Safe Editing Rules

- Prefer minimal, localized edits.
- Do not introduce module import/export into the 2D runtime unless doing a full migration.
- If you change geometry/strokes, verify both:
  - `http://localhost:3301/`
  - `http://localhost:3301/camogli-3d.html`
- Press `E` on the 2D page to confirm SVG export still works.
