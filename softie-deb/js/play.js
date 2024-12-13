// Import required Three.js modules and extensions
import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "./node_modules/three/examples/jsm/objects/Water.js";
import { Sky } from "./node_modules/three/examples/jsm/objects/Sky.js";
import { GUI } from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

THREE.ImageUtils.crossOrigin = "";

class CameraProcessor {
  static CONFIG = {
    MOTION: {
      THRESHOLD: 0.5, // percentage of pixels that need to change
      REGION_SIZE: 32, // size of regions to check for motion
    },
  };
  constructor(stateManager, debugMode = false) {
    this.stateManager = stateManager;
    this.debugMode = debugMode;
    this.motionDetectionId = null;
    this.isProcessing = true;

    this.meditationParams = {
      motionThreshold: CameraProcessor.CONFIG.MOTION.THRESHOLD,
      regionSize: CameraProcessor.CONFIG.MOTION.REGION_SIZE,
    };
  }

  setupCamera() {
    // console.log("Setting up camera...");
    this.video = document.getElementById("videoInput");
    if (!this.video) {
      throw new Error("Video element 'videoInput' not found");
    }

    // Hide video by default
    this.video.style.display = "none";
    this.video.style.position = "fixed";
    this.video.style.top = "10px";
    this.video.style.left = "10px";
    this.video.style.width = "320px";
    this.video.style.height = "240px";
    this.video.style.zIndex = "1000";

    return navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        console.log("Camera access granted");
        this.video.srcObject = stream;
        return new Promise((resolve) => {
          this.video.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            this.video.play();
            console.log("Video playing");
            resolve();
          };
        });
      })
      .catch((err) => {
        console.error("Error accessing the camera:", err.name, err.message);
        throw err;
      });
  }

  startVideoProcessing() {
    if (typeof cv === "undefined") {
      console.error("OpenCV is not loaded!");
      return;
    }

    const canvasOutput = document.getElementById("canvasOutput");
    if (!canvasOutput) {
      throw new Error("Canvas element 'canvasOutput' not found");
    }

    canvasOutput.style.display = "none";
    canvasOutput.style.position = "fixed";
    canvasOutput.style.top = "260px";
    canvasOutput.style.left = "10px";
    canvasOutput.style.width = "320px";
    canvasOutput.style.height = "240px";
    canvasOutput.style.zIndex = "1000";

    console.log("OpenCV is loaded, starting video processing");

    if (this.debugMode) {
      canvasOutput.style.display = "block";
      canvasOutput.style.position = "fixed";
      canvasOutput.style.top = "260px";
      canvasOutput.style.left = "10px";
      canvasOutput.style.width = "320px";
      canvasOutput.style.height = "240px";
      canvasOutput.style.zIndex = "1000";
    }

    try {
      this.setupProcessing();
      this.processVideo();

      // Add cleanup on page unload
      window.addEventListener("beforeunload", () => this.cleanup());
    } catch (err) {
      console.error("Error in startVideoProcessing:", err);
      this.cleanup();
    }
  }

  setupProcessing() {
    this.cap = new cv.VideoCapture(this.video);
    this.frame1 = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    this.frame2 = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    this.gray1 = new cv.Mat();
    this.gray2 = new cv.Mat();
    this.diff = new cv.Mat();
    this.firstFrame = true;
    this.frameCount = 0;
  }

  processVideo() {
    try {
      if (!this.isProcessing || this.video.paused || this.video.ended) {
        this.cleanup();
        return;
      }

      if (this.cap !== null) {
        this.cap.read(this.frame2);
        cv.cvtColor(this.frame2, this.gray2, cv.COLOR_RGBA2GRAY);

        if (this.firstFrame) {
          this.gray2.copyTo(this.gray1);
          this.firstFrame = false;
        }

        cv.absdiff(this.gray1, this.gray2, this.diff);
        cv.threshold(this.diff, this.diff, 25, 255, cv.THRESH_BINARY);
        cv.imshow("canvasOutput", this.diff);

        const nonZero = cv.countNonZero(this.diff);
        const motionPercentage = (nonZero / (this.diff.rows * this.diff.cols)) * 100;

        if (motionPercentage > this.meditationParams.motionThreshold) {
          this.stateManager.onMotionDetected();
        } else {
          this.stateManager.onNoMotionDetected();
        }

        this.gray2.copyTo(this.gray1);
      }

      this.motionDetectionId = requestAnimationFrame(() => this.processVideo());
    } catch (err) {
      console.error("Video processing error:", err);
      this.cleanup();
    }
  }

  cleanup() {
    this.isProcessing = false;
    if (this.motionDetectionId) {
      cancelAnimationFrame(this.motionDetectionId);
    }

    // Clean up OpenCV resources
    if (this.frame1) this.frame1.delete();
    if (this.frame2) this.frame2.delete();
    if (this.gray1) this.gray1.delete();
    if (this.gray2) this.gray2.delete();
    if (this.diff) this.diff.delete();

    // Stop video stream
    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.video.srcObject = null;
    }
  }

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
}

export class ThreeJSApp {
  static CONFIG = {
    COUNTS: {
      FRIENDS: 40,
      MEDI_QUESTIONS: 3,
    },
    SKY: {
      STARTING_RAYLEIGH: 3,
      STARTING_MIE_COEFFICIENT: 0.005,
      STARTING_MIE_DIRECTIONAL_G: 0.7,
      STARTING_TURBIDITY: 6,
      STARTING_SUN_POSITION: new THREE.Vector3(),
      STARTING_INCLINATION: 0.49,
      STARTING_AZIMUTH: 0.25,
      STARTING_EXPOSURE: 0.5,
    },
    WATER: {
      STARTING_DISTORTION_SCALE: 3.7,
      STARTING_DEFAULT_COLOR: 0x001e0f,
      STARTING_SUN_COLOR: 0xffffff,
      STARTING_GEOMETRY_SIZE: 10000,
      STARTING_TEXTURE_SIZE: 512,
    },
    CAMERA: {
      FOV: 55,
      NEAR: 1,
      FAR: 20000,
      INITIAL_POSITION: {
        x: 0,
        y: 0,
        z: 200,
      },
      MAX_POLAR_ANGLE: Math.PI * 0.499,
      MIN_DISTANCE: 10.0,
      MAX_DISTANCE: 800.0,
      DAMPING_FACTOR: 0.05,
      KEY_PAN_SPEED: 50,
    },
    FLYING_OBJECTS: {
      CRULLER: {
        RADIUS: 0.8,
        TUBE: 0.1,
        TUBULAR_SEGMENTS: 300,
        RADIAL_SEGMENTS: 7,
        P: 5,
        Q: 7,
        TWIST_AMOUNT: 0.5,
      },
      GIANT_LOOP: {
        RADIUS: 18,
        TUBE: 0.8,
        RADIAL_SEGMENTS: 21,
        TUBULAR_SEGMENTS: 100,
        ARC: 6.3,
        TWIST_AMOUNT: 0.2,
      },
    },
    OBJECTS: {
      CENTER: {
        TORUS_KNOT: {
          RADIUS: 2.7,
          TUBE: 1.1,
          TUBULAR_SEGMENTS: 300,
          RADIAL_SEGMENTS: 20,
          P: 2,
          Q: 3,
          SCALE: 1.75,
        },
        SPHERE: {
          RADIUS: 2,
          WIDTH_SEGMENTS: 30,
          HEIGHT_SEGMENTS: 20,
          PHI_SEGMENTS: 30,
          SCALE: 3.5,
        },
      },
      ROTATOR: {
        POSITIONS: {
          ROT1: { x: -30, y: 0, z: -17.32, color: 0x1a7997 },
          ROT2: { x: 30, y: 0, z: -17.32, color: 0x971a79 },
          ROT3: { x: 0, y: 0, z: 34.64, color: 0x17971a },
        },
        SPHERE: {
          RADIUS: 2,
          WIDTH_SEGMENTS: 30,
          HEIGHT_SEGMENTS: 20,
          PHI_SEGMENTS: 30,
          SCALE: 1.5,
          MATERIAL: {
            COLOR: 0x7d7d7d,
            OPACITY: 0.2,
          },
        },
        SPHERE_SCALE: 1.5,
      },
    },
    AUDIO: {
      VOLUMES: {
        FRIEND: 0.03,
        SPECIAL: 0.08,
        SEA: 0.09,
        BACKGROUND: 0.09,
      },
    },
    LIGHTS: {
      AMBIENT: {
        COLOR: 0x555555,
      },
      DIRECTIONAL: {
        LIGHT1: {
          COLOR: 0xffffff,
          INTENSITY: 0.5,
          POSITION: { x: 5, y: 10, z: 2 },
        },
        LIGHT2: {
          COLOR: 0xffffff,
          INTENSITY: 1,
          POSITION: { x: -1, y: 2, z: 4 },
        },
        LIGHT3: {
          COLOR: 0xff8c19,
          INTENSITY: 1,
          POSITION: { x: 0, y: 0, z: 1 },
        },
      },
      FOG: {
        COLOR: 15655413,
        DENSITY: 0.0002,
      },
    },
    MATERIALS: {
      DEFAULT_OPACITY: 0.5,
      EMISSIVE_COLOR: 0xff0000,
      CENTER_SPHERE: {
        COLOR: 0x7d7d7d,
        OPACITY: 0.2,
      },
      TWIST: {
        OPACITY: 0.54,
      },
      ROTATOR: {
        OPACITY: 0.4,
      },
    },
    ANIMATION: {
      CENTER_OBJECT: {
        Y_AMPLITUDE: 20,
        Y_OFFSET: 5,
        ROTATION_X_SPEED: 0.5,
        ROTATION_Z_SPEED: 0.51,
      },
      FRIENDS: {
        Y_AMPLITUDE: 40,
        Y_OFFSET: 35,
        ROTATION_X_AMPLITUDE: 2,
        ROTATION_X_OFFSET: 1,
        ROTATION_Z_AMPLITUDE: 5,
        ROTATION_Z_OFFSET: 1,
      },
    },
    POSITIONING: {
      RANDOM: {
        X: { MIN: -500, MAX: 400 }, // -500 to (900-500=400)
        Y: { MIN: -150, MAX: -5 }, // Initial positions underwater
        // Y: { MIN: -5, MAX: 145 }, // -5 to (150-5=145)
        Z: { MIN: -600, MAX: 300 }, // -600 to (900-600=300)
      },
    },
  };

  constructor() {
    this.container = document.getElementById("container");
    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    this.theta = 0;
    this.numberOfFriends = ThreeJSApp.CONFIG.COUNTS.FRIENDS;
    this.numberOfMediQuestions = ThreeJSApp.CONFIG.COUNTS.MEDI_QUESTIONS;

    this.fadeAmount = 1 / this.numberOfFriends;
    this.initialFriendYPositions = Array.from({ length: this.numberOfFriends * 10 }, () => Math.random());
    // Add scale transition properties for friends
    this.targetScale = 1.0;
    this.currentScale = 0.01; // Start very small
    this.scaleTransitionSpeed = 0.02; // Adjust this to control transition speed
    this.initialObjectScales = new Map(); // Store original scales for each object

    this.boxSpeeds = [];
    this.centerObjects = [];
    this.jellyfish = [];
    this.jellyfishOnScreen = [];
    this.flyingCrullers = [];
    this.flyingCrullersOnScreen = [];
    this.flyingSpheres = [];
    this.flyingSpheresOnScreen = [];
    this.mediQuestions = [
      "We love you as you are",
      "Stretch your muscles? Stretch your hands, your feet, your legs, your arms, your face, your neck, your back. Sink into your own softness.",
      "Soften",
    ];
    this.friendQuestions = [
      "What does the air say to your skin?",
      "Where does the shadow go when you close your eyes?",
      "What memory hides in the cracks of your voice?",
    ];

    this.audioManager = new AudioManager();

    this.audioManager.seaSounds[0].loop = true; // Make sea sound loop
    this.audioManager.seaSounds[0]
      .play()
      .then(() => console.log("Sea sound started"))
      .catch((err) => console.error("Sea sound failed to start:", err));
    // this.debugMode = true;

    this.centerObj = null; // Explicitly initialize
    this.meditationManager = new UnifiedMeditationManager(this);
    this.cameraProcessor = new CameraProcessor(this.meditationManager, this.debugMode);

    this.initOpenCV();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    window.addEventListener("load", this.onWindowLoad.bind(this));

    this.debugMode = false; // Change default to false
    this.guiVisible = false;

    // Add key listener for debug toggle
    document.addEventListener("keydown", (event) => {
      if (event.key === "d") {
        this.debugMode = !this.debugMode;
        this.toggleDebugElements();
      }
    });
  }

  toggleDebugElements() {
    // Toggle GUI
    if (this.guiManager && this.guiManager.gui) {
      const guiElement = document.querySelector(".dg.ac");
      if (guiElement) {
        guiElement.style.display = this.debugMode ? "block" : "none";
      }
    }

    // Toggle debug info
    const debugInfo = document.getElementById("debugInfo");
    if (debugInfo) {
      debugInfo.style.display = this.debugMode ? "block" : "none";
    }

    // Toggle video elements
    const videoInput = document.getElementById("videoInput");
    if (videoInput) {
      videoInput.style.display = this.debugMode ? "block" : "none";
    }

    const canvasOutput = document.getElementById("canvasOutput");
    if (canvasOutput) {
      canvasOutput.style.display = this.debugMode ? "block" : "none";
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
    debugContainer.style.display = "none"; // Hide by default
    document.body.appendChild(debugContainer);
  }

  onWindowLoad() {
    document.body.classList.remove("preload");
    this.loadModels();
  }

  // mkGoodPosition() {
  //   return {
  //     x:
  //       Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN) +
  //       ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN,
  //     y:
  //       Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN) +
  //       ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN,
  //     z:
  //       Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MIN) +
  //       ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MIN,
  //   };
  // }

  mkGoodPosition() {
    return {
      x:
        Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN) +
        ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN,
      y:
        Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN) +
        ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN, // This gives underwater initial positions
      z:
        Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MIN) +
        ThreeJSApp.CONFIG.POSITIONING.RANDOM.Z.MIN,
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
    this.meditationManager.sparkleManager.initialize(this.scene);

    this.camera = new THREE.PerspectiveCamera(
      ThreeJSApp.CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      ThreeJSApp.CONFIG.CAMERA.NEAR,
      ThreeJSApp.CONFIG.CAMERA.FAR
    );
    this.camera.position.set(
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.x,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.y,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.z
    );
    this.sun = new THREE.Vector3();
    this.initWater();
    this.initSky();
    this.initLights();
    this.initControls();
    this.initCenterObjects();
    this.raycaster = new THREE.Raycaster();
    this.boxGroup = new THREE.Group();
    this.boxGroup.visible = false; // Start with friends hidden

    this.scene.add(this.boxGroup);
    this.initModals();

    this.guiManager = new GUIManager(
      this,
      this.renderer,
      this.scene,
      this.camera,
      this.water,
      this.audioManager,
      this.skyUniforms,
      this.parameters,
      this.centerObj
    );
    this.guiManager.initGUI();
    this.initDebugUI();
  }

  initOpenCV() {
    cv["onRuntimeInitialized"] = () => {
      console.log("OpenCV.js is fully initialized");
      this.init();
      this.cameraProcessor
        .setupCamera()
        .then(() => {
          this.cameraProcessor.startVideoProcessing();
          this.animate();
        })
        .catch((error) => {
          console.error("Failed to initialize camera:", error);
          // Decide how to handle camera initialization failure
        });
    };
  }

  initWater() {
    const waterGeometry = new THREE.PlaneGeometry(ThreeJSApp.CONFIG.WATER.STARTING_GEOMETRY_SIZE, ThreeJSApp.CONFIG.WATER.STARTING_GEOMETRY_SIZE);

    // Create water normal map texture with proper settings
    const waterNormals = new THREE.TextureLoader().load("./img/waternormals.jpeg", function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1); // Default scale for normal map
    });

    this.water = new Water(waterGeometry, {
      textureWidth: ThreeJSApp.CONFIG.WATER.STARTING_TEXTURE_SIZE,
      textureHeight: ThreeJSApp.CONFIG.WATER.STARTING_TEXTURE_SIZE,
      waterNormals: waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: ThreeJSApp.CONFIG.WATER.STARTING_SUN_COLOR,
      waterColor: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR,
      distortionScale: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE,
      fog: true, // Enable fog interaction
      alpha: 1.0, // Start fully opaque
    });

    // Additional uniform initialization
    this.water.material.uniforms.time = { value: 0 };
    this.water.material.uniforms.normalSampler.value = waterNormals;
    this.water.material.transparent = true;

    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }

  initSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms["turbidity"].value = ThreeJSApp.CONFIG.SKY.STARTING_TURBIDITY;
    this.skyUniforms["rayleigh"].value = ThreeJSApp.CONFIG.SKY.STARTING_RAYLEIGH;
    this.skyUniforms["mieCoefficient"].value = ThreeJSApp.CONFIG.SKY.STARTING_MIE_COEFFICIENT;
    this.skyUniforms["mieDirectionalG"].value = ThreeJSApp.CONFIG.SKY.STARTING_MIE_DIRECTIONAL_G;

    this.parameters = {
      inclination: ThreeJSApp.CONFIG.SKY.STARTING_INCLINATION, // Changed from -0.5 to start with daytime
      azimuth: ThreeJSApp.CONFIG.SKY.STARTING_AZIMUTH,
      exposure: ThreeJSApp.CONFIG.SKY.STARTING_EXPOSURE,
    };

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.updateSun(this.parameters, pmremGenerator);
  }

  initLights() {
    const ambient = new THREE.AmbientLight(ThreeJSApp.CONFIG.LIGHTS.AMBIENT.COLOR);
    this.scene.add(ambient);

    const directionalLight1 = new THREE.DirectionalLight(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT1.COLOR,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT1.INTENSITY
    );
    directionalLight1.position.set(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT1.POSITION.x,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT1.POSITION.y,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT1.POSITION.z
    );
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT2.COLOR,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT2.INTENSITY
    );
    directionalLight2.position.set(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT2.POSITION.x,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT2.POSITION.y,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT2.POSITION.z
    );

    this.scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT3.COLOR,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT3.INTENSITY
    );
    directionalLight3.position.set(
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT3.POSITION.x,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT3.POSITION.y,
      ThreeJSApp.CONFIG.LIGHTS.DIRECTIONAL.LIGHT3.POSITION.z
    );

    this.scene.add(directionalLight3);

    const normalState = MEDITATION_CONFIG.STATES.NORMAL.effects;
    this.scene.fog = new THREE.FogExp2(normalState.fog.color, normalState.fog.density);
    this.renderer.setClearColor(this.scene.fog.color);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = ThreeJSApp.CONFIG.CAMERA.MAX_POLAR_ANGLE;
    this.controls.target.set(0, 10, 0);
    this.controls.minDistance = ThreeJSApp.CONFIG.CAMERA.MIN_DISTANCE;
    this.controls.maxDistance = ThreeJSApp.CONFIG.CAMERA.MAX_DISTANCE;
    this.controls.listenToKeyEvents(window);
    this.controls.screenSpacePanning = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = ThreeJSApp.CONFIG.CAMERA.DAMPING_FACTOR;
    this.controls.keyPanSpeed = ThreeJSApp.CONFIG.CAMERA.KEY_PAN_SPEED;
    this.controls.update();
  }

  initCenterObjects() {
    const torusKnotGeometry = new THREE.TorusKnotGeometry(
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
    );
    const sphereGeometry = new THREE.SphereGeometry(
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.RADIUS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.WIDTH_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.HEIGHT_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.PHI_SEGMENTS
    );
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({
      color: ThreeJSApp.CONFIG.MATERIALS.CENTER_SPHERE.COLOR,
      opacity: ThreeJSApp.CONFIG.MATERIALS.CENTER_SPHERE.OPACITY,
      transparent: true,
      emissive: 0x000000,
    });

    const centerWorldContainer = new THREE.Object3D();
    this.scene.add(centerWorldContainer);
    this.centerObjects.push(centerWorldContainer);

    this.centerObj = new THREE.Mesh(torusKnotGeometry, this.buildTwistMaterial(20.0));
    this.centerObj.scale.set(
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE
    );
    centerWorldContainer.add(this.centerObj);
    this.centerObjects.push(this.centerObj);

    const centerObjSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    centerObjSphere.scale.set(
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.CENTER.SPHERE.SCALE
    );
    this.centerObj.add(centerObjSphere);

    this.rot1 = this.makeRotatorObjInstance(
      torusKnotGeometry,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT1.color,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT1.x,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT1.y,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT1.z
    );
    this.rot2 = this.makeRotatorObjInstance(
      torusKnotGeometry,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT2.color,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT2.x,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT2.y,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT2.z
    );
    this.rot3 = this.makeRotatorObjInstance(
      torusKnotGeometry,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT3.color,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT3.x,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT3.y,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.POSITIONS.ROT3.z
    );
  }

  updateSun(parameters, pmremGenerator) {
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    this.sun.x = Math.cos(phi);
    this.sun.y = Math.sin(phi) * Math.sin(theta);
    this.sun.z = Math.sin(phi) * Math.cos(theta);

    this.skyUniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value.copy(this.sun).normalize();

    if (this.renderTarget !== undefined) this.renderTarget.dispose();

    this.renderTarget = pmremGenerator.fromScene(this.sky);
    this.scene.environment = this.renderTarget.texture;
  }

  makeRotatorObjInstance(geometry, color, x, y, z) {
    const rotatorMaterial = new THREE.MeshLambertMaterial({
      color: color,
      opacity: ThreeJSApp.CONFIG.MATERIALS.ROTATOR.OPACITY,
      transparent: true,
      emissive: 0x000000,
    });
    const rotatorObjInstance = new THREE.Mesh(geometry, rotatorMaterial);
    rotatorObjInstance.position.set(x, y, z);
    this.centerObjects.push(rotatorObjInstance);
    this.scene.add(rotatorObjInstance);

    const sphereGeometry = new THREE.SphereGeometry(
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.RADIUS,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.WIDTH_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.HEIGHT_SEGMENTS,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.PHI_SEGMENTS
    );
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({
      color: ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.MATERIAL.COLOR,
      opacity: ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.MATERIAL.OPACITY,
      transparent: true,
      emissive: 0x000000,
    });
    const rotatorSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    rotatorSphere.scale.set(
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.SCALE,
      ThreeJSApp.CONFIG.OBJECTS.ROTATOR.SPHERE.SCALE
    );
    rotatorObjInstance.add(rotatorSphere);
    return rotatorObjInstance;
  }

  buildTwistMaterial(amount) {
    const material = new THREE.MeshNormalMaterial();
    material.opacity = ThreeJSApp.CONFIG.MATERIALS.TWIST.OPACITY;
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
    const jellyFishPromise = this.loadGLTFModel("./img/friend3.glb");
    const friendShapePromise = this.loadGLTFModel("./img/friend3.glb");

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
    const geometry = new THREE.TorusKnotGeometry(
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.RADIUS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.TUBE,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.TUBULAR_SEGMENTS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.RADIAL_SEGMENTS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.P,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.Q
    );
    const cruller = new THREE.Mesh(geometry, this.buildTwistMaterial(ThreeJSApp.CONFIG.FLYING_OBJECTS.CRULLER.TWIST_AMOUNT));
    cruller.position.set(x, y, z);
    return cruller;
  }

  createGiantLoop(x, y, z) {
    const geometry = new THREE.TorusGeometry(
      ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.RADIUS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.TUBE,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.RADIAL_SEGMENTS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.TUBULAR_SEGMENTS,
      ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.ARC
    );
    const loop = new THREE.Mesh(geometry, this.buildTwistMaterial(ThreeJSApp.CONFIG.FLYING_OBJECTS.GIANT_LOOP.TWIST_AMOUNT));
    loop.position.set(x, y, z);
    return loop;
  }

  setupObject(obj, id, group, speeds, posX, posY, posZ, rotX, rotY, rotZ, scale) {
    this.initialObjectScales.set(obj.uuid, scale);

    obj.scale.multiplyScalar(0.01);
    obj.traverse((o) => {
      if (o.isMesh) {
        o.friendID = id;
        o.material = new THREE.MeshLambertMaterial({
          color: Math.random() * 0xffffff,
          opacity: ThreeJSApp.CONFIG.MATERIALS.DEFAULT_OPACITY,
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
      console.error("Animation loop failed", error);
    }
  }

  render() {
    //this was here to make there be no edge of the world
    const cameraPosition = this.camera.position;
    this.water.position.x = Math.floor(cameraPosition.x / 1000) * 1000;
    this.water.position.z = Math.floor(cameraPosition.z / 1000) * 1000;

    // Update shader time for all meshes
    this.scene.traverse((child) => {
      if (child.isMesh) {
        const shader = child.material.userData.shader;
        if (shader) {
          shader.uniforms.time.value = performance.now() / 1000;
        }
      }
    });

    const meditationState = this.meditationManager.currentState;
    const isDeepEnough = this.meditationManager.isDeepEnough();

    // Set target scale based on state
    this.targetScale = isDeepEnough ? 1.0 : 0.01;
    // Smoothly transition current scale
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, this.targetScale, isDeepEnough ? 0.01 : 0.005);

    // Update all objects' scales
    this.boxGroup.children.forEach((child) => {
      const originalScale = this.initialObjectScales.get(child.uuid);
      if (originalScale) {
        const targetObjectScale = originalScale * this.currentScale;
        child.scale.setScalar(targetObjectScale);
      }
    });

    if (isDeepEnough) {
      this.boxGroup.visible = true;
    } else if (this.currentScale <= 0.02) {
      this.boxGroup.visible = false;
    }

    this.jellyfishOnScreen.forEach((creature) => {
      if (creature.parent) creature.visible = isDeepEnough;
    });

    this.flyingCrullersOnScreen.forEach((creature) => {
      if (creature.parent) creature.visible = isDeepEnough;
    });

    this.flyingSpheresOnScreen.forEach((creature) => {
      if (creature.parent) creature.visible = isDeepEnough;
    });

    // Update meditation effects
    this.meditationManager.sparkleManager.updateSparkles();
    this.meditationManager.update();

    const time = performance.now() * 0.0001;

    // if (isDeepEnough) {
    // Update center object
    this.centerObj.position.y = Math.sin(time) * 20 + 5;
    this.centerObj.rotation.x = time * 0.5;
    this.centerObj.rotation.z = time * 0.51;

    // Update box group children
    for (let i = 0; i < this.boxGroup.children.length; i++) {
      const offset = this.initialFriendYPositions[i] * 15;
      this.boxGroup.children[i].position.y = Math.sin(time) * 40 + 35;
      this.boxGroup.children[i].rotation.x = Math.sin(time) * 2 + 1;
      this.boxGroup.children[i].rotation.z = Math.sin(time) * 5 + 1;
    }
    //
    // Update center objects rotation
    this.centerObjects.forEach((obj) => {
      obj.rotation.y = time;
    });
    // }

    // Update water animation
    if (this.water && this.water.material.uniforms.time) {
      const waveSpeed = this.water.userData.waveSpeed || 1.0;
      this.water.material.uniforms.time.value += waveSpeed / 60.0;
    }

    // Update raycasting only if shapes are visible
    if (isDeepEnough) {
      this.camera.updateMatrixWorld();
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hoverableObjects = this.boxGroup.children.concat(this.centerObjects);
      const intersects = this.raycaster.intersectObjects(hoverableObjects, true);

      // Handle hover effects
      if (intersects.length > 0) {
        if (this.INTERSECTED !== intersects[0].object) {
          if (this.INTERSECTED) {
            this.INTERSECTED.traverse((o) => {
              if (o.isMesh && o.material && o.material.emissive && o.currentHex !== undefined) {
                o.material.emissive.setHex(o.currentHex);
              }
            });
          }

          this.INTERSECTED = intersects[0].object;
          this.INTERSECTED.traverse((o) => {
            if (o.isMesh && o.material && o.material.emissive) {
              if (o.currentHex === undefined) {
                o.currentHex = o.material.emissive.getHex();
              }
              o.material.emissive.setHex(0xff0000);
            }
          });
        }
      } else {
        if (this.INTERSECTED) {
          this.INTERSECTED.traverse((o) => {
            if (o.isMesh && o.material && o.material.emissive && o.currentHex !== undefined) {
              o.material.emissive.setHex(o.currentHex);
            }
          });
        }
        this.INTERSECTED = null;
      }
    }

    // Render the scene
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
    // Only process interactions if in appropriate meditation state
    const isDeepEnough = this.meditationManager.isDeepEnough();
    if (!isDeepEnough) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.closeAllModals(event);

    if (
      this.checkIntersection(this.centerObj, () => {
        this.meditationManager.sparkleManager.createSparkles(this.centerObj, MEDITATION_CONFIG.SPARKLES);
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
      try {
        this.audioManager.playFriendSound();
      } catch (error) {
        console.error("Error playing friend sound:", error);
      }
      const currFriendID = intersectsFriend[0].object.friendID;
      const currModalID = `friendModalDivID${currFriendID}`;
      const currFriendModalDiv = document.getElementById(currModalID);

      console.log("Current friend ID:", currFriendID);
      console.log("Current modal ID:", currModalID);
      console.log("Modal element found:", !!currFriendModalDiv);

      if (currFriendModalDiv) {
        currFriendModalDiv.classList.add("openFriendModalDiv");
        // console.log("About to register modal visit");

        // Register the modal visit
        this.meditationManager.registerModalVisit();
      }

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
        modal.classList.add("fadeOutModal");
        setTimeout(() => {
          modal.classList.remove("openFriendModalDiv", "openMediModalDiv", "fadeOutModal");
        }, 3000);
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
}

const VIBRANT_COLORS = [
  "#FF1493", // Deep Pink
  "#00FFFF", // Cyan
  "#FF4500", // Orange Red
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
  "#4169E1", // Royal Blue
  "#FFD700", // Gold
  "#9400D3", // Violet
  "#00CED1", // Dark Turquoise
  "#FF6347", // Tomato
];

const MEDITATION_CONFIG = {
  STATES: {
    ACTIVE_EVEN_LONGER: {
      type: "movement",
      duration: 90000000,
      level: 3,
      isDeepEnough: false,
      effects: {
        water: {
          color: "#00aacc",
          distortion: 4.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 1.0,
          normalMapScale: { x: 4, y: 4 },
        },
        sky: {
          turbidity: 8,
          rayleigh: 4,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.7,
        },
        fog: {
          density: 0.0002,
          color: 0xeeeeff,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
    ACTIVE_LONGER: {
      type: "movement",
      duration: 600000,
      level: 2,
      isDeepEnough: false,
      effects: {
        water: {
          color: "#0088aa",
          distortion: 3.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 0.8,
          normalMapScale: { x: 3, y: 3 },
        },
        sky: {
          turbidity: 7,
          rayleigh: 3.5,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.7,
        },
        fog: {
          density: 0.00015,
          color: 0xeeeeff,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
    ACTIVE: {
      type: "movement",
      duration: 3000,
      level: 1,
      isDeepEnough: false,
      effects: {
        water: {
          color: "#004488",
          distortion: 2.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 0.7,
          normalMapScale: { x: 2.5, y: 2.5 },
        },
        sky: {
          turbidity: 6,
          rayleigh: 3,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.7,
        },
        fog: {
          density: 0.0001,
          color: 0xeeeeff,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
    NORMAL: {
      type: "neutral",
      duration: 100,
      level: 0,
      isDeepEnough: false,
      effects: {
        water: {
          color: "#001e0f",
          distortion: 3.7,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 1.0,
          normalMapScale: { x: 1, y: 1 },
        },
        sky: {
          turbidity: 6,
          rayleigh: 3,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.7,
        },
        fog: {
          density: 0.0002,
          color: 0xeeeeff,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
    GENTLE: {
      type: "stillness",
      duration: 3000,
      level: 1,
      isDeepEnough: true,
      effects: {
        water: {
          color: "#001e0f",
          distortion: 3.7,
          alpha: 0.95,
          sunColor: 0xffffee,
          waveSpeed: 0.6,
          normalMapScale: { x: 1.5, y: 1.5 },
        },
        sky: {
          turbidity: 5.99,
          rayleigh: 2.99,
          inclination: 0.48,
          azimuth: 0.25,
          mieCoefficient: 0.004,
          mieDirectionalG: 0.75,
        },
        fog: {
          density: 0.00012,
          color: 0xeeeeff,
        },
        sparkles: true,
        cameraMovement: false,
      },
    },
    MODERATE: {
      type: "stillness",
      duration: 6000,
      level: 2,
      isDeepEnough: true,
      effects: {
        water: {
          color: "#001e0f",
          distortion: 1.5,
          alpha: 0.9,
          sunColor: 0xddddff,
          waveSpeed: 0.4,
          normalMapScale: { x: 1.2, y: 1.2 },
        },
        sky: {
          turbidity: 8.9,
          rayleigh: 4.5,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.004,
          mieDirectionalG: 0.8,
        },
        fog: {
          density: 0.00008,
          color: 0xddddff,
        },
        sparkles: true,
        cameraMovement: false,
      },
    },
    DEEP: {
      type: "stillness",
      duration: 90000,
      level: 3,
      isDeepEnough: true,
      effects: {
        water: {
          color: "#001133",
          distortion: 0.5,
          alpha: 0.7,
          sunColor: 0x8888ff,
          waveSpeed: 0.2,
          normalMapScale: { x: 1, y: 1 },
        },
        sky: {
          turbidity: 8.9,
          rayleigh: 4.5,
          inclination: 0.49,
          azimuth: 0.25,
          mieCoefficient: 0.004,
          mieDirectionalG: 0.8,
        },
        fog: {
          density: 0.00005,
          color: 0xaaaaff,
        },
        sparkles: true,
        cameraMovement: true,
      },
    },
    PROFOUND: {
      type: "stillness",
      duration: 12000,
      level: 4,
      isDeepEnough: true,
      effects: {
        water: {
          color: "#000022",
          distortion: 0.3,
          alpha: 0.6,
          sunColor: 0x4444ff,
          waveSpeed: 0.1,
          normalMapScale: { x: 0.5, y: 0.5 },
        },
        sky: {
          turbidity: 4.0,
          rayleigh: 4.0,
          inclination: 0.15,
          azimuth: 0.85,
          mieCoefficient: 0.002,
          mieDirectionalG: 0.95,
        },
        fog: {
          density: 0.00003,
          color: 0x8888ff,
        },
        sparkles: true,
        cameraMovement: true,
      },
    },
    VOID: {
      type: "stillness",
      duration: 0, // No duration since it's the final state
      level: 5,
      isDeepEnough: true,
      effects: {
        water: {
          color: "#000000",
          distortion: 0.1,
          alpha: 0.4,
          sunColor: 0x000000,
          waveSpeed: 0.05,
          normalMapScale: { x: 0.2, y: 0.2 },
        },
        sky: {
          turbidity: 2.0,
          rayleigh: 2.0,
          inclination: 0.1,
          azimuth: 0.95,
          mieCoefficient: 0.001,
          mieDirectionalG: 1,
        },
        fog: {
          density: 0.00001,
          color: 0x000000,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
  },
  SPARKLES: {
    SPREAD: 800,
    LIGHTNESS: 0.2,
    SIZE: 5,
    QUANTITY: 100,
    NUM_SETS: 100,
    ORBIT: {
      RADIUS: 30,
      SPEED: 0.3,
      VERTICAL_RANGE: 20,
    },
  },
  TRANSITION_SPEEDS: {
    water: 0.1,
    sky: 0.02,
    camera: 0.05,
    fog: 0.03,
    sparkles: 0.08,
  },
  CAMERA_MOVEMENT: {
    VERTICAL_OFFSET: 20,
    ZOOM_OFFSET: 10,
    ROTATION_SPEED: 0.0005,
  },
};

class SparkleManager {
  constructor() {
    this.sparkleMap = new Map();
    this.active = false;
    this.initialized = false;
    this.centerContainer = null;
    this.scene = null;

    this.defaults = {
      NUM_SETS: 20,
      QUANTITY: 200,
      SPREAD: 5, // Even tighter grouping for more visible clusters
      SIZE: 15, // Slightly larger
      LIGHTNESS: 0.8, // Brighter
      ORBIT_RADIUS: 30, // Slightly larger orbit
      ORBIT_SPEED: 0.3, // Slower for better visibility
    };

    // console.log("[SparkleManager] Created, waiting for scene initialization");
  }

  initialize(scene) {
    if (this.initialized) return;

    this.scene = scene;
    this.centerContainer = this.createCenterContainer();
    this.initialized = true;
    // console.log("[SparkleManager] Initialized with scene");
  }

  createCenterContainer() {
    if (!this.scene) {
      console.error("[SparkleManager] Cannot create container: scene not initialized");
      return null;
    }

    const container = new THREE.Object3D();
    // Position the container more prominently in view
    container.position.set(0, 15, -30); // Closer to camera
    this.scene.add(container);
    return container;
  }

  createSparkles(source, config = {}) {
    if (!this.initialized || !this.centerContainer) {
      console.error("[SparkleManager] Cannot create sparkles: not properly initialized");
      return;
    }

    const params = { ...this.defaults, ...config };
    const id = source.sparkleId || `sparkle_${Date.now()}`;
    source.sparkleId = id;

    this.clearSparkles(id);
    this.sparkleMap.set(id, []);

    try {
      const sparkleContainer = new THREE.Object3D();
      this.centerContainer.add(sparkleContainer);

      for (let x = 0; x < params.NUM_SETS; x++) {
        const sparkSystem = this.createSparkleSystem(params);
        if (sparkSystem) {
          // Create orbital parameters for this system
          sparkSystem.userData.orbit = {
            radius: params.ORBIT_RADIUS * (0.8 + Math.random() * 0.4),
            speed: params.ORBIT_SPEED * (0.8 + Math.random() * 0.4),
            phase: Math.random() * Math.PI * 2,
            yOffset: Math.random() * 20 - 10,
            verticalSpeed: 0.2 + Math.random() * 0.3,
          };

          // Initial position
          this.updateSparklePosition(sparkSystem, 0);

          const sparkles = this.sparkleMap.get(id);
          sparkles.push(sparkSystem);
          sparkleContainer.add(sparkSystem);
        }
      }

      this.active = true;
    } catch (error) {
      console.error("[SparkleManager] Error creating sparkles:", error);
    }
  }

  updateSparklePosition(sparkSystem, time) {
    const orbit = sparkSystem.userData.orbit;
    sparkSystem.position.x = Math.cos(time * orbit.speed + orbit.phase) * orbit.radius;
    sparkSystem.position.z = Math.sin(time * orbit.speed + orbit.phase) * orbit.radius;
    sparkSystem.position.y = Math.sin(time * orbit.verticalSpeed) * 10 + orbit.yOffset;
  }

  createSparkleSystem(params) {
    const sparkGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const color = new THREE.Color();

    for (let i = 0; i < params.QUANTITY; i++) {
      // Create a tighter cluster of particles
      positions.push(
        (Math.random() * 2 - 1) * params.SPREAD * 0.5,
        (Math.random() * 2 - 1) * params.SPREAD * 0.5,
        (Math.random() * 2 - 1) * params.SPREAD * 0.5
      );

      // Brighter, more varied colors
      const hue = Math.random();
      const saturation = 0.8 + Math.random() * 0.2; // High saturation
      color.setHSL(hue, saturation, params.LIGHTNESS);
      colors.push(color.r, color.g, color.b);

      // More varied sizes
      sizes.push(params.SIZE * (0.3 + Math.random() * 0.7));
    }

    sparkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    sparkGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    sparkGeometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const sparkMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load("./img/spark1.png"),
        },
      },
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    return new THREE.Points(sparkGeometry, sparkMaterial);
  }

  updateSparkles() {
    if (!this.active || !this.initialized) return;

    const time = performance.now() * 0.001;

    this.sparkleMap.forEach((sparkles, id) => {
      sparkles.forEach((system) => {
        // Update position for orbital motion
        this.updateSparklePosition(system, time);

        // Update colors
        if (system && system.geometry.attributes.color) {
          const colorAttribute = system.geometry.attributes.color;

          for (let i = 0; i < colorAttribute.count; i++) {
            const hue = (time * 0.1 + i * 0.01) % 1;
            const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
            colorAttribute.array[i * 3] = color.r;
            colorAttribute.array[i * 3 + 1] = color.g;
            colorAttribute.array[i * 3 + 2] = color.b;
          }

          colorAttribute.needsUpdate = true;
        }
      });
    });

    // Subtle rotation of the entire container
    if (this.centerContainer) {
      this.centerContainer.rotation.y += 0.0005;
    }
  }

  clearSparkles(id = null) {
    if (id && this.sparkleMap.has(id)) {
      const sparkles = this.sparkleMap.get(id);
      sparkles.forEach((sparkle) => {
        if (sparkle.parent) {
          sparkle.parent.remove(sparkle);
        }
        if (sparkle.geometry) sparkle.geometry.dispose();
        if (sparkle.material) sparkle.material.dispose();
      });
      this.sparkleMap.delete(id);
    } else {
      this.sparkleMap.forEach((sparkles) => {
        sparkles.forEach((sparkle) => {
          if (sparkle.parent) {
            sparkle.parent.remove(sparkle);
          }
          if (sparkle.geometry) sparkle.geometry.dispose();
          if (sparkle.material) sparkle.material.dispose();
        });
      });
      this.sparkleMap.clear();
    }

    this.active = false;
  }
}

class CameraSequenceManager {
  constructor(app) {
    this.app = app;
    this.cameraSequenceActive = false;
    this.visitedFriends = new Set();
    this.currentSequenceTimeout = null;
    this.maxFriendsToVisit = 3;
    this.originalControlsState = {
      enabled: true,
      autoRotate: false,
    };
  }

  startSequence() {
    if (this.cameraSequenceActive) return;

    // Store original controls state including current target
    this.originalControlsState = {
      enabled: this.app.controls.enabled,
      autoRotate: this.app.controls.autoRotate,
      enablePan: this.app.controls.enablePan,
      enableZoom: this.app.controls.enableZoom,
      enableRotate: this.app.controls.enableRotate,
      target: this.app.controls.target.clone(),
    };

    // Disable controls during sequence
    this.app.controls.enabled = false;
    this.app.controls.enablePan = false;
    this.app.controls.enableZoom = false;
    this.app.controls.enableRotate = false;

    this.cameraSequenceActive = true;
    this.visitedFriends.clear();
    this.moveToNextFriend();
  }

  stopSequence() {
    this.cameraSequenceActive = false;
    if (this.currentSequenceTimeout) {
      clearTimeout(this.currentSequenceTimeout);
      this.currentSequenceTimeout = null;
    }

    if (this.originalControlsState) {
      // Restore all controls
      this.app.controls.enabled = this.originalControlsState.enabled;
      this.app.controls.autoRotate = this.originalControlsState.autoRotate;
      this.app.controls.enablePan = this.originalControlsState.enablePan;
      this.app.controls.enableZoom = this.originalControlsState.enableZoom;
      this.app.controls.enableRotate = this.originalControlsState.enableRotate;
      if (this.originalControlsState.target) {
        this.app.controls.target.copy(this.originalControlsState.target);
      }
      this.app.controls.update();
    }

    this.visitedFriends.clear();
    this.resetCamera();
  }
  moveToNextFriend() {
    if (!this.cameraSequenceActive || this.visitedFriends.size >= this.maxFriendsToVisit) {
      this.stopSequence();
      return;
    }

    // Check if boxGroup exists and has children
    const allFriends = this.app.boxGroup?.children || [];
    if (allFriends.length === 0) {
      console.warn("No friends available in boxGroup");
      this.stopSequence();
      return;
    }

    const unvisitedFriends = allFriends.filter((friend) => !this.visitedFriends.has(friend.uuid));

    if (unvisitedFriends.length === 0) {
      this.stopSequence();
      return;
    }

    const randomFriend = unvisitedFriends[Math.floor(Math.random() * unvisitedFriends.length)];
    this.visitedFriends.add(randomFriend.uuid);

    const friendPos = new THREE.Vector3();
    randomFriend.getWorldPosition(friendPos);

    // Calculate camera position relative to friend
    const distance = 80; // Increased distance
    const angle = Math.random() * Math.PI * 2; // Random angle around friend

    const targetPos = new THREE.Vector3(
      friendPos.x + Math.cos(angle) * distance,
      friendPos.y + 20, // Fixed height above friend
      friendPos.z + Math.sin(angle) * distance
    );

    this.animateCameraToPosition(targetPos, friendPos, () => {
      this.simulateClickOnFriend(randomFriend);

      // Show modal for 3 seconds
      this.currentSequenceTimeout = setTimeout(() => {
        this.closeCurrentModal();

        // Wait 20 seconds before moving to next friend
        if (this.visitedFriends.size < this.maxFriendsToVisit) {
          this.currentSequenceTimeout = setTimeout(() => {
            this.moveToNextFriend();
          }, 20000);
        } else {
          this.stopSequence();
        }
      }, 3000);
    });
  }

  animateCameraToPosition(targetPos, lookAtPos, onComplete) {
    const camera = this.app.camera;
    const startPos = camera.position.clone();
    const startLookAt = this.app.controls.target.clone();
    const duration = 25000; // 25 seconds for very slow movement
    const startTime = performance.now();

    const animate = (currentTime) => {
      if (!this.cameraSequenceActive) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Even gentler easing
      const eased = this.gentleEasing(progress);

      camera.position.lerpVectors(startPos, targetPos, eased);

      const newLookAt = new THREE.Vector3().lerpVectors(startLookAt, lookAtPos, eased);
      this.app.controls.target.copy(newLookAt);

      this.app.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  // Smoother easing function for more gentle movement
  smootherstep(x) {
    // Enhanced smoothstep with more gradual acceleration and deceleration
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  gentleEasing(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  }

  simulateClickOnFriend(friend) {
    const currFriendID = friend.friendID;
    const currModalID = `friendModalDivID${currFriendID}`;
    const currFriendModalDiv = document.getElementById(currModalID);

    if (currFriendModalDiv) {
      currFriendModalDiv.classList.add("openFriendModalDiv");

      // Use the proper registration method instead of direct increment
      if (this.app.meditationManager) {
        this.app.meditationManager.registerModalVisit();
      }

      // Play friend sound
      try {
        this.app.audioManager.playFriendSound();
      } catch (error) {
        console.error("Error playing friend sound:", error);
      }
    }

    friend.traverse((o) => {
      if (o.isMesh) {
        o.material.emissive.setHex(3135135);
        o.material.opacity = 0.2;
      }
    });
  }

  closeCurrentModal() {
    const modals = document.querySelectorAll(".friendModalDiv");
    modals.forEach((modal) => {
      if (modal.classList.contains("openFriendModalDiv")) {
        this.debugModalTransition(modal, "starting close");

        // Add opacity transition
        modal.style.transition = "opacity 3s ease-out";
        modal.style.opacity = "0";

        // Wait for transition to complete before removing classes
        setTimeout(() => {
          this.debugModalTransition(modal, "transition complete");
          modal.classList.remove("openFriendModalDiv", "fadeOutModal");
          // Reset opacity for next time
          modal.style.opacity = "1";
        }, 3000);
      }
    });
  }

  resetCamera() {
    // Remove the Promise wrapper since we're not using it
    const originalPosition = new THREE.Vector3(
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.x,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.y,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.z
    );
    const originalTarget = new THREE.Vector3(0, 10, 0);

    // Use the existing animation system for smooth transition
    this.animateCameraToPosition(originalPosition, originalTarget, () => {
      this.app.controls.target.copy(originalTarget);
      this.app.controls.update();
    });
  }

  debugModalTransition(modal, action) {
    console.log(`Modal transition - Action: ${action}`, {
      modal: modal.id,
      classes: modal.classList.toString(),
      opacity: window.getComputedStyle(modal).opacity,
      transition: window.getComputedStyle(modal).transition,
      display: window.getComputedStyle(modal).display,
    });
  }
}

class UnifiedMeditationManager {
  static dynamicStates = {
    ACTIVE: {
      water: () => {
        const color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
        // console.log("Generated new dynamic water color:", color);
        return {
          color: color,
          distortion: 2.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 0.7,
          normalMapScale: { x: 2.5, y: 2.5 },
        };
      },
    },
    ACTIVE_LONGER: {
      water: () => {
        const color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
        // console.log("Generated new dynamic water color:", color);
        return {
          color: color,
          distortion: 3.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 0.8,
          normalMapScale: { x: 3, y: 3 },
        };
      },
    },
    ACTIVE_EVEN_LONGER: {
      water: () => {
        const color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
        // console.log("Generated new dynamic water color:", color);
        return {
          color: color,
          distortion: 4.5,
          alpha: 1.0,
          sunColor: 0xffffff,
          waveSpeed: 1.0,
          normalMapScale: { x: 4, y: 4 },
        };
      },
    },
  };

  constructor(app) {
    this.app = app;
    this.currentState = "NORMAL";
    this.motionSamples = [];
    this.sampleSize = 5;
    this.motionThreshold = 0.6;
    this.isMoving = false;
    this.movementStartTime = null;
    this.stillnessStartTime = null;
    this.lastStateChange = Date.now();

    this.debugTiming = true;

    this.sparkleManager = new SparkleManager(this.scene);

    this.lastWaterColor = null; // Track the last color
    this.nextColorChangeTime = 0; // Track when to next change color
    this.colorChangeInterval = 2000; // Change color every 2 seconds

    // Store initial camera position
    this.originalCameraPosition = null;

    this.cameraSequenceManager = new CameraSequenceManager(app);

    // Initialize effects state
    this.currentEffects = {
      water: { color: new THREE.Color(MEDITATION_CONFIG.STATES.NORMAL.effects.water.color) },
      sky: { ...MEDITATION_CONFIG.STATES.NORMAL.effects.sky },
      sparkles: false,
      cameraMovement: false,
    };

    this.visitedModalsCount = 0;
    // console.log('Constructor: initialized visitedModalsCount to 0');

    this.timingConfig = {
      veryQuick: {
        NORMAL: { duration: 500 }, // 0.5 seconds
        ACTIVE: { duration: 500 }, // 
        ACTIVE_LONGER: { duration: 60000 }, // 1 minute
        ACTIVE_EVEN_LONGER: { duration: 300000 }, // 5 mins
        GENTLE: { duration: 300 }, // 0.3 seconds
        MODERATE: { duration: 600 }, // 0.6 seconds
        DEEP: { duration: 9000 }, // 9 seconds
        PROFOUND: { duration: 1200 }, // 1.2 seconds
      },
      quick: {
        NORMAL: { duration: 500 }, // 0.5 seconds
        ACTIVE: { duration: 1000 }, // 1 second
        ACTIVE_LONGER: { duration: 200000 }, // 3.3 minutes
        ACTIVE_EVEN_LONGER: { duration: 300000 }, // 5 mins
        GENTLE: { duration: 1000 }, // 1 second
        MODERATE: { duration: 2000 }, // 2 seconds
        DEEP: { duration: 30000 }, // 30 seconds
        PROFOUND: { duration: 4000 }, // 4 seconds
      },
      normal: {
        NORMAL: { duration: 1000 }, // 1 second
        ACTIVE: { duration: 3000 }, // 3 seconds
        ACTIVE_LONGER: { duration: 600000 }, // 10 minutes
        ACTIVE_EVEN_LONGER: { duration: 90000000 }, // 25 hours
        GENTLE: { duration: 3000 }, // 3 seconds
        MODERATE: { duration: 6000 }, // 6 seconds
        DEEP: { duration: 90000 }, // 1.5 minutes
        PROFOUND: { duration: 12000 }, // 12 seconds
      },
      long: {
        NORMAL: { duration: 5000 }, // 5 seconds
        ACTIVE: { duration: 10000 }, // 10 seconds
        ACTIVE_LONGER: { duration: 300000 }, // 5 mins
        ACTIVE_EVEN_LONGER: { duration: 300000 }, // 5 mins
        GENTLE: { duration: 10000 }, // 10 seconds
        MODERATE: { duration: 30000 }, // 30 seconds
        DEEP: { duration: 300000 }, // 5 minutes
        PROFOUND: { duration: 60000 }, // 1 minute
      },
      extraLong: {
        NORMAL: { duration: 15000 }, // 15 seconds
        ACTIVE: { duration: 30000 }, // 30 seconds
        ACTIVE_LONGER: { duration: 300000 }, // 5 mins
        ACTIVE_EVEN_LONGER: { duration: 300000 }, // 5 mins
        GENTLE: { duration: 30000 }, // 30 seconds
        MODERATE: { duration: 120000 }, // 2 minutes
        DEEP: { duration: 600000 }, // 10 minutes
        PROFOUND: { duration: 300000 }, // 5 minutes
      },
    };

    this.currentTiming = "normal";
  }

  debugStateTransition(stillnessDuration) {
    console.log("--- State Transition Debug ---");
    console.log("Current timing mode:", this.currentTiming);
    console.log("Current state:", this.currentState);
    console.log("Stillness duration:", stillnessDuration);

    // Show the current mode's durations
    console.log(`${this.currentTiming.toUpperCase()} mode durations:`, {
      GENTLE: MEDITATION_CONFIG.STATES.GENTLE.duration,
      MODERATE: MEDITATION_CONFIG.STATES.MODERATE.duration,
      DEEP: MEDITATION_CONFIG.STATES.DEEP.duration,
      PROFOUND: MEDITATION_CONFIG.STATES.PROFOUND.duration,
    });

    // Show timing config values
    console.log("Configured durations:", {
      GENTLE: this.timingConfig[this.currentTiming].GENTLE.duration,
      MODERATE: this.timingConfig[this.currentTiming].MODERATE.duration,
      DEEP: this.timingConfig[this.currentTiming].DEEP.duration,
      PROFOUND: this.timingConfig[this.currentTiming].PROFOUND.duration,
    });

    console.log("Comparison results:", {
      shouldBeGentle: stillnessDuration > MEDITATION_CONFIG.STATES.GENTLE.duration,
      shouldBeModerate: stillnessDuration > MEDITATION_CONFIG.STATES.MODERATE.duration,
      shouldBeDeep: stillnessDuration > MEDITATION_CONFIG.STATES.DEEP.duration,
      shouldBeProfound: stillnessDuration > MEDITATION_CONFIG.STATES.PROFOUND.duration,
    });
  }

  getDurationForState(stateName) {
    if (this.timingConfig[this.currentTiming] && this.timingConfig[this.currentTiming][stateName]) {
      return this.timingConfig[this.currentTiming][stateName].duration;
    }
    return MEDITATION_CONFIG.STATES[stateName].duration;
  }

  updateTimingMode(mode) {
    console.log("Updating timing mode to:", mode);
    const previousTiming = this.currentTiming;

    switch (mode) {
        case "Normal":
            this.currentTiming = "normal";
            break;
        case "Quick Test":
            this.currentTiming = "quick";
            break;
        case "Very Quick Test":
            this.currentTiming = "veryQuick";
            break;
        case "Long":
            this.currentTiming = "long";
            break;
        case "Extra Long":
            this.currentTiming = "extraLong";
            break;
    }

    if (this.debugTiming) {
        console.log("Previous timing mode:", previousTiming);
        console.log("New timing mode:", this.currentTiming);
        console.log("Current state:", this.currentState);
    }

    // Sync timing values to MEDITATION_CONFIG
    Object.keys(this.timingConfig[this.currentTiming]).forEach(state => {
        if (MEDITATION_CONFIG.STATES[state]) {
            const newDuration = this.timingConfig[this.currentTiming][state].duration;
            MEDITATION_CONFIG.STATES[state].duration = newDuration;
            
            if (this.debugTiming) {
                console.log(`Updated ${state} duration to:`, newDuration);
            }
        }
    });

    if (this.debugTiming) {
        console.log("Verified MEDITATION_CONFIG durations after update:", {
            GENTLE: MEDITATION_CONFIG.STATES.GENTLE.duration,
            MODERATE: MEDITATION_CONFIG.STATES.MODERATE.duration,
            DEEP: MEDITATION_CONFIG.STATES.DEEP.duration,
            PROFOUND: MEDITATION_CONFIG.STATES.PROFOUND.duration
        });
    }

    // Force a state update to apply new timing
    this.updateState(true);
}

  updateState(forceUpdate = false) {
    const now = Date.now();
    let newState = "NORMAL";

    if (this.debugTiming) {
      console.log("Updating state with timing mode:", this.currentTiming);
    }

    if (this.isMoving && this.movementStartTime) {
      const movementDuration = now - this.movementStartTime;

      if (this.debugTiming) {
        console.log("Movement duration:", movementDuration);
        console.log("Movement thresholds:", {
          ACTIVE: MEDITATION_CONFIG.STATES.ACTIVE.duration,
          ACTIVE_LONGER: MEDITATION_CONFIG.STATES.ACTIVE_LONGER.duration,
          ACTIVE_EVEN_LONGER: MEDITATION_CONFIG.STATES.ACTIVE_EVEN_LONGER.duration,
        });
      }

      if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE_EVEN_LONGER.duration) {
        newState = "ACTIVE_EVEN_LONGER";
      } else if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE_LONGER.duration) {
        newState = "ACTIVE_LONGER";
      } else if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE.duration) {
        newState = "ACTIVE";
      }

      if (this.visitedModalsCount > 0) {
        this.visitedModalsCount = 0;
      }
    } else if (this.stillnessStartTime) {
      const stillnessDuration = now - this.stillnessStartTime;

      // Add our new debug call here
      if (this.debugTiming) {
        this.debugStateTransition(stillnessDuration);
      }

      if (this.debugTiming) {
        console.log("Stillness duration:", stillnessDuration);
        console.log("Current thresholds:", {
          profound: this.getDurationForState("PROFOUND"),
          deep: this.getDurationForState("DEEP"),
          moderate: this.getDurationForState("MODERATE"),
          gentle: this.getDurationForState("GENTLE"),
        });
      }

      if (this.debugTiming && newState !== this.currentState) {
        console.log(`State transition triggered to: ${newState}`);
      }

      // First check for VOID/PROFOUND state
      if (stillnessDuration > this.getDurationForState("PROFOUND")) {
        newState = this.visitedModalsCount >= 3 ? "VOID" : "PROFOUND";
      }
      // Then check other stillness states
      else if (stillnessDuration > this.getDurationForState("DEEP")) {
        newState = "DEEP";
      } else if (stillnessDuration > this.getDurationForState("MODERATE")) {
        newState = "MODERATE";
      } else if (stillnessDuration > this.getDurationForState("GENTLE")) {
        newState = "GENTLE";
      }

      // Only reset modal count if actually transitioning to a less deep state
      const stateDepths = {
        VOID: 5,
        PROFOUND: 4,
        DEEP: 3,
        MODERATE: 2,
        GENTLE: 1,
        NORMAL: 0,
      };

      if (this.currentState === "PROFOUND" && newState !== "VOID" && newState !== "PROFOUND" && stateDepths[newState] < stateDepths["PROFOUND"]) {
        console.log(`Resetting modal count - transitioning from PROFOUND to ${newState}`);
        this.visitedModalsCount = 0;
      }
    }

    if (newState !== this.currentState || forceUpdate) {
      if (this.debugTiming) {
        console.log(`State changing from ${this.currentState} to ${newState}`);
        console.log("Current timing config:", this.timingConfig[this.currentTiming]);
      }

      // If transitioning to void, ensure all modals are closed first
      if (newState === "VOID") {
        // this.cameraSequenceManager.closeAllModalsSlowly(() => {
        //     this.currentState = newState;
        //     this.lastStateChange = now;
        //     this.applyStateEffects();
        // });
      } else {
        this.currentState = newState;
        this.lastStateChange = now;
        this.applyStateEffects();
      }
    }
  }

  registerModalVisit() {
    console.log("--- Modal Visit Registration ---");
    // console.log('Before increment:', this.visitedModalsCount);
    this.visitedModalsCount++;
    // console.log('After increment:', this.visitedModalsCount);
  }

  isInVoidState() {
    return this.currentState === "VOID" && this.visitedModalsCount >= 3;
  }

  isDeepEnough() {
    return MEDITATION_CONFIG.STATES[this.currentState].isDeepEnough;
  }

  onMotionDetected() {
    // console.log('--- Motion Detected ---');
    // console.log('Modal count before motion:', this.visitedModalsCount);
    const now = Date.now();
    this.motionSamples.push(true);
    if (this.motionSamples.length > this.sampleSize) {
      this.motionSamples.shift();
    }

    const motionRatio = this.motionSamples.filter(Boolean).length / this.motionSamples.length;

    if (motionRatio >= this.motionThreshold) {
      if (!this.isMoving) {
        this.isMoving = true;
        this.movementStartTime = now;
        this.stillnessStartTime = null;
      }
      this.updateState();
    }
  }

  onNoMotionDetected() {
    // console.log('--- No Motion Detected ---');
    // console.log('Modal count during stillness:', this.visitedModalsCount);
    const now = Date.now();
    this.motionSamples.push(false);
    if (this.motionSamples.length > this.sampleSize) {
      this.motionSamples.shift();
    }

    const motionRatio = this.motionSamples.filter(Boolean).length / this.motionSamples.length;

    if (motionRatio < 1 - this.motionThreshold) {
      if (!this.stillnessStartTime) {
        this.stillnessStartTime = now;
      }
      if (this.isMoving && now - this.stillnessStartTime >= 2000) {
        this.isMoving = false;
        this.movementStartTime = null;
      }
    } else {
      this.stillnessStartTime = null;
    }

    this.updateState();
  }
  update() {
    this.updateState();
    this.applyStateEffects();

    if (this.app.debugMode) {
      const debugInfo = this.getDebugInfo();
      const debugContainer = document.getElementById("debugInfo");
      if (debugContainer) {
        debugContainer.innerHTML = `
                Current State: <span style="color: #00ff00">${debugInfo.meditationState}</span><br>
            Time in Current State: ${debugInfo.timeInCurrentState}<br>
                Time Since Motion: ${debugInfo.timeSinceMotion}<br>
                Movement Duration: ${debugInfo.movementDuration}<br>
                Modals Visited: ${debugInfo.modalsVisited}<br>
                <br>
                Visual Effects:<br>
                ▸ Ocean Color: ${debugInfo.effects.waterColor}<br>
                ▸ Wave Strength: ${debugInfo.effects.waveStrength}<br>
                ▸ Sparkles: ${debugInfo.effects.sparkles}<br>
                ▸ Sky Changes: ${debugInfo.effects.skyChanges ? "Active" : "Inactive"}<br>
                ▸ Camera Movement: ${debugInfo.effects.cameraMovement}<br>
            `;
      }
    }
  }

  //   updateState() {
  //     const now = Date.now();
  //     let newState = "NORMAL";

  //     // console.log('--- State Update ---');
  //     // console.log('Current state:', this.currentState);
  //     // console.log('Current modal count:', this.visitedModalsCount);
  //     // console.log('Is moving:', this.isMoving);

  //     if (this.isMoving && this.movementStartTime) {
  //         // console.log("Movement detected, resetting modal count from:", this.visitedModalsCount);
  //         const movementDuration = now - this.movementStartTime;

  //         if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE_EVEN_LONGER.duration) {
  //             newState = "ACTIVE_EVEN_LONGER";
  //         } else if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE_LONGER.duration) {
  //             newState = "ACTIVE_LONGER";
  //         } else if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE.duration) {
  //             newState = "ACTIVE";
  //         }

  //         if (this.visitedModalsCount > 0) {
  //             // console.log('Resetting modal count due to movement');
  //             this.visitedModalsCount = 0;
  //         }
  //     } else if (this.stillnessStartTime) {
  //         const stillnessDuration = now - this.stillnessStartTime;
  //         // console.log('Stillness duration:', stillnessDuration);

  //         // First check for VOID/PROFOUND state
  //         if (stillnessDuration > MEDITATION_CONFIG.STATES.PROFOUND.duration) {
  //             // console.log('In profound state check. Modal count:', this.visitedModalsCount);
  //             // Must visit 3 modals before entering VOID
  //             newState = this.visitedModalsCount >= 3 ? "VOID" : "PROFOUND";
  //         }
  //         // Then check other stillness states
  //         else if (stillnessDuration > MEDITATION_CONFIG.STATES.DEEP.duration) {
  //             newState = "DEEP";
  //         } else if (stillnessDuration > MEDITATION_CONFIG.STATES.MODERATE.duration) {
  //             newState = "MODERATE";
  //         } else if (stillnessDuration > MEDITATION_CONFIG.STATES.GENTLE.duration) {
  //             newState = "GENTLE";
  //         }

  //         // Only reset modal count if actually transitioning to a less deep state
  //         const stateDepths = {
  //             'VOID': 5,
  //             'PROFOUND': 4,
  //             'DEEP': 3,
  //             'MODERATE': 2,
  //             'GENTLE': 1,
  //             'NORMAL': 0
  //         };

  //         if (this.currentState === "PROFOUND" &&
  //             newState !== "VOID" &&
  //             newState !== "PROFOUND" &&
  //             stateDepths[newState] < stateDepths['PROFOUND']) {
  //             console.log(`Resetting modal count - transitioning from PROFOUND to ${newState}`);
  //             this.visitedModalsCount = 0;
  //         }
  //     }

  //     if (newState !== this.currentState) {
  //         // console.log(`State changing from ${this.currentState} to ${newState}`);
  //         // If transitioning to void, ensure all modals are closed first
  //         if (newState === "VOID") {
  //             // this.cameraSequenceManager.closeAllModalsSlowly(() => {
  //             //     this.currentState = newState;
  //             //     this.lastStateChange = now;
  //             //     this.applyStateEffects();
  //             // });
  //         } else {
  //             this.currentState = newState;
  //             this.lastStateChange = now;
  //             this.applyStateEffects();
  //         }
  //     }
  // }

  applyStateEffects() {
    const now = Date.now();
    const targetEffects = { ...MEDITATION_CONFIG.STATES[this.currentState].effects };

    // Handle dynamic water effects for active states
    if (UnifiedMeditationManager.dynamicStates[this.currentState]) {
      if (now >= this.nextColorChangeTime) {
        const dynamicEffects = UnifiedMeditationManager.dynamicStates[this.currentState];
        const newWaterEffect = dynamicEffects.water();
        targetEffects.water = newWaterEffect;

        // Schedule next color change
        this.nextColorChangeTime = now + this.colorChangeInterval;
        // console.log("Applied new water color:", newWaterEffect.color);
      } else if (this.lastWaterColor) {
        // Keep the last dynamic color until next change
        targetEffects.water.color = this.lastWaterColor;
      }
    }

    // Store the current color
    this.lastWaterColor = targetEffects.water.color;

    // Update all effects
    this.updateWater(targetEffects.water);
    this.updateSky(targetEffects.sky);
    this.updateFog(targetEffects.fog);
    this.updateSparkles(targetEffects.sparkles);
    this.updateCamera(targetEffects.cameraMovement);
  }

  updateWater(targetWater) {
    if (!this.app.water) return;

    // console.log("Updating water color to:", targetWater.color);

    // Convert target color to THREE.Color
    const targetColor = new THREE.Color(targetWater.color);
    const currentColor = this.app.water.material.uniforms.waterColor.value;

    // console.log("Current color:", currentColor.getHexString());
    // console.log("Target color:", targetColor.getHexString());

    const transitionSpeed = this.currentState.includes("ACTIVE")
      ? MEDITATION_CONFIG.TRANSITION_SPEEDS.water * 0.5
      : MEDITATION_CONFIG.TRANSITION_SPEEDS.water;

    // Apply the color transition
    this.app.water.material.uniforms.waterColor.value.lerp(targetColor, transitionSpeed);

    // console.log("New color after lerp:", this.app.water.material.uniforms.waterColor.value.getHexString());

    // Update other water properties
    this.app.water.material.uniforms["distortionScale"].value = THREE.MathUtils.lerp(
      this.app.water.material.uniforms["distortionScale"].value,
      targetWater.distortion,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.water
    );

    this.app.water.material.uniforms.alpha.value = THREE.MathUtils.lerp(
      this.app.water.material.uniforms.alpha.value,
      targetWater.alpha,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.water
    );

    const targetSunColor = new THREE.Color(targetWater.sunColor);
    this.app.water.material.uniforms.sunColor.value.lerp(targetSunColor, MEDITATION_CONFIG.TRANSITION_SPEEDS.water);

    this.app.water.material.uniforms.time.value += targetWater.waveSpeed / 60.0;

    this.app.water.material.uniforms.normalSampler.value.repeat.set(targetWater.normalMapScale.x, targetWater.normalMapScale.y);
  }

  updateSky(targetSky) {
    if (!this.app.skyUniforms) return;

    // Update all sky parameters
    this.app.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["turbidity"].value,
      targetSky.turbidity,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["rayleigh"].value,
      targetSky.rayleigh,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.skyUniforms["mieCoefficient"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["mieCoefficient"].value,
      targetSky.mieCoefficient,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.skyUniforms["mieDirectionalG"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["mieDirectionalG"].value,
      targetSky.mieDirectionalG,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.parameters.inclination = THREE.MathUtils.lerp(
      this.app.parameters.inclination,
      targetSky.inclination,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.parameters.azimuth = THREE.MathUtils.lerp(this.app.parameters.azimuth, targetSky.azimuth, MEDITATION_CONFIG.TRANSITION_SPEEDS.sky);

    this.app.updateSun(this.app.parameters, new THREE.PMREMGenerator(this.app.renderer));
  }

  updateFog(targetFog) {
    if (!this.app.scene.fog) return;

    // Update fog density
    this.app.scene.fog.density = THREE.MathUtils.lerp(this.app.scene.fog.density, targetFog.density, MEDITATION_CONFIG.TRANSITION_SPEEDS.fog);

    // Update fog color
    const targetColor = new THREE.Color(targetFog.color);
    this.app.scene.fog.color.lerp(targetColor, MEDITATION_CONFIG.TRANSITION_SPEEDS.fog);
    this.app.renderer.setClearColor(this.app.scene.fog.color);
  }

  updateSparkles(shouldSparkle) {
    if (!this.sparkleManager.initialized) {
      console.warn("SparkleManager not yet initialized, skipping sparkle update");
      return;
    }

    if (shouldSparkle && !this.currentEffects.sparkles) {
      this.sparkleManager.createSparkles({}, MEDITATION_CONFIG.SPARKLES);
      this.currentEffects.sparkles = true;
    } else if (!shouldSparkle && this.currentEffects.sparkles) {
      this.sparkleManager.clearSparkles();
      this.currentEffects.sparkles = false;
    }
  }

  updateCamera(shouldMove) {
    if (shouldMove) {
      this.cameraSequenceManager.startSequence();
    } else {
      this.cameraSequenceManager.stopSequence();
    }
  }

  // updateCamera(shouldMove) {
  //   if (!shouldMove) {
  //     this.resetCamera();
  //     return;
  //   }

  //   if (!this.originalCameraPosition) {
  //     this.originalCameraPosition = this.app.camera.position.clone();
  //   }

  //   const targetY = this.originalCameraPosition.y + 20;
  //   const targetZ = this.originalCameraPosition.z + 10;

  //   this.app.camera.position.y = THREE.MathUtils.lerp(this.app.camera.position.y, targetY, MEDITATION_CONFIG.TRANSITION_SPEEDS.camera);

  //   this.app.camera.position.z = THREE.MathUtils.lerp(this.app.camera.position.z, targetZ, MEDITATION_CONFIG.TRANSITION_SPEEDS.camera);
  // }

  resetCamera() {
    const originalPosition = new THREE.Vector3(
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.x,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.y,
      ThreeJSApp.CONFIG.CAMERA.INITIAL_POSITION.z
    );
    const originalTarget = new THREE.Vector3(0, 10, 0);

    return new Promise((resolve) => {
      this.animateCameraToPosition(originalPosition, originalTarget, () => {
        this.app.controls.target.copy(originalTarget);
        this.app.controls.update();
        resolve();
      });
    });
  }

  getDebugInfo() {
    const now = Date.now();
    const stateConfig = MEDITATION_CONFIG.STATES[this.currentState];
    const elapsedTime = (now - this.lastStateChange) / 1000; // Time in seconds

    // Add debug logging to see what we're getting
    console.log('State duration debug:', {
        state: this.currentState,
        configDuration: stateConfig.duration,
        timingMode: this.currentTiming,
        timingConfigDuration: this.timingConfig[this.currentTiming][this.currentState]?.duration
    });

    // Get duration from the active timing config instead of state config
    const totalDuration = this.timingConfig[this.currentTiming][this.currentState]?.duration / 1000;

    return {
        meditationState: this.currentState,
        timeInCurrentState: `${elapsedTime.toFixed(1)}s of ${totalDuration.toFixed(1)}s`,
        timeSinceMotion: this.stillnessStartTime ? ((now - this.stillnessStartTime) / 1000).toFixed(1) + "s" : "0s",
        movementDuration: this.movementStartTime ? ((now - this.movementStartTime) / 1000).toFixed(1) + "s" : "0s",
        modalsVisited: this.visitedModalsCount,
        effects: {
            waterColor: `#${this.app.water?.material.uniforms.waterColor.value.getHexString()}`,
            waveStrength: stateConfig.effects.water.distortion,
            sparkles: stateConfig.effects.sparkles ? "Active" : "Inactive",
            skyChanges: true,
            cameraMovement: stateConfig.effects.cameraMovement ? "Active" : "Inactive",
        },
    };
}
}

class GUIManager {
  constructor(app, renderer, scene, camera, water, audioManager, skyUniforms, parameters, centerObj) {
    this.app = app;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.water = water;
    this.audioManager = audioManager;
    this.skyUniforms = skyUniforms;
    this.parameters = parameters;
    this.centerObj = centerObj;

    this.SKY_PRESETS = {
      DEFAULT: {
        name: "Default",
        turbidity: ThreeJSApp.CONFIG.SKY.STARTING_TURBIDITY,
        rayleigh: ThreeJSApp.CONFIG.SKY.STARTING_RAYLEIGH,
        mieCoefficient: ThreeJSApp.CONFIG.SKY.STARTING_MIE_COEFFICIENT,
        mieDirectionalG: ThreeJSApp.CONFIG.SKY.STARTING_MIE_DIRECTIONAL_G,
        inclination: ThreeJSApp.CONFIG.SKY.STARTING_INCLINATION,
        azimuth: ThreeJSApp.CONFIG.SKY.STARTING_AZIMUTH,
      },
      DEEPER_SUNSET: {
        name: "Deeper Sunset",
        turbidity: 6,
        rayleigh: 6,
        mieCoefficient: 0.003,
        mieDirectionalG: 0.7,
        inclination: 0.49,
        azimuth: 0.25,
      },
      ROUNDER_SUNSET: {
        name: "RounderSunset",
        turbidity: 4.0,
        rayleigh: 2.0,
        mieCoefficient: 0.003,
        mieDirectionalG: 0.8,
        inclination: 0.49,
        azimuth: 0.25,
      },
      DARKNESS: {
        name: "Darkness",
        turbidity: 4.0,
        rayleigh: 4.0,
        mieCoefficient: 0.035,
        mieDirectionalG: 0.7,
        inclination: 0.15,
        azimuth: 0.75,
      },
      MELLOW_SUNSET: {
        name: "Mellow Sunset",
        turbidity: 1.0,
        rayleigh: 2.0,
        mieCoefficient: 0.002,
        mieDirectionalG: 0.999,
        inclination: 0.49,
        azimuth: 0.25,
      },
      SUN_MELTS: {
        name: "Sun Melts",
        turbidity: 8.9,
        rayleigh: 4.5,
        mieCoefficient: 0.006,
        mieDirectionalG: 0.96,
        inclination: 0.49,
        azimuth: 0.25,
      },
    };

    this.WATER_PRESETS = {
      DEFAULT: {
        name: "Default",
        distortion: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE,
        alpha: 1.0,
        waveSpeed: 1.0,
        normalScale: { x: 1, y: 1 },
        waterColor: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR,
        sunColor: ThreeJSApp.CONFIG.WATER.STARTING_SUN_COLOR,
      },
      CALM: {
        name: "Calm",
        distortion: 0.5,
        alpha: 0.9,
        waveSpeed: 0.3,
        normalScale: { x: 1, y: 1 },
        waterColor: 0x001e0f,
        sunColor: 0xffffff,
      },
      STORMY: {
        name: "Stormy",
        distortion: 4.0,
        alpha: 1.0,
        waveSpeed: 1.5,
        normalScale: { x: 3, y: 3 },
        waterColor: 0x001133,
        sunColor: 0x88aaff,
      },
      MYSTICAL: {
        name: "Mystical",
        distortion: 2.0,
        alpha: 0.7,
        waveSpeed: 0.8,
        normalScale: { x: 2, y: 2 },
        waterColor: 0x000066,
        sunColor: 0xaaaaff,
      },
      DEEP: {
        name: "Deep",
        distortion: 0.3,
        alpha: 0.6,
        waveSpeed: 0.2,
        normalScale: { x: 0.5, y: 0.5 },
        waterColor: 0x000022,
        sunColor: 0x4444ff,
      },
    };
  }

  initGUI() {
    this.gui = new GUI({ autoPlace: true, load: false });
    const audioFolder = this.initAudioFolder();
    const objectsFolder = this.initObjectsFolder();
    const meditationFolder = this.gui.addFolder("Meditation Effects");

    const skyFolder = this.initSkyFolder(meditationFolder);
    const waterFolder = this.initWaterFolder(meditationFolder);
    const fogFolder = this.initFogFolder(meditationFolder);
    const lightFolder = this.initLightingFolder(meditationFolder);
    const testingFolder = this.initTestingFolder(meditationFolder);

    this.openFolders(audioFolder, objectsFolder, meditationFolder, skyFolder, waterFolder, fogFolder);

    // Hide GUI after it's fully created
    const guiElement = document.querySelector(".dg.ac");
    if (guiElement) {
      guiElement.style.display = "none";
    }
  }

  initAudioFolder() {
    const folder = this.gui.addFolder("Audio");

    folder
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

    folder
      .add(
        {
          toggleMute: () => {
            const seaSound = this.audioManager.seaSounds[0];
            seaSound.volume = seaSound.volume > 0 ? 0 : 0.09;
          },
        },
        "toggleMute"
      )
      .name("Toggle Mute");

    folder
      .add({ volume: 0.09 }, "volume", 0, 1)
      .name("Sea Volume")
      .onChange((value) => {
        this.audioManager.seaSounds[0].volume = value;
      });

    return folder;
  }

  initObjectsFolder() {
    const folder = this.gui.addFolder("Objects");

    folder
      .add({ scale: ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE }, "scale", 0.1, 5)
      .name("Center Object Scale")
      .onChange((value) => {
        this.centerObj.scale.set(value, value, value);
      });

    // Create utility function for geometry updates
    const updateGeometry = (params) => {
      const newGeometry = new THREE.TorusKnotGeometry(
        params.radius || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
        params.tube || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
        params.tubularSegments || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
        params.radialSegments || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
        params.p || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
        params.q || ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
      );
      this.centerObj.geometry.dispose();
      this.centerObj.geometry = newGeometry;
    };

    folder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBE", 0.1, 5)
      .name("Torus Knot Tube")
      .onChange((value) => {
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE = value;
        updateGeometry({ tube: value });
      });

    folder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBULAR_SEGMENTS", 3, 500, 1)
      .name("Tubular Segments")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS = value;
        updateGeometry({ tubularSegments: value });
      });

    folder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "RADIAL_SEGMENTS", 3, 50, 1)
      .name("Radial Segments")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS = value;
        updateGeometry({ radialSegments: value });
      });

    folder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "P", 1, 10, 1)
      .name("P (Twist)")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P = value;
        updateGeometry({ p: value });
      });

    folder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "Q", 1, 10, 1)
      .name("Q (Twist)")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q = value;
        updateGeometry({ q: value });
      });

    return folder;
  }

  initSkyFolder(parentFolder) {
    const folder = parentFolder.addFolder("Sky Effects");

    folder.add(this.skyUniforms["mieCoefficient"], "value", 0, 0.1).name("Sun Size");

    folder.add(this.skyUniforms["mieDirectionalG"], "value", 0, 1).name("Sun Sharpness");

    folder
      .add(
        { preset: "Default" },
        "preset",
        Object.values(this.SKY_PRESETS).map((preset) => preset.name)
      )
      .name("Sky Presets")
      .onChange((presetName) => {
        const preset = Object.values(this.SKY_PRESETS).find((p) => p.name === presetName);
        if (preset) {
          this.applySkyPreset(preset, folder);
        }
      });

    folder.add(this.skyUniforms["rayleigh"], "value", 0, 10).name("Rayleigh");
    folder.add(this.skyUniforms["turbidity"], "value", 0, 20).name("Turbidity");
    folder.add(this.skyUniforms["mieCoefficient"], "value", 0, 0.1).name("Mie Coefficient");
    folder.add(this.skyUniforms["mieDirectionalG"], "value", 0, 1).name("Mie Directional G");

    folder
      .add(this.parameters, "azimuth", 0, 1)
      .name("Azimuth (Sun Position)")
      .onChange(() => {
        this.app.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
      });

    folder
      .add(this.parameters, "inclination", -0.5, 0.5)
      .name("Inclination (Day/Night)")
      .onChange(() => {
        this.app.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
      });

    return folder;
  }

  applySkyPreset(preset, folder) {
    this.skyUniforms["turbidity"].value = preset.turbidity;
    this.skyUniforms["rayleigh"].value = preset.rayleigh;
    this.skyUniforms["mieCoefficient"].value = preset.mieCoefficient;
    this.skyUniforms["mieDirectionalG"].value = preset.mieDirectionalG;
    this.parameters.azimuth = preset.azimuth;
    this.parameters.inclination = preset.inclination;

    this.app.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));

    folder.__controllers.forEach((controller) => {
      controller.updateDisplay();
    });
  }

  initWaterFolder(parentFolder) {
    const folder = parentFolder.addFolder("Water Effects");

    folder.add(this.water.material.uniforms.distortionScale, "value", 0, 10).name("Wave Distortion");

    folder.add(this.water.material.uniforms.alpha, "value", 0, 1).name("Transparency");

    const waveControls = folder.addFolder("Wave Settings");
    waveControls
      .add({ speed: 1.0 }, "speed", 0.1, 2.0)
      .name("Wave Speed")
      .onChange((value) => {
        this.water.userData.waveSpeed = value;
      });

    waveControls.add(this.water.material.uniforms.normalSampler.value.repeat, "x", 0.1, 5).name("Normal Scale X");
    waveControls.add(this.water.material.uniforms.normalSampler.value.repeat, "y", 0.1, 5).name("Normal Scale Y");

    const colorControls = folder.addFolder("Color Settings");
    this.addWaterColorControls(colorControls);

    folder
      .add(
        { preset: "Default" },
        "preset",
        Object.values(this.WATER_PRESETS).map((preset) => preset.name)
      )
      .name("Water Presets")
      .onChange((presetName) => {
        const preset = Object.values(this.WATER_PRESETS).find((p) => p.name === presetName);
        if (preset) {
          this.applyWaterPreset(preset);
        }
      });

    return folder;
  }

  addWaterColorControls(folder) {
    folder
      .addColor({ waterColor: this.water.material.uniforms.waterColor.value.getHex() }, "waterColor")
      .name("Water Color")
      .onChange((value) => {
        this.water.material.uniforms.waterColor.value.setHex(value);
      });

    folder
      .addColor({ sunColor: this.water.material.uniforms.sunColor.value.getHex() }, "sunColor")
      .name("Sun Reflection Color")
      .onChange((value) => {
        this.water.material.uniforms.sunColor.value.setHex(value);
      });
  }

  applyWaterPreset(preset) {
    this.water.material.uniforms.distortionScale.value = preset.distortion;
    this.water.material.uniforms.alpha.value = preset.alpha;
    this.water.userData.waveSpeed = preset.waveSpeed;
    this.water.material.uniforms.normalSampler.value.repeat.set(preset.normalScale.x, preset.normalScale.y);
    this.water.material.uniforms.waterColor.value.setHex(preset.waterColor);
    this.water.material.uniforms.sunColor.value.setHex(preset.sunColor);

    // Update all GUI controllers
    if (this.gui) {
      const waterFolder = this.gui.folders.find((folder) => folder.name === "Water Effects");
      if (waterFolder) {
        Object.values(waterFolder.__controllers).forEach((controller) => {
          controller.updateDisplay();
        });
      }
    }
  }

  initFogFolder(parentFolder) {
    const folder = parentFolder.addFolder("Fog Settings");

    folder.add(this.scene.fog, "density", 0, 0.001, 0.00001).name("Fog Density");

    folder
      .addColor({ fogColor: this.scene.fog.color.getHex() }, "fogColor")
      .name("Fog Color")
      .onChange((value) => {
        this.scene.fog.color.setHex(value);
        this.renderer.setClearColor(this.scene.fog.color);
      });

    return folder;
  }

  initLightingFolder(parentFolder) {
    const folder = parentFolder.addFolder("Lighting");

    const directionalLight1 = this.scene.children.find((child) => child.type === "DirectionalLight");
    if (directionalLight1) {
      folder.add(directionalLight1, "intensity", 0, 2).name("Sun Light Intensity");

      folder
        .addColor({ color: directionalLight1.color.getHex() }, "color")
        .name("Sun Light Color")
        .onChange((value) => {
          directionalLight1.color.setHex(value);
        });
    }

    return folder;
  }

  initTestingFolder(parentFolder) {
    const folder = parentFolder.addFolder("Testing Controls");

    const testingParams = { timingMode: "Normal" };
    folder
      .add(testingParams, "timingMode", ["Normal", "Quick Test", "Very Quick Test", "Long", "Extra Long"])
      .name("Timing Mode")
      .onChange((value) => {
        console.log("Timing mode changed to:", value);
        this.app.meditationManager.updateTimingMode(value);
      });

    return folder;
  }

  openFolders(...folders) {
    folders.forEach((folder) => folder?.open());
  }
}

class AudioManager {
  constructor() {
    this.friendSounds = [
      this.createAudio("./audio/friendSound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.FRIEND),
      this.createAudio("./audio/friend1Sound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.FRIEND),
      this.createAudio("./audio/friend2Sound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.FRIEND),
    ];

    this.rot1 = this.createAudio("./audio/rot1Sound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.SPECIAL);
    this.rot2 = this.createAudio("./audio/rot2Sound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.SPECIAL);
    this.rot3 = this.createAudio("./audio/rot3Sound.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.SPECIAL);

    this.ambientMusicSounds = [
      this.createAudio("./audio/background.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.BACKGROUND),
      this.createAudio("./audio/emmanuelle.mp3"),
      this.rot1,
      this.rot2,
      this.rot3,
    ];

    this.seaSounds = [this.createAudio("./audio/sea.mp3", ThreeJSApp.CONFIG.AUDIO.VOLUMES.SEA), this.createAudio("./audio/sea.wav")];

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

  playFriendSound() {
    let thisFriendSound = this.friendSounds[Math.floor(Math.random() * this.friendSounds.length)];
    thisFriendSound = thisFriendSound.cloneNode();
    thisFriendSound.volume = ThreeJSApp.CONFIG.AUDIO.VOLUMES.FRIEND;
    thisFriendSound.play();
  }

  playSpecialSound(specialSound, length) {
    if (!specialSound) {
      console.error("Special sound not initialized", new Error().stack);
      return;
    }

    this.pauseAmbientMusicSounds();
    specialSound.volume = ThreeJSApp.CONFIG.AUDIO.VOLUMES.SPECIAL;

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
let app = null;

window.initializeApp = function () {
  // Don't create an instance here, just wait for OpenCV
  console.log("Waiting for OpenCV to initialize...");
};

window.onOpenCvReady = function () {
  console.log("OpenCV.js is ready");
  if (!app) {
    app = new ThreeJSApp();

    // Start camera processing after everything is initialized
    app.cameraProcessor
      .setupCamera()
      .then(() => {
        app.cameraProcessor.startVideoProcessing();
        app.animate();
      })
      .catch((error) => {
        console.error("Failed to initialize camera:", error);
      });
  } else {
    console.warn("ThreeJSApp already initialized");
  }
};

console.log("play.js module loaded");
