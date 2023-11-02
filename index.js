// ########################################
var BULK = false; // bulk export images - and use direct not lense
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

console.info(`fxhash: %c${$fx.hash}`, 'font-weight: bold');


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
  svgNode.setAttributeNS(null, 'viewBox', '0 0 ' + canvasFormatChosen.canvasWidth + " " + canvasFormatChosen.canvasHeight);
  svgNode.setAttributeNS(null, 'id', 'svgNode');
  targetDiv.appendChild(svgNode);

  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.setAttributeNS(null, 'id', 'defs');
  svgNode.appendChild(defs);

  // vector
  var pointA = {
    x: 400,
    y: 500,
  }
  var angleRadians = 0.4;
  var vectorMagnitude = 30;
  var pointB = vectorFromAngle(angleRadians, vectorMagnitude)
  console.log(pointB);


  for (var i = 0; i < 30; i++) {

    var lenthPath = 140;
    var areaStart = {
      "x": 100,
      "y": 10,
    }
    var stepSize = 10;

    createPath({
      "start": {
        x: areaStart.x,
        y: areaStart.y + i * stepSize
      },
      "end": {
        x: areaStart.x + lenthPath,
        y: areaStart.y + i * stepSize
      }
    });
  }

  // createPath({
  //   "start": {
  //     x: 10,
  //     y: 10
  //   },
  //   "end": {
  //     x: 50,
  //     y: 10
  //   }
  // });


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

function createPath(data) {

  var start = data.start;
  var end = data.end;

  // start and end distortion
  start.x = start.x + gaussianRandAdj(0, 3);
  end.x = end.x + gaussianRandAdj(0, 3);
  start.y = start.y + gaussianRandAdj(0, 1);
  end.y = end.y + gaussianRandAdj(0, 1);

  // needs VECTOR
  var distance = (end.x - start.x);
  var controlOnLine = distance / 4; // a third, quarter or so - x coord of control points
  var controlOffLine = distance / 50;

  var controlA = {
    x: start.x + gaussianRandAdj(controlOnLine, 12),
    y: start.y + gaussianRandAdj(0, controlOffLine)
  }
  var controlB = {
    x: end.x - gaussianRandAdj(controlOnLine, 12),
    y: end.y + gaussianRandAdj(0, controlOffLine)
  }

  newpath = document.createElementNS('http://www.w3.org/2000/svg', "path");

  newpath.setAttributeNS(null, "id", "pathIdD");
  // newpath.setAttributeNS(null, "d", "M 10 10 C 20 20, 40 20, 50 10");
  newpath.setAttributeNS(null, "d", `M 
  ${start.x} 
  ${start.y} 
  C 
  ${controlA.x} 
  ${controlA.y}, 
  ${controlB.x} 
  ${controlB.y}, 
  ${end.x} 
  ${end.y}
  `);
  newpath.setAttributeNS(null, "stroke", "black");
  newpath.setAttributeNS(null, "stroke-width", 1);
  newpath.setAttributeNS(null, "opacity", 1);
  newpath.setAttributeNS(null, "fill", "none");

  const svgNode = document.getElementById('svgNode');
  svgNode.appendChild(newpath);
}

function createDrawingGroup() {
  var groupDrawing = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupDrawing.setAttribute("id", "drawing");
  defs.appendChild(groupDrawing);
}