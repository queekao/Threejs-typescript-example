import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
// the value of each pixel is used to change the position of the vertices of the mesh
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light: any = new THREE.DirectionalLight(0xffffff, 10);
light.position.set(-4.4, 3.3, 2.2);
// light.castShadow = true;
light.shadow.bias = -0.003;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.left = -5;
light.shadow.camera.right = 5;
light.shadow.camera.top = -2;
light.shadow.camera.bottom = 2;
light.shadow.camera.near = 1;
light.shadow.camera.far = 10;
scene.add(light);

const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false; //use this instead of setting physicallyCorrectLights=true property
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true; //so that panning up and down doesn't zoom in/out
//controls.addEventListener('change', render)

const planeGeometry = new THREE.PlaneGeometry(3.6, 1.8, 360, 180);

// normal
const material: any = new THREE.MeshPhongMaterial();

//const texture = new THREE.TextureLoader().load("img/grid.png")
const texture = new THREE.TextureLoader().load("img/worldColour.5400x2700.jpg");
material.map = texture;
// const envTexture = new THREE.CubeTextureLoader().load(["img/px_50.png", "img/nx_50.png", "img/py_50.png", "img/ny_50.png", "img/pz_50.png", "img/nz_50.png"])
// const envTexture = new THREE.CubeTextureLoader().load(["img/px_eso0932a.jpg", "img/nx_eso0932a.jpg", "img/py_eso0932a.jpg", "img/ny_eso0932a.jpg", "img/pz_eso0932a.jpg", "img/nz_eso0932a.jpg"])
// envTexture.mapping = THREE.CubeReflectionMapping
// material.envMap = envTexture

//const specularTexture = new THREE.TextureLoader().load("img/earthSpecular.jpg")
// material.specularMap = specularTexture

const displacementMap = new THREE.TextureLoader().load(
  "img/gebco_bathy.5400x2700_8bit.jpg"
);
material.displacementMap = displacementMap;
material.displacementScale = 0.3;
const normalTexture = new THREE.TextureLoader().load(
  "img/earth_normalmap_8192x4096.jpg"
);
material.normalMap = normalTexture;
material.normalScale.set(5, 5);

const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material);
scene.add(plane);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

const options = {
  side: {
    FrontSide: THREE.FrontSide,
    BackSide: THREE.BackSide,
    DoubleSide: THREE.DoubleSide,
  },
  light: {
    color: material.color.getHex(),
    shadowMapSizeWidth: 2048,
    shadowMapSizeHeight: 2048,
  },
};
const gui = new GUI();

const materialFolder = gui.addFolder("THREE.Material");
materialFolder
  .add(material, "transparent")
  .onChange(() => (material.needsUpdate = true));
materialFolder.add(material, "opacity", 0, 1, 0.01);
materialFolder.add(material, "depthTest");
materialFolder.add(material, "depthWrite");
materialFolder
  .add(material, "alphaTest", 0, 1, 0.01)
  .onChange(() => updateMaterial());
materialFolder.add(material, "visible");
materialFolder
  .add(material, "side", options.side)
  .onChange(() => updateMaterial());
//materialFolder.open()
const directionalLightFolder = gui.addFolder("THREE.DirectionalLight");
directionalLightFolder
  .add(light.shadow.camera, "left", -5, -1, 0.1)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(light.shadow.camera, "right", 1, 5, 0.1)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(light.shadow.camera, "top", 1, 5, 0.1)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(light.shadow.camera, "bottom", -5, -1, 0.1)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(light.shadow.camera, "near", 0.1, 100)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(light.shadow.camera, "far", 0.1, 100)
  .onChange(() => light.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(options.light, "shadowMapSizeWidth", [256, 512, 1024, 2048, 4096])
  .onChange(() => updateShadowMapSize());
directionalLightFolder
  .add(options.light, "shadowMapSizeHeight", [256, 512, 1024, 2048, 4096])
  .onChange(() => updateShadowMapSize());
directionalLightFolder.add(light.position, "x", -5, 5, 0.01);
directionalLightFolder.add(light.position, "y", -5, 5, 0.01);
directionalLightFolder.add(light.position, "z", -5, 5, 0.01);
directionalLightFolder.open();
const data = {
  color: material.color.getHex(),
  emissive: material.emissive.getHex(),
  specular: material.specular.getHex(),
};

const meshPhongMaterialFolder = gui.addFolder("THREE.meshPhongMaterialFolder");

meshPhongMaterialFolder.addColor(data, "color").onChange(() => {
  material.color.setHex(Number(data.color.toString().replace("#", "0x")));
});
meshPhongMaterialFolder.addColor(data, "emissive").onChange(() => {
  material.emissive.setHex(Number(data.emissive.toString().replace("#", "0x")));
});
meshPhongMaterialFolder.addColor(data, "specular").onChange(() => {
  material.specular.setHex(Number(data.specular.toString().replace("#", "0x")));
});
meshPhongMaterialFolder.add(material, "shininess", 0, 1024);
meshPhongMaterialFolder.add(material, "wireframe");
meshPhongMaterialFolder
  .add(material, "flatShading")
  .onChange(() => updateMaterial());
meshPhongMaterialFolder.add(material, "reflectivity", 0, 1);
meshPhongMaterialFolder.add(material, "refractionRatio", 0, 1);
meshPhongMaterialFolder.add(material, "displacementScale", 0, 1, 0.01);
meshPhongMaterialFolder.add(material, "displacementBias", -1, 1, 0.01);
meshPhongMaterialFolder.open();

function updateMaterial() {
  material.side = Number(material.side) as THREE.Side;
  material.needsUpdate = true;
}
function updateShadowMapSize() {
  light.shadow.mapSize.width = options.light.shadowMapSizeWidth;
  light.shadow.mapSize.height = options.light.shadowMapSizeHeight;
  (light.shadow.map as any) = null;
}

const planeData = {
  width: 3.6,
  height: 1.8,
  widthSegments: 180,
  heightSegments: 90,
};
const planePropertiesFolder = gui.addFolder("PlaneGeometry");
//planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
//planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)
planePropertiesFolder
  .add(planeData, "widthSegments", 1, 360)
  .onChange(regeneratePlaneGeometry);
planePropertiesFolder
  .add(planeData, "heightSegments", 1, 180)
  .onChange(regeneratePlaneGeometry);
planePropertiesFolder.open();

function regeneratePlaneGeometry() {
  let newGeometry = new THREE.PlaneGeometry(
    planeData.width,
    planeData.height,
    planeData.widthSegments,
    planeData.heightSegments
  );
  plane.geometry.dispose();
  plane.geometry = newGeometry;
}

function animate() {
  requestAnimationFrame(animate);

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
