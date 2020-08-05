let database;
let scene = 'toilet';
let activeToolColor = 'green';
let inactiveToolColor = 'grey'
let DBLUE = '#a5c7da';
let LBLUE = '#f0fafc';
let LPINK = '#fb9c96';
let DPINK = '#f1635a';
let toolWidth = 40;
let toolSpacer = 10;
let currentPath = []; // (ARRAY WHERE THE CURRENT DRAWING IS BEING STORED)
let tileId = 1;
let angle = 2;
let isDrawing = false;
let graffitiCanvasOpen = false;
let graffitiCanvasW = 440;
let graffitiCanvasH = 280;
let graffitiCanvasX = 200;
let graffitiCanvasY = 50;
let canvasToolsVisible = false;
const SCALEFACTOR = 0.145;

let toolButtons = {
  // write: {
  //   'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
  //   'y': graffitiCanvasY,
  //   'width': toolWidth,
  //   'height': toolWidth,
  //   'text': 'write',
  //   'select': false
  // },
  // draw: {
  //   'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
  //   'y': graffitiCanvasY + toolWidth + toolSpacer,
  //   'width': toolWidth,
  //   'height': toolWidth,
  //   'text': 'draw',
  //   'select': false
  // },
  // save: {
  //   'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
  //   'y': graffitiCanvasY + (toolWidth * 3) + (toolSpacer * 3),
  //   'width': toolWidth,
  //   'height': toolWidth,
  //   'text': 'save',
  //   'select': false
  // },
  clear: {
    'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
    'y': graffitiCanvasY + (toolWidth * 2) + (toolSpacer * 2),
    'width': toolWidth,
    'height': toolWidth,
    'text': 'clear',
    'select': false
  }

};

let currentTile = tiles[1];

let toilet1;
let toilet2;
let tp1;
let tp2;
let firaFont;

// don't delete me
function dataSent(data, err) {}

function preload() {
  toilet1 = loadImage('img/toilet1.png');
  toilet2 = loadImage('img/toilet2.png');
  tp1 = loadImage('img/tp1.png');
  tp2 = loadImage('img/tp2.png');
  firaFont = loadFont('fonts/FiraSans-Book.otf');
}

function setup() {
  // canvas = createCanvas(900, 617, );
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  textFont(firaFont, 36);

  // toilet thoughts - give the next person something to consider? what do you wish you could tell your younger self? what do you want to tell the next person in this bathroom
  var myAudio = document.createElement('audio');
  if (myAudio.canPlayType('audio/mpeg')) {
    myAudio.setAttribute('src', 'audio/song.mp3');
  }

  function mouseFunctions() {
    toggleGraffitiCanvas();
    startPath(); // when mouse is PRESSED, START COLLECTING X AND Y POINTS
    detectMouseOnTool();
  }

  canvas.mousePressed(mouseFunctions);
  canvas.parent('canvascontainer'); // PARENT THE CANVAS TO THE CANVAS CONTAINER
  canvas.mouseReleased(endPath); // WHEN MOUSE IS RELEASED, stop COLLECTING X AND Y POINTS


  // FIREBASE AUTH STUFF
  var config = {
    apiKey: 'AIzaSyAkqkz-UZyRSv_1QgfMjUeqX8mjZfg0MJE',
    authDomain: 'throne-room-club.firebaseapp.com',
    databaseURL: 'https://throne-room-club.firebaseio.com',
    storageBucket: 'throne-room-club.appspot.com',
    messagingSenderId: '889776405480'
  };
  firebase.initializeApp(config);
  database = firebase.database();
  // var params = getURLParams(); // get URL params for permalink
  // if (params.id) {
  // showDrawing(params.id);
  // }
  var ref = database.ref('graffitiWall'); // get the graffitiWall
  ref.on('value', gotData, errData); // trigger this anytime anything is changed in the database (err is in case of error)
  ref.once('value', buildMap, errData); // buildMap at the start

  function handleKeyDown(event) {
    const key = event.key; //toLowerCase();

    if (graffitiCanvasOpen) { // if canvas isopen

      switch (key) {
        case "Backspace": // IE/Edge specific value
          currentTile.writing = currentTile.writing.slice(0, -1);
          break;
        case "Down": // IE/Edge specific value
        case "ArrowDown":
          // Do something for "down arrow" key press.
          break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
          // Do something for "up arrow" key press.
          break;
        case "Meta":
        case "Alt":
        case "Control":
        case "CapsLock":
          break;
        case "Tab":
          break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
          // Do something for "left arrow" key press.
          break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
          // Do something for "right arrow" key press.
          break;
        case "Enter":
          // Do something for "enter" or "return" key press.
          break;
        case "Shift":
          // Do something for "enter" or "return" key press.
          break;
        case "Esc": // IE/Edge specific value
        case "Escape":
          // Do something for "esc" key press.
          break;
        default:
          currentTile.writing += event.key; // add to the text
          return; // Quit when this doesn't handle the key event.
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);
}

function startPath() {
  if (graffitiCanvasOpen && inDrawCanvasCheck()) {
    isDrawing = true; // set isdrawing to true
    currentPath = []; // reset current path to an empty object
    currentTile['drawing'].push(currentPath); // push the current path to the drawing object
  }
}

function endPath() {
  isDrawing = false; // set isdrawing to false
}

function captureDrawing() {
  if (isDrawing) { // if person isdrawing
    if (inDrawCanvasCheck()) { // and person isdrawing in the canvas
      let point = { // grab the x and y of each point
        x: mouseX,
        y: mouseY
      };
      currentPath.push(point); // push that x and y into the currentpath array
    }
  }
}

function drawTile(tile) {
  push();
  strokeWeight(0);
  //stroke(DBLUE);
  if (tile.taken) {
    fill('green');
  } else if (tile.writing != "" || tile.drawing.length > 0) {
    fill(DBLUE);
  } else {
    fill(255, 70);
  }
  rect(tile.position.x, tile.position.y, tile.width, tile.height);
  pop();
}

function drawTileDrawing(tile, scaleFactor, translateX, translateY) {
  push();
  scale(scaleFactor, scaleFactor);
  translate(translateX, translateY);
  stroke('black');
  noFill();
  strokeWeight(1);

  let drawing = tile['drawing'];
  for (let i = 0; i < drawing.length; i++) { // foreach path in the drawing
    let path = drawing[i]; // grab the next path
    if (typeof(path) !== 'undefined') {
      beginShape(); // draw
      for (let j = 0; j < path.length; j++) { // for each coordinate in the path
        vertex(path[j].x, path[j].y); // mark each vertex and draw a line between
      }
      endShape();
    }
  }
  pop();
}

function drawTileWriting(tile, scaleFactor, x, y, w, h) {
  push();
  noStroke();
  fill('black');
  textSize(43);
  scale(scaleFactor, scaleFactor);
  text(tile['writing'], x, y, w, h);
  pop();
}

function highlightOpen(x, y, w, h) {
  push();
  stroke(40);
  fill('yellow');
  rect(x, y, w, h);
  pop();
}

function graffitiTools() {
  let toolSpacer = 10;
  for (const tool in toolButtons) {
    let btn = toolButtons[tool]
    if (btn.select == true) {
      fill(activeToolColor);
    } else {
      fill(inactiveToolColor)
    }
    rect(btn.x, btn.y, btn.width, btn.height);
    push();
    noStroke();
    fill('white');
    textAlign(CENTER);
    textSize(12);
    // let earlyTime = (new Date()).getTime();
    text(btn.text, btn.x, btn.y, btn.width, btn.height);
    // console.count("text");
    // let lateTime = (new Date()).getTime();
    // let diffTime = earlyTime - lateTime;
    // console.log(diffTime);
    pop();
  }
}

function displayLargeTileGraffiti() {
  if (graffitiCanvasOpen) {
    let tile = tiles[currentTile.tile];
    drawTileDrawing(tile, 1.0, 0, 0); // draw it BIG
    drawTileWriting(tile, 1.0, graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);
  }
}

function displaySmallTileGraffiti() {
  for (const tileId in tiles) {
    let tile = tiles[tileId];
    // why does this translate work??
    let drawtranslateX = tile.position.x / SCALEFACTOR - graffitiCanvasX;
    let drawtranslateY = tile.position.y / SCALEFACTOR - graffitiCanvasY;
    let writetranslateX = tile.position.x / SCALEFACTOR;
    let writetranslateY = tile.position.y / SCALEFACTOR;
    let translateWidth = tile.width / SCALEFACTOR;
    let translateHeight = tile.height / SCALEFACTOR;
    drawTile(tile); // draw the actual tile rect
    if (tile['writing'] !== []) { // if not empty
      drawTileDrawing(tile, SCALEFACTOR, drawtranslateX, drawtranslateY);
      drawTileWriting(tile, SCALEFACTOR, writetranslateX, writetranslateY, translateWidth, translateHeight);
    }
  }
}

function detectMouseOnTile() { // returns undefined when not clicking on a tile
  for (const tileId in tiles) { // for each tile
    let tile = tiles[tileId] // grab the ID
    if (mouseX > tile['position']['x'] && mouseX < tile['position']['x'] + tile['width'] && mouseY > tile['position']['y'] && mouseY < tile['position']['y'] + tile['height']) {
      // myAudio.play();
      return tiles[tileId]; // check if mouse is over it -> if yes, return that tile (can i just return tile?)
    }
  }
}

function saveTile(tile) {
  let id = tile['tile']; // grab the tile id
  if (tile['firebaseKey'] === null) { // CREATE a new entry in the database
    let ref = database.ref('graffitiWall'); // make a new reference to the graffitiWall database
    let result = ref.push(tile, dataSent); // push the data to the ref created above
    tiles[id]['firebaseKey'] = result.key;
  } else { // already exists in the database, so UPDATE the entry in the database
    let ref = database.ref('graffitiWall/' + tile['firebaseKey']);
    ref.update(tile);
  }
}

function clearTile() {
  currentTile.drawing = [];
  currentTile.writing = "";
}

function detectMouseOnTool() {
  for (const tool in toolButtons) {
    let btn = toolButtons[tool]
    if (mouseX > btn.x && mouseX < btn.x + btn.width && mouseY > btn.y && mouseY < btn.y + btn.height) {
      console.log(`clicked on ${btn}`);
      btn.select = true;
    } else {
      btn.select = false;
    }
  }
  if (toolButtons.clear.select) {
    clearTile();
    // } else if (toolButtons.write.select) {
    //   textInputBox.show();
    //   textInputBox.value(currentTile.writing);
    // } else if (toolButtons.draw.select) {
    //   textInputBox.hide();
    // } else if (toolButtons.save.select) {
    //   saveTile(currentTile);
  }
}

function toggleGraffitiCanvas() { // open and close canvas
  const openedTile = currentTile; // grab the "current tile"
  let tile = detectMouseOnTile(); // grab mouse location (over which tile?)
  if (typeof(tile) !== 'undefined') { // if the mouse is actually clicking on a tile
    if (graffitiCanvasOpen) { //  if canvas is open (is being closed)
      openedTile['taken'] = false; //  the opened tile should no longer be "taken" (reserved)
      saveTile(openedTile); // save the opened tile
      // textInputBox.hide();
      graffitiCanvasOpen = !graffitiCanvasOpen; // toggle canvas

    } else { // if the canvas is closed (is being opened)
      currentTile = tile // update "current tile" to the tile that was clicked
      if (tile.taken === false) { // if the tile is not currently taken
        tile['taken'] = true; // "take" (reserve) the tile
        saveTile(tile);
      }
      graffitiCanvasOpen = !graffitiCanvasOpen; // toggle canvas
    }
  }
}

function inDrawCanvasCheck() { // check if in the drawcanvas
  if (mouseX > graffitiCanvasX && mouseX < graffitiCanvasX + graffitiCanvasW && mouseY > graffitiCanvasY && mouseY < graffitiCanvasY + graffitiCanvasH) {
    return true;
  } else {
    return false;
  }
}

function draw3dTiles(){
  let canvasTop = -windowHeight/3.8;
  let canvasLeft = -windowWidth/3.5;
  for (let i = 0; i < 10; i++) { // draw one column
   push();
   let y = canvasTop + (i * 25);
   rotateY(.6);
   translate(canvasLeft, y, 0);
   plane(30, 20);
   pop();
   for (let u = 0; u < 5; u++) { // draw a row for each column
     push();
     let x = canvasLeft + (u * 35);
     rotateY(.6);
     translate(x, y, 0);
     plane(30, 20);
     pop();
   }
 }
}

function draw3dTileRoom() {
  push();
    draw3dTiles();
    rotateY(PI/1.6); // something funny here with the rotate adding together
    draw3dTiles();
    pop();
  }



function drawGraffitiCanvas() {
  push();
  stroke('black');
  strokeWeight(3);
  // noStroke();

  fill(255, 255, 250);
  rect(graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);
  pop();
}

function toiletDraw() {
  normalMaterial();
  background('grey');

  // push();
  // texture(toilet1);
  // plane(600, 400);
  // pop();
  // image(toilet1, -windowWidth/2.5, -windowHeight/2);
  displaySmallTileGraffiti(); // show the drawing
  // image(tp1, 670, 240);
  // image(tp1, 0, 0);

  // draw3dTileRoom();

  if (graffitiCanvasOpen) { // if canvas is open
    noFill(); // don't fill the draw stroke
    highlightOpen(currentTile.position.x, currentTile.position.y, currentTile.width, currentTile.height);
    drawGraffitiCanvas();
    graffitiTools();
    displayLargeTileGraffiti(); // show the drawing
    captureDrawing();
  }
}

function mirrorDraw() {

}

function sinkDraw() {

}

function draw() {
  translate(-width / 2, -height / 2, 0);
  if (scene == 'toilet') {
    toiletDraw();
  } else if (scene == 'mirror') {
    mirrorDraw();
  } else if (scene == 'sink') {
    sinkDraw();
  } else if (scene == 'end') {
    endDraw();
  }
}

// integrate buildmap into tilemap
function buildMap(data) {
  let graffitiWall = data.val(); // grab all database entries
  let keys = graffitiWall ? Object.keys(graffitiWall) : []; // grab keys - if keys isn't empty
  for (let i = 0; i < keys.length; i++) { // for each key
    let key = keys[i]; // grab the key
    let tileId = graffitiWall[key]['tile']; // grab the tileID
    if (tileId !== currentTile.tile) { // do the updates
      tiles[tileId]['firebaseKey'] = key;
      tiles[tileId]['drawing'] = graffitiWall[key]['drawing'] || [];
      tiles[tileId]['writing'] = graffitiWall[key]['writing'] || "";
      tiles[tileId]['taken'] = graffitiWall[key]['taken'] || false;
    }
  }
}

//CALLBACK
function gotData(data) {
  buildMap(data);
  // if anything changes in the database, update my tilemap
}

function errData(err) { // show me the errors
  console.log(err);
}

window.addEventListener("beforeunload", function(event) {
  currentTile['taken'] = false;
  saveTile(currentTile);
});
