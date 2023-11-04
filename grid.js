class Grid {
    constructor(data) {

        this.shortBoxCount = data.shortBoxCount; // boxes on the shorter side
        this.longSide = data.longSide;
        this.shortSide = data.shortSide;
        this.landscape = data.landscape;

        this.marginBoxCount = Math.round(this.shortBoxCount * 0.09);
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
        // this.showDebug();
        // this.loopdebugCategory();

    }

    createBoxes() {

        var index = 0;
        var stripeIndex = 0;
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

            if (h % 2 == 0) {
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

    showDebug() {
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
}