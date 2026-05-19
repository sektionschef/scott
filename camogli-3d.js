import * as THREE from "./vendor/three/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "./vendor/cannon-es/cannon-es.js";

const container = document.getElementById("app");
const statusNode = document.getElementById("status");
const resetButton = document.getElementById("resetButton");
const focusButton = document.getElementById("focusButton");
const saveViewButton = document.getElementById("saveViewButton");
const toggleWallsButton = document.getElementById("toggleWallsButton");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x11151b, 6, 18);
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

// Expose camera state for debugging/persistence
window.getCameraState = () => getCurrentView();

buildScene();
focusCamera();
animationFrameId = window.requestAnimationFrame(animate);
