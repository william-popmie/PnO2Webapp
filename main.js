import "./style.css";
import { InitCarModel, UpdateCar, SetMoveDir, dirDict } from "./JSFiles/car";
import {
  InitTHREESetup,
  UpdateRenderer,
  UpdateControls,
} from "./JSFiles/threeSetup";

import {
  InitIslandModel,
  InitAnimationModels,
  UpdateAnimationModels,
} from "./JSFiles/animations";

import { SendDir, UpdateScore } from "./JSFiles/server";
import { GenerateRoute, instructions } from "./JSFiles/pucks";

let startTime
var moving = false
// -------------------------------------------------------------------------------------------
// INIT WEBAPP
// -------------------------------------------------------------------------------------------

function InitMain() {
  InitTHREESetup();
  InitAnimationModels();
  InitIslandModel();

  InitCarModel();
}

InitMain();

// -------------------------------------------------------------------------------------------
// MAIN LOOP
// -------------------------------------------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);

  UpdateRenderer();
  UpdateControls;

  UpdateAnimationModels();
  if (moving) {
  UpdateCar();
  }
}

animate();

// -------------------------------------------------------------------------------------------
// MANUALS
// -------------------------------------------------------------------------------------------

document.addEventListener("contextmenu", (event) => event.preventDefault());

// const inputButtons = document.querySelectorAll(".manualInputButton");
// const stateButtons = document.querySelectorAll(".stateButton");

// inputButtons.forEach((inputButton) => {
//   inputButton.addEventListener("mousedown", (e) => {
//     SetMoveDir(dirDict[e.target.id]);
//     SendDir(e.target.id);
//   });

//   inputButton.addEventListener("mouseup", (e) => {
//     SetMoveDir([0, 0, 0, 0]);
//     SendDir("stop");
//   });
// });

// stateButtons.forEach((stateButton) => {
//   stateButton.addEventListener("mousedown", (e) => {
//     SendDir(e.target.id);
//     console.log(e.target.id);
//   });

//   // stateButton.addEventListener("mouseup", (e) => {
//   //   SendDir(e.target.id + "Release");
//   //   console.log(e.target.id + "Release");
//   // });
// });

document.querySelector("#route").addEventListener("mousedown", () => {  
  startTime = new Date()
  startTime = startTime.getTime()
  UpdateScore(-1)
  console.log(`route${instructions}`);
  moving = true
  SendDir(`route${instructions}`);
});

document.querySelector("#generateButton").addEventListener("mousedown", () => {
  GenerateRoute();
});

export {
  startTime
}