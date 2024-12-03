// Import required Three.js modules and extensions
import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "./node_modules/three/examples/jsm/objects/Water.js";
import { Sky } from "./node_modules/three/examples/jsm/objects/Sky.js";
import { GUI } from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

THREE.ImageUtils.crossOrigin = "";

// Main application class to encapsulate all functionalities
export class ThreeJSApp {
  constructor() {
    this.container = document.getElementById("container");
    this.currentLanguage = localStorage.getItem("lang") || "es";
    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    this.theta = 0;
    this.skyBright = 10;
    this.numberOfFriends = 40;
    this.fadeAmount = 1 / this.numberOfFriends;
    this.numberOfMediQuestions = 3;
    this.soundMuted = false;
    this.initialFriendYPositions = Array.from({ length: this.numberOfFriends * 10 }, () => Math.random());
    this.sparkleFriendMap = {};
    this.boxSpeeds = [];
    this.centerObjects = [];
    this.jellyfish = [];
    this.jellyfishOnScreen = [];
    this.flyingCrullers = [];
    this.flyingCrullersOnScreen = [];
    this.flyingSpheres = [];
    this.flyingSpheresOnScreen = [];
    this.mediQuestions = [
      "Close your eyes and take 3 slow deep breaths.",
      "Stretch your muscles. Stretch your hands, your feet, your legs, your arms, your face, your neck, your back, and sink into your own softness.",
      "What do you need right now? Can you give it to yourself, even in the smallest way?",
    ];
    this.friendQuestions = [
      "What did you learn today?",
      "What does it mean?",
      "Where does the time go?",
      "Where are you from?",
      "Who inspires you?",
      "How do you learn?",
      "Who do you love?",
      "When did you last rest?",
      "Do you wish you had more?",
      "Can you imagine a better way?",
      "What is a strange thing you know?",
      "What is at the bottom?",
      "Have you ever failed?",
      "What is the perfect day?",
      "Who do you wish you could speak to?",
      "What are you grateful for?",
      "If you had a secret hour every day how would you spend it?",
      "What is your earliest memory of play?",
      "What does friendship mean to you?",
      "What song will you listen to right now?",
      "How does your body feel?",
    ];
    this.audioManager = new AudioManager();

    // cv stuff
    this.initOpenCV();

    this.noMovementDetected = false;
    this.movementTimeout = null;

    // this.init();
    // this.animate();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    window.addEventListener("load", this.onWindowLoad.bind(this));
  }

  onWindowLoad() {
    document.body.classList.remove("preload");
    this.renderLoadingPage();
    this.loadModels();
  }

  renderLoadingPage() {
    document.getElementsByName("sendYourBeautifulSelf").forEach((s) => {
      s.value = "send";
    });
  }

  mkGoodPosition() {
    return {
      x: Math.random() * 900 - 500,
      y: Math.random() * 150 - 5,
      z: Math.random() * 900 - 600,
    };
  }

  mkGoodRotation() {
    return {
      x: Math.random() * 2 * Math.PI,
      y: Math.random() * 2 * Math.PI,
      z: Math.random() * 2 * Math.PI,
    };
  }

  init() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener("click", this.onClick.bind(this), false);
    this.renderer.domElement.addEventListener("touchend", this.onTouch.bind(this), false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    this.camera.position.set(0, 0, 200);

    this.sun = new THREE.Vector3();
    this.initWater();
    this.initSky();
    this.initLights();
    this.initControls();
    this.initCenterObjects();
    this.raycaster = new THREE.Raycaster();
    this.boxGroup = new THREE.Group();
    this.scene.add(this.boxGroup);
    this.initModals();
    this.initGUI(); // Initialize the GUI

    // Initialize OpenCV.js after the library is ready
    // this.initOpenCV();

    this.setupCamera();
  }

  // cv stuff

  initOpenCV() {
    cv["onRuntimeInitialized"] = () => {
      console.log("OpenCV.js is fully initialized");
      this.init(); // Proceed with the rest of your initialization
      this.animate();
    };
  }

  // In your ThreeJSApp class:

  setupCamera() {
    console.log("Setting up camera...");
    const video = document.getElementById("videoInput");

    // Make video visible during testing
    video.style.display = "block";
    video.style.position = "fixed";
    video.style.top = "10px";
    video.style.left = "10px";
    video.style.width = "320px";
    video.style.height = "240px";
    video.style.zIndex = "1000";

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        console.log("Camera access granted");
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          video.play();
          console.log("Video playing");

          // Start processing after video is ready
          this.startVideoProcessing();
        };
      })
      .catch((err) => {
        console.error("Error accessing the camera:", err.name, err.message);
      });
  }

  startVideoProcessing() {
    if (typeof cv === "undefined") {
      console.error("OpenCV is not loaded!");
      return;
    }

    const video = document.getElementById("videoInput");
    const canvasOutput = document.getElementById("canvasOutput");

    console.log("OpenCV is loaded, starting video processing");

    // Make canvas visible during testing
    canvasOutput.style.display = "block";
    canvasOutput.style.position = "fixed";
    canvasOutput.style.top = "260px";
    canvasOutput.style.left = "10px";
    canvasOutput.style.width = "320px";
    canvasOutput.style.height = "240px";
    canvasOutput.style.zIndex = "1000";

    try {
      const cap = new cv.VideoCapture(video);
      console.log("VideoCapture created");

      const frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      const frame2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      const gray1 = new cv.Mat();
      const gray2 = new cv.Mat();
      const diff = new cv.Mat();

      console.log("Matrices created");

      let firstFrame = true;
      let frameCount = 0;

      const processVideo = () => {
        try {
          if (!video.paused && !video.ended) {
            cap.read(frame2);
            cv.cvtColor(frame2, gray2, cv.COLOR_RGBA2GRAY);

            if (firstFrame) {
              gray2.copyTo(gray1);
              firstFrame = false;
              console.log("First frame processed");
            }

            cv.absdiff(gray1, gray2, diff);
            cv.threshold(diff, diff, 25, 255, cv.THRESH_BINARY);

            // Show the processed frame
            cv.imshow("canvasOutput", diff);

            const nonZero = cv.countNonZero(diff);
            const motionPercentage = (nonZero / (diff.rows * diff.cols)) * 100;

            if (frameCount % 30 === 0) {
              console.log(`Motion: ${motionPercentage.toFixed(2)}%, Sky: ${this.skyUniforms["turbidity"].value.toFixed(2)}`);
            }
            frameCount++;

            if (motionPercentage > 0.5) {
              this.onMotionDetected();
            } else {
              this.onNoMotionDetected();
            }

            gray2.copyTo(gray1);
          }
          this.motionDetectionId = requestAnimationFrame(processVideo);
        } catch (err) {
          console.error("Video processing error:", err);
        }
      };

      processVideo();
    } catch (err) {
      console.error("Error in startVideoProcessing:", err);
    }
  }

  startVideoProcessing() {
    const video = document.getElementById("videoInput");
    const canvasOutput = document.getElementById("canvasOutput");

    const cap = new cv.VideoCapture(video);

    const frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const frame2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const gray1 = new cv.Mat();
    const gray2 = new cv.Mat();
    const diff = new cv.Mat();

    let firstFrame = true;
    let frameCount = 0;

    const processVideo = () => {
      try {
        if (!video.paused && !video.ended) {
          cap.read(frame2);
          cv.cvtColor(frame2, gray2, cv.COLOR_RGBA2GRAY);

          if (firstFrame) {
            gray2.copyTo(gray1);
            firstFrame = false;
            console.log("First frame processed");
          }

          // Compute absolute difference between frames
          cv.absdiff(gray1, gray2, diff);
          cv.threshold(diff, diff, 25, 255, cv.THRESH_BINARY);

          // Calculate the percentage of non-zero pixels (motion)
          const nonZero = cv.countNonZero(diff);
          const motionPercentage = (nonZero / (diff.rows * diff.cols)) * 100;

          // Log every 30 frames to avoid console spam
          if (frameCount % 30 === 0) {
            console.log(`Motion detected: ${motionPercentage.toFixed(2)}%`);
            console.log(`Current sky turbidity: ${this.skyUniforms["turbidity"].value.toFixed(2)}`);
          }
          frameCount++;

          // If motion is detected
          if (motionPercentage > 0.5) {
            this.onMotionDetected();
          } else {
            this.onNoMotionDetected();
          }

          // Prepare for next frame
          gray2.copyTo(gray1);
        }
        this.motionDetectionId = requestAnimationFrame(processVideo);
      } catch (err) {
        console.error("Video processing error:", err);
      }
    };

    // Start processing
    processVideo();
  }

  onMotionDetected() {
    this.noMovementDetected = false;
    if (this.movementTimeout) {
      clearTimeout(this.movementTimeout);
      this.movementTimeout = null;
    }
    console.log("Motion detected - increasing sky turbidity");
    if (this.skyUniforms["turbidity"].value < this.skyBright) {
      this.skyUniforms["turbidity"].value += 0.1;
    }
  }

  onNoMotionDetected() {
    if (this.noMovementDetected) return;

    this.movementTimeout = setTimeout(() => {
      this.noMovementDetected = true;
      console.log("No motion detected for 1 second - decreasing sky turbidity");
    }, 1000);
  }

  // cv stuff end

  initWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load("img/waternormals.jpeg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }

  initSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms["turbidity"].value = this.skyBright;
    this.skyUniforms["rayleigh"].value = 10;
    this.skyUniforms["mieCoefficient"].value = 0.009;
    this.skyUniforms["mieDirectionalG"].value = 0.8;

    this.parameters = {
      inclination: 0.49,
      azimuth: 0.205,
    };

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.updateSun(this.parameters, pmremGenerator);
  }

  updateSun(parameters, pmremGenerator) {
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    this.sun.x = Math.cos(phi);
    this.sun.y = Math.sin(phi) * Math.sin(theta);
    this.sun.z = Math.sin(phi) * Math.cos(theta);

    this.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value.copy(this.sun).normalize();
    this.scene.environment = pmremGenerator.fromScene(this.sky).texture;
  }

  initLights() {
    const ambient = new THREE.AmbientLight(0x555555);
    this.scene.add(ambient);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(5, 10, 2);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, 2, 4);
    this.scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xff8c19);
    directionalLight3.position.set(0, 0, 1);
    this.scene.add(directionalLight3);

    this.scene.fog = new THREE.FogExp2(15655413, 0.0002);
    this.renderer.setClearColor(this.scene.fog.color);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.499;
    this.controls.target.set(0, 10, 0);
    this.controls.minDistance = 10.0;
    this.controls.maxDistance = 800.0;
    this.controls.listenToKeyEvents(window);
    this.controls.screenSpacePanning = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.keyPanSpeed = 50;
    this.controls.update();
  }

  initCenterObjects() {
    const torusKnotGeometry = new THREE.TorusKnotGeometry(2.7, 1.1, 300, 20, 2, 3);
    const sphereGeometry = new THREE.SphereGeometry(2, 30, 20, 30);
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x7d7d7d,
      opacity: 0.2,
      transparent: true,
      emissive: 0x000000,
    });

    const centerWorldContainer = new THREE.Object3D();
    this.scene.add(centerWorldContainer);
    this.centerObjects.push(centerWorldContainer);

    this.centerObj = new THREE.Mesh(torusKnotGeometry, this.buildTwistMaterial(20.0));
    this.centerObj.scale.set(0.75, 0.75, 0.75);
    centerWorldContainer.add(this.centerObj);
    this.centerObjects.push(this.centerObj);

    const centerObjSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    centerObjSphere.scale.set(3.5, 3.5, 3.5);
    this.centerObj.add(centerObjSphere);

    this.rot1 = this.makeRotatorObjInstance(torusKnotGeometry, 0x686868, -30, 0, -17.32);
    this.rot2 = this.makeRotatorObjInstance(torusKnotGeometry, 0x171717, 30, 0, -17.32);
    this.rot3 = this.makeRotatorObjInstance(torusKnotGeometry, 0x17971a, 0, 0, 34.64);
  }

  makeRotatorObjInstance(geometry, color, x, y, z) {
    const rotatorMaterial = new THREE.MeshLambertMaterial({
      color: color,
      opacity: 0.4,
      transparent: true,
      emissive: 0x000000,
    });
    const rotatorObjInstance = new THREE.Mesh(geometry, rotatorMaterial);
    rotatorObjInstance.position.set(x, y, z);
    this.centerObjects.push(rotatorObjInstance);
    this.scene.add(rotatorObjInstance);

    const sphereGeometry = new THREE.SphereGeometry(2, 30, 20, 30);
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x7d7d7d,
      opacity: 0.2,
      transparent: true,
      emissive: 0x000000,
    });
    const rotatorSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    rotatorSphere.scale.set(1.5, 1.5, 1.5);
    rotatorObjInstance.add(rotatorSphere);
    return rotatorObjInstance;
  }

  buildTwistMaterial(amount) {
    const material = new THREE.MeshNormalMaterial();
    material.opacity = 0.54;
    material.transparent = true;
    material.onBeforeCompile = function (shader) {
      shader.uniforms.time = { value: 0 };
      shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        [
          `float theta = sin( time + position.y ) / ${amount.toFixed(1)};`,
          "float c = cos(theta);",
          "float s = sin(theta);",
          "mat3 m = mat3(c, 0, s, 0, 1, 0, -s, 0, c);",
          "vec3 transformed = vec3(position) * m;",
          "vNormal = vNormal * m;",
        ].join("\n")
      );
      material.userData.shader = shader;
    };
    material.customProgramCacheKey = function () {
      return amount;
    };
    return material;
  }

  initModals() {
    for (let i = 0; i < this.numberOfMediQuestions; i++) {
      this.createModal("medi", i, this.mediQuestions[i]);
    }
    for (let i = 0; i < this.numberOfFriends; i++) {
      this.createModal("friend", i, this.friendQuestions[i % this.friendQuestions.length]);
    }
  }

  createModal(type, id, text) {
    const modalDiv = document.createElement("div");
    const textDiv = document.createElement("div");
    const closeModalBtnDiv = document.createElement("div");
    const closeModalBtn = document.createElement("div");

    modalDiv.id = `${type}ModalDivID${id}`;
    textDiv.id = `${type}TextDiv${id}`;
    textDiv.classList.add("infoTextDiv");
    modalDiv.classList.add(`${type}ModalDiv`);
    closeModalBtnDiv.classList.add("closeModalBtnDiv");
    closeModalBtn.classList.add("closeModalBtn");

    textDiv.textContent = text;
    closeModalBtnDiv.appendChild(closeModalBtn);
    modalDiv.appendChild(textDiv);
    modalDiv.appendChild(closeModalBtnDiv);
    this.container.insertBefore(modalDiv, this.container.childNodes[0]);

    closeModalBtn.addEventListener("click", () => {
      this.fadeOut(modalDiv, `open${type.charAt(0).toUpperCase() + type.slice(1)}ModalDiv`);
    });
  }

  fadeOut(element, className) {
    element.classList.add("fadeMeOut");
    setTimeout(() => {
      element.classList.remove(className);
    }, 1200);
    setTimeout(() => {
      element.classList.remove("fadeMeOut");
    }, 1600);
  }

  loadModels() {
    const jellyFishPromise = this.loadGLTFModel("/img/oct.glb");
    const friendShapePromise = this.loadGLTFModel("/img/friend3.glb");

    for (let i = 0; i < this.numberOfFriends; i++) {
      const position = this.mkGoodPosition();
      const rotation = this.mkGoodRotation();

      friendShapePromise.then((friendShape) => {
        const friendClone = friendShape.clone();
        this.setupObject(friendClone, i, this.boxGroup, this.boxSpeeds, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 20);
      });

      jellyFishPromise.then((jelly) => {
        this.jellyfish[i] = jelly.clone();
      });

      this.flyingCrullers[i] = this.createFlyingCruller(position.x, position.y, position.z);
      this.flyingSpheres[i] = this.createGiantLoop(position.x, position.y, position.z);
    }
  }

  loadGLTFModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        model.traverse((o) => {
          if (o.isMesh) {
            o.material = this.buildTwistMaterial(0.02);
            o.material.needsUpdate = true;
            o.updateMatrix();
          }
        });
        model.scale.multiplyScalar(1.2);
        resolve(model);
      });
    });
  }

  createFlyingCruller(x, y, z) {
    const geometry = new THREE.TorusKnotGeometry(0.8, 0.1, 300, 7, 5, 7);
    const cruller = new THREE.Mesh(geometry, this.buildTwistMaterial(0.5));
    cruller.position.set(x, y, z);
    return cruller;
  }

  createGiantLoop(x, y, z) {
    const geometry = new THREE.TorusGeometry(18, 0.8, 21, 100, 6.3);
    const loop = new THREE.Mesh(geometry, this.buildTwistMaterial(0.2));
    loop.position.set(x, y, z);
    return loop;
  }

  setupObject(obj, id, group, speeds, posX, posY, posZ, rotX, rotY, rotZ, scale) {
    obj.scale.multiplyScalar(scale);
    obj.traverse((o) => {
      if (o.isMesh) {
        o.friendID = id;
        o.material = new THREE.MeshLambertMaterial({
          color: Math.random() * 0xffffff,
          opacity: 0.5,
          transparent: true,
        });
      }
    });

    obj.friendID = id;
    obj.position.set(posX, posY, posZ);
    obj.rotation.set(rotX, rotY, rotZ);
    group.add(obj);
    speeds.push(Math.random());
  }

  initGUI() {
    // const gui = new GUI();
    const gui = new GUI({ autoPlace: true, load: false });

    // Sky parameters
    const skyFolder = gui.addFolder("Sky");
    skyFolder.add(this.skyUniforms["turbidity"], "value", 0.0, 20.0, 0.1).name("Turbidity");
    skyFolder.add(this.skyUniforms["rayleigh"], "value", 0.0, 4.0, 0.001).name("Rayleigh");
    skyFolder.add(this.skyUniforms["mieCoefficient"], "value", 0.0, 0.1, 0.001).name("Mie Coefficient");
    skyFolder.add(this.skyUniforms["mieDirectionalG"], "value", 0.0, 1.0, 0.001).name("Mie Directional G");
    skyFolder
      .add(this.parameters, "inclination", 0, 1, 0.0001)
      .name("Inclination")
      .onChange(() => {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.updateSun(this.parameters, pmremGenerator);
      });
    skyFolder
      .add(this.parameters, "azimuth", 0, 1, 0.0001)
      .name("Azimuth")
      .onChange(() => {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.updateSun(this.parameters, pmremGenerator);
      });

    // Water parameters
    const waterFolder = gui.addFolder("Water");
    waterFolder.add(this.water.material.uniforms["distortionScale"], "value", 0.0, 8.0, 0.1).name("Distortion Scale");
    waterFolder.add(this.water.material.uniforms["alpha"], "value", 0.0, 1.0, 0.01).name("Alpha");
    waterFolder
      .addColor({ waterColor: this.water.material.uniforms["waterColor"].value.getHex() }, "waterColor")
      .name("Water Color")
      .onChange((value) => {
        this.water.material.uniforms["waterColor"].value.setHex(value);
      });

    // Objects parameters
    const objectsFolder = gui.addFolder("Objects");
    objectsFolder.add(this.centerObj.scale, "x", 0.1, 5).name("Center Object Scale");
    objectsFolder.add(this.centerObj.rotation, "x", 0, Math.PI * 2).name("Center Object Rotation X");
    objectsFolder.add(this.centerObj.rotation, "y", 0, Math.PI * 2).name("Center Object Rotation Y");
    objectsFolder.add(this.centerObj.rotation, "z", 0, Math.PI * 2).name("Center Object Rotation Z");

    // Example of adjusting opacity for all friend objects
    objectsFolder
      .add({ opacity: 0.5 }, "opacity", 0.1, 1.0, 0.01)
      .name("Friends Opacity")
      .onChange((value) => {
        this.boxGroup.children.forEach((child) => {
          child.traverse((o) => {
            if (o.isMesh) {
              o.material.opacity = value;
            }
          });
        });
      });

    skyFolder.open();
    waterFolder.open();
    objectsFolder.open();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.controls.update();

    // cv Adjust sky when no movement is detected
    if (this.noMovementDetected) {
      if (this.skyUniforms["turbidity"].value > 0) {
        this.skyUniforms["turbidity"].value -= 0.01;
      }
    }
  }

  render() {
    this.scene.traverse((child) => {
      if (child.isMesh) {
        const shader = child.material.userData.shader;
        if (shader) {
          shader.uniforms.time.value = performance.now() / 1000;
        }
      }
    });

    const time = performance.now() * 0.0001;

    this.centerObj.position.y = Math.sin(time) * 20 + 5;
    this.centerObj.rotation.x = time * 0.5;
    this.centerObj.rotation.z = time * 0.51;

    for (let i = 0; i < this.boxGroup.children.length; i++) {
      const offset = this.initialFriendYPositions[i] * 15;
      this.boxGroup.children[i].position.y = Math.sin(time) * 40 + 35;
      this.boxGroup.children[i].rotation.x = Math.sin(time) * 2 + 1;
      this.boxGroup.children[i].rotation.z = Math.sin(time) * 5 + 1;
    }

    this.centerObjects.forEach((obj) => {
      obj.rotation.y = time;
    });

    this.water.material.uniforms["time"].value += 1.0 / 60.0;

    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hoverableObjects = this.boxGroup.children.concat(this.centerObjects);
    const intersects = this.raycaster.intersectObjects(hoverableObjects, true);

    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED) {
          this.INTERSECTED.traverse((o) => {
            if (o.isMesh) {
              o.material.emissive.setHex(o.currentHex);
            }
          });
        }
        this.INTERSECTED = intersects[0].object;
        this.INTERSECTED.traverse((o) => {
          if (o.isMesh) {
            o.currentHex = o.material.emissive.getHex();
            o.material.emissive.setHex(0xff0000);
          }
        });
      }
    } else {
      if (this.INTERSECTED) {
        this.INTERSECTED.traverse((o) => {
          if (o.isMesh) {
            o.material.emissive.setHex(o.currentHex);
          }
        });
      }
      this.INTERSECTED = null;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onClick(event) {
    event.preventDefault();
    this.handleInteraction(event);
  }

  onTouch(event) {
    event.preventDefault();
    this.handleInteraction(event);
  }

  handleInteraction(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.closeAllModals(event);

    if (
      this.checkIntersection(this.centerObj, () => {
        this.audioManager.playSpecialSound(this.audioManager.emmanuelle, 240000);
        this.makeSparkles(this.centerObj, 800, 0.2, 5, 50, 50);
      })
    )
      return;

    if (
      this.checkIntersection(this.rot1, () => {
        this.audioManager.playSpecialSound(this.audioManager.rot1, 240000);
        this.showRotatingCreatures(this.jellyfish, this.jellyfishOnScreen, 0);
      })
    )
      return;

    if (
      this.checkIntersection(this.rot2, () => {
        this.audioManager.playSpecialSound(this.audioManager.rot2, 240000);
        this.showRotatingCreatures(this.flyingCrullers, this.flyingCrullersOnScreen, 1);
      })
    )
      return;

    if (
      this.checkIntersection(this.rot3, () => {
        this.audioManager.playSpecialSound(this.audioManager.rot3, 240000);
        this.showRotatingCreatures(this.flyingSpheres, this.flyingSpheresOnScreen, 2);
      })
    )
      return;

    const intersectsFriend = this.raycaster.intersectObjects(this.boxGroup.children, true);
    if (intersectsFriend.length > 0) {
      this.audioManager.playFriendSound();
      const currFriendID = intersectsFriend[0].object.friendID;
      const currModalID = `friendModalDivID${currFriendID}`;
      const currFriendModalDiv = document.getElementById(currModalID);
      currFriendModalDiv.classList.add("openFriendModalDiv");

      intersectsFriend.forEach((intersect) => {
        intersect.object.traverse((o) => {
          if (o.isMesh) {
            o.material.emissive.setHex(3135135);
            o.material.opacity = 0.2;
          }
        });
      });
    }
  }

  checkIntersection(object, callback) {
    const intersects = this.raycaster.intersectObjects([object], true);
    if (intersects.length > 0) {
      callback();
      return true;
    }
    return false;
  }

  closeAllModals(event) {
    const modals = document.querySelectorAll(".friendModalDiv, .mediModalDiv");
    modals.forEach((modal) => {
      if (!modal.contains(event.target)) {
        modal.classList.remove("openFriendModalDiv", "openMediModalDiv");
      }
    });
  }

  showRotatingCreatures(creatures, creaturesOnScreen, modalIndex) {
    creatures.forEach((creature) => {
      creature.traverse((mesh) => {
        if (mesh.isMesh) {
          mesh.material.opacity = 0.5;
        }
      });
    });
    this.makeRotatingCreatures(creatures, creaturesOnScreen);
    setTimeout(() => {
      const currModalID = `mediModalDivID${modalIndex}`;
      const currFriendModalDiv = document.getElementById(currModalID);
      currFriendModalDiv.classList.add("openMediModalDiv");
    }, 3000);
    this.fadeRotatingCreatures(creaturesOnScreen);
  }

  makeRotatingCreatures(creatures, creaturesOnScreen) {
    creatures.forEach((creature) => {
      creaturesOnScreen.push(creature);
      if (!creature.iHaveBeenSetup) {
        const position = this.mkGoodPosition();
        const rotation = this.mkGoodRotation();
        this.setupObject(creature, 100, this.boxGroup, this.boxSpeeds, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 30);
        creature.iHaveBeenSetup = true;
      } else {
        this.boxGroup.add(creature);
      }
    });
  }

  fadeRotatingCreatures(creaturesOnScreen) {
    if (creaturesOnScreen.length === 0) return;

    let minimumOpacity = 1.0;
    creaturesOnScreen.forEach((creature) => {
      creature.traverse((o) => {
        if (o.isMesh) {
          const opacity = o.material.opacity;
          minimumOpacity = Math.min(opacity, minimumOpacity);
          if (opacity > this.fadeAmount) {
            o.material.opacity = opacity - this.fadeAmount;
          }
        }
      });
    });

    if (minimumOpacity < this.fadeAmount) {
      for (let i = 0; i < 1; i++) {
        const creature = creaturesOnScreen.pop();
        if (creature) {
          this.boxGroup.remove(creature);
        }
      }
    }

    setTimeout(() => this.fadeRotatingCreatures(creaturesOnScreen), 350);
  }

  makeSparkles(source, spread, lightness, size, quantity, numOfSets) {
    const sparkUniforms = {
      pointTexture: { value: new THREE.TextureLoader().load("img/spark1.png") },
    };
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: sparkUniforms,
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    const sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions = [];
    const sparkColors = [];
    const sparkSizes = [];
    const sparkColor = new THREE.Color();

    for (let x = 0; x < numOfSets; x++) {
      for (let i = 0; i < quantity; i++) {
        sparkPositions.push((Math.random() * 2 - 1) * spread);
        sparkPositions.push((Math.random() * 2 - 1) * spread);
        sparkPositions.push((Math.random() * 2 - 1) * spread);

        sparkColor.setHSL(Math.random(), 1.0, lightness);
        sparkColors.push(sparkColor.r, sparkColor.g, sparkColor.b);
        sparkSizes.push(size);
      }

      sparkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(sparkPositions, 3));
      sparkGeometry.setAttribute("color", new THREE.Float32BufferAttribute(sparkColors, 3));
      sparkGeometry.setAttribute("size", new THREE.Float32BufferAttribute(sparkSizes, 1).setUsage(THREE.DynamicDrawUsage));

      const sparkleSystem = new THREE.Points(sparkGeometry, shaderMaterial);
      this.sparkleFriendMap[source.friendID] = sparkleSystem;
      source.add(sparkleSystem);
    }
  }
}

class AudioManager {
  constructor() {
    this.friendSounds = [

      this.createAudio("/audio/friendSound.mp3", 0.02),
      this.createAudio("/audio/friend1Sound.mp3", 0.02),
      this.createAudio("/audio/friend2Sound.mp3", 0.02),
    ];
    this.ambientMusicSounds = [
      this.createAudio("/audio/background.mp3", 0.09),
      this.createAudio("/audio/emmanuelle.mp3"),
      this.createAudio("/audio/rot1Sound.mp3", 0.08),
      this.createAudio("/audio/rot2Sound.mp3", 0.08),
      this.createAudio("/audio/rot3Sound.mp3", 0.08),
    ];
    this.sounds = [...this.friendSounds, this.createAudio("/audio/sea.mp3"), ...this.ambientMusicSounds];
    this.soundMuted = false;
    this.emmanuelle = this.ambientMusicSounds[1];
  }

  createAudio(src, volume = 1.0) {
    const audio = new Audio(src);
    audio.volume = volume;
    return audio;
  }

  playFriendSound() {
    if (!this.soundMuted) {
      const sound = this.friendSounds[Math.floor(Math.random() * this.friendSounds.length)].cloneNode();
      sound.volume = 0.03;
      sound.play();
    }
  }

  playSpecialSound(specialSound, length) {
    console.log(specialSound);
    this.pauseAmbientMusicSounds();
    specialSound.volume = 0.08;
    specialSound.play();
    setTimeout(() => {
      this.ambientMusicSounds[0].volume = 0.09;
      this.ambientMusicSounds[0].play();
    }, length);
  }

  pauseAmbientMusicSounds() {
    this.ambientMusicSounds.forEach((sound) => {
      sound.pause();
      sound.volume = 0;
    });
  }

  pauseAllSounds() {
    this.sounds.forEach((sound) => {
      sound.pause();
    });
  }
}

window.initializeApp = function () {
  console.log("Initializing ThreeJSApp");
  new ThreeJSApp();
};

window.onOpenCvReady = function () {
  console.log("OpenCV.js is ready");
  new ThreeJSApp();
};

console.log("play.js module loaded");
