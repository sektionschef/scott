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
        this.createShapes();
        this.showDebugBoxes();
        // this.loopdebugCategory();
        this.debugShowShape();

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

    createShapes() {

        this.shapeMain = {};
        this.shapeShadA = {};  // shadow beneath
        this.shapeShadB = {};  // shadow beneath

        var shapeMainHeight = 7;
        var shadAheight = 4;
        var shadAshift = 8;

        var MainAX = Math.round(this.longBoxCount / 24 * 6);
        var MainAY = 7 * this.stripeHeight + 1;
        var MainCX = this.longBoxCount - MainAX;
        var MainCY = MainAY + shapeMainHeight;

        var ShadAAY = MainAY + shapeMainHeight + 1;

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == MainAX && this.boxes[i].height == MainAY) {
                this.shapeMain.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == MainAY) {
                this.shapeMain.B = this.boxes[i].B;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == MainCY) {
                this.shapeMain.C = this.boxes[i].C;
            }

            if (this.boxes[i].width == MainAX && this.boxes[i].height == MainCY) {
                this.shapeMain.D = this.boxes[i].D;
            }
        }

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == MainAX && this.boxes[i].height == ShadAAY) {
                this.shapeShadA.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == ShadAAY) {
                this.shapeShadA.B = this.boxes[i].B;
            }

            if (this.boxes[i].width == (MainCX + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.shapeShadA.C = this.boxes[i].C;
            }

            if (this.boxes[i].width == (MainAX + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.shapeShadA.D = this.boxes[i].D;
            }
        }

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == (MainCX + 1) && this.boxes[i].height == MainAY) {
                this.shapeShadB.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == MainAY + shadAheight) {
                this.shapeShadB.B = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.shapeShadB.C = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1) && this.boxes[i].height == MainCY) {
                this.shapeShadB.D = this.boxes[i].D;
            }
        }

        this.shapeMain.pointString = `
        ${this.shapeMain.A.x}, ${this.shapeMain.A.y}
        ${this.shapeMain.B.x}, ${this.shapeMain.B.y}
        ${this.shapeMain.C.x}, ${this.shapeMain.C.y}
        ${this.shapeMain.D.x}, ${this.shapeMain.D.y}
        `;
        this.shapeShadA.pointString = `
        ${this.shapeShadA.A.x}, ${this.shapeShadA.A.y}
        ${this.shapeShadA.B.x}, ${this.shapeShadA.B.y}
        ${this.shapeShadA.C.x}, ${this.shapeShadA.C.y}
        ${this.shapeShadA.D.x}, ${this.shapeShadA.D.y}
        `;
        this.shapeShadB.pointString = `
        ${this.shapeShadB.A.x}, ${this.shapeShadB.A.y}
        ${this.shapeShadB.B.x}, ${this.shapeShadB.B.y}
        ${this.shapeShadB.C.x}, ${this.shapeShadB.C.y}
        ${this.shapeShadB.D.x}, ${this.shapeShadB.D.y}
        `;


        this.shapeMain.pointList = [
            [this.shapeMain.A.x, this.shapeMain.A.y],
            [this.shapeMain.B.x, this.shapeMain.B.y],
            [this.shapeMain.C.x, this.shapeMain.C.y],
            [this.shapeMain.D.x, this.shapeMain.D.y]
        ];
        this.shapeShadA.pointList = [
            [this.shapeShadA.A.x, this.shapeShadA.A.y],
            [this.shapeShadA.B.x, this.shapeShadA.B.y],
            [this.shapeShadA.C.x, this.shapeShadA.C.y],
            [this.shapeShadA.D.x, this.shapeShadA.D.y]
        ];
        this.shapeShadB.pointList = [
            [this.shapeShadB.A.x, this.shapeShadB.A.y],
            [this.shapeShadB.B.x, this.shapeShadB.B.y],
            [this.shapeShadB.C.x, this.shapeShadB.C.y],
            [this.shapeShadB.D.x, this.shapeShadB.D.y]
        ];

    }

    debugShowShape() {

        const svgNode = document.getElementById('svgNode');

        var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shapsn.setAttributeNS(null, 'points', this.shapeMain.pointList);
        shapsn.setAttributeNS(null, 'fill', "none");
        shapsn.setAttributeNS(null, 'stroke', "black");
        shapsn.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shapsn);

        var shadnA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shadnA.setAttributeNS(null, 'points', this.shapeShadA.pointList);
        shadnA.setAttributeNS(null, 'fill', "none");
        shadnA.setAttributeNS(null, 'stroke', "black");
        shadnA.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shadnA);

        var shadnB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shadnB.setAttributeNS(null, 'points', this.shapeShadB.pointList);
        shadnB.setAttributeNS(null, 'fill', "none");
        shadnB.setAttributeNS(null, 'stroke', "black");
        shadnB.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shadnB);

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

                    if (pointInPolygon(this.shapeMain.pointList, [positionX, positionMiddleLineY])) {
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
                            shape: this.shapeMain.pointList,
                        });

                        singleStroke.showPath();
                    }
                }
            }
        }
    }
}