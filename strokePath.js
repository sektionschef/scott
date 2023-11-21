class strokePath {
    constructor(data) {
        this.lineSegment = 4;  // where to place the control points
        this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        this.posStdCon = 1; // 0.4;  // control points
        this.posStdShiftX = 0.5; // add variance to x so no total overlap
        this.minLength = 0; // 5;  // a line should have a length of at least
        this.strokeWidth = 0.5;
        this.path = false;

        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.allShapes = data.allShapes;
        this.loop = data.loop;

        // dummies
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
        this.strokeColorStart = this.strokeColor;
        this.strokeColorEnd = this.strokeColor;
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

        var shiftX = gaussianRandAdj(0, this.posStdShiftX);
        // start and end distortion
        this.start.x = this.start.x + gaussianRandAdj(0, this.posStd) + shiftX;
        this.end.x = this.end.x + gaussianRandAdj(0, this.posStd) + shiftX;
        this.start.y = this.start.y + gaussianRandAdj(0, this.posStd);
        this.end.y = this.end.y + gaussianRandAdj(0, this.posStd);

        for (const [key, value] of Object.entries(this.allShapes)) {

            if (pointInPolygon(value.pointList, [this.start.x, this.start.y]) || pointInPolygon(value.pointList, [this.center.x, this.center.y]) || pointInPolygon(value.pointList, [this.end.x, this.end.y])) {

            } else {
                continue;
            }

            this.shapeCandidate = value.pointList;

            // if there is an intersection point with any shape, closest selected
            // get the sides
            for (var i = 0; i < this.shapeCandidate.length; i++) {
                if (i != (this.shapeCandidate.length - 1)) {
                    this.shapeA = { x: this.shapeCandidate[i][0], y: this.shapeCandidate[i][1] };
                    this.shapeB = { x: this.shapeCandidate[i + 1][0], y: this.shapeCandidate[i + 1][1] }
                } else {
                    // closing the loop
                    this.shapeA = { x: this.shapeCandidate[0][0], y: this.shapeCandidate[0][1] };
                    this.shapeB = { x: this.shapeCandidate[i][0], y: this.shapeCandidate[i][1] };
                }

                this.interPointCandidate = intersect(this.shapeA.x, this.shapeA.y, this.shapeB.x, this.shapeB.y, this.start.x, this.start.y, this.end.x, this.end.y);
                if (this.interPointCandidate === undefined) {
                    continue;
                }

                // if the intersection point lies between the points of the line and the shape's side.
                var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
                this.splitSwitchCandidate = (
                    shapeLineLength > vectorLength(vectorSub(this.shapeA, this.interPointCandidate))
                ) && (
                        shapeLineLength > vectorLength(vectorSub(this.interPointCandidate, this.shapeB))
                    ) && (
                        this.vectorMagnitude > vectorLength(vectorSub(this.start, this.interPointCandidate))
                    ) && (
                        this.vectorMagnitude > vectorLength(vectorSub(this.interPointCandidate, this.end))
                    );

                // SIMPLIFY - if split 
                if (this.splitSwitchCandidate) {
                    this.splitSwitch = true;

                    // select the shortest distance to center, here the intersectionPoint and the shape is selected
                    if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(this.interPoint, this.center)))) {
                        this.interPoint = this.interPointCandidate;
                    };

                    this.midPointStartInt = getMiddlePpoint(this.start, this.interPoint);
                    this.midPointEndInt = getMiddlePpoint(this.interPoint, this.end);

                    if (pointInPolygon(value.pointList, [this.midPointStartInt.x, this.midPointStartInt.y])) {
                        // if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
                        this.startInside = key;  // is this part in the polygon
                        this.strokeColorStart = value.colorAction;
                        this.shapeLoopStart = value.shapeLoop;
                    }
                    if (pointInPolygon(value.pointList, [this.midPointEndInt.x, this.midPointEndInt.y])) {
                        // } else if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
                        this.endInside = key;  // is this part in the polygon
                        this.strokeColorEnd = value.colorAction;
                        this.shapeLoopEnd = value.shapeLoop;
                    }
                } else {

                    // CHECK IF CENTER IN SHAPE
                    if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
                        // this.inside = key;
                        this.fullInside = key;
                        this.strokeColor = value.colorAction;
                        this.shapeLoop = value.shapeLoop;
                    }
                }
            }
        }

        this.createControlPoints();

    }

    createControlPoints() {
        if (this.splitSwitch) {
            // console.log("intersecting!")

            // form start to interPoint
            this.startInterPoint = vectorSub(this.start, this.interPoint);  // vector of diff

            this.controlStartA = {
                x: this.start.x + this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.start.y + this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
            }
            this.controlStartB = {
                x: this.interPoint.x - this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.interPoint.y - this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon)
            }

            // form interPoint end
            this.interPointEnd = vectorSub(this.interPoint, this.end);  // vector of diff

            this.controlEndA = {
                x: this.interPoint.x + this.interPointEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.interPoint.y + this.interPointEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
            }
            this.controlEndB = {
                x: this.end.x - this.interPointEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.end.y - this.interPointEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon)
            }

        } else {
            // console.log("no intersection with shape -> one continuous path.")
            this.startEnd = vectorSub(this.start, this.end);  // vector of diff

            this.controlA = {
                x: this.start.x + this.startEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.start.y + this.startEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
            }
            this.controlB = {
                x: this.end.x - this.startEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStdCon),
                y: this.end.y - this.startEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStdCon)
            }
        }
    }

    showPath() {

        if (this.splitSwitch) {
            this.showSplitPath();
        } else {
            this.showContinuousPath();
        }
        // this.showDebug()
    }

    showContinuousPath() {

        // for inside or for the first loop
        if (
            // strokes in white area
            (this.fullInside !== "" || this.loop == 0) &&
            (this.loop < this.shapeLoop)

            // no strokes in whitespace
            // (this.fullInside !== "" && this.loop < this.shapeLoop)
        ) {

            if (this.path) {
                this.newPath = this.drawPath(this.start, this.controlA, this.controlB, this.end);
            } else {
                this.newPath = this.drawLine(this.start, this.end);
            }

            this.newPath.setAttributeNS(null, "stroke", this.strokeColor);
            this.newPath.setAttributeNS(null, "stroke-width", this.strokeWidth);
            this.newPath.setAttributeNS(null, "opacity", 1);
            this.newPath.setAttributeNS(null, "fill", "none");

            const svgNode = document.getElementById('svgNode');
            svgNode.appendChild(this.newPath);
        }
    }

    showSplitPath() {

        const svgNode = document.getElementById('svgNode');

        if (
            (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            (this.loop == 0 || this.startInside !== "") &&
            (this.loop < this.shapeLoop)

            // no strokes in whitespace
            // (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            // (this.startInside !== "") &&
            // (this.loop < this.shapeLoop)
        ) {

            if (this.path) {
                this.newPathStart = this.drawPath(this.start, this.controlStartA, this.controlStartB, this.interPoint);
            } else {
                this.newPathStart = this.drawLine(this.start, this.interPoint);
            }

            // this.newPathStart.setAttributeNS(null, "stroke", "blue");
            this.newPathStart.setAttributeNS(null, "stroke", this.strokeColorStart);
            this.newPathStart.setAttributeNS(null, "stroke-width", this.strokeWidth);
            this.newPathStart.setAttributeNS(null, "opacity", 1);
            this.newPathStart.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathStart);
        }

        if (
            vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            (this.endInside != "" || this.loop == 0) &&
            (this.loop < this.shapeLoop)

            // no strokes in whitespace
            // vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            // (this.endInside != "") &&
            // (this.loop < this.shapeLoop)
        ) {
            if (this.path) {
                this.newPathEnd = this.drawPath(this.interPoint, this.controlEndA, this.controlEndB, this.end);
            } else {
                this.newPathEnd = this.drawLine(this.interPoint, this.end);
            }

            // this.newPathEnd.setAttributeNS(null, "stroke", "pink");
            this.newPathEnd.setAttributeNS(null, "stroke", this.strokeColorEnd);
            this.newPathEnd.setAttributeNS(null, "stroke-width", this.strokeWidth);
            this.newPathEnd.setAttributeNS(null, "opacity", 1);
            this.newPathEnd.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathEnd);
        }
    }

    drawPath(start, cA, cB, end) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', "path");
        path.setAttributeNS(null, "id", "pathIdD");
        path.setAttributeNS(null, "filter", "url(#filterPencil)");
        path.setAttributeNS(null, "d", `M 
        ${start.x} 
        ${start.y} 
        C 
        ${cA.x} 
        ${cA.y}, 
        ${cB.x} 
        ${cB.y}, 
        ${end.x} 
        ${end.y}
        `);

        return path
    }

    drawLine(start, end) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        line.setAttributeNS(null, "id", "lineIdD");
        line.setAttributeNS(null, "filter", "url(#filterPencil)");
        line.setAttributeNS(null, "x1", start.x);
        line.setAttributeNS(null, "y1", start.y);
        line.setAttributeNS(null, "x2", end.x);
        line.setAttributeNS(null, "y2", end.y);

        return line;
    }

    showDebug() {

        // DEBUG
        this.debugCenter = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugCenter.setAttributeNS(null, "id", "center");
        this.debugCenter.setAttributeNS(null, "cx", this.center.x);
        this.debugCenter.setAttributeNS(null, "cy", this.center.y);
        this.debugCenter.setAttributeNS(null, "r", "1");
        this.debugCenter.setAttributeNS(null, "stroke", "none");
        // this.debugCenter.setAttributeNS(null, "fill", "none");
        this.debugCenter.setAttributeNS(null, "fill", "#ff00ea");
        this.debugCenter.setAttributeNS(null, "stroke-width", 0.1);
        this.debugCenter.setAttributeNS(null, "opacity", 1);

        this.debugStart = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugStart.setAttributeNS(null, "id", "start");
        this.debugStart.setAttributeNS(null, "cx", this.start.x);
        this.debugStart.setAttributeNS(null, "cy", this.start.y);
        this.debugStart.setAttributeNS(null, "r", "1");
        this.debugStart.setAttributeNS(null, "fill", "blue");
        this.debugStart.setAttributeNS(null, "stroke-width", 0.1);
        this.debugStart.setAttributeNS(null, "opacity", 1);
        this.debugStart.setAttributeNS(null, "stroke", "none");

        this.debugEnd = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugEnd.setAttributeNS(null, "id", "end");
        this.debugEnd.setAttributeNS(null, "cx", this.end.x);
        this.debugEnd.setAttributeNS(null, "cy", this.end.y);
        this.debugEnd.setAttributeNS(null, "r", "1");
        this.debugEnd.setAttributeNS(null, "stroke", "none");
        this.debugEnd.setAttributeNS(null, "stroke-width", 0.1);
        this.debugEnd.setAttributeNS(null, "opacity", 1);
        this.debugEnd.setAttributeNS(null, "fill", "red");

        this.debugControlA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlA.setAttributeNS(null, "id", "controlA");
        this.debugControlA.setAttributeNS(null, "cx", this.controlA.x);
        this.debugControlA.setAttributeNS(null, "cy", this.controlA.y);
        this.debugControlA.setAttributeNS(null, "r", "0.5");
        this.debugControlA.setAttributeNS(null, "stroke", "pink");
        this.debugControlA.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlA.setAttributeNS(null, "opacity", 1);
        this.debugControlA.setAttributeNS(null, "fill", "none");

        this.debugControlB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlB.setAttributeNS(null, "id", "controlB");
        this.debugControlB.setAttributeNS(null, "cx", this.controlB.x);
        this.debugControlB.setAttributeNS(null, "cy", this.controlB.y);
        this.debugControlB.setAttributeNS(null, "r", "0.5");
        this.debugControlB.setAttributeNS(null, "stroke", "pink");
        this.debugControlB.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlB.setAttributeNS(null, "opacity", 1);
        this.debugControlB.setAttributeNS(null, "fill", "none");

        this.debugInterPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugInterPoint.setAttributeNS(null, "id", "intersect");
        this.debugInterPoint.setAttributeNS(null, "cx", this.interPoint.x);
        this.debugInterPoint.setAttributeNS(null, "cy", this.interPoint.y);
        this.debugInterPoint.setAttributeNS(null, "r", "1");
        this.debugInterPoint.setAttributeNS(null, "stroke", "none");
        this.debugInterPoint.setAttributeNS(null, "fill", "orange");
        // this.debugInterPoint.setAttributeNS(null, "stroke-width", 0.1);
        this.debugInterPoint.setAttributeNS(null, "opacity", 1);

        this.debugControlStartA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlStartA.setAttributeNS(null, "id", "controlA");
        this.debugControlStartA.setAttributeNS(null, "cx", this.controlStartA.x);
        this.debugControlStartA.setAttributeNS(null, "cy", this.controlStartA.y);
        this.debugControlStartA.setAttributeNS(null, "r", "0.5");
        this.debugControlStartA.setAttributeNS(null, "stroke", "pink");
        this.debugControlStartA.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlStartA.setAttributeNS(null, "opacity", 1);
        this.debugControlStartA.setAttributeNS(null, "fill", "none");

        this.debugControlStartB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlStartB.setAttributeNS(null, "id", "controlB");
        this.debugControlStartB.setAttributeNS(null, "cx", this.controlStartB.x);
        this.debugControlStartB.setAttributeNS(null, "cy", this.controlStartB.y);
        this.debugControlStartB.setAttributeNS(null, "r", "0.5");
        this.debugControlStartB.setAttributeNS(null, "stroke", "pink");
        this.debugControlStartB.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlStartB.setAttributeNS(null, "opacity", 1);
        this.debugControlStartB.setAttributeNS(null, "fill", "none");

        this.debugControlEndA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlEndA.setAttributeNS(null, "id", "controlA");
        this.debugControlEndA.setAttributeNS(null, "cx", this.controlEndA.x);
        this.debugControlEndA.setAttributeNS(null, "cy", this.controlEndA.y);
        this.debugControlEndA.setAttributeNS(null, "r", "0.5");
        this.debugControlEndA.setAttributeNS(null, "stroke", "pink");
        this.debugControlEndA.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlEndA.setAttributeNS(null, "opacity", 1);
        this.debugControlEndA.setAttributeNS(null, "fill", "none");

        this.debugControlEndB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlEndB.setAttributeNS(null, "id", "controlB");
        this.debugControlEndB.setAttributeNS(null, "cx", this.controlEndB.x);
        this.debugControlEndB.setAttributeNS(null, "cy", this.controlEndB.y);
        this.debugControlEndB.setAttributeNS(null, "r", "0.5");
        this.debugControlEndB.setAttributeNS(null, "stroke", "pink");
        this.debugControlEndB.setAttributeNS(null, "stroke-width", 0.1);
        this.debugControlEndB.setAttributeNS(null, "opacity", 1);
        this.debugControlEndB.setAttributeNS(null, "fill", "none");

        this.debugUp = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugUp.setAttributeNS(null, "id", "up");
        this.debugUp.setAttributeNS(null, "cx", this.up.x);
        this.debugUp.setAttributeNS(null, "cy", this.up.y);
        this.debugUp.setAttributeNS(null, "r", "0.5");
        this.debugUp.setAttributeNS(null, "stroke", "#ff0000ff");
        this.debugUp.setAttributeNS(null, "stroke-width", 0.1);
        this.debugUp.setAttributeNS(null, "opacity", 1);
        this.debugUp.setAttributeNS(null, "fill", "none");

        this.debugDown = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugDown.setAttributeNS(null, "id", "up");
        this.debugDown.setAttributeNS(null, "cx", this.down.x);
        this.debugDown.setAttributeNS(null, "cy", this.down.y);
        this.debugDown.setAttributeNS(null, "r", "0.5");
        this.debugDown.setAttributeNS(null, "stroke", "#ff0000ff");
        this.debugDown.setAttributeNS(null, "stroke-width", 0.1);
        this.debugDown.setAttributeNS(null, "opacity", 1);
        this.debugDown.setAttributeNS(null, "fill", "none");

        this.debugmidPointEndInt = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugmidPointEndInt.setAttributeNS(null, "id", "up");
        this.debugmidPointEndInt.setAttributeNS(null, "cx", this.midPointEndInt.x);
        this.debugmidPointEndInt.setAttributeNS(null, "cy", this.midPointEndInt.y);
        this.debugmidPointEndInt.setAttributeNS(null, "r", "1");
        // this.debugmidPointEndInt.setAttributeNS(null, "stroke", "#ff0000ff");
        this.debugmidPointEndInt.setAttributeNS(null, "stroke-width", 0.1);
        this.debugmidPointEndInt.setAttributeNS(null, "opacity", 1);
        this.debugmidPointEndInt.setAttributeNS(null, "fill", "#ff0000ff");

        this.debugmidPointStartInt = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugmidPointStartInt.setAttributeNS(null, "id", "up");
        this.debugmidPointStartInt.setAttributeNS(null, "cx", this.midPointStartInt.x);
        this.debugmidPointStartInt.setAttributeNS(null, "cy", this.midPointStartInt.y);
        this.debugmidPointStartInt.setAttributeNS(null, "r", "1");
        // this.debugmidPointStartInt.setAttributeNS(null, "stroke", "#5eff00ff");
        this.debugmidPointStartInt.setAttributeNS(null, "stroke-width", 0.1);
        this.debugmidPointStartInt.setAttributeNS(null, "opacity", 1);
        this.debugmidPointStartInt.setAttributeNS(null, "fill", "#5eff00ff");


        const svgNode = document.getElementById('svgNode');
        if (this.splitSwitch) {
            // svgNode.appendChild(this.debugCenter);
            // svgNode.appendChild(this.debugStart);
            // svgNode.appendChild(this.debugEnd);
            // svgNode.appendChild(this.debugInterPoint);
            // svgNode.appendChild(this.debugControlStartA);
            // svgNode.appendChild(this.debugControlStartB);
            // svgNode.appendChild(this.debugControlEndA);
            // svgNode.appendChild(this.debugControlEndB);
            // svgNode.appendChild(this.debugUp);
            // svgNode.appendChild(this.debugDown);
            svgNode.appendChild(this.debugmidPointStartInt);
            svgNode.appendChild(this.debugmidPointEndInt);
        } else {
            // svgNode.appendChild(this.debugCenter);
            // svgNode.appendChild(this.debugStart);
            // svgNode.appendChild(this.debugEnd);
            // svgNode.appendChild(this.debugControlA);
            // svgNode.appendChild(this.debugControlB);
        }
    }
}