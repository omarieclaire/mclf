let database;
let writing;
let input, writeButton, wordBox;
let currentPath = []; // (ARRAY WHERE THE CURRENT DRAWING IS BEING STORED)
let tileId = 1;
let clickOnButton = false;
let isDrawing = false;
let drawCanvasToggle = false;
let drawCanvasW = 500;
let drawCanvasH = 300;
let drawCanvasX = 150;
let drawCanvasY = 50;
let canvasToolsVisible = false;
const SCALEFACTOR = 0.145;
let tiles = {
  1: {
    'writing': 'writing',
    'drawing': [],
    'tile': 1,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 50
    }
  },
  2: {
    'writing': 'writing',
    'drawing': [],
    'tile': 2,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 100
    }
  }
};
let currentTile = tiles[1];

let bg;


// audio setup
var myAudio = document.createElement('audio');
if (myAudio.canPlayType('audio/mpeg')) {
  myAudio.setAttribute('src', 'audio/song.mp3');
}


function setup() {
  bg = loadImage('img/toilet2.png');
  canvas = createCanvas(900, 617);

  input = createInput(); // make input for text
  writeButton = createButton('toilet thoughts'); // make button for submitting text
// toilet thoughts - give the next person something to consider
// what do you wish you could tell your younger self?
// what do you want to tell the next person in this bathroom
  writeButton.mousePressed(printText);
  wordBox = createElement('h2', '');

  textAlign(CENTER);
  textSize(50);

  function toggleDrawCanvasAndStartPath() {
    toggleDrawCanvas();
    startPath(); // when mouse is PRESSED, START COLLECTING X AND Y POINTS
  }

  canvas.mousePressed(toggleDrawCanvasAndStartPath);
  // canvas = createCanvas(windowWidth, windowHeight);
  //canvas.mousePressed(startPath);
  canvas.parent('canvascontainer'); //SET THE PARENT OF THE CANVAS TO THE CANVAS CONTAINER?
  canvas.mouseReleased(endPath); // WHEN THE MOUSE IS RELEASED, stop COLLECTING X AND Y POINTS

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
  var params = getURLParams(); // get URL params for permalink
  if (params.id) {
    showDrawing(params.id);
  }

  var ref = database.ref('graffitiWall'); // get the graffitiWall
  ref.on('value', gotData, errData); // trigger this anytime anything is changed in the database (err is in case of error)
  ref.once('value', buildMap, errData); // buildMap at the start
}


function startPath() {
  if (drawCanvasToggle && inDrawCanvasCheck()) {
    isDrawing = true; // set isdrawing to true
    currentPath = []; // reset current path to an empty object
    currentTile['drawing'].push(currentPath); // push the current path to the drawing object
  }
}

function endPath() {
  isDrawing = false; // set isdrawing to false
}

function drawTile(tile) {
  push();
  // fill();
  strokeWeight(.25);
  stroke('white');
  fill('none');
  rect(tile.position.x, tile.position.y, tile.width, tile.height);
  pop();
}

function drawTileDrawing(tile, scaleFactor, translateX, translateY) {
  push();
  scale(scaleFactor, scaleFactor);
  translate(translateX, translateY);

  let drawing = tile['drawing'];
  for (let i = 0; i < drawing.length; i++) { // foreach path in the drawing
    let path = drawing[i]; // grab the next path
    beginShape(); // draw
    for (let j = 0; j < path.length; j++) { // for each coordinate in the path
      vertex(path[j].x, path[j].y); // mark each vertex and draw a line between
    }
    endShape();
  }
  pop();
}

function displayDrawing() {
  for (const tileId in tiles) {
    let tile = tiles[tileId];
    // why does this work??
    let translateX = tile.position.x / SCALEFACTOR - drawCanvasX;
    let translateY = tile.position.y / SCALEFACTOR - drawCanvasY;
    drawTile(tile);
    if (!drawCanvasToggle) { // if the canvas is closed
      drawTileDrawing(tile, SCALEFACTOR, translateX, translateY);
    } else {
      if (currentTile.tile == tileId) { // if the current tile is open
        drawTileDrawing(tile, 1.0, 0, 0); // draw it BIG
        drawTileDrawing(tile, SCALEFACTOR, translateX, translateY); // draw each other tile drawing scaled down
      } else {
        drawTileDrawing(tile, SCALEFACTOR, translateX, translateY); // draw each other tile drawing scaled down
      }
    }
  }
}

function toggleCanvasToolsVisibility() {
  if (canvasToolsVisible) {
    input.hide();
    writeButton.hide();
    wordBox.hide();
  } else {
    input.show();
    writeButton.show();
    wordBox.show();
  }
  canvasToolsVisible = !canvasToolsVisible
}

function detectMouseLocation() {
  for (const tileId in tiles) { // for each tile
    let tile = tiles[tileId] // grab the ID
    if (mouseX > tile['position']['x'] && mouseX < tile['position']['x'] + tile['width'] && mouseY > tile['position']['y'] && mouseY < tile['position']['y'] + tile['height']) {
      myAudio.play();
      clickOnButton = true;
      return tiles[tileId]; // check if mouse is over it -> if yes, return that tile (can i just return tile?)
    }
  }
  clickOnButton = false;
}

function toggleDrawCanvas() {
  let tile = detectMouseLocation(); // grab mouse location (over which tile?)
  if (clickOnButton) {
    toggleCanvasToolsVisibility();
    if (drawCanvasToggle) { // if drawcanvas is open
      saveDrawing(tile); // save to specific tile
    } else { // if drawcanvas is closed
      currentTile = tile //update currenttile
    }
    drawCanvasToggle = !drawCanvasToggle; // toggle canvas
  }
  clickOnButton = false;
}

function inDrawCanvasCheck() { // check if in the drawcanvas
  if (mouseX > drawCanvasX && mouseX < drawCanvasX + drawCanvasW && mouseY > drawCanvasY && mouseY < drawCanvasY + drawCanvasH) {
    return true;
  } else {
    return false;
  }
}

function displayDrawCanvas() {
  push();
  fill('white');
  stroke('black');
  strokeWeight(3);
  rect(drawCanvasX, drawCanvasY, drawCanvasW, drawCanvasH);
  pop();

  input.position(drawCanvasX + 10, drawCanvasY + 10);
  writeButton.position(input.x + input.width, drawCanvasY + 10);
  wordBox.position(drawCanvasX + drawCanvasW / 2, drawCanvasY + drawCanvasY / 2);

}

// ahref.addEventListener('click', showDrawing);
// tile.mousePressed(toggleDrawCanvas); // when mouse is pressed on tile togl draw canvas


function highlightActiveTile() {
  push();
  stroke(40);
  stroke('blue');
  rect(currentTile.position.x, currentTile.position.y, currentTile.width, currentTile.height);
  pop();
}

function printText() {
  const words = input.value();
  wordBox.html(words);
  currentTile.writing = words;
  input.value('');
}

function draw() {
  background(bg);
  if (drawCanvasToggle) { // if canvas is open
    highlightActiveTile();
    displayDrawCanvas();
    if (isDrawing) { // if person isdrawing
      if (inDrawCanvasCheck()) { // and person isdrawing in the canvas
        let point = { // grab the x and y of each point
          x: mouseX,
          y: mouseY
        };
        currentPath.push(point); // push that x and y into the currentpath array
      }
    }
    noFill(); // don't fill the draw stroke
  }

  displayDrawing(); // show the drawing
}

function saveDrawing(tile) {
  let id = tile['tile']; // grab the tile id
  if (tiles[id]['drawing'].length > 0) { // if the drawing is not nothing
    let ref = database.ref('graffitiWall'); // make a new reference to the graffitiWall database
    function dataSent(err, status) {}
    if (tiles[id]['firebaseKey'] == null) {
      let result = ref.push(tile, dataSent); // push the data to the ref we created above
      tiles[id]['firebaseKey'] = result.key;
    }
  }
}

// integrate buildmap into tilemap
function buildMap(data) {
  let graffitiWall = data.val(); // grab all database entries
  let keys = graffitiWall ? Object.keys(graffitiWall) : []; // grab keys - if keys isn't empty
  for (let i = 0; i < keys.length; i++) { // for each key
    let key = keys[i]; // grab the key
    let tileId = graffitiWall[key]['tile']; // grab the tileID
    tiles[tileId]['firebaseKey'] = key;
    tiles[tileId]['drawing'] = graffitiWall[key]['drawing'];
    tiles[tileId]['writing'] = graffitiWall[key]['writing'];

  }
}

//CALLBACK
function gotData(data) {
  // clear the listing?
  let elts = selectAll('.listing'); // grab all (all what?)
  for (let i = 0; i < elts.length; i++) { // foreach
    elts[i].remove(); // remove dom elements
  }

  // let graffitiWall = data.val(); // grab all graffitiWall from firebase
  // let keys = graffitiWall ? Object.keys(graffitiWall) : []; // if there are keys, grab them all
  // for (let i = 0; i < keys.length; i++) { // foreach
  // let key = keys[i]; // grab the key
  // let li = createElement('li', ''); // create li element
  // li.class('listing'); // give each the 'listing' class
  // let ahref = createA('#', key); // make a link element with the key in it
  // ahref.mousePressed(showDrawing); // CREATE AN EVENT CALLED SHOW DRAWING
  // var ahref = document.createElement('a');
  // ahref.setAttribute('href', '#');
  // ahref.addEventListener('click', showDrawing);
  // ahref.innerHTML = key;
  // ahref = new p5.Element(ahref);
  // ahref.parent(li);
  // let perma = createA('?id=' + key, 'permalink'); // set up permalink
  // perma.parent(li); // parent it to the list
  // perma.style('padding', '4px'); // style it
  // li.parent('drawinglist'); // parent it to the drawing list
  // }
}

function errData(err) { // show me the errors
  console.log(err);
}

function showDrawing(key) { //show drawing
  if (key instanceof MouseEvent) { // if the key passed into showdrawing is a mouseevent
    key = key.target.innerHTML; // set key to this.html?
  }
  var theTileId;
  for (const tileId in tiles) { // for each tile
    let tile = tiles[tileId]; // grab the id
    if (tile.firebaseKey === key) {
      theTileId = tileId;
    }
  }
  currentTile = tiles[theTileId];
  drawCanvasToggle = true;
}


function clearDrawing() {
  tiles[currentTile]['drawing'] = [];
}
