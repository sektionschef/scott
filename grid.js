class Grid {
    constructor(data) {

        this.stripeHeight = 2;
        this.marginRelative = 0.09;
        this.strokeColor = "#272727";
        this.strokeColorAction = "#272727";

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
        // this.loopdebugCategory();
        // this.debugShowShape();
        // this.showDebugBoxes();

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
            rect.setAttributeNS(null, 'stroke-width', '0.1');
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

        this.allShapes = {
            shapeMain: {
                shapeLoop: 2,
                // colorAction: "red",
                colorAction: this.strokeColorAction,
            },
            shapeShadA: {  // shadow beneath
                shapeLoop: 3,
                // colorAction: "#790000",
                colorAction: this.strokeColorAction,
            },
            shapeShadB: {  // shadow beneath
                shapeLoop: 4,
                // colorAction: "#6e0000",
                colorAction: this.strokeColorAction,
            },
            shapeShadow: {  // shadow
                shapeLoop: 1,
                colorAction: "#15ff00",
                // colorAction: this.strokeColorAction,
            }
        }

        var MainAX = 35;
        var shapeMainHeight = 7;
        var shadAheight = 5;
        var shadAshift = 7;
        var superShadowShift = 25;  // maybe last box
        var superShadowHeight = 16;
        var superShadowHeightMax = 20;

        var MainAY = 7 * this.stripeHeight + 1;
        var MainCX = this.longBoxCount - MainAX;
        var MainCY = MainAY + shapeMainHeight;

        var ShadAAY = MainAY + shapeMainHeight + 1;

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == MainAX && this.boxes[i].height == MainAY) {
                this.allShapes.shapeMain.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == MainAY) {
                this.allShapes.shapeMain.B = this.boxes[i].B;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == MainCY) {
                this.allShapes.shapeMain.C = this.boxes[i].C;
            }

            if (this.boxes[i].width == MainAX && this.boxes[i].height == MainCY) {
                this.allShapes.shapeMain.D = this.boxes[i].D;
            }
        }

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == MainAX && this.boxes[i].height == ShadAAY) {
                this.allShapes.shapeShadA.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == MainCX && this.boxes[i].height == ShadAAY) {
                this.allShapes.shapeShadA.B = this.boxes[i].B;
            }

            if (this.boxes[i].width == (MainCX + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.allShapes.shapeShadA.C = this.boxes[i].C;
            }

            if (this.boxes[i].width == (MainAX + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.allShapes.shapeShadA.D = this.boxes[i].D;
            }
        }

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == (MainCX + 1) && this.boxes[i].height == MainAY) {
                this.allShapes.shapeShadB.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == MainAY + shadAheight) {
                this.allShapes.shapeShadB.B = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.allShapes.shapeShadB.C = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1) && this.boxes[i].height == MainCY) {
                this.allShapes.shapeShadB.D = this.boxes[i].D;
            }
        }

        for (var i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].width == (MainAX + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight + 1)) {
                this.allShapes.shapeShadow.A = this.boxes[i].A;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == (ShadAAY + shadAheight)) {
                this.allShapes.shapeShadow.B = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift) && this.boxes[i].height == (MainAY + shadAheight)) {
                this.allShapes.shapeShadow.C = this.boxes[i].D;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift + superShadowShift) && this.boxes[i].height == MainCY + superShadowHeight) {
                this.allShapes.shapeShadow.D = this.boxes[i].B;
            }

            if (this.boxes[i].width == (MainCX + 1 + shadAshift + superShadowShift) && this.boxes[i].height == MainCY + superShadowHeight + superShadowHeightMax) {
                this.allShapes.shapeShadow.E = this.boxes[i].C;
            }
        }

        this.allShapes.shapeMain.pointString = `
        ${this.allShapes.shapeMain.A.x}, ${this.allShapes.shapeMain.A.y}
        ${this.allShapes.shapeMain.B.x}, ${this.allShapes.shapeMain.B.y}
        ${this.allShapes.shapeMain.C.x}, ${this.allShapes.shapeMain.C.y}
        ${this.allShapes.shapeMain.D.x}, ${this.allShapes.shapeMain.D.y}
        `;
        this.allShapes.shapeShadA.pointString = `
        ${this.allShapes.shapeShadA.A.x}, ${this.allShapes.shapeShadA.A.y}
        ${this.allShapes.shapeShadA.B.x}, ${this.allShapes.shapeShadA.B.y}
        ${this.allShapes.shapeShadA.C.x}, ${this.allShapes.shapeShadA.C.y}
        ${this.allShapes.shapeShadA.D.x}, ${this.allShapes.shapeShadA.D.y}
        `;
        this.allShapes.shapeShadB.pointString = `
        ${this.allShapes.shapeShadB.A.x}, ${this.allShapes.shapeShadB.A.y}
        ${this.allShapes.shapeShadB.B.x}, ${this.allShapes.shapeShadB.B.y}
        ${this.allShapes.shapeShadB.C.x}, ${this.allShapes.shapeShadB.C.y}
        ${this.allShapes.shapeShadB.D.x}, ${this.allShapes.shapeShadB.D.y}
        `;
        this.allShapes.shapeShadow.pointString = `
        ${this.allShapes.shapeShadow.A.x}, ${this.allShapes.shapeShadow.A.y}
        ${this.allShapes.shapeShadow.B.x}, ${this.allShapes.shapeShadow.B.y}
        ${this.allShapes.shapeShadow.C.x}, ${this.allShapes.shapeShadow.C.y}
        ${this.allShapes.shapeShadow.D.x}, ${this.allShapes.shapeShadow.D.y}
        ${this.allShapes.shapeShadow.E.x}, ${this.allShapes.shapeShadow.E.y}
        `;


        this.allShapes.shapeMain.pointList = [
            [this.allShapes.shapeMain.A.x, this.allShapes.shapeMain.A.y],
            [this.allShapes.shapeMain.B.x, this.allShapes.shapeMain.B.y],
            [this.allShapes.shapeMain.C.x, this.allShapes.shapeMain.C.y],
            [this.allShapes.shapeMain.D.x, this.allShapes.shapeMain.D.y]
        ];
        this.allShapes.shapeShadA.pointList = [
            [this.allShapes.shapeShadA.A.x, this.allShapes.shapeShadA.A.y],
            [this.allShapes.shapeShadA.B.x, this.allShapes.shapeShadA.B.y],
            [this.allShapes.shapeShadA.C.x, this.allShapes.shapeShadA.C.y],
            [this.allShapes.shapeShadA.D.x, this.allShapes.shapeShadA.D.y]
        ];
        this.allShapes.shapeShadB.pointList = [
            [this.allShapes.shapeShadB.A.x, this.allShapes.shapeShadB.A.y],
            [this.allShapes.shapeShadB.B.x, this.allShapes.shapeShadB.B.y],
            [this.allShapes.shapeShadB.C.x, this.allShapes.shapeShadB.C.y],
            [this.allShapes.shapeShadB.D.x, this.allShapes.shapeShadB.D.y]
        ];
        this.allShapes.shapeShadow.pointList = [
            [this.allShapes.shapeShadow.A.x, this.allShapes.shapeShadow.A.y],
            [this.allShapes.shapeShadow.B.x, this.allShapes.shapeShadow.B.y],
            [this.allShapes.shapeShadow.C.x, this.allShapes.shapeShadow.C.y],
            [this.allShapes.shapeShadow.D.x, this.allShapes.shapeShadow.D.y],
            [this.allShapes.shapeShadow.E.x, this.allShapes.shapeShadow.E.y]
        ];

        // this.shapes = [
        //     this.shapeMain.pointList,
        //     this.shapeShadA.pointList,
        //     this.shapeShadB.pointList,
        //     this.shapeShadow.pointList,
        // ]
    }

    debugShowShape() {

        const svgNode = document.getElementById('svgNode');

        var shapsn = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shapsn.setAttributeNS(null, 'points', this.allShapes.shapeMain.pointList);
        shapsn.setAttributeNS(null, 'fill', "none");
        shapsn.setAttributeNS(null, 'stroke', "black");
        shapsn.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shapsn);

        var shadnA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shadnA.setAttributeNS(null, 'points', this.allShapes.shapeShadA.pointList);
        shadnA.setAttributeNS(null, 'fill', "none");
        shadnA.setAttributeNS(null, 'stroke', "black");
        shadnA.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shadnA);

        var shadnB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shadnB.setAttributeNS(null, 'points', this.allShapes.shapeShadB.pointList);
        shadnB.setAttributeNS(null, 'fill', "none");
        shadnB.setAttributeNS(null, 'stroke', "black");
        shadnB.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(shadnB);

        var superShadow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        superShadow.setAttributeNS(null, 'points', this.allShapes.shapeShadow.pointList);
        superShadow.setAttributeNS(null, 'fill', "none");
        superShadow.setAttributeNS(null, 'stroke', "#000000");
        superShadow.setAttributeNS(null, "stroke-width", 0.5);

        svgNode.appendChild(superShadow);

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
                var loopDensity = 0 // how many strokes per point - density, default 1 loop
                var pointList = [];
                var colorAction = "";
                var angleRadians = this.angleRadiansStart;
                var angleRadiansLooped = 0;

                // different for each odd and even line
                if (value.even == true) {
                    angleRadians += - Math.PI / 5;
                }

                for (var i = 0; i < this.stepCount; i++) {

                    angleRadiansLooped = angleRadians;
                    var positionX = start.x + i * startEnd.x / this.stepCount;
                    var positionY = start.y + i * startEnd.y / this.stepCount;

                    // reference for being in shape is the middle of the stripe
                    var positionMiddleLineY = Math.round(positionY - this.boxSize * this.stripeHeight / 2);

                    // check if in shape
                    // if (pointInPolygon(this.shapeMain.pointList, [positionX, positionMiddleLineY])) {
                    //     loopDensity = this.shapeMain.shapeLoop;
                    //     pointList = this.shapeMain.pointList;
                    //     colorAction = this.shapeMain.colorAction;
                    // } else if (pointInPolygon(this.shapeShadA.pointList, [positionX, positionMiddleLineY])) {
                    //     loopDensity = this.shapeShadA.shapeLoop;
                    //     pointList = this.shapeShadA.pointList;
                    //     colorAction = this.shapeShadA.colorAction;
                    // } else if (pointInPolygon(this.shapeShadB.pointList, [positionX, positionMiddleLineY])) {
                    //     loopDensity = this.shapeShadB.shapeLoop;
                    //     pointList = this.shapeShadB.pointList;
                    //     colorAction = this.shapeShadB.colorAction;
                    // } else if (pointInPolygon(this.shapeShadow.pointList, [positionX, positionMiddleLineY])) {
                    //     loopDensity = this.shapeShadow.shapeLoop;
                    //     pointList = this.shapeShadow.pointList;
                    //     colorAction = this.shapeShadow.colorAction;
                    // } else {
                    //     loopDensity = 1;
                    //     colorAction = "#0077ff";
                    // }

                    // var loopSwitch = false;

                    // for (var d = 0; d < loopDensity; d++) {

                    //     if (d >= 1) {
                    //         loopSwitch = true;
                    //         if (value.even == true) {
                    //             angleRadiansLooped = angleRadians + Math.PI / 5;
                    //         } else {
                    //             angleRadiansLooped = angleRadians - Math.PI / 5;
                    //         }
                    //     } else {
                    //         angleRadiansLooped = angleRadians
                    //     }

                    var singleStroke = new strokePath({
                        "center": {
                            x: positionX,
                            // y: positionY
                            y: positionMiddleLineY
                        },
                        vectorMagnitude: 23,
                        // angleRadians: angleRadiansLooped, // 0.2,
                        angleRadians: angleRadians, // 0.2,
                        strokeColor: this.strokeColor,
                        // strokeColorAction: colorAction,
                        // shape: pointList,
                        allShapes: this.allShapes,
                        loop: 0,
                    });

                    singleStroke.showPath();


                    // if in polygon
                    if (singleStroke.inside !== undefined) {
                        var loopCount = this.allShapes[singleStroke.inside].shapeLoop;
                        // if only 1 loop, skip
                        if (loopCount <= 1) {
                            continue;
                        }

                        // start later with 1
                        for (var v = 1; v < loopCount; v++) {

                            if (value.even == true) {
                                angleRadiansLooped = angleRadians + Math.PI / 5;
                            } else {
                                angleRadiansLooped = angleRadians - Math.PI / 5;
                            }

                            var singleStroke = new strokePath({
                                "center": {
                                    x: positionX,
                                    y: positionMiddleLineY
                                },
                                vectorMagnitude: 23,
                                // angleRadians: Math.PI / 6 + 0.3 * v, // 0.2,
                                angleRadians: angleRadiansLooped, // 0.2,
                                strokeColor: this.strokeColor,
                                allShapes: this.allShapes,
                                loop: v,
                            });

                            singleStroke.showPath();
                        }
                    };
                }
                // }
            }
        }
    }
}