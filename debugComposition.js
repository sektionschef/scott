// debugComposition.js — ?debugComposition=1
// Draws an arch/gate structure with hatching per face type:
//   Side A (front, faces viewer) → 45°
//   Side B (right side)          → 45° + 315° + circles
//   Side C (top)                  → 45° + 315°

function testComposition() {
    const svgNode = document.getElementById('svgNode');
    if (!svgNode) { console.error("debugComposition: svgNode not found"); return; }

    const W = CANVASFORMATCHOSEN.canvasWidth;
    const H = CANVASFORMATCHOSEN.canvasHeight;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "debugCompositionGroup");
    svgNode.appendChild(group);

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0); bg.setAttribute("y", 0);
    bg.setAttribute("width", W); bg.setAttribute("height", H);
    bg.setAttribute("fill", "#f5f5f2");
    group.appendChild(bg);

    const defs = document.getElementById('defs');

    // Axonometric projection: x=right, y=up, z=depth-upper-right
    const scale = Math.min(W, H) * 0.065;
    const originX = W * 0.48;
    const originY = H * 0.88;

    function proj(px, py, pz) {
        return {
            x: originX + px * scale + pz * 0.50 * scale,
            y: originY - py * scale - pz * 0.28 * scale,
        };
    }

    // Hatch parameters in screen-space pixels
    const boxSize = SHORTSIDE / RESOLUTIONBOXCOUNT;
    const spacing = boxSize * 2;
    const strokeLength = boxSize * 4;
    const color = "#222222";
    const sw = 1;

    let faceIdx = 0;

    // Draw one polygon face with hatching applied inside via clipPath.
    function hatchedFace(pts, types) {
        const fi = faceIdx++;
        const clipId = `compClip_${fi}`;
        const groupId = `compHatch_${fi}`;

        // Register clip polygon
        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", clipId);
        const clipPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        clipPoly.setAttribute("points", pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
        clipPath.appendChild(clipPoly);
        defs.appendChild(clipPath);

        // White fill so face is not transparent
        const bgPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        bgPoly.setAttribute("points", pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
        bgPoly.setAttribute("fill", "#f8f8f8");
        bgPoly.setAttribute("stroke", "none");
        group.appendChild(bgPoly);

        // Hatch group clipped to this face polygon
        const hatchGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        hatchGroup.setAttribute("id", groupId);
        hatchGroup.setAttribute("clip-path", `url(#${clipId})`);
        group.appendChild(hatchGroup);

        // Bounding box of the projected face (screen coords)
        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
        const rect = {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width:  Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
        };

        for (const type of types) {
            if (type === "45")      hatch45(groupId, rect, spacing, strokeLength, color, sw);
            if (type === "315")     hatch315(groupId, rect, spacing, strokeLength, color, sw);
            if (type === "circles") hatchCircles(groupId, rect, spacing, strokeLength * 0.28, color, sw);
        }

        // Outline drawn last so it sits on top of hatching
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        outline.setAttribute("points", pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", "#222");
        outline.setAttribute("stroke-width", "1.8");
        outline.setAttribute("stroke-linejoin", "round");
        group.appendChild(outline);
    }

    // Draw one cuboid. Painter order per face: side B first (deepest), then A (front), then C (top).
    function cuboid(x, y, z, w, h, d) {
        const fbl = proj(x,   y,   z);
        const fbr = proj(x+w, y,   z);
        const ftr = proj(x+w, y+h, z);
        const ftl = proj(x,   y+h, z);
        const bbr = proj(x+w, y,   z+d);
        const btr = proj(x+w, y+h, z+d);
        const btl = proj(x,   y+h, z+d);

        hatchedFace([fbr, ftr, btr, bbr], ["45", "315", "circles"]); // B: right side
        hatchedFace([fbl, fbr, ftr, ftl], ["45"]);                    // A: front
        hatchedFace([ftl, ftr, btr, btl], ["45", "315"]);             // C: top
    }

    // Arch structure — back to front
    cuboid(-3.5,  0,   0,   2, 3.0, 2);   // left bottom
    cuboid(-3.5,  3.0, 0,   2, 2.5, 2);   // left top
    cuboid( 1.5,  3.0, 0,   2, 2.5, 2);   // right top
    cuboid( 1.5,  0,   0,   2, 3.0, 2);   // right bottom
    cuboid(-3.5,  5.5, 0.3, 7, 1.6, 1.4); // lintel
}
