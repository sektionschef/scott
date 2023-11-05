class strokePath {
    constructor(data) {
        this.start = data.start;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;

        this.lineSegment = 4;  // where to place the control points
        this.posStd = 1

        // create from angle
        this.end = vectorAdd(this.start, vectorFromAngle(this.angleRadians, this.vectorMagnitude))

        // start and end distortion
        this.start.x = this.start.x + gaussianRandAdj(0, this.posStd);
        this.end.x = this.end.x + gaussianRandAdj(0, this.posStd);
        this.start.y = this.start.y + gaussianRandAdj(0, this.posStd);
        this.end.y = this.end.y + gaussianRandAdj(0, this.posStd);

        this.shapeLine = {
            x: 400,
            y: 600
        }

        // if there is an intersection point
        this.interPoint = getIntersectionPoint(this.start, this.end, { x: 0, y: 0 }, this.shapeLine);
        this.splitSwitch = isOnLine(this.interPoint.x, this.interPoint.y, this.start.x, this.start.y, this.end.x, this.end.y, 1);

        // dummy
        this.controlA = { x: 0, y: 0 };
        this.controlB = { x: 0, y: 0 };

        if (this.splitSwitch) {
            // console.log("intersecting!")

            // form start to interPoint
            this.startInterPoint = vectorSub(this.start, this.interPoint);  // vector of diff

            this.controlStartA = {
                x: this.start.x + this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.start.y + this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStd),
            }
            this.controlStartB = {
                x: this.end.x - this.startInterPoint.x / this.lineSegment + gaussianRandAdj(0, this.posStd),
                y: this.end.y - this.startInterPoint.y / this.lineSegment + gaussianRandAdj(0, this.posStd)
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
        this.newPath = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.newPath.setAttributeNS(null, "id", "pathIdD");
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
        this.newPath.setAttributeNS(null, "stroke", this.strokeColor);
        this.newPath.setAttributeNS(null, "stroke-width", 0.5);
        this.newPath.setAttributeNS(null, "opacity", 1);
        this.newPath.setAttributeNS(null, "fill", "none");

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.newPath);
    }

    showSplitPath() {
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
        this.newPathStart.setAttributeNS(null, "stroke", "#15ff00");
        // this.newPathStart.setAttributeNS(null, "stroke", this.strokeColor);
        this.newPathStart.setAttributeNS(null, "stroke-width", 0.5);
        this.newPathStart.setAttributeNS(null, "opacity", 1);
        this.newPathStart.setAttributeNS(null, "fill", "none");


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
        this.newPathEnd.setAttributeNS(null, "stroke", "#e100ff");
        // this.newPathEnd.setAttributeNS(null, "stroke", this.strokeColor);
        this.newPathEnd.setAttributeNS(null, "stroke-width", 0.5);
        this.newPathEnd.setAttributeNS(null, "opacity", 1);
        this.newPathEnd.setAttributeNS(null, "fill", "none");



        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.newPathStart);
        svgNode.appendChild(this.newPathEnd);
    }

    showDebug() {

        // DEBUG
        this.debugStart = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugStart.setAttributeNS(null, "id", "start");
        this.debugStart.setAttributeNS(null, "cx", this.start.x);
        this.debugStart.setAttributeNS(null, "cy", this.start.y);
        this.debugStart.setAttributeNS(null, "r", "3");
        this.debugStart.setAttributeNS(null, "stroke", "blue");
        this.debugStart.setAttributeNS(null, "stroke-width", 2);
        this.debugStart.setAttributeNS(null, "opacity", 1);
        this.debugStart.setAttributeNS(null, "fill", "none");

        this.debugEnd = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugEnd.setAttributeNS(null, "id", "end");
        this.debugEnd.setAttributeNS(null, "cx", this.end.x);
        this.debugEnd.setAttributeNS(null, "cy", this.end.y);
        this.debugEnd.setAttributeNS(null, "r", "3");
        this.debugEnd.setAttributeNS(null, "stroke", "red");
        this.debugEnd.setAttributeNS(null, "stroke-width", 2);
        this.debugEnd.setAttributeNS(null, "opacity", 1);
        this.debugEnd.setAttributeNS(null, "fill", "none");

        this.debugControlA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlA.setAttributeNS(null, "id", "controlA");
        this.debugControlA.setAttributeNS(null, "cx", this.controlA.x);
        this.debugControlA.setAttributeNS(null, "cy", this.controlA.y);
        this.debugControlA.setAttributeNS(null, "r", "3");
        this.debugControlA.setAttributeNS(null, "stroke", "pink");
        this.debugControlA.setAttributeNS(null, "stroke-width", 2);
        this.debugControlA.setAttributeNS(null, "opacity", 1);
        this.debugControlA.setAttributeNS(null, "fill", "none");

        this.debugControlB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugControlB.setAttributeNS(null, "id", "controlB");
        this.debugControlB.setAttributeNS(null, "cx", this.controlB.x);
        this.debugControlB.setAttributeNS(null, "cy", this.controlB.y);
        this.debugControlB.setAttributeNS(null, "r", "3");
        this.debugControlB.setAttributeNS(null, "stroke", "pink");
        this.debugControlB.setAttributeNS(null, "stroke-width", 2);
        this.debugControlB.setAttributeNS(null, "opacity", 1);
        this.debugControlB.setAttributeNS(null, "fill", "none");

        this.debugInterPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugInterPoint.setAttributeNS(null, "id", "intersect");
        this.debugInterPoint.setAttributeNS(null, "cx", this.interPoint.x);
        this.debugInterPoint.setAttributeNS(null, "cy", this.interPoint.y);
        this.debugInterPoint.setAttributeNS(null, "r", "3");
        this.debugInterPoint.setAttributeNS(null, "stroke", "cyan");
        this.debugInterPoint.setAttributeNS(null, "stroke-width", 1);
        this.debugInterPoint.setAttributeNS(null, "opacity", 1);
        this.debugInterPoint.setAttributeNS(null, "fill", "none");

        const svgNode = document.getElementById('svgNode');
        if (this.splitSwitch) {
            svgNode.appendChild(this.debugInterPoint);
        } else {
            svgNode.appendChild(this.debugStart);
            svgNode.appendChild(this.debugEnd);
            svgNode.appendChild(this.debugControlA);
            svgNode.appendChild(this.debugControlB);
        }
    }
}