// --- Organic filledPath SVG hatching ---

function buildFilledPathSvg(start, end, options = {}) {
  // Options: {jitter, bend, width, color, strokeWidth, fill, opacity}
  // Defaults are chosen to match filledPath.js
  const jitter = options.jitter !== undefined ? options.jitter : getRandomFromInterval(0.3, 0.7);
  const bendMagnitude = options.bend !== undefined ? Math.abs(options.bend) : null;
  const bend = bendMagnitude === null
    ? getRandomFromInterval(-0.05, 0.05)
    : (bendMagnitude === 0 ? 0 : bendMagnitude * (Math.random() < 0.5 ? -1 : 1));
  const distanceWidth = options.width !== undefined ? options.width : 1.3; // match filledPath.js default
  const color = options.color || "#333";
  const fill = options.fill || color;
  const opacity = options.opacity !== undefined ? options.opacity : 1;

  let s = {...start};
  let e = {...end};
  const angleRadians = angleBetweenPoints(s, e);
  const vectorMagnitude = vectorLength(vectorSub(s, e));
  s = jitterPoint(s, jitter);
  e = jitterPoint(e, jitter);

  // Swingspitz profile (dynamic width ribbon)
  const A = vectorAdd(s, vectorFromAngle(angleRadians - Math.PI * 0.70, distanceWidth));
  const B = vectorAdd(e, vectorFromAngle(angleRadians + Math.PI * 1.1, distanceWidth));
  const C = vectorAdd(e, vectorFromAngle(angleRadians - Math.PI * 1.1, distanceWidth));
  const D = vectorAdd(s, vectorFromAngle(angleRadians + Math.PI * 0.80, distanceWidth));

  const cAB = vectorAdd(A, vectorFromAngle(angleRadians - Math.PI * (bend + gaussianRandAdj(0, 0.00)), vectorMagnitude / 6));
  const cBA = vectorAdd(B, vectorFromAngle(angleRadians - Math.PI + Math.PI * (bend + gaussianRandAdj(0, 0.00)), vectorMagnitude / 6));
  const cCD = vectorAdd(C, vectorFromAngle(angleRadians - Math.PI + Math.PI * (bend + gaussianRandAdj(0, 0.0)), vectorMagnitude / 6));
  const cDC = vectorAdd(D, vectorFromAngle(angleRadians - Math.PI * (bend + gaussianRandAdj(0, 0.0)), vectorMagnitude / 6));
  const cBC = vectorAdd(B, vectorFromAngle(angleRadians - Math.PI * 0.04, 1));
  const cCB = vectorAdd(C, vectorFromAngle(angleRadians + Math.PI * 0.04, 1));
  const cDA = vectorAdd(D, vectorFromAngle(angleRadians - Math.PI * 0.82, 1));
  const cAD = vectorAdd(A, vectorFromAngle(angleRadians + Math.PI * 0.82, 1));

  // SVG path string for closed ribbon
  const d = `M${A.x.toFixed(2)} ${A.y.toFixed(2)}
    C${cAB.x.toFixed(2)} ${cAB.y.toFixed(2)},${cBA.x.toFixed(2)} ${cBA.y.toFixed(2)},${B.x.toFixed(2)} ${B.y.toFixed(2)}
    C${cBC.x.toFixed(2)} ${cBC.y.toFixed(2)},${cCB.x.toFixed(2)} ${cCB.y.toFixed(2)},${C.x.toFixed(2)} ${C.y.toFixed(2)}
    C${cCD.x.toFixed(2)} ${cCD.y.toFixed(2)},${cDC.x.toFixed(2)} ${cDC.y.toFixed(2)},${D.x.toFixed(2)} ${D.y.toFixed(2)}
    C${cDA.x.toFixed(2)} ${cDA.y.toFixed(2)},${cAD.x.toFixed(2)} ${cAD.y.toFixed(2)},${A.x.toFixed(2)} ${A.y.toFixed(2)} Z`;

  return `<path d=\"${d}\" fill=\"${fill}\" stroke=\"none\" opacity=\"${opacity}\" />`;
}
import "./fxhash.min.js";
import * as THREE from "./vendor/three/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "./vendor/cannon-es/cannon-es.js";

// Match legacy debug runtime randomness: gaussianRand() uses Math.random internally.
Math.random = $fx.rand;

const container = document.getElementById("app");
const statusNode = document.getElementById("status");
const resetButton = document.getElementById("resetButton");
const focusButton = document.getElementById("focusButton");
const saveViewButton = document.getElementById("saveViewButton");
const toggleWallsButton = document.getElementById("toggleWallsButton");
const exportSvgButton = document.getElementById("exportSvgButton");
const exportGrayscaleSvgButton = document.getElementById("exportGrayscaleSvgButton");
const exportNoShadowSvgButton = document.getElementById("exportNoShadowSvgButton");
const saveLayoutButton = document.getElementById("saveLayoutButton");
const restoreLayoutButton = document.getElementById("restoreLayoutButton");
const resetStateButton = document.getElementById("resetStateButton");
const shadowDeltaInput = document.getElementById("shadowDeltaInput");
const shadowMinCompInput = document.getElementById("shadowMinCompInput");
const shadowSimplifyFloorInput = document.getElementById("shadowSimplifyFloorInput");
const shadowSimplifyCubeInput = document.getElementById("shadowSimplifyCubeInput");
const shadowRasterToggle = document.getElementById("shadowRasterToggle");
const shadowDebugFillToggle = document.getElementById("shadowDebugFillToggle");
const filledPathWidthInput = document.getElementById("filledPathWidthInput");
const filledPathJitterInput = document.getElementById("filledPathJitterInput");
const filledPathBendInput = document.getElementById("filledPathBendInput");
const filledPathSeedInput = document.getElementById("filledPathSeedInput");
const searchParams = new URLSearchParams(window.location.search);
const runtimeConfig = (typeof window !== "undefined" && window.CAMOGLI_RUNTIME_CONFIG)
  ? window.CAMOGLI_RUNTIME_CONFIG
  : {};
const FXHASH_MODE = searchParams.get("fxhashMode") === "1" || runtimeConfig.fxhashMode === true;
const FXHASH_AUTO_FINALIZE = FXHASH_MODE
  && searchParams.get("fxAutoFinalize") !== "0"
  && runtimeConfig.fxAutoFinalize !== false;
const FXHASH_CUBE_MIN = 6;
const FXHASH_CUBE_MAX = 80;
const FXHASH_DEFAULT_CUBE_COUNT = 30;
const DEBUG_SVG_HATCHING_LAB = searchParams.get("debugSvgHatching") === "1" || searchParams.get("debug") === "svgHatching";
const DEBUG_EXPORT_HATCH = searchParams.get("debugExportHatch") === "1" || searchParams.get("debug") === "exportHatch";
const DEBUG_EXPORT_HATCH_LABELS = searchParams.get("debugExportHatchLabels") === "1" || DEBUG_EXPORT_HATCH;
const DEBUG_EXPORT_HATCH_VERBOSE = searchParams.get("debugExportHatchVerbose") === "1";
const EXPERIMENTAL_RASTER_SHADOW_EXPORT = searchParams.get("rasterShadowExport") !== "0";

if (FXHASH_MODE && typeof $fx?.params === "function") {
  $fx.params([
    {
      id: "cubeCount",
      name: "Cube Count",
      type: "number",
      default: Number.isFinite(Number(searchParams.get("cubeCount")))
        ? Number(searchParams.get("cubeCount"))
        : FXHASH_DEFAULT_CUBE_COUNT,
      options: {
        min: FXHASH_CUBE_MIN,
        max: FXHASH_CUBE_MAX,
        step: 1,
      },
    },
  ]);
}

function resolveCubeCount() {
  const fxParam = FXHASH_MODE && typeof $fx?.getParam === "function"
    ? Number($fx.getParam("cubeCount"))
    : Number.NaN;
  const urlParam = FXHASH_MODE ? Number(searchParams.get("cubeCount")) : Number.NaN;
  const raw = Number.isFinite(fxParam)
    ? fxParam
    : (Number.isFinite(urlParam) ? urlParam : FXHASH_DEFAULT_CUBE_COUNT);
  const rounded = Math.round(raw);
  return Math.min(FXHASH_CUBE_MAX, Math.max(FXHASH_CUBE_MIN, rounded));
}

function readNumberParam(key, fallback, min = -Infinity, max = Infinity) {
  const value = Number(searchParams.get(key));
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

const HATCH_SEED_MIN = 1;
const HATCH_SEED_MAX = 2147483646;
const HATCH_SEED_DEFAULT = Math.round(readNumberParam("hatchSeed", 12345, HATCH_SEED_MIN, HATCH_SEED_MAX));

function sanitizeIntegerSeed(value, fallback = HATCH_SEED_DEFAULT) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(HATCH_SEED_MAX, Math.max(HATCH_SEED_MIN, Math.round(numeric)));
}

function createMulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withSeededMathRandom(seed, callback) {
  const originalRandom = Math.random;
  Math.random = createMulberry32(sanitizeIntegerSeed(seed));
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

const shadowExportSettings = {
  useRaster: EXPERIMENTAL_RASTER_SHADOW_EXPORT,
  deltaThreshold: readNumberParam("shadowDelta", 0.028, 0.005, 0.08),
  minComponentRatio: readNumberParam("shadowMinComp", 0.00012, 0.00002, 0.002),
  simplifyFloor: readNumberParam("shadowSimplifyFloor", 2.4, 0.5, 8),
  simplifyCube: readNumberParam("shadowSimplifyCube", 2.2, 0.5, 8),
  debugFillOverlay: searchParams.get("shadowDebugFill") === "1",
  debugFloorFill: "#1db55a",
  debugCubeFill: "#d64040",
  debugFillOpacity: 0.2,
};

const hatchExportSettings = {
  seed: HATCH_SEED_DEFAULT,
};

const SCENE_LAYOUT_STORAGE_KEY = "camogli3d.settledLayout.v1";
const HATCH_BRIGHTNESS_PROFILE_STORAGE_KEY = "camogli3d.hatchingBrightnessProfiles.v1";
const RESET_STATE_STORAGE_KEYS = [
  "camogli3d.settledLayout.v1",
  "camogli3d.hatchingBrightnessProfiles.v1",
  "camogli3d.exportStudio.namedPresets.v1",
  "camogli3d.defaultView",
  "paperBackgroundDebugPreset.v1",
];
let pendingLayoutRestore = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const CANVAS_ASPECT = 16 / 9;
const CANVAS_MARGIN_PX = 24;
const EXPORT_FRAME_PX = 36;
const EXPORT_FRAME_COLOR = "#f2f2f2";
const EXPORT_BACKGROUND_COLOR = "#121212";
const EXPORT_CUBE_FILL_COLOR = "rgba(217, 217, 217, 1)";

function sanitizeHexColor(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
}

function sanitizeSvgColor(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)) {
    return normalized;
  }
  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbMatch) {
    return fallback;
  }
  const parts = rgbMatch[1].split(",").map((part) => part.trim());
  if (parts.length !== 3 && parts.length !== 4) {
    return fallback;
  }
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return fallback;
  }
  const red = Math.round(Math.min(255, Math.max(0, r)));
  const green = Math.round(Math.min(255, Math.max(0, g)));
  const blue = Math.round(Math.min(255, Math.max(0, b)));
  if (parts.length === 4) {
    const alpha = Number(parts[3]);
    if (!Number.isFinite(alpha)) {
      return fallback;
    }
    const a = Math.min(1, Math.max(0, alpha));
    return `rgba(${red}, ${green}, ${blue}, ${Number(a.toFixed(3))})`;
  }
  return `rgb(${red}, ${green}, ${blue})`;
}

const exportVisualSettings = {
  frameColor: sanitizeHexColor(searchParams.get("frameColor"), EXPORT_FRAME_COLOR),
  backgroundColor: sanitizeHexColor(searchParams.get("bgColor"), EXPORT_BACKGROUND_COLOR),
  cubeFillColor: sanitizeSvgColor(searchParams.get("cubeFillColor"), EXPORT_CUBE_FILL_COLOR),
  noiseEnabled: searchParams.get("noiseEnabled") === "1",
  noiseOpacity: readNumberParam("noiseOpacity", 0.06, 0, 0.6),
  noiseFrequency: readNumberParam("noiseFrequency", 0.9, 0.05, 3),
  noiseOctaves: Math.round(readNumberParam("noiseOctaves", 2, 1, 5)),
  noiseSeed: Math.round(readNumberParam("noiseSeed", 17, 1, 9999)),
};

function buildSvgNoiseLayer(width, height, idPrefix, visualOptions = {}) {
  const enabled = Boolean(visualOptions.noiseEnabled);
  if (!enabled) {
    return {
      defs: "",
      content: "",
    };
  }
  const opacity = Math.min(0.6, Math.max(0, Number(visualOptions.noiseOpacity ?? 0.06)));
  const frequency = Math.min(3, Math.max(0.05, Number(visualOptions.noiseFrequency ?? 0.9)));
  const octaves = Math.min(5, Math.max(1, Math.round(Number(visualOptions.noiseOctaves ?? 2))));
  const seed = Math.min(9999, Math.max(1, Math.round(Number(visualOptions.noiseSeed ?? 17))));
  const filterId = `${idPrefix}SvgNoiseFilter`;
  return {
    defs: `<filter id="${filterId}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${frequency.toFixed(3)}" numOctaves="${octaves}" seed="${seed}" result="n" /><feColorMatrix in="n" type="saturate" values="0" result="g" /></filter>`,
    content: `<rect x="0" y="0" width="${width}" height="${height}" filter="url(#${filterId})" opacity="${opacity.toFixed(3)}" pointer-events="none" />`,
  };
}

function computeCanvasFrame() {
  // Size to the #app pane (left column), not the full viewport
  const appEl = container; // container === document.getElementById("app")
  const paneWidth = Math.max(1, appEl.clientWidth || window.innerWidth - 340);
  const paneHeight = Math.max(1, appEl.clientHeight || window.innerHeight);
  let width = paneWidth;
  let height = Math.round(width / CANVAS_ASPECT);
  if (height > paneHeight) {
    height = paneHeight;
    width = Math.round(height * CANVAS_ASPECT);
  }
  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function buildSvgFrameParts(width, height, idPrefix = "exportFrame", visualOptions = {}) {
  const frameColor = sanitizeHexColor(visualOptions.frameColor, EXPORT_FRAME_COLOR);
  const backgroundColor = sanitizeHexColor(visualOptions.backgroundColor, EXPORT_BACKGROUND_COLOR);
  const frame = Math.max(0, Math.min(EXPORT_FRAME_PX, Math.floor(Math.min(width, height) * 0.12)));
  if (frame <= 0 || width <= 2 || height <= 2) {
    return {
      defs: "",
      background: `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />`,
      before: "",
      after: "",
      overlay: "",
    };
  }
  const innerWidth = Math.max(1, width - frame * 2);
  const innerHeight = Math.max(1, height - frame * 2);
  const clipId = `${idPrefix}InnerClip`;
  return {
    defs: `<clipPath id="${clipId}"><rect x="${frame}" y="${frame}" width="${innerWidth}" height="${innerHeight}" /></clipPath>`,
    background: `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />`,
    before: `<g id="framedArtwork" clip-path="url(#${clipId})">`,
    after: "</g>",
    overlay: `<g id="canvasFrame" pointer-events="none"><rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${frameColor}" stroke-width="${frame * 2}" /><rect x="${frame + 0.5}" y="${frame + 0.5}" width="${Math.max(0, innerWidth - 1)}" height="${Math.max(0, innerHeight - 1)}" fill="none" stroke="rgba(25,30,36,0.11)" stroke-width="1" /></g>`,
  };
}

const camera = new THREE.PerspectiveCamera(42, CANVAS_ASPECT, 0.1, 120);
camera.position.set(11, 9.5, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
{
  const initialFrame = computeCanvasFrame();
  renderer.setSize(initialFrame.width, initialFrame.height);
}
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

let studioActive = false;
let studioGeneration = 0;

function applyCanvasFrame() {
  if (studioActive) return;
  const frame = computeCanvasFrame();
  camera.aspect = CANVAS_ASPECT;
  camera.updateProjectionMatrix();
  renderer.setSize(frame.width, frame.height);
  renderer.render(scene, camera);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.9, 0);
controls.minDistance = 5;
controls.maxDistance = 26;
controls.maxPolarAngle = Math.PI * 0.495;
controls.update();

// Rembrandt: minimal ambient so shadows go deep
const ambient = new THREE.AmbientLight(0xffffff, 0.28);
scene.add(ambient);

// Key light: warm, steep (70°), offset 30° to the left — one face blazing
const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
keyLight.position.set(-5, 18, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 40;
scene.add(keyLight);

// Fill: very cool, very dim — just enough to reveal shadow-side form
const fillLight = new THREE.DirectionalLight(0xffffff, 0.18);
fillLight.position.set(10, 6, -8);
scene.add(fillLight);

// Rim: faint warm edge light from behind to silhouette the tower
const rimLight = new THREE.DirectionalLight(0xffffff, 0.32);
rimLight.position.set(2, 4, -14);
scene.add(rimLight);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.allowSleep = true;
world.solver.iterations = 12;
world.defaultContactMaterial.friction = 0.88;
world.defaultContactMaterial.restitution = 0.01;

const materials = {
  ground: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.98, metalness: 0.0 }),
  cube: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  cubeDark: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  cubeLight: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.98, metalness: 0.01 }),
};

const sceneObjects = [];
const cubeObjects = [];
const wallMeshes = [];
const wallOutlineMeshes = [];
let animationFrameId = 0;
let settledSeconds = 0;
let freezeFrame = false;
let physicsStartedAt = performance.now();
let simulationStartedAt = performance.now();
let freezeTimeoutId = 0;
const spawnTimeoutIds = [];
let spawnedCount = 0;
let spawnComplete = false;
let wallsDebugVisible = false;
const CUBE_COUNT = resolveCubeCount();
if (FXHASH_MODE && typeof $fx?.features === "function") {
  $fx.features({
    "Cube Count": CUBE_COUNT,
  });
}
const CONTAINER_SIZE = 4.8;
const WALL_HEIGHT = 11;
const WALL_THICKNESS = 0.8;
const SPAWN_INSET = 2.05;
const SPAWN_BASE_Y = 3.2;
const SPAWN_Y_STEP = 0.2;
const DROP_DELAY_MS = 110;
const VIEW_STORAGE_KEY = "camogli3d.defaultView";
const FALLBACK_VIEW = {
  camera: { x: 11, y: 9.5, z: 13 },
  target: { x: 0, y: 1.5, z: 0.2 },
};
const SHADOW_PLANE_Y = 0;
const CUBE_LOCAL_VERTICES = [
  new THREE.Vector3(-0.5, -0.5, -0.5),
  new THREE.Vector3(0.5, -0.5, -0.5),
  new THREE.Vector3(0.5, 0.5, -0.5),
  new THREE.Vector3(-0.5, 0.5, -0.5),
  new THREE.Vector3(-0.5, -0.5, 0.5),
  new THREE.Vector3(0.5, -0.5, 0.5),
  new THREE.Vector3(0.5, 0.5, 0.5),
  new THREE.Vector3(-0.5, 0.5, 0.5),
];
const CUBE_FACE_DEFS = [
  { name: "front", indices: [4, 5, 6, 7], normal: new THREE.Vector3(0, 0, 1) },
  { name: "back", indices: [1, 0, 3, 2], normal: new THREE.Vector3(0, 0, -1) },
  { name: "right", indices: [5, 1, 2, 6], normal: new THREE.Vector3(1, 0, 0) },
  { name: "left", indices: [0, 4, 7, 3], normal: new THREE.Vector3(-1, 0, 0) },
  { name: "top", indices: [7, 6, 2, 3], normal: new THREE.Vector3(0, 1, 0) },
  { name: "bottom", indices: [0, 1, 5, 4], normal: new THREE.Vector3(0, -1, 0) },
];
const CUBE_EDGE_PAIRS = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});

function disposeObject(object) {
  scene.remove(object.mesh);
  world.removeBody(object.body);
  if (object.mesh.geometry) {
    object.mesh.geometry.dispose();
  }
}

function makeGround() {
  const groundShape = new CANNON.Box(new CANNON.Vec3(14, 0.5, 14));
  const groundBody = new CANNON.Body({ mass: 0, material: new CANNON.Material("ground") });
  groundBody.addShape(groundShape);
  groundBody.position.set(0, -0.5, 0);
  world.addBody(groundBody);

  const groundMesh = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 28), materials.ground);
  groundMesh.receiveShadow = true;
  groundMesh.position.copy(groundBody.position);
  scene.add(groundMesh);
  sceneObjects.push({ body: groundBody, mesh: groundMesh });

  const grid = new THREE.GridHelper(28, 28, 0xffffff, 0xffffff);
  grid.position.y = 0.01;
  grid.material.opacity = 0.05;
  grid.material.transparent = true;
  scene.add(grid);
  sceneObjects.push({ body: null, mesh: grid });

  return { groundBody, groundMesh };
}

function addStaticBox(size, position, material) {
  const body = new CANNON.Body({ mass: 0, material: new CANNON.Material("wall") });
  body.addShape(new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)));
  body.position.set(position.x, position.y, position.z);
  world.addBody(body);

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.position.copy(body.position);
  mesh.visible = false;
  scene.add(mesh);
  sceneObjects.push({ body, mesh });
  wallMeshes.push(mesh);

  const edgeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xf6d7a3, transparent: true, opacity: 0.65 });
  const outline = new THREE.LineSegments(edgeGeom, edgeMat);
  outline.position.copy(body.position);
  outline.visible = false;
  scene.add(outline);
  sceneObjects.push({ body: null, mesh: outline });
  wallOutlineMeshes.push(outline);
}

function setWallsVisible(visible) {
  for (const mesh of wallMeshes) {
    mesh.visible = visible;
  }
}

function setWallDebugVisible(visible) {
  wallsDebugVisible = visible;
  setWallsVisible(false);
  for (const outline of wallOutlineMeshes) {
    outline.visible = visible;
  }
  if (toggleWallsButton) {
    toggleWallsButton.textContent = visible ? "Hide outlines" : "Show outlines";
  }
  renderer.render(scene, camera);
}

function makeContainerWalls() {
  const half = CONTAINER_SIZE / 2;
  const y = WALL_HEIGHT / 2;

  addStaticBox(
    { x: CONTAINER_SIZE + WALL_THICKNESS * 2, y: WALL_HEIGHT, z: WALL_THICKNESS },
    { x: 0, y, z: half + WALL_THICKNESS / 2 },
    materials.wall
  );
  addStaticBox(
    { x: CONTAINER_SIZE + WALL_THICKNESS * 2, y: WALL_HEIGHT, z: WALL_THICKNESS },
    { x: 0, y, z: -half - WALL_THICKNESS / 2 },
    materials.wall
  );
  addStaticBox(
    { x: WALL_THICKNESS, y: WALL_HEIGHT, z: CONTAINER_SIZE },
    { x: half + WALL_THICKNESS / 2, y, z: 0 },
    materials.wall
  );
  addStaticBox(
    { x: WALL_THICKNESS, y: WALL_HEIGHT, z: CONTAINER_SIZE },
    { x: -half - WALL_THICKNESS / 2, y, z: 0 },
    materials.wall
  );
}

function makeCube(index) {
  const edge = 0.84 + ((index % 3) * 0.1);
  const spawnHalf = Math.max(0.34, (CONTAINER_SIZE / 2) - SPAWN_INSET);
  const ringAngle = index * 2.399963229728653;
  const ringRadius = ((index % 5) / 4) * spawnHalf;
  const body = new CANNON.Body({ mass: 1.4, material: new CANNON.Material("cube") });
  body.addShape(new CANNON.Box(new CANNON.Vec3(edge / 2, edge / 2, edge / 2)));
  body.position.set(
    Math.cos(ringAngle) * ringRadius,
    SPAWN_BASE_Y + index * SPAWN_Y_STEP,
    Math.sin(ringAngle) * ringRadius
  );
  body.quaternion.setFromEuler(
    (Math.random() - 0.5) * Math.PI * 0.05,
    Math.random() * Math.PI * 2,
    (Math.random() - 0.5) * Math.PI * 0.05
  );
  body.linearDamping = 0.34;
  body.angularDamping = 0.48;
  body.allowSleep = true;
  body.sleepSpeedLimit = 0.18;
  body.sleepTimeLimit = 0.55;
  body.sleep();
  body.wakeUp();
  world.addBody(body);

  const palette = [materials.cube, materials.cubeDark, materials.cubeLight];
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(edge, edge, edge),
    palette[index % palette.length]
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  cubeObjects.push({ body, mesh, edge });
  sceneObjects.push({ body, mesh });
}

function buildScene() {
  window.clearTimeout(freezeTimeoutId);
  while (spawnTimeoutIds.length > 0) {
    window.clearTimeout(spawnTimeoutIds.pop());
  }
  for (let i = 0; i < sceneObjects.length; i += 1) {
    const object = sceneObjects[i];
    scene.remove(object.mesh);
    if (object.body) {
      world.removeBody(object.body);
    }
    if (object.mesh.geometry) {
      object.mesh.geometry.dispose();
    }
  }
  sceneObjects.length = 0;
  cubeObjects.length = 0;
  wallMeshes.length = 0;
  wallOutlineMeshes.length = 0;
  spawnedCount = 0;
  spawnComplete = false;
  pendingLayoutRestore = false;
  fxFinalArtRendered = false;

  makeGround();
  makeContainerWalls();
  setWallDebugVisible(false);

  for (let i = 0; i < CUBE_COUNT; i += 1) {
    const timeoutId = window.setTimeout(() => {
      makeCube(i);
      spawnedCount += 1;
      if (spawnedCount >= CUBE_COUNT) {
        spawnComplete = true;
      }
    }, i * DROP_DELAY_MS);
    spawnTimeoutIds.push(timeoutId);
  }

  settledSeconds = 0;
  freezeFrame = false;
  physicsStartedAt = performance.now();
  simulationStartedAt = performance.now();
  freezeTimeoutId = window.setTimeout(() => {
    if (!freezeFrame) {
      freezeFrame = true;
      setWallsVisible(false);
      updateStatus("Frozen frame", "Time limit reached; composition locked.");
      renderer.render(scene, camera);
      finalizeFxhashArtwork("time limit");
    }
  }, 18000);
  updateStatus("Running physics", `${CUBE_COUNT} cubes still moving.`);
}

function updateStatus(state, detail) {
  if (!statusNode) return;
  statusNode.innerHTML = `<strong>${state}</strong>${detail ? ` - ${detail}` : ""}`;
}

function syncShadowSettingsFromUi() {
  if (shadowRasterToggle) {
    shadowExportSettings.useRaster = Boolean(shadowRasterToggle.checked);
  }
  if (shadowDeltaInput) {
    const value = Number(shadowDeltaInput.value);
    if (Number.isFinite(value)) {
      shadowExportSettings.deltaThreshold = Math.min(0.08, Math.max(0.005, value));
    }
  }
  if (shadowMinCompInput) {
    const value = Number(shadowMinCompInput.value);
    if (Number.isFinite(value)) {
      shadowExportSettings.minComponentRatio = Math.min(0.002, Math.max(0.00002, value));
    }
  }
  if (shadowSimplifyFloorInput) {
    const value = Number(shadowSimplifyFloorInput.value);
    if (Number.isFinite(value)) {
      shadowExportSettings.simplifyFloor = Math.min(8, Math.max(0.5, value));
    }
  }
  if (shadowSimplifyCubeInput) {
    const value = Number(shadowSimplifyCubeInput.value);
    if (Number.isFinite(value)) {
      shadowExportSettings.simplifyCube = Math.min(8, Math.max(0.5, value));
    }
  }
  if (shadowDebugFillToggle) {
    shadowExportSettings.debugFillOverlay = Boolean(shadowDebugFillToggle.checked);
  }
  if (filledPathWidthInput) {
    const value = Number(filledPathWidthInput.value);
    if (Number.isFinite(value)) {
      SVG_EXPORT_STUDIO_GLOBALS.hatchWidth = Math.min(3, Math.max(0.2, value));
    }
  }
  if (filledPathJitterInput) {
    const value = Number(filledPathJitterInput.value);
    if (Number.isFinite(value)) {
      SVG_EXPORT_STUDIO_GLOBALS.hatchJitter = Math.min(2, Math.max(0, value));
    }
  }
  if (filledPathBendInput) {
    const value = Number(filledPathBendInput.value);
    if (Number.isFinite(value)) {
      SVG_EXPORT_STUDIO_GLOBALS.hatchBend = Math.min(0.4, Math.max(-0.4, value));
    }
  }
  if (filledPathSeedInput) {
    hatchExportSettings.seed = sanitizeIntegerSeed(filledPathSeedInput.value, hatchExportSettings.seed);
    SVG_EXPORT_STUDIO_GLOBALS.hatchSeed = hatchExportSettings.seed;
    filledPathSeedInput.value = String(hatchExportSettings.seed);
  }
}

function bindShadowSettingInputs() {
  if (shadowRasterToggle) {
    shadowRasterToggle.checked = shadowExportSettings.useRaster;
    shadowRasterToggle.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (shadowDeltaInput) {
    shadowDeltaInput.value = shadowExportSettings.deltaThreshold.toFixed(3);
    shadowDeltaInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (shadowMinCompInput) {
    shadowMinCompInput.value = shadowExportSettings.minComponentRatio.toFixed(5);
    shadowMinCompInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (shadowSimplifyFloorInput) {
    shadowSimplifyFloorInput.value = shadowExportSettings.simplifyFloor.toFixed(1);
    shadowSimplifyFloorInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (shadowSimplifyCubeInput) {
    shadowSimplifyCubeInput.value = shadowExportSettings.simplifyCube.toFixed(1);
    shadowSimplifyCubeInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (shadowDebugFillToggle) {
    shadowDebugFillToggle.checked = shadowExportSettings.debugFillOverlay;
    shadowDebugFillToggle.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (filledPathWidthInput) {
    filledPathWidthInput.value = SVG_EXPORT_STUDIO_GLOBALS.hatchWidth.toFixed(2);
    filledPathWidthInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (filledPathJitterInput) {
    filledPathJitterInput.value = SVG_EXPORT_STUDIO_GLOBALS.hatchJitter.toFixed(2);
    filledPathJitterInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (filledPathBendInput) {
    filledPathBendInput.value = SVG_EXPORT_STUDIO_GLOBALS.hatchBend.toFixed(2);
    filledPathBendInput.addEventListener("change", syncShadowSettingsFromUi);
  }
  if (filledPathSeedInput) {
    filledPathSeedInput.value = String(hatchExportSettings.seed);
    filledPathSeedInput.addEventListener("change", syncShadowSettingsFromUi);
  }
}

function syncBodies() {
  for (const object of cubeObjects) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }
}

function allCubesSleeping() {
  if (!spawnComplete || cubeObjects.length < CUBE_COUNT) {
    return false;
  }
  return cubeObjects.every((object) => {
    const body = object.body;
    const linearSpeed = body.velocity.lengthSquared();
    const angularSpeed = body.angularVelocity.lengthSquared();
    const lowMotion = linearSpeed < 0.025 && angularSpeed < 0.02;
    return body.sleepState === CANNON.Body.SLEEPING || lowMotion;
  });
}

function snapshotCurrentCubeLayout() {
  return cubeObjects.map((object, index) => ({
    index,
    edge: object.edge,
    position: {
      x: object.body.position.x,
      y: object.body.position.y,
      z: object.body.position.z,
    },
    quaternion: {
      x: object.body.quaternion.x,
      y: object.body.quaternion.y,
      z: object.body.quaternion.z,
      w: object.body.quaternion.w,
    },
  }));
}

function saveSettledLayout() {
  if (cubeObjects.length < CUBE_COUNT) {
    updateStatus("Save blocked", `Wait for full spawn (${cubeObjects.length}/${CUBE_COUNT}).`);
    return;
  }
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      view: getCurrentView(),
      cubes: snapshotCurrentCubeLayout(),
    };
    window.localStorage.setItem(SCENE_LAYOUT_STORAGE_KEY, JSON.stringify(payload));
    updateStatus("Layout saved", `${payload.cubes.length} cubes stored for restore.`);
  } catch (_error) {
    updateStatus("Save failed", "Could not write layout to local storage.");
  }
}

function applySettledLayout(layoutPayload) {
  if (!layoutPayload?.cubes || cubeObjects.length < CUBE_COUNT) {
    return false;
  }
  const cubes = layoutPayload.cubes;
  if (!Array.isArray(cubes) || cubes.length !== cubeObjects.length) {
    return false;
  }
  for (let i = 0; i < cubeObjects.length; i += 1) {
    const object = cubeObjects[i];
    const saved = cubes[i];
    if (!saved?.position || !saved?.quaternion) {
      return false;
    }
    object.body.position.set(saved.position.x, saved.position.y, saved.position.z);
    object.body.quaternion.set(saved.quaternion.x, saved.quaternion.y, saved.quaternion.z, saved.quaternion.w);
    object.body.velocity.set(0, 0, 0);
    object.body.angularVelocity.set(0, 0, 0);
    object.body.sleep();
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }
  if (layoutPayload.view) {
    applyView(layoutPayload.view);
  }
  settledSeconds = 2;
  freezeFrame = true;
  setWallDebugVisible(false);
  renderer.render(scene, camera);
  return true;
}

function restoreSettledLayout() {
  let payload = null;
  try {
    const raw = window.localStorage.getItem(SCENE_LAYOUT_STORAGE_KEY);
    payload = raw ? JSON.parse(raw) : null;
  } catch (_error) {
    payload = null;
  }
  if (!payload) {
    updateStatus("No saved layout", "Save a settled layout first.");
    return;
  }
  if (cubeObjects.length < CUBE_COUNT || !spawnComplete) {
    pendingLayoutRestore = true;
    updateStatus("Restore queued", "Will apply layout once all cubes are spawned.");
    return;
  }
  const ok = applySettledLayout(payload);
  if (ok) {
    pendingLayoutRestore = false;
    updateStatus("Layout restored", "Scene frozen; tweak params and export variants.");
  } else {
    updateStatus("Restore failed", "Saved layout is incompatible with current scene.");
  }
}

function stepPhysics(deltaSeconds) {
  world.step(1 / 60, deltaSeconds, 3);
  syncBodies();
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function projectWorldToSvg(point, width, height) {
  const ndc = point.clone().project(camera);
  return {
    x: (ndc.x * 0.5 + 0.5) * width,
    y: (-ndc.y * 0.5 + 0.5) * height,
    z: ndc.z,
  };
}

function pointsToSvgString(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function isFiniteScreenPoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function sanitizeScreenPolygon(screenPoints) {
  if (!Array.isArray(screenPoints)) {
    return null;
  }

  const sanitized = [];
  for (const point of screenPoints) {
    if (!isFiniteScreenPoint(point)) {
      continue;
    }

    const previous = sanitized[sanitized.length - 1];
    if (previous && Math.abs(previous.x - point.x) < 0.001 && Math.abs(previous.y - point.y) < 0.001) {
      continue;
    }

    sanitized.push({ x: point.x, y: point.y });
  }

  while (sanitized.length >= 2) {
    const first = sanitized[0];
    const last = sanitized[sanitized.length - 1];
    if (Math.abs(first.x - last.x) >= 0.001 || Math.abs(first.y - last.y) >= 0.001) {
      break;
    }
    sanitized.pop();
  }

  if (sanitized.length < 3 || polygonArea(sanitized) < 0.5) {
    return null;
  }

  return sanitized;
}

function escapeXml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function averagePoint(points) {
  const result = new THREE.Vector3();
  for (const point of points) {
    result.add(point);
  }
  return result.multiplyScalar(1 / points.length);
}

function hasClearSightToPoint(targetPoint, mesh, meshes) {
  const cameraPos = camera.position.clone();
  const direction = targetPoint.clone().sub(cameraPos);
  const distance = direction.length();
  if (distance < 0.0001) {
    return false;
  }
  const raycaster = new THREE.Raycaster(cameraPos, direction.normalize(), 0.001, Math.max(0.001, distance - 0.003));
  const hits = raycaster.intersectObjects(meshes, false);
  return hits.length === 0 || hits[0].object === mesh;
}

function buildFaceSamplePoints(worldFace, faceCenter) {
  const samples = [faceCenter.clone()];

  // Pull corner and edge samples slightly toward the center so rays do not fail on exact edges.
  for (let i = 0; i < worldFace.length; i += 1) {
    const a = worldFace[i];
    const b = worldFace[(i + 1) % worldFace.length];
    const cornerSample = a.clone().lerp(faceCenter, 0.16);
    const edgeMid = a.clone().add(b).multiplyScalar(0.5).lerp(faceCenter, 0.12);
    samples.push(cornerSample, edgeMid);
  }

  return samples;
}

function isFaceVisibleFromCamera(worldFace, faceCenter, mesh, meshes) {
  const samples = buildFaceSamplePoints(worldFace, faceCenter);
  for (const sample of samples) {
    if (hasClearSightToPoint(sample, mesh, meshes)) {
      return true;
    }
  }
  return false;
}

function sampleLightVisibility(point, lightPosition, mesh, meshes, normal) {
  const bias = normal.clone().multiplyScalar(0.012);
  const origin = point.clone().add(bias);
  const toLight = lightPosition.clone().sub(origin);
  const maxDistance = toLight.length();
  if (maxDistance < 0.0001) {
    return 1;
  }

  const raycaster = new THREE.Raycaster(origin, toLight.normalize(), 0.001, Math.max(0.001, maxDistance - 0.004));
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length === 0) return 1;

  for (const hit of hits) {
    // Ignore near-self intersections caused by sampling from the receiver face itself.
    if (hit.object === mesh && hit.distance < 0.04) {
      continue;
    }
    if (hit.object === mesh) {
      return 1;
    }
    return 0;
  }

  return 1;
}

function faceLightVisibility(worldFace, faceCenter, worldNormal, mesh, meshes, lightPosition) {
  const samples = buildFaceSamplePoints(worldFace, faceCenter);
  let visibleCount = 0;
  for (const sample of samples) {
    visibleCount += sampleLightVisibility(sample, lightPosition, mesh, meshes, worldNormal);
  }
  return visibleCount / samples.length;
}

function computeFaceBrightness(worldNormal, faceCenter, lightVisibilities) {
  const n = worldNormal.clone().normalize();
  const keyDir = keyLight.position.clone().sub(faceCenter).normalize();
  const fillDir = fillLight.position.clone().sub(faceCenter).normalize();
  const rimDir = rimLight.position.clone().sub(faceCenter).normalize();
  const keyVisibility = lightVisibilities?.key ?? 1;
  const fillVisibility = lightVisibilities?.fill ?? 1;
  const rimVisibility = lightVisibilities?.rim ?? 1;

  const ambientTerm = 0.15 * ambient.intensity;
  const keyTerm = Math.max(0, n.dot(keyDir)) * keyLight.intensity * 0.62 * keyVisibility;
  const fillTerm = Math.max(0, n.dot(fillDir)) * fillLight.intensity * 0.72 * fillVisibility;
  const rimTerm = Math.max(0, n.dot(rimDir)) * rimLight.intensity * 0.56 * rimVisibility;

  return clamp01((ambientTerm + keyTerm + fillTerm + rimTerm) / 2.75);
}

function brightnessToHatchId(brightness) {
  if (brightness >= 0.8) return "hatchBright";
  if (brightness >= 0.63) return "hatchLight";
  if (brightness >= 0.45) return "hatchMid";
  if (brightness >= 0.28) return "hatchDark";
  return "hatchDeep";
}

function grayHexFromTone(tone) {
  const value = Math.round(clamp01(tone) * 255);
  const hex = value.toString(16).padStart(2, "0");
  return `#${hex}${hex}${hex}`;
}

function faceToneFromLight(face) {
  // Keep global tone mostly driven by shading; localized cast shadows are added as overlays.
  return clamp01(0.3 + face.brightness * 0.68 - face.shadowStrength * 0.1);
}

function polygonBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function studioDefaultHatchMode(brightness) {
  if (brightness <= 0.1) return "none";
  return brightness > 0.5 ? "cross" : "single";
}

function studioDefaultSpacingForBrightness(brightness) {
  if (brightness <= 0.1) return 2.0;
  if (brightness <= 0.2) return 2.0;
  if (brightness <= 0.3) return 1.8;
  if (brightness <= 0.4) return 1.6;
  if (brightness <= 0.5) return 1.4;
  if (brightness <= 0.6) return 1.2;
  if (brightness <= 0.7) return 1.0;
  if (brightness <= 0.8) return 0.8;
  if (brightness <= 0.91) return 0.9;
  return 0.5;
}

function profileBinIndexFromBrightness(brightness) {
  const normalized = clamp01(Number(brightness) || 0);
  return Math.max(0, Math.min(9, Math.floor(Math.min(0.999999, normalized) * 10)));
}

function readExportBrightnessProfileFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(HATCH_BRIGHTNESS_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const payload = JSON.parse(raw);
    if (!payload || !Array.isArray(payload.bins)) {
      return null;
    }
    return payload;
  } catch (_error) {
    return null;
  }
}

function getBrightnessProfileBucket(profile, brightness) {
  if (!profile || !Array.isArray(profile.bins)) {
    return null;
  }
  const bin = profileBinIndexFromBrightness(brightness);
  for (const row of profile.bins) {
    if (Number(row?.bin) === bin) {
      return row;
    }
  }
  return null;
}

function faceStudioBrightness(face) {
  // Use perceived face tone + cast shadow to avoid under-hatching bright-but-occluded faces.
  const toneDarkness = 1 - clamp01(faceToneFromLight(face));
  const shadowBoost = clamp01(face.shadowStrength || 0) * 0.32;
  return clamp01(toneDarkness + shadowBoost);
}

function buildFaceBrightnessNormalization(faces) {
  const values = (faces || [])
    .map((face) => faceStudioBrightness(face))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return {
      min: 0,
      max: 1,
      range: 1,
      enabled: false,
    };
  }
  let min = values[0];
  let max = values[0];
  for (let index = 1; index < values.length; index += 1) {
    const value = values[index];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = max - min;
  return {
    min,
    max,
    range,
    enabled: range > 1e-5,
  };
}

function normalizeFaceBrightness(value, normalization) {
  const clamped = clamp01(value);
  if (!normalization?.enabled) {
    return clamped;
  }
  return clamp01((clamped - normalization.min) / normalization.range);
}

const SVG_EXPORT_STUDIO_DEFAULT_GLOBALS = {
  hatchWidth: 1.0,
  hatchJitter: 1.5,
  hatchBend: -0.05,
  hatchSeed: HATCH_SEED_DEFAULT,
  hatchEdgeInset: null,
  hatchTrimRatio: 0.42,
  hatchMinVisible: 4,
  circleRadius: 0.5,
  circleJitter: 1.0,
};

const SVG_EXPORT_STUDIO_CASE_GLOBALS = {
  hatchWidth: 1.0,
  hatchJitter: 1.5,
  hatchBend: -0.05,
  circleRadius: 0.5,
  circleJitter: 1.0,
};

function sanitizeStudioParamValue(value, fallback, min = null, max = null) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  if (min !== null && value < min) {
    return min;
  }
  if (max !== null && value > max) {
    return max;
  }
  return value;
}

function parseStudioGlobalsFromUrl(search) {
  const globals = { ...SVG_EXPORT_STUDIO_DEFAULT_GLOBALS };

  const direct = {
    hatchWidth: Number(search.get("hatchWidth")),
    hatchJitter: Number(search.get("hatchJitter")),
    hatchBend: Number(search.get("hatchBend")),
    hatchSeed: Number(search.get("hatchSeed")),
    hatchTrimRatio: Number(search.get("hatchTrimRatio")),
    hatchMinVisible: Number(search.get("hatchMinVisible")),
    circleRadius: Number(search.get("circleRadius")),
    circleJitter: Number(search.get("circleJitter")),
    hatchEdgeInset: search.get("hatchEdgeInset") === null ? null : Number(search.get("hatchEdgeInset")),
  };

  globals.hatchWidth = sanitizeStudioParamValue(direct.hatchWidth, globals.hatchWidth, 0.2, 3);
  globals.hatchJitter = sanitizeStudioParamValue(direct.hatchJitter, globals.hatchJitter, 0, 2);
  globals.hatchBend = sanitizeStudioParamValue(direct.hatchBend, globals.hatchBend, -0.4, 0.4);
  globals.hatchSeed = sanitizeIntegerSeed(direct.hatchSeed, globals.hatchSeed);
  globals.hatchTrimRatio = sanitizeStudioParamValue(direct.hatchTrimRatio, globals.hatchTrimRatio, 0, 0.9);
  globals.hatchMinVisible = sanitizeStudioParamValue(direct.hatchMinVisible, globals.hatchMinVisible, 0, 50);
  globals.circleRadius = sanitizeStudioParamValue(direct.circleRadius, globals.circleRadius, 0.1, 3);
  globals.circleJitter = sanitizeStudioParamValue(direct.circleJitter, globals.circleJitter, 0, 1);
  globals.hatchEdgeInset = direct.hatchEdgeInset === null
    ? globals.hatchEdgeInset
    : sanitizeStudioParamValue(direct.hatchEdgeInset, globals.hatchEdgeInset ?? 2, 0, 50);

  const studioPayload = search.get("studio");
  if (studioPayload) {
    try {
      const normalized = studioPayload.replaceAll("-", "+").replaceAll("_", "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const decoded = atob(padded);
      const payload = JSON.parse(decoded);
      const version = Number(payload?.v);
      const group = Array.isArray(payload?.g) ? payload.g : null;

      if (group && version >= 4) {
        globals.hatchWidth = sanitizeStudioParamValue(Number(group[0]), globals.hatchWidth, 0.2, 3);
        globals.hatchJitter = sanitizeStudioParamValue(Number(group[1]), globals.hatchJitter, 0, 2);
        globals.hatchBend = sanitizeStudioParamValue(Number(group[2]), globals.hatchBend, -0.4, 0.4);
        globals.hatchEdgeInset = group[3] === null
          ? null
          : sanitizeStudioParamValue(Number(group[3]), globals.hatchEdgeInset ?? 2, 0, 50);
        globals.hatchTrimRatio = sanitizeStudioParamValue(Number(group[4]), globals.hatchTrimRatio, 0, 0.9);
        globals.hatchMinVisible = sanitizeStudioParamValue(Number(group[5]), globals.hatchMinVisible, 0, 50);
        globals.circleRadius = sanitizeStudioParamValue(Number(group[7]), globals.circleRadius, 0.1, 3);
        globals.circleJitter = sanitizeStudioParamValue(Number(group[8]), globals.circleJitter, 0, 1);
      } else if (group && version === 3) {
        globals.hatchWidth = sanitizeStudioParamValue(Number(group[0]), globals.hatchWidth, 0.2, 3);
        globals.hatchJitter = sanitizeStudioParamValue(Number(group[1]), globals.hatchJitter, 0, 2);
        globals.hatchBend = sanitizeStudioParamValue(Number(group[2]), globals.hatchBend, -0.4, 0.4);
        globals.hatchEdgeInset = group[3] === null
          ? null
          : sanitizeStudioParamValue(Number(group[3]), globals.hatchEdgeInset ?? 2, 0, 50);
        globals.hatchTrimRatio = sanitizeStudioParamValue(Number(group[4]), globals.hatchTrimRatio, 0, 0.9);
        globals.hatchMinVisible = sanitizeStudioParamValue(Number(group[5]), globals.hatchMinVisible, 0, 50);
        globals.circleRadius = sanitizeStudioParamValue(Number(group[6]), globals.circleRadius, 0.1, 3);
        globals.circleJitter = sanitizeStudioParamValue(Number(group[7]), globals.circleJitter, 0, 1);
      } else if (group && version === 2) {
        globals.hatchJitter = sanitizeStudioParamValue(Number(group[0]), globals.hatchJitter, 0, 2);
        globals.hatchBend = sanitizeStudioParamValue(Number(group[1]), globals.hatchBend, -0.4, 0.4);
        globals.hatchEdgeInset = group[2] === null
          ? null
          : sanitizeStudioParamValue(Number(group[2]), globals.hatchEdgeInset ?? 2, 0, 50);
        globals.hatchTrimRatio = sanitizeStudioParamValue(Number(group[3]), globals.hatchTrimRatio, 0, 0.9);
        globals.hatchMinVisible = sanitizeStudioParamValue(Number(group[4]), globals.hatchMinVisible, 0, 50);
        globals.circleRadius = sanitizeStudioParamValue(Number(group[6]), globals.circleRadius, 0.1, 3);
        globals.circleJitter = sanitizeStudioParamValue(Number(group[7]), globals.circleJitter, 0, 1);
      }
    } catch (error) {
      // Ignore malformed studio payload and keep current globals.
    }
  }

  return globals;
}

const SVG_EXPORT_STUDIO_GLOBALS = {
  ...parseStudioGlobalsFromUrl(searchParams),
  ...SVG_EXPORT_STUDIO_CASE_GLOBALS,
};

function hatchPolygonCentroid(points) {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

function hatchPolygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) * 0.5;
}

function hatchPrincipalDirections(points) {
  const center = hatchPolygonCentroid(points);
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const point of points) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return {
    principal: { x: Math.cos(angle), y: Math.sin(angle) },
    perpendicular: { x: -Math.sin(angle), y: Math.cos(angle) },
  };
}

function hatchDot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function hatchSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function hatchAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function hatchScale(a, factor) {
  return { x: a.x * factor, y: a.y * factor };
}

function hatchLength(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

function hatchNormalize(a) {
  const len = Math.max(1e-8, hatchLength(a));
  return { x: a.x / len, y: a.y / len };
}

function hatchUniquePoints(points, tolerance) {
  const unique = [];
  for (const point of points) {
    const exists = unique.some((candidate) => Math.abs(candidate.x - point.x) < tolerance && Math.abs(candidate.y - point.y) < tolerance);
    if (!exists) {
      unique.push(point);
    }
  }
  return unique;
}

function hatchIntersectSweepLineWithPolygon(points, sweepDir, lineOffset, hatchDir) {
  const intersections = [];
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const edge = hatchSub(b, a);
    const denom = hatchDot(edge, sweepDir);
    if (Math.abs(denom) < 1e-8) {
      continue;
    }
    const t = (lineOffset - hatchDot(a, sweepDir)) / denom;
    if (t < -1e-6 || t > 1 + 1e-6) {
      continue;
    }
    intersections.push({
      x: a.x + edge.x * t,
      y: a.y + edge.y * t,
    });
  }

  const unique = hatchUniquePoints(intersections, 0.6);
  if (unique.length < 2) {
    return null;
  }

  unique.sort((p, q) => hatchDot(p, hatchDir) - hatchDot(q, hatchDir));
  return { start: unique[0], end: unique[unique.length - 1] };
}

function buildPolygonHatchSegments(points, hatchDir, sweepDir, spacing, edgeInset, trimRatio, minVisibleLength) {
  const minOffset = Math.min(...points.map((point) => hatchDot(point, sweepDir)));
  const maxOffset = Math.max(...points.map((point) => hatchDot(point, sweepDir)));
  const segments = [];

  for (let offset = minOffset; offset <= maxOffset; offset += spacing) {
    const segment = hatchIntersectSweepLineWithPolygon(points, sweepDir, offset, hatchDir);
    if (!segment) {
      continue;
    }
    const direction = hatchNormalize(hatchSub(segment.end, segment.start));
    const segmentLength = hatchLength(hatchSub(segment.end, segment.start));
    const trim = Math.min(edgeInset, Math.max(0, segmentLength * trimRatio));
    if (segmentLength <= trim * 2 + minVisibleLength) {
      continue;
    }
    segments.push({
      start: hatchAdd(segment.start, hatchScale(direction, trim)),
      end: hatchAdd(segment.end, hatchScale(direction, -trim)),
    });
  }

  if (segments.length === 0) {
    const centerOffset = hatchDot(hatchPolygonCentroid(points), sweepDir);
    const centerSegment = hatchIntersectSweepLineWithPolygon(points, sweepDir, centerOffset, hatchDir);
    if (centerSegment) {
      const direction = hatchNormalize(hatchSub(centerSegment.end, centerSegment.start));
      const segmentLength = hatchLength(hatchSub(centerSegment.end, centerSegment.start));
      const trim = Math.min(edgeInset, Math.max(0, segmentLength * Math.max(0.12, trimRatio - 0.06)));
      if (segmentLength > trim * 2 + Math.max(1, minVisibleLength * 0.5)) {
        segments.push({
          start: hatchAdd(centerSegment.start, hatchScale(direction, trim)),
          end: hatchAdd(centerSegment.end, hatchScale(direction, -trim)),
        });
      }
    }
  }

  return segments;
}

function hatchPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-8) + xi);
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function hatchPolygonBounds(points) {
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

function buildStudioFaceHatchStyle(face, polygon, globals = null, brightnessNormalization = null, sideOverride = null, brightnessProfile = null) {
  const g = globals ?? SVG_EXPORT_STUDIO_GLOBALS;
  const rawBrightness = faceStudioBrightness(face);
  const brightness = normalizeFaceBrightness(rawBrightness, brightnessNormalization);
  const bucketOverride = getBrightnessProfileBucket(brightnessProfile, brightness);
  const tone = faceToneFromLight(face);
  const bounds = hatchPolygonBounds(polygon);
  const shortSide = Math.max(1, Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY));
  const area = hatchPolygonArea(polygon);
  const spacingFactor = 1.35 - brightness * 0.95;
  const defaultSpacing = studioDefaultSpacingForBrightness(brightness);
  const overrideSpacing = Number(sideOverride?.hatchSpacing);
  const bucketSpacing = Number(bucketOverride?.hatchSpacing);
  const sideSpacing = Math.max(0.2, Math.min(2.0, Number.isFinite(overrideSpacing)
    ? overrideSpacing
    : (Number.isFinite(bucketSpacing) ? bucketSpacing : defaultSpacing)));
  const minSpacing = Math.max(0.9, Math.min(4, shortSide * 0.22));
  const spacing = Math.max(minSpacing, Math.sqrt(area) * 0.1 * sideSpacing * spacingFactor);
  const baseEdgeInset = g.hatchEdgeInset !== null
    ? Math.max(0, g.hatchEdgeInset)
    : Math.max(2.0, g.hatchWidth * 1.3 + g.hatchJitter * 0.9);
  const edgeInset = Math.min(baseEdgeInset, Math.max(0.45, shortSide * 0.16));
  const adaptiveTrimRatio = Math.min(
    g.hatchTrimRatio,
    shortSide < 20 ? 0.22 : 0.32,
  );
  const adaptiveMinVisible = Math.min(
    g.hatchMinVisible,
    Math.max(0.6, shortSide * 0.18),
  );
  const defaultMode = studioDefaultHatchMode(brightness);
  const bucketMode = (bucketOverride?.hatchMode === "none" || bucketOverride?.hatchMode === "single" || bucketOverride?.hatchMode === "cross")
    ? bucketOverride.hatchMode
    : null;
  const hatchMode = (sideOverride?.hatchMode === "none" || sideOverride?.hatchMode === "single" || sideOverride?.hatchMode === "cross")
    ? sideOverride.hatchMode
    : (bucketMode || defaultMode);
  const overrideCircleSpacing = Number(sideOverride?.circleSpacing);
  const bucketCircleSpacing = Number(bucketOverride?.circleSpacing);
  const circleSpacing = Math.max(0.2, Math.min(2.0, Number.isFinite(overrideCircleSpacing)
    ? overrideCircleSpacing
    : (Number.isFinite(bucketCircleSpacing) ? bucketCircleSpacing : defaultSpacing)));
  const directions = hatchPrincipalDirections(polygon);
  const sourceHatchWidth = g.hatchWidth;
  const sourceHatchJitter = g.hatchJitter;
  const sourceHatchBend = g.hatchBend;
  const effectiveHatchWidth = Math.max(0.8, sourceHatchWidth);
  const effectiveHatchJitter = Math.max(0.25, sourceHatchJitter);
  const effectiveHatchBend = Math.abs(sourceHatchBend) < 0.01
    ? (sourceHatchBend < 0 ? -0.03 : 0.03)
    : sourceHatchBend;
  const layers = [];
  if (hatchMode !== "none") layers.push("single");
  if (hatchMode === "cross") layers.push("cross");
  if (brightness > 0.8) layers.push("circles");
  const bucketHatchColor = sanitizeSvgColor(bucketOverride?.hatchColor, "");
  const overrideHatchColor = sanitizeSvgColor(sideOverride?.hatchColor, "");
  const strokeColor = overrideHatchColor || bucketHatchColor || grayHexFromTone(clamp01(0.04 + tone * 0.03));

  return {
    tone,
    brightness,
    rawBrightness,
    background: grayHexFromTone(clamp01(0.93 + tone * 0.03)),
    stroke: strokeColor,
    strokeOpacity: 1,
    strokeWidth: effectiveHatchWidth,
    sourceHatchWidth,
    sourceHatchJitter,
    sourceHatchBend,
    hatchMode,
    spacing,
    edgeInset,
    circleSpacing,
    circleRadius: g.circleRadius,
    circleJitter: g.circleJitter,
    layers,
    hatchParams: {
      strokeWidth: effectiveHatchWidth,
      jitter: effectiveHatchJitter,
      bend: effectiveHatchBend,
      trimRatio: adaptiveTrimRatio,
      minVisible: adaptiveMinVisible,
    },
    directions,
  };
}

function buildStudioPolygonHatchStrokeSvg(polygon, style, hatchDir, sweepDir, spacingScale = 1) {
  const spacing = style.spacing * spacingScale;
  const segments = buildPolygonHatchSegments(
    polygon,
    hatchDir,
    sweepDir,
    spacing,
    style.edgeInset,
    style.hatchParams.trimRatio,
    style.hatchParams.minVisible,
  );
  let fallbackStrokeCount = 0;

  let svg = segments.map((segment) => (
    buildFilledPathSvg(segment.start, segment.end, {
      color: style.stroke,
      fill: style.stroke,
      opacity: style.strokeOpacity,
      jitter: style.hatchParams.jitter,
      bend: style.hatchParams.bend,
      width: style.hatchParams.strokeWidth,
    })
  )).join("\n");

  // Fallback for heavily clipped or tiny polygons where sweep intersections can underflow.
  if (segments.length < 2) {
    const bounds = hatchPolygonBounds(polygon);
    const area = hatchPolygonArea(polygon);
    const shortSide = Math.max(1, Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY));
    const step = Math.max(0.8, Math.min(spacing, shortSide * 0.22));
    const strokeLength = Math.max(step * 1.5, Math.min(shortSide * 0.9, Math.sqrt(area) * 0.55));
    const half = strokeLength * 0.5;
    const centerJitter = step * 0.28 * Math.max(0, Math.min(1.5, style.hatchParams.jitter));
    let extra = "";

    for (let y = bounds.minY + step * 0.5; y <= bounds.maxY - step * 0.5; y += step) {
      for (let x = bounds.minX + step * 0.5; x <= bounds.maxX - step * 0.5; x += step) {
        const cx = x + getRandomFromInterval(-centerJitter, centerJitter);
        const cy = y + getRandomFromInterval(-centerJitter, centerJitter);
        if (!hatchPointInPolygon({ x: cx, y: cy }, polygon)) {
          continue;
        }
        const start = { x: cx - hatchDir.x * half, y: cy - hatchDir.y * half };
        const end = { x: cx + hatchDir.x * half, y: cy + hatchDir.y * half };
        extra += buildFilledPathSvg(start, end, {
          color: style.stroke,
          fill: style.stroke,
          opacity: style.strokeOpacity,
          jitter: style.hatchParams.jitter,
          bend: style.hatchParams.bend,
          width: style.hatchParams.strokeWidth,
        });
        fallbackStrokeCount += 1;
      }
    }

    if (extra) {
      svg = `${svg}\n${extra}`;
    }
  }

  return {
    svg,
    primarySegmentCount: segments.length,
    fallbackStrokeCount,
  };
}

function buildStudioPolygonCircleSvg(polygon, style) {
  const bounds = hatchPolygonBounds(polygon);
  const area = hatchPolygonArea(polygon);
  const base = Math.max(4, Math.sqrt(area) * 0.09);
  const spacingScale = Math.max(0.2, style.circleSpacing);
  const radiusScale = Math.max(0.1, style.circleRadius);
  const adjustedRadius = Math.max(0.5, base * 0.55 * radiusScale);
  const densityFactor = Math.max(0.6, 1.2 - (style.brightness - 0.8) * 2.5);
  const rowStep = Math.max(adjustedRadius * 1.9, base * 1.6 * densityFactor * spacingScale);
  const colStep = Math.max(adjustedRadius * 2.15, base * 2.0 * densityFactor * spacingScale);
  const jitterAmount = adjustedRadius * Math.max(0, Math.min(0.9, style.circleJitter));

  let rowIndex = 0;
  let svg = "";
  let circleCount = 0;
  for (let centerY = bounds.minY + adjustedRadius; centerY <= bounds.maxY - adjustedRadius; centerY += rowStep) {
    const rowOffset = (rowIndex % 2 === 0) ? 0 : colStep * 0.5;
    for (let centerX = bounds.minX + adjustedRadius + rowOffset; centerX <= bounds.maxX - adjustedRadius; centerX += colStep) {
      const jitteredX = centerX + getRandomFromInterval(-jitterAmount, jitterAmount);
      const jitteredY = centerY + getRandomFromInterval(-jitterAmount, jitterAmount);
      if (!hatchPointInPolygon({ x: jitteredX, y: jitteredY }, polygon)) {
        continue;
      }
      svg += `<circle cx="${jitteredX.toFixed(2)}" cy="${jitteredY.toFixed(2)}" r="${adjustedRadius.toFixed(2)}" fill="none" stroke="${style.stroke}" stroke-width="1" stroke-opacity="${style.strokeOpacity}" />`;
      circleCount += 1;
    }
    rowIndex += 1;
  }

  return {
    svg,
    circleCount,
  };
}

function buildStudioHatchSvgForFacePolygon(face, polygon, style) {
  if (style.hatchMode === "none" && style.brightness <= 0.8) {
    return {
      svg: "",
      debug: {
        mode: style.hatchMode,
        singleSegments: 0,
        crossSegments: 0,
        singleFallback: 0,
        crossFallback: 0,
        circleCount: 0,
      },
    };
  }

  const pieces = [];
  const sweepDir = hatchNormalize(style.directions.principal);
  const hatchDir = hatchNormalize(style.directions.perpendicular);
  let singleSegments = 0;
  let crossSegments = 0;
  let singleFallback = 0;
  let crossFallback = 0;
  let circleCount = 0;

  if (style.hatchMode !== "none") {
    const single = buildStudioPolygonHatchStrokeSvg(polygon, style, hatchDir, sweepDir);
    pieces.push(single.svg);
    singleSegments = single.primarySegmentCount;
    singleFallback = single.fallbackStrokeCount;
  }
  if (style.hatchMode === "cross") {
    const cross = buildStudioPolygonHatchStrokeSvg(polygon, style, sweepDir, hatchDir, 1.03);
    pieces.push(cross.svg);
    crossSegments = cross.primarySegmentCount;
    crossFallback = cross.fallbackStrokeCount;
  }
  if (style.brightness > 0.8) {
    const circles = buildStudioPolygonCircleSvg(polygon, style);
    pieces.push(circles.svg);
    circleCount = circles.circleCount;
  }

  return {
    svg: pieces.join("\n"),
    debug: {
      mode: style.hatchMode,
      singleSegments,
      crossSegments,
      singleFallback,
      crossFallback,
      circleCount,
    },
  };
}

function hatchLayersForFace(face) {
  const tone = faceToneFromLight(face);
  const layers = [];

  if (face.faceName === "top") {
    layers.push("45", "315");
  } else if (face.faceName === "left" || face.faceName === "right") {
    layers.push("45", "315", "circles");
  } else {
    layers.push("45");
  }

  if (tone < 0.58 && !layers.includes("315")) {
    layers.push("315");
  }
  if (tone < 0.44 && (face.faceName === "front" || face.faceName === "back")) {
    layers.push("horizontal");
  }
  if (tone < 0.38 && face.faceName === "top") {
    layers.push("horizontal", "vertical");
  }
  if (tone < 0.32 && !layers.includes("circles")) {
    layers.push("circles");
  }

  return [...new Set(layers)];
}

function normalizeHatchStyle(style, fallbackControls) {
  return {
    ...style,
    layers: [...(style.layers || [])],
    params: {
      strokeWidth: style.params?.strokeWidth ?? fallbackControls.strokeWidth,
      strokeLengthMul: style.params?.strokeLengthMul ?? fallbackControls.strokeLengthMul,
      jitter: style.params?.jitter ?? fallbackControls.jitter,
      bend: style.params?.bend ?? fallbackControls.bend,
    },
  };
}

const SVG_EXPORT_HATCH_CONFIG = {
  controls: {
    strokeWidth: 1.3,
    strokeLengthMul: 2.25,
    jitter: 1.25,
    bend: 0.07,
  },
  styles: [
    { id: "style01", name: "Bright Sparse 45", brightness: 0.98, layers: ["45"], spacingMul: 1.45, lengthMul: 1, params: { strokeWidth: 0.55, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style02", name: "Bright Cross", brightness: 0.69, layers: ["315"], spacingMul: 1.2, lengthMul: 1, params: { strokeWidth: 0.6, strokeLengthMul: 2.3, jitter: 1.25, bend: 0.07 } },
    { id: "style03", name: "Light Vertical", brightness: 0.74, layers: ["vertical"], spacingMul: 1.1, lengthMul: 1, params: { strokeWidth: 1.9, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style04", name: "Light Diagonal Dense", brightness: 0.66, layers: ["45", "315"], spacingMul: 0.94, lengthMul: 0.95, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style05", name: "Mid Vertical Cross", brightness: 0.58, layers: ["vertical", "horizontal"], spacingMul: 0.92, lengthMul: 1, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style06", name: "Mid Diagonal + Dots", brightness: 0.5, layers: ["45", "315", "circles"], spacingMul: 0.9, lengthMul: 0.92, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style07", name: "Dark Four-Way", brightness: 0.42, layers: ["45", "315", "horizontal", "vertical"], spacingMul: 0.82, lengthMul: 0.95, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style08", name: "Dark Vertical + Dots", brightness: 0.34, layers: ["vertical", "circles"], spacingMul: 0.8, lengthMul: 0.9, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style09", name: "Deep Diagonal Weave", brightness: 0.26, layers: ["45", "315", "vertical"], spacingMul: 0.74, lengthMul: 0.86, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
    { id: "style10", name: "Deep Heavy", brightness: 0.18, layers: ["45", "315", "horizontal", "vertical", "circles"], spacingMul: 0.7, lengthMul: 0.85, params: { strokeWidth: 1.3, strokeLengthMul: 2.25, jitter: 1.25, bend: 0.07 } },
  ],
};

function copySvgExportHatchConfig() {
  const controls = { ...SVG_EXPORT_HATCH_CONFIG.controls };
  return {
    controls,
    styles: SVG_EXPORT_HATCH_CONFIG.styles.map((style) => normalizeHatchStyle(style, controls)),
  };
}

function pickClosestPresetByBrightness(targetTone, presets) {
  if (!Array.isArray(presets) || presets.length === 0) {
    return null;
  }
  let best = presets[0];
  let bestDelta = Math.abs((best.brightness ?? 0.5) - targetTone);
  for (let index = 1; index < presets.length; index += 1) {
    const candidate = presets[index];
    const delta = Math.abs((candidate.brightness ?? 0.5) - targetTone);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}

function buildStyleFromPreset(preset, shortSide, params) {
  const resolvedParams = params || preset.params || SVG_EXPORT_HATCH_CONFIG.controls;
  const tone = clamp01(preset.brightness);
  const darkness = 1 - tone;
  const unit = Math.max(4, shortSide / 170);
  return {
    tone,
    background: grayHexFromTone(clamp01(0.93 + tone * 0.03)),
    stroke: grayHexFromTone(clamp01(0.04 + tone * 0.03)),
    strokeWidth: resolvedParams.strokeWidth,
    spacing: unit * (2.45 - darkness * 0.7) * (preset.spacingMul ?? 1),
    strokeLength: unit * (4.1 - darkness * 0.35) * (preset.lengthMul ?? 1) * (resolvedParams.strokeLengthMul ?? 1),
    circleRadius: unit * (0.36 + darkness * 0.05),
    layers: [...new Set(Array.isArray(preset.layers) && preset.layers.length > 0 ? preset.layers : ["45"])],
    hatchParams: {
      strokeWidth: resolvedParams.strokeWidth,
      jitter: resolvedParams.jitter,
      bend: resolvedParams.bend,
    },
  };
}

function hatchStyleForFace(face, width, height) {
  const shortSide = Math.min(width, height);
  const faceTone = faceToneFromLight(face);
  const config = SVG_EXPORT_HATCH_CONFIG;
  const preset = pickClosestPresetByBrightness(faceTone, config.styles) || config.styles[0];
  return buildStyleFromPreset(preset, shortSide, preset.params || config.controls);
}


function buildHatchStrokeFieldSvg(rect, angle, spacing, strokeLength, stroke, strokeWidth, opacity, shortSide, hatchParams) {
  // Match debugHatching.js grid distribution: global box grid + density scaling.
  const resolutionBoxCount = 80;
  const boxSize = Math.max(0.0001, shortSide / resolutionBoxCount);
  const hatchDensityMultiplier = 4;
  const hatchDensityScale = Math.sqrt(hatchDensityMultiplier);
  const rowStepBoxesBase = Math.max(1, Math.round(spacing / boxSize));
  const colStepBoxesBase = Math.max(1, Math.round(strokeLength / boxSize));
  const rowStepBoxes = Math.max(1, Math.round(rowStepBoxesBase / hatchDensityScale));
  const colStepBoxes = Math.max(1, Math.round(colStepBoxesBase / hatchDensityScale));

  const minRow = Math.floor(rect.y / boxSize) - rowStepBoxes;
  const maxRow = Math.ceil((rect.y + rect.height) / boxSize) + rowStepBoxes;
  const minCol = Math.floor(rect.x / boxSize) - colStepBoxes;
  const maxCol = Math.ceil((rect.x + rect.width) / boxSize) + colStepBoxes;

  // Use organic filledPath SVG for each hatch stroke
  const half = strokeLength * 0.5;
  const dx = Math.cos(angle) * half;
  const dy = Math.sin(angle) * half;
  let svg = "";
  for (let row = minRow; row <= maxRow; row += rowStepBoxes) {
    const cy = (row + 0.5) * boxSize;
    for (let col = minCol; col <= maxCol; col += colStepBoxes) {
      const cx = (col + 0.5) * boxSize;
      const start = { x: cx - dx, y: cy - dy };
      const end = { x: cx + dx, y: cy + dy };
      svg += buildFilledPathSvg(start, end, {
        color: stroke,
        strokeWidth,
        fill: stroke,
        opacity,
        jitter: hatchParams?.jitter,
        bend: hatchParams?.bend,
        width: hatchParams?.strokeWidth,
      });
    }
  }
  return svg;
}


function buildHatchCirclesSvg(rect, spacing, radius, stroke, strokeWidth, opacity, shortSide) {
  // Match debugHatching.js hatchCircles distribution and jitter.
  const resolutionBoxCount = 80;
  const boxSize = Math.max(0.0001, shortSide / resolutionBoxCount);
  const adjustedRadius = Math.max(boxSize * 0.18, radius * 0.35);
  const rowStep = Math.max(boxSize * 0.35, adjustedRadius * 1.9);
  const colStep = Math.max(boxSize * 0.45, adjustedRadius * 2.15);
  const jitterAmount = adjustedRadius * 0.22;

  const rowStart = rect.y + adjustedRadius;
  const rowEnd = rect.y + rect.height - adjustedRadius;
  let svg = "";
  let rowIndex = 0;
  for (let cy = rowStart; cy <= rowEnd; cy += rowStep) {
    const offset = rowIndex % 2 === 0 ? 0 : colStep * 0.5;
    const colStart = rect.x + adjustedRadius + offset;
    const colEnd = rect.x + rect.width - adjustedRadius;
    for (let cx = colStart; cx <= colEnd; cx += colStep) {
      const jitteredX = Math.min(rect.x + rect.width - adjustedRadius, Math.max(rect.x + adjustedRadius, cx + getRandomFromInterval(-jitterAmount, jitterAmount)));
      const jitteredY = Math.min(rect.y + rect.height - adjustedRadius, Math.max(rect.y + adjustedRadius, cy + getRandomFromInterval(-jitterAmount, jitterAmount)));
      svg += `<circle cx="${jitteredX.toFixed(2)}" cy="${jitteredY.toFixed(2)}" r="${adjustedRadius.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" />`;
    }
    rowIndex += 1;
  }
  return svg;
}

function buildHatchLayerSvg(layer, rect, style, shortSide) {
  if (layer === "horizontal") {
    return buildHatchStrokeFieldSvg(rect, 0, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide, style.hatchParams);
  }
  if (layer === "vertical") {
    return buildHatchStrokeFieldSvg(rect, Math.PI / 2, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide, style.hatchParams);
  }
  if (layer === "45") {
    return buildHatchStrokeFieldSvg(rect, Math.PI / 4, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide, style.hatchParams);
  }
  if (layer === "315") {
    return buildHatchStrokeFieldSvg(rect, -Math.PI / 4, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide, style.hatchParams);
  }
  if (layer === "circles") {
    return buildHatchCirclesSvg(rect, style.spacing, style.circleRadius, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  return "";
}

function buildHatchedFacePolygonSvg(face, polygon, faceIndex, polygonIndex, width, height, brightnessNormalization = null, brightnessProfile = null) {
  const polygonPoints = pointsToSvgString(polygon);
  const style = buildStudioFaceHatchStyle(face, polygon, null, brightnessNormalization, null, brightnessProfile);
  const hatchBuild = buildStudioHatchSvgForFacePolygon(face, polygon, style);
  const hatchSvg = hatchBuild.svg;
  const cubeFillColor = sanitizeSvgColor(exportVisualSettings.cubeFillColor, EXPORT_CUBE_FILL_COLOR);
  const totalPrimarySegments = hatchBuild.debug.singleSegments + hatchBuild.debug.crossSegments;
  const totalFallbackSegments = hatchBuild.debug.singleFallback + hatchBuild.debug.crossFallback;
  const totalSegments = totalPrimarySegments + totalFallbackSegments;
  const polygonCenter = hatchPolygonCentroid(polygon);
  const debugLabel = `${face.cubeIndex}:${face.faceName} m=${hatchBuild.debug.mode} seg=${totalSegments} p=${totalPrimarySegments} fb=${totalFallbackSegments} c=${hatchBuild.debug.circleCount} hb=${style.brightness.toFixed(2)} hraw=${style.rawBrightness.toFixed(2)} raw=${face.brightness.toFixed(2)} sh=${face.shadowStrength.toFixed(2)}`;
  const debugLabelSvg = DEBUG_EXPORT_HATCH_LABELS
    ? `<text x="${polygonCenter.x.toFixed(2)}" y="${polygonCenter.y.toFixed(2)}" fill="#bb1f1f" font-size="9" font-family="ui-monospace, Menlo, monospace" text-anchor="middle" dominant-baseline="middle" data-layer="hatchDebugLabel">${escapeXml(debugLabel)}</text>`
    : "";

  return {
    defs: "",
    content: `<g data-layer="face" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-brightness="${face.brightness.toFixed(4)}" data-hatch-brightness="${style.brightness.toFixed(4)}" data-hatch-brightness-raw="${style.rawBrightness.toFixed(4)}" data-shadow="${face.shadowStrength.toFixed(4)}" data-tone="${style.tone.toFixed(4)}" data-hatch="${style.layers.join(" ")}" data-hatch-jitter="${style.hatchParams.jitter.toFixed(3)}" data-hatch-bend="${style.hatchParams.bend.toFixed(3)}" data-hatch-width="${style.hatchParams.strokeWidth.toFixed(3)}" data-hatch-jitter-src="${style.sourceHatchJitter.toFixed(3)}" data-hatch-bend-src="${style.sourceHatchBend.toFixed(3)}" data-hatch-width-src="${style.sourceHatchWidth.toFixed(3)}" data-hatch-mode="${hatchBuild.debug.mode}" data-hatch-segments="${totalSegments}" data-hatch-primary="${totalPrimarySegments}" data-hatch-fallback="${totalFallbackSegments}" data-hatch-circles="${hatchBuild.debug.circleCount}"><polygon points="${polygonPoints}" fill="${cubeFillColor}" stroke="none" />${hatchSvg}${debugLabelSvg}</g>`,
    debug: {
      cubeIndex: face.cubeIndex,
      faceName: face.faceName,
      brightness: face.brightness,
      hatchBrightness: style.brightness,
      shadowStrength: face.shadowStrength,
      hatchMode: hatchBuild.debug.mode,
      hatchSegments: totalSegments,
      hatchPrimary: totalPrimarySegments,
      hatchFallback: totalFallbackSegments,
      hatchCircles: hatchBuild.debug.circleCount,
      polygonArea: hatchPolygonArea(polygon),
      polygonIndex,
      faceIndex,
    },
  };
}

function parseFacesFromExportedSvg(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return null;

  const viewBox = svgEl.getAttribute("viewBox") || "";
  const width = Number(svgEl.getAttribute("width") || 800);
  const height = Number(svgEl.getAttribute("height") || 600);

  // Background fill rect
  const bgRect = doc.querySelector("svg > rect");
  const bgFill = bgRect ? (bgRect.getAttribute("fill") || "#1b2129") : "#1b2129";

  // Drop shadows
  const shadowPolygons = [];
  doc.querySelectorAll('[data-layer="shadow"]').forEach((el) => {
    const pts = (el.getAttribute("points") || "").trim().split(/\s+/).flatMap((p) => {
      const [x, y] = p.split(",").map(Number);
      return Number.isFinite(x) && Number.isFinite(y) ? [{ x, y }] : [];
    });
    if (pts.length >= 3) {
      shadowPolygons.push({
        points: pts,
        fill: el.getAttribute("fill") || "#2a3038",
        opacity: el.getAttribute("opacity") || "0.34",
      });
    }
  });

  // Face groups
  const faces = [];
  doc.querySelectorAll('[data-layer="face"]').forEach((el) => {
    const polygonEl = el.querySelector("polygon");
    if (!polygonEl) return;
    const polygon = (polygonEl.getAttribute("points") || "").trim().split(/\s+/).flatMap((p) => {
      const [x, y] = p.split(",").map(Number);
      return Number.isFinite(x) && Number.isFinite(y) ? [{ x, y }] : [];
    });
    if (polygon.length < 3) return;
    faces.push({
      brightness: Number(el.getAttribute("data-brightness") || 0),
      shadowStrength: Number(el.getAttribute("data-shadow") || 0),
      cubeIndex: el.getAttribute("data-cube") || "?",
      faceName: el.getAttribute("data-face") || "face",
      background: polygonEl.getAttribute("fill") || "#eee",
      polygon,
    });
  });

  let floorShadowPolygons = [];
  let cubeShadowPolygons = [];
  const metadataEl = doc.querySelector("svg > metadata");
  if (metadataEl?.textContent) {
    try {
      const metadata = JSON.parse(metadataEl.textContent);
      const fromFloor = metadata?.shadowLab?.floorPolygons;
      const fromCube = metadata?.shadowLab?.cubePolygons;
      if (Array.isArray(fromFloor)) {
        floorShadowPolygons = fromFloor
          .map((polygon) => sanitizeScreenPolygon(polygon))
          .filter((polygon) => Array.isArray(polygon) && polygon.length >= 3);
      }
      if (Array.isArray(fromCube)) {
        cubeShadowPolygons = fromCube
          .map((polygon) => sanitizeScreenPolygon(polygon))
          .filter((polygon) => Array.isArray(polygon) && polygon.length >= 3);
      }
    } catch (_error) {
      floorShadowPolygons = [];
      cubeShadowPolygons = [];
    }
  }

  return { faces, shadowPolygons, floorShadowPolygons, cubeShadowPolygons, bgFill, width, height, viewBox };
}

function buildLabSceneFromExportData(exportData) {
  if (!exportData || !Array.isArray(exportData.faces)) {
    return null;
  }
  const faces = [];
  for (const face of exportData.faces) {
    const polygons = Array.isArray(face.clippedScreenPolygons) ? face.clippedScreenPolygons : [];
    for (const polygon of polygons) {
      const sanitized = sanitizeScreenPolygon(polygon);
      if (!sanitized || sanitized.length < 3) {
        continue;
      }
      faces.push({
        brightness: Number(face.brightness || 0),
        shadowStrength: Number(face.shadowStrength || 0),
        cubeIndex: face.cubeIndex || "?",
        faceName: face.faceName || "face",
        background: "none",
        polygon: sanitized,
      });
    }
  }
  return {
    faces,
    shadowPolygons: [],
    floorShadowPolygons: Array.isArray(exportData.floorShadowPolygons) ? exportData.floorShadowPolygons : [],
    cubeShadowPolygons: Array.isArray(exportData.cubeShadowPolygons) ? exportData.cubeShadowPolygons : [],
    bgFill: "#ffffff",
    width: Number(exportData.width || 1200),
    height: Number(exportData.height || 900),
    viewBox: `0 0 ${Number(exportData.width || 1200)} ${Number(exportData.height || 900)}`,
  };
}

function buildPaperBackgroundForLab(width, height, paperOptions) {
  const fallback = {
    defs: "",
    content: `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />`,
  };
  if (typeof window === "undefined" || typeof window.PaperBackgroundTexture !== "function") {
    return fallback;
  }
  try {
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const texture = new window.PaperBackgroundTexture(tempSvg, {
      ...(paperOptions || {}),
      width,
      height,
    });
    texture.render();
    const defsNode = tempSvg.querySelector("defs");
    const rootGroup = tempSvg.querySelector("#paperTextureRoot");
    if (!rootGroup) {
      return fallback;
    }
    return {
      defs: defsNode ? defsNode.innerHTML : "",
      content: rootGroup.outerHTML,
    };
  } catch (_error) {
    return fallback;
  }
}

function buildLabStudioState(parsedScene) {
  const sides = [];
  parsedScene.faces.forEach((face, index) => {
    const id = `face:${face.cubeIndex}:${face.faceName}:${index}`;
    const defaultBrightness = faceStudioBrightness(face);
    sides.push({
      id,
      target: "face",
      targetIndex: index,
      hatchMode: studioDefaultHatchMode(defaultBrightness),
      hatchSpacing: studioDefaultSpacingForBrightness(defaultBrightness),
      circleSpacing: studioDefaultSpacingForBrightness(defaultBrightness),
      hatchColor: null,
    });
  });

  (parsedScene.floorShadowPolygons || []).forEach((_polygon, index) => {
    sides.push({
      id: `floorShadow:${index}`,
      target: "floorShadow",
      targetIndex: index,
      hatchMode: "cross",
      hatchSpacing: 0.85,
      circleSpacing: 0.85,
      hatchColor: null,
    });
  });

  (parsedScene.cubeShadowPolygons || []).forEach((_polygon, index) => {
    sides.push({
      id: `cubeShadow:${index}`,
      target: "cubeShadow",
      targetIndex: index,
      hatchMode: "cross",
      hatchSpacing: 0.75,
      circleSpacing: 0.75,
      hatchColor: null,
    });
  });
  return {
    sides,
    selectedFaceId: sides[0]?.id || null,
  };
}

function applyLabStudioFromSearch(studioState, search) {
  const encoded = search.get("studio");
  if (!encoded || !studioState) {
    return;
  }
  try {
    const payload = JSON.parse(decodeURIComponent(encoded));
    if (!payload || !Array.isArray(payload.d)) {
      return;
    }
    const byId = new Map(studioState.sides.map((side) => [side.id, side]));
    for (let i = 0; i < payload.d.length; i += 1) {
      const row = payload.d[i];
      const side = byId.get(row.id) || studioState.sides[i];
      if (!side) {
        continue;
      }
      if (row.mode === "none" || row.mode === "single" || row.mode === "cross") {
        side.hatchMode = row.mode;
      }
      if (Array.isArray(row.p) && row.p.length > 0) {
        const hatchSpacing = Number(row.p[0]);
        if (Number.isFinite(hatchSpacing)) {
          side.hatchSpacing = hatchSpacing;
        }
      }
      if (Array.isArray(row.p) && row.p.length > 1) {
        const circleSpacing = Number(row.p[1]);
        if (Number.isFinite(circleSpacing)) {
          side.circleSpacing = circleSpacing;
        }
      }
      if (typeof row.c === "string") {
        const normalized = row.c.trim();
        side.hatchColor = normalized ? sanitizeSvgColor(normalized, null) : null;
      }
    }
    if (typeof payload.s === "string") {
      studioState.selectedFaceId = payload.s;
    }
  } catch (_error) {
    // ignore malformed studio payload
  }
}

function encodePaperPresetForUrl(paperOptions) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(paperOptions))));
  } catch (_error) {
    return null;
  }
}

function decodePaperPresetFromSearch(search) {
  const encoded = search.get("preset");
  if (!encoded) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch (_error) {
    return null;
  }
}

function decodeStudioPayloadFromSearch(search) {
  const encoded = search.get("studio");
  if (!encoded) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch (_error) {
    return null;
  }
}

const LAB_PRESETS_STORAGE_KEY = "camogli3d.exportStudio.namedPresets.v1";
const LAB_DEFAULT_GLOBALS = {
  hatchWidth: 1.0,
  hatchJitter: 1.85,
  hatchBend: -0.02,
  hatchSeed: HATCH_SEED_DEFAULT,
  hatchTrimRatio: 0.06,
  hatchMinVisible: 0,
  circleRadius: 0.25,
  circleJitter: 1.0,
};
const LAB_DEFAULT_PAPER_OPTIONS = {
  width: 1920,
  height: 1047,
  paperColor: "#d8d6ce",
  seedA: 368,
  seedB: 253,
  grainFreq: 2.2,
  grainOpacity: 0.71,
  stainFreq: 0.016,
  stainOpacity: 0.6,
  stainBlobFreq: 0.005,
  stainBlobOpacity: 0.22,
  stainBlobBlur: 6.5,
  stainMixMode: "overlay",
  softBlur: 0.4,
  contrast: 0.92,
};
const LAB_DEFAULT_VISUAL_OPTIONS = {
  frameColor: exportVisualSettings.frameColor,
  backgroundColor: exportVisualSettings.backgroundColor,
  cubeFillColor: exportVisualSettings.cubeFillColor,
  noiseEnabled: exportVisualSettings.noiseEnabled,
  noiseOpacity: exportVisualSettings.noiseOpacity,
  noiseFrequency: exportVisualSettings.noiseFrequency,
  noiseOctaves: exportVisualSettings.noiseOctaves,
  noiseSeed: exportVisualSettings.noiseSeed,
};

function renderSvgHatch3DPreview(svgNode, parsedScene, labGlobals, labState, onSelectFace = null) {
  const hatchSeed = sanitizeIntegerSeed(labGlobals?.hatchSeed, hatchExportSettings.seed);
  withSeededMathRandom(hatchSeed, () => {
    const {
      faces,
      shadowPolygons,
      floorShadowPolygons = [],
      cubeShadowPolygons = [],
      width,
      height,
      viewBox,
    } = parsedScene;
    const brightnessNormalization = buildFaceBrightnessNormalization(faces);
    const brightnessProfile = labState?.brightnessProfile || null;
    const studioState = labState?.studioState;
    const sideById = new Map((studioState?.sides || []).map((side) => [side.id, side]));
    const paperBackground = buildPaperBackgroundForLab(width, height, labState?.paperOptions || {});

    svgNode.setAttribute("viewBox", viewBox || `0 0 ${width} ${height}`);
    svgNode.setAttribute("width", String(width));
    svgNode.setAttribute("height", String(height));

    const frameParts = buildSvgFrameParts(width, height, "labPreviewFrame", labState?.visualOptions || exportVisualSettings);
    const noiseParts = buildSvgNoiseLayer(width, height, "labPreview", labState?.visualOptions || exportVisualSettings);

    let html = `<defs>${paperBackground.defs}${frameParts.defs}${noiseParts.defs}</defs>${frameParts.background}${frameParts.before}<g id="paperAgedArtwork" filter="url(#paperDirtyObjectFilter)">${paperBackground.content}`;

    if (floorShadowPolygons.length === 0 && cubeShadowPolygons.length === 0) {
      for (const shadow of shadowPolygons) {
        const pts = shadow.points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
        html += `<polygon points="${pts}" fill="${shadow.fill}" opacity="${shadow.opacity}" stroke="none" />`;
      }
    }

    for (let index = 0; index < floorShadowPolygons.length; index += 1) {
      const polygon = floorShadowPolygons[index];
      const sideId = `floorShadow:${index}`;
      const side = sideById.get(sideId) || null;
      const pseudoFace = {
        brightness: 0.12,
        shadowStrength: 1,
        cubeIndex: "floorShadow",
        faceName: "floor",
      };
      const style = buildStudioFaceHatchStyle(pseudoFace, polygon, labGlobals, null, side, brightnessProfile);
      const { svg: hatchSvg } = buildStudioHatchSvgForFacePolygon(pseudoFace, polygon, style);
      const pts = polygon.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
      const isSelected = Boolean(studioState && studioState.selectedFaceId === sideId);
      const highlightStroke = isSelected ? "#d6a65f" : "none";
      const highlightWidth = isSelected ? "2.2" : "0";
      html += `<g data-face-id="${sideId}"><polygon points="${pts}" fill="none" stroke="none" />${hatchSvg}<polygon points="${pts}" fill="none" stroke="${highlightStroke}" stroke-width="${highlightWidth}" pointer-events="none" /><polygon points="${pts}" fill="rgba(0,0,0,0.001)" stroke="none" data-face-hit="1" data-face-id="${sideId}" style="cursor:pointer;" /></g>`;
    }

    for (let index = 0; index < cubeShadowPolygons.length; index += 1) {
      const polygon = cubeShadowPolygons[index];
      const sideId = `cubeShadow:${index}`;
      const side = sideById.get(sideId) || null;
      const pseudoFace = {
        brightness: 0.08,
        shadowStrength: 1,
        cubeIndex: "cubeShadow",
        faceName: "cube",
      };
      const style = buildStudioFaceHatchStyle(pseudoFace, polygon, labGlobals, null, side, brightnessProfile);
      const { svg: hatchSvg } = buildStudioHatchSvgForFacePolygon(pseudoFace, polygon, style);
      const pts = polygon.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
      const isSelected = Boolean(studioState && studioState.selectedFaceId === sideId);
      const highlightStroke = isSelected ? "#d6a65f" : "none";
      const highlightWidth = isSelected ? "2.2" : "0";
      html += `<g data-face-id="${sideId}"><polygon points="${pts}" fill="none" stroke="none" />${hatchSvg}<polygon points="${pts}" fill="none" stroke="${highlightStroke}" stroke-width="${highlightWidth}" pointer-events="none" /><polygon points="${pts}" fill="rgba(0,0,0,0.001)" stroke="none" data-face-hit="1" data-face-id="${sideId}" style="cursor:pointer;" /></g>`;
    }

    for (let index = 0; index < faces.length; index += 1) {
      const face = faces[index];
      const faceId = `face:${face.cubeIndex}:${face.faceName}:${index}`;
      const style = buildStudioFaceHatchStyle(face, face.polygon, labGlobals, brightnessNormalization, null, brightnessProfile);
      const { svg: hatchSvg } = buildStudioHatchSvgForFacePolygon(face, face.polygon, style);
      const pts = face.polygon.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
      const cubeFillColor = sanitizeSvgColor(labState?.visualOptions?.cubeFillColor, EXPORT_CUBE_FILL_COLOR);
      const isSelected = Boolean(studioState && studioState.selectedFaceId === faceId);
      const highlightStroke = isSelected ? "#d6a65f" : "none";
      const highlightWidth = isSelected ? "2.2" : "0";
      html += `<g data-face-id="${faceId}"><polygon points="${pts}" fill="${cubeFillColor}" stroke="none" />${hatchSvg}<polygon points="${pts}" fill="none" stroke="${highlightStroke}" stroke-width="${highlightWidth}" pointer-events="none" /><polygon points="${pts}" fill="rgba(0,0,0,0.001)" stroke="none" data-face-hit="1" data-face-id="${faceId}" style="cursor:pointer;" /></g>`;
    }

    html += `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" opacity="0.42" filter="url(#paperDirtyObjectFilter)" style="mix-blend-mode:multiply" pointer-events="none" /></g>${noiseParts.content}${frameParts.after}${frameParts.overlay}`;

    svgNode.innerHTML = html;

    if (typeof onSelectFace === "function") {
      svgNode.querySelectorAll("[data-face-hit='1']").forEach((node) => {
        node.addEventListener("click", () => {
          const id = node.getAttribute("data-face-id");
          if (id) {
            onSelectFace(id);
          }
        });
      });
    }
  });
}

function initSvgHatchingLab(initialParsedScene = null, noShadows = false) {
  const hud = document.querySelector(".hud");
  if (hud) {
    hud.style.display = "none";
  }

  container.innerHTML = "";
  studioActive = true;
  studioGeneration += 1;
  const myGeneration = studioGeneration;
  // Hide the 3D sidebar while the studio is full-screen
  const mainHud = document.querySelector("aside.hud");
  if (mainHud) mainHud.style.display = "none";
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.height = "100vh";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "minmax(0, 1fr) 340px";
  container.style.alignItems = "stretch";
  container.style.justifyItems = "stretch";
  container.style.alignContent = "stretch";
  container.style.justifyContent = "stretch";
  container.style.background = exportVisualSettings.backgroundColor;
  container.style.overflow = "hidden";

  // --- Preview pane (left column) ---
  const previewPane = document.createElement("div");
  previewPane.style.cssText = "display:flex;flex-direction:column;min-height:0;overflow:hidden;box-sizing:border-box;";

  // Toggle bar above the preview
  const toggleBar = document.createElement("div");
  toggleBar.style.cssText = "display:flex;align-items:center;gap:0;flex-shrink:0;border-bottom:1px solid rgba(25,30,36,0.13);background:#1a1f28;";

  function makeTabBtn(label, active) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.style.cssText = `flex:1;padding:9px 0;border:none;background:${active ? "rgba(214,166,95,0.18)" : "transparent"};color:${active ? "#d6a65f" : "#9aa7b7"};font-size:12px;font-weight:${active ? "700" : "400"};letter-spacing:0.04em;cursor:pointer;transition:background 0.15s,color 0.15s;`;
    return btn;
  }

  let currentView = "sketch"; // "sketch" | "3d"
  const tab3d = makeTabBtn("3D Scene", false);
  const tabSketch = makeTabBtn("Sketch", true);
  const tabHatchingDebug = makeTabBtn("Hatching Debug", false);
  toggleBar.appendChild(tab3d);
  toggleBar.appendChild(tabSketch);
  toggleBar.appendChild(tabHatchingDebug);
  previewPane.appendChild(toggleBar);

  // Shared view container — both views live here, one hidden at a time
  const viewContainer = document.createElement("div");
  viewContainer.style.cssText = "flex:1;min-height:0;position:relative;overflow:hidden;background:#000;";
  previewPane.appendChild(viewContainer);

  // SVG sketch node
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgNode.style.cssText = "display:block;position:absolute;inset:0;width:100%;height:100%;background:#f8f5ed;box-sizing:border-box;";
  viewContainer.appendChild(svgNode);

  const debugStudioFrame = document.createElement("iframe");
  debugStudioFrame.style.cssText = "display:none;position:absolute;inset:0;width:100%;height:100%;border:none;background:#fff;";
  debugStudioFrame.referrerPolicy = "no-referrer";
  viewContainer.appendChild(debugStudioFrame);

  // 3D canvas — move it from container into viewContainer
  const canvas3d = renderer.domElement;
  canvas3d.style.cssText = "display:none;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);";
  viewContainer.appendChild(canvas3d);

  // Size helpers: keep canvas matching the view container
  function resizeCanvasToPane() {
    const w = viewContainer.clientWidth || 1;
    const h = viewContainer.clientHeight || 1;
    // Maintain CANVAS_ASPECT ratio, letterbox inside the pane
    let cw = w;
    let ch = Math.round(cw / CANVAS_ASPECT);
    if (ch > h) {
      ch = h;
      cw = Math.round(ch * CANVAS_ASPECT);
    }
    renderer.setSize(cw, ch);
    camera.aspect = CANVAS_ASPECT;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  const DEBUG_STUDIO_DEFAULTS = {
    seed: 1,
    studioPayload: "{\"v\":3,\"s\":\"C1-A\",\"dir\":false,\"lbl\":false,\"g\":[1.75,0.6,-0.02,7.6,0,0,0,0.18],\"d\":[{\"id\":\"C1-A\",\"mode\":\"single\",\"p\":[1.35,0.2],\"c\":\"#111111\"},{\"id\":\"C1-B\",\"mode\":\"single\",\"p\":[1.35,0.2],\"c\":\"#111111\"},{\"id\":\"C1-C\",\"mode\":\"single\",\"p\":[1.2,0.2],\"c\":\"#111111\"},{\"id\":\"C2-A\",\"mode\":\"single\",\"p\":[1.05,0.2],\"c\":\"#111111\"},{\"id\":\"C2-B\",\"mode\":\"single\",\"p\":[0.95,0.2],\"c\":\"#111111\"},{\"id\":\"C2-C\",\"mode\":\"single\",\"p\":[0.85,0.2],\"c\":\"#111111\"},{\"id\":\"C3-A\",\"mode\":\"single\",\"p\":[0.75,0.2],\"c\":\"#111111\"},{\"id\":\"C3-B\",\"mode\":\"cross\",\"p\":[0.68,0.2],\"c\":\"#111111\"},{\"id\":\"C3-C\",\"mode\":\"cross\",\"p\":[0.6,0.2],\"c\":\"#111111\"},{\"id\":\"C4-A\",\"mode\":\"cross\",\"p\":[0.52,0.2],\"c\":\"#111111\"}]}"
  };

  const debugStudioState = {
    seed: DEBUG_STUDIO_DEFAULTS.seed,
    studioPayload: DEBUG_STUDIO_DEFAULTS.studioPayload,
  };
  const DEBUG_STUDIO_BUILD = "20260607-2";
  let debugStudioNonce = 0;

  function getDebugStudioBridge() {
    try {
      return debugStudioFrame.contentWindow?.__axisStudioBridge || null;
    } catch (_error) {
      return null;
    }
  }

  function withDebugStudioBridge(action) {
    const bridge = getDebugStudioBridge();
    if (!bridge) {
      return false;
    }
    try {
      action(bridge);
      return true;
    } catch (_error) {
      return false;
    }
  }

  let refreshDebugSelectionControls = () => {};
  let syncDebugStudioFromBrightnessProfile = () => {};

  function onEmbeddedDebugMessage(event) {
    if (event?.source !== debugStudioFrame.contentWindow) {
      return;
    }
    const payload = event?.data;
    if (!payload || payload.type !== "camogli-hatching-selection") {
      return;
    }
    refreshDebugSelectionControls();
  }

  window.addEventListener("message", onEmbeddedDebugMessage);

  function normalizeEmbeddedDebugLayout() {
    try {
      const doc = debugStudioFrame.contentDocument;
      if (!doc) return;

      let styleNode = doc.getElementById("camogliEmbedOverrides");
      if (!styleNode) {
        styleNode = doc.createElement("style");
        styleNode.id = "camogliEmbedOverrides";
        styleNode.textContent = `
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          body {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            padding: 0 !important;
            column-gap: 0 !important;
            background: #f8f8f6 !important;
          }
          #debugCubeAxesPanel {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
          #layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          aside.hud {
            display: none !important;
          }
          #badAssCanvas,
          #app {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          #svgNode,
          #badAssCanvas svg,
          svg#svgNode {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
        `;
        doc.head?.appendChild(styleNode);
      }

      // If the embedded page uses the same split layout, collapse it to a single preview column.
      const embeddedLayout = doc.getElementById("layout");
      if (embeddedLayout) {
        embeddedLayout.style.gridTemplateColumns = "minmax(0, 1fr)";
      }

      // Hide the embedded sidebar so the debug preview is not cramped.
      const embeddedHud = doc.querySelector("aside.hud");
      if (embeddedHud) {
        embeddedHud.style.display = "none";
      }

      const embeddedApp = doc.getElementById("app");
      if (embeddedApp) {
        embeddedApp.style.width = "100%";
        embeddedApp.style.height = "100%";
      }

      const embeddedHost = doc.getElementById("badAssCanvas");
      if (embeddedHost) {
        embeddedHost.style.width = "100%";
        embeddedHost.style.height = "100%";
        embeddedHost.style.maxHeight = "100%";
      }

      const embeddedPanel = doc.getElementById("debugCubeAxesPanel");
      if (embeddedPanel) {
        embeddedPanel.style.display = "none";
      }
    } catch (_error) {
      // Cross-origin / timing errors are non-fatal for the embedded debug tab.
    }
  }

  debugStudioFrame.addEventListener("load", () => {
    normalizeEmbeddedDebugLayout();
    syncDebugStudioFromBrightnessProfile();
    refreshDebugSelectionControls();
  });

  function buildDebugStudioUrl() {
    const params = new URLSearchParams();
    params.set("debugHatchingStudio", "1");
    params.set("seed", String(Math.max(1, Math.round(Number(debugStudioState.seed) || 1))));
    params.set("studio", encodeURIComponent(debugStudioState.studioPayload || "{}"));
    params.set("v", DEBUG_STUDIO_BUILD);
    params.set("nonce", String(debugStudioNonce));
    return `${window.location.origin}/?${params.toString()}`;
  }

  function reloadDebugStudioFrame() {
    debugStudioNonce += 1;
    debugStudioFrame.src = buildDebugStudioUrl();
  }

  function switchToView(view) {
    currentView = view;
    const is3d = view === "3d";
    const isSketch = view === "sketch";
    const isDebug = view === "hatching-debug";
    canvas3d.style.display = is3d ? "block" : "none";
    svgNode.style.display = isSketch ? "block" : "none";
    debugStudioFrame.style.display = isDebug ? "block" : "none";

    tab3d.style.background = is3d ? "rgba(214,166,95,0.18)" : "transparent";
    tab3d.style.color = is3d ? "#d6a65f" : "#9aa7b7";
    tab3d.style.fontWeight = is3d ? "700" : "400";
    tabSketch.style.background = isSketch ? "rgba(214,166,95,0.18)" : "transparent";
    tabSketch.style.color = isSketch ? "#d6a65f" : "#9aa7b7";
    tabSketch.style.fontWeight = isSketch ? "700" : "400";
    tabHatchingDebug.style.background = isDebug ? "rgba(214,166,95,0.18)" : "transparent";
    tabHatchingDebug.style.color = isDebug ? "#d6a65f" : "#9aa7b7";
    tabHatchingDebug.style.fontWeight = isDebug ? "700" : "400";

    if (is3d) {
      resizeCanvasToPane();
    }
    if (isDebug && !debugStudioFrame.src) {
      reloadDebugStudioFrame();
    }
    if (isDebug) {
      refreshDebugSelectionControls();
    }
  }

  tab3d.addEventListener("click", () => switchToView("3d"));
  tabSketch.addEventListener("click", () => switchToView("sketch"));
  tabHatchingDebug.addEventListener("click", () => switchToView("hatching-debug"));

  // Sidebar (right column)
  const pane = document.createElement("aside");
  pane.style.padding = "16px";
  pane.style.borderLeft = "1px solid rgba(255,255,255,0.14)";
  pane.style.background = "rgba(9, 13, 20, 0.92)";
  pane.style.color = "#edf2f7";
  pane.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
  pane.style.overflowY = "auto";
  pane.style.minHeight = "0";
  pane.style.height = "100vh";
  pane.style.maxHeight = "100vh";
  pane.style.overscrollBehavior = "contain";
  pane.style.webkitOverflowScrolling = "touch";

  const title = document.createElement("h2");
  title.textContent = "3D Export Studio";
  title.style.margin = "0 0 8px";
  title.style.fontSize = "16px";
  title.style.letterSpacing = "0.04em";

  const hint = document.createElement("p");
  hint.textContent = "Tune paper, global hatch, and brightness categories. Click any face to edit the hatching category for that brightness range.";
  hint.style.margin = "0 0 14px";
  hint.style.color = "#9aa7b7";
  hint.style.fontSize = "12px";

  // 3D Scene controls
  const labGlobals = {
    ...SVG_EXPORT_STUDIO_GLOBALS,
    ...LAB_DEFAULT_GLOBALS,
  };
  let labParsedScene = null;
  const labState = {
    studioState: null,
    brightnessProfile: null,
    paperOptions: {
      ...LAB_DEFAULT_PAPER_OPTIONS,
    },
    visualOptions: {
      ...LAB_DEFAULT_VISUAL_OPTIONS,
    },
  };
  const presetFromSearch = decodePaperPresetFromSearch(searchParams);
  if (presetFromSearch) {
    labState.paperOptions = {
      ...labState.paperOptions,
      ...presetFromSearch,
    };
  }

  function createDefaultBrightnessProfile() {
    const bins = [];
    for (let bin = 0; bin < 10; bin += 1) {
      const mid = (bin + 0.5) / 10;
      bins.push({
        bin,
        hatchMode: studioDefaultHatchMode(mid),
        hatchSpacing: studioDefaultSpacingForBrightness(mid),
        circleSpacing: studioDefaultSpacingForBrightness(mid),
        hatchColor: null,
      });
    }
    return {
      version: 1,
      bins,
    };
  }

  function normalizeBrightnessProfile(profile) {
    const fallback = createDefaultBrightnessProfile();
    if (!profile || !Array.isArray(profile.bins)) {
      return fallback;
    }
    const byBin = new Map();
    for (const row of profile.bins) {
      const bin = Number(row?.bin);
      if (!Number.isFinite(bin) || bin < 0 || bin > 9) continue;
      byBin.set(bin, row);
    }
    const bins = [];
    for (let bin = 0; bin < 10; bin += 1) {
      const base = fallback.bins[bin];
      const row = byBin.get(bin) || {};
      bins.push({
        bin,
        hatchMode: row.hatchMode === "none" || row.hatchMode === "single" || row.hatchMode === "cross"
          ? row.hatchMode
          : base.hatchMode,
        hatchSpacing: Number.isFinite(Number(row.hatchSpacing))
          ? Math.max(0.2, Math.min(2, Number(row.hatchSpacing)))
          : base.hatchSpacing,
        circleSpacing: Number.isFinite(Number(row.circleSpacing))
          ? Math.max(0.2, Math.min(2, Number(row.circleSpacing)))
          : base.circleSpacing,
        hatchColor: typeof row.hatchColor === "string"
          ? (sanitizeSvgColor(row.hatchColor, null) || null)
          : null,
      });
    }
    return {
      version: 1,
      bins,
    };
  }

  function cloneBrightnessProfile(profile) {
    return normalizeBrightnessProfile(JSON.parse(JSON.stringify(profile || createDefaultBrightnessProfile())));
  }

  function saveBrightnessProfileToStorage(profile) {
    try {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        bins: cloneBrightnessProfile(profile).bins,
      };
      window.localStorage.setItem(HATCH_BRIGHTNESS_PROFILE_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (_error) {
      return false;
    }
  }

  labState.brightnessProfile = normalizeBrightnessProfile(readExportBrightnessProfileFromStorage());
  const sceneSection = document.createElement("div");

  function applyLabBackgroundColor() {
    container.style.background = sanitizeHexColor(labState.visualOptions.backgroundColor, EXPORT_BACKGROUND_COLOR);
  }

  function createAccordion(titleText, open = false) {
    const details = document.createElement("details");
    details.open = open;
    details.style.cssText = "margin:10px 0;border:1px solid rgba(255,255,255,0.16);border-radius:8px;background:rgba(255,255,255,0.03);";
    const summary = document.createElement("summary");
    summary.textContent = titleText;
    summary.style.cssText = "cursor:pointer;list-style:none;padding:10px 12px;font-size:12px;letter-spacing:0.03em;text-transform:uppercase;color:#d2dbe7;";
    const content = document.createElement("div");
    content.style.cssText = "padding:0 12px 12px;";
    details.appendChild(summary);
    details.appendChild(content);
    return { details, content };
  }

  const sceneSlidersRoot = document.createElement("div");
  const sceneSliderRefs = new Map();

  function formatSliderValue(step, value) {
    const stepNum = Number(step);
    if (stepNum >= 1) return Number(value).toFixed(0);
    if (stepNum >= 0.1) return Number(value).toFixed(1);
    return Number(value).toFixed(2);
  }

  function createSceneSlider(labelText, key, min, max, step) {
    const initial = labGlobals[key] ?? min;
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;";
    lbl.textContent = labelText;
    const valInput = document.createElement("input");
    valInput.type = "number";
    valInput.min = String(min);
    valInput.max = String(max);
    valInput.step = String(step);
    valInput.value = formatSliderValue(step, initial);
    valInput.style.cssText = "width:74px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:2px 4px;";
    lbl.appendChild(valInput);
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(initial);
    inp.style.width = "100%";
    const syncValue = (raw) => {
      const parsed = Number(raw);
      const base = Number.isFinite(parsed) ? parsed : Number(labGlobals[key] ?? initial);
      const v = Math.max(min, Math.min(max, base));
      labGlobals[key] = v;
      inp.value = String(v);
      valInput.value = formatSliderValue(step, v);
      if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    };
    inp.addEventListener("input", () => {
      syncValue(inp.value);
    });
    valInput.addEventListener("change", () => {
      syncValue(valInput.value);
    });
    valInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        syncValue(valInput.value);
      }
    });
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    sceneSliderRefs.set(key, { inp, valInput, step });
    return wrap;
  }

  // Edge inset: special — null (auto) or a number
  const edgeInsetRow = document.createElement("div");
  edgeInsetRow.style.marginBottom = "10px";
  const edgeInsetLbl = document.createElement("label");
  edgeInsetLbl.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  edgeInsetLbl.textContent = "Edge Inset";
  const edgeInsetValSpan = document.createElement("span");
  edgeInsetValSpan.style.cssText = "font-size:11px;color:#9aa7b7;cursor:pointer;text-decoration:underline dotted;";
  edgeInsetValSpan.title = "Click to toggle auto / manual";
  edgeInsetValSpan.textContent = labGlobals.hatchEdgeInset === null ? "auto" : String(Number(labGlobals.hatchEdgeInset).toFixed(1));
  edgeInsetLbl.appendChild(edgeInsetValSpan);
  const edgeInsetValueInput = document.createElement("input");
  edgeInsetValueInput.type = "number";
  edgeInsetValueInput.min = "0";
  edgeInsetValueInput.max = "20";
  edgeInsetValueInput.step = "0.5";
  edgeInsetValueInput.value = String(Number(labGlobals.hatchEdgeInset ?? 3).toFixed(1));
  edgeInsetValueInput.disabled = labGlobals.hatchEdgeInset === null;
  edgeInsetValueInput.style.cssText = "width:74px;margin-bottom:6px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:2px 4px;";
  const edgeInsetSlider = document.createElement("input");
  edgeInsetSlider.type = "range";
  edgeInsetSlider.min = "0";
  edgeInsetSlider.max = "20";
  edgeInsetSlider.step = "0.5";
  edgeInsetSlider.value = String(labGlobals.hatchEdgeInset ?? 3);
  edgeInsetSlider.style.width = "100%";
  edgeInsetSlider.disabled = labGlobals.hatchEdgeInset === null;
  edgeInsetValSpan.addEventListener("click", () => {
    if (labGlobals.hatchEdgeInset === null) {
      labGlobals.hatchEdgeInset = Number(edgeInsetSlider.value);
      edgeInsetSlider.disabled = false;
      edgeInsetValueInput.disabled = false;
      edgeInsetValueInput.value = Number(labGlobals.hatchEdgeInset).toFixed(1);
      edgeInsetValSpan.textContent = labGlobals.hatchEdgeInset.toFixed(1);
    } else {
      labGlobals.hatchEdgeInset = null;
      edgeInsetSlider.disabled = true;
      edgeInsetValueInput.disabled = true;
      edgeInsetValSpan.textContent = "auto";
    }
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  });

  const syncEdgeInset = (raw) => {
    const parsed = Number(raw);
    const base = Number.isFinite(parsed) ? parsed : Number(labGlobals.hatchEdgeInset ?? 3);
    const v = Math.max(0, Math.min(20, base));
    labGlobals.hatchEdgeInset = v;
    edgeInsetSlider.value = String(v);
    edgeInsetValueInput.value = v.toFixed(1);
    edgeInsetValSpan.textContent = v.toFixed(1);
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  };

  edgeInsetSlider.addEventListener("input", () => {
    syncEdgeInset(edgeInsetSlider.value);
  });
  edgeInsetValueInput.addEventListener("change", () => {
    syncEdgeInset(edgeInsetValueInput.value);
  });
  edgeInsetValueInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      syncEdgeInset(edgeInsetValueInput.value);
    }
  });
  edgeInsetRow.appendChild(edgeInsetLbl);
  edgeInsetRow.appendChild(edgeInsetValueInput);
  edgeInsetRow.appendChild(edgeInsetSlider);

  sceneSlidersRoot.appendChild(createSceneSlider("Hatch Width",    "hatchWidth",    0.2,  3,    0.05));
  sceneSlidersRoot.appendChild(createSceneSlider("Hatch Jitter",   "hatchJitter",   0,    2,    0.05));
  sceneSlidersRoot.appendChild(createSceneSlider("Hatch Bend",     "hatchBend",    -0.4,  0.4,  0.01));
  sceneSlidersRoot.appendChild(createSceneSlider("Trim Ratio",     "hatchTrimRatio",0,    0.9,  0.01));
  sceneSlidersRoot.appendChild(createSceneSlider("Min Visible",    "hatchMinVisible",0,   20,   0.5));
  sceneSlidersRoot.appendChild(createSceneSlider("Circle Radius",  "circleRadius",  0.1,  3,    0.05));
  sceneSlidersRoot.appendChild(createSceneSlider("Circle Jitter",  "circleJitter",  0,    1,    0.05));
  sceneSlidersRoot.appendChild(edgeInsetRow);

  const faceSection = document.createElement("div");
  faceSection.style.cssText = "margin-top:16px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);";
  const faceTitle = document.createElement("div");
  faceTitle.style.cssText = "font-size:12px;color:#9aa7b7;margin-bottom:8px;";
  faceTitle.textContent = "Selected face: none";
  const faceBrightnessInfo = document.createElement("div");
  faceBrightnessInfo.style.cssText = "font-size:11px;color:#aeb9c7;margin-bottom:8px;";
  faceBrightnessInfo.textContent = "Brightness: n/a";

  const faceModeLabel = document.createElement("label");
  faceModeLabel.textContent = "Hatch Mode";
  faceModeLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const faceModeSelect = document.createElement("select");
  faceModeSelect.style.cssText = "width:100%;margin-bottom:10px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
  ["none", "single", "cross"].forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    faceModeSelect.appendChild(option);
  });

  function createFaceSlider(labelText, min, max, step) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;";
    lbl.textContent = labelText;
    const valInput = document.createElement("input");
    valInput.type = "number";
    valInput.min = String(min);
    valInput.max = String(max);
    valInput.step = String(step);
    valInput.value = formatSliderValue(step, 0.5);
    valInput.style.cssText = "width:74px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:2px 4px;";
    lbl.appendChild(valInput);
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.style.width = "100%";
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return { wrap, inp, valInput, min, max };
  }

  const hatchSpacingSlider = createFaceSlider("Hatch Spacing", 0.2, 2.0, 0.05);
  const circleSpacingSlider = createFaceSlider("Circle Spacing", 0.2, 2.0, 0.05);
  const hatchColorLabel = document.createElement("label");
  hatchColorLabel.textContent = "Hatch Color (optional, supports rgba)";
  hatchColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const hatchColorInput = document.createElement("input");
  hatchColorInput.type = "text";
  hatchColorInput.placeholder = "auto | rgba(40, 40, 40, 0.7)";
  hatchColorInput.style.cssText = "width:100%;margin-bottom:10px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";

  const applyToBinBtn = document.createElement("button");
  applyToBinBtn.type = "button";
  applyToBinBtn.textContent = "Category-linked";
  applyToBinBtn.style.cssText = "padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(214,166,95,0.2);color:#f7ead6;font-size:12px;cursor:pointer;";
  applyToBinBtn.disabled = true;

  function selectedSide() {
    if (!labState.studioState?.selectedFaceId) {
      return null;
    }
    return labState.studioState.sides.find((side) => side.id === labState.studioState.selectedFaceId) || null;
  }

  function selectedSideBrightness(sideId) {
    if (!labParsedScene || !sideId) {
      return null;
    }
    if (sideId.startsWith("face:")) {
      const parts = sideId.split(":");
      const index = Number(parts[parts.length - 1]);
      const face = Number.isFinite(index) ? labParsedScene.faces[index] : null;
      return Number.isFinite(face?.brightness) ? face.brightness : null;
    }
    if (sideId.startsWith("floorShadow:")) {
      return 0.12;
    }
    if (sideId.startsWith("cubeShadow:")) {
      return 0.08;
    }
    return null;
  }

  function selectedFaceBin(side) {
    if (!side || side.target !== "face" || !labParsedScene?.faces) {
      return null;
    }
    const face = labParsedScene.faces[side.targetIndex];
    if (!face) {
      return null;
    }
    const normalization = buildFaceBrightnessNormalization(labParsedScene.faces);
    const normalizedBrightness = normalizeFaceBrightness(faceStudioBrightness(face), normalization);
    return profileBinIndexFromBrightness(normalizedBrightness);
  }

  function selectedFaceBinEntry(side) {
    const bin = selectedFaceBin(side);
    if (!Number.isInteger(bin)) {
      return { bin: null, row: null };
    }
    const row = labState?.brightnessProfile?.bins?.[bin] || null;
    return { bin, row };
  }

  function applyBrightnessBinsToFaceSides() {
    if (!labParsedScene?.faces || !labState?.studioState?.sides || !labState?.brightnessProfile?.bins) {
      return;
    }
    const normalization = buildFaceBrightnessNormalization(labParsedScene.faces);
    for (const side of labState.studioState.sides) {
      if (side.target !== "face") {
        continue;
      }
      const face = labParsedScene.faces[side.targetIndex];
      if (!face) {
        continue;
      }
      const normalizedBrightness = normalizeFaceBrightness(faceStudioBrightness(face), normalization);
      const bin = profileBinIndexFromBrightness(normalizedBrightness);
      const bucket = labState.brightnessProfile.bins.find((row) => Number(row?.bin) === bin);
      if (!bucket) {
        continue;
      }
      side.hatchMode = bucket.hatchMode;
      side.hatchSpacing = bucket.hatchSpacing;
      side.circleSpacing = bucket.circleSpacing;
      side.hatchColor = bucket.hatchColor || null;
    }
  }

  function refreshFaceControls() {
    const side = selectedSide();
    if (!side) {
      faceTitle.textContent = "Selected face: none";
      faceBrightnessInfo.textContent = "Brightness: n/a";
      faceModeSelect.disabled = true;
      hatchSpacingSlider.inp.disabled = true;
      hatchSpacingSlider.valInput.disabled = true;
      circleSpacingSlider.inp.disabled = true;
      circleSpacingSlider.valInput.disabled = true;
      hatchColorInput.disabled = true;
      hatchColorInput.value = "";
      applyToBinBtn.disabled = true;
      return;
    }
    faceTitle.textContent = `Selected face: ${side.id}`;
    const brightness = selectedSideBrightness(side.id);
    faceBrightnessInfo.textContent = Number.isFinite(brightness)
      ? `Brightness: ${brightness.toFixed(3)} (0=bright, 1=dark)`
      : "Brightness: n/a";
    const { bin, row } = selectedFaceBinEntry(side);
    const binLinked = side.target === "face" && Number.isInteger(bin) && !!row;
    faceModeSelect.disabled = !binLinked;
    hatchSpacingSlider.inp.disabled = !binLinked;
    hatchSpacingSlider.valInput.disabled = !binLinked;
    circleSpacingSlider.inp.disabled = !binLinked;
    circleSpacingSlider.valInput.disabled = !binLinked;
    hatchColorInput.disabled = !binLinked;
    hatchColorInput.setCustomValidity("");
    if (!binLinked) {
      faceModeSelect.value = "single";
      hatchSpacingSlider.inp.value = "1.00";
      hatchSpacingSlider.valInput.value = "1.00";
      circleSpacingSlider.inp.value = "1.00";
      circleSpacingSlider.valInput.value = "1.00";
      hatchColorInput.value = "";
      applyToBinBtn.disabled = true;
      return;
    }
    selectedBrightnessBin = bin;
    refreshBrightnessBinControls();
    faceModeSelect.value = row.hatchMode;
    hatchSpacingSlider.inp.value = Number(row.hatchSpacing).toFixed(2);
    hatchSpacingSlider.valInput.value = Number(row.hatchSpacing).toFixed(2);
    circleSpacingSlider.inp.value = Number(row.circleSpacing).toFixed(2);
    circleSpacingSlider.valInput.value = Number(row.circleSpacing).toFixed(2);
    hatchColorInput.value = row.hatchColor || "";
    applyToBinBtn.disabled = true;
  }

  faceModeSelect.addEventListener("change", () => {
    const side = selectedSide();
    const { bin } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin)) return;
    selectedBrightnessBin = bin;
    updateBrightnessBinPatch({ hatchMode: faceModeSelect.value });
  });

  hatchSpacingSlider.inp.addEventListener("input", () => {
    const side = selectedSide();
    const { bin } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin)) return;
    selectedBrightnessBin = bin;
    const value = Math.max(hatchSpacingSlider.min, Math.min(hatchSpacingSlider.max, Number(hatchSpacingSlider.inp.value)));
    hatchSpacingSlider.inp.value = value.toFixed(2);
    hatchSpacingSlider.valInput.value = value.toFixed(2);
    updateBrightnessBinPatch({ hatchSpacing: value });
  });

  hatchSpacingSlider.valInput.addEventListener("change", () => {
    const side = selectedSide();
    const { bin, row } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin) || !row) return;
    selectedBrightnessBin = bin;
    const parsed = Number(hatchSpacingSlider.valInput.value);
    const base = Number.isFinite(parsed) ? parsed : Number(row.hatchSpacing);
    const value = Math.max(hatchSpacingSlider.min, Math.min(hatchSpacingSlider.max, base));
    hatchSpacingSlider.inp.value = value.toFixed(2);
    hatchSpacingSlider.valInput.value = value.toFixed(2);
    updateBrightnessBinPatch({ hatchSpacing: value });
  });

  hatchSpacingSlider.valInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      hatchSpacingSlider.valInput.dispatchEvent(new Event("change"));
    }
  });

  circleSpacingSlider.inp.addEventListener("input", () => {
    const side = selectedSide();
    const { bin } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin)) return;
    selectedBrightnessBin = bin;
    const value = Math.max(circleSpacingSlider.min, Math.min(circleSpacingSlider.max, Number(circleSpacingSlider.inp.value)));
    circleSpacingSlider.inp.value = value.toFixed(2);
    circleSpacingSlider.valInput.value = value.toFixed(2);
    updateBrightnessBinPatch({ circleSpacing: value });
  });

  circleSpacingSlider.valInput.addEventListener("change", () => {
    const side = selectedSide();
    const { bin, row } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin) || !row) return;
    selectedBrightnessBin = bin;
    const parsed = Number(circleSpacingSlider.valInput.value);
    const base = Number.isFinite(parsed) ? parsed : Number(row.circleSpacing);
    const value = Math.max(circleSpacingSlider.min, Math.min(circleSpacingSlider.max, base));
    circleSpacingSlider.inp.value = value.toFixed(2);
    circleSpacingSlider.valInput.value = value.toFixed(2);
    updateBrightnessBinPatch({ circleSpacing: value });
  });

  circleSpacingSlider.valInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      circleSpacingSlider.valInput.dispatchEvent(new Event("change"));
    }
  });

  hatchColorInput.addEventListener("input", () => {
    const side = selectedSide();
    const { bin } = selectedFaceBinEntry(side);
    if (!Number.isInteger(bin)) return;
    selectedBrightnessBin = bin;
    const raw = hatchColorInput.value.trim();
    if (!raw) {
      updateBrightnessBinPatch({ hatchColor: null });
      hatchColorInput.setCustomValidity("");
      return;
    }
    const sanitized = sanitizeSvgColor(raw, "");
    if (!sanitized) {
      hatchColorInput.setCustomValidity("Use #RRGGBB, #RRGGBBAA, rgb(), or rgba().");
      hatchColorInput.reportValidity();
      return;
    }
    hatchColorInput.setCustomValidity("");
    updateBrightnessBinPatch({ hatchColor: sanitized });
  });

  applyToBinBtn.addEventListener("click", () => {
    updateStatus("Hatch lab", "Selected sides are always category-linked. Edit the category controls directly.");
  });

  faceSection.appendChild(faceTitle);
  faceSection.appendChild(faceBrightnessInfo);
  faceSection.appendChild(faceModeLabel);
  faceSection.appendChild(faceModeSelect);
  faceSection.appendChild(hatchSpacingSlider.wrap);
  faceSection.appendChild(circleSpacingSlider.wrap);
  faceSection.appendChild(hatchColorLabel);
  faceSection.appendChild(hatchColorInput);
  faceSection.appendChild(applyToBinBtn);

  const brightnessBinsSection = document.createElement("div");
  const brightnessBinsInfo = document.createElement("div");
  brightnessBinsInfo.style.cssText = "font-size:11px;color:#9aa7b7;margin-bottom:8px;";
  brightnessBinsInfo.textContent = "Edit hatching per brightness category (0-10 ... 90-100).";

  const brightnessBinChips = document.createElement("div");
  brightnessBinChips.style.cssText = "display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-bottom:10px;";

  const brightnessBinModeLabel = document.createElement("label");
  brightnessBinModeLabel.textContent = "Bin Hatch Mode";
  brightnessBinModeLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const brightnessBinModeSelect = document.createElement("select");
  brightnessBinModeSelect.style.cssText = "width:100%;margin-bottom:8px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
  ["none", "single", "cross"].forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    brightnessBinModeSelect.appendChild(option);
  });

  const brightnessBinSpacing = createFaceSlider("Bin Hatch Spacing", 0.2, 2.0, 0.05);
  const brightnessBinCircleSpacing = createFaceSlider("Bin Circle Spacing", 0.2, 2.0, 0.05);

  const brightnessBinColorLabel = document.createElement("label");
  brightnessBinColorLabel.textContent = "Bin Hatch Color (optional)";
  brightnessBinColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const brightnessBinColorInput = document.createElement("input");
  brightnessBinColorInput.type = "text";
  brightnessBinColorInput.placeholder = "auto | #111111 | rgba(...)";
  brightnessBinColorInput.style.cssText = "width:100%;margin-bottom:10px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";

  const brightnessBinActions = document.createElement("div");
  brightnessBinActions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;";
  const saveBinsBtn = document.createElement("button");
  saveBinsBtn.type = "button";
  saveBinsBtn.textContent = "Save Brightness Bins";
  saveBinsBtn.style.cssText = "padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#e6eef8;font-size:12px;cursor:pointer;";
  const loadBinsBtn = document.createElement("button");
  loadBinsBtn.type = "button";
  loadBinsBtn.textContent = "Load Brightness Bins";
  loadBinsBtn.style.cssText = "padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#e6eef8;font-size:12px;cursor:pointer;";
  brightnessBinActions.appendChild(saveBinsBtn);
  brightnessBinActions.appendChild(loadBinsBtn);

  let selectedBrightnessBin = 0;
  const brightnessBinChipButtons = [];

  function currentBinEntry() {
    return labState.brightnessProfile.bins[selectedBrightnessBin];
  }

  function refreshBrightnessBinControls() {
    const row = currentBinEntry();
    if (!row) return;
    brightnessBinModeSelect.value = row.hatchMode;
    brightnessBinSpacing.inp.value = Number(row.hatchSpacing).toFixed(2);
    brightnessBinSpacing.valInput.value = Number(row.hatchSpacing).toFixed(2);
    brightnessBinCircleSpacing.inp.value = Number(row.circleSpacing).toFixed(2);
    brightnessBinCircleSpacing.valInput.value = Number(row.circleSpacing).toFixed(2);
    brightnessBinColorInput.value = row.hatchColor || "";
    brightnessBinChipButtons.forEach((btn, idx) => {
      const active = idx === selectedBrightnessBin;
      btn.style.background = active ? "rgba(214,166,95,0.18)" : "rgba(255,255,255,0.06)";
      btn.style.color = active ? "#f7ead6" : "#d2dbe7";
      btn.style.borderColor = active ? "rgba(214,166,95,0.55)" : "rgba(255,255,255,0.22)";
    });
  }

  function updateBrightnessBinPatch(patch) {
    const row = currentBinEntry();
    if (!row) return;
    Object.assign(row, patch);
    applyBrightnessBinsToFaceSides();
    syncDebugStudioFromBrightnessProfile();
    refreshBrightnessBinControls();
    refreshFaceControls();
    if (labParsedScene) {
      renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    }
  }

  for (let bin = 0; bin < 10; bin += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `${bin * 10}-${(bin + 1) * 10}`;
    btn.style.cssText = "padding:6px 6px;border-radius:8px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.06);color:#d2dbe7;font-size:11px;cursor:pointer;";
    btn.addEventListener("click", () => {
      selectedBrightnessBin = bin;
      refreshBrightnessBinControls();
    });
    brightnessBinChips.appendChild(btn);
    brightnessBinChipButtons.push(btn);
  }

  brightnessBinModeSelect.addEventListener("change", () => {
    updateBrightnessBinPatch({ hatchMode: brightnessBinModeSelect.value });
  });

  const bindBinSlider = (ui, key) => {
    const sync = (raw) => {
      const value = Math.max(ui.min, Math.min(ui.max, Number(raw)));
      ui.inp.value = value.toFixed(2);
      ui.valInput.value = value.toFixed(2);
      updateBrightnessBinPatch({ [key]: value });
    };
    ui.inp.addEventListener("input", () => sync(ui.inp.value));
    ui.valInput.addEventListener("change", () => sync(ui.valInput.value));
    ui.valInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") sync(ui.valInput.value);
    });
  };
  bindBinSlider(brightnessBinSpacing, "hatchSpacing");
  bindBinSlider(brightnessBinCircleSpacing, "circleSpacing");

  brightnessBinColorInput.addEventListener("input", () => {
    const raw = brightnessBinColorInput.value.trim();
    if (!raw) {
      updateBrightnessBinPatch({ hatchColor: null });
      return;
    }
    const sanitized = sanitizeSvgColor(raw, "");
    if (!sanitized) {
      brightnessBinColorInput.setCustomValidity("Use #RRGGBB, #RRGGBBAA, rgb(), or rgba().");
      brightnessBinColorInput.reportValidity();
      return;
    }
    brightnessBinColorInput.setCustomValidity("");
    updateBrightnessBinPatch({ hatchColor: sanitized });
  });

  saveBinsBtn.addEventListener("click", () => {
    const ok = saveBrightnessProfileToStorage(labState.brightnessProfile);
    updateStatus("Hatch lab", ok ? "Brightness bins saved." : "Could not save brightness bins.");
  });

  loadBinsBtn.addEventListener("click", () => {
    labState.brightnessProfile = normalizeBrightnessProfile(readExportBrightnessProfileFromStorage());
    applyBrightnessBinsToFaceSides();
    syncDebugStudioFromBrightnessProfile();
    refreshBrightnessBinControls();
    refreshFaceControls();
    if (labParsedScene) {
      renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    }
    updateStatus("Hatch lab", "Brightness bins loaded.");
  });

  brightnessBinsSection.appendChild(brightnessBinsInfo);
  brightnessBinsSection.appendChild(brightnessBinChips);
  brightnessBinsSection.appendChild(brightnessBinModeLabel);
  brightnessBinsSection.appendChild(brightnessBinModeSelect);
  brightnessBinsSection.appendChild(brightnessBinSpacing.wrap);
  brightnessBinsSection.appendChild(brightnessBinCircleSpacing.wrap);
  brightnessBinsSection.appendChild(brightnessBinColorLabel);
  brightnessBinsSection.appendChild(brightnessBinColorInput);
  brightnessBinsSection.appendChild(brightnessBinActions);
  refreshBrightnessBinControls();
  const sceneActions = document.createElement("div");
  sceneActions.style.cssText = "display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;";

  function readPresetStore() {
    const studioPayloadFromSearch = decodeStudioPayloadFromSearch(searchParams);
    const paperPresetFromSearch = decodePaperPresetFromSearch(searchParams);
    const visualDefaultsFromSearch = {
      frameColor: sanitizeHexColor(searchParams.get("frameColor"), LAB_DEFAULT_VISUAL_OPTIONS.frameColor),
      backgroundColor: sanitizeHexColor(searchParams.get("bgColor"), LAB_DEFAULT_VISUAL_OPTIONS.backgroundColor),
      cubeFillColor: sanitizeSvgColor(searchParams.get("cubeFillColor"), LAB_DEFAULT_VISUAL_OPTIONS.cubeFillColor),
    };

    try {
      const raw = window.localStorage.getItem(LAB_PRESETS_STORAGE_KEY);
      if (!raw) {
        return {
          defaultPresetName: "Scott Default",
          presets: [
            {
              name: "Scott Default",
              globals: { ...LAB_DEFAULT_GLOBALS },
              paperOptions: {
                ...LAB_DEFAULT_PAPER_OPTIONS,
                ...(paperPresetFromSearch || {}),
              },
              visualOptions: {
                ...LAB_DEFAULT_VISUAL_OPTIONS,
                ...visualDefaultsFromSearch,
              },
              brightnessProfile: cloneBrightnessProfile(labState.brightnessProfile),
              studioPayload: studioPayloadFromSearch,
            },
          ],
        };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.presets)) {
        throw new Error("invalid preset store");
      }
      return parsed;
    } catch (_error) {
      return {
        defaultPresetName: "Scott Default",
        presets: [
          {
            name: "Scott Default",
            globals: { ...LAB_DEFAULT_GLOBALS },
            paperOptions: {
              ...LAB_DEFAULT_PAPER_OPTIONS,
              ...(paperPresetFromSearch || {}),
            },
            visualOptions: {
              ...LAB_DEFAULT_VISUAL_OPTIONS,
              ...visualDefaultsFromSearch,
            },
            brightnessProfile: cloneBrightnessProfile(labState.brightnessProfile),
            studioPayload: studioPayloadFromSearch,
          },
        ],
      };
    }
  }

  function writePresetStore(store) {
    try {
      window.localStorage.setItem(LAB_PRESETS_STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function buildCurrentStudioPayload() {
    if (!labState.studioState) {
      return null;
    }
    return {
      v: 3,
      s: labState.studioState.selectedFaceId,
      d: labState.studioState.sides.map((side) => ({
        id: side.id,
        mode: side.hatchMode,
        p: [
          Number(side.hatchSpacing.toFixed(2)),
          Number(side.circleSpacing.toFixed(2)),
        ],
        c: side.hatchColor || null,
      })),
    };
  }

  let frameColorInput = null;
  let backgroundColorInput = null;
  let cubeFillColorInput = null;

  function applyPresetSnapshot(preset, rerender = true) {
    if (!preset) {
      return;
    }
    const globals = preset.globals || {};
    const globalKeys = [
      "hatchWidth",
      "hatchJitter",
      "hatchBend",
      "hatchEdgeInset",
      "hatchTrimRatio",
      "hatchMinVisible",
      "circleRadius",
      "circleJitter",
    ];
    for (const key of globalKeys) {
      if (Object.prototype.hasOwnProperty.call(globals, key)) {
        labGlobals[key] = globals[key];
      }
    }
    if (preset.paperOptions) {
      labState.paperOptions = {
        ...labState.paperOptions,
        ...preset.paperOptions,
      };
    }
    if (preset.brightnessProfile) {
      labState.brightnessProfile = normalizeBrightnessProfile(preset.brightnessProfile);
      applyBrightnessBinsToFaceSides();
      syncDebugStudioFromBrightnessProfile();
    }
    if (preset.visualOptions) {
      labState.visualOptions = {
        ...labState.visualOptions,
        frameColor: sanitizeHexColor(preset.visualOptions.frameColor, labState.visualOptions.frameColor),
        backgroundColor: sanitizeHexColor(preset.visualOptions.backgroundColor, labState.visualOptions.backgroundColor),
        cubeFillColor: sanitizeSvgColor(preset.visualOptions.cubeFillColor, labState.visualOptions.cubeFillColor),
        noiseEnabled: Boolean(preset.visualOptions.noiseEnabled),
        noiseOpacity: Math.min(0.6, Math.max(0, Number(preset.visualOptions.noiseOpacity ?? labState.visualOptions.noiseOpacity))),
        noiseFrequency: Math.min(3, Math.max(0.05, Number(preset.visualOptions.noiseFrequency ?? labState.visualOptions.noiseFrequency))),
        noiseOctaves: Math.min(5, Math.max(1, Math.round(Number(preset.visualOptions.noiseOctaves ?? labState.visualOptions.noiseOctaves)))),
        noiseSeed: Math.min(9999, Math.max(1, Math.round(Number(preset.visualOptions.noiseSeed ?? labState.visualOptions.noiseSeed)))),
      };
      exportVisualSettings.frameColor = labState.visualOptions.frameColor;
      exportVisualSettings.backgroundColor = labState.visualOptions.backgroundColor;
      exportVisualSettings.cubeFillColor = labState.visualOptions.cubeFillColor;
      exportVisualSettings.noiseEnabled = labState.visualOptions.noiseEnabled;
      exportVisualSettings.noiseOpacity = labState.visualOptions.noiseOpacity;
      exportVisualSettings.noiseFrequency = labState.visualOptions.noiseFrequency;
      exportVisualSettings.noiseOctaves = labState.visualOptions.noiseOctaves;
      exportVisualSettings.noiseSeed = labState.visualOptions.noiseSeed;
      applyLabBackgroundColor();
      if (frameColorInput) {
        frameColorInput.value = labState.visualOptions.frameColor;
      }
      if (backgroundColorInput) {
        backgroundColorInput.value = labState.visualOptions.backgroundColor;
      }
      if (cubeFillColorInput) {
        cubeFillColorInput.value = labState.visualOptions.cubeFillColor;
      }
    }
    if (preset.studioPayload && labState.studioState) {
      const temp = new URLSearchParams();
      temp.set("studio", encodeURIComponent(JSON.stringify(preset.studioPayload)));
      applyLabStudioFromSearch(labState.studioState, temp);
    }
    refreshSceneSliderUi();
    if (rerender && labParsedScene) {
      refreshFaceControls();
      renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    }
  }

  const presetSection = document.createElement("div");
  presetSection.style.cssText = "margin-top:16px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);";
  const presetTitle = document.createElement("div");
  presetTitle.style.cssText = "font-size:12px;color:#9aa7b7;margin-bottom:8px;";
  presetTitle.textContent = "Named Presets";
  const presetNameInput = document.createElement("input");
  presetNameInput.type = "text";
  presetNameInput.placeholder = "Preset name";
  presetNameInput.style.cssText = "width:100%;margin-bottom:8px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
  const presetSelect = document.createElement("select");
  presetSelect.style.cssText = "width:100%;margin-bottom:8px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
  const presetButtons = document.createElement("div");
  presetButtons.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";

  const savePresetBtn = document.createElement("button");
  savePresetBtn.type = "button";
  savePresetBtn.textContent = "Save";
  savePresetBtn.style.cssText = "padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#e6eef8;font-size:12px;cursor:pointer;";
  const loadPresetBtn = document.createElement("button");
  loadPresetBtn.type = "button";
  loadPresetBtn.textContent = "Load";
  loadPresetBtn.style.cssText = savePresetBtn.style.cssText;
  const setDefaultPresetBtn = document.createElement("button");
  setDefaultPresetBtn.type = "button";
  setDefaultPresetBtn.textContent = "Set Default";
  setDefaultPresetBtn.style.cssText = savePresetBtn.style.cssText;
  const deletePresetBtn = document.createElement("button");
  deletePresetBtn.type = "button";
  deletePresetBtn.textContent = "Delete";
  deletePresetBtn.style.cssText = "padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(180,60,60,0.22);color:#ffe5e5;font-size:12px;cursor:pointer;";

  let presetStore = readPresetStore();
  if (!writePresetStore(presetStore)) {
    updateStatus("Hatch lab", "Preset storage unavailable (localStorage write failed).");
  }

  function refreshSceneSliderUi() {
    for (const [key, ref] of sceneSliderRefs.entries()) {
      const value = Number(labGlobals[key]);
      if (!Number.isFinite(value)) continue;
      ref.inp.value = String(value);
      ref.valInput.value = formatSliderValue(ref.step, value);
    }
    if (labGlobals.hatchEdgeInset === null) {
      edgeInsetSlider.disabled = true;
      edgeInsetValueInput.disabled = true;
      edgeInsetValSpan.textContent = "auto";
      return;
    }
    const edge = Number(labGlobals.hatchEdgeInset);
    edgeInsetSlider.disabled = false;
    edgeInsetValueInput.disabled = false;
    edgeInsetSlider.value = String(edge);
    edgeInsetValueInput.value = edge.toFixed(1);
    edgeInsetValSpan.textContent = edge.toFixed(1);
  }

  function refreshPresetSelect() {
    const current = presetSelect.value;
    presetSelect.innerHTML = "";
    for (const preset of presetStore.presets) {
      const option = document.createElement("option");
      option.value = preset.name;
      option.textContent = preset.name === presetStore.defaultPresetName
        ? `${preset.name} (default)`
        : preset.name;
      presetSelect.appendChild(option);
    }
    if (presetStore.presets.some((preset) => preset.name === current)) {
      presetSelect.value = current;
    } else if (presetStore.defaultPresetName && presetStore.presets.some((preset) => preset.name === presetStore.defaultPresetName)) {
      presetSelect.value = presetStore.defaultPresetName;
    }
  }

  savePresetBtn.addEventListener("click", () => {
    const typedName = (presetNameInput.value || "").trim();
    const name = typedName || (presetSelect.value || "").trim();
    if (!name) {
      updateStatus("Hatch lab", "Enter a preset name first.");
      return;
    }
    const nextPreset = {
      name,
      globals: { ...labGlobals },
      paperOptions: { ...labState.paperOptions },
      visualOptions: { ...labState.visualOptions },
      brightnessProfile: cloneBrightnessProfile(labState.brightnessProfile),
      studioPayload: buildCurrentStudioPayload(),
    };
    const existingIndex = presetStore.presets.findIndex((preset) => preset.name === name);
    if (existingIndex >= 0) {
      presetStore.presets[existingIndex] = nextPreset;
    } else {
      presetStore.presets.push(nextPreset);
    }
    if (!writePresetStore(presetStore)) {
      updateStatus("Hatch lab", "Could not save preset to localStorage.");
      return;
    }
    refreshPresetSelect();
    presetSelect.value = name;
    presetNameInput.value = name;
    updateStatus("Hatch lab", `Preset '${name}' saved.`);
  });

  loadPresetBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    const preset = presetStore.presets.find((entry) => entry.name === name);
    if (!preset) {
      updateStatus("Hatch lab", "Select a preset to load.");
      return;
    }
    applyPresetSnapshot(preset, true);
    updateStatus("Hatch lab", `Preset '${name}' loaded.`);
  });

  setDefaultPresetBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) {
      return;
    }
    presetStore.defaultPresetName = name;
    if (!writePresetStore(presetStore)) {
      updateStatus("Hatch lab", "Could not persist default preset.");
      return;
    }
    refreshPresetSelect();
    presetSelect.value = name;
    updateStatus("Hatch lab", `Preset '${name}' set as default.`);
  });

  deletePresetBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) {
      return;
    }
    if (name === "Scott Default") {
      updateStatus("Hatch lab", "'Scott Default' is protected.");
      return;
    }
    presetStore.presets = presetStore.presets.filter((preset) => preset.name !== name);
    if (presetStore.defaultPresetName === name) {
      presetStore.defaultPresetName = "Scott Default";
    }
    if (!writePresetStore(presetStore)) {
      updateStatus("Hatch lab", "Could not persist preset deletion.");
      return;
    }
    refreshPresetSelect();
    updateStatus("Hatch lab", `Preset '${name}' deleted.`);
  });

  presetButtons.appendChild(savePresetBtn);
  presetButtons.appendChild(loadPresetBtn);
  presetButtons.appendChild(setDefaultPresetBtn);
  presetButtons.appendChild(deletePresetBtn);
  presetSection.appendChild(presetTitle);
  presetSection.appendChild(presetNameInput);
  presetSection.appendChild(presetSelect);
  presetSection.appendChild(presetButtons);

  const rerollSceneBtn = document.createElement("button");
  rerollSceneBtn.type = "button";
  rerollSceneBtn.textContent = "Re-roll Randomness";
  rerollSceneBtn.style.cssText = "padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#e6eef8;font-size:12px;cursor:pointer;";
  rerollSceneBtn.addEventListener("click", () => {
    labGlobals.hatchSeed = sanitizeIntegerSeed((labGlobals.hatchSeed || hatchExportSettings.seed) + 1, hatchExportSettings.seed);
    hatchExportSettings.seed = labGlobals.hatchSeed;
    SVG_EXPORT_STUDIO_GLOBALS.hatchSeed = labGlobals.hatchSeed;
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  });

  const copyParamsBtn = document.createElement("button");
  copyParamsBtn.type = "button";
  copyParamsBtn.textContent = "Copy Studio + Paper Params";
  copyParamsBtn.style.cssText = "padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(214,166,95,0.2);color:#f7ead6;font-size:12px;cursor:pointer;";
  copyParamsBtn.addEventListener("click", async () => {
    const gv = labGlobals;
    const parts = [
      `hatchWidth=${gv.hatchWidth.toFixed(2)}`,
      `hatchJitter=${gv.hatchJitter.toFixed(2)}`,
      `hatchBend=${gv.hatchBend.toFixed(2)}`,
      `hatchSeed=${Math.round(gv.hatchSeed)}`,
      `hatchTrimRatio=${gv.hatchTrimRatio.toFixed(2)}`,
      `hatchMinVisible=${gv.hatchMinVisible.toFixed(1)}`,
      `circleRadius=${gv.circleRadius.toFixed(2)}`,
      `circleJitter=${gv.circleJitter.toFixed(2)}`,
      `frameColor=${encodeURIComponent(labState.visualOptions.frameColor)}`,
      `bgColor=${encodeURIComponent(labState.visualOptions.backgroundColor)}`,
      `cubeFillColor=${encodeURIComponent(labState.visualOptions.cubeFillColor)}`,
      `noiseEnabled=${labState.visualOptions.noiseEnabled ? "1" : "0"}`,
      `noiseOpacity=${Number(labState.visualOptions.noiseOpacity).toFixed(3)}`,
      `noiseFrequency=${Number(labState.visualOptions.noiseFrequency).toFixed(3)}`,
      `noiseOctaves=${Math.round(Number(labState.visualOptions.noiseOctaves))}`,
      `noiseSeed=${Math.round(Number(labState.visualOptions.noiseSeed))}`,
    ];
    if (labState.studioState) {
      const payload = {
        v: 3,
        s: labState.studioState.selectedFaceId,
        d: labState.studioState.sides.map((side) => ({
          id: side.id,
          mode: side.hatchMode,
          p: [
            Number(side.hatchSpacing.toFixed(2)),
            Number(side.circleSpacing.toFixed(2)),
          ],
          c: side.hatchColor || null,
        })),
      };
      parts.push(`studio=${encodeURIComponent(JSON.stringify(payload))}`);
    }
    const encodedPreset = encodePaperPresetForUrl(labState.paperOptions);
    if (encodedPreset) {
      parts.push(`preset=${encodeURIComponent(encodedPreset)}`);
    }
    if (gv.hatchEdgeInset !== null) parts.push(`hatchEdgeInset=${gv.hatchEdgeInset.toFixed(1)}`);
    const paramStr = "?" + parts.join("&");
    window.lastLabGlobals = { ...gv };
    try {
      await navigator.clipboard.writeText(paramStr);
      updateStatus("Hatch lab", `Copied: ${paramStr}`);
    } catch (_e) {
      updateStatus("Hatch lab", `Params stored in window.lastLabGlobals — clipboard blocked.`);
    }
  });

  sceneActions.appendChild(rerollSceneBtn);
  sceneActions.appendChild(copyParamsBtn);

  const BTN_STYLE_DOWNLOAD = "padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#e6eef8;font-size:12px;cursor:pointer;";

  function serializeLabSvg() {
    return new XMLSerializer().serializeToString(svgNode);
  }

  function stripShadowLayersFromSvg(serializedSvg) {
    const SHADOW_GROUP_IDS = ["dropShadows", "dropShadowsDarkest", "faceShadows", "shadowDebugFill"];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(serializedSvg, "image/svg+xml");
      for (const id of SHADOW_GROUP_IDS) {
        const el = doc.getElementById(id);
        if (el) el.remove();
      }
      // Also strip any [data-layer="shadow"] or [data-layer="shadowDarkest"] etc.
      doc.querySelectorAll('[data-layer="shadow"],[data-layer="shadowDarkest"],[data-layer="faceShadow"],[data-layer="floorShadowDebugFill"],[data-layer="cubeShadowDebugFill"]').forEach((el) => el.remove());
      return new XMLSerializer().serializeToString(doc.documentElement);
    } catch (_error) {
      return serializedSvg;
    }
  }

  const downloadLabSvgBtn = document.createElement("button");
  downloadLabSvgBtn.type = "button";
  downloadLabSvgBtn.textContent = "Download SVG";
  downloadLabSvgBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  downloadLabSvgBtn.addEventListener("click", () => {
    const svg = serializeLabSvg();
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    downloadTextAsFile(svg, `camogli-studio-${timestamp}.svg`, "image/svg+xml;charset=utf-8");
    updateStatus("Studio SVG downloaded", "Full export including shadows.");
  });

  const downloadLabSvgNoShadowBtn = document.createElement("button");
  downloadLabSvgNoShadowBtn.type = "button";
  downloadLabSvgNoShadowBtn.textContent = "Download SVG (no shadows)";
  downloadLabSvgNoShadowBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  downloadLabSvgNoShadowBtn.addEventListener("click", () => {
    const svg = stripShadowLayersFromSvg(serializeLabSvg());
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    downloadTextAsFile(svg, `camogli-studio-noshadows-${timestamp}.svg`, "image/svg+xml;charset=utf-8");
    updateStatus("Studio SVG downloaded", "Export with drop shadows omitted.");
  });

  sceneActions.appendChild(downloadLabSvgBtn);
  sceneActions.appendChild(downloadLabSvgNoShadowBtn);

  const resetStudioStateBtn = document.createElement("button");
  resetStudioStateBtn.type = "button";
  resetStudioStateBtn.textContent = "Reset Saved State";
  resetStudioStateBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  resetStudioStateBtn.addEventListener("click", resetSavedState);
  sceneActions.appendChild(resetStudioStateBtn);

  const paperSection = document.createElement("div");
  paperSection.style.cssText = "margin-top:16px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);";
  const paperTitle = document.createElement("div");
  paperTitle.style.cssText = "font-size:12px;color:#9aa7b7;margin-bottom:8px;";
  paperTitle.textContent = "Paper Texture";
  paperSection.appendChild(paperTitle);

  function createPaperSlider(labelText, key, min, max, step, digits = 2) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;";
    lbl.textContent = labelText;
    const valSpan = document.createElement("span");
    valSpan.textContent = Number(labState.paperOptions[key]).toFixed(digits);
    lbl.appendChild(valSpan);
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(labState.paperOptions[key]);
    inp.style.width = "100%";
    inp.addEventListener("input", () => {
      const v = Number(inp.value);
      labState.paperOptions[key] = v;
      valSpan.textContent = v.toFixed(digits);
      if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return wrap;
  }

  function createPaperColor(labelText, key) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
    lbl.textContent = labelText;
    const inp = document.createElement("input");
    inp.type = "color";
    inp.value = String(labState.paperOptions[key]);
    inp.style.width = "100%";
    inp.addEventListener("input", () => {
      labState.paperOptions[key] = inp.value;
      if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return wrap;
  }

  function createPaperSelect(labelText, key, options) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
    lbl.textContent = labelText;
    const select = document.createElement("select");
    select.style.cssText = "width:100%;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
    options.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry;
      option.textContent = entry;
      select.appendChild(option);
    });
    select.value = String(labState.paperOptions[key] || options[0]);
    select.addEventListener("change", () => {
      labState.paperOptions[key] = select.value;
      if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(select);
    return wrap;
  }

  paperSection.appendChild(createPaperSlider("Seed A", "seedA", 1, 9999, 1, 0));
  paperSection.appendChild(createPaperSlider("Seed B", "seedB", 1, 9999, 1, 0));
  paperSection.appendChild(createPaperColor("Paper Color", "paperColor"));
  paperSection.appendChild(createPaperSlider("Fine Grain Frequency", "grainFreq", 0.2, 2.2, 0.01, 2));
  paperSection.appendChild(createPaperSlider("Fine Grain Opacity", "grainOpacity", 0, 0.8, 0.01, 2));
  paperSection.appendChild(createPaperSlider("Stain Frequency", "stainFreq", 0.005, 0.12, 0.001, 3));
  paperSection.appendChild(createPaperSlider("Stain Opacity", "stainOpacity", 0, 0.8, 0.01, 2));
  paperSection.appendChild(createPaperSlider("Blob Stain Frequency", "stainBlobFreq", 0.001, 0.03, 0.001, 3));
  paperSection.appendChild(createPaperSlider("Blob Stain Opacity", "stainBlobOpacity", 0, 0.9, 0.01, 2));
  paperSection.appendChild(createPaperSlider("Blob Stain Blur", "stainBlobBlur", 0, 10, 0.1, 1));
  paperSection.appendChild(createPaperSlider("Soft Blur", "softBlur", 0, 3, 0.05, 2));
  paperSection.appendChild(createPaperSlider("Contrast Slope", "contrast", 0.35, 1.4, 0.01, 2));
  paperSection.appendChild(createPaperSelect("Stain Mix Mode", "stainMixMode", ["multiply", "darken", "overlay", "soft-light", "hard-light", "screen"]));

  const appearanceSection = document.createElement("div");
  appearanceSection.style.cssText = "margin-top:16px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);";
  const appearanceTitle = document.createElement("div");
  appearanceTitle.style.cssText = "font-size:12px;color:#9aa7b7;margin-bottom:8px;";
  appearanceTitle.textContent = "Frame & Background";
  appearanceSection.appendChild(appearanceTitle);

  const frameColorWrap = document.createElement("div");
  frameColorWrap.style.marginBottom = "10px";
  const frameColorLabel = document.createElement("label");
  frameColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  frameColorLabel.textContent = "Margin Color";
  frameColorInput = document.createElement("input");
  frameColorInput.type = "color";
  frameColorInput.value = sanitizeHexColor(labState.visualOptions.frameColor, EXPORT_FRAME_COLOR);
  frameColorInput.style.width = "100%";
  frameColorInput.addEventListener("input", () => {
    labState.visualOptions.frameColor = sanitizeHexColor(frameColorInput.value, labState.visualOptions.frameColor);
    exportVisualSettings.frameColor = labState.visualOptions.frameColor;
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  });
  frameColorWrap.appendChild(frameColorLabel);
  frameColorWrap.appendChild(frameColorInput);

  const backgroundColorWrap = document.createElement("div");
  backgroundColorWrap.style.marginBottom = "10px";
  const backgroundColorLabel = document.createElement("label");
  backgroundColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  backgroundColorLabel.textContent = "Background Color";
  backgroundColorInput = document.createElement("input");
  backgroundColorInput.type = "color";
  backgroundColorInput.value = sanitizeHexColor(labState.visualOptions.backgroundColor, EXPORT_BACKGROUND_COLOR);
  backgroundColorInput.style.width = "100%";
  backgroundColorInput.addEventListener("input", () => {
    labState.visualOptions.backgroundColor = sanitizeHexColor(backgroundColorInput.value, labState.visualOptions.backgroundColor);
    exportVisualSettings.backgroundColor = labState.visualOptions.backgroundColor;
    applyLabBackgroundColor();
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  });
  backgroundColorWrap.appendChild(backgroundColorLabel);
  backgroundColorWrap.appendChild(backgroundColorInput);

  const cubeFillColorWrap = document.createElement("div");
  cubeFillColorWrap.style.marginBottom = "10px";
  const cubeFillColorLabel = document.createElement("label");
  cubeFillColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  cubeFillColorLabel.textContent = "Cube Fill Color (supports rgba)";
  cubeFillColorInput = document.createElement("input");
  cubeFillColorInput.type = "text";
  cubeFillColorInput.value = sanitizeSvgColor(labState.visualOptions.cubeFillColor, EXPORT_CUBE_FILL_COLOR);
  cubeFillColorInput.placeholder = "rgba(217, 217, 217, 0.7)";
  cubeFillColorInput.style.width = "100%";
  cubeFillColorInput.addEventListener("input", () => {
    const sanitized = sanitizeSvgColor(cubeFillColorInput.value, "");
    if (!sanitized) {
      cubeFillColorInput.setCustomValidity("Use #RRGGBB, #RRGGBBAA, rgb(), or rgba().");
      cubeFillColorInput.reportValidity();
      return;
    }
    cubeFillColorInput.setCustomValidity("");
    labState.visualOptions.cubeFillColor = sanitized;
    exportVisualSettings.cubeFillColor = labState.visualOptions.cubeFillColor;
    if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  });
  cubeFillColorWrap.appendChild(cubeFillColorLabel);
  cubeFillColorWrap.appendChild(cubeFillColorInput);

  appearanceSection.appendChild(frameColorWrap);
  appearanceSection.appendChild(backgroundColorWrap);
  appearanceSection.appendChild(cubeFillColorWrap);

  function createAppearanceSlider(labelText, key, min, max, step, digits = 2) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const lbl = document.createElement("label");
    lbl.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;";
    lbl.textContent = labelText;
    const valSpan = document.createElement("span");
    valSpan.textContent = Number(labState.visualOptions[key]).toFixed(digits);
    lbl.appendChild(valSpan);
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(labState.visualOptions[key]);
    inp.style.width = "100%";
    inp.addEventListener("input", () => {
      const value = Number(inp.value);
      labState.visualOptions[key] = value;
      exportVisualSettings[key] = value;
      valSpan.textContent = value.toFixed(digits);
      if (labParsedScene) renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return wrap;
  }

  function onSelectFace(faceId) {
    if (!labState.studioState) {
      return;
    }
    labState.studioState.selectedFaceId = faceId;
    refreshFaceControls();
    if (labParsedScene) {
      renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    }
  }

  function loadParsedScene(parsedScene) {
    labParsedScene = parsedScene;
    if (!labParsedScene) {
      return;
    }
    labGlobals.hatchSeed = sanitizeIntegerSeed(labParsedScene.hatchSeed, labGlobals.hatchSeed);
    hatchExportSettings.seed = labGlobals.hatchSeed;
    SVG_EXPORT_STUDIO_GLOBALS.hatchSeed = labGlobals.hatchSeed;
    labState.paperOptions.width = labParsedScene.width;
    labState.paperOptions.height = labParsedScene.height;
    labState.studioState = buildLabStudioState(labParsedScene);
    const defaultPreset = presetStore.presets.find((preset) => preset.name === presetStore.defaultPresetName)
      || presetStore.presets.find((preset) => preset.name === "Scott Default")
      || null;
    if (defaultPreset) {
      applyPresetSnapshot(defaultPreset, false);
    }
    applyLabStudioFromSearch(labState.studioState, searchParams);
    applyBrightnessBinsToFaceSides();
    syncDebugStudioFromBrightnessProfile();
    refreshPresetSelect();
    refreshFaceControls();
    renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
  }

  const globalAccordion = createAccordion("Global Hatch", true);
  globalAccordion.content.appendChild(sceneSlidersRoot);

  const sideAccordion = createAccordion("Selected Side", true);
  sideAccordion.content.appendChild(faceSection);

  const brightnessBinsAccordion = createAccordion("Brightness Bins", true);
  brightnessBinsAccordion.content.appendChild(brightnessBinsSection);

  const paperAccordion = createAccordion("Paper", false);
  paperAccordion.content.appendChild(paperSection);

  const appearanceAccordion = createAccordion("Appearance", false);
  appearanceAccordion.content.appendChild(appearanceSection);

  const presetAccordion = createAccordion("Presets", false);
  presetAccordion.content.appendChild(presetSection);

  const actionsAccordion = createAccordion("Actions", true);
  actionsAccordion.content.appendChild(sceneActions);

  const debugStudioAccordion = createAccordion("Hatching Debug", false);
  const debugStudioControls = document.createElement("div");

  const debugStudioSeedLabel = document.createElement("label");
  debugStudioSeedLabel.textContent = "Seed";
  debugStudioSeedLabel.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const debugStudioSeedInput = document.createElement("input");
  debugStudioSeedInput.type = "number";
  debugStudioSeedInput.min = "1";
  debugStudioSeedInput.step = "1";
  debugStudioSeedInput.value = String(debugStudioState.seed);
  debugStudioSeedInput.style.cssText = "width:92px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:4px 6px;";
  debugStudioSeedLabel.appendChild(debugStudioSeedInput);

  const debugStudioPayloadLabel = document.createElement("label");
  debugStudioPayloadLabel.textContent = "Studio Payload (JSON)";
  debugStudioPayloadLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin:8px 0 4px;";
  const debugStudioPayloadInput = document.createElement("textarea");
  debugStudioPayloadInput.value = debugStudioState.studioPayload;
  debugStudioPayloadInput.style.cssText = "width:100%;min-height:140px;resize:vertical;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;box-sizing:border-box;font:11px/1.35 ui-monospace, Menlo, monospace;";

  const debugStudioActions = document.createElement("div");
  debugStudioActions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;";

  const reloadDebugStudioBtn = document.createElement("button");
  reloadDebugStudioBtn.type = "button";
  reloadDebugStudioBtn.textContent = "Reload Debug Tab";
  reloadDebugStudioBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  reloadDebugStudioBtn.addEventListener("click", () => {
    debugStudioState.seed = Math.max(1, Math.round(Number(debugStudioSeedInput.value) || 1));
    debugStudioState.studioPayload = (debugStudioPayloadInput.value || "{}").trim() || "{}";
    reloadDebugStudioFrame();
    updateStatus("Hatch lab", "Hatching debug tab reloaded.");
  });

  const openDebugStudioBtn = document.createElement("button");
  openDebugStudioBtn.type = "button";
  openDebugStudioBtn.textContent = "Open in New Tab";
  openDebugStudioBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  openDebugStudioBtn.addEventListener("click", () => {
    debugStudioState.seed = Math.max(1, Math.round(Number(debugStudioSeedInput.value) || 1));
    debugStudioState.studioPayload = (debugStudioPayloadInput.value || "{}").trim() || "{}";
    const url = buildDebugStudioUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  });

  const copyDebugStudioUrlBtn = document.createElement("button");
  copyDebugStudioUrlBtn.type = "button";
  copyDebugStudioUrlBtn.textContent = "Copy Debug URL";
  copyDebugStudioUrlBtn.style.cssText = BTN_STYLE_DOWNLOAD;
  copyDebugStudioUrlBtn.addEventListener("click", async () => {
    debugStudioState.seed = Math.max(1, Math.round(Number(debugStudioSeedInput.value) || 1));
    debugStudioState.studioPayload = (debugStudioPayloadInput.value || "{}").trim() || "{}";
    const url = buildDebugStudioUrl();
    try {
      await navigator.clipboard.writeText(url);
      updateStatus("Hatch lab", "Debug studio URL copied.");
    } catch (_error) {
      updateStatus("Hatch lab", "Could not copy URL (clipboard blocked).");
    }
  });

  debugStudioActions.appendChild(reloadDebugStudioBtn);
  debugStudioActions.appendChild(copyDebugStudioUrlBtn);
  debugStudioActions.appendChild(openDebugStudioBtn);

  const debugSelectedDivider = document.createElement("div");
  debugSelectedDivider.style.cssText = "margin:12px 0 8px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);font-size:12px;color:#9aa7b7;";
  debugSelectedDivider.textContent = "Selected Rectangle / Side";

  const debugSelectedInfo = document.createElement("div");
  debugSelectedInfo.style.cssText = "font-size:12px;color:#d2dbe7;margin-bottom:8px;";
  debugSelectedInfo.textContent = "Selected: n/a";

  const debugModeWrap = document.createElement("div");
  debugModeWrap.style.cssText = "margin-bottom:8px;";
  const debugModeLabel = document.createElement("label");
  debugModeLabel.textContent = "Hatch Mode";
  debugModeLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const debugModeSelect = document.createElement("select");
  debugModeSelect.style.cssText = "width:100%;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;";
  ["none", "single", "cross"].forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    debugModeSelect.appendChild(option);
  });
  debugModeWrap.appendChild(debugModeLabel);
  debugModeWrap.appendChild(debugModeSelect);

  const debugColorWrap = document.createElement("div");
  debugColorWrap.style.cssText = "margin-bottom:8px;";
  const debugColorLabel = document.createElement("label");
  debugColorLabel.textContent = "Hatch Color";
  debugColorLabel.style.cssText = "display:block;font-size:12px;color:#d2dbe7;margin-bottom:4px;";
  const debugColorInput = document.createElement("input");
  debugColorInput.type = "text";
  debugColorInput.placeholder = "#111111 or rgba(...)";
  debugColorInput.style.cssText = "width:100%;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;box-sizing:border-box;";
  debugColorWrap.appendChild(debugColorLabel);
  debugColorWrap.appendChild(debugColorInput);

  function createDebugSideSlider(labelText, min, max, step) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "8px";
    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#d2dbe7;";
    const number = document.createElement("input");
    number.type = "number";
    number.min = String(min);
    number.max = String(max);
    number.step = String(step);
    number.style.cssText = "width:74px;background:#111822;color:#edf2f7;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:2px 4px;";
    label.appendChild(number);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.style.width = "100%";
    wrap.appendChild(label);
    wrap.appendChild(slider);
    return { wrap, slider, number, min, max };
  }

  const debugSpacing = createDebugSideSlider("Spacing", 0.2, 2.0, 0.05);
  const debugCircleSpacing = createDebugSideSlider("Circle Spacing", 0.2, 6.0, 0.1);

  function debugSelectedBinFromState(state) {
    const selected = state?.selectedSide || null;
    if (!selected) {
      return null;
    }
    const brightness = Number(selected.brightness);
    const brightnessValue = Number(selected.brightnessValue);
    const normalized = Number.isFinite(brightness)
      ? clamp01(brightness)
      : (Number.isFinite(brightnessValue) ? clamp01(brightnessValue > 1 ? brightnessValue / 10 : brightnessValue) : null);
    if (normalized === null) {
      return null;
    }
    return profileBinIndexFromBrightness(normalized);
  }

  syncDebugStudioFromBrightnessProfile = () => {
    withDebugStudioBridge((bridge) => {
      const binsPayload = {
        version: 1,
        bins: (labState?.brightnessProfile?.bins || []).map((row) => ({
          bin: Number(row?.bin),
          hatchMode: row?.hatchMode,
          hatchSpacing: Number(row?.hatchSpacing),
          circleSpacing: Number(row?.circleSpacing),
          hatchColor: row?.hatchColor || null,
        })),
      };
      if (typeof bridge.applyBrightnessProfile === "function") {
        bridge.applyBrightnessProfile(binsPayload);
        return;
      }
      const snapshot = bridge.getState();
      if (!snapshot || !Array.isArray(snapshot.sides) || snapshot.sides.length === 0) {
        return;
      }
      const previousSelected = snapshot.selectedSideId;
      for (const side of snapshot.sides) {
        const brightness = Number(side.brightness);
        const brightnessValue = Number(side.brightnessValue);
        const normalized = Number.isFinite(brightness)
          ? clamp01(brightness)
          : (Number.isFinite(brightnessValue) ? clamp01(brightnessValue > 1 ? brightnessValue / 10 : brightnessValue) : null);
        if (normalized === null) {
          continue;
        }
        const bin = profileBinIndexFromBrightness(normalized);
        const row = labState?.brightnessProfile?.bins?.[bin];
        if (!row) {
          continue;
        }
        bridge.setSelectedSide(side.id);
        const debugColor = row.hatchColor || "#111111";
        bridge.updateSelectedSide({
          hatchMode: row.hatchMode,
          hatchColor: debugColor,
          params: {
            hatchSpacing: row.hatchSpacing,
            circleSpacing: row.circleSpacing,
          },
        });
      }
      if (typeof previousSelected === "string" && previousSelected) {
        bridge.setSelectedSide(previousSelected);
      }
    });
  };

  function pushDebugSelectedPatch(patch) {
    withDebugStudioBridge((bridge) => {
      const state = bridge.getState();
      const bin = debugSelectedBinFromState(state);
      if (!Number.isInteger(bin)) {
        return;
      }
      const next = {};
      if (patch.hatchMode === "none" || patch.hatchMode === "single" || patch.hatchMode === "cross") {
        next.hatchMode = patch.hatchMode;
      }
      if (typeof patch.hatchColor === "string") {
        const sanitized = sanitizeSvgColor(patch.hatchColor.trim(), "");
        if (sanitized) {
          next.hatchColor = sanitized;
        }
      }
      if (patch.params && typeof patch.params === "object") {
        if (Number.isFinite(Number(patch.params.hatchSpacing))) {
          next.hatchSpacing = Math.max(0.2, Math.min(2, Number(patch.params.hatchSpacing)));
        }
        if (Number.isFinite(Number(patch.params.circleSpacing))) {
          next.circleSpacing = Math.max(0.2, Math.min(2, Number(patch.params.circleSpacing)));
        }
      }
      if (Object.keys(next).length === 0) {
        return;
      }
      selectedBrightnessBin = bin;
      updateBrightnessBinPatch(next);
    });
    refreshDebugSelectionControls();
  }

  debugModeSelect.addEventListener("change", () => {
    pushDebugSelectedPatch({ hatchMode: debugModeSelect.value });
  });

  debugColorInput.addEventListener("change", () => {
    pushDebugSelectedPatch({ hatchColor: (debugColorInput.value || "").trim() || "#111111" });
  });

  const bindDebugSlider = (controlKey, ui, digits = 2) => {
    const sync = (raw) => {
      const value = Math.max(ui.min, Math.min(ui.max, Number(raw)));
      ui.slider.value = String(value);
      ui.number.value = Number(value).toFixed(digits);
      pushDebugSelectedPatch({ params: { [controlKey]: value } });
    };
    ui.slider.addEventListener("input", () => sync(ui.slider.value));
    ui.number.addEventListener("change", () => sync(ui.number.value));
    ui.number.addEventListener("keydown", (event) => {
      if (event.key === "Enter") sync(ui.number.value);
    });
  };

  bindDebugSlider("hatchSpacing", debugSpacing, 2);
  bindDebugSlider("circleSpacing", debugCircleSpacing, 2);

  refreshDebugSelectionControls = () => {
    withDebugStudioBridge((bridge) => {
      const state = bridge.getState();
      const selected = state?.selectedSide || null;
      if (!selected) {
        debugSelectedInfo.textContent = "Selected: n/a";
        return;
      }
      const brightness = Number.isFinite(Number(selected.brightnessValue))
        ? Number(selected.brightnessValue)
        : Number(selected.brightness) * 10;
      debugSelectedInfo.textContent = `Selected: ${selected.id} | brightness ${brightness.toFixed(1)}`;
      const bin = debugSelectedBinFromState(state);
      if (Number.isInteger(bin)) {
        selectedBrightnessBin = bin;
        refreshBrightnessBinControls();
      }
      const row = Number.isInteger(bin) ? (labState?.brightnessProfile?.bins?.[bin] || null) : null;
      debugModeSelect.value = row?.hatchMode || selected.hatchMode || "single";
      debugColorInput.value = row?.hatchColor || selected.hatchColor || "#111111";
      const hatchSpacing = Number(row?.hatchSpacing ?? selected?.params?.hatchSpacing ?? 1);
      const circleSpacing = Number(row?.circleSpacing ?? selected?.params?.circleSpacing ?? 1);
      debugSpacing.slider.value = String(hatchSpacing);
      debugSpacing.number.value = hatchSpacing.toFixed(2);
      debugCircleSpacing.slider.value = String(circleSpacing);
      debugCircleSpacing.number.value = circleSpacing.toFixed(2);
    });
  };

  debugStudioControls.appendChild(debugStudioSeedLabel);
  debugStudioControls.appendChild(debugStudioPayloadLabel);
  debugStudioControls.appendChild(debugStudioPayloadInput);
  debugStudioControls.appendChild(debugStudioActions);
  debugStudioControls.appendChild(debugSelectedDivider);
  debugStudioControls.appendChild(debugSelectedInfo);
  debugStudioControls.appendChild(debugModeWrap);
  debugStudioControls.appendChild(debugColorWrap);
  debugStudioControls.appendChild(debugSpacing.wrap);
  debugStudioControls.appendChild(debugCircleSpacing.wrap);
  debugStudioAccordion.content.appendChild(debugStudioControls);

  sceneSection.appendChild(globalAccordion.details);
  sceneSection.appendChild(sideAccordion.details);
  sceneSection.appendChild(brightnessBinsAccordion.details);
  sceneSection.appendChild(paperAccordion.details);
  sceneSection.appendChild(appearanceAccordion.details);
  sceneSection.appendChild(presetAccordion.details);
  sceneSection.appendChild(actionsAccordion.details);
  sceneSection.appendChild(debugStudioAccordion.details);

  pane.appendChild(title);
  pane.appendChild(hint);
  pane.appendChild(sceneSection);

  container.appendChild(previewPane);
  container.appendChild(pane);

  // Restore canvas to container and fire global resize handler when studio closes
  function teardown() {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("message", onEmbeddedDebugMessage);
    studioActive = false;
    // Restore #app to its grid position
    container.style.position = "";
    container.style.inset = "";
    container.style.height = "";
    container.style.display = "";
    container.style.gridTemplateColumns = "";
    container.style.alignItems = "";
    container.style.justifyItems = "";
    container.style.alignContent = "";
    container.style.justifyContent = "";
    container.style.background = "";
    container.style.overflow = "";
    // Return canvas to #app
    container.appendChild(canvas3d);
    canvas3d.style.cssText = "";
    // Restore 3D sidebar
    const mainHud = document.querySelector("aside.hud");
    if (mainHud) mainHud.style.display = "";
    applyCanvasFrame();
  }

  function onResize() {
    if (studioGeneration !== myGeneration) return;
    if (currentView === "3d") {
      resizeCanvasToPane();
    }
    if (labParsedScene) {
      renderSvgHatch3DPreview(svgNode, labParsedScene, labGlobals, labState, onSelectFace);
    }
  }

  applyLabBackgroundColor();
  window.addEventListener("resize", onResize);

  if (initialParsedScene && initialParsedScene.faces?.length) {
    const sceneToLoad = noShadows ? stripShadowsFromParsedScene(initialParsedScene) : initialParsedScene;
    loadParsedScene(sceneToLoad);
    const shadowNote = noShadows ? " — shadows hidden" : "";
    updateStatus("Hatch lab", `Loaded ${initialParsedScene.faces.length} faces from latest export${shadowNote}.`);
  } else {
    const fallbackScene = window.lastCamogliSvgExport
      ? buildLabSceneFromExportData(window.lastCamogliSvgExport)
      : null;
    if (fallbackScene?.faces?.length) {
      const sceneToLoad = noShadows ? stripShadowsFromParsedScene(fallbackScene) : fallbackScene;
      loadParsedScene(sceneToLoad);
      const shadowNote = noShadows ? " — shadows hidden" : "";
      updateStatus("Hatch lab", `Loaded ${fallbackScene.faces.length} faces from last export${shadowNote}.`);
    } else {
      updateStatus("Hatch lab", "Export from 3D first, then studio opens with that scene.");
    }
  }

  // Start in sketch view; 3D renders on first switch
  switchToView("sketch");
}

function quadPoint(worldFace, u, v) {
  const p0 = worldFace[0].clone().lerp(worldFace[1], u);
  const p1 = worldFace[3].clone().lerp(worldFace[2], u);
  return p0.lerp(p1, v);
}

function buildCanvasLumaSampler(svgWidth, svgHeight) {
  const sourceCanvas = renderer.domElement;
  const offscreen = document.createElement("canvas");
  offscreen.width = sourceCanvas.width;
  offscreen.height = sourceCanvas.height;
  const context = offscreen.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  context.drawImage(sourceCanvas, 0, 0);
  const imageData = context.getImageData(0, 0, offscreen.width, offscreen.height).data;

  return (x, y) => {
    const nx = clamp01(x / Math.max(1, svgWidth));
    const ny = clamp01(y / Math.max(1, svgHeight));
    const px = Math.min(offscreen.width - 1, Math.max(0, Math.floor(nx * (offscreen.width - 1))));
    const py = Math.min(offscreen.height - 1, Math.max(0, Math.floor(ny * (offscreen.height - 1))));
    const idx = (py * offscreen.width + px) * 4;
    const r = imageData[idx] / 255;
    const g = imageData[idx + 1] / 255;
    const b = imageData[idx + 2] / 255;
    return clamp01(0.2126 * r + 0.7152 * g + 0.0722 * b);
  };
}

function buildFaceShadowCells(worldFace, mesh, meshes, width, height, lumaSampler, baseTone) {
  if (!lumaSampler) {
    return [];
  }

  const cells = [];
  const faceScreenArea = polygonArea(worldFace.map((point) => projectWorldToSvg(point, width, height)));
  const grid = Math.max(4, Math.min(11, Math.round(Math.sqrt(Math.max(1, faceScreenArea)) / 11)));
  const minCellArea = Math.max(0.2, faceScreenArea / Math.max(1, grid * grid) * 0.06);

  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const u0 = x / grid;
      const v0 = y / grid;
      const u1 = (x + 1) / grid;
      const v1 = (y + 1) / grid;
      const uc = (u0 + u1) * 0.5;
      const vc = (v0 + v1) * 0.5;

      const center = quadPoint(worldFace, uc, vc);
      const pA = quadPoint(worldFace, Math.min(0.98, uc + 0.18 / grid), vc);
      const pB = quadPoint(worldFace, uc, Math.min(0.98, vc + 0.18 / grid));

      const centerScreen = projectWorldToSvg(center, width, height);
      const pAScreen = projectWorldToSvg(pA, width, height);
      const pBScreen = projectWorldToSvg(pB, width, height);
      const sampledLuma = (
        lumaSampler(centerScreen.x, centerScreen.y)
        + lumaSampler(pAScreen.x, pAScreen.y)
        + lumaSampler(pBScreen.x, pBScreen.y)
      ) / 3;
      const shadowDelta = baseTone - sampledLuma;
      if (shadowDelta < 0.035) {
        continue;
      }
      const darkness = clamp01(shadowDelta / 0.44);

      const c00 = quadPoint(worldFace, u0, v0);
      const c10 = quadPoint(worldFace, u1, v0);
      const c11 = quadPoint(worldFace, u1, v1);
      const c01 = quadPoint(worldFace, u0, v1);

      const screenPolygon = [c00, c10, c11, c01].map((point) => projectWorldToSvg(point, width, height));
      if (polygonArea(screenPolygon) < minCellArea) {
        continue;
      }

      cells.push({
        points: screenPolygon.map((p) => ({ x: p.x, y: p.y })),
        darkness,
      });
    }
  }

  return cells;
}

function getPolygonClipping() {
  return window.polygonClipping || null;
}

function screenPointsToPcPolygon(screenPoints) {
  const sanitized = sanitizeScreenPolygon(screenPoints);
  if (!sanitized) {
    return null;
  }
  return [
    [
      sanitized.map((point) => [point.x, point.y]),
    ],
  ];
}

function pcRingToScreenPoints(ring) {
  return ring.map((point) => ({ x: point[0], y: point[1] }));
}

function polygonArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) * 0.5;
}

function multiPolygonToScreenPolygons(multiPolygon) {
  const polygons = [];
  if (!Array.isArray(multiPolygon)) {
    return polygons;
  }

  for (const polygon of multiPolygon) {
    if (!Array.isArray(polygon) || polygon.length === 0) {
      continue;
    }
    const outer = polygon[0];
    if (!Array.isArray(outer) || outer.length < 3) {
      continue;
    }
    const screenPoly = sanitizeScreenPolygon(pcRingToScreenPoints(outer));
    if (!screenPoly || polygonArea(screenPoly) < 4) {
      continue;
    }
    polygons.push(screenPoly);
  }

  return polygons;
}

function safePolygonOp(polygonClipping, operation, ...args) {
  try {
    return polygonClipping[operation](...args);
  } catch {
    return null;
  }
}

function simplifyPolylineRdp(points, epsilon) {
  if (!Array.isArray(points) || points.length <= 2) {
    return points ? points.slice() : [];
  }
  const start = points[0];
  const end = points[points.length - 1];
  let maxDistance = -1;
  let index = -1;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const denom = Math.max(1e-8, Math.sqrt(dx * dx + dy * dy));

  for (let i = 1; i < points.length - 1; i += 1) {
    const point = points[i];
    const distance = Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / denom;
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance <= epsilon || index < 0) {
    return [start, end];
  }

  const left = simplifyPolylineRdp(points.slice(0, index + 1), epsilon);
  const right = simplifyPolylineRdp(points.slice(index), epsilon);
  return left.slice(0, -1).concat(right);
}

function simplifyClosedScreenPolygon(points, epsilon = 2.2) {
  if (!Array.isArray(points) || points.length < 4) {
    return points;
  }
  const open = points.concat([points[0]]);
  const simplified = simplifyPolylineRdp(open, epsilon).slice(0, -1);
  return sanitizeScreenPolygon(simplified) || points;
}

function buildFaceVisibleUnion(clippedFaces) {
  const polygonClipping = getPolygonClipping();
  if (!polygonClipping) {
    return null;
  }
  let faceUnion = null;
  for (const face of clippedFaces) {
    for (const polygon of face.clippedScreenPolygons || []) {
      const poly = screenPointsToPcPolygon(polygon);
      if (!poly) {
        continue;
      }
      faceUnion = faceUnion ? (safePolygonOp(polygonClipping, "union", faceUnion, poly) || faceUnion) : poly;
    }
  }
  return faceUnion;
}

function withTemporaryShadowRenderState(includeShadows, callback) {
  const previousShadowMapEnabled = renderer.shadowMap.enabled;
  const previousKeyCastShadow = keyLight.castShadow;
  const meshStates = [];

  for (const object of sceneObjects) {
    const mesh = object?.mesh;
    if (!mesh || !mesh.isMesh) {
      continue;
    }
    meshStates.push({
      mesh,
      castShadow: mesh.castShadow,
      receiveShadow: mesh.receiveShadow,
    });
    if (!includeShadows) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
  }

  renderer.shadowMap.enabled = includeShadows;
  keyLight.castShadow = includeShadows;

  try {
    renderer.render(scene, camera);
    return callback();
  } finally {
    renderer.shadowMap.enabled = previousShadowMapEnabled;
    keyLight.castShadow = previousKeyCastShadow;
    for (const state of meshStates) {
      state.mesh.castShadow = state.castShadow;
      state.mesh.receiveShadow = state.receiveShadow;
    }
    renderer.render(scene, camera);
  }
}

function captureRendererPassImageData(sampleWidth, sampleHeight, includeShadows) {
  return withTemporaryShadowRenderState(includeShadows, () => {
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(renderer.domElement, 0, 0, sampleWidth, sampleHeight);
    return context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  });
}

function closeBinaryMask(mask, width, height) {
  const dilated = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let on = 0;
      for (let oy = -1; oy <= 1 && !on; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }
          if (mask[ny * width + nx]) {
            on = 1;
            break;
          }
        }
      }
      dilated[y * width + x] = on;
    }
  }

  const eroded = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let on = 1;
      for (let oy = -1; oy <= 1 && on; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || !dilated[ny * width + nx]) {
            on = 0;
            break;
          }
        }
      }
      eroded[y * width + x] = on;
    }
  }
  return eroded;
}

function filterBinaryMaskComponents(mask, width, height, minPixels) {
  const filtered = new Uint8Array(mask);
  const visited = new Uint8Array(mask.length);
  const queueX = [];
  const queueY = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (!filtered[startIndex] || visited[startIndex]) {
        continue;
      }
      let count = 0;
      const component = [];
      queueX.length = 0;
      queueY.length = 0;
      queueX.push(x);
      queueY.push(y);
      visited[startIndex] = 1;
      while (queueX.length > 0) {
        const cx = queueX.pop();
        const cy = queueY.pop();
        const idx = cy * width + cx;
        component.push(idx);
        count += 1;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) continue;
            const nx = cx + ox;
            const ny = cy + oy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
              continue;
            }
            const nidx = ny * width + nx;
            if (!filtered[nidx] || visited[nidx]) {
              continue;
            }
            visited[nidx] = 1;
            queueX.push(nx);
            queueY.push(ny);
          }
        }
      }
      if (count < minPixels) {
        for (const idx of component) {
          filtered[idx] = 0;
        }
      }
    }
  }
  return filtered;
}

function buildShadowMaskPcPolygon(mask, width, height, exportWidth, exportHeight) {
  const polygonClipping = getPolygonClipping();
  if (!polygonClipping) {
    return null;
  }
  const cellWidth = exportWidth / width;
  const cellHeight = exportHeight / height;
  const rectangles = [];

  for (let y = 0; y < height; y += 1) {
    let x = 0;
    while (x < width) {
      const index = y * width + x;
      if (!mask[index]) {
        x += 1;
        continue;
      }
      let end = x + 1;
      while (end < width && mask[y * width + end]) {
        end += 1;
      }
      rectangles.push([[
        [x * cellWidth, y * cellHeight],
        [end * cellWidth, y * cellHeight],
        [end * cellWidth, (y + 1) * cellHeight],
        [x * cellWidth, (y + 1) * cellHeight],
      ]]);
      x = end;
    }
  }

  if (rectangles.length === 0) {
    return null;
  }

  let unioned = null;
  const chunkSize = 120;
  for (let i = 0; i < rectangles.length; i += chunkSize) {
    const chunk = rectangles.slice(i, i + chunkSize);
    const chunkUnion = chunk.length === 1
      ? chunk[0]
      : safePolygonOp(polygonClipping, "union", ...chunk);
    if (!chunkUnion) {
      continue;
    }
    unioned = unioned ? (safePolygonOp(polygonClipping, "union", unioned, chunkUnion) || unioned) : chunkUnion;
  }
  return unioned;
}

function buildExperimentalRasterShadowExtraction(width, height, clippedFaces) {
  const polygonClipping = getPolygonClipping();
  if (!polygonClipping) {
    return null;
  }

  const sampleScale = Math.min(1, 360 / Math.max(width, height));
  const sampleWidth = Math.max(120, Math.round(width * sampleScale));
  const sampleHeight = Math.max(90, Math.round(height * sampleScale));
  const noShadowImage = captureRendererPassImageData(sampleWidth, sampleHeight, false);
  const withShadowImage = captureRendererPassImageData(sampleWidth, sampleHeight, true);
  if (!noShadowImage || !withShadowImage) {
    return null;
  }

  const mask = new Uint8Array(sampleWidth * sampleHeight);
  for (let i = 0; i < mask.length; i += 1) {
    const offset = i * 4;
    const noShadowLuma = (0.2126 * noShadowImage[offset] + 0.7152 * noShadowImage[offset + 1] + 0.0722 * noShadowImage[offset + 2]) / 255;
    const withShadowLuma = (0.2126 * withShadowImage[offset] + 0.7152 * withShadowImage[offset + 1] + 0.0722 * withShadowImage[offset + 2]) / 255;
    const delta = noShadowLuma - withShadowLuma;
    mask[i] = delta > shadowExportSettings.deltaThreshold ? 1 : 0;
  }

  const closedMask = closeBinaryMask(mask, sampleWidth, sampleHeight);
  const filteredMask = filterBinaryMaskComponents(
    closedMask,
    sampleWidth,
    sampleHeight,
    Math.max(8, Math.round(sampleWidth * sampleHeight * shadowExportSettings.minComponentRatio)),
  );
  const shadowMaskPoly = buildShadowMaskPcPolygon(filteredMask, sampleWidth, sampleHeight, width, height);
  if (!shadowMaskPoly) {
    return null;
  }

  const faceUnion = buildFaceVisibleUnion(clippedFaces);
  const cubeShadowPart = faceUnion ? safePolygonOp(polygonClipping, "intersection", shadowMaskPoly, faceUnion) : null;
  const floorShadowPart = faceUnion ? (safePolygonOp(polygonClipping, "difference", shadowMaskPoly, faceUnion) || shadowMaskPoly) : shadowMaskPoly;

  return {
    floorPolygons: multiPolygonToScreenPolygons(floorShadowPart)
      .map((polygon) => simplifyClosedScreenPolygon(polygon, shadowExportSettings.simplifyFloor))
      .filter((polygon) => polygon.length >= 3),
    cubePolygons: multiPolygonToScreenPolygons(cubeShadowPart)
      .map((polygon) => simplifyClosedScreenPolygon(polygon, shadowExportSettings.simplifyCube))
      .filter((polygon) => polygon.length >= 3),
    sampleWidth,
    sampleHeight,
  };
}

function buildShadowDebugFillLayer(floorPolygons, cubePolygons) {
  if (!shadowExportSettings.debugFillOverlay) {
    return "";
  }
  const floorFill = (floorPolygons || [])
    .filter((polygon) => polygon.length >= 3)
    .map((polygon) => `<polygon points="${pointsToSvgString(polygon)}" fill="${shadowExportSettings.debugFloorFill}" fill-opacity="${shadowExportSettings.debugFillOpacity}" stroke="none" data-layer="floorShadowDebugFill" />`)
    .join("\n");
  const cubeFill = (cubePolygons || [])
    .filter((polygon) => polygon.length >= 3)
    .map((polygon) => `<polygon points="${pointsToSvgString(polygon)}" fill="${shadowExportSettings.debugCubeFill}" fill-opacity="${shadowExportSettings.debugFillOpacity}" stroke="none" data-layer="cubeShadowDebugFill" />`)
    .join("\n");
  return `<g id="shadowDebugFill">${floorFill}\n${cubeFill}</g>`;
}

function clipFacesByScreenOcclusion(faces) {
  const polygonClipping = getPolygonClipping();
  if (!polygonClipping || faces.length === 0) {
    return faces
      .map((face) => {
        const polygon = sanitizeScreenPolygon(face.screenPoints);
        return polygon ? { ...face, clippedScreenPolygons: [polygon] } : null;
      })
      .filter(Boolean);
  }

  const nearToFar = faces.slice().sort((a, b) => a.depth - b.depth);
  const clippedFaces = [];
  let occlusion = null;

  for (const face of nearToFar) {
    const facePolygon = screenPointsToPcPolygon(face.screenPoints);
    if (!facePolygon) {
      continue;
    }
    let visiblePart = facePolygon;
    if (occlusion) {
      visiblePart = safePolygonOp(polygonClipping, "difference", facePolygon, occlusion);
      if (!visiblePart) {
        clippedFaces.push({
          ...face,
          clippedScreenPolygons: [sanitizeScreenPolygon(face.screenPoints)].filter(Boolean),
        });
        occlusion = safePolygonOp(polygonClipping, "union", occlusion, facePolygon) || occlusion;
        continue;
      }
    }

    const clippedScreenPolygons = multiPolygonToScreenPolygons(visiblePart);
    if (clippedScreenPolygons.length > 0) {
      clippedFaces.push({
        ...face,
        clippedScreenPolygons,
      });
    }

    occlusion = occlusion ? (safePolygonOp(polygonClipping, "union", occlusion, facePolygon) || occlusion) : facePolygon;
  }

  clippedFaces.sort((a, b) => b.depth - a.depth);
  const minimumExpected = Math.max(6, Math.floor(faces.length * 0.4));
  if (clippedFaces.length < minimumExpected) {
    return faces.map((face) => ({ ...face, clippedScreenPolygons: [face.screenPoints] }));
  }
  return clippedFaces;
}

function clipShadowsByFaceOcclusion(shadows, clippedFaces) {
  const polygonClipping = getPolygonClipping();
  if (!polygonClipping || shadows.length === 0) {
    return shadows
      .map((shadow) => {
        const polygon = sanitizeScreenPolygon(shadow.screenPoints);
        return polygon ? { ...shadow, clippedScreenPolygons: [polygon] } : null;
      })
      .filter(Boolean);
  }

  let faceOcclusion = null;
  for (const face of clippedFaces) {
    for (const polygon of face.clippedScreenPolygons || []) {
      const poly = screenPointsToPcPolygon(polygon);
      if (!poly) {
        continue;
      }
      faceOcclusion = faceOcclusion ? (safePolygonOp(polygonClipping, "union", faceOcclusion, poly) || faceOcclusion) : poly;
    }
  }

  const clippedShadows = [];
  for (const shadow of shadows) {
    const shadowPoly = screenPointsToPcPolygon(shadow.screenPoints);
    if (!shadowPoly) {
      continue;
    }
    const visiblePart = faceOcclusion ? (safePolygonOp(polygonClipping, "difference", shadowPoly, faceOcclusion) || shadowPoly) : shadowPoly;
    const clippedScreenPolygons = multiPolygonToScreenPolygons(visiblePart);
    if (clippedScreenPolygons.length === 0) {
      continue;
    }
    clippedShadows.push({
      ...shadow,
      clippedScreenPolygons,
    });
  }

  const minimumExpected = Math.max(8, Math.floor(shadows.length * 0.45));
  if (clippedShadows.length < minimumExpected) {
    return shadows.map((shadow) => ({ ...shadow, clippedScreenPolygons: [shadow.screenPoints] }));
  }

  return clippedShadows;
}

function clipFaceShadowCells(face) {
  const polygonClipping = getPolygonClipping();
  const cells = face.shadowCells || [];
  const visiblePolygons = face.clippedScreenPolygons || [];
  if (cells.length === 0 || visiblePolygons.length === 0) {
    return [];
  }
  if (!polygonClipping) {
    return cells;
  }

  let visibleUnion = null;
  for (const polygon of visiblePolygons) {
    const poly = screenPointsToPcPolygon(polygon);
    if (!poly) {
      continue;
    }
    visibleUnion = visibleUnion ? (safePolygonOp(polygonClipping, "union", visibleUnion, poly) || visibleUnion) : poly;
  }
  if (!visibleUnion) {
    return [];
  }

  const clipped = [];
  for (const cell of cells) {
    const cellPoly = screenPointsToPcPolygon(cell.points);
    if (!cellPoly) {
      continue;
    }
    const intersection = safePolygonOp(polygonClipping, "intersection", cellPoly, visibleUnion);
    if (!intersection) {
      clipped.push(cell);
      continue;
    }
    const polys = multiPolygonToScreenPolygons(intersection);
    for (const polygon of polys) {
      clipped.push({ points: polygon, darkness: cell.darkness });
    }
  }
  return clipped;
}

function convexHullXZ(points) {
  if (points.length <= 3) {
    return points.slice();
  }

  const sorted = points
    .slice()
    .sort((a, b) => (a.x === b.x ? a.z - b.z : a.x - b.x));

  const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function expandHullXZ(points, scale = 1.05, minOffset = 0.06) {
  if (!Array.isArray(points) || points.length < 3) {
    return points;
  }
  let cx = 0;
  let cz = 0;
  for (const p of points) {
    cx += p.x;
    cz += p.z;
  }
  cx /= points.length;
  cz /= points.length;

  return points.map((p) => {
    const dx = p.x - cx;
    const dz = p.z - cz;
    const len = Math.hypot(dx, dz);
    if (len < 0.0001) {
      return { ...p };
    }
    const targetLen = len * scale + minOffset;
    const factor = targetLen / len;
    return {
      x: cx + dx * factor,
      z: cz + dz * factor,
    };
  });
}

function buildShadowSamplePoints(vertices) {
  const samples = vertices.slice();

  // Include edge midpoints to better capture cast-shadow silhouette corners.
  for (const [a, b] of CUBE_EDGE_PAIRS) {
    const mid = vertices[a].clone().add(vertices[b]).multiplyScalar(0.5);
    samples.push(mid);
  }

  // Include face centers to stabilize hull when cubes are strongly tilted.
  for (const faceDef of CUBE_FACE_DEFS) {
    const center = faceDef.indices
      .map((index) => vertices[index])
      .reduce((acc, p) => acc.add(p.clone()), new THREE.Vector3())
      .multiplyScalar(0.25);
    samples.push(center);
  }

  const cubeCenter = averagePoint(vertices);
  samples.push(cubeCenter);
  return samples;
}

function buildCubeShadowStrengthMap(faces) {
  const map = new Map();
  for (const face of faces) {
    const current = map.get(face.cubeIndex) || {
      minBrightness: 1,
      maxShadowStrength: 0,
    };
    current.minBrightness = Math.min(current.minBrightness, clamp01(face.brightness));
    current.maxShadowStrength = Math.max(current.maxShadowStrength, clamp01(face.shadowStrength || 0));
    map.set(face.cubeIndex, current);
  }
  return map;
}

const DROP_SHADOW_HATCH_STYLE = 0.9;
const DROP_SHADOW_HATCH_PRESET = {
  brightness: 0.95,
  hatchWidth: 1.25,
  hatchJitter: 1.3,
  hatchBend: -0.02,
  hatchSpacing: 0.5,
  hatchTrimRatio: 0.6,
  hatchMinVisible: 12,
  circleSpacing: 0.5,
  circleRadius: 0.5,
  circleJitter: 0.68,
};

function buildShadowHatchStyleForPolygon(polygon, darkness = 0, densityScale = 1) {
  const dirs = hatchPrincipalDirections(polygon);
  const hatchDir = hatchNormalize(dirs?.principal || { x: 1, y: 0 });
  const sweepDir = hatchNormalize(dirs?.perpendicular || { x: 0, y: 1 });
  const brightness = clamp01(DROP_SHADOW_HATCH_PRESET.brightness);
  const area = Math.max(1, hatchPolygonArea(polygon));
  const shortSide = Math.max(1, Math.min(
    hatchPolygonBounds(polygon).maxX - hatchPolygonBounds(polygon).minX,
    hatchPolygonBounds(polygon).maxY - hatchPolygonBounds(polygon).minY,
  ));
  const spacingBase = Math.max(4.5, Math.sqrt(area) * 0.16 + shortSide * 0.08);
  const spacing = Math.max(4.0, spacingBase * Math.max(1, densityScale) * (1.15 - brightness * 0.25) * 1.8);

  return {
    hatchDir,
    sweepDir,
    style: {
      spacing,
      edgeInset: Math.min(0.5, shortSide * 0.12),
      stroke: "#141414",
      strokeOpacity: 0.05 + darkness * 0.08,
      hatchParams: {
        strokeWidth: DROP_SHADOW_HATCH_PRESET.hatchWidth,
        jitter: DROP_SHADOW_HATCH_PRESET.hatchJitter,
        bend: DROP_SHADOW_HATCH_PRESET.hatchBend,
        trimRatio: DROP_SHADOW_HATCH_PRESET.hatchTrimRatio,
        minVisible: DROP_SHADOW_HATCH_PRESET.hatchMinVisible,
      },
    },
  };
}

function buildDropShadowHatchedPolygonSvg(shadow, polygon, hatchStyle = DROP_SHADOW_HATCH_STYLE) {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return "";
  }
  const styleAmount = clamp01(hatchStyle);
  const { hatchDir, sweepDir, style: hatchStyleConfig } = buildShadowHatchStyleForPolygon(polygon, styleAmount, 1.1);

  const single = buildStudioPolygonHatchStrokeSvg(
    polygon,
    hatchStyleConfig,
    hatchDir,
    sweepDir,
    1,
  );

  return `<g data-layer="shadow" data-cube="${shadow.cubeIndex}" data-hatch-style="${styleAmount.toFixed(2)}">${single.svg}</g>`;
}

function buildDarkestShadowHatchedPolygonSvg(shadow, polygon, darkness, cubeStats) {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return "";
  }
  const { hatchDir, sweepDir, style: config } = buildShadowHatchStyleForPolygon(polygon, darkness, 0.85);

  const single = buildStudioPolygonHatchStrokeSvg(polygon, config, hatchDir, sweepDir, 1);
  return `<g data-layer="shadowDarkest" data-cube="${shadow.cubeIndex}" data-darkest-brightness="${cubeStats.minBrightness.toFixed(4)}" data-shadow-strength="${cubeStats.maxShadowStrength.toFixed(4)}">${single.svg}</g>`;
}

function buildFaceShadowCellHatchedSvg(face, cell) {
  const polygon = cell?.points;
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return "";
  }
  const darkness = clamp01(cell.darkness || 0);
  const { hatchDir, sweepDir, style: config } = buildShadowHatchStyleForPolygon(polygon, darkness, 0.75);

  const single = buildStudioPolygonHatchStrokeSvg(polygon, config, hatchDir, sweepDir, 1);
  return `<g data-layer="faceShadow" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-shadow="${darkness.toFixed(4)}">${single.svg}</g>`;
}

function cubeWorldVertices(cube) {
  const { mesh, edge } = cube;
  return CUBE_LOCAL_VERTICES.map((vertex) => (
    vertex.clone().multiplyScalar(edge).applyQuaternion(mesh.quaternion).add(mesh.position)
  ));
}

function buildVisibleFaceData(width, height) {
  const meshes = cubeObjects.map((cube) => cube.mesh);
  const faces = [];
  const lumaSampler = buildCanvasLumaSampler(width, height);

  for (let cubeIndex = 0; cubeIndex < cubeObjects.length; cubeIndex += 1) {
    const cube = cubeObjects[cubeIndex];
    const vertices = cubeWorldVertices(cube);

    for (const faceDef of CUBE_FACE_DEFS) {
      const worldFace = faceDef.indices.map((index) => vertices[index]);
      const faceCenter = averagePoint(worldFace);
      const worldNormal = faceDef.normal.clone().applyQuaternion(cube.mesh.quaternion).normalize();
      const cameraVector = camera.position.clone().sub(faceCenter);

      if (worldNormal.dot(cameraVector) <= 0) {
        continue;
      }

      if (!isFaceVisibleFromCamera(worldFace, faceCenter, cube.mesh, meshes)) {
        continue;
      }

      const screenPoints = worldFace.map((point) => projectWorldToSvg(point, width, height));
      const facePolygon = sanitizeScreenPolygon(screenPoints);
      if (!facePolygon) {
        continue;
      }
      const lightVisibilities = {
        key: faceLightVisibility(worldFace, faceCenter, worldNormal, cube.mesh, meshes, keyLight.position),
        fill: faceLightVisibility(worldFace, faceCenter, worldNormal, cube.mesh, meshes, fillLight.position),
        rim: faceLightVisibility(worldFace, faceCenter, worldNormal, cube.mesh, meshes, rimLight.position),
      };
      const brightness = computeFaceBrightness(worldNormal, faceCenter, lightVisibilities);
      const shadowStrength = clamp01(1 - (lightVisibilities.key * 0.82 + lightVisibilities.fill * 0.12 + lightVisibilities.rim * 0.06));
      const baseTone = clamp01(0.3 + brightness * 0.68);
      const shadowCells = buildFaceShadowCells(worldFace, cube.mesh, meshes, width, height, lumaSampler, baseTone);

      faces.push({
        cubeIndex,
        faceName: faceDef.name,
        brightness,
        shadowStrength,
        lightVisibilities,
        shadowCells,
        worldPoints: worldFace.map((point) => ({ x: point.x, y: point.y, z: point.z })),
        screenPoints: facePolygon,
        depth: faceCenter.distanceToSquared(camera.position),
      });
    }
  }

  faces.sort((a, b) => b.depth - a.depth);
  return faces;
}

function buildShadowData(width, height) {
  const targetPos = new THREE.Vector3();
  keyLight.target.getWorldPosition(targetPos);
  const lightDirection = targetPos.sub(keyLight.position).normalize();
  if (Math.abs(lightDirection.y) < 0.0001) {
    return [];
  }

  const shadows = [];

  for (let cubeIndex = 0; cubeIndex < cubeObjects.length; cubeIndex += 1) {
    const cube = cubeObjects[cubeIndex];
    const vertices = cubeWorldVertices(cube);
    const shadowSamples = buildShadowSamplePoints(vertices);
    const groundPoints = [];

    for (const sample of shadowSamples) {
      const t = (SHADOW_PLANE_Y - sample.y) / lightDirection.y;
      const hit = sample.clone().addScaledVector(lightDirection, t);
      groundPoints.push({ x: hit.x, z: hit.z });
    }

    if (groundPoints.length < 3) {
      continue;
    }

    const hull = expandHullXZ(convexHullXZ(groundPoints));
    const worldHull = hull.map((point) => new THREE.Vector3(point.x, SHADOW_PLANE_Y + 0.002, point.z));
    const screenHull = worldHull.map((point) => projectWorldToSvg(point, width, height));
    const shadowPolygon = sanitizeScreenPolygon(screenHull);
    if (!shadowPolygon) {
      continue;
    }

    shadows.push({
      cubeIndex,
      worldPoints: worldHull.map((point) => ({ x: point.x, y: point.y, z: point.z })),
      screenPoints: shadowPolygon,
      depth: cube.mesh.position.distanceToSquared(camera.position),
    });
  }

  shadows.sort((a, b) => b.depth - a.depth);
  return shadows;
}

const PAPER_BG_PRESET_STORAGE_KEY = "paperBackgroundDebugPreset.v1";

function readPaperBackgroundPresetFromStorage() {
  try {
    const raw = window.localStorage.getItem(PAPER_BG_PRESET_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function buildPaperBackgroundForExport(width, height) {
  const fallback = {
    defs: "",
    content: `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />`,
  };

  if (typeof window === "undefined" || typeof window.PaperBackgroundTexture !== "function") {
    return fallback;
  }

  try {
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const savedPreset = readPaperBackgroundPresetFromStorage() || {};

    const texture = new window.PaperBackgroundTexture(tempSvg, {
      ...savedPreset,
      width,
      height,
    });
    texture.render();

    const defsNode = tempSvg.querySelector("defs");
    const rootGroup = tempSvg.querySelector("#paperTextureRoot");
    if (!rootGroup) {
      return fallback;
    }

    return {
      defs: defsNode ? defsNode.innerHTML : "",
      content: rootGroup.outerHTML,
    };
  } catch (_error) {
    return fallback;
  }
}

function buildSceneSvgExport() {
  return withSeededMathRandom(hatchExportSettings.seed, () => {
  const width = Math.max(640, Math.round(renderer.domElement.clientWidth || window.innerWidth || 1600));
  const height = Math.max(360, Math.round(renderer.domElement.clientHeight || window.innerHeight || 900));
  renderer.render(scene, camera);
  const rawFaces = buildVisibleFaceData(width, height);
  const rawShadows = buildShadowData(width, height);
  const faces = clipFacesByScreenOcclusion(rawFaces);
  const faceBrightnessNormalization = buildFaceBrightnessNormalization(faces);
  const brightnessProfile = readExportBrightnessProfileFromStorage();
  const shadows = clipShadowsByFaceOcclusion(rawShadows, faces);
  syncShadowSettingsFromUi();
  const rasterShadows = shadowExportSettings.useRaster ? buildExperimentalRasterShadowExtraction(width, height, faces) : null;

  const hatchedFaces = [];
  const clipDefs = [];
  const hatchDebugFaces = [];
  faces.forEach((face, faceIndex) => {
    (face.clippedScreenPolygons || []).forEach((polygon, polygonIndex) => {
      const hatchedFace = buildHatchedFacePolygonSvg(face, polygon, faceIndex, polygonIndex, width, height, faceBrightnessNormalization, brightnessProfile);
      clipDefs.push(hatchedFace.defs);
      hatchedFaces.push(hatchedFace.content);
      if (hatchedFace.debug) {
        hatchDebugFaces.push(hatchedFace.debug);
      }
    });
  });

  const hatchDebugSummary = hatchDebugFaces.reduce((acc, item) => {
    acc.totalFaces += 1;
    acc.totalSegments += item.hatchSegments;
    acc.totalPrimary += item.hatchPrimary;
    acc.totalFallback += item.hatchFallback;
    acc.totalCircles += item.hatchCircles;
    if (item.hatchSegments <= 0 && item.hatchMode !== "none") {
      acc.facesWithoutSegments += 1;
      if (acc.examples.length < 12) {
        acc.examples.push(`${item.cubeIndex}:${item.faceName} p${item.polygonIndex} hb=${item.hatchBrightness.toFixed(2)} raw=${item.brightness.toFixed(2)} sh=${item.shadowStrength.toFixed(2)} m=${item.hatchMode}`);
      }
    }
    return acc;
  }, {
    totalFaces: 0,
    totalSegments: 0,
    totalPrimary: 0,
    totalFallback: 0,
    totalCircles: 0,
    facesWithoutSegments: 0,
    examples: [],
  });

  const shadowPolygons = rasterShadows
    ? rasterShadows.floorPolygons.map((polygon, index) => buildDropShadowHatchedPolygonSvg({ cubeIndex: `raster-${index}` }, polygon, DROP_SHADOW_HATCH_STYLE)).join("\n")
    : shadows.flatMap((shadow) => (
      (shadow.clippedScreenPolygons || []).map((polygon) => (
        buildDropShadowHatchedPolygonSvg(shadow, polygon, DROP_SHADOW_HATCH_STYLE)
      ))
    )).join("\n");

  const cubeShadowStrengthMap = buildCubeShadowStrengthMap(faces);
  const darkestShadowPolygons = rasterShadows ? "" : shadows.flatMap((shadow) => {
    const cubeStats = cubeShadowStrengthMap.get(shadow.cubeIndex);
    if (!cubeStats) {
      return [];
    }
    const darkness = clamp01((1 - cubeStats.minBrightness) * 0.72 + cubeStats.maxShadowStrength * 0.45);
    return (shadow.clippedScreenPolygons || []).map((polygon) => (
      buildDarkestShadowHatchedPolygonSvg(shadow, polygon, darkness, cubeStats)
    ));
  }).join("\n");

  const faceShadowPolygons = rasterShadows
    ? rasterShadows.cubePolygons.map((polygon, index) => buildFaceShadowCellHatchedSvg({ cubeIndex: `raster-${index}`, faceName: "raster" }, { points: polygon, darkness: 0.95 })).join("\n")
    : faces.flatMap((face) => (
      clipFaceShadowCells(face)
        .map((cell) => (
          buildFaceShadowCellHatchedSvg(face, cell)
        ))
    )).join("\n");

  const floorDebugPolygons = rasterShadows
    ? rasterShadows.floorPolygons
    : shadows.flatMap((shadow) => shadow.clippedScreenPolygons || []);
  const cubeDebugPolygons = rasterShadows
    ? rasterShadows.cubePolygons
    : faces.flatMap((face) => clipFaceShadowCells(face).map((cell) => cell.points));
  const shadowDebugFillLayer = buildShadowDebugFillLayer(floorDebugPolygons, cubeDebugPolygons);

  const exportFaces = faces.map((face) => ({
    ...face,
    shadowCellCount: face.shadowCells ? face.shadowCells.length : 0,
    shadowCells: undefined,
  }));

  const metadata = escapeXml(JSON.stringify({
    camera: getCurrentView(),
    width,
    height,
    hatchDebugFlags: {
      debugExportHatch: DEBUG_EXPORT_HATCH,
      debugExportHatchLabels: DEBUG_EXPORT_HATCH_LABELS,
      debugExportHatchVerbose: DEBUG_EXPORT_HATCH_VERBOSE,
    },
    hatchDebugSummary,
    shadowDetection: rasterShadows ? "raster-experimental" : "geometry",
    faceBrightnessNormalization,
    shadowDebugFillOverlay: shadowExportSettings.debugFillOverlay,
    shadowSettings: {
      useRaster: shadowExportSettings.useRaster,
      deltaThreshold: shadowExportSettings.deltaThreshold,
      minComponentRatio: shadowExportSettings.minComponentRatio,
      simplifyFloor: shadowExportSettings.simplifyFloor,
      simplifyCube: shadowExportSettings.simplifyCube,
    },
    hatchSeed: hatchExportSettings.seed,
    shadowLab: {
      floorPolygons: floorDebugPolygons,
      cubePolygons: cubeDebugPolygons,
    },
    hatchDebugFaces: DEBUG_EXPORT_HATCH_VERBOSE ? hatchDebugFaces : undefined,
    rawFaces,
    rawShadows,
    faces: exportFaces,
    shadows,
  }));

  const hatchDebugOverlay = DEBUG_EXPORT_HATCH
    ? `<g id="hatchDebugOverlay"><rect x="10" y="10" width="530" height="68" fill="#ffffff" opacity="0.82" /><text x="18" y="30" fill="#111111" font-size="12" font-family="ui-monospace, Menlo, monospace">hatch debug: faces=${hatchDebugSummary.totalFaces} seg=${hatchDebugSummary.totalSegments} primary=${hatchDebugSummary.totalPrimary} fallback=${hatchDebugSummary.totalFallback} circles=${hatchDebugSummary.totalCircles}</text><text x="18" y="49" fill="#111111" font-size="12" font-family="ui-monospace, Menlo, monospace">no-segment(non-none)=${hatchDebugSummary.facesWithoutSegments}</text><text x="18" y="66" fill="#111111" font-size="11" font-family="ui-monospace, Menlo, monospace">${escapeXml((hatchDebugSummary.examples[0] || "example: none"))}</text></g>`
    : "";

  const paperBackground = buildPaperBackgroundForExport(width, height);
  const frameParts = buildSvgFrameParts(width, height, "exportFrame", exportVisualSettings);
  const noiseParts = buildSvgNoiseLayer(width, height, "export", exportVisualSettings);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${paperBackground.defs}\n${clipDefs.join("\n")}\n${frameParts.defs}\n${noiseParts.defs}</defs>
${frameParts.background}
${frameParts.before}
<g id="paperAgedArtwork" filter="url(#paperDirtyObjectFilter)">
${paperBackground.content}
${shadowDebugFillLayer}
<g id="dropShadows">${shadowPolygons}</g>
<g id="dropShadowsDarkest">${darkestShadowPolygons}</g>
<g id="cubeFaces">${hatchedFaces.join("\n")}</g>
<g id="faceShadows">${faceShadowPolygons}</g>
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" opacity="0.42" filter="url(#paperDirtyObjectFilter)" style="mix-blend-mode:multiply" pointer-events="none" />
</g>
${noiseParts.content}
${frameParts.after}
${frameParts.overlay}
${hatchDebugOverlay}
<metadata>${metadata}</metadata>
</svg>`;

  return {
    svg,
    data: {
      camera: getCurrentView(),
      width,
      height,
      rawFaces,
      rawShadows,
      faces: exportFaces,
      shadows,
      floorShadowPolygons: floorDebugPolygons,
      cubeShadowPolygons: cubeDebugPolygons,
      hatchSeed: hatchExportSettings.seed,
    },
  };
  });
}

function downloadTextAsFile(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

let fxFinalArtRendered = false;

function finalizeFxhashArtwork(reason = "settled") {
  if (!FXHASH_AUTO_FINALIZE || fxFinalArtRendered) {
    return;
  }
  try {
    const { svg, data } = buildSceneSvgExport();
    window.lastCamogliSvgMarkup = svg;
    window.lastCamogliSvgExport = data;

    if (container) {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.inset = "0";
      host.style.display = "grid";
      host.style.placeItems = "center";
      host.style.background = "#ffffff";
      host.innerHTML = svg;
      const svgEl = host.querySelector("svg");
      if (svgEl) {
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
        svgEl.style.display = "block";
        svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
      container.innerHTML = "";
      container.appendChild(host);
    }

    if (statusNode) {
      statusNode.innerHTML = `<strong>Final artwork ready</strong> - ${reason}; ${data.faces.length} faces, ${data.shadows.length} shadows.`;
    }

    if (typeof $fx?.preview === "function") {
      $fx.preview();
    }

    fxFinalArtRendered = true;
  } catch (error) {
    console.error("fxhash finalize failed", error);
    const detail = error instanceof Error ? error.message : String(error);
    updateStatus("Finalize failed", detail);
  }
}

function stripShadowsFromParsedScene(parsedScene) {
  if (!parsedScene) return parsedScene;
  return {
    ...parsedScene,
    shadowPolygons: [],
    floorShadowPolygons: [],
    cubeShadowPolygons: [],
  };
}

function exportSceneToSvgNoShadows() {
  try {
    if (cubeObjects.length < CUBE_COUNT) {
      updateStatus("Export blocked", `Wait for full spawn (${cubeObjects.length}/${CUBE_COUNT}).`);
      return;
    }
    const { svg, data } = buildSceneSvgExport();
    window.lastCamogliSvgMarkup = svg;
    window.lastCamogliSvgExport = data;
    if (!FXHASH_MODE) {
      const parsedScene = buildLabSceneFromExportData(data) || parseFacesFromExportedSvg(svg);
      if (parsedScene?.faces?.length) {
        initSvgHatchingLab(stripShadowsFromParsedScene(parsedScene), true);
      }
    }
    updateStatus("Studio opened (no shadows)", `${data.faces.length} visible faces, shadows hidden.`);
  } catch (error) {
    console.error("SVG export (no shadows) failed", error);
    const detail = error instanceof Error ? error.message : String(error);
    updateStatus("Export failed", `Could not build SVG from current camera view. ${detail}`);
  }
}

function exportSceneToSvg() {
  try {
    if (cubeObjects.length < CUBE_COUNT) {
      updateStatus("Export blocked", `Wait for full spawn (${cubeObjects.length}/${CUBE_COUNT}).`);
      return;
    }
    const { svg, data } = buildSceneSvgExport();
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    window.lastCamogliSvgMarkup = svg;
    downloadTextAsFile(svg, `camogli-cubes-${timestamp}.svg`, "image/svg+xml;charset=utf-8");
    window.lastCamogliSvgExport = data;
    if (!FXHASH_MODE) {
      const parsedScene = buildLabSceneFromExportData(data) || parseFacesFromExportedSvg(svg);
      if (parsedScene?.faces?.length) {
        initSvgHatchingLab(parsedScene);
      }
    }
    updateStatus("SVG exported", `${data.faces.length} visible faces and ${data.shadows.length} drop shadows.`);
  } catch (error) {
    console.error("SVG export failed", error);
    const detail = error instanceof Error ? error.message : String(error);
    updateStatus("Export failed", `Could not build SVG from current camera view. ${detail}`);
  }
}

function applyView(view) {
  camera.position.set(view.camera.x, view.camera.y, view.camera.z);
  controls.target.set(view.target.x, view.target.y, view.target.z);
  controls.update();
}

function getCurrentView() {
  return {
    camera: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    target: {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z,
    },
  };
}

function loadDefaultView() {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (!saved) {
      return FALLBACK_VIEW;
    }
    const parsed = JSON.parse(saved);
    if (!parsed?.camera || !parsed?.target) {
      return FALLBACK_VIEW;
    }
    return parsed;
  } catch (error) {
    return FALLBACK_VIEW;
  }
}

function saveCurrentViewAsDefault() {
  try {
    const view = getCurrentView();
    window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(view));
    updateStatus("View saved", "Current camera is now the default.");
  } catch (error) {
    updateStatus("Save failed", "Could not persist default view.");
  }
}

function animate(now) {
  if (freezeFrame) {
    renderer.render(scene, camera);
    return;
  }

  const deltaSeconds = Math.min((now - physicsStartedAt) / 1000, 1 / 30);
  physicsStartedAt = now;

  stepPhysics(deltaSeconds);
  controls.update();
  renderer.render(scene, camera);

  if (pendingLayoutRestore && spawnComplete && cubeObjects.length >= CUBE_COUNT) {
    let payload = null;
    try {
      const raw = window.localStorage.getItem(SCENE_LAYOUT_STORAGE_KEY);
      payload = raw ? JSON.parse(raw) : null;
    } catch (_error) {
      payload = null;
    }
    if (payload && applySettledLayout(payload)) {
      pendingLayoutRestore = false;
      updateStatus("Layout restored", "Scene frozen; tweak params and export variants.");
      return;
    }
    pendingLayoutRestore = false;
    updateStatus("Restore failed", "Saved layout is missing or incompatible.");
  }

  if (allCubesSleeping()) {
    settledSeconds += deltaSeconds;
  } else {
    settledSeconds = 0;
  }

  if (settledSeconds > 1.1) {
    freezeFrame = true;
    setWallDebugVisible(false);
    updateStatus("Frozen frame", "All cubes have settled.");
    renderer.render(scene, camera);
    finalizeFxhashArtwork("settled");
    return;
  }

  const elapsedSeconds = (now - simulationStartedAt) / 1000;
  if (elapsedSeconds > 18) {
    freezeFrame = true;
    setWallDebugVisible(false);
    updateStatus("Frozen frame", "Time limit reached; composition locked.");
    renderer.render(scene, camera);
    finalizeFxhashArtwork("time limit");
    return;
  }

  if (!spawnComplete) {
    updateStatus("Spawning", `${spawnedCount}/${CUBE_COUNT} cubes released.`);
    animationFrameId = window.requestAnimationFrame(animate);
    return;
  }

  const activeCount = cubeObjects.filter((object) => {
    const body = object.body;
    return body.sleepState !== CANNON.Body.SLEEPING && (body.velocity.lengthSquared() >= 0.025 || body.angularVelocity.lengthSquared() >= 0.02);
  }).length;
  updateStatus("Running physics", `${activeCount} cubes still moving.`);
  animationFrameId = window.requestAnimationFrame(animate);
}

function focusCamera() {
  applyView(loadDefaultView());
  renderer.render(scene, camera);
}

function resetScene() {
  window.location.reload();
}

function clearPersistedAppState() {
  if (!window.localStorage) {
    return;
  }
  for (const key of RESET_STATE_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {
      // continue clearing remaining keys
    }
  }
}

function resetSavedState() {
  clearPersistedAppState();
  const cleanPath = `${window.location.origin}${window.location.pathname}`;
  window.location.href = cleanPath;
}

window.addEventListener("resize", applyCanvasFrame);

resetButton?.addEventListener("click", resetScene);
resetStateButton?.addEventListener("click", resetSavedState);
focusButton?.addEventListener("click", focusCamera);
saveViewButton?.addEventListener("click", saveCurrentViewAsDefault);
saveLayoutButton?.addEventListener("click", saveSettledLayout);
restoreLayoutButton?.addEventListener("click", restoreSettledLayout);
toggleWallsButton?.addEventListener("click", () => {
  setWallDebugVisible(!wallsDebugVisible);
});
exportSvgButton?.addEventListener("click", exportSceneToSvg);
exportGrayscaleSvgButton?.addEventListener("click", exportGrayscaleSceneToSvg);
exportNoShadowSvgButton?.addEventListener("click", exportSceneToSvgNoShadows);

bindShadowSettingInputs();

// Expose camera state for debugging/persistence
window.getCameraState = () => getCurrentView();
window.exportCamogliSvg = exportSceneToSvg;
window.exportCamogliSvgNoShadows = exportSceneToSvgNoShadows;

if (DEBUG_SVG_HATCHING_LAB) {
  initSvgHatchingLab();
} else {
  buildScene();
  focusCamera();
  animationFrameId = window.requestAnimationFrame(animate);
}

// --- Grayscale SVG Export (legacy style) ---
function buildGrayscaleSceneSvgExport() {
  return withSeededMathRandom(hatchExportSettings.seed, () => {
  const width = Math.max(640, Math.round(renderer.domElement.clientWidth || window.innerWidth || 1600));
  const height = Math.max(360, Math.round(renderer.domElement.clientHeight || window.innerHeight || 900));
  renderer.render(scene, camera);
  const rawFaces = buildVisibleFaceData(width, height);
  const rawShadows = buildShadowData(width, height);
  const faces = clipFacesByScreenOcclusion(rawFaces);
  const shadows = clipShadowsByFaceOcclusion(rawShadows, faces);
  syncShadowSettingsFromUi();
  const rasterShadows = shadowExportSettings.useRaster ? buildExperimentalRasterShadowExtraction(width, height, faces) : null;

  const facePolygons = faces.flatMap((face) => (
    (face.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="${sanitizeSvgColor(exportVisualSettings.cubeFillColor, EXPORT_CUBE_FILL_COLOR)}" stroke="#151515" stroke-opacity="0.36" stroke-width="0.85" data-layer="face" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-brightness="${face.brightness.toFixed(4)}" data-shadow="${face.shadowStrength.toFixed(4)}" data-tone="${faceToneFromLight(face).toFixed(4)}" />`
    ))
  )).join("\n");

  const shadowPolygons = rasterShadows
    ? rasterShadows.floorPolygons.map((polygon, index) => buildDropShadowHatchedPolygonSvg({ cubeIndex: `raster-${index}` }, polygon, DROP_SHADOW_HATCH_STYLE)).join("\n")
    : shadows.flatMap((shadow) => (
      (shadow.clippedScreenPolygons || []).map((polygon) => (
        buildDropShadowHatchedPolygonSvg(shadow, polygon, DROP_SHADOW_HATCH_STYLE)
      ))
    )).join("\n");

  const cubeShadowStrengthMap = buildCubeShadowStrengthMap(faces);
  const darkestShadowPolygons = rasterShadows ? "" : shadows.flatMap((shadow) => {
    const cubeStats = cubeShadowStrengthMap.get(shadow.cubeIndex);
    if (!cubeStats) {
      return [];
    }
    const darkness = clamp01((1 - cubeStats.minBrightness) * 0.72 + cubeStats.maxShadowStrength * 0.45);
    return (shadow.clippedScreenPolygons || []).map((polygon) => (
      buildDarkestShadowHatchedPolygonSvg(shadow, polygon, darkness, cubeStats)
    ));
  }).join("\n");

  const faceShadowPolygons = rasterShadows
    ? rasterShadows.cubePolygons.map((polygon, index) => buildFaceShadowCellHatchedSvg({ cubeIndex: `raster-${index}`, faceName: "raster" }, { points: polygon, darkness: 0.95 })).join("\n")
    : faces.flatMap((face) => (
      clipFaceShadowCells(face)
        .map((cell) => (
          buildFaceShadowCellHatchedSvg(face, cell)
        ))
    )).join("\n");

  const floorDebugPolygons = rasterShadows
    ? rasterShadows.floorPolygons
    : shadows.flatMap((shadow) => shadow.clippedScreenPolygons || []);
  const cubeDebugPolygons = rasterShadows
    ? rasterShadows.cubePolygons
    : faces.flatMap((face) => clipFaceShadowCells(face).map((cell) => cell.points));
  const shadowDebugFillLayer = buildShadowDebugFillLayer(floorDebugPolygons, cubeDebugPolygons);

  const exportFaces = faces.map((face) => ({
    ...face,
    shadowCellCount: face.shadowCells ? face.shadowCells.length : 0,
    shadowCells: undefined,
  }));

  const metadata = escapeXml(JSON.stringify({
    camera: getCurrentView(),
    width,
    height,
    shadowDetection: rasterShadows ? "raster-experimental" : "geometry",
    shadowDebugFillOverlay: shadowExportSettings.debugFillOverlay,
    hatchSeed: hatchExportSettings.seed,
    rawFaces,
    rawShadows,
    faces: exportFaces,
    shadows,
  }));

  const paperBackground = buildPaperBackgroundForExport(width, height);
  const frameParts = buildSvgFrameParts(width, height, "grayscaleFrame", exportVisualSettings);
  const noiseParts = buildSvgNoiseLayer(width, height, "grayscale", exportVisualSettings);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${paperBackground.defs}\n${frameParts.defs}\n${noiseParts.defs}</defs>
${frameParts.background}
${frameParts.before}
<g id="paperAgedArtwork" filter="url(#paperDirtyObjectFilter)">
${paperBackground.content}
${shadowDebugFillLayer}
<g id="dropShadows">${shadowPolygons}</g>
<g id="dropShadowsDarkest">${darkestShadowPolygons}</g>
<g id="cubeFaces">${facePolygons}</g>
<g id="faceShadows">${faceShadowPolygons}</g>
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" opacity="0.42" filter="url(#paperDirtyObjectFilter)" style="mix-blend-mode:multiply" pointer-events="none" />
</g>
${noiseParts.content}
${frameParts.after}
${frameParts.overlay}
<metadata>${metadata}</metadata>
</svg>`;

  return {
    svg,
    data: {
      camera: getCurrentView(),
      width,
      height,
      rawFaces,
      rawShadows,
      faces: exportFaces,
      shadows,
      hatchSeed: hatchExportSettings.seed,
    },
  };
  });
}

function exportGrayscaleSceneToSvg() {
  try {
    if (cubeObjects.length < CUBE_COUNT) {
      updateStatus("Export blocked", `Wait for full spawn (${cubeObjects.length}/${CUBE_COUNT}).`);
      return;
    }
    const { svg, data } = buildGrayscaleSceneSvgExport();
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    downloadTextAsFile(svg, `camogli-cubes-grayscale-${timestamp}.svg`, "image/svg+xml;charset=utf-8");
    updateStatus("SVG exported", `${data.faces.length} visible faces and ${data.shadows.length} drop shadows.`);
  } catch (error) {
    console.error("SVG export failed", error);
    const detail = error instanceof Error ? error.message : String(error);
    updateStatus("Export failed", `Could not build SVG from current camera view. ${detail}`);
  }
}

// Grayscale export button is wired with the other controls above.
