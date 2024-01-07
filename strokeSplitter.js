class strokeSplitter {
    constructor(data) {
        this.posStd = 0.8; // 0.6;// 1  // misplacmente standard deviation
        this.posStdCon = 1; // 0.4;  // control points
        this.posStdShiftX = 0; // add variance to x so no total overlap
        this.minLength = 5; // 5;  // a line should have a length of at least
        this.filledPath = false;
        // this.shapeLoop = 1;  // limit for whitespace, 1 = general run

        this.allShapes = data.allShapes;
        // console.log(this.allShapes);

        this.pathCandidates = [];
    }

    add(data) {
        this.strokeWidth = data.strokeWidth;
        this.center = data.center;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.strokeColor = data.strokeColor;
        this.loop = data.loop;
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

        // this.path = {
        //     "readyToDraw": false, // ready to draw,
        //     "toBeSplitted": false,
        //     start: this.start,
        //     end: this.end,
        //     order: "",
        //     strokeColor: "pink",
        //     currentLoop: this.loop,
        //     shapeLoop: 0,
        //     intersectionShapes: [],
        //     intersectionOrders: [],
        //     intersectionPoints: [],
        //     points: [],
        // }

        this.interactWithShapes();
    }

    interactWithShapes() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(this.allShapes)) {

                if (key == "front") {
                    if (this.divideFullVsSplit(key, value, shapeId) == false) {
                        continue
                    }
                } else if ((key == "down" || key == "right") && this.path.order != "front") {
                    if (this.divideFullVsSplit(key, value, shapeId) == false) {
                        continue
                    }
                } else if (key == "shadow" && this.path.order == "") {
                    if (this.divideFullVsSplit(key, value, shapeId) == false) {
                        continue
                    }
                } else {
                    this.path.order = "";
                }
            }
            // add the endpoint to the list
        }
        this.path.points.push(this.end);
    }


    divideFullVsSplit(key, value, shapeId) {
        if (this.check3PointsIn(value.pointList)) {
            this.path.order = key;
            this.path.shape = shapeId;
            this.fullInside = key;
            this.path.strokeColor = value.colorAction;
            this.path.shapeLoop = value.shapeLoop;
            this.path.readyToDraw = true;  // SWITCH
            this.path.points = [this.start, this.end];
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

        this.path.points = [this.start];

        // dummy point
        var intersectionPoint = {
            x: 0,
            y: 0
        };

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

            // if the intersection point lies between the points of the line and the shape's side. (vector is endless)
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
                    // per shape one intersection point, closest to center
                    intersectionPoint = this.interPointCandidate;
                };
            }
        }

        this.path.points.push(intersectionPoint);
        this.path.intersectionPoints.push(intersectionPoint);
        this.path.intersectionOrders.push(key);
        this.path.intersectionShapes.push(shapeId);
    }

    static sortIntersectionPoints(element) {

        // PROBABLY ORDER - BY SHAPE
        // console.log(order);
        // console.log(shapes);

        // CREATE OBJECTS FOR SORT - REMOVE THE DICT
        var pointObs = []
        for (var i = 0; i < element.points.length; i++) {
            pointObs.push({
                point: element.points[i],
                // order: element.orders[i],
                // shape: element.shapes[i],
            })
        }

        // sort by distance to start
        pointObs.sort(function (a, b) { return vectorLength(vectorSub(element.start, a.point)) - vectorLength(vectorSub(element.start, b.point)) });
        // console.log(pointObs);

        var removableIndexes = [];
        // REMOVE SHORT DISTANCE POINTS
        for (var i = 0; i < pointObs.length; i++) {
            if (pointObs[i + 1] == undefined) {
                break;
            }

            // console.log(pointObs[i].point);
            // console.log(pointObs[i + 1].point);


            //BEGIN WITH START AND FIRST POINT
            var distance = Math.abs(vectorLength(vectorSub(pointObs[i].point, pointObs[i + 1].point)))
            if (distance < this.minLength) {
                removableIndexes.push(i + 1);
            }

        }

        // console.log(removableIndexes);
        for (var removableIndex of removableIndexes) {
            // console.log(removableIndex)
            pointObs.splice(removableIndex, 1);
        }
        // console.log(pointObs);

        return pointObs
    }

    static createPathFromIntersections(element, allShapes, pathCandidates) {
        var path = {};

        for (var i = 0; i < (element.points.length - 1); i++) {

            // which part is in, which one is out?
            var midPoint = getMiddlePpoint(element.points[i].point, element.points[i + 1].point);

            // DEBUG
            // showDebugPoint(element.points[i].point.x, element.points[i].point.y, "green");
            // showDebugPoint(midPoint.x, midPoint.y, "pink");
            // showDebugPoint(element.points[i + 1].point.x, element.points[i + 1].point.y, "red");

            for (const shape of allShapes) {
                for (const [key, value] of Object.entries(shape)) {

                    if (key == "front") {

                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {

                            path.start = element.points[i].point;
                            path.end = element.points[i + 1].point;

                            path.order = "front"; //orderSelect;
                            path.strokeColor = value.colorAction;
                            path.currentLoop = 0; // value.currentLoop;
                            path.shapeLoop = value.shapeLoop;
                            path.readyToDraw = true;
                            path.shape = shapeId;

                        }
                    } else if ((key == "down" || key == "right") && path.order != "front") {
                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {
                            path.start = element.points[i].point;
                            path.end = element.points[i + 1].point;

                            path.order = key; // "right"; //orderSelect;
                            path.strokeColor = value.colorAction;
                            path.currentLoop = 0; // value.currentLoop;
                            path.shapeLoop = value.shapeLoop;
                            path.readyToDraw = true;
                            path.shape = shapeId;
                            // console.log(path);
                        }
                    } else if (key == "shadow" && path.order == "") {
                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {
                            path.start = element.points[i].point;
                            path.end = element.points[i + 1].point;

                            path.order = key; // "right"; //orderSelect;
                            path.strokeColor = value.colorAction;
                            path.currentLoop = 0; // value.currentLoop;
                            path.shapeLoop = value.shapeLoop;
                            path.readyToDraw = true;
                            path.shape = shapeId;
                            // console.log(path);
                        }
                    } else {
                        path.order = "";
                    }
                }
            }
            pathCandidates.push(path)
        }

        return pathCandidates;
    }
}