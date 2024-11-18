// algorithm of combining https://stackoverflow.com/questions/2667748/how-do-i-combine-complex-polygons 
// https://stackoverflow.com/questions/66066287/how-to-find-the-intersect-points-in-a-polygon-object 

// center and sort: https://stackoverflow.com/questions/54719326/sorting-points-in-a-clockwise-direction 
// again: https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript 

function testShapes() {

    var blueprint = {
        "size": 13,
        "iterationX": 10,
        "iterationY": 3,
        "colorAction": "#585858",
        "DEBUGpoints": false,
        "DEBUGshapes": true,
        "stripeHeight": 4,
        "marginRelative": 1,
        "boxSize": 11.25,
        "canvasWidth": 1600,
        "canvasHeight": 900,
        "group": 1,
        "margin": 45,
        "data": {
            "shapeBackground": {
                "background": {
                    "shapeMaxLoop": 1,
                    "order": 13,
                    "density": 2,
                    "fillColor": "#7e7e7eff",
                    "pointList": [
                        [
                            45,
                            45
                        ],
                        [
                            1555,
                            45
                        ],
                        [
                            1555,
                            855
                        ],
                        [
                            45,
                            855
                        ]
                    ]
                }
            },
            "tile": {},
            "shapes": [
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                22.5,
                                33.75
                            ],
                            [
                                76.875,
                                -56.25
                            ],
                            [
                                120,
                                22.5
                            ],
                            [
                                120,
                                168.75
                            ],
                            [
                                22.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                217.5,
                                33.75
                            ],
                            [
                                271.875,
                                -56.25
                            ],
                            [
                                315,
                                22.5
                            ],
                            [
                                315,
                                168.75
                            ],
                            [
                                217.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                412.5,
                                33.75
                            ],
                            [
                                466.875,
                                -56.25
                            ],
                            [
                                510,
                                22.5
                            ],
                            [
                                510,
                                168.75
                            ],
                            [
                                412.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                607.5,
                                33.75
                            ],
                            [
                                661.875,
                                -56.25
                            ],
                            [
                                705,
                                22.5
                            ],
                            [
                                705,
                                168.75
                            ],
                            [
                                607.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                802.5,
                                33.75
                            ],
                            [
                                856.875,
                                -56.25
                            ],
                            [
                                900,
                                22.5
                            ],
                            [
                                900,
                                168.75
                            ],
                            [
                                802.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                997.5,
                                33.75
                            ],
                            [
                                1051.875,
                                -56.25
                            ],
                            [
                                1095,
                                22.5
                            ],
                            [
                                1095,
                                168.75
                            ],
                            [
                                997.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1192.5,
                                33.75
                            ],
                            [
                                1246.875,
                                -56.25
                            ],
                            [
                                1290,
                                22.5
                            ],
                            [
                                1290,
                                168.75
                            ],
                            [
                                1192.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1387.5,
                                33.75
                            ],
                            [
                                1441.875,
                                -56.25
                            ],
                            [
                                1485,
                                22.5
                            ],
                            [
                                1485,
                                168.75
                            ],
                            [
                                1387.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1582.5,
                                33.75
                            ],
                            [
                                1636.875,
                                -56.25
                            ],
                            [
                                1680,
                                22.5
                            ],
                            [
                                1680,
                                168.75
                            ],
                            [
                                1582.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1777.5,
                                33.75
                            ],
                            [
                                1831.875,
                                -56.25
                            ],
                            [
                                1875,
                                22.5
                            ],
                            [
                                1875,
                                168.75
                            ],
                            [
                                1777.5,
                                180
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                22.5,
                                472.5
                            ],
                            [
                                76.875,
                                382.5
                            ],
                            [
                                120,
                                461.25
                            ],
                            [
                                120,
                                607.5
                            ],
                            [
                                22.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                217.5,
                                472.5
                            ],
                            [
                                271.875,
                                382.5
                            ],
                            [
                                315,
                                461.25
                            ],
                            [
                                315,
                                607.5
                            ],
                            [
                                217.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                412.5,
                                472.5
                            ],
                            [
                                466.875,
                                382.5
                            ],
                            [
                                510,
                                461.25
                            ],
                            [
                                510,
                                607.5
                            ],
                            [
                                412.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                607.5,
                                472.5
                            ],
                            [
                                661.875,
                                382.5
                            ],
                            [
                                705,
                                461.25
                            ],
                            [
                                705,
                                607.5
                            ],
                            [
                                607.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                802.5,
                                472.5
                            ],
                            [
                                856.875,
                                382.5
                            ],
                            [
                                900,
                                461.25
                            ],
                            [
                                900,
                                607.5
                            ],
                            [
                                802.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                997.5,
                                472.5
                            ],
                            [
                                1051.875,
                                382.5
                            ],
                            [
                                1095,
                                461.25
                            ],
                            [
                                1095,
                                607.5
                            ],
                            [
                                997.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1192.5,
                                472.5
                            ],
                            [
                                1246.875,
                                382.5
                            ],
                            [
                                1290,
                                461.25
                            ],
                            [
                                1290,
                                607.5
                            ],
                            [
                                1192.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1387.5,
                                472.5
                            ],
                            [
                                1441.875,
                                382.5
                            ],
                            [
                                1485,
                                461.25
                            ],
                            [
                                1485,
                                607.5
                            ],
                            [
                                1387.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1582.5,
                                472.5
                            ],
                            [
                                1636.875,
                                382.5
                            ],
                            [
                                1680,
                                461.25
                            ],
                            [
                                1680,
                                607.5
                            ],
                            [
                                1582.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1777.5,
                                472.5
                            ],
                            [
                                1831.875,
                                382.5
                            ],
                            [
                                1875,
                                461.25
                            ],
                            [
                                1875,
                                607.5
                            ],
                            [
                                1777.5,
                                618.75
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                22.5,
                                911.25
                            ],
                            [
                                76.875,
                                821.25
                            ],
                            [
                                120,
                                900
                            ],
                            [
                                120,
                                1046.25
                            ],
                            [
                                22.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                217.5,
                                911.25
                            ],
                            [
                                271.875,
                                821.25
                            ],
                            [
                                315,
                                900
                            ],
                            [
                                315,
                                1046.25
                            ],
                            [
                                217.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                412.5,
                                911.25
                            ],
                            [
                                466.875,
                                821.25
                            ],
                            [
                                510,
                                900
                            ],
                            [
                                510,
                                1046.25
                            ],
                            [
                                412.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                607.5,
                                911.25
                            ],
                            [
                                661.875,
                                821.25
                            ],
                            [
                                705,
                                900
                            ],
                            [
                                705,
                                1046.25
                            ],
                            [
                                607.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                802.5,
                                911.25
                            ],
                            [
                                856.875,
                                821.25
                            ],
                            [
                                900,
                                900
                            ],
                            [
                                900,
                                1046.25
                            ],
                            [
                                802.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                997.5,
                                911.25
                            ],
                            [
                                1051.875,
                                821.25
                            ],
                            [
                                1095,
                                900
                            ],
                            [
                                1095,
                                1046.25
                            ],
                            [
                                997.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1192.5,
                                911.25
                            ],
                            [
                                1246.875,
                                821.25
                            ],
                            [
                                1290,
                                900
                            ],
                            [
                                1290,
                                1046.25
                            ],
                            [
                                1192.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1387.5,
                                911.25
                            ],
                            [
                                1441.875,
                                821.25
                            ],
                            [
                                1485,
                                900
                            ],
                            [
                                1485,
                                1046.25
                            ],
                            [
                                1387.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1582.5,
                                911.25
                            ],
                            [
                                1636.875,
                                821.25
                            ],
                            [
                                1680,
                                900
                            ],
                            [
                                1680,
                                1046.25
                            ],
                            [
                                1582.5,
                                1057.5
                            ]
                        ]
                    }
                },
                {
                    "A": {
                        "label": "A",
                        "shapeMaxLoop": 1,
                        "order": 1,
                        "density": 3,
                        "colorAction": "#585858",
                        "grid": 1,
                        "fillColor": "#b3b3b3",
                        "pointList": [
                            [
                                1777.5,
                                911.25
                            ],
                            [
                                1831.875,
                                821.25
                            ],
                            [
                                1875,
                                900
                            ],
                            [
                                1875,
                                1046.25
                            ],
                            [
                                1777.5,
                                1057.5
                            ]
                        ]
                    }
                }
            ]
        },
        "P1": [
            1777.5,
            911.25
        ],
        "P2": [
            1831.875,
            821.25
        ],
        "P3": [
            1875,
            900
        ],
        "P4": [
            1875,
            1046.25
        ],
        "P5": [
            1777.5,
            1057.5
        ],
        "P6": [
            1972.5,
            911.25
        ],
        "P7": [
            1972.5,
            1057.5
        ],
        "P8": [
            1929.375,
            1125
        ],
        "P9": [
            1875,
            826.875
        ],
        "P10": [
            1918.125,
            905.625
        ],
        "P11": [
            1972.5,
            815.625
        ],
        "P12": [
            2026.875,
            821.25
        ],
        "P13": [
            1777.5,
            1108.125
        ],
        "P14": [
            1831.875,
            1040.625
        ],
        "P15": [
            1875,
            1119.375
        ],
        "P16": [
            1875,
            1265.625
        ],
        "P17": [
            1777.5,
            1254.375
        ],
        "P18": [
            1972.5,
            1108.125
        ],
        "P19": [
            1972.5,
            1254.375
        ],
        "P20": [
            1918.125,
            1344.375
        ],
        "P21": [
            2021.25,
            1046.25
        ]
    }

    // var blueprint = {};
    // blueprint = {
    //     boxSize: 11.25,
    //     stripeHeight: 4,
    //     margin: 45,
    //     marginRelative: 1,
    //     data: {
    //         shapeA: {
    //             MainHeightLine: 2,
    //             MainWidth: 70,
    //             ShadAAY: 20,
    //             mainBoxPos: { x: 34, y: 12 },
    //             mainWidthCX: 104,
    //             mainWidthCY: 19,
    //             shadAheight: 3,
    //             shadHeightLine: 1,
    //             shapeMainHeight: 7,
    //             superShadowHeightMax: 15,
    //             superShadowShiftX: 25,
    //             superShadowShiftY: 1,
    //             shadAshift: 3,
    //             shadAheight: 3,
    //             shadHeightLine: 1,
    //             front: {
    //                 density: 1,
    //                 fillColor: "#e2e2e2",
    //                 order: 1,
    //                 shapeMaxLoop: 2
    //             },
    //             down: {
    //                 density: 1,
    //                 fillColor: "#e2e2e2",
    //                 order: 2,
    //                 shapeMaxLoop: 2
    //             },
    //             right: {
    //                 density: 1,
    //                 fillColor: "#e2e2e2",
    //                 order: 3,
    //                 shapeMaxLoop: 2
    //             },
    //             shadow: {
    //                 density: 1,
    //                 fillColor: "#e2e2e2",
    //                 order: 4,
    //                 shapeMaxLoop: 2
    //             }
    //         },
    //         shapeBackground: {
    //             background: {
    //                 colorAction: "#2f6e32",
    //                 density: 2,
    //                 fillColor: "None",
    //                 order: 13,
    //                 pointList: [
    //                     [45, 45],
    //                     [1555, 45],
    //                     [1555, 855],
    //                     [45, 855]
    //                 ],
    //                 shapeMaxLoop: 1,
    //             }
    //         }
    //     }
    // }

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