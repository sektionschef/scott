class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {

        this.DEBUGpoints = true;

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

        // color
        var highlight = "#eeeded";
        var midtonehigh = "#d3d3d3";
        var midtonelow = "#b3b3b3";
        var lowlight = "#808080";


        // fixed distances
        var marginAX = this.margin + this.boxSize * 4;
        var marginAY = this.margin + this.boxSize * 4;
        var heightAB = 15 * this.boxSize; // 
        // var shapeOffsetY = 0 * this.boxSize; // for perspective, relative to widthAB
        var shapeOffsetY = 2 * this.boxSize; // for perspective, relative to widthAB

        var widthAB = heightAB * 2 / 3;
        var cornerHeightAB = heightAB / 2;
        var cornerWidthAB = widthAB / 2;
        var totalTileWidth = widthAB * 2;
        var totalTileHeight = (heightAB + cornerHeightAB) * 2;

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

        for (var y = 0; y < 2; y++) {
            for (var x = 0; x < 3; x++) {
                // for (var y = 0; y < this.canvasHeight / totalTileHeight; y++) {
                //     for (var x = 0; x < this.canvasWidth / totalTileWidth; x++) {

                var columnOffsetX = totalTileWidth * x;
                var columnOffsetY = totalTileHeight * y;
                // var columnOffsetY = shapeOffsetY * x; // for reach column a corection down, perspective

                // calc all the coordinates
                // var P1 = [marginAX + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                // var P2 = [marginAX + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y + shapeOffsetY / 2];
                // var P3 = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y + shapeOffsetY];
                // var P4 = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y + shapeOffsetY];
                // var P5 = [marginAX + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y];

                // var P6 = [marginAX + widthAB * 2 + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y];
                // var P7 = [marginAX + widthAB * 2 + columnOffsetX, marginAY + columnOffsetY + heightAB + totalTileHeight * y];
                // var P8 = [marginAX + widthAB * 2 - cornerWidthAB + columnOffsetX, marginAY + columnOffsetY + heightAB + cornerHeightAB + totalTileHeight * y + shapeOffsetY / 2];
                // var P9 = [marginAX + cornerWidthAB * 2 + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y + shapeOffsetY];
                // var P10 = [marginAX + widthAB + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY + totalTileHeight * y + shapeOffsetY / 2];
                // var P11 = [marginAX + widthAB + cornerWidthAB * 2 + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y];
                // var P12 = [marginAX + widthAB + cornerWidthAB * 2 + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB + totalTileHeight * y + shapeOffsetY / 2];

                var P1ur = [marginAX + columnOffsetX, marginAY + columnOffsetY];
                var P2ur = [marginAX + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB];
                var P3ur = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + shapeOffsetY];
                var P4ur = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY + heightAB];
                var P5ur = [marginAX + columnOffsetX, marginAY + columnOffsetY + heightAB];

                var P6ur = [P3ur[0] + widthAB, P3ur[1]];
                var P7ur = [P6ur[0], P6ur[1] + heightAB];
                var P8ur = [P4ur[0] + widthAB / 2, P4ur[1] + cornerHeightAB];
                var P9ur = [P3ur[0], P2ur[1]];
                var P10ur = [P8ur[0], P3ur[1]];
                var P11ur = [P6ur[0], P9ur[1]];
                var P12ur = [P11ur[0] + widthAB / 2, P11ur[1]];
                var P13ur = [P1ur[0], P1ur[1] + (heightAB + cornerHeightAB)];
                var P14ur = [P2ur[0], P2ur[1] + (heightAB + cornerHeightAB)];
                var P15ur = [P3ur[0], P3ur[1] + (heightAB + cornerHeightAB)];
                var P16ur = [P4ur[0], P4ur[1] + (heightAB + cornerHeightAB)];
                var P17ur = [P5ur[0], P5ur[1] + (heightAB + cornerHeightAB)];
                var P18ur = [P6ur[0], P6ur[1] + (heightAB + cornerHeightAB)];
                var P19ur = [P7ur[0], P7ur[1] + (heightAB + cornerHeightAB)];
                var P20ur = [P8ur[0], P8ur[1] + (heightAB + cornerHeightAB)];
                var P21ur = [P12ur[0], P12ur[1] + (heightAB + cornerHeightAB)];

                // dynamic
                var P1 = [P1ur[0], P1ur[1] - shapeOffsetY];
                var P2 = [P2ur[0] + shapeOffsetY / 2, P2ur[1] - shapeOffsetY / 2];
                var P3 = [P3ur[0], P3ur[1]];
                var P4 = [P4ur[0], P4ur[1]];
                var P5 = [P5ur[0], P5ur[1] - shapeOffsetY];
                var P6 = [P6ur[0], P6ur[1] - shapeOffsetY];
                var P7 = [P7ur[0], P7ur[1] - shapeOffsetY];
                var P8 = [P8ur[0] - shapeOffsetY / 2, P8ur[1] + shapeOffsetY / 2];
                var P9 = [P9ur[0], P9ur[1]];
                // var P10 = [P10ur[0], P10ur[1]];
                // var P11 = [P11ur[0], P11ur[1]];
                // var P12 = [P12ur[0], P12ur[1]];
                var P13 = [P13ur[0], P13ur[1] - shapeOffsetY];
                var P14 = [P14ur[0] + shapeOffsetY / 2, P14ur[1] - shapeOffsetY / 2];
                var P15 = [P15ur[0], P15ur[1]];
                var P16 = [P16ur[0], P16ur[1]];
                var P17 = [P17ur[0], P17ur[1] - shapeOffsetY];
                var P18 = [P18ur[0], P18ur[1] - shapeOffsetY];
                var P19 = [P19ur[0], P19ur[1] - shapeOffsetY];
                var P20 = [P20ur[0] - shapeOffsetY / 2, P20ur[1] + shapeOffsetY / 2];
                var P21 = [P21ur[0], P21ur[1]];

                var P10 = [P20[0], P20[1] - totalTileHeight]; // dirty hack
                var P11 = [P17[0] + widthAB * 2, P17[1] - totalTileHeight];  // dirty hack
                var P12 = [P2[0] + widthAB * 2, P2[1]]  // dirty hack
                // var P5 = [P7[0] - widthAB * 2, P7[1]]  // dirty hack

                var dataEntry = {
                    A: {
                        label: "A",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: midtonelow,
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
                        fillColor: midtonehigh,
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
                        fillColor: lowlight,
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
                        fillColor: highlight,
                        pointList: [
                            P10,
                            P11,
                            P12,
                            P6,
                        ]
                    },
                    E: {
                        label: "E",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: midtonehigh,
                        pointList: [
                            P13,
                            P14,
                            P15,
                            P16,
                            P17,
                        ]
                    },
                    F: {
                        label: "F",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: midtonelow,
                        pointList: [
                            P15,
                            P18,
                            P19,
                            P20,
                            P16,
                        ]
                    },
                    G: {
                        label: "G",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: highlight,
                        pointList: [
                            P14,
                            P4,
                            P8,
                            P15,
                        ]
                    },
                    H: {
                        label: "H",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 1,
                        colorAction: "blue",
                        fillColor: lowlight,
                        pointList: [
                            P8,
                            P7,
                            P21,
                            P18,
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
            showDebugPolygon(this.data.shapes[i].E.pointList, this.data.shapes[i].E.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].F.pointList, this.data.shapes[i].F.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].G.pointList, this.data.shapes[i].G.fillColor, "none");
            showDebugPolygon(this.data.shapes[i].H.pointList, this.data.shapes[i].H.fillColor, "none");
        }

        if (this.DEBUGpoints) {
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

            showDebugPoint(P13[0], P13[1], "black", "2", "P13")
            showDebugPoint(P14[0], P14[1], "black", "2", "P14")
            showDebugPoint(P15[0], P15[1], "black", "2", "P15")
            showDebugPoint(P16[0], P16[1], "black", "2", "P16")
            showDebugPoint(P17[0], P17[1], "black", "2", "P17")

            showDebugPoint(P18[0], P18[1], "black", "2", "P18")
            showDebugPoint(P19[0], P19[1], "black", "2", "P19")
            showDebugPoint(P20[0], P20[1], "black", "2", "P20")

            showDebugPoint(P21[0], P21[1], "black", "2", "P21")
        }

    }
}