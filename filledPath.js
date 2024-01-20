class filledPath {
    constructor(data) {

        this.start = data.start;
        this.end = data.end;
        // this.angleRadians = data.angleRadians;
        this.strokeWidth = data.strokeWidth;
        this.group = data.group;

        this.angleRadians = angleBetweenPoints(this.start, this.end);
        this.vectorMagnitude = vectorLength(vectorSub(this.start, this.end));

        this.start.id = "start";
        this.start.debugColor = "green";
        this.end.id = "end";
        this.end.debugColor = "red";


        this.Atheo = {
            x: this.start.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians + Math.PI / 2)),
            y: this.start.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians + Math.PI / 2)),
            id: "A",
            debugColor: "purple",
        }
        this.Btheo = {
            x: this.end.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians + Math.PI / 2)),
            y: this.end.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians + Math.PI / 2)),
            id: "B",
            debugColor: "purple",
        }
        this.Ctheo = {
            x: this.end.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.end.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "C",
            debugColor: "purple",
        }

        this.Dtheo = {
            x: this.start.x + (this.strokeWidth / 2 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.start.y + (this.strokeWidth / 2 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "D",
            debugColor: "purple",
        }

        this.A = this.Atheo;
        this.B = this.Btheo;
        this.C = this.Ctheo;
        this.D = this.Dtheo;

        // between A and B - near A
        this.cAB = {
            x: this.A.x + (this.vectorMagnitude / 3 * Math.cos(this.angleRadians)),
            y: this.A.y + (this.vectorMagnitude / 3 * Math.sin(this.angleRadians)),
            id: "cAB",
            debugColor: "blue",
        }

        this.cBA = {
            x: this.B.x - (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - 2 * Math.PI)),
            y: this.B.y - (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - 2 * Math.PI)),
            id: "cBA",
            debugColor: "blue",
        }

        this.cCD = {
            x: this.D.x + (this.vectorMagnitude / 3 * Math.cos(this.angleRadians)),
            y: this.D.y + (this.vectorMagnitude / 3 * Math.sin(this.angleRadians)),
            id: "cCD",
            debugColor: "blue",
        }

        this.cDC = {
            x: this.C.x - (this.vectorMagnitude / 3 * Math.cos(this.angleRadians - 2 * Math.PI)),
            y: this.C.y - (this.vectorMagnitude / 3 * Math.sin(this.angleRadians - 2 * Math.PI)),
            id: "cDC",
            debugColor: "blue",
        }

        this.cBC = {
            x: this.B.x + (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.B.y + (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "cBC",
            debugColor: "blue",
        }

        this.cCB = {
            x: this.C.x - (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.C.y - (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "cCB",
            debugColor: "blue",
        }

        this.cDA = {
            x: this.A.x + (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.A.y + (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "cDA",
            debugColor: "blue",
        }
        this.cAD = {
            x: this.D.x - (this.strokeWidth / 3 * Math.cos(this.angleRadians - Math.PI / 2)),
            y: this.D.y - (this.strokeWidth / 3 * Math.sin(this.angleRadians - Math.PI / 2)),
            id: "cAD",
            debugColor: "blue",
        }

        // this.misplaceCoords();
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
        ${this.cCB.x} ${this.cCB.y},
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
        this.path.setAttributeNS(null, "fill", "#4d4d4d");

        // svgNode.appendChild(this.newPath);
        group.appendChild(this.path);
    }

    showDebugPoint(point) {

        this.debugPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugPoint.setAttributeNS(null, "id", "");
        this.debugPoint.setAttributeNS(null, "cx", point.x);
        this.debugPoint.setAttributeNS(null, "cy", point.y);
        this.debugPoint.setAttributeNS(null, "r", "2");
        this.debugPoint.setAttributeNS(null, "stroke", "none");
        this.debugPoint.setAttributeNS(null, "fill", point.debugColor);
        this.debugPoint.setAttributeNS(null, "stroke-width", 0.1);
        this.debugPoint.setAttributeNS(null, "opacity", 1);

        // const svgNode = document.getElementById('svgNode');
        // svgNode.appendChild(this.debugPoint);

        var group = document.getElementById(this.group);
        group.appendChild(this.debugPoint);
    }

    showDebugText(point) {
        var offset = 2;
        const textSize = "0.5em";

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', point.x + offset);
        text.setAttribute('y', point.y - offset);
        text.setAttribute('fill', point.debugColor);
        text.setAttribute('font-size', textSize);
        text.textContent = point.id;

        var group = document.getElementById(this.group);
        group.appendChild(text);
    }

    showDebugStroke() {

        var pointList = [
            this.end,
            this.start,
            this.cAB,
            this.cBA,
            this.cBC,
            this.cCB,
            this.cCD,
            this.cDC,
            this.cDA,
            this.cAD,
            this.A,
            this.B,
            this.C,
            this.D,
        ]

        for (var i = 0; i < pointList.length; i++) {
            this.showDebugPoint(pointList[i]);
            this.showDebugText(pointList[i]);
        }
    }
}