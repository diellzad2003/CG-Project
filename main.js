import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);


const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 6, 18);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;


renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 4, 0);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.9);
scene.add(hemiLight);


const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
mainLight.position.set(10, 15, 10);
mainLight.castShadow = true;
scene.add(mainLight);


const floorSize = 50;
const wallHeight = 10;
const wallDepth = 30;
const wallWidth = 40;


const textureLoader = new THREE.TextureLoader();
const tileRepeat = 6;


const colorMap = textureLoader.load('/textures/floor/Leather004_2K-JPG_Color.jpg');
colorMap.colorSpace = THREE.SRGBColorSpace;

const normalMap = textureLoader.load('/textures/floor/Leather004_2K-JPG_NormalDX.jpg');


[colorMap, normalMap].forEach((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(tileRepeat, tileRepeat);
});


normalMap.flipY = true;

const floorMaterial = new THREE.MeshStandardMaterial({
  map: colorMap,
  normalMap: normalMap,
  roughness: 0.9,
  metalness: 0.0,
  color: new THREE.Color(0xffffff)
});


floorMaterial.color.multiplyScalar(1.2);


const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide
});


const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(floorSize, floorSize),
  floorMaterial
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);


const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallWidth, wallHeight),
  wallMaterial
);
backWall.position.set(0, wallHeight / 2, -wallDepth / 2);
backWall.receiveShadow = true;
scene.add(backWall);


const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallDepth, wallHeight),
  wallMaterial
);
leftWall.position.set(-wallWidth / 2, wallHeight / 2, 0);
leftWall.rotation.y = Math.PI / 2;
leftWall.receiveShadow = true;
scene.add(leftWall);


const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallDepth, wallHeight),
  wallMaterial
);
rightWall.position.set(wallWidth / 2, wallHeight / 2, 0);
rightWall.rotation.y = -Math.PI / 2;
rightWall.receiveShadow = true;
scene.add(rightWall);


const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(wallWidth, wallDepth),
  wallMaterial
);
ceiling.position.set(0, wallHeight, 0);
ceiling.rotation.x = Math.PI / 2;
ceiling.receiveShadow = true;
scene.add(ceiling);


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
