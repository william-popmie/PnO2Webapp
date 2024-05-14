import { gltfLoader, scene } from "./threeSetup";
import { instructions, route } from "./pucks";

let carMoveSpeed = 0.2;
let carTurnSpeed = 0.4;

let followingRoute = false;
let turning = false;

// -------------------------------------------------------------------------------------------
// INIT CAR MODEL
// -------------------------------------------------------------------------------------------
let carModel;
let carPos = [35, 35];
let carRot = 0;

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

let followingRouteIndex = 0;
let intervalTimer;

function ResetCar(rot) {
  carRot = rot;
  carPos = [35, 35];
  followingRouteIndex = 0;
}

function StartFollowingRoute() {
  followingRoute = true;
}

function CrossedIntersection() {
  carPos[0] = route[followingRouteIndex][1] * 30 + 35;
  carPos[1] = route[followingRouteIndex][0] * 30 + 35;

  if (followingRouteIndex < route.length - 1) {
    diffX = route[followingRouteIndex + 1][0] - route[followingRouteIndex][0];
    diffY = route[followingRouteIndex + 1][1] - route[followingRouteIndex][1];
  } else {
    diffX = 0;
    diffY = 0;
  }

  followingRouteIndex++;

  if (instructions[followingRouteIndex - 1] == "r") {
    intervalTimer = setInterval(() => {
      TurnCar("r");
    }, 10);
  } else if (instructions[followingRouteIndex - 1] == "l") {
    intervalTimer = setInterval(() => {
      TurnCar("l");
    }, 10);
  } else if (instructions[followingRouteIndex - 1] == "b") {
    intervalTimer = setInterval(() => {
      TurnCar("b");
    }, 10);
  }
}

let i = 0;
function TurnCar(direction) {
  if (direction == "r") {
    carRot -= Math.PI / 2 / 100;
  } else if (direction == "l") {
    carRot += Math.PI / 2 / 100;
  } else {
    carRot += Math.PI / 100;
  }

  carMoveSpeed = 0;

  if (i > 100) {
    clearInterval(intervalTimer);
    carMoveSpeed = 0.2;
    i = 0;
  } else {
    i++;
  }
}

let diffX;
let diffY;

function UpdateFollowingRouteCar() {
  carPos[0] += diffY * carMoveSpeed;
  carPos[1] += diffX * carMoveSpeed;

  UpdateCar();
}

function UpdateCar() {
  if (carModel) {
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
  }
}

export {
  InitCarModel,
  UpdateCar,
  ResetCar,
  UpdateFollowingRouteCar,
  CrossedIntersection,
  StartFollowingRoute,
  followingRoute,
  followingRouteIndex,
};
