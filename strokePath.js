class strokePath {
    constructor(data) {
        this.lineSegment = 4;  // where to place the control points
        this.posStd = 0;// 1  // misplacmente standard deviation
        this.minLength = 0; // 5;  // a line should have a length of at least

        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        // this.strokeColor = data.strokeColor;
        this.strokeColor = "black";
        this.strokeColorAction = "red";
        this.allShapes = data.allShapes;
        this.loop = data.loop;

        // dummies
        this.up = { x: 0, y: 0 };
        this.down = { x: 0, y: 0 };
        this.shape = [];



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

        // start and end distortion
        this.start.x = this.start.x + gaussianRandAdj(0, this.posStd);
        this.end.x = this.end.x + gaussianRandAdj(0, this.posStd);
        this.start.y = this.start.y + gaussianRandAdj(0, this.posStd);
        this.end.y = this.end.y + gaussianRandAdj(0, this.posStd);

        this.interPoint = { x: 0, y: 0 };
        this.splitSwitch = false;

        for (const [key, value] of Object.entries(this.allShapes)) {

            this.shapeCandidate = value.pointList;
            // if there is an intersection point with any shape, closest selected
            for (var i = 0; i < this.shapeCandidate.length; i++) {
                if (i != (this.shapeCandidate.length - 1)) {
                    this.shapeA = { x: this.shapeCandidate[i][0], y: this.shapeCandidate[i][1] };
                    this.shapeB = { x: this.shapeCandidate[i + 1][0], y: this.shapeCandidate[i + 1][1] }
                } else {
                    // closing the loop
                    this.shapeA = { x: this.shapeCandidate[0][0], y: this.shapeCandidate[0][1] };
                    this.shapeB = { x: this.shapeCandidate[i][0], y: this.shapeCandidate[i][1] };
                }

                // this.interPointCandidate = getIntersectionPoint(this.shapeA, this.shapeB, this.start, this.end);
                this.interPointCandidate = intersect(this.shapeA.x, this.shapeA.y, this.shapeB.x, this.shapeB.y, this.start.x, this.start.y, this.end.x, this.end.y);
                if (this.interPointCandidate === undefined) {
                    continue;
                }

                var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
                // lies inside the line segmente, between start and end?

                this.splitSwitchCandidate = (
                    shapeLineLength > vectorLength(vectorSub(this.shapeA, this.interPointCandidate))
                ) && (
                        shapeLineLength > vectorLength(vectorSub(this.interPointCandidate, this.shapeB))
                    ) && (
                        this.vectorMagnitude > vectorLength(vectorSub(this.start, this.interPointCandidate))
                    ) && (
                        this.vectorMagnitude > vectorLength(vectorSub(this.interPointCandidate, this.end))
                    );

                // SIMPLIFY
                if (this.splitSwitchCandidate) {
                    this.splitSwitch = true;

                    // select the shortest distance to center, here the intersectionPoint and the shape is selected
                    if (vectorLength(vectorSub(this.interPointCandidate, this.center)) < vectorLength(vectorSub(this.interPoint, this.center))) {
                        this.interPoint = this.interPointCandidate;
                        this.shape = value.pointList;
                        this.loopDensity = 1; // this.shapes[o].shapeLoop;
                    };
                }
            }
        }

        // dummy - for preventing errors
        this.controlA = { x: 0, y: 0 };
        this.controlB = { x: 0, y: 0 };
        this.controlStartA = { x: 0, y: 0 };
        this.controlStartB = { x: 0, y: 0 };
        this.controlEndA = { x: 0, y: 0 };
        this.controlEndB = { x: 0, y: 0 };

        if (this.splitSwitch) {
            // console.log("intersecting!")

            // form start to interPoint
            this.startInterPoint = vectorSub(this.start, this.interPoint);  // vector of diff

            this.controlStartA = {
                x: this.start.x + this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.start.y + this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStd),
            }
            this.controlStartB = {
                x: this.interPoint.x - this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.interPoint.y - this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStd)
            }

            // form interPoint end
            this.interPointEnd = vectorSub(this.interPoint, this.end);  // vector of diff

            this.controlEndA = {
                x: this.interPoint.x + this.interPointEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.interPoint.y + this.interPointEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStd),
            }
            this.controlEndB = {
                x: this.end.x - this.interPointEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.end.y - this.interPointEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStd)
            }

        } else {
            // console.log("no intersection with shape -> one continuous path.")
            this.startEnd = vectorSub(this.start, this.end);  // vector of diff

            this.controlA = {
                x: this.start.x + this.startEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.start.y + this.startEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStd),
            }
            this.controlB = {
                x: this.end.x - this.startEnd.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.end.y - this.startEnd.y / this.lineSegment + gaussianRandAdj(0, this.posStd)
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

        // this.strokeColorContinuous = "green";
        this.strokeColorContinuous = this.strokeColor;

        // for (var o = 0; o < this.shapes.length; o++) {
        for (const [key, value] of Object.entries(this.allShapes)) {

            // define the color - easy check
            if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
                // this.strokeColorContinuous = "red";
                this.inside = key;
                this.fullInside = true;
                this.strokeColorContinuous = this.strokeColorAction;
            }
        }

        if (  // for inside or for the first loop
            (this.fullInside == true || this.loop == 0)
        ) {

            this.newPath = document.createElementNS('http://www.w3.org/2000/svg', "path");
            this.newPath.setAttributeNS(null, "id", ("pathIdD-"));
            this.newPath.setAttributeNS(null, "d", `M 
            ${this.start.x} 
            ${this.start.y} 
            C 
            ${this.controlA.x} 
            ${this.controlA.y}, 
            ${this.controlB.x} 
            ${this.controlB.y}, 
            ${this.end.x} 
            ${this.end.y}
            `);
            // this.newPath.setAttributeNS(null, "stroke", "orange");
            this.newPath.setAttributeNS(null, "stroke", this.strokeColorContinuous);
            this.newPath.setAttributeNS(null, "stroke-width", 0.5);
            this.newPath.setAttributeNS(null, "opacity", 1);
            this.newPath.setAttributeNS(null, "fill", "none");

            const svgNode = document.getElementById('svgNode');
            svgNode.appendChild(this.newPath);
        }
    }

    showSplitPath() {

        const svgNode = document.getElementById('svgNode');

        var midPointStartInt = getMiddlePpoint(this.start, this.interPoint);
        var midPointEndInt = getMiddlePpoint(this.end, this.interPoint);

        this.strokeColorStart = this.strokeColor;
        this.strokeColorEnd = this.strokeColor;

        this.startInside = false;
        this.endInside = false;

        // for (var o = 0; o < this.shapes.length; o++) {
        for (const [key, value] of Object.entries(this.allShapes)) {
            // make sure both points lie in polygon and not just one on the edge.
            if (pointInPolygon(value.pointList, [midPointStartInt.x, midPointStartInt.y])) {
                this.inside = key;
                this.startInside = true;  // is this part in the polygon
                this.strokeColorStart = this.strokeColorAction;
            } else if (pointInPolygon(value.pointList, [midPointEndInt.x, midPointEndInt.y])) {
                this.inside = key;
                this.endInside = true;  // is this part in the polygon
                this.strokeColorEnd = this.strokeColorAction;
            }
        }

        if (
            (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) &&
            (this.startInside == true || this.loop == 0)
        ) {

            this.newPathStart = document.createElementNS('http://www.w3.org/2000/svg', "path");
            this.newPathStart.setAttributeNS(null, "id", "pathIdD");
            this.newPathStart.setAttributeNS(null, "d", `M 
            ${this.start.x} 
            ${this.start.y} 
            C 
            ${this.controlStartA.x} 
            ${this.controlStartA.y}, 
            ${this.controlStartB.x} 
            ${this.controlStartB.y}, 
            ${this.interPoint.x} 
            ${this.interPoint.y}
            `);
            // this.newPathStart.setAttributeNS(null, "stroke", "blue");
            this.newPathStart.setAttributeNS(null, "stroke", this.strokeColorStart);
            this.newPathStart.setAttributeNS(null, "stroke-width", 0.5);
            this.newPathStart.setAttributeNS(null, "opacity", 1);
            this.newPathStart.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathStart);
        }

        if (
            vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength &&
            (this.endInside == true || this.loop == 0)
        ) {
            this.newPathEnd = document.createElementNS('http://www.w3.org/2000/svg', "path");
            this.newPathEnd.setAttributeNS(null, "id", "pathIdD");
            this.newPathEnd.setAttributeNS(null, "d", `M 
            ${this.interPoint.x} 
            ${this.interPoint.y} 
            C 
            ${this.controlEndA.x} 
            ${this.controlEndA.y}, 
            ${this.controlEndB.x} 
            ${this.controlEndB.y}, 
            ${this.end.x} 
            ${this.end.y}
            `);
            // this.newPathEnd.setAttributeNS(null, "stroke", "pink");
            this.newPathEnd.setAttributeNS(null, "stroke", this.strokeColorEnd);
            this.newPathEnd.setAttributeNS(null, "stroke-width", 0.5);
            this.newPathEnd.setAttributeNS(null, "opacity", 1);
            this.newPathEnd.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathEnd);
        }
    }

    showDebug() {

        // DEBUG
        this.debugCenter = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugCenter.setAttributeNS(null, "id", "center");
        this.debugCenter.setAttributeNS(null, "cx", this.center.x);
        this.debugCenter.setAttributeNS(null, "cy", this.center.y);
        this.debugCenter.setAttributeNS(null, "r", "0.5");
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

        const svgNode = document.getElementById('svgNode');
        if (this.splitSwitch) {
            // svgNode.appendChild(this.debugCenter);
            // svgNode.appendChild(this.debugStart);
            // svgNode.appendChild(this.debugEnd);
            svgNode.appendChild(this.debugInterPoint);
            // svgNode.appendChild(this.debugControlStartA);
            // svgNode.appendChild(this.debugControlStartB);
            // svgNode.appendChild(this.debugControlEndA);
            // svgNode.appendChild(this.debugControlEndB);
            // svgNode.appendChild(this.debugUp);
            // svgNode.appendChild(this.debugDown);
        } else {
            // svgNode.appendChild(this.debugCenter);
            // svgNode.appendChild(this.debugStart);
            // svgNode.appendChild(this.debugEnd);
            // svgNode.appendChild(this.debugControlA);
            // svgNode.appendChild(this.debugControlB);
        }
    }
}