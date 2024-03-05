import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Add Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
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
camera.position.set(80, 70, 170);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);
// const gridHelper = new THREE.GridHelper(500, 50);
// scene.add(gridHelper);
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);
controls.target = new THREE.Vector3(80, 0, 50);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
const spotLight = new THREE.SpotLight(0xffa95c, 4);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;

scene.add(hemiLight, spotLight);

// Grid
const material = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 100,
});

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
const line = new THREE.Line(geometry, material);
scene.add(line);

// Models Import
const planeGeometry = new THREE.PlaneGeometry(150 + 60, 90 + 60);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.set(150 / 2, -0.1, 90 / 2);
scene.add(plane);

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

function addPucks() {
  const puckPos = [];

  while (puckPos.length < 5) {
    let randNumsX = Math.floor(Math.random() * 5) * 30;
    let randNumsY = Math.floor(Math.random() * 4) * 30;

    const coord = [randNumsX, 0, randNumsY];
    console.log(coord);

    let inArray = false;

    const a = JSON.stringify(puckPos);
    const b = JSON.stringify(coord);

    const c = a.indexOf(b);
    if (c != -1) {
      inArray = true;
    }

    if (!inArray && coord != [0, 0, 0]) {
      puckPos.push(coord);
    }
  }

  for (let i = 0; i < 5; i++) {
    puck(puckPos[i], 0xff4d4d);
  }
}

addPucks();

puck([60, 0, 30], 0xff4d4d);

const gltfLoader = new GLTFLoader();

const carMoveSpeed = 0.3;
const carTurnSpeed = 0.02;
let carModel;
let carPos = [0, 0];
let carRot = -Math.PI / 2;

let moveDir = [0, 0, 0, 0];

gltfLoader.load("public/car/scene.gltf", (gltf) => {
  carModel = gltf.scene;

  carModel.rotation.y = carRot;
  carModel.position.set(0, 1.6, 0);
  carModel.scale.set(0.03, 0.03, 0.03);

  scene.add(carModel);
});

// INPUT
const forward = document.querySelector("#forward");
const backward = document.querySelector("#backward");
const left = document.querySelector("#left");
const right = document.querySelector("#right");

forward.addEventListener("mousedown", () => {
  moveDir = [1, 0, 0, 0];
  SendDir("forward");
});

forward.addEventListener("mouseup", () => {
  moveDir = [0, 0, 0, 0];
  SendDir("stop");
});

backward.addEventListener("mousedown", () => {
  moveDir = [0, 1, 0, 0];
  SendDir("backward");
});

backward.addEventListener("mouseup", () => {
  moveDir = [0, 0, 0, 0];
  SendDir("stop");
});

left.addEventListener("mousedown", () => {
  moveDir = [0, 0, 1, 0];
  SendDir("left");
});

left.addEventListener("mouseup", () => {
  moveDir = [0, 0, 0, 0];
  SendDir("stop");
});

right.addEventListener("mousedown", () => {
  moveDir = [0, 0, 0, 1];
  SendDir("right");
});

right.addEventListener("mouseup", () => {
  moveDir = [0, 0, 0, 0];
  SendDir("stop");
});

let socket = undefined;

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    document.getElementById("status").textContent = "Status: Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    document.getElementById("status").textContent = "Status: Disconnected";
  });

  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    document.getElementById("status").textContent = "Status: Disconnected";
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
  console.log(dir);
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
