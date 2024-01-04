class strokeSplitter {
    constructor(data) {
        // RECHECK ALL VARIABLES

        // this.lineSegment = 4;  // where to place the control points
        this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        this.posStdCon = 1; // 0.4;  // control points
        this.posStdShiftX = 0; // add variance to x so no total overlap
        this.minLength = 0; // 5;  // a line should have a length of at least
        this.filledPath = false;

        this.strokeWidth = data.strokeWidth;
        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.strokeColorStart = this.strokeColor;
        this.strokeColorEnd = this.strokeColor;
        this.allShapes = data.allShapes;
        this.loop = data.loop;
        this.group = data.group;

        // dummies
        this.up = { x: 0, y: 0 };
        this.down = { x: 0, y: 0 };
        // this.order = "";
        this.midPointEndInt = { x: 0, y: 0 };
        this.midPointStartInt = { x: 0, y: 0 };
        this.interPoint = { x: 0, y: 0 };
        this.splitSwitch = false;
        this.controlA = { x: 0, y: 0 };
        this.controlB = { x: 0, y: 0 };
        this.controlStartA = { x: 0, y: 0 };
        this.controlStartB = { x: 0, y: 0 };
        this.controlEndA = { x: 0, y: 0 };
        this.controlEndB = { x: 0, y: 0 };
        this.fullInside = "";
        this.startInside = "";
        this.endInside = "";
        this.shapeLoop = 1;  // limit for whitespace, 1 = general run

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

        this.path = {
            "readyToDraw": false, // ready to draw,
            "toBeSplitted": false,
            start: this.start,
            end: this.end,
            order: "",
            strokeColor: "pink",
            currentLoop: this.loop,
            shapeLoop: 0,
            intersectionShapes: [],
            intersectionOrders: [],
            intersectionPoints: [],
        }

        this.interactWithShapes();

        return this.path
    }

    interactWithShapes() {

        // var loopMax = 2;
        // for (var v = 0; v < loopMax; v++) {
        for (const shape of this.allShapes) {

            for (const [key, value] of Object.entries(shape)) {

                if (key == "front") {
                    if (this.divideFullVsSplit(key, value, shape.id) == false) {
                        continue
                    }
                } else if ((key == "down" || key == "right") && this.path.order != "front") {
                    if (this.divideFullVsSplit(key, value, shape.id) == false) {
                        continue
                    }
                } else if (key == "shadow" && this.path.order == "") {
                    if (this.divideFullVsSplit(key, value, shape.id) == false) {
                        continue
                    }
                } else {
                    this.path.order = "";
                }
            }
        }
    }


    divideFullVsSplit(key, value, shapeId) {
        if (this.check3PointsIn(value.pointList)) {
            this.path.order = key;
            this.path.shape = shapeId;
            this.fullInside = key;
            // this.splitSwitch = false;  // reset
            this.path.strokeColor = value.colorAction;
            this.path.shapeLoop = value.shapeLoop;
            this.path.readyToDraw = true;
            return true;
        } else if (this.check1PointIn(value.pointList)) {
            this.path.toBeSplitted = true;
            this.intersectSingleShape(key, value, shapeId);
            return true;
        } else {
            return false;
        }
    }

    // at least one point of start, center, end in one shape?
    check1PointIn(pointList) {
        return (
            pointInPolygon(pointList, [this.start.x, this.start.y]) ||
            pointInPolygon(pointList, [this.center.x, this.center.y]) ||
            pointInPolygon(pointList, [this.end.x, this.end.y])
        )
    }

    // start, center, end are all in one shape?
    check3PointsIn(pointList) {
        return (
            pointInPolygon(pointList, [this.start.x, this.start.y]) &&
            pointInPolygon(pointList, [this.center.x, this.center.y]) &&
            pointInPolygon(pointList, [this.end.x, this.end.y])
        )
    }

    intersectSingleShape(key, value, shapeId) {

        // if there is an intersection point with any shape, closest selected
        // get all sides
        for (var i = 0; i < value.pointList.length; i++) {

            // get all sides
            if (i != (value.pointList.length - 1)) {
                this.shapeA = { x: value.pointList[i][0], y: value.pointList[i][1] };
                this.shapeB = { x: value.pointList[i + 1][0], y: value.pointList[i + 1][1] }
            } else {
                // closing the loop
                this.shapeA = { x: value.pointList[0][0], y: value.pointList[0][1] };
                this.shapeB = { x: value.pointList[i][0], y: value.pointList[i][1] };
            }

            // find intersection point for the loop
            this.interPointCandidate = intersect(this.shapeA.x, this.shapeA.y, this.shapeB.x, this.shapeB.y, this.start.x, this.start.y, this.end.x, this.end.y);
            if (this.interPointCandidate === undefined) {
                continue;
            }

            // if the intersection point lies between the points of the line and the shape's side.
            var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
            this.checkIntersectionShapePath = (
                shapeLineLength > vectorLength(vectorSub(this.shapeA, this.interPointCandidate))
            ) && (
                    shapeLineLength > vectorLength(vectorSub(this.interPointCandidate, this.shapeB))
                ) && (
                    this.vectorMagnitude > vectorLength(vectorSub(this.start, this.interPointCandidate))
                ) && (
                    this.vectorMagnitude > vectorLength(vectorSub(this.interPointCandidate, this.end))
                );

            // get the intersection point with the shortest distance to center, here the intersectionPoint and the shape is selected
            if (this.checkIntersectionShapePath) {
                if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(this.interPoint, this.center)))) {
                    // this.interPoint = this.interPointCandidate;
                    // per shape one intersection point, closest to center
                    this.path.intersectionPoints.push(this.interPointCandidate);
                    this.path.intersectionOrders.push(key);
                    this.path.intersectionShapes.push(shapeId);
                };
            }
        }

        // this.definePartInside(key, value, shapeId);
    }

    definePartInside(key, value, shapeId) {
        // which part is in, which one is out?
        this.midPointStartInt = getMiddlePpoint(this.start, this.interPoint);
        this.midPointEndInt = getMiddlePpoint(this.interPoint, this.end);

        if (pointInPolygon(value.pointList, [this.midPointStartInt.x, this.midPointStartInt.y])) {
            // if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
            // this.splitSwitch = true;
            this.startInside = key;  // is this part in the polygon
            this.strokeColorStart = value.colorAction;
            this.shapeLoopStart = value.shapeLoop;
        }
        if (pointInPolygon(value.pointList, [this.midPointEndInt.x, this.midPointEndInt.y])) {
            // } else if (pointInPolygon(value.pointList, [this.center.x, this.center.y])) {
            // this.splitSwitch = true;
            this.endInside = key;  // is this part in the polygon
            this.strokeColorEnd = value.colorAction;
            this.shapeLoopEnd = value.shapeLoop;
        }
    }

    static createPathFromIntersections(originPath, allShapes) {
        var path = {};
        var pointIndex = 0;
        var shape;

        var intersectionPoint = originPath.intersectionPoints[pointIndex];
        var orderSelect = originPath.intersectionOrders[pointIndex];
        var shapeSelect = originPath.intersectionShapes[pointIndex];

        console.log(originPath);
        // console.log(allShapes);

        // get the data of the shape according to the intersection point
        for (var i = 0; i < allShapes.length; i++) {
            if (allShapes[i].id == shapeSelect) {
                shape = allShapes[i][orderSelect];
            }
        }
        // console.log(shape);

        // which part is in, which one is out?
        var midPointStartInt = getMiddlePpoint(originPath.start, intersectionPoint);
        var midPointEndInt = getMiddlePpoint(intersectionPoint, originPath.end);

        if (pointInPolygon(shape.pointList, [midPointStartInt.x, midPointStartInt.y])) {
            path.start = originPath.start;
            path.end = intersectionPoint;
        }
        if (pointInPolygon(shape.pointList, [midPointEndInt.x, midPointEndInt.y])) {
            path.start = intersectionPoint;
            path.end = originPath.end;
        }

        path.order = orderSelect;
        path.strokeColor = shape.colorAction;
        path.currentLoop = originPath.currentLoop;
        path.shapeLoop = shape.shapeLoop;
        path.readyToDraw = true;

        return path
    }

}