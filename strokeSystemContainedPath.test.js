// what is shapeMaxLoop

function testStrokeSystem() {

    // simple rect
    allShapes = {
        loopMaterial: {
            1: {
                pointList: [
                    [382.5, 135],
                    [1181.25, 135],
                    [1181.25, 225],
                    [382.5, 225]
                ],
                shapeMaxLoop: 2,
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
    shapsn.setAttributeNS(null, 'stroke', "#34350079");
    svgNode.appendChild(shapsn);

    var system = new strokeSystem(allShapes);

    // variant: out - not in shape, not visible
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

    // variant: in 1
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

    // variant: in 2
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

    // variant: full in shape
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
    // system.paths[1].readyToDraw = true;  // culprit
    // system.paths[2].readyToDraw = true;
    // system.paths[3].readyToDraw = true;

    // debug line 
    system.debugPath = true;

    system.run();

    system.showPaths("svgNode");

}