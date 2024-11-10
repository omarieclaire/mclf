const CONFIG = {
  GAME: {
    WIDTH: 45,
    HEIGHT: Math.floor(window.innerHeight / 20),
    INITIAL_SPEED: 500,
    MIN_SPEED: 300,
    SPEED_DECREASE_RATE: 0.995,
    CYCLIST_Y: Math.floor(window.innerHeight / 40),
    DOUBLE_TAP_TIME: 350,
    TAP_RESET_DELAY: 500,
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
    STREETCAR_LANE_CAR: 0.4,
    ONCOMING_CAR: 0.15,
    PARKED_CAR: 0.15,
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
  },
  PEDESTRIAN: {
    SPEED: 0.5,
  },
  LANES: {
    ONCOMING: 2,
    DIVIDER: 8,
    TRACKS: 12,
    BIKE: 19,
    BIKE_RIGHT: 20,
    PARKED: 22,
    SIDEWALK: 30,
    SHOPS: 34,
  },
};

class EntityType {
  static STREETCAR = "STREETCAR";
  static STREETCAR_LANE_CAR = "STREETCAR_LANE_CAR";
  static ONCOMING_CAR = "ONCOMING_CAR";
  static PARKED_CAR = "PARKED_CAR";
  static PEDESTRIAN = "PEDESTRIAN";
  static BUILDING = "BUILDING";
  static PLAYER = "PLAYER";
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

  checkPlayerCollision(playerHitbox, entities, isJumping) {
    // First check streetcars and other vehicles
    for (const obstacle of entities.obstacles) {
      // Skip checking streetcar collision only when jumping over tracks and it's a streetcar
      if (isJumping && obstacle.type === EntityType.STREETCAR) {
        const playerCenter = playerHitbox.x + playerHitbox.width / 2;
        const streetcarCenter = obstacle.position.x + obstacle.width / 2;
        // Only skip if player is directly above the streetcar
        if (Math.abs(playerCenter - streetcarCenter) < 2) {
          continue;
        }
      }

      if (this.checkCollision(playerHitbox, obstacle.getHitbox())) {
        switch (obstacle.type) {
          case EntityType.STREETCAR:
            return "STREETCAR";
          case EntityType.STREETCAR_LANE_CAR:
            return "TRAFFIC";
          case EntityType.ONCOMING_CAR:
            return "TRAFFIC";
          case EntityType.PEDESTRIAN:
            return "PEDESTRIAN";
          case EntityType.BUILDING:
            return "SHOP";
          case EntityType.PARKED_CAR:
            return "PARKEDCAR";
          default:
            if (this.debugLog) {
              console.warn("Unknown collision entity type:", obstacle.type);
            }
            return "TRAFFIC";
        }
      }
    }

    // Then check parked cars and doors separately
    for (const car of entities.parkedCars) {
      // First check the car hitbox
      if (this.checkCollision(playerHitbox, car.getHitbox())) {
        return "PARKEDCAR";
      }
      // Then check door hitbox if it exists
      if (car.behavior.doorHitbox && this.checkCollision(playerHitbox, car.behavior.doorHitbox)) {
        return "DOOR";
      }
    }

    // Finally check track collisions when not jumping
    const trackPositions = [this.config.LANES.TRACKS + 1, this.config.LANES.TRACKS + 5];
    const playerCenter = playerHitbox.x + playerHitbox.width / 2;
    if (!isJumping && trackPositions.includes(Math.floor(playerCenter))) {
      return "TRACKS";
    }

    return null;
  }

  update() {
    const pairs = this.getCollisionPairs();
    
    for (const [entityA, entityB] of pairs) {
      // Handle player collisions
      if (entityA.type === EntityType.PLAYER || entityB.type === EntityType.PLAYER) {
        const player = entityA.type === EntityType.PLAYER ? entityA : entityB;
        const obstacle = entityA.type === EntityType.PLAYER ? entityB : entityA;

        const entitiesForCollision = {
          obstacles: [obstacle],
          parkedCars: obstacle.type === EntityType.PARKED_CAR ? [obstacle] : [],
        };

        const collisionType = this.checkPlayerCollision(
          player.getHitbox(),
          entitiesForCollision,
          false
        );

        if (collisionType) {
          player.behavior.onCollision(obstacle);
        }
      } else {
        // Handle non-player entity collisions
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
      [EntityType.BUILDING]: 0
    };

    return priorities[entity.type] || 0;
  }

  getCollisionPairs() {
    const pairs = [];
    const entities = Array.from(this.spatialManager.entities);
    const processedPairs = new Set();

    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const nearby = this.spatialManager.grid.getNearbyEntities(
        entityA.position,
        Math.max(entityA.width, entityA.height) * 2
      );

      for (const entityB of nearby) {
        if (entityA === entityB) continue;

        // Create a unique key for this pair
        const pairKey = [entityA.id, entityB.id].sort().join(',');
        if (processedPairs.has(pairKey)) continue;

        if (this.shouldCheckCollision(entityA, entityB) && 
            this.checkCollision(entityA.getHitbox(), entityB.getHitbox())) {
          pairs.push([entityA, entityB]);
          processedPairs.add(pairKey);

          if (this.debugLog) {
            console.log(`[CollisionDebug] Detected collision between:`, {
              entityA: { type: entityA.type, position: entityA.position },
              entityB: { type: entityB.type, position: entityB.position }
            });
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

    // Always check collisions with the player
    if (entityA.type === EntityType.PLAYER || entityB.type === EntityType.PLAYER) {
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

    // Get nearby entities to check for collisions
    const radius = Math.max(entity.width, entity.height) * 2;
    const nearby = this.spatialManager.grid.getNearbyEntities(newPosition, radius);

    let isValid = true;
    for (const other of nearby) {
      if (other !== entity && 
          this.shouldCheckCollision(entity, other) && 
          this.checkCollision(entity.getHitbox(), other.getHitbox())) {
        
        if (this.debugLog) {
          console.log(`[CollisionDebug] Movement blocked:`, {
            entity: { type: entity.type, newPosition },
            blocker: { type: other.type, position: other.position }
          });
        }

        isValid = false;
        break;
      }
    }

    // Restore original position
    entity.position = tempPosition;
    return isValid;
  }

  getCollisionDirection(entityA, entityB) {
    const centerA = {
      x: entityA.position.x + entityA.width / 2,
      y: entityA.position.y + entityA.height / 2
    };
    const centerB = {
      x: entityB.position.x + entityB.width / 2,
      y: entityB.position.y + entityB.height / 2
    };

    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;

    // Return the dominant direction of collision
    return Math.abs(dx) > Math.abs(dy) ? 
      (dx > 0 ? 'right' : 'left') : 
      (dy > 0 ? 'down' : 'up');
  }
}
class MovementCoordinator {
  constructor(spatialManager) {
    this.spatialManager = spatialManager;
    this.activeMovements = new Map();
  }

  validateMove(entity, newPosition) {
    if (entity.behavior.ignoreCollisions) {
      return true;
    }

    const tempPosition = entity.position;
    entity.position = newPosition;

    const nearby = this.spatialManager.grid.getNearbyEntities(newPosition, Math.max(entity.width, entity.height) * 2);

    let isValid = true;
    for (const other of nearby) {
      if (
        other !== entity &&
        !other.behavior.ignoreCollisions &&
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
      [EntityType.PLAYER]: 9,
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
    this.initializeSpawnRules();
  }

  initializeSpawnRules() {
    this.spawnRules = new Map([
      [
        EntityType.STREETCAR,
        {
          baseSpacing: 20,
          randomSpacingRange: { min: 5, max: 15 },
          laneRules: {
            allowedLanes: [this.config.LANES.TRACKS],
            spawnPosition: { 
              x: this.config.LANES.TRACKS, 
              y: this.config.GAME.HEIGHT + 5 
            },
            direction: -1,
          },
        },
      ],
      [
        EntityType.STREETCAR_LANE_CAR,
        {
          baseSpacing: 12,
          randomSpacingRange: { min: 3, max: 10 },
          laneRules: {
            allowedLanes: [this.config.LANES.TRACKS + 1],
            spawnPosition: { 
              x: this.config.LANES.TRACKS + 1, 
              y: this.config.GAME.HEIGHT + 1 
            },
            direction: -1,
          },
        },
      ],
      [
        EntityType.ONCOMING_CAR,
        {
          baseSpacing: 8,
          randomSpacingRange: { min: 2, max: 8 },
          laneRules: {
            allowedLanes: [this.config.LANES.ONCOMING],
            spawnPosition: { 
              x: this.config.LANES.ONCOMING, 
              y: -10 
            },
            direction: 1,
          },
        },
      ],
      [
        EntityType.PARKED_CAR,
        {
          baseSpacing: 5,
          randomSpacingRange: { min: 2, max: 6 },
          laneRules: {
            allowedLanes: [this.config.LANES.PARKED],
            spawnPosition: { 
              x: this.config.LANES.PARKED, 
              y: -5 
            },
            direction: 1,
          },
        },
      ],
      [
        EntityType.PEDESTRIAN,
        {
          baseSpacing: 3,
          randomSpacingRange: { min: 1, max: 4 },
          laneRules: {
            allowedLanes: [this.config.LANES.SIDEWALK],
            spawnPosition: { 
              x: this.config.LANES.SIDEWALK, 
              y: -1 
            },
            direction: 1,
          },
        },
      ],
    ]);

    if (this.debugLog) {
      console.log('[SpawnDebug] Initialized spawn rules:', {
        streetcarLane: this.config.LANES.TRACKS,
        allRules: Array.from(this.spawnRules.entries()).map(([type, rules]) => ({
          type,
          allowedLanes: rules.laneRules.allowedLanes,
          spawnPosition: rules.laneRules.spawnPosition
        }))
      });
    }
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
    const nearbyEntities = Array.from(this.spatialManager.entities)
      .filter(entity => {
        // Check entities in the same lane and adjacent lanes
        const xDistance = Math.abs(entity.position.x - position.x);
        const yDistance = Math.abs(entity.position.y - position.y);
        
        // Only consider entities within a reasonable vertical distance
        if (yDistance > 30) return false;

        if (entityType === EntityType.STREETCAR || entity.type === EntityType.STREETCAR) {
          // Streetcars need more space laterally
          return xDistance <= 2;
        }
        // Other entities only check same lane and immediate adjacent lanes
        return xDistance <= 1;
      });

    // Check for minimum spacing between entities
    const hasEnoughSpace = nearbyEntities.every(entity => {
      const distance = Math.abs(entity.position.y - position.y);
      const requiredSpacing = this.getRequiredSpacing(entityType, entity.type);
      
      // Additional check for same-lane entities
      if (Math.abs(entity.position.x - position.x) < 0.1) {
        return distance >= requiredSpacing * 1.5; // 50% more space in same lane
      }
      return distance >= requiredSpacing;
    });

    if (this.debugLog && (entityType === EntityType.STREETCAR || nearbyEntities.length > 0)) {
      console.log(`[SpawnDebug] Space check for ${entityType}:`, {
        position: `(${position.x}, ${position.y})`,
        nearbyCount: nearbyEntities.length,
        hasEnoughSpace,
        nearbyPositions: nearbyEntities.map(e => ({
          type: e.type,
          pos: `(${e.position.x}, ${e.position.y})`
        }))
      });
    }

    return hasEnoughSpace;
  }

  getRequiredSpacing(typeA, typeB) {
    // Define minimum spacing requirements between different entity types
    const spacingMatrix = {
      [EntityType.STREETCAR]: {
        [EntityType.STREETCAR]: 20,
        [EntityType.STREETCAR_LANE_CAR]: 15,
        [EntityType.ONCOMING_CAR]: 12,
        [EntityType.PARKED_CAR]: 10,
        DEFAULT: 12
      },
      [EntityType.STREETCAR_LANE_CAR]: {
        [EntityType.STREETCAR]: 15,
        [EntityType.STREETCAR_LANE_CAR]: 10,
        [EntityType.ONCOMING_CAR]: 8,
        DEFAULT: 8
      },
      [EntityType.ONCOMING_CAR]: {
        [EntityType.STREETCAR]: 12,
        [EntityType.STREETCAR_LANE_CAR]: 8,
        [EntityType.ONCOMING_CAR]: 6,
        DEFAULT: 5
      },
      [EntityType.PARKED_CAR]: {
        [EntityType.STREETCAR]: 10,
        [EntityType.PARKED_CAR]: 5,
        DEFAULT: 4
      },
      [EntityType.PEDESTRIAN]: {
        DEFAULT: 3
      },
      DEFAULT: {
        [EntityType.STREETCAR]: 12,
        [EntityType.STREETCAR_LANE_CAR]: 8,
        [EntityType.ONCOMING_CAR]: 6,
        [EntityType.PARKED_CAR]: 4,
        [EntityType.PEDESTRIAN]: 3,
        DEFAULT: 5
      }
    };

    const typeASpacing = spacingMatrix[typeA] || spacingMatrix.DEFAULT;
    return (typeASpacing[typeB] || typeASpacing.DEFAULT);
  }

  calculateSpacing(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) return 0;

    const baseSpacing = rules.baseSpacing;

    // Add random additional spacing more frequently for streetcars and cars
    const randomChance = entityType === EntityType.STREETCAR ? 0.4 :
                        entityType === EntityType.STREETCAR_LANE_CAR ? 0.3 : 0.2;

    if (Math.random() < randomChance) {
      const { min, max } = rules.randomSpacingRange;
      const additionalSpacing = Math.random() * (max - min) + min;
      const spacing = baseSpacing + additionalSpacing;

      if (this.debugLog && entityType === EntityType.STREETCAR) {
        console.log(`[SpawnDebug] Calculated spacing for ${entityType}:`, {
          baseSpacing,
          additionalSpacing,
          finalSpacing: spacing
        });
      }
      return spacing;
    }

    return baseSpacing;
  }

  getSpawnConfig(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) {
      if (this.debugLog) console.log(`[SpawnDebug] No spawn config found for ${entityType}`);
      return null;
    }

    const config = {
      position: new Position(
        rules.laneRules.spawnPosition.x,
        rules.laneRules.spawnPosition.y
      ),
      direction: rules.laneRules.direction,
    };

    if (this.debugLog && entityType === EntityType.STREETCAR) {
      console.log(`[SpawnDebug] Got spawn config for ${entityType}:`, config);
    }

    return config;
  }

  spawnEntity(entityType) {
    if (this.debugLog && entityType === EntityType.STREETCAR) {
      console.log(`[SpawnDebug] Attempting to spawn ${entityType}`);
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
          console.log(`[SpawnDebug] Successfully spawned ${entityType}:`, {
            position: `(${entity.position.x}, ${entity.position.y})`,
            entityId: entity.id
          });
        }
        
        return entity;
      }
    } else if (this.debugLog && entityType === EntityType.STREETCAR) {
      console.log(`[SpawnDebug] Failed to spawn ${entityType} - canSpawnAt returned false`);
    }

    return null;
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

  updateSpawnRates(newRates) {
    Object.entries(newRates).forEach(([entityType, rate]) => {
      if (this.config.SPAWN_RATES[entityType] !== undefined) {
        this.config.SPAWN_RATES[entityType] = rate;
        if (this.debugLog) {
          console.log(`[SpawnDebug] Updated spawn rate for ${entityType}:`, rate);
        }
      }
    });
  }

  getSpawnRate(entityType) {
    return this.config.SPAWN_RATES[entityType] || 0;
  }

  setSpawnRate(entityType, rate) {
    if (this.config.SPAWN_RATES[entityType] !== undefined) {
      this.config.SPAWN_RATES[entityType] = Math.max(0, Math.min(1, rate));
      if (this.debugLog) {
        console.log(`[SpawnDebug] Set spawn rate for ${entityType}:`, this.config.SPAWN_RATES[entityType]);
      }
    }
  }

  getSpawnRules(entityType) {
    return this.spawnRules.get(entityType);
  }

  updateSpawnRule(entityType, newRule) {
    const currentRule = this.spawnRules.get(entityType);
    if (currentRule) {
      this.spawnRules.set(entityType, { ...currentRule, ...newRule });
      if (this.debugLog) {
        console.log(`[SpawnDebug] Updated spawn rules for ${entityType}:`, this.spawnRules.get(entityType));
      }
    }
  }
}

const DOOR_STATES = {
  CLOSED: 0,
  OPENING_1: 1,
  OPENING_2: 2,
  OPENING_3: 3,
  FULLY_OPEN: 4
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
    this.minDistance = options.minDistance || 2;
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
    return new Position(
      this.entity.position.x,
      this.entity.position.y + this.baseSpeed
    );
  }

  handleMovementBlocked() {
    this.stopped = true;
    setTimeout(() => {
      this.stopped = false;
    }, 1000);
  }

  getNearbyEntities() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid.getNearbyEntities(
      this.entity.position,
      Math.max(this.entity.width, this.entity.height) * 2
    ).filter(entity => 
      entity !== this.entity &&
      entity.type !== EntityType.PLAYER &&
      Math.abs(entity.position.x - this.entity.position.x) < 2
    );
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
      hasAnimation: true
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
    if (this.shouldOpenDoor && 
        !this.doorAnimationActive && 
        this.entity.position.y >= this.doorOpenY && 
        this.entity.position.y <= this.doorOpenY + 2) {
      this.doorAnimationActive = true;
      this.updateDoorState();
    }

    if (this.doorAnimationActive && 
        this.doorState < ENTITIES.PARKED_CAR_STATES.length - 1 && 
        Date.now() - this.lastDoorUpdate > this.doorOpenDelay) {
      this.updateDoorState();
    }

    this.updateDoorHitbox();
  }

  updateDoorState() {
    this.doorState++;
    this.lastDoorUpdate = Date.now();
    this.entity.art = ENTITIES.PARKED_CAR_STATES[this.doorState];

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
    if (other.type === EntityType.PLAYER) {
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
      minDistance: 5,
      ignoreCollisions: false
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
    return nearbyEntities.some(other => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      return distance < this.minDistance;
    });
  }
}

class OncomingCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: 2,
      minDistance: 2,
      ignoreCollisions: false
    });
  }
}


/// oncoming goes here

class StreetcarLaneCarBehavior extends VehicleBehaviorBase {
  constructor(entity) {
    super(entity, {
      baseSpeed: -1,
      minDistance: 2,
      ignoreCollisions: false
    });
  }
}

class PedestrianBehavior extends EntityBehavior {
  constructor(entity, isGoingUp) {
    super(entity);
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -0.5 : 0.5;
    this.stopped = false;
    this.waitTime = 0;
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

    const newPosition = new Position(
      Math.round(this.entity.position.x),
      this.entity.position.y + this.baseSpeed
    );

    if (this.canMoveTo(newPosition)) {
      this.entity.position = newPosition;
    }
  }

  getNearbyEntities() {
    if (!this.entity.spatialManager) return [];

    return this.entity.spatialManager.grid.getNearbyEntities(
      this.entity.position,
      2
    ).filter(entity => 
      entity !== this.entity &&
      entity.type !== EntityType.PLAYER &&
      entity.type === EntityType.PEDESTRIAN &&
      Math.abs(entity.position.x - this.entity.position.x) < 1
    );
  }

  shouldWait(nearbyEntities) {
    return nearbyEntities.some(other => {
      const distance = Math.abs(other.position.y - this.entity.position.y);
      return distance < 2;
    });
  }
}

class PlayerBehavior extends EntityBehavior {
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

class BuildingBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
    this.speed = 1;
    this.ignoreCollisions = true; // Buildings ignore all collisions
  }

  update() {
    // Always move up at constant speed
    this.entity.position.y += this.speed;

    // Respawn building when it moves off screen
    if (this.entity.position.y >= this.entity.config.GAME.HEIGHT) {
      const buildings = Array.from(this.entity.spatialManager.entities).filter((e) => e.type === EntityType.BUILDING);
      const highestBuilding = buildings.reduce((highest, current) => (current.position.y < highest.position.y ? current : highest));
      this.entity.position.y = highestBuilding.position.y - this.entity.height;
    }
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

  constructor(config, spawnY = null) {
    const randomShop = TORONTO_SHOPS[Math.floor(Math.random() * TORONTO_SHOPS.length)];
    const height = randomShop.art.length;
    const calculatedY = spawnY ?? (Building.nextSpawnY ? Building.nextSpawnY - height : 0);

    const spawnConfig = {
      position: new Position(config.LANES.SHOPS, calculatedY),
    };

    super(config, spawnConfig, EntityType.BUILDING);
    this.width = randomShop.art[0].length;
    this.height = height;
    this.art = randomShop.art;
    this.color = `<span style='color: ${this.getRandomBuildingColor()}'>`;
    this.behavior = new BuildingBehavior(this);

    Building.nextSpawnY = calculatedY;
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

    this.movementState = {
      isMovingLeft: false,
      isMovingRight: false,
      movementSpeed: config.GAME.INITIAL_SPEED,
      moveInterval: null,
    };

    this.touchState = {
      lastTap: 0,
      doubleTapActive: false,
    };

    this.deathState = {
      animation: 0,
      x: 0,
      y: 0,
    };
    
  }

  updateDeathAnimation() {
    if (this.isDead) {
      this.deathState.animation++;
      return this.deathState.animation > 10;
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

class LoserLane {
  constructor() {
    this.config = CONFIG; // Add this line
    this.state = new GameState(this.config);
    this.spatialManager = new SpatialManager(this.config);
    this.eventListeners = new Map();
    this.setupControls();
    this.setupTouchControls();
    this.gridSystem = new OptimizedGridSystem(this.config.GAME.WIDTH, this.config.GAME.HEIGHT);

    this.debug = true;
    this.preventDefaultTouchBehaviors();
    this.settingsManager = new SettingsManager(this);
    this.initializeGameWorld();
    this.lastFrameTime = performance.now();
    this.frameId = null;
  }

  addEventListenerWithTracking(element, type, handler, options = false) {
    element.addEventListener(type, handler, options);
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ type, handler, options });
  }

  updatePlayerPosition() {
    this.player.position = new Position(this.state.currentLane, this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y);
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
        this.updatePlayerPosition();
        this.spawnEntities();
        this.checkPlayerCollisions();
        this.state.incrementScore();
        this.state.updateSpeed();
        this.updateScoreDisplay();
      }
      this.render();
    }

    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById("time-alive");
    if (scoreElement) {
      scoreElement.textContent = `STAY ALIVE? ${this.state.score}`;
    }
  }

  initializeGameWorld() {
    this.spatialManager.entities.clear();
    this.initializeBuildings();
    this.initializeParkedCars();
    this.player = this.createPlayer();
    this.spatialManager.registerEntity(this.player);
  }

  setupControls() {
    const keydownHandler = (e) => {
      if (!this.state.isPlaying && (e.key === " " || e.key === "Spacebar")) {
        this.start();
        return;
      }

      if (this.state.isPlaying) {
        switch (e.key) {
          case "ArrowLeft":
            this.moveLeft();
            break;
          case "ArrowRight":
            this.moveRight();
            break;
          case "p":
          case "P":
            this.togglePause();
            break;
        }
      }
    };

    const clickHandler = () => {
      if (!this.state.isPlaying) {
        this.start();
      }
    };

    this.addEventListenerWithTracking(document, "keydown", keydownHandler);
    this.addEventListenerWithTracking(document, "click", clickHandler);
  }

  setupTouchControls() {
    const leftControl = document.getElementById("move-left");
    const rightControl = document.getElementById("move-right");

    if (leftControl && rightControl) {
      const tapState = {
        left: { lastTap: 0, tapCount: 0 },
        right: { lastTap: 0, tapCount: 0 },
      };

      const handleTap = (side, event) => {
        event.preventDefault();

        if (!this.state?.isPlaying) {
          return;
        }

        const currentTime = Date.now();
        const state = tapState[side];

        if (currentTime - state.lastTap > CONFIG.GAME.TAP_RESET_DELAY) {
          state.tapCount = 0;
        }

        state.tapCount++;

        if (state.tapCount === 2 && currentTime - state.lastTap <= CONFIG.GAME.DOUBLE_TAP_TIME) {
          if (side === "left") {
            this.moveLeft(true, false);
          } else {
            this.moveRight(true, false);
          }
          state.tapCount = 0;
        } else if (state.tapCount === 1) {
          if (side === "left") {
            this.moveLeft(false, true);
          } else {
            this.moveRight(false, true);
          }
        }

        state.lastTap = currentTime;

        setTimeout(() => {
          state.tapCount = 0;
        }, CONFIG.GAME.TAP_RESET_DELAY);
      };

      this.addEventListenerWithTracking(leftControl, "touchstart", (e) => handleTap("left", e));
      this.addEventListenerWithTracking(rightControl, "touchstart", (e) => handleTap("right", e));
    }
  }

  preventDefaultTouchBehaviors() {
    const touchMoveHandler = (e) => {
      if (this.state?.isPlaying && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const touchEndHandler = (e) => {
      if (this.state?.isPlaying) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const doubleTapPreventHandler = (e) => {
      const now = Date.now();
      if (this.state?.isPlaying && now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    this.addEventListenerWithTracking(document, "touchmove", touchMoveHandler, { passive: false });
    this.addEventListenerWithTracking(document, "touchend", touchEndHandler, { passive: false });
    this.addEventListenerWithTracking(document, "touchend", doubleTapPreventHandler, false);
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
    this.state.currentLane = Math.min(this.state.currentLane + moveAmount, CONFIG.LANES.SHOPS - 1);

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

    const messageBox = document.getElementById("mainMessageBox");
    if (messageBox) {
      messageBox.style.display = "none";
    }

    this.state.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused;

    const messageBox = document.getElementById("mainMessageBox");
    if (messageBox) {
      messageBox.style.display = this.state.isPaused ? "block" : "none";
      messageBox.textContent = this.state.isPaused ? "PAUSED" : "";
    }
  }

  createPlayer() {
    const playerEntity = new BaseEntity(
      this.config,
      {
        position: new Position(this.state.currentLane, CONFIG.GAME.CYCLIST_Y),
      },
      EntityType.PLAYER
    );

    playerEntity.width = ENTITIES.BIKE.width;
    playerEntity.height = ENTITIES.BIKE.height;
    playerEntity.art = ENTITIES.BIKE.art;
    playerEntity.color = STYLES.BIKE;
    playerEntity.behavior = new PlayerBehavior(playerEntity);

    return playerEntity;
  }

  checkPlayerCollisions() {
    const playerHitbox = {
      x: this.state.currentLane,
      y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      width: ENTITIES.BIKE.width,
      height: ENTITIES.BIKE.height,
    };

    const entitiesForCollision = {
      obstacles: Array.from(this.spatialManager.entities).filter((e) => e.type !== EntityType.PLAYER && e.type !== EntityType.PARKED_CAR),
      parkedCars: Array.from(this.spatialManager.entities).filter((e) => e.type === EntityType.PARKED_CAR),
    };

    const collision = this.spatialManager.collisionManager.checkPlayerCollision(playerHitbox, entitiesForCollision, this.state.isJumping);

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
    const shopSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 1;

    while (currentY > -20) {
        // Get all existing buildings for spacing check
        const existingBuildings = Array.from(this.spatialManager.entities)
            .filter(e => e.type === EntityType.BUILDING)
            .sort((a, b) => a.position.y - b.position.y);

        const building = new Building(CONFIG, currentY);
        
        // Check if there's overlap with any existing building
        const hasOverlap = existingBuildings.some(existing => {
            const topOverlap = currentY <= (existing.position.y + existing.height);
            const bottomOverlap = (currentY + building.height) >= existing.position.y;
            return topOverlap && bottomOverlap;
        });

        if (!hasOverlap) {
            this.spatialManager.registerEntity(building);
            // Move up by building height plus spacing
            currentY -= (building.height + shopSpacing);
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
    this.drawPlayer();
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

      for (let x = CONFIG.LANES.SIDEWALK; x < CONFIG.LANES.SHOPS; x++) {
        this.gridSystem.updateCell(x, y, " ", STYLES.SIDEWALK);
      }
    }
  }

  drawEntities() {
    this.spatialManager.entities.forEach((entity) => {
      if (entity.type !== EntityType.PLAYER) {
        this.drawEntity(entity);
      }
    });
  }

  drawEntity(entity) {
    if (!entity || !entity.art) return;

    if (entity.position.y + entity.height >= 0 && entity.position.y < CONFIG.GAME.HEIGHT) {
      this.gridSystem.markRegionDirty(entity.position.x, entity.position.y, entity.position.x + entity.width, entity.position.y + entity.height);

      entity.art.forEach((line, i) => {
        if (entity.position.y + i >= 0 && entity.position.y + i < CONFIG.GAME.HEIGHT) {
          line.split("").forEach((char, x) => {
            if (char !== " " && entity.position.x + x >= 0 && entity.position.x + x < CONFIG.GAME.WIDTH) {
              this.gridSystem.updateCell(Math.floor(entity.position.x + x), Math.floor(entity.position.y + i), char, entity.color);
            }
          });
        }
      });
    }
  }

  drawPlayer() {
    if (this.state.isDead && this.state.deathState.animation < 10) {
      ENTITIES.EXPLOSION.art.forEach((line, i) => {
        line.split("").forEach((char, x) => {
          if (this.state.deathState.y + i < CONFIG.GAME.HEIGHT) {
            this.gridSystem.updateCell(this.state.deathState.x + x, this.state.deathState.y + i, char, STYLES.TRAFFIC);
          }
        });
      });
    } else if (!this.state.isDead) {
      const bikeY = this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y;
      ENTITIES.BIKE.art.forEach((line, i) => {
        line.split("").forEach((char, x) => {
          if (char !== " ") {
            const gridX = Math.round(this.state.currentLane + x);
            if (gridX >= 0 && gridX < CONFIG.GAME.WIDTH) {
              this.gridSystem.updateCell(gridX, bikeY + i, char, STYLES.BIKE);
            }
          }
        });
      });
    }
  }

  die(reason) {
    this.state.isDead = true;
    this.state.deathX = this.state.currentLane;
    this.state.deathY = CONFIG.GAME.CYCLIST_Y;

    this.flashScreen();
    this.showDeathMessage(reason);

    setTimeout(() => {
      const messageEl = document.getElementById("mainMessageBox");
      if (messageEl) {
        messageEl.classList.remove("show-message");
      }
      this.restart();
    }, 1000);
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
    const messageEl = document.getElementById("mainMessageBox");
    if (!messageEl) return;

    const randomMessage = this.getRandomDeathMessage(reason);
    const randomFace = cuteDeathFaces[Math.floor(Math.random() * cuteDeathFaces.length)];

    messageEl.innerHTML = `
      <span class="message-reason">${randomMessage.reason}</span><br /><br />
      ${randomMessage.funny}<br /><br />
      <span class="cute-face">${randomFace}</span>
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
    this.setupTouchControls();
    this.start();

    const messageBox = document.getElementById("mainMessageBox");
    if (messageBox) {
      messageBox.textContent = "CLICK HERE/SPACEBAR to play ";
    }
  }

  cleanup() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

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
