function testStrokeSystem() {

    allShapes = {
        loopMaterial: {
            1: {
                pointList: [
                    [382.5, 135],
                    [1181.25, 135],
                    [1181.25, 225],
                    [382.5, 225]
                ]
            }
        }
    }

    var system = new strokeSystem(allShapes);

    system.add({
        center: { x: 100, y: 100 },
        strokeWidth: 4,
        strokeColor: "#c70c0c",
        angleRadians: 1,
        vectorMagnitude: 150,
        currentLoop: 0,
        group: "groupB",
        boxIndex: 200,
    });

    // make active
    system.paths[0].readyToDraw = true;

    // debug line
    system.debugPath = true;


    // STILL MISSINGs
    // system.run();

    system.showPaths("svgNode");

}