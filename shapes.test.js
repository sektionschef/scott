function testShapes() {
    var stripeHeight = STRIPEHEIGHT;
    var marginRelative = MARGINRELATIVE;
    var shortSide = SHORTSIDE
    var resolutionBoxCount = RESOLUTIONBOXCOUNT;

    var shapes_ = new shapes(
        stripeHeight, marginRelative, shortSide, resolutionBoxCount
    );

    // console.log(shapes_);

    shapes_.fillShape();
    shapes_.debugShowShape();

}