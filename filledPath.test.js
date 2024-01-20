function testFilledPath() {

    var data = {
        start: { x: 100, y: 100 },
        end: { x: 250, y: 170 },
        strokeWidth: 10,
        group: "groupA",
    }

    new filledPath(data).showDebugStroke();

}