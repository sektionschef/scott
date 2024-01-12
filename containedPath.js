class containedPath {
    constructor(data) {
        this.uncertaintyShift = 3;

        this.readyToDraw = data.readyToDraw; // ready to draw,
        this.split = false; // one part is in a shape
        this.full = false; // full in a shape
        this.rerun = data.rerun;
        this.start = data.start;
        this.end = data.end;
        this.order = data.order;
        this.strokeColor = data.strokeColor;
        this.currentLoop = data.currentLoop;
        this.shapeLoop = data.shapeLoop; // maximum loop
        this.points = data.points;

        // recalc, not everyone has it
        this.center = getMiddlePpoint(this.start, this.end);
        this.angle = angleBetweenPoints(this.start, this.end);

        this.uncertaintyAdder = vectorFromAngle(this.angle, this.uncertaintyShift)
        this.startShift = vectorAdd(this.start, this.uncertaintyAdder);
        // console.log(this.startShift);
        this.endShift = vectorSub(this.uncertaintyAdder, this.end);
    }

    divideFullVsSplit(key, value) {

        // console.log(value.pointList)

        // split or full in order
        var full = this.check3PointsIn(value.pointList);
        var split = this.check1PointIn(value.pointList);

        // prioritize - prevent that front split is more important than shadow full.
        // if (key == "front" && full) {
        //     this.updateFull(key, value);
        // } else if (key == "front" && split) {
        //     this.intersectSingleShape(key, value)
        // } else if ((key == "down" || key == "right") && full && this.order != "front") {
        //     this.updateFull(key, value);
        // } else if ((key == "down" || key == "right") && split) {
        //     // } else if ((key == "down" || key == "right") && split && this.order != "front") {
        //     this.intersectSingleShape(key, value)
        // } else if (key == "shadow" && full && this.order == "") {
        //     this.updateFull(key, value);
        //     // } else if (key == "shadow" && split && this.order == "") {
        // } else if (key == "shadow" && split) {
        //     this.intersectSingleShape(key, value)
        // }

        // for (var i = 1; i < 20; i++) {
        // if (key == i) {
        if (full) {
            this.updateFull(key, value);
        } else if (split) {
            this.intersectSingleShape(key, value);
        }
        // }
        // }
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
            pointInPolygon(pointList, [this.startShift.x, this.startShift.y]) &&
            // pointInPolygon(pointList, [this.start.x, this.start.y]) &&
            pointInPolygon(pointList, [this.center.x, this.center.y]) &&
            // pointInPolygon(pointList, [this.end.x, this.end.y])
            pointInPolygon(pointList, [this.endShift.x, this.endShift.y])

            // pointInPolygon(pointList, [this.center.x, this.center.y])
        )
    }

    updateFull(key, value) {
        this.order = key;
        this.full = true;
        this.strokeColor = value.colorAction;
        this.shapeLoop = value.shapeLoop;  // RENAME with MAX
        this.points = [this.start, this.end];
        this.readyToDraw = true;
    }

    intersectSingleShape(key, value) {
        var intersectionPoint
        this.order = key;
        // this.points = [this.start];

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
            if (this.interPointCandidate === undefined || this.interPointCandidate == false) {
                continue;
            }

            // if the intersection point lies between the points of the line and the shape's side. (vector is endless)
            var shapeLineLength = vectorLength(vectorSub(this.shapeA, this.shapeB));
            var startEndLength = vectorLength(vectorSub(this.start, this.end));
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
                    if (Math.abs(vectorLength(vectorSub(this.interPointCandidate, this.center))) < Math.abs(vectorLength(vectorSub(intersectionPoint, this.center)))) {
                        // per shape one intersection point, closest to center
                        intersectionPoint = this.interPointCandidate;
                        this.split = true;
                    };
                } else {
                    intersectionPoint = this.interPointCandidate;
                    this.split = true;
                }
            }
        }

        if (intersectionPoint != undefined) {
            this.points = [this.start, intersectionPoint, this.end];
            this.pointList = value.pointList;
            this.key = key;
        }

        // this.createPathFromIntersection(key, value)
    }

    // createPathFromIntersection(key, value) {
    createPathFromIntersection() {

        // console.log(this.points[2]);

        var newPath = new containedPath({
            readyToDraw: false,
            rerun: true,
            start: this.points[0],
            end: this.points[1],
            // order: key,
            order: this.key,
            strokeColor: "orange",
            currentLoop: 0,
            shapeLoop: 0,
            full: false,
            split: false,
            points: [],
        })

        // CRAZY
        if (this.points[2] != undefined) {
            var recycledPath = new containedPath({
                readyToDraw: false,
                rerun: true,
                start: this.points[1],
                end: this.points[2],
                order: "",
                strokeColor: "blue",
                currentLoop: 0,
                shapeLoop: 0,
                full: false,
                split: false,
                points: [],
            })
            return [newPath, recycledPath]
        } else {
            return [newPath]
        }

        // for (var i = 0; i < (this.points.length - 1); i++) {

        //     // which part is in, which one is out?
        //     var midPoint = getMiddlePpoint(this.points[i], this.points[i + 1]);

        //     if (
        //         // pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
        //         pointInPolygon(this.pointList, [midPoint.x, midPoint.y])
        //     ) {
        //         var newPath = new containedPath({
        //             readyToDraw: true,
        //             start: this.points[i],
        //             end: this.points[i + 1],
        //             // order: key,
        //             order: this.key,
        //             strokeColor: "orange",
        //             currentLoop: this.loop,
        //             shapeLoop: 0,
        //             full: true,
        //             split: false,
        //             points: [],
        //         })
        //         // this.paths.push(newPath);

        //         var recycledPath = new containedPath({
        //             readyToDraw: false,
        //             start: this.points[i - 1],
        //             end: this.points[i],
        //             order: "",
        //             strokeColor: "blue",
        //             currentLoop: 0,
        //             shapeLoop: 0,
        //             full: false,
        //             split: false,
        //             points: [],
        //         })
        //         // this.paths.push(recycledPath);
        //         return [newPath, recycledPath]
        //     }
        // }
    }
}