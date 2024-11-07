export class InputHandler {
  constructor(game) {
    this.game = game;
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });
    
    document.addEventListener("keyup", (e) => {
      this.handleKeyUp(e);
    });
    
    const moveLeft = document.getElementById("move-left");
    const moveRight = document.getElementById("move-right");
    
    moveLeft.addEventListener("touchstart", (e) => { /* touch logic */ });
    moveRight.addEventListener("touchstart", (e) => { /* touch logic */ });
  }

  handleKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.game.moveLeft();
    }
    if (e.key === "ArrowRight") {
      this.game.moveRight();
    }
  }

  handleKeyUp(e) {
    if (e.key === "ArrowLeft") {
      this.game.state.isMovingLeft = false;
    }
    if (e.key === "ArrowRight") {
      this.game.state.isMovingRight = false;
    }
  }
}
