import * as THREE from "./vendor/three/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "./vendor/cannon-es/cannon-es.js";

const container = document.getElementById("app");
const statusNode = document.getElementById("status");
const resetButton = document.getElementById("resetButton");
const focusButton = document.getElementById("focusButton");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x11151b, 18, 42);
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

const ambient = new THREE.AmbientLight(0xf2efe8, 1.4);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.6);
keyLight.position.set(-8, 14, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 40;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8eb4ff, 0.85);
fillLight.position.set(10, 8, -8);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffcc88, 0.55);
rimLight.position.set(0, 5, -12);
scene.add(rimLight);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.allowSleep = true;
world.solver.iterations = 12;
world.defaultContactMaterial.friction = 0.88;
world.defaultContactMaterial.restitution = 0.01;

const materials = {
  ground: new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.96, metalness: 0.02 }),
  cube: new THREE.MeshStandardMaterial({ color: 0xd8c8b4, roughness: 0.78, metalness: 0.05 }),
  cubeDark: new THREE.MeshStandardMaterial({ color: 0x9d8d7a, roughness: 0.86, metalness: 0.02 }),
  cubeLight: new THREE.MeshStandardMaterial({ color: 0xe8ded2, roughness: 0.72, metalness: 0.06 }),
  obstacle: new THREE.MeshStandardMaterial({ color: 0x65615d, roughness: 0.98, metalness: 0.01 }),
};

const sceneObjects = [];
const cubeObjects = [];
let animationFrameId = 0;
let settledSeconds = 0;
let freezeFrame = false;
let physicsStartedAt = performance.now();
let simulationStartedAt = performance.now();
let freezeTimeoutId = 0;
const CUBE_COUNT = 30;

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

function makeCube(index) {
  const edge = 0.84 + ((index % 3) * 0.1);
  const body = new CANNON.Body({ mass: 1.4, material: new CANNON.Material("cube") });
  body.addShape(new CANNON.Box(new CANNON.Vec3(edge / 2, edge / 2, edge / 2)));
  body.position.set(
    (Math.random() - 0.5) * 4.4,
    4.8 + index * 0.34,
    (Math.random() - 0.5) * 3.4
  );
  body.quaternion.setFromEuler(
    Math.random() * Math.PI * 0.2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 0.2
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

  makeGround();

  for (let i = 0; i < CUBE_COUNT; i += 1) {
    makeCube(i);
  }

  settledSeconds = 0;
  freezeFrame = false;
  physicsStartedAt = performance.now();
  simulationStartedAt = performance.now();
  freezeTimeoutId = window.setTimeout(() => {
    if (!freezeFrame) {
      freezeFrame = true;
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
    updateStatus("Frozen frame", "All cubes have settled.");
    renderer.render(scene, camera);
    return;
  }

  const elapsedSeconds = (now - simulationStartedAt) / 1000;
  if (elapsedSeconds > 18) {
    freezeFrame = true;
    updateStatus("Frozen frame", "Time limit reached; composition locked.");
    renderer.render(scene, camera);
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
  controls.target.set(0, 1.5, 0.2);
  camera.position.set(11, 9.5, 13);
  controls.update();
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

buildScene();
focusCamera();
animationFrameId = window.requestAnimationFrame(animate);
