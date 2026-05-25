// ########################################
TEST = false;

var BULK = false; // bulk export images - and use direct not lense
// let RESOLUTIONBOXCOUNT = 160;
RESOLUTIONBOXCOUNT = 80;
// let RESOLUTIONBOXCOUNT = 60;
// let RESOLUTIONBOXCOUNT = 40;

STRIPEHEIGHT = 4;  // height of row in boxes
MARGINRELATIVE = 1; // margin relative to stripeheight
// ########################################

var TITLE = "Camogli";
var ARTIST = "Stefan Schwaha, @sektionschef";
var DESCRIPTION = "javascript on html canvas";
var WEBSITE = "https://digitalitility.com";
var YEAR = "2024";

var BACKGROUNDTONE = "#929292";


Math.random = $fx.rand;
noise.seed($fx.rand());

const sp = new URLSearchParams(window.location.search)
//  console.log(sp);

if (sp.get("zoom") === "1") {
  const link = document.querySelector('link[rel="stylesheet"]');
  if (link) link.href = "stylesZoomIn.css";
}

const DEBUG_GRID = sp.get("debugGrid") === "1" || sp.get("debug") === "grid";
const DEBUG_CUBE = sp.get("debugCube") === "1" || sp.get("debug") === "cube";
const DEBUG_HATCHING = false;
const DEBUG_STROKE = sp.get("debugStroke") === "1" || sp.get("debug") === "stroke";
const DEBUG_FILLED_PATH = sp.get("debugFilledPath") === "1" || sp.get("debug") === "filledPath";
const DEBUG_FILLED_PATH_PARAMS = sp.get("debugFilledPathParams") === "1" || sp.get("debug") === "filledPathParams";
const DEBUG_SINGLE_CIRCLE = sp.get("debugSingleCircle") === "1";
const DEBUG_COMPOSITION = false;
const DEBUG_CUBE_AXES = sp.get("debugCubeAxes") === "1" || sp.get("debug") === "cubeAxes";
if (DEBUG_GRID || DEBUG_CUBE || DEBUG_HATCHING || DEBUG_STROKE || DEBUG_FILLED_PATH || DEBUG_FILLED_PATH_PARAMS || DEBUG_SINGLE_CIRCLE || DEBUG_COMPOSITION || DEBUG_CUBE_AXES) {
  TEST = true;
}

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

CANVASFORMATCHOSEN = CANVASFORMATS["16:9"];
// CANVASFORMATCHOSEN = CANVASFORMATS["1:1"];
// var CANVASFORMATCHOSEN = CANVASFORMATS[$fx.getParam("format_id")];
// console.log("Canvas Format: " + CANVASFORMATCHOSEN);

if (CANVASFORMATCHOSEN.canvasWidth <= CANVASFORMATCHOSEN.canvasHeight) {
  SHORTSIDE = CANVASFORMATCHOSEN.canvasWidth;
  LONGSIDE = CANVASFORMATCHOSEN.canvasHeight;
  LANDSCAPE = false;
} else {
  SHORTSIDE = CANVASFORMATCHOSEN.canvasHeight;
  LONGSIDE = CANVASFORMATCHOSEN.canvasWidth;
  LANDSCAPE = true;
}

if (TEST == false) {
  // blueprint = new Blueprint(
  //   STRIPEHEIGHT,
  //   MARGINRELATIVE,
  //   SHORTSIDE,
  //   RESOLUTIONBOXCOUNT,
  //   CANVASFORMATCHOSEN.canvasWidth,
  //   CANVASFORMATCHOSEN.canvasHeight,
  // );
  blueprint1 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    1
  );
  blueprint2 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    2
  );
  blueprint3 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    3
  );
  blueprint4 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    4
  );
  blueprint5 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    5
  );
  blueprint6 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    6
  );
  blueprint7 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    7
  );
  blueprint8 = new BlueprintNew(
    STRIPEHEIGHT,
    MARGINRELATIVE,
    SHORTSIDE,
    RESOLUTIONBOXCOUNT,
    CANVASFORMATCHOSEN.canvasWidth,
    CANVASFORMATCHOSEN.canvasHeight,
    8
  );

  // console.log(blueprint);

  SHAPES1 = new Shapes(
    blueprint1
  );
  SHAPES2 = new Shapes(
    blueprint2
  );
  SHAPES3 = new Shapes(
    blueprint3
  );
  SHAPES4 = new Shapes(
    blueprint4
  );
  SHAPES5 = new Shapes(
    blueprint5
  );
  SHAPES6 = new Shapes(
    blueprint6
  );
  SHAPES7 = new Shapes(
    blueprint7
  );
  SHAPES8 = new Shapes(
    blueprint8
  );

  // console.log(SHAPES.loopMaterial);
  STROKESYSTEM1 = new strokeSystem(SHAPES1);
  STROKESYSTEM2 = new strokeSystem(SHAPES2);
  STROKESYSTEM3 = new strokeSystem(SHAPES3);
  STROKESYSTEM4 = new strokeSystem(SHAPES4);
  STROKESYSTEM5 = new strokeSystem(SHAPES5);
  STROKESYSTEM6 = new strokeSystem(SHAPES6);
  STROKESYSTEM7 = new strokeSystem(SHAPES7);
  STROKESYSTEM8 = new strokeSystem(SHAPES8);
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

  const targetDiv = document.getElementById('badAssCanvas');
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgNode.setAttributeNS(null, 'viewBox', '0 0 ' + CANVASFORMATCHOSEN.canvasWidth + " " + CANVASFORMATCHOSEN.canvasHeight);
  svgNode.setAttributeNS(null, 'id', 'svgNode');
  targetDiv.appendChild(svgNode);

  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.setAttributeNS(null, 'id', 'defs');
  svgNode.appendChild(defs);

  if (TEST == false) {

    var paper = new paperFilter();
    var paperLight = new paperLightFilter();
    new pencilFilter();

    // createBlur();
    // createBrightness();

    createBackground();
    // createGroupA();
    createGroupB();
    // createGroupC();

    // var blueprint = new Blueprint();


    // GRID 2
    // let grid2 = new Grid({
    //   stepCount: 100,
    // stripeHeight: STRIPEHEIGHT,
    // vectorMagnitude: 50,
    // marginRelative: 2,
    //   // strokeColor: "#222222ff",
    //   strokeColor: "#8f8f8fff",
    //   strokeWidth: 1,
    //   angleRadiansStart: Math.PI / 2,
    //   // angleRadiansGain: Math.PI / 5,
    //   angleRadiansGain: 0,
    //   shortBoxCount: RESOLUTIONBOXCOUNT,
    //   longSide: LONGSIDE,
    //   shortSide: SHORTSIDE,
    //   landscape: LANDSCAPE,
    //   group: "groupA",
    // });

    // GRID
    let grid1 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM1,
    });

    let grid2 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM2,
    });
    let grid3 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM3,
    });

    let grid4 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: -Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM4,
    });
    let grid5 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM5,
    });

    let grid6 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM6,
    });
    let grid7 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: -Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM7,
    });

    let grid8 = new Grid({
      stepCountRes: 800,  // 400
      stripeHeight: STRIPEHEIGHT,  // 2
      vectorMagnitude: 55,  // 50
      marginRelative: 1,  // 1
      // strokeColor: "#222222ff",
      strokeColor: "#4e4e4eff",
      strokeWidth: 1,
      // angleRadiansStart: Math.PI / 2,
      // angleRadiansGain: Math.PI / 5,
      angleRadiansStart: Math.PI / 2,
      angleRadiansGain: Math.PI / 5,
      // angleRadiansGain: 0,
      shortBoxCount: RESOLUTIONBOXCOUNT,
      longSide: LONGSIDE,
      shortSide: SHORTSIDE,
      landscape: LANDSCAPE,
      group: "groupB",
      strokeSystem: STROKESYSTEM8,
    });


    // let grid2 = new Grid({
    //   stepCountRes: 200,  // 400
    //   stripeHeight: STRIPEHEIGHT,  // 2
    //   vectorMagnitude: 55,  // 50
    //   marginRelative: 1,  // 1
    //   // strokeColor: "#222222ff",
    //   strokeColor: "#4e4e4eff",
    //   strokeWidth: 1,
    //   angleRadiansStart: 0,
    //   angleRadiansGain: Math.PI / 4,
    //   // angleRadiansGain: 0,
    //   shortBoxCount: RESOLUTIONBOXCOUNT,
    //   longSide: LONGSIDE,
    //   shortSide: SHORTSIDE,
    //   landscape: LANDSCAPE,
    //   group: "groupB",
    // });
  }

  if (TEST) {
    if (DEBUG_CUBE) {
      testCubeComposition();
    } else if (DEBUG_GRID) {
      testGrid();
    } else if (DEBUG_SINGLE_CIRCLE) {
      testSingleCircle();
    } else if (DEBUG_STROKE) {
      testStrokeSystem();
    } else if (DEBUG_FILLED_PATH) {
      testFilledPath();
    } else if (DEBUG_FILLED_PATH_PARAMS) {
      testFilledPathParams();
    } else if (DEBUG_CUBE_AXES) {
      testCubePrincipalAxes();
    }
    // testBlueprintNew();
    // testBlueprint();
    // testShapes();
    // testStrokeSystem();
    // testFilledPath();
  } else {

    showBackground();  // REMOVE FOR DEBUGGING SHAPES

    // showGroupA();
    showGroupB();
    // showGroupC();


    // showBlur();


    new noiseDotFilter();

    // bigPaper.showBigPaperDEBUG();
    paperLight.showLayer();
    // paper.showPaperDEBUG();

  }

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
  backgroundRect.setAttribute("result", "backgroundRect");
  backgroundRect.setAttribute("x", "0");
  backgroundRect.setAttribute("y", "0");
  backgroundRect.setAttribute("width", "100%");
  backgroundRect.setAttribute("height", "100%");
  // backgroundRect.setAttribute("fill", BACKGROUNDTONE);
  backgroundRect.setAttribute("fill", "none");
  backgroundRect.setAttribute("filter", "url(#filterPaper)");

  const defs = document.getElementById('defs');
  defs.appendChild(backgroundRect);

  // const groupForNoising = document.getElementById('groupForNoising');
  // groupForNoising.appendChild(backgroundRect);
}

function showBackground() {
  const backgroundRect = document.getElementById('backgroundRect');

  svgNode.appendChild(backgroundRect);
}

function createGroupA() {
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

  // instead of show groupA
  var groupAUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  groupAUse.setAttribute("id", "groupAUse");
  groupAUse.setAttribute("href", "#groupA");

  svgNode.appendChild(groupAUse);
}


function createBlur() {
  var blurFact = 2;

  const defs = document.getElementById('defs');

  var blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  blurFilter.setAttribute("id", "blurFilter");

  var blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  blur.setAttribute("id", "blur");
  blur.setAttribute("in", "SourceGraphic");
  blur.setAttribute("stdDeviation", blurFact);

  blurFilter.appendChild(blur);
  defs.appendChild(blurFilter);
}

function createBrightness() {
  var noiseler = 0.2;
  const blurFilter = document.getElementById('blurFilter');

  // https://fecolormatrix.com/ 
  var brightnessMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
  brightnessMatrix.setAttribute("id", "brightnessMatrix");
  brightnessMatrix.setAttribute("type", "matrix");
  brightnessMatrix.setAttribute("values", `\
     1 0 0 0 ${noiseler} \
     0 1 0 0 ${noiseler} \
     0 0 1 0 ${noiseler} \
     0 0 0 1 0`);
  brightnessMatrix.setAttribute("x", "0%");
  brightnessMatrix.setAttribute("y", "0%");
  brightnessMatrix.setAttribute("width", "100%");
  brightnessMatrix.setAttribute("height", "100%");
  // brightnessMatrix.setAttribute("in", "specularLightB");
  brightnessMatrix.setAttribute("in", "sourceGraphic");
  brightnessMatrix.setAttribute("result", "brightnessMatrix");

  blurFilter.appendChild(brightnessMatrix);
}

function showBlur() {
  const svgNode = document.getElementById('svgNode');
  const groupAUse = document.getElementById('groupAUse');
  groupAUse.setAttribute("filter", "url(#blurFilter)");
}

function createGroupB() {
  // create background
  var groupB = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupB.setAttribute("id", "groupB");
  groupB.setAttribute("x", "0");
  groupB.setAttribute("y", "0");
  groupB.setAttribute("width", "100%");
  groupB.setAttribute("height", "100%");
  groupB.setAttribute("fill", "none");
  groupB.setAttribute("filter", "url(#pencilFilter)");

  // svgNode.appendChild(groupB);
  const defs = document.getElementById('defs');
  defs.appendChild(groupB);

  // const groupForNoising = document.getElementById('groupForNoising');
  // groupForNoising.appendChild(groupB);
}

function showGroupB() {
  var groupB = document.createElementNS("http://www.w3.org/2000/svg", "use");
  groupB.setAttribute("id", "groupB");
  groupB.setAttribute("result", "groupB");
  groupB.setAttribute("href", "#groupB");

  svgNode.appendChild(groupB);
}

function createGroupC() {
  // create background
  var groupC = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupC.setAttribute("id", "groupC");
  groupC.setAttribute("x", "0");
  groupC.setAttribute("y", "0");
  groupC.setAttribute("width", "100%");
  groupC.setAttribute("height", "100%");
  groupC.setAttribute("fill", "none");

  // svgNode.appendChild(groupC); 
  defs.appendChild(groupC);
}

function showGroupC() {
  var groupC = document.createElementNS("http://www.w3.org/2000/svg", "use");
  groupC.setAttribute("id", "groupC");
  groupC.setAttribute("href", "#groupC");

  svgNode.appendChild(groupC);
}

function testCubeComposition() {
  const svgNode = document.getElementById("svgNode");

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", "debugCubeGroup");
  group.setAttribute("fill", "none");
  svgNode.appendChild(group);

  const width = CANVASFORMATCHOSEN.canvasWidth;
  const height = CANVASFORMATCHOSEN.canvasHeight;
  const boxSize = SHORTSIDE / RESOLUTIONBOXCOUNT;
  const snapToGrid = (value) => Math.round(value / boxSize) * boxSize;

  const center = {
    x: snapToGrid(width / 2),
    y: snapToGrid(height / 2 + height * 0.03),
  };
  const sideA = Math.max(2 * boxSize, snapToGrid(Math.min(width, height) * 0.28));
  const offset = {
    x: snapToGrid(sideA * 0.48),
    y: snapToGrid(-sideA * 0.34),
  };

  const aTL = { x: center.x - sideA / 2, y: center.y - sideA / 2 };
  const aTR = { x: center.x + sideA / 2, y: center.y - sideA / 2 };
  const aBR = { x: center.x + sideA / 2, y: center.y + sideA / 2 };
  const aBL = { x: center.x - sideA / 2, y: center.y + sideA / 2 };

  const bTR = vectorAdd(aTR, offset);
  const bTL = vectorAdd(aTL, offset);
  const bBR = vectorAdd(aBR, offset);

  const faceA = [aTL, aTR, aBR, aBL];
  const faceB = [aTR, aBR, bBR, bTR];
  const faceC = [aTL, aTR, bTR, bTL];
  const faceAFlat = transformToXYLess(faceA);
  const faceBFlat = transformToXYLess(faceB);
  const faceCFlat = transformToXYLess(faceC);

  const fullCanvas = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  drawPolygon(group, fullCanvas, "#efefef", "none", 0, 1);

  // Row rhythm drives positions and length. Region membership only changes direction.
  const stepX = boxSize;
  const stepY = boxSize * 2;
  const angleA = Math.PI / 4;
  const angleB = -Math.PI / 4;
  const strokeLengthBoxes = 4;
  const targetStrokeLength = strokeLengthBoxes * boxSize;
  const maxAbsSin = Math.max(Math.abs(Math.sin(angleA)), Math.abs(Math.sin(angleB)));
  const maxLengthNoRowOverlap = (stepY * 1.0) / Math.max(maxAbsSin, 0.0001);
  const strokeLength = Math.min(targetStrokeLength, maxLengthNoRowOverlap);

  const clipIdB = `debugCubeClipB_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const clipIdC = `debugCubeClipC_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const maskIdBG = `debugCubeMaskBG_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const clipB = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipB.setAttribute("id", clipIdB);
  const clipBPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  clipBPoly.setAttribute("points", faceB.map((p) => `${p.x},${p.y}`).join(" "));
  clipB.appendChild(clipBPoly);
  defs.appendChild(clipB);

  const clipC = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipC.setAttribute("id", clipIdC);
  const clipCPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  clipCPoly.setAttribute("points", faceC.map((p) => `${p.x},${p.y}`).join(" "));
  clipC.appendChild(clipCPoly);
  defs.appendChild(clipC);

  const backgroundMask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  backgroundMask.setAttribute("id", maskIdBG);
  backgroundMask.setAttribute("maskUnits", "userSpaceOnUse");

  const maskBase = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  maskBase.setAttribute("x", 0);
  maskBase.setAttribute("y", 0);
  maskBase.setAttribute("width", width);
  maskBase.setAttribute("height", height);
  maskBase.setAttribute("fill", "white");
  backgroundMask.appendChild(maskBase);

  const maskFaceA = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  maskFaceA.setAttribute("points", faceA.map((p) => `${p.x},${p.y}`).join(" "));
  maskFaceA.setAttribute("fill", "black");
  backgroundMask.appendChild(maskFaceA);

  const maskFaceB = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  maskFaceB.setAttribute("points", faceB.map((p) => `${p.x},${p.y}`).join(" "));
  maskFaceB.setAttribute("fill", "black");
  backgroundMask.appendChild(maskFaceB);

  const maskFaceC = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  maskFaceC.setAttribute("points", faceC.map((p) => `${p.x},${p.y}`).join(" "));
  maskFaceC.setAttribute("fill", "black");
  backgroundMask.appendChild(maskFaceC);

  defs.appendChild(backgroundMask);

  svgNode.insertBefore(defs, group);

  const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  backgroundGroup.setAttribute("mask", `url(#${maskIdBG})`);
  group.appendChild(backgroundGroup);

  const faceBGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  faceBGroup.setAttribute("clip-path", `url(#${clipIdB})`);
  group.appendChild(faceBGroup);

  const faceCGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  faceCGroup.setAttribute("clip-path", `url(#${clipIdC})`);
  group.appendChild(faceCGroup);

  for (var y = stepY / 2; y <= height; y += stepY) {
    const rowIndex = Math.round((y - stepY / 2) / stepY);
    const rowAnglePrimary = rowIndex % 2 === 0 ? angleA : angleB;
    const rowAngleSecondary = rowIndex % 2 === 0 ? angleB : angleA;

    for (var x = stepX / 2; x <= width; x += stepX) {
      // Draw full hatch fields and let clip-paths enforce exact face boundaries.
      drawGridStroke(backgroundGroup, x, y, rowAnglePrimary, strokeLength, "#000000", 1, 0.55);
      drawGridStroke(backgroundGroup, x, y, rowAngleSecondary, strokeLength, "#000000", 1, 0.45);
      drawGridStroke(faceBGroup, x, y, rowAnglePrimary, strokeLength, "#000000", 1, 1);
      drawGridStroke(faceCGroup, x, y, rowAngleSecondary, strokeLength, "#000000", 1, 1);
    }
  }

}

function drawPolygon(group, points, fill, stroke, strokeWidth, opacity) {
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke", stroke);
  polygon.setAttribute("stroke-width", strokeWidth);
  polygon.setAttribute("opacity", opacity);
  group.appendChild(polygon);
}

function drawGridStroke(group, cx, cy, angle, length, stroke, strokeWidth, opacity) {
  const half = length / 2;
  const x1 = cx + Math.cos(angle) * half;
  const y1 = cy + Math.sin(angle) * half;
  const x2 = cx - Math.cos(angle) * half;
  const y2 = cy - Math.sin(angle) * half;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", stroke);
  line.setAttribute("stroke-width", strokeWidth);
  line.setAttribute("opacity", opacity);
  line.setAttribute("fill", "none");
  group.appendChild(line);
}
