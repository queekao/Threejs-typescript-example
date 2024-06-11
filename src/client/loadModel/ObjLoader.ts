import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";

import Stats from "three/examples/jsm/libs/stats.module";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light = new THREE.PointLight();
light.position.set(2.5, 7.5, 15);
scene.add(light);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const material2 = new THREE.MeshNormalMaterial();

// Default Obj is a meshPhongMaterial
// https://en.wikipedia.org/wiki/Wavefront_.obj_file
const objLoader = new OBJLoader();
objLoader.load(
  "models/cube.obj",
  (object) => {
    console.log(object.children);
    object.position.z = -3;
    (object.children[0] as THREE.Mesh).material = material; // change material
    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);
objLoader.load(
  "models/monkey.obj",
  (object) => {
    console.log(object.children);
    // material is not a property of obj3D but is property of THREE.Mesh
    //assertions - https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
    // (object.children[0] as THREE.Mesh).material = material; // change material
    object.traverse(function (child) {
      //this is call when you not only have one children
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material2;
      }
    });
    object.position.x = -3;
    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);
/// MTLLoader - only load the material
console.time("Start");
const mtlLoader = new MTLLoader();
mtlLoader.load(
  "models/monkeyTextured.mtl",
  (materials) => {
    materials.preload();
    console.log(materials);
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials); // the model attach the MTL material
    objLoader.load(
      "models/monkeyTextured.obj",
      (object) => {
        console.log(object);

        scene.add(object);
        console.timeEnd("Start");
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log("An error happened");
      }
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log("An error happened");
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
