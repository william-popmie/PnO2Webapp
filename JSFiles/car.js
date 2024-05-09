import { gltfLoader, scene } from "./threeSetup";
import { route } from "./pucks";

const carMoveSpeed = 0.7;
const carTurnSpeed = 0.05;
let carModel;
let carPos = [35, 35];
let carRot = -Math.PI / 2;

let moveDir = [0, 0, 0, 0];

const dirDict = {
  forward: [1, 0, 0, 0],
  backward: [0, 1, 0, 0],
  right: [0, 0, 0, 1],
  left: [0, 0, 1, 0],
  pickUp: [0, 0, 0, 0],
};

// -------------------------------------------------------------------------------------------
// INIT CAR MODEL
// -------------------------------------------------------------------------------------------

function InitCarModel() {
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
}

// -------------------------------------------------------------------------------------------
// MOVE LOGIC
// -------------------------------------------------------------------------------------------
function SetMoveDir(dir) {
  moveDir = dir;
}

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

let i = 0;
function ResetI() {
  i = 0;
}

function MoveCarAlongRoute() {
  console.log(i, route);
  if (i < route.length) {
    carPos[0] = route[i][1] * 30 + 35;
    carPos[1] = route[i][0] * 30 + 35;

    i++;
  } else {
    i = 0;
  }

  UpdateCar();
}

function UpdateCar() {
  MoveCar();

  if (carModel) {
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
  }
}

export {
  InitCarModel,
  UpdateCar,
  MoveCarAlongRoute,
  SetMoveDir,
  ResetI,
  dirDict,
};
