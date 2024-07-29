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
        var marginAX = this.margin + this.boxSize * 4;
        var marginAY = this.margin + this.boxSize * 4;
        var heightAB = 15 * this.boxSize; // 
        var shapeOffsetY = 1 * this.boxSize; // for perspective, relative to widthAB

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

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                // for (var y = 0; y < this.canvasHeight / totalTileHeight; y++) {
                //     for (var x = 0; x < this.canvasWidth / totalTileWidth; x++) {

                var columnOffsetX = totalTileWidth * x;
                // var columnOffsetY = 0; 
                var columnOffsetY = 2 * shapeOffsetY * x; // for reach column a corection down, perspective

                // calc all the coordinates
                var P1 = [marginAX + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                var P2 = [marginAX + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y];
                var P3 = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                var P4 = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y];
                var P5 = [marginAX + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y];

                var P6 = [marginAX + widthAB * 2 + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                var P7 = [marginAX + widthAB * 2 + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y];
                var P8 = [marginAX + widthAB * 2 - cornerWidthAB + columnOffsetX, marginAY + columnOffsetY + heightAB + cornerHeightAB + totalTileHeight * y];
                var P9 = [marginAX + cornerWidthAB * 2 + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y];
                var P10 = [marginAX + widthAB + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                var P11 = [marginAX + widthAB + cornerWidthAB * 2 + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y];
                var P12 = [marginAX + widthAB + cornerWidthAB * 2 + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y];

                var dataEntry = {
                    A: {
                        label: "A",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#d3d3d3",
                        pointList: [
                            P1,
                            P2,
                            P3,
                            P4,
                            P5,
                        ]
                    },
                    B: {
                        label: "B",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#b8b8b8",
                        pointList: [
                            P3,
                            P6,
                            P7,
                            P8,
                            P4,
                        ]
                    },
                    C: {
                        label: "C",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#707070",
                        pointList: [
                            P2,
                            P9,
                            P10,
                            P3,
                        ]
                    },
                    D: {
                        label: "D",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: "#eeeded",
                        pointList: [
                            P10,
                            P11,
                            P12,
                            P6,
                        ]
                    },
                }

                this.data.shapes.push(dataEntry)
            }
        }





        // SHOWBACKGROUND
        // showDebugPolygon(this.data.shapeBackground.background.pointList, this.data.shapeBackground.background.fillColor, "none");


        // DISPLAY SHAPES
        for (var i = 0; i < this.data.shapes.length; i++) {
            // showDebugPolygon(this.data.shapes[i].A.pointList, this.data.shapes[i].A.fillColor, "none", this.data.shapes[i].A.label);
            showDebugPolygon(this.data.shapes[i].A.pointList, this.data.shapes[i].A.fillColor, "none", "none");
            showDebugPolygon(this.data.shapes[i].B.pointList, this.data.shapes[i].B.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].C.pointList, this.data.shapes[i].C.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].D.pointList, this.data.shapes[i].D.fillColor, "none");

            // showDebugPolygon(this.data.shapes[i].E.pointList, this.data.shapes[i].E.fillColor, "none");
            // showDebugPolygon(this.data.shapes[i].F.pointList, this.data.shapes[i].F.fillColor, "none");
        }

        showDebugPoint(P1[0], P1[1], "black", "2", "P1")
        showDebugPoint(P2[0], P2[1], "black", "2", "P2")
        showDebugPoint(P3[0], P3[1], "black", "2", "P3")
        showDebugPoint(P4[0], P4[1], "black", "2", "P4")
        showDebugPoint(P5[0], P5[1], "black", "2", "P5")
        showDebugPoint(P6[0], P6[1], "black", "2", "P6")
        showDebugPoint(P7[0], P7[1], "black", "2", "P7")
        showDebugPoint(P8[0], P8[1], "black", "2", "P8")
        showDebugPoint(P9[0], P9[1], "black", "2", "P9")
        showDebugPoint(P10[0], P10[1], "black", "2", "P10")
        showDebugPoint(P11[0], P11[1], "black", "2", "P11")
        showDebugPoint(P12[0], P12[1], "black", "2", "P12")
    }
}