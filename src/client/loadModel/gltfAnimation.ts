import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";

const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(5));

const light1 = new THREE.PointLight(0xffffff, 2);
light1.position.set(2.5, 2.5, 2.5);
scene.add(light1);
const light2 = new THREE.PointLight(0xffffff, 2);
light2.position.set(-2.5, 2.5, 2.5);
scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2.2, 3.2, 2.5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.useLegacyLights = true; //use this instead of setting physicallyCorrectLights=true property

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

let mixer: THREE.AnimationMixer;
let modelReady = false;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction;
let lastAction: THREE.AnimationAction;
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "models/Mesh/Umbrella__Intro_Anim.glb",
  (gltf) => {
    // gltf.scene.scale.set(.01, .01, .01)

    mixer = new THREE.AnimationMixer(gltf.scene);

    const animationAction = mixer.clipAction((gltf as any).animations[0]);
    animationActions.push(animationAction);
    animationsFolder.add(animations, "default");
    animationAction.loop = THREE.LoopOnce; // Set the animation to play only once
    animationAction.clampWhenFinished = true; // Stop the animation on the last frame
    animationAction.enabled = true;
    activeAction = animationActions[0];

    scene.add(gltf.scene);

    // //add an animation from another file
    gltfLoader.load(
      "models/Mesh-2/Umbrella_Rig_Open_BoneOnly.glb",
      (gltf) => {
        console.log("open");
        const animationAction = mixer.clipAction((gltf as any).animations[0]);
        animationActions.push(animationAction);
        animationsFolder.add(animations, "open");
        animationAction.loop = THREE.LoopOnce; // Set the animation to play only once
        animationAction.clampWhenFinished = true; // Stop the animation on the last frame
        animationAction.enabled = true;

        //add an animation from another file
        gltfLoader.load(
          "models/Mesh-2/Umbrella_Rig_Close_BoneOnly.glb",
          (gltf) => {
            console.log("close");
            const animationAction = mixer.clipAction(
              (gltf as any).animations[0]
            );
            animationActions.push(animationAction);
            animationsFolder.add(animations, "close");
            animationAction.loop = THREE.LoopOnce; // Set the animation to play only once
            animationAction.clampWhenFinished = true; // Stop the animation on the last frame
            animationAction.enabled = true;
            //add an animation from another file
            gltfLoader.load(
              "models/Mesh-2/Umbrella__Intro_Anim_BoneOnly.glb",
              (gltf) => {
                console.log("amin");
                (gltf as any).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                const animationAction = mixer.clipAction(
                  (gltf as any).animations[0]
                );
                animationActions.push(animationAction);
                animationsFolder.add(animations, "amin");
                animationAction.loop = THREE.LoopOnce; // Set the animation to play only once
                animationAction.clampWhenFinished = true; // Stop the animation on the last frame
                animationAction.enabled = true;

                modelReady = true;
              },
              (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
              },
              (error) => {
                console.log(error);
              }
            );
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

const animations = {
  default: function () {
    setAction(animationActions[0]);
  },
  open: function () {
    setAction(animationActions[1]);
  },
  close: function () {
    setAction(animationActions[2]);
  },
  amin: function () {
    setAction(animationActions[3]);
  },
};

const setAction = (toAction: THREE.AnimationAction) => {
  if (toAction != activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    // lastAction.stop();
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
};

const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
const data = {
  color: light1.color.getHex(),
  mapsEnabled: true,
  // groundColor: light.groundColor.getHex(),
};

const lightFolder = gui.addFolder("THREE.Light");
lightFolder.addColor(data, "color").onChange(() => {
  light1.color.setHex(Number(data.color.toString().replace("#", "0x")));
});

animationsFolder.open();
lightFolder.open();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (modelReady) mixer.update(clock.getDelta());

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
