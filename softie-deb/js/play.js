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
    console.log("Setting up camera...");
    this.video = document.getElementById("videoInput");
    if (!this.video) {
      throw new Error("Video element 'videoInput' not found");
    }

    // Make video visible during testing
    if (this.debugMode) {
      this.video.style.display = "block";
      this.video.style.position = "fixed";
      this.video.style.top = "10px";
      this.video.style.left = "10px";
      this.video.style.width = "320px";
      this.video.style.height = "240px";
      this.video.style.zIndex = "1000";
    }

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
        Y: { MIN: -5, MAX: 145 }, // -5 to (150-5=145)
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
      "What did the air forget to tell you today?",
      "Where does the shadow go when you close your eyes?",
      "What memory hides in the cracks of your voice?",
    ];

    this.audioManager = new AudioManager();

    this.audioManager.seaSounds[0].loop = true; // Make sea sound loop
    this.audioManager.seaSounds[0]
      .play()
      .then(() => console.log("Sea sound started"))
      .catch((err) => console.error("Sea sound failed to start:", err));
    this.debugMode = true;

    this.centerObj = null; // Explicitly initialize
    this.meditationManager = new UnifiedMeditationManager(this);
    this.cameraProcessor = new CameraProcessor(this.meditationManager, this.debugMode);

    this.initOpenCV();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    window.addEventListener("load", this.onWindowLoad.bind(this));
  }

  onWindowLoad() {
    document.body.classList.remove("preload");
    this.loadModels();
  }

  mkGoodPosition() {
    return {
      x:
        Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN) +
        ThreeJSApp.CONFIG.POSITIONING.RANDOM.X.MIN,
      y:
        Math.random() * (ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MAX - ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN) +
        ThreeJSApp.CONFIG.POSITIONING.RANDOM.Y.MIN,
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
    this.water = new Water(waterGeometry, {
      textureWidth: ThreeJSApp.CONFIG.WATER.STARTING_TEXTURE_SIZE,
      textureHeight: ThreeJSApp.CONFIG.WATER.STARTING_TEXTURE_SIZE,
      waterNormals: new THREE.TextureLoader().load("./img/waternormals.jpeg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 0,
      sunDirection: new THREE.Vector3(),
      sunColor: ThreeJSApp.CONFIG.WATER.STARTING_SUN_COLOR,
      waterColor: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR,
      distortionScale: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE,
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

    this.scene.fog = new THREE.FogExp2(ThreeJSApp.CONFIG.LIGHTS.FOG.COLOR, ThreeJSApp.CONFIG.LIGHTS.FOG.DENSITY);
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
    obj.scale.multiplyScalar(scale);
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
    this.scene.traverse((child) => {
      if (child.isMesh) {
        const shader = child.material.userData.shader;
        if (shader) {
          shader.uniforms.time.value = performance.now() / 1000;
        }
      }
    });

    // Object.values(this.sparkleFriendMap).forEach((sparkleArray) => {
    //   sparkleArray.forEach((sparkleSystem) => {
    //     const colorAttribute = sparkleSystem.geometry.attributes.color;
    //     const time = performance.now() * 0.005;
    //     for (let i = 0; i < colorAttribute.count; i++) {
    //       const hue = (time + i * 0.1) % 1; // Gradual color change
    //       const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
    //       colorAttribute.array[i * 3] = color.r;
    //       colorAttribute.array[i * 3 + 1] = color.g;
    //       colorAttribute.array[i * 3 + 2] = color.b;
    //     }
    //     colorAttribute.needsUpdate = true;
    //   });
    // });

    // this.meditationEffects.update();

    this.meditationManager.sparkleManager.updateSparkles();

    this.meditationManager.update();

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
}

const MEDITATION_CONFIG = {
  STATES: {
    FRANTIC: {
      type: "movement",
      duration: 9000,
      level: 3,
      effects: {
        water: { color: "#00aacc", distortion: 4.5 },
        sky: { turbidity: 8, rayleigh: 4, inclination: 0.49 },
        sparkles: false,
        cameraMovement: false,
      },
    },
    BUSY: {
      type: "movement",
      duration: 6000,
      level: 2,
      effects: {
        water: { color: "#0088aa", distortion: 3.5 },
        sky: { turbidity: 7, rayleigh: 3.5, inclination: 0.49 },
        sparkles: false,
        cameraMovement: false,
      },
    },
    ACTIVE: {
      type: "movement",
      duration: 3000,
      level: 1,
      effects: {
        water: { color: "#004488", distortion: 2.5 },
        sky: { turbidity: 6, rayleigh: 3, inclination: 0.49 },
        sparkles: false,
        cameraMovement: false,
      },
    },
    NORMAL: {
      type: "neutral",
      duration: 0,
      level: 0,
      effects: {
        water: {
          color: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR,
          distortion: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE,
        },
        sky: {
          turbidity: ThreeJSApp.CONFIG.SKY.STARTING_TURBIDITY,
          rayleigh: ThreeJSApp.CONFIG.SKY.STARTING_RAYLEIGH,
          inclination: ThreeJSApp.CONFIG.SKY.STARTING_INCLINATION,
        },
        sparkles: false,
        cameraMovement: false,
      },
    },
    GENTLE: {
      type: "stillness",
      duration: 3000,
      level: 1,
      effects: {
        water: {
          color: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR,
          distortion: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE,
        },
        sky: {
          turbidity: ThreeJSApp.CONFIG.SKY.STARTING_TURBIDITY - 0.01,
          rayleigh: ThreeJSApp.CONFIG.SKY.STARTING_RAYLEIGH - 0.01,
          inclination: ThreeJSApp.CONFIG.SKY.STARTING_INCLINATION - 0.01,
        },
        sparkles: true,
        cameraMovement: false,
      },
    },
    MODERATE: {
      type: "stillness",
      duration: 6000,
      level: 2,
      effects: {
        water: {
          color: ThreeJSApp.CONFIG.WATER.STARTING_DEFAULT_COLOR - 0.03,
          distortion: ThreeJSApp.CONFIG.WATER.STARTING_DISTORTION_SCALE - 0.03,
        },
        sky: {
          turbidity: ThreeJSApp.CONFIG.SKY.STARTING_TURBIDITY - 0.03,
          rayleigh: ThreeJSApp.CONFIG.SKY.STARTING_RAYLEIGH - 0.03,
          inclination: ThreeJSApp.CONFIG.SKY.STARTING_INCLINATION - 0.03,
        },
        sparkles: true,
        cameraMovement: false,
      },
    },
    DEEP: {
      type: "stillness",
      duration: 9000,
      level: 3,
      effects: {
        water: { color: "#001133", distortion: 0.5 },
        sky: { turbidity: 5.2, rayleigh: 2.2, inclination: 0.2 },
        sparkles: true,
        cameraMovement: true,
      },
    },
    PROFOUND: {
      type: "stillness",
      duration: 12000,
      level: 4,
      effects: {
        water: { color: "#000022", distortion: 0.3 },
        sky: { turbidity: 1.5, rayleigh: 0.5, inclination: -0.2 },
        sparkles: true,
        cameraMovement: true,
      },
    },
  },
  SPARKLES: {
    SPREAD: 800,
    LIGHTNESS: 0.2,
    SIZE: 5,
    QUANTITY: 100,
    NUM_SETS: 100,
  },

  TRANSITION_SPEEDS: {
    water: 0.1,
    sky: 0.02,
    camera: 0.05,
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

    console.log("[SparkleManager] Created, waiting for scene initialization");
  }

  initialize(scene) {
    if (this.initialized) return;

    this.scene = scene;
    this.centerContainer = this.createCenterContainer();
    this.initialized = true;
    console.log("[SparkleManager] Initialized with scene");
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

class UnifiedMeditationManager {
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

    this.sparkleManager = new SparkleManager(this.scene);

    // Store initial camera position
    this.originalCameraPosition = null;

    // Initialize effects state
    this.currentEffects = {
      water: { color: new THREE.Color(MEDITATION_CONFIG.STATES.NORMAL.effects.water.color) },
      sky: { ...MEDITATION_CONFIG.STATES.NORMAL.effects.sky },
      sparkles: false,
      cameraMovement: false,
    };
  }

  onMotionDetected() {
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
                Time Since Motion: ${debugInfo.timeSinceMotion}s<br>
                ${debugInfo.isMoving ? `Movement Duration: ${debugInfo.movementDuration}s<br>` : ""}
                <br>
                Visual Effects:<br>
                ▸ Ocean Color: ${debugInfo.effects.waterColor}<br>
                ▸ Wave Strength: ${debugInfo.effects.waveStrength}<br>
                ▸ Sparkles: ${debugInfo.effects.sparkles ? "Active" : "Inactive"}<br>
                ▸ Sky Changes: ${debugInfo.effects.skyChanges ? "Active" : "Inactive"}<br>
                ▸ Camera Movement: ${debugInfo.effects.cameraMovement ? "Active" : "Inactive"}<br>
            `;
      }
    }
  }
  updateState() {
    const now = Date.now();
    let newState = "NORMAL";

    if (this.isMoving && this.movementStartTime) {
      const movementDuration = now - this.movementStartTime;

      if (movementDuration > MEDITATION_CONFIG.STATES.FRANTIC.duration) {
        newState = "FRANTIC";
      } else if (movementDuration > MEDITATION_CONFIG.STATES.BUSY.duration) {
        newState = "BUSY";
      } else if (movementDuration > MEDITATION_CONFIG.STATES.ACTIVE.duration) {
        newState = "ACTIVE";
      }
    } else if (this.stillnessStartTime) {
      const stillnessDuration = now - this.stillnessStartTime;

      if (stillnessDuration > MEDITATION_CONFIG.STATES.PROFOUND.duration) {
        newState = "PROFOUND";
      } else if (stillnessDuration > MEDITATION_CONFIG.STATES.DEEP.duration) {
        newState = "DEEP";
      } else if (stillnessDuration > MEDITATION_CONFIG.STATES.MODERATE.duration) {
        newState = "MODERATE";
      } else if (stillnessDuration > MEDITATION_CONFIG.STATES.GENTLE.duration) {
        newState = "GENTLE";
      }
    }

    if (newState !== this.currentState) {
      this.currentState = newState;
      this.lastStateChange = now;
      this.applyStateEffects();
    }
  }

  applyStateEffects() {
    const targetEffects = MEDITATION_CONFIG.STATES[this.currentState].effects;

    // Update water
    this.updateWater(targetEffects.water);

    // Update sky
    this.updateSky(targetEffects.sky);

    //   // Update sparkles using SparkleManager
    this.updateSparkles(targetEffects.sparkles);

    // Update camera
    this.updateCamera(targetEffects.cameraMovement);
  }

  updateWater(targetWater) {
    if (!this.app.water) return;

    const targetColor = new THREE.Color(targetWater.color);
    this.app.water.material.uniforms.waterColor.value.lerp(targetColor, MEDITATION_CONFIG.TRANSITION_SPEEDS.water);

    this.app.water.material.uniforms["distortionScale"].value = THREE.MathUtils.lerp(
      this.app.water.material.uniforms["distortionScale"].value,
      targetWater.distortion,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.water
    );
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
  updateSky(targetSky) {
    if (!this.app.skyUniforms) return;

    // Smoothly interpolate sky parameters
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

    this.app.parameters.inclination = THREE.MathUtils.lerp(
      this.app.parameters.inclination,
      targetSky.inclination,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.sky
    );

    this.app.updateSun(this.app.parameters, new THREE.PMREMGenerator(this.app.renderer));
  }

  updateCamera(shouldMove) {
    if (!shouldMove) {
      this.resetCamera();
      return;
    }

    if (!this.originalCameraPosition) {
      this.originalCameraPosition = this.app.camera.position.clone();
    }

    const targetY = this.originalCameraPosition.y + 20;
    const targetZ = this.originalCameraPosition.z + 10;

    this.app.camera.position.y = THREE.MathUtils.lerp(this.app.camera.position.y, targetY, MEDITATION_CONFIG.TRANSITION_SPEEDS.camera);

    this.app.camera.position.z = THREE.MathUtils.lerp(this.app.camera.position.z, targetZ, MEDITATION_CONFIG.TRANSITION_SPEEDS.camera);
  }

  resetCamera() {
    if (!this.originalCameraPosition) return;

    const hasReachedOriginal =
      Math.abs(this.app.camera.position.y - this.originalCameraPosition.y) < 0.01 &&
      Math.abs(this.app.camera.position.z - this.originalCameraPosition.z) < 0.01;

    if (hasReachedOriginal) {
      this.originalCameraPosition = null;
      return;
    }

    this.app.camera.position.y = THREE.MathUtils.lerp(
      this.app.camera.position.y,
      this.originalCameraPosition.y,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.camera
    );

    this.app.camera.position.z = THREE.MathUtils.lerp(
      this.app.camera.position.z,
      this.originalCameraPosition.z,
      MEDITATION_CONFIG.TRANSITION_SPEEDS.camera
    );
  }

  getDebugInfo() {
    const now = Date.now();
    const stateConfig = MEDITATION_CONFIG.STATES[this.currentState];

    return {
      meditationState: this.currentState,
      timeSinceMotion: ((now - (this.lastStateChange || now)) / 1000).toFixed(1),
      isMoving: this.isMoving,
      movementDuration: this.movementStartTime ? ((now - this.movementStartTime) / 1000).toFixed(1) : "0.0",
      effects: {
        waterColor: stateConfig.effects.water.color,
        waveStrength: `${stateConfig.effects.water.distortion}`,
        sparkles: stateConfig.effects.sparkles,
        skyChanges: true,
        cameraMovement: stateConfig.effects.cameraMovement,
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
  }

  initGUI() {
    const gui = new GUI({ autoPlace: true, load: false });

    // Audio Folder
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

    audioFolder
      .add({ volume: 0.09 }, "volume", 0, 1)
      .name("Sea Volume")
      .onChange((value) => {
        this.audioManager.seaSounds[0].volume = value;
      });

    // Objects parameters
    const objectsFolder = gui.addFolder("Objects");

    objectsFolder
      .add({ scale: ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE }, "scale", 0.1, 5)
      .name("Center Object Scale")
      .onChange((value) => {
        this.centerObj.scale.set(value, value, value);
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBE", 0.1, 5)
      .name("Torus Knot Tube")
      .onChange((value) => {
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE = value;
        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          value,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
        );
        this.centerObj.geometry.dispose();
        this.centerObj.geometry = newGeometry;
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBULAR_SEGMENTS", 3, 500, 1)
      .name("Tubular Segments")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS = value;

        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
          value,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
        );

        this.centerObj.geometry.dispose();
        this.centerObj.geometry = newGeometry;
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "RADIAL_SEGMENTS", 3, 50, 1)
      .name("Radial Segments")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS = value;

        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
          value,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
        );

        this.centerObj.geometry.dispose();
        this.centerObj.geometry = newGeometry;
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "P", 1, 10, 1)
      .name("P (Twist)")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P = value;

        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
          value,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
        );

        this.centerObj.geometry.dispose();
        this.centerObj.geometry = newGeometry;
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "Q", 1, 10, 1)
      .name("Q (Twist)")
      .onChange((value) => {
        value = Math.floor(value);
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q = value;

        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
          value
        );

        this.centerObj.geometry.dispose();
        this.centerObj.geometry = newGeometry;
      });

    // Meditation Folder and Sub-folders
    const meditationFolder = gui.addFolder("Meditation Effects");

    // Sky effects
    const skyFolder = meditationFolder.addFolder("Sky Effects");
    skyFolder.add(this.skyUniforms["rayleigh"], "value", 0, 10).name("Rayleigh");
    skyFolder.add(this.skyUniforms["turbidity"], "value", 0, 20).name("Turbidity");
    skyFolder
      .add(this.parameters, "inclination", -0.5, 0.5)
      .onChange(() => {
        this.app.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
      })
      .name("Inclination (Day/Night)");

    // Water effects
    const waterFolder = meditationFolder.addFolder("Water Effects");
    waterFolder.add(this.water.material.uniforms.distortionScale, "value", 0, 10).name("Wave Distortion");

    // Environment/Fog
    const envFolder = meditationFolder.addFolder("Environment");
    envFolder.add(this.scene.fog, "density", 0, 0.01).name("Fog Density");
    envFolder
      .addColor(
        {
          color: this.scene.fog.color.getHex(),
        },
        "color"
      )
      .onChange((value) => {
        this.scene.fog.color.setHex(value);
        this.renderer.setClearColor(this.scene.fog.color);
      })
      .name("Fog Color");

    // Lighting
    const lightFolder = meditationFolder.addFolder("Lighting");
    const directionalLight1 = this.scene.children.find((child) => child.type === "DirectionalLight");
    if (directionalLight1) {
      lightFolder.add(directionalLight1, "intensity", 0, 2).name("Sun Light Intensity");
      lightFolder
        .addColor(
          {
            color: directionalLight1.color.getHex(),
          },
          "color"
        )
        .onChange((value) => {
          directionalLight1.color.setHex(value);
        })
        .name("Sun Light Color");
    }

    // Camera movement
    const cameraFolder = meditationFolder.addFolder("Camera Movement");
    // (No direct cameraParams here without changing code, so it's left empty or commented)

    // Testing Controls
    const testingFolder = meditationFolder.addFolder("Testing Controls");
    const testingParams = { timingMode: "Normal" };
    testingFolder
      .add(testingParams, "timingMode", ["Normal", "Quick Test", "Very Quick Test"])
      .name("Timing Mode")
      .onChange((value) => {
        // Assuming meditationParams exist in this.app, if not this part should be adjusted
        // This code references meditationParams which we don't see in the snippet.
        // The user requested no logic changes, so we assume meditationParams is accessible.
        switch (value) {
          case "Normal":
            this.app.meditationParams.stillnessThresholds = {
              gentle: 30000,
              moderate: 60000,
              deep: 90000,
              profound: 120000,
            };
            break;
          case "Quick Test":
            this.app.meditationParams.stillnessThresholds = {
              gentle: 10000,
              moderate: 20000,
              deep: 30000,
              profound: 40000,
            };
            break;
          case "Very Quick Test":
            this.app.meditationParams.stillnessThresholds = {
              gentle: 3000,
              moderate: 6000,
              deep: 9000,
              profound: 12000,
            };
            break;
        }
      });

    testingFolder.open();
    audioFolder.open();
    objectsFolder.open();
    meditationFolder.open();
    skyFolder.open();
    waterFolder.open();
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
