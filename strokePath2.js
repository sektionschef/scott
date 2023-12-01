class strokePath2 {
    constructor(data) {
        this.lineSegment = 4;  // where to place the control points
        this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        this.posStdCon = 1; // 0.4;  // control points
        this.posStdShiftX = 0; // add variance to x so no total overlap
        this.minLength = 0; // 5;  // a line should have a length of at least
        this.path = true;

        this.strokeWidth = data.strokeWidth;
        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.allShapes = data.allShapes;
        this.loop = data.loop;
        this.group = data.group;

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

    }


    drawPath(start, cA, cB, end) {

        var A = {
            x: 100,
            y: 130
        }
        var cAB = {
            x: 200,
            y: 110,
        }
        var cBA = {
            x: 300,
            y: 120,
        }
        var B = {
            x: 400,
            y: 130
        }
        var cBC = {
            x: 400,
            y: 160
        }
        var cCB = {
            x: 400,
            y: 190
        }
        var C = {
            x: 400,
            y: 200
        }
        var cCD = {
            x: 300,
            y: 160
        }
        var cDC = {
            x: 200,
            y: 190
        }
        var D = {
            x: 100,
            y: 200
        }
        var cDA = {
            x: 80,
            y: 170
        }
        var cAD = {
            x: 90,
            y: 150
        }

        this.path = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.path.setAttributeNS(null, "id", "pathIdD");
        // path.setAttributeNS(null, "filter", "url(#filterPencil)");

        this.path.setAttributeNS(null, "d", `M 
        ${A.x} ${A.y}, 
        C 
        ${cAB.x} ${cAB.y},
        ${cBA.x} ${cBA.y}, 
        ${B.x} ${B.y},
        C
        ${cBC.x} ${cBC.y}, 
        ${cBC.x} ${cCB.y},
        ${C.x} ${C.y}
        C
        ${cCD.x} ${cCD.y}, 
        ${cDC.x} ${cDC.y},
        ${D.x} ${D.y}
        C
        ${cDA.x} ${cDA.y}, 
        ${cAD.x} ${cAD.y},
        ${A.x} ${A.y}
        
        `);
    }

    showPath() {

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