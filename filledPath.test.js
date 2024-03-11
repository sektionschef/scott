function testFilledPath() {

    var data = {
        start: { x: 25, y: 90 },
        end: { x: 60, y: 45 },
        strokeWidth: 30,
        group: "svgNode",
    }

    new filledPath(data).showDebugStroke();

}