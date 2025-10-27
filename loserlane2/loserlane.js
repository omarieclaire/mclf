const CONFIG = {
  GAME: {
    WIDTH: 41,
    HEIGHT: Math.floor(window.innerHeight / 20),
    INITIAL_SPEED: 500,
    MIN_SPEED: 300,
    SPEED_DECREASE_RATE: 0.995,
    CYCLIST_Y: Math.floor(window.innerHeight / 40),
    DOUBLE_TAP_TIME: 350,
    lastKeys: {
      left: 0,
      right: 0,
    },
    ANIMATION_FRAMES: {
      WANDERER_WAIT: 20,
      DEATH_SEQUENCE: 15,
    },
    keyPressCount: {
      left: 0,
      right: 0,
    },
  },
  SPAWN_RATES: {
    TTC: 0.05,
    TTC_LANE_DEATHMACHINE: 0.8,
    ONCOMING_DEATHMACHINE: 0.4,
    PARKED_DEATHMACHINE: 0.2,
    DOOR_OPENING: 0.4,
    WANDERER: 0.9,
    BUILDING: 0.9,
  },
  SAFE_DISTANCE: {
    TTC: 8,
    TTC_LANE_DEATHMACHINE: 8,
    ONCOMING_DEATHMACHINE: 8,
    PARKED: 1,
    WANDERER: 3,
    BUILDING: 0,
    TTC_TO_TTC: 20,
    TTC_TO_DEATHMACHINE: 15,
    DEFAULT: 5,
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
        STOP_INTERVAL_MIN: 6, // 5 seconds
        STOP_INTERVAL_MAX: 24, // 15 seconds
        STOP_DURATION_MIN: 2, // 2 seconds
        STOP_DURATION_MAX: 4, // 4 seconds
      },
    },
  },
  LANES: {
    ONCOMING: 2,
    DIVIDER: 7,
    TRACKS: 10,
    BIKE: 15,
    BIKE_RIGHT: 18,
    PARKED: 20,
    SIDEWALK: 28,
    BUILDINGS: 31,
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
    BUILDING_OVERLAP_THRESHOLD: 0.1,
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
  INPUT: {
    TOUCH: {
      SENSITIVITY: 1.0,
      DRAG_THRESHOLD: 10,
      TAP_DURATION: 200,
    },
    KEYBOARD: {
      REPEAT_DELAY: 200,
      REPEAT_RATE: 50,
    },
  },
  DIFFICULTY: {
    LEVELS: {
      EASY: { speedMultiplier: 0.8, spawnRateMultiplier: 0.7 },
      NORMAL: { speedMultiplier: 1.0, spawnRateMultiplier: 1.0 },
      HARD: { speedMultiplier: 1.2, spawnRateMultiplier: 1.3 },
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

  GAMEPLAY: {
    SCORE_MULTIPLIER: 1,
    BASE_DIFFICULTY: 1.0,
    DIFFICULTY_INCREASE_RATE: 0.01,
    MAX_DIFFICULTY: 2.0,
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
  constructor(config) {
    this.config = config;
    // Initialize grid system for spatial partitioning
    this.grid = new GridSystem(config);
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
    console.log("Setting game reference in SpatialManager", {
      hasGame: !!game,
      doubleJumpPending: game.doubleJumpPending,
    });
    this.game = game;
    this.collisionManager = new CollisionManager(this);
  }
  update() {
    // Cleanup: Remove darlings that have moved off screen
    // Using a 5-pixel buffer zone above and below the game height
    this.darlings.forEach((entity) => {
      if (entity.position.y > this.config.GAME.HEIGHT + 5 || entity.position.y + entity.height < -5) {
        this.removeEntityFromSpatialManagementSystem(entity);
      }
    });

    // Update all subsystems in sequence:
    // 1. Process entity movements
    this.movementCoordinator.update();
    // 2. Check and resolve collisions
    this.collisionManager.collisionManagerUpdate();
    // 3. Update individual entity behaviors
    this.darlings.forEach((entity) => entity.behavior.update());
  }

  validateIfEntityCanMoveToNewPos(entityTryingToMove, proposedNewPostion) {
    return this.collisionManager.validateMovement(entityTryingToMove, proposedNewPostion);
  }

  addEntityToSpatialManagementSystem(entityToRegister) {
    // Set reference to this spatial manager in the entity
    entityToRegister.spatialManager = this;
    // Add to active darlings set
    this.darlings.add(entityToRegister);
    // Add to grid system for spatial partitioning
    this.grid.addDarlingToItsGridCell(entityToRegister);
  }

  removeEntityFromSpatialManagementSystem(entityToUnregister) {
    // Remove from active darlings set
    this.darlings.delete(entityToUnregister);
    // Remove from grid system
    this.grid.removeDarlingFromItsGridCell(entityToUnregister);
  }

  getAllObstaclesInASpecificLane(laneNumberToCheck) {
    // @returns {Array} Array of darlings in the specified lane
    return Array.from(this.darlings).filter((entity) => Math.floor(entity.position.x) === laneNumberToCheck);
  }

  getObstaclesOfASpecificType(entityType) {
    return Array.from(this.darlings).filter((entity) => entity.type === entityType);
  }
}
// =========================================
// GridSystem - Spatial Management
// =========================================
// implements spatial partitioning for collision detection and proximity queries.
// and divides the game world into a grid of cells and tracks which darlings are in each cell

class GridSystem {
  constructor(config) {
    this.config = config;
    // Define size of each grid cell - smaller cells are more precise but higher computational overhead
    this.cellSize = 5;
    // Map to store all occupied cells
    // Key: String coordinate in format "x,y"
    // Value: Set of entities in that cell
    this.cells = new Map();
  }

  // Convert world coordinates to grid cell coordinates
  // @returns {string} Unique key representing the cell coordinates
  getCellKey(worldXCoords, worldYCoords) {
    // Integer division to get cell coordinates
    const cellX = Math.floor(worldXCoords / this.cellSize);
    const cellY = Math.floor(worldYCoords / this.cellSize);
    return `${cellX},${cellY}`; // Create unique string key for the cell
  }

  addDarlingToItsGridCell(darlingToAdd) {
    // Get the cell coordinates for the entity's position
    const key = this.getCellKey(darlingToAdd.position.x, darlingToAdd.position.y);
    // Create a new Set for this cell if it doesn't exist
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    // Add the entity to its cell
    this.cells.get(key).add(darlingToAdd);
  }

  removeDarlingFromItsGridCell(darlingToRemove) {
    const key = this.getCellKey(darlingToRemove.position.x, darlingToRemove.position.y);
    const cell = this.cells.get(key);

    if (cell) {
      // Remove entity from its cell
      cell.delete(darlingToRemove);
      // If cell is empty, remove it from the grid entirely
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  updateDarlingsPositionInGridSystem(theDarlingThatMoved, oldPos, newPos) {
    const oldKey = this.getCellKey(oldPos.x, oldPos.y);
    const newKey = this.getCellKey(newPos.x, newPos.y);

    // Only update if darling has moved to a different cell
    if (oldKey !== newKey) {
      // Remove from old cell
      this.cells.get(oldKey)?.delete(theDarlingThatMoved);
      // Create new cell if needed and add entity
      if (!this.cells.has(newKey)) {
        this.cells.set(newKey, new Set());
      }
      this.cells.get(newKey).add(theDarlingThatMoved);
    }
  }

  // Find all darlings within a specified radius of a position
  // @returns {Array} Array of entities within the specified radius
  getNearbyDarlings(centerPositionToSearchAround, radiusInWorldUnits) {
    const nearbyDarlings = new Set();

    // Convert radius to cell units (rounded up)
    const cellRadius = Math.ceil(radiusInWorldUnits / this.cellSize);

    // Calculate center cell coordinates
    const centerCellX = Math.floor(centerPositionToSearchAround.x / this.cellSize);
    const centerCellY = Math.floor(centerPositionToSearchAround.y / this.cellSize);

    // Check all cells within the cell radius
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.cells.get(key);

        if (cell) {
          // For each entity in the cell, check if it's within the actual radius
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
// CollisionManager - Collision Management
// =========================================

class CollisionManager {
  constructor(spatialManager) {
    this.spatialManager = spatialManager;
    this.config = spatialManager.config;
  }

  /**
   * Basic AABB (Axis-Aligned Bounding Box) collision check between two hitboxes
   * @param {Object} hitboxA - First hitbox with x, y, width, height
   * @param {Object} hitboxB - Second hitbox with x, y, width, height
   * @returns {boolean} True if hitboxes overlap
   */
  checkCollision(hitboxA, hitboxB) {
    return !(
      hitboxA.x + hitboxA.width <= hitboxB.x ||
      hitboxA.x >= hitboxB.x + hitboxB.width ||
      hitboxA.y + hitboxA.height <= hitboxB.y ||
      hitboxA.y >= hitboxB.y + hitboxB.height
    );
  }

  /**
   * Specialized collision check for the player's bike
   * Handles different collision types (TTC, vehicles, tracks) and jumping mechanics
   * @returns {string|null} Collision type if collision occurred, null otherwise
   */

  checkBikeCollisionIsSpecial(bikeHitbox, darlings, isJumping) {
    // First check TTCs and other vehicles
    for (const darling of darlings.darlings) {
      // console.log(darlings.darlings);

      // Skip checking TTC collision only when jumping over tracks and it's a streetcar
      if (isJumping && darling.type === DarlingType.TTC) {
        const bikeCenter = bikeHitbox.x + bikeHitbox.width / 2;
        const TTCCenter = darling.position.x + darling.width / 2;
        // Only skip if bike is directly above the streetcar
        if (Math.abs(bikeCenter - TTCCenter) < 2) {
          continue;
        }
      }

      if (this.checkCollision(bikeHitbox, darling.getHitbox())) {
        const obstacleHitbox = darling.getHitbox();
        const collisionDirection = this.getCollisionDirection(bikeHitbox, obstacleHitbox);

        // If obstacle is moving and hits bike from behind, trigger collision
        if (darling.behavior?.baseSpeed > 0 && collisionDirection === "up") {
          switch (darling.type) {
            case DarlingType.TTC:
              return "TTC";
            case DarlingType.TTC_LANE_DEATHMACHINE:
            case DarlingType.ONCOMING_DEATHMACHINE:
              return "ONCOMING_DEATHMACHINE";
            case DarlingType.WANDERER:
              return "PEDESTRIAN";
            case DarlingType.BUILDING:
              return "BUILDING";
            default:
              return "TRAFFIC";
          }
        }

        // If bike runs into obstacle or obstacle hits from front
        if (darling.behavior?.baseSpeed <= 0 || collisionDirection !== "up") {
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
      }
    }
    for (const deathMachine of darlings.parkedDeathMachines) {
      if (this.checkCollision(bikeHitbox, deathMachine.getHitbox())) {
        return "PARKEDDEATHMACHINE";
      }
      if (deathMachine.behavior.doorHitbox && this.checkCollision(bikeHitbox, deathMachine.behavior.doorHitbox)) {
        return "DOOR";
      }
    }

    // Finally check track collisions when not jumping
    const trackPositions = [this.config.LANES.TRACKS + 1, this.config.LANES.TRACKS + 5];
    const bikeCenter = bikeHitbox.x + bikeHitbox.width / 2;
    if (!isJumping && trackPositions.includes(Math.floor(bikeCenter))) {
      return "TRACKS";
    }

    return null;
  }

  /**
   * Main update loop for collision detection
   * Checks all potentially colliding pairs and handles responses
   */
  collisionManagerUpdate() {
    const pairs = this.getCollisionPairs();

    for (const [entityA, entityB] of pairs) {
      // Special handling for bike collisions
      if (entityA.type === DarlingType.BIKE || entityB.type === DarlingType.BIKE) {
        const bike = entityA.type === DarlingType.BIKE ? entityA : entityB;
        const obstacle = entityA.type === DarlingType.BIKE ? entityB : entityA;

        const darlingsForCollision = {
          darlings: [obstacle],
          parkedDeathMachines: obstacle.type === DarlingType.PARKED_DEATHMACHINE ? [obstacle] : [],
        };

        const collisionType = this.checkBikeCollisionIsSpecial(bike.getHitbox(), darlingsForCollision, false);

        if (collisionType) {
          bike.behavior.onCollision(obstacle);
        }
      } else {
        // Handle collisions between non-bike entities
        this.handleEntityCollision(entityA, entityB);
      }
    }
  }

  /**
   * Handle collision between two non-player entities
   * Uses priority system to determine collision response
   */
  handleEntityCollision(entityA, entityB) {
    if (entityA.behavior.ignoreCollisions || entityB.behavior.ignoreCollisions) {
      return;
    }

    const priorityA = this.getEntityPriority(entityA);
    const priorityB = this.getEntityPriority(entityB);

    // Higher priority entity continues, lower priority adjusts
    if (priorityA > priorityB) {
      this.applyCollisionResponse(entityB, entityA);
    } else if (priorityB > priorityA) {
      this.applyCollisionResponse(entityA, entityB);
    } else {
      // Equal priority: both entities adjust
      this.applyCollisionResponse(entityA, entityB);
      this.applyCollisionResponse(entityB, entityA);
    }
  }

  /**
   * Apply appropriate collision response to an entity
   * Handles stopping, speed matching, and temporary pauses
   */
  applyCollisionResponse(entity, otherEntity) {
    if (!entity.behavior) return;

    const moveDirection = Math.sign(entity.behavior.baseSpeed || 0);
    const otherDirection = Math.sign(otherEntity.behavior.baseSpeed || 0);

    // Stop entities moving in opposite directions
    if (moveDirection * otherDirection < 0) {
      entity.behavior.stopped = true;
      setTimeout(() => {
        entity.behavior.stopped = false;
      }, 500);
      return;
    }

    // Match speeds if moving in same direction
    if (Math.abs(entity.behavior.baseSpeed) < Math.abs(otherEntity.behavior.baseSpeed)) {
      entity.behavior.baseSpeed = otherEntity.behavior.baseSpeed;
    }
  }

  getEntityPriority(entity) {
    const priorities = {
      [DarlingType.TTC]: 5,
      [DarlingType.TTC_LANE_DEATHMACHINE]: 4,
      [DarlingType.ONCOMING_DEATHMACHINE]: 3,
      [DarlingType.PARKED_DEATHMACHINE]: 2,
      [DarlingType.WANDERER]: 1,
      [DarlingType.BUILDING]: 0,
    };

    return priorities[entity.type] || 0;
  }

  getCollisionPairs() {
    const pairs = [];
    const darlings = Array.from(this.spatialManager.darlings);
    const processedPairs = new Set();

    for (let i = 0; i < darlings.length; i++) {
      const entityA = darlings[i];
      const nearby = this.spatialManager.grid.getNearbyDarlings(entityA.position, Math.max(entityA.width, entityA.height) * 2);

      for (const entityB of nearby) {
        if (entityA === entityB) continue;

        // Create a unique key for this pair
        const pairKey = [entityA.id, entityB.id].sort().join(",");
        if (processedPairs.has(pairKey)) continue;

        if (this.shouldCheckCollision(entityA, entityB) && this.checkCollision(entityA.getHitbox(), entityB.getHitbox())) {
          pairs.push([entityA, entityB]);
          processedPairs.add(pairKey);
        }
      }
    }

    return pairs;
  }

  shouldCheckCollision(entityA, entityB) {
    // Skip if either entity is set to ignore collisions
    if (entityA.behavior?.ignoreCollisions || entityB.behavior?.ignoreCollisions) {
      return false;
    }

    // Always check collisions with the bike
    if (entityA.type === DarlingType.BIKE || entityB.type === DarlingType.BIKE) {
      return true;
    }

    // Check if darlings are in adjacent or same lanes
    const xDistance = Math.abs(entityA.position.x - entityB.position.x);

    // Special handling for TTCs
    if (entityA.type === DarlingType.TTC || entityB.type === DarlingType.TTC) {
      return xDistance <= 2;
    }

    // Only check collisions for darlings in the same or adjacent lanes
    return xDistance <= 1;
  }

  validateMovement(entity, newPosition) {
    if (entity.behavior?.ignoreCollisions) {
      return true;
    }
    // Temporarily move entity to check position
    const tempPosition = entity.position;
    entity.position = newPosition;

    const radius = Math.max(entity.width, entity.height) * 2;
    const nearby = this.spatialManager.grid.getNearbyDarlings(newPosition, radius);

    let isValid = true;
    for (const other of nearby) {
      // Allow movement if colliding with bike
      if (other.type === DarlingType.BIKE) {
        continue;
      }

      if (other !== entity && this.shouldCheckCollision(entity, other) && this.checkCollision(entity.getHitbox(), other.getHitbox())) {
        isValid = false;
        break;
      }
    }

    entity.position = tempPosition;
    return isValid;
  }

  /**
   * Determines the direction of collision between two hitboxes
   * @returns {string} "up", "down", "left", or "right"
   */
  getCollisionDirection(hitboxA, hitboxB) {
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

    // Return the dominant direction of collision
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    } else {
      return dy > 0 ? "down" : "up";
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
  /**
   * Validates if a lane change is safe
   * Checks for sufficient spacing between entities
   */

  validateLaneChange(entity, newLane) {
    const laneOccupants = this.spatialManager.getLaneOccupants(newLane);
    const safeDistance = this.calculateSafeDistanceForLaneChangeIThink(entity);

    return laneOccupants.every((occupant) => Math.abs(occupant.position.y - entity.position.y) >= safeDistance);
  }
  /**
   * Calculates required safe distance for an entity type
   * @returns {number} Safe distance in game units
   */
  calculateSafeDistanceForLaneChangeIThink(entity) {
    const safeDistances = {
      [DarlingType.TTC]: CONFIG.SAFE_DISTANCE.TTC,
      [DarlingType.TTC_LANE_DEATHMACHINE]: CONFIG.SAFE_DISTANCE.TTC_LANE_DEATHMACHINE,
      [DarlingType.ONCOMING_DEATHMACHINE]: CONFIG.SAFE_DISTANCE.ONCOMING_DEATHMACHINE,
      [DarlingType.PARKED_DEATHMACHINE]: CONFIG.SAFE_DISTANCE.PARKED,
      [DarlingType.WANDERER]: CONFIG.SAFE_DISTANCE.WANDERER,
    };

    return safeDistances[entity.type] || CONFIG.SAFE_DISTANCE.DEFAULT;
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

  queueMovement(entity, destination, priority = 0) {
    const plan = {
      entity,
      destination,
      priority,
      path: [destination], // Simple direct path for now
      status: "queued",
    };

    this.activeMovements.set(entity, plan);
    return plan;
  }

  cancelMovement(entity) {
    this.activeMovements.delete(entity);
  }

  clearAllMovements() {
    this.activeMovements.clear();
  }

  getActiveMovements() {
    return Array.from(this.activeMovements.values());
  }

  isMoving(entity) {
    return this.activeMovements.has(entity);
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
    this.spatialManager = spatialManager;
    this.config = config;
    this.debugLog = false; // Set to true to debug wanderer spawning
    this.spawnRules = this.createSpawnConfigRulesForAllDarlingTypes();
  }

  /**
   * Creates spawn configuration rules for all entity types
   * Defines spacing, positioning, and lane rules
   * @returns {Map} Map of entity types to their spawn rules
   */
  createSpawnConfigRulesForAllDarlingTypes() {
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
            max: Math.floor(this.config.SAFE_DISTANCE.PARKED * 0.2),
          },
          laneRules: {
            allowedLanes: [this.config.LANES.PARKED],
            spawnPosition: {
              x: this.config.LANES.PARKED,
              y: -5,
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
              y: this.config.GAME.HEIGHT,
            },
            direction: -1,
          },
        },
      ],
    ]);
  }

  /**
   * Determines required spacing between different entity types
   * Handles special cases like TTC-to-TTC spacing
   */
  getRequiredSpacingBetweenDifferentDarlingTypes(entityTypeA, entityTypeB) {
    // Special cases first
    // Special case: TTC to TTC spacing
    if (entityTypeA === DarlingType.TTC && entityTypeB === DarlingType.TTC) {
      return this.config.SAFE_DISTANCE.TTC_TO_TTC;
    }
    // Special case: TTC to vehicle spacing
    if (entityTypeA === DarlingType.TTC && (entityTypeB === DarlingType.TTC_LANE_DEATHMACHINE || entityTypeB === DarlingType.ONCOMING_DEATHMACHINE)) {
      return this.config.SAFE_DISTANCE.TTC_TO_DEATHMACHINE;
    }

    // Default spacing calculation
    const baseDistance = this.config.SAFE_DISTANCE[entityTypeA] || this.config.SAFE_DISTANCE.DEFAULT;

    const finalDistance = baseDistance * (entityTypeA === entityTypeB ? 1.5 : 1);

    // console.log("Spacing calculation:", {
    //   baseDistance: baseDistance,
    //   finalDistance: finalDistance,
    // });

    return finalDistance;
  }

  /**
   * Validates if an entity can be spawned at a specific position
   * Checks lane rules and spacing requirements
   */
  canDarlingSpawnAtThisSpecificPos(darlingType, position) {
    const rules = this.spawnRules.get(darlingType);
    if (!rules) {
      // console.log("No spawn rules found for entity type:", entityType);
      return false;
    }

    // Check if lane is allowed
    const isLaneAllowed = rules.laneRules.allowedLanes.includes(Math.floor(position.x));
    if (!isLaneAllowed) {
      return false;
    }

    // Check nearby darlings for spacing
    const nearbyDarlings = Array.from(this.spatialManager.darlings).filter((entity) => {
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

      const hasSpace = distance >= requiredSpacing;
      if (!hasSpace) {
      }
      return hasSpace;
    });

    return isLaneAllowed && hasEnoughSpace;
  }

  spawnEntity(entityType) {
    if (entityType === DarlingType.ONCOMING_DEATHMACHINE) {
      // console.log("\n=== Attempting to spawn oncoming deathMachine ===");

      const spawnConfig = this.getSpawnConfig(entityType);
      if (!spawnConfig) {
        return null;
      }

      if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
        const deathMachine = new OncomingDeathmachine(this.config, spawnConfig);
        return deathMachine;
      } else {
        return null;
      }
    }

    if (entityType === DarlingType.WANDERER) {
      const isGoingUp = Math.random() < 0.5;
      if (this.debugLog) console.log(`Spawning wanderer going ${isGoingUp ? "up" : "down"}`);

      // Configure spawn position based on direction
      const spawnConfig = {
        position: new Position(isGoingUp ? this.config.LANES.SIDEWALK + 3 : this.config.LANES.SIDEWALK, isGoingUp ? this.config.GAME.HEIGHT + 1 : -1),
      };

      if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
        if (this.debugLog) console.log(`Spawning wanderer at position:`, spawnConfig.position);
        return new Wanderer(this.config, spawnConfig, isGoingUp);
      }
      if (this.debugLog) console.log(`Failed to spawn wanderer - position occupied`);
      return null;
    }

    // Handle other entity types
    const spawnConfig = this.getSpawnConfig(entityType);
    if (!spawnConfig) {
      if (this.debugLog) console.log(`No spawn config for ${entityType}`);
      return null;
    }

    if (this.canDarlingSpawnAtThisSpecificPos(entityType, spawnConfig.position)) {
      const EntityClass = this.getEntityClass(entityType);
      if (EntityClass) {
        return new EntityClass(this.config, spawnConfig);
      }
    }

    return null;
  }

  getSpawnConfig(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) return null;

    const config = {
      position: new Position(rules.laneRules.spawnPosition.x, rules.laneRules.spawnPosition.y),
      direction: rules.laneRules.direction,
    };

    return config;
  }

  getEntityClass(entityType) {
    const entityClasses = {
      [DarlingType.TTC]: TTC,
      [DarlingType.TTC_LANE_DEATHMACHINE]: TTCLaneDeathmachine,
      [DarlingType.ONCOMING_DEATHMACHINE]: OncomingDeathmachine,
      [DarlingType.PARKED_DEATHMACHINE]: ParkedDeathmachine,
      [DarlingType.WANDERER]: Wanderer,
      [DarlingType.BUILDING]: Building,
    };

    return entityClasses[entityType];
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
    [DarlingType.TTC, DarlingType.TTC_LANE_DEATHMACHINE, DarlingType.ONCOMING_DEATHMACHINE, DarlingType.PARKED_DEATHMACHINE].forEach((type) => {
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
      baseSpawnRate: 0.8, // Higher spawn rate during clustering
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

    // Use higher spawn rate during active cluster
    const effectiveRate = cluster.active ? this.clusterConfig.baseSpawnRate : baseSpawnRate;

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

    // console.log(`Starting cluster for ${entityType}:`, {
    //   targetSize: cluster.targetSize,
    //   spawnRate: this.clusterConfig.baseSpawnRate,
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

    // console.log(`Ending cluster for ${entityType}, gap timer:`, cluster.gapTimer);
  }

  isClusterActive(entityType) {
    return this.clusters.get(entityType)?.active || false;
  }

  getClusterInfo(entityType) {
    return this.clusters.get(entityType);
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
    this.building = entity;
    this.canMove = true;
  }

  update() {
    // Base update logic - implemented by child classes
  }

  onCollision(other) {
    // Base collision handling - implemented by child classes
  }

  canMoveTo(position) {
    if (!this.building.spatialManager) {
      console.warn("Entity has no spatial manager:", this.building);
      return false;
    }
    return this.building.spatialManager.validateIfEntityCanMoveToNewPos(this.building, position);
  }

  move(newPosition) {
    if (this.canMoveTo(newPosition)) {
      const oldPosition = this.building.position;
      this.building.position = newPosition;

      // Update grid position if spatial manager exists
      if (this.building.spatialManager?.grid) {
        this.building.spatialManager.grid.updateDarlingsPositionInGridSystem(this.building, oldPosition, newPosition);
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
    if (this.building.config) {
      if (position.x < 0 || position.x >= this.building.config.GAME.WIDTH) return false;
      if (position.y < -10 || position.y >= this.building.config.GAME.HEIGHT + 10) return false;
    }

    return true;
  }

  getState() {
    return {
      position: this.building.position,
      canMove: this.canMove,
      type: this.building.type,
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
    this.building.position.y += CONFIG.MOVEMENT.BASE_MOVE_SPEED;

    // If the building has reached the bottom of the screen
    if (this.building.position.y >= this.building.config.GAME.HEIGHT) {
      // Get all other buildings sorted by their Y position
      const buildings = Array.from(this.building.spatialManager.darlings)
        .filter((e) => e.type === DarlingType.BUILDING && e !== this.building)
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
          ? this.building.config.SPAWNING.MIN_BUILDING_HEIGHT
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
    console.log(`[BuildingBehavior] Updating building properties:`, {
      name: newBuilding.name,
      y: newY,
      height: newHeight,
    });

    // Update the building's properties
    this.building.position.y = newY;
    this.building.art = newBuilding.art;
    this.building.height = newHeight;
    this.building.name = newBuilding.name;
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
      const sameColumn = Math.abs(building.position.x - this.building.config.LANES.BUILDINGS) < 0.1;

      // If the new building overlaps with an existing building in the same column, return true to indicate an invalid position
      if (sameColumn && topOverlap && bottomOverlap) {
        console.log(`[BuildingBehavior] Collision detected with "${building.name}" at Y=${building.position.y}`);
        return true;
      }
      return false;
    });

    // Log the validation result
    console.log(`[BuildingBehavior] Position validation result:`, {
      y,
      height,
      isValid,
    });

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
    this.minDistance = options.minDistance || this.building.config.SAFE_DISTANCE.DEFAULT;
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
    return new Position(this.building.position.x, this.building.position.y + this.baseSpeed);
  }

  handleMovementBlocked() {
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 1000);
  }

  getNearbyDarlings() {
    if (!this.building.spatialManager) return [];

    return this.building.spatialManager.grid
      .getNearbyDarlings(this.building.position, Math.max(this.building.width, this.building.height) * 2)
      .filter((entity) => entity !== this.building && entity.type !== DarlingType.BIKE && Math.abs(entity.position.x - this.building.position.x) < 2);
  }

  updateAnimation() {
    // Override in child classes that need animation
  }
}
// =========================================
// WandererBehavior
// =========================================

class WandererBehavior extends EntityBehavior {
  constructor(entity, isGoingUp) {
    super(entity);
    this.building = entity;
    this.config = entity.config;
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -this.config.MOVEMENT.WANDERER_SPEED : this.config.MOVEMENT.WANDERER_SPEED;
    this.stopped = false;
    this.waitTime = 0;
    this.minDistance = this.config.SAFE_DISTANCE.WANDERER;

    // Assign lane based on direction
    this.lane = isGoingUp ? this.config.LANES.SIDEWALK + 2 : this.config.LANES.SIDEWALK;
    this.building.position.x = this.lane; // Set initial x position based on lane
  }

  shouldWait(nearbyDarlings) {
    return nearbyDarlings.some((other) => {
      // Only check for wanderers in the same lane
      if (Math.abs(other.position.x - this.building.position.x) > 0.1) {
        return false;
      }
      const distance = Math.abs(other.position.y - this.building.position.y);
      return distance < this.minDistance;
    });
  }

  update() {
    if (this.stopped) {
      this.waitTime--;
      if (this.waitTime <= 0) {
        this.stopped = false;
      }
      return;
    }

    const nearbyDarlings = this.getNearbyDarlings();

    if (this.shouldWait(nearbyDarlings)) {
      this.stopped = true;
      this.waitTime = this.config.GAME.ANIMATION_FRAMES.WANDERER_WAIT;
      return;
    }

    const newPosition = new Position(this.lane, this.building.position.y + this.baseSpeed);

    if (this.canMoveTo(newPosition)) {
      this.move(newPosition);
    }
  }

  getNearbyDarlings() {
    if (!this.building.spatialManager) return [];

    return this.building.spatialManager.grid.getNearbyDarlings(this.building.position, this.config.COLLISION.NEARBY_ENTITY_RADIUS).filter(
      (entity) =>
        entity !== this.building &&
        entity.type !== DarlingType.BIKE &&
        entity.type === DarlingType.WANDERER &&
        Math.abs(entity.position.x - this.building.position.x) < 0.1 // Only consider wanderers in same lane
    );
  }
}
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

class ParkedDeathmachineBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: CONFIG.MOVEMENT.BASE_MOVE_SPEED + CONFIG.MOVEMENT.BIKE_SPEED,

      minDistance: entity.config.SAFE_DISTANCE.PARKED,
      ignoreCollisions: false,
      hasAnimation: true,
    });

    this.doorState = DOOR_STATES.CLOSED;
    this.doorTimer = 0;
    this.doorHitbox = null;
    this.shouldOpenDoor = Math.random() < entity.config.SPAWNING.PARKED_DEATHMACHINE_DOOR_CHANCE;
    this.doorAnimationActive = false;
    this.lastDoorUpdate = Date.now();
    this.doorOpenDelay = entity.config.ANIMATIONS.DOOR_OPEN_DELAY;

    const targetPercentage =
      entity.config.SPAWNING.PARKED_DEATHMACHINE_MIN_Y +
      Math.random() * (entity.config.SPAWNING.PARKED_DEATHMACHINE_MAX_Y - entity.config.SPAWNING.PARKED_DEATHMACHINE_MIN_Y);
    this.doorOpenY = Math.floor(this.building.config.GAME.HEIGHT * targetPercentage);
  }

  updateAnimation() {
    if (
      this.shouldOpenDoor &&
      !this.doorAnimationActive &&
      this.building.position.y >= this.doorOpenY &&
      this.building.position.y <= this.doorOpenY + 2
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
    this.building.art = DARLINGS.PARKED_DEATHMACHINE_STATES[this.doorState];

    // Add door-opening animation class when door is opening
    if (this.doorState > 0) {
      this.building.animationClass = "parked-deathMachine door-opening animated";
    } else {
      this.building.animationClass = "parked-deathMachine animated";
    }

    const doorWidths = [0, 0.8, 1, 1.5, 1.8];
    const doorWidth = doorWidths[this.doorState];
    const hitboxHeight = this.doorState === DARLINGS.PARKED_DEATHMACHINE_STATES.length - 1 ? 0.8 : 1.8;

    this.doorHitbox = {
      x: this.building.position.x,
      y: this.building.position.y + 1,
      width: doorWidth,
      height: hitboxHeight,
    };
  }

  updateDoorHitbox() {
    if (this.doorHitbox) {
      this.doorHitbox.y = this.building.position.y + 1;
    }
  }

  // Override base collision handling for parked deathMachines
  onCollision(other) {
    if (other.type === DarlingType.BIKE) {
      return;
    }

    // Parked deathMachines don't move on collision, they just block
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 500);
  }
}
// =========================================
// TTCBehavior
// =========================================

class TTCBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -CONFIG.MOVEMENT.BASE_MOVE_SPEED,
      minDistance: entity.config.SAFE_DISTANCE.TTC,
      ignoreCollisions: false,
    });
    this.stuckTimer = 0;
    this.lastPosition = null;

    // New properties for stopping behavior
    this.isAtStop = false;
    this.stopTimer = 0;
    this.nextStopTime = this.getRandomStopTime();
    console.log(`TTC initialized with nextStopTime: ${this.nextStopTime}, stopTimer: ${this.stopTimer}`);
  }

  spawnWanderers() {
    if (this.wanderersSpawnedAtStop) return; // Prevent multiple spawns per stop

    // Get the spatial manager from the entity
    const spatialManager = this.building.spatialManager;
    if (!spatialManager) return;

    // Determine the number of wanderers to spawn
    const numWanderers = Math.floor(Math.random() * 3) + 1; // Spawn 1 to 3 wanderers

    for (let i = 0; i < numWanderers; i++) {
      const isGoingUp = Math.random() < 0.5;
      const offsetX = (Math.random() - 0.5) * 2; // Random offset between -1 and 1
      const spawnX = this.building.position.x + offsetX + this.building.width / 2;
      const spawnY = this.building.position.y + (isGoingUp ? -1 : this.building.height + 1);

      const spawnPosition = new Position(spawnX, spawnY);

      // Create a new wanderer entity
      const wanderer = new Wanderer(this.config, { position: spawnPosition }, isGoingUp);

      // Register the wanderer with the spatial manager
      spatialManager.addEntityToSpatialManagementSystem(wanderer);
    }

    this.wanderersSpawnedAtStop = true; // Mark as spawned for this stop
  }

  getRandomStopTime() {
    // Choose the desired difficulty level: EASY, NORMAL, or HARD
    const level = this.building.config.TTC.DIFFICULTY_LEVELS.HARD; // Change to EASY or HARD as needed
    const min = level.STOP_INTERVAL_MIN;
    const max = level.STOP_INTERVAL_MAX;
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated nextStopTime: ${time}`);
    return time;
  }

  getRandomStopDuration() {
    const level = this.building.config.TTC.DIFFICULTY_LEVELS.HARD; // Change to EASY or HARD as needed
    const min = level.STOP_DURATION_MIN;
    const max = level.STOP_DURATION_MAX;
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated stopDuration: ${duration}`);
    return duration;
  }

  shouldMove() {
    if (this.stopped) {
      // console.log("\n=== TTC Stopped ===", {
      //   position: this.entity.position,
      //   stopped: this.stopped,
      //   stuckTimer: this.stuckTimer,
      // });
      return false;
    }

    const nearbyDarlings = this.getNearbyDarlings();
    const shouldStop = this.shouldStop(nearbyDarlings);

    // Track if we're stuck in the same position
    if (this.lastPosition && this.lastPosition.y === this.building.position.y) {
      this.stuckTimer++;
      if (this.stuckTimer > 60) {
        // About 1 second at 60fps
        // console.log("\n=== TTC Potentially Stuck ===", {
        //   position: this.entity.position,
        //   nearbyDarlings: nearbyDarlings.map((e) => ({
        //     type: e.type,
        //     position: e.position,
        //     distance: Math.abs(e.position.y - this.entity.position.y),
        //   })),
        // });

        // Auto-unstuck mechanism
        if (this.stuckTimer > 120) {
          // 2 seconds
          // console.log("Attempting to unstick TTC");
          this.stopped = false;
          this.stuckTimer = 0;
          return true;
        }
      }
    } else {
      this.stuckTimer = 0;
    }

    this.lastPosition = { ...this.building.position };

    if (shouldStop) {
      // console.log("\n=== TTC Movement Blocked ===", {
      //   position: this.entity.position,
      //   nearbyDarlings: nearbyDarlings.map((e) => ({
      //     type: e.type,
      //     position: e.position,
      //     distance: Math.abs(e.position.y - this.entity.position.y),
      //   })),
      // });
    }

    return !shouldStop;
  }

  shouldStop(nearbyDarlings) {
    const blockingDarlings = nearbyDarlings.filter((other) => {
      const distance = Math.abs(other.position.y - this.building.position.y);
      const isTooClose = distance < this.minDistance;

      if (isTooClose) {
        // console.log(`Entity too close to TTC:`, {
        //   type: other.type,
        //   position: other.position,
        //   distance: distance,
        //   minRequired: this.minDistance,
        // });
      }

      return isTooClose;
    });

    return blockingDarlings.length > 0;
  }
  update() {
    // console.log(`TTC Update - isAtStop: ${this.isAtStop}, nextStopTime: ${this.nextStopTime}, stopTimer: ${this.stopTimer}`);

    if (this.isAtStop) {
      // TTC is at a stop
      this.stopTimer--;
      // console.log(`TTC is stopped. stopTimer decremented to: ${this.stopTimer}`);
      if (this.stopTimer <= 0) {
        this.isAtStop = false;
        this.nextStopTime = this.getRandomStopTime();
        // console.log("TTC is resuming movement at position:", this.entity.position);
      }
      return; // Skip movement while stopped
    } else {
      // Decrement the timer until the next stop
      this.nextStopTime--;
      // console.log(`TTC is moving. nextStopTime decremented to: ${this.nextStopTime}`);
      if (this.nextStopTime <= 0) {
        this.isAtStop = true;
        this.stopTimer = this.getRandomStopDuration();
        // console.log("TTC is stopping at position:", this.entity.position);
        return; // Stop moving this frame
      }

      if (this.isAtStop) {
        // TTC is at a stop
        this.stopTimer--;
        console.log(`TTC is stopped. stopTimer decremented to: ${this.stopTimer}`);

        // Spawn wanderers if not already done
        this.spawnWanderers();

        if (this.stopTimer <= 0) {
          this.isAtStop = false;
          this.wanderersSpawnedAtStop = false; // Reset for next stop
          this.nextStopTime = this.getRandomStopTime();
          console.log("TTC is resuming movement at position:", this.building.position);
        }
        return; // Skip movement while stopped
      }
    }

    // Existing movement logic
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
  }

  handleMovementBlocked() {
    this.stopped = true;
    // console.log("\n=== TTC Movement Blocked ===", {
    //   position: this.entity.position,
    //   stuckTimer: this.stuckTimer,
    // });

    setTimeout(() => {
      // console.log("\n=== Attempting to Resume TTC Movement ===", {
      //   position: this.entity.position,
      // });
      this.stopped = false;
    }, 1000);
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
    this.building.position.y += this.baseSpeed;
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
    this.maxAttempts = 7; // Add max attempts limit
  }

  handleParking() {
    this.parkingAttempts++;

    // If we've tried too many times, force transform
    if (this.parkingAttempts > this.maxAttempts) {
      // console.log("Max parking attempts reached, forcing transformation");
      this.transformToParkedDeathmachine();
      return;
    }

    const currentX = this.building.position.x;
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
      const newPosition = new Position(currentX + moveDirection * speedMultiplier, this.building.position.y + verticalSpeed);

      if (this.building.spatialManager.validateIfEntityCanMoveToNewPos(this.building, newPosition)) {
        this.building.spatialManager.movementCoordinator.moveEntity(this.building, newPosition);

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
    const spatialManager = this.building.spatialManager;
    const targetPosition = new Position(this.targetLane, this.building.position.y);

    // console.log("\n=== Starting Parking Transform ===");
    console.log("Original vehicle position:", {
      x: this.building.position.x,
      y: this.building.position.y,
    });

    // Get nearby darlings before transformation
    const nearbyDarlings = spatialManager.grid.getNearbyDarlings(targetPosition, this.building.config.SAFE_DISTANCE.PARKED * 2);

    const nearbyparkedDeathMachines = nearbyDarlings.filter((e) => e.type === DarlingType.PARKED_DEATHMACHINE);

    // Calculate initial safe position
    let safeY = targetPosition.y;
    const minSpacing = this.building.config.SAFE_DISTANCE.PARKED;

    // Create parked deathMachine to test positions
    const parkedDeathmachine = new ParkedDeathmachine(this.building.config, {
      position: new Position(this.targetLane, safeY),
    });
    parkedDeathmachine.behavior.baseSpeed = 1;

    // Try to find a valid position
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 15; // Increased from 10 to give more chances

    while (!validPosition && attempts < maxAttempts) {
      validPosition = spatialManager.validateIfEntityCanMoveToNewPos(parkedDeathmachine, parkedDeathmachine.position);
      // console.log(`Trying position at y: ${safeY}, valid: ${validPosition}`);

      if (!validPosition) {
        safeY += minSpacing;
        parkedDeathmachine.position.y = safeY;
        attempts++;
      }
    }

    if (validPosition) {
      console.log("Found valid position at y:", safeY);
      // Only register the new deathMachine and remove the old one if we found a valid position
      spatialManager.addEntityToSpatialManagementSystem(parkedDeathmachine);
      spatialManager.removeEntityFromSpatialManagementSystem(this.building);

      console.log("=== Parking Transform Complete ===");
      console.log("Final parked deathMachine position:", {
        x: parkedDeathmachine.position.x,
        y: parkedDeathmachine.position.y,
        hitbox: parkedDeathmachine.getHitbox(),
      });
    } else {
      console.warn("Failed to find valid parking position after", attempts, "attempts");
      // Keep the original deathMachine moving if we can't find a parking spot
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
    const nearbyDarlings = this.building.spatialManager.grid.getNearbyDarlings(new Position(this.targetLane, this.building.position.y), 6);

    const nearbyparkedDeathMachines = nearbyDarlings.filter(
      (e) => e.type === DarlingType.PARKED_DEATHMACHINE || (e.type === DarlingType.TTC_LANE_DEATHMACHINE && e.behavior.isParking)
    );

    const hasSpace = !nearbyparkedDeathMachines.some((deathMachine) => Math.abs(deathMachine.position.y - this.building.position.y) < 6);

    return hasSpace;
  }
}
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// =========================================

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
    this.id = Date.now() + Math.random().toString(36);
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
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new ParkedDeathmachineBehavior(this);
  }

  getHitbox() {
    return {
      x: this.position.x + 2,
      y: this.position.y,
      width: 4,
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

class Wanderer extends BaseEntity {
  constructor(config, spawnConfig, isGoingUp) {
    super(config, spawnConfig, DarlingType.WANDERER);

    const wandererColor = peopleCol[Math.floor(Math.random() * peopleCol.length)];

    // Choose art based on direction
    const template = isGoingUp ? DARLINGS.WANDERER.UP : DARLINGS.WANDERER.DOWN;
    this.width = template.width;
    this.height = template.height;
    this.art = template.art;
    this.color = `<span style='color: ${wandererColor}'>`;

    // this.color = STYLES.RESET;

    // Modify spawn position based on direction
    if (isGoingUp) {
      spawnConfig.position.y = config.GAME.HEIGHT + 1; // Spawn at bottom for upward
      spawnConfig.position.x = config.LANES.SIDEWALK + 1; // Right side of sidewalk
    } else {
      spawnConfig.position.y = -1; // Spawn at top for downward
      spawnConfig.position.x = config.LANES.SIDEWALK; // Left side of sidewalk
    }

    this.position = new Position(spawnConfig.position.x, spawnConfig.position.y);
    this.behavior = new WandererBehavior(this, isGoingUp);
  }
}
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

// =========================================
// OptimizedGridSystem - Visual Rendering Grid
// =========================================
class OptimizedGridSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    // 2D array representing the game screen, each cell contains:
    // - content: The character to display
    // - style: CSS styling/color information
    // - dirty: Whether the cell needs redrawing
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
    // Track which cells need updating for optimization
    this.dirtyRegions = new Set();
  }

  // Mark a rectangular region as needing redraw
  markRegionDirty(x1, y1, x2, y2) {
    for (let y = Math.max(0, Math.floor(y1)); y < Math.min(this.height, Math.ceil(y2)); y++) {
      for (let x = Math.max(0, Math.floor(x1)); x < Math.min(this.width, Math.ceil(x2)); x++) {
        this.grid[y][x].dirty = true;
        this.dirtyRegions.add(`${x},${y}`);
      }
    }
  }

  // Update a single cell's content and style
  updateCell(x, y, content, style = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const cell = this.grid[y][x];
    // Only mark as dirty if content or style actually changed
    if (cell.content !== content || cell.style !== style) {
      cell.content = content;
      cell.style = style;
      cell.dirty = true;
      this.dirtyRegions.add(`${x},${y}`);
    }
  }

  // Reset dirty cells to empty state
  clear() {
    this.dirtyRegions.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      this.grid[y][x] = {
        content: " ",
        style: null,
        dirty: false,
      };
    });
    this.dirtyRegions.clear();
  }

  // Convert grid to HTML string for rendering
  render() {
    let output = [];
    let currentRow = [];
    let lastStyle = null;

    for (let y = 0; y < this.height; y++) {
      currentRow = [];
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        // Only add style tags when style changes
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

  /**
   * Get all active characters and their styles from the grid
   * @returns {Array<{x: number, y: number, content: string, style: string|null}>}
   */
  getActiveCharacters() {
    const activeChars = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        // Include any cell that isn't an empty space
        if (cell.content !== " ") {
          activeChars.push({
            x,
            y,
            content: cell.content,
            style: cell.style,
          });
        }
      }
    }

    return activeChars;
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
    // Add timing tracking to base class since both controls need it
    this.lastInput = {
      left: 0,
      right: 0,
    };
    this.inputStartPosition = null; // Track starting position for both controls
  }

  // Handle the input consistently for both keyboard and touch
  handleInput(direction, now) {
    if (!this.game.state?.isPlaying) return;

    // If we're in an immunity window AND on a track, do a jump
    if (
      this.game.doubleJumpPending &&
      (this.game.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK1 || this.game.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK2)
    ) {
      console.log("Second tap during immunity - jumping!", {
        currentLane: this.game.state.currentLane,
      });
      this.game.handleJump(direction);
    } else {
      console.log("Regular move", {
        currentLane: this.game.state.currentLane,
      });
      this.game.movePlayer(direction);
    }
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

class TouchControls extends BaseControl {
  constructor(game) {
    super(game);
    this.setupTouchControls();
  }

  setupTouchControls() {
    const leftControl = document.getElementById("move-left");
    const rightControl = document.getElementById("move-right");

    if (!leftControl || !rightControl) return;

    const handleTouch = (direction) => (e) => {
      e.preventDefault();
      this.handleInput(direction, performance.now());
    };

    leftControl.addEventListener("touchstart", handleTouch("left"));
    rightControl.addEventListener("touchstart", handleTouch("right"));
  }
}

class KeyboardControls extends BaseControl {
  constructor(game) {
    super(game);
    this.setupKeyboardControls();
  }

  setupKeyboardControls() {
    this.addEventListenerWithTracking(document, "keydown", (e) => {
      if (!this.game.state.isPlaying) {
        if (e.key === " " || e.key === "Spacebar") {
          this.game.start();
          document.getElementById("title-box").style.visibility = "visible";
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        this.handleInput("left", performance.now());
      } else if (e.key === "ArrowRight") {
        this.handleInput("right", performance.now());
      } else if (e.key === "p" || e.key === "P") {
        this.game.togglePause();
      }
    });
  }
}

class UIControls extends BaseControl {
  constructor(game) {
    super(game);
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
            window.open("building-generator.html", "_blank");
          }
          return;
        }

        if (!this.game.state.isPlaying) {
          let titleBox = document.getElementById("title-box-container");
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
  }

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  setupSettingsControls() {
    // Toggle settings window with 'd' key
    this.addEventListenerWithTracking(document, "keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        const settingsWindow = document.getElementById("settings-window");
        if (settingsWindow) {
          settingsWindow.style.display = settingsWindow.style.display === "none" ? "block" : "none";
        }
      }
    });

    // Setup individual settings
    this.setupSettingControl("initial-speed", (value) => {
      CONFIG.GAME.INITIAL_SPEED = parseInt(value);
    });

    this.setupSettingControl("min-speed", (value) => {
      CONFIG.GAME.MIN_SPEED = parseInt(value);
    });
  }

  setupSettingControl(id, callback) {
    const element = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);

    if (element && valueDisplay) {
      this.addEventListenerWithTracking(element, "input", (e) => {
        const value = e.target.value;
        valueDisplay.textContent = value;
        callback(value);
      });
    }
  }

  cleanup() {
    // Remove all tracked event listeners
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler, options }) => {
        element.removeEventListener(type, handler, options);
      });
    });
    this.eventListeners.clear();
  }
}
// =========================================
// LoserLane
// =========================================

class LoserLane {
  /**
   * Initializes the game engine and core systems
   * @constructor
   */
  constructor() {
    // === Core Game State ===
    this.config = CONFIG;
    this.state = new GameState(this.config);
    this.eventListeners = new Map(); // Add this for event tracking

    // === Game System Flags ===
    this.doubleJumpPendingGiveMeImmunity = false; // Track jump state before system init
    this.immunityTimer = null; // Track immunity window
    this.debug = true;
    this.frameId = null;

    // === Core Systems ===
    this.spatialManager = new SpatialManager(this.config);
    this.spatialManager.setGame(this);
    this.gridSystem = new OptimizedGridSystem(this.config.GAME.WIDTH, this.config.GAME.HEIGHT);

    // === Timing Systems ===
    this.initialLastMove = performance.now();
    this.lastFrameTime = performance.now();

    // === Game Components ===
    this.initializeGameComponents();
  }

  initializeGameComponents() {
    // Initialize world first
    this.initializeGameWorld();

    // Initialize managers after world setup
    this.clusterManager = new VehicleClusterManager(CONFIG);
    this.controls = new Controls(this);
    this.settingsManager = new SettingsManager(this);
  }

  // 1. Initialization methods (initializeGameWorld, initializeBuildings, etc.)

  initializeGameWorld() {
    this.spatialManager.darlings.clear();
    this.initializeBuildings();
    this.initializeparkedDeathMachines();
    this.bike = this.updateBike();
    this.spatialManager.addEntityToSpatialManagementSystem(this.bike);
  }

  initializeBuildings() {
    console.log("initializeBuildings spawn"); //findme

    let currentY = CONFIG.GAME.HEIGHT;
    const minSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 0; // Ensure minimum spacing

    while (currentY > CONFIG.SPAWNING.MIN_BUILDING_HEIGHT) {
      // Get current buildings sorted by Y position
      const existingBuildings = Array.from(this.spatialManager.darlings)
        .filter((e) => e.type === DarlingType.BUILDING)
        .sort((a, b) => a.position.y - b.position.y);

      const newBuilding = new Building(CONFIG, currentY);

      // Check for collisions with proper hitbox calculations
      const hasCollision = existingBuildings.some((existing) => {
        // Calculate overlap bounds
        const topOverlap = currentY < existing.position.y + existing.height + minSpacing;
        const bottomOverlap = currentY + newBuilding.height + minSpacing > existing.position.y;

        // Check x-axis alignment (buildings are in same column)
        const sameColumn = Math.abs(existing.position.x - CONFIG.LANES.BUILDINGS) < 0.1;

        return sameColumn && topOverlap && bottomOverlap;
      });

      if (!hasCollision) {
        this.spatialManager.addEntityToSpatialManagementSystem(newBuilding);
        // Move up by building height plus minimum spacing
        currentY -= newBuilding.height + minSpacing;
      } else {
        // If collision detected, move up by a smaller increment
        currentY -= minSpacing;
      }
    }
  }
  initializeparkedDeathMachines() {
    let currentY = CONFIG.GAME.HEIGHT;
    while (currentY > -5) {
      const spawnConfig = {
        position: new Position(CONFIG.LANES.PARKED, currentY),
      };

      const deathMachine = new ParkedDeathmachine(CONFIG, spawnConfig);
      if (this.spatialManager.spawnManager.canDarlingSpawnAtThisSpecificPos(DarlingType.PARKED_DEATHMACHINE, deathMachine.position)) {
        this.spatialManager.addEntityToSpatialManagementSystem(deathMachine);
        currentY -= deathMachine.height + 1;
      } else {
        currentY -= 1;
      }
    }
  }

  // 2. Core game loop methods (update, render)

  /**
   * Main game update function called on each animation frame
   */

  update(timestamp) {
    if (!timestamp || this.state.isPaused) {
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    // Regular game update at fixed interval
    const deltaTime = timestamp - this.lastFrameTime;
    if (deltaTime >= this.state.speed) {
      this.lastFrameTime = timestamp;

      if (this.state.isDead) {
        if (this.state.updateDeathAnimation()) {
          this.cleanup();
          return;
        }
      } else {
        // Update game state
        this.spatialManager.update();
        this.spawnDarlings();
        this.state.incrementScore();
        this.state.updateSpeed();
        this.updateScoreDisplay();
      }
    }

    // Always update and render bike position
    this.render();

    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  render() {
    if (this.state.isDead && this.state.deathState.animation >= 10) return;

    this.gridSystem.clear();
    this.drawRoadFeatures();
    this.drawBike();
    this.drawDarlings();

    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.innerHTML = this.gridSystem.render();
    }
  }

  // 3. Player control methods (movePlayer, handleJump)

  movePlayer(direction) {
    if (this.state.isDead || !this.state.isPlaying) return;

    const moveAmount = direction === "left" ? -1 : 1;
    const newLane = Math.floor(this.state.currentLane + moveAmount);

    // Update position
    this.state.currentLane = Math.max(CONFIG.LANES.ONCOMING, Math.min(newLane, CONFIG.LANES.BUILDINGS - 1));
    this.updateBikePosition();

    // Check collisions
    // this.checkBikeCollisions();

    // const isOnTrack = this.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK1 || this.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK2;

    // if (isOnTrack && !this.doubleJumpPending) {
    //   // console.log("Starting immunity window - on track at:", Date.now());
    //   // this.doubleJumpPending = true;
    //   // if (this.immunityTimer) {
    //   //   console.log("Clearing existing timer");
    //   //   clearTimeout(this.immunityTimer);
    //   // }
    //   // this.immunityTimer = setTimeout(() => {
    //   //   console.log("Timer expired at:", Date.now());
    //   //   this.doubleJumpPending = false;
    //   //   if (this.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK1 ||
    //   //       this.state.currentLane === CONFIG.KILLERLANES.KILLERTRACK2) {
    //   //     this.die("TRACKS");
    //   //     console.log(`should be dead`);
    //   //   }
    //   //   console.log(`not on the tracks anymore, doubleJumpPending is ${this.doubleJumpPending}`);
    //   // }, 100);
    // }
  }
  handleJump(direction) {
    // Don't allow new jumps while already jumping
    if (this.state.isJumping) {
      return;
    }

    // Move bike
    const moveAmount = CONFIG.MOVEMENT.JUMP_AMOUNT;
    if (direction === "left") {
      this.state.currentLane = Math.max(this.state.currentLane - moveAmount, CONFIG.LANES.ONCOMING);
    } else {
      this.state.currentLane = Math.min(this.state.currentLane + moveAmount, CONFIG.LANES.BUILDINGS - 1);
    }

    // Start jump
    this.state.isJumping = true;

    // End jump after duration
    setTimeout(() => {
      this.state.isJumping = false;
    }, CONFIG.MOVEMENT.JUMP_DURATION);
  }

  updateBikePosition() {
    if (this.bike) {
      // Add check to ensure bike exists
      this.bike.position = new Position(this.state.currentLane, this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y);
    }
  }

  // 4. Entity management methods (spawnDarlings, updateBike)
  spawnDarlings() {
    // console.log("\n=== Spawn Cycle Config ===", {
    //   TTCRate: CONFIG.SPAWN_RATES.TTC,
    //   TTCLaneDeathmachineRate: CONFIG.SPAWN_RATES.TTC_LANE_DEATHMACHINE,
    //   oncomingDeathmachineRate: CONFIG.SPAWN_RATES.ONCOMING_DEATHMACHINE,
    //   parkedDeathmachineRate: CONFIG.SPAWN_RATES.PARKED_DEATHMACHINE,
    //   TTCLane: CONFIG.LANES.TRACKS,
    //   TTCLaneDeathmachine: CONFIG.LANES.TRACKS + 1,
    //   oncomingLane: CONFIG.LANES.ONCOMING,
    //   parkedLane: CONFIG.LANES.PARKED,
    //   TTCRate: CONFIG.SPAWN_RATES.TTC,
    //   TTCLaneDeathmachineRate: CONFIG.SPAWN_RATES.TTC_LANE_DEATHMACHINE,
    //   oncomingDeathmachineRate: CONFIG.SPAWN_RATES.ONCOMING_DEATHMACHINE,
    //   parkedDeathmachineRate: CONFIG.SPAWN_RATES.PARKED_DEATHMACHINE,
    // });

    const spawnChecks = [
      { type: DarlingType.TTC, rate: CONFIG.SPAWN_RATES.TTC },
      { type: DarlingType.TTC_LANE_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.TTC_LANE_DEATHMACHINE },
      { type: DarlingType.ONCOMING_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.ONCOMING_DEATHMACHINE },
      { type: DarlingType.PARKED_DEATHMACHINE, rate: CONFIG.SPAWN_RATES.PARKED_DEATHMACHINE },
      { type: DarlingType.WANDERER, rate: CONFIG.SPAWN_RATES.WANDERER },
    ];

    spawnChecks.forEach(({ type, rate }) => {
      if (type === DarlingType.WANDERER) {
        // Handle wanderer spawning normally
        if (Math.random() < rate) {
          const entity = this.spatialManager.spawnManager.spawnEntity(type);
          if (entity) {
            this.spatialManager.addEntityToSpatialManagementSystem(entity);
          }
        }
      } else {
        // Use cluster manager for vehicles
        if (this.clusterManager.shouldSpawnVehicle(type, rate)) {
          const entity = this.spatialManager.spawnManager.spawnEntity(type);
          if (entity) {
            this.spatialManager.addEntityToSpatialManagementSystem(entity);
          }
        }
      }
    });
  }

  updateBike() {
    const bikeEntity = new BaseEntity(
      this.config,
      {
        position: new Position(this.state.currentLane, CONFIG.GAME.CYCLIST_Y),
      },
      DarlingType.BIKE
    );

    bikeEntity.width = DARLINGS.BIKE.width;
    bikeEntity.height = DARLINGS.BIKE.height;
    bikeEntity.art = DARLINGS.BIKE.art;
    bikeEntity.color = STYLES.BIKE;
    bikeEntity.behavior = new BikeBehavior(bikeEntity);

    return bikeEntity;
  }

  /**
   * Main game update function called on each animation frame
   */



  update(timestamp) {
    if (!timestamp || this.state.isPaused) {
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    // if (this.state.isPaused) {
    //   this.frameId = requestAnimationFrame((t) => this.update(t));
    //   return;
    // }
  
    // Regular game update at fixed interval
    const deltaTime = timestamp - this.lastFrameTime;
    if (deltaTime >= this.state.speed) {
      this.lastFrameTime = timestamp;
  
      if (this.state.isDead) {
        if (this.state.updateDeathAnimation()) {
          this.cleanup();
          return;
        }
      } else {
        // Update game state
        this.spatialManager.update();
        this.updateBikePosition();
        this.spawnDarlings();
        this.checkBikeCollisions();
        this.state.incrementScore();
        this.state.updateSpeed();
        this.updateScoreDisplay();
      }
    }
  
    // Always update and render bike position
    this.render();
  
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }
  

  // 5. Collision methods (checkBikeCollisions)

  checkBikeCollisions() {
    const bikeHitbox = {
      x: this.state.currentLane,
      y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      width: DARLINGS.BIKE.width,
      height: DARLINGS.BIKE.height,
    };

    const darlingsForCollision = {
      darlings: Array.from(this.spatialManager.darlings).filter((e) => e.type !== DarlingType.BIKE && e.type !== DarlingType.PARKED_DEATHMACHINE),
      parkedDeathMachines: Array.from(this.spatialManager.darlings).filter((e) => e.type === DarlingType.PARKED_DEATHMACHINE),
    };

    const collision = this.spatialManager.collisionManager.checkBikeCollisionIsSpecial(bikeHitbox, darlingsForCollision, this.state.isJumping);

    if (collision) {
      this.die(collision);
    }
  }

  // 6. Rendering methods (drawRoadFeatures, drawBike, etc.)

  render() {
    if (this.state.isDead && this.state.deathState.animation >= 10) return;

    this.gridSystem.clear();
    this.drawRoadFeatures();
    this.drawBike();
    this.drawDarlings();

    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.innerHTML = this.gridSystem.render();
    }
  }

  drawRoadFeatures() {
    for (let y = 0; y < CONFIG.GAME.HEIGHT; y++) {
      this.gridSystem.updateCell(CONFIG.LANES.DIVIDER, y, "║", STYLES.TRAFFIC);
      this.gridSystem.updateCell(CONFIG.LANES.DIVIDER + 1, y, "║", STYLES.TRAFFIC);
      this.gridSystem.updateCell(CONFIG.LANES.TRACKS + 1, y, "║", STYLES.TRACKS);
      this.gridSystem.updateCell(CONFIG.LANES.TRACKS + 5, y, "║", STYLES.TRACKS);

      if (y % 3 === 0) {
        this.gridSystem.updateCell(CONFIG.LANES.BIKE - 1, y, " ", STYLES.TRAFFIC);
      }

      for (let x = CONFIG.LANES.SIDEWALK; x < CONFIG.LANES.BUILDINGS; x++) {
        this.gridSystem.updateCell(x, y, " ", STYLES.SIDEWALK);
      }
    }
  }

  drawDarlings() {
    this.spatialManager.darlings.forEach((entity) => {
      if (entity.type !== DarlingType.BIKE) {
        this.drawEntity(entity);
      }
    });
  }
  drawEntity(entity) {
    if (!entity || !entity.art) return;

    if (entity.position.y + entity.height >= 0 && entity.position.y < CONFIG.GAME.HEIGHT) {
      const isDying = this.state.isDead;

      entity.art.forEach((line, i) => {
        if (entity.position.y + i >= 0 && entity.position.y + i < CONFIG.GAME.HEIGHT) {
          line.split("").forEach((char, x) => {
            if (char !== " " && entity.position.x + x >= 0 && entity.position.x + x < CONFIG.GAME.WIDTH) {
              let effectClass = "entity ";
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

              // Add death animation classes if dying
              if (isDying) {
                const isEdge = /[┌┐│╰╯]/.test(char);
                const glitchClass = isEdge ? "char-glitch edge" : "char-glitch body";
                effectClass += ` ${glitchClass}`;
              }

              const wrappedChar = `<span class="${effectClass}">${char}</span>`;
              this.gridSystem.updateCell(Math.floor(entity.position.x + x), Math.floor(entity.position.y + i), wrappedChar, entity.color);
            }
          });
        }
      });
    }
  }

  drawBike() {
    if (this.state.isDead && this.state.deathState.animation < 15) {
      // Get current animation frame
      const frameIndex = Math.min(4, Math.floor(this.state.deathState.animation / 3));
      const frames = Object.values(EXPLOSION_FRAMES);
      const currentFrame = frames[frameIndex];

      // Get current color
      // const currentColor = EXPLOSION_COLOURS[this.state.deathState.colorIndex];
      const currentColor = EXPLOSION_COLOURS[Math.floor(Math.random() * EXPLOSION_COLOURS.length)];

      // console.log(currentColor);

      // Draw explosion with current frame and color
      currentFrame.forEach((line, i) => {
        line.split("").forEach((char, x) => {
          const deathY = this.state.deathState.y + i - 1; // Offset slightly up
          const deathX = this.state.deathState.x + x - 2; // Center the explosion

          if (deathY < CONFIG.GAME.HEIGHT && deathY >= 0 && deathX < CONFIG.GAME.WIDTH && deathX >= 0 && char !== " ") {
            // Add animation class and current color
            const animatedChar = `<span class="death-particle">${char}</span>`;
            this.gridSystem.updateCell(deathX, deathY, animatedChar, currentColor);
          }
        });
      });

      // Add additional particle effects
      this.drawDeathParticles();
    } else if (!this.state.isDead) {
      // Regular bike drawing code remains the same
      const bikeY = this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y;
      DARLINGS.BIKE.art.forEach((line, i) => {
        line.split("").forEach((char, x) => {
          if (char !== " ") {
            const gridX = Math.round(this.state.currentLane + x);
            if (gridX >= 0 && gridX < CONFIG.GAME.WIDTH) {
              // Add a CSS class to bike elements
              const bikeChar = `<span class="bike">${char}</span>`;
              this.gridSystem.updateCell(gridX, bikeY + i, bikeChar, STYLES.BIKE);
            }
          }
        });
      });
    }
  }

  drawDeathParticles() {
    // const particleChars = ['*', '.', '°', '⚡', '✦', '⚡'];

    const particleChars = ["", "⚡", "⚡"];

    const numParticles = Math.min(this.config.PARTICLES.MAX_DEATH_PARTICLES, this.state.deathState.animation * 2);

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const radius = this.state.deathState.animation / 2 + Math.random() * this.config.PARTICLES.PARTICLE_SPREAD;
      const x = Math.round(this.state.deathState.x + Math.cos(angle) * radius);
      const y = Math.round(this.state.deathState.y + Math.sin(angle) * radius);

      if (y < CONFIG.GAME.HEIGHT && y >= 0 && x < CONFIG.GAME.WIDTH && x >= 0) {
        const char = particleChars[Math.floor(Math.random() * particleChars.length)];
        const particleColor = EXPLOSION_COLOURS[Math.floor(Math.random() * EXPLOSION_COLOURS.length)];
        this.gridSystem.updateCell(x, y, `<span class="death-particle-outer">${char}</span>`, particleColor);
      }
    }
  }

  // 7. Game state methods (start, die, restart)

  start() {
    if (this.state.isPlaying) return;

    const messageBox = document.getElementById("main-msg-box");
    if (messageBox) {
      messageBox.style.display = "none";
    }

    this.state.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  die(reason) {
    this.state.isDead = true;

    // Store the death position using the current player position
    this.state.deathState = {
      animation: 0,
      x: Math.round(this.state.currentLane),
      y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      reason: reason,
      frameCounter: 0,
      colorIndex: 0,
    };

    // Add screen shake effect
    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.classList.add("screen-shake");

      // Create game over overlay
      const overlay = document.createElement("div");
      overlay.className = "game-over";
      document.body.appendChild(overlay);

      // Clean up effects after animation
      setTimeout(() => {
        gameScreen.classList.remove("screen-shake");
        overlay.remove();
      }, this.config.ANIMATIONS.SCREEN_SHAKE_DURATION);
    }

    // Call flashScreen for red flash effect
    this.flashScreen();

    const messageInfo = this.showDeathMessage(reason);
    setTimeout(() => {
      const score = this.state.score;
      html2canvas(gameScreen)
        .then((canvas) => {
          this.togglePause(); // Pause the game
          generateSocialCardNoSS(canvas, messageInfo.reason, score, messageInfo.message.funny, messageInfo.randomFace, this); // Pass 'this' as game instance
        })
        .catch((error) => {
          console.error("Failed to capture screenshot:", error);
        });
    }, this.config.ANIMATIONS.SCREEN_SHAKE_DURATION);

    // Restart game after death duration
    setTimeout(() => {
      const messageEl = document.getElementById("main-msg-box");
      if (messageEl) {
        messageEl.classList.remove("show-message");
      }
      this.restart();
    }, this.config.ANIMATIONS.DEATH_DURATION);
  }

  restart() {
    this.cleanup();
    Building.nextSpawnY = null;
    Building.buildingManager = null;

    this.spatialManager = new SpatialManager(CONFIG);
    this.state = new GameState(CONFIG);
    this.controls = new Controls(this);
    this.settingsManager = new SettingsManager(this);
    this.clusterManager = new VehicleClusterManager(CONFIG);

    this.initializeGameWorld();
    this.start();

    const messageBox = document.getElementById("main-msg-box");
    if (messageBox) {
      messageBox.textContent = "CLICK HERE/SPACEBAR to play ";
    }
  }

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  // 8. Utility methods (cleanup, flashScreen, etc.)

  togglePause() {
    this.state.isPaused = !this.state.isPaused;

    const messageBox = document.getElementById("main-msg-box");
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
    const messageEl = document.getElementById("main-msg-box");
    if (!messageEl) return;

    // Retrieve a single random message
    const message = this.getRandomDeathMessage(reason);
    const randomFace = cuteDeathFaces[Math.floor(Math.random() * cuteDeathFaces.length)];

    // Construct the full message for potential further use
    const fullMessage = `${reason}: ${message.funny} ${randomFace}`;

    // Display reason, message, and face in separate elements
    messageEl.innerHTML = `
      <p>${message.funny}</p>
      <span class="cute-death-face">${randomFace}</span>
    `;
    messageEl.style.display = "block";

    // Return all parts: reason, message object, and random face
    return { reason, message, randomFace };
  }

  showDeathMessage(reason) {
    const messageEl = document.getElementById("main-msg-box");
    if (!messageEl) return;

    // Retrieve a single random message
    const message = this.getRandomDeathMessage(reason);
    const randomFace = cuteDeathFaces[Math.floor(Math.random() * cuteDeathFaces.length)];

    // Construct the full message for potential further use
    const fullMessage = `${reason}: ${message.funny} ${randomFace}`;

    // Display reason, message, and face in separate elements
    messageEl.innerHTML = `
      <p>${message.funny}</p>
      <span class="cute-death-face">${randomFace}</span>
    `;
    messageEl.style.display = "block";

    // Return all parts: reason, message object, and random face
    return { reason, message, randomFace };
  }

  flashScreen() {
    const gameScreen = document.getElementById("game-screen");
    if (!gameScreen) return;

    const colors = ["#FF0000", "#000000", "#222"]; // Red flash sequence
    let delay = 0;

    colors.forEach((color) => {
      setTimeout(() => {
        gameScreen.style.backgroundColor = color;
      }, delay);
      delay += 100; // Adjust timing for each color switch
    });

    // Reset background color after the flash sequence
    setTimeout(() => {
      gameScreen.style.backgroundColor = ""; // Reset to default color
    }, delay);
  }

  drawDeathParticles() {
    // const particleChars = ['*', '.', '°', '⚡', '✦', '⚡'];

    const particleChars = ["", "⚡", "⚡"];

    const numParticles = Math.min(this.config.PARTICLES.MAX_DEATH_PARTICLES, this.state.deathState.animation * 2);

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const radius = this.state.deathState.animation / 2 + Math.random() * this.config.PARTICLES.PARTICLE_SPREAD;
      const x = Math.round(this.state.deathState.x + Math.cos(angle) * radius);
      const y = Math.round(this.state.deathState.y + Math.sin(angle) * radius);

      if (y < CONFIG.GAME.HEIGHT && y >= 0 && x < CONFIG.GAME.WIDTH && x >= 0) {
        const char = particleChars[Math.floor(Math.random() * particleChars.length)];
        const particleColor = EXPLOSION_COLOURS[Math.floor(Math.random() * EXPLOSION_COLOURS.length)];
        this.gridSystem.updateCell(x, y, `<span class="death-particle-outer">${char}</span>`, particleColor);
      }
    }
  }

  cleanup() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.spatialManager.darlings.clear();
    this.gridSystem.clear();
    this.controls.cleanup();
    this.settingsManager.cleanup(); // Add settings cleanup

    this.lastFrameTime = performance.now();
  }
}

const game = new LoserLane();
