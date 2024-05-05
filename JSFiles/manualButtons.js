import { SendDir } from "./server";
import { SetMoveDir, dirDict } from "./car";
import { GenerateRoute } from "./pucks";

export function InitManualButtons() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  const inputButtons = document.querySelectorAll(".manualInputButton");
  const stateButtons = document.querySelectorAll(".stateButton");

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

  document
    .querySelector("#generateButton")
    .addEventListener("mousedown", () => {
      GenerateRoute();
    });
}
