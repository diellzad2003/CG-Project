import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* Scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

/* Camera */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 6, 18);

/* Renderer */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* Controls */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 4, 0);

/* Lights */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
mainLight.position.set(10, 15, 10);
mainLight.castShadow = true;
scene.add(mainLight);

/* =====================
   DIMENSIONS
===================== */
const floorSize = 50;
const wallHeight = 10;
const wallDepth = 30;
const wallWidth = 40;

/* =====================
   MATERIALS
===================== */
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f5f5
});

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide
});

/* =====================
   FLOOR
===================== */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(floorSize, floorSize),
  floorMaterial
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

/* =====================
   BACK WALL (TALL)
===================== */
const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallWidth, wallHeight),
  wallMaterial
);
backWall.position.set(0, wallHeight / 2, -wallDepth / 2);
backWall.receiveShadow = true;
scene.add(backWall);

/* =====================
   LEFT WALL (TALL)
===================== */
const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallDepth, wallHeight),
  wallMaterial
);
leftWall.position.set(-wallWidth / 2, wallHeight / 2, 0);
leftWall.rotation.y = Math.PI / 2;
leftWall.receiveShadow = true;
scene.add(leftWall);

/* =====================
   RIGHT WALL (TALL)
===================== */
const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallDepth, wallHeight),
  wallMaterial
);
rightWall.position.set(wallWidth / 2, wallHeight / 2, 0);
rightWall.rotation.y = -Math.PI / 2;
rightWall.receiveShadow = true;
scene.add(rightWall);

/* =====================
   CEILING (TALL)
===================== */
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(wallWidth, wallDepth),
  wallMaterial
);
ceiling.position.set(0, wallHeight, 0);
ceiling.rotation.x = Math.PI / 2;
ceiling.receiveShadow = true;
scene.add(ceiling);

/* Resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* Animate */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
