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

    data = {
        stepCountRes: 200,
        stripeHeight: 4,
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

    let grid = new Grid(data);

    grid.showDebugBoxes();
    grid.loopdebugCategory();

    const svgNode = document.getElementById('svgNode');
    svgNode.appendChild(group);
}