const FILLED_PATH_DEBUG_STYLE_ID = "filledPathDebugStyle";
const FILLED_PATH_DEBUG_PANEL_ID = "filledPathDebugPanel";
const FILLED_PATH_DEBUG_GROUP_ID = "debugFilledPathGroup";
const FILLED_PATH_DEBUG_ROOT_ID = "debugFilledPathRoot";

function ensureFilledPathDebugStyles() {
    if (document.getElementById(FILLED_PATH_DEBUG_STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = FILLED_PATH_DEBUG_STYLE_ID;
    style.textContent = `
body.debug-filled-path {
    overflow: hidden;
    background: #e8e1d4;
    font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
}

body.debug-filled-path #badAssCanvas {
    position: fixed;
    inset: 0;
}

body.debug-filled-path #svgNode {
    width: 100%;
    height: 100%;
    display: block;
    background: linear-gradient(180deg, #f3ede2 0%, #e5dbca 100%);
}

body.debug-filled-path #${FILLED_PATH_DEBUG_PANEL_ID} {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 10;
    width: min(340px, calc(100vw - 36px));
    padding: 14px 16px 16px;
    border-radius: 14px;
    border: 1px solid rgba(48, 37, 23, 0.16);
    background: rgba(248, 244, 236, 0.94);
    box-shadow: 0 18px 55px rgba(66, 49, 27, 0.18);
    backdrop-filter: blur(10px);
    color: #352717;
}

body.debug-filled-path #${FILLED_PATH_DEBUG_PANEL_ID} h2 {
    margin: 0 0 6px;
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

body.debug-filled-path #${FILLED_PATH_DEBUG_PANEL_ID} p {
    margin: 0 0 14px;
    font-size: 11px;
    line-height: 1.5;
    color: rgba(53, 39, 23, 0.72);
}

body.debug-filled-path .filledPathDebugGrid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px 12px;
    align-items: center;
}

body.debug-filled-path .filledPathDebugLabel {
    display: grid;
    gap: 4px;
    font-size: 11px;
}

body.debug-filled-path .filledPathDebugLabel strong {
    font-size: 11px;
    font-weight: 600;
}

body.debug-filled-path .filledPathDebugLabel span {
    color: rgba(53, 39, 23, 0.64);
}

body.debug-filled-path .filledPathDebugRowValue {
    min-width: 56px;
    text-align: right;
    font-size: 11px;
    color: rgba(53, 39, 23, 0.72);
}

body.debug-filled-path .filledPathDebugRange {
    grid-column: 1 / span 2;
    width: 100%;
    accent-color: #8f5a29;
}

body.debug-filled-path .filledPathDebugCheckbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 14px 0 10px;
    font-size: 11px;
}

body.debug-filled-path .filledPathDebugCheckbox input {
    width: 16px;
    height: 16px;
    accent-color: #8f5a29;
}

body.debug-filled-path .filledPathDebugButtonRow {
    display: flex;
    gap: 10px;
    margin-top: 8px;
}

body.debug-filled-path .filledPathDebugButtonRow button {
    flex: 1;
    border: 1px solid rgba(53, 39, 23, 0.18);
    border-radius: 999px;
    background: #fffdf9;
    color: #352717;
    padding: 9px 12px;
    font: inherit;
    cursor: pointer;
}

body.debug-filled-path .filledPathDebugButtonRow button:hover {
    background: #f5eee3;
}

@media (max-width: 720px) {
    body.debug-filled-path #${FILLED_PATH_DEBUG_PANEL_ID} {
        left: 12px;
        right: 12px;
        top: auto;
        bottom: 12px;
        width: auto;
        max-height: 52vh;
        overflow: auto;
    }
}
`;

    document.head.appendChild(style);
}

function createFilledPathDebugControlRow(parent, config, state, onChange) {
    const label = document.createElement("label");
    label.className = "filledPathDebugLabel";

    const title = document.createElement("strong");
    title.textContent = config.label;
    label.appendChild(title);

    const hint = document.createElement("span");
    hint.textContent = config.hint;
    label.appendChild(hint);

    const value = document.createElement("div");
    value.className = "filledPathDebugRowValue";

    const input = document.createElement("input");
    input.className = "filledPathDebugRange";
    input.type = "range";
    input.min = String(config.min);
    input.max = String(config.max);
    input.step = String(config.step);
    input.value = String(state[config.key]);

    const syncValue = () => {
        const digits = config.digits !== undefined ? config.digits : 2;
        value.textContent = Number(state[config.key]).toFixed(digits);
        input.value = String(state[config.key]);
    };

    input.addEventListener("input", () => {
        state[config.key] = Number(input.value);
        syncValue();
        onChange();
    });

    syncValue();
    parent.appendChild(label);
    parent.appendChild(value);
    parent.appendChild(input);
}

function drawFilledPathDebugText(parent, x, y, value, options) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", options.fill || "#5b4732");
    text.setAttribute("font-size", options.size || 14);
    text.setAttribute("font-family", "monospace");
    text.setAttribute("letter-spacing", options.letterSpacing || 0);
    text.setAttribute("text-anchor", options.anchor || "start");
    text.textContent = value;
    parent.appendChild(text);
}

function getFilledPathDebugDefaults() {
    return {
        jitter: 0.55,
        bend: 0.03,
        width: 1.65,
        length: 220,
        angle: -16,
        strokeCount: 4,
        spacing: 30,
        zoom: sp.get("zoom") === "1" ? 5.2 : 2.2,
        showPoints: true,
        reroll: 0,
    };
}

function renderFilledPathDebugScene(state) {
    const svgNode = document.getElementById("svgNode");
    const defs = document.getElementById("defs");
    const W = CANVASFORMATCHOSEN.canvasWidth;
    const H = CANVASFORMATCHOSEN.canvasHeight;

    Array.from(svgNode.children).forEach((child) => {
        if (child !== defs) {
            child.remove();
        }
    });

    const rootGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    rootGroup.setAttribute("id", FILLED_PATH_DEBUG_ROOT_ID);
    svgNode.appendChild(rootGroup);

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0);
    bg.setAttribute("y", 0);
    bg.setAttribute("width", W);
    bg.setAttribute("height", H);
    bg.setAttribute("fill", "#efe7d7");
    rootGroup.appendChild(bg);

    const sceneGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sceneGroup.setAttribute("id", FILLED_PATH_DEBUG_GROUP_ID);
    const focusCenter = { x: W * 0.44, y: H * 0.5 };
    sceneGroup.setAttribute(
        "transform",
        `translate(${focusCenter.x} ${focusCenter.y}) scale(${state.zoom}) translate(${-focusCenter.x} ${-focusCenter.y})`
    );
    rootGroup.appendChild(sceneGroup);

    const unit = vectorFromAngle(state.angle * Math.PI / 180, state.length / 2);
    const normal = vectorFromAngle(state.angle * Math.PI / 180 + Math.PI / 2, state.spacing);
    const baseCenter = { x: W * 0.44, y: H * 0.5 };

    for (let i = 0; i < state.strokeCount; i++) {
        const offsetIndex = i - (state.strokeCount - 1) / 2;
        const center = vectorAdd(baseCenter, {
            x: normal.x * offsetIndex,
            y: normal.y * offsetIndex,
        });

        const stroke = new filledPath({
            start: {
                x: center.x - unit.x,
                y: center.y - unit.y,
            },
            end: {
                x: center.x + unit.x,
                y: center.y + unit.y,
            },
            group: FILLED_PATH_DEBUG_GROUP_ID,
            jitter: state.jitter,
            bend: state.bend,
            width: state.width,
            reroll: state.reroll,
        });

        if (state.showPoints && i === Math.floor(state.strokeCount / 2)) {
            stroke.showDebugStroke();
        }
    }

    const guideLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    guideLine.setAttribute("x1", W * 0.22);
    guideLine.setAttribute("y1", H * 0.5);
    guideLine.setAttribute("x2", W * 0.66);
    guideLine.setAttribute("y2", H * 0.5);
    guideLine.setAttribute("stroke", "#c3b299");
    guideLine.setAttribute("stroke-width", 0.8);
    guideLine.setAttribute("stroke-dasharray", "4 6");
    guideLine.setAttribute("opacity", 0.9);
    sceneGroup.appendChild(guideLine);
}

function mountFilledPathDebugPanel(state, render) {
    const existing = document.getElementById(FILLED_PATH_DEBUG_PANEL_ID);
    if (existing) {
        existing.remove();
    }

    const panel = document.createElement("section");
    panel.id = FILLED_PATH_DEBUG_PANEL_ID;

    const heading = document.createElement("h2");
    heading.textContent = "Filled Path";
    panel.appendChild(heading);

    const description = document.createElement("p");
    description.textContent = "Adjust the center stroke, keep a few comparison strokes on screen, and toggle the control points for the middle shape.";
    panel.appendChild(description);

    const grid = document.createElement("div");
    grid.className = "filledPathDebugGrid";
    panel.appendChild(grid);

    const controls = [
        { key: "zoom", label: "Zoom", hint: "Scale the scene without using the CSS zoom stylesheet", min: 1, max: 8, step: 0.1, digits: 1 },
        { key: "jitter", label: "Jitter", hint: "Endpoint wobble before the outline is solved", min: 0, max: 4, step: 0.05, digits: 2 },
        { key: "bend", label: "Bend", hint: "Curvature through the side control handles", min: -0.35, max: 0.35, step: 0.01, digits: 2 },
        { key: "width", label: "Width", hint: "Distance from stroke spine to contour", min: 0.2, max: 8, step: 0.05, digits: 2 },
        { key: "length", label: "Length", hint: "Distance between start and end anchors", min: 80, max: 360, step: 2, digits: 0 },
        { key: "angle", label: "Angle", hint: "Rotate the stroke around its center", min: -90, max: 90, step: 1, digits: 0 },
        { key: "strokeCount", label: "Sibling strokes", hint: "How many comparison strokes stay on screen", min: 1, max: 7, step: 1, digits: 0 },
        { key: "spacing", label: "Spacing", hint: "Offset between the comparison strokes", min: 8, max: 80, step: 1, digits: 0 },
    ];

    controls.forEach((control) => {
        createFilledPathDebugControlRow(grid, control, state, render);
    });

    const checkboxRow = document.createElement("label");
    checkboxRow.className = "filledPathDebugCheckbox";
    checkboxRow.textContent = "Show debug points on the center stroke";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.showPoints;
    checkbox.addEventListener("change", () => {
        state.showPoints = checkbox.checked;
        render();
    });
    checkboxRow.appendChild(checkbox);
    panel.appendChild(checkboxRow);

    const buttonRow = document.createElement("div");
    buttonRow.className = "filledPathDebugButtonRow";

    const rerollButton = document.createElement("button");
    rerollButton.type = "button";
    rerollButton.textContent = "Reroll";
    rerollButton.addEventListener("click", () => {
        state.reroll += 1;
        render();
    });
    buttonRow.appendChild(rerollButton);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    resetButton.addEventListener("click", () => {
        Object.assign(state, getFilledPathDebugDefaults());
        mountFilledPathDebugPanel(state, render);
        render();
    });
    buttonRow.appendChild(resetButton);

    panel.appendChild(buttonRow);
    document.body.appendChild(panel);
}

function testFilledPath() {
    document.body.classList.add("debug-filled-path");
    ensureFilledPathDebugStyles();

    const state = getFilledPathDebugDefaults();
    const render = () => renderFilledPathDebugScene(state);

    mountFilledPathDebugPanel(state, render);
    render();
}

function testFilledPathParams() {
    testFilledPath();
}