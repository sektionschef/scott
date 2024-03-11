class containedPath {
    constructor(data) {
        this.uncertaintyShift = 3; // shift inward for pointinpolygon better results
        this.minimalFactor = 0.1;  // minimal amout for a path to exist, relative to the default length of vector

        this.readyToDraw = data.readyToDraw; // ready to draw,
        this.selected = data.selected;  // chosen by specific shape
        this.split = false; // one part is in a shape
        this.full = false; // full in a shape
        this.rerun = data.rerun;  // needs a rerun for full or split
        this.start = data.start;
        this.end = data.end;
        this.order = data.order;  // hierarchy
        this.density = data.density;  // skip level
        this.strokeColor = data.strokeColor;
        this.strokeWidth = data.strokeWidth;
        this.currentLoop = data.currentLoop;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude; // default length or vector -> minimal length check
        this.shapeMaxLoop = 0;
        this.points = data.points;
        this.boxIndex = data.boxIndex;

        // recalc, not everyone has it
        this.center = getMiddlePpoint(this.start, this.end);
        this.angle = angleBetweenPoints(this.start, this.end);

        this.uncertaintyAdder = vectorFromAngle(this.angle, this.uncertaintyShift)
        this.startShift = vectorAdd(this.start, this.uncertaintyAdder);
        this.endShift = vectorSub(this.uncertaintyAdder, this.end);

        this.minimalLength = this.vectorMagnitude * this.minimalFactor; // the minimal length of a path to be accepted.
    }

    divideFullVsSplit(key, value) {

        // selected in shape previously, order important
        if (this.selected == false) {

            // split or full in order
            var full = this.check3PointsIn(value.pointList);
            var split = this.check1PointIn(value.pointList);
            var loopActive = this.checkShapeLoopNotExceeded(value);

            if (full && loopActive) {
                // console.log("full");
                this.updateFull(key, value);
            } else if (split && loopActive) {
                // console.log("split");
                this.intersectSingleShape(key, value);
            } else {
                this.rerun = false;
            }
        }
    }

    checkShapeLoopNotExceeded(value) {
        return (this.currentLoop <= value.shapeMaxLoop)
    }

    // at least one point of start, center, end in one shape?
    check1PointIn(pointList) {

        // showDebugPoint(this.start.x, this.start.y, "green");

        return (
            // pointInPolygon(pointList, [this.start.x, this.start.y]) ||
            pointInPolygon(pointList, [this.startShift.x, this.startShift.y]) ||
            pointInPolygon(pointList, [this.center.x, this.center.y]) ||
            // pointInPolygon(pointList, [this.end.x, this.end.y])
            pointInPolygon(pointList, [this.endShift.x, this.endShift.y])
        )
    }

    // start, center, end are all in one shape?
    check3PointsIn(pointList) {
        return (
            pointInPolygon(pointList, [this.startShift.x, this.startShift.y]) &&
            // pointInPolygon(pointList, [this.start.x, this.start.y]) &&
            pointInPolygon(pointList, [this.center.x, this.center.y]) &&
            // pointInPolygon(pointList, [this.end.x, this.end.y])
            pointInPolygon(pointList, [this.endShift.x, this.endShift.y])
        )
    }

    updateFull(key, value) {
        this.order = key;
        this.density = value.density;
        this.full = true;
        this.rerun = false;
        this.strokeColor = value.colorAction;
        this.shapeMaxLoop = value.shapeMaxLoop;  // RENAME with MAX
        this.points = [this.start, this.end];
        this.readyToDraw = true;
        this.selected = true;  // matched with a shape
    }

    intersectSingleShape(key, value) {
        var intersectionPoint;

        // if there is an intersection point with any shape, closest selected
        // get all sides
        for (var i = 0; i < value.pointList.length; i++) {

            // get all sides
            if (i != (value.pointList.length - 1)) {
                this.shapeA = { x: value.pointList[i][0], y: value.pointList[i][1] };
                this.shapeB = { x: value.pointList[i + 1][0], y: value.pointList[i + 1][1] }
            } else {
                // closing the loop, with last and first points
                this.shapeA = { x: value.pointList[0][0], y: value.pointList[0][1] };
                this.shapeB = { x: value.pointList[i][0], y: value.pointList[i][1] };
            }

            // find intersection point for the loop
            this.interPointCandidate = intersect(this.shapeA.x, this.shapeA.y, this.shapeB.x, this.shapeB.y, this.start.x, this.start.y, this.end.x, this.end.y);
            // skip if nothing found
            if (this.interPointCandidate === undefined || this.interPointCandidate == false) {
                continue;
            }

            // if the intersection point lies between the points of the line and the shape's side. (vector is endless)
            var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
            var startEndLength = vectorLength(vectorSub(this.start, this.end));

            // skip if too short
            if (startEndLength < this.minimalLength) {
                continue;
            }

            // check if intersection is beyond the shape and the  vector since only angles are used
            this.checkIntersectionShapePath = (
                shapeLineLength > vectorLength(vectorSub(this.shapeA, this.interPointCandidate))
            ) && (
                    shapeLineLength > vectorLength(vectorSub(this.interPointCandidate, this.shapeB))
                ) && (
                    startEndLength > vectorLength(vectorSub(this.start, this.interPointCandidate))
                ) && (
                    startEndLength > vectorLength(vectorSub(this.interPointCandidate, this.end))
                );

            // get the intersection point with the shortest distance to center, here the intersectionPoint and the shape is selected
            if (this.checkIntersectionShapePath) {
                if (intersectionPoint != undefined) {
                    // is there a better one
                    if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(intersectionPoint, this.center)))) {
                        // per shape one intersection point, closest to center
                        intersectionPoint = this.interPointCandidate;
                        this.split = true;
                    };
                } else {
                    // set it for the first time
                    intersectionPoint = this.interPointCandidate;
                    this.split = true;
                }
            }
        }

        // set the best intersectionpoint as result
        if (intersectionPoint != undefined) {
            this.points = [this.start, intersectionPoint, this.end];
            this.pointList = value.pointList;
            this.key = key;
            this.selected = true;  // is matched to a shape
            this.rerun = false;  // needs no rerun

            // showDebugPoint(intersectionPoint.x, intersectionPoint.y, "green");
        }

    }

    // both parts of the original path are pushed for rerun
    createPathFromIntersection() {
        if (this.points.length > 2) {
            var newPath = new containedPath({
                readyToDraw: false,
                selected: false,
                rerun: true,
                start: this.points[0],
                end: this.points[1],
                boxIndex: (this.boxIndex),
                angleRadians: this.angleRadians,
                vectorMagnitude: this.vectorMagnitude,
                order: this.key,
                density: this.density,
                strokeColor: "orange",
                currentLoop: this.currentLoop,
                shapeMaxLoop: 0,
                full: false,
                split: false,
                points: [],
            })

            var recycledPath = new containedPath({
                readyToDraw: false,
                selected: false,
                rerun: true,
                start: this.points[1],
                end: this.points[2],
                boxIndex: (this.boxIndex),
                angleRadians: this.angleRadians,
                vectorMagnitude: this.vectorMagnitude,
                order: "",
                density: this.density,
                strokeColor: "blue",
                currentLoop: this.currentLoop,
                shapeMaxLoop: 0,
                full: false,
                split: false,
                points: [],
            })

            this.split = false; // removed for a consecutive loop
            return [newPath, recycledPath]
        }
    }

    drawDebugLine(groupString) {

        // this.strokeWidth = 0.5;
        var jitter = 1;

        // const svgNode = document.getElementById('svgNode');
        const group = document.getElementById(groupString);

        var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        // line.setAttributeNS(null, "id", "lineIdD");
        // line.setAttributeNS(null, "filter", "url(#filterPencil)");
        // line.setAttributeNS(null, "filter", "url(#fueta)");
        line.setAttributeNS(null, "x1", this.start.x + getRandomFromInterval(-jitter, jitter));
        line.setAttributeNS(null, "y1", this.start.y + getRandomFromInterval(-jitter, jitter));
        line.setAttributeNS(null, "x2", this.end.x + getRandomFromInterval(-jitter, jitter));
        line.setAttributeNS(null, "y2", this.end.y + getRandomFromInterval(-jitter, jitter));

        line.setAttributeNS(null, "stroke", this.strokeColor);
        line.setAttributeNS(null, "stroke-width", this.strokeWidth);
        line.setAttributeNS(null, "opacity", 1);
        line.setAttributeNS(null, "fill", "none");

        // svgNode.appendChild(this.newPath);
        group.appendChild(line);
    }

    drawDebugCenter(groupString) {

        this.debugPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        this.debugPoint.setAttributeNS(null, "id", "");
        this.debugPoint.setAttributeNS(null, "cx", this.center.x);
        this.debugPoint.setAttributeNS(null, "cy", this.center.y);
        this.debugPoint.setAttributeNS(null, "r", "1");
        this.debugPoint.setAttributeNS(null, "stroke", "none");
        this.debugPoint.setAttributeNS(null, "fill", "#ad0000");
        this.debugPoint.setAttributeNS(null, "stroke-width", 1);
        this.debugPoint.setAttributeNS(null, "opacity", 1);

        // var svgNode = document.getElementById("svgNode");
        const group = document.getElementById(groupString);
        // svgNode.appendChild(this.debugPoint);
        group.appendChild(this.debugPoint);
    }

    drawFilledPath(group) {

        new filledPath({
            start: this.start,
            end: this.end,
            // strokeWidth: this.strokeWidth,
            group: group,
        })
    }
}