class Rings {
  constructor(player, scl) {
    this.scl = scl;
    this.x = player.x;
    this.y = player.y;
    this.player = player;
  }

  updateLocation(newX,newY) {
    this.x = newX;
    this.y = newY;
  }

  move() {
      let v1 = createVector(this.x, this.y);
      let v2 = createVector(this.player.x, this.player.y);
      let lerp = p5.Vector.lerp(v1, v2, 0.91);
      this.x = lerp.x;
      this.y = lerp.y;




  }

  draw(radius) {
    strokeWeight(.5);
    ellipse(this.x, this.y, radius);
  }
}
