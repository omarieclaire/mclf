// Visuals: Analyze the frequency spectrum with FFT (Fast Fourier Transform) Draw a 1024 particles system that represents bins of the FFT frequency spectrum.  Example by Jason Sigal
// Body rec: Copyright (c) 2018 ml5 This software is released under the MIT License. https://opensource.org/licenses/MIT ml5 Example PoseNet example using p5.js Modified based on Kyle McDonald's ml5 poseNet sketch: https://editor.p5js.org/kylemcdonald/sketches/H1OoUd9h7
// https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints
// https://learn.ml5js.org/docs/#/reference/posenet

var mic, soundFile; // input sources, press T to toggleInput()
var fft;
var smoothing = 0.8; // play with this, between 0 and .99
var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 an 1024
var particles = new Array(binCount);

let video;
let poseNet;
let poses = [];
let skullImage;

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
  noseImage = loadImage("skull.png");
  lEyeImage = loadImage("eye.png");
  rEyeImage = loadImage("eye.png");
  lEarImage = loadImage("skull.png");
  rEarImage = loadImage("skull.png");
  neckImage = loadImage("neck.png");
  torsoImage = loadImage("torso.png");
  lShinImage = loadImage("lshin.png");
  rShinImage = loadImage("rshin.png");
  lThighImage = loadImage("lthigh.png");
  rThighImage = loadImage("rthigh.png");
  lBicepImage = loadImage("lbicep.png");
  rBicepImage = loadImage("rbicep.png");
  lHandImage = loadImage("lhand.png");
  rHandImage = loadImage("rhand.png");
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
  poseNet.on('pose', poseCallback, {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  // Can be one of 8, 16, 32 (Stride 16, 32 are supported for the ResNet architecture and
  // stride 8, 16, 32 are supported for the MobileNetV1 architecture). It specifies the
  // output stride of the PoseNet model. The smaller the value, the larger the output
  // resolution, and more accurate the model at the cost of speed. Set this to a larger
  // value to increase speed at the cost of accuracy.
  outputStride: 32,
  flipHorizontal: true,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'multiple',
  // Can be one of 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, and 801.
  // Set this to a smaller value to increase speed at the cost of accuracy.
  inputResolution: 161,
  multiplier: 0.75,
  quantBytes: 2,
});
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
  let calculatedX = lerp(old.x, poseX, 0.7);
  let calculatedY = lerp(old.y, poseY, 0.7);

  old.x = calculatedX;
  old.y = calculatedY;
}

function noseEyeDistance(skeleton) {
  return dist(skeleton.nose.x, skeleton.nose.y, skeleton.leftEye.x, skeleton.leftEye.y);
}

function lerpedDistance(oldDistance, newDistance) {
  let calculatedScale = lerp(oldDistance, newDistance, 0.5);
  return calculatedScale;
}

function draw() {
  background(255);
  //flip video
  translate(video.width, 0);
  scale(-1,1);
  //draw video
  // image(video, 0, 0, width, height);
  //set threshhold filter
  // filter(THRESHOLD);
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    // skull
    let skullXPos = pose.keypoints[noseIndex].position.x;
    let skullYPos = pose.keypoints[noseIndex].position.y;
    // nose
    let noseXPos = pose.keypoints[noseIndex].position.x;
    let noseYPos = pose.keypoints[noseIndex].position.y;

    //eyes
    let rightEyeXPos = pose.keypoints[rightEyeIndex].position.x;
    let rightEyeYPos = pose.keypoints[rightEyeIndex].position.y;

    let leftEyeXPos = pose.keypoints[leftEyeIndex].position.x;
    let leftEyeYPos = pose.keypoints[leftEyeIndex].position.y;

    //ears
    let rightEarXPos = pose.keypoints[rightEarIndex].position.x;
    let rightEarYPos = pose.keypoints[rightEarIndex].position.y;

    let leftEarXPos = pose.keypoints[leftEarIndex].position.x;
    let leftEarYPos = pose.keypoints[leftEarIndex].position.y;


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

        nose: {x: noseXPos, y: noseYPos},

        rightEye: {x: rightEyeXPos, y: rightEyeYPos},
        leftEye: {x: leftEyeXPos, y: leftEyeYPos},

        rightEar: {x: rightEarXPos, y: rightEarYPos},
        leftEar: {x: leftEarXPos, y: leftEarYPos},

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
        rightWrist: {x: rightWristXPos, y: rightWristYPos},
      }
      skeleton['noseEyeDistance'] = noseEyeDistance(skeleton);
      skeletons[i] = skeleton;
    } else {
      lerpHelper(skeleton.skull, pose, noseIndex);
      lerpHelper(skeleton.nose, pose, noseIndex);
      lerpHelper(skeleton.rightEye, pose, rightEyeIndex);
      lerpHelper(skeleton.leftEye, pose, leftEyeIndex);
      lerpHelper(skeleton.rightEar, pose, rightEarIndex);
      lerpHelper(skeleton.leftEar, pose, leftEarIndex);
      lerpHelper(skeleton.rightAnkle, pose, rightAnkleIndex);
      lerpHelper(skeleton.leftAnkle, pose, leftAnkleIndex);
      lerpHelper(skeleton.rightKnee, pose, rightKneeIndex);
      lerpHelper(skeleton.leftKnee, pose, leftKneeIndex);
      lerpHelper(skeleton.rightHip, pose, rightHipIndex);
      lerpHelper(skeleton.leftHip, pose, leftHipIndex);
      lerpHelper(skeleton.leftShoulder, pose, leftShoulderIndex);
      lerpHelper(skeleton.rightShoulder, pose, rightShoulderIndex);
      lerpHelper(skeleton.leftElbow, pose, leftElbowIndex);
      lerpHelper(skeleton.rightElbow, pose, rightElbowIndex);
      lerpHelper(skeleton.leftWrist, pose, leftWristIndex);
      lerpHelper(skeleton.rightWrist, pose, rightWristIndex);
      skeleton.noseEyeDistance = lerpedDistance(skeleton.noseEyeDistance, noseEyeDistance(skeleton))
    }

    // strokeWeight(1);
    // stroke(0, 0, 255, 100);
    tint(255, 170);
    let skullSize = 200;
    //skull

    push();
    imageMode(CORNERS);

    //knee to foot
        // line(rightKneeXPos, rightKneeYPos, rightAnkleXPos, rightAnkleYPos);
    image(lShinImage, skeleton.rightKnee.x, skeleton.rightKnee.y, skeleton.rightAnkle.x, skeleton.rightAnkle.y);
    image(rShinImage, skeleton.leftKnee.x, skeleton.leftKnee.y, skeleton.leftAnkle.x, skeleton.leftAnkle.y);
    //hip to knee
    image(lThighImage, skeleton.rightHip.x, skeleton.rightHip.y, skeleton.rightKnee.x, skeleton.rightKnee.y);
    image(rThighImage, skeleton.leftHip.x, skeleton.leftHip.y, skeleton.leftKnee.x, skeleton.leftKnee.y);
    //bicep
    image(lBicepImage, skeleton.rightShoulder.x, skeleton.rightShoulder.y, skeleton.rightElbow.x, skeleton.rightElbow.y);
    image(rBicepImage, skeleton.leftShoulder.x, skeleton.leftShoulder.y, skeleton.leftElbow.x, skeleton.leftElbow.y);
    //hand
    image(lHandImage, skeleton.rightElbow.x, skeleton.rightElbow.y, skeleton.rightWrist.x, skeleton.rightWrist.y);
    image(rHandImage, skeleton.leftElbow.x, skeleton.leftElbow.y, skeleton.leftWrist.x, skeleton.leftWrist.y);
    //neck
    // image(neckImage, skeleton.skull.x, skeleton.skull.y + skullSize/3, skeleton.leftShoulder.x - skeleton.rightShoulder.y/2);
    //ear
    // image(lEarImage, skeleton.rightEar.x, skeleton.rightEar.y, skeleton.rightEar.x, skeleton.rightEar.y);
    // image(rEarImage, skeleton.leftEar.x, skeleton.leftEar.y, skeleton.leftWrist.x, skeleton.leftWrist.y);
    //torso
    image(torsoImage, skeleton.rightShoulder.x, skeleton.rightShoulder.y, skeleton.leftHip.x, skeleton.leftHip.y);

    pop();

    push();


    push();
    imageMode(CENTER);
    angleMode(DEGREES);
    //translate is the point of origin for all drawing and all rotation
    translate(skeleton.nose.x, skeleton.nose.y);
    var skullAngle = skeleton.leftEye.y - skeleton.rightEye.y;
    rotate(skullAngle, [skeleton.nose.x, skeleton.nose.y]);
    image(skullImage, 0, 0, skeleton.noseEyeDistance*5, skeleton.noseEyeDistance*5);
    pop();

    //eye
    // image(lEyeImage, skeleton.rightEye.x, skeleton.rightEye.y, sclHelper/2, sclHelper/2);
    // image(rEyeImage, skeleton.leftEye.x, skeleton.leftEye.y, sclHelper/2, sclHelper/2);
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
  this.speed = createVector(0, random(0, 20));
  this.color = [random(0, 255), random(0, 0), random(0, 255), random(50, 200)];
}

var theyExpand = 2;

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
