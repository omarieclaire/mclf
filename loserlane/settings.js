// =========================================
// SettingsManager
// =========================================

class SettingsManager {
  constructor(game) {
    this.game = game;
    this.eventListeners = new Map();
    this.initialize();
  }

  initialize() {
    this.setupSettingsControls();
    // this.setupPresetControls();
    this.setupKeyboardShortcut();
    this.setupCloseButton();
  }

  setupKeyboardShortcut() {
    this.addEventListenerWithTracking(document, "keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        const settingsWindow = document.getElementById("settings-window");
        if (settingsWindow) {
          // settingsWindow.style.display = settingsWindow.style.display === "none" ? "block" : "none";
        }
      }

      // Add invincibility toggle with 'i' key
      if (e.key.toLowerCase() === "i") {
        const invincibleCheckbox = document.getElementById("bike-invincible");
        if (invincibleCheckbox) {
          invincibleCheckbox.checked = !invincibleCheckbox.checked;
          // Update the display value
          const valueDisplay = document.getElementById("bike-invincible-value");
          if (valueDisplay) {
            valueDisplay.textContent = invincibleCheckbox.checked ? "On" : "Off";
          }
          // Update the CONFIG
          // CONFIG.GAME.INVINCIBLE = invincibleCheckbox.checked;
          console.log("invin");
        }
      }
    });
  }
  setupCloseButton() {
    const closeButton = document.getElementById("close-settings");
    if (closeButton) {
      this.addEventListenerWithTracking(closeButton, "click", () => {
        document.getElementById("settings-window").style.display = "none";
      });
    }
  }

  setupSettingsControls() {
    // Debug Controls
    this.setupDebugControls();

    // Core Game Speed
    this.setupSettingControl(
      "world-scroll-speed",
      (value) => {
        CONFIG.MOVEMENT.BIKE_SPEED = parseFloat(value);
      },
      0.05,
      3.0,
      "Base game speed - how fast the world scrolls"
    );

    this.setupSettingControl(
      "frame-update-rate",
      (value) => {
        CONFIG.GAME.INITIAL_SPEED = parseInt(value);
      },
      16,
      200,
      "Frame update interval (ms)"
    );

    this.setupSettingControl(
      "speed-scaling-rate",
      (value) => {
        CONFIG.GAME.SPEED_DECREASE_RATE = parseFloat(value);
      },
      0.95,
      1.0,
      "Game acceleration rate"
    );

    // Entity Movement
    this.setupSettingControl(
      "oncoming-traffic-speed",
      (value) => {
        CONFIG.MOVEMENT.BASE_MOVE_SPEED = parseFloat(value);
      },
      0.5,
      5.0,
      "Oncoming traffic speed multiplier"
    );

    this.setupSettingControl(
      "streetcar-speed",
      (value) => {
        CONFIG.MOVEMENT.TTC_SPEED = parseFloat(value);
      },
      0.5,
      3.0,
      "Streetcar speed multiplier"
    );

    this.setupSettingControl(
      "pedestrian-relative-speed",
      (value) => {
        CONFIG.MOVEMENT.WANDERER_SPEED = parseFloat(value);
      },
      0.1,
      2.0,
      "Pedestrian speed multiplier"
    );

    // Traffic Density
    this.setupSettingControl(
      "global-density",
      (value) => {
        CONFIG.SPAWN_RATES.GLOBAL_MODIFIER = parseFloat(value);
        this.updateAllSpawnRates();
      },
      0.1,
      3.0,
      "Global spawn rate multiplier"
    );

    this.setupSettingControl(
      "streetcar-frequency",
      (value) => {
        CONFIG.SPAWN_RATES.TTC = parseFloat(value);
      },
      0.01,
      2.0,
      "Streetcar spawn frequency"
    );

    this.setupSettingControl(
      "streetcar-lane-traffic-frequency",
      (value) => {
        CONFIG.SPAWN_RATES.TTC_LANE_DEATHMACHINE = parseFloat(value);
      },
      0.01,
      2.0,
      "Streetcar lane traffic frequency"
    );

    this.setupSettingControl(
      "oncoming-traffic-frequency",
      (value) => {
        CONFIG.SPAWN_RATES.ONCOMING_DEATHMACHINE = parseFloat(value);
      },
      0.01,
      2.0,
      "Oncoming traffic frequency"
    );

    this.setupSettingControl(
      "parked-car-frequency",
      (value) => {
        CONFIG.SPAWN_RATES.PARKED_DEATHMACHINE = parseFloat(value);
      },
      0.01,
      2.0,
      "Parked car spawn frequency"
    );

    this.setupSettingControl(
      "pedestrian-frequency",
      (value) => {
        CONFIG.SPAWN_RATES.WANDERER = parseFloat(value);
      },
      0.01,
      3.0,
      "Pedestrian spawn frequency"
    );

    // Entity Spacing
    this.setupSettingControl(
      "streetcar-spacing",
      (value) => {
        CONFIG.SAFE_DISTANCE.TTC = parseInt(value);
      },
      5,
      150,
      "Minimum space between streetcars"
    );

    this.setupSettingControl(
      "traffic-vehicle-spacing",
      (value) => {
        CONFIG.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE = parseInt(value);
      },
      3,
      50,
      "Minimum space between vehicles"
    );

    this.setupSettingControl(
      "parked-car-spacing",
      (value) => {
        CONFIG.SAFE_DISTANCE.PARKED = parseInt(value);
      },
      2,
      30,
      "Minimum space between parked cars"
    );

    // Behavior Settings
    this.setupSettingControl(
      "stop-frequency",
      (value) => {
        CONFIG.TTC.STOP_INTERVAL.MIN = parseInt(value);
      },
      100,
      3000,
      "How often streetcars stop"
    );

    this.setupSettingControl(
      "min-stop-time",
      (value) => {
        CONFIG.TTC.STOP_DURATION.MIN = parseInt(value);
      },
      60,
      1000,
      "Minimum streetcar stop duration"
    );

    this.setupSettingControl(
      "door-opening-chance",
      (value) => {
        CONFIG.SPAWNING.PARKED_DEATHMACHINE_DOOR_CHANCE = parseFloat(value);
      },
      0.0,
      1.0,
      "Chance of parked car doors opening"
    );

    this.setupSettingControl(
      "parking-attempt-rate",
      (value) => {
        CONFIG.PROBABILITIES.PARKING = parseFloat(value);
      },
      0.0,
      1.0,
      "How often vehicles attempt parking"
    );

    // Player Settings
    this.setupSettingControl(
      "jump-distance",
      (value) => {
        CONFIG.MOVEMENT.JUMP_AMOUNT = parseInt(value);
      },
      1,
      10,
      "Lanes covered in one jump"
    );

    this.setupSettingControl(
      "jump-duration",
      (value) => {
        CONFIG.MOVEMENT.JUMP_DURATION = parseInt(value);
      },
      100,
      2000,
      "Jump animation duration"
    );
  }

  setupDebugControls() {
    const invincibleCheckbox = document.getElementById("bike-invincible");
    const invincibleValue = document.getElementById("bike-invincible-value");

    if (invincibleCheckbox && invincibleValue) {
      invincibleCheckbox.checked = CONFIG.GAME.INVINCIBLE || false;
      invincibleValue.textContent = CONFIG.GAME.INVINCIBLE ? "On" : "Off";

      this.addEventListenerWithTracking(invincibleCheckbox, "change", (e) => {
        CONFIG.GAME.INVINCIBLE = e.target.checked;
        invincibleValue.textContent = e.target.checked ? "On" : "Off";
      });
    }

    const hitboxCheckbox = document.getElementById("show-hitboxes");
    const hitboxValue = document.getElementById("show-hitboxes-value");

    if (hitboxCheckbox && hitboxValue) {
      hitboxCheckbox.checked = CONFIG.DEBUG?.SHOW_HITBOXES || false;
      hitboxValue.textContent = CONFIG.DEBUG?.SHOW_HITBOXES ? "On" : "Off";

      this.addEventListenerWithTracking(hitboxCheckbox, "change", (e) => {
        if (!CONFIG.DEBUG) CONFIG.DEBUG = {};
        CONFIG.DEBUG.SHOW_HITBOXES = e.target.checked;
        hitboxValue.textContent = e.target.checked ? "On" : "Off";
      });
    }
  }

  setupSettingControl(id, callback, min, max, tooltip) {
    const element = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);

    if (element && valueDisplay) {
      // Set range and initial value
      element.min = min;
      element.max = max;

      // Add tooltip if provided
      if (tooltip) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          const tooltipDiv = label.querySelector(".tooltip");
          if (tooltipDiv) {
            tooltipDiv.textContent = tooltip;
          }
        }
      }

      this.addEventListenerWithTracking(element, "input", (e) => {
        const value = e.target.value;
        valueDisplay.textContent = value;
        callback(value);
      });
    }
  }

  updateAllSpawnRates() {
    const modifier = CONFIG.SPAWN_RATES.GLOBAL_MODIFIER;
    const spawnRates = ["TTC", "TTC_LANE_DEATHMACHINE", "ONCOMING_DEATHMACHINE", "PARKED_DEATHMACHINE", "WANDERER"];

    spawnRates.forEach((type) => {
      const element = document.getElementById(`${type.toLowerCase()}-frequency`);
      if (element) {
        const baseValue = parseFloat(element.value);
        CONFIG.SPAWN_RATES[type] = baseValue * modifier;
      }
    });
  }

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  cleanup() {
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler, options }) => {
        element.removeEventListener(type, handler, options);
      });
    });
    this.eventListeners.clear();
  }
}