function _hatchDrawPolygon(group, points, fill, stroke, strokeWidth, opacity) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
    polygon.setAttribute("fill", fill);
    polygon.setAttribute("stroke", stroke);
    polygon.setAttribute("stroke-width", strokeWidth);
    polygon.setAttribute("opacity", opacity);
    group.appendChild(polygon);
}

function _hatchDrawStroke(groupId, cx, cy, angle, length, stroke, strokeWidth, opacity) {
    const half = length / 2;
    const x1 = cx + Math.cos(angle) * half;
    const y1 = cy + Math.sin(angle) * half;
    const x2 = cx - Math.cos(angle) * half;
    const y2 = cy - Math.sin(angle) * half;

    new filledPath({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        group: groupId,
        width: 1,
    });
}

function _hatchDrawCircle(groupId, cx, cy, radius, stroke, strokeWidth, opacity) {
    new circlePath({
        center: { x: cx, y: cy },
        radius: radius,
        group: groupId,
        color: stroke,
        width: 1,
    });
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
    const gap = 10;
    const marginX = Math.max(30, W * 0.04);
    const rectW = (W - marginX * 2 - gap * 4) / 5;
    const rectH = Math.max(120, H - 120 - labelHeight);
    const rectY = Math.round((H - rectH) / 2 + labelHeight / 2);

    const rects = [];
    for (let i = 0; i < 5; i++) {
        rects.push({
            x: marginX + i * (rectW + gap),
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

    const labels = ["Horizontal", "Vertical", "45°", "315°", "Circles"];

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
    const hatchGroupIds = rects.map((rect, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const hatchGroupId = `debugHatchContent_${i}`;
        g.setAttribute("id", hatchGroupId);
        g.setAttribute("clip-path", `url(#debugHatchClip_${i})`);
        group.appendChild(g);
        return hatchGroupId;
    });

    console.log("testHatchingStyles: drawing hatching");
    hatchHorizontal(hatchGroupIds[0], rects[0], spacing, strokeLength, color, sw);
    hatchVertical(hatchGroupIds[1], rects[1], spacing, strokeLength, color, sw);
    hatch45(hatchGroupIds[2], rects[2], spacing, strokeLength, color, sw);
    hatch315(hatchGroupIds[3], rects[3], spacing, strokeLength, color, sw);
    hatchCircles(hatchGroupIds[4], rects[4], spacing, strokeLength * 0.28, color, sw);

    // labels drawn on top
    for (let i = 0; i < 5; i++) {
        _drawHatchLabel(group, rects[i], labels[i]);
    }
    console.log("testHatchingStyles: done");
}

function _gridDistributeStrokes(groupId, rect, spacing, strokeLength, angle, color, strokeWidth) {
    const boxSize = SHORTSIDE / RESOLUTIONBOXCOUNT;
    const hatchDensityMultiplier = 4;
    const hatchDensityScale = Math.sqrt(hatchDensityMultiplier);
    const rowStepBoxesBase = Math.max(1, Math.round(spacing / boxSize));
    const colStepBoxesBase = Math.max(1, Math.round(strokeLength / boxSize));
    const rowStepBoxes = Math.max(1, Math.round(rowStepBoxesBase / hatchDensityScale));
    const colStepBoxes = Math.max(1, Math.round(colStepBoxesBase / hatchDensityScale));

    // Generate stroke centers from the global grid, row-major (top->bottom, left->right).
    const minRow = Math.floor(rect.y / boxSize) - rowStepBoxes;
    const maxRow = Math.ceil((rect.y + rect.height) / boxSize) + rowStepBoxes;
    const minCol = Math.floor(rect.x / boxSize) - colStepBoxes;
    const maxCol = Math.ceil((rect.x + rect.width) / boxSize) + colStepBoxes;

    for (let row = minRow; row <= maxRow; row += rowStepBoxes) {
        const cy = (row + 0.5) * boxSize;
        for (let col = minCol; col <= maxCol; col += colStepBoxes) {
            const cx = (col + 0.5) * boxSize;
            _hatchDrawStroke(groupId, cx, cy, angle, strokeLength, color, strokeWidth, 1);
        }
    }
}

function hatchHorizontal(groupId, rect, spacing, strokeLength, color, strokeWidth) {
    _gridDistributeStrokes(groupId, rect, spacing, strokeLength, 0, color, strokeWidth);
}

function hatchVertical(groupId, rect, spacing, strokeLength, color, strokeWidth) {
    _gridDistributeStrokes(groupId, rect, spacing, strokeLength, Math.PI / 2, color, strokeWidth);
}

function hatch45(groupId, rect, spacing, strokeLength, color, strokeWidth) {
    _gridDistributeStrokes(groupId, rect, spacing, strokeLength, Math.PI / 4, color, strokeWidth);
}

function hatch315(groupId, rect, spacing, strokeLength, color, strokeWidth) {
    _gridDistributeStrokes(groupId, rect, spacing, strokeLength, -Math.PI / 4, color, strokeWidth);
}

function hatchCircles(groupId, rect, spacing, radius, color, strokeWidth) {
    const boxSize = SHORTSIDE / RESOLUTIONBOXCOUNT;
    const hatchDensityMultiplier = 4;
    const hatchDensityScale = Math.sqrt(hatchDensityMultiplier);

    // Adjust spacing and radius for better visualization
    const adjustedSpacing = spacing * 1.5; // Increase spacing
    const adjustedRadius = radius * 1.2; // Increase circle size

    const rowStepBoxesBase = Math.max(1, Math.round(adjustedSpacing / boxSize));
    const colStepBoxesBase = Math.max(1, Math.round((adjustedRadius * 2) / boxSize));
    const rowStepBoxes = Math.max(1, Math.round(rowStepBoxesBase / hatchDensityScale));
    const colStepBoxes = Math.max(1, Math.round(colStepBoxesBase / hatchDensityScale));

    const minRow = Math.floor(rect.y / boxSize) - rowStepBoxes;
    const maxRow = Math.ceil((rect.y + rect.height) / boxSize) + rowStepBoxes;
    const minCol = Math.floor(rect.x / boxSize) - colStepBoxes;
    const maxCol = Math.ceil((rect.x + rect.width) / boxSize) + colStepBoxes;

    for (let row = minRow; row <= maxRow; row += rowStepBoxes) {
        for (let col = minCol; col <= maxCol; col += colStepBoxes) {
            const centerX = col * boxSize + boxSize / 2;
            const centerY = row * boxSize + boxSize / 2;

            if (
                centerX >= rect.x &&
                centerX <= rect.x + rect.width &&
                centerY >= rect.y &&
                centerY <= rect.y + rect.height
            ) {
                new circlePath({
                    center: { x: centerX, y: centerY },
                    radius: adjustedRadius,
                    group: groupId,
                    color,
                    width: strokeWidth,
                });
            }
        }
    }
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

function debugSingleCircle(groupId, center, radius, color, strokeWidth) {
    const group = document.getElementById(groupId);
    if (!group) { return; }

    // Draw the circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center.x);
    circle.setAttribute("cy", center.y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", strokeWidth);
    group.appendChild(circle);

    // Add debugging points
    const debugPoints = [
        { x: center.x, y: center.y }, // Center point
        { x: center.x + radius, y: center.y }, // Right edge
        { x: center.x - radius, y: center.y }, // Left edge
        { x: center.x, y: center.y + radius }, // Bottom edge
        { x: center.x, y: center.y - radius }, // Top edge
    ];

    debugPoints.forEach((point, index) => {
        const debugCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        debugCircle.setAttribute("cx", point.x);
        debugCircle.setAttribute("cy", point.y);
        debugCircle.setAttribute("r", 2);
        debugCircle.setAttribute("fill", "red");
        debugCircle.setAttribute("stroke", "none");
        debugCircle.setAttribute("data-debug-point", `point-${index}`);
        group.appendChild(debugCircle);
    });
}

function testSingleCircle() {
    const svgNode = document.getElementById('svgNode');
    if (!svgNode) { console.error("debugSingleCircle: svgNode not found"); return; }

    const W = CANVASFORMATCHOSEN.canvasWidth;
    const H = CANVASFORMATCHOSEN.canvasHeight;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const groupId = "debugSingleCircleGroup";
    group.setAttribute("id", groupId);
    svgNode.appendChild(group);

    const center = { x: W * 0.5, y: H * 0.5 };
    const radius = Math.max(18, SHORTSIDE * 0.05);

    // Draw one jittered organic circle via the same production shape class.
    new circlePath({
        center,
        radius,
        group: groupId,
        color: "#3756b5",
        width: 1.6,
        jitter: 0.9,
        bend: 0.08,
    });

    debugSingleCircle(groupId, center, radius, "none", 1);
}
