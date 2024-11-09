// Constants and Configuration

const CONFIG = {
  GAME: {
    WIDTH: 45,
    HEIGHT: Math.floor(window.innerHeight / 20),
    INITIAL_SPEED: 500, // Changed from 20 to match settings window
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
    STREETCAR: 0.03,
    STREETCAR_LANE_CAR: 0.3,
    ONCOMING_CAR: 0.15,
    PARKED_CAR: 0.15,
    DOOR_OPENING: 0.1,
    PEDESTRIAN: 0.05,
    BUILDING: 0.05,
  },
  SAFE_DISTANCE: {
    // Added missing configuration section
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

class GameState {
  constructor(config) {
    this.config = config;
    this.reset();
  }

  reset() {
    // Game status
    this.isDead = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;

    // Player position and movement
    this.currentLane = this.config.LANES.BIKE;
    this.isJumping = false;

    // Movement controls
    this.movementState = {
      isMovingLeft: false,
      isMovingRight: false,
      movementSpeed: this.config.GAME.INITIAL_SPEED,
      moveInterval: null,
    };

    // Touch control state
    this.touchState = {
      lastTap: 0,
      doubleTapActive: false,
    };

    // Death animation state
    this.deathState = {
      animation: 0,
      x: 0,
      y: 0,
    };

    // Game speed
    this.speed = this.config.GAME.INITIAL_SPEED;
  }

  // Movement state methods
  startMoving(direction) {
    this.movementState[`isMoving${direction}`] = true;
  }

  stopMoving(direction) {
    this.movementState[`isMoving${direction}`] = false;
  }

  // Touch control methods
  updateTapState(timestamp) {
    this.touchState.lastTap = timestamp;
  }

  setDoubleTapState(active) {
    this.touchState.doubleTapActive = active;
  }

  // Death state methods
  setDeathState(x, y) {
    this.isDead = true;
    this.deathState.x = x;
    this.deathState.y = y;
    this.deathState.animation = 0;
  }

  updateDeathAnimation() {
    if (this.isDead) {
      this.deathState.animation++;
      return this.deathState.animation > 10;
    }
    return false;
  }

  // Game state methods
  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  updateSpeed() {
    this.speed = Math.max(this.speed * this.config.GAME.SPEED_DECREASE_RATE, this.config.GAME.MIN_SPEED);
    return this.speed;
  }

  incrementScore() {
    this.score++;
    return this.score;
  }
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
}

class EntityType {
  static STREETCAR = "STREETCAR";
  static STREETCAR_LANE_CAR = "STREETCAR_LANE_CAR"; // Changed from current
  static ONCOMING_CAR = "ONCOMING"; // Changed from "CAR"
  static PARKED_CAR = "PARKEDCAR"; // Changed from "PARKED"
  static PEDESTRIAN = "PEDESTRIAN";
  static BUILDING = "BUILDING";
  static PLAYER = "PLAYER";
}
// Core Spatial Management System
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
    if (entity.type === EntityType.PEDESTRIAN) {
      // console.log("Pedestrian registered:", entity);
    }
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

class OptimizedGridSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = this.createInitialGrid();
    this.cellPool = [];
    this.dirtyRegions = new Set(); // Track regions that need updates
    this.initializeCellPool(100); // Pre-allocate some cells
  }

  createInitialGrid() {
    return Array(this.height)
      .fill()
      .map(() =>
        Array(this.width)
          .fill()
          .map(() => ({
            content: " ",
            style: null,
            dirty: true,
          }))
      );
  }

  initializeCellPool(size) {
    for (let i = 0; i < size; i++) {
      this.cellPool.push({
        content: " ",
        style: null,
        dirty: false,
      });
    }
  }

  getCellFromPool() {
    if (this.cellPool.length > 0) {
      return this.cellPool.pop();
    }
    return {
      content: " ",
      style: null,
      dirty: false,
    };
  }

  returnCellToPool(cell) {
    cell.content = " ";
    cell.style = null;
    cell.dirty = false;
    this.cellPool.push(cell);
  }

  markRegionDirty(x1, y1, x2, y2) {
    for (let y = Math.max(0, y1); y < Math.min(this.height, y2); y++) {
      for (let x = Math.max(0, x1); x < Math.min(this.width, x2); x++) {
        this.grid[y][x].dirty = true;
        this.dirtyRegions.add(`${x},${y}`);
      }
    }
  }

  updateCell(x, y, content, style = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }

    const cell = this.grid[y][x];
    if (cell.content !== content || cell.style !== style) {
      cell.content = content;
      cell.style = style;
      cell.dirty = true;
      this.dirtyRegions.add(`${x},${y}`);
    }
  }

  clear() {
    // Only clear cells that were used
    this.dirtyRegions.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      const cell = this.grid[y][x];
      this.returnCellToPool(cell);
      this.grid[y][x] = this.getCellFromPool();
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
          if (lastStyle !== null) {
            currentRow.push(STYLES.RESET);
          }
          if (cell.style !== null) {
            currentRow.push(cell.style);
          }
          lastStyle = cell.style;
        }
        currentRow.push(cell.content);
      }
      if (lastStyle !== null) {
        currentRow.push(STYLES.RESET);
      }
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
    // Toggle settings window visibility
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        const settingsWindow = document.getElementById("settings-window");
        settingsWindow.style.display = settingsWindow.style.display === "none" ? "block" : "none";
      }
    });

    // Pedestrian controls
    this.setupSettingControl("pedestrian-speed", (value) => {
      CONFIG.PEDESTRIAN.SPEED = parseFloat(value);
    });

    // Spawn rate controls
    this.setupSettingControl("streetcar-spawn-rate", (value) => {
      CONFIG.SPAWN_RATES.STREETCAR = parseFloat(value);
    });

    this.setupSettingControl("oncoming-car-spawn-rate", (value) => {
      CONFIG.SPAWN_RATES.ONCOMING_CAR = parseFloat(value);
    });

    this.setupSettingControl("parked-car-spawn-rate", (value) => {
      CONFIG.SPAWN_RATES.PARKED_CAR = parseFloat(value);
    });

    this.setupSettingControl("streetcar-lane-car-spawn-rate", (value) => {
      CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR = parseFloat(value);
    });

    this.setupSettingControl("pedestrian-spawn-rate", (value) => {
      CONFIG.SPAWN_RATES.PEDESTRIAN = parseFloat(value);
    });

    // Speed controls
    this.setupSettingControl("initial-speed", (value) => {
      CONFIG.GAME.INITIAL_SPEED = parseInt(value);
    });

    this.setupSettingControl("min-speed", (value) => {
      CONFIG.GAME.MIN_SPEED = parseInt(value);
    });

    this.setupSettingControl("speed-decrease-rate", (value) => {
      CONFIG.GAME.SPEED_DECREASE_RATE = parseFloat(value);
    });

    // Gap controls
    this.setupSettingControl("streetcar-gap", (value) => {
      CONFIG.SAFE_DISTANCE.STREETCAR = parseInt(value);
    });

    this.setupSettingControl("lane-car-gap", (value) => {
      CONFIG.SAFE_DISTANCE.STREETCAR_LANE_CAR = parseInt(value);
    });

    this.setupSettingControl("oncoming-car-gap", (value) => {
      CONFIG.SAFE_DISTANCE.ONCOMING_CAR = parseInt(value);
    });

    // Lane and cyclist controls
    this.setupSettingControl("lane-width", (value) => {
      CONFIG.GAME.WIDTH = parseInt(value);
    });

    this.setupSettingControl("cyclist-speed", (value) => {
      if (this.game) {
        this.game.state.movementSpeed = parseInt(value);
      }
    });
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
  checkPlayerCollision(playerHitbox, entities, isJumping) {
    // First check streetcars and other vehicles
    for (const obstacle of entities.obstacles) {
      // Skip checking streetcar collision only when jumping over tracks
      if (isJumping && obstacle.type === EntityType.STREETCAR) {
        continue;
      }

      if (this.checkCollision(playerHitbox, obstacle.getHitbox())) {
        switch (obstacle.type) {
          case EntityType.STREETCAR:
            return "STREETCAR";
          case EntityType.STREETCAR_LANE_CAR: // This is the key addition
            return "TRAFFIC"; // Returns TRAFFIC for cars in streetcar lane
          case EntityType.ONCOMING_CAR:
            return "TRAFFIC";
          case EntityType.PEDESTRIAN:
            return "PEDESTRIAN";
          case EntityType.BUILDING:
            return "SHOP";
          default:
            console.log("Unknown collision type:", obstacle.type);
            return "TRAFFIC";
        }
      }
    }

    // Then check parked cars and doors
    for (const car of entities.parkedCars) {
      if (this.checkCollision(playerHitbox, car.getHitbox())) {
        return "PARKEDCAR";
      }
      if (car.behavior.doorHitbox && this.checkCollision(playerHitbox, car.behavior.doorHitbox)) {
        return "DOOR";
      }
    }

    // Finally check track collisions
    const trackPositions = [this.config.LANES.TRACKS + 1, this.config.LANES.TRACKS + 5];
    const playerCenter = playerHitbox.x + playerHitbox.width / 2;
    if (!isJumping && trackPositions.includes(Math.floor(playerCenter))) {
      return "TRACKS";
    }

    return null;
  }

  update() {
    const collisionPairs = this.getCollisionPairs();
    collisionPairs.forEach(([entityA, entityB]) => {
      // Always check for player collisions, regardless of movement state
      if (entityA.type === EntityType.PLAYER || entityB.type === EntityType.PLAYER) {
        const player = entityA.type === EntityType.PLAYER ? entityA : entityB;
        const obstacle = entityA.type === EntityType.PLAYER ? entityB : entityA;

        // Structure entities for collision check
        const entitiesForCollision = {
          obstacles: [obstacle],
          parkedCars: obstacle.type === EntityType.PARKED_CAR ? [obstacle] : [],
        };

        // Check collision and handle if needed
        const collisionType = this.checkPlayerCollision(player.getHitbox(), entitiesForCollision, false);
        if (collisionType) {
          player.behavior.onCollision(obstacle);
        }
      }
    });
  }

  getCollisionPairs() {
    const pairs = [];
    const entities = Array.from(this.spatialManager.entities);

    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const nearby = this.spatialManager.grid.getNearbyEntities(entityA.position, Math.max(entityA.width, entityA.height) * 2);

      for (const entityB of nearby) {
        if (entityA !== entityB && this.checkCollision(entityA.getHitbox(), entityB.getHitbox())) {
          pairs.push([entityA, entityB]);
        }
      }
    }

    return pairs;
  }

  validateMovement(entity, newPosition) {
    const tempPosition = entity.position;
    entity.position = newPosition;

    const nearby = this.spatialManager.grid.getNearbyEntities(newPosition, Math.max(entity.width, entity.height) * 2);

    let isValid = true;
    for (const other of nearby) {
      if (other !== entity && !other.behavior.ignoreCollisions && this.checkCollision(entity.getHitbox(), other.getHitbox())) {
        isValid = false;
        break;
      }
    }

    entity.position = tempPosition;
    return isValid;
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
      if (other !== entity && !other.behavior.ignoreCollisions && this.collisionManager.checkCollision(entity.getHitbox(), other.getHitbox())) {
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
}

class SpawnManager {
  constructor(spatialManager, config) {
    this.spatialManager = spatialManager;
    this.config = config;
    this.initializeSpawnRules();
  }

  initializeSpawnRules() {
    this.spawnRules = new Map([
      [
        EntityType.STREETCAR_LANE_CAR,
        {
          baseSpacing: 12,
          randomSpacingRange: { min: 3, max: 10 },
          laneRules: {
            allowedLanes: [this.config.LANES.TRACKS + 1],
            spawnPosition: { x: this.config.LANES.TRACKS + 1, y: this.config.GAME.HEIGHT + 1 },
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
            spawnPosition: { x: this.config.LANES.ONCOMING, y: -10 },
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
            spawnPosition: { x: this.config.LANES.PARKED, y: -5 },
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
            spawnPosition: { x: this.config.LANES.SIDEWALK, y: -1 },
            direction: 1,
          },
        },
      ],
    ]);
  }

  canSpawnAt(entityType, position) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) return false;

    // Check if the lane is allowed
    if (!rules.laneRules.allowedLanes.includes(Math.floor(position.x))) {
      return false;
    }
    // Get nearby entities
    const spacing = this.calculateSpacing(entityType);
    const nearbyEntities = Array.from(this.spatialManager.entities).filter((entity) => entity.type === entityType);

    // Check if there's enough space
    return nearbyEntities.every((entity) => {
      const distance = Math.abs(entity.position.y - position.y);
      return distance >= spacing;
    });
  }

  calculateSpacing(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) return 0;

    const baseSpacing = rules.baseSpacing;

    // Occasionally add random additional spacing
    if (Math.random() < 0.2) {
      const { min, max } = rules.randomSpacingRange;
      return baseSpacing + Math.random() * (max - min) + min;
    }

    return baseSpacing;
  }

  getSpawnConfig(entityType) {
    const rules = this.spawnRules.get(entityType);
    if (!rules) return null;

    return {
      position: new Position(rules.laneRules.spawnPosition.x, rules.laneRules.spawnPosition.y),
      direction: rules.laneRules.direction,
    };
  }

  spawnEntity(entityType) {
    const spawnConfig = this.getSpawnConfig(entityType);
    if (!spawnConfig) return null;

    if (this.canSpawnAt(entityType, spawnConfig.position)) {
      // Create and return the entity based on type
      const EntityClass = this.getEntityClass(entityType);
      if (EntityClass) {
        return new EntityClass(this.config, spawnConfig);
      }
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
}

class EntityBehavior {
  constructor(entity) {
    this.entity = entity;
    this.canMove = true;
  }

  update() {
    // Base update logic
  }

  onCollision(other) {
    // Base collision handling
  }

  canMoveTo(position) {
    return this.entity.spatialManager.validateMove(this.entity, position);
  }
}

class StreetcarBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.stopSchedule = [];
    this.currentStop = null;
    this.stoppingDistance = 3;
    this.baseSpeed = -1;
    this.ignoreCollisions = true; // Add this flag
  }

  update() {
    // Always move regardless of collision
    this.entity.position.y += this.baseSpeed;
  }

  move() {
    const newPosition = new Position(this.entity.position.x, this.entity.position.y + this.baseSpeed);

    if (this.canMoveTo(newPosition)) {
      this.entity.position = newPosition;
    }
  }

  handleStop() {
    if (this.currentStop.duration > 0) {
      this.currentStop.duration--;
    } else {
      this.currentStop = null;
    }
  }

  scheduleStop(position, duration) {
    this.stopSchedule.push({ position, duration });
  }
}

class ParkedCarBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.doorState = 0;
    this.doorOpenDuration = 100;
    this.doorTimer = 0;
    this.speed = 1;
    this.doorHitbox = null;

    // Only 30% of cars will open their doors
    this.shouldOpenDoor = Math.random() < 0.3;
    this.doorAnimationActive = false;
    this.lastDoorUpdate = Date.now();
    // Reduce door open delay from 50 to 25 for faster animation
    this.doorOpenDelay = 25;

    // Open doors earlier - between 20-30% of screen height instead of 30-40%
    const targetPercentage = 0.2 + Math.random() * 0.1;
    this.doorOpenY = Math.floor(this.entity.config.GAME.HEIGHT * targetPercentage);
  }

  update() {
    const newPosition = new Position(this.entity.position.x, this.entity.position.y + this.speed);
    this.entity.position = newPosition;

    // Check if door should start opening
    if (
      this.shouldOpenDoor &&
      !this.doorAnimationActive &&
      this.entity.position.y >= this.doorOpenY &&
      this.entity.position.y <= this.doorOpenY + 2
    ) {
      this.doorAnimationActive = true;
      this.updateDoorState();
    }

    // Continue the door animation if it's active
    if (this.doorAnimationActive && this.doorState < ENTITIES.PARKED_CAR_STATES.length - 1 && Date.now() - this.lastDoorUpdate > this.doorOpenDelay) {
      this.updateDoorState();
    }

    if (this.doorHitbox) {
      this.doorHitbox.y = this.entity.position.y + 1;
    }
  }

  updateDoorState() {
    this.doorState++;
    this.lastDoorUpdate = Date.now();
    this.entity.art = ENTITIES.PARKED_CAR_STATES[this.doorState];

    const doorWidths = [0, 0.8, 1, 1.5, 1.8];
    const doorWidth = doorWidths[this.doorState];

    // Adjust hitbox height only for the final door state
    const hitboxHeight = this.doorState === ENTITIES.PARKED_CAR_STATES.length - 1 ? 0.8 : 1.8;

    this.doorHitbox = {
      x: this.entity.position.x,
      y: this.entity.position.y + 1,
      width: doorWidth,
      height: hitboxHeight,
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

class VehicleBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.baseSpeed = entity.type === EntityType.ONCOMING_CAR ? 2 : -1;
  }

  update() {
    // Always move regardless of collisions
    this.entity.position.y += this.baseSpeed;
  }

  onCollision(other) {
    // Don't stop moving when colliding with player
    if (other.type === EntityType.PLAYER) {
      return;
    }

    // Only adjust position for vehicle-to-vehicle collisions
    if (other.type !== EntityType.PLAYER) {
      if (this.baseSpeed > 0) {
        this.entity.position.y -= 1;
      } else {
        this.entity.position.y += 1;
      }
    }
  }
}

class PedestrianBehavior extends EntityBehavior {
  constructor(entity, isGoingUp) {
    super(entity);
    this.isGoingUp = isGoingUp;
    this.baseSpeed = isGoingUp ? -1 : 1;
    this.crossingState = "WALKING";
    this.stepCounter = 0; // Add step counter for slower movement
    this.moveEveryNFrames = 3;
  }

  update() {
    if (this.crossingState === "WALKING") {
      this.stepCounter++;
      if (this.stepCounter >= this.moveEveryNFrames) {
        const oldX = this.entity.position.x;
        const oldY = this.entity.position.y;

        const newX = Math.round(this.entity.position.x);
        const newY = Math.round(this.entity.position.y + this.baseSpeed);

        const newPosition = new Position(newX, newY);

        if (this.canMoveTo(newPosition)) {
          this.entity.position.x = Math.round(newPosition.x);
          this.entity.position.y = Math.round(newPosition.y);
        }
        this.stepCounter = 0;
      }
    }
  }
}

class PlayerBehavior extends EntityBehavior {
  constructor(entity) {
    super(entity);
    this.canMove = true;
  }

  update() {
    // Player position is managed by the game class
  }

  onCollision(other) {
    // Player collisions are handled by the game class
  }
}

class BaseEntity {
  constructor(config, spawnConfig, type) {
    this.config = config;
    this.type = type;
    this.position = new Position(spawnConfig.position.x, spawnConfig.position.y);
    this.width = 0; // Set in child classes
    this.height = 0; // Set in child classes
    this.behavior = null; // Set in child classes
    this.art = null; // Set in child classes
    this.color = null; // Set in child classes
    this.spatialManager = null; // Set when entity is registered
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
    this.behavior = new VehicleBehavior(this);

    this.getHitbox = () => ({
      x: this.position.x,
      y: this.position.y, // xxxAdjust hitbox down by 1 unit
      width: this.width,
      height: this.height - 1, // Reduce height by 1 unit
    });
  }

  getRandomVehicleColor() {
    return COLOURS.VEHICLES[Math.floor(Math.random() * COLOURS.VEHICLES.length)];
  }
}

class OncomingCar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.ONCOMING_CAR); // Uses ONCOMING_CAR type
    this.width = ENTITIES.ONCOMINGCAR.width;
    this.height = ENTITIES.ONCOMINGCAR.height;
    this.art = ENTITIES.ONCOMINGCAR.art;
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new VehicleBehavior(this);

    this.getHitbox = () => ({
      x: this.position.x,
      y: this.position.y, // xxxx Adjust hitbox down by 1 unit
      width: this.width,
      height: this.height - 1, // Reduce height by 1 unit
    });
  }

  getRandomVehicleColor() {
    return COLOURS.VEHICLES[Math.floor(Math.random() * COLOURS.VEHICLES.length)];
  }
}

class ParkedCar extends BaseEntity {
  constructor(config, spawnConfig) {
    super(config, spawnConfig, EntityType.PARKED_CAR); // Uses PARKED_CAR type
    this.width = 7;
    this.height = 5;
    this.art = ENTITIES.PARKED_CAR_STATES[0];
    this.color = `<span style='color: ${this.getRandomVehicleColor()}'>`;
    this.behavior = new ParkedCarBehavior(this);

    // Adjust hitbox to match visible car
    this.getHitbox = () => ({
      x: this.position.x + 2, // Offset to match visible car
      y: this.position.y,
      width: 4, // Narrower width to match car
      height: this.height,
    });
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

  getHitbox() {
    const hitbox = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };

    // console.log("Pedestrian hitbox properties:", hitbox); // Moved log here after hitbox is created
    return hitbox;
  }
}

class Building extends BaseEntity {
  static nextSpawnY = null;

  constructor(config, spawnY = null) {
    const randomShop = TORONTO_SHOPS[Math.floor(Math.random() * TORONTO_SHOPS.length)];
    const height = randomShop.art.length;

    // If spawnY is provided, use it. Otherwise use nextSpawnY or calculate from scratch
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

    // Update the next spawn position
    Building.nextSpawnY = calculatedY;
  }
  getRandomBuildingColor() {
    return COLOURS.BUILDINGS[Math.floor(Math.random() * COLOURS.BUILDINGS.length)];
  }
}

class LoserLane {
  constructor() {
    this.state = new GameState(CONFIG); // This is the key change
    this.spatialManager = new SpatialManager(CONFIG);
    this.eventListeners = new Map();
    this.setupControls();
    this.setupTouchControls();
    // this.grid = this.createGrid();
    this.gridSystem = new OptimizedGridSystem(CONFIG.GAME.WIDTH, CONFIG.GAME.HEIGHT);

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

  // Add this method if it's missing
  updatePlayerPosition() {
    this.player.position = new Position(this.state.currentLane, this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y);
  }

  update(timestamp) {
    if (!timestamp) {
      // Initial frame request
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    // Handle paused state
    if (this.state.isPaused) {
      this.frameId = requestAnimationFrame((t) => this.update(t));
      return;
    }

    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;

    // Only update if enough time has passed
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

    // Schedule next frame
    this.frameId = requestAnimationFrame((t) => this.update(t));
  }

  // And this helper method
  updateScoreDisplay() {
    const scoreElement = document.getElementById("time-alive");
    if (scoreElement) {
      scoreElement.textContent = `STAY ALIVE? ${this.state.score}`;
    }
  }

  initializeGameWorld() {
    // Clear existing entities
    this.spatialManager.entities.clear();

    // Initialize buildings
    this.initializeBuildings();

    // Initialize parked cars
    this.initializeParkedCars();

    // Create player
    this.player = this.createPlayer();
    this.spatialManager.registerEntity(this.player);
  }

  // Control Setup
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

  // Modify the setupTouchControls method in LoserLane class
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

        // Early return if game isn't running
        if (!this.state?.isPlaying) {
          return;
        }

        const currentTime = Date.now();
        const state = tapState[side];

        // Reset tap count if too much time has passed
        if (currentTime - state.lastTap > CONFIG.GAME.TAP_RESET_DELAY) {
          state.tapCount = 0;
        }

        state.tapCount++;

        // Handle double tap
        if (state.tapCount === 2 && currentTime - state.lastTap <= CONFIG.GAME.DOUBLE_TAP_TIME) {
          if (side === "left") {
            this.moveLeft(true, false);
          } else {
            this.moveRight(true, false);
          }
          state.tapCount = 0;
        }
        // Handle single tap
        else if (state.tapCount === 1) {
          if (side === "left") {
            this.moveLeft(false, true);
          } else {
            this.moveRight(false, true);
          }
        }

        state.lastTap = currentTime;

        // Reset tap count after delay
        setTimeout(() => {
          state.tapCount = 0;
        }, CONFIG.GAME.TAP_RESET_DELAY);
      };

      // Add touch event listeners with bound context
      this.addEventListenerWithTracking(leftControl, "touchstart", (e) => handleTap("left", e));
      this.addEventListenerWithTracking(rightControl, "touchstart", (e) => handleTap("right", e));
    }
  }

  preventDefaultTouchBehaviors() {
    const touchMoveHandler = (e) => {
      // Only prevent default if game is actually running
      if (this.state?.isPlaying && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const touchEndHandler = (e) => {
      // Only prevent default if game is running
      if (this.state?.isPlaying) {
        e.preventDefault();
      }
    };

    // Track last touch end to prevent double-tap zoom
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

    // Use smaller movement for touch taps
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

    // Structure the entities object correctly for collision checking
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

  // Initialization Helpers
  initializeBuildings() {
    let currentY = CONFIG.GAME.HEIGHT;
    const shopSpacing = CONFIG.SAFE_DISTANCE.BUILDING || 1; // Default spacing if not defined

    while (currentY > -20) {
      const building = new Building(CONFIG, currentY);

      // Check if there's enough space from the last placed building
      const lastBuilding = Array.from(this.spatialManager.entities).find((e) => e.type === EntityType.BUILDING);
      if (!lastBuilding || Math.abs(lastBuilding.position.y - currentY) >= shopSpacing) {
        this.spatialManager.registerEntity(building);
        currentY -= building.height + shopSpacing; // Apply spacing
      } else {
        currentY -= 1; // If overlap, move up a small amount and try again
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

  // Rendering
  // createGrid() {
  //   return Array(CONFIG.GAME.HEIGHT)
  //     .fill()
  //     .map(() => Array(CONFIG.GAME.WIDTH).fill(" "));
  // }

  drawHitboxes() {
    // Create player hitbox first since we need it
    const playerHitbox = {
      x: this.state.currentLane,
      y: this.state.isJumping ? CONFIG.GAME.CYCLIST_Y - 1 : CONFIG.GAME.CYCLIST_Y,
      width: ENTITIES.BIKE.width,
      height: ENTITIES.BIKE.height,
    };

    this.spatialManager.entities.forEach((entity) => {
      const hitbox = entity.getHitbox();
      if (hitbox) {
        let color;
        switch (entity.type) {
          case EntityType.PEDESTRIAN:
            color = "rgb(255, 20, 147)";
            break;
          case EntityType.STREETCAR:
            color = "rgb(255, 165, 0)";
            break;
          case EntityType.STREETCAR_LANE_CAR:
            color = "rgb(0, 191, 255)";
            break;
          case EntityType.ONCOMING_CAR:
            color = "rgb(50, 205, 50)";
            break;
          case EntityType.PARKED_CAR:
            color = "rgb(138, 43, 226)";
            break;
          case EntityType.BUILDING:
            color = "rgb(255, 215, 0)";
            break;
          default:
            color = "rgb(45, 45, 45)";
        }

        // Mark region as dirty and update cells
        this.gridSystem.markRegionDirty(
          Math.floor(hitbox.x),
          Math.floor(hitbox.y),
          Math.ceil(hitbox.x + hitbox.width),
          Math.ceil(hitbox.y + hitbox.height)
        );

        // Draw hitbox using the existing content with background
        for (let y = Math.floor(hitbox.y); y < Math.ceil(hitbox.y + hitbox.height); y++) {
          for (let x = Math.floor(hitbox.x); x < Math.ceil(hitbox.x + hitbox.width); x++) {
            if (y >= 0 && y < CONFIG.GAME.HEIGHT && x >= 0 && x < CONFIG.GAME.WIDTH) {
              const cell = this.gridSystem.grid[y][x];
              this.gridSystem.updateCell(
                x,
                y,
                cell.content,
                `<span style='background-color: ${color.replace("rgb", "rgba").replace(")", ", 0.3)")}'>` + (cell.style || "")
              );
            }
          }
        }
      }

      // Handle door hitboxes
      if (entity.type === EntityType.PARKED_CAR && entity.behavior.doorHitbox) {
        const doorHitbox = entity.behavior.doorHitbox;
        this.gridSystem.markRegionDirty(
          Math.floor(doorHitbox.x),
          Math.floor(doorHitbox.y),
          Math.ceil(doorHitbox.x + doorHitbox.width),
          Math.ceil(doorHitbox.y + doorHitbox.height)
        );
      }
    });

    // Draw player hitbox
    const playerColor = "rgb(0, 255, 255)"; // Cyan
    this.gridSystem.markRegionDirty(
      Math.floor(playerHitbox.x),
      Math.floor(playerHitbox.y),
      Math.ceil(playerHitbox.x + playerHitbox.width),
      Math.ceil(playerHitbox.y + playerHitbox.height)
    );

    for (let y = Math.floor(playerHitbox.y); y < Math.ceil(playerHitbox.y + playerHitbox.height); y++) {
      for (let x = Math.floor(playerHitbox.x); x < Math.ceil(playerHitbox.x + playerHitbox.width); x++) {
        if (y >= 0 && y < CONFIG.GAME.HEIGHT && x >= 0 && x < CONFIG.GAME.WIDTH) {
          const cell = this.gridSystem.grid[y][x];
          this.gridSystem.updateCell(
            x,
            y,
            cell.content,
            `<span style='background-color: ${playerColor.replace("rgb", "rgba").replace(")", ", 0.3)")}'>` + (cell.style || "")
          );
        }
      }
    }
  }
  render() {
    if (this.state.isDead && this.state.deathState.animation >= 10) return;

    // this.grid = this.createGrid();
    this.gridSystem.clear();

    this.drawRoadFeatures();
    // if (this.debug) {
    //   this.drawHitboxes();
    // }
    this.drawPlayer();
    this.drawEntities();

    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.innerHTML = this.gridSystem.render();
    }
  }

  drawRoadFeatures() {
    for (let y = 0; y < CONFIG.GAME.HEIGHT; y++) {
      // Only update road features if they're in dirty regions
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
      // Mark the entity's region as dirty
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

  // Death Handling
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

  // Game Reset
  restart() {
    this.cleanup();
    Building.nextSpawnY = null;
    this.spatialManager = new SpatialManager(CONFIG);
    this.state = new GameState(CONFIG); // Use GameState instead of initializeState
    this.initializeGameWorld();
    this.setupControls();
    this.setupTouchControls();
    this.start();

    const messageBox = document.getElementById("mainMessageBox");
    if (messageBox) {
      messageBox.textContent = "CLICK HERE/SPACEBAR to play ";
    }
  }

  // Cleanup
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

const game = new LoserLane();
