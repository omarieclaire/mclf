let database;
let writing;
let currentPath = []; // (ARRAY WHERE THE CURRENT DRAWING IS BEING STORED)
let tileId = 1;
let clickOnButton = false;
let isDrawing = false;
let drawCanvasToggle = false;
let drawCanvasW = 500;
let drawCanvasH = 300;
let drawCanvasX = 150;
let drawCanvasY = 50;
let tiles = {
  1: {
    'writing': 'writing',
    'drawing': [],
    'tile': 1,
    'firebaseKey' : null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 10,
      'y': 50
    }
  },
  2: {
    'writing': 'writing',
    'drawing': [],
    'tile': 2,
    'firebaseKey' : null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 10,
      'y': 100
    }
  }
};
let currentTile = tiles[1];

let bg;

function setup() {
  bg = loadImage('img/toilet2.png');
  canvas = createCanvas(800, 517);
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
  var params = getURLParams();  // get URL params for permalink
  if (params.id) {
    showDrawing(params.id);
  }

  var ref = database.ref('drawings'); // get the drawings
  ref.on('value', gotData, errData); // trigger this anytime anything is changed in the database (err is in case of error)
  ref.once('value', buildMap, errData);  // buildMap at the start
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

function drawTile(tile){
  push();
  stroke('gray');
  fill('none');
  rect(tile.position.x, tile.position.y, tile.width, tile.height);
  pop();
}

function drawTileDrawing(tile, scaleFactor, translateX, translateY) {
  push();
  translate(translateX, translateY);
  scale(scaleFactor, scaleFactor);
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
  for(const tileId in tiles) {
    let tile = tiles[tileId];
    drawTile(tile);
    if(!drawCanvasToggle) { // if the canvas is closed
      drawTileDrawing(tile, 0.2, -tile.position.x, -tile.position.y);
    } else {
      if(currentTile.tile == tileId) { // if the current tile is open
        drawTileDrawing(tile, 1.0, 0, 0);  // draw it BIG
      } else {
        drawTileDrawing(tile, 0.2, tile.position.x, tile.position.y); // draw each other tile drawing scaled down
      }
    }
  }
}

function detectMouseLocation() {
  for (const tileId in tiles) { // for each tile
    let tile = tiles[tileId] // grab the ID
    if (mouseX > tile['position']['x'] && mouseX < tile['position']['x'] + tile['width'] && mouseY > tile['position']['y'] && mouseY < tile['position']['y'] + tile['height']) {
      clickOnButton = true;
      return tiles[tileId]; // check if mouse is over it -> if yes, return that tile (can i just return tile?)
    }
  }
  clickOnButton = false;
}

function toggleDrawCanvas() {
  let tile = detectMouseLocation(); // grab mouse location (over which tile?)
  if (clickOnButton) {
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

function drawCanvas(){
  push();
  fill('white');
  stroke('black');
  strokeWeight(3);
  rect(drawCanvasX, drawCanvasY, drawCanvasW, drawCanvasH);
  pop();
}

// ahref.addEventListener('click', showDrawing);
// tile.mousePressed(toggleDrawCanvas); // when mouse is pressed on tile togl draw canvas


function highlightActiveTile(){
  // push();
  // stroke(40);
  // stroke('red');
  // fill('yellow');
  // rect(currentTile.position.x, currentTile.position.y, currentTile.width, currentTile.height);
  // pop();
}

function draw() {
  background(bg);

  // need to know when a click happens

// clickhandler on the canvas

  // if they are, toggleDrawCanvas

  if (drawCanvasToggle) { // if canvas is open
    highlightActiveTile();
    drawCanvas();
    if (isDrawing) {  // if person isdrawing
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
    let ref = database.ref('drawings'); // make a new reference to the drawings database
    function dataSent(err, status) {}
    if (tiles[id]['firebaseKey'] == null) {
      let result = ref.push(tile, dataSent); // push the data to the ref we created above
      tiles[id]['firebaseKey'] = result.key;
    }
  }
}

// integrate buildmap into tilemap
function buildMap(data) {
  let drawings = data.val(); // grab all database entries
  let keys = drawings ? Object.keys(drawings) : []; // grab keys - if keys isn't empty
  for (let i = 0; i < keys.length; i++) {  // for each key
    let key = keys[i]; // grab the key
    let tileId = drawings[key]['tile']; // grab the tileID
    tiles[tileId]['firebaseKey'] = key;
    tiles[tileId]['drawing'] = drawings[key]['drawing'];
  }
}

//CALLBACK
function gotData(data) {
  // clear the listing?
  let elts = selectAll('.listing'); // grab all (all what?)
  for (let i = 0; i < elts.length; i++) { // foreach
    elts[i].remove(); // remove dom elements
  }

  let drawings = data.val(); // grab all drawings from firebase
  let keys = drawings ? Object.keys(drawings) : []; // if there are keys, grab them all
  for (let i = 0; i < keys.length; i++) { // foreach
    let key = keys[i]; // grab the key
    let li = createElement('li', ''); // create li element
    li.class('listing'); // give each the 'listing' class
    // let ahref = createA('#', key); // make a link element with the key in it
    // ahref.mousePressed(showDrawing); // CREATE AN EVENT CALLED SHOW DRAWING
    var ahref = document.createElement('a');
    ahref.setAttribute('href', '#');
    ahref.addEventListener('click', showDrawing);
    ahref.innerHTML = key;
    ahref = new p5.Element(ahref);
    ahref.parent(li);
    let perma = createA('?id=' + key, 'permalink'); // set up permalink
    perma.parent(li); // parent it to the list
    perma.style('padding', '4px'); // style it
    li.parent('drawinglist'); // parent it to the drawing list
  }
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
  tiles['1']['drawing'] = [];
}
