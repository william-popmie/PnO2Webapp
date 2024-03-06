import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ShowCarScene = false;

const SCENE_BACKGROUND_COLOR = 0xffffff;
const CAMERA_FOV = 74;

// Add Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#bg"),
});

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 6;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);

// Set up camera
const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(130, 70, 50);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(80, 0, 50);
const gridHelper = new THREE.GridHelper(500, 50);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
const spotLight = new THREE.SpotLight(0xffa95c, 20);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;
scene.add(hemiLight, spotLight);

// Grid
function AddGrid() {
  const points = [];
  // Horizontal
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(150, 0, 0));
  points.push(new THREE.Vector3(150, 0, 30));
  points.push(new THREE.Vector3(0, 0, 30));
  points.push(new THREE.Vector3(0, 0, 60));
  points.push(new THREE.Vector3(150, 0, 60));
  points.push(new THREE.Vector3(150, 0, 90));
  points.push(new THREE.Vector3(0, 0, 90));
  //Vertical
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(30, 0, 0));
  points.push(new THREE.Vector3(30, 0, 90));
  points.push(new THREE.Vector3(60, 0, 90));
  points.push(new THREE.Vector3(60, 0, 0));
  points.push(new THREE.Vector3(90, 0, 0));
  points.push(new THREE.Vector3(90, 0, 90));
  points.push(new THREE.Vector3(120, 0, 90));
  points.push(new THREE.Vector3(120, 0, 0));
  points.push(new THREE.Vector3(150, 0, 0));
  points.push(new THREE.Vector3(150, 0, 90));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 100,
  });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

function AddPlane() {
  // Plane
  const planeGeometry = new THREE.PlaneGeometry(150 + 60, 90 + 60);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(150 / 2, -0.1, 90 / 2);
  scene.add(plane);
}

function AddPucks() {
  const puck = (cords, color) => {
    const topPuckGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1.8, 32);
    const bottomPuckGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 32);

    const puckMaterial = new THREE.MeshBasicMaterial({ color: color });
    const topPuck = new THREE.Mesh(topPuckGeometry, puckMaterial);
    const bottomPuck = new THREE.Mesh(bottomPuckGeometry, puckMaterial);

    topPuck.position.set(cords[0], cords[1] + 1.8, cords[2]);
    bottomPuck.position.set(cords[0], cords[1], cords[2]);

    scene.add(topPuck, bottomPuck);
  };

  puck([30, 0, 30], 0x45ff63);
}

if (ShowCarScene) {
  AddGrid();
  AddPlane();
  AddPucks();
}

// Models Importing
const gltfLoader = new GLTFLoader();

gltfLoader.load("public/floating_house/scene.gltf", (gltf) => {
  const mesh = gltf.scene;

  mesh.rotation.set(0, -Math.PI / 2, 0);
  mesh.position.set(0, 1.6, 0);
  mesh.scale.set(100, 100, 100);

  mesh.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
      if (n.material.map) n.material.map.anistropy = 16;
    }
  });

  scene.add(mesh);
});

spotLight.position.set(
  camera.position.x + 10,
  camera.position.y + 10,
  camera.position.z + 10
);

// Main Loop
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}

animate();
