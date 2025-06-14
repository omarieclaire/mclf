// =========================================
// CollisionManager - Collision Management
// =========================================

class CollisionManager {


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
          obstacles: [obstacle],
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