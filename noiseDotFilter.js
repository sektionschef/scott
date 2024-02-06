

// https://fffuel.co/nnnoise/
// <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 700 700" width="700" height="700" opacity="0.83"><defs>

//     <filter id="nnnoise-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB">
//         <feTurbulence type="fractalNoise" baseFrequency="0.097" numOctaves="4" seed="15" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence"></feTurbulence>
//         <feSpecularLighting surfaceScale="28" specularConstant="1.5" specularExponent="20" lighting-color="#0400ff" x="0%" y="0%" width="100%" height="100%" in="turbulence" result="specularLighting">
//             <feDistantLight azimuth="3" elevation="103"></feDistantLight>
//         </feSpecularLighting>
//         <feColorMatrix type="saturate" values="0" x="0%" y="0%" width="100%" height="100%" in="specularLighting" result="colormatrix"></feColorMatrix>
//     </filter>

// </defs>
//     <rect width="700" height="700" fill="#ffffffff"></rect>
//     <rect width="700" height="700" fill="#0400ff" filter="url(#nnnoise-filter)"></rect>
// </svg>


class noiseDotFilter {
    constructor() {

        this.filterDot = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this.filterDot.setAttribute("id", "filterDot");
        this.filterDot.setAttribute("x", "0");
        this.filterDot.setAttribute("y", "0");

        this.createTurbulence();
        this.createSpecularLight();
        this.createDistantLight();
        this.createColorMatrix();

        const defs = document.getElementById('defs');
        defs.appendChild(this.filterDot);

        this.createRect();

        const svgNode = document.getElementById('svgNode');
        svgNode.appendChild(this.rectDot);
    }

    createTurbulence() {
        this.turbulenceDot = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        this.turbulenceDot.setAttribute("id", "turbulenceDot");
        this.turbulenceDot.setAttribute("type", "turbulence");
        // this.turbulenceDot.setAttribute("baseFrequency", "0.097");
        this.turbulenceDot.setAttribute("baseFrequency", "0.097 0.02");
        this.turbulenceDot.setAttribute("numOctaves", "4");
        this.turbulenceDot.setAttribute("seed", `${Math.round($fx.rand() * 100)}`);
        this.turbulenceDot.setAttribute("stitchTiles", "stitch");
        this.turbulenceDot.setAttribute("x", "0%");
        this.turbulenceDot.setAttribute("y", "0%");
        this.turbulenceDot.setAttribute("width", "100%");
        this.turbulenceDot.setAttribute("height", "100%");
        this.turbulenceDot.setAttribute("result", "turbulenceDot");
        this.filterDot.appendChild(this.turbulenceDot);
    }

    createSpecularLight() {
        this.feSpecularLightingDot = document.createElementNS("http://www.w3.org/2000/svg", "feSpecularLighting");
        this.feSpecularLightingDot.setAttribute("id", "feSpecularLightingDot");
        this.feSpecularLightingDot.setAttribute("surfaceScale", "28"); // 13 // change for more radical results
        this.feSpecularLightingDot.setAttribute("specularConstant", "1.5");
        this.feSpecularLightingDot.setAttribute("specularExponent", "20");  // 15
        // this.feSpecularLightingDot.setAttribute("kernelUnitLength", "0 0");
        // this.feSpecularLightingDot.setAttribute("lighting-color", "#0400ff");
        this.feSpecularLightingDot.setAttribute("lighting-color", "#3d3c92");
        this.feSpecularLightingDot.setAttribute("in", "turbulenceDot");
        this.feSpecularLightingDot.setAttribute("result", "feSpecularLightingDot");
        this.filterDot.appendChild(this.feSpecularLightingDot);
    }

    createDistantLight() {
        this.feDistantLightDot = document.createElementNS("http://www.w3.org/2000/svg", "feDistantLight");
        this.feDistantLightDot.setAttribute("id", "feDistantLightDot");
        this.feDistantLightDot.setAttribute("azimuth", "3");
        this.feDistantLightDot.setAttribute("elevation", "103");
        this.feSpecularLightingDot.appendChild(this.feDistantLightDot);
    }

    createColorMatrix() {
        this.feColorMatrixDot = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        this.feColorMatrixDot.setAttribute("id", "feColorMatrixDot");
        this.feColorMatrixDot.setAttribute("type", "saturate");
        this.feColorMatrixDot.setAttribute("values", "0");
        this.feColorMatrixDot.setAttribute("in", "feSpecularLightingDot");
        this.feColorMatrixDot.setAttribute("result", "colormatrix");
        this.filterDot.appendChild(this.feColorMatrixDot);
    }

    createRect() {
        this.rectDot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.rectDot.setAttribute("id", "rectDot");
        this.rectDot.setAttribute("result", "rectDot");
        this.rectDot.setAttribute("x", "0");
        this.rectDot.setAttribute("y", "0");
        this.rectDot.setAttribute("width", "100%");
        this.rectDot.setAttribute("height", "100%");
        this.rectDot.setAttribute("fill", "#0400ff");
        // this.rectDot.setAttribute("fill", "#706e1600");
        this.rectDot.setAttribute("filter", "url(#filterDot)");
    }
}