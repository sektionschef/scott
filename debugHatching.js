function _hatchDrawPolygon(group, points, fill, stroke, strokeWidth, opacity) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
    polygon.setAttribute("fill", fill);
    polygon.setAttribute("stroke", stroke);
    polygon.setAttribute("stroke-width", strokeWidth);
    polygon.setAttribute("opacity", opacity);
    group.appendChild(polygon);
}

function _hatchDrawStroke(group, cx, cy, angle, length, stroke, strokeWidth, opacity) {
    const half = length / 2;
    const x1 = cx + Math.cos(angle) * half;
    const y1 = cy + Math.sin(angle) * half;
    const x2 = cx - Math.cos(angle) * half;
    const y2 = cy - Math.sin(angle) * half;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", strokeWidth);
    line.setAttribute("opacity", opacity);
    line.setAttribute("fill", "none");
    group.appendChild(line);
}

function testHatchingStyles() {
    console.log("testHatchingStyles: start");
    const svgNode = document.getElementById('svgNode');
    if (!svgNode) { console.error("debugHatching: svgNode not found"); return; }

    // CSS background — visible even if all SVG content fails to draw
    svgNode.style.background = "#ffd0d0";

    const W = CANVASFORMATCHOSEN.canvasWidth;
    const H = CANVASFORMATCHOSEN.canvasHeight;
    console.log("testHatchingStyles: W=" + W + " H=" + H);

    const labelHeight = 20;
    const margin = 30;
    const gap = 10;
    const rectW = (W - margin * 2 - gap * 4) / 5;
    const rectH = H - margin * 2 - labelHeight;
    const rectY = margin + labelHeight;

    const rects = [];
    for (let i = 0; i < 5; i++) {
        rects.push({
            x: margin + i * (rectW + gap),
            y: rectY,
            width: rectW,
            height: rectH,
        });
    }

    const boxSize = SHORTSIDE / RESOLUTIONBOXCOUNT;
    const spacing = boxSize * 2;
    const strokeLength = boxSize * 4;
    const color = "#222222";
    const sw = 2;

    const labels = ["Horizontal", "Vertical", "45°", "315°", "Circles (todo)"];

    // wrapper group for everything
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "debugHatchingGroup");
    svgNode.appendChild(group);

    // reuse the existing <defs id="defs"> created in main() — avoids multiple-defs quirks
    const defs = document.getElementById('defs');

    for (let i = 0; i < 5; i++) {
        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", `debugHatchClip_${i}`);
        const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        clipRect.setAttribute("x", rects[i].x);
        clipRect.setAttribute("y", rects[i].y);
        clipRect.setAttribute("width", rects[i].width);
        clipRect.setAttribute("height", rects[i].height);
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
    }

    // light background to contrast with the page
    _hatchDrawPolygon(group, [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: H },
        { x: 0, y: H },
    ], "#f0f0f0", "none", 0, 1);

    // borders
    for (let i = 0; i < 5; i++) {
        _drawHatchBorder(group, rects[i]);
    }

    // hatch groups — each clipped to its rect
    const hatchGroups = rects.map((rect, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("clip-path", `url(#debugHatchClip_${i})`);
        group.appendChild(g);
        return g;
    });

    console.log("testHatchingStyles: drawing hatching");
    hatchHorizontal(hatchGroups[0], rects[0], spacing, strokeLength, color, sw);
    hatchVertical(hatchGroups[1], rects[1], spacing, strokeLength, color, sw);
    hatch45(hatchGroups[2], rects[2], spacing, strokeLength, color, sw);
    hatch315(hatchGroups[3], rects[3], spacing, strokeLength, color, sw);
    // hatchGroups[4]: circles - TODO

    // labels drawn on top
    for (let i = 0; i < 5; i++) {
        _drawHatchLabel(group, rects[i], labels[i]);
    }
    console.log("testHatchingStyles: done");
}

function hatchHorizontal(g, rect, spacing, strokeLength, color, strokeWidth) {
    for (let y = rect.y + spacing / 2; y <= rect.y + rect.height; y += spacing) {
        for (let cx = rect.x + strokeLength / 2; cx < rect.x + rect.width + strokeLength; cx += strokeLength) {
            _hatchDrawStroke(g, cx, y, 0, strokeLength, color, strokeWidth, 1);
        }
    }
}

function hatchVertical(g, rect, spacing, strokeLength, color, strokeWidth) {
    for (let x = rect.x + spacing / 2; x <= rect.x + rect.width; x += spacing) {
        for (let cy = rect.y + strokeLength / 2; cy < rect.y + rect.height + strokeLength; cy += strokeLength) {
            _hatchDrawStroke(g, x, cy, Math.PI / 2, strokeLength, color, strokeWidth, 1);
        }
    }
}

function hatch45(g, rect, spacing, strokeLength, color, strokeWidth) {
    const angle = Math.PI / 4;

    // Lines y = x + b. Perpendicular distance s between lines => |bStep| = s * √2.
    const bMin = rect.y - (rect.x + rect.width);
    const bMax = (rect.y + rect.height) - rect.x;
    const bStep = spacing * Math.SQRT2;

    for (let b = bMin - bStep; b <= bMax + bStep; b += bStep) {
        const tMin = Math.max(rect.x, rect.y - b) - strokeLength;
        const tMax = Math.min(rect.x + rect.width, rect.y + rect.height - b) + strokeLength;

        for (let t = tMin + strokeLength / 2; t <= tMax; t += strokeLength) {
            _hatchDrawStroke(g, t, t + b, angle, strokeLength, color, strokeWidth, 1);
        }
    }
}

function hatch315(g, rect, spacing, strokeLength, color, strokeWidth) {
    const angle = -Math.PI / 4;  // 315°

    // Lines y = -x + c. Perpendicular distance s between lines => |cStep| = s * √2.
    const cMin = rect.y + rect.x;
    const cMax = (rect.y + rect.height) + (rect.x + rect.width);
    const cStep = spacing * Math.SQRT2;

    for (let c = cMin - cStep; c <= cMax + cStep; c += cStep) {
        const tMin = Math.max(rect.x, c - (rect.y + rect.height)) - strokeLength;
        const tMax = Math.min(rect.x + rect.width, c - rect.y) + strokeLength;

        for (let t = tMin + strokeLength / 2; t <= tMax; t += strokeLength) {
            _hatchDrawStroke(g, t, c - t, angle, strokeLength, color, strokeWidth, 1);
        }
    }
}

// TODO: implement small circles hatching
function hatchCircles(parent, rect, spacing, radius, color, strokeWidth) {
    // stub — circles hatching not yet implemented
}

function _drawHatchBorder(parent, rect) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", rect.x);
    r.setAttribute("y", rect.y);
    r.setAttribute("width", rect.width);
    r.setAttribute("height", rect.height);
    r.setAttribute("fill", "#f8f8f8");
    r.setAttribute("stroke", "#555555");
    r.setAttribute("stroke-width", 1);
    parent.appendChild(r);
}

function _drawHatchLabel(parent, rect, text) {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", rect.x + rect.width / 2);
    label.setAttribute("y", rect.y - 6);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "#333333");
    label.setAttribute("font-size", "14");
    label.setAttribute("font-family", "monospace");
    label.appendChild(document.createTextNode(text));
    parent.appendChild(label);
}
