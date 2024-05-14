import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import { ResetCar } from "./car";

import {
  renderer,
  raycaster,
  gltfLoader,
  camera,
  plane,
  scene,
  threeCanvas,
} from "./threeSetup";
import { MainSolve } from "./backtracking";

let puckColor = "g";
let puckMatrix;

let followPuckModel;
let routeMesh;
let placePuck = false;
let snapCoords = [];

let instructions = "";
let route;

// -------------------------------------------------------------------------------------------
// PUCK VARIABLE
// -------------------------------------------------------------------------------------------
const puck = (cords, color) => {
  gltfLoader.load("public/puck/puck.gltf", (gltf) => {
    const puckModel = gltf.scene;
    const scale = 3;

    puckModel.position.set(cords[0], cords[1], cords[2]);
    puckModel.scale.set(scale, scale, scale);

    puckModel.traverse((n) => {
      n.castShadow = true;
      n.receiveShadow = true;
    });

    puckMatrix[(cords[2] - 35) / 30][(cords[0] - 35) / 30] = puckModel;

    if (color == "g") {
      puckModel.children[0].material.color.set(new THREE.Color(0x00ff00));
    } else {
      puckModel.children[0].material.color.set(new THREE.Color(0xff0000));
    }

    scene.add(puckModel);
  });
};

// -------------------------------------------------------------------------------------------
// INIT GHOST PUCK
// -------------------------------------------------------------------------------------------

AddExistingPucks();
function AddExistingPucks() {
  if (JSON.parse(localStorage.getItem("puckMatrix"))) {
    puckMatrix = JSON.parse(localStorage.getItem("puckMatrix"));

    for (let y = 0; y < puckMatrix.length; y++) {
      for (let x = 0; x < puckMatrix[0].length; x++) {
        if (puckMatrix[y][x]) {
          const existingColor = puckMatrix[y][x]["materials"][0]["color"];
          if (existingColor == 65280) {
            puck([x * 30 + 35, 0.1, y * 30 + 35], "g");
          } else {
            puck([x * 30 + 35, 0.1, y * 30 + 35], "r");
          }
        }
      }
    }
  } else {
    puckMatrix = Array(4)
      .fill()
      .map(() => Array(6).fill());
  }
}

InitFollowPuckModel();
function InitFollowPuckModel() {
  gltfLoader.load("public/puck/puck.gltf", (gltf) => {
    followPuckModel = gltf.scene;
    const scale = 3;
    followPuckModel.position.set(-0, -10, -0);
    followPuckModel.scale.set(scale, scale, scale);

    followPuckModel.children[0].material.transparent = true;
    followPuckModel.children[0].material.opacity = 0.6;

    followPuckModel.traverse((n) => {
      n.castShadow = true;
      n.receiveShadow = true;
    });

    scene.add(followPuckModel);
  });
}

// -------------------------------------------------------------------------------------------
// ROUTE GENERATION
// -------------------------------------------------------------------------------------------
function GenerateRoute() {
  if (routeMesh) {
    scene.remove(routeMesh);
  }

  const board = FormatPuckMatrix();
  if (board == false) {
    console.log("Wrong puck number");
    return false;
  }

  route = MainSolve(board);
  console.log(route);
  //Car update
  if (route.length >= 2 && route[1][0] == 1 && route[1][1] == 0) {
    ResetCar(-Math.PI / 2);
  } else {
    ResetCar(0);
  }

  DrawRoute(route);
  RouteInstructions(route);

  document.querySelector("#runRouteButton").style.display = "block";
}

function FormatPuckMatrix() {
  let redCounter = 0;
  let greenCounter = 0;
  let board = Array(4)
    .fill()
    .map(() => Array(6).fill());

  for (let y = 0; y < puckMatrix.length; y++) {
    for (let x = 0; x < puckMatrix[0].length; x++) {
      if (puckMatrix[y][x]) {
        if (puckMatrix[y][x].children[0].material.color.g == 1) {
          board[y][x] = "G";
          greenCounter++;
        } else {
          board[y][x] = "R";
          redCounter++;
        }
      } else {
        board[y][x] = " ";
      }
    }
  }

  return board;
}

function DrawRoute(route) {
  const vertices = [];

  for (let i = 0; i < route.length; i++) {
    vertices.push(route[i][1] * 30 + 35, 0.1, route[i][0] * 30 + 35);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const material = new MeshLineMaterial({
    color: 0x0000ff,
    lineWidth: 1,
  });

  const grid = new MeshLine();
  grid.setGeometry(geometry);

  routeMesh = new THREE.Mesh(grid, material);
  scene.add(routeMesh);
}

function RouteInstructions(route) {
  instructions = "f";
  function T(t1, t2) {
    return t1[0] == t2[0] && t1[1] == t2[1];
  }

  for (let i = 0; i < route.length - 2; i++) {
    const p0 = route[i];
    const p1 = route[i + 1];
    const p2 = route[i + 2];

    const diff1 = [p1[0] - p0[0], p1[1] - p0[1]];
    const diff2 = [p2[0] - p1[0], p2[1] - p1[1]];

    if (T(diff1, [1, 0])) {
      if (T(diff2, [1, 0])) {
        instructions += "f";
      } else if (T(diff2, [0, 1])) {
        instructions += "l";
      } else if (T(diff2, [-1, 0])) {
        instructions += "b";
      } else {
        instructions += "r";
      }
    } else if (T(diff1, [0, 1])) {
      if (T(diff2, [1, 0])) {
        instructions += "r";
      } else if (T(diff2, [0, 1])) {
        instructions += "f";
      } else if (T(diff2, [-1, 0])) {
        instructions += "l";
      } else {
        instructions += "b";
      }
    } else if (T(diff1, [-1, 0])) {
      if (T(diff2, [1, 0])) {
        instructions += "b";
      } else if (T(diff2, [0, 1])) {
        instructions += "r";
      } else if (T(diff2, [-1, 0])) {
        instructions += "f";
      } else {
        instructions += "l";
      }
    } else {
      if (T(diff2, [1, 0])) {
        instructions += "l";
      } else if (T(diff2, [0, 1])) {
        instructions += "b";
      } else if (T(diff2, [-1, 0])) {
        instructions += "r";
      } else {
        instructions += "f";
      }
    }
  }

  instructions += "s";
  console.log(instructions);
  return instructions;
}

// -------------------------------------------------------------------------------------------
// EVENT LISTENERS
// -------------------------------------------------------------------------------------------

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

    snapCoords = [finalX, 0.1, finalZ];

    if (followPuckModel) {
      followPuckModel.position.set(snapCoords[0], snapCoords[1], snapCoords[2]);

      if (puckColor == "g") {
        followPuckModel.children[0].material.color.set(
          new THREE.Color(0x00ff00)
        );
      } else {
        followPuckModel.children[0].material.color.set(
          new THREE.Color(0xff0000)
        );
      }
    }
  }
});

threeCanvas.addEventListener("pointerdown", (event) => {
  placePuck = true;
});

threeCanvas.addEventListener("pointerup", () => {
  if (placePuck) {
    if (puckMatrix[(snapCoords[2] - 35) / 30][(snapCoords[0] - 35) / 30]) {
      scene.remove(
        puckMatrix[(snapCoords[2] - 35) / 30][(snapCoords[0] - 35) / 30]
      );
      puckMatrix[(snapCoords[2] - 35) / 30][(snapCoords[0] - 35) / 30] =
        undefined;
    } else {
      puck(snapCoords, puckColor);
    }

    localStorage.setItem("puckMatrix", JSON.stringify(puckMatrix));
  }

  placePuck = false;
});

document.addEventListener("keypress", (event) => {
  if (event.key == "c") {
    if (puckColor == "g") {
      puckColor = "r";
    } else {
      puckColor = "g";
    }
  }
});

export { InitFollowPuckModel, GenerateRoute, instructions, route };
