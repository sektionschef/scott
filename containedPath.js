class containedPath {
    constructor(data) {

        this.readyToDraw = data.readyToDraw; // ready to draw,
        this.split = false; // one part is in a shape
        this.full = false; // full in a shape
        this.start = data.start;
        this.end = data.end;
        this.order = data.order;
        this.strokeColor = data.strokeColor;
        this.currentLoop = data.currentLoop;
        this.shapeLoop = data.shapeLoop; // maximum loop
        this.points = data.points;
    }
}