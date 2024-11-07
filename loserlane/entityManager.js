import { CONFIG, COLORS } from './config.js';

export class EntityManager {
  constructor() {
    this.entities = {
      obstacles: [],
      parkedCars: [],
      pedestrians: {
        up: [],
        down: [],
        crossing: [],
      },
    };
  }

  spawnObstacles() {
    // Spawn streetcars at their designated rate
    if (Math.random() < CONFIG.SPAWN_RATES.STREETCAR) {
      const streetcar = this.createObstacle(true, false); // true for isStreetcar
      if (!this.checkEntityOverlap(streetcar, this.entities.obstacles)) {
        this.entities.obstacles.push(streetcar);
      }
    }

    // Spawn cars in the streetcar lane at their designated rate
    if (Math.random() < CONFIG.SPAWN_RATES.STREETCAR_LANE_CAR) {
      console.log("Attempting to spawn a STREETCAR_LANE_CAR");
      const streetcarLaneCar = this.createObstacle(false, true);
      if (!this.checkEntityOverlap(streetcarLaneCar, this.entities.obstacles)) {
        this.entities.obstacles.push(streetcarLaneCar);
        console.log("Spawned a STREETCAR_LANE_CAR successfully");
      } else {
        console.log("Overlap prevented STREETCAR_LANE_CAR spawn");
      }
    }
  }

  updateObstacles() {
    // Update obstacle positions and filter out off-screen ones
  }

  drawObstacles(grid) {
    this.entities.obstacles.forEach((obstacle) => {
      // Draw obstacle on grid
    });
  }
}
