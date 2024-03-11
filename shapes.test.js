function testShapes() {

    var blueprint = {};
    blueprint = {
        boxSize: 11.25,
        stripeHeight: 4,
        margin: 45,
        marginRelative: 1,
        data: {
            shapeA: {
                MainHeightLine: 2,
                MainWidth: 70,
                ShadAAY: 20,
                mainBoxPos: { x: 34, y: 12 },
                mainWidthCX: 104,
                mainWidthCY: 19,
                shadAheight: 3,
                shadHeightLine: 1,
                shapeMainHeight: 7,
                superShadowHeightMax: 15,
                superShadowShiftX: 25,
                superShadowShiftY: 1,
                shadAshift: 3,
                shadAheight: 3,
                shadHeightLine: 1,
                front: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 1,
                    shapeMaxLoop: 2
                },
                down: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 2,
                    shapeMaxLoop: 2
                },
                right: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 3,
                    shapeMaxLoop: 2
                },
                shadow: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 4,
                    shapeMaxLoop: 2
                }
            },
            shapeBackground: {
                background: {
                    colorAction: "#2f6e32",
                    density: 2,
                    fillColor: "None",
                    order: 13,
                    pointList: [
                        [45, 45],
                        [1555, 45],
                        [1555, 855],
                        [45, 855]
                    ],
                    shapeMaxLoop: 1,
                }
            }
        }
    }

    var shapes_ = new Shapes(
        blueprint
    );

    // console.log(shapes_);

    shapes_.fillShape();
    shapes_.debugShowShape();

}