# Scott

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
