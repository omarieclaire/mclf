import { CONFIG, STYLES, COLORS } from "./config.js";
import { MESSAGES } from "./messages.js";
import { CollisionSystem } from "./collisionSystem.js";
import { EntityManager } from "./entityManager.js";
import { InputHandler } from "./inputHandler.js";

class TorontoCyclistGame {
  constructor() {
    this.initializeState();
    this.entityManager = new EntityManager();
    this.inputHandler = new InputHandler(this);
    this.inputHandler.setupControls();
  }

  initializeState() {
    this.state = {
      isPlaying: false,
      isDead: false,
      score: 0,
      currentLane: CONFIG.LANES.BIKE,
      speed: CONFIG.GAME.INITIAL_SPEED,
    };
  }

  start() {
    this.state.isPlaying = true;
    this.gameLoop = setInterval(() => this.update(), this.state.speed);
  }

  updateEntities() {
    this.updateObstacles();
    this.updateParkedCars();
    this.updatePedestrians();
  }

  updateObstacles() {
    this.entities.obstacles = this.entities.obstacles
      .map((obs) => ({
        ...obs,
        y: obs.y + obs.speed,
      }))
      .filter((obs) => this.isOnScreen(obs));
  }

  isOnScreen(entity) {
    return entity.speed > 0 ? entity.y < CONFIG.GAME.HEIGHT + 2 : entity.y + entity.height > -2;
  }

  render() {
    if (this.state.isDead && this.deathAnimation >= 10) return;

    this.grid = this.createGrid();
    this.drawRoadFeatures();
    this.drawEntities();
    this.drawPlayer();

    // Update the game screen with borders for each grid cell
    const gameScreen = document.getElementById("game-screen");
    gameScreen.innerHTML = this.grid
      .map((row) => {
        return row.map((cell) => `<span class="grid-cell">${cell}</span>`).join("");
      })
      .join("<br />"); // Add line breaks for rows
  }
}
