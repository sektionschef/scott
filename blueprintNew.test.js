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

    blueprint.debugShowShapes();
    blueprint.debugShowPoints();
}