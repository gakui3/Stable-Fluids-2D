import * as THREE from "three";
import {WEBGL} from "https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js";
// import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

import BasicVert from "./shaders/basic.vert?raw";
import AddSource from "./shaders/addSource.frag?raw";
import AddVelocity from "./shaders/addVelocity.frag?raw";
import DiffuseVelocity from "./shaders/diffuseVelocity.frag?raw";

let canvas, renderer, scene, camera, geometry, gui;

let lastMousePos = new THREE.Vector2(0, 0);
let AddSourceComposer, AddVelocityComposer, DiffuseVelocityComposer;
let addSourcePass, addVelocityPass, diffuseVelocityPass;
let sourceRTs, velocityRTs;

const param = {
  value01: 1.0,
  value02: true,
  value03: 1.0,
  value04: "hoge01",
};

function init() {
  if (WEBGL.isWebGL2Available()) {
    console.log("webgl2");
  }
  canvas = document.querySelector("#c");
  const context = canvas.getContext("webgl2", {antialias: true});
  renderer = new THREE.WebGLRenderer({canvas, context});
  // 背景色を白に設定
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();

  var isDragging = false;

  canvas.addEventListener(
    "mousedown",
    function (event) {
      isDragging = true;
    },
    false
  );

  canvas.addEventListener(
    "mousemove",
    function (event) {
      if (!isDragging) return; // ドラッグ中でなければ終了

      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left; // canvas内の相対座標
      var y = event.clientY - rect.top; // canvas内の相対座標

      // 座標を正規化（0~1の範囲に変換）
      var normalizedX = x / canvas.clientWidth;
      var normalizedY = 1 - y / canvas.clientHeight;

      let dpdt = new THREE.Vector2(x, y).sub(lastMousePos);
      lastMousePos = new THREE.Vector2(x, y);
      let velocitySource = dpdt.clampLength(0.0, 1.0);

      addSourcePass.uniforms.radius.value = 0.02;
      addSourcePass.uniforms.source.value = new THREE.Vector4(
        velocitySource.x,
        velocitySource.y,
        normalizedX,
        normalizedY
      );
      AddSourceComposer.render();
    },
    false
  );

  canvas.addEventListener(
    "mouseup",
    function (event) {
      isDragging = false;
    },
    false
  );

  sourceRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    1
  );
  sourceRTs.texture[0].name = "value";

  velocityRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    2
  );
  velocityRTs.texture[0].name = "velocity";
  velocityRTs.texture[1].name = "prev";

  //add source
  AddSourceComposer = new EffectComposer(renderer, sourceRTs);
  AddSourceComposer.renderToScreen = false;
  const addSourceMatUniforms = {
    source: {value: null},
    radius: {value: null},
  };

  const sourceShader = new THREE.RawShaderMaterial({
    uniforms: addSourceMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: AddSource,
    glslVersion: THREE.GLSL3,
  });
  addSourcePass = new ShaderPass(sourceShader, {});
  AddSourceComposer.addPass(addSourcePass);

  // add velocity from source
  AddVelocityComposer = new EffectComposer(renderer, velocityRTs);
  AddVelocityComposer.renderToScreen = false;
  const addVelocityMatUniforms = {
    sourceTex: {value: null},
  };

  const addVelocityShader = new THREE.RawShaderMaterial({
    uniforms: addVelocityMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: AddVelocity,
    glslVersion: THREE.GLSL3,
  });
  addVelocityPass = new ShaderPass(addVelocityShader, {});
  addVelocityPass.uniforms.sourceTex.value = sourceRTs.texture[0];
  AddVelocityComposer.addPass(addVelocityPass);

  // diffuse velocity
  // DiffuseVelocityComposer = new EffectComposer(renderer, velocityRT);
  // DiffuseVelocityComposer.renderToScreen = false;

  // diffuseVelocityPass = new ShaderPass({
  //   vertexShader: BasicVert,
  //   fragmentShader: DiffuseVelocity,
  // });
  // DiffuseVelocityComposer.addPass(diffuseVelocityPass);
}

function addCamera() {
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.set(0, 0, 1);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
}

function addObject() {
  // plane geometryを追加
  geometry = new THREE.PlaneGeometry(2, 2);

  const mat = new THREE.MeshBasicMaterial({map: velocityRTs.texture[0]});
  const plane = new THREE.Mesh(geometry, mat);
  scene.add(plane);
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
  // addGUI();
  update();
})();
