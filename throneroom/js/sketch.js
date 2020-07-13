let database;
let scene = 'toilet';
let activeToolColor = 'green';
let inactiveToolColor = 'grey'
let DBLUE = '#a5c7da';
let LBLUE = '#f0fafc';
let LPINK = '#fb9c96';
let DPINK = '#f1635a';
let writing;
let textInputBox;
let toolWidth = 40;
let toolSpacer = 10;
// let writeToolSelect = false;
// let drawToolSelect = false;
let currentPath = []; // (ARRAY WHERE THE CURRENT DRAWING IS BEING STORED)
let tileId = 1;
let isDrawing = false;
let graffitiCanvasToggle = false;
let graffitiCanvasW = 440;
let graffitiCanvasH = 280;
let graffitiCanvasX = 200;
let graffitiCanvasY = 50;
let canvasToolsVisible = false;
const SCALEFACTOR = 0.145;

let toolButtons = {
  write: {
    'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
    'y': graffitiCanvasY,
    'width': toolWidth,
    'height': toolWidth,
    'text': 'write',
    'select': false
  },
  draw: {
    'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
    'y': graffitiCanvasY + toolWidth + toolSpacer,
    'width': toolWidth,
    'height': toolWidth,
    'text': 'draw',
    'select': false
  },
  clear: {
    'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
    'y': graffitiCanvasY + (toolWidth * 2) + (toolSpacer * 2),
    'width': toolWidth,
    'height': toolWidth,
    'text': 'clear',
    'select': false
  },
  save: {
    'x': graffitiCanvasX + graffitiCanvasW + toolSpacer,
    'y': graffitiCanvasY + (toolWidth * 3) + (toolSpacer * 3),
    'width': toolWidth,
    'height': toolWidth,
    'text': 'save',
    'select': false
  }
};

let currentTile = tiles[1];

let toilet1;
let toilet2;
let tp1;
let tp2;

// don't delete me
function dataSent(data, err) {}

function preload() {
  toilet1 = loadImage('img/toilet1.png');
  toilet2 = loadImage('img/toilet2.png');
  tp1 = loadImage('img/tp1.png');
  tp2 = loadImage('img/tp2.png');
}

function setup() {


  canvas = createCanvas(900, 617);
  textInputBox = createElement('textarea'); // make input for text
  textInputBox.addClass('input');
  textInputBox.input(updateWriting);
  textInputBox.position(graffitiCanvasX, graffitiCanvasY);
  textInputBox.hide();
  // textInputBox.maxlength = 5; // doesn't work :(

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
  // canvas = createCanvas(windowWidth, windowHeight);
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
}

function startPath() {
  if (graffitiCanvasToggle && inDrawCanvasCheck()) {
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
  stroke(DBLUE);
  if(tile.taken) {
    fill('green');
  } else if(tile.writing != "" || tile.drawing.length > 0) {
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
  strokeWeight(5);

  let drawing = tile['drawing'];
  for (let i = 0; i < drawing.length; i++) { // foreach path in the drawing
    let path = drawing[i]; // grab the next path
    if(typeof(path) !== 'undefined') {
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
  textFont('monospace');
  scale(scaleFactor, scaleFactor);
  // translate(translateX, translateY);
  text(tile['writing'], x, y, w, h);

  // text(currentTile.writing, graffitiCanvasX + 50, graffitiCanvasY + 50, graffitiCanvasW - 100, graffitiCanvasH - 100);

  pop();
}

function highlightOpen(x, y, w, h) {
  push();
  stroke(40);
  stroke('red');
  // fill('yellow');
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
    text(btn.text, btn.x, btn.y, btn.width, btn.height);
    pop();
  }
}

function displayTileGraffiti() {
  for (const tileId in tiles) {
    let tile = tiles[tileId];
    // why does this translate work??
    let translateX = tile.position.x / SCALEFACTOR - graffitiCanvasX;
    let translateY = tile.position.y / SCALEFACTOR - graffitiCanvasY;
    let translateX2 = tile.position.x / SCALEFACTOR;
    let translateY2 = tile.position.y / SCALEFACTOR;
    let translateWidth = tile.width / SCALEFACTOR;
    let translateHeight = tile.height / SCALEFACTOR;

    drawTile(tile); // draw the actual tile rect
    if (graffitiCanvasToggle && currentTile.tile == tileId) {
      drawTileDrawing(tile, 1.0, 0, 0); // draw it BIG
      drawTileWriting(tile, 1.0, graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);

    }
    drawTileDrawing(tile, SCALEFACTOR, translateX, translateY);
    drawTileWriting(tile, SCALEFACTOR, translateX2, translateY2, translateWidth, translateHeight);
  }
}

// returns undefined when not clicking on a tile
function detectMouseOnTile() {
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

  if(tile['firebaseKey'] === null) {
    // firebaseKey is null, therefore we need to CREATE a new entry in the database.
    let ref = database.ref('graffitiWall'); // make a new reference to the graffitiWall database
    let result = ref.push(tile, dataSent); // push the data to the ref we created above
    tiles[id]['firebaseKey'] = result.key;
  } else {
    // firebaseKey is not null, so this already exists in the database
    // therefore we need to UPDATE the entry in the database.
    let ref = database.ref('graffitiWall/' + tile['firebaseKey']);
    ref.update(tile);
  }
}

function clearTile() {
  textInputBox.value("");
  currentTile.drawing = [];
  currentTile.writing = [""];
}

function detectMouseOnTool() {
  for (const tool in toolButtons) {
    let btn = toolButtons[tool]
    if (mouseX > btn.x && mouseX < btn.x + btn.width && mouseY > btn.y && mouseY < btn.y + btn.height) {
      console.log(`clicked on ${btn}`);
      btn.select = true;
      //can I set all all other buttons false
    } else {
      btn.select = false;
    }
  }

  if (toolButtons.write.select) {
    textInputBox.show();
    textInputBox.value(currentTile.writing);
  } else if (toolButtons.draw.select) {
    textInputBox.hide();
  } else if (toolButtons.clear.select) {
    clearTile();
  } else if (toolButtons.save.select) {
    saveTile(currentTile);
  }
}

function toggleGraffitiCanvas() {
  const openedTile = currentTile;
  let tile = detectMouseOnTile(); // grab mouse location (over which tile?)
  if (typeof(tile) !== 'undefined') {
    if (graffitiCanvasToggle) { // if drawcanvas is open
      openedTile['taken'] = false;
      saveTile(openedTile); // save to specific tile
      textInputBox.hide();
      graffitiCanvasToggle = !graffitiCanvasToggle; // toggle canvas
    } else { // if drawcanvas is closed
      currentTile = tile //update currenttile
      if(tile.taken === false) {
        // "take" the tiles
        tile['taken'] = true;
        saveTile(tile);
        graffitiCanvasToggle = !graffitiCanvasToggle; // toggle canvas
      }
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

function drawGraffitiCanvas() {
  push();
  fill('255, 50');
  stroke('black');
  strokeWeight(3);
  rect(graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);

  // noStroke();
  // fill('black');
  // textSize(43);
  // textFont('monospace');
  // text(currentTile.writing, graffitiCanvasX + 50, graffitiCanvasY + 50, graffitiCanvasW - 100, graffitiCanvasH - 100);



  pop();
}

function updateWriting(event) { // anytime there is input
  currentTile.writing = textInputBox.value() // add the typed letters to currtile.writing
}

function toiletDraw() {
  background(toilet1);
  image(tp1, 670, 240);

  noFill(); // don't fill the draw stroke

  if (graffitiCanvasToggle) { // if canvas is open
    highlightOpen(currentTile.position.x, currentTile.position.y, currentTile.width, currentTile.height);
    drawGraffitiCanvas();
    graffitiTools();

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
  displayTileGraffiti(); // show the drawing

}

function mirrorDraw() {

}

function sinkDraw() {

}

function draw() {
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


  // clear the listing?
  // let elts = selectAll('.listing'); // grab all (all what?)
  // for (let i = 0; i < elts.length; i++) { // foreach
  // elts[i].remove(); // remove dom elements
  // }

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

window.addEventListener("beforeunload", function(event) {
  updateTileTaken(currentTile, false);
});


// function showDrawing(key) { //show drawing
//   if (key instanceof MouseEvent) { // if the key passed into showdrawing is a mouseevent
//     key = key.target.innerHTML; // set key to this.html?
//   }
//   var theTileId;
//   for (const tileId in tiles) { // for each tile
//     let tile = tiles[tileId]; // grab the id
//     if (tile.firebaseKey === key) {
//       theTileId = tileId;
//     }
//   }
//   currentTile = tiles[theTileId];
//   drawCanvasToggle = true;
// }
