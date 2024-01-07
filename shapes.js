class shapes {
    constructor(stripeHeight) {

        this.stripeHeight = stripeHeight;

        this.allShapes = {
            shapeA: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 9
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 2,  // height of main shape in lineheights
                superShadowShiftX: 10,  //  shift in boxes on x axis
                superShadowShiftY: 5,  // shift in boxes on y axis
                superShadowHeightMax: 25, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    // colorAction: "#5c5c5c",
                    colorAction: "red",
                    // colorAction: this.strokeColor,
                    fillColor: "#afafaf",
                },
                down: {  // shadow beneath
                    shapeLoop: 1,
                    colorAction: "green",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#999999",
                },
                right: {  // shadow beneath
                    shapeLoop: 1,
                    colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#aaaaaa",
                }
            },
            shapeB: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 33
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 2,  // height of main shape in lineheights
                superShadowShiftX: 10,  //  shift in boxes on x axis
                superShadowShiftY: 5,  // shift in boxes on y axis
                superShadowHeightMax: 25, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    // colorAction: "#5c5c5c",
                    colorAction: "red",
                    // colorAction: this.strokeColor,
                    fillColor: "#afafaf",
                },
                down: {  // shadow beneath
                    shapeLoop: 1,
                    colorAction: "green",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#999999",
                },
                right: {  // shadow beneath
                    shapeLoop: 1,
                    colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    // colorAction: this.strokeColor,
                    fillColor: "#aaaaaa",
                }
            }
        }


        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            shapeValues.shapeMainHeight = this.stripeHeight * shapeValues.MainHeightLine - 1;  // height of main shape in boxes
            shapeValues.shadAheight = this.stripeHeight * shapeValues.shadHeightLine - 1;  //
            shapeValues.shadAshift = this.stripeHeight * shapeValues.shadHeightLine - 1;
            shapeValues.mainWidthCX = shapeValues.mainBoxPos.x + shapeValues.MainWidth;
            shapeValues.mainWidthCY = shapeValues.mainBoxPos.y + shapeValues.shapeMainHeight;
            shapeValues.ShadAAY = shapeValues.mainWidthCY + 1;
        }
    }

    defineBorders(boxes) {

        for (var i = 0; i < boxes.length; i++) {
            for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
                // for (const shape of this.allShapes) {

                // shadow
                if (boxes[i].width == (shapeValues.mainBoxPos.x + shapeValues.shadAshift) && boxes[i].height == (shapeValues.ShadAAY + shapeValues.shadAheight + 1)) {
                    shapeValues.shadow.A = boxes[i].A;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) && boxes[i].height == (shapeValues.ShadAAY + shapeValues.shadAheight)) {
                    shapeValues.shadow.B = boxes[i].D;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) && boxes[i].height == (shapeValues.mainBoxPos.y + shapeValues.shadAheight)) {
                    shapeValues.shadow.C = boxes[i].D;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift + shapeValues.superShadowShiftX) && boxes[i].height == shapeValues.mainWidthCY + shapeValues.superShadowShiftY) {
                    shapeValues.shadow.D = boxes[i].B;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift + shapeValues.superShadowShiftX) && boxes[i].height == shapeValues.mainWidthCY + shapeValues.superShadowShiftY + shapeValues.superShadowHeightMax) {
                    shapeValues.shadow.E = boxes[i].C;
                }


                // down
                if (boxes[i].width == shapeValues.mainBoxPos.x && boxes[i].height == shapeValues.ShadAAY) {
                    shapeValues.down.A = boxes[i].A;
                }

                if (boxes[i].width == shapeValues.mainWidthCX && boxes[i].height == shapeValues.ShadAAY) {
                    shapeValues.down.B = boxes[i].B;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + shapeValues.shadAshift) && boxes[i].height == (shapeValues.ShadAAY + shapeValues.shadAheight)) {
                    shapeValues.down.C = boxes[i].C;
                }

                if (boxes[i].width == (shapeValues.mainBoxPos.x + shapeValues.shadAshift) && boxes[i].height == (shapeValues.ShadAAY + shapeValues.shadAheight)) {
                    shapeValues.down.D = boxes[i].D;
                }


                // right
                if (boxes[i].width == (shapeValues.mainWidthCX + 1) && boxes[i].height == shapeValues.mainBoxPos.y) {
                    shapeValues.right.A = boxes[i].A;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) && boxes[i].height == shapeValues.mainBoxPos.y + shapeValues.shadAheight) {
                    shapeValues.right.B = boxes[i].D;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1 + shapeValues.shadAshift) && boxes[i].height == (shapeValues.ShadAAY + shapeValues.shadAheight)) {
                    shapeValues.right.C = boxes[i].D;
                }

                if (boxes[i].width == (shapeValues.mainWidthCX + 1) && boxes[i].height == shapeValues.mainWidthCY) {
                    shapeValues.right.D = boxes[i].D;
                }

                // front
                if (boxes[i].width == shapeValues.mainBoxPos.x && boxes[i].height == shapeValues.mainBoxPos.y) {
                    shapeValues.front.A = boxes[i].A;
                }

                if (boxes[i].width == shapeValues.mainWidthCX && boxes[i].height == shapeValues.mainBoxPos.y) {
                    shapeValues.front.B = boxes[i].B;
                }

                if (boxes[i].width == shapeValues.mainWidthCX && boxes[i].height == shapeValues.mainWidthCY) {
                    shapeValues.front.C = boxes[i].C;
                }

                if (boxes[i].width == shapeValues.mainBoxPos.x && boxes[i].height == shapeValues.mainWidthCY) {
                    shapeValues.front.D = boxes[i].D;
                }
            }
        }

        // for (const shape of this.allShapes) {
        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {

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


    debugShowShape() {

        var colory = "orange";
        const svgNode = document.getElementById('svgNode');

        // for (const shape of this.allShapes) {
        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {

            var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shapsn.setAttributeNS(null, 'points', shapeValues.front.pointList);
            shapsn.setAttributeNS(null, 'fill', "none");
            shapsn.setAttributeNS(null, "stroke-width", 1);
            shapsn.setAttributeNS(null, 'stroke', colory);

            // shapsn.setAttributeNS(null, 'stroke', "none");
            // shapsn.setAttributeNS(null, 'fill', "#c2c2c281");

            svgNode.appendChild(shapsn);

            var shadnA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shadnA.setAttributeNS(null, 'points', shapeValues.down.pointList);
            shadnA.setAttributeNS(null, 'fill', "none");
            shadnA.setAttributeNS(null, 'stroke', colory);
            shadnA.setAttributeNS(null, "stroke-width", 1);

            svgNode.appendChild(shadnA);

            var shadnB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            shadnB.setAttributeNS(null, 'points', shapeValues.right.pointList);
            shadnB.setAttributeNS(null, 'fill', "none");
            shadnB.setAttributeNS(null, 'stroke', colory);
            shadnB.setAttributeNS(null, "stroke-width", 1);

            svgNode.appendChild(shadnB);

            var superShadow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            superShadow.setAttributeNS(null, 'points', shapeValues.shadow.pointList);
            superShadow.setAttributeNS(null, 'fill', "none");
            superShadow.setAttributeNS(null, 'stroke', colory);
            superShadow.setAttributeNS(null, "stroke-width", 1);

            svgNode.appendChild(superShadow);
        }

    }

    fillShape() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(shapeValues)) {
                // for (const [key, value] of Object.entries(this.shapes.allShapes)) {

                if (["front", "down", "right", "shadow"].includes(key)) {
                    console.log(value.pointList);
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