import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const threeCanvas = document.querySelector("#threeCanvas");

// -------------------------------------------------------------------------------------------
// RENDERER
// -------------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: threeCanvas,
});

function ConfigureRenderer() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.shadowMap.enabled = true;
}

function UpdateRenderer() {
  renderer.render(scene, camera);
}

// -------------------------------------------------------------------------------------------
// SCENNE
// -------------------------------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9f0ff);

// -------------------------------------------------------------------------------------------
// CAMERA
// -------------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(-200, 250, -200);

// -------------------------------------------------------------------------------------------
// MISCELANEOUS
// -------------------------------------------------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(100, 0, 80);
// const gridHelper = new THREE.GridHelper(500, 50);
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

function UpdateControls() {
  controls.update();
}

// -------------------------------------------------------------------------------------------
// LIGHTING
// -------------------------------------------------------------------------------------------

function ConfigureLighting() {
  // Hemisphere Light
  const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 3);

  // Spotlight
  const mainSpotLight = new THREE.SpotLight(0xfff8bf, 4);
  mainSpotLight.position.set(-10, 150, -150);
  mainSpotLight.castShadow = true;
  mainSpotLight.shadow.bias = -0.0001;
  mainSpotLight.shadow.mapSize.width = 1024 * 4;
  mainSpotLight.shadow.mapSize.height = 1024 * 4;

  // Rear Light
  const rearLight = new THREE.DirectionalLight(0xc1bfff, 1);
  rearLight.position.set(10, 150, -150);
  rearLight.shadow.bias = -0.0001;
  rearLight.shadow.mapSize.width = 1024 * 4;
  rearLight.shadow.mapSize.height = 1024 * 4;

  // Directional Light
  const directionalLight = new THREE.DirectionalLight(0xb3b5ff, 0.2);
  directionalLight.position.set(100, -1500, 1500);

  scene.add(hemiLight, mainSpotLight, rearLight, directionalLight);
}

// -------------------------------------------------------------------------------------------
// PLANE
// -------------------------------------------------------------------------------------------
const planeGeometry = new THREE.PlaneGeometry(220 + 20, 160 + 20);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.set(220 / 2, -0.8, 160 / 2);
scene.add(plane);

// -------------------------------------------------------------------------------------------
// EXTRA
// -------------------------------------------------------------------------------------------
const gltfLoader = new GLTFLoader();
const raycaster = new THREE.Raycaster();

function InitTHREESetup() {
  ConfigureRenderer();
  ConfigureLighting();
}

// -------------------------------------------------------------------------------------------
// EXPORT
// -------------------------------------------------------------------------------------------

export {
  InitTHREESetup,
  UpdateRenderer,
  UpdateControls,
  renderer,
  camera,
  scene,
  controls,
  plane,
  gltfLoader,
  raycaster,
  threeCanvas,
};
