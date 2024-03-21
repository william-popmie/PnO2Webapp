import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// -------------------------------------------------------------------------------------------
// THREEJS SETUP
// -------------------------------------------------------------------------------------------

const threeCanvas = document.querySelector("#threeCanvas");

// Add Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: threeCanvas,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Set up camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(0, 100, 0);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(80, 0, 50);
// const gridHelper = new THREE.GridHelper(500, 50);
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
const spotLight = new THREE.SpotLight(0xffa95c, 4);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;
scene.add(hemiLight, spotLight);

// Grid
const vertices = [];

vertices.push(0, 0, 0);
vertices.push(220, 0, 0);
for (let i = 35; i <= 125; i += 30) {
  vertices.push(0, 0, i);
  vertices.push(220, 0, i);
}
vertices.push(0, 0, 160);
vertices.push(220, 0, 160);

vertices.push(0, 0, 0);
vertices.push(0, 0, 160);
for (let i = 35; i <= 185; i += 30) {
  vertices.push(i, 0, 0);
  vertices.push(i, 0, 160);
}
vertices.push(220, 0, 0);
vertices.push(220, 0, 160);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const material = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 100,
});
const grid = new THREE.LineSegments(geometry, material);

scene.add(grid);

// Puck Setup
let puckList = [];

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

// Plane
const planeGeometry = new THREE.PlaneGeometry(220 + 20, 160 + 20);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.set(220 / 2, -0.1, 160 / 2);
scene.add(plane);

const gltfLoader = new GLTFLoader();

// -------------------------------------------------------------------------------------------
// CAR
// -------------------------------------------------------------------------------------------

const carMoveSpeed = 0.7;
const carTurnSpeed = 0.05;
let carModel;
let carPos = [35, 35];
let carRot = -Math.PI / 2;

let moveDir = [0, 0, 0, 0];

gltfLoader.load("public/car/scene.gltf", (gltf) => {
  carModel = gltf.scene;

  carModel.rotation.y = carRot;
  carModel.position.set(35, 1.6, 35);
  carModel.scale.set(0.03, 0.03, 0.03);

  scene.add(carModel);
});

function MoveCar() {
  if (moveDir[0]) {
    carPos[0] += Math.cos(carRot) * carMoveSpeed;
    carPos[1] -= Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir[1]) {
    carPos[0] -= Math.cos(carRot) * carMoveSpeed;
    carPos[1] += Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir[2]) {
    carRot += carTurnSpeed;
  } else if (moveDir[3]) {
    carRot -= carTurnSpeed;
  }
}

// -------------------------------------------------------------------------------------------
// MAIN ANIMATION LOOP
// -------------------------------------------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  MoveCar();

  if (carModel) {
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
  }
}

animate();

// -------------------------------------------------------------------------------------------
// RAYCASTING
// -------------------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();

threeCanvas.addEventListener("pointerdown", (event) => {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);
  const intersection = raycaster.intersectObject(plane, true);
  if (intersection.length > 0) {
    const coord = intersection[0].point;

    const diffX = (coord.x - 35) % 30;
    const diffZ = (coord.z - 35) % 30;
    let finalX = 0;
    let finalZ = 0;

    if (diffX > 35 / 2) finalX = coord.x + (30 - diffX);
    else finalX = coord.x - diffX;

    if (diffZ > 35 / 2) finalZ = coord.z + (30 - diffZ);
    else finalZ = coord.z - diffZ;

    if (coord.x < 35) finalX = 35;
    else if (coord.x > 185) finalX = 185;
    if (coord.z < 35) finalZ = 35;
    else if (coord.z > 125) finalX = 125;

    puck([finalX, 1, finalZ], 0xff4d4d);
  }
});

// -------------------------------------------------------------------------------------------
// MANUAL INPUT
// -------------------------------------------------------------------------------------------

document.addEventListener("contextmenu", (event) => event.preventDefault());

const dirDict = {
  stop: [0, 0, 0, 0],
  forward: [1, 0, 0, 0],
  backward: [0, 1, 0, 0],
  right: [0, 0, 0, 1],
  left: [0, 0, 1, 0],
  pickUp: [0, 0, 0, 0],
};

const inputButtons = document.querySelectorAll(".inputButton");

inputButtons.forEach((inputButton) => {
  inputButton.addEventListener("mousedown", (e) => {
    moveDir = dirDict[e.target.id];
    SendDir(e.target.id);
  });
});

inputButtons.forEach((inputButton) => {
  inputButton.addEventListener("mouseup", (e) => {
    moveDir = dirDict["stop"];
    SendDir("stop");
  });
});

// -------------------------------------------------------------------------------------------
// Server Setup
// -------------------------------------------------------------------------------------------
let socket = undefined;
let statusTextComponent =
  document.querySelector("#connectionStatus").textContent;

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    statusTextComponent = "Status: Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    statusTextComponent = "Status: Disconnected";
  });

  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    statusTextComponent = "Status: Disconnected";
  });
}

function disconnect_socket() {
  if (socket != undefined) {
    socket.close();
  }
}

function sendCommand(command) {
  if (socket != undefined) {
    socket.send(command);
  } else {
    alert("Not connected to the PICO");
  }
}

function SendDir(dir) {
  if (socket != undefined) {
    socket.send(dir);
  } else {
    console.log("Not connected to the PICO");
  }
}

const socketButton = document.querySelector("#connectButton");

socketButton.addEventListener("mousedown", () => {
  connect_socket();
});
