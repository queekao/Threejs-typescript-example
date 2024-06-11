import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
import TWEEN from "@tweenjs/tween.js";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light1 = new THREE.SpotLight();
light1.position.set(2.5, 5, 2.5);
light1.angle = Math.PI / 8;
light1.penumbra = 0.5;
light1.castShadow = true;
light1.shadow.mapSize.width = 1024;
light1.shadow.mapSize.height = 1024;
light1.shadow.camera.near = 0.5;
light1.shadow.camera.far = 20;
scene.add(light1);
const light = new THREE.AmbientLight();
scene.add(light);

const light2 = new THREE.SpotLight();
light2.position.set(-2.5, 5, 2.5);
light2.angle = Math.PI / 8;
light2.penumbra = 0.5;
light2.castShadow = true;
light2.shadow.mapSize.width = 1024;
light2.shadow.mapSize.height = 1024;
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 20;
scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0.8, 1.4, 1.0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const sceneMeshes: THREE.Mesh[] = [];

const planeGeometry = new THREE.PlaneGeometry(25, 25);
const texture = new THREE.TextureLoader().load("img/grid.png");
const plane = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshPhongMaterial({map: texture})
);
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
scene.add(plane);
sceneMeshes.push(plane);

let mixer: THREE.AnimationMixer; // mix the animation and put it in animationAction
let modelReady = false;
let modelMesh: THREE.Object3D;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction;
let lastAction: THREE.AnimationAction;
const loaderManagement = new THREE.LoadingManager(
  () => {
    console.timeEnd("load model");
    progressBar.style.display = "none";
    console.log("load");
  },
  undefined,
  (url) => {
    console.error(`${url} wrong path`);
  }
);
loaderManagement.onProgress = (itemsLoaded, itemsTotal, progress) => {
  const percentComplete = Math.round(itemsTotal) * 10;
  // for (let i = 0; i < 3000000000; i++) {}
  progressBar.value = percentComplete === Infinity ? 100 : percentComplete;
  // console.log(`Loading progress: ${progress}%`, itemsLoaded, itemsTotal);
};
const gltfLoader = new GLTFLoader(loaderManagement);
const progressBar = document.getElementById(
  "progressBar"
) as HTMLProgressElement;
gltfLoader.load("models/vanguard.glb", (gltf) => {
  gltf.scene.traverse(function (child) {
    if ((child as THREE.Mesh).isMesh) {
      // const geometry = child.geometry;
      // const positionAttribute = geometry.getAttribute("position");
      // const normalAttribute = geometry.getAttribute("normal");
      // const uvAttribute = geometry.getAttribute("uv");

      // for (let i = 0; i < positionAttribute.count; i++) {
      //   const x = positionAttribute.getX(i);
      //   const y = positionAttribute.getY(i);
      //   const z = positionAttribute.getZ(i);
      //   positionArray.push(x, y, z);
      // }

      // for (let i = 0; i < normalAttribute.count; i++) {
      //   const x = normalAttribute.getX(i);
      //   const y = normalAttribute.getY(i);
      //   const z = normalAttribute.getZ(i);
      //   normalArray.push(x, y, z);
      // }

      // for (let i = 0; i < uvAttribute.count; i++) {
      //   const u = uvAttribute.getX(i);
      //   const v = uvAttribute.getY(i);
      //   uvArray.push(u, v);
      // }
      const m = child as THREE.Mesh;
      m.castShadow = true;
      m.frustumCulled = false; // when model outside of camera's view frustum it wont be rendered so we need to set 'false' that the model render not only inside of camera
    }
  });
  mixer = new THREE.AnimationMixer(gltf.scene);

  const animationAction = mixer.clipAction((gltf as any).animations[0]);
  animationActions.push(animationAction);
  animationsFolder.add(animations, "default");
  activeAction = animationActions[0];

  scene.add(gltf.scene);
  modelMesh = gltf.scene;
  //add an animation from another file
  gltfLoader.load("models/vanguard@goofyrunning.glb", (gltf) => {
    console.log("loaded goofyrunning");
    (gltf as any).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
    const animationAction = mixer.clipAction((gltf as any).animations[0]);
    animationActions.push(animationAction);
    animationsFolder.add(animations, "goofyrunning");
    modelReady = true;
  });
  //add an animation from another file
  gltfLoader.load("models/vanguard@samba.glb", (gltf) => {
    console.log("loaded samba");
    scene.add(gltf.scene);
    const animationAction = mixer.clipAction((gltf as any).animations[0]);
    animationActions.push(animationAction);
    animationsFolder.add(animations, "samba");
  });
  //add an animation from another file
  gltfLoader.load("models/vanguard@bellydance.glb", (gltf) => {
    console.log("loaded bellydance");
    const animationAction = mixer.clipAction((gltf as any).animations[0]);
    animationActions.push(animationAction);
    animationsFolder.add(animations, "bellydance");
  });
});

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const raycaster = new THREE.Raycaster();

//This is used for rotating things without incurring in the dreaded gimbal lock issue accept a Matrix4
const targetQuaternion = new THREE.Quaternion();
const mouse = new THREE.Vector2();
const geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array([
  -1.0, -1.0, 1.0, 1.0, -10.0, 1.0, 1.0, 1.0, 1.0,

  1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
]);

// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
const matrix = new THREE.Matrix4().makeTranslation(-5, 0, 0);
geometry.applyMatrix4(matrix);

const material = new THREE.MeshBasicMaterial({color: 0xff0000});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
function onDoubleClick(event: MouseEvent) {
  mouse.set(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    const p = intersects[0].point;
    const distance = modelMesh.position.distanceTo(p);

    // modelMesh.lookAt(p); // this will make the obj face to the point and run toward there
    // this is better way to fulfill the rotation transitioin
    const rotationMatrix = new THREE.Matrix4(); // a matrix is a mathematical concept used to represent transformations like rotation
    rotationMatrix.lookAt(p, modelMesh.position, modelMesh.up);
    targetQuaternion.setFromRotationMatrix(rotationMatrix);

    setAction(animationActions[1]); // walking

    TWEEN.removeAll(); // ensure one tween at the time
    new TWEEN.Tween(modelMesh.position)
      .to(
        {
          x: p.x,
          y: p.y,
          z: p.z,
        },
        (1000 / 2.2) * distance
      ) //walks 2 meters a second * the distance
      .onUpdate(() => {
        controls.target.set(
          modelMesh.position.x,
          modelMesh.position.y + 1,
          modelMesh.position.z
        );
        // make the light follow the model
        light1.target = modelMesh;
        light2.target = modelMesh;
      })
      .start()
      .onComplete(() => {
        setAction(animationActions[2]); //bellly
        // stop play it will stay the end animation
        activeAction.clampWhenFinished = true; //can be set to a boolean value to specify whether the animation should stop playing once it reaches the end
        activeAction.loop = THREE.LoopOnce; // only do once animation
      });
  }
}
renderer.domElement.addEventListener("dblclick", onDoubleClick, false);

const stats = new Stats();
document.body.appendChild(stats.dom);

const animations = {
  default: function () {
    setAction(animationActions[0]);
  },
  samba: function () {
    setAction(animationActions[1]);
  },
  bellydance: function () {
    setAction(animationActions[2]);
  },
  goofyrunning: function () {
    setAction(animationActions[3]);
  },
};

const setAction = (toAction: THREE.AnimationAction) => {
  if (toAction != activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    // lastAction.stop();
    lastAction.fadeOut(0.5);
    activeAction.reset();
    activeAction.fadeIn(0.5);
    activeAction.play();
  }
};

const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
animationsFolder.open();

const clock = new THREE.Clock();
let delta = 0;

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (modelReady) {
    delta = clock.getDelta();

    mixer.update(delta);
    //update everytime while transform rotation
    if (!modelMesh.quaternion.equals(targetQuaternion)) {
      // if the target is not going toward the destination then rotateToward
      modelMesh.quaternion.rotateTowards(targetQuaternion, delta * 10);
    }
  }

  TWEEN.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
