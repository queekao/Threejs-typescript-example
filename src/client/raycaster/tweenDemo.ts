import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import TWEEN from "@tweenjs/tween.js";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;
const light = new THREE.AmbientLight();
scene.add(light);

const renderer = new THREE.WebGLRenderer();
//renderer.physicallyCorrectLights = true //deprecated
renderer.useLegacyLights = false; //use this instead of setting physicallyCorrectLights=true property
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.addEventListener("change", render);
controls.enableDamping = true;

const sceneMeshes: THREE.Mesh[] = [];
let monkey: THREE.Mesh;

const loader = new GLTFLoader();

loader.load(
  "models/monkey.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        // if (child.name === "Plane") {
        sceneMeshes.push(m);
        // } else if (child.name === "Suzanne") {
        //   monkey = m;
        // }
        console.log(m.name);
      }
      if ((child as THREE.Light).isLight) {
        console.log(child);
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 2048;
        l.shadow.mapSize.height = 2048;
      }
    });
    scene.add(gltf.scene);
    // chainTweens();
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + "% loaded", xhr);
  },
  (error) => {
    console.log(error);
  }
);
function chainTweens() {
  // Demonstrating a repeating sequence of tweens.
  const changePositionZ = new TWEEN.Tween(monkey.position).to({z: -2}, 2000); // 2 seconds
  const rotateY = new TWEEN.Tween(monkey.rotation).to({y: Math.PI * 2}, 2000);
  const scaleXZ = new TWEEN.Tween(monkey.scale).to({x: 2, z: 0.5}, 2000);
  const rotateZ = new TWEEN.Tween(monkey.rotation).to({z: Math.PI * 2}, 2000);
  const resetScaleXZ = new TWEEN.Tween(monkey.scale).to({x: 1, z: 1}, 2000);
  const resetPositionZ = new TWEEN.Tween(monkey.position).to({z: 0}, 2000);
  const rotateX = new TWEEN.Tween(monkey.rotation).to({x: Math.PI * 2}, 2000);
  const resetRotations = new TWEEN.Tween(monkey.rotation).to(
    {x: 0, y: 0, z: 0},
    0
  ); // 0 seconds results in an instant tween

  changePositionZ.chain(rotateY);
  rotateY.chain(scaleXZ);
  scaleXZ.chain(rotateZ);
  rotateZ.chain(resetScaleXZ);
  resetScaleXZ.chain(resetPositionZ);
  resetPositionZ.chain(rotateX);
  rotateX.chain(resetRotations);
  resetRotations.chain(changePositionZ); // begin the loop again

  changePositionZ.start();
}
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onDoubleClick(event: MouseEvent) {
  mouse.set(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    const p = intersects[0].point;
    // controls.target.set(p.x, p.y, p.z); // reset the control target
    // const tween = new TWEEN.Tween(controls.target)
    //   .to(
    //     {
    //       x: p.x,
    //       y: p.y,
    //       z: p.z,
    //     },
    //     500
    //   )
    //   //   .delay(1000)
    //   .easing(TWEEN.Easing.Bounce.Out)
    //   //   .onUpdate(() => render())
    //   .start();

    new TWEEN.Tween(monkey.position)
      .to(
        {
          x: p.x,
          // y: p.y + 1,
          z: p.z,
        },
        500
      )
      //   .delay(1000)
      // .easing(TWEEN.Easing.Bounce.Out)
      //   .onUpdate(() => render())
      .start();
    new TWEEN.Tween(monkey.position)
      .to(
        {
          // x: p.x,
          y: p.y + 3,
          // z: p.z,
        },
        250
      )
      //   .delay(1000)
      .easing(TWEEN.Easing.Cubic.Out)
      //   .onUpdate(() => render())
      .start()
      .onComplete(() => {
        new TWEEN.Tween(monkey.position)
          .to(
            {
              x: p.x,
              y: p.y + 1,
              z: p.z,
            },
            250
          )
          //   .delay(1000)
          .easing(TWEEN.Easing.Cubic.In)
          //   .onUpdate(() => render())
          .start();
      });
  }
}
renderer.domElement.addEventListener("dblclick", onDoubleClick, false);

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  TWEEN.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
