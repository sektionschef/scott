class Grid {
    constructor(data) {

        this.shortBoxCount = data.shortBoxCount; // boxes on the shorter side
        this.longSide = data.longSide;
        this.shortSide = data.shortSide;
        this.landscape = data.landscape;

        this.DEBUG = true;
        this.marginBoxCount = Math.round(this.shortBoxCount * 0.08);
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

        this.createBoxes();
        if (this.DEBUG) {
            this.showDebug();
        }
        this.loop();

    }

    createBoxes() {

        var index = 0;
        var stripeIndex = 0;

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

                this.boxes.push({
                    "center": center,
                    "A": A,
                    "B": B,
                    "C": C,
                    "D": D,
                    "height": h,
                    "width": w,
                    "index": index,
                    "active": false,
                    "stripeIndex": stripeIndex,
                })
                index += 1;
            }

            if (h % 2 == 0) {
                stripeIndex += 1;
            }
        }
    }

    drawSkipMargin(box) {
        if (this.landscape == false) {
            return box.height < (this.marginBoxCount) ||
                box.width < (this.marginBoxCount) ||
                box.width >= (this.shortBoxCount - this.marginBoxCount) ||
                box.height >= (this.longBoxCount - this.marginBoxCount);
        } else {
            return box.height < (this.marginBoxCount) ||
                box.width < (this.marginBoxCount) ||
                box.width >= (this.longBoxCount - this.marginBoxCount) ||
                box.height >= (this.shortBoxCount - this.marginBoxCount);
        }
    }

    showDebug() {
        for (var i = 0; i < this.boxes.length; i++) {

            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttributeNS(null, 'x', this.boxes[i].A.x);
            rect.setAttributeNS(null, 'y', this.boxes[i].A.y);
            rect.setAttributeNS(null, 'height', this.boxSize);
            rect.setAttributeNS(null, 'width', this.boxSize);
            rect.setAttributeNS(null, 'stroke', '#f06');
            rect.setAttributeNS(null, 'stroke-width', '0.5');
            rect.setAttributeNS(null, 'fill', 'none');
            // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

            const svgNode = document.getElementById('svgNode');
            svgNode.appendChild(rect);
        }
    }

    loop() {
        // let randomIndex = getRandomIndex(this.boxes.length);

        // let i = 0;

        // for (var v = 0; v < randomIndex.length; v++) {
        for (var v = 0; v < this.boxes.length; v++) {

            // i = randomIndex[v];

            if (this.drawSkipMargin(this.boxes[v])) {
                continue;
            } else {
                this.boxes[v].active = true;
            }

            if (this.boxes[v].stripeIndex % 2 == 0) {
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
            if (this.boxes[v].stripeIndex % 2 == 0 && this.boxes[v - this.widthBoxCount].stripeIndex % 2 != 0 && this.boxes[v - 1].active == false) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                // rect.setAttributeNS(null, 'stroke', '#1100ff');
                // rect.setAttributeNS(null, 'stroke-width', '0.5');
                rect.setAttributeNS(null, 'fill', '#00ff80');
                // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

            // B
            if (this.boxes[v].stripeIndex % 2 == 0 && this.boxes[v - this.widthBoxCount].stripeIndex % 2 != 0 && this.boxes[v - 1].active == true) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', this.boxes[v].A.x);
                rect.setAttributeNS(null, 'y', this.boxes[v].A.y);
                rect.setAttributeNS(null, 'height', this.boxSize);
                rect.setAttributeNS(null, 'width', this.boxSize);
                // rect.setAttributeNS(null, 'stroke', '#1100ff');
                // rect.setAttributeNS(null, 'stroke-width', '0.5');
                rect.setAttributeNS(null, 'fill', '#00ff80');
                // rect.setAttributeNS(null, 'fill', getRandomFromList(['#f06', "#37ad37ff", "#528bd6ff"]));

                const svgNode = document.getElementById('svgNode');
                svgNode.appendChild(rect);
            }

        }
    }
}