class strokeSystem {
    constructor(data) {
        this.filledPath = true;

        this.allShapes = data.allShapes;

        this.paths = [];
        // this.loopMaterial = []; // restructured shape data

        // this.restructureShapeData();
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

        // console.log(this.boxIndex);

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
            oida: "",
            strokeColor: "black",
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
        this.shapeStartPosition = 1; // 0 for background, 1 for first
        this.shapeCount = 13;  // 9

        // first run
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

        // second run - the intersections are checked, if they are fully in shape
        for (const path of this.paths) {
            if (path.rerun) {
                for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
                    path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
                }
            }
        }

        // added - while selected and not drawn.
        for (const path of this.paths) {
            if (path.split) {
                this.paths = this.paths.concat(path.createPathFromIntersection());
            }
        }

        // third run - the last intersections are checked, if they are fully in shape
        for (const path of this.paths) {
            if (path.rerun) {
                for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
                    path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
                }
            }
        }
    }

    restructureShapeData() {

        // reformat for displaying correct hierarchy
        this.loopMaterial = {
        };

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(shapeValues)) {

                if (["background"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "background";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                // filter out other keys
                if (["front"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "front";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["down"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "down";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["right"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "right";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
                if (["shadow"].includes(key)) {
                    var newValue = value;
                    newValue.shapeId = shapeId;
                    newValue.side = "shadow";
                    // this.loopMaterial[key].push(newValue);
                    this.loopMaterial[value.order] = newValue;
                }
            }
        }
        // console.log(this.loopMaterial);
    }

    sortPaths() {

        // FILTER
        // this.paths = this.paths.filter(function (path) { return path.readyToDraw })

        // EASY
        // this.paths = this.paths.sort(function (a, b) {
        //     return (a.end.x + a.end.y * 1600) - (b.end.x + b.end.y * 1600)
        // });

        // DEPENDING ON ANGLE
        // this.paths = this.paths.sort(function (a, b) {
        //     // console.log(angleBetweenPoints(a.end, a.start));
        //     if (angleBetweenPoints(a.end, a.start) < Math.PI / 2) {
        //         return (a.end.x + a.end.y * 1600) - (b.end.x + b.end.y * 1600)
        //     } else {
        //         return (a.start.x + a.start.y * 1600) - (b.start.x + b.start.y * 1600)
        //     }
        // });

        // SAVE ANGLE
        this.paths = this.paths.sort(function (a, b) {
            // console.log(a.boxIndex)
            // return (a.boxIndex + a.angleRadians - b.boxIndex + b.angleRadians)
            return (a.boxIndex - b.boxIndex)
        });

    }

    showPaths(group) {

        this.sortPaths();

        for (const path of this.paths) {
            if (path.readyToDraw == true) {

                // if (index % 0 == 0) {
                if (path.boxIndex % path.density == 0) {
                    continue;
                }

                if (this.filledPath) {
                    path.drawFilledPath(group);
                } else {
                    path.drawDebugLine(group);
                }
            }
        }
    }
}