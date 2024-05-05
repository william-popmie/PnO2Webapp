import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";

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
let puckMatrix = Array(4)
  .fill()
  .map(() => Array(6).fill());

let followPuckModel;
let routeMesh;
let placePuck = false;
let snapCoords = [];

// -------------------------------------------------------------------------------------------
// PUCK VARIABLE
// -------------------------------------------------------------------------------------------
const puck = (cords) => {
  gltfLoader.load("public/puck/puck.gltf", (gltf) => {
    const puckModel = gltf.scene;
    const scale = 3;

    puckModel.position.set(cords[0], cords[1], cords[2]);
    puckModel.scale.set(scale, scale, scale);

    puckModel.traverse((n) => {
      n.castShadow = true;
      n.receiveShadow = true;
    });

    puckMatrix[(snapCoords[2] - 35) / 30][(snapCoords[0] - 35) / 30] =
      puckModel;

    if (puckColor == "g") {
      puckModel.children[0].material.color.set(new THREE.Color(0x00ff00));
    }

    scene.add(puckModel);
  });
};

// -------------------------------------------------------------------------------------------
// INIT GHOST PUCK
// -------------------------------------------------------------------------------------------

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

  const route = MainSolve(board);
  DrawRoute(route);
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

  if (greenCounter != 6 || redCounter != 4) return false;

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
      puck(snapCoords);
    }
  }

  placePuck = false;
});

document.addEventListener("keypress", (event) => {
  if (event.key == "c") {
    if (puckColor == "g") puckColor = "r";
    else puckColor = "g";
  }
});

export { InitFollowPuckModel, GenerateRoute };
