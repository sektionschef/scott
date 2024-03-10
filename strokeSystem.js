class strokeSystem {
    constructor(allShapes) {
        this.debugPath = false;

        // IS THIS TRUE??
        this.shapeStartPosition = 1; // 0 for background, 1 for first
        this.allShapes = allShapes;
        this.shapeCount = Object.keys(this.allShapes.loopMaterial).length;

        this.paths = [];
    }

    add(data) {
        this.center = data.center;
        this.strokeWidth = data.strokeWidth;
        this.strokeColor = data.strokeColor;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.currentLoop = data.currentLoop;
        this.group = data.group;
        this.boxIndex = data.boxIndex;

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

        var path = new containedPath({
            readyToDraw: false,
            selected: false,
            start: this.start,
            end: this.end,
            order: 0,
            // strokeColor: "black",
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            boxIndex: this.boxIndex,
            angleRadians: this.angleRadians,
            currentLoop: this.currentLoop,
            shapeLoop: 0,  // remove her - fit with shape neeeded
            full: false,
            split: false,
            rerun: false,
            points: [],
        })

        this.paths.push(path);
    }

    run() {

        var loopCount = 0;
        var loopCountMax = 10;

        // run as long as there is no intersections left
        do {
            this.countRerun = 0;


            // if full everythint is done, if not recycle
            for (const path of this.paths) {
                for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
                    path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
                }
            }

            for (const path of this.paths) {
                if (path.split) {
                    this.paths = this.paths.concat(path.createPathFromIntersection());
                }
            }

            for (const path of this.paths) {
                if (path.rerun) {
                    this.countRerun += 1;
                }
            }
            console.log(`rerun: ${this.countRerun}`);
            loopCount += 1;
            // } while (this.countRerun > 0)  // if true repeat
        } while (this.countRerun > 0 && loopCount < 10)  // if true repeat

        if (loopCount == loopCountMax) {
            console.error(`reached the maximum amount of loops: ${loopCount}`);
        }
    }

    // sort so the right paths with the correct angle is drawn
    sortPaths() {

        this.paths = this.paths.sort(function (a, b) {
            // console.log(a.boxIndex)
            return (a.boxIndex - b.boxIndex)
        });

    }

    showPaths(group) {

        this.sortPaths();

        for (const path of this.paths) {
            if (path.readyToDraw == true) {

                if (path.boxIndex % path.density == 0) {
                    continue;
                }

                if (this.debugPath) {
                    path.drawDebugLine(group);
                    path.drawDebugCenter(group);
                } else {
                    path.drawFilledPath(group);
                }

            }
        }
    }
}