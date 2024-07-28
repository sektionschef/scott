function testBlueprintNew() {

    // // create background
    // var groupBlueprintNew = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // groupBlueprintNew.setAttribute("id", "debugBlueprintNew");
    // groupBlueprintNew.setAttribute("x", "0");
    // groupBlueprintNew.setAttribute("y", "0");
    // groupBlueprintNew.setAttribute("width", "100%");
    // groupBlueprintNew.setAttribute("height", "100%");
    // groupBlueprintNew.setAttribute("fill", "none");

    // const defs = document.getElementById('defs');
    // defs.appendChild(groupBlueprintNew);


    var stripeHeight = 4;
    var marginRelative = 1;
    var shortSide = 900
    var resolutionBoxCount = 80;
    var canvasWidth = 1600;
    var canvasHeight = 900;

    var boxSize = shortSide / resolutionBoxCount;

    var blueprint = new BlueprintNew(
        stripeHeight, marginRelative, shortSide, resolutionBoxCount, canvasWidth, canvasHeight
    );

    // use debugPoint
    // var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    // circle.setAttributeNS(null, 'cx', 100);
    // circle.setAttributeNS(null, 'cy', 100);
    // circle.setAttributeNS(null, 'r', 5);
    // circle.setAttributeNS(null, 'fill', "black");
    // groupBlueprintNew.appendChild(circle);

    showDebugPoint(100, 100, "pink");

    for (var y = 0; y < canvasHeight / boxSize; y++) {
        for (var x = 0; x < canvasWidth / boxSize; x++) {
            showDebugPoint(x * boxSize, y * boxSize, "pink");
        }
    }



    // const svgNode = document.getElementById('svgNode');
    // svgNode.appendChild(groupBlueprintNew);
}