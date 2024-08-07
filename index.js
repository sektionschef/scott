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
    // testGrid();
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
