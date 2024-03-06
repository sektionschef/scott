function testStrokeSystem() {

    allShapes = {
        loopMaterial: {
            1: {
                pointList: [
                    [382.5, 135],
                    [1181.25, 135],
                    [1181.25, 225],
                    [382.5, 225]
                ],
                // shapeLoop: 0,  // what is it??????
                shapeLoop: 2,
                order: 4,
                density: 0,
                colorAction: "#f8688c",
                fillColor: "#757575",
            }
        }
    }

    // DEBUG DRAW SHAPE
    const svgNode = document.getElementById('svgNode');
    var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    shapsn.setAttributeNS(null, 'points', allShapes.loopMaterial[1].pointList);
    shapsn.setAttributeNS(null, 'fill', "none");
    shapsn.setAttributeNS(null, "stroke-width", 2);
    shapsn.setAttributeNS(null, 'stroke', "#343500");
    svgNode.appendChild(shapsn);

    var system = new strokeSystem(allShapes);

    // out
    system.add({
        center: { x: 100, y: 100 },
        strokeWidth: 4,
        strokeColor: "#c70c0c",
        angleRadians: 1,
        vectorMagnitude: 150,
        currentLoop: 0,
        group: "groupB",
        boxIndex: 1,
    });

    // in
    system.add({
        center: { x: 400, y: 100 },
        strokeWidth: 4,
        strokeColor: "#50c70c",
        angleRadians: 1,
        vectorMagnitude: 150,
        currentLoop: 0,
        group: "groupB",
        boxIndex: 2,
    });

    // in 2
    system.add({
        center: { x: 600, y: 250 },
        strokeWidth: 4,
        strokeColor: "#9b0cc7",
        angleRadians: 1,
        vectorMagnitude: 150,
        currentLoop: 0,
        group: "groupB",
        boxIndex: 3,
    });

    // full in shape
    system.add({
        center: { x: 800, y: 180 },
        strokeWidth: 4,
        strokeColor: "#9b0cc7",
        angleRadians: 1,
        vectorMagnitude: 50,
        currentLoop: 0,
        group: "groupB",
        boxIndex: 4,
    });

    // make active - SHORTCUT FOR MAKING VISIBLE
    // system.paths[0].readyToDraw = true;
    // system.paths[1].readyToDraw = true;
    // system.paths[2].readyToDraw = true;
    // system.paths[3].readyToDraw = true;

    // debug line 
    system.debugPath = true;

    // STILL MISSINGs
    system.run();

    system.showPaths("svgNode");

}