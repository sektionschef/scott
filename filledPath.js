class filledPath {
    constructor(data) {

        this.start = data.start;
        this.end = data.end;
        // this.angleRadians = data.angleRadians;
        this.strokeWidth = data.strokeWidth;
        this.group = data.group;

        this.angleRadians = angleBetweenPoints(this.start, this.end);
        this.vectorMagnitude = vectorLength(vectorSub(this.start, this.end));

        this.A = {
            x: this.start.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians + Math.PI / 2)),
            y: this.start.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians + Math.PI / 2))
        }

        // console.log(this.angleRadians);

        this.B = {
            x: this.end.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians + Math.PI / 2)),
            y: this.end.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians + Math.PI / 2))
        }

        this.C = {
            x: this.end.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.end.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians - Math.PI / 2))
        }

        this.D = {
            x: this.start.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.start.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians - Math.PI / 2))
        }

        // between A and B - near A
        this.cAB = {
            x: this.A.x + (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - Math.PI)),
            y: this.A.y + (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - Math.PI))
        }

        this.cBA = {
            x: this.B.x - (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - Math.PI)),
            y: this.B.y - (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - Math.PI))
        }

        this.cCD = {
            x: this.D.x + (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - Math.PI)),
            y: this.D.y + (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - Math.PI))
        }

        this.cDC = {
            x: this.C.x - (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - Math.PI)),
            y: this.C.y - (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - Math.PI))
        }

        this.cBC = {
            x: this.B.x + (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.B.y + (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2))
        }

        this.cCB = {
            x: this.C.x - (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.C.y - (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2))
        }

        this.cDA = {
            x: this.A.x + (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.A.y + (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2))
        }
        this.cAD = {
            x: this.D.x - (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.D.y - (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2))
        }

        this.misplaceCoords();
        this.showFilledPath();

        // this.showDebugPoint();
    }

    misplaceCoords() {
        var shiftX = gaussianRandAdj(0, this.posStdShiftX);

        // start and end distortion
        // this.start.x = this.start.x + gaussianRandAdj(0, this.posStd) + shiftX;
        // this.end.x = this.end.x + gaussianRandAdj(0, this.posStd) + shiftX;
        // this.start.y = this.start.y + gaussianRandAdj(0, this.posStd);
        // this.end.y = this.end.y + gaussianRandAdj(0, this.posStd);

        // NEEDS VECTOR MANIPULATION
        this.pointStd = 0;
        this.longStd = 1;
        this.shortStd = 1;

        var misplacementList = {
            [this.pointStd]: [
                this.A,
                this.B,
                this.C,
                this.D,
            ],
            [this.longStd]: [
                this.cAB,
                this.cBA,
                this.cCD,
                this.cDC,
            ],
            [this.shortStd]: [
                this.cBC,
                this.cCB,
                this.cDA,
                this.cAD,
            ]
        }

        for (const [cat, coordList] of Object.entries(misplacementList)) {
            for (var i = 0; i < coordList.length; i++) {


                // coordList[i].x = coordList[i].x + gaussianRandAdj(0, this.posStd) + shiftX;
                // coordList[i].y = coordList[i].y + gaussianRandAdj(0, this.posStd) + shiftX;

                coordList[i].x = coordList[i].x + gaussianRandAdj(0, cat);
                coordList[i].y = coordList[i].y + gaussianRandAdj(0, cat);
            }
        }
    }

    drawPath() {

        this.path = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.path.setAttributeNS(null, "id", "pathIdD");
        // path.setAttributeNS(null, "filter", "url(#filterPencil)");

        this.path.setAttributeNS(null, "d", `M 
        ${this.A.x} ${this.A.y}, 
        C 
        ${this.cAB.x} ${this.cAB.y},
        ${this.cBA.x} ${this.cBA.y}, 
        ${this.B.x} ${this.B.y},
        C
        ${this.cBC.x} ${this.cBC.y}, 
        ${this.cBC.x} ${this.cCB.y},
        ${this.C.x} ${this.C.y}
        C
        ${this.cCD.x} ${this.cCD.y}, 
        ${this.cDC.x} ${this.cDC.y},
        ${this.D.x} ${this.D.y}
        C
        ${this.cDA.x} ${this.cDA.y}, 
        ${this.cAD.x} ${this.cAD.y},
        ${this.A.x} ${this.A.y}
        
        `);
    }


    showFilledPath() {

        this.drawPath();

        const group = document.getElementById(this.group);

        this.path.setAttributeNS(null, "stroke", this.strokeColor);
        // this.path.setAttributeNS(null, "stroke-width", this.strokeWidth);
        this.path.setAttributeNS(null, "stroke", "none");
        this.path.setAttributeNS(null, "opacity", 1);
        this.path.setAttributeNS(null, "fill", "black");

        // svgNode.appendChild(this.newPath);
        group.appendChild(this.path);
    }

    showDebugPoint(x, y, colory) {
        this.debugPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugPoint.setAttributeNS(null, "id", "");
        this.debugPoint.setAttributeNS(null, "cx", x);
        this.debugPoint.setAttributeNS(null, "cy", y);
        this.debugPoint.setAttributeNS(null, "r", "2");
        this.debugPoint.setAttributeNS(null, "stroke", "none");
        this.debugPoint.setAttributeNS(null, "fill", colory);
        this.debugPoint.setAttributeNS(null, "stroke-width", 0.1);
        this.debugPoint.setAttributeNS(null, "opacity", 1);

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.debugPoint);
    }

    showDebugStroke() {
        // if (this.splitSwitch) {
        //     // svgNode.appendChild(this.debugCenter);
        //     // svgNode.appendChild(this.debugStart);
        //     // svgNode.appendChild(this.debugEnd);
        //     // svgNode.appendChild(this.debugInterPoint);
        //     // svgNode.appendChild(this.debugControlStartA);
        //     // svgNode.appendChild(this.debugControlStartB);
        //     // svgNode.appendChild(this.debugControlEndA);
        //     // svgNode.appendChild(this.debugControlEndB);
        //     // svgNode.appendChild(this.debugUp);
        //     // svgNode.appendChild(this.debugDown);
        //     svgNode.appendChild(this.debugmidPointStartInt);
        //     svgNode.appendChild(this.debugmidPointEndInt);
        // } else {
        //     // svgNode.appendChild(this.debugCenter);
        //     // svgNode.appendChild(this.debugStart);
        //     // svgNode.appendChild(this.debugEnd);
        //     // svgNode.appendChild(this.debugControlA);
        //     // svgNode.appendChild(this.debugControlB);
        // }
        var pointListDebug = {
            "red": [
                this.A,
                this.B,
                this.C,
                this.D,
            ],
            "green": [
            ],
            "blue": [
                this.cAB,
                this.cBA,
                this.cBC,
                this.cCB,
                this.cCD,
                this.cDC,
                this.cDA,
                this.cAD,
            ],
            "purple": [
                this.center,
                this.start,
                this.end,
            ],
            "orange": [
                this.A,
                this.B,
                this.C,
                this.D,
            ]
        }

        for (const [colory, pointList] of Object.entries(pointListDebug)) {
            for (var i = 0; i < pointList.length; i++) {
                this.showDebugPoint(pointList[i].x, pointList[i].y, colory);
            }
        }
    }
}