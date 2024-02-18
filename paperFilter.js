class paperFilter {
    constructor() {



        this.createFilter();
        this.createTurbulence();
        this.createDiffuseLighting();
        this.createDistanceLight();

        // defs.appendChild(turbulence);
        defs.appendChild(this.filterPaper);
    }


    showPaperDEBUG() {

        var bigPaperContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bigPaperContainer.setAttribute("id", "paperContainer");
        bigPaperContainer.setAttribute("result", "paperContainer");
        bigPaperContainer.setAttribute("x", "0");
        bigPaperContainer.setAttribute("y", "0");
        bigPaperContainer.setAttribute("width", "100%");
        bigPaperContainer.setAttribute("height", "100%");
        bigPaperContainer.setAttribute("fill", "none");
        // bigPaperContainer.setAttribute("fill", "red");  // DEBUG
        bigPaperContainer.setAttribute("filter", "url(#filterPaper)");

        defs.appendChild(bigPaperContainer);

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(bigPaperContainer);
    }

    createFilter() {

        this.filterPaper = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this.filterPaper.setAttribute("id", "filterPaper");
        this.filterPaper.setAttribute("x", "0");
        this.filterPaper.setAttribute("y", "0");
        // added
        // this.filterPaper.setAttribute("filterUnits", "objectBoundingBox");
        // this.filterPaper.setAttribute("primitiveUnits", "userSpaceOnUse");
        // this.filterPaper.setAttribute("color-interpolation-filters", "linearRGB");
    }

    createTurbulence() {
        this.turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        this.turbulence.setAttribute("id", "turbulence");
        this.turbulence.setAttribute("type", "fractalNoise");
        this.turbulence.setAttribute("baseFrequency", "0.4"); // 0.04
        this.turbulence.setAttribute("numOctaves", "5");
        // this.turbulence.setAttribute("seed", "15");
        this.turbulence.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        this.turbulence.setAttribute("stitchTiles", "stitch");
        this.turbulence.setAttribute("x", "0%");
        this.turbulence.setAttribute("y", "0%");
        this.turbulence.setAttribute("width", "100%");
        this.turbulence.setAttribute("height", "100%");
        this.turbulence.setAttribute("result", "turbulence");
        this.filterPaper.appendChild(this.turbulence);
    }

    createDiffuseLighting() {
        this.diffuseLighting = document.createElementNS("http://www.w3.org/2000/svg", "feDiffuseLighting");
        this.diffuseLighting.setAttribute("id", "diffuseLighting");
        this.diffuseLighting.setAttribute("in", "turbulence");
        this.diffuseLighting.setAttribute("lighting-color", "white");
        this.diffuseLighting.setAttribute("surfaceScale", "0.25");  // 2
        this.filterPaper.appendChild(this.diffuseLighting);
    }

    createDistanceLight() {
        this.distantLight = document.createElementNS("http://www.w3.org/2000/svg", "feDistantLight");
        this.distantLight.setAttribute("id", "distantLight");
        this.distantLight.setAttribute("azimuth", "45");
        this.distantLight.setAttribute("elevation", "60");
        this.diffuseLighting.appendChild(this.distantLight);
    }
}
