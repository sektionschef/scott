function testFilledPath() {

    var data = {
        start: { x: 25, y: 90 },
        end: { x: 60, y: 45 },
        strokeWidth: 30,
        group: "svgNode",
    }

    new filledPath(data).showDebugStroke();

}

function testFilledPathParams() {
    const svgNode = document.getElementById('svgNode');
    const W = CANVASFORMATCHOSEN.canvasWidth;
    const H = CANVASFORMATCHOSEN.canvasHeight;

    svgNode.style.background = "#f0f0f0";

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "debugFilledPathGroup");
    svgNode.appendChild(group);

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0); bg.setAttribute("y", 0);
    bg.setAttribute("width", W); bg.setAttribute("height", H);
    bg.setAttribute("fill", "#f0f0f0");
    group.appendChild(bg);

    const cols = 8;
    const rows = 3;
    const marginLeft = 50;
    const marginTop = 40;
    const colW = (W - marginLeft - 20) / cols;
    const rowH = (H - marginTop - 20) / rows;
    const strokeLen = colW * 0.55;

    // 3 rows: one param swept per row, others at neutral default
    const sweeps = [
        { label: "jitter", key: "jitter", values: [0, 0.25, 0.5, 0.75, 1, 1.5, 2.5, 4] },
        { label: "bend",   key: "bend",   values: [-0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2, 0.35] },
        { label: "width",  key: "width",  values: [0.3, 0.6, 1, 1.5, 2, 3, 4, 6] },
    ];

    const _text = (parent, x, y, str, size, color, anchor) => {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("font-size", size);
        t.setAttribute("font-family", "monospace");
        t.setAttribute("fill", color);
        t.setAttribute("text-anchor", anchor || "middle");
        t.textContent = str;
        parent.appendChild(t);
    };

    for (let r = 0; r < rows; r++) {
        const sweep = sweeps[r];
        const cy = marginTop + r * rowH + rowH * 0.4;

        _text(group, marginLeft - 6, cy + 4, sweep.label, 11, "#888", "end");

        for (let c = 0; c < cols; c++) {
            const cx = marginLeft + c * colW + colW / 2;
            const val = sweep.values[c];

            // neutral baseline + sweep this row's param
            const params = { jitter: 0.75, bend: 0, width: 1 };
            params[sweep.key] = val;

            // draw multiple strokes per cell to show natural variation
            for (let rep = 0; rep < 8; rep++) {
                const offsetY = (rep - 3.5) * (params.width * 1.8 + 1.5);
                new filledPath({
                    start: { x: cx - strokeLen / 2, y: cy + offsetY },
                    end:   { x: cx + strokeLen / 2, y: cy + offsetY },
                    group: "debugFilledPathGroup",
                    ...params,
                });
            }

            // value label below the strokes
            _text(group, cx, cy + rowH * 0.48, String(val), 9, "#aaa");
        }
    }
}