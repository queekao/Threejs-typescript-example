import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import Stats from "three/examples/jsm/libs/stats.module";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// orbitControl are not the part of THREE
// const controls = new OrbitControls(camera, renderer.domElement);

// kind of like orbit but it has the polar extremes
// mimic this https://en.wikipedia.org/wiki/Trackball#/media/File:Trackball-Kensington-ExpertMouse5.jpg
const controls = new TrackballControls(camera, renderer.domElement);

// camera.lookAt(0.5, 0.5, 0.5); // every obj3D has a lookAt method
// controls.target.set(0.5, 0.5, 0.5); // this will set the control target
// controls.update();

// controls.addEventListener("change", () => console.log("Controls Change"));
// controls.addEventListener("start", () => console.log("Controls Start Event"));
// controls.addEventListener("end", () => console.log("Controls End Event"));
// controls.autoRotate = true
// controls.autoRotateSpeed = 10
// controls.enableDamping = true; // the rotation behavior sticker
// controls.dampingFactor = 0.01; // the threshold of rotation
// controls.listenToKeyEvents(document.body); // the center of the controller value will change as well
// controls.keys = {
//   LEFT: "ArrowLeft", //left arrow
//   UP: "ArrowUp", // up arrow
//   RIGHT: "ArrowRight", // right arrow
//   BOTTOM: "ArrowDown", // down arrow
// };
// controls.mouseButtons = {
//     LEFT: THREE.MOUSE.ROTATE,
//     MIDDLE: THREE.MOUSE.DOLLY,
//     RIGHT: THREE.MOUSE.PAN
// }
// controls.touches = {
// this is for IPAD or Phone
//     ONE: THREE.TOUCH.ROTATE,
//     TWO: THREE.TOUCH.DOLLY_PAN
// }

// this value set to 'false' when you click mouse right moving up and donw it will zoom in and out
// controls.screenSpacePanning = true;

// https://en.wikipedia.org/wiki/Azimuth#/media/File:Azimuth-Altitude_schematic.svg
// controls.minAzimuthAngle = 0;
// controls.maxAzimuthAngle = Math.PI / 2;
// controls.minPolarAngle = Math.PI / 4;
// controls.maxPolarAngle = Math.PI / 2;
// controls.maxDistance = 4; // zoom out
// controls.minDistance = 1; // zoom in

// TrackBallControl setup
// controls.enabled = false;
// controls.rotateSpeed = 1.0;
// controls.zoomSpeed = 1.2;
// controls.panSpeed = 1.8; // right click
// controls.keys = ["KeyA", "KeyS", "KeyD"]; // hold the key for specific event
// controls.noPan = true; //default false
// controls.noRotate = true; //default false
// controls.noZoom = true; //default false
// controls.staticMoving = true; //default false
// controls.dynamicDampingFactor = 0.1;
// controls.maxDistance = 4
// controls.minDistance = 2

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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
