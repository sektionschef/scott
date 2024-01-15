class strokeSystem {  // ARCHIVE
    constructor(data) {
        // this.lineSegment = 4;  // where to place the control points
        this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        this.posStdCon = 1; // 0.4;  // control points
        this.posStdShiftX = 0; // add variance to x so no total overlap
        this.minLength = 0; // 5;  // a line should have a length of at least
        this.filledPath = false;

        this.strokeWidth = data.strokeWidth;
        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.strokeColorStart = this.strokeColor;
        this.strokeColorEnd = this.strokeColor;
        this.allShapes = data.allShapes;
        this.loop = data.loop;
        this.group = data.group;

        // dummies
        this.shapeSide = "";
        this.up = { x: 0, y: 0 };
        this.down = { x: 0, y: 0 };
        this.shape = [];
        this.midPointEndInt = { x: 0, y: 0 };
        this.midPointStartInt = { x: 0, y: 0 };
        this.interPoint = { x: 0, y: 0 };
        this.splitSwitch = false;
        this.controlA = { x: 0, y: 0 };
        this.controlB = { x: 0, y: 0 };
        this.controlStartA = { x: 0, y: 0 };
        this.controlStartB = { x: 0, y: 0 };
        this.controlEndA = { x: 0, y: 0 };
        this.controlEndB = { x: 0, y: 0 };
        this.fullInside = "";
        this.startInside = "";
        this.endInside = "";
        this.shapeLoop = 1;  // limit for whitespace, 1 = general run

        // X = Cx + (r * cosine(angle))
        // Y = Cy + (r * sine(angle))
        this.start = {
            x: this.center.x + (this.vectorMagnitude / 2 * Math.cos(this.angleRadians)),
            y: this.center.y + (this.vectorMagnitude / 2 * Math.sin(this.angleRadians))
        }
        this.end = {
            x: this.center.x + (this.vectorMagnitude / 2 * Math.cos(this.angleRadians - Math.PI)),
            y: this.center.y + (this.vectorMagnitude / 2 * Math.sin(this.angleRadians - Math.PI))
        }

        this.interactWithShapes();
    }


    interactWithShapes() {
        for (const shape of this.allShapes) {
            for (const [key, value] of Object.entries(shape)) {

                if (key == "front") {

                    if (this.divideFullVsSplit(key, value) == false) {
                        continue
                    }

                } else if ((key == "down" || key == "right") && this.shapeSide != "front") {

                    if (this.divideFullVsSplit(key, value) == false) {
                        continue
                    }

                } else if (key == "shadow" && this.shapeSide == "") {

                    if (this.divideFullVsSplit(key, value) == false) {
                        continue
                    }

                } else {
                    this.shapeSide = "";
                }
            }
        }
    }

    divideFullVsSplit(key, value) {
        if (this.check3PointsIn(value.pointList)) {
            this.shapeSide = key;
            this.fullInside = key;
            this.splitSwitch = false;  // reset
            this.strokeColor = value.colorAction;
            this.shapeLoop = value.shapeLoop;
            return true;
        } else if (this.check1PointIn(value.pointList)) {
            this.shapeSide = key;
            this.intersectSingleShape(key, value);
            return true;
        } else {
            return false;
        }
    }

    // at least one point of start, center, end in one shape?
    check1PointIn(pointList) {
        return (
            pointInPolygon(pointList, [this.start.x, this.start.y]) ||
            pointInPolygon(pointList, [this.center.x, this.center.y]) ||
            pointInPolygon(pointList, [this.end.x, this.end.y])
        )
    }

    // start, center, end are all in one shape?
    check3PointsIn(pointList) {
        return (
            pointInPolygon(pointList, [this.start.x, this.start.y]) &&
            pointInPolygon(pointList, [this.center.x, this.center.y]) &&
            pointInPolygon(pointList, [this.end.x, this.end.y])
        )
    }

    intersectSingleShape(key, value) {

        // if there is an intersection point with any shape, closest selected
        // get the sides
        for (var i = 0; i < value.pointList.length; i++) {

            // get all sides
            if (i != (value.pointList.length - 1)) {
                this.shapeA = { x: value.pointList[i][0], y: value.pointList[i][1] };
                this.shapeB = { x: value.pointList[i + 1][0], y: value.pointList[i + 1][1] }
            } else {
                // closing the loop
                this.shapeA = { x: value.pointList[0][0], y: value.pointList[0][1] };
                this.shapeB = { x: value.pointList[i][0], y: value.pointList[i][1] };
            }

            // find intersection point for the loop
            this.interPointCandidate = intersect(this.shapeA.x, this.shapeA.y, this.shapeB.x, this.shapeB.y, this.start.x, this.start.y, this.end.x, this.end.y);
            if (this.interPointCandidate === undefined) {
                continue;
            }

            // if the intersection point lies between the points of the line and the shape's side.
            var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
            this.checkIntersectionShapePath = (
                shapeLineLength > vectorLength(vectorSub(this.shapeA, this.interPointCandidate))
            ) && (
                    shapeLineLength > vectorLength(vectorSub(this.interPointCandidate, this.shapeB))
                ) && (
                    this.vectorMagnitude > vectorLength(vectorSub(this.start, this.interPointCandidate))
                ) && (
                    this.vectorMagnitude > vectorLength(vectorSub(this.interPointCandidate, this.end))
                );

            // get the intersection point with the shortest distance to center, here the intersectionPoint and the shape is selected
            if (this.checkIntersectionShapePath) {
                if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(this.interPoint, this.center)))) {
                    this.interPoint = this.interPointCandidate;
                };
            }
        }

        this.definePartInside(key, value);
    }


    definePartInside(key, value) {
        // which part is in, which one is out?
        this.midPointStartInt = getMiddlePpoint(this.start, this.interPoint);
        this.midPointEndInt = getMiddlePpoint(this.interPoint, this.end);

        if (pointInPolygon(value.pointList, [this.midPointStartInt.x, this.midPointStartInt.y])) {
            // if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
            this.splitSwitch = true;
            this.startInside = key;  // is this part in the polygon
            this.strokeColorStart = value.colorAction;
            this.shapeLoopStart = value.shapeLoop;
        }
        if (pointInPolygon(value.pointList, [this.midPointEndInt.x, this.midPointEndInt.y])) {
            // } else if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
            this.splitSwitch = true;
            this.endInside = key;  // is this part in the polygon
            this.strokeColorEnd = value.colorAction;
            this.shapeLoopEnd = value.shapeLoop;
        }
    }


    showPath() {

        if (this.splitSwitch) {
            this.showSplitPath();
        } else {
            this.showContinuousPath();
        }
    }

    showContinuousPath() {


        // for inside or for the first loop
        if (
            // strokes in white area
            // (this.fullInside !== "" || this.loop == 0) &&
            // (this.loop < this.shapeLoop)

            // no strokes in whitespace
            (this.fullInside !== "" && this.loop < this.shapeLoop)
        ) {

            if (this.filledPath) {
                // this.newPath = this.drawPath(this.start, this.controlA, this.controlB, this.end);
                // this.newPath = this.drawPath(this.start, this.controlA, this.controlB, this.end);


                new filledPath({
                    start: this.start,
                    end: this.end,
                    angleRadians: this.angleRadians,
                    strokeWidth: this.strokeWidth,
                    group: this.group,
                });

            } else {
                this.newPath = this.drawDebugLine(this.start, this.end, this.strokeColor, 1);
            }


        }
    }

    showSplitPath() {

        if (
            // (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            // (this.loop == 0 || this.startInside !== "") &&
            // (this.loop < this.shapeLoop)

            // no strokes in whitespace
            (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            (this.startInside !== "") &&
            (this.loop < this.shapeLoopStart)
        ) {

            if (this.filledPath) {
                // this.newPathStart = this.drawPath(this.start, this.controlStartA, this.controlStartB, this.interPoint);

                new filledPath({
                    start: this.start,
                    end: this.interPoint,
                    angleRadians: this.angleRadians,
                    strokeWidth: this.strokeWidth,
                    group: this.group,
                });
            } else {
                // this.newPathStart = 
                this.drawDebugLine(this.start, this.interPoint, this.strokeColorStart, 1);
            }
        } else if (
            (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            (this.startInside == "") &&
            (this.loop < this.shapeLoop) // SHOULD BE THE LOOP OF THE SHAPE
        ) {

            for (const shape of this.allShapes) {
                for (const [key, value] of Object.entries(shape)) {
                    if (["front", "down", "right", "shadow"].includes(key)) {

                        if (pointInPolygon(value.pointList, [this.start.x, this.start.y]) &&
                            pointInPolygon(value.pointList, [this.midPointStartInt.x, this.midPointStartInt.y]) &&
                            pointInPolygon(value.pointList, [this.interPoint.x, this.interPoint.y])
                        ) {
                            this.drawDebugLine(this.start, this.interPoint, value.colorAction, 1);
                        }
                    }
                }
            }
        }

        if (
            // vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            // (this.endInside != "" || this.loop == 0) &&
            // (this.loop < this.shapeLoop)

            // no strokes in whitespace
            vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            (this.endInside != "") &&
            (this.loop < this.shapeLoopEnd)
        ) {
            if (this.filledPath) {
                // this.newPathEnd = this.drawPath(this.interPoint, this.controlEndA, this.controlEndB, this.end);

                new filledPath({
                    start: this.interPoint,
                    end: this.end,
                    angleRadians: this.angleRadians,
                    strokeWidth: this.strokeWidth,
                    group: this.group,
                });
            } else {
                // this.newPathEnd = 
                this.drawDebugLine(this.interPoint, this.end, this.strokeColorEnd, 1);
            }
        } else if (
            vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            (this.endInside == "") &&
            (this.loop < this.shapeLoop) // SHOULD BE THE LOOP OF THE SHAPE
        ) {
            for (const shape of this.allShapes) {
                for (const [key, value] of Object.entries(shape)) {
                    if (["front", "down", "right", "shadow"].includes(key)) {

                        if (pointInPolygon(value.pointList, [this.end.x, this.end.y]) &&
                            pointInPolygon(value.pointList, [this.midPointEndInt.x, this.midPointEndInt.y]) &&
                            pointInPolygon(value.pointList, [this.interPoint.x, this.interPoint.y])
                        ) {
                            // console.log("oida");
                            this.drawDebugLine(this.interPoint, this.end, value.colorAction, 1);
                        }
                    }
                }
            }
        }
    }

    drawDebugLine(start, end, strokeColor, strokeWidth) {
        // const svgNode = document.getElementById('svgNode');
        // const groupA = document.getElementById('groupA');
        const group = document.getElementById(this.group);

        var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        line.setAttributeNS(null, "id", "lineIdD");
        line.setAttributeNS(null, "filter", "url(#filterPencil)");
        // line.setAttributeNS(null, "filter", "url(#fueta)");
        line.setAttributeNS(null, "x1", start.x);
        line.setAttributeNS(null, "y1", start.y);
        line.setAttributeNS(null, "x2", end.x);
        line.setAttributeNS(null, "y2", end.y);

        line.setAttributeNS(null, "stroke", strokeColor);
        line.setAttributeNS(null, "stroke-width", strokeWidth);
        line.setAttributeNS(null, "opacity", 1);
        line.setAttributeNS(null, "fill", "none");

        // svgNode.appendChild(this.newPath);
        group.appendChild(line);

        // return line;
    }

}
