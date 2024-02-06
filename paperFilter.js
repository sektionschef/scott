class paperFilter {
    constructor() {

        this.filterPaper = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this.filterPaper.setAttribute("id", "filterPaper");
        this.filterPaper.setAttribute("x", "0");
        this.filterPaper.setAttribute("y", "0");
        // added
        // this.filterPaper.setAttribute("filterUnits", "objectBoundingBox");
        // this.filterPaper.setAttribute("primitiveUnits", "userSpaceOnUse");
        // this.filterPaper.setAttribute("color-interpolation-filters", "linearRGB");

        // PAPER
        this.createTurbulence();
        this.createDiffuseLighting();
        this.createDistanceLight();

        this.filterPaper.appendChild(this.turbulence);
        this.diffuseLighting.appendChild(this.distantLight);
        this.filterPaper.appendChild(this.diffuseLighting);

        // defs.appendChild(turbulence);
        defs.appendChild(this.filterPaper);
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
    }

    createDiffuseLighting() {
        this.diffuseLighting = document.createElementNS("http://www.w3.org/2000/svg", "feDiffuseLighting");
        this.diffuseLighting.setAttribute("id", "diffuseLighting");
        this.diffuseLighting.setAttribute("in", "turbulence");
        this.diffuseLighting.setAttribute("lighting-color", "white");
        this.diffuseLighting.setAttribute("surfaceScale", "0.25");  // 2
    }

    createDistanceLight() {
        this.distantLight = document.createElementNS("http://www.w3.org/2000/svg", "feDistantLight");
        this.distantLight.setAttribute("id", "distantLight");
        this.distantLight.setAttribute("azimuth", "45");
        this.distantLight.setAttribute("elevation", "60");
    }
}
