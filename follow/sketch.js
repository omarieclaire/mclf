// HIGH LEVEL
// IMMEDIATELY communicate follow status to both players
// communicate direction more
// player should _want_ to be leading

// VISUAL COMMS
// - standardize ring offset
// - make tail come off last ringLocation
// - make death prettier / more compelling
// - manipulate circle colour!
// - improve ring loss animation

// MAYBE???
// - give flavour text boxes to coins - i'm just looking for a leader? ("i'll do what ever you tell me to do")
// - allow player to skip the training level? have no training level?
// - should foods move around a bit?
// - punishment should be immediately obvious
// - if you follow you die
// - draw line between players?

var player1;
var player2;
var foodColor = [255]; //white
var pointColor = [255, 215, 0, 250]; //gold
var player1Color = [255, 51, 153, 250]; //MAGENTA
var player2Color = [51, 153, 255, 250]; //BABY BLUE
var player1FadeColor = [184, 125, 155, 200];
var player2FadeColor = [145, 200, 255, 200];
var scl = 40;
var vol = 0.4;
var foods = [];
var spikes = [];
var level0;
var level1;
var level2;
var level3;
var finallevel;
var levelManager;
var pressKeyToContinue;
var standardTextSize = 40;

function preload() {
  p1_img = loadImage('images/p1.png');
  p2_img = loadImage('images/p2.png');
  food_img = loadImage('images/food.png');
  brick_img = loadImage('images/brick.png');
  intro_music = loadSound('sounds/intro.mp3');
  intro_music.setVolume(0.02);
  eat_sound = loadSound('sounds/eat.mp3');
  eat_sound.setVolume(vol);
  hit_sound = loadSound('sounds/hit.mp3');
  hit_sound.setVolume(2);
  newlevel_music = loadSound('sounds/newlevel.mp3');
  newlevel_music.setVolume(vol);
  winning_music = loadSound('sounds/winning.mp3');
  winning_music.setVolume(vol);
  losing_music = loadSound('sounds/losing.mp3');
  intro_music.setVolume(vol);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //Special function to construct an object
  player1 = new Player("1", " ", 0, 200, scl, player1Color, player1FadeColor);
  player2 = new Player("2", " ", -0, -200, scl, player2Color, player2FadeColor);
  level0 = new Level0();
  level1 = new Level1();
  level2 = new Level2();
  level3 = new Level3();
  finalLevel = new FinalLevel();
  pressKeyToContinue = new PressKeyToContinue();
  //array variable containing all the levels
  var allTheLevels = [pressKeyToContinue, level0, level1, level2, level3];
  levelManager = new LevelManager(0, allTheLevels, finalLevel);


  for (var i = 0; i < 1; i++) {
    foods[i] = new Food(scl);
    foods[i].location();
  }

  for (var i = 0; i < 1; i++) {
    spikes[i] = new Spike(scl);
    spikes[i].location();
  }
}

function draw() {
  levelManager.switchLevel(player1, player2);
  //following punishment/rewards
  player1.updateTotal(player2);
  player2.updateTotal(player1);

  // update location of player1 and player2
  player1.update();
  player2.update();

  // player1.ringLocation();
  // player2.ringLocation();

  playerCollision();

  ////////////////////////// DRAW
  levelManager.drawLevel(player1, player2, foods, spikes);
}

function playerCollision() {
  let d = dist(player1.x, player1.y, player2.x, player2.y);
  if (d < player1.r + player2.r) {
    console.log("playerCollision: collision true");
    player1.total = player1.total - 1;
    player2.total = player2.total - 1;
    player1.poppedRing = player1.playerRings.pop();
    player2.poppedRing = player2.playerRings.pop();
    player1.flipDirection(player2);
    player2.flipDirection(player1);
    //add xspeed or yspeed after collision to fix collision bug
    player1.update(100);
    player2.update(100);
    // players never follow each other after a collission
    player1.isFollowing = false;
    player2.isFollowing = false;
    player1.isFollowed = false;
    player2.isFollowed = false;
    // hit_sound.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  levelManager.resetLevelManager();
}

function keyPressed() {

  if (keyCode === 70) {
    let fs = fullscreen();
    fullscreen(!fs);
    levelManager.resetLevelManager();
  }

  if (keyCode === 32) {
    levelManager.keyWasPressed(keyCode);
  }

  if (keyCode === UP_ARROW) {
    player1.changeDirectionUp(player2);

  } else if (keyCode === DOWN_ARROW) {
    player1.changeDirectionDown(player2);

  } else if (keyCode === RIGHT_ARROW) {
    player1.changeDirectionRight(player2);

  } else if (keyCode === LEFT_ARROW) {
    player1.changeDirectionLeft(player2);

  } else if (keyCode === 87) {
    player2.changeDirectionUp(player1);

  } else if (keyCode === 83) {
    player2.changeDirectionDown(player1);

  } else if (keyCode === 68) {
    player2.changeDirectionRight(player1);

  } else if (keyCode === 65) {
    player2.changeDirectionLeft(player1);
  }
}
