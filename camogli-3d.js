import * as THREE from "./vendor/three/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "./vendor/cannon-es/cannon-es.js";

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

function buildHatchDefs() {
  return `
  <defs>
    <pattern id="hatchBright" patternUnits="userSpaceOnUse" width="12" height="12">
      <rect width="12" height="12" fill="#f8f8f8" />
      <path d="M0,12 L12,12" stroke="#9a9a9a" stroke-width="0.6" opacity="0.25" />
    </pattern>
    <pattern id="hatchLight" patternUnits="userSpaceOnUse" width="12" height="12">
      <rect width="12" height="12" fill="#f3f3f3" />
      <path d="M0,12 L12,0" stroke="#636363" stroke-width="0.75" opacity="0.45" />
    </pattern>
    <pattern id="hatchMid" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="#ededed" />
      <path d="M0,10 L10,0" stroke="#4b4b4b" stroke-width="0.8" opacity="0.6" />
      <path d="M0,0 L10,10" stroke="#4b4b4b" stroke-width="0.8" opacity="0.4" />
    </pattern>
    <pattern id="hatchDark" patternUnits="userSpaceOnUse" width="9" height="9">
      <rect width="9" height="9" fill="#e6e6e6" />
      <path d="M0,9 L9,0" stroke="#2f2f2f" stroke-width="0.95" opacity="0.72" />
      <path d="M0,0 L9,9" stroke="#2f2f2f" stroke-width="0.95" opacity="0.55" />
      <circle cx="2.3" cy="2.3" r="0.8" fill="#262626" opacity="0.45" />
      <circle cx="6.8" cy="6.8" r="0.8" fill="#262626" opacity="0.45" />
    </pattern>
    <pattern id="hatchDeep" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill="#dadada" />
      <path d="M0,8 L8,0" stroke="#1e1e1e" stroke-width="1" opacity="0.88" />
      <path d="M0,0 L8,8" stroke="#1e1e1e" stroke-width="1" opacity="0.78" />
      <path d="M0,4 L8,4" stroke="#1e1e1e" stroke-width="0.65" opacity="0.55" />
      <path d="M4,0 L4,8" stroke="#1e1e1e" stroke-width="0.65" opacity="0.55" />
      <circle cx="2" cy="2" r="0.7" fill="#131313" opacity="0.65" />
      <circle cx="6" cy="6" r="0.7" fill="#131313" opacity="0.65" />
    </pattern>
    <pattern id="hatchShadow" patternUnits="userSpaceOnUse" width="7" height="7">
      <rect width="7" height="7" fill="#080a0d" />
      <path d="M0,7 L7,0" stroke="#000000" stroke-width="0.8" opacity="0.65" />
      <path d="M0,0 L7,7" stroke="#000000" stroke-width="0.8" opacity="0.35" />
    </pattern>
  </defs>`;
}

function buildSceneSvgExport() {
  const width = Math.max(640, Math.round(renderer.domElement.clientWidth || window.innerWidth || 1600));
  const height = Math.max(360, Math.round(renderer.domElement.clientHeight || window.innerHeight || 900));
  renderer.render(scene, camera);
  const rawFaces = buildVisibleFaceData(width, height);
  const rawShadows = buildShadowData(width, height);
  const faces = clipFacesByScreenOcclusion(rawFaces);
  const shadows = clipShadowsByFaceOcclusion(rawShadows, faces);

  const shadowPolygons = shadows.flatMap((shadow) => (
    (shadow.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="#2a3038" opacity="0.34" stroke="none" data-layer="shadow" data-cube="${shadow.cubeIndex}" />`
    ))
  )).join("\n");

  const facePolygons = faces.flatMap((face) => (
    (face.clippedScreenPolygons || []).map((polygon) => (
      `<polygon points="${pointsToSvgString(polygon)}" fill="${grayHexFromTone(faceToneFromLight(face))}" stroke="#151515" stroke-opacity="0.36" stroke-width="0.85" data-layer="face" data-cube="${face.cubeIndex}" data-face="${face.faceName}" data-brightness="${face.brightness.toFixed(4)}" data-shadow="${face.shadowStrength.toFixed(4)}" data-tone="${faceToneFromLight(face).toFixed(4)}" />`
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
