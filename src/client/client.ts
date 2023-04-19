import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
// esModuleInterop: true - use this in typescript will make sure non-default export as default export
import {GUI} from "dat.gui";
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));
//https://en.wikipedia.org/wiki/Viewing_frustum
const camera1: any = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
const camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const camera3 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const camera4 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const material2 = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

const points = [];
points.push(new THREE.Vector3(-1, 0, 0));
points.push(new THREE.Vector3(0, 1, 0));
points.push(new THREE.Vector3(1, 0, 0));

const geometry2 = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometry2, material2);
scene.add(line);
camera1.position.z = 2;
camera2.position.y = 1;
camera2.lookAt(new THREE.Vector3(0, 0, 0));
camera3.position.z = 1;
camera4.position.x = 1;
camera4.lookAt(new THREE.Vector3(0, 0, 0));

const canvas1 = document.getElementById("c1") as HTMLCanvasElement;
const canvas2 = document.getElementById("c2") as HTMLCanvasElement;
const canvas3 = document.getElementById("c3") as HTMLCanvasElement;
const canvas4 = document.getElementById("c4") as HTMLCanvasElement;
const renderer1 = new THREE.WebGLRenderer({canvas: canvas1});
renderer1.setSize(200, 200);
const renderer2 = new THREE.WebGLRenderer({canvas: canvas2});
renderer2.setSize(200, 200);
const renderer3 = new THREE.WebGLRenderer({canvas: canvas3});
renderer3.setSize(200, 200);
const renderer4 = new THREE.WebGLRenderer({canvas: canvas4});
renderer4.setSize(200, 200);

//document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera1, renderer1.domElement);
controls.addEventListener("change", render);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

const cube: any = new THREE.Mesh(geometry, material);
scene.add(cube);
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  renderer1.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);
const gui = new GUI();
const cubeFolder = gui.addFolder("Cube");
const cubeRotationFolder = cubeFolder.addFolder("Rotation");
cubeRotationFolder.add(cube.rotation, "x", 0, Math.PI * 2);
cubeRotationFolder.add(cube.rotation, "y", 0, Math.PI * 2);
cubeRotationFolder.add(cube.rotation, "z", 0, Math.PI * 2);
cubeFolder.open();
cubeRotationFolder.open();
const cubePositionFolder = cubeFolder.addFolder("Position");
cubePositionFolder.add(cube.position, "x", -10, 10, 2);
cubePositionFolder.add(cube.position, "y", -10, 10, 2);
cubePositionFolder.add(cube.position, "z", -10, 10, 2);
cubeFolder.open();
cubePositionFolder.open();
const cubeScaleFolder = cubeFolder.addFolder("Scale");
cubeScaleFolder.add(cube.scale, "x", -5, 5);
cubeScaleFolder.add(cube.scale, "y", -5, 5);
cubeScaleFolder.add(cube.scale, "z", -5, 5);
cubeFolder.add(cube, "visible");
cubeFolder.open();
cubeScaleFolder.open();
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera1.position, "z", 0, 10);
cameraFolder.open();
function animate() {
  requestAnimationFrame(animate);

  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;

  render();
  stats.update();
}

function render() {
  renderer1.render(scene, camera1);
  //   renderer2.render(scene, camera2);
  //   renderer3.render(scene, camera3);
  //   renderer4.render(scene, camera4);
}
// render();

animate();
