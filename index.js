// ########################################
var BULK = false; // bulk export images - and use direct not lense
// let RESOLUTIONBOXCOUNT = 160;
var RESOLUTIONBOXCOUNT = 80;
// let RESOLUTIONBOXCOUNT = 60;
// let RESOLUTIONBOXCOUNT = 40;
// ########################################

var TITLE = "Scott";
var ARTIST = "Stefan Schwaha, @sektionschef";
var DESCRIPTION = "javascript on html canvas";
var WEBSITE = "https://digitalitility.com";
var YEAR = "2023";

var BACKGROUNDTONE = "#ffffff";


Math.random = $fx.rand;
noise.seed($fx.rand());

const sp = new URLSearchParams(window.location.search)
//  console.log(sp);

// console.info(`fxhash: %c${$fx.hash}`, 'font-weight: bold');


CANVASFORMATS = {
  "1:1": {
    "canvasWidth": 900,
    "canvasHeight": 900,
  },
  "16:9": {
    "canvasWidth": 1600,
    "canvasHeight": 900,
  },
  "9:16": {
    "canvasWidth": 900,
    "canvasHeight": 1600,
  },
  "DIN A0, 84,1 cm x 118,9 cm": {
    "canvasWidth": 1272,
    "canvasHeight": 900,
  },
}

canvasFormatChosen = CANVASFORMATS["16:9"];
// var canvasFormatChosen = CANVASFORMATS[$fx.getParam("format_id")];
// console.log("Canvas Format: " + canvasFormatChosen);

if (canvasFormatChosen.canvasWidth <= canvasFormatChosen.canvasHeight) {
  SHORTSIDE = canvasFormatChosen.canvasWidth;
  LONGSIDE = canvasFormatChosen.canvasHeight;
  LANDSCAPE = false;
} else {
  SHORTSIDE = canvasFormatChosen.canvasHeight;
  LONGSIDE = canvasFormatChosen.canvasWidth;
  LANDSCAPE = true;
}


// this is how to define parameters
$fx.params([
  // {
  //   id: "number_id",
  //   name: "A number/float64",
  //   type: "number",
  //   //default: Math.PI,
  //   options: {
  //     min: 1,
  //     max: 10,
  //     step: 0.0001,
  //   },
  // },

  // {
  //   id: "bigint_id",
  //   name: "A bigint",
  //   type: "bigint",
  //   update: "code-driven",
  //   //default: BigInt(Number.MAX_SAFE_INTEGER * 2),
  //   options: {
  //     min: Number.MIN_SAFE_INTEGER * 4,
  //     max: Number.MAX_SAFE_INTEGER * 4,
  //     step: 1,
  //   },
  // },
  // {
  //   id: "string_id_long",
  //   name: "A string long",
  //   type: "string",
  //   update: "code-driven",
  //   //default: "hello",
  //   options: {
  //     minLength: 1,
  //     maxLength: 512,
  //   },
  // },
  // {
  //   id: "select_id",
  //   name: "A selection",
  //   type: "select",
  //   update: "code-driven",
  //   //default: "pear",
  //   options: {
  //     options: ["apple", "orange", "pear"],
  //   },
  // },
  // {
  //   id: "color_id",
  //   name: "A color",
  //   type: "color",
  //   update: "code-driven",
  //   //default: "ff0000",
  // },
  // {
  //   id: "boolean_id",
  //   name: "A boolean",
  //   type: "boolean",
  //   update: "code-driven",
  //   //default: true,
  // },
  // {
  //   id: "string_id",
  //   name: "A string",
  //   type: "string",
  //   update: "code-driven",
  //   //default: "hello",
  //   options: {
  //     minLength: 1,
  //     maxLength: 512,
  //   },
  // },
])

// this is how features can be defined
$fx.features({
  // "A random feature": Math.floor($fx.rand() * 10),
  // "A random boolean": $fx.rand() > 0.5,
  // "A random string": ["A", "B", "C", "D"].at(Math.floor($fx.rand() * 4)),
  // "Feature from params, its a number": $fx.getParam("number_id"),
})

function main() {
  // check mouse pos
  // https://stackoverflow.com/questions/7790725/javascript-track-mouse-position 
  // onmousemove = function (e) { console.log("mouse location:", e.clientX, e.clientY) }

  // log the parameters, for debugging purposes, artists won't have to do that
  // console.log("Current param values:");
  // // Raw deserialize param values
  // console.log($fx.getRawParams());
  // // Added addtional transformation to the parameter for easier usage
  // // e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
  // console.log($fx.getParams());

  // // how to read a single raw parameter
  // console.log("Single raw value:");
  // console.log($fx.getRawParam("color_id"));
  // // how to read a single transformed parameter
  // console.log("Single transformed value:");
  // console.log($fx.getParam("color_id"));

  var POLYGONPOINTS = [[200, 110], [250, 290], [160, 310]];

  const targetDiv = document.getElementById('badAssCanvas');
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgNode.setAttributeNS(null, 'viewBox', '0 0 ' + canvasFormatChosen.canvasWidth + " " + canvasFormatChosen.canvasHeight);
  svgNode.setAttributeNS(null, 'id', 'svgNode');
  targetDiv.appendChild(svgNode);

  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.setAttributeNS(null, 'id', 'defs');
  svgNode.appendChild(defs);


  createBackground();
  creategroupA();
  createPaperFilter();
  // createPencilNoiseFilter();
  createOtherNoiseLayer();
  createBlur();

  // DUMMY SHAPE
  // var pointString = ""
  // for (var i = 0; i < POLYGONPOINTS.length; i++) {
  //   pointString = pointString + POLYGONPOINTS[i][0] + "," + POLYGONPOINTS[i][1] + " ";
  // }
  // var shapy = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  // // shapy.setAttributeNS(null, 'points', "200,10 250,190 160,210");
  // shapy.setAttributeNS(null, 'points', pointString);
  // shapy.setAttributeNS(null, 'fill', "none");
  // shapy.setAttributeNS(null, 'stroke', "black");
  // shapy.setAttributeNS(null, "stroke-width", 2);
  // svgNode.appendChild(shapy);

  // GRID 2
  let grid2 = new Grid({
    stepCount: 100,
    strokeColor: "#222222ff",
    strokeWidth: 2,
    shortBoxCount: RESOLUTIONBOXCOUNT,
    longSide: LONGSIDE,
    shortSide: SHORTSIDE,
    landscape: LANDSCAPE,
  });

  // GRID
  let grid = new Grid({
    stepCount: 400,
    // strokeColor: "#222222ff",
    strokeColor: "#4e4e4eff",
    strokeWidth: 1,
    shortBoxCount: RESOLUTIONBOXCOUNT,
    longSide: LONGSIDE,
    shortSide: SHORTSIDE,
    landscape: LANDSCAPE,
  });

  showGroupA();
  // showOtherNoise();
  showBlur();

  // TEST CASE
  // var singleStroke = new strokePath({
  //   "start": {
  //     x: 120,
  //     y: 180
  //   },
  //   vectorMagnitude: 225,
  //   angleRadians: Math.PI / 4, // 0.2,
  //   strokeColor: "black",
  //   strokeColorAction: "red",
  //   shape: POLYGONPOINTS,
  // });
  // singleStroke.showPath();


  setTagsHTML({
    "title": TITLE,
    "artist": ARTIST,
    "description": DESCRIPTION,
    "website": WEBSITE,
    "year": YEAR,
  });

  if (BULK) {
    // var filename = `${$fx.getParam("country_id")}_${$fx.getParam("palette_id")}_${$fx.getParam("horizon_id")}_${$fx.getParam("format_id")}_${$fx.getParam("noiseYParam_id")}_${$fx.hash}.svg`;

    // // SAVE SVG
    // saveSvg(svgNode, filename);

    // setTimeout(reloader, 30000)
  }

}

main()

$fx.on(
  "params:update",
  newRawValues => {
    // opt-out default behaviour
    if (newRawValues.number_id === 5) return false
    // opt-in default behaviour
    return true
  },
  (optInDefault, newValues) => main()
)


// Add event listener on keydown -  https://www.section.io/engineering-education/keyboard-events-in-javascript/ 
document.addEventListener('keydown', (event) => {

  if (event.code == "KeyE") {
    var filename = TITLE + "_" + $fx.hash + "_" + getTimestamp() + ".svg";
    // alert("oida is going down");

    saveSvg(svgNode, filename);
  }

  // Alert the key name and key code on keydown
  // var name = event.key;
  // var code = event.code;
  // alert(`Key pressed ${name} \r\n Key code value: ${code}`);

}, false);


function createDrawingGroup() {
  var groupDrawing = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupDrawing.setAttribute("id", "drawing");
  defs.appendChild(groupDrawing);
}


function createBackground() {
  // create background
  var backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  backgroundRect.setAttribute("id", "backgroundRect");
  backgroundRect.setAttribute("x", "0");
  backgroundRect.setAttribute("y", "0");
  backgroundRect.setAttribute("width", "100%");
  backgroundRect.setAttribute("height", "100%");
  // backgroundRect.setAttribute("fill", BACKGROUNDTONE);
  backgroundRect.setAttribute("fill", "none");
  backgroundRect.setAttribute("filter", "url(#filterPaper)");
  svgNode.appendChild(backgroundRect);
}

function creategroupA() {
  // create background
  var groupA = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupA.setAttribute("id", "groupA");
  groupA.setAttribute("x", "0");
  groupA.setAttribute("y", "0");
  groupA.setAttribute("width", "100%");
  groupA.setAttribute("height", "100%");
  groupA.setAttribute("fill", "none");

  // svgNode.appendChild(groupA);
  defs.appendChild(groupA);
}

function showGroupA() {
  const svgNode = document.getElementById('svgNode');
  const groupA = document.getElementById('groupA');
  // groupA.setAttribute("filter", "url(#fueta)");

  svgNode.appendChild(groupA);
}

function createPencilNoiseFilter() {
  var filterPencil = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filterPencil.setAttribute("id", "filterPencil");
  filterPencil.setAttribute("x", "0");
  filterPencil.setAttribute("y", "0");
  // added
  filterPencil.setAttribute("filterUnits", "objectBoundingBox");
  filterPencil.setAttribute("primitiveUnits", "userSpaceOnUse");
  filterPencil.setAttribute("color-interpolation-filters", "linearRGB");

  let turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
  turbulence.setAttribute("id", "turbulence");
  // turbulence.setAttribute("in", "filterObjA");
  turbulence.setAttribute("type", "fractalNoise");
  turbulence.setAttribute("baseFrequency", "0.4");
  turbulence.setAttribute("numOctaves", "1");
  // turbulence.setAttribute("seed", "15");
  turbulence.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
  turbulence.setAttribute("stitchTiles", "stitch");
  turbulence.setAttribute("x", "0%");
  turbulence.setAttribute("y", "0%");
  turbulence.setAttribute("width", "100%");
  turbulence.setAttribute("height", "100%");
  turbulence.setAttribute("result", "turbulence");

  var displacement = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
  displacement.setAttribute("id", "displacement");
  displacement.setAttribute("scale", "2");
  displacement.setAttribute("in", "SourceGraphic");

  filterPencil.appendChild(turbulence);
  filterPencil.appendChild(displacement);
  defs.appendChild(filterPencil);
}

function createPaperFilter() {

  // <feTurbulence type="fractalNoise" baseFrequency='0.04' numOctaves="5" result='noise' />
  //   <feDiffuseLighting in='noise' lighting-color='white' surfaceScale='2'>
  //   <feDistantLight azimuth='45' elevation='60' />
  // </feDiffuseLighting>

  var filterPaper = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filterPaper.setAttribute("id", "filterPaper");
  filterPaper.setAttribute("x", "0");
  filterPaper.setAttribute("y", "0");
  // added
  filterPaper.setAttribute("filterUnits", "objectBoundingBox");
  filterPaper.setAttribute("primitiveUnits", "userSpaceOnUse");
  filterPaper.setAttribute("color-interpolation-filters", "linearRGB");

  let turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
  turbulence.setAttribute("id", "turbulence");
  turbulence.setAttribute("type", "fractalNoise");
  turbulence.setAttribute("baseFrequency", "0.4"); // 0.04
  turbulence.setAttribute("numOctaves", "5");
  // turbulence.setAttribute("seed", "15");
  turbulence.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
  turbulence.setAttribute("stitchTiles", "stitch");
  turbulence.setAttribute("x", "0%");
  turbulence.setAttribute("y", "0%");
  turbulence.setAttribute("width", "100%");
  turbulence.setAttribute("height", "100%");
  turbulence.setAttribute("result", "turbulence");

  let diffuseLighting = document.createElementNS("http://www.w3.org/2000/svg", "feDiffuseLighting");
  diffuseLighting.setAttribute("id", "diffuseLighting");
  diffuseLighting.setAttribute("in", "turbulence");
  diffuseLighting.setAttribute("lighting-color", "white");
  diffuseLighting.setAttribute("surfaceScale", "0.25");  // 2

  let distantLight = document.createElementNS("http://www.w3.org/2000/svg", "feDistantLight");
  distantLight.setAttribute("id", "distantLight");
  distantLight.setAttribute("azimuth", "45");
  distantLight.setAttribute("elevation", "60");

  filterPaper.appendChild(turbulence);
  diffuseLighting.appendChild(distantLight);
  filterPaper.appendChild(diffuseLighting);

  // defs.appendChild(turbulence);
  defs.appendChild(filterPaper);
}

function createOtherNoiseLayer() {
  // https://codepen.io/lagats/pen/QpOOVB
  const svgNode = document.getElementById('svgNode');
  const defs = document.getElementById('defs');

  var fuetaObj = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  fuetaObj.setAttribute("id", "fuetaObj");
  fuetaObj.setAttribute("width", "100%");
  fuetaObj.setAttribute("height", "100%");
  fuetaObj.setAttribute("opacity", "1");
  // fuetaObj.setAttribute("opacity", "0.3");

  var fueta = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  fueta.setAttribute("id", "fueta");

  var turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
  turbulence.setAttribute("id", "turbulence");
  turbulence.setAttribute("type", "fractalNoise");
  turbulence.setAttribute("baseFrequency", "10");
  turbulence.setAttribute("numOctaves", "6");
  turbulence.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
  turbulence.setAttribute("stitchTiles", "stitch");
  turbulence.setAttribute("x", "0%");
  turbulence.setAttribute("y", "0%");
  turbulence.setAttribute("width", "100%");
  turbulence.setAttribute("height", "100%");
  turbulence.setAttribute("result", "turbulence");

  var deSaturate = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
  deSaturate.setAttribute("type", "saturate");
  deSaturate.setAttribute("values", "0");
  deSaturate.setAttribute("x", "0%");
  deSaturate.setAttribute("y", "0%");
  deSaturate.setAttribute("width", "100%");
  deSaturate.setAttribute("height", "100%");
  deSaturate.setAttribute("in", "sourceGraphic");
  deSaturate.setAttribute("result", "deSaturate");

  // https://stackoverflow.com/questions/64946883/apply-noise-to-image-with-transparency-by-use-of-svg-filters
  var composite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
  composite.setAttribute("operator", "in");
  composite.setAttribute("in2", "sourceGraphic");
  composite.setAttribute("result", "composite");

  var blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
  blend.setAttribute("in", "sourceGraphic");
  // blend.setAttribute("in2", "deSaturate");
  blend.setAttribute("in2", "composite");
  blend.setAttribute("mode", "overlay");
  // blend.setAttribute("mode", "multiply");

  fueta.appendChild(turbulence);
  fueta.appendChild(deSaturate);
  // fueta.appendChild(composite);
  // fueta.appendChild(blend);

  fuetaObj.setAttribute("filter", "url(#fueta)");
  defs.appendChild(fueta);
  defs.appendChild(fuetaObj);

}

function showOtherNoise() {
  const svgNode = document.getElementById('svgNode');
  var fuetaObj = document.getElementById('fuetaObj');

  svgNode.appendChild(fuetaObj);
}


function createBlur() {
  const defs = document.getElementById('defs');

  var blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  blurFilter.setAttribute("id", "blurFilter");

  var blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  blur.setAttribute("id", "blur");
  blur.setAttribute("in", "SourceGraphic");
  blur.setAttribute("stdDeviation", "2");

  blurFilter.appendChild(blur);
  defs.appendChild(blurFilter);
}

function showBlur() {
  const svgNode = document.getElementById('svgNode');
  const groupA = document.getElementById('groupA');
  groupA.setAttribute("filter", "url(#blurFilter)");
}