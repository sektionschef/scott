function testShapes() {
    var stripeHeight = STRIPEHEIGHT;
    var marginRelative = MARGINRELATIVE;
    var shortSide = SHORTSIDE
    var resolutionBoxCount = RESOLUTIONBOXCOUNT;
    var canvasWidth = CANVASFORMATCHOSEN.canvasWidth;
    var canvasHeight = CANVASFORMATCHOSEN.canvasHeight;

    var shapes_ = new Shapes(
        stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight
    );

    // console.log(shapes_);

    shapes_.fillShape();
    shapes_.debugShowShape();

}