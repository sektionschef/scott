class shapes {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount) {

        // needs connection to marginrelative of grid - no hard coded margin
        // restructured really needed
        // remove the canvasWidth, canvasHeight
        this.marginBackgroundShape = 92;
        this.colory = "#222222";
        this.canvasWidth = 1600;
        this.canvasHeight = 900;

        this.stripeHeight = stripeHeight;
        this.marginRelative = marginRelative;
        this.boxSize = shortSide / resolutionBoxCount;

        this.allShapes = {
            shapeBackground: {
                background: {
                    shapeLoop: 1,
                    order: 13,
                    density: 2, // density factor - 0 is full
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    // colorAction: this.strokeColor,
                    fillColor: "#afafaf",
                    A: { x: this.marginBackgroundShape, y: this.marginBackgroundShape },
                    B: { x: this.canvasWidth - this.marginBackgroundShape, y: this.marginBackgroundShape },
                    C: { x: this.canvasWidth - this.marginBackgroundShape, y: this.canvasHeight - this.marginBackgroundShape },
                    D: { x: this.marginBackgroundShape, y: this.canvasHeight - this.marginBackgroundShape },
                    pointList: [
                        [this.marginBackgroundShape, this.marginBackgroundShape],
                        [this.canvasWidth - this.marginBackgroundShape, this.marginBackgroundShape],
                        [this.canvasWidth - this.marginBackgroundShape, this.canvasHeight - this.marginBackgroundShape],
                        [this.marginBackgroundShape, this.canvasHeight - this.marginBackgroundShape],
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

        this.calcCoords();
        this.restructureShapeData();
    }


    // define the borders by turning boxes and boxcounts in coords
    calcCoords() {

        // for (var i = 0; i < boxes.length; i++) {
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
        // }

        // DEFAULT VALUES
        // for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
        //     if (shapeId != "shapeBackground") {
        //         if (!shapeValues.shadow.hasOwnProperty('E')) {
        //             shapeValues.shadow.E = this.allShapes.shapeBackground.background.C;
        //         }
        //         // shapeValues.shadow.E = ;
        //     }
        // }

        // for (const shape of this.allShapes) {
        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {
                // console.log(shapeValues);

                shapeValues.front.pointString = `
                ${shapeValues.front.A.x}, ${shapeValues.front.A.y}
                ${shapeValues.front.B.x}, ${shapeValues.front.B.y}
                ${shapeValues.front.C.x}, ${shapeValues.front.C.y}
                ${shapeValues.front.D.x}, ${shapeValues.front.D.y}
            `;
                shapeValues.down.pointString = `
                ${shapeValues.down.A.x}, ${shapeValues.down.A.y}
                ${shapeValues.down.B.x}, ${shapeValues.down.B.y}
                ${shapeValues.down.C.x}, ${shapeValues.down.C.y}
                ${shapeValues.down.D.x}, ${shapeValues.down.D.y}
            `;
                shapeValues.right.pointString = `
                ${shapeValues.right.A.x}, ${shapeValues.right.A.y}
                ${shapeValues.right.B.x}, ${shapeValues.right.B.y}
                ${shapeValues.right.C.x}, ${shapeValues.right.C.y}
                ${shapeValues.right.D.x}, ${shapeValues.right.D.y}
            `;
                shapeValues.shadow.pointString = `
                ${shapeValues.shadow.A.x}, ${shapeValues.shadow.A.y}
                ${shapeValues.shadow.B.x}, ${shapeValues.shadow.B.y}
                ${shapeValues.shadow.C.x}, ${shapeValues.shadow.C.y}
                ${shapeValues.shadow.D.x}, ${shapeValues.shadow.D.y}
                ${shapeValues.shadow.E.x}, ${shapeValues.shadow.E.y}
            `;

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

    restructureShapeData() {

        // reformat for displaying correct hierarchy
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

        // for (const shape of this.allShapes) {
        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {

                // console.log(shapeValues.front.pointList);

                var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                shapsn.setAttributeNS(null, 'points', shapeValues.front.pointList);
                shapsn.setAttributeNS(null, 'fill', "none");
                shapsn.setAttributeNS(null, "stroke-width", 2);
                shapsn.setAttributeNS(null, 'stroke', colory);

                // shapsn.setAttributeNS(null, 'stroke', "none");
                // shapsn.setAttributeNS(null, 'fill', "#c2c2c281");

                svgNode.appendChild(shapsn);

                var shadnA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                shadnA.setAttributeNS(null, 'points', shapeValues.down.pointList);
                shadnA.setAttributeNS(null, 'fill', "none");
                shadnA.setAttributeNS(null, 'stroke', colory);
                shadnA.setAttributeNS(null, "stroke-width", 2);

                svgNode.appendChild(shadnA);

                var shadnB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                shadnB.setAttributeNS(null, 'points', shapeValues.right.pointList);
                shadnB.setAttributeNS(null, 'fill', "none");
                shadnB.setAttributeNS(null, 'stroke', colory);
                shadnB.setAttributeNS(null, "stroke-width", 2);

                svgNode.appendChild(shadnB);

                var superShadow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                superShadow.setAttributeNS(null, 'points', shapeValues.shadow.pointList);
                superShadow.setAttributeNS(null, 'fill', "none");
                superShadow.setAttributeNS(null, 'stroke', colory);
                superShadow.setAttributeNS(null, "stroke-width", 2);

                svgNode.appendChild(superShadow);
            }
        }

    }

    fillShape() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(shapeValues)) {
                // for (const [key, value] of Object.entries(this.shapes.allShapes)) {

                if (["front", "down", "right", "shadow"].includes(key)) {
                    // console.log(value.pointList);
                    const svgNode = document.getElementById('svgNode');

                    var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    shapsn.setAttributeNS(null, 'points', value.pointList);
                    shapsn.setAttributeNS(null, 'points', value.pointList);
                    // shapsn.setAttributeNS(null, 'fill', "none");
                    // shapsn.setAttributeNS(null, "stroke-width", 1);
                    // shapsn.setAttributeNS(null, 'stroke', colory);

                    shapsn.setAttributeNS(null, 'stroke', "none");
                    shapsn.setAttributeNS(null, 'fill', value.fillColor);

                    svgNode.appendChild(shapsn);
                }
            }
        }
    }
}