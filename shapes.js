class Shapes {
    // constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight, blueprint) {
    constructor(blueprint) {

        // remove A, B, C, D in the shapes
        // maybe remove the box == things in grid and use coords
        // this.colory = "#00a7d1";
        // this.canvasWidth = canvasWidth; // 1600;
        // this.canvasHeight = canvasHeight; // 900;

        // this.stripeHeight = stripeHeight;
        // this.marginRelative = marginRelative;
        // this.boxSize = shortSide / resolutionBoxCount;


        this.allShapes = blueprint.data;
        // console.log(this.allShapes);
        this.boxSize = blueprint.boxSize;
        this.stripeHeight = blueprint.stripeHeight;

        this.calcCoords();

        this.sortForLoop();
        this.treatIntersections();
        this.reindex();

        // console.log(this.loopMaterial);
    }


    // define the borders by turning boxes and boxcounts in coords
    calcCoords() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            if (shapeId != "shapeBackground") {

                // console.log(shapeId);
                // console.log(shapeValues);
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

                // console.log(shapeValues.shadow.A);
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

                // console.log(key)

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


    treatIntersections() {

        var removeCandidates = {};  // store for elements to be deleted
        // this.loopMaterialMerged = {}

        for (const [shapeOrderA, shapeValuesA] of Object.entries(this.loopMaterial)) {
            for (const [shapeOrderB, shapeValuesB] of Object.entries(this.loopMaterial)) {
                if (shapeOrderA == shapeOrderB || shapeValuesA.side != shapeValuesB.side || shapeOrderA in removeCandidates) {
                    continue;
                }
                // console.log(shapeValuesB.side);
                // console.log(shapeValuesA);

                var mergedPolygon = polygonClipping.union([shapeValuesA.pointList], [shapeValuesB.pointList]);
                if (mergedPolygon.length == 1) {
                    // console.log(shapeValuesA.side + shapeValuesB.side);
                    // console.log(mergedPolygon[0][0]);
                    this.loopMaterial[shapeOrderA].pointList = mergedPolygon[0][0];
                    // console.log(this.loopMaterial[shapeOrderA].pointList);
                    removeCandidates[shapeOrderB] = shapeValuesB
                    delete this.loopMaterial[shapeOrderB];

                }
            }
        }

        // console.log(removeCandidates)
        // console.log(this.loopMaterial)
    }

    // reorganize after removing entries 
    reindex() {
        // console.log(this.loopMaterial);
        // console.log(Object.keys(this.loopMaterial).length);

        var startPosition = 1;

        var newLoopMaterial = {}
        var newIndex = startPosition;
        for (var i = startPosition; i <= (Object.keys(this.loopMaterial).length + startPosition); i++) {

            if (this.loopMaterial[i] == undefined) {
                // console.log("removed entry")
                continue;
            } else {
                newLoopMaterial[newIndex] = this.loopMaterial[i];
                newIndex += 1;
            }
        }

        this.loopMaterial = newLoopMaterial;
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

            // console.log(shapeOrder);
            // console.log(shapeValues);
            // console.log(shapeValues.pointList);

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