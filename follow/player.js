class Player {
  //constructor is a method which is run only once to set up the object
  constructor(temp_name, temp_playerDir, temp_xspeed, xOffSet, scl, tmp_playerColor, tmp_playerFadedColor) {
    this.scl = scl;
    this.name = temp_name;
    this.direction = temp_playerDir;
    //sotre inittial diection for reset
    this.initialDirection = temp_playerDir;
    this.xspeed = temp_xspeed;
    this.initialxspeed = temp_xspeed;
    this.x = windowWidth / 2 + xOffSet;
    this.initialXOffset = xOffSet;
    this.y = windowHeight / 2;
    this.r = 20;
    this.yspeed = 0;
    this.total = 5;
    this.isFollowing = false;
    this.isFollowed = false;
    this.playerColor = tmp_playerColor;
    this.playerFadedColor = tmp_playerFadedColor;

    this.poppedRing = undefined;
    this.numTicksPoppedRing = 0;

    this.playerRings = []; // store the rings within a local array
    for (var i = 0; i < this.total; i++) { //for each point in score
      this.playerRings.push(new Rings(this, this.scl)); //push a new ring to array
    }
  }

  resetPlayer() {
    this.xspeed = this.initialxspeed;
    this.x = windowWidth/2 + this.initialXOffset;
    this.y = windowHeight / 2;
    this.r = 20;
    this.yspeed = 0;
    this.total = 5;
    this.isFollowing = false;
    this.isFollowed = false;
    this.direction = this.initialDirection;
    this.poppedRing = undefined;
    this.numTicksPoppedRing = 0;

    this.playerRings = []; // store the rings within a local array
    for (var i = 0; i < this.total; i++) {
      this.playerRings.push(new Rings(this, this.scl));
    }
    console.log("reset: " + this.direction + "and reset: " + this.total);
    console.log("player was reset " + this.name);
    console.log("is following is " + this.isFollowing);
  }

  handlePlayerFollowing(otherPlayer, ourFutureDirection) {
    //this is happening right after playerX presses a directional key, BEFORE the direction of playerX changes
    if (this.direction == otherPlayer.direction) { //only deal with cases where there is ALREADY a "follower"
      if (ourFutureDirection != this.direction) { //is someone unfollowing someone?
        this.isFollowing = false; //then turn off all follows
        otherPlayer.isFollowing = false;
        this.isFollowed = false;
        otherPlayer.isFollowed = false;
      }
    } else { // if there is no current follower
      if (ourFutureDirection == otherPlayer.direction) {
        this.isFollowing = true;
        otherPlayer.isFollowed = true;
      }
    }
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

  collideWithSpike(spike, otherPlayer) {
    var d = dist(this.x, this.y, spike.x, spike.y);
    if(d < this.scl) {
      this.total--;
      this.poppedRing = this.playerRings.pop();
      // we need otherPlayer to handle flip direction because we needs
      // to update isFollowed and isFollowing whenever a player's direction
      // is changed.
      this.flipDirection(otherPlayer);
      return true;
    } else {
      return false;
    }
  }

  dir(x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  flipDirection(otherPlayer) {
    if (this.direction == "up") {
      this.changeDirectionDown(otherPlayer);
    } else if (this.direction == "down") {
      this.changeDirectionUp(otherPlayer);
    } else if (this.direction == "left") {
      this.changeDirectionRight(otherPlayer);
    } else if (this.direction == "right") {
      this.changeDirectionLeft(otherPlayer);
    }
  }

  changeDirectionDown(otherPlayer) {
    this.dir(0, 0.1);
    this.handlePlayerFollowing(otherPlayer, "down");
    this.direction = "down";
  }
  changeDirectionUp(otherPlayer) {
    this.dir(0, -0.1);
    this.handlePlayerFollowing(otherPlayer, "up");
    this.direction = "up";
  }
  changeDirectionLeft(otherPlayer) {
    this.dir(-0.1, 0);
    this.handlePlayerFollowing(otherPlayer, "left");
    this.direction = "left";
  }
  changeDirectionRight(otherPlayer) {
    this.dir(0.1, 0);
    this.handlePlayerFollowing(otherPlayer, "right");
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
    //ring movement from one player to another
    var ringTransferSpd = 0.01;
    if (this.isFollowing) {
      //decrement
      //note: we never use this.x and this.y in this case because of the above logic (amount < 0)
      this.changeRingTotal(- ringTransferSpd, this.x, this.y);
      //increment

      //other player is simply an object. we pass the values below into changeringtotal.
      //create a ring that follows other player
      otherPlayer.changeRingTotal(ringTransferSpd, this.x, this.y);
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
    var windowLoopSpacer = 30;
    if (this.x < 0 - windowLoopSpacer) {
      this.x = windowWidth - windowLoopSpacer;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(windowWidth - windowLoopSpacer, theRing.y);
      }
      // Rings.x = windowWidth - this.scl;
      // leaderRing.x = windowWidth - this.scl;
    } else if (this.x > windowWidth + windowLoopSpacer) {
      this.x = 0 - windowLoopSpacer;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(0 - windowLoopSpacer, theRing.y);
      }
    } else if (this.y < 0 - windowLoopSpacer) {
      this.y = windowHeight - windowLoopSpacer;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(theRing.x, windowHeight - windowLoopSpacer);
      }
    } else if (this.y > windowHeight + windowLoopSpacer) {
      this.y = 0 - windowLoopSpacer;
      for (var i = 0; i < this.playerRings.length; i++) {
        var theRing = this.playerRings[i];
        theRing.updateLocation(theRing.x, 0 - windowLoopSpacer);
      }
    }
// following player jitter
    if (this.isFollowing) {
      this.x = this.x + random(-2, 2);
      this.y = this.y + random(-2, 2);
    }
  }

  //FOLLOW ME

  show() {
    noStroke();
    //colored player circle
    if(this.isFollowing){
      fill(this.playerFadedColor);
    } else {
      fill(this.playerColor);
    }
    ellipse(this.x, this.y, this.scl, this.scl);
    noFill();
    stroke(255, 200);
    push(); //set original drawstate
    for (var i = 0; i < this.playerRings.length; i++) {
      if (this.isFollowed && i == this.playerRings.length - 1) {
        strokeWeight(5);
        stroke(pointColor);

      } else {
        strokeWeight(.5);
        stroke(255);
      }
      this.playerRings[i].draw(this.scl / 2 + i * this.scl / 2);
    }
    // draw popped ring
    if(typeof(this.poppedRing) !== 'undefined' && this.numTicksPoppedRing < 200) {
      this.poppedRing.drawDeadRing(this.scl / 2 + this.playerRings.length * this.scl / 2);
      this.numTicksPoppedRing++;
    } else {
      this.numTicks = 0;
      this.poppedRing = undefined;
    }
    pop(); //pop back to original drawstate

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
