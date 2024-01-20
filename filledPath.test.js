function testFilledPath() {

    var data = {
        start: { x: 100, y: 100 },
        end: { x: 250, y: 170 },
        strokeWidth: 60,
        group: "groupA",
    }

    new filledPath(data).showDebugStroke();

}