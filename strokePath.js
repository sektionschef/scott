class strokePath {
    constructor(data) {
        this.start = data.start;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.strokeColorAction = data.strokeColorAction;
        this.shape = data.shape;

        this.lineSegment = 4;  // where to place the control points
        this.posStd = 1  // misplacmente standard deviation
        this.minLength = 5;  // a line should have a length of at least

        // create from angle
        this.end = vectorAdd(this.start, vectorFromAngle(this.angleRadians, this.vectorMagnitude))

        // start and end distortion
        this.start.x = this.start.x + gaussianRandAdj(0, this.posStd);
        this.end.x = this.end.x + gaussianRandAdj(0, this.posStd);
        this.start.y = this.start.y + gaussianRandAdj(0, this.posStd);
        this.end.y = this.end.y + gaussianRandAdj(0, this.posStd);

        this.interPoint = { x: 99999, y: 99999 };
        this.splitSwitch = false;

        // if there is an intersection point
        for (var i = 0; i < this.shape.length; i++) {
            if (i != (this.shape.length - 1)) {
                this.shapeA = { x: this.shape[i][0], y: this.shape[i][1] };
                this.shapeB = { x: this.shape[i + 1][0], y: this.shape[i + 1][1] }
            } else {
                // closing the loop
                this.shapeA = { x: this.shape[0][0], y: this.shape[0][1] };
                this.shapeB = { x: this.shape[i][0], y: this.shape[i][1] };
            }

            this.interPointCandidate = getIntersectionPoint(this.shapeA, this.shapeB, this.start, this.end);
            if (this.interPointCandidate === undefined) {
                continue;
            }

            // lies inside the line segmente, between start and end?
            this.splitSwitchCandidate = (
                Math.abs(vectorLength(vectorSub(this.shapeA, this.shapeB))) > Math.abs(vectorLength(vectorSub(this.shapeA, this.interPointCandidate)))
            ) && (
                    Math.abs(vectorLength(vectorSub(this.shapeA, this.shapeB))) > Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.shapeB)))
                ) && (
                    Math.abs(vectorLength(vectorSub(this.start, this.end))) > Math.abs(vectorLength(vectorSub(this.start, this.interPointCandidate)))
                ) && (
                    Math.abs(vectorLength(vectorSub(this.start, this.end))) > Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.end)))
                );

            if (this.splitSwitchCandidate) {
                this.splitSwitch = true;
            }

            // select the shortest distance to start
            if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.start))) < Math.abs(vectorLength(vectorSub(this.interPoint, this.start)))) {
                this.interPoint = this.interPointCandidate;
            };
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

        var midPoint = getMiddlePpoint(this.start, this.end);

        // define the color - what is inside?
        if (pointInPolygon(this.shape, [midPoint.x, midPoint.y])) {
            this.strokeColorContinuous = this.strokeColorAction;
        } else {
            this.strokeColorContinuous = this.strokeColor;
        }

        this.newPath = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.newPath.setAttributeNS(null, "id", ("pathIdD-") + $fx.rand() * 1000);
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
        // newPath.setAttributeNS(null, "stroke", "black");
        this.newPath.setAttributeNS(null, "stroke", this.strokeColorContinuous);
        this.newPath.setAttributeNS(null, "stroke-width", 0.5);
        this.newPath.setAttributeNS(null, "opacity", 1);
        this.newPath.setAttributeNS(null, "fill", "none");

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.newPath);
    }

    showSplitPath() {

        const svgNode = document.getElementById('svgNode');

        var midPointStartInt = getMiddlePpoint(this.start, this.interPoint);
        var midPointEndInt = getMiddlePpoint(this.end, this.interPoint);

        // make sure both points lie in polygon and not just one on the edge.
        if (pointInPolygon(this.shape, [midPointStartInt.x, midPointStartInt.y])) {
            this.strokeColorStart = this.strokeColorAction;
            this.strokeColorEnd = this.strokeColor;
        } else if (pointInPolygon(this.shape, [midPointEndInt.x, midPointEndInt.y])) {
            this.strokeColorStart = this.strokeColor;
            this.strokeColorEnd = this.strokeColorAction;
        } else {
            this.strokeColorStart = this.strokeColor;
            this.strokeColorEnd = this.strokeColor;
        }

        if (vectorLength(vectorSub(this.start, this.interPoint)) > this.minLength) {

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
            this.newPathStart.setAttributeNS(null, "stroke", this.strokeColorStart);
            this.newPathStart.setAttributeNS(null, "stroke-width", 0.5);
            this.newPathStart.setAttributeNS(null, "opacity", 1);
            this.newPathStart.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathStart);
        }

        if (vectorLength(vectorSub(this.interPoint, this.end)) > this.minLength) {
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
            this.newPathEnd.setAttributeNS(null, "stroke", this.strokeColorEnd);
            this.newPathEnd.setAttributeNS(null, "stroke-width", 0.5);
            this.newPathEnd.setAttributeNS(null, "opacity", 1);
            this.newPathEnd.setAttributeNS(null, "fill", "none");

            svgNode.appendChild(this.newPathEnd);
        }
    }

    showDebug() {

        // DEBUG
        this.debugStart = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugStart.setAttributeNS(null, "id", "start");
        this.debugStart.setAttributeNS(null, "cx", this.start.x);
        this.debugStart.setAttributeNS(null, "cy", this.start.y);
        this.debugStart.setAttributeNS(null, "r", "3");
        this.debugStart.setAttributeNS(null, "stroke", "blue");
        this.debugStart.setAttributeNS(null, "stroke-width", 1);
        this.debugStart.setAttributeNS(null, "opacity", 1);
        this.debugStart.setAttributeNS(null, "fill", "none");

        this.debugEnd = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugEnd.setAttributeNS(null, "id", "end");
        this.debugEnd.setAttributeNS(null, "cx", this.end.x);
        this.debugEnd.setAttributeNS(null, "cy", this.end.y);
        this.debugEnd.setAttributeNS(null, "r", "3");
        this.debugEnd.setAttributeNS(null, "stroke", "red");
        this.debugEnd.setAttributeNS(null, "stroke-width", 1);
        this.debugEnd.setAttributeNS(null, "opacity", 1);
        this.debugEnd.setAttributeNS(null, "fill", "none");

        this.debugControlA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlA.setAttributeNS(null, "id", "controlA");
        this.debugControlA.setAttributeNS(null, "cx", this.controlA.x);
        this.debugControlA.setAttributeNS(null, "cy", this.controlA.y);
        this.debugControlA.setAttributeNS(null, "r", "3");
        this.debugControlA.setAttributeNS(null, "stroke", "pink");
        this.debugControlA.setAttributeNS(null, "stroke-width", 1);
        this.debugControlA.setAttributeNS(null, "opacity", 1);
        this.debugControlA.setAttributeNS(null, "fill", "none");

        this.debugControlB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlB.setAttributeNS(null, "id", "controlB");
        this.debugControlB.setAttributeNS(null, "cx", this.controlB.x);
        this.debugControlB.setAttributeNS(null, "cy", this.controlB.y);
        this.debugControlB.setAttributeNS(null, "r", "3");
        this.debugControlB.setAttributeNS(null, "stroke", "pink");
        this.debugControlB.setAttributeNS(null, "stroke-width", 1);
        this.debugControlB.setAttributeNS(null, "opacity", 1);
        this.debugControlB.setAttributeNS(null, "fill", "none");

        this.debugInterPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugInterPoint.setAttributeNS(null, "id", "intersect");
        this.debugInterPoint.setAttributeNS(null, "cx", this.interPoint.x);
        this.debugInterPoint.setAttributeNS(null, "cy", this.interPoint.y);
        this.debugInterPoint.setAttributeNS(null, "r", "5");
        this.debugInterPoint.setAttributeNS(null, "stroke", "cyan");
        this.debugInterPoint.setAttributeNS(null, "stroke-width", 1);
        this.debugInterPoint.setAttributeNS(null, "opacity", 1);
        this.debugInterPoint.setAttributeNS(null, "fill", "none");

        this.debugControlStartA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlStartA.setAttributeNS(null, "id", "controlA");
        this.debugControlStartA.setAttributeNS(null, "cx", this.controlStartA.x);
        this.debugControlStartA.setAttributeNS(null, "cy", this.controlStartA.y);
        this.debugControlStartA.setAttributeNS(null, "r", "3");
        this.debugControlStartA.setAttributeNS(null, "stroke", "pink");
        this.debugControlStartA.setAttributeNS(null, "stroke-width", 1);
        this.debugControlStartA.setAttributeNS(null, "opacity", 1);
        this.debugControlStartA.setAttributeNS(null, "fill", "none");

        this.debugControlStartB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlStartB.setAttributeNS(null, "id", "controlB");
        this.debugControlStartB.setAttributeNS(null, "cx", this.controlStartB.x);
        this.debugControlStartB.setAttributeNS(null, "cy", this.controlStartB.y);
        this.debugControlStartB.setAttributeNS(null, "r", "3");
        this.debugControlStartB.setAttributeNS(null, "stroke", "pink");
        this.debugControlStartB.setAttributeNS(null, "stroke-width", 1);
        this.debugControlStartB.setAttributeNS(null, "opacity", 1);
        this.debugControlStartB.setAttributeNS(null, "fill", "none");

        this.debugControlEndA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlEndA.setAttributeNS(null, "id", "controlA");
        this.debugControlEndA.setAttributeNS(null, "cx", this.controlEndA.x);
        this.debugControlEndA.setAttributeNS(null, "cy", this.controlEndA.y);
        this.debugControlEndA.setAttributeNS(null, "r", "3");
        this.debugControlEndA.setAttributeNS(null, "stroke", "pink");
        this.debugControlEndA.setAttributeNS(null, "stroke-width", 1);
        this.debugControlEndA.setAttributeNS(null, "opacity", 1);
        this.debugControlEndA.setAttributeNS(null, "fill", "none");

        this.debugControlEndB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlEndB.setAttributeNS(null, "id", "controlB");
        this.debugControlEndB.setAttributeNS(null, "cx", this.controlEndB.x);
        this.debugControlEndB.setAttributeNS(null, "cy", this.controlEndB.y);
        this.debugControlEndB.setAttributeNS(null, "r", "3");
        this.debugControlEndB.setAttributeNS(null, "stroke", "pink");
        this.debugControlEndB.setAttributeNS(null, "stroke-width", 1);
        this.debugControlEndB.setAttributeNS(null, "opacity", 1);
        this.debugControlEndB.setAttributeNS(null, "fill", "none");

        const svgNode = document.getElementById('svgNode');
        if (this.splitSwitch) {
            svgNode.appendChild(this.debugStart);
            svgNode.appendChild(this.debugEnd);
            svgNode.appendChild(this.debugInterPoint);
            svgNode.appendChild(this.debugControlStartA);
            svgNode.appendChild(this.debugControlStartB);
            svgNode.appendChild(this.debugControlEndA);
            svgNode.appendChild(this.debugControlEndB);
        } else {
            svgNode.appendChild(this.debugStart);
            svgNode.appendChild(this.debugEnd);
            svgNode.appendChild(this.debugControlA);
            svgNode.appendChild(this.debugControlB);
        }
    }
}