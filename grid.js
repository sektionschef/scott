class Grid {
    constructor(data) {
        this.stripeHeight = data.stripeHeight;
        this.vectorMagnitude = data.vectorMagnitude;
        this.marginRelative = data.marginRelative;

        this.stepCount = data.stepCount; // 350 // how many strokePaths per stripe
        this.angleRadiansStart = data.angleRadiansStart;  // starting angle
        this.angleRadiansGain = data.angleRadiansGain;  // adding/reducing each line
        this.strokeColor = data.strokeColor;
        this.strokeWidth = data.strokeWidth;
        this.shortBoxCount = data.shortBoxCount; // boxes on the shorter side
        this.longSide = data.longSide;
        this.shortSide = data.shortSide;
        this.landscape = data.landscape;
        this.group = data.group;

        this.marginBoxCount = Math.round(this.stripeHeight * this.marginRelative);
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
            this.canvasWidth = this.shortSide;
            this.canvasHeight = this.longSide;
        } else {
            this.widthBoxCount = this.longBoxCount;
            this.heightBoxCount = this.shortBoxCount;
            this.widthMargin = this.longMargin;
            this.heightMargin = this.shortMargin;
            this.canvasWidth = this.longSide;
            this.canvasHeight = this.shortSide;
        }

        this.boxes = [];
        this.lineVectors = {};
        this.pathCandidates = [];

        this.createBoxes();
        // this.showDebugBoxes();
        this.loopCategorize();
        // this.loopdebugCategory();

        this.shapes = new shapes(
            this.stripeHeight,
            this.canvasWidth,
            this.canvasHeight
        );
        this.shapes.defineBorders(this.boxes);
        // this.shapes.debugShowShape();
        // this.shapes.fillShape();

        this.strokesplitter = new strokeSplitter({
            allShapes: this.shapes.allShapes,
        });


        this.createStrokePath();
        this.strokesplitter.run();
        this.strokesplitter.showPaths(this.group);

        // var posX = 610;
        // var posY = 270;

        // // sau
        // var debugStroke = new strokePath({
        //     "center": {
        //         x: posX,
        //         y: posY
        //     },
        //     vectorMagnitude: this.vectorMagnitude,
        //     angleRadians: Math.PI / 2.5, // 0.2,
        //     strokeColor: this.strokeColor,
        //     allShapes: this.allShapes,
        //     loop: 0,
        // });

        // debugStroke.showPath();

        // for (var c = 0; c < 2; c++) {

        //     var debugStroke2 = new strokePath({
        //         "center": {
        //             x: posX,
        //             y: posY
        //         },
        //         vectorMagnitude: this.vectorMagnitude,
        //         angleRadians: Math.PI / 2.5 + c * 0.5, // 0.2,
        //         strokeColor: this.strokeColor,
        //         allShapes: this.allShapes,
        //         loop: 0,
        //     });

        //     debugStroke2.showPath();
        // }
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
                if (this.boxes[i].stripeIndex % 2 == 0) {
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

            if (this.boxes[v].stripeIndex % 2 == 0 && this.boxes[v].inactive == false) {
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

    createStrokePath() {

        var loopMax = 4;

        // loop through the lines
        for (const [key, value] of Object.entries(this.lineVectors)) {

            var angleRadians = this.angleRadiansStart;
            // var angleRadiansStart = Math.PI / 2;
            var angleRadians = 0;

            // change per line
            if (value.even == true) {
                angleRadians = this.angleRadiansStart + this.angleRadiansGain;//+ Math.PI / 5;
            } else {
                angleRadians = this.angleRadiansStart - this.angleRadiansGain;//- Math.PI / 5;
            }

            // skip empty entries, margin
            if (value.C.x != "") {

                var start = value.C
                var end = value.D
                var startEnd = vectorSub(start, end);

                for (var i = 0; i < this.stepCount; i++) {

                    var positionX = start.x + i * startEnd.x / this.stepCount;
                    var positionY = start.y + i * startEnd.y / this.stepCount;

                    // reference for being in shape is the middle of the stripe
                    var positionMiddleLineY = Math.round(positionY - this.boxSize * this.stripeHeight / 2);

                    for (var v = 1; v <= loopMax; v++) {

                        // first loop
                        if (v == 0) {
                            var angleRadiansLooped = angleRadians;
                        } else if (v % 2 == 1 && value.even == true) {
                            // var angleRadiansLooped = angleRadians - 2 * Math.PI / 5;
                            var angleRadiansLooped = angleRadians - 2 * this.angleRadiansGain;
                        } else if (v % 2 == 1 && value.even == false) {
                            // var angleRadiansLooped = angleRadians + 2 * Math.PI / 5;
                            var angleRadiansLooped = angleRadians + 2 * this.angleRadiansGain;
                        } else if (v % 2 == 0 && value.even == true) {
                            var angleRadiansLooped = angleRadians;
                        } else if (v % 2 == 0 && value.even == false) {
                            var angleRadiansLooped = angleRadians;
                        }

                        this.strokesplitter.add({
                            "center": {
                                x: positionX,
                                y: positionMiddleLineY
                            },
                            vectorMagnitude: this.vectorMagnitude,
                            angleRadians: angleRadiansLooped, // 0.2,
                            strokeColor: this.strokeColor,
                            strokeWidth: this.strokeWidth,
                            // allShapes: this.allShapes,
                            currentLoop: v,
                            group: this.group,
                        })
                    }
                }
            }
        }
    }
}
