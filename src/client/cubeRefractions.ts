import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";

const scene = new THREE.Scene();
const loaderManagement = new THREE.LoadingManager(
  () => {
    console.log("load");
  },
  (url, load, total) => {
    console.log(`${Math.round((load / total) * 100)}%`);
  },
  (url) => {
    console.log();
  }
);
const cubeMap = new THREE.CubeTextureLoader(loaderManagement).load([
  "img/px_eso0932a.jpg",
  "img/nx_eso0932a.jpg",
  "img/py_eso0932a.jpg",
  "img/ny_eso0932a.jpg",
  "img/pz_eso0932a.jpg",
  "img/nz_eso0932a.jpg",
]);
scene.background = cubeMap;

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const light1 = new THREE.DirectionalLight();
light1.position.set(5, 10, 5);
light1.castShadow = true;
light1.shadow.bias = -0.0002;
light1.shadow.mapSize.height = 1024;
light1.shadow.mapSize.width = 1024;
light1.shadow.camera.left = -10;
light1.shadow.camera.right = 10;
light1.shadow.camera.top = 10;
light1.shadow.camera.bottom = -10;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.set(0, 8, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const planeGeometry = new THREE.PlaneGeometry(25, 25);
const texture = new THREE.TextureLoader().load("img/grid.png");
const plane: THREE.Mesh = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshPhongMaterial({map: texture})
);
const loader = new FontLoader();
const font = loader.load(
  // resource URL
  "fonts/helvetiker_regular.typeface.json",

  // onLoad callback
  function (font) {
    // do something with the font
    console.log(font);

    const color = 0x006699;

    // const matDark = new THREE.LineBasicMaterial({
    //   color: color,
    //   side: THREE.DoubleSide,
    // });

    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const message = "   dick > 16.";

    const shapes = font.generateShapes(message, 100);
    console.log(font.data);

    const geometry: any = new THREE.ShapeGeometry(shapes);

    geometry.computeBoundingBox();

    const xMid =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )

    const text = new THREE.Mesh(geometry, matLite);
    text.position.z = -150;
    scene.add(text);
  },

  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },

  // onError callback
  function (err) {
    console.log("An error happened");
  }
);
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
scene.add(plane);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const cubeRenderTarget1: THREE.WebGLCubeRenderTarget =
  new THREE.WebGLCubeRenderTarget(1, {
    format: THREE.RGBAFormat,
    // generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
  });
const cubeRenderTarget2: THREE.WebGLCubeRenderTarget =
  new THREE.WebGLCubeRenderTarget(128, {
    format: THREE.RGBAFormat,
    // generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
  });
const cubeRenderTarget3: THREE.WebGLCubeRenderTarget =
  new THREE.WebGLCubeRenderTarget(128, {
    // format: THREE.RGBAFormat,
    // generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
  });
const cubeCamera1: THREE.CubeCamera = new THREE.CubeCamera(
  0.1,
  100,
  cubeRenderTarget1
);
const cubeCamera2: THREE.CubeCamera = new THREE.CubeCamera(
  0.1,
  1000,
  cubeRenderTarget2
);
const cubeCamera3: THREE.CubeCamera = new THREE.CubeCamera(
  0.1,
  100,
  cubeRenderTarget3
);

const pivot1 = new THREE.Object3D();
scene.add(pivot1);
const pivot2 = new THREE.Object3D();
scene.add(pivot2);
const pivot3 = new THREE.Object3D();
scene.add(pivot3);

const material1 = new THREE.MeshPhongMaterial({
  shininess: 100,
  color: 0xffffff,
  specular: 0xffffff,
  envMap: cubeRenderTarget1.texture, // add the refraction texture in
  refractionRatio: 0.5,
  transparent: true,
  side: THREE.BackSide,
  combine: THREE.MixOperation,
});
const material2 = new THREE.MeshPhongMaterial({
  shininess: 100,
  color: 0xffffff,
  specular: 0xffffff,
  envMap: cubeRenderTarget2.texture,
  refractionRatio: 0.5,
  transparent: true,
  side: THREE.BackSide,
  combine: THREE.MixOperation,
});
const material3 = new THREE.MeshPhongMaterial({
  shininess: 100,
  color: 0xffffff,
  specular: 0xffffff,
  envMap: cubeRenderTarget3.texture,
  refractionRatio: 0.2,
  transparent: true,
  side: THREE.FrontSide,
  combine: THREE.MixOperation,
});

console.log(cubeRenderTarget2.texture);
// this will make the realistic reflection
cubeRenderTarget1.texture.mapping = THREE.CubeRefractionMapping;
cubeRenderTarget2.texture.mapping = THREE.CubeRefractionMapping;
cubeRenderTarget3.texture.mapping = THREE.CubeRefractionMapping;

const ball1 = new THREE.Mesh(new THREE.TorusGeometry(1), material1);
ball1.position.set(1, 1.1, 0);
ball1.castShadow = true;
ball1.receiveShadow = true;
ball1.add(cubeCamera1);
pivot1.add(ball1);

const ball2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material2);
ball2.position.set(3.1, 1.1, 0);
ball2.castShadow = true;
ball2.receiveShadow = true;
ball2.add(cubeCamera2);
pivot2.add(ball2);

const ball3 = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 36), material3);
ball3.position.set(5.2, 1.1, 0);
ball3.castShadow = true;
ball3.receiveShadow = true;
ball3.add(cubeCamera3);
pivot3.add(ball3); // add a mesh to Object3D

const data = {refractionRatio: 0};

//// GUI
const gui = new GUI();
const refractionFolder = gui.addFolder("Refraction");
refractionFolder
  .add(data, "refractionRatio", 0, 1, 0.01)
  .onChange((v: number) => {
    material1.refractionRatio = v;
    material2.refractionRatio = v;
    material3.refractionRatio = v;
  });
refractionFolder.open();
// const materialFolder = gui.addFolder("THREE.Material");
// materialFolder
//   .add(material2, "transparent")
//   .onChange(() => (material2.needsUpdate = true));
// materialFolder.add(material2, "opacity", 0, 1, 0.01);
// materialFolder.add(material2, "depthTest");
// materialFolder.add(material2, "depthWrite");
// materialFolder
//   .add(material2, "alphaTest", 0, 1, 0.01)
//   .onChange(() => updateMaterial());
// materialFolder.add(material2, "visible");
// materialFolder
//   .add(material2, "side", options.side)
//   .onChange(() => updateMaterial());
// materialFolder.open();

const data2 = {
  color: material2.color.getHex(),
  emissive: material2.emissive.getHex(),
  specular: material2.specular.getHex(), // this is what make the material shining
};
const meshPhongMaterialFolder = gui.addFolder("THREE.MeshPhongMaterial");
meshPhongMaterialFolder.addColor(data2, "color").onChange(() => {
  material2.color.setHex(Number(data2.color.toString().replace("#", "0x")));
});
meshPhongMaterialFolder.addColor(data2, "emissive").onChange(() => {
  material2.emissive.setHex(
    Number(data2.emissive.toString().replace("#", "0x"))
  );
});
meshPhongMaterialFolder.addColor(data2, "specular").onChange(() => {
  material2.specular.setHex(
    Number(data2.specular.toString().replace("#", "0x"))
  );
});
const stats = new Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  ball1.rotateY(-0.2 * delta);
  pivot1.rotateY(0.2 * delta);
  ball2.rotateY(-0.3 * delta);
  pivot2.rotateY(0.3 * delta);
  ball3.rotateY(-0.4 * delta);
  pivot3.rotateY(0.4 * delta);

  orbitControls.update();

  render();

  stats.update();
}

function render() {
  ball1.visible = false;
  cubeCamera1.update(renderer, scene);
  ball1.visible = true;
  ball2.visible = false;
  cubeCamera2.update(renderer, scene);
  ball2.visible = true;
  ball3.visible = false;
  //   cubeCamera3.update(renderer, scene);
  ball3.visible = true;

  renderer.render(scene, camera);
}

animate();
