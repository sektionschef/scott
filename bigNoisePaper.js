class bigNoisePaper {
    constructor(data) {
        var filterBigPaper = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filterBigPaper.setAttribute("id", "filterBigPaper");
        filterBigPaper.setAttribute("result", "filterBigPaper");
        filterBigPaper.setAttribute("x", "0");
        filterBigPaper.setAttribute("y", "0");
        // added
        // filterBigPaper.setAttribute("filterUnits", "objectBoundingBox");
        // filterBigPaper.setAttribute("primitiveUnits", "userSpaceOnUse");
        // filterBigPaper.setAttribute("color-interpolation-filters", "linearRGB");

        let turbulenceBig = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        turbulenceBig.setAttribute("id", "turbulenceBig");
        turbulenceBig.setAttribute("type", "turbulence");
        turbulenceBig.setAttribute("baseFrequency", "0.003 0.005"); // 0.04
        // turbulenceBig.setAttribute("baseFrequency", "0.3 0.5"); // 0.04
        turbulenceBig.setAttribute("numOctaves", "3");
        turbulenceBig.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        turbulenceBig.setAttribute("stitchTiles", "stitch");
        turbulenceBig.setAttribute("x", "0%");
        turbulenceBig.setAttribute("y", "0%");
        turbulenceBig.setAttribute("width", "100%");
        turbulenceBig.setAttribute("height", "100%");
        turbulenceBig.setAttribute("result", "turbulenceBig");

        let feSpecularLightingA = document.createElementNS("http://www.w3.org/2000/svg", "feSpecularLighting");
        feSpecularLightingA.setAttribute("id", "feSpecularLightingA");
        feSpecularLightingA.setAttribute("surfaceScale", "-43"); // 13 // change for more radical results
        feSpecularLightingA.setAttribute("specularConstant", "1.25");
        feSpecularLightingA.setAttribute("specularExponent", "5");  // 15
        feSpecularLightingA.setAttribute("kernelUnitLength", "0 0");
        feSpecularLightingA.setAttribute("lighting-color", "#ffffff");
        feSpecularLightingA.setAttribute("in", "turbulenceBig");
        feSpecularLightingA.setAttribute("result", "feSpecularLightingA");

        let fePointLight = document.createElementNS("http://www.w3.org/2000/svg", "fePointLight");
        fePointLight.setAttribute("id", "fePointLight");
        fePointLight.setAttribute("x", "200");
        fePointLight.setAttribute("y", "300");
        fePointLight.setAttribute("z", "200");

        var blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        blend.setAttribute("id", "blend");
        blend.setAttribute("result", "blend");
        blend.setAttribute("in", "SourceGraphic");
        // blend.setAttribute("in2", "floodFill");
        // blend.setAttribute("in2", "bigPaperContainer");
        blend.setAttribute("in2", "feSpecularLightingA");
        // blend.setAttribute("mode", "overlay");
        // blend.setAttribute("mode", "normal");
        blend.setAttribute("mode", "multiply");


        filterBigPaper.appendChild(turbulenceBig);
        feSpecularLightingA.appendChild(fePointLight);
        filterBigPaper.appendChild(feSpecularLightingA);
        filterBigPaper.appendChild(blend);

        // defs.appendChild(turbulence);
        defs.appendChild(filterBigPaper);

        var bigPaperContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bigPaperContainer.setAttribute("id", "bigPaperContainer");
        bigPaperContainer.setAttribute("result", "bigPaperContainer");
        bigPaperContainer.setAttribute("x", "0");
        bigPaperContainer.setAttribute("y", "0");
        bigPaperContainer.setAttribute("width", "100%");
        bigPaperContainer.setAttribute("height", "100%");
        bigPaperContainer.setAttribute("fill", "red");  // DEBUG
        // bigPaperContainer.setAttribute("filter", "url(#filterBigPaper)");
        // bigPaperContainer.setAttribute("result", "bob");
        defs.appendChild(bigPaperContainer);

    }

    createBlend() {

        const bigPaperContainer = document.getElementById('bigPaperContainer');

        var blendFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        blendFilter.setAttribute("id", "blendFilter");
        blendFilter.setAttribute("x", "0");
        blendFilter.setAttribute("y", "0");
        // // added
        // blendFilter.setAttribute("filterUnits", "objectBoundingBox");
        // blendFilter.setAttribute("primitiveUnits", "userSpaceOnUse");
        // blendFilter.setAttribute("color-interpolation-filters", "linearRGB");

        var floodFill = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
        floodFill.setAttribute("id", "floodFill");
        floodFill.setAttribute("result", "floodFill");
        floodFill.setAttribute("x", "0");
        floodFill.setAttribute("y", "0");
        floodFill.setAttribute("width", "100%");
        floodFill.setAttribute("height", "100%");
        floodFill.setAttribute("flood-color", "green");
        floodFill.setAttribute("flood-opacity", "1");

        blendFilter.appendChild(bigPaperContainer);
        // blendFilter.appendChild(floodFill);

        var blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        blend.setAttribute("in", "SourceGraphic");
        // blend.setAttribute("in2", "floodFill");
        blend.setAttribute("in2", "bigPaperContainer");
        // blend.setAttribute("mode", "overlay");
        // blend.setAttribute("mode", "normal");
        blend.setAttribute("mode", "multiply");

        blendFilter.appendChild(blend);
        defs.appendChild(blendFilter);
    }

    showBigPaperDEBUG() {

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(bigPaperContainer);
    }

    showBlendBigPaper() {
        this.createBlend();
        const svgNode = document.getElementById('svgNode');

        // var blendContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // blendContainer.setAttribute("id", "blendContainer");
        // blendContainer.setAttribute("x", "0");
        // blendContainer.setAttribute("y", "0");
        // blendContainer.setAttribute("width", "100%");
        // blendContainer.setAttribute("height", "100%");
        // blendContainer.setAttribute("fill", "none");
        // // blendContainer.setAttribute("fill", "blue");
        // // blendContainer.setAttribute("filter", "blendFilter");
        // blendContainer.setAttribute("filter", "url(#blendFilter)");
        // defs.appendChild(blendContainer);

        // const blendContainer = document.getElementById('blendContainer');

        // svgNode.appendChild(blendContainer);
    }
}