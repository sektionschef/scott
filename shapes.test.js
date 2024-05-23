// algorithm of combining https://stackoverflow.com/questions/2667748/how-do-i-combine-complex-polygons 
// https://stackoverflow.com/questions/66066287/how-to-find-the-intersect-points-in-a-polygon-object 

// center and sort: https://stackoverflow.com/questions/54719326/sorting-points-in-a-clockwise-direction 
// again: https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript 

function testShapes() {

    var blueprint = {};
    blueprint = {
        boxSize: 11.25,
        stripeHeight: 4,
        margin: 45,
        marginRelative: 1,
        data: {
            shapeA: {
                MainHeightLine: 2,
                MainWidth: 70,
                ShadAAY: 20,
                mainBoxPos: { x: 34, y: 12 },
                mainWidthCX: 104,
                mainWidthCY: 19,
                shadAheight: 3,
                shadHeightLine: 1,
                shapeMainHeight: 7,
                superShadowHeightMax: 15,
                superShadowShiftX: 25,
                superShadowShiftY: 1,
                shadAshift: 3,
                shadAheight: 3,
                shadHeightLine: 1,
                front: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 1,
                    shapeMaxLoop: 2
                },
                down: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 2,
                    shapeMaxLoop: 2
                },
                right: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 3,
                    shapeMaxLoop: 2
                },
                shadow: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 4,
                    shapeMaxLoop: 2
                }
            },
            shapeBackground: {
                background: {
                    colorAction: "#2f6e32",
                    density: 2,
                    fillColor: "None",
                    order: 13,
                    pointList: [
                        [45, 45],
                        [1555, 45],
                        [1555, 855],
                        [45, 855]
                    ],
                    shapeMaxLoop: 1,
                }
            }
        }
    }

    var shapes_ = new Shapes(
        blueprint
    );

    // console.log(shapes_);

    shapes_.fillShape();
    shapes_.debugShowShape();
}

// ARCHIVE - TOO BAD BUT PRETTY
function testShapeMergeARCHIVE() {
    const polyA = {
        pointList: [
            [300, 400],
            [600, 400],
            [400, 800],
        ]
    }

    const polyB = {
        pointList: [
            [800, 400],
            [400, 600],
            [800, 800],
        ]
    }

    const thePolygons = [polyA, polyB];

    // debugging
    // showDebugPolygon(polyA.pointList, "#0000ff69", "none");
    // showDebugPolygon(polyB.pointList, "#ff7b0069", "none");

    let mergedPolygon = []

    // check for intersections of sides to add new vertices
    var result;
    for (var i = 0; i < (thePolygons.length - 1); i++) {

        for (var j = 0; j < (thePolygons[i].pointList.length - 1); j++) {

            // console.log(thePolygons[i].pointList[v])

            for (var k = 0; k < (thePolygons[i + 1].pointList.length - 1); k++) {

                // console.log(j)
                // console.log(k)

                result = intersect(
                    thePolygons[i].pointList[j][0],
                    thePolygons[i].pointList[j][1],
                    thePolygons[i].pointList[j + 1][0],
                    thePolygons[i].pointList[j + 1][1],
                    thePolygons[i + 1].pointList[k][0],
                    thePolygons[i + 1].pointList[k][1],
                    thePolygons[i + 1].pointList[k + 1][0],
                    thePolygons[i + 1].pointList[k + 1][1],
                )

                if (result) {
                    // console.log(result);
                    showDebugPoint(result.x, result.y, "red")
                    mergedPolygon.push([result.x, result.y]);
                }
            }
        }
    }

    // check if points of a polygon is in any other polygon
    // select the points for the merged polygin by skipping points inside
    for (var i = 0; i < (thePolygons.length); i++) {
        for (var j = 0; j < (thePolygons[i].pointList.length); j++) {
            for (var k = 0; k < (thePolygons.length); k++) {

                var point = thePolygons[i].pointList[j];
                var polygon = thePolygons[k].pointList;

                if (i == k) { continue }

                if (pointInPolygon(polygon, point) == false) {
                    mergedPolygon.push(point);
                }
            }
        }
    }
    // console.log(mergedPolygon);

    // transform to x: and y: per point format
    points = transformToXY(mergedPolygon)
    center = getCenter(points);  // improvement mean center not real centroid!
    showDebugPoint(center.x, center.y, "purple")

    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(({ x, y }) => {
        return { x, y, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
    console.log(pointsSorted);

    // transform to plain list, no x: y: dict
    const pointsSortedList = transformToXYLess(pointsSorted);

    showDebugPolygon(pointsSortedList, "#00000067", "#000000ff");

}


// close to documentation of library - show two shapes
function testShapeUnion() {

    const polyA = [
        [300, 400],
        [600, 400],
        [400, 800],
    ]

    const polyB = [
        [800, 400],
        [400, 600],
        [800, 800],
    ]

    // debugging
    showDebugPolygon(polyA, "#0000ff69", "none");
    showDebugPolygon(polyB, "#ff7b0069", "none");

    mergedPolygon = polygonClipping.union([polyA], [polyB]);

    showDebugPolygon(mergedPolygon, "#00000067", "#000000ff");

}

// example for showing the merge of polygon works - THIS STILL NEEDED??
function testShapeMerge() {

    var blueprint = {};
    blueprint = {
        boxSize: 11.25,
        stripeHeight: 4,
        margin: 45,
        marginRelative: 1,
        data: {
            shapeA: {
                MainHeightLine: 2,
                MainWidth: 70,
                ShadAAY: 20,
                mainBoxPos: { x: 34, y: 12 },
                mainWidthCX: 104,
                mainWidthCY: 19,
                shadAheight: 3,
                shadHeightLine: 1,
                shapeMainHeight: 7,
                superShadowHeightMax: 35,
                superShadowShiftX: 25,
                superShadowShiftY: 1,
                shadAshift: 3,
                shadAheight: 3,
                shadHeightLine: 1,
                front: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 1,
                    shapeMaxLoop: 2
                },
                down: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 3,
                    shapeMaxLoop: 2
                },
                right: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 5,
                    shapeMaxLoop: 2
                },
                shadow: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 7,
                    shapeMaxLoop: 2
                }
            },
            shapeB: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 42,
                },
                MainHeightLine: 2,
                MainWidth: 70,
                ShadAAY: 50,
                mainWidthCX: 104,
                mainWidthCY: 49,
                shadAheight: 0,
                shadHeightLine: 30,
                shapeMainHeight: 30,
                superShadowHeightMax: 15,
                superShadowShiftX: 25,
                superShadowShiftY: 5,
                shadAshift: 3,
                shadAheight: 3,
                shadHeightLine: 140,
                front: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 2,
                    shapeMaxLoop: 2
                },
                down: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 4,
                    shapeMaxLoop: 2
                },
                right: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 6,
                    shapeMaxLoop: 2
                },
                shadow: {
                    density: 1,
                    fillColor: "#e2e2e2",
                    order: 8,
                    shapeMaxLoop: 2
                }
            },
            shapeBackground: {
                background: {
                    colorAction: "#2f6e32",
                    density: 2,
                    fillColor: "None",
                    order: 13,
                    pointList: [
                        [45, 45],
                        [1555, 45],
                        [1555, 855],
                        [45, 855]
                    ],
                    shapeMaxLoop: 1,
                }
            }
        }
    }

    var shapes_ = new Shapes(
        blueprint
    );

    // console.log(shapes_);

    shapes_.fillShape();
    shapes_.debugShowShape();


    // VERWORFEN - GESAMTDINGSI
    // strokesystem_ = new strokeSystem(shapes_);

    // let grid = new Grid({
    //     stepCountRes: 200,  // 400
    //     stripeHeight: STRIPEHEIGHT,  // 2
    //     vectorMagnitude: 55,  // 50
    //     marginRelative: 1,  // 1
    //     // strokeColor: "#222222ff",
    //     strokeColor: "#4e4e4eff",
    //     strokeWidth: 1,
    //     angleRadiansStart: Math.PI / 2,
    //     angleRadiansGain: Math.PI / 5,
    //     // angleRadiansGain: 0,
    //     shortBoxCount: RESOLUTIONBOXCOUNT,
    //     longSide: LONGSIDE,
    //     shortSide: SHORTSIDE,
    //     landscape: LANDSCAPE,
    //     group: "groupB",
    //     strokeSystem: strokesystem_,
    // });
}