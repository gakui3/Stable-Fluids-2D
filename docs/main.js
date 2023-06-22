import * as THREE from "three";
import {WEBGL} from "https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js";
// import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

import BasicVert from "./shaders/basic.vert?raw";
import AddSource from "./shaders/addSource.frag?raw";
import AddVelocity from "./shaders/addVelocity.frag?raw";
import AddDensity from "./shaders/addDensity.frag?raw";
import DiffuseVelocity from "./shaders/diffuseVelocity.frag?raw";
import SwapSolver from "./shaders/swapSolver.frag?raw";
import DiffuseDensity from "./shaders/diffuseDensity.frag?raw";
import DrawResult from "./shaders/drawResult.frag?raw";
import SwapResult from "./shaders/swapResult.frag?raw";
import InitResult from "./shaders/initResult.frag?raw";

import sampleTex from "./assets/sample.png";

let canvas, renderer, scene, camera, geometry, isDragging;
let finishInit = false;

let lastMousePos = new THREE.Vector2(0, 0);
let addSourceComposer,
  addVelocityComposer,
  diffuseVelocityComposer,
  swapSolverComposer,
  addDensityComposer,
  diffuseDensityComposer,
  drawResultComposer,
  swapResultComposer,
  initResultComposer;

let addSourcePass,
  addVelocityPass,
  diffuseVelocityPass,
  swapSolverPass,
  addDensityPass,
  diffuseDensityPass,
  initResultPass,
  drawResultPass,
  swapResultPass;

let sourceRTs, solverRTs, tempSolverRTs, resultRTs, prevResultRTs;

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

  //lightを追加
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  let isDragging = false;

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
      addSourceComposer.render();
      addVelocityComposer.render();
      swapSolverComposer.render();
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

  solverRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    2
  );
  solverRTs.texture[0].name = "solver";
  solverRTs.texture[1].name = "prev";

  tempSolverRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    2
  );
  tempSolverRTs.texture[0].name = "tempSolver";
  tempSolverRTs.texture[1].name = "tempPrev";

  resultRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    1
  );
  resultRTs.texture[0].name = "result";

  prevResultRTs = new THREE.WebGLMultipleRenderTargets(
    canvas.clientWidth,
    canvas.clientHeight,
    1
  );
  prevResultRTs.texture[0].name = "prevResult";

  //1-0 マウスからの外力を計算
  addSourceComposer = new EffectComposer(renderer, sourceRTs);
  addSourceComposer.renderToScreen = false;
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
  addSourceComposer.addPass(addSourcePass);

  //1-1 マウスからの外力を加算
  addVelocityComposer = new EffectComposer(renderer, solverRTs);
  addVelocityComposer.renderToScreen = false;
  const addVelocityMatUniforms = {
    sourceTex: {value: null},
    tempSolverTex: {value: null},
    tempPrevTex: {value: null},
  };
  const addVelocityShader = new THREE.RawShaderMaterial({
    uniforms: addVelocityMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: AddVelocity,
    glslVersion: THREE.GLSL3,
  });
  addVelocityPass = new ShaderPass(addVelocityShader);
  addVelocityPass.uniforms.sourceTex.value = sourceRTs.texture[0];
  addVelocityPass.uniforms.tempSolverTex.value = tempSolverRTs.texture[0];
  addVelocityPass.uniforms.tempPrevTex.value = tempSolverRTs.texture[1];
  addVelocityComposer.addPass(addVelocityPass);

  //1-2 外力をコピー
  swapSolverComposer = new EffectComposer(renderer, tempSolverRTs);
  swapSolverComposer.renderToScreen = false;
  const swapSolverMatUniforms = {
    sourceTex: {value: null},
    prevTex: {value: null},
  };
  const swapSolverShader = new THREE.RawShaderMaterial({
    uniforms: swapSolverMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: SwapSolver,
    glslVersion: THREE.GLSL3,
  });
  swapSolverPass = new ShaderPass(swapSolverShader);
  swapSolverPass.uniforms.sourceTex.value = solverRTs.texture[0];
  swapSolverPass.uniforms.prevTex.value = solverRTs.texture[1];
  swapSolverComposer.addPass(swapSolverPass);

  //2-0 速度を拡散
  diffuseVelocityComposer = new EffectComposer(renderer, solverRTs);
  diffuseVelocityComposer.renderToScreen = false;
  const diffuseVelocityMatUniforms = {
    tempSolverTex: {value: null},
    tempPrevTex: {value: null},
  };
  const diffuseVelocityShader = new THREE.RawShaderMaterial({
    uniforms: diffuseVelocityMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: DiffuseVelocity,
    glslVersion: THREE.GLSL3,
  });
  diffuseVelocityPass = new ShaderPass(diffuseVelocityShader);
  diffuseVelocityPass.uniforms.tempSolverTex.value = tempSolverRTs.texture[0];
  diffuseVelocityPass.uniforms.tempPrevTex.value = tempSolverRTs.texture[1];
  diffuseVelocityComposer.addPass(diffuseVelocityPass);

  //3-0 密度の外力項を計算
  addDensityComposer = new EffectComposer(renderer, solverRTs);
  addDensityComposer.renderToScreen = false;
  const addDensityMatUniforms = {
    tempSolverTex: {value: null},
    tempPrevTex: {value: null},
  };
  const addDensityShader = new THREE.RawShaderMaterial({
    uniforms: addDensityMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: AddDensity,
    glslVersion: THREE.GLSL3,
  });
  addDensityPass = new ShaderPass(addDensityShader);
  addDensityPass.uniforms.tempSolverTex.value = tempSolverRTs.texture[0];
  addDensityPass.uniforms.tempPrevTex.value = tempSolverRTs.texture[1];
  addDensityComposer.addPass(addDensityPass);

  //4-0 密度を拡散
  diffuseDensityComposer = new EffectComposer(renderer, solverRTs);
  diffuseDensityComposer.renderToScreen = false;
  const diffuseDensityMatUniforms = {
    tempSolverTex: {value: null},
    tempPrevTex: {value: null},
  };
  const diffuseDensityShader = new THREE.RawShaderMaterial({
    uniforms: diffuseDensityMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: DiffuseDensity,
    glslVersion: THREE.GLSL3,
  });
  diffuseDensityPass = new ShaderPass(diffuseDensityShader);
  diffuseDensityPass.uniforms.tempSolverTex.value = tempSolverRTs.texture[0];
  diffuseDensityPass.uniforms.tempPrevTex.value = tempSolverRTs.texture[1];
  diffuseDensityComposer.addPass(diffuseDensityPass);

  //00-0 レンダリング
  drawResultComposer = new EffectComposer(renderer, resultRTs);
  drawResultComposer.renderToScreen = false;
  const drawResultMatUniforms = {
    solverTex: {value: null},
    prevResultTex: {value: null},
  };
  const drawResultShader = new THREE.RawShaderMaterial({
    uniforms: drawResultMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: DrawResult,
    glslVersion: THREE.GLSL3,
  });
  drawResultPass = new ShaderPass(drawResultShader);
  drawResultPass.uniforms.solverTex.value = solverRTs.texture[0];
  drawResultPass.uniforms.prevResultTex.value = prevResultRTs.texture[0];
  drawResultComposer.addPass(drawResultPass);

  //結果をswap
  swapResultComposer = new EffectComposer(renderer, prevResultRTs);
  swapResultComposer.renderToScreen = false;
  const swapResultMatUniforms = {
    resultTex: {value: null},
  };
  const swapResultShader = new THREE.RawShaderMaterial({
    uniforms: swapResultMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: SwapResult,
    glslVersion: THREE.GLSL3,
  });
  swapResultPass = new ShaderPass(swapResultShader);
  swapResultPass.uniforms.resultTex.value = resultRTs.texture[0];
  swapResultComposer.addPass(swapResultPass);

  //prevResultに初期画像を描画
  initResultComposer = new EffectComposer(renderer, prevResultRTs);
  initResultComposer.renderToScreen = false;
  const initResultMatUniforms = {
    srcTex: {value: null},
  };
  const initResultShader = new THREE.RawShaderMaterial({
    uniforms: initResultMatUniforms,
    vertexShader: BasicVert,
    fragmentShader: InitResult,
    glslVersion: THREE.GLSL3,
  });
  initResultPass = new ShaderPass(initResultShader);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(sampleTex, function (texture) {
    initResultPass.uniforms.srcTex.value = texture;
    initResultComposer.addPass(initResultPass);
    initResultComposer.render();
    finishInit = true;
  });
}

function addCamera() {
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.set(0, 0, 1);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
}

function addObject() {
  geometry = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.MeshBasicMaterial({map: resultRTs.texture[0]});
  // const mat = new THREE.MeshBasicMaterial({map: texture});
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
  if (!finishInit) return;

  if (isDragging) {
    addVelocityComposer.render();
    swapSolverComposer.render();
  }
  diffuseVelocityComposer.render();
  swapSolverComposer.render();
  if (isDragging) {
    addDensityComposer.render();
    swapSolverComposer.render();
  }

  // diffuseDensityComposer.render();
  // swapSolverComposer.render();

  drawResultComposer.render();
  swapResultComposer.render();

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
