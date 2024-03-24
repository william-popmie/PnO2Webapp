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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.shadowMap.enabled = true;

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9f0ff);

// Set up camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(-200, 250, -200);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(100, 0, 80);
// const gridHelper = new THREE.GridHelper(500, 50);
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

// -------------------------------------------------------------------------------------------
// THREEJS SETUP
// -------------------------------------------------------------------------------------------

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 3);
scene.add(hemiLight);

const mainSpotLight = new THREE.SpotLight(0xfff8bf, 4);
mainSpotLight.position.set(-10, 150, -150);
mainSpotLight.castShadow = true;
mainSpotLight.shadow.bias = -0.0001;
mainSpotLight.shadow.mapSize.width = 1024 * 4;
mainSpotLight.shadow.mapSize.height = 1024 * 4;
scene.add(mainSpotLight);

const rearLight = new THREE.DirectionalLight(0xc1bfff, 1);
rearLight.position.set(10, 150, -150);
rearLight.shadow.bias = -0.0001;
rearLight.shadow.mapSize.width = 1024 * 4;
rearLight.shadow.mapSize.height = 1024 * 4;
scene.add(rearLight);

const directionalLight = new THREE.DirectionalLight(0xb3b5ff, 0.2);
directionalLight.position.set(100, -1500, 1500);
scene.add(directionalLight);

// -------------------------------------------------------------------------------------------
// REST
// -------------------------------------------------------------------------------------------

// Grid
// const vertices = [];

// vertices.push(0, 0, 0);
// vertices.push(220, 0, 0);
// for (let i = 35; i <= 125; i += 30) {
//   vertices.push(0, 0, i);
//   vertices.push(220, 0, i);
// }
// vertices.push(0, 0, 160);
// vertices.push(220, 0, 160);

// vertices.push(0, 0, 0);
// vertices.push(0, 0, 160);
// for (let i = 35; i <= 185; i += 30) {
//   vertices.push(i, 0, 0);
//   vertices.push(i, 0, 160);
// }
// vertices.push(220, 0, 0);
// vertices.push(220, 0, 160);

// const geometry = new THREE.BufferGeometry();
// geometry.setAttribute(
//   "position",
//   new THREE.Float32BufferAttribute(vertices, 3)
// );

// const material = new THREE.LineBasicMaterial({
//   color: 0x0000ff,
//   linewidth: 100,
// });
// const grid = new THREE.LineSegments(geometry, material);
// // scene.add(grid);

// Plane
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

const gltfLoader = new GLTFLoader();

// Puck Setup
const puckColor = 0xff3333;
let tempPuck = [];
let puckList = [];

const puck = (cords, color) => {
  const topPuckGeometry = new THREE.CylinderGeometry(4, 4, 2.2, 32);
  const bottomPuckGeometry = new THREE.CylinderGeometry(2.5, 2.5, 2.2, 32);

  const puckMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });

  const topPuck = new THREE.Mesh(topPuckGeometry, puckMaterial);
  const bottomPuck = new THREE.Mesh(bottomPuckGeometry, puckMaterial);

  topPuck.position.set(cords[0], cords[1] + 2.2, cords[2]);
  bottomPuck.position.set(cords[0], cords[1], cords[2]);

  tempPuck = [topPuck, bottomPuck];
  scene.add(tempPuck[0], tempPuck[1]);
};

// -------------------------------------------------------------------------------------------
// RAYCASTING
// -------------------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();

let placePuck = false;
let snapCoords = [];

threeCanvas.addEventListener("pointermove", (event) => {
  placePuck = false;

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

    snapCoords = [finalX, 0.3, finalZ];
    scene.remove(tempPuck[0], tempPuck[1]);
    puck(snapCoords, puckColor);
  }
});

threeCanvas.addEventListener("pointerdown", (event) => {
  placePuck = true;
});

threeCanvas.addEventListener("pointerup", () => {
  let toRemove = -1;
  if (placePuck) {
    // Loop over puckList to find if there already is a puck in that position
    // If there is: don't place another puck: placepuck = false
    for (let i = 0; i < puckList.length; i++) {
      if (
        snapCoords[0] == puckList[i][0][0] &&
        snapCoords[1] == puckList[i][0][1] &&
        snapCoords[2] == puckList[i][0][2]
      ) {
        toRemove = i;
        placePuck = false;
      }
    }
  }
  if (placePuck) {
    puckList.push([snapCoords, tempPuck]);
    puck(snapCoords, puckColor);
  } else if (toRemove >= 0) {
    scene.remove(puckList[toRemove][1][0], puckList[toRemove][1][1]);
    puckList.splice(toRemove, 1);
  }

  placePuck = false;
});

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
  carModel.scale.set(0.05, 0.05, 0.05);

  carModel.traverse((n) => {
    n.castShadow = true;
    n.receiveShadow = true;
  });

  scene.add(carModel);
});

gltfLoader.load("public/island/Island.gltf", (gltf) => {
  const islandModel = gltf.scene;
  const scale = 951.5;
  islandModel.position.set(110, -15, 80.4);
  islandModel.scale.set(scale, scale, scale);

  islandModel.traverse((n) => {
    n.castShadow = true;
    n.receiveShadow = true;
  });

  scene.add(islandModel);
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
// MANUAL INPUT
// -------------------------------------------------------------------------------------------

document.addEventListener("contextmenu", (event) => event.preventDefault());

const dirDict = {
  forward: [1, 0, 0, 0],
  backward: [0, 1, 0, 0],
  right: [0, 0, 0, 1],
  left: [0, 0, 1, 0],
  pickUp: [0, 0, 0, 0],
};

const inputButtons = document.querySelectorAll(".manualInputButton");
const stateButtons = document.querySelectorAll(".stateButton");

inputButtons.forEach((inputButton) => {
  inputButton.addEventListener("mousedown", (e) => {
    moveDir = dirDict[e.target.id];
    SendDir(e.target.id);
  });

  inputButton.addEventListener("mouseup", (e) => {
    moveDir = [0, 0, 0, 0];
    SendDir("stop");
  });
});

stateButtons.forEach((stateButton) => {
  stateButton.addEventListener("mousedown", (e) => {
    SendDir(e.target.id);
    console.log(e.target.id);
  });

  stateButton.addEventListener("mouseup", (e) => {
    SendDir(e.target.id + "Release");
    console.log(e.target.id + "Release");
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
