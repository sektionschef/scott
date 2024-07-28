class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {
        console.log("jo");

        this.stripeHeight = stripeHeight;
        this.marginRelative = marginRelative;
        this.boxSize = shortSide / resolutionBoxCount;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        if (this.marginRelative == 0) {
            this.margin = 0;
        } else {
            this.margin = Math.round(this.stripeHeight * this.marginRelative) * this.boxSize;
        }

        var heightAB = 192; // 
        var widthAB = heightAB * 2 / 3;
        var cornerHeightAB = heightAB / 2;
        var cornerWidthAB = widthAB / 2;
        var marginAX = 100;
        var marginAY = 100;


        // layer needed for intersection calculation
        this.data = {
            shapeBackground: {
                background: {
                    shapeMaxLoop: 1,  // maximum loop to draw in this shape
                    order: 13,
                    density: 2, // density factor - 0 is full
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    // colorAction: this.strokeColor,
                    // fillColor: "#afafafff",
                    fillColor: "None",
                    pointList: [
                        [this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.canvasHeight - this.margin],
                        [this.margin, this.canvasHeight - this.margin],
                    ]
                }
            },
            tile: {
                A: {
                    shapeMaxLoop: 1,
                    order: 1,
                    density: 1,
                    colorAction: "blue",
                    fillColor: "#ff0000",
                    pointList: [
                        [marginAX, marginAY],
                        [marginAX + cornerWidthAB, marginAY - cornerHeightAB],
                        [marginAX + widthAB, marginAY],
                        [marginAX + widthAB, marginAY + heightAB],
                        [marginAX, marginAY + heightAB],
                    ]
                },
                B: {
                    shapeMaxLoop: 1,
                    order: 1,
                    density: 1,
                    colorAction: "blue",
                    fillColor: "#00ff0d",
                    pointList: [
                        [marginAX + widthAB, marginAY],
                        [marginAX + widthAB * 2, marginAY],
                        [marginAX + widthAB * 2, marginAY + heightAB],
                        [marginAX + widthAB * 2 - cornerWidthAB, marginAY + heightAB + cornerHeightAB],
                        [marginAX + widthAB, marginAY + heightAB],
                    ]
                },
                C: {
                    shapeMaxLoop: 1,
                    order: 1,
                    density: 1,
                    colorAction: "blue",
                    fillColor: "#0066ff",
                    pointList: [
                        [marginAX + cornerWidthAB, marginAY - cornerHeightAB],
                        [marginAX + cornerWidthAB * 2, marginAY - cornerHeightAB],
                        [marginAX + widthAB + cornerWidthAB, marginAY],
                        [marginAX + widthAB, marginAY],
                    ]
                },
                D: {
                    shapeMaxLoop: 1,
                    order: 1,
                    density: 1,
                    colorAction: "blue",
                    fillColor: "#ff00ea",
                    pointList: [
                        [marginAX + widthAB + cornerWidthAB, marginAY],
                        [marginAX + widthAB + cornerWidthAB * 2, marginAY - cornerHeightAB],
                        [marginAX + widthAB + cornerWidthAB * 2 + cornerWidthAB, marginAY - cornerHeightAB],
                        [marginAX + widthAB + widthAB, marginAY],
                    ]
                },
            },
        }

        // showDebugPolygon(this.data.shapeBackground.background.pointList, this.data.shapeBackground.background.fillColor, "none");

        showDebugPolygon(this.data.tile.A.pointList, this.data.tile.A.fillColor, "none");
        showDebugPolygon(this.data.tile.B.pointList, this.data.tile.B.fillColor, "none");
        showDebugPolygon(this.data.tile.C.pointList, this.data.tile.C.fillColor, "none");
        showDebugPolygon(this.data.tile.D.pointList, this.data.tile.D.fillColor, "none");
    }
}