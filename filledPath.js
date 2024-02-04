class filledPath {
    constructor(data) {
        this.strokeWidth = 1.3; // deprecatd
        // this.colory = "#0000006e"
        // this.colory = "#00000041"
        this.colory = "#353535ff"
        // this.profile = "vanilla";
        this.profile = "swingspitz";
        var cat = 0.75;
        var bogal = gaussianRandAdj(0, 0.03);


        this.start = data.start;
        this.end = data.end;
        // this.strokeWidth = data.strokeWidth;
        this.group = data.group;

        this.angleRadians = angleBetweenPoints(this.start, this.end);
        this.vectorMagnitude = vectorLength(vectorSub(this.start, this.end));

        this.start.id = "start";
        this.start.debugColor = "green";
        this.start = jitterPoint(this.start, cat)

        this.end.id = "end";
        this.end.debugColor = "red";
        this.end = jitterPoint(this.end, cat)

        this.center = getMiddlePpoint(this.start, this.end);
        this.center.id = "center";
        this.center.debugColor = "pink";
        // this.center.x = this.center.x + gaussianRandAdj(0, cat);
        // this.center.y = this.center.y + gaussianRandAdj(0, cat);

        // var widthy =
        // console.log(this.vectorMagnitude * 0.02);

        var distanceWidth = 1;

        if (this.profile == "vanilla") {
            this.Atheo = vectorAdd(this.start, vectorFromAngle(this.angleRadians + Math.PI / 2, this.strokeWidth / 2));
            this.Atheo.id = "Atheo";
            this.Atheo.debugColor = "#747474";
            this.A = this.Atheo;
            this.A.id = "A";
            this.A.debugColor = "purple";

            this.Btheo = vectorAdd(this.end, vectorFromAngle(this.angleRadians + Math.PI / 2, this.strokeWidth / 2));
            this.Btheo.id = "Btheo";
            this.Btheo.debugColor = "#747474";
            this.B = this.Btheo;
            this.B.id = "B";
            this.B.debugColor = "purple";

            this.Ctheo = vectorAdd(this.end, vectorFromAngle(this.angleRadians - Math.PI / 2, this.strokeWidth / 2));
            this.Ctheo.id = "Ctheo";
            this.Ctheo.debugColor = "#747474";
            this.C = this.Ctheo;
            this.C.id = "C";
            this.C.debugColor = "purple";

            this.Dtheo = vectorAdd(this.start, vectorFromAngle(this.angleRadians - Math.PI / 2, this.strokeWidth / 2));
            this.Dtheo.id = "Dtheo";
            this.Dtheo.debugColor = "#747474";
            this.D = this.Dtheo;
            this.D.id = "D";
            this.D.debugColor = "purple";

            // between A and B - near A
            this.cAB = vectorAdd(this.Atheo, vectorFromAngle(this.angleRadians, this.vectorMagnitude / 3));
            this.cAB.id = "cAB";
            this.cAB.debugColor = "blue";

            this.cBA = vectorAdd(this.Btheo, vectorFromAngle(this.angleRadians - Math.PI, this.vectorMagnitude / 3));
            this.cBA.id = "cBA";
            this.cBA.debugColor = "blue";

            this.cCD = vectorAdd(this.Ctheo, vectorFromAngle(this.angleRadians - Math.PI, this.vectorMagnitude / 3));
            this.cCD.id = "cCD";
            this.cCD.debugColor = "blue";

            this.cDC = vectorAdd(this.Dtheo, vectorFromAngle(this.angleRadians, this.vectorMagnitude / 3));
            this.cDC.id = "cDC";
            this.cDC.debugColor = "blue";

            this.cBC = vectorAdd(this.Btheo, vectorFromAngle(this.angleRadians - Math.PI / 2, this.strokeWidth / 3));
            this.cBC.id = "cBC";
            this.cBC.debugColor = "blue";

            this.cCB = vectorAdd(this.Ctheo, vectorFromAngle(this.angleRadians + Math.PI / 2, this.strokeWidth / 3));
            this.cCB.id = "cCB";
            this.cCB.debugColor = "blue";

            this.cDA = vectorAdd(this.Dtheo, vectorFromAngle(this.angleRadians + Math.PI / 2, this.strokeWidth / 3));
            this.cDA.id = "cDA";
            this.cDA.debugColor = "blue";

            this.cAD = vectorAdd(this.Atheo, vectorFromAngle(this.angleRadians - Math.PI / 2, this.strokeWidth / 3));
            this.cAD.id = "cAD";
            this.cAD.debugColor = "blue";
        } else if (this.profile == "swingspitz") {

            this.A = vectorAdd(this.start, vectorFromAngle(this.angleRadians - Math.PI * 0.70, distanceWidth));
            this.A.id = "A";
            this.A.debugColor = "purple";

            this.B = vectorAdd(this.end, vectorFromAngle(this.angleRadians + Math.PI * 1.1, distanceWidth)); // faus
            this.B.id = "B";
            this.B.debugColor = "purple";

            this.C = vectorAdd(this.end, vectorFromAngle(this.angleRadians - Math.PI * 1.1, distanceWidth));  // faus
            this.C.id = "C";
            this.C.debugColor = "purple";

            this.D = vectorAdd(this.start, vectorFromAngle(this.angleRadians + Math.PI * 0.80, distanceWidth));  // faus
            this.D.id = "D";
            this.D.debugColor = "purple";

            // between A and B - near A
            this.cAB = vectorAdd(this.A, vectorFromAngle(this.angleRadians - Math.PI * (bogal + gaussianRandAdj(0, 0.00)), this.vectorMagnitude / 6));  // 0.07
            this.cAB.id = "cAB";
            this.cAB.debugColor = "blue";

            this.cBA = vectorAdd(this.B, vectorFromAngle(this.angleRadians - Math.PI + Math.PI * (bogal + gaussianRandAdj(0, 0.00)), this.vectorMagnitude / 6));
            this.cBA.id = "cBA";
            this.cBA.debugColor = "blue";

            this.cCD = vectorAdd(this.C, vectorFromAngle(this.angleRadians - Math.PI + Math.PI * (bogal + gaussianRandAdj(0, 0.0)), this.vectorMagnitude / 6));
            this.cCD.id = "cCD";
            this.cCD.debugColor = "blue";

            this.cDC = vectorAdd(this.D, vectorFromAngle(this.angleRadians - Math.PI * (bogal + gaussianRandAdj(0, 0.0)), this.vectorMagnitude / 6));
            this.cDC.id = "cDC";
            this.cDC.debugColor = "blue";

            this.cBC = vectorAdd(this.B, vectorFromAngle(this.angleRadians - Math.PI * 0.04, 1));
            this.cBC.id = "cBC";
            this.cBC.debugColor = "blue";

            this.cCB = vectorAdd(this.C, vectorFromAngle(this.angleRadians + Math.PI * 0.04, 1));
            this.cCB.id = "cCB";
            this.cCB.debugColor = "blue";

            this.cDA = vectorAdd(this.D, vectorFromAngle(this.angleRadians - Math.PI * 0.82, 1));
            this.cDA.id = "cDA";
            this.cDA.debugColor = "blue";

            this.cAD = vectorAdd(this.A, vectorFromAngle(this.angleRadians + Math.PI * 0.82, 1));
            this.cAD.id = "cAD";
            this.cAD.debugColor = "blue";
        }

        this.showFilledPath();

        // this.randomPath();
        // this.colory = "#5a5a5a8c";
        // this.showFilledPath();

        // this.randomPath();
        // this.colory = "#1a1a1aff";
        // this.showFilledPath();
    }

    randomPath() {
        var redParam = 2;

        var pointList = [
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
            this.end,
            this.start,
        ]

        for (var i = 0; i < pointList.length; i++) {
            // pointList[i] = jitterPoint(pointList[i], 1);
            var subVector = vectorSub(this.center, pointList[i]);
            // console.log(subVector);
            var subVectorLength = Math.abs(vectorLength(subVector));
            // console.log(subVectorLength);
            var redux = {};
            redux.x = subVector.x / subVectorLength * redParam;
            redux.y = subVector.y / subVectorLength * redParam;
            // console.log(redux);

            // no plain vector
            pointList[i].x = pointList[i].x - redux.x;
            pointList[i].y = pointList[i].y - redux.y;
            // this.showDebugPoint(pointList[i]);
            // console.log(pointList[i]);
        }
    }


    drawPath() {

        this.path = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.path.setAttributeNS(null, "id", "pathIdD");
        // this.path.setAttributeNS(null, "filter", "url(#filterPencil)");
        // this.path.setAttributeNS(null, "filter", "url(#fueta)");

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

        // this.path.setAttributeNS(null, "stroke", this.strokeColor);

        // this.path.setAttributeNS(null, "stroke-width", this.strokeWidth);
        // this.path.setAttributeNS(null, "stroke", "black");
        this.path.setAttributeNS(null, "stroke", "none");
        this.path.setAttributeNS(null, "opacity", 1);
        // this.path.setAttributeNS(null, "fill", "none");
        this.path.setAttributeNS(null, "fill", this.colory);

        // svgNode.appendChild(this.newPath);
        group.appendChild(this.path);
    }

    showDebugPoint(point) {

        this.debugPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugPoint.setAttributeNS(null, "id", "");
        this.debugPoint.setAttributeNS(null, "cx", point.x);
        this.debugPoint.setAttributeNS(null, "cy", point.y);
        this.debugPoint.setAttributeNS(null, "r", "0.5");
        this.debugPoint.setAttributeNS(null, "stroke", "none");
        this.debugPoint.setAttributeNS(null, "fill", point.debugColor);
        this.debugPoint.setAttributeNS(null, "stroke-width", 0.01);
        this.debugPoint.setAttributeNS(null, "opacity", 1);

        // const svgNode = document.getElementById('svgNode');
        // svgNode.appendChild(this.debugPoint);

        var group = document.getElementById(this.group);
        group.appendChild(this.debugPoint);
    }

    showDebugText(point) {
        var offset = 2;
        const textSize = "0.1em";

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
            // this.center,
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
            this.end,
            this.start,
        ]

        for (var i = 0; i < pointList.length; i++) {
            this.showDebugPoint(pointList[i]);
            this.showDebugText(pointList[i]);
        }
    }
}