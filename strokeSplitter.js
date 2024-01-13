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
        this.loopMaterial = []; // restructured shape data
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

        var path = new containedPath({
            readyToDraw: false,
            selected: false,
            start: this.start,
            end: this.end,
            order: "",
            strokeColor: "black",
            currentLoop: this.loop,
            shapeLoop: 0,
            full: false,
            split: false,
            rerun: false,
            points: [],
        })

        this.restructureShapeData();

        this.paths.push(path);
    }

    run() {

        for (const path of this.paths) {
            for (var i = 1; i <= 8; i++) {
                path.divideFullVsSplit(i, this.loopMaterial[i])
            }
        }

        for (const path of this.paths) {
            if (path.split == true) {
                this.paths = this.paths.concat(path.createPathFromIntersection());
            }
        }

        for (const path of this.paths) {
            if (path.rerun) {
                for (var i = 1; i <= 8; i++) {
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


    // sortIntersectionPoints(element) {

    //     // PROBABLY ORDER - BY SHAPE
    //     // console.log(order);
    //     // console.log(shapes);

    //     // CREATE OBJECTS FOR SORT - REMOVE THE DICT
    //     var pointObs = []
    //     for (var i = 0; i < element.points.length; i++) {
    //         pointObs.push(element.points[i])
    //     }

    //     // sort by distance to start
    //     pointObs.sort(function (a, b) { return vectorLength(vectorSub(element.start, a)) - vectorLength(vectorSub(element.start, b)) });
    //     // console.log(pointObs);

    //     var removableIndexes = [];
    //     // REMOVE SHORT DISTANCE POINTS
    //     for (var i = 0; i < (pointObs.length - 1); i++) {

    //         // console.log(pointObs[i]);
    //         // console.log(pointObs[i + 1]);

    //         //BEGIN WITH START AND FIRST POINT
    //         var distance = Math.abs(vectorLength(vectorSub(pointObs[i], pointObs[i + 1])))
    //         if (distance < this.minLength) {
    //             removableIndexes.push(i + 1);
    //         }

    //     }

    //     // console.log(removableIndexes);
    //     for (var removableIndex of removableIndexes) {
    //         // console.log(removableIndex)
    //         pointObs.splice(removableIndex, 1);
    //     }
    //     // console.log(pointObs);

    //     return pointObs
    // }

    // createPathFromIntersections(element, allShapes) {
    //     this.path = {};

    //     for (var i = 0; i < (element.points.length - 1); i++) {

    //         // which part is in, which one is out?
    //         var midPoint = getMiddlePpoint(element.points[i], element.points[i + 1]);

    //         // DEBUG
    //         // showDebugPoint(element.points[i].point.x, element.points[i].point.y, "green");
    //         // showDebugPoint(midPoint.x, midPoint.y, "pink");
    //         // showDebugPoint(element.points[i + 1].point.x, element.points[i + 1].point.y, "red");

    //         for (const [shapeId, shape] of Object.entries(allShapes)) {
    //             for (const [key, value] of Object.entries(shape)) {


    //                 if (key == "front") {
    //                     if (
    //                         pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
    //                     ) {

    //                         // path.start = element.points[i].point;
    //                         // path.end = element.points[i + 1].point;

    //                         // path.order = "front"; //orderSelect;
    //                         // path.strokeColor = value.colorAction;
    //                         // path.currentLoop = 0; // value.currentLoop;
    //                         // path.shapeLoop = value.shapeLoop;
    //                         // path.readyToDraw = true;
    //                         // path.shape = shapeId;

    //                         var newPath = new containedPath({
    //                             readyToDraw: true,
    //                             start: element.points[i],
    //                             end: element.points[i + 1],
    //                             order: key,
    //                             strokeColor: value.colorAction,
    //                             currentLoop: this.loop,
    //                             shapeLoop: 0,
    //                             full: true,
    //                             split: false,
    //                             points: [],
    //                         })
    //                         // console.log(newPath);
    //                         this.paths.push(newPath);

    //                     }
    //                 } else if ((key == "down" || key == "right") && this.path.order != "front") {
    //                     if (
    //                         pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
    //                     ) {
    //                         // path.start = element.points[i].point;
    //                         // path.end = element.points[i + 1].point;

    //                         // path.order = key; // "right"; //orderSelect;
    //                         // path.strokeColor = value.colorAction;
    //                         // path.currentLoop = 0; // value.currentLoop;
    //                         // path.shapeLoop = value.shapeLoop;
    //                         // path.readyToDraw = true;
    //                         // path.shape = shapeId;
    //                         // // console.log(path);

    //                         var newPath = new containedPath({
    //                             readyToDraw: true,
    //                             start: element.points[i],
    //                             end: element.points[i + 1],
    //                             order: key,
    //                             strokeColor: value.colorAction,
    //                             currentLoop: this.loop,
    //                             shapeLoop: 0,
    //                             full: true,
    //                             split: false,
    //                             points: [],
    //                         })
    //                         this.paths.push(newPath);
    //                     }
    //                 } else if (key == "shadow" && this.path.order == "") {
    //                     if (
    //                         pointInPolygon(value.pointList, [midPoint.x, midPoint.y])
    //                     ) {
    //                         // path.start = element.points[i].point;
    //                         // path.end = element.points[i + 1].point;

    //                         // path.order = key; // "right"; //orderSelect;
    //                         // path.strokeColor = value.colorAction;
    //                         // path.currentLoop = 0; // value.currentLoop;
    //                         // path.shapeLoop = value.shapeLoop;
    //                         // path.readyToDraw = true;
    //                         // path.shape = shapeId;
    //                         // // console.log(path);
    //                     }
    //                 } else {
    //                     // path.order = "";
    //                 }
    //             }
    //         }
    //     }
    // }

    // retryStrokePath() {
    //     for (const element of this.paths) {
    //         if (element.split) {
    //             element.points = this.sortIntersectionPoints(element)
    //             this.createPathFromIntersections(element, this.allShapes)
    //         }
    //     }
    // }

    showPaths(group) {

        // console.log(this.paths);
        for (const path of this.paths) {

            // for (const [order, shapeList] of Object.entries(this.loopMaterial)) {
            //     for (const shape of shapeList) {
            //         path.divideFullVsSplit(order, shape)
            //     }
            // }

            // console.log(element);
            // if (element.readyToDraw == true && element.currentLoop <= (element.shapeLoop - 1)) {
            if (path.readyToDraw == true) {
                this.drawDebugLine(path.start, path.end, path.strokeColor, 1, group);
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