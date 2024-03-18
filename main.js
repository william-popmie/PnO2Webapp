import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Add Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#threeCanvas"),
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

// Models Import
const planeGeometry = new THREE.PlaneGeometry(220 + 20, 160 + 20);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.set(220 / 2, -0.1, 160 / 2);
scene.add(plane);

//Pucks
const puckList = [];

const puck = (cords, color) => {
  const topPuckGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1.8, 32);
  const bottomPuckGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 32);

  const puckMaterial = new THREE.MeshBasicMaterial({ color: color });

  const topPuck = new THREE.Mesh(topPuckGeometry, puckMaterial);
  const bottomPuck = new THREE.Mesh(bottomPuckGeometry, puckMaterial);

  topPuck.position.set(cords[0], cords[1] + 1.8, cords[2]);
  bottomPuck.position.set(cords[0], cords[1], cords[2]);

  scene.add(topPuck, bottomPuck);
  puckList.push([topPuck, bottomPuck]);
};
// AddRandomPucks();

// Models
const gltfLoader = new GLTFLoader();

const carMoveSpeed = 0.3;
const carTurnSpeed = 0.02;
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

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

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

  if (carModel) {
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
  }
}

animate();

// Manual Input
document.addEventListener("contextmenu", (event) => event.preventDefault());

const directions = {
  forward: [1, 0, 0, 0],
  backward: [0, 1, 0, 0],
  left: [0, 0, 1, 0],
  right: [0, 0, 0, 1],
};

const buttons = document.querySelectorAll(".inputButton");
buttons.forEach((button) => {
  button.addEventListener("mousedown", () => {
    const direction = directions[button.id];
    moveDir = direction;
    SendDir(button.id);
  });
});

buttons.forEach((button) => {
  button.addEventListener("mouseup", () => {
    moveDir = [0, 0, 0, 0];
    SendDir("stop");
  });
});

// Canvas Input
const puckCanvas = document.querySelector("#puckInput");
const puckCtx = puckCanvas.getContext("2d");

puckCtx.beginPath();

//Vertical Lines
for (let x = 35; x <= 185; x += 30) {
  puckCtx.moveTo(x, 0);
  puckCtx.lineTo(x, 180);
}

// Horizontal Lines
for (let y = 35; y <= 125; y += 30) {
  puckCtx.moveTo(0, y);
  puckCtx.lineTo(220, y);
}
puckCtx.stroke();

let xPos, yPos;
let xSnap, ySnap;
let prevXSnap, prevYSnap;
const r = 4;

function DrawWhite() {
  puckCtx.fillStyle = "#ffffff";
  puckCtx.beginPath();

  for (let x = 35; x <= 185; x += 30) {
    puckCtx.beginPath();
    for (let y = 35; y <= 125; y += 30) {
      puckCtx.arc(x, y, r, 0, 2 * Math.PI);
    }
    puckCtx.fill();
  }
  puckCtx.fill();
}

DrawWhite();

function UpdatePuckPosition() {
  puckCtx.fillStyle = "#ffffff";
  puckCtx.beginPath();
  puckCtx.arc(prevXSnap, prevYSnap, r, 0, 2 * Math.PI);
  puckCtx.fill();

  puckCtx.fillStyle = "#ff0000";
  puckCtx.beginPath();
  puckCtx.arc(xSnap, ySnap, r, 0, 2 * Math.PI);
  puckCtx.fill();

  if (puckList.length >= 6) {
    console.log(puckList.length);

    scene.remove(puckList[0][0]);
    scene.remove(puckList[0][1]);

    puckList.shift();
  }

  puck([xSnap, 0, ySnap], 0xff3636);

  scene.add(puckList[0][0], puckList[0][1]);

  // console.log(puckList);
}

puckCanvas.addEventListener("mousemove", (e) => {
  const rect = puckCanvas.getBoundingClientRect();
  xPos = Math.round(Math.abs(e.clientX - rect.left));
  yPos = Math.round(Math.abs(e.clientY - rect.top));
});

puckCanvas.addEventListener("mousedown", (e) => {
  prevXSnap = xSnap;
  prevYSnap = ySnap;

  const modX = (xPos - 35) % 30;
  const modY = (yPos - 35) % 30;

  if (modX >= 15) xSnap = xPos - modX + 30;
  else xSnap = xPos - modX;

  if (modY >= 15) ySnap = yPos - modY + 30;
  else ySnap = yPos - modY;

  UpdatePuckPosition();
});

// Server Setup
let socket = undefined;
let statusTextComponent = document.querySelector("#status").textContent;

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
