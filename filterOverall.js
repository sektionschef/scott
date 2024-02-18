class filterOverall {
    constructor() {
        this.filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this.filter.setAttribute("id", "filterOverall");
        this.filter.setAttribute("result", "filterOverall");
        this.filter.setAttribute("x", "0");
        this.filter.setAttribute("y", "0");
        // added
        // this.filter.setAttribute("filterUnits", "objectBoundingBox");
        // this.filter.setAttribute("primitiveUnits", "userSpaceOnUse");
        // this.filter.setAttribute("color-interpolation-filters", "linearRGB");

        // bigPaper
        this.createTurbulenceBig();
        this.createFeSpecularLightingABig();
        this.createFePointLightBig();
        // this.createFloodFillDEBUG();
        this.createBlendBig();

        // grain
        this.createTurbulenceGrain();
        this.createSaturateGrain();
        // this.createCompositeGrain();
        this.createBlendGrain();

        defs.appendChild(this.filter);

        this.createLayer();
    }


    createLayer() {

        this.opacity = "0.4";

        var paperLightContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        paperLightContainer.setAttribute("id", "paperLightContainer");
        paperLightContainer.setAttribute("result", "paperLightContainer");
        paperLightContainer.setAttribute("x", "0");
        paperLightContainer.setAttribute("y", "0");
        paperLightContainer.setAttribute("width", "100%");
        paperLightContainer.setAttribute("height", "100%");
        paperLightContainer.setAttribute("fill", "none");
        paperLightContainer.setAttribute("opacity", this.opacity);
        // paperLightContainer.setAttribute("fill", "red");  // DEBUG
        paperLightContainer.setAttribute("filter", "url(#filterOverall)");

        defs.appendChild(paperLightContainer);
    }

    showLayer() {
        var paperLightContainerUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
        paperLightContainerUse.setAttribute("id", "paperLightContainerUse");
        paperLightContainerUse.setAttribute("href", "#paperLightContainer");
        svgNode.appendChild(paperLightContainerUse);
    }


    showBigPaperDEBUG() {

        var paperLightContainerDEBUG = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        paperLightContainerDEBUG.setAttribute("id", "paperLightContainerDEBUG");
        paperLightContainerDEBUG.setAttribute("result", "paperLightContainerDEBUG");
        paperLightContainerDEBUG.setAttribute("x", "0");
        paperLightContainerDEBUG.setAttribute("y", "0");
        paperLightContainerDEBUG.setAttribute("width", "100%");
        paperLightContainerDEBUG.setAttribute("height", "100%");
        paperLightContainerDEBUG.setAttribute("fill", "none");
        // paperLightContainerDEBUG.setAttribute("fill", "red");  // DEBUG
        paperLightContainerDEBUG.setAttribute("filter", "url(#filterOverall)");

        defs.appendChild(paperLightContainerDEBUG);

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(paperLightContainerDEBUG);
    }

    createTurbulenceBig() {
        this.turbulenceBig = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        this.turbulenceBig.setAttribute("id", "turbulenceBig");
        this.turbulenceBig.setAttribute("type", "turbulence");
        this.turbulenceBig.setAttribute("baseFrequency", "0.003 0.005"); // 0.04
        // this.turbulenceBig.setAttribute("baseFrequency", "0.3 0.5"); // 0.04
        this.turbulenceBig.setAttribute("numOctaves", "3"); // 1-6
        this.turbulenceBig.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        this.turbulenceBig.setAttribute("stitchTiles", "stitch");
        this.turbulenceBig.setAttribute("x", "0%");
        this.turbulenceBig.setAttribute("y", "0%");
        this.turbulenceBig.setAttribute("width", "100%");
        this.turbulenceBig.setAttribute("height", "100%");
        this.turbulenceBig.setAttribute("result", "turbulenceBig");

        this.filter.appendChild(this.turbulenceBig)
    }

    createFeSpecularLightingABig() {
        this.feSpecularLightingABig = document.createElementNS("http://www.w3.org/2000/svg", "feSpecularLighting");
        this.feSpecularLightingABig.setAttribute("id", "feSpecularLightingABig");
        this.feSpecularLightingABig.setAttribute("surfaceScale", "-10"); // 13 // change for more radical results
        this.feSpecularLightingABig.setAttribute("specularConstant", "1.25");
        this.feSpecularLightingABig.setAttribute("specularExponent", "5");  // 15
        this.feSpecularLightingABig.setAttribute("kernelUnitLength", "0 0");
        this.feSpecularLightingABig.setAttribute("lighting-color", "#ffffff");  // PARAM
        // this.feSpecularLightingABig.setAttribute("lighting-color", "#75808f");
        this.feSpecularLightingABig.setAttribute("in", "turbulenceBig");
        this.feSpecularLightingABig.setAttribute("result", "feSpecularLightingABig");

        this.filter.appendChild(this.feSpecularLightingABig);
    }

    createFePointLightBig() {
        this.fePointLightBig = document.createElementNS("http://www.w3.org/2000/svg", "fePointLight");
        this.fePointLightBig.setAttribute("id", "fePointLight");
        this.fePointLightBig.setAttribute("x", "200");
        this.fePointLightBig.setAttribute("y", "300");
        this.fePointLightBig.setAttribute("z", "200");

        this.feSpecularLightingABig.appendChild(this.fePointLightBig);
    }

    createFloodFillDEBUG() {
        // var floodFill = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
        // floodFill.setAttribute("id", "floodFill");
        // floodFill.setAttribute("result", "floodFill");
        // floodFill.setAttribute("x", "0");
        // floodFill.setAttribute("y", "0");
        // floodFill.setAttribute("width", "100%");
        // floodFill.setAttribute("height", "100%");
        // floodFill.setAttribute("flood-color", "green");
        // floodFill.setAttribute("flood-opacity", "1");
        // .appendChild(floodFill);
    }

    createBlendBig() {
        this.blendBig = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        this.blendBig.setAttribute("id", "blend");
        this.blendBig.setAttribute("result", "blendBigPaper");
        this.blendBig.setAttribute("in", "SourceGraphic");
        this.blendBig.setAttribute("in2", "feSpecularLightingABig");
        // this.blendBig.setAttribute("mode", "overlay");
        this.blendBig.setAttribute("mode", "hard-light");
        // this.blendBig.setAttribute("mode", "normal");
        // this.blendBig.setAttribute("mode", "multiply");

        this.filter.appendChild(this.blendBig);
    }

    createTurbulenceGrain() {
        this.turbulenceGrain = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        this.turbulenceGrain.setAttribute("id", "turbulenceGrain");
        this.turbulenceGrain.setAttribute("type", "fractalNoise");
        this.turbulenceGrain.setAttribute("baseFrequency", "0.9 0.6");
        this.turbulenceGrain.setAttribute("numOctaves", "6");
        this.turbulenceGrain.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        this.turbulenceGrain.setAttribute("stitchTiles", "stitch");
        this.turbulenceGrain.setAttribute("x", "0%");
        this.turbulenceGrain.setAttribute("y", "0%");
        this.turbulenceGrain.setAttribute("width", "100%");
        this.turbulenceGrain.setAttribute("height", "100%");
        this.turbulenceGrain.setAttribute("result", "turbulenceGrain");

        this.filter.appendChild(this.turbulenceGrain);
    }

    createSaturateGrain() {
        this.deSaturateGrain = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        this.deSaturateGrain.setAttribute("type", "saturate");
        this.deSaturateGrain.setAttribute("values", "0");
        this.deSaturateGrain.setAttribute("x", "0%");
        this.deSaturateGrain.setAttribute("y", "0%");
        this.deSaturateGrain.setAttribute("width", "100%");
        this.deSaturateGrain.setAttribute("height", "100%");
        this.deSaturateGrain.setAttribute("in", "turbulenceGrain");
        this.deSaturateGrain.setAttribute("result", "deSaturateGrain");

        this.filter.appendChild(this.deSaturateGrain);
    }

    createCompositeGrain() {
        // https://stackoverflow.com/questions/64946883/apply-noise-to-image-with-transparency-by-use-of-svg-filters
        this.compositeGrain = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
        this.compositeGrain.setAttribute("operator", "in");
        this.compositeGrain.setAttribute("in", "SourceGraphic");
        this.compositeGrain.setAttribute("in2", "deSaturateGrain");
        this.compositeGrain.setAttribute("result", "compositeGrain");

        this.filter.appendChild(this.compositeGrain);
    }

    createBlendGrain() {
        this.blendGrain = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        this.blendGrain.setAttribute("id", "blend");
        this.blendGrain.setAttribute("result", "blend");
        // this.blendGrain.setAttribute("in", "SourceGraphic");
        this.blendGrain.setAttribute("in", "blendBigPaper");
        this.blendGrain.setAttribute("in2", "deSaturateGrain");
        this.blendGrain.setAttribute("mode", "overlay");
        // this.blendGrain.setAttribute("mode", "hard-light");
        // this.blendGrain.setAttribute("mode", "multiply");

        this.filter.appendChild(this.blendGrain);
    }

}