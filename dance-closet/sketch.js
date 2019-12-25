/*
  Visuals: Analyze the frequency spectrum with FFT (Fast Fourier Transform) Draw a 1024 particles system that represents bins of the FFT frequency spectrum.  Example by Jason Sigal

Body rec: Copyright (c) 2018 ml5 This software is released under the MIT License. https://opensource.org/licenses/MIT ml5 Example PoseNet example using p5.js Modified based on Kyle McDonald's ml5 poseNet sketch: https://editor.p5js.org/kylemcdonald/sketches/H1OoUd9h7
*/

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

//flipHorizontal = true;

// https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints

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

function preload() {
  skullImage = loadImage("skull.png");
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

  // poseNet.on("pose", gotPoses);
  // set up an event which adds an array to "poses" with each new pose
  let poseCallback = function(results) {
    poses = results;
  };
  poseNet.on('pose', poseCallback);

  // Hide the video element, and just show the canvas
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


function draw() {
  background(255);
  //draw video
  translate(video.width, 0);
  //flip video
  scale(-1,1);
  image(video, 0, 0, width, height);

  // filter(THRESHOLD);

  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    // strokeWeight(1);
    // stroke(0, 0, 255, 100);
    tint(255, 200);
    let skullSize = 200;
    //skull
    let skullXPos = pose.keypoints[noseIndex].position.x;
    let skullYPos = pose.keypoints[noseIndex].position.y;
    image(skullImage, skullXPos - skullSize / 2, skullYPos - skullSize / 2, skullSize, skullSize);

    push();
    imageMode(CORNERS);

    //knee to foot
    let rightAnkleKeypoint = pose.keypoints[rightAnkleIndex];
    let rightAnkleXPos = rightAnkleKeypoint.position.x;
    let rightAnkleYPos = rightAnkleKeypoint.position.y;

    let leftAnkleKeypoint = pose.keypoints[leftAnkleIndex];
    let leftAnkleXPos = leftAnkleKeypoint.position.x;
    let leftAnkleYPos = leftAnkleKeypoint.position.y;

    let rightKneeKeypoint = pose.keypoints[rightKneeIndex];
    let rightKneeXPos = rightKneeKeypoint.position.x;
    let rightKneeYPos = rightKneeKeypoint.position.y;

    let leftKneeKeypoint = pose.keypoints[leftKneeIndex];
    let leftKneeXPos = leftKneeKeypoint.position.x;
    let leftKneeYPos = leftKneeKeypoint.position.y;
    // line(rightKneeXPos, rightKneeYPos, rightAnkleXPos, rightAnkleYPos);
    image(lshinImage, rightKneeXPos, rightKneeYPos, rightAnkleXPos, rightAnkleYPos);
    image(rshinImage, leftKneeXPos, leftKneeYPos, leftAnkleXPos, leftAnkleYPos);

    //hip to knee
    let rightHipKeypoint = pose.keypoints[rightHipIndex];
    let rightHipXPos = rightHipKeypoint.position.x;
    let rightHipYPos = rightHipKeypoint.position.y;

    let leftHipKeypoint = pose.keypoints[leftHipIndex];
    let leftHipXPos = leftHipKeypoint.position.x;
    let leftHipYPos = leftHipKeypoint.position.y;
    // line(rightHipXPos, rightHipYPos, rightKneeXPos, rightKneeYPos);
    image(lthighImage, rightHipXPos, rightHipYPos, rightKneeXPos, rightKneeYPos);
    image(rthighImage, leftHipXPos, leftHipYPos, leftKneeXPos, leftKneeYPos);


    //torso
    let rightShoulderKeypoint = pose.keypoints[rightShoulderIndex];
    let rightShoulderXPos = rightShoulderKeypoint.position.x;
    let rightShoulderYPos = rightShoulderKeypoint.position.y;

    let leftShoulderKeypoint = pose.keypoints[leftShoulderIndex];
    let leftShoulderXPos = leftShoulderKeypoint.position.x;
    let leftShoulderYPos = leftShoulderKeypoint.position.y;

    // line(rightShoulderXPos, rightShoulderYPos, rightHipXPos, rightHipYPos);
    image(torsoImage, rightShoulderXPos - sclHelper, rightShoulderYPos - sclHelper, leftHipXPos + sclHelper * 2, leftHipYPos + sclHelper);

    //bicep
    let rightElbowKeypoint = pose.keypoints[rightElbowIndex];
    let rightElbowXPos = rightElbowKeypoint.position.x;
    let rightElbowYPos = rightElbowKeypoint.position.y;

    let leftElbowKeypoint = pose.keypoints[leftElbowIndex];
    let leftElbowXPos = leftElbowKeypoint.position.x;
    let leftElbowYPos = leftElbowKeypoint.position.y;
    // line(rightShoulderXPos, rightShoulderYPos, rightElbowXPos, rightElbowYPos);
    image(lbicepImage, rightShoulderXPos, rightShoulderYPos, rightElbowXPos, rightElbowYPos);
    image(rbicepImage, leftShoulderXPos, leftShoulderYPos, leftElbowXPos, leftElbowYPos);


    //hand
    let rightWristKeypoint = pose.keypoints[rightWristIndex];
    let rightWristXPos = rightWristKeypoint.position.x;
    let rightWristYPos = rightWristKeypoint.position.y;

    let leftWristKeypoint = pose.keypoints[leftWristIndex];
    let leftWristXPos = leftWristKeypoint.position.x;
    let leftWristYPos = rightWristKeypoint.position.y;
    // line(rightElbowXPos, rightElbowYPos, rightWristXPos, rightWristYPos);
    image(lhandImage, rightElbowXPos, rightElbowYPos, rightWristXPos, rightWristYPos);
    image(rhandImage, leftElbowXPos, leftElbowYPos, leftWristXPos, leftWristYPos);

    pop();

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
