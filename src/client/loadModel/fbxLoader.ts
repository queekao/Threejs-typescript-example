import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
//https://www.mixamo.com/#/?page=1&type=Character
// this is free model download
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light = new THREE.PointLight();
light.position.set(0.8, 1.4, 1.0);
scene.add(light);

// const ambientLight = new THREE.AmbientLight();

// scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0.8, 1.4, 1.0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const material = new THREE.MeshNormalMaterial();
console.time("time");
const fbxLoader = new FBXLoader();
fbxLoader.load(
  "models/organicPeppershaker.fbx",
  (object) => {
    console.log(object);

    object.traverse(function (child) {
      console.log(child.name); // with this way we can see all the child of model of the name

      if ((child as THREE.Mesh).isMesh) {
        // (child as THREE.Mesh).material = material;
        if ((child as THREE.Mesh).material) {
          (
            (child as THREE.Mesh).material as THREE.MeshBasicMaterial
          ).transparent = true;
        }
      }
    });
    // object.scale.set(0.01, 0.01, 0.01);
    scene.add(object);
    console.timeEnd("time");
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
