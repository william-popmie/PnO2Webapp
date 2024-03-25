let models = [];
let clocks = [];
let mixers = [];

let animationModels = [
  "cloud1",
  "cloud2",
  "cloud3",
  "cloud4",
  "minecart1",
  "minecart2",
  "minecart3",
];

export function InitAnimationModels(THREE, scene, gltfLoader) {
  for (let i = 0; i < animationModels.length; i++) {
    clocks[i] = new THREE.Clock();

    gltfLoader.load(`/island/${animationModels[i]}.gltf`, (gltf) => {
      let scale = 951.5;
      models[i] = gltf.scene;
      models[i].scale.set(scale, scale, scale);
      models[i].position.set(110, -15, 80.4);
      models[i].traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          if (n.material.map) n.material.map.anistropy = 16;
        }
      });

      mixers[i] = new THREE.AnimationMixer(models[i]);
      const clip = gltf.animations[0];
      const action = mixers[i].clipAction(clip);
      action.play();

      scene.add(models[i]);
    });
  }
}

export function UpdateAnimationModels() {
  for (let i = 0; i < animationModels.length; i++) {
    if (mixers[i]) {
      mixers[i].update(clocks[i].getDelta()); // Update animation mixer in the render loop
    }
  }
}
