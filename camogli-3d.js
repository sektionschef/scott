// --- Organic filledPath SVG hatching ---

function buildFilledPathSvg(start, end, options = {}) {
  // Options: {jitter, bend, width, color, strokeWidth, fill, opacity}
  // Defaults are chosen to match filledPath.js
  const jitter = options.jitter !== undefined ? options.jitter : getRandomFromInterval(0.3, 0.7);
  const bend = options.bend !== undefined ? options.bend : getRandomFromInterval(-0.05, 0.05);
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

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11151b);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(11, 9.5, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.9, 0);
controls.minDistance = 5;
controls.maxDistance = 26;
controls.maxPolarAngle = Math.PI * 0.495;
controls.update();

// Rembrandt: minimal ambient so shadows go deep
const ambient = new THREE.AmbientLight(0xd8cfc4, 0.28);
scene.add(ambient);

// Key light: warm, steep (70°), offset 30° to the left — one face blazing
const keyLight = new THREE.DirectionalLight(0xffe4b5, 4.2);
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
const fillLight = new THREE.DirectionalLight(0x7090c8, 0.18);
fillLight.position.set(10, 6, -8);
scene.add(fillLight);

// Rim: faint warm edge light from behind to silhouette the tower
const rimLight = new THREE.DirectionalLight(0xffa040, 0.32);
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
  ground: new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 0.98, metalness: 0.0 }),
  cube: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  cubeDark: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  cubeLight: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x65615d, roughness: 0.98, metalness: 0.01 }),
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
const CUBE_COUNT = 30;
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

  const grid = new THREE.GridHelper(28, 28, 0x707070, 0x404040);
  grid.position.y = 0.01;
  grid.material.opacity = 0.12;
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
    }
  }, 18000);
  updateStatus("Running physics", `${CUBE_COUNT} cubes still moving.`);
}

function updateStatus(state, detail) {
  if (!statusNode) return;
  statusNode.innerHTML = `<strong>${state}</strong>${detail ? ` - ${detail}` : ""}`;
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

function hatchStyleForFace(face, width, height) {
  const shortSide = Math.min(width, height);
  const tone = faceToneFromLight(face);
  const darkness = 1 - tone;
  const unit = Math.max(4, shortSide / 170);

  return {
    tone,
    background: grayHexFromTone(clamp01(0.68 + tone * 0.24)),
    stroke: grayHexFromTone(clamp01(0.08 + tone * 0.18)),
    strokeOpacity: (0.48 + darkness * 0.22).toFixed(3),
    strokeWidth: (0.9 + darkness * 0.45).toFixed(2),
    spacing: unit * (2.45 - darkness * 0.7),
    strokeLength: unit * (4.1 - darkness * 0.35),
    circleRadius: unit * (0.36 + darkness * 0.05),
    layers: hatchLayersForFace(face),
    outline: grayHexFromTone(clamp01(0.12 + tone * 0.12)),
  };
}


function buildHatchStrokeFieldSvg(rect, angle, spacing, strokeLength, stroke, strokeWidth, opacity, shortSide) {
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
      svg += buildFilledPathSvg(start, end, { color: stroke, strokeWidth, fill: stroke, opacity });
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
    return buildHatchStrokeFieldSvg(rect, 0, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  if (layer === "vertical") {
    return buildHatchStrokeFieldSvg(rect, Math.PI / 2, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  if (layer === "45") {
    return buildHatchStrokeFieldSvg(rect, Math.PI / 4, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  if (layer === "315") {
    return buildHatchStrokeFieldSvg(rect, -Math.PI / 4, style.spacing, style.strokeLength, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  if (layer === "circles") {
    return buildHatchCirclesSvg(rect, style.spacing, style.circleRadius, style.stroke, style.strokeWidth, style.strokeOpacity, shortSide);
  }
  return "";
}

function buildHatchedFacePolygonSvg(face, polygon, faceIndex, polygonIndex, width, height) {
  const clipId = `faceClip_${faceIndex}_${polygonIndex}`;
  const polygonPoints = pointsToSvgString(polygon);
  const rect = polygonBounds(polygon);
  const shortSide = Math.min(width, height);
  const style = hatchStyleForFace(face, width, height);
  const hatchSvg = style.layers.map((layer) => buildHatchLayerSvg(layer, rect, style, shortSide)).join("\n");

  return {
    defs: `<clipPath id="${clipId}"><polygon points="${polygonPoints}" /></clipPath>`,
    content: `<g data-layer="face" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-brightness="${face.brightness.toFixed(4)}" data-shadow="${face.shadowStrength.toFixed(4)}" data-tone="${style.tone.toFixed(4)}" data-hatch="${style.layers.join(" ")}"><polygon points="${polygonPoints}" fill="${style.background}" stroke="none" /><g clip-path="url(#${clipId})">${hatchSvg}</g><polygon points="${polygonPoints}" fill="none" stroke="${style.outline}" stroke-opacity="0.46" stroke-width="0.85" stroke-linejoin="round" /></g>`,
  };
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
    const cubeCenter = averagePoint(vertices);
    const topFaceCenter = vertices[7].clone().add(vertices[6]).add(vertices[2]).add(vertices[3]).multiplyScalar(0.25);
    const shadowSamples = vertices.concat([cubeCenter, topFaceCenter]);
    const groundPoints = [];

    for (const sample of shadowSamples) {
      const t = (SHADOW_PLANE_Y - sample.y) / lightDirection.y;
      const hit = sample.clone().addScaledVector(lightDirection, t);
      groundPoints.push({ x: hit.x, z: hit.z });
    }

    if (groundPoints.length < 3) {
      continue;
    }

    const hull = convexHullXZ(groundPoints);
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

function buildSceneSvgExport() {
  const width = Math.max(640, Math.round(renderer.domElement.clientWidth || window.innerWidth || 1600));
  const height = Math.max(360, Math.round(renderer.domElement.clientHeight || window.innerHeight || 900));
  renderer.render(scene, camera);
  const rawFaces = buildVisibleFaceData(width, height);
  const rawShadows = buildShadowData(width, height);
  const faces = clipFacesByScreenOcclusion(rawFaces);
  const shadows = clipShadowsByFaceOcclusion(rawShadows, faces);

  const hatchedFaces = [];
  const clipDefs = [];
  faces.forEach((face, faceIndex) => {
    (face.clippedScreenPolygons || []).forEach((polygon, polygonIndex) => {
      const hatchedFace = buildHatchedFacePolygonSvg(face, polygon, faceIndex, polygonIndex, width, height);
      clipDefs.push(hatchedFace.defs);
      hatchedFaces.push(hatchedFace.content);
    });
  });

  const shadowPolygons = shadows.flatMap((shadow) => (
    (shadow.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="#2a3038" opacity="0.34" stroke="none" data-layer="shadow" data-cube="${shadow.cubeIndex}" />`
    ))
  )).join("\n");

  const faceShadowPolygons = faces.flatMap((face) => (
    clipFaceShadowCells(face)
      .map((cell) => (
        `<polygon points="${pointsToSvgString(cell.points)}" fill="#1a1a1a" opacity="${(0.08 + cell.darkness * 0.34).toFixed(3)}" stroke="none" data-layer="faceShadow" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-shadow="${cell.darkness.toFixed(4)}" />`
      ))
  )).join("\n");

  const exportFaces = faces.map((face) => ({
    ...face,
    shadowCellCount: face.shadowCells ? face.shadowCells.length : 0,
    shadowCells: undefined,
  }));

  const metadata = escapeXml(JSON.stringify({
    camera: getCurrentView(),
    width,
    height,
    rawFaces,
    rawShadows,
    faces: exportFaces,
    shadows,
  }));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>${clipDefs.join("\n")}</defs>
<rect x="0" y="0" width="${width}" height="${height}" fill="#1b2129" />
<g id="dropShadows">${shadowPolygons}</g>
<g id="cubeFaces">${hatchedFaces.join("\n")}</g>
<g id="faceShadows">${faceShadowPolygons}</g>
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
    },
  };
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
    return;
  }

  const elapsedSeconds = (now - simulationStartedAt) / 1000;
  if (elapsedSeconds > 18) {
    freezeFrame = true;
    setWallDebugVisible(false);
    updateStatus("Frozen frame", "Time limit reached; composition locked.");
    renderer.render(scene, camera);
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});

resetButton?.addEventListener("click", resetScene);
focusButton?.addEventListener("click", focusCamera);
saveViewButton?.addEventListener("click", saveCurrentViewAsDefault);
toggleWallsButton?.addEventListener("click", () => {
  setWallDebugVisible(!wallsDebugVisible);
});
exportSvgButton?.addEventListener("click", exportSceneToSvg);

// Expose camera state for debugging/persistence
window.getCameraState = () => getCurrentView();
window.exportCamogliSvg = exportSceneToSvg;

buildScene();
focusCamera();
animationFrameId = window.requestAnimationFrame(animate);

// --- Grayscale SVG Export (legacy style) ---
function buildGrayscaleSceneSvgExport() {
  const width = Math.max(640, Math.round(renderer.domElement.clientWidth || window.innerWidth || 1600));
  const height = Math.max(360, Math.round(renderer.domElement.clientHeight || window.innerHeight || 900));
  renderer.render(scene, camera);
  const rawFaces = buildVisibleFaceData(width, height);
  const rawShadows = buildShadowData(width, height);
  const faces = clipFacesByScreenOcclusion(rawFaces);
  const shadows = clipShadowsByFaceOcclusion(rawShadows, faces);

  const facePolygons = faces.flatMap((face) => (
    (face.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="${grayHexFromTone(faceToneFromLight(face))}" stroke="#151515" stroke-opacity="0.36" stroke-width="0.85" data-layer="face" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-brightness="${face.brightness.toFixed(4)}" data-shadow="${face.shadowStrength.toFixed(4)}" data-tone="${faceToneFromLight(face).toFixed(4)}" />`
    ))
  )).join("\n");

  const shadowPolygons = shadows.flatMap((shadow) => (
    (shadow.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="#2a3038" opacity="0.34" stroke="none" data-layer="shadow" data-cube="${shadow.cubeIndex}" />`
    ))
  )).join("\n");

  const faceShadowPolygons = faces.flatMap((face) => (
    clipFaceShadowCells(face)
      .map((cell) => (
        `<polygon points="${pointsToSvgString(cell.points)}" fill="#1a1a1a" opacity="${(0.08 + cell.darkness * 0.34).toFixed(3)}" stroke="none" data-layer="faceShadow" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-shadow="${cell.darkness.toFixed(4)}" />`
      ))
  )).join("\n");

  const exportFaces = faces.map((face) => ({
    ...face,
    shadowCellCount: face.shadowCells ? face.shadowCells.length : 0,
    shadowCells: undefined,
  }));

  const metadata = escapeXml(JSON.stringify({
    camera: getCurrentView(),
    width,
    height,
    rawFaces,
    rawShadows,
    faces: exportFaces,
    shadows,
  }));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect x="0" y="0" width="${width}" height="${height}" fill="#1b2129" />
<g id="dropShadows">${shadowPolygons}</g>
<g id="cubeFaces">${facePolygons}</g>
<g id="faceShadows">${faceShadowPolygons}</g>
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
    },
  };
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

// Wire up the new grayscale export button
window.addEventListener("DOMContentLoaded", () => {
  const exportGrayscaleSvgButton = document.getElementById("exportGrayscaleSvgButton");
  if (exportGrayscaleSvgButton) {
    exportGrayscaleSvgButton.addEventListener("click", exportGrayscaleSceneToSvg);
  }
});
