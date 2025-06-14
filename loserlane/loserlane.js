const CONFIG = {
  GAME: {
    INVINCIBLE: false,
    WIDTH: 42,
    HEIGHT: Math.floor(window.innerHeight / 20),
    INITIAL_SPEED: 50,
    MIN_SPEED: 300,
    SPEED_DECREASE_RATE: 0.995,
    CYCLIST_Y: Math.floor(window.innerHeight / 40),
    ANIMATION_FRAMES: {
      WANDERER_WAIT: 20,
      DEATH_SEQUENCE: 15,
    },
  },
  SPAWN_RATES: {
    TTC: 0.05,
    TTC_LANE_DEATHMACHINE: 0.8,
    ONCOMING_DEATHMACHINE: 0.4,
    PARKED_DEATHMACHINE: 0.2,
    DOOR_OPENING: 0.1,
    WANDERER: 0.9,
    BUILDING: 0.9,
  },
  SAFE_DISTANCE: {
    TTC: 8,
    TTC_LANE_DEATHMACHINE: 9,
    ONCOMING_DEATHMACHINE: 8,
    PARKED: 5,
    WANDERER: 3,
    BUILDING: 1,
    TTC_TO_TTC: 90,

    // TTC_TO_TTC: 20,
    TTC_TO_DEATHMACHINE: 15,
    DEFAULT: 1,
  },
  TTC: {
    STOP_INTERVAL: {
      MIN: 600, // 5 seconds
      MAX: 900, // 10 seconds
    },
    STOP_DURATION: {
      MIN: 380, // 3 seconds
      MAX: 800, // 5 seconds
    },
    DIFFICULTY_LEVELS: {
      HARD: {
        STOP_INTERVAL_MIN: 24, // Increased from 6
        STOP_INTERVAL_MAX: 96, // Increased from 24
        STOP_DURATION_MIN: 2,
        STOP_DURATION_MAX: 4,
      },
    },
  },
  LANES: {
    ONCOMING: 1,
    DIVIDER: 6,
    TRACKS: 8,
    BIKE: 15,
    BIKE_RIGHT: 16,
    PARKED: 17,
    SIDEWALK: 25,
    BUILDINGS: 28,
  },
  ANIMATIONS: {
    DOOR_OPEN_DURATION: 100,
    DOOR_OPEN_DELAY: 25,
    DEATH_DURATION: 1500,
    SCREEN_SHAKE_DURATION: 1500,
  },

  MOVEMENT: {
    JUMP_AMOUNT: 3,
    JUMP_DURATION: 1000,
    HOLD_DELAY: 2000,
    BASE_MOVE_SPEED: 1,
    BIKE_SPEED: 0.1,
    WANDERER_SPEED: 0.5,
  },
  // SPEED: {
  //   DEFAULT: 1,
  //   WORLD: 2,
  //   MOVINGTRAFFIC: 3
  // },
  COLLISION: {
    ADJACENT_LANE_THRESHOLD: 1,
    NEARBY_ENTITY_RADIUS: 2,
    // BUILDING_OVERLAP_THRESHOLD: 0.1,
  },
  SPAWNING: {
    PARKED_DEATHMACHINE_DOOR_CHANCE: 0.3,
    PARKED_DEATHMACHINE_MIN_Y: 0.2,
    PARKED_DEATHMACHINE_MAX_Y: 0.3,
    BUILDING_RESPAWN_COOLDOWN: 100,
    MIN_BUILDING_HEIGHT: -20,
  },
  PARTICLES: {
    MAX_DEATH_PARTICLES: 20,
    PARTICLE_SPREAD: 2,
    PARTICLE_SPEED: 0.5,
  },
  PROBABILITIES: {
    PARKING: 0.01,
    GAP: 0.6,
    DOOR_OPENING: 0.3,
  },
  DIMENSIONS: {
    DOOR: {
      WIDTHS: [0, 0.8, 1, 1.5, 1.8],
      HEIGHTS: [0.8, 1.8],
    },
  },
  AUDIO: {
    VOLUME: {
      MASTER: 1.0,
      EFFECTS: 0.8,
      MUSIC: 0.6,
    },
    EFFECTS: {
      COLLISION_DURATION: 300,
    },
  },
  TIMINGS: {
    ANIMATION_FRAME: 1000 / 60, // ~16.67ms for 60fps
    MESSAGE_DISPLAY: 1500,
    SPAWN_CHECK_INTERVAL: 100,
  },

  BOUNDARIES: {
    MIN_X: 0,
    MAX_X: 40,
    MIN_Y: -10,
    MAX_Y: null, // Set dynamically based on window height
    OFFSCREEN_BUFFER: 5,
  },
};

const DOOR_STATES = {
  CLOSED: 0,
  OPENING_1: 1,
  OPENING_2: 2,
  OPENING_3: 3,
  FULLY_OPEN: 4,
};

class DarlingType {
  static TTC = "TTC";
  static TTC_LANE_DEATHMACHINE = "TTC_LANE_DEATHMACHINE";
  static ONCOMING_DEATHMACHINE = "ONCOMING_DEATHMACHINE";
  static PARKED_DEATHMACHINE = "PARKED_DEATHMACHINE";
  static WANDERER = "WANDERER";
  static BUILDING = "BUILDING";
  static BIKE = "BIKE";
}

// =========================================
// Position
// =========================================

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
}

// =========================================
// SpatialManager - SpatialManager
// =========================================
//  SpatialManager class handles the spatial relationships and management of game darlings
//  including their movement, collision detection, spawning, and grid-based positioning.

class SpatialManager {
  constructor(config, soundManager = null) {
    this.config = config;
    // Initialize grid system for spatial partitioning
    this.soundManager = soundManager; // Store sound manager reference

    this.grid = new SpatialGrid(config); // Use new name SpatialGrid
    // Handle collision detection and resolution between darlings
    this.collisionManager = new CollisionManager(this);
    // Manage entity movement and coordinate updates
    this.movementCoordinator = new MovementCoordinator(this);
    // Handle entity spawning logic and timing
    this.spawnManager = new SpawnManager(this, config);
    // Set to store all active game darlings
    this.darlings = new Set();
  }

  setGame(game) {
    this.game = game;
    this.collisionManager = new CollisionManager(this);
  }

  // Add this new method here
  spawnEntity(entityType) {
    const entity = this.spawnManager.spawnEntity(entityType);
    if (entity && this.soundManager) {
      entity.setSoundManager(this.soundManager);
    }
    if (entity) {
      this.addEntityToSpatialManagementSystem(entity);
    }
    return entity;
  }

  update() {
    // Rest of your methods...
    this.darlings.forEach((entity) => {
      if (entity.position.y > this.config.GAME.HEIGHT + 5 || entity.position.y + entity.height < -5) {
        this.removeEntityFromSpatialManagementSystem(entity);
      }
    });

    this.movementCoordinator.update();
    this.collisionManager.collisionManagerUpdate();
    this.darlings.forEach((entity) => entity.behavior.update());
  }

  // Rest of your existing methods...
  validateIfEntityCanMoveToNewPos(entityTryingToMove, proposedNewPostion) {
    return this.collisionManager.validateMovement(entityTryingToMove, proposedNewPostion);
  }

  addEntityToSpatialManagementSystem(entityToRegister) {
    entityToRegister.spatialManager = this;
    this.darlings.add(entityToRegister);
    this.grid.addDarlingToItsGridCell(entityToRegister);
  }

  removeEntityFromSpatialManagementSystem(entityToUnregister) {
    this.darlings.delete(entityToUnregister);
    this.grid.removeDarlingFromItsGridCell(entityToUnregister);
  }

  getAllObstaclesInASpecificLane(laneNumberToCheck) {
    return Array.from(this.darlings).filter((entity) => Math.floor(entity.position.x) === laneNumberToCheck);
  }

  getObstaclesOfASpecificType(entityType) {
    return Array.from(this.darlings).filter((entity) => entity.type === entityType);
  }

  cleanup() {
    this.darlings.clear();
    this.grid = new SpatialGrid(this.config);
    this.collisionManager = new CollisionManager(this);
    this.movementCoordinator = new MovementCoordinator(this);
    this.spawnManager = new SpawnManager(this, this.config);
  }
}

// =========================================
// SpatialGrid - Spatial Management
// =========================================
// implements spatial partitioning for collision detection and proximity queries.
// and divides the game world into a grid of cells and tracks which darlings are in each cell
// For game logic and spatial partitioning
class SpatialGrid {
  constructor(config) {
    this.config = config;
    this.cellSize = 5; // Size of each grid cell for spatial partitioning
    this.cells = new Map(); // Map to store entities in grid cells
  }

  getCellKey(worldXCoords, worldYCoords) {
    const cellX = Math.floor(worldXCoords / this.cellSize);
    const cellY = Math.floor(worldYCoords / this.cellSize);
    return `${cellX},${cellY}`;
  }

  addDarlingToItsGridCell(darlingToAdd) {
    const key = this.getCellKey(darlingToAdd.position.x, darlingToAdd.position.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key).add(darlingToAdd);
  }

  removeDarlingFromItsGridCell(darlingToRemove) {
    const key = this.getCellKey(darlingToRemove.position.x, darlingToRemove.position.y);
    const cell = this.cells.get(key);
    if (cell) {
      cell.delete(darlingToRemove);
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  updateDarlingsPositionInGridSystem(theDarlingThatMoved, oldPos, newPos) {
    const oldKey = this.getCellKey(oldPos.x, oldPos.y);
    const newKey = this.getCellKey(newPos.x, newPos.y);

    if (oldKey !== newKey) {
      this.cells.get(oldKey)?.delete(theDarlingThatMoved);
      if (!this.cells.has(newKey)) {
        this.cells.set(newKey, new Set());
      }
      this.cells.get(newKey).add(theDarlingThatMoved);
    }
  }

  getNearbyDarlings(centerPositionToSearchAround, radiusInWorldUnits) {
    const nearbyDarlings = new Set();
    const cellRadius = Math.ceil(radiusInWorldUnits / this.cellSize);
    const centerCellX = Math.floor(centerPositionToSearchAround.x / this.cellSize);
    const centerCellY = Math.floor(centerPositionToSearchAround.y / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach((entity) => {
            if (entity.position.distanceTo(centerPositionToSearchAround) <= radiusInWorldUnits) {
              nearbyDarlings.add(entity);
            }
          });
        }
      }
    }
    return Array.from(nearbyDarlings);
  }
}

// =========================================
// RenderGrid - rendering
// =========================================
class RenderGrid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = Array(height)
      .fill()
      .map(() =>
        Array(width)
          .fill()
          .map(() => ({
            content: " ",
            style: null,
            dirty: true,
          }))
      );
    this.activeRegions = new Set();
  }

  clear() {
    this.activeRegions.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      this.grid[y][x] = {
        content: " ",
        style: null,
        dirty: false,
      };
    });
    this.activeRegions.clear();
  }

  updateCell(x, y, content, style = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const cell = this.grid[y][x];
    if (cell.content !== content || cell.style !== style) {
      cell.content = content;
      cell.style = style;
      cell.dirty = true;
      this.activeRegions.add(`${x},${y}`);
    }
  }

  render() {
    let output = [];
    let currentRow = [];
    let lastStyle = null;

    for (let y = 0; y < this.height; y++) {
      currentRow = [];
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (cell.style !== lastStyle) {
          if (lastStyle !== null) currentRow.push(STYLES.RESET);
          if (cell.style !== null) currentRow.push(cell.style);
          lastStyle = cell.style;
        }
        currentRow.push(cell.content);
      }
      if (lastStyle !== null) currentRow.push(STYLES.RESET);
      output.push(currentRow.join(""));
    }
    return output.join("\n");
  }

  getActiveCharacters() {
    const activeChars = [];
    this.activeRegions.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      const cell = this.grid[y][x];
      if (cell.content !== " ") {
        activeChars.push({
          x,
          y,
          content: cell.content,
          style: cell.style,
        });
      }
    });
    return activeChars;
  }
}

// =========================================
// GameRenderer - rendering stuff in the game!
// =========================================
class GameRenderer {
  constructor(config, renderGrid) {
    this.config = config;
    this.renderGrid = renderGrid;
  }

  render(stateManager, darlings, bike) {
    const state = stateManager.state;

    // Only render death animation during first part of death sequence
    if (state.isDead && state.deathState.animation >= 15) return; // Increased from 10 to 15

    this.renderGrid.clear();
    this.drawRoadFeatures();

    // If dead, apply glitch effect to all entities
    if (state.isDead) {
      this.drawDarlings(darlings, true);
      this.drawBike(bike, state);
    } else {
      this.drawDarlings(darlings, false);
      this.drawBike(bike, state);
    }

    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.innerHTML = this.renderGrid.render();
    }
  }

  // Update other methods to handle state correctly

  drawRoadFeatures() {
    for (let y = 0; y < this.config.GAME.HEIGHT; y++) {
      this.renderGrid.updateCell(this.config.LANES.DIVIDER, y, "║", STYLES.TRAFFIC);
      this.renderGrid.updateCell(this.config.LANES.DIVIDER + 1, y, "║", STYLES.TRAFFIC);
      this.renderGrid.updateCell(this.config.LANES.TRACKS + 1, y, "║", STYLES.TRACKS);
      this.renderGrid.updateCell(this.config.LANES.TRACKS + 5, y, "║", STYLES.TRACKS);

      if (y % 3 === 0) {
        this.renderGrid.updateCell(this.config.LANES.BIKE - 1, y, " ", STYLES.TRAFFIC);
      }

      for (let x = this.config.LANES.SIDEWALK; x < this.config.LANES.BUILDINGS; x++) {
        this.renderGrid.updateCell(x, y, " ", STYLES.SIDEWALK);
      }
    }
  }

  drawDarlings(darlings, isDying) {
    darlings.forEach((entity) => {
      if (entity.type !== DarlingType.BIKE) {
        this.drawEntity(entity, { isDead: isDying }); // Pass an object with isDead property
      }
    });
  }

  drawEntity(entity, state) {
    if (!entity || !entity.art) return;

    if (entity.position.y + entity.height >= 0 && entity.position.y < CONFIG.GAME.HEIGHT) {
      const isDying = state.isDead; // Now this will work correctly

      entity.art.forEach((line, i) => {
        if (entity.position.y + i >= 0 && entity.position.y + i < CONFIG.GAME.HEIGHT) {
          line.split("").forEach((char, x) => {
            if (char !== " " && entity.position.x + x >= 0 && entity.position.x + x < CONFIG.GAME.WIDTH) {
              let effectClass = "entity ";

              // Add entity-specific classes
              switch (entity.type) {
                case DarlingType.TTC:
                  effectClass += "TTC";
                  break;
                case DarlingType.TTC_LANE_DEATHMACHINE:
                case DarlingType.ONCOMING_DEATHMACHINE:
                  effectClass += "deathMachine";
                  break;
                case DarlingType.PARKED_DEATHMACHINE:
                  effectClass += entity.behavior?.doorState > 0 ? "door-opening" : "deathMachine";
                  break;
                case DarlingType.WANDERER:
                  effectClass += "wanderer";
                  break;
                case DarlingType.BUILDING:
                  effectClass += "building";
                  break;
              }

              // Add death glitch classes if dying
              if (isDying) {
                const isEdge = /[┌┐│╰╯]/.test(char);
                effectClass += ` char-glitch ${isEdge ? "edge" : "body"}`;
              }

              const wrappedChar = `<span class="${effectClass}">${char}</span>`;
              this.renderGrid.updateCell(Math.floor(entity.position.x + x), Math.floor(entity.position.y + i), wrappedChar, entity.color);
            }
          });
        }
      });
    }
  }

  drawBike(bike, state) {
    // Update method signature
    if (state.isDead && state.deathState.animation < 15) {
      this.drawDeathAnimation(state.deathState);
    } else if (!state.isDead) {
      this.drawLiveBike(bike, state.isJumping);
    }
  }

  drawDeathAnimation(deathState) {
    const frameIndex = Math.min(4, Math.floor(deathState.animation / 3));
    const frames = Object.values(EXPLOSION_FRAMES);
    const currentFrame = frames[frameIndex];
    const currentColor = EXPLOSION_COLOURS[Math.floor(Math.random() * EXPLOSION_COLOURS.length)];

    currentFrame.forEach((line, i) => {
      line.split("").forEach((char, x) => {
        const deathY = deathState.y + i - 1;
        const deathX = deathState.x + x - 2;

        if (deathY < this.config.GAME.HEIGHT && deathY >= 0 && deathX < this.config.GAME.WIDTH && deathX >= 0 && char !== " ") {
          const animatedChar = `<span class="death-particle">${char}</span>`;
          this.renderGrid.updateCell(deathX, deathY, animatedChar, currentColor);
        }
      });
    });

    this.drawDeathParticles(deathState);
  }
  drawLiveBike(bike, state) {
    const bikeCenterLane = Math.floor(bike.position.x + bike.width / 2);
    const currentBikeLane = Math.floor(bike.position.x);

    console.log("Bike Debug:", {
      exactX: bike.position.x.toFixed(2),
      centerX: (bike.position.x + bike.width / 2).toFixed(2),
      bikeCenterLane,
      track1: this.config.LANES.TRACKS + 1,
      track2: this.config.LANES.TRACKS + 5,
      bankingLeft: bikeCenterLane === this.config.LANES.TRACKS + 1 || bikeCenterLane === this.config.LANES.TRACKS + 5,
    });

    const bikeY = this.config.GAME.CYCLIST_Y;

    // Debug info at top of screen
    const debugInfo = [
      `Bike X: ${bike.position.x.toFixed(2)}`,
      `Center: ${(bike.position.x + bike.width / 2).toFixed(2)}`,
      `Track1: ${this.config.LANES.TRACKS + 1}`,
      `Track2: ${this.config.LANES.TRACKS + 5}`,
      `Banking: ${bikeCenterLane === this.config.LANES.TRACKS + 1 || bikeCenterLane === this.config.LANES.TRACKS + 5}`,
    ];

    // Draw debug info
    // debugInfo.forEach((text, i) => {
    //     text.split('').forEach((char, x) => {
    //         this.renderGrid.updateCell(x, i, char, STYLES.RESET);
    //     });
    // });

    let bikeArt = DARLINGS.BIKE.art;
    let bankingClass = "";

    // Use center position for banking, just like collision detection
    if (bikeCenterLane === this.config.LANES.TRACKS + 1 || bikeCenterLane === this.config.LANES.TRACKS + 5) {
      // The bike's center is on a track - show banking animation
      const movingRight = bike.position.x > this.lastBikeX;
      bikeArt = movingRight ? DARLINGS.BIKE.artBankRight : DARLINGS.BIKE.artBankLeft;
      bankingClass = movingRight ? "bike-banking-right" : "bike-banking-left";
    }
    this.lastBikeX = bike.position.x; // Store position for next frame

    // Mark track positions with visual indicators
    const trackPositions = [this.config.LANES.TRACKS + 1, this.config.LANES.TRACKS + 5];
    trackPositions.forEach((x) => {
      // this.renderGrid.updateCell(x, bikeY - 1, '↓', STYLES.RESET);
    });

    bikeArt.forEach((line, i) => {
      line.split("").forEach((char, x) => {
        if (char !== " ") {
          const gridX = Math.round(bike.position.x + x);
          if (gridX >= 0 && gridX < this.config.GAME.WIDTH) {
            const bikeChar = `<span class="bike ${bankingClass}">${char}</span>`;
            this.renderGrid.updateCell(gridX, bikeY + i, bikeChar, STYLES.BIKE);
          }
        }
      });
    });
  }
  drawDeathParticles(deathState) {
    const particleChars = ["", "⚡", "⚡"];
    const numParticles = Math.min(this.config.PARTICLES.MAX_DEATH_PARTICLES, deathState.animation * 2);

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const radius = deathState.animation / 2 + Math.random() * this.config.PARTICLES.PARTICLE_SPREAD;
      const x = Math.round(deathState.x + Math.cos(angle) * radius);
      const y = Math.round(deathState.y + Math.sin(angle) * radius);

      if (y < this.config.GAME.HEIGHT && y >= 0 && x < this.config.GAME.WIDTH && x >= 0) {
        const char = particleChars[Math.floor(Math.random() * particleChars.length)];
        const particleColor = EXPLOSION_COLOURS[Math.floor(Math.random() * EXPLOSION_COLOURS.length)];
        this.renderGrid.updateCell(x, y, `<span class="death-particle-outer">${char}</span>`, particleColor);
      }
    }
  }
}

class CollisionError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "CollisionError";
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends CollisionError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = "ValidationError";
  }
}

class EntityError extends CollisionError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = "EntityError";
  }
}

class HitboxError extends CollisionError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = "HitboxError";
  }
}

// =========================================
// CollisionManager - Collision Management
// =========================================

class CollisionManager {
  constructor(spatialManager) {
    if (!spatialManager) {
      throw new CollisionError("SpatialManager is required for collision detection");
    }
    this.spatialManager = spatialManager;
    this.config = spatialManager.config;
    this.collisionLog = new Set();
    this.errorLog = [];
  }

  logError(error, method) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      method,
      message: error.message,
      stack: error.stack,
      context: error.context || {},
    };
    this.errorLog.push(errorInfo);
    console.error(`SpawnManager Error in ${method}:`, errorInfo);
  }

  checkCollision(hitboxA, hitboxB) {
    try {
      if (!hitboxA || !hitboxB || typeof hitboxA !== "object" || typeof hitboxB !== "object") {
        throw new CollisionError("Invalid hitbox parameters", { hitboxA, hitboxB });
      }

      const requiredProps = ["x", "y", "width", "height"];
      for (const prop of requiredProps) {
        if (typeof hitboxA[prop] !== "number" || typeof hitboxB[prop] !== "number") {
          throw new CollisionError(`Missing or invalid ${prop} property in hitbox`, {
            hitboxA: hitboxA[prop],
            hitboxB: hitboxB[prop],
          });
        }
      }

      return !(
        hitboxA.x + hitboxA.width <= hitboxB.x ||
        hitboxA.x >= hitboxB.x + hitboxB.width ||
        hitboxA.y + hitboxA.height <= hitboxB.y ||
        hitboxA.y >= hitboxB.y + hitboxB.height
      );
    } catch (error) {
      this.logError(error, "checkCollision");
      return false;
    }
  }

  checkBikeCollisionIsSpecial(bikeHitbox, darlings) {
    try {
      if (!bikeHitbox || !darlings?.darlings) {
        throw new CollisionError("Invalid parameters for bike collision check", {
          bikeHitbox,
          darlings,
        });
      }

      for (const darling of darlings.darlings) {
        try {
          const darlingHitbox = darling.getHitbox();
          if (this.checkCollision(bikeHitbox, darlingHitbox)) {
            const obstacleHitbox = darlingHitbox;
            const collisionDirection = this.getCollisionDirection(bikeHitbox, obstacleHitbox);
            // If obstacle is moving and hits bike from behind
            if (darling.behavior?.baseSpeed > 0 && collisionDirection === "up") {
              switch (darling.type) {
                case DarlingType.TTC:
                  return "TTC";
                case DarlingType.TTC_LANE_DEATHMACHINE:
                case DarlingType.ONCOMING_DEATHMACHINE:
                  return "ONCOMING_DEATHMACHINE";
                case DarlingType.WANDERER:
                  return "WANDERER";
                case DarlingType.BUILDING:
                  return "BUILDING";
                default:
                  return "TRAFFIC";
              }
            }

            // If bike runs into obstacle or obstacle hits from front
            switch (darling.type) {
              case DarlingType.TTC:
                return "TTC";
              case DarlingType.TTC_LANE_DEATHMACHINE:
              case DarlingType.ONCOMING_DEATHMACHINE:
                return "TRAFFIC";
              case DarlingType.WANDERER:
                return "WANDERER";
              case DarlingType.BUILDING:
                return "BUILDING";
              default:
                return "TRAFFIC";
            }
          }
        } catch (error) {
          this.logError(
            new CollisionError("Error getting darling hitbox", {
              darlingType: darling.type,
              originalError: error,
            }),
            "checkBikeCollisionIsSpecial"
          );
          continue;
        }
      }

      // Check parked vehicle collisions
      if (!Array.isArray(darlings.parkedDeathMachines)) {
        throw new CollisionError("Invalid parkedDeathMachines array", {
          parkedDeathMachines: darlings.parkedDeathMachines,
        });
      }

      for (const deathMachine of darlings.parkedDeathMachines) {
        try {
          if (this.checkCollision(bikeHitbox, deathMachine.getHitbox())) {
            return "PARKEDDEATHMACHINE";
          }
          if (deathMachine.behavior?.doorHitbox && this.checkCollision(bikeHitbox, deathMachine.behavior.doorHitbox)) {
            return "DOOR";
          }
        } catch (error) {
          this.logError(
            new CollisionError("Error checking death machine collision", {
              machineId: deathMachine.id,
              originalError: error,
            }),
            "checkBikeCollisionIsSpecial"
          );
          continue;
        }
      }

      // Simplified track collision check
      const trackPositions = [this.config.LANES.TRACKS + 1, this.config.LANES.TRACKS + 5];
      const bikeCenter = bikeHitbox.x + bikeHitbox.width / 2;
      if (trackPositions.includes(Math.floor(bikeCenter))) {
        return "TRACKS";
      }

      return null;
    } catch (error) {
      this.logError(error, "checkBikeCollisionIsSpecial");
      return null;
    }
  }

  collisionManagerUpdate() {
    try {
      const pairs = this.getCollisionPairs();
      for (const [entityA, entityB] of pairs) {
        if (!entityA || !entityB) {
          throw new CollisionError("Invalid entity pair", { entityA, entityB });
        }

        if (entityA.type === DarlingType.BIKE || entityB.type === DarlingType.BIKE) {
          const bike = entityA.type === DarlingType.BIKE ? entityA : entityB;
          const obstacle = entityA.type === DarlingType.BIKE ? entityB : entityA;

          if (!bike.behavior?.onCollision) {
            throw new CollisionError("Bike missing collision behavior", {
              bikeId: bike.id,
            });
          }

          const darlingsForCollision = {
            darlings: [obstacle],
            parkedDeathMachines: obstacle.type === DarlingType.PARKED_DEATHMACHINE ? [obstacle] : [],
          };

          try {
            const collisionType = this.checkBikeCollisionIsSpecial(bike.getHitbox(), darlingsForCollision, false);

            if (collisionType) {
              bike.behavior.onCollision(obstacle);
            }
          } catch (error) {
            this.logError(
              new CollisionError("Error in bike collision check", {
                bikeId: bike.id,
                obstacleId: obstacle.id,
                originalError: error,
              }),
              "collisionManagerUpdate"
            );
          }
        } else {
          this.handleEntityCollision(entityA, entityB);
        }
      }
    } catch (error) {
      this.logError(error, "collisionManagerUpdate");
    }
  }

  handleEntityCollision(entityA, entityB) {
    try {
      if (!entityA || !entityB) {
        throw new CollisionError("Invalid entities for collision handling", {
          entityA,
          entityB,
        });
      }

      if (entityA.behavior?.ignoreCollisions || entityB.behavior?.ignoreCollisions) {
        return;
      }

      const priorityA = this.getEntityPriority(entityA);
      const priorityB = this.getEntityPriority(entityB);

      if (entityA.type === DarlingType.PARKED_DEATHMACHINE && entityB.type === DarlingType.PARKED_DEATHMACHINE) {
        console.log("🚗 Parked Car Collision:", {
          carA: {
            id: entityA.id.slice(-6),
            pos: entityA.position,
            speed: entityA.behavior?.baseSpeed,
          },
          carB: {
            id: entityB.id.slice(-6),
            pos: entityB.position,
            speed: entityB.behavior?.baseSpeed,
          },
        });
      }

      if (priorityA > priorityB) {
        this.applyCollisionResponse(entityB, entityA);
      } else if (priorityB > priorityA) {
        this.applyCollisionResponse(entityA, entityB);
      } else {
        this.applyCollisionResponse(entityA, entityB);
        this.applyCollisionResponse(entityB, entityA);
      }
    } catch (error) {
      this.logError(error, "handleEntityCollision");
    }
  }

  applyCollisionResponse(entity, otherEntity) {
    try {
      if (!entity || !otherEntity) {
        throw new CollisionError("Invalid entities for collision response", {
          entity,
          otherEntity,
        });
      }

      if (!entity.behavior) return;

      const moveDirection = Math.sign(entity.behavior.baseSpeed || 0);
      const otherDirection = Math.sign(otherEntity.behavior?.baseSpeed || 0);

      if (moveDirection * otherDirection < 0) {
        entity.behavior.stopped = true;
        setTimeout(() => {
          try {
            entity.behavior.stopped = false;
          } catch (error) {
            this.logError(
              new CollisionError("Error unstopping entity", {
                entityId: entity.id,
                originalError: error,
              }),
              "applyCollisionResponse"
            );
          }
        }, 500);
        return;
      }

      if (Math.abs(entity.behavior.baseSpeed) < Math.abs(otherEntity.behavior?.baseSpeed || 0)) {
        entity.behavior.baseSpeed = otherEntity.behavior.baseSpeed;
      }
    } catch (error) {
      this.logError(error, "applyCollisionResponse");
    }
  }

  validateMovement(entity, newPosition) {
    try {
      if (!entity || !newPosition) {
        throw new CollisionError("Invalid parameters for movement validation", {
          entity,
          newPosition,
        });
      }

      if (entity.type === DarlingType.PARKED_DEATHMACHINE) {
        const nearbyParkedCars = this.spatialManager.grid
          .getNearbyDarlings(newPosition, Math.max(entity.width, entity.height) * 2)
          .filter((other) => other.type === DarlingType.PARKED_DEATHMACHINE);

        // console.log("=== Parked Car Position Check ===", {
        //   id: entity.id.slice(-6),
        //   currentX: entity.position?.x,
        //   currentY: entity.position?.y,
        //   proposedX: newPosition.x,
        //   proposedY: newPosition.y,
        //   nearbyParkedCars: nearbyParkedCars.map((other) => ({
        //     id: other.id.slice(-6),
        //     x: other.position.x,
        //     y: other.position.y,
        //     xDistance: Math.abs(other.position.x - newPosition.x),
        //     yDistance: Math.abs(other.position.y - newPosition.y),
        //   })),
        // });
      }

      if (entity.behavior?.ignoreCollisions) {
        return true;
      }

      const tempPosition = entity.position;
      entity.position = newPosition;

      try {
        const radius = Math.max(entity.width, entity.height) * 2;
        const nearby = this.spatialManager.grid.getNearbyDarlings(newPosition, radius);

        let isValid = true;
        for (const other of nearby) {
          if (!other.getHitbox) {
            throw new CollisionError("Entity missing getHitbox method", {
              entityId: other.id,
            });
          }

          if (other.type === DarlingType.BIKE) {
            continue;
          }

          if (other !== entity && this.shouldCheckCollision(entity, other) && this.checkCollision(entity.getHitbox(), other.getHitbox())) {
            if (entity.type === DarlingType.PARKED_DEATHMACHINE) {
              // console.log("🚫 Invalid Position:", {
              //   entityId: entity.id.slice(-6),
              //   collidingWith: other.id.slice(-6),
              //   proposedPos: newPosition,
              //   otherPos: other.position,
              //   distance: {
              //     x: Math.abs(newPosition.x - other.position.x),
              //     y: Math.abs(newPosition.y - other.position.y),
              //   },
              // });
            }
            isValid = false;
            break;
          }
        }

        return isValid;
      } finally {
        entity.position = tempPosition;
      }
    } catch (error) {
      this.logError(error, "validateMovement");
      return false;
    }
  }

  getEntityPriority(entity) {
    try {
      if (!entity?.type) {
        throw new CollisionError("Invalid entity for priority calculation", { entity });
      }

      const priorities = {
        [DarlingType.TTC]: 5,
        [DarlingType.TTC_LANE_DEATHMACHINE]: 4,
        [DarlingType.ONCOMING_DEATHMACHINE]: 3,
        [DarlingType.PARKED_DEATHMACHINE]: 2,
        [DarlingType.WANDERER]: 1,
        [DarlingType.BUILDING]: 0,
      };
      return priorities[entity.type] || 0;
    } catch (error) {
      this.logError(error, "getEntityPriority");
      return 0;
    }
  }

  getCollisionPairs() {
    try {
      if (!this.spatialManager?.darlings) {
        throw new CollisionError("Invalid spatial manager state");
      }

      const pairs = [];
      const darlings = Array.from(this.spatialManager.darlings);
      const processedPairs = new Set();

      for (let i = 0; i < darlings.length; i++) {
        const entityA = darlings[i];
        if (!entityA?.position) {
          this.logError(
            new CollisionError("Invalid entity position", {
              entityId: entityA?.id,
            }),
            "getCollisionPairs"
          );
          continue;
        }

        try {
          const nearby = this.spatialManager.grid.getNearbyDarlings(entityA.position, Math.max(entityA.width, entityA.height) * 2);

          for (const entityB of nearby) {
            if (entityA === entityB) continue;

            if (!entityA.id || !entityB.id) {
              this.logError(
                new CollisionError("Entity missing ID", {
                  entityAId: entityA?.id,
                  entityBId: entityB?.id,
                }),
                "getCollisionPairs"
              );
              continue;
            }

            const pairKey = [entityA.id, entityB.id].sort().join(",");
            if (processedPairs.has(pairKey)) continue;

            try {
              if (this.shouldCheckCollision(entityA, entityB) && this.checkCollision(entityA.getHitbox(), entityB.getHitbox())) {
                pairs.push([entityA, entityB]);
                processedPairs.add(pairKey);
              }
            } catch (error) {
              this.logError(
                new CollisionError("Error checking collision pair", {
                  entityAId: entityA.id,
                  entityBId: entityB.id,
                  originalError: error,
                }),
                "getCollisionPairs"
              );
            }
          }
        } catch (error) {
          this.logError(
            new CollisionError("Error getting nearby darlings", {
              entityId: entityA.id,
              originalError: error,
            }),
            "getCollisionPairs"
          );
          continue;
        }
      }

      return pairs;
    } catch (error) {
      this.logError(error, "getCollisionPairs");
      return [];
    }
  }

  shouldCheckCollision(entityA, entityB) {
    try {
      if (!entityA || !entityB) {
        throw new CollisionError("Invalid entities for collision check", {
          entityA,
          entityB,
        });
      }

      if (entityA.behavior?.ignoreCollisions || entityB.behavior?.ignoreCollisions) {
        return false;
      }

      if (entityA.type === DarlingType.BIKE || entityB.type === DarlingType.BIKE) {
        return true;
      }

      if (!entityA.position || !entityB.position) {
        throw new CollisionError("Entities missing position", {
          entityAPos: entityA.position,
          entityBPos: entityB.position,
        });
      }

      const xDistance = Math.abs(entityA.position.x - entityB.position.x);
      const yDistance = Math.abs(entityA.position.y - entityB.position.y);

      // More permissive spacing for parked cars
      if (entityA.type === DarlingType.PARKED_DEATHMACHINE && entityB.type === DarlingType.PARKED_DEATHMACHINE) {
        return xDistance < 1 && yDistance < 6; // Larger minimum spacing
      }

      if (entityA.type === DarlingType.TTC || entityB.type === DarlingType.TTC) {
        return xDistance <= 2;
      }

      return xDistance <= 1;
    } catch (error) {
      this.logError(error, "shouldCheckCollision");
      return false;
    }
  }

  getCollisionDirection(hitboxA, hitboxB) {
    try {
      if (!hitboxA || !hitboxB) {
        throw new CollisionError("Invalid hitboxes for direction check", {
          hitboxA,
          hitboxB,
        });
      }

      const centerA = {
        x: hitboxA.x + hitboxA.width / 2,
        y: hitboxA.y + hitboxA.height / 2,
      };
      const centerB = {
        x: hitboxB.x + hitboxB.width / 2,
        y: hitboxB.y + hitboxB.height / 2,
      };

      const dx = centerB.x - centerA.x;
      const dy = centerB.y - centerA.y;

      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    } catch (error) {
      this.logError(error, "getCollisionDirection");
      return "up"; // Default direction if error occurs
    }
  }
}

// =========================================
// MovementCoordinator -  Management
// =========================================
/**
 * manages and validates darling movement throughout the game
 * handles path planning, collision avoidance, and movement priority
 */

class MovementCoordinator {
  constructor(spatialManager) {
    this.spatialManager = spatialManager;
    this.activeMovements = new Map();
    this.moveSpeed = CONFIG.MOVEMENT.BASE_MOVE_SPEED + CONFIG.MOVEMENT.BIKE_SPEED;
    this.holdDelay = CONFIG.MOVEMENT.HOLD_DELAY;
  }

  /**
   * Validates if a move is possible considering collisions
   * @returns {boolean} Whether move is valid
   */
  validateIfMoveIsPossibleConsideringCollisions(darlingTryingToMove, desiredPosition) {
    if (darlingTryingToMove.behavior?.ignoreCollisions) {
      return true;
    }
    // Temporarily move entity to check position
    const tempPosition = darlingTryingToMove.position;
    darlingTryingToMove.position = desiredPosition;

    const nearby = this.spatialManager.grid.getNearbyDarlings(
      desiredPosition,
      Math.max(darlingTryingToMove.width, darlingTryingToMove.height) * CONFIG.COLLISION.NEARBY_ENTITY_RADIUS
    );

    let isValid = true;
    for (const other of nearby) {
      // Always allow moving past bike
      if (other.type === DarlingType.BIKE) {
        continue;
      }

      if (
        other !== darlingTryingToMove &&
        !other.behavior?.ignoreCollisions &&
        this.spatialManager.collisionManager.checkCollision(darlingTryingToMove.getHitbox(), other.getHitbox())
      ) {
        isValid = false;
        break;
      }
    }
    // Restore original position
    darlingTryingToMove.position = tempPosition;
    return isValid;
  }
  /**
   * Main update loop for processing all active movements
   */
  update() {
    for (const [entity, plan] of this.activeMovements) {
      this.updateMovementPlan(entity, plan);
    }
  }
  /**
   * Updates an individual entity's movement plan
   * Handles path following and recalculation if blocked
   */
  updateMovementPlan(entity, plan) {
    if (plan.path.length === 0) {
      this.activeMovements.delete(entity);
      return;
    }

    const nextPosition = plan.path[0];
    if (this.spatialManager.validateIfEntityCanMoveToNewPos(entity, nextPosition)) {
      entity.position = nextPosition;
      plan.path.shift();
    } else {
      // Recalculate path if current path is blocked
      this.planMovement(entity, plan.path[plan.path.length - 1]);
    }
  }

  planMovement(entity, destination) {
    // Simple direct path for now - could be expanded to A* pathfinding
    const path = [destination];
    const plan = {
      entity,
      path,
      status: "active",
      priority: this.calculatePriority(entity),
    };

    this.activeMovements.set(entity, plan);
    return plan;
  }

  calculatePriority(entity) {
    // These priorities could be moved to CONFIG
    const priorities = {
      [DarlingType.TTC]: CONFIG.MOVEMENT.PRIORITIES.TTC || 10,
      [DarlingType.BIKE]: CONFIG.MOVEMENT.PRIORITIES.BIKE || 9,
      [DarlingType.TTC_LANE_DEATHMACHINE]: CONFIG.MOVEMENT.PRIORITIES.TTC_LANE_DEATHMACHINE || 8,
      [DarlingType.ONCOMING_DEATHMACHINE]: CONFIG.MOVEMENT.PRIORITIES.ONCOMING_DEATHMACHINE || 7,
      [DarlingType.PARKED_DEATHMACHINE]: CONFIG.MOVEMENT.PRIORITIES.PARKED_DEATHMACHINE || 6,
      [DarlingType.WANDERER]: CONFIG.MOVEMENT.PRIORITIES.WANDERER || 5,
      [DarlingType.BUILDING]: CONFIG.MOVEMENT.PRIORITIES.BUILDING || 0,
    };

    return priorities[entity.type] || CONFIG.MOVEMENT.PRIORITIES.DEFAULT || 0;
  }

  moveEntity(entity, newPos) {
    if (this.validateIfMoveIsPossibleConsideringCollisions(entity, newPos)) {
      const oldPos = entity.position;
      entity.position = newPos;

      // Update grid position if needed
      if (this.spatialManager.grid) {
        this.spatialManager.grid.updateDarlingsPositionInGridSystem(entity, oldPos, newPos);
      }

      return true;
    }
    return false;
  }

  cancelMovement(entity) {
    this.activeMovements.delete(entity);
  }

  clearAllMovements() {
    this.activeMovements.clear();
  }
}

// =========================================
// SpawnManager -  Management
// =========================================
/**
 *  handles the creation and placement of new entities in the game
 * Manages spawn rules, spacing, and timing for different entity types
 */

class SpawnManager {
  constructor(spatialManager, config) {
    if (!spatialManager || !config) {
      throw new SpawnError("SpatialManager and config are required");
    }
    this.spatialManager = spatialManager;
    this.config = config;
    this.wandererDebugLog = false; // Set to true to debug wanderer spawning
    this.errorLog = [];
    try {
      this.spawnRules = this.createSpawnConfigRulesForAllDarlingTypes();
    } catch (error) {
      this.logError(error, "constructor");
      this.spawnRules = new Map();
    }
  }

  /**
   * Creates spawn configuration rules for all entity types
   * Defines spacing, positioning, and lane rules
   * @returns {Map} Map of entity types to their spawn rules
   */

  createSpawnConfigRulesForAllDarlingTypes() {
    try {
      if (!this.config.SAFE_DISTANCE || !this.config.LANES || !this.config.GAME) {
        throw new SpawnError("Invalid config structure", { config: this.config });
      }

      return new Map([
        [
          DarlingType.TTC,
          {
            baseSpacing: this.config.SAFE_DISTANCE.TTC,
            randomSpacingRange: {
              min: Math.floor(this.config.SAFE_DISTANCE.TTC * 0.3),
              max: Math.floor(this.config.SAFE_DISTANCE.TTC * 0.8),
            },
            laneRules: {
              allowedLanes: [this.config.LANES.TRACKS],
              spawnPosition: {
                x: this.config.LANES.TRACKS,
                y: this.config.GAME.HEIGHT + 5,
              },
              direction: -1,
            },
          },
        ],
        [
          DarlingType.TTC_LANE_DEATHMACHINE,
          {
            baseSpacing: this.config.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE,
            randomSpacingRange: {
              min: Math.floor(this.config.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE * 0.3),
              max: Math.floor(this.config.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE * 0.8),
            },
            laneRules: {
              allowedLanes: [this.config.LANES.TRACKS + 1],
              spawnPosition: {
                x: this.config.LANES.TRACKS + 1,
                y: this.config.GAME.HEIGHT + 1,
              },
              direction: -1,
            },
          },
        ],
        [
          DarlingType.ONCOMING_DEATHMACHINE,
          {
            baseSpacing: this.config.SAFE_DISTANCE.ONCOMING_DEATHMACHINE,
            randomSpacingRange: {
              min: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_DEATHMACHINE * 0.3),
              max: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_DEATHMACHINE * 0.8),
            },
            laneRules: {
              allowedLanes: [this.config.LANES.ONCOMING],
              spawnPosition: {
                x: this.config.LANES.ONCOMING,
                y: -10,
              },
              direction: 1,
            },
          },
        ],
        [
          DarlingType.PARKED_DEATHMACHINE,
          {
            baseSpacing: this.config.SAFE_DISTANCE.PARKED,
            randomSpacingRange: {
              min: 0,
              max: 1,
            },
            laneRules: {
              allowedLanes: [this.config.LANES.PARKED],
              spawnPosition: {
                x: this.config.LANES.PARKED,
                y: -10,
              },
              direction: 1,
            },
          },
        ],
        [
          DarlingType.WANDERER,
          {
            baseSpacing: this.config.SAFE_DISTANCE.WANDERER,
            randomSpacingRange: {
              min: Math.floor(this.config.SAFE_DISTANCE.WANDERER * 0.3),
              max: Math.floor(this.config.SAFE_DISTANCE.WANDERER * 0.8),
            },
            laneRules: {
              allowedLanes: [this.config.LANES.SIDEWALK, this.config.LANES.SIDEWALK + 3],
              spawnPosition: {
                x: this.config.LANES.SIDEWALK,
                y: -1,
              },
              direction: 1,
            },
          },
        ],
        [
          DarlingType.BUILDING,
          {
            baseSpacing: this.config.SAFE_DISTANCE.BUILDING,
            randomSpacingRange: {
              min: 0,
              max: 1,
            },
            laneRules: {
              allowedLanes: [this.config.LANES.BUILDINGS],
              spawnPosition: {
                x: this.config.LANES.BUILDINGS,
                y: -10,
              },
              direction: 1, //doesn't seem to matter
            },
          },
        ],
      ]);
    } catch (error) {
      this.logError(error, "createSpawnConfigRulesForAllDarlingTypes");
      return new Map();
    }
  }

  /**
   * Determines required spacing between different entity types
   * Handles special cases like TTC-to-TTC spacing
   */
  getRequiredSpacingBetweenDifferentDarlingTypes(entityTypeA, entityTypeB) {
    try {
      // Special cases first
      if (entityTypeA === DarlingType.PARKED_DEATHMACHINE && entityTypeB === DarlingType.PARKED_DEATHMACHINE) {
        // Use a fixed spacing value for parked vehicles
        return this.config.SAFE_DISTANCE.PARKED;
      }

      const baseDistance = this.config.SAFE_DISTANCE[entityTypeA] || this.config.SAFE_DISTANCE.DEFAULT;

      if (typeof baseDistance !== "number") {
        throw new SpawnError("Invalid base distance", { baseDistance });
      }

      return baseDistance * (entityTypeA === entityTypeB ? 1.5 : 1);
    } catch (error) {
      // Error handling
      return this.config.SAFE_DISTANCE.DEFAULT || 1; // Safe fallback
    }

    try {
      if (!entityTypeA || !entityTypeB) {
        throw new SpawnError("Invalid entity types for spacing calculation", {
          entityTypeA,
          entityTypeB,
        });
      }

      // Special cases first
      if (entityTypeA === DarlingType.TTC && entityTypeB === DarlingType.TTC) {
        if (!this.config.SAFE_DISTANCE.TTC_TO_TTC) {
          throw new SpawnError("Missing TTC_TO_TTC safe distance configuration");
        }
        return this.config.SAFE_DISTANCE.TTC_TO_TTC;
      }

      if (
        entityTypeA === DarlingType.TTC &&
        (entityTypeB === DarlingType.TTC_LANE_DEATHMACHINE || entityTypeB === DarlingType.ONCOMING_DEATHMACHINE)
      ) {
        if (!this.config.SAFE_DISTANCE.TTC_TO_DEATHMACHINE) {
          throw new SpawnError("Missing TTC_TO_DEATHMACHINE safe distance configuration");
        }
        return this.config.SAFE_DISTANCE.TTC_TO_DEATHMACHINE;
      }

      const baseDistance = this.config.SAFE_DISTANCE[entityTypeA] || this.config.SAFE_DISTANCE.DEFAULT;

      if (typeof baseDistance !== "number") {
        throw new SpawnError("Invalid base distance", { baseDistance });
      }

      return baseDistance * (entityTypeA === entityTypeB ? 1.5 : 1);
    } catch (error) {
      this.logError(error, "getRequiredSpacingBetweenDifferentDarlingTypes");
      return this.config.SAFE_DISTANCE.DEFAULT || 5; // Safe fallback
    }
  }

  /**
   * Validates if an entity can be spawned at a specific position
   * Checks lane rules and spacing requirements
   */
  canDarlingSpawnAtThisSpecificPos(darlingType, position) {
    try {
      if (!darlingType || !position) {
        throw new SpawnError("Invalid parameters", { darlingType, position });
      }

      const rules = this.spawnRules.get(darlingType);
      if (!rules) {
        throw new SpawnError("No spawn rules found for entity type", { darlingType });
      }

      // Check if lane is allowed
      const isLaneAllowed = rules.laneRules.allowedLanes.includes(Math.floor(position.x));
      if (!isLaneAllowed) {
        return false;
      }

      if (!this.spatialManager.darlings) {
        throw new SpawnError("Invalid spatial manager state");
      }

      // Check nearby darlings for spacing
      try {
        const nearbyDarlings = Array.from(this.spatialManager.darlings).filter((entity) => {
          if (!entity?.position) {
            throw new SpawnError("Entity missing position", { entityId: entity?.id });
          }

          const xDistance = Math.abs(entity.position.x - position.x);
          const yDistance = Math.abs(entity.position.y - position.y);

          if (yDistance > 30) return false;

          // Special TTC proximity check
          if (darlingType === DarlingType.TTC || entity.type === DarlingType.TTC) {
            return xDistance <= 2;
          }
          return xDistance <= 1;
        });

        // Check spacing requirements
        const hasEnoughSpace = nearbyDarlings.every((entity) => {
          const distance = Math.abs(entity.position.y - position.y);
          const requiredSpacing = this.getRequiredSpacingBetweenDifferentDarlingTypes(darlingType, entity.type);
          return distance >= requiredSpacing;
        });

        return isLaneAllowed && hasEnoughSpace;
      } catch (error) {
        this.logError(error, "canDarlingSpawnAtThisSpecificPos.nearbyCheck");
        return false;
      }
    } catch (error) {
      this.logError(error, "canDarlingSpawnAtThisSpecificPos");
      return false;
    }
  }
  spawnEntity(entityType) {
    try {
      if (!entityType) {
        throw new SpawnError("Entity type is required");
      }

      if (entityType === DarlingType.ONCOMING_DEATHMACHINE) {
        const spawnConfig = this.getSpawnConfig(entityType);
        if (!spawnConfig) {
          return null;
        }

        if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
          return new OncomingDeathmachine(this.config, spawnConfig);
        }
        return null;
      }

      if (entityType === DarlingType.WANDERER) {
        try {
          const isGoingUp = Math.random() < 0.5;
          // if (this.wandererDebugLog) console.log(`Spawning wanderer going ${isGoingUp ? "up" : "down"}`);

          const spawnConfig = {
            position: new Position(
              isGoingUp ? this.config.LANES.SIDEWALK + 3 : this.config.LANES.SIDEWALK,
              isGoingUp ? this.config.GAME.HEIGHT + 1 : -1
            ),
          };

          if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
            if (this.wandererDebugLog) console.log(`Spawning wanderer at position:`, spawnConfig.position);
            return new Wanderer(this.config, spawnConfig, isGoingUp);
          }
          // if (this.wandererDebugLog) console.log(`Failed to spawn wanderer - position occupied`);
          return null;
        } catch (error) {
          this.logError(
            new SpawnError("Error spawning wanderer", {
              originalError: error,
            }),
            "spawnEntity"
          );
          return null;
        }
      }

      // Handle other entity types
      const spawnConfig = this.getSpawnConfig(entityType);
      if (!spawnConfig) {
        if (this.wandererDebugLog) console.log(`No spawn config for ${entityType}`);
        return null;
      }

      if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
        const EntityClass = this.getEntityClass(entityType);
        if (EntityClass) {
          return new EntityClass(this.config, spawnConfig);
        }
      }

      return null;
    } catch (error) {
      this.logError(error, "spawnEntity");
      return null;
    }
  }

  getSpawnConfig(entityType) {
    try {
      if (!entityType) {
        throw new SpawnError("Entity type is required");
      }

      const rules = this.spawnRules.get(entityType);
      if (!rules) {
        throw new SpawnError("No spawn rules found", { entityType });
      }

      if (!rules.laneRules?.spawnPosition) {
        throw new SpawnError("Invalid spawn rules structure", { rules });
      }

      return {
        position: new Position(rules.laneRules.spawnPosition.x, rules.laneRules.spawnPosition.y),
        direction: rules.laneRules.direction,
      };
    } catch (error) {
      this.logError(error, "getSpawnConfig");
      return null;
    }
  }
  getEntityClass(entityType) {
    try {
      if (!entityType) {
        throw new SpawnError("Entity type is required");
      }

      const entityClasses = {
        [DarlingType.TTC]: TTC,
        [DarlingType.TTC_LANE_DEATHMACHINE]: TTCLaneDeathmachine,
        [DarlingType.ONCOMING_DEATHMACHINE]: OncomingDeathmachine,
        [DarlingType.PARKED_DEATHMACHINE]: ParkedDeathmachine,
        [DarlingType.WANDERER]: Wanderer,
        [DarlingType.BUILDING]: Building,
      };

      const EntityClass = entityClasses[entityType];
      if (!EntityClass) {
        throw new SpawnError("Invalid entity type", { entityType });
      }

      return EntityClass;
    } catch (error) {
      this.logError(error, "getEntityClass");
      return null;
    }
  }
}

// =========================================
// VehicleClusterManager
// =========================================

class VehicleClusterManager {
  constructor(config) {
    this.config = config;
    this.clusters = new Map();

    // Initialize cluster settings for each vehicle type
    [DarlingType.TTC_LANE_DEATHMACHINE, DarlingType.ONCOMING_DEATHMACHINE, DarlingType.PARKED_DEATHMACHINE].forEach((type) => {
      this.clusters.set(type, {
        active: false,
        vehiclesSpawned: 0,
        targetSize: 0,
        gapTimer: 0,
      });
    });

    // Cluster configuration
    this.clusterConfig = {
      chanceToStartCluster: 0.2, // 20% chance to start a new cluster
      minVehiclesInCluster: 2,
      maxVehiclesInCluster: 4,
      minGapAfterCluster: 15, // Minimum frames to wait after cluster
      maxGapAfterCluster: 25, // Maximum frames to wait after cluster
      clusterSpawnMultiplier: 2, // Multiply base spawn rate during clusters
    };
  }

  shouldSpawnVehicle(entityType, baseSpawnRate) {
    const cluster = this.clusters.get(entityType);
    if (!cluster) return Math.random() < baseSpawnRate;

    // Handle gap after cluster
    if (cluster.gapTimer > 0) {
      cluster.gapTimer--;
      return false;
    }

    // Maybe start a new cluster
    if (!cluster.active && Math.random() < this.clusterConfig.chanceToStartCluster) {
      this.startNewCluster(entityType);
    }

    // Use adjusted spawn rate during active cluster
    const effectiveRate = cluster.active ? baseSpawnRate * this.clusterConfig.clusterSpawnMultiplier : baseSpawnRate;

    const shouldSpawn = Math.random() < effectiveRate;

    if (shouldSpawn && cluster.active) {
      cluster.vehiclesSpawned++;

      // Check if cluster is complete
      if (cluster.vehiclesSpawned >= cluster.targetSize) {
        this.endCluster(entityType);
      }
    }

    return shouldSpawn;
  }

  startNewCluster(entityType) {
    const cluster = this.clusters.get(entityType);
    if (!cluster) return;

    cluster.active = true;
    cluster.vehiclesSpawned = 0;
    cluster.targetSize =
      this.clusterConfig.minVehiclesInCluster +
      Math.floor(Math.random() * (this.clusterConfig.maxVehiclesInCluster - this.clusterConfig.minVehiclesInCluster + 1));

    // Optional: Log cluster start
    // console.log(`Starting cluster for ${entityType}:`, {
    //   targetSize: cluster.targetSize,
    //   spawnMultiplier: this.clusterConfig.clusterSpawnMultiplier,
    // });
  }

  endCluster(entityType) {
    const cluster = this.clusters.get(entityType);
    if (!cluster) return;

    cluster.active = false;
    cluster.vehiclesSpawned = 0;
    cluster.targetSize = 0;
    // Set random gap timer
    cluster.gapTimer =
      this.clusterConfig.minGapAfterCluster +
      Math.floor(Math.random() * (this.clusterConfig.maxGapAfterCluster - this.clusterConfig.minGapAfterCluster));

    // Optional: Log cluster end
    // console.log(`Ending cluster for ${entityType}, gap timer:`, cluster.gapTimer);
  }

  isClusterActive(entityType) {
    return this.clusters.get(entityType)?.active || false;
  }

  getClusterInfo(entityType) {
    return this.clusters.get(entityType);
  }

  cleanup() {
    this.clusters.clear();
    // Re-initialize clusters
    [DarlingType.TTC, DarlingType.TTC_LANE_DEATHMACHINE, DarlingType.ONCOMING_DEATHMACHINE, DarlingType.PARKED_DEATHMACHINE].forEach((type) => {
      this.clusters.set(type, {
        active: false,
        vehiclesSpawned: 0,
        targetSize: 0,
        gapTimer: 0,
      });
    });
  }
}

// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================

// =========================================
// EntityBehavior
// =========================================

class EntityBehavior {
  constructor(entity) {
    this.entity = entity;
    this.canMove = true;
  }

  update() {
    // Base update logic - implemented by child classes
  }

  onCollision(other) {
    // Base collision handling - implemented by child classes
  }

  canMoveTo(position) {
    if (!this.entity.spatialManager) {
      console.warn("Entity has no spatial manager:", this.entity);
      return false;
    }
    return this.entity.spatialManager.validateIfEntityCanMoveToNewPos(this.entity, position);
  }

  move(newPosition) {
    if (this.canMoveTo(newPosition)) {
      const oldPosition = this.entity.position;
      this.entity.position = newPosition;

      // Update grid position if spatial manager exists
      if (this.entity.spatialManager?.grid) {
        this.entity.spatialManager.grid.updateDarlingsPositionInGridSystem(this.entity, oldPosition, newPosition);
      }

      return true;
    }
    return false;
  }

  validateMovement(position) {
    // Base movement validation
    if (!this.canMove) return false;
    if (!position) return false;

    // Check boundaries if config exists
    if (this.entity.config) {
      if (position.x < 0 || position.x >= this.entity.config.GAME.WIDTH) return false;
      if (position.y < -10 || position.y >= this.entity.config.GAME.HEIGHT + 10) return false;
    }

    return true;
  }

  getState() {
    return {
      position: this.entity.position,
      canMove: this.canMove,
      type: this.entity.type,
    };
  }
}

// =========================================
// BuildingBehavior
// =========================================

class BuildingBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    // this.speed = CONFIG.MOVEMENT.BASE_MOVE_SPEED;
  }

  update() {
    // Move the building downwards by the speed value
    this.entity.position.y += CONFIG.MOVEMENT.BASE_MOVE_SPEED;

    // If the building has reached the bottom of the screen
    if (this.entity.position.y >= this.entity.config.GAME.HEIGHT) {
      // Get all other buildings sorted by their Y position
      const buildings = Array.from(this.entity.spatialManager.darlings)
        .filter((e) => e.type === DarlingType.BUILDING && e !== this.entity)
        .sort((a, b) => a.position.y - b.position.y);

      // Reset the building index if it has reached the end of the available buildings
      if (Building.buildingIndex >= Building.availableBuildings.length) {
        Building.buildingIndex = 0;
      }

      // Get the next available building to place
      const nextAvailableBuilding = Building.availableBuildings[Building.buildingIndex];
      const newBuildingHeight = nextAvailableBuilding.art.length;

      // Calculate the new Y position for the building
      let newY =
        buildings.length === 0
          ? this.entity.config.SPAWNING.MIN_BUILDING_HEIGHT
          : buildings[0].position.y - newBuildingHeight - CONFIG.SAFE_DISTANCE.BUILDING;

      // Validate the new position
      if (this.validatePosition(newY, newBuildingHeight, buildings)) {
        // If the position is valid, update the building's properties
        this.updateBuildingProperties(newY, nextAvailableBuilding, newBuildingHeight);
      } else {
        // If the position is not valid, find a valid position
        this.findValidPosition(newY, newBuildingHeight, nextAvailableBuilding, buildings);
      }
    }
  }

  updateBuildingProperties(newY, newBuilding, newHeight) {
    // Log the updated building properties
    // console.log(`[BuildingBehavior] Updating building properties:`, {
    //   name: newBuilding.name,
    //   y: newY,
    //   height: newHeight,
    // });

    // Update the building's properties
    this.entity.position.y = newY;
    this.entity.art = newBuilding.art;
    this.entity.height = newHeight;
    this.entity.name = newBuilding.name;
    // Increment the building index
    Building.buildingIndex++;
  }

  findValidPosition(startY, height, newBuilding, buildings) {
    let newY = startY;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    // Attempt to find a valid position for the new building
    while (!this.validatePosition(newY, height, buildings) && attempts < MAX_ATTEMPTS) {
      newY -= this.minSpacing;
      attempts++;
      console.log(`[BuildingBehavior] Attempt ${attempts}: Trying Y=${newY}`);
    }

    // If a valid position is found
    if (attempts < MAX_ATTEMPTS) {
      console.log(`[BuildingBehavior] Found valid position after ${attempts} attempts`);
      // Update the building's properties with the new position
      this.updateBuildingProperties(newY, newBuilding, height);
    } else {
      // If no valid position is found after the maximum attempts
      console.warn(`[BuildingBehavior] Failed to find valid position after ${MAX_ATTEMPTS} attempts`);
    }
  }

  validatePosition(y, height, existingBuildings) {
    // Check if the Y position is a valid number
    if (typeof y !== "number" || isNaN(y)) {
      console.error("[BuildingBehavior] Invalid Y position:", y);
      return false;
    }

    // Check if the new building's position overlaps with any existing buildings
    const isValid = !existingBuildings.some((building) => {
      const topOverlap = y < building.position.y + building.height + this.minSpacing;
      const bottomOverlap = y + height + this.minSpacing > building.position.y;
      const sameColumn = Math.abs(building.position.x - this.entity.config.LANES.BUILDINGS) < 0.1;

      // If the new building overlaps with an existing building in the same column, return true to indicate an invalid position
      if (sameColumn && topOverlap && bottomOverlap) {
        console.log(`[BuildingBehavior] Collision detected with "${building.name}" at Y=${building.position.y}`);
        return true;
      }
      return false;
    });

    // Log the validation result
    // console.log(`[BuildingBehavior] Position validation result:`, {
    //   y,
    //   height,
    //   isValid,
    // });

    return isValid;
  }
}
// =========================================
// VehicleBehaviorBase
// =========================================

class VehicleBehaviorBase extends EntityBehavior {
  constructor(entity, options = {}) {
    super(entity);
    this.baseSpeed = options.baseSpeed || CONFIG.MOVEMENT.BASE_MOVE_SPEED;
    // Remove hardcoded value, use config or default
    this.minDistance = options.minDistance || this.entity.config.SAFE_DISTANCE.DEFAULT;
    this.stopped = false;
    this.ignoreCollisions = options.ignoreCollisions || false;
    this.hasAnimation = options.hasAnimation || false;
  }

  update() {
    if (this.stopped) {
      return;
    }

    if (this.shouldMove()) {
      const newPosition = this.calculateNewPosition();
      if (this.canMoveTo(newPosition)) {
        this.move(newPosition);
      } else {
        this.handleMovementBlocked();
      }
    }

    if (this.hasAnimation) {
      this.updateAnimation();
    }
  }

  shouldMove() {
    return !this.stopped;
  }

  calculateNewPosition() {
    return new Position(this.entity.position.x, this.entity.position.y + this.baseSpeed);
  }

  handleMovementBlocked() {
    console.log(`yo movment blocked`);

    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 1000);
  }

  getNearbyDarlings() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid
      .getNearbyDarlings(this.entity.position, Math.max(this.entity.width, this.entity.height) * 2)
      .filter((entity) => entity !== this.entity && entity.type !== DarlingType.BIKE && Math.abs(entity.position.x - this.entity.position.x) < 2);
  }

  updateAnimation() {
    // Override in child classes that need animation
  }
}
// =========================================
// WandererBehavior
// =========================================

// =========================================
// BikeBehavior
// =========================================

class BikeBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
  }
}
// =========================================
// ParkedDeathmachineBehavior
// =========================================

// In ParkedDeathmachineBehavior class
class ParkedDeathmachineBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: CONFIG.MOVEMENT.BASE_MOVE_SPEED + CONFIG.MOVEMENT.BIKE_SPEED,
      minDistance: entity.config.SAFE_DISTANCE.PARKED,
      ignoreCollisions: false,
      hasAnimation: true,
    });

    this.lastPosition = { ...entity.position }; // Track last position
    this.stuckFrames = 0; // Track how long it's been stuck

    this.doorState = DOOR_STATES.CLOSED;
    this.doorTimer = 0;
    this.doorHitbox = null;
    this.doorAnimationActive = false;
    this.lastDoorUpdate = Date.now();
    this.doorOpenDelay = entity.config.ANIMATIONS.DOOR_OPEN_DELAY;

    const targetPercentage =
      entity.config.SPAWNING.PARKED_DEATHMACHINE_MIN_Y +
      Math.random() * (entity.config.SPAWNING.PARKED_DEATHMACHINE_MAX_Y - entity.config.SPAWNING.PARKED_DEATHMACHINE_MIN_Y);
    this.doorOpenY = Math.floor(this.entity.config.GAME.HEIGHT * targetPercentage);
    this.shouldOpenDoor = Math.random() < entity.config.SPAWNING.PARKED_DEATHMACHINE_DOOR_CHANCE;

    // this.shouldOpenDoor = false;

    // console.log(`[ParkedDM] Created:`, {
    //   id: entity.id,
    //   position: { x: entity.position.x, y: entity.position.y },
    //   baseSpeed: this.baseSpeed,
    //   dimensions: { width: entity.width, height: entity.height },
    // });
  }

  // update() {
  //   // Track movement
  //   const hasntMoved = this.entity.position.x === this.lastPosition.x && this.entity.position.y === this.lastPosition.y;

  //   if (hasntMoved) {
  //     this.stuckFrames++;
  //     if (this.stuckFrames % 60 === 0) {
  //       // Log every second
  //       console.log(`[ParkedDM] STUCK for ${this.stuckFrames} frames:`, {
  //         id: this.entity.id,
  //         position: { x: this.entity.position.x, y: this.entity.position.y },
  //         stopped: this.stopped,
  //         baseSpeed: this.baseSpeed,
  //         nearbyVehicles: this.getNearbyVehicles(),
  //       });
  //     }
  //   } else {
  //     this.stuckFrames = 0;
  //   }

  //   // Regular movement handling
  //   if (this.stopped) {
  //     console.log(`[ParkedDM] Stopped state:`, {
  //       id: this.entity.id,
  //       position: { x: this.entity.position.x, y: this.entity.position.y },
  //       stuckFrames: this.stuckFrames,
  //     });
  //   } else {
  //     super.update();
  //   }

  //   // Track position for next frame
  //   this.lastPosition = { ...this.entity.position };

  //   // Animation update
  //   if (this.hasAnimation) {
  //     this.updateAnimation();
  //   }
  // }

  updateAnimation() {
    if (
      this.shouldOpenDoor &&
      !this.doorAnimationActive &&
      this.entity.position.y >= this.doorOpenY &&
      this.entity.position.y <= this.doorOpenY + 2
    ) {
      this.doorAnimationActive = true;
      this.updateDoorState();
    }

    if (
      this.doorAnimationActive &&
      this.doorState < DARLINGS.PARKED_DEATHMACHINE_STATES.length - 1 &&
      Date.now() - this.lastDoorUpdate > this.doorOpenDelay
    ) {
      this.updateDoorState();
    }

    this.updateDoorHitbox();
  }

  updateDoorState() {
    this.doorState++;
    this.lastDoorUpdate = Date.now();
    this.entity.art = DARLINGS.PARKED_DEATHMACHINE_STATES[this.doorState];

    // Add door-opening animation class when door is opening
    if (this.doorState > 0) {
      this.entity.animationClass = "parked-car door-opening animated";
    } else {
      this.entity.animationClass = "parked-car animated";
    }

    const doorWidths = [0, 0.8, 1, 1.5, 1.8];
    const doorWidth = doorWidths[this.doorState];
    const hitboxHeight = this.doorState === DARLINGS.PARKED_DEATHMACHINE_STATES.length - 1 ? 0.8 : 1.8;

    this.doorHitbox = {
      x: this.entity.position.x,
      y: this.entity.position.y + 1,
      width: doorWidth,
      height: hitboxHeight,
    };
  }

  updateDoorHitbox() {
    // console.log("yoooo");

    if (this.doorHitbox) {
      this.doorHitbox.y = this.entity.position.y + 1;
    }
  }

  onCollision(other) {
    if (other.type === EntityType.BIKE) {
      return;
    }

    // Parked cars don't move on collision, they just block
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 500);
  }

  getNearbyVehicles() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid
      .getNearbyDarlings(this.entity.position, 5)
      .filter((entity) => entity !== this.entity)
      .map((entity) => ({
        type: entity.type,
        position: { x: entity.position.x, y: entity.position.y },
        distance: Math.abs(entity.position.y - this.entity.position.y),
      }));
  }

  handleMovementBlocked() {
    // console.log(`yo [ParkedDM] Movement blocked:`, {
    //   id: this.entity.id,
    //   position: { x: this.entity.position.x, y: this.entity.position.y },
    //   nearbyVehicles: this.getNearbyVehicles(),
    // });
    super.handleMovementBlocked();
  }
}

class TTCBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -CONFIG.MOVEMENT.BASE_MOVE_SPEED,
      minDistance: entity.config.SAFE_DISTANCE.TTC,
      ignoreCollisions: false,
    });
    this.config = entity.config;
    this.stuckTimer = 0;
    this.lastPosition = null;
    this.isAtStop = false;
    this.stopTimer = 0;
    this.nextStopTime = this.getRandomStopTime();
    this.wanderersSpawnedAtStop = false;
    this.soundManager = null; // Will be set when entity receives soundManager
  }

  update() {
    // Handle stopping logic first
    if (!this.isAtStop) {
      this.nextStopTime--;
      if (this.nextStopTime <= 0) {
        this.isAtStop = true;
        this.stopTimer = this.getRandomStopDuration();
        this.wanderersSpawnedAtStop = false; // Reset flag when starting new stop
        console.log("TTC stopping at:", this.entity.position);

        // Play stop sound
        if (this.soundManager) {
          // this.soundManager.play("ttcStop");
          setTimeout(() => {
            // this.soundManager.play("ttcBell");
          }, 500);
        }
      }
    }

    if (this.isAtStop) {
      if (!this.wanderersSpawnedAtStop) {
        console.log("Attempting to spawn wanderers at TTC stop");
        this.spawnWanderers();
      }

      this.stopTimer--;
      if (this.stopTimer <= 0) {
        this.isAtStop = false;
        this.nextStopTime = this.getRandomStopTime();

        // Play start sound
        // if (this.soundManager) {
        //   this.soundManager.play("ttcStart");
        // }

        console.log("TTC resuming movement");
        return;
      }
      return; // Stay stopped
    }

    // Handle regular movement
    if (!this.stopped && this.shouldMove()) {
      const newPosition = this.calculateNewPosition();
      if (this.canMoveTo(newPosition)) {
        this.move(newPosition);
      } else {
        this.handleMovementBlocked();
      }
    }
  }

  spawnWanderers() {
    if (this.wanderersSpawnedAtStop) return;

    const spatialManager = this.entity.spatialManager;
    if (!spatialManager) return;

    // Only spawn one wanderer at first
    const ttcWidth = 8;
    const spawnX = this.entity.position.x + ttcWidth;
    this.spawnCount = 0;
    this.maxWanderers = Math.floor(Math.random() * 2) + 1;
    this.spawnNextWanderer(spawnX, this.entity.position.y, spatialManager);

    this.wanderersSpawnedAtStop = true;
  }

  spawnNextWanderer(baseX, baseY, spatialManager) {
    const offset = this.spawnCount;
    const spawnPosition = new Position(baseX + offset, baseY);

    const wanderer = new Wanderer(this.config, { position: spawnPosition }, null, true);

    wanderer.behavior = new CrossingBehavior(wanderer);
    spatialManager.addEntityToSpatialManagementSystem(wanderer);

    this.spawnCount++;

    if (this.spawnCount < this.maxWanderers) {
      setTimeout(() => this.spawnNextWanderer(baseX, baseY, spatialManager), 500);
    }
  }

  getRandomStopTime() {
    const level = this.entity.config.TTC.DIFFICULTY_LEVELS.HARD;
    const min = level.STOP_INTERVAL_MIN;
    const max = level.STOP_INTERVAL_MAX;
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    return time;
  }

  getRandomStopDuration() {
    const level = this.entity.config.TTC.DIFFICULTY_LEVELS.HARD;
    const min = level.STOP_DURATION_MIN;
    const max = level.STOP_DURATION_MAX;
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    return duration;
  }

  shouldMove() {
    if (this.stopped) return false;

    const nearbyDarlings = this.getNearbyDarlings();
    const shouldStop = this.shouldStop(nearbyDarlings);

    if (this.lastPosition && this.lastPosition.y === this.entity.position.y) {
      this.stuckTimer++;
      if (this.stuckTimer > 120) {
        this.stopped = false;
        this.stuckTimer = 0;
        return true;
      }
    } else {
      this.stuckTimer = 0;
    }

    this.lastPosition = { ...this.entity.position };
    return !shouldStop;
  }

  shouldStop(nearbyDarlings) {
    return nearbyDarlings.some((other) => Math.abs(other.position.y - this.entity.position.y) < this.minDistance);
  }

  handleMovementBlocked() {
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 1000);
  }
}
class CrossingBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.state = "WAITING_TO_CROSS";
    this.targetX = CONFIG.LANES.SIDEWALK + 1;
    this.moveSpeed = CONFIG.MOVEMENT.WANDERER_SPEED * 2;
    this.baseSpeed = CONFIG.MOVEMENT.WANDERER_SPEED;
    this.waitTime = 0;
    this.minWaitTime = 1;
    this.mergeAttempts = 0;
    this.maxMergeAttempts = 2;
    this.lastCheckedOverlap = 0;
  }

  update() {
    // Check for overlaps periodically
    if (Date.now() - this.lastCheckedOverlap > 100) {
      this.checkAndResolveOverlaps();
      this.lastCheckedOverlap = Date.now();
    }

    switch (this.state) {
      case "WAITING_TO_CROSS":
        if (this.isSafeToCross()) {
          this.state = "CROSSING";
        } else {
          // Still move forward while waiting
          const newY = this.entity.position.y + this.baseSpeed;
          const waitPosition = new Position(this.entity.position.x, newY);
          if (this.canMoveTo(waitPosition)) {
            this.move(waitPosition);
          }
        }
        break;

      case "CROSSING":
        if (!this.isSafeToCross()) {
          this.state = "WAITING_TO_CROSS";
          this.waitTime = this.minWaitTime;
          break;
        }

        // Calculate next position
        const newX = Math.min(this.entity.position.x + this.moveSpeed, this.targetX);
        const newY = this.entity.position.y + this.baseSpeed;
        const newPosition = new Position(newX, newY);

        // Check if we've reached the target X position
        if (Math.abs(newX - this.targetX) < 0.1) {
          if (this.canSafelyMerge()) {
            this.convertToRegularWanderer();
          } else {
            this.handleBlockedMerge();
          }
        } else {
          // Try to move diagonally
          if (this.canMoveTo(newPosition)) {
            this.move(newPosition);
          } else {
            // If diagonal movement is blocked, try just moving forward
            const forwardPosition = new Position(this.entity.position.x, newY);
            if (this.canMoveTo(forwardPosition)) {
              this.move(forwardPosition);
            }
          }
        }
        break;
    }

    if (this.waitTime > 0) this.waitTime--;
  }

  canMoveTo(position) {
    if (!this.entity.spatialManager) return false;

    const proposedHitbox = {
      x: position.x,
      y: position.y,
      width: this.entity.width,
      height: this.entity.height,
    };

    const nearbyEntities = this.entity.spatialManager.grid
      .getNearbyDarlings(position, 3)
      .filter((entity) => entity !== this.entity && (entity.type === DarlingType.WANDERER || entity.type === DarlingType.PARKED_DEATHMACHINE));

    return !nearbyEntities.some((other) => {
      if (other.type === DarlingType.WANDERER) {
        return Math.abs(other.position.x - position.x) < 0.5 && Math.abs(other.position.y - position.y) < 2;
      }

      if (other.type === DarlingType.PARKED_DEATHMACHINE) {
        const carHitbox = other.getHitbox();
        // Expanded hitbox for parked cars
        const expandedCarHitbox = {
          x: carHitbox.x - 1,
          y: carHitbox.y,
          width: carHitbox.width + 2,
          height: carHitbox.height,
        };

        return !(
          proposedHitbox.x + proposedHitbox.width <= expandedCarHitbox.x ||
          proposedHitbox.x >= expandedCarHitbox.x + expandedCarHitbox.width ||
          proposedHitbox.y + proposedHitbox.height <= expandedCarHitbox.y ||
          proposedHitbox.y >= expandedCarHitbox.y + expandedCarHitbox.height
        );
      }
      return false;
    });
  }

  checkAndResolveOverlaps() {
    const nearbyWanderers = this.entity.spatialManager.grid
      .getNearbyDarlings(this.entity.position, 1)
      .filter((other) => other !== this.entity && other.type === DarlingType.WANDERER);

    for (const other of nearbyWanderers) {
      if (this.isOverlapping(other)) {
        // Remove the newer wanderer (this one)
        this.entity.spatialManager.removeEntityFromSpatialManagementSystem(this.entity);
        return;
      }
    }
  }

  isOverlapping(other) {
    return Math.abs(other.position.x - this.entity.position.x) < 0.5 && Math.abs(other.position.y - this.entity.position.y) < 1;
  }

  canSafelyMerge() {
    const safeDistance = 3;
    const nearbyWanderers = this.entity.spatialManager.grid
      .getNearbyDarlings(new Position(this.targetX, this.entity.position.y), safeDistance)
      .filter((other) => other !== this.entity && other.type === DarlingType.WANDERER && Math.abs(other.position.x - this.targetX) < 0.5);

    if (nearbyWanderers.length === 0) return true;

    return !nearbyWanderers.some((other) => Math.abs(other.position.y - this.entity.position.y) < safeDistance);
  }

  handleBlockedMerge() {
    this.mergeAttempts++;
    if (this.mergeAttempts > this.maxMergeAttempts) {
      const offset = Math.random() > 0.5 ? 3 : -3;
      console.log("forcing in");
      this.entity.position.y += offset;
      this.convertToRegularWanderer();
    }
    this.waitTime = this.minWaitTime;
  }

  checkCollision(position, other) {
    const entityHitbox = {
      x: position.x,
      y: position.y,
      width: this.entity.width,
      height: this.entity.height,
    };

    const otherHitbox = other.getHitbox();

    return !(
      entityHitbox.x + entityHitbox.width <= otherHitbox.x ||
      entityHitbox.x >= otherHitbox.x + otherHitbox.width ||
      entityHitbox.y + entityHitbox.height <= otherHitbox.y ||
      entityHitbox.y >= otherHitbox.y + otherHitbox.height
    );
  }

  convertToRegularWanderer() {
    this.entity.art = DARLINGS.WANDERER.DOWN.art;
    this.entity.position.x = this.targetX;
    this.entity.cssClass = "sidewalk-wanderer"; // Update CSS class
    this.entity.behavior = new WandererBehavior(this.entity, false);
  }

  isSafeToCross() {
    if (this.waitTime > 0) return false;

    const dangerZone = 1;
    const currentLane = Math.floor(this.entity.position.x);
    const spatialManager = this.entity.spatialManager;

    if (!spatialManager?.grid) return false;

    const nearbyEntities = spatialManager.grid.getNearbyDarlings(this.entity.position, dangerZone);

    return !nearbyEntities.some(
      (entity) =>
        (entity.type === DarlingType.TTC_LANE_DEATHMACHINE || entity.type === DarlingType.ONCOMING_DEATHMACHINE) &&
        Math.abs(entity.position.x - currentLane) < dangerZone &&
        Math.abs(entity.position.y - this.entity.position.y) < 3
    );
  }
}

class WandererBehavior extends EntityBehavior {
  constructor(entity, isGoingUp) {
    super(entity);
    this.entity = entity;
    this.config = entity.config;
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -this.config.MOVEMENT.WANDERER_SPEED : this.config.MOVEMENT.WANDERER_SPEED;
    this.lane = isGoingUp ? this.config.LANES.SIDEWALK + 2 : this.config.LANES.SIDEWALK + 1;
    this.entity.position.x = this.lane;
  }

  update() {
    const newPosition = new Position(this.lane, this.entity.position.y + this.baseSpeed);

    // Check for obstacles at the new position
    if (this.canMoveTo(newPosition)) {
      this.move(newPosition);
    } else {
      // Try alternate lane
      const alternateLane = this.lane === this.config.LANES.SIDEWALK + 1 ? this.config.LANES.SIDEWALK + 2 : this.config.LANES.SIDEWALK + 1;

      const alternatePosition = new Position(alternateLane, newPosition.y);

      if (this.canMoveTo(alternatePosition)) {
        this.lane = alternateLane;
        this.move(alternatePosition);
      } else {
        // Both lanes blocked, wait
        const slowPosition = new Position(this.entity.position.x, this.entity.position.y + this.baseSpeed * 0.1);
        if (this.canMoveTo(slowPosition)) {
          this.move(slowPosition);
        }
      }
    }
  }

  canMoveTo(position) {
    if (!this.entity.spatialManager) return false;

    const proposedHitbox = {
      x: position.x,
      y: position.y,
      width: this.entity.width,
      height: this.entity.height,
    };

    const nearbyEntities = this.entity.spatialManager.grid
      .getNearbyDarlings(position, 3)
      .filter((entity) => entity !== this.entity && (entity.type === DarlingType.WANDERER || entity.type === DarlingType.PARKED_DEATHMACHINE));

    return !nearbyEntities.some((other) => {
      if (other.type === DarlingType.WANDERER) {
        return Math.abs(other.position.x - position.x) < 0.5 && Math.abs(other.position.y - position.y) < 2;
      }

      if (other.type === DarlingType.PARKED_DEATHMACHINE) {
        const carHitbox = other.getHitbox();
        // Expanded hitbox for parked cars to ensure wanderers go around them
        const expandedCarHitbox = {
          x: carHitbox.x - 1, // Expand left
          y: carHitbox.y,
          width: carHitbox.width + 2, // Expand both sides
          height: carHitbox.height,
        };

        // Check collision with expanded hitbox
        return !(
          proposedHitbox.x + proposedHitbox.width <= expandedCarHitbox.x ||
          proposedHitbox.x >= expandedCarHitbox.x + expandedCarHitbox.width ||
          proposedHitbox.y + proposedHitbox.height <= expandedCarHitbox.y ||
          proposedHitbox.y >= expandedCarHitbox.y + expandedCarHitbox.height
        );
      }

      return false;
    });
  }

  getNearbyDarlings() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid
      .getNearbyDarlings(this.entity.position, 3)
      .filter((entity) => entity !== this.entity && (entity.type === DarlingType.WANDERER || entity.type === DarlingType.PARKED_DEATHMACHINE));
  }
}

// =========================================
// OncomingDeathmachineBehavior
// =========================================

class OncomingDeathmachineBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: CONFIG.MOVEMENT.BASE_MOVE_SPEED * 2,
      minDistance: entity.config.SAFE_DISTANCE.ONCOMING_DEATHMACHINE,
      ignoreCollisions: false,
    });
  }

  update() {
    // Just move down at constant speed
    this.entity.position.y += this.baseSpeed;
  }
}
// =========================================
// TTCLaneDeathmachineBehavior
// =========================================

class TTCLaneDeathmachineBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -CONFIG.MOVEMENT.BASE_MOVE_SPEED * 2,
      minDistance: entity.config.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE,
      ignoreCollisions: false,
    });
    // entity.config.PROBABILITIES.PARKING findme
    this.willPark = Math.random() < 0.6;
    this.isParking = false;
    this.targetLane = entity.config.LANES.PARKED;
    this.originalSpeed = this.baseSpeed;
    this.parkingAttempts = 0;
    this.maxAttempts = 13; // Add max attempts limit
  }

  handleParking() {
    this.parkingAttempts++;

    // If we've tried too many times, force transform
    if (this.parkingAttempts > this.maxAttempts) {
      // console.log("Max parking attempts reached, forcing transformation");
      this.transformToParkedDeathmachine();
      return;
    }

    const currentX = this.entity.position.x;
    const distanceToLane = Math.abs(currentX - this.targetLane);

    let moveDirection;
    if (distanceToLane > 6) {
      moveDirection = Math.sign(this.targetLane - currentX) * 1.0;
    } else if (distanceToLane > 3) {
      moveDirection = Math.sign(this.targetLane - currentX) * 0.5;
    } else {
      moveDirection = Math.sign(this.targetLane - currentX) * 0.25;
    }

    const verticalSpeed = this.baseSpeed * 0.75;

    // Try multiple positions if the first one fails
    // for (let speedMultiplier of [1, 0.75, 0.5, 0.25]) {
    for (let speedMultiplier of [1, 1.25, 1.5, 1.75]) {
      const newPosition = new Position(currentX + moveDirection * speedMultiplier, this.entity.position.y + verticalSpeed);

      if (this.entity.spatialManager.validateIfEntityCanMoveToNewPos(this.entity, newPosition)) {
        this.entity.spatialManager.movementCoordinator.moveEntity(this.entity, newPosition);

        if (distanceToLane < 0.5) {
          // console.log("At parking position, transforming");
          this.transformToParkedDeathmachine();
        }
        return;
      }
    }

    // console.log("All parking movements blocked");
    // If we get here, movement was blocked - force transform after a few attempts
    if (this.parkingAttempts > 3) {
      // console.log("Movement blocked too many times, forcing transformation");
      this.transformToParkedDeathmachine();
    }
  }
  transformToParkedDeathmachine() {
    const spatialManager = this.entity.spatialManager;
    const targetPosition = new Position(this.targetLane, this.entity.position.y);

    console.log("Original vehicle position:", {
      x: this.entity.position.x,
      y: this.entity.position.y,
    });

    // Get nearby darlings before transformation
    const nearbyDarlings = spatialManager.grid.getNearbyDarlings(targetPosition, this.entity.config.SAFE_DISTANCE.PARKED * 2);

    const nearbyparkedDeathMachines = nearbyDarlings.filter((e) => e.type === DarlingType.PARKED_DEATHMACHINE);

    // Calculate initial safe position
    let safeY = targetPosition.y;
    const minSpacing = this.entity.config.SAFE_DISTANCE.PARKED;

    // Extract the current color from the span style
    const currentColor = this.entity.color.match(/color: ([^']+)/)[1];

    // Create parked deathMachine to test positions
    const parkedDeathmachine = new ParkedDeathmachine(this.entity.config, {
      position: new Position(this.targetLane, safeY),
      color: currentColor, // Pass the extracted color
    });
    parkedDeathmachine.behavior.baseSpeed = 1;

    // Rest of the method remains the same...
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 15;

    while (!validPosition && attempts < maxAttempts) {
      validPosition = spatialManager.validateIfEntityCanMoveToNewPos(parkedDeathmachine, parkedDeathmachine.position);

      if (!validPosition) {
        safeY += minSpacing;
        parkedDeathmachine.position.y = safeY;
        attempts++;
      }
    }

    if (validPosition) {
      console.log("Found valid position at y:", safeY);
      spatialManager.addEntityToSpatialManagementSystem(parkedDeathmachine);
      spatialManager.removeEntityFromSpatialManagementSystem(this.entity);

      console.log("=== Parking Transform Complete ===");
      console.log("Final parked deathMachine position:", {
        x: parkedDeathmachine.position.x,
        y: parkedDeathmachine.position.y,
        hitbox: parkedDeathmachine.getHitbox(),
      });
    } else {
      console.warn("Failed to find valid parking position after", attempts, "attempts");
      this.willPark = false;
      this.isParking = false;
    }
  }
  update() {
    if (this.isParking) {
      this.handleParking();
    } else if (this.willPark) {
      if (this.canStartParkingManeuver()) {
        console.log("Starting parking maneuver");
        this.isParking = true;
        this.parkingAttempts = 0;
      }
      super.update();
    } else {
      super.update();
    }
  }

  canStartParkingManeuver() {
    const nearbyDarlings = this.entity.spatialManager.grid.getNearbyDarlings(new Position(this.targetLane, this.entity.position.y), 6);

    const nearbyparkedDeathMachines = nearbyDarlings.filter(
      (e) => e.type === DarlingType.PARKED_DEATHMACHINE || (e.type === DarlingType.TTC_LANE_DEATHMACHINE && e.behavior.isParking)
    );

    const hasSpace = !nearbyparkedDeathMachines.some((deathMachine) => Math.abs(deathMachine.position.y - this.entity.position.y) < 6);

    return hasSpace;
  }
}
// =========================================
// BaseEntity
// =========================================

class BaseEntity {
  constructor(config, spawnConfig, type) {
    this.config = config;
    this.type = type;
    this.position = new Position(spawnConfig.position.x, spawnConfig.position.y);
    this.width = 0;
    this.height = 0;
    this.behavior = null;
    this.art = null;
    this.color = null;
    this.spatialManager = null;
    this.soundManager = null;

    this.id = Date.now() + Math.random().toString(36);
  }

  setSoundManager(soundManager) {
    this.soundManager = soundManager;
    if (this.behavior) {
      this.behavior.soundManager = soundManager;
    }
  }

  update() {
    if (this.behavior) {
      this.behavior.update();
    }
  }

  getHitbox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}

class Wanderer extends BaseEntity {
  constructor(config, spawnConfig, isGoingUp = null, isTTCPassenger = false) {
    super(config, spawnConfig, DarlingType.WANDERER);

    const wandererColor = peopleCol[Math.floor(Math.random() * peopleCol.length)];

    // Instead of using a random shape, use the full art template now that it includes body
    const template = isGoingUp ? DARLINGS.WANDERER.UP : isTTCPassenger ? DARLINGS.WANDERER.CROSSING : DARLINGS.WANDERER.DOWN;

    this.width = template.width;
    this.height = template.height;
    this.art = template.art; // Use the full art array instead of just a single shape

    this.color = `<span style='color: ${wandererColor}'>`;
    this.cssClass = isTTCPassenger ? "ttc-passenger" : "sidewalk-wanderer";

    // Adjust spawn positions to account for increased height
    if (!isTTCPassenger) {
      if (isGoingUp) {
        spawnConfig.position.y = config.GAME.HEIGHT + this.height; // Add height to ensure full spawning
        spawnConfig.position.x = config.LANES.SIDEWALK + 1;
      } else {
        spawnConfig.position.y = -this.height; // Negative height to ensure full spawning
        spawnConfig.position.x = config.LANES.SIDEWALK;
      }
    }

    if (!this.behavior) {
      if (isTTCPassenger) {
        this.behavior = new CrossingBehavior(this);
      } else {
        this.behavior = new WandererBehavior(this, isGoingUp);
      }
    }

    this.position = new Position(spawnConfig.position.x, spawnConfig.position.y);
  }
}
// =========================================
// TTC Entity
// =========================================

class TTC extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, DarlingType.TTC);
    this.width = DARLINGS.TTC.width;
    this.height = DARLINGS.TTC.height;
    this.art = DARLINGS.TTC.art;
    this.color = STYLES.TTC;
    this.behavior = new TTCBehavior(this);
    console.log("TTC created at position:", this.position);
  }

  setSoundManager(soundManager) {
    this.soundManager = soundManager;
    this.behavior.soundManager = soundManager; // Pass to behavior as well
  }
}

// =========================================
// Building Entity
// =========================================

class Building extends BaseEntity {
  // Static properties for building management
  static nextSpawnY = null;
  static availableBuildings = [...TORONTO_BUILDINGS];
  static buildingIndex = 0;

  constructor(config, spawnY = null) {
    // console.log("[Building] Creating new building:", {
    //   spawnY,
    //   nextSpawnY: Building.nextSpawnY,
    //   buildingIndex: Building.buildingIndex,
    // });

    // Reshuffle if we've used all buildings
    if (Building.buildingIndex >= Building.availableBuildings.length) {
      console.log("[Building] Reshuffling building list");
      Building.availableBuildings = Building.shuffleArray([...TORONTO_BUILDINGS]);
      Building.buildingIndex = 0;
    }

    const selectedBuilding = Building.availableBuildings[Building.buildingIndex++];
    const height = selectedBuilding.art.length;
    const minSpacing = config.SAFE_DISTANCE.BUILDING || 0;

    // Calculate spawn position
    let calculatedY;
    if (spawnY !== null) {
      calculatedY = spawnY;
    } else if (Building.nextSpawnY !== null) {
      calculatedY = Building.nextSpawnY - height - minSpacing;
    } else {
      calculatedY = config.GAME.HEIGHT - height - minSpacing;
    }

    // console.log("[Building] Calculated spawn position:", {
    //   building: selectedBuilding.name,
    //   height,
    //   calculatedY,
    //   spacing: minSpacing,
    // });

    const spawnConfig = {
      position: new Position(config.LANES.BUILDINGS, calculatedY),
    };

    super(config, spawnConfig, DarlingType.BUILDING);

    // Set building properties
    this.width = selectedBuilding.art[0].length;
    this.height = height;
    this.art = selectedBuilding.art;
    this.name = selectedBuilding.name;
    this.color = `<span style='color: ${this.getRandomBuildingColor()}'>`;
    this.behavior = new BuildingBehavior(this);

    Building.nextSpawnY = calculatedY;

    // console.log("[Building] Building created:", {
    //   name: this.name,
    //   position: this.position,
    //   height: this.height,
    //   width: this.width,
    // });
  }

  static shuffleArray(array) {
    console.log("[Building] Shuffling building array");
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  getRandomBuildingColor() {
    const color = COLOURS.BUILDINGS[Math.floor(Math.random() * COLOURS.BUILDINGS.length)];
    // console.log("[Building] Selected color:", color);
    return color;
  }
}

// =========================================
// TTCLaneDeathmachine Entity
// =========================================

class TTCLaneDeathmachine extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, DarlingType.TTC_LANE_DEATHMACHINE);
    this.width = DARLINGS.MOVINGDEATHMACHINE.width;
    this.height = DARLINGS.MOVINGDEATHMACHINE.height;
    this.art = DARLINGS.MOVINGDEATHMACHINE.art;
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new TTCLaneDeathmachineBehavior(this);
  }

  getHitbox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height - 1,
    };
  }

  getRandomVehicleColor() {
    return COLOURS.VEHICLES[Math.floor(Math.random() * COLOURS.VEHICLES.length)];
  }
}
// =========================================
// OncomingDeathmachine Entity
// =========================================

class OncomingDeathmachine extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, DarlingType.ONCOMING_DEATHMACHINE);
    this.width = DARLINGS.ONCOMINGDEATHMACHINE.width;
    this.height = DARLINGS.ONCOMINGDEATHMACHINE.height;
    this.art = DARLINGS.ONCOMINGDEATHMACHINE.art;
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new OncomingDeathmachineBehavior(this);
  }

  getHitbox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height - 1,
    };
  }

  getRandomVehicleColor() {
    return COLOURS.VEHICLES[Math.floor(Math.random() * COLOURS.VEHICLES.length)];
  }
}
// =========================================
// ParkedDeathmachine Entity
// =========================================

class ParkedDeathmachine extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, DarlingType.PARKED_DEATHMACHINE);
    this.width = 7;
    this.height = 5;
    this.art = DARLINGS.PARKED_DEATHMACHINE_STATES[0];
    // Use provided color or generate random one
    const vehicleColor = spawnConfig.color || this.getRandomVehicleColor();
    this.color = `<span style='color: ${vehicleColor}'>`;
    this.behavior = new ParkedDeathmachineBehavior(this);
  }

  getHitbox() {
    return {
      x: this.position.x + 2,
      y: this.position.y,
      width: 5,
      height: this.height,
    };
  }

  getRandomVehicleColor() {
    return COLOURS.VEHICLES[Math.floor(Math.random() * COLOURS.VEHICLES.length)];
  }
}
// =========================================
// Wanderer Entity
// =========================================

// class Wanderer extends BaseEntity {
//   constructor(config, spawnConfig, isGoingUp) {
//     super(config, spawnConfig, DarlingType.WANDERER);

//     const wandererColor = peopleCol[Math.floor(Math.random() * peopleCol.length)];

//     // Choose art based on direction
//     const template = isGoingUp ? DARLINGS.WANDERER.UP : DARLINGS.WANDERER.DOWN;
//     this.width = template.width;
//     this.height = template.height;
//     this.art = template.art;
//     this.color = `<span style='color: ${wandererColor}'>`;

//     // this.color = STYLES.RESET;

//     // Modify spawn position based on direction
//     if (isGoingUp) {
//       spawnConfig.position.y = config.GAME.HEIGHT + 1; // Spawn at bottom for upward
//       spawnConfig.position.x = config.LANES.SIDEWALK + 1; // Right side of sidewalk
//     } else {
//       spawnConfig.position.y = -1; // Spawn at top for downward
//       spawnConfig.position.x = config.LANES.SIDEWALK; // Left side of sidewalk
//     }

//     this.position = new Position(spawnConfig.position.x, spawnConfig.position.y);
//     this.behavior = new WandererBehavior(this, isGoingUp);
//   }
// }

// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================

// =========================================
// GameState
// =========================================

class GameState {
  constructor(config) {
    this.config = config;
    this.isDead = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.currentLane = config.LANES.BIKE;
    this.isJumping = false;
    this.speed = config.GAME.INITIAL_SPEED;

    this.deathState = {
      animation: 0,
      x: 0,
      y: 0,
      reason: null,
      frameCounter: 0,
      colorIndex: 0,
    };
  }

  updateDeathAnimation() {
    if (this.isDead) {
      this.deathState.frameCounter++;

      // Change color every 2 frames
      if (this.deathState.frameCounter % 2 === 0) {
        this.deathState.colorIndex = (this.deathState.colorIndex + 1) % EXPLOSION_COLOURS.length;
      }

      if (this.deathState.frameCounter % 3 === 0) {
        this.deathState.animation++;
      }

      return this.deathState.animation > this.config.GAME.ANIMATION_FRAMES.DEATH_SEQUENCE;
    }
    return false;
  }

  incrementScore() {
    this.score++;
    return this.score;
  }

  updateSpeed() {
    this.speed = Math.max(this.speed * this.config.GAME.SPEED_DECREASE_RATE, this.config.GAME.MIN_SPEED);
    return this.speed;
  }
}

class GameStateManager {
  constructor(config) {
    this.config = config;
    this.state = new GameState(config);
    this.state.currentLane = config.LANES.BIKE; // Make sure initial lane is set

    this.score = 0;
    this.tutorialComplete = false;

    this.lastPress = {
      left: 0,
      right: 0,
    };
    this.doublePressWindow = 200; // milliseconds
  }

  start() {
    if (this.state.isPlaying) return false;

    const messageBox = document.getElementById("pregame-msg-box");
    if (messageBox) {
      messageBox.style.display = "none";
    }

    this.state.isPlaying = true;
    return true;
  }

  update() {
    if (this.state.isDead) {
      return this.state.updateDeathAnimation();
    }

    this.state.incrementScore();
    this.state.updateSpeed();
    this.updateScoreDisplay();
    return false;
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused;

    const messageBox = document.getElementById("pregame-msg-box");
    if (messageBox) {
      messageBox.style.display = this.state.isPaused ? "block" : "none";
      messageBox.textContent = this.state.isPaused ? "PAUSED" : "";
    }
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById("time-alive");
    if (scoreElement) {
      scoreElement.textContent = `STAY ALIVE: ${this.state.score}`;
    }
  }

  handleDeath(reason) {
    this.state.isDead = true;

    // Store the death position using the current player position
    this.state.deathState = {
      animation: 0,
      x: Math.round(this.state.currentLane),
      y: this.state.isJumping ? this.config.GAME.CYCLIST_Y - 1 : this.config.GAME.CYCLIST_Y,
      reason: reason,
      frameCounter: 0,
      colorIndex: 0,
    };

    return this.showDeathMessage(reason);
  }

  getRandomDeathMessage(type) {
    const messages = MESSAGES.DEATH[type];
    if (!messages?.length) {
      console.log(`oops no death message ${type}`);
      return {
        reason: "X X!",
        funny: "Sometimes things just happen",
      };
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }

  showDeathMessage(reason) {
    const messageEl = document.getElementById("pregame-msg-box");
    if (!messageEl) return;

    const message = this.getRandomDeathMessage(reason);
    const randomFace = cuteDeathFaces[Math.floor(Math.random() * cuteDeathFaces.length)];

    messageEl.innerHTML = `
      <p>${message.funny}</p>
      <span class="cute-death-face">${randomFace}</span>
    `;
    messageEl.style.display = "block";

    return { reason, message, randomFace };
  }

  reset() {
    this.state = new GameState(this.config);
    const messageBox = document.getElementById("pregame-msg-box");
    if (messageBox) {
      messageBox.textContent = "CLICK HERE/SPACEBAR to play ";
    }
  }
  moveBike(direction, timestamp = performance.now()) {
    if (this.state.isDead || !this.state.isPlaying) return false;

    // More forgiving double-press window (300ms instead of 200ms)
    const doublePressWindow = 300;
    const isDoublePress = timestamp - this.lastPress[direction] < doublePressWindow;
    this.lastPress[direction] = timestamp;

    // If we're on a track AND it's a double press, jump over in the pressed direction
    const currentLane = Math.floor(this.state.currentLane);

    if (isDoublePress) {
      if (currentLane === this.config.LANES.TRACKS + 1) {
        // On first track, only allow jumping right
        if (direction === "right") {
          this.state.currentLane = this.config.LANES.TRACKS + 2;
          return true;
        }
      }
      if (currentLane === this.config.LANES.TRACKS + 5) {
        // On second track, only allow jumping left
        if (direction === "left") {
          this.state.currentLane = this.config.LANES.TRACKS + 4;
          return true;
        }
      }
    }

    // Regular movement
    const moveAmount = direction === "left" ? -1 : 1;
    const newLane = Math.floor(this.state.currentLane + moveAmount);
    this.state.currentLane = Math.max(this.config.LANES.ONCOMING, Math.min(newLane, this.config.LANES.BUILDINGS - 1));

    return true;
  }

  // handleJump(direction) {
  //   if (this.state.isJumping) return false;

  //   const moveAmount = this.config.MOVEMENT.JUMP_AMOUNT;
  //   if (direction === "left") {
  //     this.state.currentLane = Math.max(this.state.currentLane - moveAmount, this.config.LANES.ONCOMING);
  //   } else {
  //     this.state.currentLane = Math.min(this.state.currentLane + moveAmount, this.config.LANES.BUILDINGS - 1);
  //   }

  //   this.state.isJumping = true;
  //   setTimeout(() => {
  //     this.state.isJumping = false;
  //   }, this.config.MOVEMENT.JUMP_DURATION);

  //   return true;
  // }

  get isPaused() {
    return this.state.isPaused;
  }

  get isPlaying() {
    return this.state.isPlaying;
  }

  get isDead() {
    return this.state.isDead;
  }

  get currentLane() {
    return this.state.currentLane;
  }

  get isJumping() {
    return this.state.isJumping;
  }
  restart() {
    // Only handle game state reset
    this.state = new GameState(this.config);
    this.state.currentLane = this.config.LANES.BIKE;
    this.score = 0;
    this.tutorialComplete = false;
  }

  cleanup() {
    this.state = new GameState(this.config);
    this.score = 0;
    this.tutorialComplete = false;
  }
}

// =========================================
// BaseControl
// =========================================

// =========================================
// BaseControl
// =========================================

class BaseControl {
  constructor(game) {
    this.game = game;
    this.config = game.config;
    this.eventListeners = new Map();
    this.lastInput = {
      left: 0,
      right: 0,
    };
    this.inputStartPosition = null;
  }

  // Add this method to BaseControl
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

  handleInput(direction, now) {
    if (!this.game.stateManager.isPlaying && !this.game.tutorialComplete) {
      this.game.tutorialSystem.handleMove(direction);
      return;
    }

    if (!this.game.stateManager.isPlaying) return;

    this.game.movePlayer(direction, now);
  }
}

class KeyboardControls extends BaseControl {
  constructor(game) {
    super(game); // Make sure to call super() first
    this.setupKeyboardControls();
  }

  setupKeyboardControls() {
    this.addEventListenerWithTracking(document, "keydown", (e) => {
      if (!this.game.stateManager.isPlaying && !this.game.tutorialComplete) {
        if (e.key === "ArrowLeft") {
          this.game.tutorialSystem.handleMove("left");
          return;
        }
        if (e.key === "ArrowRight") {
          this.game.tutorialSystem.handleMove("right");
          return;
        }
      }

      if (!this.game.stateManager.isPlaying && this.game.tutorialComplete) {
        if (e.key === " " || e.key === "Spacebar") {
          this.game.start();
          document.getElementById("pregame-msg-box").style.display = "none";
          let gameInfoContainer = document.getElementById("game-info-container");
          gameInfoContainer.style.opacity = "1";
          gameInfoContainer.style.visibility = "visible";
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        this.handleInput("left", performance.now());
      } else if (e.key === "ArrowRight") {
        this.handleInput("right", performance.now());
      } else if (e.key === "p" || e.key === "P") {
        this.game.stateManager.togglePause();
      }
    });
  }
}

class TouchControls extends BaseControl {
  constructor(game) {
    super(game);
    this.touchHandlers = new Map();
    this.setupTouchControls();
  }

  setupTouchControls() {
    const leftControl = document.getElementById("move-left");
    const rightControl = document.getElementById("move-right");

    if (!leftControl || !rightControl) return;

    // Store handlers so we can remove them later
    const handleLeft = this.createTouchHandler("left");
    const handleRight = this.createTouchHandler("right");

    this.touchHandlers.set("left", handleLeft);
    this.touchHandlers.set("right", handleRight);

    // Add event listeners with tracking
    this.addEventListenerWithTracking(leftControl, "touchstart", handleLeft);
    this.addEventListenerWithTracking(rightControl, "touchstart", handleRight);
  }

  createTouchHandler(direction) {
    let lastTouch = 0;
    const TOUCH_DELAY = 100; // Minimum time between touches

    return (e) => {
      e.preventDefault();
      const now = performance.now();

      // Prevent rapid-fire touches
      if (now - lastTouch < TOUCH_DELAY) {
        return;
      }

      lastTouch = now;
      this.handleInput(direction, now);
    };
  }

  cleanup() {
    super.cleanup();
    this.touchHandlers.clear();
  }
}

class UIControls extends BaseControl {
  constructor(game) {
    super(game); // Make sure we call super first
    this.setupClickHandler();
    this.setupInfoButton();
  }

  setupClickHandler() {
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      this.addEventListenerWithTracking(gameContainer, "click", (e) => {
        const isExcludedElement =
          e.target.id === "add-art-link" ||
          e.target.id === "info-div" ||
          e.target.id === "close-info" ||
          e.target.closest("#info-div") ||
          e.target.closest(".title-box");

        if (isExcludedElement) {
          if (e.target.id === "add-art-link" || e.target.closest("#add-art-link")) {
            window.open("https://docs.google.com/document/d/13KddYLkQMiNpLRuZ7cCFMzyC_1EFLc1_ksV_MJ21D90/edit?usp=sharing", "_blank");
          }
          return;
        }

        // Update this line to use stateManager
        if (!this.game.stateManager.isPlaying && this.game.tutorialComplete) {
          let titleBox = document.getElementById("game-info-container");
          if (titleBox) {
            titleBox.style.width = this.config.GAME.WIDTH;
            titleBox.style.visibility = "visible";
          }
          this.game.start();
        }
      });
    }
  }

  setupInfoButton() {
    const infoButton = document.getElementById("add-art-link");
    const infoDiv = document.getElementById("info-div");
    const closeButton = document.getElementById("close-info");

    if (infoButton && infoDiv && closeButton) {
      [
        [
          infoButton,
          "click",
          () => {
            infoDiv.style.display = "block";
          },
        ],
        [
          closeButton,
          "click",
          () => {
            infoDiv.style.display = "none";
          },
        ],
        [
          infoDiv,
          "click",
          (e) => {
            e.stopPropagation();
          },
        ],
      ].forEach(([element, event, handler]) => {
        this.addEventListenerWithTracking(element, event, (e) => {
          e.preventDefault();
          handler(e);
        });
      });
    }
  }
}

class Controls {
  constructor(game) {
    this.keyboard = new KeyboardControls(game);
    this.touch = new TouchControls(game);
    this.ui = new UIControls(game);
  }

  cleanup() {
    this.keyboard.cleanup();
    this.touch.cleanup();
    this.ui.cleanup();
  }
}

// =========================================
// LoserLane
// =========================================

class TutorialSystem {
  constructor(game) {
    // console.log("🎮 Initializing Tutorial System");
    this.game = game;
    this.config = game.config;

    // Cache DOM elements
    this.tutorialBike = document.getElementById("tutorial-bike");
    this.tutorialText = document.getElementById("tutorial-text");
    this.controlsDiv = document.getElementById("controls");
    this.startButton = document.getElementById("start-button");
    this.leftHighlight = document.getElementById("left-highlight");
    this.rightHighlight = document.getElementById("right-highlight");
    this.titleBike = document.getElementById("title-bike");
    this.pregameTitle = document.getElementById("pregame-msg-title");

    this.currentStep = "left";

    // Tutorial state
    this.completedSteps = {
      left: false,
      right: false,
    };

    // Check if user is on mobile
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // console.log(`📱 Device type detected: ${this.isMobile ? "Mobile" : "Desktop"}`);

    // Initial visibility setup
    this.tutorialBike.style.opacity = "0";
    this.tutorialText.style.opacity = "0";

    // Initialize
    this.init();
  }

  init() {
    // console.log("🎮 Starting tutorial initialization");

    // Show title elements
    if (this.titleBike) this.titleBike.style.opacity = "1";
    if (this.pregameTitle) this.pregameTitle.style.opacity = "1";

    // Add timer to show tutorial elements
    setTimeout(() => {
      // console.log("⏰ Tutorial delay complete, showing tutorial elements");

      // Show tutorial elements with fade-in effect
      if (this.tutorialBike) {
        this.tutorialBike.style.transition = "opacity 0.5s ease-in-out";
        this.tutorialBike.style.opacity = "1";
      }

      if (this.tutorialText) {
        this.tutorialText.style.transition = "opacity 0.5s ease-in-out";
        this.tutorialText.style.opacity = "1";
      }

      // Start with left control tutorial
      this.showLeftTutorial();
    }, 1500);

    // Add event listeners
    // this.addControlListeners();
    // console.log("✅ Tutorial initialization complete");
  }

  showLeftTutorial() {
    // console.log("👈 Showing left control tutorial");
    const text = this.isMobile
      ? "Tap the <span class='highlight'>left side</span> of the screen to move left"
      : "Use your <span class='highlight'>left arrow key</span> to move left";
    // console.log("Setting tutorial text to:", text);
    // console.log("Tutorial text element:", this.tutorialText);

    if (!this.tutorialText) {
      console.error("Tutorial text element is null!");
      return;
    }

    try {
      this.tutorialText.innerHTML = text;
      // console.log("Successfully set tutorial text");
      // console.log("Current text content:", this.tutorialText.textContent);
    } catch (e) {
      console.error("Error setting tutorial text:", e);
    }

    this.leftHighlight.classList.add("active");
  }

  showRightTutorial() {
    // console.log("👉 Showing right control tutorial");
    const text = this.isMobile
      ? "Tap the <span class='highlight'>right side</span> of the screen to move right"
      : "Use your <span class='highlight'>right arrow key</span> to move right";
    this.tutorialText.innerHTML = text;
    this.rightHighlight.classList.add("active");
  }

  addControlListeners() {
    // console.log("🎮 Setting up control listeners");
    // Use existing control system
    const originalHandleInput = this.game.controls.handleInput;
    this.game.controls.handleInput = (direction, now) => {
      // console.log(`🕹️ Control input received: ${direction}`);
      if (!this.game.state.isPlaying) {
        // console.log("🎮 Game not started - handling as tutorial input");
        this.handleMove(direction);
      } else {
        // console.log("🎮 Game started - passing to game controls");
        originalHandleInput.call(this.game.controls, direction, now);
      }
    };
  }

  handleMove(direction) {
    // Handle wrong input
    if (direction !== this.currentStep) {
      // console.log(`Wrong input: got ${direction}, expected ${this.currentStep}`);
      const wrongHighlight = direction === "left" ? this.leftHighlight : this.rightHighlight;
      wrongHighlight.classList.add("wrong");

      // Save original text and add error state
      const originalText = this.tutorialText.textContent;
      const originalHTML = this.tutorialText.innerHTML;
      this.tutorialText.classList.add("error");
      this.tutorialText.innerHTML = direction === "right" ? "Your other left!" : "Your other right!";

      // Reset everything after animation
      setTimeout(() => {
        wrongHighlight.classList.remove("wrong");
        this.tutorialText.classList.remove("error");
        this.tutorialText.innerHTML = originalHTML;
      }, 500);
      return;
    }

    // Rest of the existing handleMove code...
    // console.log(`🎯 Handling ${direction} move`);
    if (this.completedSteps[direction]) return;

    // Mark step as completed
    this.completedSteps[direction] = true;

    // Move the bike
    if (direction === "left") {
      this.tutorialBike.style.marginLeft = "-20px";
      this.currentStep = "right";
    } else {
      this.tutorialBike.style.marginLeft = "20px";
      this.currentStep = "complete";
    }

    // Show success indicator and add success state to text
    const highlight = direction === "left" ? this.leftHighlight : this.rightHighlight;
    highlight.classList.remove("active");
    highlight.classList.add("success");
    this.tutorialText.classList.add("success");

    setTimeout(() => {
      highlight.classList.remove("success");
      this.tutorialText.classList.remove("success");
      if (!this.completedSteps.right) {
        this.showRightTutorial();
      } else if (!this.completedSteps.left) {
        this.showLeftTutorial();
      } else {
        this.completeTutorial();
      }
    }, 500);
  }
  completeTutorial() {
    // console.log("🏁 Completing tutorial");

    // Clean up tutorial animations/styles
    this.tutorialBike.style.marginLeft = "0"; // Reset bike position
    this.leftHighlight.classList.remove("active");
    this.rightHighlight.classList.remove("active");

    // Fade out tutorial elements
    this.tutorialBike.style.transition = "opacity 0.5s ease-in-out";
    this.tutorialBike.style.opacity = "0";
    this.controlsDiv.style.opacity = "0";

    // Show "STAY ALIVE" text
    this.tutorialText.innerHTML = "STAY ALIVE? <br>(you won't)";

    // Swap bike with start button
    setTimeout(() => {
      // Add visible class to start button
      this.startButton.classList.add("visible");
      document.getElementById("pregame-msg-box").style.zIndex = "200";

      // Add start button listener
      this.startButton.addEventListener("click", () => {
        // console.log("🎮 Start button clicked - beginning game");
        this.game.start();

        // Clean up tutorial elements
        // console.log("🧹 Cleaning up tutorial elements");
        this.tutorialText.innerHTML = "";
        document.getElementById("pregame-msg-box").style.opacity = "0";

        // Reset styles for gameplay
        this.controlsDiv.style.opacity = "1";

        // Show game info container
        const gameInfo = document.getElementById("game-info-container");
        if (gameInfo) {
          gameInfo.style.visibility = "visible";
          gameInfo.style.opacity = "1";
        }
      });
    }, 500); // Wait for bike fade-out

    // Set tutorial complete flag
    this.game.tutorialComplete = true;
    this.game.stateManager.tutorialComplete = true;
  }

  cleanup() {
    // console.log("🧹 Cleaning up tutorial system");
    // Remove any event listeners or styles when needed
    const tutorialStyles = document.getElementById("tutorial-styles");
    if (tutorialStyles) {
      tutorialStyles.remove();
      // console.log("✨ Tutorial styles removed");
    }
  }
}

class LoserLane {
  constructor() {
    this.initializeCore();
    this.initializeSystems();
    this.initializeTimers();
    this.initializeSounds();
    try {
      this.initializeArduino();
    } catch (error) {
      console.log("Arduino not available, continuing without it");
    }
    this.initializeGameComponents();
  }

  // === Initialization Methods ===

  initializeCore() {
    this.config = CONFIG;
    this.eventListeners = new Map();
    this.debug = true;
    this.frameId = null;
    this.tutorialComplete = false;
  }

  initializeSystems() {
    this.soundManager = new SoundManager();

    this.stateManager = new GameStateManager(this.config);
    this.tutorialSystem = new TutorialSystem(this);

    // Pass the sound manager to the spatial manager
    this.spatialManager = new SpatialManager(this.config, this.soundManager);
    this.spatialManager.setGame(this);

    this.renderGrid = new RenderGrid(this.config.GAME.WIDTH, this.config.GAME.HEIGHT);
    this.renderer = new GameRenderer(this.config, this.renderGrid);
  }

  initializeTimers() {
    this.initialLastMove = performance.now();
    this.lastFrameTime = performance.now();
  }

  initializeArduino() {
    try {
      // Only initialize if Web Serial is supported
      if (!("serial" in navigator)) {
        console.log("Web Serial API not supported in this browser");
        return;
      }

      this.arduino = new ArduinoWebSerial();

      // Handle incoming lines from Arduino
      this.arduino.on("line", (line) => {
        console.log("Arduino data received:", line);

        if (line === "LEFT") {
          this.movePlayer("left", performance.now());
        } else if (line === "RIGHT") {
          this.movePlayer("right", performance.now());
        }
      });

      this.arduino.on("connected", () => {
        console.log("Arduino connected!");
        // Update button text
        const button = document.getElementById("connect-arduino");
        if (button) button.textContent = "Disconnect Arduino";
      });

      this.arduino.on("disconnected", () => {
        console.log("Arduino disconnected");
        const button = document.getElementById("connect-arduino");
        if (button) button.textContent = "Connect Arduino";
      });

      this.arduino.on("error", (error) => {
        console.log("Arduino error:", error);
      });

      const connectButton = document.getElementById("connect-arduino");
      if (connectButton) {
        connectButton.addEventListener("click", async () => {
          // Add visual feedback immediately
          connectButton.textContent = "Connecting...";
          connectButton.disabled = true;

          try {
            if (this.arduino.isConnected) {
              await this.arduino.disconnect();
              connectButton.textContent = "Connect Arduino";
            } else {
              // Check if Web Serial is supported
              if (!this.arduino.isSupported()) {
                alert("Web Serial API not supported. Please use Chrome or Edge browser.");
                connectButton.textContent = "Connect Arduino";
                connectButton.disabled = false;
                return;
              }

              const success = await this.arduino.connect();
              if (success) {
                connectButton.textContent = "Disconnect Arduino";
              } else {
                connectButton.textContent = "Connect Arduino";
              }
            }
          } catch (error) {
            console.error("Connection error:", error);
            alert(`Connection failed: ${error.message}`);
            connectButton.textContent = "Connect Arduino";
          }

          connectButton.disabled = false;
        });
      }
    } catch (error) {
      console.log("Failed to initialize Arduino connection:", error);
    }
  }

  initializeSounds() {
    this.soundManager.setupMuteButton();

    this.soundManager.setupMuteButton();
    // this.soundManager.addSound("backgroundMusic", "sounds/bgmusic.mp3", true);
    // this.soundManager.addSound("collision", "sounds/collision.mp3");
    // this.soundManager.addSound("jump", "sounds/jump.mp3");
    // this.soundManager.addSound("powerup", "sounds/powerup.mp3");
    // this.soundManager.addSound("death", "sounds/death.mp3");

    // TTC specific sounds
    // this.soundManager.addSound("ttcBell", "sounds/collision.mp3");
    this.soundManager.addSound("ttcStop", "sounds/collision.mp3");
    // this.soundManager.addSound("ttcStart", "sounds/ttc-start.mp3");

    // this.soundManager.play("backgroundMusic", 1.0);
  }

  initializeGameComponents() {
    this.initializeGameWorld();
    this.clusterManager = new VehicleClusterManager(CONFIG);
    this.controls = new Controls(this);
    this.settingsManager = new SettingsManager(this);
  }

  initializeGameWorld() {
    this.spatialManager.darlings.clear();
    this.initializeBuildings();
    this.initializeParkedDeathMachines();
    this.bike = this.createBike();
    this.spatialManager.addEntityToSpatialManagementSystem(this.bike);
  }

  // === Entity Creation Methods ===

  createBike() {
    const bikeEntity = new BaseEntity(
      this.config,
      {
        position: new Position(this.stateManager.currentLane, CONFIG.GAME.CYCLIST_Y),
      },
      DarlingType.BIKE
    );

    Object.assign(bikeEntity, {
      width: DARLINGS.BIKE.width,
      height: DARLINGS.BIKE.height,
      art: DARLINGS.BIKE.art,
      color: STYLES.BIKE,
      behavior: new BikeBehavior(bikeEntity),
    });

    return bikeEntity;
  }

  initializeBuildings() {
    let currentY = CONFIG.GAME.HEIGHT;
    const minSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 0;

    while (currentY > CONFIG.SPAWNING.MIN_BUILDING_HEIGHT) {
      const existingBuildings = this.getExistingBuildingsSortedByY();
      const newBuilding = new Building(CONFIG, currentY);

      if (!this.buildingCollisionExists(existingBuildings, currentY, newBuilding, minSpacing)) {
        this.spatialManager.addEntityToSpatialManagementSystem(newBuilding);
        currentY -= newBuilding.height + minSpacing;
      } else {
        currentY -= minSpacing;
      }
    }
  }

  getExistingBuildingsSortedByY() {
    return Array.from(this.spatialManager.darlings)
      .filter((e) => e.type === DarlingType.BUILDING)
      .sort((a, b) => a.position.y - b.position.y);
  }

  buildingCollisionExists(existingBuildings, currentY, newBuilding, minSpacing) {
    return existingBuildings.some((existing) => {
      const topOverlap = currentY < existing.position.y + existing.height + minSpacing;
      const bottomOverlap = currentY + newBuilding.height + minSpacing > existing.position.y;
      const sameColumn = Math.abs(existing.position.x - CONFIG.LANES.BUILDINGS) < 0.1;
      return sameColumn && topOverlap && bottomOverlap;
    });
  }

  initializeParkedDeathMachines() {
    let currentY = CONFIG.GAME.HEIGHT;

    while (currentY > -1) {
      const position = new Position(CONFIG.LANES.PARKED, currentY);
      const deathMachine = new ParkedDeathmachine(CONFIG, { position });

      if (this.spatialManager.spawnManager.canDarlingSpawnAtThisSpecificPos(DarlingType.PARKED_DEATHMACHINE, deathMachine.position)) {
        this.spatialManager.addEntityToSpatialManagementSystem(deathMachine);
        currentY -= deathMachine.height + 1;
      } else {
        currentY -= 1;
      }
    }
  }

  // === Game Loop Methods ===

  start() {
    if (this.stateManager.start()) {
      this.lastFrameTime = performance.now();
      this.frameId = requestAnimationFrame((t) => this.update(t));

      // Start background music when game starts
      //  this.soundManager.play("backgroundMusic", 1.0);
    }
  }

  update(timestamp) {
    if (!timestamp || this.stateManager.isPaused) {
      this.scheduleNextFrame();
      return;
    }

    const deltaTime = timestamp - this.lastFrameTime;
    if (deltaTime >= this.stateManager.state.speed) {
      this.lastFrameTime = timestamp;

      if (this.stateManager.update()) {
        this.cleanup();
        return;
      }

      this.updateGameState();
    }

    this.render();
    this.scheduleNextFrame();
  }

  scheduleNextFrame() {
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  updateGameState() {
    this.spatialManager.update();
    this.updateBikePosition();
    this.spawnDarlings();
    this.checkBikeCollisions();
  }

  render() {
    this.renderer.render(this.stateManager, this.spatialManager.darlings, this.bike);
  }

  // === Player Control Methods ===

  movePlayer(direction, timestamp) {
    if (this.stateManager.moveBike(direction, timestamp)) {
      this.updateBikePosition();
    }
  }

  handleJump(direction) {
    if (this.stateManager.handleJump(direction)) {
      this.updateBikePosition();
      // this.soundManager.play("jump", 1.0);
    }
  }

  updateBikePosition() {
    if (this.bike) {
      this.bike.position = new Position(
        this.stateManager.currentLane,
        this.stateManager.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y
      );
    }
  }

  // === Entity Management Methods ===

  spawnDarlings() {
    const spawnRules = [
      { type: DarlingType.TTC, rate: CONFIG.SPAWN_RATES.TTC },
      { type: DarlingType.TTC_LANE_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.TTC_LANE_DEATHMACHINE },
      { type: DarlingType.ONCOMING_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.ONCOMING_DEATHMACHINE },
      { type: DarlingType.PARKED_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.PARKED_DEATHMACHINE },
      { type: DarlingType.WANDERER, rate: CONFIG.SPAWN_RATES.WANDERER },
    ];

    spawnRules.forEach(({ type, rate }) => {
      if (Math.random() < rate) {
        const entity = this.spatialManager.spawnManager.spawnEntity(type);
        if (entity) {
          // Pass soundManager to the entity
          entity.setSoundManager(this.soundManager);
          this.spatialManager.addEntityToSpatialManagementSystem(entity);
        }
      }
    });
  }

  // === Collision Methods ===

  checkBikeCollisions() {
    if (CONFIG.GAME.INVINCIBLE) {
      return;
    }

    const bikeHitbox = this.getBikeHitbox();
    const darlings = this.getDarlingsForCollision();

    const collision = this.spatialManager.collisionManager.checkBikeCollisionIsSpecial(bikeHitbox, darlings, this.stateManager.isJumping);

    if (collision) {
      // console.log(`uuuu $`);

      this.die(collision);
    }
  }

  getBikeHitbox() {
    return {
      x: this.stateManager.currentLane,
      y: this.stateManager.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      width: DARLINGS.BIKE.width,
      height: DARLINGS.BIKE.height,
    };
  }

  getDarlingsForCollision() {
    const allDarlings = Array.from(this.spatialManager.darlings);
    return {
      darlings: allDarlings.filter((e) => e.type !== DarlingType.BIKE && e.type !== DarlingType.PARKED_DEATHMACHINE),
      parkedDeathMachines: allDarlings.filter((e) => e.type === DarlingType.PARKED_DEATHMACHINE),
    };
  }

  // === Game State Methods ===

  die(reason) {
    if (this.stateManager.state.isDead) return;
    this.setDeathState();
    this.handleDeathEffects(reason);
  }

  setDeathState() {
    // Play death sound and stop background music
    // this.soundManager.stop("backgroundMusic");
    // this.soundManager.play("death", 1.0);

    this.stateManager.state.isPaused = true;
    this.stateManager.state.isDead = true;
    this.stateManager.state.deathState = {
      animation: 0,
      x: Math.round(this.stateManager.currentLane),
      y: this.stateManager.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
    };
  }

  handleDeathEffects(reason) {
    const gameScreen = document.getElementById("game-screen");
    if (!gameScreen) return;

    const messageInfo = this.stateManager.handleDeath(reason);
    this.applyDeathVisualEffects(gameScreen, reason, messageInfo);
  }

  applyDeathVisualEffects(gameScreen, reason, messageInfo) {
    gameScreen.classList.add("screen-shake", "death-glitch-active");

    const flashOverlay = document.createElement("div");
    flashOverlay.className = "death-flash";
    document.body.appendChild(flashOverlay);

    setTimeout(() => {
      gameScreen.classList.remove("screen-shake", "death-glitch-active");
      flashOverlay.remove();

      html2canvas(gameScreen).then((canvas) => {
        generateSocialCardNoSS(canvas, reason, this.stateManager.state.score, messageInfo.message.funny, messageInfo.randomFace, this);
      });
      // death message
    }, 1000);
  }

  restart() {
    console.log("\n=== Game Restart Initiated ===");

    // 1. Stop the current game loop first
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    // 2. Reset audio
    this.soundManager.resetAll();

    // 3. Reset static properties
    Building.nextSpawnY = null;
    Building.buildingManager = null;

    // 4. Clean up existing controls before creating new ones
    if (this.controls) {
      this.controls.cleanup();
    }

    // 5. Wait a brief moment before reinitializing everything
    setTimeout(() => {
      // Reset game state
      this.stateManager.restart();

      // Create new game systems
      this.spatialManager = new SpatialManager(CONFIG);
      this.spatialManager.setGame(this);
      this.controls = new Controls(this);
      this.settingsManager = new SettingsManager(this);
      this.clusterManager = new VehicleClusterManager(CONFIG);

      // Initialize new world
      this.initializeGameWorld();

      // Wait another brief moment before starting
      setTimeout(() => {
        this.start();
      }, 50); // Small delay before starting
    }, 100); // Small delay for cleanup
  }

  resetStaticProperties() {
    Building.nextSpawnY = null;
    Building.buildingManager = null;
  }

  reinitializeGame() {
    this.stateManager.restart();
    this.spatialManager = new SpatialManager(CONFIG);
    this.spatialManager.setGame(this);
    this.controls = new Controls(this);
    this.settingsManager = new SettingsManager(this);
    this.clusterManager = new VehicleClusterManager(CONFIG);
    this.initializeGameWorld();
  }

  // === Utility Methods ===

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  flashScreen() {
    const gameScreen = document.getElementById("game-screen");
    if (!gameScreen) return;

    const colors = ["#FF0000", "#000000", "#222"];
    let delay = 0;

    colors.forEach((color) => {
      setTimeout(() => (gameScreen.style.backgroundColor = color), delay);
      delay += 100;
    });

    setTimeout(() => (gameScreen.style.backgroundColor = ""), delay);
  }

  cleanup() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.soundManager?.resetAll();
    this.stateManager.cleanup();
    this.spatialManager.cleanup();
    this.clusterManager.cleanup();
    this.renderGrid.clear();
    this.controls.cleanup();
    this.settingsManager.cleanup();
    this.tutorialSystem.cleanup();

    this.lastFrameTime = performance.now();
  }

  togglePause() {
    this.stateManager.togglePause();
  }
}

const game = new LoserLane();
