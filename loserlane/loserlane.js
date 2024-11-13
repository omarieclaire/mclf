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
      PEDESTRIAN_WAIT: 20,
      DEATH_SEQUENCE: 15,
    },
    keyPressCount: {
      left: 0,
      right: 0,
    },
  },
  SPAWN_RATES: {
    STREETCAR: 0.05,
    STREETCAR_LANE_CAR: 0.8,
    ONCOMING_CAR: 0.4,
    PARKED_CAR: 0.2,
    DOOR_OPENING: 0.4,
    PEDESTRIAN: 0.9,
    BUILDING: 0.9,
  },
  SAFE_DISTANCE: {
    STREETCAR: 8,
    STREETCAR_LANE_CAR: 8,
    ONCOMING_CAR: 8,
    PARKED: 1,
    PEDESTRIAN: 3,
    BUILDING: 0,
    STREETCAR_TO_STREETCAR: 20,
    STREETCAR_TO_CAR: 15,
    DEFAULT: 5,
  },
  PEDESTRIAN: {
    SPEED: 0.5,
  },
  STREETCAR: {
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
    JUMP_AMOUNT: 2,
    JUMP_DURATION: 400,
    HOLD_DELAY: 200,
    BASE_MOVE_SPEED: 9,
    CONTINUOUS_MOVE_SPEED: 0.5,
    FRAME_CAP: 16.67,
  },
  MOVEMENT_SPEEDS: {
    STREETCAR: -1,
    PARKED_CAR: 1,
    ONCOMING_CAR: 2,
    PEDESTRIAN: 0.5,
  },
  COLLISION: {
    ADJACENT_LANE_THRESHOLD: 1,
    NEARBY_ENTITY_RADIUS: 2,
    BUILDING_OVERLAP_THRESHOLD: 0.1,
  },
  SPAWNING: {
    PARKED_CAR_DOOR_CHANCE: 0.3,
    PARKED_CAR_MIN_Y: 0.2,
    PARKED_CAR_MAX_Y: 0.3,
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
      JUMP_DURATION: 200,
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

class EntityType {
  static STREETCAR = "STREETCAR";
  static STREETCAR_LANE_CAR = "STREETCAR_LANE_CAR";
  static ONCOMING_CAR = "ONCOMING_CAR";
  static PARKED_CAR = "PARKED_CAR";
  static PEDESTRIAN = "PEDESTRIAN";
  static BUILDING = "BUILDING";
  static BIKE = "BIKE";
}

/**
 * Central manager class handling spatial relationships between game entities
 * Coordinates collision detection, movement, and entity spawning
 */

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
}

class SpatialManager {
  constructor(config) {
    this.config = config;
    this.grid = new GridSystem(config);
    this.collisionManager = new CollisionManager(this);
    this.movementCoordinator = new MovementCoordinator(this);
    this.spawnManager = new SpawnManager(this, config);
    this.entities = new Set();
  }

  update() {
    // Remove off-screen entities
    this.entities.forEach((entity) => {
      if (entity.position.y > this.config.GAME.HEIGHT + 5 || entity.position.y + entity.height < -5) {
        this.unregisterEntity(entity);
      }
    });

    this.movementCoordinator.update();
    this.collisionManager.update();
    this.entities.forEach((entity) => entity.behavior.update());
  }

  validateMove(entity, newPosition) {
    return this.collisionManager.validateMovement(entity, newPosition);
  }

  registerEntity(entity) {
    entity.spatialManager = this;
    this.entities.add(entity);
    this.grid.addEntity(entity);
  }

  unregisterEntity(entity) {
    this.entities.delete(entity);
    this.grid.removeEntity(entity);
  }

  getLaneOccupants(lane) {
    return Array.from(this.entities).filter((entity) => Math.floor(entity.position.x) === lane);
  }

  getEntitiesByType(type) {
    return Array.from(this.entities).filter((entity) => entity.type === type);
  }
}

// =========================================
// GridSystem - Spatial/Collision Management
// =========================================
class GridSystem {
  constructor(config) {
    this.config = config;
    this.cellSize = 5; // Size of each spatial partition cell
    // Map of cell coordinates to sets of entities in that cell
    this.cells = new Map();
  }

  // Convert world coordinates to cell key
  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  // Add entity to appropriate spatial partition
  addEntity(entity) {
    const key = this.getCellKey(entity.position.x, entity.position.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key).add(entity);
  }

  // Remove entity from its spatial partition
  removeEntity(entity) {
    const key = this.getCellKey(entity.position.x, entity.position.y);
    const cell = this.cells.get(key);
    if (cell) {
      cell.delete(entity);
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  // Update entity's position in spatial partitioning
  updateEntityPosition(entity, oldPos, newPos) {
    const oldKey = this.getCellKey(oldPos.x, oldPos.y);
    const newKey = this.getCellKey(newPos.x, newPos.y);

    // Only update if entity moved to new cell
    if (oldKey !== newKey) {
      this.cells.get(oldKey)?.delete(entity);
      if (!this.cells.has(newKey)) {
        this.cells.set(newKey, new Set());
      }
      this.cells.get(newKey).add(entity);
    }
  }

  // Find all entities within radius of a position
  getNearbyEntities(position, radius) {
    const nearbyEntities = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);

    const centerCellX = Math.floor(position.x / this.cellSize);
    const centerCellY = Math.floor(position.y / this.cellSize);

    // Check all cells within radius
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach((entity) => {
            if (entity.position.distanceTo(position) <= radius) {
              nearbyEntities.add(entity);
            }
          });
        }
      }
    }

    return Array.from(nearbyEntities);
  }
}
class CollisionManager {
  constructor(spatialManager) {
    this.spatialManager = spatialManager;
    this.config = spatialManager.config;
  }

  checkCollision(hitboxA, hitboxB) {
    return !(
      hitboxA.x + hitboxA.width <= hitboxB.x ||
      hitboxA.x >= hitboxB.x + hitboxB.width ||
      hitboxA.y + hitboxA.height <= hitboxB.y ||
      hitboxA.y >= hitboxB.y + hitboxB.height
    );
  }

  checkBikeCollision(bikeHitbox, entities, isJumping) {
    // First check streetcars and other vehicles
    for (const obstacle of entities.obstacles) {
      // Skip checking streetcar collision only when jumping over tracks and it's a streetcar
      if (isJumping && obstacle.type === EntityType.STREETCAR) {
        const bikeCenter = bikeHitbox.x + bikeHitbox.width / 2;
        const streetcarCenter = obstacle.position.x + obstacle.width / 2;
        // Only skip if bike is directly above the streetcar
        if (Math.abs(bikeCenter - streetcarCenter) < 2) {
          continue;
        }
      }

      if (this.checkCollision(bikeHitbox, obstacle.getHitbox())) {
        const obstacleHitbox = obstacle.getHitbox();
        const collisionDirection = this.getCollisionDirection(bikeHitbox, obstacleHitbox);

        // If obstacle is moving and hits bike from behind, trigger collision
        if (obstacle.behavior?.baseSpeed > 0 && collisionDirection === "up") {
          switch (obstacle.type) {
            case EntityType.STREETCAR:
              return "STREETCAR";
            case EntityType.STREETCAR_LANE_CAR:
            case EntityType.ONCOMING_CAR:
              return "ONCOMING_CAR";
            case EntityType.PEDESTRIAN:
              return "PEDESTRIAN";
            case EntityType.BUILDING:
              return "BUILDING";
            default:
              return "TRAFFIC";
          }
        }

        // If bike runs into obstacle or obstacle hits from front
        if (obstacle.behavior?.baseSpeed <= 0 || collisionDirection !== "up") {
          switch (obstacle.type) {
            case EntityType.STREETCAR:
              return "STREETCAR";
            case EntityType.STREETCAR_LANE_CAR:
            case EntityType.ONCOMING_CAR:
              return "TRAFFIC";
            case EntityType.PEDESTRIAN:
              return "PEDESTRIAN";
            case EntityType.BUILDING:
              return "BUILDING";
            default:
              return "TRAFFIC";
          }
        }
      }
    }

    // Then check parked cars and doors separately
    for (const car of entities.parkedCars) {
      if (this.checkCollision(bikeHitbox, car.getHitbox())) {
        return "PARKEDCAR";
      }
      if (car.behavior.doorHitbox && this.checkCollision(bikeHitbox, car.behavior.doorHitbox)) {
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

  update() {
    const pairs = this.getCollisionPairs();

    for (const [entityA, entityB] of pairs) {
      // Handle bike collisions
      if (entityA.type === EntityType.BIKE || entityB.type === EntityType.BIKE) {
        const bike = entityA.type === EntityType.BIKE ? entityA : entityB;
        const obstacle = entityA.type === EntityType.BIKE ? entityB : entityA;

        const entitiesForCollision = {
          obstacles: [obstacle],
          parkedCars: obstacle.type === EntityType.PARKED_CAR ? [obstacle] : [],
        };

        const collisionType = this.checkBikeCollision(bike.getHitbox(), entitiesForCollision, false);

        if (collisionType) {
          bike.behavior.onCollision(obstacle);
        }
      } else {
        // Handle non-bike entity collisions
        this.handleEntityCollision(entityA, entityB);
      }
    }
  }

  handleEntityCollision(entityA, entityB) {
    // Skip if either entity should ignore collisions
    if (entityA.behavior.ignoreCollisions || entityB.behavior.ignoreCollisions) {
      return;
    }

    // Calculate the collision response based on entity types and priorities
    const priorityA = this.getEntityPriority(entityA);
    const priorityB = this.getEntityPriority(entityB);

    // Higher priority entity continues, lower priority entity stops or slows
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

  applyCollisionResponse(entity, otherEntity) {
    if (!entity.behavior) return;

    // Calculate the direction of collision
    const moveDirection = Math.sign(entity.behavior.baseSpeed || 0);
    const otherDirection = Math.sign(otherEntity.behavior.baseSpeed || 0);

    // If moving in opposite directions, entities should stop
    if (moveDirection * otherDirection < 0) {
      entity.behavior.stopped = true;
      setTimeout(() => {
        entity.behavior.stopped = false;
      }, 500);
      return;
    }

    // If moving in the same direction, slower entity should match speed
    if (Math.abs(entity.behavior.baseSpeed) < Math.abs(otherEntity.behavior.baseSpeed)) {
      entity.behavior.baseSpeed = otherEntity.behavior.baseSpeed;
    }
  }

  getEntityPriority(entity) {
    const priorities = {
      [EntityType.STREETCAR]: 5,
      [EntityType.STREETCAR_LANE_CAR]: 4,
      [EntityType.ONCOMING_CAR]: 3,
      [EntityType.PARKED_CAR]: 2,
      [EntityType.PEDESTRIAN]: 1,
      [EntityType.BUILDING]: 0,
    };

    return priorities[entity.type] || 0;
  }

  getCollisionPairs() {
    const pairs = [];
    const entities = Array.from(this.spatialManager.entities);
    const processedPairs = new Set();

    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const nearby = this.spatialManager.grid.getNearbyEntities(entityA.position, Math.max(entityA.width, entityA.height) * 2);

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
    if (entityA.type === EntityType.BIKE || entityB.type === EntityType.BIKE) {
      return true;
    }

    // Check if entities are in adjacent or same lanes
    const xDistance = Math.abs(entityA.position.x - entityB.position.x);

    // Special handling for streetcars
    if (entityA.type === EntityType.STREETCAR || entityB.type === EntityType.STREETCAR) {
      return xDistance <= 2;
    }

    // Only check collisions for entities in the same or adjacent lanes
    return xDistance <= 1;
  }

  validateMovement(entity, newPosition) {
    if (entity.behavior?.ignoreCollisions) {
      return true;
    }

    const tempPosition = entity.position;
    entity.position = newPosition;

    const radius = Math.max(entity.width, entity.height) * 2;
    const nearby = this.spatialManager.grid.getNearbyEntities(newPosition, radius);

    let isValid = true;
    for (const other of nearby) {
      // Allow movement if colliding with bike
      if (other.type === EntityType.BIKE) {
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

class MovementCoordinator {
  constructor(spatialManager) {
    this.spatialManager = spatialManager;
    this.activeMovements = new Map();
    this.moveSpeed = CONFIG.MOVEMENT.BASE_MOVE_SPEED;
    this.holdDelay = CONFIG.MOVEMENT.HOLD_DELAY;
  }

  validateMove(entity, newPosition) {
    if (entity.behavior?.ignoreCollisions) {
      return true;
    }

    const tempPosition = entity.position;
    entity.position = newPosition;

    const nearby = this.spatialManager.grid.getNearbyEntities(
      newPosition,
      Math.max(entity.width, entity.height) * CONFIG.COLLISION.NEARBY_ENTITY_RADIUS
    );

    let isValid = true;
    for (const other of nearby) {
      if (other.type === EntityType.BIKE) {
        continue;
      }

      if (
        other !== entity &&
        !other.behavior?.ignoreCollisions &&
        this.spatialManager.collisionManager.checkCollision(entity.getHitbox(), other.getHitbox())
      ) {
        isValid = false;
        break;
      }
    }

    entity.position = tempPosition;
    return isValid;
  }

  update() {
    for (const [entity, plan] of this.activeMovements) {
      this.updateMovementPlan(entity, plan);
    }
  }

  updateMovementPlan(entity, plan) {
    if (plan.path.length === 0) {
      this.activeMovements.delete(entity);
      return;
    }

    const nextPosition = plan.path[0];
    if (this.spatialManager.validateMove(entity, nextPosition)) {
      entity.position = nextPosition;
      plan.path.shift();
    } else {
      // Recalculate path if blocked
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
      [EntityType.STREETCAR]: CONFIG.MOVEMENT.PRIORITIES.STREETCAR || 10,
      [EntityType.BIKE]: CONFIG.MOVEMENT.PRIORITIES.BIKE || 9,
      [EntityType.STREETCAR_LANE_CAR]: CONFIG.MOVEMENT.PRIORITIES.STREETCAR_LANE_CAR || 8,
      [EntityType.ONCOMING_CAR]: CONFIG.MOVEMENT.PRIORITIES.ONCOMING_CAR || 7,
      [EntityType.PARKED_CAR]: CONFIG.MOVEMENT.PRIORITIES.PARKED_CAR || 6,
      [EntityType.PEDESTRIAN]: CONFIG.MOVEMENT.PRIORITIES.PEDESTRIAN || 5,
      [EntityType.BUILDING]: CONFIG.MOVEMENT.PRIORITIES.BUILDING || 0,
    };

    return priorities[entity.type] || CONFIG.MOVEMENT.PRIORITIES.DEFAULT || 0;
  }

  validateLaneChange(entity, newLane) {
    const laneOccupants = this.spatialManager.getLaneOccupants(newLane);
    const safeDistance = this.calculateSafeDistance(entity);

    return laneOccupants.every((occupant) => Math.abs(occupant.position.y - entity.position.y) >= safeDistance);
  }

  calculateSafeDistance(entity) {
    const safeDistances = {
      [EntityType.STREETCAR]: CONFIG.SAFE_DISTANCE.STREETCAR,
      [EntityType.STREETCAR_LANE_CAR]: CONFIG.SAFE_DISTANCE.STREETCAR_LANE_CAR,
      [EntityType.ONCOMING_CAR]: CONFIG.SAFE_DISTANCE.ONCOMING_CAR,
      [EntityType.PARKED_CAR]: CONFIG.SAFE_DISTANCE.PARKED,
      [EntityType.PEDESTRIAN]: CONFIG.SAFE_DISTANCE.PEDESTRIAN,
    };

    return safeDistances[entity.type] || CONFIG.SAFE_DISTANCE.DEFAULT;
  }

  moveEntity(entity, newPos) {
    if (this.validateMove(entity, newPos)) {
      const oldPos = entity.position;
      entity.position = newPos;

      // Update grid position if needed
      if (this.spatialManager.grid) {
        this.spatialManager.grid.updateEntityPosition(entity, oldPos, newPos);
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

class SpawnManager {
  constructor(spatialManager, config) {
    this.spatialManager = spatialManager;
    this.config = config;
    this.debugLog = false; // Set to true to debug pedestrian spawning
    this.spawnRules = this.createSpawnRules();
  }

  createSpawnRules() {
    return new Map([
      [
        EntityType.STREETCAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.STREETCAR,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.STREETCAR * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.STREETCAR * 0.8),
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
        EntityType.STREETCAR_LANE_CAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR * 0.8),
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
        EntityType.ONCOMING_CAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.ONCOMING_CAR,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_CAR * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_CAR * 0.8),
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
        EntityType.PARKED_CAR,
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
        EntityType.PEDESTRIAN,
        {
          baseSpacing: this.config.SAFE_DISTANCE.PEDESTRIAN,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.PEDESTRIAN * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.PEDESTRIAN * 0.8),
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
        EntityType.BUILDING,
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

  getRequiredSpacing(entityTypeA, entityTypeB) {
    // console.log("Checking spacing requirement:", {
    //   entityA: entityTypeA,
    //   entityB: entityTypeB,
    // });

    // Special cases first
    if (entityTypeA === EntityType.STREETCAR && entityTypeB === EntityType.STREETCAR) {
      return this.config.SAFE_DISTANCE.STREETCAR_TO_STREETCAR;
    }
    if (entityTypeA === EntityType.STREETCAR && (entityTypeB === EntityType.STREETCAR_LANE_CAR || entityTypeB === EntityType.ONCOMING_CAR)) {
      return this.config.SAFE_DISTANCE.STREETCAR_TO_CAR;
    }

    // Get base safe distances from CONFIG
    const baseDistance = this.config.SAFE_DISTANCE[entityTypeA] || this.config.SAFE_DISTANCE.DEFAULT;

    const finalDistance = baseDistance * (entityTypeA === entityTypeB ? 1.5 : 1);

    // console.log("Spacing calculation:", {
    //   baseDistance: baseDistance,
    //   finalDistance: finalDistance,
    // });

    return finalDistance;
  }

  canSpawnAt(entityType, position) {
    // console.log(`\n=== Checking spawn at position for ${entityType} ===`, {
    //   x: position.x,
    //   y: position.y,
    // });

    const rules = this.spawnRules.get(entityType);
    if (!rules) {
      // console.log("No spawn rules found for entity type:", entityType);
      return false;
    }

    // Check if lane is allowed
    const isLaneAllowed = rules.laneRules.allowedLanes.includes(Math.floor(position.x));
    if (!isLaneAllowed) {
      // console.log("Lane not allowed:", {
      //   attemptedLane: Math.floor(position.x),
      //   allowedLanes: rules.laneRules.allowedLanes,
      // });
      return false;
    }

    // Get nearby entities
    const nearbyEntities = Array.from(this.spatialManager.entities).filter((entity) => {
      const xDistance = Math.abs(entity.position.x - position.x);
      const yDistance = Math.abs(entity.position.y - position.y);

      if (yDistance > 30) return false;

      // Special handling for streetcars
      if (entityType === EntityType.STREETCAR || entity.type === EntityType.STREETCAR) {
        return xDistance <= 2;
      }
      return xDistance <= 1;
    });

    // Log nearby entities
    if (nearbyEntities.length > 0) {
      // console.log(
      //   "Found nearby entities:",
      //   nearbyEntities.map((e) => ({
      //     type: e.type,
      //     position: {
      //       x: e.position.x,
      //       y: e.position.y,
      //     },
      //     distance: Math.abs(e.position.y - position.y),
      //   }))
      // );
    }

    // Check spacing requirements
    const hasEnoughSpace = nearbyEntities.every((entity) => {
      const distance = Math.abs(entity.position.y - position.y);
      const requiredSpacing = this.getRequiredSpacing(entityType, entity.type);

      const hasSpace = distance >= requiredSpacing;
      if (!hasSpace) {
        // console.log("Insufficient spacing:", {
        //   entityType: entity.type,
        //   distance: distance,
        //   required: requiredSpacing,
        // });
      }
      return hasSpace;
    });

    // console.log(`Spawn check result for ${entityType}:`, {
    //   isLaneAllowed: isLaneAllowed,
    //   nearbyCount: nearbyEntities.length,
    //   hasEnoughSpace: hasEnoughSpace,
    //   canSpawn: isLaneAllowed && hasEnoughSpace,
    // });

    return isLaneAllowed && hasEnoughSpace;
  }

  spawnEntity(entityType) {
    if (entityType === EntityType.ONCOMING_CAR) {
      // console.log("\n=== Attempting to spawn oncoming car ===");

      const spawnConfig = this.getSpawnConfig(entityType);
      if (!spawnConfig) {
        // console.log("Failed: No spawn config for oncoming car");
        return null;
      }

      // console.log("Spawn config for oncoming car:", {
      //   position: spawnConfig.position,
      //   direction: spawnConfig.direction,
      // });

      if (this.canSpawnAt(entityType, spawnConfig.position)) {
        const car = new OncomingCar(this.config, spawnConfig);
        // console.log("Successfully created oncoming car at:", {
        //   x: car.position.x,
        //   y: car.position.y,
        // });
        return car;
      } else {
        // console.log("Failed: Position not valid for oncoming car");
        return null;
      }
    }

    if (entityType === EntityType.PEDESTRIAN) {
      const isGoingUp = Math.random() < 0.5;
      if (this.debugLog) console.log(`Spawning pedestrian going ${isGoingUp ? "up" : "down"}`);

      // Configure spawn position based on direction
      const spawnConfig = {
        position: new Position(isGoingUp ? this.config.LANES.SIDEWALK + 3 : this.config.LANES.SIDEWALK, isGoingUp ? this.config.GAME.HEIGHT + 1 : -1),
      };

      if (this.canSpawnAt(entityType, spawnConfig.position)) {
        if (this.debugLog) console.log(`Spawning pedestrian at position:`, spawnConfig.position);
        return new Pedestrian(this.config, spawnConfig, isGoingUp);
      }
      if (this.debugLog) console.log(`Failed to spawn pedestrian - position occupied`);
      return null;
    }

    // Handle other entity types
    const spawnConfig = this.getSpawnConfig(entityType);
    if (!spawnConfig) {
      if (this.debugLog) console.log(`No spawn config for ${entityType}`);
      return null;
    }

    if (this.canSpawnAt(entityType, spawnConfig.position)) {
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
      [EntityType.STREETCAR]: Streetcar,
      [EntityType.STREETCAR_LANE_CAR]: StreetcarLaneCar,
      [EntityType.ONCOMING_CAR]: OncomingCar,
      [EntityType.PARKED_CAR]: ParkedCar,
      [EntityType.PEDESTRIAN]: Pedestrian,
      [EntityType.BUILDING]: Building,
    };

    return entityClasses[entityType];
  }
}

const DOOR_STATES = {
  CLOSED: 0,
  OPENING_1: 1,
  OPENING_2: 2,
  OPENING_3: 3,
  FULLY_OPEN: 4,
};

class VehicleClusterManager {
  constructor(config) {
    this.config = config;
    this.clusters = new Map();

    // Initialize cluster settings for each vehicle type
    [EntityType.STREETCAR, EntityType.STREETCAR_LANE_CAR, EntityType.ONCOMING_CAR, EntityType.PARKED_CAR].forEach((type) => {
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
    return this.entity.spatialManager.validateMove(this.entity, position);
  }

  move(newPosition) {
    if (this.canMoveTo(newPosition)) {
      const oldPosition = this.entity.position;
      this.entity.position = newPosition;

      // Update grid position if spatial manager exists
      if (this.entity.spatialManager?.grid) {
        this.entity.spatialManager.grid.updateEntityPosition(this.entity, oldPosition, newPosition);
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

class VehicleBehaviorBase extends EntityBehavior {
  constructor(entity, options = {}) {
    super(entity);
    this.baseSpeed = options.baseSpeed || 0;
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
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 1000);
  }

  getNearbyEntities() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid
      .getNearbyEntities(this.entity.position, Math.max(this.entity.width, this.entity.height) * 2)
      .filter((entity) => entity !== this.entity && entity.type !== EntityType.BIKE && Math.abs(entity.position.x - this.entity.position.x) < 2);
  }

  updateAnimation() {
    // Override in child classes that need animation
  }
}

class ParkedCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: 1,
      minDistance: entity.config.SAFE_DISTANCE.PARKED,
      ignoreCollisions: false,
      hasAnimation: true,
    });

    this.doorState = DOOR_STATES.CLOSED;
    this.doorTimer = 0;
    this.doorHitbox = null;
    this.shouldOpenDoor = Math.random() < entity.config.SPAWNING.PARKED_CAR_DOOR_CHANCE;
    this.doorAnimationActive = false;
    this.lastDoorUpdate = Date.now();
    this.doorOpenDelay = entity.config.ANIMATIONS.DOOR_OPEN_DELAY;

    const targetPercentage =
      entity.config.SPAWNING.PARKED_CAR_MIN_Y + Math.random() * (entity.config.SPAWNING.PARKED_CAR_MAX_Y - entity.config.SPAWNING.PARKED_CAR_MIN_Y);
    this.doorOpenY = Math.floor(this.entity.config.GAME.HEIGHT * targetPercentage);
  }

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

    if (this.doorAnimationActive && this.doorState < ENTITIES.PARKED_CAR_STATES.length - 1 && Date.now() - this.lastDoorUpdate > this.doorOpenDelay) {
      this.updateDoorState();
    }

    this.updateDoorHitbox();
  }

  updateDoorState() {
    this.doorState++;
    this.lastDoorUpdate = Date.now();
    this.entity.art = ENTITIES.PARKED_CAR_STATES[this.doorState];

    // Add door-opening animation class when door is opening
    if (this.doorState > 0) {
      this.entity.animationClass = "parked-car door-opening animated";
    } else {
      this.entity.animationClass = "parked-car animated";
    }

    const doorWidths = [0, 0.8, 1, 1.5, 1.8];
    const doorWidth = doorWidths[this.doorState];
    const hitboxHeight = this.doorState === ENTITIES.PARKED_CAR_STATES.length - 1 ? 0.8 : 1.8;

    this.doorHitbox = {
      x: this.entity.position.x,
      y: this.entity.position.y + 1,
      width: doorWidth,
      height: hitboxHeight,
    };
  }

  updateDoorHitbox() {
    if (this.doorHitbox) {
      this.doorHitbox.y = this.entity.position.y + 1;
    }
  }

  // Override base collision handling for parked cars
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
}

class StreetcarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -1,
      minDistance: entity.config.SAFE_DISTANCE.STREETCAR,
      ignoreCollisions: false,
    });
    this.stuckTimer = 0;
    this.lastPosition = null;

    // New properties for stopping behavior
    this.isAtStop = false;
    this.stopTimer = 0;
    this.nextStopTime = this.getRandomStopTime();
    console.log(`Streetcar initialized with nextStopTime: ${this.nextStopTime}, stopTimer: ${this.stopTimer}`);
  }

  spawnPedestrians() {
    if (this.pedestriansSpawnedAtStop) return; // Prevent multiple spawns per stop

    // Get the spatial manager from the entity
    const spatialManager = this.entity.spatialManager;
    if (!spatialManager) return;

    // Determine the number of pedestrians to spawn
    const numPedestrians = Math.floor(Math.random() * 3) + 1; // Spawn 1 to 3 pedestrians

    for (let i = 0; i < numPedestrians; i++) {
      const isGoingUp = Math.random() < 0.5;
      const offsetX = (Math.random() - 0.5) * 2; // Random offset between -1 and 1
      const spawnX = this.entity.position.x + offsetX + this.entity.width / 2;
      const spawnY = this.entity.position.y + (isGoingUp ? -1 : this.entity.height + 1);

      const spawnPosition = new Position(spawnX, spawnY);

      // Create a new pedestrian entity
      const pedestrian = new Pedestrian(this.config, { position: spawnPosition }, isGoingUp);

      // Register the pedestrian with the spatial manager
      spatialManager.registerEntity(pedestrian);
    }

    this.pedestriansSpawnedAtStop = true; // Mark as spawned for this stop
  }

  getRandomStopTime() {
    // Choose the desired difficulty level: EASY, NORMAL, or HARD
    const level = this.entity.config.STREETCAR.DIFFICULTY_LEVELS.HARD; // Change to EASY or HARD as needed
    const min = level.STOP_INTERVAL_MIN;
    const max = level.STOP_INTERVAL_MAX;
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated nextStopTime: ${time}`);
    return time;
  }

  getRandomStopDuration() {
    const level = this.entity.config.STREETCAR.DIFFICULTY_LEVELS.HARD; // Change to EASY or HARD as needed
    const min = level.STOP_DURATION_MIN;
    const max = level.STOP_DURATION_MAX;
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated stopDuration: ${duration}`);
    return duration;
  }

  shouldMove() {
    if (this.stopped) {
      // console.log("\n=== Streetcar Stopped ===", {
      //   position: this.entity.position,
      //   stopped: this.stopped,
      //   stuckTimer: this.stuckTimer,
      // });
      return false;
    }

    const nearbyEntities = this.getNearbyEntities();
    const shouldStop = this.shouldStop(nearbyEntities);

    // Track if we're stuck in the same position
    if (this.lastPosition && this.lastPosition.y === this.entity.position.y) {
      this.stuckTimer++;
      if (this.stuckTimer > 60) {
        // About 1 second at 60fps
        // console.log("\n=== Streetcar Potentially Stuck ===", {
        //   position: this.entity.position,
        //   nearbyEntities: nearbyEntities.map((e) => ({
        //     type: e.type,
        //     position: e.position,
        //     distance: Math.abs(e.position.y - this.entity.position.y),
        //   })),
        // });

        // Auto-unstuck mechanism
        if (this.stuckTimer > 120) {
          // 2 seconds
          // console.log("Attempting to unstick streetcar");
          this.stopped = false;
          this.stuckTimer = 0;
          return true;
        }
      }
    } else {
      this.stuckTimer = 0;
    }

    this.lastPosition = { ...this.entity.position };

    if (shouldStop) {
      // console.log("\n=== Streetcar Movement Blocked ===", {
      //   position: this.entity.position,
      //   nearbyEntities: nearbyEntities.map((e) => ({
      //     type: e.type,
      //     position: e.position,
      //     distance: Math.abs(e.position.y - this.entity.position.y),
      //   })),
      // });
    }

    return !shouldStop;
  }

  shouldStop(nearbyEntities) {
    const blockingEntities = nearbyEntities.filter((other) => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      const isTooClose = distance < this.minDistance;

      if (isTooClose) {
        // console.log(`Entity too close to streetcar:`, {
        //   type: other.type,
        //   position: other.position,
        //   distance: distance,
        //   minRequired: this.minDistance,
        // });
      }

      return isTooClose;
    });

    return blockingEntities.length > 0;
  }
  update() {
    // console.log(`Streetcar Update - isAtStop: ${this.isAtStop}, nextStopTime: ${this.nextStopTime}, stopTimer: ${this.stopTimer}`);

    if (this.isAtStop) {
      // Streetcar is at a stop
      this.stopTimer--;
      // console.log(`Streetcar is stopped. stopTimer decremented to: ${this.stopTimer}`);
      if (this.stopTimer <= 0) {
        this.isAtStop = false;
        this.nextStopTime = this.getRandomStopTime();
        // console.log("Streetcar is resuming movement at position:", this.entity.position);
      }
      return; // Skip movement while stopped
    } else {
      // Decrement the timer until the next stop
      this.nextStopTime--;
      // console.log(`Streetcar is moving. nextStopTime decremented to: ${this.nextStopTime}`);
      if (this.nextStopTime <= 0) {
        this.isAtStop = true;
        this.stopTimer = this.getRandomStopDuration();
        // console.log("Streetcar is stopping at position:", this.entity.position);
        return; // Stop moving this frame
      }

      if (this.isAtStop) {
        // Streetcar is at a stop
        this.stopTimer--;
        console.log(`Streetcar is stopped. stopTimer decremented to: ${this.stopTimer}`);

        // Spawn pedestrians if not already done
        this.spawnPedestrians();

        if (this.stopTimer <= 0) {
          this.isAtStop = false;
          this.pedestriansSpawnedAtStop = false; // Reset for next stop
          this.nextStopTime = this.getRandomStopTime();
          console.log("Streetcar is resuming movement at position:", this.entity.position);
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
    // console.log("\n=== Streetcar Movement Blocked ===", {
    //   position: this.entity.position,
    //   stuckTimer: this.stuckTimer,
    // });

    setTimeout(() => {
      // console.log("\n=== Attempting to Resume Streetcar Movement ===", {
      //   position: this.entity.position,
      // });
      this.stopped = false;
    }, 1000);
  }
}

class OncomingCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: 2,
      minDistance: entity.config.SAFE_DISTANCE.ONCOMING_CAR,
      ignoreCollisions: false,
    });
  }

  update() {
    // Just move down at constant speed
    this.entity.position.y += this.baseSpeed;
  }
}

class StreetcarLaneCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -1,
      minDistance: entity.config.SAFE_DISTANCE.STREETCAR_LANE_CAR,
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
      this.transformToParkedCar();
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

      if (this.entity.spatialManager.validateMove(this.entity, newPosition)) {
        this.entity.spatialManager.movementCoordinator.moveEntity(this.entity, newPosition);

        if (distanceToLane < 0.5) {
          // console.log("At parking position, transforming");
          this.transformToParkedCar();
        }
        return;
      }
    }

    // console.log("All parking movements blocked");
    // If we get here, movement was blocked - force transform after a few attempts
    if (this.parkingAttempts > 3) {
      // console.log("Movement blocked too many times, forcing transformation");
      this.transformToParkedCar();
    }
  }

  transformToParkedCar() {
    const spatialManager = this.entity.spatialManager;
    const targetPosition = new Position(this.targetLane, this.entity.position.y);

    // console.log("\n=== Starting Parking Transform ===");
    console.log("Original vehicle position:", {
      x: this.entity.position.x,
      y: this.entity.position.y,
    });

    // Get nearby entities before transformation
    const nearbyEntities = spatialManager.grid.getNearbyEntities(targetPosition, this.entity.config.SAFE_DISTANCE.PARKED * 2);

    const nearbyParkedCars = nearbyEntities.filter((e) => e.type === EntityType.PARKED_CAR);

    // Calculate initial safe position
    let safeY = targetPosition.y;
    const minSpacing = this.entity.config.SAFE_DISTANCE.PARKED;

    // Create parked car to test positions
    const parkedCar = new ParkedCar(this.entity.config, {
      position: new Position(this.targetLane, safeY),
    });
    parkedCar.behavior.baseSpeed = 1;

    // Try to find a valid position
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 15; // Increased from 10 to give more chances

    while (!validPosition && attempts < maxAttempts) {
      validPosition = spatialManager.validateMove(parkedCar, parkedCar.position);
      // console.log(`Trying position at y: ${safeY}, valid: ${validPosition}`);

      if (!validPosition) {
        safeY += minSpacing;
        parkedCar.position.y = safeY;
        attempts++;
      }
    }

    if (validPosition) {
      console.log("Found valid position at y:", safeY);
      // Only register the new car and remove the old one if we found a valid position
      spatialManager.registerEntity(parkedCar);
      spatialManager.unregisterEntity(this.entity);

      console.log("=== Parking Transform Complete ===");
      console.log("Final parked car position:", {
        x: parkedCar.position.x,
        y: parkedCar.position.y,
        hitbox: parkedCar.getHitbox(),
      });
    } else {
      console.warn("Failed to find valid parking position after", attempts, "attempts");
      // Keep the original car moving if we can't find a parking spot
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
    const nearbyEntities = this.entity.spatialManager.grid.getNearbyEntities(new Position(this.targetLane, this.entity.position.y), 6);

    const nearbyParkedCars = nearbyEntities.filter(
      (e) => e.type === EntityType.PARKED_CAR || (e.type === EntityType.STREETCAR_LANE_CAR && e.behavior.isParking)
    );

    const hasSpace = !nearbyParkedCars.some((car) => Math.abs(car.position.y - this.entity.position.y) < 6);

    return hasSpace;
  }
}

class PedestrianBehavior extends EntityBehavior {
  constructor(entity, isGoingUp) {
    super(entity);
    this.entity = entity;
    this.config = entity.config;
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -this.config.PEDESTRIAN.SPEED : this.config.PEDESTRIAN.SPEED;
    this.stopped = false;
    this.waitTime = 0;
    this.minDistance = this.config.SAFE_DISTANCE.PEDESTRIAN;

    // Assign lane based on direction
    this.lane = isGoingUp ? this.config.LANES.SIDEWALK + 2 : this.config.LANES.SIDEWALK;
    this.entity.position.x = this.lane; // Set initial x position based on lane
  }

  shouldWait(nearbyEntities) {
    return nearbyEntities.some((other) => {
      // Only check for pedestrians in the same lane
      if (Math.abs(other.position.x - this.entity.position.x) > 0.1) {
        return false;
      }
      const distance = Math.abs(other.position.y - this.entity.position.y);
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

    const nearbyEntities = this.getNearbyEntities();

    if (this.shouldWait(nearbyEntities)) {
      this.stopped = true;
      this.waitTime = this.config.GAME.ANIMATION_FRAMES.PEDESTRIAN_WAIT;
      return;
    }

    const newPosition = new Position(this.lane, this.entity.position.y + this.baseSpeed);

    if (this.canMoveTo(newPosition)) {
      this.move(newPosition);
    }
  }

  getNearbyEntities() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid.getNearbyEntities(this.entity.position, this.config.COLLISION.NEARBY_ENTITY_RADIUS).filter(
      (entity) =>
        entity !== this.entity &&
        entity.type !== EntityType.BIKE &&
        entity.type === EntityType.PEDESTRIAN &&
        Math.abs(entity.position.x - this.entity.position.x) < 0.1 // Only consider pedestrians in same lane
    );
  }
}

class BikeBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
  }
}

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

class Streetcar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.STREETCAR);
    this.width = ENTITIES.STREETCAR.width;
    this.height = ENTITIES.STREETCAR.height;
    this.art = ENTITIES.STREETCAR.art;
    this.color = STYLES.TTC;
    this.behavior = new StreetcarBehavior(this);
    console.log("Streetcar created at position:", this.position);
  }
}

class StreetcarLaneCar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.STREETCAR_LANE_CAR);
    this.width = ENTITIES.MOVINGCAR.width;
    this.height = ENTITIES.MOVINGCAR.height;
    this.art = ENTITIES.MOVINGCAR.art;
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new StreetcarLaneCarBehavior(this);
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

class OncomingCar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.ONCOMING_CAR);
    this.width = ENTITIES.ONCOMINGCAR.width;
    this.height = ENTITIES.ONCOMINGCAR.height;
    this.art = ENTITIES.ONCOMINGCAR.art;
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new OncomingCarBehavior(this);
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

class ParkedCar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.PARKED_CAR);
    this.width = 7;
    this.height = 5;
    this.art = ENTITIES.PARKED_CAR_STATES[0];
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new ParkedCarBehavior(this);
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

class Pedestrian extends BaseEntity {
  constructor(config, spawnConfig, isGoingUp) {
    super(config, spawnConfig, EntityType.PEDESTRIAN);

    const pedestrianColor = peopleCol[Math.floor(Math.random() * peopleCol.length)];

    // Choose art based on direction
    const template = isGoingUp ? ENTITIES.PEDESTRIAN.UP : ENTITIES.PEDESTRIAN.DOWN;
    this.width = template.width;
    this.height = template.height;
    this.art = template.art;
    this.color = `<span style='color: ${pedestrianColor}'>`;

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
    this.behavior = new PedestrianBehavior(this, isGoingUp);
  }
}

class BuildingManager {
  constructor(config) {
    console.log("[BuildingManager] Initializing with config:", config);
    this.config = config;
    this.buildingQueue = [];
    this.activeBuildings = new Set();
    this.minSpacing = 1;

    // Initial shuffle and logging
    this.shuffledBuildings = this.shuffleArray([...TORONTO_BUILDINGS]);
    console.log("[BuildingManager] Shuffled buildings:", this.shuffledBuildings.map(b => b.name));
    this.buildingIndex = 0;

    this.initializeBuildingQueue();
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    console.log("[BuildingManager] Array shuffled:", array.map(b => b.name));
    return array;
  }

  initializeBuildingQueue() {
    console.log("[BuildingManager] Initializing building queue");

    const screenHeight = this.config.GAME.HEIGHT;
    const buildingSpacing = this.config.SAFE_DISTANCE.BUILDING || 0;
    let currentY = screenHeight;

    console.log("[BuildingManager] Screen height:", screenHeight, "Building spacing:", buildingSpacing);

    // Fill queue from bottom to top of screen
    while (currentY > -10) {
      // Log the current index and check for reshuffle necessity
      console.log("[BuildingManager] Current buildingIndex:", this.buildingIndex);
      if (this.buildingIndex >= this.shuffledBuildings.length) {
        console.log("[BuildingManager] Reached end of building list, reshuffling");
        this.shuffledBuildings = this.shuffleArray([...TORONTO_BUILDINGS]);
        this.buildingIndex = 0;
      }

      // Select the next building
      const building = this.shuffledBuildings[this.buildingIndex++];
      console.log(`[BuildingManager] Selected building "${building.name}" at index ${this.buildingIndex - 1}`);

      currentY -= building.art.length;

      console.log(`[BuildingManager] Adding building "${building.name}" at Y=${currentY}, Height=${building.art.length}`);

      this.buildingQueue.push({
        building: building,
        y: currentY,
      });

      // Check for duplicate entries in the queue
      const duplicateCount = this.buildingQueue.filter(b => b.building.name === building.name).length;
      if (duplicateCount > 1) {
        console.warn(`[BuildingManager] Duplicate building detected: "${building.name}" appears ${duplicateCount} times in queue`);
      }

      currentY -= buildingSpacing;
    }

    console.log("[BuildingManager] Final queue:", this.buildingQueue.map(b => b.building.name));
    console.log("[BuildingManager] Initial queue size:", this.buildingQueue.length);
  }

  getNextBuilding() {
    console.log("[BuildingManager] Requesting next building. Queue size:", this.buildingQueue.length);

    if (this.buildingQueue.length === 0) {
      const highestY = this.getHighestBuildingY();
      console.log("[BuildingManager] Queue empty, refilling from Y:", highestY);
      this.refillQueue(highestY);
    }

    const nextBuilding = this.buildingQueue.shift();
    console.log("[BuildingManager] Providing building:", nextBuilding?.building?.name, "at Y:", nextBuilding?.y);
    return nextBuilding;
  }

  refillQueue(startY) {
    console.log("[BuildingManager] Refilling queue from Y:", startY);
    let currentY = startY;

    for (let i = 0; i < 5; i++) {
      console.log("[BuildingManager] Current buildingIndex during refill:", this.buildingIndex);
      if (this.buildingIndex >= this.shuffledBuildings.length) {
        console.log("[BuildingManager] Reshuffling building list during refill");
        this.shuffledBuildings = this.shuffleArray([...TORONTO_BUILDINGS]);
        this.buildingIndex = 0;
      }

      const nextBuilding = this.shuffledBuildings[this.buildingIndex++];
      const buildingHeight = nextBuilding.art.length;
      currentY -= buildingHeight;

      console.log(`[BuildingManager] Adding building "${nextBuilding.name}" at Y=${currentY}, Height=${buildingHeight}`);

      this.buildingQueue.push({
        building: nextBuilding,
        y: currentY,
        height: buildingHeight,
      });

      currentY -= this.minSpacing;
    }

    console.log("[BuildingManager] Queue size after refill:", this.buildingQueue.length);
  }
}


class BuildingBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    console.log("[BuildingBehavior] Creating new behavior for:", entity.name);

    // Movement properties
    this.canMove = true;
    this.speed = 1;
    this.ignoreCollisions = true;
    this.minSpacing = 1;

    console.log("[BuildingBehavior] Initial position:", {
      y: entity.position.y,
      height: entity.height,
    });
  }

  update() {
    // Move building down
    this.entity.position.y += this.speed;

    // Handle respawning when building goes off screen
    if (this.entity.position.y >= this.entity.config.GAME.HEIGHT) {
      console.log(`[BuildingBehavior] Building "${this.entity.name}" needs respawn at Y=${this.entity.position.y}`);

      // Get sorted list of existing buildings
      const buildings = Array.from(this.entity.spatialManager.entities)
        .filter((e) => e.type === EntityType.BUILDING && e !== this.entity)
        .sort((a, b) => a.position.y - b.position.y);

      console.log(
        "[BuildingBehavior] Current building positions:",
        buildings.map((b) => `${b.name}: Y=${b.position.y}`)
      );

      // Select new building properties
      if (Building.buildingIndex >= Building.availableBuildings.length) {
        Building.buildingIndex = 0;
        console.log("[BuildingBehavior] Reset building index");
      }

      const newBuilding = Building.availableBuildings[Building.buildingIndex];
      const newHeight = newBuilding.art.length;
      console.log(`[BuildingBehavior] Selected new building: ${newBuilding.name} (height: ${newHeight})`);

      // Calculate new position
      let newY = buildings.length === 0 ? this.entity.config.SPAWNING.MIN_BUILDING_HEIGHT : buildings[0].position.y - newHeight - this.minSpacing;

      console.log("[BuildingBehavior] Calculated new Y position:", newY);

      // Validate and adjust position if needed
      if (this.validatePosition(newY, newHeight, buildings)) {
        this.updateBuildingProperties(newY, newBuilding, newHeight);
      } else {
        console.log("[BuildingBehavior] Initial position invalid, searching for valid position");
        this.findValidPosition(newY, newHeight, newBuilding, buildings);
      }
    }
  }

  // Helper method to update building properties
  updateBuildingProperties(newY, newBuilding, newHeight) {
    console.log(`[BuildingBehavior] Updating building properties:`, {
      name: newBuilding.name,
      y: newY,
      height: newHeight,
    });

    this.entity.position.y = newY;
    this.entity.art = newBuilding.art;
    this.entity.height = newHeight;
    this.entity.name = newBuilding.name;
    Building.buildingIndex++;
  }

  // Helper method to find valid position
  findValidPosition(startY, height, newBuilding, buildings) {
    let newY = startY;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!this.validatePosition(newY, height, buildings) && attempts < MAX_ATTEMPTS) {
      newY -= this.minSpacing;
      attempts++;
      console.log(`[BuildingBehavior] Attempt ${attempts}: Trying Y=${newY}`);
    }

    if (attempts < MAX_ATTEMPTS) {
      console.log(`[BuildingBehavior] Found valid position after ${attempts} attempts`);
      this.updateBuildingProperties(newY, newBuilding, height);
    } else {
      console.warn(`[BuildingBehavior] Failed to find valid position after ${MAX_ATTEMPTS} attempts`);
    }
  }

  validatePosition(y, height, existingBuildings) {
    if (typeof y !== "number" || isNaN(y)) {
      console.error("[BuildingBehavior] Invalid Y position:", y);
      return false;
    }

    // Check for collisions with existing buildings
    const isValid = !existingBuildings.some((building) => {
      const topOverlap = y < building.position.y + building.height + this.minSpacing;
      const bottomOverlap = y + height + this.minSpacing > building.position.y;
      const sameColumn = Math.abs(building.position.x - this.entity.config.LANES.BUILDINGS) < 0.1;

      if (sameColumn && topOverlap && bottomOverlap) {
        console.log(`[BuildingBehavior] Collision detected with "${building.name}" at Y=${building.position.y}`);
        return true;
      }
      return false;
    });

    console.log(`[BuildingBehavior] Position validation result:`, {
      y,
      height,
      isValid,
    });

    return isValid;
  }
}

class Building extends BaseEntity {
  // Static properties for building management
  static nextSpawnY = null;
  static availableBuildings = [...TORONTO_BUILDINGS];
  static buildingIndex = 0;

  constructor(config, spawnY = null) {
    console.log("[Building] Creating new building:", {
      spawnY,
      nextSpawnY: Building.nextSpawnY,
      buildingIndex: Building.buildingIndex,
    });

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

    console.log("[Building] Calculated spawn position:", {
      building: selectedBuilding.name,
      height,
      calculatedY,
      spacing: minSpacing,
    });

    const spawnConfig = {
      position: new Position(config.LANES.BUILDINGS, calculatedY),
    };

    super(config, spawnConfig, EntityType.BUILDING);

    // Set building properties
    this.width = selectedBuilding.art[0].length;
    this.height = height;
    this.art = selectedBuilding.art;
    this.name = selectedBuilding.name;
    this.color = `<span style='color: ${this.getRandomBuildingColor()}'>`;
    this.behavior = new BuildingBehavior(this);

    Building.nextSpawnY = calculatedY;

    console.log("[Building] Building created:", {
      name: this.name,
      position: this.position,
      height: this.height,
      width: this.width,
    });
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
    console.log("[Building] Selected color:", color);
    return color;
  }
}

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
        this.deathState.colorIndex = (this.deathState.colorIndex + 1) % EXPLOSION_COLORS.length;
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

class SettingsManager {
  constructor(game) {
    this.game = game;
    this.setupSettingsControls();
  }

  setupSettingsControls() {
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        const settingsWindow = document.getElementById("settings-window");
        if (settingsWindow) {
          settingsWindow.style.display = settingsWindow.style.display === "none" ? "block" : "none";
        }
      }
    });

    this.setupSettingControl("initial-speed", (value) => {
      CONFIG.GAME.INITIAL_SPEED = parseInt(value);
    });

    this.setupSettingControl("min-speed", (value) => {
      CONFIG.GAME.MIN_SPEED = parseInt(value);
    });

    // Add other settings controls as needed
  }

  setupSettingControl(id, callback) {
    const element = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);

    if (element && valueDisplay) {
      element.addEventListener("input", (e) => {
        const value = e.target.value;
        valueDisplay.textContent = value;
        callback(value);
      });
    }
  }
}
class TouchInputManager {
  constructor(game) {
    this.game = game;
    this.config = game.config;
    this.touchState = {
      left: { lastTap: 0 },
      right: { lastTap: 0 },
    };

    this.JUMP_DURATION = 100; // Jump animation duration

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes jumpAnnounce {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    this.setupTouchControls();
  }

  setupTouchControls() {
    const leftControl = document.getElementById("move-left");
    const rightControl = document.getElementById("move-right");

    if (!leftControl || !rightControl) {
      console.warn("Touch controls not found in DOM");
      return;
    }

    const touchOptions = { passive: false };

    ["left", "right"].forEach((side) => {
      const element = side === "left" ? leftControl : rightControl;
      element.addEventListener("touchstart", (e) => this.handleTouchStart(e, side), touchOptions);
      element.addEventListener("touchend", (e) => this.handleTouchEnd(e, side), touchOptions);
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        if (this.game.state?.isPlaying) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  handleTouchStart(event, side) {
    event.preventDefault();
    if (!this.game.state?.isPlaying) return;

    const currentTime = performance.now();
    const state = this.touchState[side];

    // Check for double tap
    if (currentTime - state.lastTap < this.config.DOUBLE_TAP_WINDOW) {
      this.handleDoubleTap(side);
      state.lastTap = 0; // Reset tap timer
      return;
    }

    // Single tap - regular movement
    if (side === "left") {
      this.game.state.currentLane = Math.max(this.game.state.currentLane - 1, this.config.LANES.ONCOMING);
      this.game.movementState.isMovingLeft = true;
    } else {
      this.game.state.currentLane = Math.min(this.game.state.currentLane + 1, this.config.LANES.BUILDINGS - 1);
      this.game.movementState.isMovingRight = true;
    }

    state.lastTap = currentTime;
    this.game.movementState.holdStartTime = currentTime;
    this.game.movementState.isHolding = true;
  }

  handleTouchEnd(event, side) {
    event.preventDefault();

    if (side === "left") {
      this.game.movementState.isMovingLeft = false;
    } else {
      this.game.movementState.isMovingRight = false;
    }
    this.game.movementState.isHolding = false;
  }

  handleDoubleTap(side) {
    this.game.handleJump(side);
  }

  cleanup() {
    this.touchState.left.lastTap = 0;
    this.touchState.right.lastTap = 0;
  }
}

class LoserLane {
  constructor() {
    this.config = CONFIG;
    this.state = new GameState(this.config);
    this.spatialManager = new SpatialManager(this.config);
    this.eventListeners = new Map();
    this.gridSystem = new OptimizedGridSystem(this.config.GAME.WIDTH, this.config.GAME.HEIGHT);

    const now = performance.now();
    this.initialLastMove = now; // Track when we first created the movement state

    this.movementState = {
      isMovingLeft: false,
      isMovingRight: false,
      lastMove: performance.now(),
      moveSpeed: this.config.MOVEMENT.BASE_MOVE_SPEED,
      holdDelay: this.config.MOVEMENT.HOLD_DELAY,
      holdStartTime: 0,
      isHolding: false,
    };

    this.debug = true;
    this.lastFrameTime = performance.now();
    this.frameId = null;

    this.touchInputManager = new TouchInputManager(this);

    this.initializeGameWorld();
    this.setupControls();
    this.settingsManager = new SettingsManager(this);
    this.clusterManager = new VehicleClusterManager(CONFIG);
  }

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  setupInfoButton() {
    const infoButton = document.getElementById("add-art-link");
    const infoDiv = document.getElementById("info-div");
    const closeButton = document.getElementById("close-info");

    console.log("Setting up info button:", { infoButton, infoDiv, closeButton });

    if (infoButton && infoDiv && closeButton) {
      infoButton.addEventListener("click", (e) => {
        console.log("Info button clicked - showing info div");
        e.preventDefault();
        e.stopPropagation();
        infoDiv.style.display = "block";
      });

      closeButton.addEventListener("click", (e) => {
        console.log("Close button clicked - hiding info div");
        e.preventDefault();
        e.stopPropagation();
        infoDiv.style.display = "none";
      });

      infoDiv.addEventListener("click", (e) => {
        console.log("Info div clicked - preventing propagation");
        e.preventDefault();
        e.stopPropagation();
      });

      console.log("Info button setup complete");
    } else {
      console.warn("Could not find all required info elements:", { infoButton, infoDiv, closeButton });
    }
  }

  initializeGameWorld() {
    this.spatialManager.entities.clear();
    this.initializeBuildings();
    this.initializeParkedCars();
    this.bike = this.updateBike();
    this.spatialManager.registerEntity(this.bike);
  }

  handleJump(direction) {
    // Don't allow new jumps while already jumping
    if (this.state.isJumping) {
      return;
    }

    // Move bike
    const moveAmount = 2;
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
    }, this.JUMP_DURATION || 400);
  }

  setupControls() {
    // Track last keypress time for double-tap detection
    let lastLeftPress = 0;
    let lastRightPress = 0;
    const DOUBLE_PRESS_WINDOW = 500; // 500ms window for double press

    const keydownHandler = (e) => {
      if (!this.state.isPlaying && (e.key === " " || e.key === "Spacebar")) {
        this.start();
        document.getElementById("title-box").style.visibility = "visible";
        return;
      }

      if (this.state.isPlaying) {
        const now = performance.now();

        switch (e.key) {
          case "ArrowLeft":
            // Check for double press
            if (now - lastLeftPress < DOUBLE_PRESS_WINDOW) {
              // It's a double press - perform jump
              this.handleJump("left");
              lastLeftPress = 0; // Reset timer
            } else {
              // Regular movement
              if (!this.movementState.isMovingLeft) {
                this.state.currentLane = Math.max(this.state.currentLane - 1, CONFIG.LANES.ONCOMING);
                this.movementState.isMovingLeft = true;
                this.movementState.holdStartTime = now;
                this.movementState.isHolding = true;
              }
              lastLeftPress = now;
            }
            break;

          case "ArrowRight":
            // Check for double press
            if (now - lastRightPress < DOUBLE_PRESS_WINDOW) {
              // It's a double press - perform jump
              this.handleJump("right");
              lastRightPress = 0; // Reset timer
            } else {
              // Regular movement
              if (!this.movementState.isMovingRight) {
                this.state.currentLane = Math.min(this.state.currentLane + 1, CONFIG.LANES.BUILDINGS - 1);
                this.movementState.isMovingRight = true;
                this.movementState.holdStartTime = now;
                this.movementState.isHolding = true;
              }
              lastRightPress = now;
            }
            break;

          case "p":
          case "P":
            this.togglePause();
            break;
        }
      }
    };

    const keyupHandler = (e) => {
      if (this.state.isPlaying) {
        switch (e.key) {
          case "ArrowLeft":
            this.movementState.isMovingLeft = false;
            this.movementState.isHolding = false;
            break;
          case "ArrowRight":
            this.movementState.isMovingRight = false;
            this.movementState.isHolding = false;
            break;
        }
      }
    };

    const clickHandler = (e) => {
      const isExcludedElement =
        e.target.id === "add-art-link" ||
        e.target.id === "info-div" ||
        e.target.id === "close-info" ||
        e.target.closest("#info-div") ||
        e.target.closest(".title-box");

      if (isExcludedElement) {
        // console.log("Click on excluded element - not starting game");
        if (e.target.id === "add-art-link" || e.target.closest("#add-art-link")) {
          window.open("https://docs.google.com/document/d/13KddYLkQMiNpLRuZ7cCFMzyC_1EFLc1_ksV_MJ21D90/edit?usp=sharing", "_blank");
        }
        return;
      }

      if (!this.state.isPlaying) {
        console.log("Starting game");

        let titleBox = document.getElementById("title-box-container");
        let gameWidth = this.config.GAME.WIDTH;
        //  console.log(gameWidth);

        titleBox.style.width = gameWidth;
        titleBox.style.visibility = "visible";
        this.start();
      }
    };

    this.addEventListenerWithTracking(document, "keydown", keydownHandler);
    this.addEventListenerWithTracking(document, "keyup", keyupHandler);
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      this.addEventListenerWithTracking(gameContainer, "click", clickHandler);
    }
  }

  update(timestamp) {
    if (!timestamp) {
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    if (this.state.isPaused) {
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    // Handle continuous movement only after hold delay
    if (!this.state.isDead) {
      if (this.movementState.isHolding && timestamp - this.movementState.holdStartTime > this.movementState.holdDelay) {
        const moveTime = timestamp - this.movementState.lastMove;
        const cappedMoveTime = Math.min(moveTime, 16.67);
        const moveAmount = (cappedMoveTime / 1000) * this.movementState.moveSpeed * 60;

        if (this.movementState.isMovingLeft) {
          this.state.currentLane = Math.max(this.state.currentLane - moveAmount, CONFIG.LANES.ONCOMING);
        }
        if (this.movementState.isMovingRight) {
          this.state.currentLane = Math.min(this.state.currentLane + moveAmount, CONFIG.LANES.BUILDINGS - 1);
        }
      }
      this.movementState.lastMove = timestamp;
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
        this.spatialManager.update();
        this.updateBikePosition();
        this.spawnEntities();
        this.checkBikeCollisions();
        this.state.incrementScore();
        this.state.updateSpeed();
        this.updateScoreDisplay();
      }
      this.render();
    }

    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  updateBikePosition() {
    if (this.bike) {
      // Add check to ensure bike exists
      this.bike.position = new Position(this.state.currentLane, this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y);
    }
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById("time-alive");
    if (scoreElement) {
      scoreElement.textContent = `STAY ALIVE: ${this.state.score}`;
    }
  }

  preventDefaultTouchBehaviors() {
    const options = { passive: false };

    document.addEventListener(
      "touchmove",
      (e) => {
        if (this.state?.isPlaying) {
          e.preventDefault();
        }
      },
      options
    );

    document.addEventListener("touchforcechange", (e) => e.preventDefault(), options);
    document.addEventListener("touchcancel", (e) => e.preventDefault(), options);

    // Prevent zoom
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
    document.addEventListener("gestureend", (e) => e.preventDefault());
  }

  moveLeft(isDoubleTap = false, isTouchMove = false) {
    if (this.state.isDead) return;

    const now = Date.now();
    const isDoubleTapJump = !isTouchMove && isDoubleTap && now - this.state.touchState.lastTap < CONFIG.GAME.DOUBLE_TAP_TIME;

    const moveAmount = isDoubleTapJump ? 2 : isTouchMove ? 0.5 : 1;
    this.state.currentLane = Math.max(this.state.currentLane - moveAmount, CONFIG.LANES.ONCOMING);

    this.state.isJumping = isDoubleTapJump;
    if (isDoubleTapJump) {
      setTimeout(() => {
        this.state.isJumping = false;
      }, 200);
    }

    this.state.touchState.lastTap = now;
  }

  moveRight(isDoubleTap = false, isTouchMove = false) {
    if (this.state.isDead) return;

    const now = Date.now();
    const isDoubleTapJump = !isTouchMove && isDoubleTap && now - this.state.touchState.lastTap < CONFIG.GAME.DOUBLE_TAP_TIME;

    const moveAmount = isDoubleTapJump ? 2 : isTouchMove ? 0.5 : 1;
    this.state.currentLane = Math.min(this.state.currentLane + moveAmount, CONFIG.LANES.BUILDINGS - 1);

    this.state.isJumping = isDoubleTapJump;
    if (isDoubleTapJump) {
      setTimeout(() => {
        this.state.isJumping = false;
      }, 200);
    }

    this.state.touchState.lastTap = now;
  }

  start() {
    if (this.state.isPlaying) return;

    const messageBox = document.getElementById("main-msg-box");
    if (messageBox) {
      messageBox.style.display = "none";
    }

    // console.log("Game starting, movement state:", {
    //   ...this.movementState,
    //   currentTime: performance.now(),
    // });

    this.state.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused;

    const messageBox = document.getElementById("main-msg-box");
    if (messageBox) {
      messageBox.style.display = this.state.isPaused ? "block" : "none";
      messageBox.textContent = this.state.isPaused ? "PAUSED" : "";
    }
  }

  updateBike() {
    const bikeEntity = new BaseEntity(
      this.config,
      {
        position: new Position(this.state.currentLane, CONFIG.GAME.CYCLIST_Y),
      },
      EntityType.BIKE
    );

    bikeEntity.width = ENTITIES.BIKE.width;
    bikeEntity.height = ENTITIES.BIKE.height;
    bikeEntity.art = ENTITIES.BIKE.art;
    bikeEntity.color = STYLES.BIKE;
    bikeEntity.behavior = new BikeBehavior(bikeEntity);

    return bikeEntity;
  }

  checkBikeCollisions() {
    const bikeHitbox = {
      x: this.state.currentLane,
      y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      width: ENTITIES.BIKE.width,
      height: ENTITIES.BIKE.height,
    };

    const entitiesForCollision = {
      obstacles: Array.from(this.spatialManager.entities).filter((e) => e.type !== EntityType.BIKE && e.type !== EntityType.PARKED_CAR),
      parkedCars: Array.from(this.spatialManager.entities).filter((e) => e.type === EntityType.PARKED_CAR),
    };

    const collision = this.spatialManager.collisionManager.checkBikeCollision(bikeHitbox, entitiesForCollision, this.state.isJumping);

    if (collision) {
      this.die(collision);
    }
  }

  spawnEntities() {
    // console.log("\n=== Spawn Cycle Config ===", {
    //   streetcarRate: CONFIG.SPAWN_RATES.STREETCAR,
    //   streetcarLaneCarRate: CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR,
    //   oncomingCarRate: CONFIG.SPAWN_RATES.ONCOMING_CAR,
    //   parkedCarRate: CONFIG.SPAWN_RATES.PARKED_CAR,
    //   streetcarLane: CONFIG.LANES.TRACKS,
    //   streetcarLaneCar: CONFIG.LANES.TRACKS + 1,
    //   oncomingLane: CONFIG.LANES.ONCOMING,
    //   parkedLane: CONFIG.LANES.PARKED,
    //   streetcarRate: CONFIG.SPAWN_RATES.STREETCAR,
    //   streetcarLaneCarRate: CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR,
    //   oncomingCarRate: CONFIG.SPAWN_RATES.ONCOMING_CAR,
    //   parkedCarRate: CONFIG.SPAWN_RATES.PARKED_CAR,
    // });

    const spawnChecks = [
      { type: EntityType.STREETCAR, rate: CONFIG.SPAWN_RATES.STREETCAR },
      { type: EntityType.STREETCAR_LANE_CAR, rate: CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR },
      { type: EntityType.ONCOMING_CAR, rate: CONFIG.SPAWN_RATES.ONCOMING_CAR },
      { type: EntityType.PARKED_CAR, rate: CONFIG.SPAWN_RATES.PARKED_CAR },
      { type: EntityType.PEDESTRIAN, rate: CONFIG.SPAWN_RATES.PEDESTRIAN },
    ];

    spawnChecks.forEach(({ type, rate }) => {
      if (type === EntityType.PEDESTRIAN) {
        // Handle pedestrian spawning normally
        if (Math.random() < rate) {
          const entity = this.spatialManager.spawnManager.spawnEntity(type);
          if (entity) {
            this.spatialManager.registerEntity(entity);
          }
        }
      } else {
        // Use cluster manager for vehicles
        if (this.clusterManager.shouldSpawnVehicle(type, rate)) {
          const entity = this.spatialManager.spawnManager.spawnEntity(type);
          if (entity) {
            this.spatialManager.registerEntity(entity);
          }
        }
      }
    });
  }
  initializeBuildings() {
    console.log("initializeBuildings spawn"); //findme

    let currentY = CONFIG.GAME.HEIGHT;
    const minSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 0; // Ensure minimum spacing

    while (currentY > CONFIG.SPAWNING.MIN_BUILDING_HEIGHT) {
      // Get current buildings sorted by Y position
      const existingBuildings = Array.from(this.spatialManager.entities)
        .filter((e) => e.type === EntityType.BUILDING)
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
        this.spatialManager.registerEntity(newBuilding);
        // Move up by building height plus minimum spacing
        currentY -= newBuilding.height + minSpacing;
      } else {
        // If collision detected, move up by a smaller increment
        currentY -= minSpacing;
      }
    }
  }

  initializeParkedCars() {
    let currentY = CONFIG.GAME.HEIGHT;
    while (currentY > -5) {
      const spawnConfig = {
        position: new Position(CONFIG.LANES.PARKED, currentY),
      };

      const car = new ParkedCar(CONFIG, spawnConfig);
      if (this.spatialManager.spawnManager.canSpawnAt(EntityType.PARKED_CAR, car.position)) {
        this.spatialManager.registerEntity(car);
        currentY -= car.height + 1;
      } else {
        currentY -= 1;
      }
    }
  }

  render() {
    if (this.state.isDead && this.state.deathState.animation >= 10) return;

    this.gridSystem.clear();
    this.drawRoadFeatures();
    this.drawBike();
    this.drawEntities();

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

  drawEntities() {
    this.spatialManager.entities.forEach((entity) => {
      if (entity.type !== EntityType.BIKE) {
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
                case EntityType.STREETCAR:
                  effectClass += "streetcar";
                  break;
                case EntityType.STREETCAR_LANE_CAR:
                case EntityType.ONCOMING_CAR:
                  effectClass += "car";
                  break;
                case EntityType.PARKED_CAR:
                  effectClass += entity.behavior?.doorState > 0 ? "door-opening" : "car";
                  break;
                case EntityType.PEDESTRIAN:
                  effectClass += "pedestrian";
                  break;
                case EntityType.BUILDING:
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

  // drawEntity(entity) {
  //   if (!entity || !entity.art) return;

  //   if (entity.position.y + entity.height >= 0 && entity.position.y < CONFIG.GAME.HEIGHT) {
  //     // Add debug markers for building boundaries
  //     if (entity.type === EntityType.BUILDING) {
  //       // Mark top boundary
  //       this.gridSystem.updateCell(
  //         Math.floor(entity.position.x),
  //         Math.floor(entity.position.y)
  //         // '▲',
  //         // '<span style="color: black">'
  //       );

  //       // Mark bottom boundary
  //       this.gridSystem.updateCell(
  //         Math.floor(entity.position.x),
  //         Math.floor(entity.position.y + entity.height)
  //         // '▼',
  //         // '<span style="color: black">'
  //       );
  //     }

  //     entity.art.forEach((line, i) => {
  //       if (entity.position.y + i >= 0 && entity.position.y + i < CONFIG.GAME.HEIGHT) {
  //         line.split("").forEach((char, x) => {
  //           if (char !== " " && entity.position.x + x >= 0 && entity.position.x + x < CONFIG.GAME.WIDTH) {
  //             // Get appropriate shadow class while keeping original colors
  //             let effectClass = "entity ";
  //             switch (entity.type) {
  //               case EntityType.STREETCAR:
  //                 effectClass += "streetcar";
  //                 break;
  //               case EntityType.STREETCAR_LANE_CAR:
  //               case EntityType.ONCOMING_CAR:
  //                 effectClass += "car";
  //                 break;
  //               case EntityType.PARKED_CAR:
  //                 effectClass += entity.behavior?.doorState > 0 ? "door-opening" : "car";
  //                 break;
  //               case EntityType.PEDESTRIAN:
  //                 effectClass += "pedestrian";
  //                 break;
  //               case EntityType.BUILDING:
  //                 effectClass += "building";
  //                 break;
  //             }

  //             const wrappedChar = `<span class="${effectClass}">${char}</span>`;
  //             this.gridSystem.updateCell(Math.floor(entity.position.x + x), Math.floor(entity.position.y + i), wrappedChar, entity.color);
  //           }
  //         });
  //       }
  //     });
  //   }
  // }

  drawBike() {
    if (this.state.isDead && this.state.deathState.animation < 15) {
      // Get current animation frame
      const frameIndex = Math.min(4, Math.floor(this.state.deathState.animation / 3));
      const frames = Object.values(EXPLOSION_FRAMES);
      const currentFrame = frames[frameIndex];

      // Get current color
      // const currentColor = EXPLOSION_COLORS[this.state.deathState.colorIndex];
      const currentColor = EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];

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
      ENTITIES.BIKE.art.forEach((line, i) => {
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
        const particleColor = EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];
        this.gridSystem.updateCell(x, y, `<span class="death-particle-outer">${char}</span>`, particleColor);
      }
    }
  }

  die(reason) {
    console.log("\n=== Death Animation Starting ===");

    this.state.isDead = true;

    // Store death state
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

    // Show death message
    this.showDeathMessage(reason);

    // Restart after a longer delay to see the glitch animation
    setTimeout(() => {
      const messageEl = document.getElementById("main-msg-box");
      if (messageEl) {
        messageEl.classList.remove("show-message");
      }
      this.restart();
    }, 2000); // Increased to 2 seconds to see the full glitch
  }

  die(reason) {
    console.log("\n=== Death Animation Starting ===");

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
    this.showDeathMessage(reason);

    // Capture screenshot after animation completes (these lines are ready but inactive)
    // setTimeout(() => {
    //   const score = this.state.score;
    //   const message = this.showDeathMessage(reason).message;
    //   html2canvas(gameScreen)
    //       .then((canvas) => {
    //           generateSocialCard.call(this, canvas, reason, score, message.funny, randomFace);
    //           generateSocialCardNoSS(reason, score, message.funny, randomFace);
    //       })
    //       .catch((error) => {
    //           console.error("Failed to capture screenshot:", error);
    //       });
    // }, this.config.ANIMATIONS.SCREEN_SHAKE_DURATION);

    // Restart game after death duration
    setTimeout(() => {
      const messageEl = document.getElementById("main-msg-box");
      if (messageEl) {
        messageEl.classList.remove("show-message");
      }
      this.restart();
    }, this.config.ANIMATIONS.DEATH_DURATION);
  }

  // die(reason) {
  //   this.state.isDead = true;

  //   // Store the death position using the current player position
  //   this.state.deathState = {
  //     animation: 0,
  //     x: Math.round(this.state.currentLane),
  //     y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
  //     reason: reason,
  //     frameCounter: 0,
  //     colorIndex: 0,
  //   };

  //   // Add screen shake effect
  //   const gameScreen = document.getElementById("game-screen");
  //   if (gameScreen) {
  //     gameScreen.classList.add("screen-shake");

  //     // Create game over overlay
  //     const overlay = document.createElement("div");
  //     overlay.className = "game-over";
  //     document.body.appendChild(overlay);

  //     // Clean up effects after animation
  //     setTimeout(() => {
  //       gameScreen.classList.remove("screen-shake");
  //       overlay.remove();
  //     }, this.config.ANIMATIONS.SCREEN_SHAKE_DURATION);
  //   }

  //   // Call flashScreen for red flash effect
  //   this.flashScreen();
  //   this.showDeathMessage(reason);

  //   // Capture screenshot after animation completes (these lines are ready but inactive)
  //   // setTimeout(() => {
  //   //   const score = this.state.score;
  //   //   const message = this.showDeathMessage(reason).message;

  //   //   html2canvas(gameScreen)
  //   //       .then((canvas) => {
  //   //           generateSocialCard.call(this, canvas, reason, score, message.funny, randomFace);
  //   //           generateSocialCardNoSS(reason, score, message.funny, randomFace);
  //   //       })
  //   //       .catch((error) => {
  //   //           console.error("Failed to capture screenshot:", error);
  //   //       });
  //   // }, this.config.ANIMATIONS.SCREEN_SHAKE_DURATION);

  //   // Restart game after death duration
  //   setTimeout(() => {
  //     const messageEl = document.getElementById("main-msg-box");
  //     if (messageEl) {
  //       messageEl.classList.remove("show-message");
  //     }
  //     this.restart();
  //   }, this.config.ANIMATIONS.DEATH_DURATION);
  // }

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

    // Return reason, message, and face as separate elements
    return { reason, message, randomFace };
  }

  getRandomDeathMessage(type) {
    const messages = MESSAGES.DEATH[type];
    if (!messages?.length) {
      return {
        reason: "X X!",
        funny: "Sometimes things just happen",
      };
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }

  restart() {
    this.cleanup();
    Building.nextSpawnY = null;
    this.spatialManager = new SpatialManager(CONFIG);
    this.state = new GameState(CONFIG);
    this.initializeGameWorld();
    this.setupControls();
    // this.setupTouchControls();
    this.start();

    Building.buildingManager = null; // This will force a new BuildingManager to be created

    const messageBox = document.getElementById("main-msg-box");
    if (messageBox) {
      messageBox.textContent = "CLICK HERE/SPACEBAR to play ";
    }
  }
  cleanup() {
    console.log("Cleanup called, old movement state:", {
      ...this.movementState,
    });

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.spatialManager.entities.clear();
    this.gridSystem.clear();
    const now = performance.now();
    this.movementState = {
      isMovingLeft: false,
      isMovingRight: false,
      lastMove: now,
      moveSpeed: 9,
      isFirstMovement: true, // Reset this flag on cleanup
    };

    this.preventDefaultTouchBehaviors();

    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler, options }) => {
        element.removeEventListener(type, handler, options);
      });
    });
    this.eventListeners.clear();
  }
}

// Initialize the game
const game = new LoserLane();
