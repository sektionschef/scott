function testGrid(data1) {

    // test grid for 
    // * marginRelative - already done
    // * different aspect ratios
    // * stripe height - relative to small size boxcount
    // * resolutionboxcount

    var stripeHeight = 4;
    var marginRelative = 1;
    var shortSide = 900;
    var resolutionBoxCount = 80;
    var canvasWidth = 1600;
    var canvasHeight = 900;

    // const resolutionBoxCount = 80;
    blueprint1 = new BlueprintNew(
        stripeHeight,
        marginRelative,
        shortSide,
        resolutionBoxCount,
        canvasWidth,
        canvasHeight,
        1
    );

    STROKESYSTEM = new strokeSystem(blueprint1);

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


    data1 = {
        stepCountRes: 100,
        stripeHeight: stripeHeight,
        vectorMagnitude: 55,
        marginRelative: marginRelative,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: STROKESYSTEM,
    }

    data2 = {
        stepCountRes: 100,
        stripeHeight: stripeHeight,
        vectorMagnitude: 55,
        marginRelative: marginRelative,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: STROKESYSTEM,
    }

    data3 = {
        stepCountRes: 100,
        stripeHeight: stripeHeight,
        vectorMagnitude: 55,
        marginRelative: marginRelative,
        strokeColor: "#222222ff",
        strokeWidth: 1,
        angleRadiansStart: Math.PI / 2,
        angleRadiansGain: Math.PI / 5,
        shortBoxCount: RESOLUTIONBOXCOUNT,
        longSide: LONGSIDE,
        shortSide: SHORTSIDE,
        landscape: LANDSCAPE,
        group: "debugGridGroup",
        strokeSystem: STROKESYSTEM,
    }

    // let grid = new Grid(data1);
    let grid = new Grid(data2);
    // let grid = new Grid(data3);

    grid.showDebugBoxes();
    grid.debugShowCategory();

    const svgNode = document.getElementById('svgNode');
    svgNode.appendChild(group);
}