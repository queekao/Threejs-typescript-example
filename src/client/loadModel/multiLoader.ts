import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

//https://threejs.org/docs/#api/en/animation/AnimationMixer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(5));
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(1.5, 0.5, -0.25);
const light: any = new THREE.SpotLight();

scene.add(light);
const pointLight: any = new THREE.PointLight();
scene.add(pointLight);
const AmbientLight: any = new THREE.AmbientLight();
scene.add(AmbientLight);
const controls = new OrbitControls(camera, renderer.domElement);
document.body.appendChild(renderer.domElement);
const progressBar = document.getElementById(
  "progressBar"
) as HTMLProgressElement;
const loaderManagement = new THREE.LoadingManager(
  () => {
    progressBar.style.display = "none";
    console.log("load");
  },
  (url, load, total) => {
    // console.log(`${Math.round((load / total) * 100)}%`);
    const percentComplete = Math.round(load / total) * 100;
    progressBar.value = percentComplete === Infinity ? 100 : percentComplete;
  },
  (url) => {
    console.error(`${url} wrong path`);
  }
);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/js/libs/draco/");
const loader = new GLTFLoader(loaderManagement);
loader.setDRACOLoader(dracoLoader);
const loadModelAsyc = async () => {
  const [...models] = await Promise.all([
    loader.loadAsync("models/gltf/kira.glb"),
    loader.loadAsync("models/gltf/horse.glb"),
  ]);
  scene.add(models[1].scene);
  const clone1 = models[0].scene.clone();
  clone1.position.set(0, 2, 0);
  scene.add(models[0].scene);
  scene.add(clone1);
};
loadModelAsyc();
// loader.load("models/gltf/kira.glb", function (gltf) {
//   scene.add(gltf.scene);
// });
// loader.load("models/gltf/horse.glb", function (gltf) {
//   gltf.scene.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 0), 90);
//   gltf.scene.setRotationFromMatrix(new THREE.Matrix4());
//   scene.add(gltf.scene);
// });
// loader.load('model3.glb', function (gltf) {
//     scene.add(gltf.scene)
// })
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
