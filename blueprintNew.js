class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {

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

        // fixed
        var marginAX = this.margin - this.boxSize * 4;
        var marginAY = this.margin - this.boxSize * 4;
        var heightAB = 15 * this.boxSize; // 
        var widthAB = heightAB * 2 / 3;
        var cornerHeightAB = heightAB / 2;
        var cornerWidthAB = widthAB / 2;
        var totalTileWidth = widthAB * 2;
        var totalTileHeight = heightAB + cornerHeightAB;

        this.data = {
            shapeBackground: {
                background: {
                    shapeMaxLoop: 1,  // maximum loop to draw in this shape
                    order: 13,
                    density: 2, // density factor - 0 is full
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    // colorAction: this.strokeColor,
                    fillColor: "#7e7e7eff",
                    // fillColor: "None",
                    pointList: [
                        [this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.canvasHeight - this.margin],
                        [this.margin, this.canvasHeight - this.margin],
                    ]
                }
            },
            tile: {},
            shapes: [],
        }

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 8; x++) {


                var dataEntry = {
                    A: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#d3d3d3",
                        pointList: [
                            [marginAX + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + cornerWidthAB + totalTileWidth * x, marginAY - cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                        ]
                    },
                    B: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#b8b8b8",
                        pointList: [
                            [marginAX + widthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + widthAB * 2 + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + widthAB * 2 + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + widthAB * 2 - cornerWidthAB + totalTileWidth * x, marginAY + heightAB + cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                        ]
                    },
                    C: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#707070",
                        pointList: [
                            [marginAX + cornerWidthAB + totalTileWidth * x, marginAY - cornerHeightAB + totalTileHeight * y],
                            [marginAX + cornerWidthAB * 2 + totalTileWidth * x, marginAY - cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + cornerWidthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                        ]
                    },
                    D: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#eeeded",
                        pointList: [
                            [marginAX + widthAB + cornerWidthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                            [marginAX + widthAB + cornerWidthAB * 2 + totalTileWidth * x, marginAY - cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + cornerWidthAB * 2 + cornerWidthAB + totalTileWidth * x, marginAY - cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + widthAB + totalTileWidth * x, marginAY + totalTileHeight * y],
                        ]
                    },
                    E: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#eeeded",
                        pointList: [
                            [marginAX - cornerWidthAB + totalTileWidth * x, marginAY + heightAB + cornerHeightAB + totalTileHeight * y],
                            [marginAX + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + cornerWidthAB + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + totalTileWidth * x, marginAY + heightAB + cornerHeightAB + totalTileHeight * y],
                        ]
                    },
                    F: {
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "#e4e4e4",
                        fillColor: "#707070",
                        pointList: [
                            [marginAX + cornerWidthAB + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + heightAB + totalTileHeight * y],
                            [marginAX + widthAB + cornerWidthAB + totalTileWidth * x, marginAY + heightAB + cornerHeightAB + totalTileHeight * y],
                            [marginAX + widthAB + totalTileWidth * x, marginAY + heightAB + cornerHeightAB + totalTileHeight * y],
                        ]
                    },
                }

                this.data.shapes.push(dataEntry)
            }
        }






        showDebugPolygon(this.data.shapeBackground.background.pointList, this.data.shapeBackground.background.fillColor, "none");


        // DISPLAY SHAPES
        for (var i = 0; i < this.data.shapes.length; i++) {
            showDebugPolygon(this.data.shapes[i].A.pointList, this.data.shapes[i].A.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].B.pointList, this.data.shapes[i].B.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].C.pointList, this.data.shapes[i].C.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].D.pointList, this.data.shapes[i].D.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].E.pointList, this.data.shapes[i].E.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].F.pointList, this.data.shapes[i].F.fillColor, "none");
        }
    }
}