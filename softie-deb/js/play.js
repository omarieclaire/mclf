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
  constructor(meditationParams, onMotionDetected, onNoMotionDetected, debugMode = false) {
    this.meditationParams = {
      motionThreshold: CameraProcessor.CONFIG.MOTION.THRESHOLD,
      regionSize: CameraProcessor.CONFIG.MOTION.REGION_SIZE,
      ...meditationParams,
    };
    this.onMotionDetected = onMotionDetected;
    this.onNoMotionDetected = onNoMotionDetected;
    this.debugMode = debugMode;
    this.motionDetectionId = null;
    this.isProcessing = true;
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

        if (this.frameCount % 30 === 0) {
          // console.log(`Motion: ${motionPercentage.toFixed(2)}%`);
        }
        this.frameCount++;

        if (motionPercentage > this.meditationParams.motionThreshold) {
          this.onMotionDetected();
        } else {
          this.onNoMotionDetected();
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

class MeditationEffects {
  constructor(app) {
    if (!app) {
      throw new Error("App reference is required for MeditationEffects");
    }
    // Store reference to main app for accessing ThreeJS objects
    this.app = app;

    // Initialize meditation state
    this.stillnessLevel = 0;
    this.lastMotionTime = Date.now();
    this.isInMeditativeState = false;
    this.meditationSparkles = false;
    this.originalCameraPosition = null;

    // Copy active effects from app if they exist, otherwise create new
    this.activeEffects = app.activeEffects || {
      gentle: false,
      moderate: false,
      deep: false,
      profound: false,
    };
  }

  logDebug(message) {
    if (this.app && this.app.logDebug) {
      this.app.logDebug(message);
    } else {
      console.log(message);
    }
  }

  getCurrentState(timeSinceMotion) {
    if (!this.isInMeditativeState) return "Normal";

    const thresholds = this.app.meditationParams.stillnessThresholds;
    if (timeSinceMotion > thresholds.profound) return "Profound";
    if (timeSinceMotion > thresholds.deep) return "Deep";
    if (timeSinceMotion > thresholds.moderate) return "Moderate";
    if (timeSinceMotion > thresholds.gentle) return "Gentle";
    return "Normal";
  }

  onMotionDetected() {
    this.stillnessLevel = Math.max(0, this.stillnessLevel - 0.2);
    this.lastMotionTime = Date.now();
    this.isInMeditativeState = false;

    // Add these reset actions
    this.activeEffects = {
      gentle: false,
      moderate: false,
      deep: false,
      profound: false,
    };

    // Reset sky colors
    if (this.app.skyUniforms) {
      this.app.skyUniforms["turbidity"].value = this.app.meditationParams.skyTurbidityStart;
      this.app.skyUniforms["rayleigh"].value = this.app.meditationParams.skyRayleighStart;
    }

    // Reset water
    if (this.app.water) {
      this.app.water.material.uniforms.waterColor.value.setHex(this.app.meditationParams.waterColorStart);
      this.app.water.material.uniforms["distortionScale"].value = this.app.meditationParams.waterDistortionStart;
    }

    // Reset sun
    this.app.parameters.inclination = 0.49;
    this.app.updateSun(this.app.parameters, new THREE.PMREMGenerator(this.app.renderer));
  }

  onNoMotionDetected() {
    const timeSinceLastMotion = Date.now() - this.lastMotionTime;
    if (timeSinceLastMotion > 1000) {
      this.stillnessLevel = Math.min(1, this.stillnessLevel + 0.1);
      this.isInMeditativeState = true;
    }
  }
  update() {
    const timeSinceMotion = Date.now() - this.lastMotionTime;
    const currentState = this.getCurrentState(timeSinceMotion);

    if (this.app.debugMode) {
      this.app.logDebug(`🧘 meditation - stillness: ${this.stillnessLevel.toFixed(2)}, ` + `time: ${(timeSinceMotion / 1000).toFixed(1)}s`);
    }

    // Remove this since updateActiveEffects already does these things
    // if (this.isInMeditativeState) {
    //   const progress = this.stillnessLevel;
    //   this.updateWaterEffects();
    //   this.updateSparkles(timeSinceMotion);
    //   this.updateSky(timeSinceMotion);
    //   this.updateCamera(timeSinceMotion);
    // } else {
    //   this.resetEffects();
    // }

    // Just do this instead:
    if (this.isInMeditativeState) {
      this.updateActiveEffects(timeSinceMotion);
    } else {
      this.resetEffects();
    }
  }

  updateActiveEffects(timeSinceMotion) {
    // Update water effects
    this.updateWaterEffects();

    // Update sparkles
    this.updateSparkles(timeSinceMotion);

    // Update sky
    this.updateSky(timeSinceMotion);

    // Update camera
    this.updateCamera(timeSinceMotion);
  }

  updateWaterEffects() {
    const waterColorProgress = this.stillnessLevel;
    const currentColor = new THREE.Color(this.app.meditationParams.waterColorStart).lerp(
      new THREE.Color(this.app.meditationParams.waterColorEnd),
      waterColorProgress
    );

    this.app.water.material.uniforms.waterColor.value.copy(currentColor);
    this.app.water.material.uniforms["distortionScale"].value =
      this.app.meditationParams.waterDistortionStart -
      waterColorProgress * (this.app.meditationParams.waterDistortionStart - this.app.meditationParams.waterDistortionEnd);
  }

  updateSparkles(timeSinceMotion) {
    if (timeSinceMotion > this.app.meditationParams.stillnessThresholds.gentle && !this.activeEffects.gentle) {
      this.app.makeSparkles(
        this.app.centerObj,
        this.app.meditationParams.sparkleSpread,
        this.app.meditationParams.sparkleLightness,
        this.app.meditationParams.sparkleSize,
        this.app.meditationParams.sparkleQuantity,
        this.app.meditationParams.sparkleNumSets
      );
      this.meditationSparkles = true;
      this.activeEffects.gentle = true;
      console.log("✨ Sparkles activated");
    }
  }

  updateSky(timeSinceMotion) {
    if (timeSinceMotion > this.app.meditationParams.stillnessThresholds.moderate && !this.activeEffects.moderate) {
      this.activeEffects.moderate = true;
    }

    if (this.activeEffects.moderate && this.app.skyUniforms) {
      const skyProgress = this.stillnessLevel;
      this.app.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
        this.app.meditationParams.skyTurbidityStart,
        this.app.meditationParams.skyTurbidityEnd,
        skyProgress
      );

      this.app.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
        this.app.meditationParams.skyRayleighStart,
        this.app.meditationParams.skyRayleighEnd,
        skyProgress
      );
    }
  }

  updateCamera(timeSinceMotion) {
    if (timeSinceMotion > this.app.meditationParams.stillnessThresholds.deep) {
      if (!this.activeEffects.deep) {
        this.originalCameraPosition = this.app.camera.position.clone();
        this.activeEffects.deep = true;
        console.log("📸 Starting camera movement");
      }

      const progress = Math.min(
        (timeSinceMotion - this.app.meditationParams.stillnessThresholds.deep) /
          (this.app.meditationParams.stillnessThresholds.profound - this.app.meditationParams.stillnessThresholds.deep),
        1
      );

      this.updateCameraPosition(progress);
      this.updateDayNightCycle(progress);
    }
  }

  updateCameraPosition(progress) {
    const targetY = this.originalCameraPosition.y + 20;
    const targetZ = this.originalCameraPosition.z + 10;

    this.app.camera.position.y = THREE.MathUtils.lerp(this.app.camera.position.y, targetY, this.app.meditationParams.cameraSpeed);

    this.app.camera.position.z = THREE.MathUtils.lerp(this.app.camera.position.z, targetZ, this.app.meditationParams.cameraSpeed);
  }

  updateDayNightCycle(progress) {
    const inclination = THREE.MathUtils.lerp(0.49, -0.5, progress);
    this.app.parameters.inclination = inclination;
    this.app.updateSun(this.app.parameters, new THREE.PMREMGenerator(this.app.renderer));
  }

  resetEffects() {
    this.resetSparkles();
    this.resetCamera();
    this.resetSky();
  }

  resetSparkles() {
    if (this.meditationSparkles) {
      Object.values(this.app.sparkleFriendMap).forEach((sparkleArray) => {
        if (Array.isArray(sparkleArray)) {
          sparkleArray.forEach((sparkle) => {
            if (sparkle?.parent) {
              sparkle.parent.remove(sparkle);
            }
          });
        }
      });
      this.app.sparkleFriendMap = {};
      this.meditationSparkles = false;
      console.log("✨ Sparkles deactivated");
    }
  }

  resetCamera() {
    if (this.originalCameraPosition) {
      this.app.camera.position.y = THREE.MathUtils.lerp(
        this.app.camera.position.y,
        this.originalCameraPosition.y,
        this.app.meditationParams.cameraSpeed
      );

      this.app.camera.position.z = THREE.MathUtils.lerp(
        this.app.camera.position.z,
        this.originalCameraPosition.z,
        this.app.meditationParams.cameraSpeed
      );

      if (
        Math.abs(this.app.camera.position.y - this.originalCameraPosition.y) < 0.01 &&
        Math.abs(this.app.camera.position.z - this.originalCameraPosition.z) < 0.01
      ) {
        this.originalCameraPosition = null;
      }
    }
  }

  resetSky() {
    if (this.app.skyUniforms) {
      this.app.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
        this.app.skyUniforms["turbidity"].value,
        this.app.meditationParams.skyTurbidityStart,
        0.1
      );

      this.app.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
        this.app.skyUniforms["rayleigh"].value,
        this.app.meditationParams.skyRayleighStart,
        0.1
      );
    }
  }
}

// Main application class to encapsulate all functionalities
export class ThreeJSApp {
  static CONFIG = {
    COUNTS: {
      FRIENDS: 40,
      MEDI_QUESTIONS: 3,
    },
    SKY: {
      BRIGHTNESS: 10,
      RAYLEIGH: 10,
      MIE_COEFFICIENT: 0.009,
      MIE_DIRECTIONAL_G: 0.8,
      DEFAULT_TURBIDITY: 10,
    },
    WATER: {
      DISTORTION_SCALE: 3.7,
      DEFAULT_COLOR: 0x001e0f,
      GEOMETRY_SIZE: 10000,
      TEXTURE_SIZE: 512,
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
          SCALE: 0.75,
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
          ROT1: { x: -30, y: 0, z: -17.32, color: 0x686868 },
          ROT2: { x: 30, y: 0, z: -17.32, color: 0x171717 },
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

  // activeEffects = {
  //   gentle: false,
  //   moderate: false,
  //   deep: false,
  //   profound: false,
  // };

  constructor() {
    this.container = document.getElementById("container");
    this.currentLanguage = localStorage.getItem("lang") || "es";
    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    this.theta = 0;
    this.numberOfFriends = ThreeJSApp.CONFIG.COUNTS.FRIENDS;
    this.numberOfMediQuestions = ThreeJSApp.CONFIG.COUNTS.MEDI_QUESTIONS;
    this.skyBright = ThreeJSApp.CONFIG.SKY.BRIGHTNESS;

    this.fadeAmount = 1 / this.numberOfFriends;
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
      "We love you as you are",
      "Stretch your muscles? Stretch your hands, your feet, your legs, your arms, your face, your neck, your back. Sink into your own softness.",
      "I made this game for you. Yes, you are winning",
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

    this.debugMode = true;
    this.meditationEffects = new MeditationEffects(this);

    this.initOpenCV();

    this.cameraProcessor = new CameraProcessor(
      {}, // We don't need to pass meditation params for motion detection anymore
      () => this.onMotionDetected(),
      () => this.onNoMotionDetected(),
      this.debugMode
    );

    // this.originalWaterColor = 0x001e0f;
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

      skyTransitionDuration: 3000,

      // Sparkle effects
      sparkleThreshold: 0.8, // stillness level needed for sparkles
      sparkleSpread: 800,
      sparkleLightness: 0.2,
      sparkleSize: 5,
      sparkleQuantity: 100,
      sparkleNumSets: 100,

      sunIntensity: 1,
      stillnessThreshold: 0.8,
      transitionSpeed: 0.1,
      effectIntensity: 1,

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
      // motionThreshold: 0.5, // percentage of pixels that need to change
      // regionSize: 32, // size of regions to check for motion
    };

    // this.init();
    // this.animate();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    window.addEventListener("load", this.onWindowLoad.bind(this));
  }

  logError(message, error) {
    console.error(message, error);
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

    // this.setupCamera();

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
      const timeSinceMotion = Date.now() - this.meditationEffects.lastMotionTime;
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
          Stillness Level: ${this.meditationEffects.stillnessLevel.toFixed(2)}<br>
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

  onMotionDetected() {
    if (this.meditationEffects) {
      this.meditationEffects.onMotionDetected();
    }
  }

  onNoMotionDetected() {
    if (this.meditationEffects) {
      this.meditationEffects.onNoMotionDetected();
    }
  }

  getCurrentMeditationState(timeSinceMotion) {
    if (!this.isInMeditativeState) return "Normal";

    if (timeSinceMotion > this.meditationParams.stillnessThresholds.profound) return "Profound";
    if (timeSinceMotion > this.meditationParams.stillnessThresholds.deep) return "Deep";
    if (timeSinceMotion > this.meditationParams.stillnessThresholds.moderate) return "Moderate";
    if (timeSinceMotion > this.meditationParams.stillnessThresholds.gentle) return "Gentle";

    return "Normal";
  }

  updateWaterEffects(waterColorProgress) {
    const currentColor = new THREE.Color(this.meditationParams.waterColorStart).lerp(
      new THREE.Color(this.meditationParams.waterColorEnd),
      waterColorProgress
    );

    this.water.material.uniforms.waterColor.value.copy(currentColor);
    this.water.material.uniforms["distortionScale"].value =
      this.meditationParams.waterDistortionStart -
      waterColorProgress * (this.meditationParams.waterDistortionStart - this.meditationParams.waterDistortionEnd);
  }

  handleSparkleEffects(timeSinceMotion) {
    if (timeSinceMotion > this.meditationParams.stillnessThresholds.gentle && !this.activeEffects.gentle) {
      this.makeSparkles(
        this.centerObj,
        this.meditationParams.sparkleSpread,
        this.meditationParams.sparkleLightness,
        this.meditationParams.sparkleSize,
        this.meditationParams.sparkleQuantity,
        this.meditationParams.sparkleNumSets
      );
      this.meditationSparkles = true;
      this.activeEffects.gentle = true;
      console.log("✨ Sparkles activated");
    }
  }

  updateSkyEffects(timeSinceMotion, skyProgress) {
    if (timeSinceMotion > this.meditationParams.stillnessThresholds.moderate && !this.activeEffects.moderate) {
      this.activeEffects.moderate = true;
    }

    if (this.activeEffects.moderate && this.skyUniforms) {
      this.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
        this.meditationParams.skyTurbidityStart,
        this.meditationParams.skyTurbidityEnd,
        skyProgress
      );

      this.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
        this.meditationParams.skyRayleighStart,
        this.meditationParams.skyRayleighEnd,
        skyProgress
      );
    }
  }

  updateCameraMovement(timeSinceMotion) {
    if (timeSinceMotion <= this.meditationParams.stillnessThresholds.deep) return;

    if (!this.activeEffects.deep) {
      this.originalCameraPosition = this.camera.position.clone();
      this.activeEffects.deep = true;
      console.log("📸 Starting camera movement");
    }

    const progress = Math.min(
      (timeSinceMotion - this.meditationParams.stillnessThresholds.deep) /
        (this.meditationParams.stillnessThresholds.profound - this.meditationParams.stillnessThresholds.deep),
      1
    );

    this.updateCameraPosition(progress);
    this.updateDayNightCycle(progress);
  }

  updateCameraPosition(progress) {
    const targetY = this.originalCameraPosition.y + 50;
    const targetZ = this.originalCameraPosition.z + 150;
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, this.meditationParams.cameraSpeed);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, this.meditationParams.cameraSpeed);
  }

  updateDayNightCycle(progress) {
    const inclination = THREE.MathUtils.lerp(0.49, -0.5, progress);
    this.parameters.inclination = inclination;
    this.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
  }

  resetMeditationEffects() {
    this.resetSparkles();
    this.resetCamera();
    this.resetSky();
  }

  resetSparkles() {
    if (!this.meditationSparkles) return;

    Object.values(this.sparkleFriendMap).forEach((sparkleArray) => {
      if (Array.isArray(sparkleArray)) {
        sparkleArray.forEach((sparkle) => {
          if (sparkle?.parent) sparkle.parent.remove(sparkle);
        });
      }
    });
    this.sparkleFriendMap = {};
    this.meditationSparkles = false;
    console.log("✨ Sparkles deactivated");
  }

  resetCamera() {
    if (!this.originalCameraPosition) return;

    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.originalCameraPosition.y, this.meditationParams.cameraSpeed);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.originalCameraPosition.z, this.meditationParams.cameraSpeed);

    if (
      Math.abs(this.camera.position.y - this.originalCameraPosition.y) < 0.01 &&
      Math.abs(this.camera.position.z - this.originalCameraPosition.z) < 0.01
    ) {
      this.originalCameraPosition = null;
    }
  }

  resetSky() {
    if (!this.skyUniforms) return;

    this.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(this.skyUniforms["turbidity"].value, this.meditationParams.skyTurbidityStart, 0.1);
    this.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(this.skyUniforms["rayleigh"].value, this.meditationParams.skyRayleighStart, 0.1);
  }

  // updateMeditativeEffects() {
  //   const timeSinceMotion = Date.now() - this.lastMotionTime;
  //   const currentState = this.getCurrentMeditationState(timeSinceMotion);

  //   this.logDebug(`🧘 ${currentState} meditation - stillness: ${this.stillnessLevel.toFixed(2)}, time: ${(timeSinceMotion / 1000).toFixed(1)}s`);

  //   if (this.isInMeditativeState) {
  //     const progress = this.stillnessLevel;
  //     this.updateWaterEffects(progress);
  //     this.handleSparkleEffects(timeSinceMotion);
  //     this.updateSkyEffects(timeSinceMotion, progress);
  //     this.updateCameraMovement(timeSinceMotion);
  //   } else {
  //     this.resetMeditationEffects();
  //   }
  // }

  initWater() {
    const waterGeometry = new THREE.PlaneGeometry(ThreeJSApp.CONFIG.WATER.GEOMETRY_SIZE, ThreeJSApp.CONFIG.WATER.GEOMETRY_SIZE);
    this.water = new Water(waterGeometry, {
      textureWidth: ThreeJSApp.CONFIG.WATER.TEXTURE_SIZE,
      textureHeight: ThreeJSApp.CONFIG.WATER.TEXTURE_SIZE,
      waterNormals: new THREE.TextureLoader().load("./img/waternormals.jpeg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: ThreeJSApp.CONFIG.WATER.DEFAULT_COLOR,
      distortionScale: ThreeJSApp.CONFIG.WATER.DISTORTION_SCALE,
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
    this.skyUniforms["turbidity"].value = ThreeJSApp.CONFIG.SKY.DEFAULT_TURBIDITY;
    this.skyUniforms["rayleigh"].value = ThreeJSApp.CONFIG.SKY.RAYLEIGH;
    this.skyUniforms["mieCoefficient"].value = ThreeJSApp.CONFIG.SKY.MIE_COEFFICIENT;
    this.skyUniforms["mieDirectionalG"].value = ThreeJSApp.CONFIG.SKY.MIE_DIRECTIONAL_G;

    this.parameters = {
      inclination: -0.5,
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
    const ambient = new THREE.AmbientLight(ThreeJSApp.CONFIG.LIGHTS.AMBIENT.COLOR);
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
    objectsFolder.add(this.centerObj.scale, "x", 0.1, 5).name("Center Object Scale");
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

    // Meditation Folder and Sub-folders
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

    // Sky effects
    const skyFolder = meditationFolder.addFolder("Sky Effects");
    skyFolder.add(this.skyUniforms["rayleigh"], "value", 0, 10).name("Current Rayleigh");
    skyFolder.add(this.skyUniforms["turbidity"], "value", 0, 20).name("Current Turbidity");
    skyFolder.add(this.skyUniforms["mieCoefficient"], "value", 0, 1).name("Mie Coefficient");
    skyFolder.add(this.skyUniforms["mieDirectionalG"], "value", 0, 1).name("Mie Directional");
    skyFolder
      .add(this.parameters, "inclination", -0.5, 0.5) // Instead of 0 to 1

      .onChange(() => {
        this.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
      })
      .name("Inclination (Day/Night)");
    skyFolder
      .add(this.parameters, "azimuth", 0, 1)
      .onChange(() => {
        this.updateSun(this.parameters, new THREE.PMREMGenerator(this.renderer));
      })
      .name("Azimuth (Sun Position)");

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
    waterFolder.add(this.water.material.uniforms.distortionScale, "value", 0, 10).name("Live Distortion");
    waterFolder.add(this.water.material.uniforms.alpha, "value", 0, 1).name("Water Alpha");
    waterFolder
      .addColor(
        {
          color: this.water.material.uniforms.waterColor.value.getHex(),
        },
        "color"
      )
      .onChange((value) => {
        this.water.material.uniforms.waterColor.value.setHex(value);
      })
      .name("Live Water Color");
    waterFolder
      .addColor(
        {
          color: this.water.material.uniforms.sunColor.value.getHex(),
        },
        "color"
      )
      .onChange((value) => {
        this.water.material.uniforms.sunColor.value.setHex(value);
      })
      .name("Water Sun Color");

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

    // Meditation State Parameters
    const stateFolder = meditationFolder.addFolder("State Parameters");
    stateFolder.add(this.meditationParams, "stillnessThreshold", 0, 1).name("Stillness Threshold");
    stateFolder.add(this.meditationParams, "transitionSpeed", 0.01, 1).name("Effect Speed");
    stateFolder.add(this.meditationParams, "effectIntensity", 0, 2).name("Effect Intensity");

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

    setInterval(() => {
      debugInfo.currentStillness = this.meditationEffects.stillnessLevel;
      debugInfo.timeSinceMotion = ((Date.now() - this.meditationEffects.lastMotionTime) / 1000).toFixed(1);
    }, 100);

    // Testing Controls
    const testingFolder = meditationFolder.addFolder("Testing Controls");
    const testingParams = { timingMode: "Normal" };
    testingFolder
      .add(testingParams, "timingMode", ["Normal", "Quick Test", "Very Quick Test"])
      .name("Timing Mode")
      .onChange((value) => {
        switch (value) {
          case "Normal":
            this.meditationParams.stillnessThresholds = {
              gentle: 30000,
              moderate: 60000,
              deep: 90000,
              profound: 120000,
            };
            break;
          case "Quick Test":
            this.meditationParams.stillnessThresholds = {
              gentle: 10000,
              moderate: 20000,
              deep: 30000,
              profound: 40000,
            };
            break;
          case "Very Quick Test":
            this.meditationParams.stillnessThresholds = {
              gentle: 3000,
              moderate: 6000,
              deep: 9000,
              profound: 12000,
            };
            break;
        }
      });

    // Open folders
    audioFolder.open();
    objectsFolder.open();
    meditationFolder.open();
    timingFolder.open();
    stillnessFolder.open();
    debugFolder.open();
    skyFolder.open();
    waterFolder.open();
    testingFolder.open();
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

    // this.updateMeditativeEffects();
    this.meditationEffects.update();

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

  makeSparkles(source, spread, lightness, size, quantity, numOfSets) {
    if (!this.sparkleFriendMap[source.friendID]) {
      this.sparkleFriendMap[source.friendID] = [];
    }

    // Clear existing sparkles
    this.sparkleFriendMap[source.friendID].forEach((sparkle) => {
      if (sparkle && sparkle.parent) {
        sparkle.parent.remove(sparkle);
        sparkle.geometry.dispose();
        sparkle.material.dispose();
      }
    });
    this.sparkleFriendMap[source.friendID] = [];

    for (let x = 0; x < numOfSets; x++) {
      // Create single geometry for all particles in this set
      const sparkGeometry = new THREE.BufferGeometry();
      const sparkPositions = [];
      const sparkColors = [];
      const sparkSizes = [];
      const sparkColor = new THREE.Color();

      // Create many more particles for each set
      for (let i = 0; i < quantity * numOfSets; i++) {
        // Multiply by numOfSets to get more particles
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

      const sparkUniforms = {
        pointTexture: { value: new THREE.TextureLoader().load("./img/spark1.png") },
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

      const sparkleSystem = new THREE.Points(sparkGeometry, shaderMaterial);
      this.sparkleFriendMap[source.friendID].push(sparkleSystem);
      source.add(sparkleSystem);
    }
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
  } else {
    console.warn("ThreeJSApp already initialized");
  }
};

console.log("play.js module loaded");
