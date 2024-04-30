import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

const SCENE_BACKGROUND_COLOR = 0x94E7FE;
const CAMERA_FOV = 90;



// Add Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#bg"),
});

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);

// Set up camera
const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(-81.57168268729306, 130.8036188317595, -152.41401881252236);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);

controls.target = new THREE.Vector3(60, -25, 66);



// Lighting
const hemiLight = new THREE.HemisphereLight(0x66ffff, 0x66ffff, 4);
const spotLight = new THREE.SpotLight(0xffa95c, 10);
const directionalLight = new THREE.DirectionalLight(0xFFA517, 0.1);
scene.add(directionalLight);

spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;
scene.add(hemiLight, spotLight);


const puck = (cords, color) => {
  const topPuckGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1.8, 32);
  const bottomPuckGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 32);

  const puckMaterial = new THREE.MeshBasicMaterial({ color: color });
  const topPuck = new THREE.Mesh(topPuckGeometry, puckMaterial);
  const bottomPuck = new THREE.Mesh(bottomPuckGeometry, puckMaterial);

  topPuck.position.set(cords[0], cords[1] + 1.8, cords[2]);
  bottomPuck.position.set(cords[0], cords[1], cords[2]);

  scene.add(topPuck, bottomPuck);
};

function AddRandomPucks() {
  const puckPos = [];

  while (puckPos.length < 5) {
    let randNumsX = Math.floor(Math.random() * 7) * 16;
    let randNumsY = Math.floor(Math.random() * 5) * 17;

    const coord = [randNumsX, 0, randNumsY];

    let inArray = false;

    const a = JSON.stringify(puckPos);
    const b = JSON.stringify(coord);

    const c = a.indexOf(b);
    if (c != -1) {
      inArray = true;
    }

    if (!inArray && coord != [0, 0, 0]) {
      puckPos.push(coord);
    }
  }

  for (let i = 0; i < 5; i++) {
    puck(puckPos[i], 0xff4d4d);
  }
}

AddRandomPucks();

// Models
const gltfLoader = new GLTFLoader();

const carMoveSpeed = 0.3;
const carTurnSpeed = 0.02;
let carModel;
let carPos = [0, 0];
let carRot = -Math.PI / 2;

let moveDir = 0;

gltfLoader.load("/car/Wagen001.gltf", (gltf) => {
  carModel = gltf.scene;

  carModel.rotation.y = carRot;
  carModel.scale.set(0.04, 0.04, 0.04);

  scene.add(carModel);
});

let grijpArm;

let armQuaternion = new THREE.Quaternion();
let armOffset = 8.5
const originGrijparm = {x: -2, z: 1.5}
const distanceGrijparm = Math.sqrt(originGrijparm.x ** 2 + originGrijparm.z ** 2)
const sinGrijparm = originGrijparm.z / distanceGrijparm
const cosGrijparm = Math.sqrt(1 - sinGrijparm ** 2)

gltfLoader.load("/car/Grijparm001.gltf", (gltf) => {
  grijpArm = gltf.scene;

  grijpArm.rotation.y = Math.PI
  grijpArm.scale.set(0.04, 0.04, 0.04);

  scene.add(grijpArm);
});

let island


gltfLoader.load(
   "/island/Island2.gltf",
   ( gltf ) => {
      let scale = 500;
      island = gltf.scene;
      island.scale.set (scale,scale,scale);
      island.position.set ( 56.2, -7.5, 40.5 );
      island.traverse((n) => {
        if (n.isMesh) {
          
          n.castShadow = true;
          n.receiveShadow = true;
          if (n.material.map) n.material.map.anistropy = 16;
        }
      });
      scene.add(island)
  },
);

let watermill
let mixerWatermill;
let clockWatermill = new THREE.Clock();


gltfLoader.load(
  "/island/WaterMill.gltf",
  ( gltf ) => {
     let scale = 500;
     watermill = gltf.scene;
     watermill.scale.set (scale,scale,scale);
     watermill.position.set( 56.2, -8, 40.5 );
     watermill.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerWatermill = new THREE.AnimationMixer( watermill );
     const clip = gltf.animations[0];
     const action = mixerWatermill.clipAction(clip);
     action.play();
  
     scene.add(watermill)
 },
);

let cloud1
let mixerCloud1;
let clockCloud1 = new THREE.Clock();


gltfLoader.load(
  "/island/Cloud1.gltf",
  ( gltf ) => {
     let scale = 500;
     cloud1 = gltf.scene;
     cloud1.scale.set (scale,scale,scale);
     cloud1.position.set( 56.2, 10, 40.5 );
     cloud1.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerCloud1 = new THREE.AnimationMixer( cloud1 );
     const clip = gltf.animations[0];
     const action = mixerCloud1.clipAction(clip);
     action.play();
  
     scene.add(cloud1)
 },
);

let cloud2
let mixerCloud2;
let clockCloud2 = new THREE.Clock();


gltfLoader.load(
  "/island/Cloud2.gltf",
  ( gltf ) => {
     let scale = 500;
     cloud2 = gltf.scene;
     cloud2.scale.set (scale,scale,scale);
     cloud2.position.set( 56.2, 10, 40.5 );
     cloud2.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerCloud2 = new THREE.AnimationMixer( cloud2 );
     const clip = gltf.animations[0];
     const action = mixerCloud2.clipAction(clip);
     action.play();
  
     scene.add(cloud2)
 },
);

let cloud3
let mixerCloud3;
let clockCloud3 = new THREE.Clock();


gltfLoader.load(
  "/island/Cloud3.gltf",
  ( gltf ) => {
     let scale = 500;
     cloud3 = gltf.scene;
     cloud3.scale.set (scale,scale,scale);
     cloud3.position.set( 56.2, 10, 40.5 );
     cloud3.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerCloud3 = new THREE.AnimationMixer( cloud3 );
     const clip = gltf.animations[0];
     const action = mixerCloud3.clipAction(clip);
     action.play();
  
     scene.add(cloud3)
 },
);
let cloud4
let mixerCloud4;
let clockCloud4 = new THREE.Clock();


gltfLoader.load(
  "/island/Cloud4.gltf",
  ( gltf ) => {
     let scale = 500;
     cloud4 = gltf.scene;
     cloud4.scale.set (scale,scale,scale);
     cloud4.position.set( 56.2, 10, 40.5 );
     cloud4.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerCloud4 = new THREE.AnimationMixer( cloud4 );
     const clip = gltf.animations[0];
     const action = mixerCloud4.clipAction(clip);
     action.play();
  
     scene.add(cloud4)
 },
);

let minecart1
let mixerMinecart1;
let clockMinecart1 = new THREE.Clock();


gltfLoader.load(
  "/island/Minecart1.gltf",
  ( gltf ) => {
     let scale = 500;
     minecart1 = gltf.scene;
     minecart1.scale.set (scale,scale,scale);
     minecart1.position.set( 56.2, -8, 40.5 );
     minecart1.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerMinecart1 = new THREE.AnimationMixer( minecart1 );
     const clip = gltf.animations[0];
     const action = mixerMinecart1.clipAction(clip);
     action.play();
  
     scene.add(minecart1)
 },
);

let minecart2
let mixerMinecart2;
let clockMinecart2 = new THREE.Clock();


gltfLoader.load(
  "/island/Minecart2.gltf",
  ( gltf ) => {
     let scale = 500;
     minecart2 = gltf.scene;
     minecart2.scale.set (scale,scale,scale);
     minecart2.position.set( 56.2, -8, 40.5 );
     minecart2.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerMinecart2 = new THREE.AnimationMixer( minecart2 );
     const clip = gltf.animations[0];
     const action = mixerMinecart2.clipAction(clip);
     action.play();
  
     scene.add(minecart2)
 },
);

let minecart3
let mixerMinecart3;
let clockMinecart3 = new THREE.Clock();


gltfLoader.load(
  "/island/Minecart3.gltf",
  ( gltf ) => {
     let scale = 500;
     minecart3 = gltf.scene;
     minecart3.scale.set (scale,scale,scale);
     minecart3.position.set( 56.2, -8, 40.5 );
     minecart3.traverse((n) => {
       if (n.isMesh) {
         n.castShadow = true;
         n.receiveShadow = true;
         if (n.material.map) n.material.map.anistropy = 16;
       }
     });
     mixerMinecart3 = new THREE.AnimationMixer( minecart3 );
     const clip = gltf.animations[0];
     const action = mixerMinecart3.clipAction(clip);
     action.play();
  
     scene.add(minecart3)
 },
);


spotLight.position.set(
  camera.position.x + 100,
  camera.position.y + 10,
  camera.position.z + 10
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  if (mixerWatermill) {
    mixerWatermill.update(clockWatermill.getDelta()); // Update animation mixer in the render loop
  }
  if (mixerCloud1) {
    mixerCloud1.update(clockCloud1.getDelta()); // Update animation mixer in the render loop
  }
  if (mixerCloud2) {
    mixerCloud2.update(clockCloud2.getDelta()); // Update animation mixer in the render loop
  }
  if (mixerCloud3) {
    mixerCloud3.update(clockCloud3.getDelta()); // Update animation mixer in the render loop
  }
  if (mixerCloud4) {
    mixerCloud4.update(clockCloud4.getDelta()); // Update animation mixer in the render loop
  }
  if (mixerMinecart1) {
    mixerMinecart1.update(clockMinecart1.getDelta())
  }if (mixerMinecart2) {
    mixerMinecart2.update(clockMinecart2.getDelta())
  }if (mixerMinecart3) {
    mixerMinecart3.update(clockMinecart3.getDelta())
  }
  if (moveDir === 1) {
    carPos[0] += Math.cos(carRot) * carMoveSpeed;
    carPos[1] -= Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir === 2) {
    carPos[0] -= Math.cos(carRot) * carMoveSpeed;
    carPos[1] += Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir === 3) {
    carRot += carTurnSpeed;
    armQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), carTurnSpeed);
    grijpArm.quaternion.multiplyQuaternions(armQuaternion, grijpArm.quaternion);
  } else if (moveDir === 4) {
    carRot -= carTurnSpeed;
    armQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -carTurnSpeed);
    grijpArm.quaternion.multiplyQuaternions(armQuaternion, grijpArm.quaternion);
  } else if (moveDir === 5) {
    armQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 200);
    grijpArm.quaternion.multiplyQuaternions(grijpArm.quaternion, armQuaternion);

  } else if (moveDir === 6) {
    armQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 200);
    grijpArm.quaternion.multiplyQuaternions(grijpArm.quaternion, armQuaternion);

  } else if (moveDir === 7) {
    sendCommand('hey')
  }
  
  if (carModel && grijpArm) {
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
    // console.log(grijpArm.quaternion.y ** 2 + grijpArm.quaternion.z ** 2) y = cos en z = sin
    // console.log(radToDeg(Math.asin(sinGrijparm)))
    // console.log(sinGrijparm)
    grijpArm.position.set(carPos[0] + armOffset * Math.cos(carRot), 3.5 + distanceGrijparm * sinGrijparm - distanceGrijparm * Math.sin(Math.asin(sinGrijparm) + 2 * Math.asin(grijpArm.quaternion.z)), carPos[1] - armOffset * Math.sin(carRot) + distanceGrijparm * cosGrijparm - distanceGrijparm * Math.cos(Math.asin(sinGrijparm) + 2* Math.asin(grijpArm.quaternion.z) ))
    // grijpArm.position.set(carPos[0], 5, carPos[1] + armOffset - 2)

  }
}

animate();

// INPUT
const directions = {
  forward: 1,
  backward: 2,
  left: 3,
  right: 4,
  turnXM: 5,
  turnXP: 6,
  sendInfo: 7
};

const buttons = document.querySelectorAll(".inputButton");
buttons.forEach((button) => {
  button.addEventListener("mousedown", () => {
    const direction = directions[button.id];
    moveDir = direction;
    SendDir(button.id);
  });
});

buttons.forEach((button) => {
  button.addEventListener("mouseup", () => {
    moveDir = 0;
    SendDir("stop");
  });
});

let socket = undefined;
let statusComponent = document.querySelector("#status").textContent;

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    statusComponent = "Status: Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    statusComponent = "Status: Disconnected";
  });

  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    statusComponent = "Status: Disconnected";
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

// controls.addEventListener("change", () => {  
//   console.log( controls.object.position ); 
//   console.log(controls.target)
// });

// {
//   "_x": 0,
//   "_y": 0.7071067811865409,
//   "_z": -0.70710678118654,
//   "_w": 0
// }

// {
//   "_x": 0.4983351440001114,
//   "_y": 0.5015872832988486,
//   "_z": -0.49376960781164536,
//   "_w": 0.5062251039693518
// }

