// TODO
// order params und alphabet for shapes
// different grids for each shape

class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight, group) {

        // this.profile = "A";  // bausatzsystem
        this.profile = "B";  // pyramide

        this.stripeHeight = stripeHeight;
        this.marginRelative = marginRelative;
        this.boxSize = shortSide / resolutionBoxCount;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.group = group;

        if (this.profile == "A") {
            this.iterationX = 10;
            this.iterationY = 3;
        } else if (this.profile == "B") {
            this.iterationX = 8;
            this.iterationY = 7;

            this.sizePyramid = 13;
            this.sidePyramid = this.sizePyramid * this.boxSize;
        }

        this.size = 13; // 20
        this.colorAction = "#585858";

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
        var marginAX = this.margin + this.boxSize * -2;
        var marginAY = this.margin + this.boxSize * -2;
        var heightAB = this.size * this.boxSize; // used to be 15

        var shapeOffsetY = 1 * this.boxSize; // for perspective, relative to widthAB

        if (this.profile == "A") {
            var widthAB = heightAB * 2 / 3;
            var cornerHeightAB = heightAB / 2;
            var cornerWidthAB = widthAB / 2;
            var totalTileWidth = widthAB * 2;
            var totalTileHeight = (heightAB + cornerHeightAB) * 2;
        }

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

        if (this.profile == "A") {
            for (var y = 0; y < this.iterationY; y++) {
                for (var x = 0; x < this.iterationX; x++) {

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
                            colorAction: this.colorAction,
                            grid: 1,
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
                            density: 6,
                            colorAction: this.colorAction,
                            grid: 2,
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
                            colorAction: this.colorAction,
                            grid: 3,
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
                            density: 13,
                            colorAction: this.colorAction,
                            grid: 4,
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
                            density: 6,
                            colorAction: this.colorAction,
                            grid: 5,
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
                            density: 3,
                            colorAction: this.colorAction,
                            grid: 6,
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
                            density: 13,
                            colorAction: this.colorAction,
                            grid: 7,
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
                            colorAction: this.colorAction,
                            grid: 8,
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
        } else if (this.profile == "B") {
            for (var y = 0; y < this.iterationY; y++) {
                for (var x = 0; x < this.iterationX; x++) {

                    this.columnOffsetX = this.sidePyramid * x;
                    this.columnOffsetY = this.sidePyramid * y;

                    // calc all the coordinates and keep the values for others to reference to them
                    this.P1 = [marginAX + this.columnOffsetX, marginAY + this.columnOffsetY];
                    this.P2 = [marginAX + this.sidePyramid + this.columnOffsetX, marginAY + this.columnOffsetY];
                    this.P3 = [marginAX + this.sidePyramid + this.columnOffsetX, marginAY + this.sidePyramid + this.columnOffsetY];
                    this.P4 = [marginAX + this.columnOffsetX, marginAY + this.columnOffsetY + this.sidePyramid];
                    this.P5 = [marginAX + this.columnOffsetX + this.sidePyramid / 2, marginAY + this.columnOffsetY + this.sidePyramid / 2];

                    var dataEntry = {
                        A: {
                            label: "A",
                            shapeMaxLoop: 1,
                            order: 1,
                            density: 3,
                            colorAction: this.colorAction,
                            grid: 1,
                            fillColor: highlight,
                            pointList: [
                                this.P1,
                                this.P2,
                                this.P5,
                            ]
                        },
                        B: {
                            label: "B",
                            shapeMaxLoop: 1,
                            order: 8,
                            density: 6,
                            colorAction: this.colorAction,
                            grid: 1,
                            fillColor: midtonelow,
                            pointList: [
                                this.P2,
                                this.P3,
                                this.P5,
                            ]
                        },
                        C: {
                            label: "C",
                            shapeMaxLoop: 1,
                            order: 2,
                            density: 1,
                            colorAction: this.colorAction,
                            grid: 1,
                            fillColor: lowlight,
                            pointList: [
                                this.P3,
                                this.P4,
                                this.P5,
                            ]
                        },
                        D: {
                            label: "D",
                            shapeMaxLoop: 1,
                            order: 3,
                            density: 13,
                            colorAction: this.colorAction,
                            grid: 1,
                            fillColor: midtonelow,
                            pointList: [
                                this.P4,
                                this.P1,
                                this.P5,
                            ]
                        }
                    }
                    this.data.shapes.push(dataEntry)
                }
            }
        }



        // SHOWBACKGROUND
        // showDebugPolygon(this.data.shapeBackground.background.pointList, this.data.shapeBackground.background.fillColor, "none");

        this.filterForGroup();
        this.sortForLoopNew();
    }

    filterForGroup() {
        var lowlevel = [];
        for (var run of this.data.shapes) {
            var container = {}
            // console.log(run);
            for (const [key, value] of Object.entries(run)) {
                // console.log(key, value);
                if (value.grid != this.group) {
                    continue;
                } else {
                    container[key] = value
                }
            }
            lowlevel.push(container);
        }
        this.data.shapes = lowlevel;
    }

    sortForLoopNew() {

        // reformat for displaying correct hierarchy - order of elements, background to front
        this.loopMaterial = {};

        // BACKGROUND NOT USED - CAN BE POSITION 0

        // console.log(this.data.shapes);  // nur die flächen innerhalb der loops sortieren

        // for (var shapeLoop of this.data.shapes) {
        for (var i = 0; i < this.data.shapes.length; i++) {
            var shapeLoop = this.data.shapes[i]
            // console.log(shapeLoop);
            var shapeCountPerLoop = Object.keys(shapeLoop).length;

            var index = 1;  // starts with 1
            for (const [key, value] of Object.entries(shapeLoop)) {
                // console.log(value['order'])
                // console.log((value['order'] + i * shapeCountPerLoop));
                // this.loopMaterial[(value['order'] + i * shapeCountPerLoop)] = value
                this.loopMaterial[(index + i * shapeCountPerLoop)] = value
                index += 1;
            }
        }
        // console.log(this.loopMaterial)
    }

    debugShowShapes() {

        var showLabels = true;
        // mind the order
        if (this.profile == "A") {
            var alphabet = ["A", "C", "D", "E", "F", "G", "H", "B"];
        } else if (this.profile == "B") {
            var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H",];
        }

        for (var i = 0; i < this.data.shapes.length; i++) {
            for (var letterI = 0; letterI < alphabet.length; letterI++) {
                var selectedShape = this.data.shapes[i][alphabet[letterI]];
                if (selectedShape) {
                    if (showLabels) {
                        // showDebugPolygon(selectedShape.pointList, selectedShape.fillColor, "none", selectedShape.label);
                        showDebugPolygon(selectedShape.pointList, selectedShape.fillColor, "orange", selectedShape.label);
                    } else {
                        showDebugPolygon(selectedShape.pointList, selectedShape.fillColor, "orange");
                    }
                }
            }
        }
    }

    debugShowPoints() {
        // console.log(this.data.shapes);
        if (this.profile == "A") {
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
        } else if (this.profile == "B") {
            for (var i = 0; i < this.data.shapes.length; i++) {
                // console.log(this.data.shapes[i]);

                // shape A
                showDebugPoint(this.data.shapes[i]["A"]["pointList"][0][0], this.data.shapes[i]["A"]["pointList"][0][1], "black", "1", "P1");
                showDebugPoint(this.data.shapes[i]["A"]["pointList"][1][0], this.data.shapes[i]["A"]["pointList"][1][1], "black", "1", "P2");
                showDebugPoint(this.data.shapes[i]["A"]["pointList"][2][0], this.data.shapes[i]["A"]["pointList"][2][1], "black", "1", "P5");

                // shape B
                showDebugPoint(this.data.shapes[i]["B"]["pointList"][0][0], this.data.shapes[i]["B"]["pointList"][0][1], "black", "1", "P2");
                showDebugPoint(this.data.shapes[i]["B"]["pointList"][1][0], this.data.shapes[i]["B"]["pointList"][1][1], "black", "1", "P3");
                showDebugPoint(this.data.shapes[i]["B"]["pointList"][2][0], this.data.shapes[i]["B"]["pointList"][2][1], "black", "1", "P5");

                // shape B
                showDebugPoint(this.data.shapes[i]["C"]["pointList"][0][0], this.data.shapes[i]["C"]["pointList"][0][1], "black", "1", "P3");
                showDebugPoint(this.data.shapes[i]["C"]["pointList"][1][0], this.data.shapes[i]["C"]["pointList"][1][1], "black", "1", "P4");
                showDebugPoint(this.data.shapes[i]["C"]["pointList"][2][0], this.data.shapes[i]["C"]["pointList"][2][1], "black", "1", "P5");

                // shape B
                showDebugPoint(this.data.shapes[i]["D"]["pointList"][0][0], this.data.shapes[i]["D"]["pointList"][0][1], "black", "1", "P3");
                showDebugPoint(this.data.shapes[i]["D"]["pointList"][1][0], this.data.shapes[i]["D"]["pointList"][1][1], "black", "1", "P4");
                showDebugPoint(this.data.shapes[i]["D"]["pointList"][2][0], this.data.shapes[i]["D"]["pointList"][2][1], "black", "1", "P5");

            }
        }
    }

}
