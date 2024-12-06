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

class MeditationParameters {
  constructor(config) {
    // Water effects
    this.waterColorStart = config.MEDITATION.WATER.START_COLOR;
    this.waterColorEnd = config.MEDITATION.WATER.END_COLOR;
    this.waterDistortionStart = config.MEDITATION.WATER.START_DISTORTION;
    this.waterDistortionEnd = config.MEDITATION.WATER.END_DISTORTION;

    // Sky effects
    this.skyTurbidityStart = config.MEDITATION.SKY.START_TURBIDITY;
    this.skyTurbidityEnd = config.MEDITATION.SKY.END_TURBIDITY;
    this.skyRayleighStart = config.MEDITATION.SKY.START_RAYLEIGH;
    this.skyRayleighEnd = config.MEDITATION.SKY.END_RAYLEIGH;
    this.skyTransitionDuration = config.MEDITATION.SKY.TRANSITION_DURATION;
    this.skyLerpFactor = config.MEDITATION.SKY.LERP_FACTOR;

    this.skyStates = config.SKY.STATES;

    // Sparkle effects
    this.sparkleSpread = config.MEDITATION.SPARKLES.SPREAD;
    this.sparkleLightness = config.MEDITATION.SPARKLES.LIGHTNESS;
    this.sparkleSize = config.MEDITATION.SPARKLES.SIZE;
    this.sparkleQuantity = config.MEDITATION.SPARKLES.QUANTITY;
    this.sparkleNumSets = config.MEDITATION.SPARKLES.NUM_SETS;

    // Camera movement
    this.cameraSpeed = config.MEDITATION.CAMERA.MOVEMENT_SPEED;
    this.targetCameraPosition = config.MEDITATION.CAMERA.TARGET_POSITION;

    // State timing thresholds - aligned with MeditationStateManager
    this.stillnessThresholds = {
      gentle: 3000, // 3 seconds for testing, adjust as needed
      moderate: 6000, // 6 seconds
      deep: 9000, // 9 seconds
      profound: 12000, // 12 seconds
    };
  }
}

class MeditationStateManager {
  // Single unified state progression
  static STATES = {
    FRANTIC:  { type: "movement", duration: 9000, level: 3 },  // 9s of continuous movement
    BUSY:     { type: "movement", duration: 6000, level: 2 },  // 6s of continuous movement
    ACTIVE:   { type: "movement", duration: 3000, level: 1 },  // 3s of continuous movement
    NORMAL:   { type: "neutral",  duration: 0,    level: 0 },  // Default state
    GENTLE:   { type: "stillness", duration: 3000, level: 1 }, // 3s of stillness
    MODERATE: { type: "stillness", duration: 6000, level: 2 }, // 6s of stillness
    DEEP:     { type: "stillness", duration: 9000, level: 3 }, // 9s of stillness
    PROFOUND: { type: "stillness", duration: 12000,level: 4 }  // 12s of stillness
  };

  // Sky configurations for each state
  static SKY_STATES = {
    FRANTIC: { turbidity: 8, rayleigh: 4, inclination: 0.49 },
    BUSY:    { turbidity: 7, rayleigh: 3.5, inclination: 0.49 },
    ACTIVE:  { turbidity: 6, rayleigh: 3, inclination: 0.49 },
    NORMAL:  { turbidity: 6, rayleigh: 3, inclination: 0.49 },
    GENTLE:  { turbidity: 5.8, rayleigh: 2.9, inclination: 0.45 },
    MODERATE:{ turbidity: 5.6, rayleigh: 2.6, inclination: 0.45 },  // Beautiful clear sky
    DEEP:    { turbidity: 5.2, rayleigh: 2.2, inclination: 0.2 },
    PROFOUND:{ turbidity: 1.5, rayleigh: 0.5, inclination: -0.2 } // Dark sky
  };

  constructor() {
    this.currentState = "NORMAL";
    this.lastMotionTime = Date.now();
    this.lastStillTime = Date.now();
    this.isMoving = false;
    this.movementStartTime = null;
    this.stillnessStartTime = null;
    this.requiredStillnessForNormal = 2000; // 2 seconds to consider truly still


    // Effects state
    this.effects = {
      waterColor: "#001e0f",
      waveStrength: "normal",
      sparkles: false,
      skyChanges: false,
      cameraMovement: false
    };
  }

  onMotionDetected() {
    const now = Date.now();
    this.lastMotionTime = now;

    // If we weren't moving before, start movement tracking
    if (!this.isMoving) {
      this.isMoving = true;
      this.movementStartTime = now;
      this.stillnessStartTime = null;
    }

    this.updateState();
  }

  onNoMotionDetected() {
    const now = Date.now();
    this.lastStillTime = now;

    // If this is the start of stillness, record the time
    if (this.isMoving && !this.stillnessStartTime) {
      this.stillnessStartTime = now;
    }

    // Check if we've been still long enough to transition out of movement
    if (this.stillnessStartTime && (now - this.stillnessStartTime >= this.requiredStillnessForNormal)) {
      this.isMoving = false;
      this.movementStartTime = null;
    }

    this.updateState();
  }

  updateState() {
    const now = Date.now();

    if (this.isMoving && this.movementStartTime) {
        // Calculate continuous movement duration
        const movementDuration = now - this.movementStartTime;

        // Start at ACTIVE and progress through movement states
        if (movementDuration > MeditationStateManager.STATES.ACTIVE.duration + 
                              MeditationStateManager.STATES.BUSY.duration + 
                              MeditationStateManager.STATES.FRANTIC.duration) {
            this.setNewState("FRANTIC");
        } else if (movementDuration > MeditationStateManager.STATES.ACTIVE.duration + 
                                    MeditationStateManager.STATES.BUSY.duration) {
            this.setNewState("BUSY");
        } else if (movementDuration > MeditationStateManager.STATES.ACTIVE.duration) {
            this.setNewState("ACTIVE");
        } else {
            this.setNewState("ACTIVE");
        }
    } else {
        // If we're not moving, calculate stillness duration
        const stillnessDuration = this.stillnessStartTime ? (now - this.stillnessStartTime) : 0;

        // First ensure we're in NORMAL if we just stopped moving
        if (stillnessDuration >= this.requiredStillnessForNormal) {
            // Then progress through stillness states
            if (stillnessDuration > MeditationStateManager.STATES.PROFOUND.duration) {
                this.setNewState("PROFOUND");
            } else if (stillnessDuration > MeditationStateManager.STATES.DEEP.duration) {
                this.setNewState("DEEP");
            } else if (stillnessDuration > MeditationStateManager.STATES.MODERATE.duration) {
                this.setNewState("MODERATE");
            } else if (stillnessDuration > MeditationStateManager.STATES.GENTLE.duration) {
                this.setNewState("GENTLE");
            } else {
                this.setNewState("NORMAL");
            }
        }
    }
}
  setNewState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.updateEffects();
    }
  }

  getDebugInfo() {
    const now = Date.now();
    let movementDuration = 0;
    let stillnessDuration = 0;

    if (this.isMoving && this.movementStartTime) {
        movementDuration = (now - this.movementStartTime) / 1000;
    }

    if (this.stillnessStartTime) {
        stillnessDuration = (now - this.stillnessStartTime) / 1000;
    }

    return {
        meditationState: this.currentState,
        timeSinceMotion: stillnessDuration.toFixed(1),
        isMoving: this.isMoving,
        movementDuration: movementDuration.toFixed(1),
        effects: this.effects
    };
}

  updateEffects() {
    const state = MeditationStateManager.STATES[this.currentState];
    const skyState = MeditationStateManager.SKY_STATES[this.currentState];

    // Update effects based on state type and level
    if (state.type === "movement") {
      this.effects = {
        waterColor: this.getWaterColorForMovement(state.level),
        waveStrength: this.getWaveStrengthForMovement(state.level),
        sparkles: false,
        skyChanges: true,
        cameraMovement: false,
        sky: skyState
      };
    } else if (state.type === "stillness") {
      this.effects = {
        waterColor: this.getWaterColorForStillness(state.level),
        waveStrength: "low",
        sparkles: state.level >= 1,
        skyChanges: true,
        cameraMovement: state.level >= 3,
        sky: skyState
      };
    }
  }

  getWaterColorForMovement(level) {
    const colors = {
      1: "#004488", // Active
      2: "#0088aa", // Busy
      3: "#00aacc", // Frantic
    };
    return colors[level] || "#001e0f";
  }

  getWaterColorForStillness(level) {
    const colors = {
      1: "#003366", // Gentle
      2: "#002244", // Moderate
      3: "#001133", // Deep
      4: "#000022", // Profound
    };
    return colors[level] || "#001e0f";
  }

  getWaveStrengthForMovement(level) {
    const strengths = {
      1: "moderate",
      2: "high",
      3: "very high",
    };
    return strengths[level] || "normal";
  }

  // getDebugInfo() {
  //   return {
  //     meditationState: this.currentState,
  //     timeSinceMotion: (this.timeSinceLastMotion / 1000).toFixed(1),
  //     isMoving: this.isMoving,
  //     movementDuration: (this.continuousMovementDuration / 1000).toFixed(1),
  //     effects: {
  //       waterColor: this.effects.waterColor,
  //       waveStrength: this.effects.waveStrength,
  //       sparkles: this.effects.sparkles,
  //       skyChanges: this.effects.skyChanges,
  //       cameraMovement: this.effects.cameraMovement,
  //     },
  //   };
  // }
}
class MeditationEffects {
  constructor(app) {
    if (!app) throw new Error("App reference is required for MeditationEffects");
    this.app = app;
    this.stateManager = new MeditationStateManager();

    // Core effect states
    this.meditationSparkles = false;
    this.originalCameraPosition = null;
    this.lastWaterColor = new THREE.Color(ThreeJSApp.CONFIG.WATER.DEFAULT_COLOR);
    
    // Store initial sky parameters
    this.initialSkyParams = {
      turbidity: ThreeJSApp.CONFIG.SKY.DEFAULT_TURBIDITY,
      rayleigh: ThreeJSApp.CONFIG.SKY.RAYLEIGH,
      inclination: 0.49, // Daytime
      azimuth: 0.25
    };
    
    // Define state-specific sky parameters
    this.skyStates = {
      NORMAL: {
        turbidity: this.initialSkyParams.turbidity,
        rayleigh: this.initialSkyParams.rayleigh,
        inclination: this.initialSkyParams.inclination,
        azimuth: this.initialSkyParams.azimuth
      },
      MODERATE: {
        turbidity: 2.0,  // Lower turbidity for clearer sky
        rayleigh: 1.0,   // Lower rayleigh for more vibrant colors
        inclination: 0.45, // Slightly towards sunset
        azimuth: 0.3
      },
      PROFOUND: {
        turbidity: 1.5,
        rayleigh: 0.5,
        inclination: -0.2, // Darker sky
        azimuth: 0.15
      }
    };
  }

  update() {
    const debugInfo = this.stateManager.getDebugInfo();
    this.updateVisualEffects(debugInfo.effects);

    if (this.app.debugMode) {
      this.logDebug(debugInfo);
    }
  }

  updateVisualEffects(effects) {
    this.updateWater(effects);
    this.updateSparkles(effects.sparkles);
    this.updateSky(effects.skyChanges);
    this.updateCamera(effects.cameraMovement);
  }

  updateSky(shouldChange) {
    if (!this.app.skyUniforms) return;

    const state = this.stateManager.currentState;
    let targetParams;

    if (!shouldChange || state === 'NORMAL') {
      targetParams = this.skyStates.NORMAL;
    } else if (state === 'MODERATE' || state === 'DEEP') {      
      targetParams = this.skyStates.MODERATE;
    } else if (state === 'PROFOUND') {
      targetParams = this.skyStates.PROFOUND;
    } else {
      targetParams = this.skyStates.NORMAL;
    }

    // Smoothly interpolate sky parameters
    this.app.skyUniforms["turbidity"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["turbidity"].value,
      targetParams.turbidity,
      0.02
    );

    this.app.skyUniforms["rayleigh"].value = THREE.MathUtils.lerp(
      this.app.skyUniforms["rayleigh"].value,
      targetParams.rayleigh,
      0.02
    );

    // Update sun position parameters
    this.app.parameters.inclination = THREE.MathUtils.lerp(
      this.app.parameters.inclination,
      targetParams.inclination,
      0.02
    );

    this.app.parameters.azimuth = THREE.MathUtils.lerp(
      this.app.parameters.azimuth,
      targetParams.azimuth,
      0.02
    );

    // Update sun position
    this.app.updateSun(this.app.parameters, new THREE.PMREMGenerator(this.app.renderer));
  }

  updateWater(effects) {
    if (!this.app.water) return;

    // Update water color
    const targetColor = new THREE.Color(effects.waterColor);
    this.app.water.material.uniforms.waterColor.value.lerp(targetColor, 0.1);

    // Update wave distortion
    const distortionScale = this.getDistortionForWaveStrength(effects.waveStrength);
    this.app.water.material.uniforms["distortionScale"].value = THREE.MathUtils.lerp(
      this.app.water.material.uniforms["distortionScale"].value,
      distortionScale,
      0.1
    );
  }

  updateSparkles(shouldSparkle) {
    if (shouldSparkle && !this.meditationSparkles) {
      this.app.makeSparkles(
        this.app.centerObj,
        this.app.meditationParams.sparkleSpread,
        this.app.meditationParams.sparkleLightness,
        this.app.meditationParams.sparkleSize,
        this.app.meditationParams.sparkleQuantity,
        this.app.meditationParams.sparkleNumSets
      );
      this.meditationSparkles = true;
    } else if (!shouldSparkle && this.meditationSparkles) {
      this.resetSparkles();
    }
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

    this.app.camera.position.y = THREE.MathUtils.lerp(
      this.app.camera.position.y,
      targetY,
      this.app.meditationParams.cameraSpeed
    );

    this.app.camera.position.z = THREE.MathUtils.lerp(
      this.app.camera.position.z,
      targetZ,
      this.app.meditationParams.cameraSpeed
    );
  }

  getDistortionForWaveStrength(strength) {
    const strengthMap = {
      low: 0.5,
      normal: 1.5,
      moderate: 2.5,
      high: 3.5,
      "very high": 4.5,
    };
    return strengthMap[strength] || 1.5;
  }

  resetSparkles() {
    if (!this.meditationSparkles) return;

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
      this.app.meditationParams.cameraSpeed
    );

    this.app.camera.position.z = THREE.MathUtils.lerp(
      this.app.camera.position.z,
      this.originalCameraPosition.z,
      this.app.meditationParams.cameraSpeed
    );
  }

  logDebug(debugInfo) {
    const debugContainer = document.getElementById("debugInfo");
    if (!debugContainer) return;

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
// Main application class to encapsulate all functionalities
export class ThreeJSApp {
  static CONFIG = {
    COUNTS: {
      FRIENDS: 40,
      MEDI_QUESTIONS: 3,
    },
    SKY: {
      BRIGHTNESS: 1.0,
      RAYLEIGH: 3,
      MIE_COEFFICIENT: 0.005,
      MIE_DIRECTIONAL_G: 0.7,
      DEFAULT_TURBIDITY: 6,
      SUN_POSITION: new THREE.Vector3(),
      START_TURBIDITY: 6,
      END_TURBIDITY: 2,
      START_RAYLEIGH: 3,
      END_RAYLEIGH: 1.5,
      TRANSITION_DURATION: 3000,
      LERP_FACTOR: 0.02, // Add this for smooth transitions
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

    MEDITATION: {
      WATER: {
        START_COLOR: 0x001e0f,
        END_COLOR: 0xd72b65,
        START_DISTORTION: 3.7,
        END_DISTORTION: 0.01,
      },
      SKY: {
        START_TURBIDITY: 6,
        END_TURBIDITY: 2,
        START_RAYLEIGH: 3,
        END_RAYLEIGH: 1.5,
        TRANSITION_DURATION: 3000,
        LERP_FACTOR: 0.02
      },

      SPARKLES: {
        SPREAD: 800,
        LIGHTNESS: 0.2,
        SIZE: 5,
        QUANTITY: 100,
        NUM_SETS: 100,
      },
      CAMERA: {
        MOVEMENT_SPEED: 0.05,
        TARGET_POSITION: new THREE.Vector3(0, 100, 400),
      },
    },
  };

  constructor() {
    this.container = document.getElementById("container");
    // this.currentLanguage = localStorage.getItem("lang") || "es";
    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    this.theta = 0;
    this.numberOfFriends = ThreeJSApp.CONFIG.COUNTS.FRIENDS;
    this.numberOfMediQuestions = ThreeJSApp.CONFIG.COUNTS.MEDI_QUESTIONS;

    this.fadeAmount = 1 / this.numberOfFriends;
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
      "Soften",
    ];
    this.friendQuestions = [
      "What did the air forget to tell you today?",
      "Where does the shadow go when you close your eyes?",
      "What memory hides in the cracks of your voice?",
      "Who stitched the threads of quiet joy in your heart?",
      "When did the clock last refuse to move?",
      "Do you collect the echoes of things unsaid?",
      "Can a question exist without wanting an answer?",
      "What sharp corner of the world is touching you?",
      "Have you ever been carried by something weightless?",
      "Who knows your name?",
      "What is in your hidden pocket?",
      "What is your earliest memory of play?",
      "Which sound would you wear like a second skin?",
      "What shape is the air inside your ribs?",
      "What do the stones beneath your feet dream about?",
      "What hides in the pause before you speak?",
      "Where does a thought go after you release it?",
      "What do you owe to the spaces between moments?",
      "Where does the horizon stop?",
      "What part of you belongs to no one, not even yourself?",
      "What is the quietest thing you’ve ever broken?",
      "Who weaves the edges of your dreams together?",
      "How many doors are hidden in this exact moment?",
      "Where can light go to hide?",
      "What was taken from you before you knew to miss it?",
      "Can water be still?",
      "How does gravity hold you?",
      "What song can only be sung in silence?",
      "How does your flesh remember its shape?",
      "When does forgetting become a form of remembering?",
      "What do you hold that can't be held?",
      "What do your hands know that your mind doesn't?",
      "What has built a home in you?",
      "What is just beyond the edge?",
      "What shape do you take when no one is looking?",
      "What smell hides in the folds of your memory?",
      "What do you hear when you press your ear to the void?",
      "What is between your skin and the air?",
      "What marks the place where your past ends?",
      "What shape do you leave behind in the places you’ve been?",
      "What language do your bones speak?",
      "What does the light joyfully bury in your shadow?",
      "Where do the roots of forgotten thoughts stretch?",
      "Who lives in the spaces your breath refuses to fill?",
      "What shape does forgetting carve into your mind?",
      "What do the spaces between your fingers know about longing?",
      "How does the air tremble when it slips through your teeth?",
      "What lies in the pause between reaching and being reached?",
      "What lives in the hollow between wanting and having?",
      "How does the earth remember your weight when you leave it?",
      "What do your bones hum when no one is listening?",
      "How does the fabric of yesterday fold around your chest?",
      "Who knots the gravity of your dreams to the edge of the world?",
      "What shape does the hunger of an unspoken truth wear?",
      "How does the fabric of light fray at its edges?",
    ];

    this.audioManager = new AudioManager();

    this.audioManager.seaSounds[0].loop = true; // Make sea sound loop
    this.audioManager.seaSounds[0]
      .play()
      .then(() => console.log("Sea sound started"))
      .catch((err) => console.error("Sea sound failed to start:", err));
    this.debugMode = true;

    this.meditationParams = new MeditationParameters(ThreeJSApp.CONFIG);
    this.meditationEffects = new MeditationEffects(this);

    this.cameraProcessor = new CameraProcessor(this.meditationEffects.stateManager, this.debugMode);

    this.initOpenCV();

    // this.init();
    // this.animate();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    window.addEventListener("load", this.onWindowLoad.bind(this));
  }

  // logError(message, error) {
  //   console.error(message, error);
  // }

  onWindowLoad() {
    document.body.classList.remove("preload");
    // this.renderLoadingPage();
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
    if (!this.debugMode) return;
    const debugInfo = document.getElementById("debugInfo");
    if (!debugInfo) return;

    const stateInfo = this.meditationEffects.stateManager.getDebugInfo();
    const effects = stateInfo.effects;

    debugInfo.innerHTML = `
      Current State: <span style="color: #00ff00">${stateInfo.meditationState}</span><br>
      Time Since Motion: ${stateInfo.timeSinceMotion}s<br>
      ${stateInfo.isMoving ? `Movement Duration: ${stateInfo.movementDuration}s<br>` : ""}
      <br>
      Visual Effects:<br>
      ▸ Ocean Color: ${effects.waterColor}<br>
      ▸ Wave Strength: ${effects.waveStrength}<br>
      ▸ Sparkles: ${effects.sparkles ? "Active" : "Inactive"}<br>
      ▸ Sky Changes: ${effects.skyChanges ? "Active" : "Inactive"}<br>
      ▸ Camera Movement: ${effects.cameraMovement ? "Active" : "Inactive"}<br>
    `;
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
      inclination: 0.49, // Changed from -0.5 to start with daytime
      azimuth: 0.25, // Changed from 0.205 for better sun position
      exposure: 0.5,
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

    this.skyUniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value.copy(this.sun).normalize();

    if (this.renderTarget !== undefined) this.renderTarget.dispose();

    this.renderTarget = pmremGenerator.fromScene(this.sky);
    this.scene.environment = this.renderTarget.texture;
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

    objectsFolder
      .add({ scale: ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.SCALE }, "scale", 0.1, 5)
      .name("Center Object Scale")
      .onChange((value) => {
        this.centerObj.scale.set(value, value, value); // Uniformly scale the object
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBE", 0.1, 5)
      .name("Torus Knot Tube")
      .onChange((value) => {
        // Update the CONFIG value
        ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBE = value;

        // Recreate the geometry with the updated parameter
        const newGeometry = new THREE.TorusKnotGeometry(
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIUS,
          value,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.TUBULAR_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.RADIAL_SEGMENTS,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.P,
          ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT.Q
        );

        // Replace the geometry while keeping the material and transformations
        this.centerObj.geometry.dispose(); // Clean up the old geometry
        this.centerObj.geometry = newGeometry;
      });

    objectsFolder
      .add(ThreeJSApp.CONFIG.OBJECTS.CENTER.TORUS_KNOT, "TUBULAR_SEGMENTS", 3, 500, 1)
      .name("Tubular Segments")
      .onChange((value) => {
        // Ensure it's an integer
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
    skyFolder.add(this.skyUniforms["rayleigh"], "value", 0, 10).name("CurrRaylh");
    skyFolder.add(this.skyUniforms["turbidity"], "value", 0, 20).name("Currurb");
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
    waterFolder.add(this.meditationParams, "waterDistortionStart", 0, 8).name("Start Distort");
    waterFolder.add(this.meditationParams, "waterDistortionEnd", 0, 8).name("End Distort ");
    waterFolder.add(this.water.material.uniforms.distortionScale, "value", 0, 10).name("Live Distort");

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
      .name("SunOnWater Color");

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
    cameraFolder.add(this.meditationParams, "cameraSpeed", 0.001, 0.1).name("Move Speed");

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

    // Open folders - commented out for now
    testingFolder.open();
    audioFolder.open();
    objectsFolder.open();
    meditationFolder.open();
    skyFolder.open();
    waterFolder.open();
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

    // Initialize meditation parameters
    // const params = new MeditationParameters(ThreeJSApp.CONFIG);

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
