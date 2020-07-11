let database;
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
let penSelect = false;
let paintSelect = false;
let currentPath = []; // (ARRAY WHERE THE CURRENT DRAWING IS BEING STORED)
let tileId = 1;
let clickOnButton = false;
let isDrawing = false;
let graffitiCanvasToggle = false;
let grafittiCanvasW = 500;
let grafittiCanvasH = 300;
let grafittiCanvasX = 150;
let grafittiCanvasY = 50;
let canvasToolsVisible = false;
const SCALEFACTOR = 0.145;
let penSelectButton = {
  'x': grafittiCanvasX + grafittiCanvasW + toolSpacer,
  'y': grafittiCanvasY,
  'width': toolWidth,
  'height': toolWidth,
};
let paintSelectButton = {
  'x': grafittiCanvasX + grafittiCanvasW + toolSpacer,
  'y': grafittiCanvasY + toolWidth + toolSpacer,
  'width': toolWidth,
  'height': toolWidth,
};
let tiles = {
  1: {
    'writing': '',
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
    'writing': '',
    'drawing': [],
    'tile': 2,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 100
    }
  },
  3: {
    'writing': '',
    'drawing': [],
    'tile': 3,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 150
    }
  },
  4: {
    'writing': '',
    'drawing': [],
    'tile': 4,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 200
    }
  },
  5: {
    'writing': '',
    'drawing': [],
    'tile': 5,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 250
    }
  },
  6: {
    'writing': '',
    'drawing': [],
    'tile': 6,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 300
    }
  },
  7: {
    'writing': '',
    'drawing': [],
    'tile': 7,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 350
    }
  },
  8: {
    'writing': '',
    'drawing': [],
    'tile': 8,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 400
    }
  },
  9 : {
    'writing': '',
    'drawing': [],
    'tile': 9,
    'firebaseKey': null,
    'width': 70,
    'height': 40,
    'position': {
      'x': 55,
      'y': 500
    }
  }
};
let currentTile = tiles[1];

let bg;

function setup() {
  bg = loadImage('img/toilet2.png');
  canvas = createCanvas(900, 617);
  textInputBox = createElement('textarea'); // make input for text
  textInputBox.addClass('input');
  textInputBox.input(updateWriting);
  textInputBox.position(grafittiCanvasX + 50, grafittiCanvasY + 50);
  textInputBox.hide();
  // textInputBox.elt.addEventListener('keyup', updateWriting);
  // textInputBox.maxlength = 5; // doesn't work :(

  // toilet thoughts - give the next person something to consider? what do you wish you could tell your younger self? what do you want to tell the next person in this bathroom
  // wordBox = createElement('h2', '');

  var myAudio = document.createElement('audio');
  if (myAudio.canPlayType('audio/mpeg')) {
    myAudio.setAttribute('src', 'audio/song.mp3');
  }

  function mouseFunctions() {
    toggleAndSaveGrafittiCanvas();
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
  if (tile.firebaseKey != null) { // show tile availabitity by color
    fill(DBLUE);
  } else {
    fill('white');
  }
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

function drawTileWriting(tile, scaleFactor, translateX, translateY){
  push();
  textAlign(CENTER, CENTER);
//  rectMode(CORNER);
  //scale(scaleFactor, scaleFactor);
  //translate(translateX, translateY);
  // text('a', 0, 0, 100, 100);
  text(tile.writing, tile.position.x, tile.position.y, tile.width, tile.height);
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
  push(); // rect push
  if (penSelect == true) {
    fill(activeToolColor);
    rect(penSelectButton.x, penSelectButton.y, penSelectButton.width, penSelectButton.height);
    fill(inactiveToolColor);
    rect(paintSelectButton.x, paintSelectButton.y, paintSelectButton.width, paintSelectButton.width);
  } else if (paintSelect == true) {
    fill(activeToolColor);
    rect(paintSelectButton.x, paintSelectButton.y, paintSelectButton.width, paintSelectButton.width);
    fill(inactiveToolColor);
    rect(penSelectButton.x, penSelectButton.y, penSelectButton.width, penSelectButton.height);
  } else {
    fill(inactiveToolColor);
    rect(paintSelectButton.x, paintSelectButton.y, paintSelectButton.width, paintSelectButton.width);
    rect(penSelectButton.x, penSelectButton.y, penSelectButton.width, penSelectButton.height);
  }

  pop(); // rect pop
  push(); // text style push
  noStroke();
  fill('white');
  textAlign(CENTER);
  textSize(12);
  text('write', penSelectButton.x, penSelectButton.y, penSelectButton.width, penSelectButton.width);
  text('draw', paintSelectButton.x, paintSelectButton.y, paintSelectButton.width, paintSelectButton.width);
  pop(); // text style pop
}

function displayTileGrafitti() {
  for (const tileId in tiles) {
    let tile = tiles[tileId];
    // why does this translate work??
    let translateX = tile.position.x / SCALEFACTOR - grafittiCanvasX;
    let translateY = tile.position.y / SCALEFACTOR - grafittiCanvasY;
    drawTile(tile); // draw the actual tile rect
    if(graffitiCanvasToggle && currentTile.tile == tileId) {
      drawTileDrawing(tile, 1.0, 0, 0); // draw it BIG
    }
    drawTileDrawing(tile, SCALEFACTOR, translateX, translateY);
    drawTileWriting(tile, SCALEFACTOR, translateX, translateY);
  }
}

function detectMouseOnTile() {
  for (const tileId in tiles) { // for each tile
    let tile = tiles[tileId] // grab the ID
    if (mouseX > tile['position']['x'] && mouseX < tile['position']['x'] + tile['width'] && mouseY > tile['position']['y'] && mouseY < tile['position']['y'] + tile['height']) {
      // myAudio.play();
      clickOnButton = true;
      return tiles[tileId]; // check if mouse is over it -> if yes, return that tile (can i just return tile?)
    }
  }
  clickOnButton = false;
}

function detectMouseOnTool() {
  if (mouseX > penSelectButton.x && mouseX < penSelectButton.x + penSelectButton.width && mouseY > penSelectButton.y && mouseY < penSelectButton.y + penSelectButton.height) {
    penSelect = true;
    // highlightOpen(penSelect.x, penSelect.y, penSelect.width, penSelect.width)
    paintSelect = false;
    textInputBox.show();
    textInputBox.value(currentTile.writing);
  } else if (mouseX > paintSelectButton.x && mouseX < paintSelectButton.x + toolWidth && mouseY > paintSelectButton.y && mouseY < paintSelectButton.y + toolWidth) {
    penSelect = false;
    paintSelect = true;
    textInputBox.hide();
  } else {
    penSelect = false;
    paintSelect = false;

  }
}

function toggleAndSaveGrafittiCanvas() {
  let tile = detectMouseOnTile(); // grab mouse location (over which tile?)
  if (clickOnButton) {
    if (graffitiCanvasToggle) { // if drawcanvas is open
      saveDrawing(tile); // save to specific tile
      textInputBox.hide();
    } else { // if drawcanvas is closed
      currentTile = tile //update currenttile
    }
    graffitiCanvasToggle = !graffitiCanvasToggle; // toggle canvas
  }
  clickOnButton = false;
}

function inDrawCanvasCheck() { // check if in the drawcanvas
  if (mouseX > grafittiCanvasX && mouseX < grafittiCanvasX + grafittiCanvasW && mouseY > grafittiCanvasY && mouseY < grafittiCanvasY + grafittiCanvasH) {
    return true;
  } else {
    return false;
  }
}

function displayGrafittiCanvas() {
  push();
  // fill('255, 50');
  stroke('black');
  strokeWeight(3);
  rect(grafittiCanvasX, grafittiCanvasY, grafittiCanvasW, grafittiCanvasH);
  noStroke();
  fill('black');
  textSize(22);
  text(currentTile.writing, grafittiCanvasX, grafittiCanvasY, grafittiCanvasW, grafittiCanvasH);
  pop();
}


function updateWriting(event) { // anytime there is input
  currentTile.writing = textInputBox.value() // add the typed letters to currtile.writing
}

function draw() {
  background(bg);
  noFill(); // don't fill the draw stroke

  if (graffitiCanvasToggle) { // if canvas is open
    highlightOpen(currentTile.position.x, currentTile.position.y, currentTile.width, currentTile.height);
    displayGrafittiCanvas();
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

  displayTileGrafitti(); // show the drawing
}

function saveDrawing(tile) {
  let id = tile['tile']; // grab the tile id
  if (tiles[id]['drawing'].length > 0 || tiles[id]['writing'] != "") { // if the drawing is not nothing
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
    tiles[tileId]['drawing'] = graffitiWall[key]['drawing'] || [];
    tiles[tileId]['writing'] = graffitiWall[key]['writing'] || "";
    // console.log(tiles[tileId]['writing']);

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


function clearDrawing() {
  tiles[currentTile]['drawing'] = [];
}
