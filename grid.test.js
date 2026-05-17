function testGrid() {

    // test grid for 
    // * marginRelative - already done
    // * different aspect ratios
    // * stripe height - relative to small size boxcount
    // * resolutionboxcount

    // const resolutionBoxCount = 80;

    // create background
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "debugGridGroup");
    group.setAttribute("x", "0");
    group.setAttribute("y", "0");
    group.setAttribute("width", "100%");
    group.setAttribute("height", "100%");
    group.setAttribute("fill", "none");
    // group.setAttribute("filter", "url(#pencilFilter)");

    const defs = document.getElementById('defs');
    defs.appendChild(group);


    // Use a full-canvas debug shape so every generated stroke is visible.
    const allShapesDebug = {
        loopMaterial: {
            1: {
                pointList: [
                    [0, 0],
                    [CANVASFORMATCHOSEN.canvasWidth, 0],
                    [CANVASFORMATCHOSEN.canvasWidth, CANVASFORMATCHOSEN.canvasHeight],
                    [0, CANVASFORMATCHOSEN.canvasHeight],
                ],
                shapeMaxLoop: 10,
                order: 1,
                density: 1,
                colorAction: "#222222ff",
                fillColor: "#757575",
            }
        }
    };

    const debugStrokeSystem = new strokeSystem(allShapesDebug);
    debugStrokeSystem.debugPath = true;

    const data1 = {
        stepCountRes: 120,
        stripeHeight: 4,  // smaller rows for direction debugging
        vectorMagnitude: 55,
        marginRelative: 0,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: debugStrokeSystem,
    }

    const data2 = {
        stepCountRes: 120,
        stripeHeight: 4,  // smaller rows for direction debugging
        vectorMagnitude: 55,
        marginRelative: 1,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: debugStrokeSystem,
    }

    const data3 = {
        stepCountRes: 120,
        stripeHeight: 4,  // smaller rows for direction debugging
        vectorMagnitude: 55,
        marginRelative: 2,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: debugStrokeSystem,
    }

    // let grid = new Grid(data1);
    let grid = new Grid(data2);
    // let grid = new Grid(data3);

    grid.showDebugBoxes();
    grid.debugShowCategory();

    const svgNode = document.getElementById('svgNode');
    svgNode.appendChild(group);
}