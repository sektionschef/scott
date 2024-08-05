class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {

        this.DEBUGpoints = false;
        this.DEBUGshapes = true;

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

        // PROFILE 
        // color
        var highlight = "#eeeded";
        var midtonehigh = "#d3d3d3";
        var midtonelow = "#b3b3b3";
        var lowlight = "#808080";

        // fixed distances
        var marginAX = this.margin + this.boxSize * -4;
        var marginAY = this.margin + this.boxSize * -4;
        var heightAB = 20 * this.boxSize; // used to be 15

        var shapeOffsetY = 1 * this.boxSize; // for perspective, relative to widthAB

        var widthAB = heightAB * 2 / 3;
        var cornerHeightAB = heightAB / 2;
        var cornerWidthAB = widthAB / 2;
        var totalTileWidth = widthAB * 2;
        var totalTileHeight = (heightAB + cornerHeightAB) * 2;

        // TODO: MERGE THE PARAMS IN THIS DATA
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

                // calc all the coordinates and keep the values for others to reference to them
                var P1ur = [marginAX + columnOffsetX, marginAY + columnOffsetY];
                var P2ur = [marginAX + cornerWidthAB + columnOffsetX, marginAY + columnOffsetY - cornerHeightAB];
                var P3ur = [marginAX + widthAB + columnOffsetX, marginAY + columnOffsetY];
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

                // dynamic with offsets
                this.P1 = [P1ur[0], P1ur[1] + shapeOffsetY];
                this.P2 = [P2ur[0] + shapeOffsetY / 2, P2ur[1] - shapeOffsetY / 2];
                this.P3 = [P3ur[0], P3ur[1]];
                this.P4 = [P4ur[0], P4ur[1]];
                this.P5 = [P5ur[0], P5ur[1] + shapeOffsetY];
                this.P6 = [P6ur[0], P6ur[1] + shapeOffsetY];
                this.P7 = [P7ur[0], P7ur[1] + shapeOffsetY];
                this.P8 = [P8ur[0] + shapeOffsetY / 2, P8ur[1] + shapeOffsetY / 2];
                this.P9 = [P9ur[0], P9ur[1]];
                this.P10 = [P10ur[0], P10ur[1]];
                this.P11 = [P11ur[0], P11ur[1]];
                this.P12 = [P12ur[0], P12ur[1]];
                this.P13 = [P13ur[0], P13ur[1] - shapeOffsetY];
                this.P14 = [P14ur[0] + shapeOffsetY / 2, P14ur[1] - shapeOffsetY / 2];
                this.P15 = [P15ur[0], P15ur[1]];
                this.P16 = [P16ur[0], P16ur[1]];
                this.P17 = [P17ur[0], P17ur[1] - shapeOffsetY];
                this.P18 = [P18ur[0], P18ur[1] - shapeOffsetY];
                this.P19 = [P19ur[0], P19ur[1] - shapeOffsetY];
                this.P20 = [P20ur[0] - shapeOffsetY / 2, P20ur[1] + shapeOffsetY / 2];
                this.P21 = [P21ur[0], P21ur[1]];

                this.P10 = [this.P20[0], this.P20[1] - totalTileHeight]; // dirty hack
                this.P11 = [this.P17[0] + widthAB * 2, this.P17[1] - totalTileHeight];  // dirty hack
                this.P12 = [this.P2[0] + widthAB * 2, this.P2[1]]  // dirty hack
                // // this.P5 = [this.P7[0] - widthAB * 2, this.P7[1]]  // dirty hack

                var dataEntry = {
                    A: {
                        label: "A",
                        shapeMaxLoop: 1,
                        order: 1,
                        density: 3,
                        colorAction: "blue",
                        grid: 2,
                        fillColor: midtonelow,
                        pointList: [
                            this.P1,
                            this.P2,
                            this.P3,
                            this.P4,
                            this.P5,
                        ]
                    },
                    B: {
                        label: "B",
                        shapeMaxLoop: 1,
                        order: 8,
                        density: 2,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: midtonehigh,
                        pointList: [
                            this.P3,
                            this.P6,
                            this.P7,
                            this.P8,
                            this.P4,
                        ]
                    },
                    C: {
                        label: "C",
                        shapeMaxLoop: 1,
                        order: 2,
                        density: 1,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: lowlight,
                        pointList: [
                            this.P2,
                            this.P9,
                            this.P10,
                            this.P3,
                        ]
                    },
                    D: {
                        label: "D",
                        shapeMaxLoop: 1,
                        order: 3,
                        density: 6,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: highlight,
                        pointList: [
                            this.P10,
                            this.P11,
                            this.P12,
                            this.P6,
                        ]
                    },
                    E: {
                        label: "E",
                        shapeMaxLoop: 1,
                        order: 4,
                        density: 3,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: midtonehigh,
                        pointList: [
                            this.P13,
                            this.P14,
                            this.P15,
                            this.P16,
                            this.P17,
                        ]
                    },
                    F: {
                        label: "F",
                        shapeMaxLoop: 1,
                        order: 5,
                        density: 4,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: midtonelow,
                        pointList: [
                            this.P15,
                            this.P18,
                            this.P19,
                            this.P20,
                            this.P16,
                        ]
                    },
                    G: {
                        label: "G",
                        shapeMaxLoop: 1,
                        order: 6,
                        density: 5,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: highlight,
                        pointList: [
                            this.P14,
                            this.P4,
                            this.P8,
                            this.P15,
                        ]
                    },
                    H: {
                        label: "H",
                        shapeMaxLoop: 1,
                        order: 7,
                        density: 1,
                        colorAction: "blue",
                        grid: 1,
                        fillColor: lowlight,
                        pointList: [
                            this.P8,
                            this.P7,
                            this.P21,
                            this.P18,
                        ]
                    },
                }

                this.data.shapes.push(dataEntry)
            }
        }
        // SHOWBACKGROUND
        // showDebugPolygon(this.data.shapeBackground.background.pointList, this.data.shapeBackground.background.fillColor, "none");
    }

    debugShowShapes() {
        for (var i = 0; i < this.data.shapes.length; i++) {

            // with labels
            if (false) {
                showDebugPolygon(this.data.shapes[i].A.pointList, this.data.shapes[i].A.fillColor, "none", this.data.shapes[i].A.label);
                showDebugPolygon(this.data.shapes[i].C.pointList, this.data.shapes[i].C.fillColor, "none", this.data.shapes[i].C.label);
                showDebugPolygon(this.data.shapes[i].D.pointList, this.data.shapes[i].D.fillColor, "none", this.data.shapes[i].D.label);
                showDebugPolygon(this.data.shapes[i].E.pointList, this.data.shapes[i].E.fillColor, "none", this.data.shapes[i].E.label);
                showDebugPolygon(this.data.shapes[i].F.pointList, this.data.shapes[i].F.fillColor, "none", this.data.shapes[i].F.label);
                showDebugPolygon(this.data.shapes[i].G.pointList, this.data.shapes[i].G.fillColor, "none", this.data.shapes[i].G.label);
                showDebugPolygon(this.data.shapes[i].H.pointList, this.data.shapes[i].H.fillColor, "none", this.data.shapes[i].H.label);
                showDebugPolygon(this.data.shapes[i].B.pointList, this.data.shapes[i].B.fillColor, "none", this.data.shapes[i].B.label);  // ORDER
                // without labels
            } else {
                showDebugPolygon(this.data.shapes[i].A.pointList, this.data.shapes[i].A.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].C.pointList, this.data.shapes[i].C.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].D.pointList, this.data.shapes[i].D.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].E.pointList, this.data.shapes[i].E.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].F.pointList, this.data.shapes[i].F.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].G.pointList, this.data.shapes[i].G.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].H.pointList, this.data.shapes[i].H.fillColor, "none");
                showDebugPolygon(this.data.shapes[i].B.pointList, this.data.shapes[i].B.fillColor, "none");  // ORDER
            }
        }
    }

    debugShowPoints() {
        showDebugPoint(this.P1[0], this.P1[1], "black", "2", "P1")
        showDebugPoint(this.P2[0], this.P2[1], "black", "2", "P2")
        showDebugPoint(this.P3[0], this.P3[1], "black", "2", "P3")
        showDebugPoint(this.P4[0], this.P4[1], "black", "2", "P4")
        showDebugPoint(this.P5[0], this.P5[1], "black", "2", "P5")
        showDebugPoint(this.P6[0], this.P6[1], "black", "2", "P6")
        showDebugPoint(this.P7[0], this.P7[1], "black", "2", "P7")
        showDebugPoint(this.P8[0], this.P8[1], "black", "2", "P8")
        showDebugPoint(this.P9[0], this.P9[1], "black", "2", "P9")
        showDebugPoint(this.P10[0], this.P10[1], "black", "2", "P10")
        showDebugPoint(this.P11[0], this.P11[1], "black", "2", "P11")
        showDebugPoint(this.P12[0], this.P12[1], "black", "2", "P12")
        showDebugPoint(this.P13[0], this.P13[1], "black", "2", "P13")
        showDebugPoint(this.P14[0], this.P14[1], "black", "2", "P14")
        showDebugPoint(this.P15[0], this.P15[1], "black", "2", "P15")
        showDebugPoint(this.P16[0], this.P16[1], "black", "2", "P16")
        showDebugPoint(this.P17[0], this.P17[1], "black", "2", "P17")
        showDebugPoint(this.P18[0], this.P18[1], "black", "2", "P18")
        showDebugPoint(this.P19[0], this.P19[1], "black", "2", "P19")
        showDebugPoint(this.P20[0], this.P20[1], "black", "2", "P20")
        showDebugPoint(this.P21[0], this.P21[1], "black", "2", "P21")
    }
}
