import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

// const light: any = new THREE.AmbientLight();
// scene.add(light);

//Imagine the directional light as an OrthographicCamera,
// const light: any = new THREE.DirectionalLight();
// scene.add(light);
// const helper = new THREE.DirectionalLightHelper(light);
// scene.add(helper);

// hemisphereLight is like 2 directional light one point up one point down
// const light: any = new THREE.HemisphereLight();
// scene.add(light);
// const helper = new THREE.HemisphereLightHelper(light, 5);
// scene.add(helper);

//pointLight
// const light: any = new THREE.PointLight();
// scene.add(light);
// const helper = new THREE.PointLightHelper(light);
// scene.add(helper);

//spotLight
const light: any = new THREE.SpotLight();
scene.add(light);
const helper = new THREE.SpotLightHelper(light);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(20, 10); //, 360, 180)
// we use MeshPhong so we got a specular highlight here
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial());
plane.rotateX(-Math.PI / 2);
//plane.position.y = -1.75
scene.add(plane);

const torusGeometry = [
  new THREE.TorusGeometry(),
  new THREE.TorusGeometry(),
  new THREE.TorusGeometry(),
  new THREE.TorusGeometry(),
  new THREE.TorusGeometry(),
];

const material = [
  new THREE.MeshBasicMaterial(),
  new THREE.MeshLambertMaterial(),
  new THREE.MeshPhongMaterial(),
  new THREE.MeshPhysicalMaterial({}),
  new THREE.MeshToonMaterial(),
];

const torus = [
  new THREE.Mesh(torusGeometry[0], material[0]),
  new THREE.Mesh(torusGeometry[1], material[1]),
  new THREE.Mesh(torusGeometry[2], material[2]),
  new THREE.Mesh(torusGeometry[3], material[3]),
  new THREE.Mesh(torusGeometry[4], material[4]),
];

const texture = new THREE.TextureLoader().load("img/grid.png");
material[0].map = texture;
material[1].map = texture;
material[2].map = texture;
material[3].map = texture;
material[4].map = texture;

torus[0].position.x = -8;
torus[1].position.x = -4;
torus[2].position.x = 0;
torus[3].position.x = 4;
torus[4].position.x = 8;

// light.target = torus[0]; // the light point to the target
// light.target.position.set(0, 10, 0);
// scene.add(light.target);

scene.add(torus[0]);
scene.add(torus[1]);
scene.add(torus[2]);
scene.add(torus[3]);
scene.add(torus[4]);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

const data = {
  color: light.color.getHex(),
  mapsEnabled: true,
  // groundColor: light.groundColor.getHex(),
};

const gui = new GUI();
const lightFolder = gui.addFolder("THREE.Light");
lightFolder.addColor(data, "color").onChange(() => {
  light.color.setHex(Number(data.color.toString().replace("#", "0x")));
});
lightFolder.add(light, "intensity", 0, 1, 0.01);

// const ambientLightFolder = gui.addFolder("THREE.AmbientLight");
// ambientLightFolder.open();

//directional light
// const directionalLightFolder = gui.addFolder("THREE.DirectionalLight");
// directionalLightFolder.add(light.position, "x", -100, 100, 0.01);
// directionalLightFolder.add(light.position, "y", -100, 100, 0.01);
// directionalLightFolder.add(light.position, "z", -100, 100, 0.01);
// directionalLightFolder.open();

// hemisphereLight
// const hemisphereLightFolder = gui.addFolder("THREE.HemisphereLight");
// hemisphereLightFolder.addColor(data, "groundColor").onChange(() => {
//   light.groundColor.setHex(
//     Number(data.groundColor.toString().replace("#", "0x"))
//   );
// });
// hemisphereLightFolder.add(light.position, "x", -100, 100, 0.01);
// hemisphereLightFolder.add(light.position, "y", -100, 100, 0.01);
// hemisphereLightFolder.add(light.position, "z", -100, 100, 0.01);
// hemisphereLightFolder.open();
//pointlight
// const pointLightFolder = gui.addFolder("THREE.PointLight");
// pointLightFolder.add(light, "distance", 0, 100, 0.01);

// // decay - The amount the light dims along the distance of the light. Default is 1.
// pointLightFolder.add(light, "decay", 0, 4, 0.1);
// pointLightFolder.add(light.position, "x", -50, 50, 0.01);
// pointLightFolder.add(light.position, "y", -50, 50, 0.01);
// pointLightFolder.add(light.position, "z", -50, 50, 0.01);
// pointLightFolder.open();

const spotLightFolder = gui.addFolder("THREE.SpotLight");
spotLightFolder.add(light, "distance", 0, 100, 0.01);
spotLightFolder.add(light, "decay", 0, 4, 0.1);
spotLightFolder.add(light, "angle", 0, 1, 0.1);
spotLightFolder.add(light, "penumbra", 0, 1, 0.1);
spotLightFolder.add(light.position, "x", -50, 50, 0.01);
spotLightFolder.add(light.position, "y", -50, 50, 0.01);
spotLightFolder.add(light.position, "z", -50, 50, 0.01);
spotLightFolder.open();

const meshesFolder = gui.addFolder("Meshes");
meshesFolder.add(data, "mapsEnabled").onChange(() => {
  material.forEach((m) => {
    if (data.mapsEnabled) {
      m.map = texture;
    } else {
      m.map = null;
    }
    m.needsUpdate = true;
  });
});

function animate() {
  requestAnimationFrame(animate);
  helper.update();
  torus.forEach((t) => {
    t.rotation.y += 0.01;
  });

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
