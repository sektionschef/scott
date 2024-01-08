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

        this.paths = [];  // ehemals pathcandidates
    }

    add(data) {
        this.center = data.center;
        this.strokeWidth = data.strokeWidth;
        this.strokeColor = data.strokeColor;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
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

        this.path = new containedPath({
            "readyToDraw": false,
            start: this.start,
            end: this.end,
            order: "",
            strokeColor: "black",
            currentLoop: this.loop,
            shapeLoop: 0,
            full: false,
            split: false,
            // intersectionShapes: [],
            // intersectionOrders: [],
            // intersectionPoints: [],
            points: [],
        })
        // console.log(this.path);

        // push to pathcandidates and when finished to 
        this.interactWithShapes();

        this.paths.push(this.path);
    }

    interactWithShapes() {

        for (const [shapeId, shapeValues] of Object.entries(this.allShapes)) {
            for (const [key, value] of Object.entries(shapeValues)) {

                // filter out other keys
                if (["front", "down", "right", "shadow"].includes(key)) {
                    this.divideFullVsSplit(key, value)
                }
            }
        }
        // add the endpoint to the list
        this.path.points.push(this.end);
    }


    divideFullVsSplit(key, value) {

        // split or full in order
        var full = this.check3PointsIn(value.pointList);
        var split = this.check1PointIn(value.pointList);

        // prioritize - prevent that front split is more important than shadow full.
        if (key == "front" && full) {
            this.updateFull(key, value);
        } else if (key == "front" && split) {
            this.path.order = key;
            this.path.points = [this.start];
            this.path.split = true;
            this.intersectSingleShape(key, value)
        } else if ((key == "down" || key == "right") && full && this.path.order != "front") {
            this.updateFull(key, value);
        } else if ((key == "down" || key == "right") && split && this.path.order != "front") {
            this.path.split = true;
        } else if (key == "shadow" && full && this.path.order == "") {
            this.updateFull(key, value);
        } else if (key == "shadow" && split && this.path.order == "") {
            this.path.split = true;
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

    updateFull(key, value) {
        this.path.order = key;
        this.path.full = true;
        this.path.strokeColor = value.colorAction;
        this.path.shapeLoop = value.shapeLoop;  // RENAME with MAX
        this.path.points = [this.start, this.end];
        this.path.readyToDraw = true;
    }

    intersectSingleShape(key, value) {

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
                // console.log(this.center);
                // console.log(this.interPointCandidate);
                // console.log(intersectionPoint);
                if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(intersectionPoint, this.center)))) {
                    // per shape one intersection point, closest to center
                    intersectionPoint = this.interPointCandidate;
                };
            }
        }

        this.path.points.push(intersectionPoint);
        // this.path.intersectionPoints.push(intersectionPoint);
        // this.path.intersectionOrders.push(key);
        // this.path.intersectionShapes.push(shapeId);
    }

    sortIntersectionPoints(element) {

        // PROBABLY ORDER - BY SHAPE
        // console.log(order);
        // console.log(shapes);

        // CREATE OBJECTS FOR SORT - REMOVE THE DICT
        var pointObs = []
        for (var i = 0; i < element.points.length; i++) {
            pointObs.push(element.points[i])
        }

        // sort by distance to start
        pointObs.sort(function (a, b) { return vectorLength(vectorSub(element.start, a)) - vectorLength(vectorSub(element.start, b)) });
        // console.log(pointObs);

        var removableIndexes = [];
        // REMOVE SHORT DISTANCE POINTS
        for (var i = 0; i < (pointObs.length - 1); i++) {

            // console.log(pointObs[i]);
            // console.log(pointObs[i + 1]);

            //BEGIN WITH START AND FIRST POINT
            var distance = Math.abs(vectorLength(vectorSub(pointObs[i], pointObs[i + 1])))
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

    createPathFromIntersections(element, allShapes) {
        this.path = {};

        for (var i = 0; i < (element.points.length - 1); i++) {

            // which part is in, which one is out?
            var midPoint = getMiddlePpoint(element.points[i], element.points[i + 1]);

            // DEBUG
            // showDebugPoint(element.points[i].point.x, element.points[i].point.y, "green");
            // showDebugPoint(midPoint.x, midPoint.y, "pink");
            // showDebugPoint(element.points[i + 1].point.x, element.points[i + 1].point.y, "red");

            for (const [shapeId, shape] of Object.entries(allShapes)) {
                for (const [key, value] of Object.entries(shape)) {


                    if (key == "front") {
                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {

                            // path.start = element.points[i].point;
                            // path.end = element.points[i + 1].point;

                            // path.order = "front"; //orderSelect;
                            // path.strokeColor = value.colorAction;
                            // path.currentLoop = 0; // value.currentLoop;
                            // path.shapeLoop = value.shapeLoop;
                            // path.readyToDraw = true;
                            // path.shape = shapeId;

                            var newPath = new containedPath({
                                readyToDraw: true,
                                start: element.points[i],
                                end: element.points[i + 1],
                                order: key,
                                strokeColor: value.colorAction,
                                currentLoop: this.loop,
                                shapeLoop: 0,
                                full: true,
                                split: false,
                                points: [],
                            })
                            // console.log(newPath);
                            this.paths.push(newPath);

                        }
                    } else if ((key == "down" || key == "right") && this.path.order != "front") {
                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {
                            // path.start = element.points[i].point;
                            // path.end = element.points[i + 1].point;

                            // path.order = key; // "right"; //orderSelect;
                            // path.strokeColor = value.colorAction;
                            // path.currentLoop = 0; // value.currentLoop;
                            // path.shapeLoop = value.shapeLoop;
                            // path.readyToDraw = true;
                            // path.shape = shapeId;
                            // // console.log(path);

                            var newPath = new containedPath({
                                readyToDraw: true,
                                start: element.points[i],
                                end: element.points[i + 1],
                                order: key,
                                strokeColor: value.colorAction,
                                currentLoop: this.loop,
                                shapeLoop: 3,
                                full: true,
                                split: false,
                                points: [],
                            })
                            this.paths.push(newPath);
                        }
                    } else if (key == "shadow" && this.path.order == "") {
                        if (
                            pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
                        ) {
                            // path.start = element.points[i].point;
                            // path.end = element.points[i + 1].point;

                            // path.order = key; // "right"; //orderSelect;
                            // path.strokeColor = value.colorAction;
                            // path.currentLoop = 0; // value.currentLoop;
                            // path.shapeLoop = value.shapeLoop;
                            // path.readyToDraw = true;
                            // path.shape = shapeId;
                            // // console.log(path);
                        }
                    } else {
                        // path.order = "";
                    }
                }
            }
        }
    }

    retryStrokePath() {
        for (const element of this.paths) {
            if (element.split) {
                // if (element.points.length > 1) {
                // console.log("dsf")
                // DANGER - DUPLICATE TO 2 PUNKTE - DA BRAUCHEN WIR ES NICHT NOCHMAL

                element.points = this.sortIntersectionPoints(element)
                this.createPathFromIntersections(element, this.allShapes)
                // }
            }
        }
    }

    showPaths(group) {

        // console.log(this.paths);
        for (const element of this.paths) {
            // console.log(element);
            // if (element.readyToDraw == true && element.currentLoop <= (element.shapeLoop - 1)) {
            if (element.readyToDraw == true) {
                this.drawDebugLine(element.start, element.end, element.strokeColor, 1, group);
            }

            // // for inside or for the first loop
            // if (
            //     // strokes in white area
            //     // (this.fullInside !== "" || this.loop == 0) &&
            //     // (this.loop < this.shapeLoop)

            //     // no strokes in whitespace
            //     (this.fullInside !== "" && this.loop < this.shapeLoop)
            // ) {

            //     if (this.filledPath) {
            //         // this.newPath = this.drawPath(this.start, this.controlA, this.controlB, this.end);
            //         // this.newPath = this.drawPath(this.start, this.controlA, this.controlB, this.end);


            //         new filledPath({
            //             start: this.start,
            //             end: this.end,
            //             angleRadians: this.angleRadians,
            //             strokeWidth: this.strokeWidth,
            //             group: this.group,
            //         });

            //     } else {
            //         this.newPath = this.drawDebugLine(this.start, this.end, this.strokeColor, 1);
            //     }
            // }
        }
    }


    drawDebugLine(start, end, strokeColor, strokeWidth, groupString) {
        // const svgNode = document.getElementById('svgNode');
        const group = document.getElementById(groupString);

        var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        // line.setAttributeNS(null, "id", "lineIdD");
        line.setAttributeNS(null, "filter", "url(#filterPencil)");
        // line.setAttributeNS(null, "filter", "url(#fueta)");
        line.setAttributeNS(null, "x1", start.x);
        line.setAttributeNS(null, "y1", start.y);
        line.setAttributeNS(null, "x2", end.x);
        line.setAttributeNS(null, "y2", end.y);

        line.setAttributeNS(null, "stroke", strokeColor);
        line.setAttributeNS(null, "stroke-width", strokeWidth);
        line.setAttributeNS(null, "opacity", 1);
        line.setAttributeNS(null, "fill", "none");

        // svgNode.appendChild(this.newPath);
        group.appendChild(line);
    }
}