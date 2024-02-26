function testGrid() {

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

    // const resolutionBoxCount = 80;

    data1 = {
        stepCountRes: 100,
        stripeHeight: 4,  // 2- or 4
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
    }

    data2 = {
        stepCountRes: 100,
        stripeHeight: 4,  // 2- or 4
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
    }

    data3 = {
        stepCountRes: 100,
        stripeHeight: 4,  // 2- or 4
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
    }

    let grid = new Grid(data1);
    // let grid = new Grid(data2);
    // let grid = new Grid(data3);

    grid.showDebugBoxes();
    grid.debugShowCategory();

    const svgNode = document.getElementById('svgNode');
    svgNode.appendChild(group);
}