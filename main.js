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

import { AddScore, SendDir } from "./JSFiles/server";
import { GenerateRoute, instructions } from "./JSFiles/pucks";

var moving = false;
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
const inputButtons = document.querySelectorAll(".manualInputButton");

inputButtons.forEach((inputButton) => {
  inputButton.addEventListener("mousedown", (e) => {
    SetMoveDir(dirDict[e.target.id]);
    SendDir(e.target.id);
  });

  inputButton.addEventListener("mouseup", (e) => {
    SetMoveDir([0, 0, 0, 0]);
    SendDir("stop");
  });
});

document.querySelector("#runRouteButton").addEventListener("mousedown", () => {
  AddScore(-1);

  moving = true;
  SendDir(`route${instructions}`);
  console.log(`route${instructions}`);
});

document.querySelector("#generateButton").addEventListener("mousedown", () => {
  GenerateRoute();
});
