import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light = new THREE.SpotLight();
light.position.set(5, 5, 5);
scene.add(light);
// const material = new THREE.MeshStandardMaterial({transparent: true});
// const geometry: any = new THREE.PlaneGeometry(14, 7);
// const plane = new THREE.Mesh(geometry, material);
// plane.rotation.x = -Math.PI / 2;
// plane.position.y = -1;
// plane.receiveShadow = true;
// plane.castShadow = true;
// scene.add(plane);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
// renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false; //use this instead of setting physicallyCorrectLights=true property
renderer.shadowMap.enabled = true;
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
console.time("time");
const loader = new GLTFLoader(); // default is meshStandMaterial
loader.load(
  "models/monkey_textured.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        // cast each mesh shadow
        // const m = child as THREE.Mesh;
        // m.receiveShadow = true;
        // m.castShadow = true;
      }
      if ((child as THREE.Light).isLight) {
        // cast each light shadow
        // const l = child as THREE.Light;
        // l.castShadow = true;
        // l.shadow.bias = -0.005; // make the shadow a offset from the obj
        // l.shadow.mapSize.width = 2048;
        // l.shadow.mapSize.height = 2048;
      }
      //   if ((child as THREE.Camera).isCamera) {
      //     // cast each light shadow
      //     console.log(child as THREE.Camera);
      //   }
    });
    scene.add(gltf.scene);
    console.log(gltf);
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
