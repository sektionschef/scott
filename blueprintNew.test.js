function testBlueprintNew() {

    var stripeHeight = 4;
    var marginRelative = 1;
    var shortSide = 900
    var resolutionBoxCount = 80;
    var canvasWidth = 1600;
    var canvasHeight = 900;
    // var groupLength = 8;  // for profile A
    var groupLength = 1;

    // var boxSize = shortSide / resolutionBoxCount;

    for (var i = 1; i <= groupLength; i++) {
        var blueprint = new BlueprintNew(
            stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight, i
        );

        blueprint.debugShowShapes();
        // blueprint.debugShowPoints();
    }
}