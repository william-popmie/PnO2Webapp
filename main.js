import "./style.css";
import { InitCarModel, UpdateCar } from "./JSFiles/car";
import {
  InitTHREESetup,
  UpdateRenderer,
  UpdateControls,
} from "./JSFiles/threeSetup";
import { InitManualButtons } from "./JSFiles/manualButtons";
import {
  InitIslandModel,
  InitAnimationModels,
  UpdateAnimationModels,
} from "./JSFiles/animations";

function InitMain() {
  InitTHREESetup();
  InitAnimationModels();
  InitIslandModel();

  InitManualButtons();
  InitCarModel();
}

InitMain();

function animate() {
  requestAnimationFrame(animate);

  UpdateRenderer();
  UpdateControls;

  UpdateAnimationModels();

  UpdateCar();
}

animate();
