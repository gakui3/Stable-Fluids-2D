import * as THREE from "three";
import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

import CommonVert from "./shaders/common.vert?raw";
import AddVelocity from "./shaders/addVelocity.frag?raw";
import DiffuseVelocity from "./shaders/diffuseVelocity.frag?raw";

let canvas, renderer, scene, camera, geometry, gui;

let AddVelocityComposer, DiffuseVelocityComposer;
let velocityRT;

const param = {
  value01: 1.0,
  value02: true,
  value03: 1.0,
  value04: "hoge01",
};

function init() {
  canvas = document.querySelector("#c");
  renderer = new THREE.WebGLRenderer({canvas});
  // 背景色を白に設定
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();

  velocityRT = new THREE.WebGLRenderTarget(1024, 1024, {
    magFilter: THREE.LinearFilter,
    // minFilter: THREE.LinearMipmapNearestFilter,
    // type: THREE.FloatType,
    // wrapS: THREE.ClampToEdgeWrapping,
    // wrapT: THREE.ClampToEdgeWrapping,
    // encoding: THREE.LinearEncoding,
    // internalFormat: 'RGBA16F',
    generateMipmaps: false,
  });

  // add velocity
  AddVelocityComposer = new EffectComposer(renderer, velocityRT);
  AddVelocityComposer.renderToScreen = false;

  const addVelocityPass = new ShaderPass({
    vertexShader: CommonVert,
    fragmentShader: AddVelocity,
  });
  AddVelocityComposer.addPass(addVelocityPass);

  // diffuse velocity
  DiffuseVelocityComposer = new EffectComposer(renderer, velocityRT);
  DiffuseVelocityComposer.renderToScreen = false;

  const diffuseVelocityPass = new ShaderPass({
    vertexShader: CommonVert,
    fragmentShader: DiffuseVelocity,
  });
  DiffuseVelocityComposer.addPass(diffuseVelocityPass);
}

function addCamera() {
  camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);
  camera.position.set(0, 0, 2);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
}

function addObject() {
  // plane geometryを追加
  geometry = new THREE.PlaneGeometry(1, 1);

  const mat = new THREE.MeshBasicMaterial({map: velocityRT.texture});
  const plane = new THREE.Mesh(geometry, mat);
  scene.add(plane);
}

function addGUI() {
  gui = new GUI();
  const folder = gui.addFolder("folder");
  gui.width = 300;

  folder.add(param, "value01").onChange((value) => {
    console.log(value);
  });
  folder.add(param, "value02").onChange((value) => {
    console.log(value);
  });
  folder.add(param, "value03", 0, 2.0).onChange((value) => {
    console.log(value);
  });
  folder.add(param, "value04", ["hoge01", "hoge02"]).onChange((value) => {
    console.log(value);
  });
}

function update() {
  requestAnimationFrame(update);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  AddVelocityComposer.render();
  // DiffuseVelocityComposer.render();

  renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  // const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

(function () {
  init();
  addCamera();
  addObject();
  addGUI();
  update();
})();
