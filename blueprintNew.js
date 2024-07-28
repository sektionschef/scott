class BlueprintNew {
    constructor(stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight) {
        console.log("jo");

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


        // layer needed for intersection calculation
        this.data = {
            shapeBackground: {
                background: {
                    shapeMaxLoop: 1,  // maximum loop to draw in this shape
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
            tile: {
                A: {
                    shapeMaxLoop: 2,
                    order: 1,
                    density: 1,
                    colorAction: "blue",
                    fillColor: "#e2e2e2",
                    pointList: [
                        [100, 100],
                        [400, 100],
                        [400, 400],
                        [100, 400],
                    ]
                },
            },
        }

        showDebugPolygon(this.data.shapeBackground.background.pointList, "#313131", "none");
        showDebugPolygon(this.data.tile.A.pointList, this.data.tile.A.pointList.fillColor, "none");
    }
}