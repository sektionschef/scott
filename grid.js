class Grid {
    constructor(data) {
        this.stripeHeight = data.stripeHeight;  // rows with odd and even
        this.vectorMagnitude = data.vectorMagnitude;  // length of the vecotr/drawn strokes
        this.marginRelative = data.marginRelative;  // margin relative to the height of the stripes (stripeHeight)

        this.stepCountRes = data.stepCountRes; // 350 // how many vectors/drawn strokes per stripe
        this.angleRadiansStart = data.angleRadiansStart;  // starting angle
        this.angleRadiansGain = data.angleRadiansGain;  // adding/reducing each line
        this.strokeColor = data.strokeColor;
        this.strokeWidth = data.strokeWidth;
        this.shortBoxCount = data.shortBoxCount; // boxes on the shorter side - the resolution of the 
        this.longSide = data.longSide;
        this.shortSide = data.shortSide;
        this.landscape = data.landscape;
        this.group = data.group;  // where to draw the things

        if (this.marginRelative == 0) {
            this.marginBoxCount = 0;
        } else {
            this.marginBoxCount = Math.round(this.stripeHeight * this.marginRelative);
        }
        this.boxSize = this.shortSide / this.shortBoxCount;
        this.longBoxCount = Math.floor(this.longSide / this.boxSize);

        // there should be no margin
        this.shortMargin = this.shortSide % this.boxSize;
        // console.log(this.shortMargin);
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
        // this.debugShowCategory();

        // GLOBAL
        this.strokeSystem = new strokeSystem({
            allShapes: SHAPES,
        });

        this.createStrokeLines();
        this.strokeSystem.run();
        this.strokeSystem.showPaths(this.group);
    }

    createBoxes() {

        var index = 0;  // index of the box
        this.stripeIndex = 0;  // which stripe - default 2 boxes height -> 1 stripe
        var margin = true;  // boxes positioned in the margin

        // h = long, w = short

        for (var h = 0; h < (this.heightBoxCount); h++) {

            for (var w = 0; w < (this.widthBoxCount); w++) {

                var center = { x: this.widthMargin + w * this.boxSize + this.boxSize / 2, y: this.heightMargin + h * this.boxSize + this.boxSize / 2 };
                margin = this.checkMargin(h, w)

                // corners of the box
                var A = { x: this.widthMargin + w * this.boxSize, y: this.heightMargin + h * this.boxSize };
                var B = vectorAdd(A, { x: this.boxSize, y: 0 });
                var C = vectorAdd(A, { x: this.boxSize, y: this.boxSize });
                var D = vectorAdd(A, { x: 0, y: this.boxSize });

                this.boxes.push({
                    "center": center,
                    "A": A,
                    "B": B,
                    "C": C,
                    "D": D,
                    "height": h,
                    "width": w,
                    "index": index,
                    "margin": margin,
                    "stripeIndex": this.stripeIndex,
                    "stripeA": false,
                    "stripeB": false,
                    "stripeC": false,
                    "stripeD": false,
                })
                index += 1;
            }

            // make sure it the first row is not skipped
            if (h % this.stripeHeight == (this.stripeHeight - 1)) {
                this.stripeIndex += 1;
            }
        }
        // console.log(this.boxes);

        // console.log(this.stripeIndex);
    }

    checkMargin(h, w) {

        if (this.marginBoxCount == 0) {
            return false;
        }


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

            if (this.boxes[i].margin == true) {
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

        // var debugLineIndex = 0;

        for (var i = 0; i < this.boxes.length; i++) {

            // add coordinates for 
            if (
                i == 0 ||
                this.boxes[i].stripeIndex != this.boxes[i - 1].stripeIndex
            ) {
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

                // console.log(debugLineIndex)
                // debugLineIndex += 1;
            }

            // A - box representing upper left of stripe
            if (
                i != 0  // making sure i-1 throws no error
            ) {
                if (
                    (
                        (this.boxes[i - 1].margin == true && this.boxes[i].margin == false ||  // check for margin
                            this.boxes[i].width == 0 && this.marginBoxCount == 0) &&  // check if no margin
                        this.boxes[i].stripeIndex != this.boxes[i - this.widthBoxCount].stripeIndex
                    )
                ) {
                    this.boxes[i].stripeA = true;
                }
            } else if (i == 0 && this.boxes[i].margin == false) {
                this.boxes[i].stripeA = true;
            }

            // B upper right of stripe
            if (
                i + 1 != this.boxes.length &&
                i != 0
            ) {
                if (
                    (
                        this.boxes[i].margin == false && this.boxes[i + 1].margin == true ||  // check for margin
                        this.boxes[i].width == this.widthBoxCount - 1 && this.marginBoxCount == 0
                    ) &&  // or for no margin and end of row
                    (i == this.widthBoxCount - 1 || this.boxes[i].stripeIndex != this.boxes[i - this.widthBoxCount].stripeIndex)
                ) {
                    this.boxes[i].stripeB = true;
                }
            }

            // C - lower left of row
            if (
                i > 0 &&
                i <= (this.boxes.length - this.widthBoxCount)
            ) {
                if (
                    (
                        this.boxes[i - 1].margin == true && this.boxes[i].margin == false ||
                        this.boxes[i].width == 0 && this.marginBoxCount == 0
                    ) && (
                        i == this.boxes.length - this.widthBoxCount ||
                        this.boxes[i + this.widthBoxCount].stripeIndex != this.boxes[i].stripeIndex
                    )
                ) {
                    this.boxes[i].stripeC = true;

                    // calc the absolute position
                    this.lineVectors[this.boxes[i].stripeIndex].C.x = this.boxes[i].width * this.boxSize;
                    this.lineVectors[this.boxes[i].stripeIndex].C.y = this.boxes[i].height * this.boxSize + this.boxSize;
                }
            }

            // D - lower right
            if (
                i >= this.widthBoxCount + 1
            ) {
                if (
                    (
                        this.boxes[i].width == this.widthBoxCount - 1 && this.marginBoxCount == 0 ||
                        this.boxes[i].margin == false && this.boxes[i + 1].margin == true
                    ) && (
                        i + 1 == this.boxes.length ||
                        this.boxes[i + this.widthBoxCount].stripeIndex != this.boxes[i].stripeIndex
                    )
                ) {
                    this.boxes[i].stripeD = true;

                    // calc the absolute position
                    this.lineVectors[this.boxes[i].stripeIndex].D.x = this.boxes[i].width * this.boxSize + this.boxSize;
                    this.lineVectors[this.boxes[i].stripeIndex].D.y = this.boxes[i].height * this.boxSize + this.boxSize;
                }
            }

        }

        // console.log(this.lineVectors)
    }

    debugShowCategory() {

        for (var v = 0; v < this.boxes.length; v++) {

            // even lines
            if (this.boxes[v].stripeIndex % 2 == 0 && this.boxes[v].margin == false) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'stroke', 'None');
                // rect.setAttributeNS(null, 'stroke-width', '0.5');
                rect.setAttributeNS(null, 'fill', '#0000ff21');
                // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // odd lines
            if (this.boxes[v].stripeIndex % 2 == 1 && this.boxes[v].margin == false) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                rect.setAttributeNS(null, 'stroke', 'None');
                // rect.setAttributeNS(null, 'stroke-width', '0.5');
                rect.setAttributeNS(null, 'fill', '#ffe60021');
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
                rect.setAttributeNS(null, 'fill', '#1100ff');

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }
        }
    }

    createStrokeLines() {

        var loopMax = 2;  // how many runs, for cross-hatching
        var boxIndex = 0;

        // loop through the lines
        for (const [key, value] of Object.entries(this.lineVectors)) {

            var angleRadians = 0;

            // change per line
            if (value.even == true) {
                angleRadians = this.angleRadiansStart + this.angleRadiansGain;
            } else {
                angleRadians = this.angleRadiansStart - this.angleRadiansGain;
            }

            // skip empty entries, margin
            if (value.C.x != "") {

                var start = value.C
                var end = value.D
                var startEnd = vectorSub(start, end);

                for (var i = 0; i < this.stepCountRes; i++) {

                    var positionX = start.x + i * startEnd.x / this.stepCountRes;
                    var positionY = start.y + i * startEnd.y / this.stepCountRes;

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

                        this.strokeSystem.add({
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
                            boxIndex: boxIndex,
                            group: this.group,
                        })

                    }
                    boxIndex += 1;
                }
            }
        }
    }
}
