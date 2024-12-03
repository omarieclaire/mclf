// Import required Three.js modules and extensions
import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "./node_modules/three/examples/jsm/objects/Water.js";
import { Sky } from "./node_modules/three/examples/jsm/objects/Sky.js";
import { GUI } from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

THREE.ImageUtils.crossOrigin = "";

// Particle system for ambient floating effects
class ParticleSystem {
  constructor(scene) {
    console.log("🎆 Initializing particle system");
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initialize particles in a dome shape above the water
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 500 * Math.random();
      const theta = 2 * Math.PI * Math.random();
      const y = 100 * Math.random() + 50;

      positions[i] = radius * Math.cos(theta);
      positions[i + 1] = y;
      positions[i + 2] = radius * Math.sin(theta);

      colors[i] = 0.9 + Math.random() * 0.1;
      colors[i + 1] = 0.9 + Math.random() * 0.1;
      colors[i + 2] = 1.0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }

  // Update particle positions and opacity based on meditation level
  update(stillnessLevel) {
    const time = Date.now() * 0.0001;
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.1 * stillnessLevel;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.material.opacity = 0.2 + stillnessLevel * 0.3;
  }
}

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

    this.audioManager.seaSounds[0].loop = true; // Make sea sound loop
    this.audioManager.seaSounds[0]
      .play()
      .then(() => console.log("Sea sound started"))
      .catch((err) => console.error("Sea sound failed to start:", err));

    this.stillnessLevel = 0;
    this.lastMotionTime = Date.now();
    this.isInMeditativeState = false;
    this.particleSystem = null;
    this.originalWaterColor = 0x001e0f;
    this.meditativeWaterColor = 0x000066; // Much darker blue

    this.debugMode = true;

    // cv stuff
    this.initOpenCV();

    this.noMovementDetected = false;
    this.movementTimeout = null;

    this.originalWaterColor = 0x001e0f;
    this.debugMode = true;

    this.meditationParams = {
      // Water effects
      waterColorStart: 0x001e0f,
      waterColorEnd: 0xd72b65,
      waterDistortionStart: 3.7,
      waterDistortionEnd: 0.01,

      // Sky effects
      skyTurbidityStart: 10,
      skyTurbidityEnd: 2,
      skyRayleighStart: 10,
      skyRayleighEnd: 2,

      // Sparkle effects
      sparkleThreshold: 0.8, // stillness level needed for sparkles
      sparkleSpread: 800,
      sparkleLightness: 0.2,
      sparkleSize: 5,
      sparkleQuantity: 50,
      sparkleNumSets: 50,

      // Movement effects
      rotationSlowdown: 0.9, // how much to slow rotation (0-1)
      objectFade: 0.4, // how much to fade objects (0-1)

      // Timing
      stillnessIncrease: 0.1, // how fast stillness builds
      stillnessDecrease: 0.2, // how fast stillness drops
      stillnessDelay: 1000, // ms of stillness needed

      cameraMaxZ: 500,

      // new stuff

      stillnessThresholds: {
        gentle: 30000, // 30 seconds - first effect -- removed 3 zeros for testing
        moderate: 60000, // 1 minute - second effect
        deep: 90000, // 1.5 minutes - camera movement
        profound: 200000, // 3.3 minutes - darkness
      },

      // Camera movement
      cameraSpeed: 0.05,
      targetCameraPosition: new THREE.Vector3(0, 100, 400),

      // Particle system
      particleOpacityMin: 0.2,
      particleOpacityMax: 0.8,

      // Color transitions
      skyColorStart: new THREE.Color(0x87ceeb),
      skyColorEnd: new THREE.Color(0x000033),

      // Movement detection
      motionThreshold: 0.5, // percentage of pixels that need to change
      regionSize: 32, // size of regions to check for motion
    };

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

    this.setupCamera();

    if (this.debugMode) {
      this.initDebugUI();
    }
  }

  initDebugUI() {
    const debugContainer = document.createElement("div");
    debugContainer.style.position = "fixed";
    debugContainer.style.bottom = "10px";
    debugContainer.style.left = "10px";
    debugContainer.style.backgroundColor = "rgba(0,0,0,0.7)";
    debugContainer.style.color = "white";
    debugContainer.style.padding = "10px";
    debugContainer.style.fontFamily = "monospace";
    debugContainer.style.zIndex = "1000";
    debugContainer.id = "debugInfo";
    document.body.appendChild(debugContainer);
  }

  logDebug(message) {
    if (this.debugMode) {
      const timeSinceMotion = Date.now() - this.lastMotionTime;
      const debugInfo = document.getElementById("debugInfo");
      if (debugInfo) {
        let currentState = "Normal";
        if (timeSinceMotion > this.meditationParams.stillnessThresholds.profound) currentState = "Profound";
        else if (timeSinceMotion > this.meditationParams.stillnessThresholds.deep) currentState = "Deep";
        else if (timeSinceMotion > this.meditationParams.stillnessThresholds.moderate) currentState = "Moderate";
        else if (timeSinceMotion > this.meditationParams.stillnessThresholds.gentle) currentState = "Gentle";

        debugInfo.innerHTML = `
        Meditation State: <span style="color: #00ff00">${currentState}</span><br>
        Time Since Motion: ${(timeSinceMotion / 1000).toFixed(1)}s<br>
        Stillness Level: ${this.stillnessLevel.toFixed(2)}<br>
        <br>
        Current Effects:<br>
        ▸ Sparkles: ${timeSinceMotion > this.meditationParams.stillnessThresholds.gentle ? "✓" : "×"}<br>
        ▸ Sky Changes: ${timeSinceMotion > this.meditationParams.stillnessThresholds.moderate ? "✓" : "×"}<br>
        ▸ Camera Movement: ${timeSinceMotion > this.meditationParams.stillnessThresholds.deep ? "✓" : "×"}<br>
        ▸ Darkening: ${timeSinceMotion > this.meditationParams.stillnessThresholds.profound ? "✓" : "×"}<br>
      `;
      }
    }
  }
  initOpenCV() {
    cv["onRuntimeInitialized"] = () => {
      console.log("OpenCV.js is fully initialized");
      this.init(); // Proceed with the rest of your initialization
      this.animate();
    };
  }

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

  onMotionDetected() {
    this.stillnessLevel = Math.max(0, this.stillnessLevel - 0.2); // Faster decrease
    this.lastMotionTime = Date.now();
    this.isInMeditativeState = false;
    this.logDebug(`Motion detected - stillness level: ${this.stillnessLevel.toFixed(2)}`);
  }

  onNoMotionDetected() {
    const timeSinceLastMotion = Date.now() - this.lastMotionTime;

    if (timeSinceLastMotion > 1000) {
      // Reduced to 1 second for testing
      this.stillnessLevel = Math.min(1, this.stillnessLevel + 0.1); // Faster increase
      this.isInMeditativeState = true;
      this.logDebug(`Stillness detected - level: ${this.stillnessLevel.toFixed(2)}`);
      this.updateMeditativeEffects();
    }
  }

  updateMeditativeEffects() {
    const timeSinceMotion = Date.now() - this.lastMotionTime;

    // Determine the current state
    let currentState = "Normal";
    if (this.isInMeditativeState) {
      if (timeSinceMotion > this.meditationParams.stillnessThresholds.profound) currentState = "Profound";
      else if (timeSinceMotion > this.meditationParams.stillnessThresholds.deep) currentState = "Deep";
      else if (timeSinceMotion > this.meditationParams.stillnessThresholds.moderate) currentState = "Moderate";
      else if (timeSinceMotion > this.meditationParams.stillnessThresholds.gentle) currentState = "Gentle";
    }

    // Log the debug information
    this.logDebug(`🧘 ${currentState} meditation - stillness: ${this.stillnessLevel.toFixed(2)}, time: ${(timeSinceMotion / 1000).toFixed(1)}s`);

    // Update always-active water effects only if meditative state is active
    if (this.isInMeditativeState) {
      const waterColorProgress = this.stillnessLevel;
      const currentColor = new THREE.Color(this.meditationParams.waterColorStart).lerp(
        new THREE.Color(this.meditationParams.waterColorEnd),
        waterColorProgress
      );
      this.water.material.uniforms.waterColor.value.copy(currentColor);

      this.water.material.uniforms["distortionScale"].value =
        this.meditationParams.waterDistortionStart -
        waterColorProgress * (this.meditationParams.waterDistortionStart - this.meditationParams.waterDistortionEnd);
    }

    // Handle meditation states
    if (this.isInMeditativeState) {
      // Gentle state - Sparkles
      if (timeSinceMotion > this.meditationParams.stillnessThresholds.gentle && !this.meditationSparkles) {
        this.makeSparkles(
          this.centerObj,
          this.meditationParams.sparkleSpread,
          this.meditationParams.sparkleLightness,
          this.meditationParams.sparkleSize,
          this.meditationParams.sparkleQuantity,
          this.meditationParams.sparkleNumSets
        );
        this.meditationSparkles = true;
        console.log("✨ Sparkles activated");
      }

      // Moderate state - Sky changes
      if (timeSinceMotion > this.meditationParams.stillnessThresholds.moderate && this.skyUniforms) {
        const skyProgress = Math.min(
          (timeSinceMotion - this.meditationParams.stillnessThresholds.moderate) / this.meditationParams.skyTransitionDuration,
          1
        );

        this.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
          this.meditationParams.skyTurbidityStart,
          this.meditationParams.skyTurbidityEnd,
          skyProgress * this.stillnessLevel
        );

        this.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
          this.meditationParams.skyRayleighStart,
          this.meditationParams.skyRayleighEnd,
          skyProgress * this.stillnessLevel
        );
      }

      // Deep state - Camera movement
      if (timeSinceMotion > this.meditationParams.stillnessThresholds.deep) {
        if (!this.originalCameraPosition) {
          this.originalCameraPosition = this.camera.position.clone();
          console.log("📸 Starting camera movement");
        }

        const targetY = this.originalCameraPosition.y + 50;
        const targetZ = this.originalCameraPosition.z + 150;

        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, this.meditationParams.cameraSpeed);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, this.meditationParams.cameraSpeed);
      }
    } else {
      // Reset effects when not in meditative state
      if (this.meditationSparkles) {
        Object.values(this.sparkleFriendMap).forEach((sparkle) => {
          if (sparkle && sparkle.parent) {
            sparkle.parent.remove(sparkle);
          }
        });
        this.sparkleFriendMap = {};
        this.meditationSparkles = false;
        console.log("✨ Sparkles deactivated");
      }

      // Reset Camera
      if (this.originalCameraPosition) {
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.originalCameraPosition.y, this.meditationParams.cameraSpeed);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.originalCameraPosition.z, this.meditationParams.cameraSpeed);

        // Stop adjusting once reset is complete
        if (
          Math.abs(this.camera.position.y - this.originalCameraPosition.y) < 0.01 &&
          Math.abs(this.camera.position.z - this.originalCameraPosition.z) < 0.01
        ) {
          this.originalCameraPosition = null;
        }
      }

      // Reset Sky
      if (this.skyUniforms) {
        this.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(this.skyUniforms["turbidity"].value, this.meditationParams.skyTurbidityStart, 0.1);
        this.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(this.skyUniforms["rayleigh"].value, this.meditationParams.skyRayleighStart, 0.1);
      }
    }
  }

  // detect motion in specific regions
  detectRegionalMotion(frame1, frame2) {
    const regions = [];
    const regionSize = this.meditationParams.regionSize;

    for (let y = 0; y < frame1.rows; y += regionSize) {
      for (let x = 0; x < frame1.cols; x += regionSize) {
        const roi1 = frame1.roi(new cv.Rect(x, y, regionSize, regionSize));
        const roi2 = frame2.roi(new cv.Rect(x, y, regionSize, regionSize));

        const diff = new cv.Mat();
        cv.absdiff(roi1, roi2, diff);

        const motionAmount = cv.countNonZero(diff) / (regionSize * regionSize);
        regions.push({
          x: x,
          y: y,
          motion: motionAmount,
        });

        diff.delete();
        roi1.delete();
        roi2.delete();
      }
    }

    return regions;
  }
  // cv stuff end

  initWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load("../img/waternormals.jpeg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 0,
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
    const jellyFishPromise = this.loadGLTFModel("../img/oct.glb");
    const friendShapePromise = this.loadGLTFModel("../img/friend3.glb");

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
      loader.load(
        url,
        (gltf) => {
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
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
          reject(error);
        }
      );
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
    const audioFolder = gui.addFolder("Audio");

    audioFolder
      .add(
        {
          startAudio: () => {
            this.audioManager.seaSounds[0].loop = true;
            this.audioManager.seaSounds[0]
              .play()
              .then(() => console.log("Sea sound started"))
              .catch((err) => console.error("Sea sound failed to start:", err));
          },
        },
        "startAudio"
      )
      .name("Start Sea Sound");

    audioFolder
      .add(
        {
          toggleMute: () => {
            const seaSound = this.audioManager.seaSounds[0];
            if (seaSound.volume > 0) {
              seaSound.volume = 0;
            } else {
              seaSound.volume = 0.09;
            }
          },
        },
        "toggleMute"
      )
      .name("Toggle Mute");

    // Add volume control
    audioFolder
      .add({ volume: 0.09 }, "volume", 0, 1)
      .name("Sea Volume")
      .onChange((value) => {
        this.audioManager.seaSounds[0].volume = value;
      });

    audioFolder.open();

    // Objects parameters
    const objectsFolder = gui.addFolder("Objects");
    objectsFolder.add(this.centerObj.scale, "x", 0.1, 5).name("Center Object Scale");
    // Example of adjusting opacity for all friend objects
    objectsFolder
      .add({ opacity: 0.5 }, "opacity", 0.1, 1.0, 0.01)
      .name("FriendsOpacity")
      .onChange((value) => {
        this.boxGroup.children.forEach((child) => {
          child.traverse((o) => {
            if (o.isMesh) {
              o.material.opacity = value;
            }
          });
        });
      });

    // In initGUI(), replace the meditation folder section with:

    const meditationFolder = gui.addFolder("Meditation Effects");

    // Timing controls
    const timingFolder = meditationFolder.addFolder("Timing Thresholds");
    timingFolder.add(this.meditationParams.stillnessThresholds, "gentle", 1000, 60000).name("First Effect (ms)");
    timingFolder.add(this.meditationParams.stillnessThresholds, "moderate", 1000, 120000).name("Second Effect (ms)");
    timingFolder.add(this.meditationParams.stillnessThresholds, "deep", 1000, 180000).name("Camera Move (ms)");
    timingFolder.add(this.meditationParams.stillnessThresholds, "profound", 1000, 300000).name("Darkness (ms)");

    // Stillness sensitivity
    const stillnessFolder = meditationFolder.addFolder("Stillness Settings");
    stillnessFolder.add(this.meditationParams, "stillnessIncrease", 0.01, 0.5).name("Build Speed");
    stillnessFolder.add(this.meditationParams, "stillnessDecrease", 0.01, 0.5).name("Drop Speed");
    stillnessFolder.add(this.meditationParams, "stillnessDelay", 0, 5000).name("Delay (ms)");

    // Water effects
    const waterFolder = meditationFolder.addFolder("Water Effects");
    waterFolder
      .addColor({ color: this.meditationParams.waterColorStart }, "color")
      .name("Start Color")
      .onChange((value) => (this.meditationParams.waterColorStart = value));
    waterFolder
      .addColor({ color: this.meditationParams.waterColorEnd }, "color")
      .name("End Color")
      .onChange((value) => (this.meditationParams.waterColorEnd = value));
    waterFolder.add(this.meditationParams, "waterDistortionStart", 0, 8).name("Start Distortion");
    waterFolder.add(this.meditationParams, "waterDistortionEnd", 0, 8).name("End Distortion");

    // Sky effects
    const skyFolder = meditationFolder.addFolder("Sky Effects");
    skyFolder.add(this.meditationParams, "skyTurbidityStart", 0, 20).name("Start Turbidity");
    skyFolder.add(this.meditationParams, "skyTurbidityEnd", 0, 20).name("End Turbidity");
    skyFolder.add(this.meditationParams, "skyRayleighStart", 0, 10).name("Start Rayleigh");
    skyFolder.add(this.meditationParams, "skyRayleighEnd", 0, 10).name("End Rayleigh");

    // Particle controls
    const particleFolder = meditationFolder.addFolder("Particle Effects");
    particleFolder.add(this.meditationParams, "particleOpacityMin", 0, 1).name("Min Opacity");
    particleFolder.add(this.meditationParams, "particleOpacityMax", 0, 1).name("Max Opacity");

    // Camera movement
    const cameraFolder = meditationFolder.addFolder("Camera Movement");
    cameraFolder.add(this.meditationParams, "cameraSpeed", 0.001, 0.1).name("Move Speed");

    // Debug info
    const debugFolder = meditationFolder.addFolder("Debug Info");
    const debugInfo = { currentStillness: 0, timeSinceMotion: 0 };
    debugFolder.add(debugInfo, "currentStillness").name("Stillness Level").listen();
    debugFolder.add(debugInfo, "timeSinceMotion").name("Time (s)").listen();

    // Update debug values in render loop
    setInterval(() => {
      debugInfo.currentStillness = this.stillnessLevel;
      debugInfo.timeSinceMotion = ((Date.now() - this.lastMotionTime) / 1000).toFixed(1);
    }, 100);

    const testingFolder = meditationFolder.addFolder("Testing Controls");
    const testingParams = {
      timingMode: "Normal", // Default to normal timings
    };

    // Add a dropdown to switch between timing modes
    testingFolder
      .add(testingParams, "timingMode", ["Normal", "Quick Test", "Very Quick Test"])
      .name("Timing Mode")
      .onChange((value) => {
        switch (value) {
          case "Normal":
            this.meditationParams.stillnessThresholds = {
              gentle: 30000, // 30 seconds
              moderate: 60000, // 1 minute
              deep: 90000, // 1.5 minutes
              profound: 120000, // 2 minutes
            };
            break;
          case "Quick Test":
            this.meditationParams.stillnessThresholds = {
              gentle: 10000, // 10 seconds
              moderate: 20000, // 20 seconds
              deep: 30000, // 30 seconds
              profound: 40000, // 40 seconds
            };
            break;
          case "Very Quick Test":
            this.meditationParams.stillnessThresholds = {
              gentle: 3000, // 3 seconds
              moderate: 6000, // 6 seconds
              deep: 9000, // 9 seconds
              profound: 12000, // 12 seconds
            };
            break;
        }
      });

    testingFolder.open();

    meditationFolder.open();
    timingFolder.open();
    stillnessFolder.open();
    debugFolder.open();

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

    try {
      this.render();
      this.controls.update();
    } catch (error) {
      this.logError("Animation loop failed", error);
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

    this.updateMeditativeEffects();

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
      pointTexture: { value: new THREE.TextureLoader().load("../img/spark1.png") },
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
    console.log("Initializing AudioManager");
    this.friendSounds = [
      this.createAudio("../audio/friendSound.mp3", 0.02),
      this.createAudio("../audio/friend1Sound.mp3", 0.02),
      this.createAudio("../audio/friend2Sound.mp3", 0.02),
    ];

    this.rot1 = this.createAudio("../audio/rot1Sound.mp3", 0.08);
    this.rot2 = this.createAudio("../audio/rot2Sound.mp3", 0.08);
    this.rot3 = this.createAudio("../audio/rot3Sound.mp3", 0.08);

    this.ambientMusicSounds = [
      this.createAudio("../audio/background.mp3", 0.09),
      this.createAudio("../audio/emmanuelle.mp3"),
      this.rot1,
      this.rot2,
      this.rot3,
    ];

    this.seaSounds = [this.createAudio("../audio/sea.mp3", 0.09), this.createAudio("../audio/sea.wav")];

    console.log("Rot sounds initialized:", {
      rot1: this.rot1,
      rot2: this.rot2,
      rot3: this.rot3,
    });
  }

  pauseAmbientMusicSounds() {
    this.ambientMusicSounds.forEach((sound) => {
      sound.pause();
      sound.volume = 0;
    });
  }

  playSpecialSound(specialSound, length) {
    if (!specialSound) {
      console.error("Special sound not initialized", new Error().stack);
      return;
    }

    this.pauseAmbientMusicSounds();
    specialSound.volume = 0.08;

    specialSound
      .play()
      .then(() => console.log("Special sound started playing"))
      .catch((error) => console.error("Play failed:", error));
  }

  createAudio(src, volume = 1.0) {
    console.log(`Creating audio for: ${src}`);
    const audio = new Audio(src);
    audio.volume = volume;

    audio.addEventListener("loadeddata", () => {
      console.log(`Successfully loaded: ${src}`);
    });

    audio.addEventListener("error", (e) => {
      console.error(`Failed to load audio: ${src}`, e);
    });

    return audio;
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
