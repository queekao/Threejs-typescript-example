import * as THREE from "three";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import CannonUtils from "../utils/cannonUtils";
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import {ConvexObjectBreaker} from "three/examples/jsm/misc/ConvexObjectBreaker";
import {Reflector} from "three/examples/jsm/objects/Reflector";
import {OBB} from "three/examples/jsm/math/OBB";
import {CSG} from "../utils/CSGMesh";
import CannonDebugRenderer from "../utils/cannonDebugRenderer";
// collision event https://sbcode.net/threejs/convexobjectbreaker/

const scene = new THREE.Scene();

const light1 = new THREE.DirectionalLight();
light1.position.set(20, 20, 20);
scene.add(light1);

const light2 = new THREE.DirectionalLight();
light2.position.set(-20, 20, 20);
scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const menuPanel = document.getElementById("menuPanel") as HTMLDivElement;
const startButton = document.getElementById("startButton") as HTMLButtonElement;
startButton.addEventListener(
  "click",
  function () {
    controls.lock();
  },
  false
);

const controls = new PointerLockControls(
  camera,
  document.getElementById("menuPanel") as HTMLElement
);
controls.addEventListener("lock", () => (menuPanel.style.display = "none"));
controls.addEventListener("unlock", () => (menuPanel.style.display = "block"));

camera.position.y = 1;
camera.position.z = 2;

const onKeyDown = function (event: KeyboardEvent) {
  switch (event.key) {
    case "w":
      controls.moveForward(0.25);
      break;
    case "a":
      controls.moveRight(-0.25);
      break;
    case "s":
      controls.moveForward(-0.25);
      break;
    case "d":
      controls.moveRight(0.25);
      break;
  }
};
document.addEventListener("keydown", onKeyDown, false);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
//;(world.solver as CANNON.GSSolver).iterations = 20
//world.allowSleep = true

const material = new THREE.MeshStandardMaterial({
  //color: 0xa2ffb8,
  color: 0xffffff,
  //reflectivity: 0.15,
  metalness: 1.0,
  roughness: 0.25,
  transparent: true,
  opacity: 0.75,
  //transmission: 1.0,
  side: THREE.DoubleSide,
  //clearcoat: 1.0,
  //clearcoatRoughness: 0.35,
});

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = new THREE.TextureLoader().load(
  "img/earth_bumpmap.jpg",
  () => {
    material.envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
  }
);

const meshes: {[id: string]: THREE.Mesh} = {};
const bodies: {[id: string]: CANNON.Body} = {};
let meshId = 0;

const groundMirror = new Reflector(new THREE.PlaneGeometry(1024, 1024), {
  color: new THREE.Color(0x222222),
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
});
groundMirror.position.y = -0.05;
groundMirror.rotateX(-Math.PI / 2);
scene.add(groundMirror);
///////////////////////
//create a cube and sphere and intersect them
const cubeMesh = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({color: 0xff0000})
);

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1.45, 8, 8),
  new THREE.MeshStandardMaterial({color: 0x0000ff})
);
cubeMesh.position.set(-2.5, 1, -3);
cubeMesh.geometry.userData.obb = new OBB();
cubeMesh.userData.obb = new OBB();
scene.add(cubeMesh);
sphereMesh.position.set(-2, 0, -6);
// scene.add(sphereMesh);

const cubeCSG = CSG.fromMesh(cubeMesh, 0);
const sphereCSG = CSG.fromMesh(sphereMesh, 1);

const cubeSphereIntersectCSG = cubeCSG.intersect(sphereCSG);

const cubeSphereIntersectMesh = CSG.toMesh(
  cubeSphereIntersectCSG,
  new THREE.Matrix4(),
  [cubeMesh.material, sphereMesh.material]
);
cubeSphereIntersectMesh.geometry.userData.obb = new OBB().fromBox3(
  cubeSphereIntersectMesh.geometry.boundingBox as THREE.Box3
);
cubeSphereIntersectMesh.userData.obb = new OBB();
cubeSphereIntersectMesh.position.set(-2.5, 1, -3);
scene.add(cubeSphereIntersectMesh);
// const cubeSphereIntersectMeshBody = new CANNON.Body({mass: 1});
// world.addBody(cubeSphereIntersectMeshBody);
// console.log(cubeSphereIntersectMesh.position);

// const cubeSphereIntersectShape = new CANNON.Box(
//   new CANNON.Vec3(
//     cubeSphereIntersectMesh.position.x,
//     cubeSphereIntersectMesh.position.y,
//     cubeSphereIntersectMesh.position.z
//   )
// );
// cubeSphereIntersectMeshBody.addShape(cubeSphereIntersectShape);
///
///////////////////////
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({mass: 0});
planeBody.addShape(planeShape);
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(planeBody);

const convexObjectBreaker = new ConvexObjectBreaker();

for (let i = 0; i < 20; i++) {
  /// and the random convex obj into the scene
  const size = {
    x: Math.random() * 4 + 2,
    y: Math.random() * 10 + 5,
    z: Math.random() * 4 + 2,
  };
  const geo: THREE.BoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const cube = new THREE.Mesh(geo, material);

  cube.position.x = Math.random() * 50 - 25;
  cube.position.y = size.y / 2 + 0.1;
  cube.position.z = Math.random() * 50 - 25;

  scene.add(cube);
  meshes[meshId] = cube;
  convexObjectBreaker.prepareBreakableObject(
    meshes[meshId],
    1,
    new THREE.Vector3(),
    new THREE.Vector3(),
    true
  );

  const cubeShape = new CANNON.Box(
    new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
  );
  const cubeBody = new CANNON.Body({mass: 1});
  (cubeBody as any).userData = {splitCount: 0, id: meshId};
  cubeBody.addShape(cubeShape);
  cubeBody.position.x = cube.position.x;
  cubeBody.position.y = cube.position.y;
  cubeBody.position.z = cube.position.z;

  world.addBody(cubeBody);
  bodies[meshId] = cubeBody;

  meshId++;
}
// bullets
const bullets: {[id: string]: THREE.Mesh} = {};
const bulletBodies: {[id: string]: CANNON.Body} = {};
let bulletId = 0;

const bulletMaterial = new THREE.MeshPhysicalMaterial({
  map: new THREE.TextureLoader().load("img/grayscale-test.png"),
  clearcoat: 1.0,
  clearcoatRoughness: 0,
  clearcoatMap: null,
  clearcoatRoughnessMap: null,
  metalness: 0.4,
  roughness: 0.3,
  color: "white",
});
document.addEventListener("click", onClick, false);
function onClick() {
  if (controls.isLocked) {
    // for scene
    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 8),
      bulletMaterial
    );
    bullet.position.copy(camera.position);
    scene.add(bullet);
    bullets[bulletId] = bullet;
    // bullet.geometry.userData.obb = new OBB().fromBox3(
    //   bullet.geometry.boundingBox as THREE.Box3
    // );
    // bullet.userData.obb = new OBB();
    // console.log(bullet.geometry.userData.obb);

    // for cannon
    const bulletShape = new CANNON.Sphere(1);
    const bulletBody = new CANNON.Body({mass: 1});
    bulletBody.addShape(bulletShape);
    bulletBody.position.x = camera.position.x;
    bulletBody.position.y = camera.position.y;
    bulletBody.position.z = camera.position.z;

    world.addBody(bulletBody);
    bulletBodies[bulletId] = bulletBody;
    bulletBody.addEventListener("collide", (e: any) => {
      if (e.body.userData) {
        if (e.body.userData.splitCount < 2) {
          splitObject(e.body.userData, e.contact);
        }
      }
    });
    const v = new THREE.Vector3(0, 0, -1);
    v.applyQuaternion(camera.quaternion);
    v.multiplyScalar(50);
    bulletBody.velocity.set(v.x, v.y, v.z); // linear velocity of the body
    bulletBody.angularVelocity.set(
      Math.random() * 10 + 1,
      Math.random() * 10 + 1,
      Math.random() * 10 + 1
    );

    bulletId++;
    //remove old bullets
    while (Object.keys(bullets).length > 5) {
      scene.remove(bullets[bulletId - 6]);
      delete bullets[bulletId - 6];
      world.removeBody(bulletBodies[bulletId - 6]);
      delete bulletBodies[bulletId - 6];
    }
  }
}
//

// break convex shape
function splitObject(userData: any, contact: CANNON.ContactEquation) {
  const contactId = userData.id;
  if (meshes[contactId]) {
    const poi = bodies[contactId].pointToLocalFrame(
      (contact.bj.position as CANNON.Vec3).vadd(contact.rj)
    );
    const n = new THREE.Vector3(
      contact.ni.x,
      contact.ni.y,
      contact.ni.z
    ).negate(); // invert the vector
    const shards = convexObjectBreaker.subdivideByImpact(
      meshes[contactId],
      new THREE.Vector3(poi.x, poi.y, poi.z),
      n,
      1,
      0
    );

    //remove the original mesh
    scene.remove(meshes[contactId]);
    delete meshes[contactId];
    world.removeBody(bodies[contactId]);
    delete bodies[contactId];

    //and add the new smaller meshes to the scene
    shards.forEach((d: THREE.Object3D) => {
      const nextId = meshId++;
      // for scene
      scene.add(d);
      meshes[nextId] = d as THREE.Mesh;
      //   (d as THREE.Mesh).geometry.scale(0.99, 0.99, 0.99);
      // for cannon
      const shape = gemoetryToShape((d as THREE.Mesh).geometry);
      //The greater the mass of a body, the harder it is to accelerate it or change its direction
      const body = new CANNON.Body({mass: 1});
      body.addShape(shape);
      (body as any).userData = {
        splitCount: userData.splitCount + 1,
        id: nextId,
      };
      body.position.x = d.position.x;
      body.position.y = d.position.y;
      body.position.z = d.position.z;
      body.quaternion.x = d.quaternion.x;
      body.quaternion.y = d.quaternion.y;
      body.quaternion.z = d.quaternion.z;
      body.quaternion.w = d.quaternion.w;
      world.addBody(body);
      bodies[nextId] = body;
    });
  }
}
///

function gemoetryToShape(geometry: THREE.BufferGeometry) {
  // this is create cannon for breaking shape
  const position = (geometry.attributes.position as THREE.BufferAttribute)
    .array;
  //   console.log(geometry);

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < position.length; i += 3) {
    points.push(
      new THREE.Vector3(position[i], position[i + 1], position[i + 2])
    );
  }
  const convexHull = new ConvexGeometry(points); // use Vector3[] to create convexSHape
  const shape = CannonUtils.CreateConvexPolyhedron(convexHull);
  return shape;
}

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
};

const clock = new THREE.Clock();
let delta;
const cannonDebugRenderer = new CannonDebugRenderer(scene, world);
// console.log(
//   cubeSphereIntersectMesh.geometry.userData.obb,
//   cubeSphereIntersectMesh.userData.obb
// );
function animate() {
  requestAnimationFrame(animate);

  //   delta = clock.getDelta();
  //   if (delta > 0.1) delta = 0.1;
  delta = Math.min(clock.getDelta(), 0.1); // if we get too high delta number use 0.1 instead
  world.step(delta);
  cannonDebugRenderer.update();
  // make the IntersectMesh moving
  cubeSphereIntersectMesh.position.x =
    Math.sin(clock.getElapsedTime() * 0.5) * 4;
  cubeMesh.userData.obb.copy(cubeMesh.geometry.userData.obb);
  cubeMesh.userData.obb.applyMatrix4(cubeMesh.matrixWorld);
  cubeSphereIntersectMesh.userData.obb.copy(
    //if you want to attach data specific to the geometry, such as information about its topology or texture coordinates.
    cubeSphereIntersectMesh.geometry.userData.obb
  );
  cubeSphereIntersectMesh.userData.obb.applyMatrix4(
    //  attaches the additional data directly to the mesh object itself.
    cubeSphereIntersectMesh.matrixWorld
  );
  if (
    cubeSphereIntersectMesh.userData.obb.intersectsOBB(cubeMesh.userData.obb)
  ) {
    cubeSphereIntersectMesh.visible = false;
  } else {
    cubeSphereIntersectMesh.visible = true;
  }

  //   cubeSphereIntersectMesh.position.set(
  //     cubeSphereIntersectMeshBody.position.x,
  //     cubeSphereIntersectMeshBody.position.y,
  //     cubeSphereIntersectMeshBody.position.z
  //   );
  //   cubeSphereIntersectMesh.quaternion.set(
  //     cubeSphereIntersectMeshBody.quaternion.x,
  //     cubeSphereIntersectMeshBody.quaternion.y,
  //     cubeSphereIntersectMeshBody.quaternion.z,
  //     cubeSphereIntersectMeshBody.quaternion.w
  //   );
  Object.keys(meshes).forEach((m) => {
    meshes[m].position.set(
      bodies[m].position.x,
      bodies[m].position.y,
      bodies[m].position.z
    );
    meshes[m].quaternion.set(
      bodies[m].quaternion.x,
      bodies[m].quaternion.y,
      bodies[m].quaternion.z,
      bodies[m].quaternion.w
    );
  });

  Object.keys(bullets).forEach((b) => {
    bullets[b].position.set(
      bulletBodies[b].position.x,
      bulletBodies[b].position.y,
      bulletBodies[b].position.z
    );
    bullets[b].quaternion.set(
      bulletBodies[b].quaternion.x,
      bulletBodies[b].quaternion.y,
      bulletBodies[b].quaternion.z,
      bulletBodies[b].quaternion.w
    );
  });
  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
