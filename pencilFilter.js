class pencilFilter {
    constructor() {

        // function createPencilNoiseFilter() {
        this.filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this.filter.setAttribute("id", "pencilFilter");
        this.filter.setAttribute("x", "0");
        this.filter.setAttribute("y", "0");

        let turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        turbulence.setAttribute("id", "turbulence");
        // turbulence.setAttribute("type", "fractalNoise");
        turbulence.setAttribute("type", "turbulence");
        turbulence.setAttribute("baseFrequency", "0.5"); //1 - 0.01, 1.5 , 2.5
        turbulence.setAttribute("numOctaves", "50");  // 6
        turbulence.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        turbulence.setAttribute("stitchTiles", "stitch");
        turbulence.setAttribute("x", "0%");
        turbulence.setAttribute("y", "0%");
        turbulence.setAttribute("width", "100%");
        turbulence.setAttribute("height", "100%");
        turbulence.setAttribute("result", "turbulence");

        var displacement = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
        displacement.setAttribute("id", "displacement");
        displacement.setAttribute("scale", "1");  // 1.1
        displacement.setAttribute("in", "SourceGraphic");
        displacement.setAttribute("in2", "turbulence");
        displacement.setAttribute("xChannelSelector", "R");
        displacement.setAttribute("yChannelSelector", "G");
        // displacement.setAttribute("yChannelSelector", "R");
        displacement.setAttribute("result", "displacement");

        this.filter.appendChild(turbulence);
        this.filter.appendChild(displacement);  // comment for debug
        defs.appendChild(this.filter);
    }
}