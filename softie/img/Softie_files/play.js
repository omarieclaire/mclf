import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;

init();
animate();

function init() {

  container = document.getElementById('container');

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 200);

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('img/waternormals.jpeg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 10;
  skyUniforms['mieCoefficient'].value = 0.009;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    inclination: 0.49,
    azimuth: 0.205
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;

  }

  updateSun();
 
  //

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const boxGeom = new THREE.BoxGeometry(1, 1, 1);
  const centerSpGeom = new THREE.SphereGeometry(10, 300, 2, 30);
  const tinySphereGeom = new THREE.SphereGeometry(2, 30, 20, 30);
  
  const material = new THREE.MeshStandardMaterial({ roughness: 0 });
  const brightMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});

  mesh = new THREE.Mesh(geometry, material);
  const cube = new THREE.Mesh(centerSpGeom, brightMaterial);

  scene.add(mesh);
  scene.add(cube);


  function makeInstance(geometry, color, x, y, z) {
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(tinySphereGeom, material);
    scene.add(cube);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    return cube;
  }

  const tinySph = [
    makeInstance(boxGeom, 0x8844aa, -10, 50, 10),
    makeInstance(boxGeom, 0xaa8844, 10, 50, 10),
    makeInstance(boxGeom, 0x8844aa, -20, 50, 10),
    makeInstance(boxGeom, 0xaa8844, 20, 50, 10),
  ];

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./img/face2.glb', (gltf) => {
    const root = gltf.scene;
    scene.add(root);

// const torusGeo = new THREE.TorusKnotGeometry( 80, .3, 10000, 60, 3, 2);
// const torusKnot = new THREE.Mesh( torusGeo, brightMaterial );
// scene.add( torusKnot );
// torusKnot.position.set(0, -10, 10);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  // GUI

  const gui = new GUI();

  const folderSky = gui.addFolder('Sky');
  folderSky.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun);
  folderSky.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun);
  folderSky.open();

  const waterUniforms = water.material.uniforms;

  const folderWater = gui.addFolder('Water');
  folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
  folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
  folderWater.add(waterUniforms.alpha, 'value', 0.9, 1, .001).name('alpha');
  folderWater.open();

  //

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);
  render();
  stats.update();

}

function render() {

  const time = performance.now() * 0.001;

  mesh.position.y = Math.sin(time) * 20 + 5;
  mesh.rotation.x = time * 0.5;
  mesh.rotation.z = time * 0.51;

  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);

}






//       // compute the box that contains all the stuff
//       // from root and below
//       const box = new THREE.Box3().setFromObject(root);

//       const boxSize = box.getSize(new THREE.Vector3()).length();
//       const boxCenter = box.getCenter(new THREE.Vector3());

//       // set the camera to frame the box
//       frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

//       // update the Trackball controls to handle the new size
//       controls.maxDistance = boxSize * 10;
//       controls.target.copy(boxCenter);
//       controls.update();
//     });
//   }

  

  // const ncolor = 0xFFFFFF;
  // const nintensity = 1;
  // const nlight = new THREE.DirectionalLight(ncolor, nintensity);
  // nlight.position.set(-1, 2, 4);
  // scene.add(nlight);

//     const color = 0xFFFFFF;
//   const intensity = 3;
//   const light = new THREE.PointLight(color, intensity);
//   scene.add(light);


//   function resizeRendererToDisplaySize(renderer) { //no longer distorted when someone resizes the window
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) { // if the canvas has been resized
//       renderer.setSize(width, height, false); //use clientWidth and clientHeight to set the canvas's drawingbuffer size (resolution)
//     }
//     return needResize;
//   }

//   function render(time) {
//     if (resizeRendererToDisplaySize(renderer)) { //use the function above to render
//       const canvas = renderer.domElement;
//       camera.aspect = canvas.clientWidth / canvas.clientHeight;
//       camera.updateProjectionMatrix();
//     }

//     time *= 0.001;  // convert time to seconds

//     cube.rotation.x = time/4;
//     cube.rotation.y = time/4;
//     torusKnot.rotation.x = time/40;
//     torusKnot.rotation.y = time/40;

//     renderer.render(scene, camera); //pass scene and camera to the renderer, SHOW the scene

//     requestAnimationFrame(render); // requestAnimationFrame is a request to the browser that you want to animate something. You pass it a function to be called. In our case that function is render
//   }

//   requestAnimationFrame(render);
// }

// main();




function windowOnLoad() {
  var currBtn;

  const song1 = new Audio("audio/love.mp3");
  const song2 = new Audio("audio/ask.mp3");
  const song3 = new Audio("audio/face.mp3");
  const song4 = new Audio("audio/hey.mp3");
  const song5 = new Audio("audio/numb.mp3");
  const song6 = new Audio("audio/why.mp3");

  const songs = [song1, song2, song3, song4, song5, song6];

  var video = document.getElementById("video");
  var source = document.createElement("source");
  video.appendChild(source);

  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");
  const btn3 = document.getElementById("btn3");
  const btn4 = document.getElementById("btn4");
  const btn5 = document.getElementById("btn5");
  const btn6 = document.getElementById("btn6");

  btn1.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn1);
      source.setAttribute("src", "img/v1.mp4");
      video.load();
      playSong(song1);
    },
    false
  );
  btn2.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn2);
      source.setAttribute("src", "img/v2.mp4");
      video.load();
      playSong(song2);
    },
    false
  );
  btn3.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn3);
      source.setAttribute("src", "img/v3.mp4");
      video.load();
      playSong(song3);
    },
    false
  );
  btn4.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn4);
      source.setAttribute("src", "img/v4.mp4");
      video.load();
      playSong(song4);
    },
    false
  );
  btn5.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn5);
      source.setAttribute("src", "img/v5.mp4");
      video.load();
      playSong(song5);
    },
    false
  );
  btn6.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn6);
      source.setAttribute("src", "img/v6.mp4");
      video.load();
      playSong(song6);
    },
    false
  );

  function updateBtnStyle(clickedBtn) {
    // remove the class from the old button (which is the "current" button)
    if (currBtn !== undefined) {
      currBtn.classList.remove("currBtn");
    }
    currBtn = clickedBtn; // update the "current" button to the most recently clicked button
    clickedBtn.classList.add("currBtn");
  }

  function playSong(song) {
    for (let i = 0; i < songs.length; i++) {
      songs[i].pause();
    }
    song.play();
  }


}

window.addEventListener("load", windowOnLoad);

