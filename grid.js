class Grid {
    constructor(data) {

        this.stripeHeight = 2;
        this.marginRelative = 0.09;

        this.shortBoxCount = data.shortBoxCount; // boxes on the shorter side
        this.longSide = data.longSide;
        this.shortSide = data.shortSide;
        this.landscape = data.landscape;

        this.marginBoxCount = Math.round(this.shortBoxCount * this.marginRelative);
        this.boxSize = this.shortSide / this.shortBoxCount;
        this.longBoxCount = Math.floor(this.longSide / this.boxSize);

        // there should be no margin
        this.shortMargin = this.shortSide % this.boxSize;
        // this.shortMargin = 1
        if (this.shortMargin != 0) {
            throw new Error('wtf, there is a margin!');
        }
        this.longMargin = (this.longSide % this.boxSize) / 2;
        // console.log("longMargin: " + this.longMargin);

        if (this.landscape == false) {
            this.widthBoxCount = this.shortBoxCount;
            this.heightBoxCount = this.longBoxCount;
            this.widthMargin = this.shortMargin;
            this.heightMargin = this.longMargin;
        } else {
            this.widthBoxCount = this.longBoxCount;
            this.heightBoxCount = this.shortBoxCount;
            this.widthMargin = this.longMargin;
            this.heightMargin = this.shortMargin;
        }

        this.boxes = [];
        this.lineVectors = {};

        this.createBoxes();
        this.loopCategorize();
        this.createShape();
        // this.showDebugBoxes();
        // this.loopdebugCategory();
        // this.debugShowShape();

        this.createStrokePath();
    }

    createBoxes() {

        var index = 0;
        var stripeIndex = 0;  // which stripe - default 2 boxes height -> 1 stripe
        var inactive = true;

        // h = long, w = short

        for (var h = 0; h < (this.heightBoxCount); h++) {

            for (var w = 0; w < (this.widthBoxCount); w++) {

                var center = { x: this.widthMargin + w * this.boxSize + this.boxSize / 2, y: this.heightMargin + h * this.boxSize + this.boxSize / 2 };

                // corners of the box
                var A = { x: this.widthMargin + w * this.boxSize, y: this.heightMargin + h * this.boxSize };
                var B = vectorAdd(A, { x: this.boxSize, y: 0 });
                var C = vectorAdd(A, { x: this.boxSize, y: this.boxSize });
                var D = vectorAdd(A, { x: 0, y: this.boxSize });

                // var polygonA = insidePolygon([center.x, center.y], polyPoints);
                // var polygonLeft = insidePolygon([center.x, center.y], polyPointsLeft);

                inactive = this.drawSkipMargin(h, w)

                this.boxes.push({
                    "center": center,
                    "A": A,
                    "B": B,
                    "C": C,
                    "D": D,
                    "height": h,
                    "width": w,
                    "index": index,
                    "inactive": inactive,
                    "stripeIndex": stripeIndex,
                    "stripeA": false,
                    "stripeB": false,
                    "stripeC": false,
                    "stripeD": false,
                })
                index += 1;
            }

            if (h % this.stripeHeight == 0) {
                stripeIndex += 1;
            }
        }
        // console.log(this.boxes);
    }

    drawSkipMargin(h, w) {
        if (this.landscape == false) {
            return h < (this.marginBoxCount) ||
                w < (this.marginBoxCount) ||
                w >= (this.shortBoxCount - this.marginBoxCount) ||
                h >= (this.longBoxCount - this.marginBoxCount);
        } else {
            return h < (this.marginBoxCount) ||
                w < (this.marginBoxCount) ||
                w >= (this.longBoxCount - this.marginBoxCount) ||
                h >= (this.shortBoxCount - this.marginBoxCount);
        }
    }

    showDebugBoxes() {
        for (var i = 0; i < this.boxes.length; i++) {

            var colory = "#f06"


            if (this.boxes[i].inactive == true) {
                colory = "#a8a8a8"
            }

            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttributeNS(null, 'x', this.boxes[i].A.x);
            rect.setAttributeNS(null, 'y', this.boxes[i].A.y);
            rect.setAttributeNS(null, 'height', this.boxSize);
            rect.setAttributeNS(null, 'width', this.boxSize);
            rect.setAttributeNS(null, 'stroke', colory);
            rect.setAttributeNS(null, 'stroke-width', '0.5');
            rect.setAttributeNS(null, 'fill', 'none');
            // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

            const svgNode = document.getElementById('svgNode');
            svgNode.appendChild(rect);
        }
    }

    loopCategorize() {
        for (var i = 0; i < this.boxes.length; i++) {

            // add coordinates for 
            if (i > 0 && this.boxes[i].stripeIndex != this.boxes[i - 1].stripeIndex) {

                var even = false;
                if (this.boxes[i].stripeIndex % this.stripeHeight == 0) {
                    even = true;
                }

                this.lineVectors[this.boxes[i].stripeIndex] = {
                    A: {
                        x: "",
                        y: ""
                    },
                    B: {
                        x: "",
                        y: ""
                    },
                    C: {
                        x: "",
                        y: ""
                    },
                    D: {
                        x: "",
                        y: ""
                    },
                    even: even
                };
            }

            // A
            if (
                i != 0 &&
                this.boxes[i - 1].inactive == true &&
                this.boxes[i].inactive == false &&
                this.boxes[i].stripeIndex != this.boxes[i - this.widthBoxCount].stripeIndex
            ) {
                this.boxes[i].stripeA = true;
            }

            // B
            if (
                this.boxes[i].inactive == false &&
                this.boxes[i + 1].inactive == true &&
                this.boxes[i].stripeIndex != this.boxes[i - this.widthBoxCount].stripeIndex
            ) {
                this.boxes[i].stripeB = true;
            }

            // C
            if (
                i != 0 &&
                this.boxes[i - 1].inactive == true &&
                this.boxes[i].inactive == false &&
                this.boxes[i].stripeIndex == this.boxes[i - this.widthBoxCount].stripeIndex
            ) {
                this.boxes[i].stripeC = true;

                // calc the absolute position
                this.lineVectors[this.boxes[i].stripeIndex].C.x = this.boxes[i].width * this.boxSize;
                this.lineVectors[this.boxes[i].stripeIndex].C.y = this.boxes[i].height * this.boxSize + this.boxSize;
            }

            // D
            if (
                this.boxes[i].inactive == false &&
                this.boxes[i + 1].inactive == true &&
                this.boxes[i].stripeIndex == this.boxes[i - this.widthBoxCount].stripeIndex
            ) {
                this.boxes[i].stripeD = true;

                // calc the absolute position
                this.lineVectors[this.boxes[i].stripeIndex].D.x = this.boxes[i].width * this.boxSize + this.boxSize;
                this.lineVectors[this.boxes[i].stripeIndex].D.y = this.boxes[i].height * this.boxSize + this.boxSize;
            }

        }

        // console.log(this.lineVectors)
    }

    loopdebugCategory() {

        for (var v = 0; v < this.boxes.length; v++) {

            if (this.boxes[v].stripeIndex % this.stripeHeight == 0 && this.boxes[v].inactive == false) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                // rect.setAttributeNS(null, 'stroke', '#1100ff');
                // rect.setAttributeNS(null, 'stroke-width', '0.5');
                rect.setAttributeNS(null, 'fill', 'blue');
                // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // A
            if (this.boxes[v].stripeA == true) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'fill', '#00ff80');

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // B
            if (this.boxes[v].stripeB == true) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'fill', '#e100ff');

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // C
            if (this.boxes[v].stripeC == true) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'fill', '#ff0000');

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // D
            if (this.boxes[v].stripeD == true) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'fill', '#eeff00');

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }
        }
    }

    createShape() {

        this.shapeZ = {};

        var XCalc = Math.round(this.longBoxCount / 12 * 2);
        var YCalc = 7 * this.stripeHeight + 1;
        var YCalcHeight = 7;

        // var ACountX = 40;
        var ACountX = XCalc;
        var ACounty = YCalc;
        var CCountX = this.longBoxCount - XCalc;
        var CCountY = YCalc + YCalcHeight;

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == ACountX && this.boxes[i].height == ACounty) {
                this.shapeZ.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == CCountX && this.boxes[i].height == ACounty) {
                this.shapeZ.B = this.boxes[i].B;
            }

            if (this.boxes[i].width == CCountX && this.boxes[i].height == CCountY) {
                this.shapeZ.C = this.boxes[i].C;
            }

            if (this.boxes[i].width == ACountX && this.boxes[i].height == CCountY) {
                this.shapeZ.D = this.boxes[i].D;
            }
        }

        this.shapeZ.pointString = `
        ${this.shapeZ.A.x}, ${this.shapeZ.A.y}
        ${this.shapeZ.B.x}, ${this.shapeZ.B.y}
        ${this.shapeZ.C.x}, ${this.shapeZ.C.y}
        ${this.shapeZ.D.x}, ${this.shapeZ.D.y}
        `;

        this.shapeZ.pointList = [
            [this.shapeZ.A.x, this.shapeZ.A.y],
            [this.shapeZ.B.x, this.shapeZ.B.y],
            [this.shapeZ.C.x, this.shapeZ.C.y],
            [this.shapeZ.D.x, this.shapeZ.D.y]
        ];
    }

    debugShowShape() {

        var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shapsn.setAttributeNS(null, 'points', this.shapeZ.pointList);
        shapsn.setAttributeNS(null, 'fill', "none");
        shapsn.setAttributeNS(null, 'stroke', "black");
        shapsn.setAttributeNS(null, "stroke-width", 0.5);

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(shapsn);

    }

    createStrokePath() {

        this.stepCount = 350; // how many strokePaths per stripe
        this.angleRadiansStart = - Math.PI / 2 + 0.3;  // starting angle

        // loop through the lines
        for (const [key, value] of Object.entries(this.lineVectors)) {

            // skip empty entries, margin
            if (value.C.x != "") {

                var start = value.C
                var end = value.D
                var startEnd = vectorSub(start, end);
                var loopDensity = 1 // how many strokes per point - density, default 1 loop
                var angleRadians = this.angleRadiansStart;
                var angleRadiansLooped = 0;

                // different for each odd and even line
                if (value.even == true) {
                    angleRadians += - Math.PI / 5;
                }

                for (var i = 0; i < this.stepCount; i++) {
                    var positionX = start.x + i * startEnd.x / this.stepCount;
                    var positionY = start.y + i * startEnd.y / this.stepCount;

                    var positionMiddleLineY = Math.round(positionY - this.boxSize * this.stripeHeight / 2);

                    if (pointInPolygon(this.shapeZ.pointList, [positionX, positionMiddleLineY])) {
                        loopDensity = 1; // 2
                    } else {
                        loopDensity = 1
                    }

                    for (var d = 0; d < loopDensity; d++) {

                        if (d >= 1) {
                            if (value.even == true) {
                                angleRadiansLooped = angleRadians + Math.PI / 5;
                            } else {
                                angleRadiansLooped = angleRadians - Math.PI / 5;
                            }
                        } else {
                            angleRadiansLooped = angleRadians
                        }


                        var singleStroke = new strokePath({
                            "start": {
                                x: positionX,
                                y: positionY
                            },
                            vectorMagnitude: 25,
                            angleRadians: angleRadiansLooped, // 0.2,
                            strokeColor: "black",
                            strokeColorAction: "#ff0000",
                            shape: this.shapeZ.pointList,
                        });

                        singleStroke.showPath();
                    }
                }
            }
        }
    }
}