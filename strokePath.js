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

        // var ShapeLine = {
        //     x: 400,
        //     y: 600
        // }
        // var interPoint = getIntersectionPoint(this.start, this.end, { x: 0, y: 0 }, ShapeLine);
        // // console.log(interPoint);


        this.startEnd = vectorSub(this.start, this.end);  // vector of diff


        this.controlA = {
            x: this.start.x + this.startEnd.x / this.lineSegment + gaussianRandAdj(0, 1),
            y: this.start.y + this.startEnd.y / this.lineSegment + gaussianRandAdj(0, 1),
        }
        this.controlB = {
            x: this.end.x - this.startEnd.x / this.lineSegment + gaussianRandAdj(0, 1),
            y: this.end.y - this.startEnd.y / this.lineSegment + gaussianRandAdj(0, 1)
        }

    }

    showPath() {

        this.newpath = document.createElementNS('http://www.w3.org/2000/svg', "path");

        this.newpath.setAttributeNS(null, "id", "pathIdD");
        // newpath.setAttributeNS(null, "d", "M 10 10 C 20 20, 40 20, 50 10");
        this.newpath.setAttributeNS(null, "d", `M 
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
        // newpath.setAttributeNS(null, "stroke", "black");
        this.newpath.setAttributeNS(null, "stroke", this.strokeColor);
        this.newpath.setAttributeNS(null, "stroke-width", 0.5);
        this.newpath.setAttributeNS(null, "opacity", 1);
        this.newpath.setAttributeNS(null, "fill", "none");

        // DEBUG
        // debugStart = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        // debugStart.setAttributeNS(null, "id", "start");
        // debugStart.setAttributeNS(null, "cx", this.start.x);
        // debugStart.setAttributeNS(null, "cy", this.start.y);
        // debugStart.setAttributeNS(null, "r", "3");
        // debugStart.setAttributeNS(null, "stroke", "blue");
        // debugStart.setAttributeNS(null, "stroke-width", 2);
        // debugStart.setAttributeNS(null, "opacity", 1);
        // debugStart.setAttributeNS(null, "fill", "none");

        // debugEnd = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        // debugEnd.setAttributeNS(null, "id", "end");
        // debugEnd.setAttributeNS(null, "cx", this.end.x);
        // debugEnd.setAttributeNS(null, "cy", this.end.y);
        // debugEnd.setAttributeNS(null, "r", "3");
        // debugEnd.setAttributeNS(null, "stroke", "red");
        // debugEnd.setAttributeNS(null, "stroke-width", 2);
        // debugEnd.setAttributeNS(null, "opacity", 1);
        // debugEnd.setAttributeNS(null, "fill", "none");

        // debugControlA = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        // debugControlA.setAttributeNS(null, "id", "controlA");
        // debugControlA.setAttributeNS(null, "cx", controlA.x);
        // debugControlA.setAttributeNS(null, "cy", controlA.y);
        // debugControlA.setAttributeNS(null, "r", "3");
        // debugControlA.setAttributeNS(null, "stroke", "pink");
        // debugControlA.setAttributeNS(null, "stroke-width", 2);
        // debugControlA.setAttributeNS(null, "opacity", 1);
        // debugControlA.setAttributeNS(null, "fill", "none");

        // debugControlB = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        // debugControlB.setAttributeNS(null, "id", "controlB");
        // debugControlB.setAttributeNS(null, "cx", controlB.x);
        // debugControlB.setAttributeNS(null, "cy", controlB.y);
        // debugControlB.setAttributeNS(null, "r", "3");
        // debugControlB.setAttributeNS(null, "stroke", "pink");
        // debugControlB.setAttributeNS(null, "stroke-width", 2);
        // debugControlB.setAttributeNS(null, "opacity", 1);
        // debugControlB.setAttributeNS(null, "fill", "none");

        // debugInterPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        // debugInterPoint.setAttributeNS(null, "id", "intersect");
        // debugInterPoint.setAttributeNS(null, "cx", interPoint.x);
        // debugInterPoint.setAttributeNS(null, "cy", interPoint.y);
        // debugInterPoint.setAttributeNS(null, "r", "3");
        // debugInterPoint.setAttributeNS(null, "stroke", "cyan");
        // debugInterPoint.setAttributeNS(null, "stroke-width", 1);
        // debugInterPoint.setAttributeNS(null, "opacity", 1);
        // debugInterPoint.setAttributeNS(null, "fill", "none");

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.newpath);
        // svgNode.appendChild(debugStart);
        // svgNode.appendChild(debugEnd);
        // svgNode.appendChild(debugControlA);
        // svgNode.appendChild(debugControlB);

        // if (isOnLine(interPoint.x, interPoint.y, this.start.x, this.start.y, this.end.x, this.end.y, 1)) {
        // svgNode.appendChild(debugInterPoint);
        // }
    }
}