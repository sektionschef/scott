function testBlueprintNew() {

    var stripeHeight = 4;
    var marginRelative = 1;
    var shortSide = 900
    var resolutionBoxCount = 80;
    var canvasWidth = 1600;
    var canvasHeight = 900;

    var boxSize = shortSide / resolutionBoxCount;

    var blueprint = new BlueprintNew(
        stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight
    );

    // for (var y = 0; y < canvasHeight / boxSize; y++) {
    //     for (var x = 0; x < canvasWidth / boxSize; x++) {
    //         showDebugPoint(x * boxSize, y * boxSize, "pink", r = "1");
    //     }
    // }
}