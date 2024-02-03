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

        var blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        blend.setAttribute("id", "blend");
        blend.setAttribute("result", "blend");
        blend.setAttribute("in", "SourceGraphic");
        blend.setAttribute("in2", "feSpecularLightingA");
        // blend.setAttribute("mode", "overlay");
        blend.setAttribute("mode", "hard-light");
        // blend.setAttribute("mode", "normal");
        // blend.setAttribute("mode", "multiply");

        filterBigPaper.appendChild(turbulenceBig);
        feSpecularLightingA.appendChild(fePointLight);
        filterBigPaper.appendChild(feSpecularLightingA);
        filterBigPaper.appendChild(blend);

        // defs.appendChild(turbulence);
        defs.appendChild(filterBigPaper);
    }


    showBigPaperDEBUG() {

        var bigPaperContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bigPaperContainer.setAttribute("id", "bigPaperContainer");
        bigPaperContainer.setAttribute("result", "bigPaperContainer");
        bigPaperContainer.setAttribute("x", "0");
        bigPaperContainer.setAttribute("y", "0");
        bigPaperContainer.setAttribute("width", "100%");
        bigPaperContainer.setAttribute("height", "100%");
        bigPaperContainer.setAttribute("fill", "none");
        // bigPaperContainer.setAttribute("fill", "red");  // DEBUG
        bigPaperContainer.setAttribute("filter", "url(#filterBigPaper)");

        // defs.appendChild(bigPaperContainer);

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(bigPaperContainer);
    }
}