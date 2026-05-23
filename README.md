# Scott

## todos

* different hatching sttyles
  * https://i1-e.pinimg.com/1200x/d9/7f/79/d97f7922b641e9fc0ec8a89c46354dda.jpg 
  * https://i1-e.pinimg.com/736x/0b/70/b4/0b70b4595e5fdd9dd95e4e29e940d5c6.jpg 
  * result: http://localhost:3301/?debugHatching=1 
* test with complex cubes
* check 3d generation
  * Three.js scene: cube, plane, camera, light, shadows.
  * Physics: use cannon-es or rapier to drop the cube.
  * Freeze frame: stop animation when the cube rests.
  * Extract 2D face coordinates: project cube vertices through the camera.
  * Create flat image: generate SVG polygons for visible cube faces + projected shadow.
 

3D preview: http://localhost:3301/camogli-3d.html - with `python3 -m http.server 3301`
camera position:

```
{
  "camera": {
    "x": 5.298777684117101,
    "y": 6.0417509403890035,
    "z": 2.2597841262231078
  },
  "target": {
    "x": 0,
    "y": 1.5,
    "z": 0.19999999999999998
  }
}
```

debug hatching styles: http://localhost:3301/?debugHatching=1
debug cube principal/perpendicular axes: http://localhost:3301/?debugCubeAxes=1
debug indivdual hatching: http://localhost:3301/?debugCubeAxes=1&hatchWidth=1.4&hatchJitter=0.8&hatchBend=0.04&hatchSpacing=0.4 
debug SVG hatching lab: http://localhost:3301/camogli-3d.html?debugSvgHatching=1
debug strokes boundaries: http://localhost:3301/?debugStroke=1 
debug single stroke: http://localhost:3301/?debugFilledPath=1&zoom=1 - scroll down
debug stroke params: http://localhost:3301/?debugFilledPathParams=1 
debug composition: http://localhost:3301/?debugComposition=1 


## Hatching Studio

Purpose: tune hatching behavior on a simplified cube projection before using similar logic in export.

### URLs

- Base screen: http://localhost:3301/?debugCubeAxes=1
- Tuned example: http://localhost:3301/?debugCubeAxes=1&hatchWidth=1.4&hatchJitter=0.8&hatchBend=0.04&hatchSpacing=0.4
- Less end washout example: http://localhost:3301/?debugCubeAxes=1&hatchWidth=1.4&hatchJitter=0.45&hatchBend=0.03&hatchSpacing=0.4&hatchEdgeInset=1.2&hatchTrimRatio=0.22&hatchMinVisible=2

### Logic Summary

1. Build 3 cubes side-by-side in flat SVG, viewed in 3/4 from above.
2. Keep the 3 visible faces per cube as polygons (9 sides total).
3. For each polygon:
  - Compute principal axis from point covariance.
  - Compute perpendicular direction to that principal axis.
  - Draw direction helpers only when "Debug direction" is enabled.
  - Principal axis is green and perpendicular direction arrow is red.
4. Create hatch candidates by sweeping parallel lines through the polygon and intersecting with polygon edges.
5. Convert each valid segment into a real filledPath stroke (`filledPath.js`) with bend/width/jitter.
6. No clip mask is used for hatch containment. Strokes are drawn from geometrically clipped segment endpoints.
7. Optional labels (`C?-? b=?`) can be enabled and are placed in the center of each side in gray.

### Side Brightness Strategy

- Brightness scale is inverted from earlier experiments:
  - `0.0` = bright
  - `1.0` = dark
- Default hatch recipe:
  - `brightness <= 0.5` -> single hatching
  - `brightness > 0.5` -> cross hatching
- Faces use `fill="none"`; perceived brightness is achieved by hatch strategy plus spacing density.

### Seed + Continuity

- The studio now uses a fixed numeric seed for deterministic geometry and stroke randomness.
- Clicking sides or changing slider values keeps the same visual family for that seed.
- Use "Apply Seed" to jump to a specific seed.
- Use "New Seed" (or "New Seed + Re-roll") to intentionally generate a new arrangement.
- Seed and studio state are encoded in the URL and restored on reload.

### Debug Direction Toggle

- "Debug direction" is OFF by default.
- When enabled, each side shows:
  - principal axis (green)
  - perpendicular direction arrow (red)

### Side Labels Toggle

- "Side labels" is OFF by default.
- When enabled, each side shows a gray label in its center, e.g. `C1-B b=0.15`.
- Label visibility is stored in URL/studio state and restored on reload.

### Parameters (query string)

- `hatchWidth`: filledPath stroke width.
- `hatchJitter`: endpoint jitter before curve construction.
- `hatchBend`: long-edge bend factor in swingspitz profile.
- `hatchSpacing`: global spacing multiplier for hatch sweep distance.
- `hatchEdgeInset`: absolute trim from polygon boundaries.
- `hatchTrimRatio`: relative trim ratio per segment length.
- `hatchMinVisible`: minimum visible segment length threshold after trim.

### Tuning Notes

- If ends look washed out: lower `hatchJitter`, `hatchTrimRatio`, and `hatchEdgeInset`.
- If too many short strokes disappear: lower `hatchMinVisible`.
- If the face looks too dark/light: adjust `hatchSpacing`.


## Hatch Studio

Shape: 4 corners (A, B, C, D)

The stroke is not a line — it's a filled polygon with curved edges. In swingspitz profile (currently active):

A — near start, offset slightly inward (−70% of π)
B — near end, slightly inward from one side
C — near end, slightly inward from the other side
D — near start, slightly inward
So A/D are the "back" of the stroke (start side), B/C are the "tip" (end side). The whole shape is very narrow — distanceWidth = 1 pixel.

Path: A → B → C → D → A (4 cubic Bézier curves)
Each segment uses two control points (cAB/cBA, cBC/cCB, cCD/cDC, cDA/cAD) to give each edge a slight curve.

Where randomness is injected:

Variable	Where	Effect
cat = 0.75	jitterPoint(start, cat) and jitterPoint(end, cat)	Wiggles both endpoints ±0.75px
bogal = gaussianRandAdj(0, 0.03)	cAB, cBA, cCD, cDC control point angles	Slightly bends the long edges of the stroke
The control points for the tip (cBC/cCB) and back (cDA/cAD) use fixed angle offsets (±4% and ±82% of π), so the pointy tip and blunt tail are deterministic in shape but move with the jittered endpoints.

randomPath() exists but is commented out — it would additionally push all control points outward from the center.

## generated documentation

### Project purpose

This repository is a browser-based generative SVG artwork for fxhash. The piece builds a geometric tile blueprint, generates many candidate stroke vectors, clips/splits those vectors against polygon faces, and renders the accepted segments as filled, pencil-like marks with paper and grain overlays.

### Runtime pipeline

1. `index.html` loads all scripts in global scope and starts `index.js`.
2. `index.js` seeds randomness with `$fx.rand()`, sets canvas format and constants, and initializes scene groups/filters.
3. `blueprintNew.js` creates repeated polygon tile faces (A-H) and returns shape data by group.
4. `shapes.js` transforms blueprint data into ordered `loopMaterial` used for path containment checks.
5. `grid.js` creates striped box regions and generates candidate stroke vectors per stripe.
6. `strokeSystem.js` processes candidate paths and delegates split/full checks to `containedPath.js`.
7. `containedPath.js` checks point-in-polygon and edge intersections, splitting paths when needed.
8. `filledPath.js` draws accepted path segments as organic filled Bezier forms.
9. Filter layers (`paperFilter.js`, `pencilFilter.js`, `noiseDotFilter.js`, `paperLightFilter.js`) add texture and final surface look.

### Visible layer order

When rendering in normal mode (`TEST = false`), the visual stack is:

1. `backgroundRect` with `filterPaper`
2. `groupB` strokes with `pencilFilter`
3. `rectDot` overlay from `noiseDotFilter`
4. `paperLightContainer` overlay from `paperLightFilter`

This order is controlled in `index.js` by `showBackground()`, `showGroupB()`, `new noiseDotFilter()`, and `paperLight.showLayer()`.

### File responsibilities

- `index.js`: composition setup, object wiring, and render orchestration.
- `blueprintNew.js`: core geometric blueprint and per-face metadata (`density`, `shapeMaxLoop`, `fillColor`).
- `shapes.js`: flattening/sorting geometry into loop order.
- `grid.js`: box grid, stripe categorization, and stroke candidate generation.
- `strokeSystem.js`: iterative path solving and draw dispatch.
- `containedPath.js`: geometry tests (inside/split/full) and path splitting.
- `filledPath.js`: stroke appearance profile (`vanilla`/`swingspitz`) and final path drawing.
- `utilsSVG.js`: vector math, helpers, metadata tags, SVG export.
- `*.test.js`: manual debug/test routines toggled by `TEST` in `index.js` (not an automated test runner).

### Main tuning controls

- In `index.js`:
  - `RESOLUTIONBOXCOUNT`: effective scene resolution.
  - `STRIPEHEIGHT`: stripe band height.
  - `MARGINRELATIVE`: drawing margin.
  - Grid config (`stepCountRes`, `vectorMagnitude`, `angleRadiansStart`, `angleRadiansGain`).
- In `blueprintNew.js`:
  - Tile proportions (`heightAB`, offsets) and face-level `density`.
- In `containedPath.js`:
  - `minimalFactor`, `uncertaintyShift` for clipping behavior.
- In filter files:
  - Turbulence frequencies, blend modes, and overlay opacity.

### Export and interaction

- Press `E` to export the current SVG (`saveSvg(...)` in `index.js`).
- fxhash metadata tags are set via `setTagsHTML(...)`.

## Filter
// *result* ist wichtig bei filtern, um auf die einelnen Ebenen referenzieren zu können

Aktuell ein Paperfilter für Grundstruktr als Hintergrund. Papierknitter, Grain und Dirt kommen dann auf den Hintergrund und das gezeichnete Material. Mit Opacity, damit sich das alles gewichten lässt.

* grid - creating the boxes, irrespective to the format chosen
* blueprint - desigend coordinates of the shapes defined in count of boxes. here the design of the shapes can be changed.
* shapes - redefining the blueprint to create a dict with ordering of elements
* strokesystem
* contained path
* filledp path

## library for merging polygons

https://www.npmjs.com/package/polygon-clipping - from: https://stackoverflow.com/questions/33502767/merging-intersecting-polygons-to-single-polygon 




# fx(hash) boilerplate

A boilerplate for the creation of generative art that can be published on fx(hash).

## Introduction

This repository contains the most simple and recommended setup to publish a generative artwork on fxhash. You can do modifications to the existing files, create a zip that contains all of them and upload it on fxhash.xyz.

This are the hard facts of the required setup:
- A html entry point called `index.html`
- The `@fxhash/project-sdk` as a local script file included in the html entry point called `./fxhash.js`
- A script that generates the generative art included in the html entry point called `index.js`

Anything else from there is optional (even this README 🙃). The boilerplate contains a .css file but this is theoretically not needed if you don't want to set any css.
For a better developer experience we are offering the `@fxhash/cli` that will help you to create your generative artwork. 

The rest of the README will actually speak about the usage of the `@fxhash/cli`. 

## Prerequisites

- `node >= 18.0.0`
- `npm >= 9.0.0`

That's it you are ready to develop your artwork with the `@fxhash/cli`

### Creating a new project

You probably think: "Why we start with creating a project if I am using the boilerplate?". Thats because you don't need to clone the boilerplate to start a project. You can create a project by using the `@fxhash/cli`. 

```
npx fxhash create
```

This command will prompt you with the dialog to create a new project. Give your project a name and choose the "simple" project template. You just created your first project. We will speak about the "ejected" template later.

> The first time you run npx fxhash <command> npm is actually installing the `@fxhash/cli` package globally on your computer.

### Starting the development environment

The whole fx(lens) environment is exposed via the `@fxhash/cli`. So you just have to run the following command in the root of your project.

```
npx fxhash dev
```

This will open up the fx(lens) environment in your browser. In the backend two servers are running: 
- `http://localhost:3300` serves fx(lens) you can connect to a token
- `http://localhost:3301` serves your project with live reloading

### Building your project

```
npx fxhash build
```

Will build your project and create an `upload.zip` that you can use to publish your artwork on fxhash.xyz

## Advanced usage: Ejected Project

When you created your first project with `fxhash create` you saw that there is a second project template you can choose: "ejected"

If you want to use a package manager to install dependencies for your project or customize how webpack builds your project, the "ejected" template provides all those functionalities. 

The structure of the ejected template will look like this:
```
├─ package.json
├─ webpack.dev.config.js
├─ webpack.prod.config.js
├─ src/
  ├─ index.html
  ├─ index.js
  ├─ fxhash.js
  ├─ LICENSE
```

You can still use all the functionality the `@fxhash/cli` provides, but e.g. customize the webpack configuration for the `fxhash dev`(webpack.dev.config.js) and `fxhash build` (webpack.prod.config.js) commands.

### Going from simple to ejected

Even if you started your project with a simple template you can go all "ejected" by running

```
fxhash eject
```

This will transform your simple project structure into the ejected project structure. But be aware this change is not reversable via the `@fxhash/cli`.
