class Blueprint {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {

        this.stripeHeight = stripeHeight;
        this.marginRelative = marginRelative;
        this.boxSize = shortSide / resolutionBoxCount;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;


        if (this.marginRelative == 0) {
            this.margin = 0;
        } else {
            this.margin = Math.round(this.stripeHeight * this.marginRelative) * this.boxSize;
        }

        this.data = {
            shapeBackground: {
                background: {
                    shapeLoop: 1,
                    order: 13,
                    density: 2, // density factor - 0 is full
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    // colorAction: this.strokeColor,
                    // fillColor: "#afafafff",
                    fillColor: "None",
                    pointList: [
                        [this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.margin],
                        [this.canvasWidth - this.margin, this.canvasHeight - this.margin],
                        [this.margin, this.canvasHeight - this.margin],
                    ]
                }
            },
            shapeA: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 12,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // 25, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 1,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 4,
                    density: 0,
                    // colorAction: "green",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 7,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 10,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            },
            shapeB: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 32,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 2,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 5,
                    density: 0,
                    // colorAction: "green",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 8,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 11,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            },
            shapeC: {
                mainBoxPos: {  // where to start to draw in box count
                    x: 34,
                    y: 52,
                },
                MainHeightLine: 2, // height of main shape in lineheights
                MainWidth: 70,  // width of the shape in boxes
                shadHeightLine: 1,  // height of main shape in lineheights
                superShadowShiftX: 25,  //  shift in boxes on x axis
                superShadowShiftY: 1,  // shift in boxes on y axis
                superShadowHeightMax: 15, // heigt in boxes on y axis
                front: {
                    shapeLoop: 2,
                    order: 3,
                    density: 1,
                    // colorAction: "#5c5c5c",
                    // colorAction: "red",
                    colorAction: this.colory,
                    fillColor: "#e2e2e2",
                },
                down: {  // shadow beneath
                    shapeLoop: 2,
                    order: 6,
                    density: 0,
                    // colorAction: "green",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#757575",
                },
                right: {  // shadow beneath
                    shapeLoop: 2,
                    order: 9,
                    density: 0,
                    // colorAction: "#3daf3d",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#a3a3a3",
                },
                shadow: {  // shadow
                    shapeLoop: 1,
                    order: 12,
                    density: 0,
                    // colorAction: "#a937c0",
                    // colorAction: "#5c5c5c",
                    colorAction: this.colory,
                    fillColor: "#929292",
                }
            }
        }

        for (const [shapeId, shapeValues] of Object.entries(this.data)) {
            if (shapeId != "shapeBackground") {
                shapeValues.shapeMainHeight = this.stripeHeight * shapeValues.MainHeightLine - 1;  // height of main shape in boxes
                shapeValues.shadAheight = this.stripeHeight * shapeValues.shadHeightLine - 1;  //
                shapeValues.shadAshift = this.stripeHeight * shapeValues.shadHeightLine - 1;
                shapeValues.mainWidthCX = shapeValues.mainBoxPos.x + shapeValues.MainWidth;
                shapeValues.mainWidthCY = shapeValues.mainBoxPos.y + shapeValues.shapeMainHeight;
                shapeValues.ShadAAY = shapeValues.mainWidthCY + 1;
            }
        }
    }

}
