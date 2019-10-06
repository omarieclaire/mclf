class Spike {
  constructor(temp_scl) {
    this.spikeColor = [255, 0, 0, 250]; //red
    this.scl = temp_scl;
    this.spikeLocation = this.makeRandomVector();
    this.x = this.spikeLocation.x;
    this.y = this.spikeLocation.y;
  }

  //picking place for spikes
  makeRandomVector() {
    var cols = floor(windowWidth / this.scl);
    var rows = floor(windowHeight / this.scl);
    var vector = createVector(floor(random(cols)), floor(random(rows)));
    vector.mult(this.scl);
    return vector;
  }
  //initialize spike location with a random point
  location() {
    this.spikeLocation = this.makeRandomVector();
    this.x = this.spikeLocation.x;
    this.y = this.spikeLocation.y;
  }

  show() {
    stroke(this.spikeColor);
    strokeWeight(.5);
    noFill();
    ellipse(this.spikeLocation.x, this.spikeLocation.y, this.scl, this.scl);
    // for (var i = 0; i < this.total; i++) {
      // fill(random(220, 270), random(220, 270), 0);
      // ellipse(this.foodLocation.x, this.foodLocation.y, random(scl / 2, scl / 8), random(scl / 2, scl / 8));
    // }
  }
}
