class Shapes {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {

        // remove A, B, C, D in the shapes
        // maybe remove the box == things in grid and use coords
        this.colory = "#00a7d1";
        this.canvasWidth = canvasWidth; // 1600;
        this.canvasHeight = canvasHeight; // 900;

        this.stripeHeight = stripeHeight;
        this.marginRelative = marginRelative;
        this.boxSize = shortSide / resolutionBoxCount;

        this.blueprint();
        this.calcCoords();

        this.sortForLoop();
    }


    blueprint() {
        if (this.marginRelative == 0) {
            this.margin = 0;
        } else {
            this.margin = Math.round(this.stripeHeight * this.marginRelative) * this.boxSize;
        }

        this.allShapes = {
            shapeBackground: {
                background: {
                    shapeLoop: 1,
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
            shapeA: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 12,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // 25, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 1,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 4,
                    density: 0,
                    // colorAction: "green",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 7,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 10,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            },
            shapeB: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 32,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 2,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 5,
                    density: 0,
                    // colorAction: "green",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 8,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 11,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            },
            shapeC: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 52,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 3,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 6,
                    density: 0,
                    // colorAction: "green",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 9,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 12,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            }
        }

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {
                shapeValues.shapeMainHeight = this.stripeHeight * shapeValues.MainHeightLine - 1;  // height of main shape in boxes
                shapeValues.shadAheight = this.stripeHeight * shapeValues.shadHeightLine - 1;  //
                shapeValues.shadAshift = this.stripeHeight * shapeValues.shadHeightLine - 1;
                shapeValues.mainWidthCX = shapeValues.mainBoxPos.x + shapeValues.MainWidth;
                shapeValues.mainWidthCY = shapeValues.mainBoxPos.y + shapeValues.shapeMainHeight;
                shapeValues.ShadAAY = shapeValues.mainWidthCY + 1;
            }
        }
    }

    // define the borders by turning boxes and boxcounts in coords
    calcCoords() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {

                // shadow
                shapeValues.shadow.A = { x: (shapeValues.mainBoxPos.x + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.ShadAAY + shapeValues.shadAheight + 1) * this.boxSize }
                shapeValues.shadow.B = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.ShadAAY + shapeValues.shadAheight) * this.boxSize + this.boxSize }
                shapeValues.shadow.C = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.mainBoxPos.y + shapeValues.shadAheight) * this.boxSize + this.boxSize }
                shapeValues.shadow.D = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift + shapeValues.superShadowShiftX) * this.boxSize + this.boxSize, y: (shapeValues.mainWidthCY + shapeValues.superShadowShiftY) * this.boxSize };
                shapeValues.shadow.E = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift + shapeValues.superShadowShiftX) * this.boxSize + this.boxSize, y: (shapeValues.mainWidthCY + shapeValues.superShadowShiftY + shapeValues.superShadowHeightMax) * this.boxSize + this.boxSize }

                // down
                shapeValues.down.A = { x: shapeValues.mainBoxPos.x * this.boxSize, y: shapeValues.ShadAAY * this.boxSize };
                shapeValues.down.B = { x: shapeValues.mainWidthCX * this.boxSize + this.boxSize, y: shapeValues.ShadAAY * this.boxSize }
                shapeValues.down.C = { x: (shapeValues.mainWidthCX + shapeValues.shadAshift) * this.boxSize + this.boxSize, y: (shapeValues.ShadAAY + shapeValues.shadAheight) * this.boxSize + this.boxSize }
                shapeValues.down.D = { x: (shapeValues.mainBoxPos.x + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.ShadAAY + shapeValues.shadAheight) * this.boxSize + this.boxSize };

                // right
                shapeValues.right.A = { x: (shapeValues.mainWidthCX + 1) * this.boxSize, y: shapeValues.mainBoxPos.y * this.boxSize }
                shapeValues.right.B = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.mainBoxPos.y + shapeValues.shadAheight) * this.boxSize + this.boxSize }
                shapeValues.right.C = { x: (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) * this.boxSize, y: (shapeValues.ShadAAY + shapeValues.shadAheight) * this.boxSize + this.boxSize }
                shapeValues.right.D = { x: (shapeValues.mainWidthCX + 1) * this.boxSize, y: shapeValues.mainWidthCY * this.boxSize + this.boxSize }

                // front
                shapeValues.front.A = { x: shapeValues.mainBoxPos.x * this.boxSize, y: shapeValues.mainBoxPos.y * this.boxSize };
                shapeValues.front.B = { x: shapeValues.mainWidthCX * this.boxSize + this.boxSize, y: shapeValues.mainBoxPos.y * this.boxSize };
                shapeValues.front.C = { x: shapeValues.mainWidthCX * this.boxSize + this.boxSize, y: shapeValues.mainWidthCY * this.boxSize + this.boxSize }
                shapeValues.front.D = { x: shapeValues.mainBoxPos.x * this.boxSize, y: shapeValues.mainWidthCY * this.boxSize + this.boxSize }
            }
        }

        // for (const shape of this.allShapes) {
        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {
                // console.log(shapeValues);

                shapeValues.front.pointList = [
                    [shapeValues.front.A.x, shapeValues.front.A.y],
                    [shapeValues.front.B.x, shapeValues.front.B.y],
                    [shapeValues.front.C.x, shapeValues.front.C.y],
                    [shapeValues.front.D.x, shapeValues.front.D.y]
                ];
                shapeValues.down.pointList = [
                    [shapeValues.down.A.x, shapeValues.down.A.y],
                    [shapeValues.down.B.x, shapeValues.down.B.y],
                    [shapeValues.down.C.x, shapeValues.down.C.y],
                    [shapeValues.down.D.x, shapeValues.down.D.y]
                ];
                shapeValues.right.pointList = [
                    [shapeValues.right.A.x, shapeValues.right.A.y],
                    [shapeValues.right.B.x, shapeValues.right.B.y],
                    [shapeValues.right.C.x, shapeValues.right.C.y],
                    [shapeValues.right.D.x, shapeValues.right.D.y]
                ];
                shapeValues.shadow.pointList = [
                    [shapeValues.shadow.A.x, shapeValues.shadow.A.y],
                    [shapeValues.shadow.B.x, shapeValues.shadow.B.y],
                    [shapeValues.shadow.C.x, shapeValues.shadow.C.y],
                    [shapeValues.shadow.D.x, shapeValues.shadow.D.y],
                    [shapeValues.shadow.E.x, shapeValues.shadow.E.y]
                ];
            }
        }
    }

    sortForLoop() {

        // reformat for displaying correct hierarchy - order of elements, background to front
        this.loopMaterial = {
        };

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(shapeValues)) {

                if (["background"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "background";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                // filter out other keys
                if (["front"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "front";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["down"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "down";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["right"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "right";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["shadow"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "shadow";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
            }
        }
        // console.log(this.loopMaterial);
    }

    debugShowShape() {

        var colory = "orange";
        const svgNode = document.getElementById('svgNode');

        for (const [shapeOrder, shapeValues] of Object.entries(this.loopMaterial)) {

            var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shapsn.setAttributeNS(null, 'points', shapeValues.pointList);
            shapsn.setAttributeNS(null, 'fill', "none");
            shapsn.setAttributeNS(null, "stroke-width", 2);
            shapsn.setAttributeNS(null, 'stroke', colory);
            svgNode.appendChild(shapsn);
        }

    }

    fillShape() {

        const svgNode = document.getElementById('svgNode');

        for (const [shapeOrder, shapeValues] of Object.entries(this.loopMaterial)) {

            // console.log(value.pointList);

            var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shapsn.setAttributeNS(null, 'points', shapeValues.pointList);
            // shapsn.setAttributeNS(null, 'points', value.pointList);
            // shapsn.setAttributeNS(null, 'fill', "none");
            // shapsn.setAttributeNS(null, "stroke-width", 1);
            // shapsn.setAttributeNS(null, 'stroke', colory);

            shapsn.setAttributeNS(null, 'stroke', "none");
            shapsn.setAttributeNS(null, 'fill', shapeValues.fillColor);

            svgNode.appendChild(shapsn);
        }
        // }
        // }
    }
}