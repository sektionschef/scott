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


  // SHAPE
  // <polygon points="200,10 250,190 160,210" style="fill:lime;stroke:purple;stroke-width:1" />
  var shapy = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  shapy.setAttributeNS(null, 'points', "200,10 250,190 160,210");
  shapy.setAttributeNS(null, 'fill', "none");
  shapy.setAttributeNS(null, 'stroke', "black");
  shapy.setAttributeNS(null, "stroke-width", 2);

  svgNode.appendChild(shapy);

  // GRID
  let grid = new Grid({
    shortBoxCount: RESOLUTIONBOXCOUNT,
    longSide: LONGSIDE,
    shortSide: SHORTSIDE,
    landscape: LANDSCAPE,
  });


  for (const [key, value] of Object.entries(grid.lineVectors)) {

    // skip empty entries
    if (value.C.x != "") {

      // console.log(value);
      // console.log(value.D);


      var start = value.C
      var end = value.D
      var startEnd = vectorSub(start, end);
      var stepCount = 350
      var angleRadians = angleBetweenPoints(start, end) + 0.3

      if (value.even == true) {
        angleRadians += - Math.PI / 5;
      }

      for (var i = 0; i < stepCount; i++) {
        var positionX = start.x + i * startEnd.x / stepCount;
        var positionY = start.y + i * startEnd.y / stepCount;

        var strokeColor = "black";

        if (pointInPolygon([[200, 10], [250, 190], [160, 210]], [positionX, positionY])) {
          // console.log("mdiaisk");
          strokeColor = "red";
        }

        createPath({
          "start": {
            x: positionX,
            y: positionY
          },
          vectorMagnitude: 25,
          angleRadians: (angleRadians - Math.PI / 2), // 0.2,
          strokeColor: strokeColor,
        });
      }

    }
  }


  // DUMMY LINE
  // var start = {
  //   x: 100,
  //   y: 100
  // }
  // var end = {
  //   x: 300,
  //   y: 700
  // }
  // var startEnd = vectorSub(start, end);
  // var stepCount = 70
  // var angleRadians = angleBetweenPoints(start, end)

  // for (var i = 0; i < stepCount; i++) {

  //   createPath({
  //     "start": {
  //       x: start.x + i * startEnd.x / stepCount,
  //       y: start.y + i * startEnd.y / stepCount
  //     },
  //     vectorMagnitude: 120,
  //     angleRadians: (angleRadians - Math.PI / 2) // 0.2,
  //   });
  // }


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
  var angleRadians = data.angleRadians;
  var vectorMagnitude = data.vectorMagnitude;
  var strokeColor = data.strokeColor;

  // create from angle
  var end = vectorAdd(start, vectorFromAngle(angleRadians, vectorMagnitude))

  // start and end distortion
  start.x = start.x + gaussianRandAdj(0, 1);
  end.x = end.x + gaussianRandAdj(0, 1);
  start.y = start.y + gaussianRandAdj(0, 1);
  end.y = end.y + gaussianRandAdj(0, 1);

  var startEnd = vectorSub(start, end);  // vector of diff

  var lineSegment = 4;  // where to place the control points

  var controlA = {
    x: start.x + startEnd.x / lineSegment + gaussianRandAdj(0, 1),
    y: start.y + startEnd.y / lineSegment + gaussianRandAdj(0, 1),
  }
  var controlB = {
    x: end.x - startEnd.x / lineSegment + gaussianRandAdj(0, 1),
    y: end.y - startEnd.y / lineSegment + gaussianRandAdj(0, 1)
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
  // newpath.setAttributeNS(null, "stroke", "black");
  newpath.setAttributeNS(null, "stroke", strokeColor);
  newpath.setAttributeNS(null, "stroke-width", 0.5);
  newpath.setAttributeNS(null, "opacity", 1);
  newpath.setAttributeNS(null, "fill", "none");

  // DEBUG
  // debugStart = document.createElementNS('http://www.w3.org/2000/svg', "circle");
  // debugStart.setAttributeNS(null, "id", "start");
  // debugStart.setAttributeNS(null, "cx", start.x);
  // debugStart.setAttributeNS(null, "cy", start.y);
  // debugStart.setAttributeNS(null, "r", "3");
  // debugStart.setAttributeNS(null, "stroke", "blue");
  // debugStart.setAttributeNS(null, "stroke-width", 2);
  // debugStart.setAttributeNS(null, "opacity", 1);
  // debugStart.setAttributeNS(null, "fill", "none");

  // debugEnd = document.createElementNS('http://www.w3.org/2000/svg', "circle");
  // debugEnd.setAttributeNS(null, "id", "end");
  // debugEnd.setAttributeNS(null, "cx", end.x);
  // debugEnd.setAttributeNS(null, "cy", end.y);
  // debugEnd.setAttributeNS(null, "r", "3");
  // debugEnd.setAttributeNS(null, "stroke", "red");
  // debugEnd.setAttributeNS(null, "stroke-width", 2);
  // debugEnd.setAttributeNS(null, "opacity", 1);
  // debugEnd.setAttributeNS(null, "fill", "none");

  // debugControlA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
  // debugControlA.setAttributeNS(null, "id", "controlA");
  // debugControlA.setAttributeNS(null, "cx", controlA.x);
  // debugControlA.setAttributeNS(null, "cy", controlA.y);
  // debugControlA.setAttributeNS(null, "r", "3");
  // debugControlA.setAttributeNS(null, "stroke", "pink");
  // debugControlA.setAttributeNS(null, "stroke-width", 2);
  // debugControlA.setAttributeNS(null, "opacity", 1);
  // debugControlA.setAttributeNS(null, "fill", "none");

  // debugControlB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
  // debugControlB.setAttributeNS(null, "id", "controlB");
  // debugControlB.setAttributeNS(null, "cx", controlB.x);
  // debugControlB.setAttributeNS(null, "cy", controlB.y);
  // debugControlB.setAttributeNS(null, "r", "3");
  // debugControlB.setAttributeNS(null, "stroke", "pink");
  // debugControlB.setAttributeNS(null, "stroke-width", 2);
  // debugControlB.setAttributeNS(null, "opacity", 1);
  // debugControlB.setAttributeNS(null, "fill", "none");

  const svgNode = document.getElementById('svgNode');
  svgNode.appendChild(newpath);
  // svgNode.appendChild(debugStart);
  // svgNode.appendChild(debugEnd);
  // svgNode.appendChild(debugControlA);
  // svgNode.appendChild(debugControlB);
}

function createDrawingGroup() {
  var groupDrawing = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupDrawing.setAttribute("id", "drawing");
  defs.appendChild(groupDrawing);
}