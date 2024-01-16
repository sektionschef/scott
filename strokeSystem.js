// 
class strokeSystem {
    constructor(data) {
        // this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        // this.posStdCon = 1; // 0.4;  // control points
        // this.posStdShiftX = 0; // add variance to x so no total overlap
        // this.minLength = 5; // 5;  // a line should have a length of at least
        this.filledPath = false;

        this.allShapes = data.allShapes;

        this.paths = [];
        this.loopMaterial = []; // restructured shape data

        this.restructureShapeData();
    }

    add(data) {
        this.center = data.center;
        this.strokeWidth = data.strokeWidth;
        this.strokeColor = data.strokeColor;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.currentLoop = data.currentLoop;
        this.group = data.group;

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
        this.shapeCount = 9;

        // first run
        for (const path of this.paths) {
            for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
                path.divideFullVsSplit(i, this.loopMaterial[i])
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
                    path.divideFullVsSplit(i, this.loopMaterial[i])
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
                    path.divideFullVsSplit(i, this.loopMaterial[i])
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
        // console.log(this.paths[345]);

        this.paths = this.paths.sort(function (a, b) { return (a.center.x + a.center.y * 1600) - (b.center.x + b.center.y * 1600) });
        // this.paths = this.paths.sort(function (a, b) { return (a.start.x + a.start.y * 1600) - (b.start.x + b.start.y * 1600) });
    }

    showPaths(group) {

        this.sortPaths();

        var index = 0;

        for (const path of this.paths) {
            if (path.readyToDraw == true) {

                index += 1;
                if (index % path.density == 0) {
                    // if (index % 0 == 0) {
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