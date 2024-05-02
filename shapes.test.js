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

function testShapeMerge() {
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

    // DEBUGGING
    const svgNode = document.getElementById('svgNode');

    var shapsnA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    shapsnA.setAttributeNS(null, 'points', polyA.pointList);
    shapsnA.setAttributeNS(null, 'stroke', "none");
    shapsnA.setAttributeNS(null, 'fill', "#0000ff69");
    svgNode.appendChild(shapsnA);

    var shapsnB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    shapsnB.setAttributeNS(null, 'points', polyB.pointList);
    shapsnB.setAttributeNS(null, 'stroke', "none");
    shapsnB.setAttributeNS(null, 'fill', "#ff7b0069");
    svgNode.appendChild(shapsnB);

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
                }
            }
        }
    }

    // dfs
    points = transformToCoordinates(thePolygons[0].pointList)
    center = getCenter(points);
    showDebugPoint(center.x, center.y, "purple")

    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(({ x, y }) => {
        return { x, y, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
    console.log(pointsSorted);
}
