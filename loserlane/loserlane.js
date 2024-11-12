const CONFIG = {
  GAME: {
    WIDTH: 40,
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
    keyPressCount: {
      left: 0,
      right: 0,
    },
  },
  SPAWN_RATES: {
    STREETCAR: 0.1,
    STREETCAR_LANE_CAR: 0.9,
    ONCOMING_CAR: 0.15,
    PARKED_CAR: 0.00005,
    DOOR_OPENING: 0.1,
    PEDESTRIAN: 0.05,
    BUILDING: 0.05,
  },
  SAFE_DISTANCE: {
    STREETCAR: 15,
    STREETCAR_LANE_CAR: 8,
    ONCOMING_CAR: 6,
    PARKED: 5,
    PEDESTRIAN: 3,
    BUILDING: 0,
    STREETCAR_TO_STREETCAR: 20, // Special case for streetcar-to-streetcar
    STREETCAR_TO_CAR: 15, // Special case for streetcar-to-car interactions
    CLUSTER_MIN: 1, // Minimum spacing within clusters
    CLUSTER_MAX: 2, // Maximum spacing within clusters
    CLUSTER_GAP_MIN: 4, // Minimum gap between clusters
    CLUSTER_GAP_MAX: 6, // Maximum gap between clusters
    DEFAULT: 5, // Default safe distance if no specific rule
  },
  PEDESTRIAN: {
    SPEED: 0.5,
  },
  LANES: {
    ONCOMING: 1,
    DIVIDER: 6,
    TRACKS: 9,
    BIKE: 14,
    BIKE_RIGHT: 15,
    PARKED: 17,
    SIDEWALK: 25,
    BUILDINGS: 29,
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

class GridSystem {
  constructor(config) {
    this.config = config;
    this.cellSize = 5; // Size of each grid cell
    this.cells = new Map(); // Map of cell coordinates to sets of entities
  }

  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  addEntity(entity) {
    const key = this.getCellKey(entity.position.x, entity.position.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key).add(entity);
  }

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

  updateEntityPosition(entity, oldPos, newPos) {
    const oldKey = this.getCellKey(oldPos.x, oldPos.y);
    const newKey = this.getCellKey(newPos.x, newPos.y);

    if (oldKey !== newKey) {
      this.cells.get(oldKey)?.delete(entity);
      if (!this.cells.has(newKey)) {
        this.cells.set(newKey, new Set());
      }
      this.cells.get(newKey).add(entity);
    }
  }

  getNearbyEntities(position, radius) {
    const nearbyEntities = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);

    const centerCellX = Math.floor(position.x / this.cellSize);
    const centerCellY = Math.floor(position.y / this.cellSize);

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
    this.debugLog = true;
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
              return "TRAFFIC";
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

          if (this.debugLog) {
            // console.log(`[CollisionDebug] Detected collision between:`, {
            //   entityA: { type: entityA.type, position: entityA.position },
            //   entityB: { type: entityB.type, position: entityB.position },
            // });
          }
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
  }

  validateMove(entity, newPosition) {
    if (entity.behavior?.ignoreCollisions) {
      return true;
    }

    const tempPosition = entity.position;
    entity.position = newPosition;

    const nearby = this.spatialManager.grid.getNearbyEntities(newPosition, Math.max(entity.width, entity.height) * 2);

    let isValid = true;
    for (const other of nearby) {
      // Allow movement if colliding with bike
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
    // Priority based on entity type and current situation
    const priorities = {
      [EntityType.STREETCAR]: 10,
      [EntityType.BIKE]: 9,
      [EntityType.STREETCAR_LANE_CAR]: 8,
      [EntityType.ONCOMING_CAR]: 7,
      [EntityType.PARKED_CAR]: 6,
      [EntityType.PEDESTRIAN]: 5,
      [EntityType.BUILDING]: 0,
    };

    return priorities[entity.type] || 0;
  }

  validateLaneChange(entity, newLane) {
    const laneOccupants = this.spatialManager.getLaneOccupants(newLane);
    const safeDistance = this.calculateSafeDistance(entity);

    return laneOccupants.every((occupant) => Math.abs(occupant.position.y - entity.position.y) >= safeDistance);
  }

  calculateSafeDistance(entity) {
    // Safe distances by entity type
    const safeDistances = {
      [EntityType.STREETCAR]: 15,
      [EntityType.STREETCAR_LANE_CAR]: 8,
      [EntityType.ONCOMING_CAR]: 6,
      [EntityType.PARKED_CAR]: 5,
      [EntityType.PEDESTRIAN]: 3,
    };

    return safeDistances[entity.type] || 5;
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
    this.debugLog = true;

    // Update parked car configuration to use CONFIG values
    this.parkedCarConfig = {
      minClusterSpacing: this.config.SAFE_DISTANCE.CLUSTER_MIN,
      maxClusterSpacing: this.config.SAFE_DISTANCE.CLUSTER_MAX,
      gapChance: 0.1,
      minGapSize: this.config.SAFE_DISTANCE.CLUSTER_GAP_MIN,
      maxGapSize: this.config.SAFE_DISTANCE.CLUSTER_GAP_MAX,
      minClusterSize: 4,
      maxClusterSize: 7,
    };

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
            max: Math.floor(this.config.SAFE_DISTANCE.STREETCAR * 0.8) 
          },
          laneRules: {
            allowedLanes: [this.config.LANES.TRACKS],
            spawnPosition: {
              x: this.config.LANES.TRACKS,
              y: this.config.GAME.HEIGHT + 5
            },
            direction: -1
          }
        }
      ],
      [
        EntityType.STREETCAR_LANE_CAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.STREETCAR_LANE_CAR * 0.8)
          },
          laneRules: {
            allowedLanes: [this.config.LANES.TRACKS + 1],
            spawnPosition: {
              x: this.config.LANES.TRACKS + 1,
              y: this.config.GAME.HEIGHT + 1
            },
            direction: -1
          }
        }
      ],
      [
        EntityType.ONCOMING_CAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.ONCOMING_CAR,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_CAR * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.ONCOMING_CAR * 0.8)
          },
          laneRules: {
            allowedLanes: [this.config.LANES.ONCOMING],
            spawnPosition: {
              x: this.config.LANES.ONCOMING,
              y: -10
            },
            direction: 1
          }
        }
      ],
      [
        EntityType.PARKED_CAR,
        {
          baseSpacing: this.config.SAFE_DISTANCE.PARKED,
          randomSpacingRange: {
            min: 0,
            max: Math.floor(this.config.SAFE_DISTANCE.PARKED * 0.2)
          },
          laneRules: {
            allowedLanes: [this.config.LANES.PARKED],
            spawnPosition: {
              x: this.config.LANES.PARKED,
              y: -5
            },
            direction: 1
          }
        }
      ],
      [
        EntityType.PEDESTRIAN,
        {
          baseSpacing: this.config.SAFE_DISTANCE.PEDESTRIAN,
          randomSpacingRange: {
            min: Math.floor(this.config.SAFE_DISTANCE.PEDESTRIAN * 0.3),
            max: Math.floor(this.config.SAFE_DISTANCE.PEDESTRIAN * 0.8)
          },
          laneRules: {
            allowedLanes: [this.config.LANES.SIDEWALK],
            spawnPosition: {
              x: this.config.LANES.SIDEWALK,
              y: -1
            },
            direction: 1
          }
        }
      ],
      [
        EntityType.BUILDING,
        {
          baseSpacing: this.config.SAFE_DISTANCE.BUILDING,
          randomSpacingRange: {
            min: 3,
            max: 7
          },
          laneRules: {
            allowedLanes: [this.config.LANES.BUILDINGS],
            spawnPosition: {
              x: this.config.LANES.BUILDINGS,
              y: this.config.GAME.HEIGHT
            },
            direction: -1
          }
        }
      ]
    ]);
  }

  getRequiredSpacing(entityTypeA, entityTypeB) {
    // Special cases first
    if (entityTypeA === EntityType.STREETCAR && entityTypeB === EntityType.STREETCAR) {
      return this.config.SAFE_DISTANCE.STREETCAR_TO_STREETCAR;
    }
    if (entityTypeA === EntityType.STREETCAR && 
       (entityTypeB === EntityType.STREETCAR_LANE_CAR || entityTypeB === EntityType.ONCOMING_CAR)) {
      return this.config.SAFE_DISTANCE.STREETCAR_TO_CAR;
    }

    // Get base safe distances from CONFIG
    const baseDistance = this.config.SAFE_DISTANCE[entityTypeA] || this.config.SAFE_DISTANCE.DEFAULT;
  
    // Add 50% more space for same-lane entities
    return baseDistance * (entityTypeA === entityTypeB ? 1.5 : 1);
  }


  canSpawnAt(entityType, position) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) {
      if (this.debugLog) console.log(`[SpawnDebug] No rules found for entity type: ${entityType}`);
      return false;
    }

    // Check if the lane is allowed
    const isLaneAllowed = rules.laneRules.allowedLanes.includes(Math.floor(position.x));
    if (!isLaneAllowed) {
      if (this.debugLog) console.log(`[SpawnDebug] Lane ${position.x} not allowed for ${entityType}`);
      return false;
    }

    // Get all entities that could potentially conflict
    const nearbyEntities = Array.from(this.spatialManager.entities).filter((entity) => {
      const xDistance = Math.abs(entity.position.x - position.x);
      const yDistance = Math.abs(entity.position.y - position.y);

      if (yDistance > 30) return false;

      if (entityType === EntityType.STREETCAR || entity.type === EntityType.STREETCAR) {
        return xDistance <= 2;
      }
      return xDistance <= 1;
    });

    // Check for minimum spacing between entities
    const hasEnoughSpace = nearbyEntities.every((entity) => {
      const distance = Math.abs(entity.position.y - position.y);
      const requiredSpacing = this.getRequiredSpacing(entityType, entity.type);

      // Additional check for same-lane entities
      if (Math.abs(entity.position.x - position.x) < 0.1) {
        return distance >= requiredSpacing * 1.5; // 50% more space in same lane
      }
      return distance >= requiredSpacing;
    });

    return hasEnoughSpace;
  }

  // Keep all other existing SpawnManager methods the same...
  spawnEntity(entityType) {
    if (this.debugLog && entityType === EntityType.STREETCAR) {
      // console.log(`[SpawnDebug] Attempting to spawn ${entityType}`);
    }

    const spawnConfig = this.getSpawnConfig(entityType);
    if (!spawnConfig) return null;

    if (this.canSpawnAt(entityType, spawnConfig.position)) {
      const EntityClass = this.getEntityClass(entityType);
      if (EntityClass) {
        if (entityType === EntityType.PEDESTRIAN) {
          const isGoingUp = Math.random() < 0.5;
          return new Pedestrian(this.config, spawnConfig, isGoingUp);
        }

        const entity = new EntityClass(this.config, spawnConfig);

        if (this.debugLog && entityType === EntityType.STREETCAR) {
          // console.log(`[SpawnDebug] Successfully spawned ${entityType}:`, {
          //   position: `(${entity.position.x}, ${entity.position.y})`,
          //   entityId: entity.id,
          // });
        }

        return entity;
      }
    }

    return null;
  }

  getSpawnConfig(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) {
      if (this.debugLog) console.log(`[SpawnDebug] No spawn config found for ${entityType}`);
      return null;
    }

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
    this.animationState = 0;
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
      minDistance: 2,
      ignoreCollisions: false,
      hasAnimation: true,
    });

    this.doorState = DOOR_STATES.CLOSED;
    this.doorOpenDuration = 100;
    this.doorTimer = 0;
    this.doorHitbox = null;
    this.shouldOpenDoor = Math.random() < 0.3;
    this.doorAnimationActive = false;
    this.lastDoorUpdate = Date.now();
    this.doorOpenDelay = 25;

    // Calculate target Y position for door opening
    const targetPercentage = 0.2 + Math.random() * 0.1;
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
  }

  shouldMove() {
    if (this.stopped) {
      return false;
    }

    const nearbyEntities = this.getNearbyEntities();
    return !this.shouldStop(nearbyEntities);
  }

  shouldStop(nearbyEntities) {
    return nearbyEntities.some((other) => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      return distance < this.minDistance;
    });
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
}
class StreetcarLaneCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -1,
      minDistance: entity.config.SAFE_DISTANCE.STREETCAR_LANE_CAR,
      ignoreCollisions: false,
    });

    this.willPark = Math.random() < 0.9;
    this.isParking = false;
    this.targetLane = entity.config.LANES.PARKED;
    this.originalSpeed = this.baseSpeed;
    this.parkingAttempts = 0;
    this.maxAttempts = 5; // Add max attempts limit
  }

  handleParking() {
    this.parkingAttempts++;

    // If we've tried too many times, force transform
    if (this.parkingAttempts > this.maxAttempts) {
      console.log("Max parking attempts reached, forcing transformation");
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
    for (let speedMultiplier of [1, 0.75, 0.5, 0.25]) {
      const newPosition = new Position(currentX + moveDirection * speedMultiplier, this.entity.position.y + verticalSpeed);

      if (this.entity.spatialManager.validateMove(this.entity, newPosition)) {
        this.entity.spatialManager.movementCoordinator.moveEntity(this.entity, newPosition);

        if (distanceToLane < 0.5) {
          console.log("At parking position, transforming");
          this.transformToParkedCar();
        }
        return;
      }
    }

    console.log("All parking movements blocked");
    // If we get here, movement was blocked - force transform after a few attempts
    if (this.parkingAttempts > 3) {
      console.log("Movement blocked too many times, forcing transformation");
      this.transformToParkedCar();
    }
  }

  transformToParkedCar() {
    const spatialManager = this.entity.spatialManager;

    // Create parked car at current position but in parking lane
    const parkedCar = new ParkedCar(this.entity.config, {
      position: new Position(this.targetLane, this.entity.position.y),
    });

    // Ensure it moves down
    parkedCar.behavior.baseSpeed = 1;

    // Add new car first, then remove old one
    spatialManager.registerEntity(parkedCar);
    spatialManager.unregisterEntity(this.entity);

    console.log("Successfully transformed to parked car at:", {
      x: parkedCar.position.x,
      y: parkedCar.position.y,
    });
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
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -0.5 : 0.5;
    this.stopped = false;
    this.waitTime = 0;
    // Add minDistance using config
    this.minDistance = entity.config.SAFE_DISTANCE.PEDESTRIAN;
  }

  shouldWait(nearbyEntities) {
    return nearbyEntities.some((other) => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      // Use configured minDistance instead of hardcoded value
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
      this.waitTime = 20; // Wait for 20 frames
      return;
    }

    const newPosition = new Position(Math.round(this.entity.position.x), this.entity.position.y + this.baseSpeed);

    if (this.canMoveTo(newPosition)) {
      this.entity.position = newPosition;
    }
  }

  getNearbyEntities() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid
      .getNearbyEntities(this.entity.position, 2)
      .filter(
        (entity) =>
          entity !== this.entity &&
          entity.type !== EntityType.BIKE &&
          entity.type === EntityType.PEDESTRIAN &&
          Math.abs(entity.position.x - this.entity.position.x) < 1
      );
  }

  shouldWait(nearbyEntities) {
    return nearbyEntities.some((other) => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      return distance < 2;
    });
  }
}

class BikeBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
  }
}

class BuildingBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
    this.speed = 1;
    this.ignoreCollisions = true;
    this.lastRespawnTime = 0;
    this.RESPAWN_COOLDOWN = 100;
  }

  update() {
    this.entity.position.y += this.speed;

    if (this.entity.position.y >= this.entity.config.GAME.HEIGHT) {
      // Select new building FIRST so we know its height
      if (Building.buildingIndex >= Building.availableBuildings.length) {
        Building.availableBuildings = Building.shuffleArray([...TORONTO_BUILDINGS]);
        // console.log("yo shuff");

        Building.buildingIndex = 0;
      }

      const selectedBuilding = Building.availableBuildings[Building.buildingIndex++];
      const newHeight = selectedBuilding.art.length;

      // Get all buildings
      const buildings = Array.from(this.entity.spatialManager.entities).filter((e) => e.type === EntityType.BUILDING && e !== this.entity);

      // Find highest building and place new one above it
      let newY;
      if (buildings.length > 0) {
        const highestBuilding = buildings.reduce((highest, current) => (current.position.y < highest.position.y ? current : highest));
        newY = Math.min(0, highestBuilding.position.y) - newHeight; // Force it to be at or above screen top
      } else {
        newY = -newHeight;
      }

      // Update entity
      this.entity.position.y = newY;
      this.entity.art = selectedBuilding.art;
      this.entity.height = newHeight;
      this.entity.name = selectedBuilding.name;
    }
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
    const template = isGoingUp ? ENTITIES.PEDESTRIAN.UP : ENTITIES.PEDESTRIAN.DOWN;
    this.width = template.width;
    this.height = template.height;
    this.art = template.art;
    this.color = STYLES.RESET;
    this.behavior = new PedestrianBehavior(this, isGoingUp);
  }
}

class Building extends BaseEntity {
  static nextSpawnY = null;
  static availableBuildings = [...TORONTO_BUILDINGS];
  static buildingIndex = 0;

  constructor(config, spawnY = null) {
    // Shuffle availableBuildings if it's the first build or if all buildings have been used
    // if (Building.buildingIndex >= Building.availableBuildings.length) {
    Building.availableBuildings = Building.shuffleArray([...TORONTO_BUILDINGS]);
    Building.buildingIndex = 0;
    // console.log(
    //   "yo New shuffled list of buildings:",
    //   Building.availableBuildings.map((building) => building.name)
    // );
    // }

    const selectedBuilding = Building.availableBuildings[Building.buildingIndex++];
    // console.log("Selected building:", selectedBuilding.name);

    const height = selectedBuilding.art.length;
    const calculatedY = spawnY ?? (Building.nextSpawnY !== null ? Building.nextSpawnY - height : 0);

    const spawnConfig = {
      position: new Position(config.LANES.BUILDINGS, calculatedY),
    };

    super(config, spawnConfig, EntityType.BUILDING);
    this.width = selectedBuilding.art[0].length;
    this.height = height;
    this.art = selectedBuilding.art;
    this.color = `<span style='color: ${this.getRandomBuildingColor()}'>`;
    this.behavior = new BuildingBehavior(this);
    this.name = selectedBuilding.name;

    Building.nextSpawnY = calculatedY;
  }

  static shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  getRandomBuildingColor() {
    return COLOURS.BUILDINGS[Math.floor(Math.random() * COLOURS.BUILDINGS.length)];
  }
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
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

      // Update animation frame every 3 frames
      if (this.deathState.frameCounter % 3 === 0) {
        this.deathState.animation++;
      }

      return this.deathState.animation > 15; // Extended animation duration
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

class OptimizedGridSystem {
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
    this.dirtyRegions = new Set();
  }

  markRegionDirty(x1, y1, x2, y2) {
    for (let y = Math.max(0, Math.floor(y1)); y < Math.min(this.height, Math.ceil(y2)); y++) {
      for (let x = Math.max(0, Math.floor(x1)); x < Math.min(this.width, Math.ceil(x2)); x++) {
        this.grid[y][x].dirty = true;
        this.dirtyRegions.add(`${x},${y}`);
      }
    }
  }

  updateCell(x, y, content, style = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const cell = this.grid[y][x];
    if (cell.content !== content || cell.style !== style) {
      cell.content = content;
      cell.style = style;
      cell.dirty = true;
      this.dirtyRegions.add(`${x},${y}`);
    }
  }

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

    this.DOUBLE_TAP_WINDOW = 300; // Half second window for double tap
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
    if (currentTime - state.lastTap < this.DOUBLE_TAP_WINDOW) {
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
      moveSpeed: 9,
      holdDelay: 200, // ms to wait before starting continuous movement
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

    console.log("Game starting, movement state:", {
      ...this.movementState,
      currentTime: performance.now(),
    });

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
    const spawnChecks = [
      { type: EntityType.STREETCAR, rate: CONFIG.SPAWN_RATES.STREETCAR },
      { type: EntityType.STREETCAR_LANE_CAR, rate: CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR },
      { type: EntityType.ONCOMING_CAR, rate: CONFIG.SPAWN_RATES.ONCOMING_CAR },
      { type: EntityType.PARKED_CAR, rate: CONFIG.SPAWN_RATES.PARKED_CAR },
      { type: EntityType.PEDESTRIAN, rate: CONFIG.SPAWN_RATES.PEDESTRIAN },
    ];

    spawnChecks.forEach(({ type, rate }) => {
      if (Math.random() < rate) {
        const entity = this.spatialManager.spawnManager.spawnEntity(type);
        if (entity) {
          this.spatialManager.registerEntity(entity);
        }
      }
    });
  }

  initializeBuildings() {
    let currentY = CONFIG.GAME.HEIGHT;
    const buildingSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 0;

    while (currentY > -20) {
      // Get all existing buildings for spacing check
      const existingBuildings = Array.from(this.spatialManager.entities)
        .filter((e) => e.type === EntityType.BUILDING)
        .sort((a, b) => a.position.y - b.position.y);

      const building = new Building(CONFIG, currentY);

      // Check if there's overlap with any existing building
      const hasOverlap = existingBuildings.some((existing) => {
        const topOverlap = currentY <= existing.position.y + existing.height;
        const bottomOverlap = currentY + building.height >= existing.position.y;
        return topOverlap && bottomOverlap;
      });

      if (!hasOverlap) {
        this.spatialManager.registerEntity(building);
        // Move up by building height plus spacing
        currentY -= building.height + buildingSpacing;
      } else {
        // If overlap detected, move up by smaller increment and try again
        currentY -= 1;
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
      entity.art.forEach((line, i) => {
        if (entity.position.y + i >= 0 && entity.position.y + i < CONFIG.GAME.HEIGHT) {
          line.split("").forEach((char, x) => {
            if (char !== " " && entity.position.x + x >= 0 && entity.position.x + x < CONFIG.GAME.WIDTH) {
              // Get appropriate shadow class while keeping original colors
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
      // const currentColor = EXPLOSION_COLORS[this.state.deathState.colorIndex];
      const currentColor = EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];

      console.log(currentColor);

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

    const numParticles = Math.min(20, this.state.deathState.animation * 2);

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const radius = this.state.deathState.animation / 2 + Math.random() * 2;

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

      // Add CSS for new particle animations
      const style = document.createElement("style");
      style.textContent = `
        .death-particle {
          animation: particle-pulse 0.3s infinite;
        }
        .death-particle-outer {
          animation: particle-float 0.5s ease-out;
        }
        @keyframes particle-pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes particle-float {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(var(--float-x, 5px), var(--float-y, -5px)); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      // Create game over overlay
      const overlay = document.createElement("div");
      overlay.className = "game-over";
      document.body.appendChild(overlay);

      // Clean up effects after animation
      setTimeout(() => {
        gameScreen.classList.remove("screen-shake");
        overlay.remove();
        style.remove();
      }, 1000);
    }

    this.flashScreen();
    this.showDeathMessage(reason);

    setTimeout(() => {
      const messageEl = document.getElementById("main-msg-box");
      if (messageEl) {
        messageEl.classList.remove("show-message");
      }
      this.restart();
    }, 1500); // Slightly longer delay to show full animation
  }
  flashScreen() {
    const gameScreen = document.getElementById("game-screen");
    if (!gameScreen) return;

    const colors = ["#FF0000", "#000000", "#222"];
    let delay = 0;

    colors.forEach((color) => {
      setTimeout(() => {
        gameScreen.style.backgroundColor = color;
      }, delay);
      delay += 100;
    });
  }

  showDeathMessage(reason) {
    const messageEl = document.getElementById("main-msg-box");
    if (!messageEl) return;

    const randomMessage = this.getRandomDeathMessage(reason);
    const randomFace = cuteDeathFaces[Math.floor(Math.random() * cuteDeathFaces.length)];

    // <span class="message-reason">${randomMessage.reason}</span>

    messageEl.innerHTML = `
      ${randomMessage.funny}<br /><br />
      <span class="cute-death-face">${randomFace}</span>
    `;
    messageEl.style.display = "block";
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

    // console.log("New movement state after cleanup:", {
    //   ...this.movementState,
    // });

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
