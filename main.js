function Test() {
  console.log("WEIGUH");
}

import "./style.css";
import {
  InitCarModel,
  StartFollowingRoute,
  UpdateFollowingRouteCar,
  followingRoute,
  followingRouteIndex,
} from "./JSFiles/car";
import { route } from "./JSFiles/pucks";
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

import { AddScore, ResetScore, ResetTimer, SendDir } from "./JSFiles/server";
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
  UpdateControls();

  UpdateAnimationModels();

  if (followingRoute) {
    UpdateFollowingRouteCar();
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
    SendDir(e.target.id);
  });

  inputButton.addEventListener("mouseup", (e) => {
    SendDir("stop");
  });
});

document.querySelector("#runRouteButton").addEventListener("mousedown", () => {
  ResetTimer();
  ResetScore();

  StartFollowingRoute();
  SendDir(`route${instructions}`);
  console.log(`route${instructions}`);
});

document.querySelector("#generateButton").addEventListener("mousedown", () => {
  GenerateRoute();
});
