// Visuals: Analyze the frequency spectrum with FFT (Fast Fourier Transform) Draw a 1024 particles system that represents bins of the FFT frequency spectrum.  Example by Jason Sigal
// Body rec: Copyright (c) 2018 ml5 This software is released under the MIT License. https://opensource.org/licenses/MIT ml5 Example PoseNet example using p5.js Modified based on Kyle McDonald's ml5 poseNet sketch: https://editor.p5js.org/kylemcdonald/sketches/H1OoUd9h7
// https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints

var mic, soundFile; // input sources, press T to toggleInput()
var fft;
var smoothing = 0.8; // play with this, between 0 and .99
var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 an 1024
var particles = new Array(binCount);

let video;
let poseNet;
let poses = [];
let skullImage;
let sclHelper = 40;

let noseIndex = 0;
let leftEyeIndex = 1;
let rightEyeIndex = 2;
let leftEarIndex = 3;
let rightEarIndex = 4;
let leftShoulderIndex = 5;
let rightShoulderIndex = 6;
let leftElbowIndex = 7;
let rightElbowIndex = 8;
let leftWristIndex = 9;
let rightWristIndex = 10;
let leftHipIndex = 11;
let rightHipIndex = 12;
let leftKneeIndex = 13;
let rightKneeIndex = 14;
let leftAnkleIndex = 15;
let rightAnkleIndex = 16;

let skeletons = [];

function preload() {
  skullImage = loadImage("skull.png");
  neckImage = loadImage("neck.png");
  torsoImage = loadImage("torso.png");
  lshinImage = loadImage("lshin.png");
  rshinImage = loadImage("rshin.png");
  lthighImage = loadImage("lthigh.png");
  rthighImage = loadImage("rthigh.png");
  lbicepImage = loadImage("lbicep.png");
  rbicepImage = loadImage("rbicep.png");
  lhandImage = loadImage("lhand.png");
  rhandImage = loadImage("rhand.png");
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  noStroke();

  // load posenet model and link to video - with a single detection
  poseNet = ml5.poseNet(video, modelReady, { flipHorizontal: true});
  // set up an event which adds an array to "poses" with each new pose
  let poseCallback = function(results) {
    poses = results;
  };
  poseNet.on('pose', poseCallback);
  // Hide the video - just show the canvas
  video.hide();

  mic = new p5.AudioIn();
  mic.start();

  // initialize the FFT, plug in our variables for smoothing and binCount
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(mic);

  // instantiate the particles.
  for (var i = 0; i < particles.length; i++) {
    var x = map(i, 0, binCount, 0, width * 2);
    var y = random(0, height);
    var position = createVector(x, y);
    particles[i] = new Particle(position);
  }
}

function lerpHelper (old, pose, poseIndex) {
  let poseX = pose.keypoints[poseIndex].position.x;
  let poseY = pose.keypoints[poseIndex].position.y;
  let calculatedX = lerp(old.x, poseX, 0.2);
  let calculatedY = lerp(old.y, poseY, 0.2);

  old.x = calculatedX;
  old.y = calculatedY;
}

function draw() {
  background(255);
  //flip video
  translate(video.width, 0);
  scale(-1,1);
  //draw video
  image(video, 0, 0, width, height);
  //set threshhold filter
  // filter(THRESHOLD);
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    // skull
    let skullXPos = pose.keypoints[noseIndex].position.x;
    let skullYPos = pose.keypoints[noseIndex].position.y;
    //knee to foot
    let rightAnkleXPos = pose.keypoints[rightAnkleIndex].position.x;
    let rightAnkleYPos = pose.keypoints[rightAnkleIndex].position.y;

    let leftAnkleXPos = pose.keypoints[leftAnkleIndex].position.x;
    let leftAnkleYPos = pose.keypoints[leftAnkleIndex].position.y;

    let rightKneeXPos = pose.keypoints[rightKneeIndex].position.x;
    let rightKneeYPos = pose.keypoints[rightKneeIndex].position.y;

    let leftKneeXPos = pose.keypoints[leftKneeIndex].position.x;
    let leftKneeYPos = pose.keypoints[leftKneeIndex].position.y;

    let rightHipXPos = pose.keypoints[rightHipIndex].position.x;
    let rightHipYPos = pose.keypoints[rightHipIndex].position.y;

    let leftHipXPos = pose.keypoints[leftHipIndex].position.x;
    let leftHipYPos = pose.keypoints[leftHipIndex].position.y;

    let rightShoulderXPos = pose.keypoints[rightShoulderIndex].position.x;
    let rightShoulderYPos = pose.keypoints[rightShoulderIndex].position.y;

    let leftShoulderXPos = pose.keypoints[leftShoulderIndex].position.x;
    let leftShoulderYPos = pose.keypoints[leftShoulderIndex].position.y;

    let rightElbowXPos = pose.keypoints[rightElbowIndex].position.x;
    let rightElbowYPos = pose.keypoints[rightElbowIndex].position.y;

    let leftElbowXPos = pose.keypoints[leftElbowIndex].position.x;
    let leftElbowYPos = pose.keypoints[leftElbowIndex].position.y;

    let rightWristXPos = pose.keypoints[rightWristIndex].position.x;
    let rightWristYPos = pose.keypoints[rightWristIndex].position.y;

    let leftWristXPos = pose.keypoints[leftWristIndex].position.x;
    let leftWristYPos = pose.keypoints[leftWristIndex].position.y;


    let skeleton = skeletons[i];
    if(typeof(skeleton) === 'undefined') {
      // we haven't seen this skeleton before
      skeleton = {
        skull: {x: skullXPos, y: skullYPos},

        rightAnkle: {x: rightAnkleXPos, y: rightAnkleYPos},
        leftAnkle: {x: leftAnkleXPos, y: leftAnkleYPos},

        leftKnee: {x: leftKneeXPos, y: leftKneeYPos},
        rightKnee: {x: rightKneeXPos, y: rightKneeYPos},

        leftHip: {x: leftHipXPos, y: leftHipYPos},
        rightHip: {x: rightHipXPos, y: rightHipYPos},

        leftShoulder: {x: leftShoulderXPos, y: leftShoulderYPos},
        rightShoulder: {x: rightShoulderXPos, y: rightShoulderYPos},

        leftElbow: {x: leftElbowXPos, y: leftElbowYPos},
        rightElbow: {x: rightElbowXPos, y: rightElbowYPos},

        leftWrist: {x: leftWristXPos, y: leftWristYPos},
        rightWrist: {x: rightWristXPos, y: rightWristYPos}

      }
    } else {
      lerpHelper(skeleton.skull, pose, noseIndex);
      lerpHelper(skeleton.rightAnkle, pose, rightAnkleIndex);
      lerpHelper(skeleton.leftAnkle, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightKnee, pose, leftAnkleIndex);
      lerpHelper(skeleton.leftKnee, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightHip, pose, leftAnkleIndex);
      lerpHelper(skeleton.leftHip, pose, leftAnkleIndex);
      lerpHelper(skeleton.leftShoulder, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightShoulder, pose, leftAnkleIndex);
      lerpHelper(skeleton.leftElbow, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightElbow, pose, leftAnkleIndex);
      lerpHelper(skeleton.leftWrist, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightWrist, pose, leftAnkleIndex);
    }

    // strokeWeight(1);
    // stroke(0, 0, 255, 100);
    tint(255, 200);
    let skullSize = 200;
    //skull

    push();
    imageMode(CORNERS);

    //knee to foot
        // line(rightKneeXPos, rightKneeYPos, rightAnkleXPos, rightAnkleYPos);
    image(lshinImage, skeleton.rightKnee.x, skeleton.rightKnee.y, skeleton.rightAnkle.x, skeleton.rightAnkle.y);
    image(rshinImage, skeleton.leftKnee.x, skeleton.leftKnee.y, skeleton.leftAnkle.x, skeleton.leftAnkle.y);
    //hip to knee
    image(lthighImage, skeleton.rightHip.x, skeleton.rightHip.y, skeleton.rightKnee.x, skeleton.rightKnee.y);
    image(rthighImage, skeleton.leftHip.x, skeleton.leftHip.y, skeleton.leftKnee.x, skeleton.leftKnee.y);
    //bicep
    image(lbicepImage, skeleton.rightShoulder.x, skeleton.rightShoulder.y, skeleton.rightElbow.x, skeleton.rightElbow.y);
    image(rbicepImage, skeleton.leftShoulder.x, skeleton.leftShoulder.y, skeleton.leftElbow.x, skeleton.leftElbow.y);
    //hand
    image(lhandImage, skeleton.rightElbow.x, skeleton.rightElbow.y, skeleton.rightWrist.x, skeleton.rightWrist.y);
    image(rhandImage, skeleton.leftElbow.x, skeleton.leftElbow.y, skeleton.leftWrist.x, skeleton.leftWrist.y);
    //neck
    // image(neckImage, skeleton.skull.x, skeleton.skull.y + skullSize/3, skeleton.leftShoulder.x - skeleton.rightShoulder.y/2);

    image(torsoImage, skeleton.rightShoulder.x, skeleton.rightShoulder.y, skeleton.leftHip.x, skeleton.leftHip.y);

    pop();
    //torso
    image(skullImage, skeleton.skull.x - skullSize / 2, skeleton.skull.y - skullSize / 2, skullSize, skullSize);

  }

  // returns an array with [binCount] amplitude readings from lowest to highest frequencies
  var spectrum = fft.analyze(binCount);

  // update and draw all [binCount] particles!
  // Each particle gets a level that corresponds to
  // the level at one bin of the FFT spectrum.
  // This level is like amplitude, often called "energy."
  // It will be a number between 0-255.
  for (var i = 0; i < binCount; i++) {
    var thisLevel = map(spectrum[i], 0, 255, 0, 1);

    // update values based on amplitude at this part of the frequency spectrum
    particles[i].update(thisLevel);

    // draw the particle
    particles[i].draw();

    // update x position (in case we change the bin count while live coding)
    particles[i].position.x = map(i, 0, binCount, 0, width * 2);
  }

}

//let me know when the model is loaded and ready
function modelReady() {
  console.log('model ready');
}

// ===============
// Particle class
// ===============

var Particle = function(position) {
  this.position = position;
  this.scale = random(0, 1);
  this.speed = createVector(0, random(0, 10));
  this.color = [random(0, 255), random(0, 255), random(0, 255)];
}

var theyExpand = 1;

// use FFT bin level to change speed and diameter
Particle.prototype.update = function(someLevel) {
  this.position.y += this.speed.y / (someLevel * 2);
  if (this.position.y > height) {
    this.position.y = 0;
  }
  this.diameter = map(someLevel, 0, 1, 0, 100) * this.scale * theyExpand;

}

Particle.prototype.draw = function() {
  fill(this.color);
  ellipse(
    this.position.x, this.position.y,
    this.diameter, this.diameter
  );
}



// ================
// Helper Functions
// ================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function keyPressed() {
  if (key == 'T') {
    toggleInput();
  }
}

// To prevent feedback, mic doesnt send its output.
// So we need to tell fft to listen to the mic, and then switch back.
function toggleInput() {
  if (soundFile.isPlaying()) {
    soundFile.pause();
    mic.start();
    fft.setInput(mic);
  } else {
    soundFile.play();
    mic.stop();
    fft.setInput(soundFile);
  }
}
