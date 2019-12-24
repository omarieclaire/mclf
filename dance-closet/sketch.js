/*
  Visuals: Analyze the frequency spectrum with FFT (Fast Fourier Transform) Draw a 1024 particles system that represents bins of the FFT frequency spectrum.  Example by Jason Sigal

Body rec: Copyright (c) 2018 ml5 This software is released under the MIT License. https://opensource.org/licenses/MIT ml5 Example PoseNet example using p5.js Modified based on Kyle McDonald's ml5 poseNet sketch: https://editor.p5js.org/kylemcdonald/sketches/H1OoUd9h7
*/

var mic, soundFile; // input sources, press T to toggleInput()
var fft;
var smoothing = 0.8; // play with this, between 0 and .99
var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 an 1024
var particles =  new Array(binCount);


let video;
let poseNet;
let poses = [];
let skullImage;

const flipHorizontal = false;
//
// let leftEyeImage;
// let rightEyeImage;


/*
https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints

Available parts are:
0   nose
1	leftEye
2	rightEye
3	leftEar
4	rightEar
5	leftShoulder
6	rightShoulder
7	leftElbow
8	rightElbow
9	leftWrist
10	rightWrist
11	leftHip
12	rightHip
13	leftKnee
14	rightKnee
15	leftAnkle
16	rightAnkle
=== */

//choose body part to track
let keypointIndex = 0;

function preload() {
  skullImage = loadImage("skull.png");
  // leftEyeImage = loadImage("emojiEye.png");
  // rightEyeImage = loadImage("emojiEye2.png");
}


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  noStroke();


  // load posenet model and link to vide - with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // poseNet.on("pose", gotPoses);
  // set up an event which adds an array to "poses" with each new pose
  poseNet.on('pose', function(results) {
    poses = results;
  });
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
  //draw video
  image(video, 0, 0, width, height);

  filter(THRESHOLD);

  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    //try changing to value of keypointIndex in line 22!
    let xpos = pose.keypoints[keypointIndex].position.x;
    let ypos = pose.keypoints[keypointIndex].position.y;

    ellipse(int(xpos), int(ypos), 50, 50);
    tint(255, 200);
    let skullSize = 300;
    image(skullImage, xpos - skullSize/2, ypos- skullSize/2, skullSize, skullSize);


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
    particles[i].update( thisLevel );

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
  this.speed = createVector(0, random(0, 10) );
  this.color = [random(0, 255), random(0,255), random(0,255)];
}

var theyExpand = 1;

// use FFT bin level to change speed and diameter
Particle.prototype.update = function(someLevel) {
  this.position.y += this.speed.y / (someLevel*2);
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
  if (soundFile.isPlaying() ) {
    soundFile.pause();
    mic.start();
    fft.setInput(mic);
  } else {
    soundFile.play();
    mic.stop();
    fft.setInput(soundFile);
  }
}
