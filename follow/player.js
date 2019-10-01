class Player {
  //constructor is a method which is run only once to set up the object
  constructor(temp_name, temp_playerDir, temp_xspeed, temp_x, temp_y, scl) {
    this.scl = scl;
    this.name = temp_name;
    this.direction = temp_playerDir;
    //sotre inittial diection for reset
    this.initialDirection = temp_playerDir;
    this.xspeed = temp_xspeed;
    this.initialxspeed = temp_xspeed;
    this.x = temp_x;
    this.initialX = temp_x;
    this.y = temp_y;
    this.initialY = temp_y
    this.r = 20;
    this.yspeed = 0;
    this.total = 5;
    this.isFollowing = false;
    this.isFollowed = false;

    this.playerRings = []; // store the rings within a local array
    for (var i = 0; i < this.total; i++) { //for each point in score
      this.playerRings.push(new Rings(this, this.scl)); //push a new ring to array
    }
  }

  resetPlayer() {
    this.xspeed = this.initialxspeed;
    this.x = this.initialX;
    this.y = this.initialY;
    this.r = 20;
    this.yspeed = 0;
    this.total = 5;
    this.isFollowing = false;
    this.isFollowed = false;
    this.direction = this.initialDirection;

    this.playerRings = []; // store the rings within a local array
    for (var i = 0; i < this.total; i++) {
      this.playerRings.push(new Rings(this, this.scl));
    }
    console.log("reset: " + this.direction + "and reset: " + this.total);
    console.log("player was reset " + this.name);
    console.log("is following is " + this.isFollowing);

  }

  eat(food) {
    var d = dist(this.x, this.y, food.x, food.y);
    if (d < this.scl) {
      this.total++;
      this.playerRings.push(new Rings(this, this.scl));
      eat_sound.play();
      return true;
    } else {
      return false;
    }
  }

  dir(x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  flipDirection() {
    if (this.direction == "up") {
      this.changeDirectionDown();
    } else if (this.direction == "down") {
      this.changeDirectionUp();
    } else if (this.direction == "left") {
      this.changeDirectionRight();
    } else if (this.direction == "right") {
      this.changeDirectionLeft();
    }
  }

  changeDirectionDown() {
    this.dir(0, 0.1);
    this.direction = "down";
  }
  changeDirectionUp() {
    this.dir(0, -0.1);
    this.direction = "up";
  }
  changeDirectionLeft() {
    this.dir(-0.1, 0);
    this.direction = "left";
  }
  changeDirectionRight() {
    this.dir(0.1, 0);
    this.direction = "right";
  }

  changeRingTotal(amount, x, y) {
    var oldTotal = this.total;
    this.total = this.total + amount;
    //floor of old total minus floor of new total, then the absolute value of that (if pos we leave it, if neg we make it pos)
    var diff = Math.abs(Math.floor(this.total) - Math.floor(oldTotal));
    if (diff >= 1) {
      if (amount < 0) {
        this.playerRings.pop(); //get rid of a ring
      } else {
        // create a ring that follows 'this' and has the start x and y coordinates passed to changeRingTotal
        this.playerRings.push(new Rings(this, this.scl, x, y)); //add a ring
      }
    }
  }
//update the total score on a given player which also changes the rings
  updateTotal(otherPlayer) {
    if (this.isFollowing) {
      //decrement
      //note: we never use this.x and this.y in this case because of the above logic (amount < 0)
      this.changeRingTotal(-0.005, this.x, this.y);
      //increment

      //other player is simply an object. we pass the values below into changeringtotal.
      //create a ring that follows other player
      otherPlayer.changeRingTotal(0.005, this.x, this.y);
    }
  }
  //directional speed of player
  update(amount) {
    for (var i = 0; i < this.playerRings.length; i++) {
      this.playerRings[i].move();
    }

    //for most circumstances we don't pass a value
    if (typeof(amount) === 'undefined') {
      this.x = this.x + this.xspeed * this.scl;
      this.y = this.y + this.yspeed * this.scl;
      //for the collision bug we need to pass a value
    } else {
      this.x = this.x + this.xspeed * amount;
      this.y = this.y + this.yspeed * amount;
    }

    //loop player around screen
    if (this.x < 0 - 20) {
      this.x = windowWidth - this.scl;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(windowWidth - this.scl, theRing.y);
      }
      // Rings.x = windowWidth - this.scl;
      // leaderRing.x = windowWidth - this.scl;
    } else if (this.x > windowWidth - this.scl + 20) {
      this.x = 0 - 20;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(0 - 20, theRing.y);
      }
    } else if (this.y < 0 - 20) {
      this.y = windowHeight - this.scl;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(theRing.x, windowHeight - this.scl);
      }
    } else if (this.y > windowHeight - this.scl + 20) {
      this.y = 0 - 20;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(theRing.x, 0 - 20);
      }
    }
  }

  //FOLLOW ME

  show() {
    noStroke();
    //colored player circle
    ellipse(this.x, this.y, this.scl, this.scl);
    noFill();
    stroke(255, 200);
    for (var i = 0; i < this.playerRings.length; i++) {
      if (i == this.playerRings.length - 1 && this.isFollowed) {
        stroke(255, 0 , 0);
      }
      if (i == this.playerRings.length - 1 && this.isFollowing) {
        stroke(pointColor);
      } else {
        stroke(255);
      }
      this.playerRings[i].draw(this.scl / 2 + i * this.scl / 2);
    }

    //player trail
    let numberOfTrails = 10;
    let spaceBetweenCircles = 15;
    let radiusShrinkFactor = 0.5;

    for (var i = 1; i < numberOfTrails; i++) {
      //having 1 + ensures that the divisor is always above 1 so the trail will never be bigger than the player
      let newRadius = (this.scl / 4) / (1 + i * radiusShrinkFactor);
      if (this.direction == "up") {
        let newYCoordinate = this.y + (i * spaceBetweenCircles);
        ellipse(this.x, newYCoordinate, newRadius);
      } else if (this.direction == "down") {
        let newYCoordinate = this.y - (i * spaceBetweenCircles);
        ellipse(this.x, newYCoordinate, newRadius);
      } else if (this.direction == "left") {
        let newXCoordinate = this.x + (i * spaceBetweenCircles);
        ellipse(newXCoordinate, this.y, newRadius);
      } else if (this.direction == "right") {
        let newXCoordinate = this.x - (i * spaceBetweenCircles);
        ellipse(newXCoordinate, this.y, newRadius);
      }
    }
  }
}
