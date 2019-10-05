class Rings {
  constructor(player, scl, initX, initY) {
    this.scl = scl;
    //if we don't pass in an x or a y, just leave them as is
    if(typeof(initX) === 'undefined' || typeof(initY) === 'undefined') {
      this.x = player.x;
      this.y = player.y;
    } else {
      //else transfer them to the leader
      this.x = initX;
      this.y = initY;
    }
    //the player that THIS ring follows
    this.player = player;
    this.spectrum = 0;

  }
//function to manage the rings when they reach the edge of the screen
  updateLocation(newX,newY) {
    this.x = newX;
    this.y = newY;
  }

  move() {
    //this.x and this.y of the rings
      let v1 = createVector(this.x, this.y);
      //this.x and this.y of a player
      let v2 = createVector(this.player.x, this.player.y);
      let lerp = p5.Vector.lerp(v1, v2, this.spectrum);
      this.x = lerp.x;
      this.y = lerp.y;
      if (this.spectrum >= 1) {
        this.spectrum = 1;
      } else {
        this.spectrum = this.spectrum + 0.01;
      }
  }

  draw(radius) {
    ellipse(this.x, this.y, radius);
  }
  
  drawDeadRing(initialRadius) {
    stroke(55);
    ellipse(this.x, this.y, initialRadius);
  }
}
