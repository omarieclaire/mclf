import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { BufferGeometryUtils } from "./node_modules/three/examples/jsm/utils/BufferGeometryUtils.js";

import { SimplifyModifier } from './node_modules/three/examples/jsm/modifiers/SimplifyModifier.js';

var firebaseConfig = {
  apiKey: "AIzaSyDiCOSmTc5a0U0m4jY4D8s7ZXZ6ab5NTWo",
  authDomain: "sanctuary-76c32.firebaseapp.com",
  projectId: "sanctuary-76c32",
  storageBucket: "sanctuary-76c32.appspot.com",
  messagingSenderId: "656056199487",
  appId: "1:656056199487:web:278a2511cfb83f7798cb8a",
  measurementId: "G-TDGFN204SM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let container, stats;
let camera, scene, raycaster, renderer;
// let cloudParticles = [];

let controls, water, sun, centerObj;
let newText;
let INTERSECTED;
let theta = 0;
let currFriendModalDiv = undefined;
let modalOpen = false;
const mouse = new THREE.Vector2();
let boxGroup;
let boxSpeeds = [];
const radius = 100;
let toggleOpen = false;
let objects = [];
let numberOfFriends = 40;

let sparkUniforms, sparkGeometry;
const sparkles = 1;
const sparkleFriendMap = {};


let database = firebase.database();
let ref = database.ref();
let msgsRef = ref.child('msg');

let username = "";
let friendOrbs = {};
let friendQuestions = {
  0: "What did you learn today?",
  1: "What does it mean?",
  2: "Where does the time go?",
  3: "Where are you from?",
  4: "Who inspires you?",
  5: "How do you learn?",
  6: "Who do you love?",
  7: "When did you last rest?",
  8: "Do you wish you had more?",
  9: "Can you imagine a better way?",
  10: "What is a strange thing you know?",
  11: "What is at the bottom?",
  12: "Have you ever failed?",
  13: "What is the perfect day?",
  14: "Who do you wish you could speak to?",
  15: "What are you grateful for?",
  16: "If you had a secret hour every day how would you spend it?",
  17: "What is your earliest memory of play?",
  18: "What does friendship mean to you?",
  19: "What song will you listen to right now?",
  20: "How does your body feel?",
  21: "What are you curious about?",
  22: "Why do you get up in the morning?",
  23: "What book changed your life?",
  24: "Where do you wish you could go?",
  25: "Would you choose peace, love, or joy?",
  26: "What meal would you like to eat?",
  27: "What is something you shared with someone?",
  28: "Tell us about a dream?",
  29: "Tell us a fact?",
  30: "Tell us a story in 10 words?",
  31: "What are you looking forward to?",
  32: "Describe a peaceful place?",
  33: "Describe a perfect day?",
  34: "Describe a good question",
  35: "Describe a good friend",
  36: "Describe a peaceful evening",
  37: "Where is home?",
  38: "Where have you been?",
  39: "Where have you never been?",
  40: "Where is the good life?",
  41: "Why are you happy?",
  42: "What gift would you like to give?",
  43: "How have you changed someone's life?",
  44: "What is a beloved tree?",
  45: "What is a beloved animal?",
  46: "When did you last stretch?",
  47: "What can you hear right now?",
  48: "When you turn around, what do you see?",
  49: "Where could you walk today?",
  50: "Describe a beloved soft thing",
  51: "Describe a beloved smell?",
  52: "Where do you wish you were?",
  53: "When did you last dance?",
  54: "What do your hands want to do?",
  55: "What does your face want to do?",
  56: "How do you feel?",
  57: "What are you thinking about?",
  58: "What soft surface can you touch right now",
  59: "What are you hoping for?",
  60: "What is behind you?"
};

const initialFriendYPositions = [];
for (let i = 0; i < numberOfFriends; i++) {
  initialFriendYPositions.push(Math.random());
}

function windowOnLoad() {
  init();
  animate();

  function makeSparkles(spSource, spSpread, spLight, spSize, spQuant, willFade) {
    sparkUniforms = {
      pointTexture: { value: new THREE.TextureLoader().load("img/spark1.png") }
    };
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: sparkUniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.2,
      vertexColors: true
    });

    const sparkRadius = spSpread; //how wide they spread out
    sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions = [];
    const sparkColors = [];
    const sparkSizes = [];
    const sparkColor = new THREE.Color();

    for (let i = 0; i < spQuant; i++) {
      sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);
      sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);
      sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);

      let tempHue = Math.random() * 0xffffff
      sparkColor.setHSL(tempHue, 1.0, spLight);
      sparkColors.push(sparkColor.r, sparkColor.g, sparkColor.b);
      sparkSizes.push(spSize);
    }

    sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sparkColors, 3));
    sparkGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sparkSizes, 1).setUsage(THREE.DynamicDrawUsage));
    let sparkleSystem = new THREE.Points(sparkGeometry, shaderMaterial);
    // console.log(particleSystem);
    sparkleFriendMap[spSource.friendID] = sparkleSystem;

    spSource.add(sparkleSystem);

    if (willFade == true) {
      let i = 1;

      function fadeThoseSparkles() {
        // sparkleSystem
        // shaderMaterial.opacity = 0.1;
        // spSource.remove(sparkleSystem);
      }

      setTimeout(function run() {
        console.log(i);
        i++;
        setTimeout(fadeThoseSparkles, 100);
      }, 100);
    } else {
      // do nothing
    }

  }

  function init() {

    container = document.getElementById('container');

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
      // sun.scale.set(10, 10 10);

      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;

    }

    updateSun();

    let ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);

    const color = 0xFFFFFF;
    const intensity = .5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
    //  

    const ncolor = 0xFFFFFF;
    const nintensity = 1;
    const nlight = new THREE.DirectionalLight(ncolor, nintensity);
    nlight.position.set(-1, 2, 4);
    scene.add(nlight);

    //   let directionalLight = new THREE.DirectionalLight(0xff8c19);
    // directionalLight.position.set(0,0,1);
    // scene.add(directionalLight);

    scene.fog = new THREE.FogExp2(15655413, 0.0002);
    renderer.setClearColor(scene.fog.color);
    //

    // let loader = new THREE.TextureLoader();
    // loader.load("./img/psmoke.png", function (texture) {
    //   //texture is loaded
    //   let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    //   let cloudMaterial = new THREE.MeshLambertMaterial({
    //     map: texture,
    //     transparent: true
    //   });

    //   for (let p = 0; p < 50; p++) {
    //     let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    //     cloud.position.set(
    //       Math.random() * 800 - 400,
    //       500,
    //       Math.random() * 500 - 500
    //     );
    //     cloud.rotation.x = 1.16;
    //     cloud.rotation.y = -0.12;
    //     cloud.rotation.z = Math.random() * 2 * Math.PI;
    //     cloud.scale.multiplyScalar(2.5);
    //     cloud.material.opacity = 0.25;
    //     cloudParticles.push(cloud);
    //     scene.add(cloud);
    //   }
    // });

    const centerObjGeom = new THREE.SphereGeometry(10, 300, 2, 30);
    const tinySphereGeom = new THREE.SphereGeometry(2, 30, 20, 30);
    const brightMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });

    // mesh = new THREE.Mesh(geometry, material);

    ///test area for sun
    const friendWorldd = new THREE.Object3D();
    scene.add(friendWorldd);
    objects.push(friendWorldd);

    centerObj = new THREE.Mesh(centerObjGeom, brightMaterial);
    centerObj.scale.set(1, 1, 1);
    friendWorldd.add(centerObj);
    objects.push(centerObj);


    const earthMaterial = new THREE.MeshPhongMaterial({ color: 3093151, opacity: 0.5, transparent: true, emissive: 1 })
    // const earthMesh = new THREE.Mesh(tinySphereGeom, earthMaterial);
    // earthMesh.position.x = 20;
    // earthMesh.position.y = 8;
    // earthMesh.scale.set(2, 2, 2);

    // friendWorld.add(earthMesh);
    // objects.push(earthMesh);

    // function makeTinyRotatorInstance(geometry, color, x, y, z) {
    //   let iMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff, opacity: 0.5, transparent: true, emissive: 1 })
    //   const tinyRotator = new THREE.Mesh(tinySphereGeom, iMaterial);
    //   tinyRotator.position.x = x;
    //   tinyRotator.position.y = y;
    //   tinyRotator.position.z = z;
    //   tinyRotator.scale.set(.3, .3, .3);
    //   return tinyRotator;
    // }

    // const tinyRotat = [];

    // for (let i = -10; i < 10; i++) {
    //   let x = Math.random() * 40 - 25;
    //   let y = Math.random() * 15 - 5; // 100
    //   let z = Math.random() * 30 - 10; //-200
    //   let rotat = makeTinyRotatorInstance(centerObjGeom, 0x8844aa, x, y, z);
    //   friendWorldd.add(rotat);
    //   objects.push(rotat);
    // }

    function makeTinyGlowSphereInstance(geometry, color, x, y, z) {
      const tinyGlowSphere = new THREE.Mesh(tinySphereGeom, brightMaterial);
      scene.add(tinyGlowSphere);
      tinyGlowSphere.position.x = x;
      tinyGlowSphere.position.y = y;
      tinyGlowSphere.position.z = z;
      return tinyGlowSphere;
    }

    const tinySph = [
      makeTinyGlowSphereInstance(centerObjGeom, 0x8844aa, -10, 0, 10),
      makeTinyGlowSphereInstance(centerObjGeom, 0xaa8844, 10, 0, 10),
      makeTinyGlowSphereInstance(centerObjGeom, 0x8844aa, 0, 0, 0),
      // makeInstance(centerSpGeom, 0xaa8844, 20, 0, 10),
    ];



    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.499;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 400.0;
    controls.update();

    const geometry = new THREE.TorusKnotGeometry(10, 6, 100, 14, 4, 2);
    boxGroup = new THREE.Group();

    function setupObject(obj, id, group, speeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, objScale) {
      // console.log(`setup id ${id}`);
      obj.scale.multiplyScalar(objScale);
      obj.traverse((o) => {
        if (o.isMesh) {
          o.friendID = id;
          o.material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, opacity: 0.5, transparent: true, })
        }
      });

      obj.friendID = id;

      obj.position.x = positionX;
      obj.position.y = positionY;
      obj.position.z = positionZ;

      obj.rotation.x = rotationX;
      obj.rotation.y = rotationY;
      obj.rotation.z = rotationZ;

      group.add(obj);
      speeds.push(Math.random());
      // console.log('===');
    }

    function makeFriendModal(friendID, id) {
      let container = document.getElementById("container");
      let friendModalDiv = document.createElement("div");
      // let innerFriendWrapper = document.createElement("div");
      let printFriendNumberDiv = document.createElement("div");
      let friendNumber = document.createTextNode("#" + friendID);    // Create a text node
      let infoTextDiv = document.createElement("div");
      let hr = document.createElement("hr");
      let newInfoText = document.createTextNode(`${friendQuestions[id]}`);    // Create a text node
      let printTextDiv = document.createElement("div");
      let printText = document.createTextNode(" ");    // Create a text node
      let formDiv = document.createElement("div");
      let form = document.createElement("form");
      let textInput = document.createElement("input");
      let submitInput = document.createElement("input");
      let closeModalBtnDiv = document.createElement("div")
      let closeModalBtn = document.createElement("div")


      friendModalDiv.id = "friendModalDivID" + friendID;
      printTextDiv.id = "printTextDivID" + friendID;
      textInput.id = "textInput" + friendID;

      printFriendNumberDiv.classList.add("printFriendNumberDiv");
      hr.classList.add("hr");
      infoTextDiv.classList.add("infoTextDiv");
      friendModalDiv.classList.add("friendModalDiv");
      printTextDiv.classList.add("printTextDiv");
      formDiv.classList.add("formDiv");
      form.classList.add("chat");
      closeModalBtnDiv.classList.add("closeModalBtnDiv");
      closeModalBtn.classList.add("closeModalBtn");

      textInput.type = "text";
      textInput.placeholder = "";
      submitInput.type = "submit";
      submitInput.value = "send";

      printFriendNumberDiv.appendChild(friendNumber);
      printTextDiv.appendChild(printText);
      infoTextDiv.appendChild(newInfoText);
      infoTextDiv.appendChild(hr);

      formDiv.appendChild(form);
      form.appendChild(textInput);
      form.appendChild(submitInput);
      closeModalBtnDiv.appendChild(closeModalBtn);

      friendModalDiv.insertBefore(formDiv, friendModalDiv.childNodes[0]);
      container.insertBefore(friendModalDiv, container.childNodes[0]);
      friendModalDiv.insertBefore(printTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(infoTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(printFriendNumberDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(closeModalBtnDiv, friendModalDiv.childNodes[0]);

      submitInput.addEventListener("click", function (event) {
        event.preventDefault()
        if (textInput.value == "") {
          textInput.focus();
          return;
        } else {
          let ref2 = msgsRef.child(`${friendID}`).child('msgs');
          // console.log(ref2);
          ref2.push({
            username: username,
            msg: textInput.value
          });
          textInput.value = "";
          textInput.focus();
        }
      });

      closeModalBtn.addEventListener("click", function (event) {
        console.log("click");
        friendModalDiv.classList.remove("openFriendModalDiv");
      })

    }

    // makefriendorbs
    for (let i = 0; i < numberOfFriends; i++) {

      const positionX = Math.random() * 800 - 500;
      const positionY = Math.random() * 150 - 5; // 100
      const positionZ = Math.random() * 600 - 400; //-200

      const rotationX = Math.random() * 2 * Math.PI;
      const rotationY = Math.random() * 2 * Math.PI;
      const rotationZ = Math.random() * 2 * Math.PI;


      let object = new THREE.Mesh(tinySphereGeom, brightMaterial);
      object.scale.set(.03, .03, .03);
      scene.add(object);

      const gltfLoader = new GLTFLoader();
      gltfLoader.load('./img/friend2.glb', (gltf) => {
        let friendShape = gltf.scene;
        setupObject(friendShape, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 20);
      });

      // const gltfLoader2 = new GLTFLoader();
      // gltfLoader2.load('./img/oct.glb', (gltf) => {
      //   let oct = gltf.scene;
      //   setupObject(oct, i, boxGroup, boxSpeeds, 10, 10, 10, rotationX, rotationY, rotationZ, 30);
      // });

      friendOrbs[i] = object;

      setupObject(object, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 1);
      makeFriendModal(object.friendID, i);

    }
    //all friends created 

    scene.add(boxGroup);

    raycaster = new THREE.Raycaster();
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

  }

  let loadingScreenDiv = document.getElementById("loadingScreenDiv");
  let submitUsername = document.getElementById("submitUsername");

  submitUsername.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      let currUsername = document.getElementById("username").value;
      // console.log(currUsername);
      if (currUsername != "") {
        console.log("good name");
        let usernameForm = document.getElementById("usernameForm");
        // usernameForm.innerHTML = "Welcome " + username;
      } else {
        console.log("no name");
        // currUsername = "anon"
        return
      }
      localStorage.setItem('name', currUsername);
      username = nameDisplayCheck();

      loadingScreenDiv.classList.add("fade");
      setTimeout(function () { loadingScreenDiv.style.display = "none"; }, 600);
    },
    false
  );

  // const h1 = document.querySelector('h1');
  function nameDisplayCheck() {
    if (localStorage.getItem('name')) {
      let name = localStorage.getItem('name');
      return name;
      // h1.textContent = 'Welcome, ' + name;
    } else {
      // h1.textContent = 'Welcome to our website ';
    }
  }


  function gotData(data) {
    // if we didn't use .val we'd get a bunch of other info
    let msgDatabase = data.val();
    // console.log(msgDatabase);
    let keys = Object.keys(msgDatabase);
    // console.log(`keys: ${keys}`);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      var friendMsgs = msgDatabase[k].msgs;

      if (typeof (friendMsgs) === 'undefined') { //deal with empty friends
        friendMsgs = {};
      }

      let friendMsgsKeys = Object.keys(friendMsgs);

      let txtDivToUpdate = document.getElementById("printTextDivID" + k);
      // console.log(txtDivToUpdate);
      txtDivToUpdate.innerHTML = '';
      let ulNode = document.createElement('UL');
      txtDivToUpdate.appendChild(ulNode);

      for (let j = 0; j < friendMsgsKeys.length; j++) {
        let friendMsgKey = friendMsgsKeys[j];
        let msg = friendMsgs[friendMsgKey];

        let liNode = document.createElement('li');
        ulNode.appendChild(liNode);

        let span = document.createElement("span");
        span.classList.add("username");
        let msgTextNode = document.createTextNode(`${msg.msg}`);
        let usernameTextNode = document.createTextNode(`${msg.username}: `);

        // let msgText = `${msg.msg} -${msg.username}`;
        // let msgTextNode = document.createTextNode(msgText);
        span.appendChild(usernameTextNode);
        liNode.appendChild(span);
        liNode.appendChild(msgTextNode);
      }
      function scrollToTopOfDiv(txtDivToUpdate) {
        // var objDiv = document.getElementById("your_div");
        txtDivToUpdate.scrollTop = txtDivToUpdate.scrollHeight;
      }
      scrollToTopOfDiv(txtDivToUpdate);

    }
  }
  function errData() {
    console.log("error");
  }
  // takes event (value), then callback, then error)
  msgsRef.on('value', gotData, errData); //callback for receive data, then for err data

  let ORBS_WITH_SPARKLES = {};

  for (let j = 0; j < numberOfFriends; j++) {
    let newItems = false;
    msgsRef.child(`${j}/msgs`).limitToLast(1).on('child_added', function (snapshot, prevKey) {
      let msg = snapshot.val();

      // get a reference to the orb
      let orb = friendOrbs[j];

      // add sparkles to the orb spSource, spSpread, spLight, spSize, spQuant
      makeSparkles(orb, 12.5, 0.1, 30, 5, false);

      // keep track of the orbs with sparkles
      ORBS_WITH_SPARKLES[j] = true;

      if (newItems) {
        if (msg.username == username) {
          console.log("don't display sparkles");
        } else {
          console.log(j, snapshot.val());
        }
      } else {
        // console.log(`${j}: not a new item`);
      }


      newItems = true;

    });
  }

  function takeModalIDReturnMsg(currModalID) {
    // console.log(currModalID);
    return "Welcome to orb " + currModalID;
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function animate() {

    requestAnimationFrame(animate);
    render();
    // stats.update();

  }

  function render() {
    const time = performance.now() * 0.0001;

    // cloudParticles.forEach(p => {
    //   p.rotation.z -= 0.001;
    // });

    centerObj.position.y = Math.sin(time) * 20 + 5;
    centerObj.rotation.x = time * 0.5;
    centerObj.rotation.z = time * 0.51;

    for (let i = 0; i < boxGroup.children.length; i++) {
      // let random = Math.random() * -.05 - .08; // 100
      const randomSpeedForThisBox = boxSpeeds[i];
      // boxGroup.children[i].position.y = Math.sin(time + initialPositions[i]*20) * 40 + 15;
      boxGroup.children[i].position.y = Math.sin(time) * 40 + 15;
      // boxGroup.children[i].position.y = Math.sin(time) * 40 + 35;



      // boxGroup.children[i].position.y = Math.sin(randomSpeedForThisBox * time) * 80 + 15;
      boxGroup.children[i].rotation.x = Math.sin(time) * 2 + 1;
      boxGroup.children[i].rotation.z = Math.sin(time) * 5 + 1;

    }

    objects.forEach((obj) => {
      obj.rotation.y = time;
    });


    water.material.uniforms['time'].value += 1.0 / 60.0;


    camera.updateMatrixWorld();

    //mouse stuff
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(boxGroup.children, true);

    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED) {
          INTERSECTED.traverse((o) => {
            if (o.isMesh) {
              o.material.emissive.setHex(o.currentHex);
            }
          });
        }
        INTERSECTED = intersects[0].object;
        INTERSECTED.traverse((o) => {
          if (o.isMesh) {
            o.currentHex = o.material.emissive.getHex();
            o.material.emissive.setHex(0xff0000);
          }
        });

        //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        //INTERSECTED = intersects[ 0 ].object;
        //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        //INTERSECTED.material.emissive.setHex( 0xff0000 );
      }
    } else {
      if (INTERSECTED) {
        // loop over intersected meshes and reset their
        // Hex to the "currentHex" (which is the old hex?)
        // equivalent to:
        //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED.traverse((o) => {
          if (o.isMesh) {
            o.material.emissive.setHex(o.currentHex);
          }
        });

      }
      INTERSECTED = null;
    }

    // particles start 

    // particleSystem.rotation.z = 0.01 * time;
    // const sizes = pGeometry.attributes.size.array;
    // for (let i = 0; i < particles; i++) {
    //   sizes[i] = 10 * (1 + Math.sin(0.1 * i + time));
    // }
    // pGeometry.attributes.size.needsUpdate = true;

    // particles end 



    renderer.render(scene, camera);
  }

  renderer.domElement.addEventListener('click', onClick, false);
  renderer.domElement.addEventListener("touchend", onTouch, false);
  document.body.appendChild(renderer.domElement); // does this even do anything?


  function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  function onClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    clickOrTouchFriendOrbs(event);

  }

  function onTouch(event) {
    event.preventDefault();
    mouse.x = (event.pageX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.pageY / window.innerHeight) * 2 + 1;
    clickOrTouchFriendOrbs(event);
  }

  function clickOrTouchFriendOrbs(event) {
    raycaster.setFromCamera(mouse, camera);

    // close modals when clicking outside them - this works but not as expected
    var modal = document.getElementsByClassName('friendModalDiv');
    if (event.target.classList.contains('friendModalDiv')) {
      // console.log(`clicking inside modal: ${event}`);
    } else {
      // console.log(`clicking outside modal: ${event}`);
      for (var i = 0; i < modal.length; i++) {
        let currModal = modal[i];
        currModal.classList.remove("openFriendModalDiv");
      }
    }

    let intersectsCenterObj = raycaster.intersectObjects([centerObj], true);
    if (intersectsCenterObj.length > 0) {
      // spSource, spSpread, spLight, spSize, spQuant
      makeSparkles(centerObj, 400, .2, 16, 3000, true);
    }

    let intersectsFriend = raycaster.intersectObjects(boxGroup.children, true);
    if (intersectsFriend.length > 0) { //you know you have an intersection
      // document.getElementById("wrapper").classList.add("openWrapper");

      if (wrapper.classList.contains("openWrapper")) {
        wrapper.classList.remove("openWrapper");
        wrapperBtn.classList.add("wrapperBtnClosing");
        toggleOpen = false;
      }

      //let currFriendID = intersectsFriend[0].object.parent.friendID; //grab the id of the friend
      let currFriendID = intersectsFriend[0].object.friendID; //grab the id of the friend

      let currModalID = "friendModalDivID" + currFriendID; //form the modal ID
      currFriendModalDiv = document.getElementById(currModalID); //grad the current Modal
      currFriendModalDiv.classList.add("openFriendModalDiv")
      modalOpen = true;

      let msg = takeModalIDReturnMsg(currFriendID);
      let currTextDiv = document.getElementById("textInputID" + currFriendID);
      //currTextDiv.innerHTML = msg;

      for (let i = 0; i < intersectsFriend.length; i++) {
        let currObj = intersectsFriend[i].object;
        currObj.traverse((o) => {
          if (o.isMesh) {
            o.material.emissive.setHex(3135135);
          }
        });
      }
      let currentOrb = friendOrbs[currFriendID];
      currentOrb.remove(sparkleFriendMap[currentOrb.friendID]);

    }
  }


  let currBtn;

  const song1 = new Audio("audio/love.mp3");
  const song2 = new Audio("audio/ask.mp3");
  const song3 = new Audio("audio/face.mp3");
  const song4 = new Audio("audio/hey.mp3");
  const song5 = new Audio("audio/numb.mp3");
  const song6 = new Audio("audio/why.mp3");

  const songs = [song1, song2, song3, song4, song5, song6];

  // let video = document.getElementById("video");
  // let source = document.createElement("source");
  // video.appendChild(source);

  const wrapper = document.getElementById("wrapper");
  const wrapperBtn = document.getElementById("wrapperBtn");
  const wrapperToggleDiv = document.getElementById("wrapperToggleDiv");

  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");
  const btn3 = document.getElementById("btn3");
  // const btn4 = document.getElementById("btn4");
  // const btn5 = document.getElementById("btn5");
  // const btn6 = document.getElementById("btn6");

  document.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
        // console.log("toggle is closed - return");
        // return;
      } else {
        // console.log("toggle is open");
        if (event.target.classList.contains(wrapper)) { // || event.target.contains( wrapper )
          // console.log("clicking on wrapper or button - return");
          // return;
        } else {
          console.log("clicking on world - run code");

          // if (wrapper.classList.contains("openWrapper")) {
          //   wrapper.classList.remove("openWrapper");
          //   wrapperBtn.classList.add("wrapperBtnClosing");
          //   toggleOpen = false;
          // }
        }
      }
    },
  );

  wrapperBtn.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
        // console.log("toggle is opening");
        if (wrapperBtn.classList.contains('wrapperBtnClosed')) {
          wrapperBtn.classList.remove("wrapperBtnClosed");
        }
        if (wrapperBtn.classList.contains('wrapperBtnClosing')) {
          wrapperBtn.classList.remove("wrapperBtnClosing");
        }
        wrapperBtn.classList.add("wrapperBtnOpening");
        wrapper.classList.add("openWrapper");
        toggleOpen = true;
        // console.log(`toggle should be open ${toggleOpen}`);
      } else {
        console.log("toggle is closing");
        if (wrapperBtn.classList.contains('wrapperBtnOpening')) {
          wrapperBtn.classList.remove("wrapperBtnOpening");
        }
        wrapperBtn.classList.add("wrapperBtnClosing");
        wrapper.classList.remove("openWrapper");
        toggleOpen = false;
        // console.log(`toggle should be closed ${toggleOpen}`);


      }
      // toggleOpen != toggleOpen
      // console.log(toggleOpen);
      // toggleOpen
    },
  );

  btn1.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn1);
      // source.setAttribute("src", "img/v1.mp4");
      // video.load();
      playSong(song1);
    },
    false
  );
  btn2.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn2);
      // source.setAttribute("src", "img/v2.mp4");
      // video.load();
      playSong(song2);
    },
    false
  );
  btn3.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn3);
      // source.setAttribute("src", "img/v3.mp4");
      // video.load();
      playSong(song3);
    },
    false
  );
  // btn4.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn4);
  //     // source.setAttribute("src", "img/v4.mp4");
  //     // video.load();
  //     playSong(song4);
  //   },
  //   false
  // );
  // btn5.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn5);
  //     // source.setAttribute("src", "img/v5.mp4");
  //     // video.load();
  //     playSong(song5);
  //   },
  //   false
  // );
  // btn6.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn6);
  //     // source.setAttribute("src", "img/v6.mp4");
  //     // video.load();
  //     playSong(song6);
  //   },
  //   false
  // );

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
    song.volume = 0.1;

    song.play();
  }

  document.body.onload = nameDisplayCheck;


}

window.addEventListener("load", windowOnLoad);

