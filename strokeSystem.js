class strokeSystem {
    constructor(allShapes) {
        this.debugPath = false;
        // is this true??
        this.shapeStartPosition = 1; // 0 for background, 1 for first
        // this.shapeCount = 13; 
        this.shapeCount = Object.keys(allShapes.loopMaterial).length;

        this.allShapes = allShapes;
        // console.log(this.allShapes);
        this.paths = [];
    }

    add(data) {
        this.center = data.center;
        this.strokeWidth = data.strokeWidth;
        this.strokeColor = data.strokeColor;
        this.angleRadians = data.angleRadians;
        this.vectorMagnitude = data.vectorMagnitude;
        this.currentLoop = data.currentLoop;
        this.group = data.group;
        this.boxIndex = data.boxIndex;

        // console.log(this.boxIndex);

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
            order: 0,
            // strokeColor: "black",
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            boxIndex: this.boxIndex,
            angleRadians: this.angleRadians,
            currentLoop: this.currentLoop,
            shapeLoop: 0,  // remove her - fit with shape neeeded
            full: false,
            split: false,
            rerun: false,
            points: [],
        })

        this.paths.push(path);
    }

    debugCountSplit(path) {
        if (path.split) {
            this.countSplit += 1;
        }
    }

    debugCountRerun(path) {
        if (path.rerun) {
            this.countRerun += 1;
        }
    }

    debugCountReady(path) {

        if (path.readyToDraw) {
            this.countReady += 1;
        }
    }

    debugBlock() {

        for (const path of this.paths) {
            this.debugCountReady(path);
            this.debugCountSplit(path);
            this.debugCountRerun(path);
        }
        console.log(`split: ${this.countSplit}`);
        console.log(`rerun: ${this.countRerun}`);
        console.log(`ready: ${this.countReady}`);
        console.log(`total: ${this.paths.length}`);
        console.log('\n');
    }

    run() {

        this.countReady = 0;
        this.countSplit = 0;
        var indexo = 0

        do {
            this.countRerun = 0;

            // first run - if full ready, if not recycle
            for (const path of this.paths) {
                for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
                    path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
                    // this.countSplit += 1;
                }

            }

            for (const path of this.paths) {
                if (path.split) {
                    this.paths = this.paths.concat(path.createPathFromIntersection());
                }
            }

            for (const path of this.paths) {
                if (path.rerun) {
                    this.countRerun += 1;
                }
            }
            console.log(`rerun: ${this.countRerun}`);
            indexo += 1;
            // } while (this.countRerun > 0 && indexo < 10)  // if true repeat
        } while (this.countRerun > 0)  // if true repeat

        console.log(indexo);
        // this.debugBlock();

        // var indexa = 0;
        // // while (this.countReady == 0 || this.countSplit > 0 || this.countRerun != 0) {
        // while ((this.countReady == 0 || this.countSplit > 0) && indexa < 10000) {
        // }

        // this.debugBlock();

        // this.countReady = 0;
        // this.countRerun = 0;
        // this.countSplit = 0;


        // // second run - the intersections are checked, if they are fully in shape
        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // // this.debugBlock();

        // // added - while selected and not drawn.
        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }

        // this.debugBlock();

        // this.countReady = 0;
        // this.countRerun = 0;
        // this.countSplit = 0;

        // // third run - the last intersections are checked, if they are fully in shape
        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }
        // //////

        // this.debugBlock();

        // // third run - the last intersections are checked, if they are fully in shape
        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }

        // // third run - the last intersections are checked, if they are fully in shape
        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.rerun) {
        //         for (var i = this.shapeStartPosition; i <= this.shapeCount; i++) {
        //             path.divideFullVsSplit(i, this.allShapes.loopMaterial[i])
        //         }
        //     }
        // }

        // this.debugBlock();

        // for (const path of this.paths) {
        //     if (path.split) {
        //         this.paths = this.paths.concat(path.createPathFromIntersection());
        //     }
        // }

        // this.debugBlock();
    }

    // sort so the right paths with the correct angle is drawn
    sortPaths() {

        this.paths = this.paths.sort(function (a, b) {
            // console.log(a.boxIndex)
            // return (a.boxIndex + a.angleRadians - b.boxIndex + b.angleRadians)
            return (a.boxIndex - b.boxIndex)
        });

    }

    showPaths(group) {

        this.sortPaths();

        for (const path of this.paths) {
            if (path.readyToDraw == true) {

                // if (index % 0 == 0) {
                if (path.boxIndex % path.density == 0) {
                    continue;
                }

                if (this.debugPath) {
                    path.drawDebugLine(group);
                    path.drawDebugCenter(group);
                } else {
                    path.drawFilledPath(group);
                }

            }
        }
    }
}