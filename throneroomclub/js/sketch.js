let database;
let screenOrientation;

let canvasWidth;
let canvasHeight;

let standardTimer = 3000; //3000;

let currentColor = 'black';
let currentAngle = '1';
let scene = 'preline';
let bathroomLineUpTime = 10;
let toiletPaperTile;

let DBLUE = '#64afd9';
let LBLUE = '#defaff';
let MBLUE = '#a9e8f5';
let LPINK = '#fb9c96';
let DPINK = '#f1635a';
let PURPLE = '#b25dff';
let LYELLOW = '#ffd183';
let DYELLOW = '#ffa304';
let LPEACH = '#ffcfb3';
let DPEACH = '#ffb48a';

let PBLUE = '#02b0ef';
let PPINK = '#fc11a2';
let PPEACH = '#fe574c';
let PPURPLE = '#7f00cb';
let PYELLOW = '#ec8902';
let PORANGE = '#ff5806';
let PGREEN = '#07ef02';
let PTURQ = '#04c9b9';

let sceneSwitchArrowViz = false;
let sceneSwitchArrowVizHover = false;
let writtenMessageViz = false;

let turnaround;
let currentDrawPath = {
  path: [],
  color: 'black'
};
let tileId = 1;
let isDrawing = false;
let graffitiCanvasOpen = false;
let graffitiCanvasW;
let graffitiCanvasH;
let graffitiCanvasX;
let graffitiCanvasY;
let largeImgHeight;
let smallImgHeight;
let SCALEFACTOR;
let currentTile;
let toiletImg1;
let toiletImg2;
let toiletPaperImg1;
let toiletPaperImg2;
let mirrorImg1;
let mirrorImg2;
let sinkImg1;
let sinkImg2;
let towelImg1;
let towelImg2;

let monospace;
let acki;
let amali;
let candy;
let clemina;
let jsKang;
let reallyFree;
let syifana;
let tilesHelper;
let tiles;
let startIndex = 0;
let endIndex = 120;
let triangleParams;

let graffitiFont;
let graffitiFontSize;
let mobileGraffitiFontSize = 20;
let desktopGraffitiFontSize = 80;
let messageFont;
let messageFontSize;
let mobileFontSize = 20;
let desktopFontSize = 40;
let isMobile;
let SNAPSHOT_TIME = 20000;


let eventBuffer = [];

let BASE_TILE_WIDTH = 245;
let GRAFFITI_TO_BASE_SCALE;
let BASE_TO_SMALL_TILE_SCALE;
let BASE_TO_GRAFFITI_SCALE;

let paintColors = [
   PBLUE,
   PPINK,
   PPEACH,
   PPURPLE,
   PYELLOW,
   PORANGE,
   PGREEN,
   PTURQ
];

let TEXT_ANGLES = [
  0,
  10,
  350,
  20,
  340
];

let lineupSound;
let arrowSound;
let openTileSound;
let closeTileSound;
let writingSound;
let flushToiletSound;
let tpSound;
let mirrorSound;
let waterSound;
let leavingSound;
let writingSoundIsPlaying = false;

let allSounds;
let tileHovered;
// tiles can only be taken for 2 minutes
let TAKEN_TIME_LIMIT = 2 * 60 * 1000;


function createUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c) {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  });
}
const SESSION_ID = createUUID();

function dataSent(data, err) {}

function preload() {
  toiletImg1 = loadImage('img/toiletImg1.png');
  toiletImg1.imageSmoothingEnabled=true;
  toiletImg2 = loadImage('img/toiletImg2.png');
  toiletImg2.imageSmoothingEnabled=true;
  toiletPaperImg1 = loadImage('img/tpImg1.png');
  toiletPaperImg1.imageSmoothingEnabled=true;
  toiletPaperImg2 = loadImage('img/tpImg2.png');
  toiletPaperImg2.imageSmoothingEnabled=true;
  mirrorImg1 = loadImage('img/mirrorImg1.png');
  mirrorImg1.imageSmoothingEnabled=true;
  mirrorImg2 = loadImage('img/mirrorImg2.png');
  mirrorImg2.imageSmoothingEnabled=true;
  sinkImg1 = loadImage('img/sinkImg1.png');
  sinkImg1.imageSmoothingEnabled=true;
  sinkImg2 = loadImage('img/sinkImg2.png');
  sinkImg2.imageSmoothingEnabled=true;
  towelImg1 = loadImage('img/towelImg1.png');
  towelImg1.imageSmoothingEnabled=true;
  towelImg2 = loadImage('img/towelImg2.png');
  towelImg2.imageSmoothingEnabled=true;
  // monospace = loadFont('monospace');

  incon = loadFont('fonts/Incon.ttf');
  acki = loadFont('fonts/Acki.ttf');
  amali = loadFont('fonts/Amali.ttf');
  candy = loadFont('fonts/Candy.ttf');
  clemina = loadFont('fonts/Clemina.otf');
  jsKang = loadFont('fonts/JsKang.ttf');
  reallyFree = loadFont('fonts/ReallyFree.ttf');
  syifana = loadFont('fonts/Syifana.ttf');

  lineupSound = document.createElement('audio');
  arrowSound = document.createElement('audio');
  openTileSound = document.createElement('audio');
  closeTileSound = document.createElement('audio');
  writingSound = document.createElement('audio');
  letterSound = document.createElement('audio');

  flushToiletSound = document.createElement('audio');
  tpSound = document.createElement('audio');
  mirrorSound = document.createElement('audio');
  // makeupSound = document.createElement('audio');
  waterSound = document.createElement('audio');
  leavingSound = document.createElement('audio');



  if (lineupSound.canPlayType('audio/mpeg')) {
    lineupSound.setAttribute('src', 'audio/lineupSound.mp3');
  }
  if (arrowSound.canPlayType('audio/mpeg')) {
    arrowSound.setAttribute('src', 'audio/arrowSound.mp3');
  }
  if (openTileSound.canPlayType('audio/mpeg')) {
    openTileSound.setAttribute('src', 'audio/openTileSound.mp3');
  }
  if (closeTileSound.canPlayType('audio/mpeg')) {
    closeTileSound.setAttribute('src', 'audio/closeTileSound.mp3');
  }
  if (writingSound.canPlayType('audio/mpeg')) {
    writingSound.setAttribute('src', 'audio/writingSound.mp3');
  }
  if (letterSound.canPlayType('audio/mpeg')) {
    letterSound.setAttribute('src', 'audio/letterSound.mp3');
  }
  if (flushToiletSound.canPlayType('audio/mpeg')) {
    flushToiletSound.setAttribute('src', 'audio/flushToiletSound.mp3');
  }
  if (tpSound.canPlayType('audio/mpeg')) {
    tpSound.setAttribute('src', 'audio/tpSound.mp3');
  }
  if (mirrorSound.canPlayType('audio/mpeg')) {
    mirrorSound.setAttribute('src', 'audio/mirrorSound.mp3');
  }
  if (waterSound.canPlayType('audio/mpeg')) {
    waterSound.setAttribute('src', 'audio/waterSound.mp3');
  }
  if (leavingSound.canPlayType('audio/mpeg')) {
    leavingSound.setAttribute('src', 'audio/leavingSound.mp3');
  }
}


function calculateCanvasWidth(userWindowWidth, userWindowHeight) { // for now does nothing
  return userWindowWidth;
}

function calculateCanvasHeight(userWindowWidth, userWindowHeight) { // for now does nothing
  return userWindowHeight;
}

function calculateGraffitiCanvasWidth(canvasWidth, canvasHeight) {
  return 0.8 * canvasWidth;
}

function calculateGraffitiCanvasHeight(canvasWidth, canvasHeight) {
  let graffitiWidth = calculateGraffitiCanvasWidth(canvasWidth, canvasHeight);
  return (4 / 7) * graffitiWidth;
}

function calculateGraffitiCanvasPositionX(canvasWidth, canvasHeight, graffitiCanvasW) {
  return canvasWidth / 2 - graffitiCanvasW / 2;
}

function calculateGraffitiCanvasPositionY(canvasWidth, canvasHeight) {
  return canvasHeight / 20;
}

function calculateScaleFactor(tw, gw) {
  return tw / gw;
}

function isScreenMobile(){
   if (window.innerWidth <= 800) {
     return true;
   } else {
     return false;
   }
}

function scaleAllTheThings(userWindowWidth, userWindowHeight) {
  console.log('scale');
  canvasWidth = calculateCanvasWidth(userWindowWidth, userWindowHeight);
  canvasHeight = calculateCanvasHeight(userWindowWidth, userWindowHeight);

  graffitiCanvasW = calculateGraffitiCanvasWidth(canvasWidth, canvasHeight);
  graffitiCanvasH = calculateGraffitiCanvasHeight(canvasWidth, canvasHeight);
  graffitiCanvasX = calculateGraffitiCanvasPositionX(canvasWidth, canvasHeight, graffitiCanvasW);
  graffitiCanvasY = calculateGraffitiCanvasPositionY(canvasWidth, canvasHeight);

  toiletImg1.resize(0, canvasHeight);
  toiletImg2.resize(0, canvasHeight);
  toiletPaperImg1.resize(0, canvasHeight / 4.4);
  toiletPaperImg2.resize(0, canvasHeight / 4.4);
  mirrorImg1.resize(0, canvasHeight);
  mirrorImg2.resize(0, canvasHeight);
  sinkImg1.resize(0, canvasHeight);
  sinkImg2.resize(0, canvasHeight);
  towelImg1.resize(0, canvasHeight / 2.5);
  towelImg2.resize(0, canvasHeight / 2.5);


  //SCALEFACTOR = 0.085 //0.145;

  // wxh = 1108 x 454, scalefactor = 0.075
  // wxh =  565 x 351, scalefactor = 0.036

  // tile area = 1320.2311111111112, scale = 0.053
  // tile area =  458.7301587301587, scale = 0.0305

  // console.log(`canvasWidth = ${canvasWidth}\ncanvasHeight = ${canvasHeight}`);
  // console.log(`tileArea = ${tiles[0].width * tiles[0].height}`);
  //SCALEFACTOR = 0.0305;
  GRAFFITI_TO_BASE_SCALE = BASE_TILE_WIDTH / graffitiCanvasW;
  BASE_TO_SMALL_TILE_SCALE = currentTile.width / BASE_TILE_WIDTH;
  BASE_TO_GRAFFITI_SCALE = graffitiCanvasW / BASE_TILE_WIDTH;
  SCALEFACTOR = calculateScaleFactor(currentTile.width, graffitiCanvasW);
}

function makeToolButtons(x, y, w, h) {
  // let toolWidth = 30;
  // let toolSpacer = 5;
  // return {
    // write: {
    //   'x': x + w + toolSpacer,
    //   'y': y,
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
    // clear: {
    //   'x': x + w + toolSpacer,
    //   'y': y + toolWidth + toolSpacer,

      // 'y': h + toolSpacer,
      // 'x': window.innerWidth - toolWidth * 1.5,
      // 'y': toolWidth,
    //   'width': toolWidth,
    //   'height': toolWidth,
    //   'text': 'CLEAR',
    //   'select': false
    // }
  // };
}

function snapshotter() {
  window.setTimeout(function() {
    console.log('taking snapshot');
    takeSnapshot();
    snapshotter();
  }, SNAPSHOT_TIME + Math.random() * SNAPSHOT_TIME);
}

function getScreenOrientation() {
  if (canvasWidth >= canvasHeight) {
    screenOrientation = 'horizontal';
    // console.log(`Screen orientation is ${screenOrientation}`);
  } else if (canvasWidth <= canvasHeight) {
    screenOrientation = 'vertical';
    // console.log(`Screen orientation is ${screenOrientation}`);
  } else {
    // console.log("Screen orientation is impossible");
  }
}

function chooseFontSize(){
  if (isMobile) {
    graffitiFontSize = mobileGraffitiFontSize
    messageFontSize = mobileFontSize;
  } else {
    graffitiFontSize = desktopGraffitiFontSize
    messageFontSize = desktopFontSize;
  }
}

function setup() {



  // input = createInput(); // make input for text
  // input.position(0, 0);
  // input.elt.id = "focus-me";

  setAttributes('antialias', true);

  canvasWidth = calculateCanvasWidth(window.innerWidth, window.innerHeight);
  canvasHeight = calculateCanvasHeight(window.innerWidth, window.innerHeight);

  getScreenOrientation();
  isMobile = isScreenMobile();
  graffitiFont = chooseGraffitiFont();
  messageFont = incon;
  messageFont = 'courier';
  chooseFontSize();

  textSize(messageFontSize);
  textFont(messageFont);


  canvas = createCanvas(canvasWidth, canvasHeight);
  document.querySelectorAll('canvas').forEach(canvas=>canvas.imageSmoothingEnabled=true);
  tilesHelper = new Tiles(canvasWidth, canvasHeight);
  tiles = tilesHelper.tiles;
  currentTile = tiles[1];
  triangleParams = createTriangleParameters(40, screenOrientation);
  scaleAllTheThings(canvasWidth, canvasHeight);
  document.querySelectorAll('canvas').forEach(canvas=>canvas.imageSmoothingEnabled=true);


  function mouseClickFunctions() {
    let itemClicked = whatWasClicked(); // all this does is determine what was clicked
    let clicked = itemClicked['clicked']; // grab clicked
    // console.log(`what was clicked ${clicked}`);
    let item = itemClicked['item']; // grab item
    clickActions(clicked, item); // call func
    if (clicked !== 'nothing') {
      redraw(); //redraw after every click action

    }
  }

  toolButtons = makeToolButtons(graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);

  canvas.mousePressed(mouseClickFunctions); // run the mouse functions
  canvas.mouseMoved(hoverOnImg);
  // canvas.mouseMoved(mouseHoverFunctions); // run the mouse functions

  canvas.touchStarted(startDrawPath); //
  canvas.parent('canvascontainer'); // parent the canvas to the canvas container
  canvas.mouseReleased(endDrawPath); // when mouse is releaed, stop collecting x and y points
  canvas.touchEnded(endDrawPath); // attach listener for

  // FIREBASE AUTH TODO: change
  var config = {
    apiKey: 'AIzaSyAkqkz-UZyRSv_1QgfMjUeqX8mjZfg0MJE',
    authDomain: 'throne-room-club.firebaseapp.com',
    databaseURL: 'https://throne-room-club.firebaseio.com',
    storageBucket: 'throne-room-club.appspot.com',
    messagingSenderId: '889776405480'
  };
  firebase.initializeApp(config);
  database = firebase.database();
  initializeFromSnapshot(firebase);

  function handleKeyDown(event) {
    const key = event.key; // grab the key\
    if (currentTile.writing.length > 143 && key !== 'Backspace') {
      return;
    }
    if (graffitiCanvasOpen) { // if graffiti draw canvas is open
      letterSound.play();
      switch (key) {
        case 'Backspace': // IE/Edge specific value
          currentTile.writing = currentTile.writing.slice(0, -1);
          let writingEvent = {
            tile: currentTile.tile,
            type: 'remove_character',
          };
          eventBuffer.push(writingEvent);
          break;
        case 'Down': // IE/Edge specific value
        case 'ArrowDown':
          break;
        case 'Up': // IE/Edge specific value
        case 'ArrowUp':
          break;
        case 'Meta':
        case 'Alt':
        case 'Control':
        case 'CapsLock':
          break;
        case 'Tab':
          break;
        case 'Left': // IE/Edge specific value
        case 'ArrowLeft':
          break;
        case 'Right': // IE/Edge specific value
        case 'ArrowRight':
          break;
        case 'Enter':
          currentTile.writing += '\n'; // add to the text
          let enterEvent = {
            type: 'add_character',
            tile: currentTile.tile,
            char: '\n'
          };
          eventBuffer.push(enterEvent);
          // currentTile.writing += '\n'; // add to the text
          break;
        case 'Shift':
          break;
        case 'Esc': // IE/Edge specific value
        case 'Escape':
          break;

        default:
          currentTile.writing += event.key; // add to the text
          let dbEvent = {
            type: 'add_character',
            tile: currentTile.tile,
            char: event.key
          };
          eventBuffer.push(dbEvent);

          return; // quit when this doesn't handle the key event
      }
    }
  }

  function handleKeyUp(event) {
    letterSound.pause();
  }

  document.addEventListener('keydown', handleKeyDown); // listen for keys being pressed
  document.addEventListener('keyup', handleKeyUp); // listen for keys being pressed

  // noLoop();
  //snapshotter();
}

// function windowResized() {
  // canvasWidth = calculateCanvasWidth(window.innerWidth, window.innerHeight);
  // canvasHeight = calculateCanvasHeight(window.innerWidth, window.innerHeight);
  // scaleAllTheThings();
  // console.log(`resize: w = ${canvasWidth}, h = ${canvasHeight}`);
  // resizeCanvas(canvasWidth, canvasHeight);
  // scaleAllTheThings(canvasWidth, canvasHeight);
  // redraw();
// }

/////// WHAT WAS CLICKED /////////////
function whatWasClicked() {
  let arrow = arrowMouseCheck();
  if (arrow && sceneSwitchArrowViz) {
    return {
      clicked: 'arrowClicked',
      item: undefined
    };
  }
  if (scene == 'preline') {
    let join = joinLine();
    if (scene == 'preline') {
      if (join) {
        return {
          clicked: 'joinLineClicked',
          item: undefined
        };
      }
    }
  }

  if (scene == 'toilet' || scene == 'sink' || scene == 'mirror' || scene == 'end') {
    if (graffitiCanvasOpen) { // if canvas open
      let tool = toolMouseCheck(); // grab tool (or undefined)
      if (typeof(tool) !== 'undefined') {
        return {
          clicked: 'toolClicked',
          item: tool
        };
      }
      let canvas = inGraffitiCanvasMouseCheck();
      if (canvas) {
        return {
          clicked: 'canvasClicked',
          item: undefined
        };
      }
    }

  }

  let smallImg = smallImgMouseCheck(); // click?
  if (smallImg) {
    console.log('small');
    return {
      clicked: 'smallImgClicked',
      item: undefined
    };
  }

  if (scene == 'toilet' || scene == 'sink' || scene == 'mirror' || scene == 'end') {
    let tile = tileMouseCheck(); // click on a tile?
    if (typeof(tile) !== 'undefined') { //clicked on a tile.
      return {
        clicked: 'tileClicked',
        item: tile
      };
    }
  }

  let bigImg = bigImgMouseCheck(); // click?
  if (bigImg) {
    return {
      clicked: 'bigImgClicked',
      item: undefined
    };
  }
  return {
    clicked: 'nothing',
    item: undefined
  };
}

function clickActions(wasClicked, item) {
  if(graffitiCanvasOpen && wasClicked !== 'canvasClicked') {
    toggleGraffitiCanvas(undefined);
    return;
  }

  if (wasClicked == 'joinLineClicked') {
    lineupSound.play();
    sceneSwitch();
  } else if (wasClicked == 'arrowClicked') {
    arrowSound.play();
    sceneSwitchArrowViz = false;
    sceneSwitch();
  } else if (wasClicked == 'toolClicked') {
    handleToolClick(item);
  } else if (wasClicked == 'canvasClicked') {
    startDrawPath()
    writingSound.play();
  } else if (wasClicked == 'bigImgClicked') {
    largeImgClicked()
  } else if (wasClicked == 'smallImgClicked') {
    smallImgClicked()
  } else if (wasClicked == 'tileClicked') {
    toggleGraffitiCanvas(item);
    startDrawPath();
  } else if (wasClicked == 'nothing') {

  } else {
    // we should never end up here
    console.log(`ERROR: clickActions received item it cannot handle. wasClicked=${wasClicked} item=${item}`);
  }
}

function bigImgMouseCheck() {
  if (scene == 'toilet') {
    if (hoverCheck(canvasWidth / 2 - toiletImg1.width / 2, 0, toiletImg1.width, toiletImg2.height)) {
      return true;
    }
  } else if (scene == 'mirror') {
    if (hoverCheck(canvasWidth / 2 - mirrorImg1.width / 2, 0, mirrorImg1.width, mirrorImg2.height)) {
      return true;
    }
  } else if (scene == 'sink') {
    if (hoverCheck(canvasWidth / 2 - sinkImg1.width / 2, 0, sinkImg1.width, sinkImg2.height)) {
      return true;
    }
  } else {
    return false;
  }
}

function smallImgMouseCheck() {
  if (scene == 'toilet') {
    if (hoverCheck(canvasWidth / 1.5, 240, toiletPaperImg1.width, toiletPaperImg1.height)) {
      return true;
    }
  } else {
    return false;
  }
}

function joinLine() {
  if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
    return true;
  } else {
    return false;
  }
}

function hoverOnImg() {

  let yhover = 20
  if (!graffitiCanvasOpen) {
    if (!writtenMessageViz) {
      if (scene == 'toilet' || scene == 'mirror' || scene == 'sink' || scene == 'end') {
        let oldHovered = tileHovered;
        tileHovered = tilesHelper.getTileForCoord(mouseX, mouseY, startIndex);
        if(typeof(tileHovered) !== 'undefined') {
          displaySmallTileGraffitiForASingleTile(tileHovered, true);
        }
        let oldId = (tileHovered || {}).tile || -1;
        if(typeof(oldHovered) !== 'undefined' && oldHovered.tile != oldId) {
          displaySmallTileGraffitiForASingleTile(oldHovered);
        }
      }

      if (scene == 'toilet') {
        toiletImg1.imageSmoothingEnabled=false;
        drawIfMouseOver(canvasWidth / 2 - toiletImg1.width / 2, 0, toiletImg1.width, toiletImg1.height, 100, 100, toiletImg1); // toilet hover
        drawIfMouseOver(canvasWidth / 1.5, 240, toiletPaperImg1.width, toiletPaperImg1.height, 100, 100,  toiletPaperImg1); // tp hover
      } else if (scene == 'mirror') {
        drawIfMouseOver(canvasWidth / 2 - mirrorImg1.width / 2, 0, mirrorImg1.width, mirrorImg1.height, 100, 100,  mirrorImg1); // mirror hover
      } else if (scene == 'sink') {
        drawIfMouseOver(canvasWidth / 2 - sinkImg1.width / 2, 0, sinkImg1.width, sinkImg1.height, 100, 100,  sinkImg1); // sink hover
        drawIfMouseOver(canvasWidth / 1.5, 240, towelImg1.width, towelImg1.height, 100, 100,  towelImg1); // sink hover
      } else if (scene == 'end') {
        endDrawText();
      }

    }
    if (sceneSwitchArrowViz && arrowMouseCheck()) {
      sceneSwitchArrowVizHover = true;
      drawSceneSwitchArrow(DYELLOW, LYELLOW);
    } else if (sceneSwitchArrowViz) {
      sceneSwitchArrowVizHover = false;
      drawSceneSwitchArrow(DBLUE, LBLUE);
    } else {
      // do nothing
    }
  }
}

function largeImgClicked() {
  if (scene == 'toilet') {
    flushToiletSound.play();
    writtenMessageViz = true;
    window.setTimeout(function() {
      writtenMessageViz = false;
      redraw();
    }, standardTimer);
    // flush toilet animation and sound
  } else if (scene == 'mirror') {
    mirrorSound.play();
    writtenMessageViz = true;
    window.setTimeout(function() {
      writtenMessageViz = false;
      redraw();
    }, standardTimer);
    // mirror sound and animation
  } else if (scene == 'sink') {
    waterSound.play();
    writtenMessageViz = true;
    window.setTimeout(function() {
      writtenMessageViz = false;
      redraw();
    }, standardTimer);
    // sink sound and animation
  }
}

function smallImgClicked() {
  if (scene == 'toilet') {
    tpSound.play();
    // toggleGraffitiCanvas(toiletPaperTile);
    // toilet paper canvas
  } else if (scene == 'mirror') {
    // makeup window
  } else if (scene == 'sink') {
    // hand wash window
  }
}

function startDrawPath() {
  writingSound.play();
  if (graffitiCanvasOpen) {
    isDrawing = true; // set isdrawing to true
    currentDrawPath = {
      path: [], // reset current path to an empty
      color: currentColor
    };
    currentTile['drawing'].push(currentDrawPath); // push the current path to the drawing object
    return false;
  }
}

function endDrawPath() {
  isDrawing = false; // set isdrawing to false
  let event = {
    type: 'add_path',
    tile: currentTile.tile,
    path: currentDrawPath
  };
  writingSound.pause();
  eventBuffer.push(event);
}

// Want: translateThenScale(transformCoordFrombBse(x)) == x for all x
// Want: transformCoordFrombase(translateThenScale(x)) == x for all x
function translateThenScale(coord, gx, gy, scale) {
  return {   // grab the x and y of each point, translate it so that it's relative to an origin, then scale it
    x: (coord.x - gx) * scale,
    y: (coord.y - gy) * scale
  };
}

function scaleThenTranslate(baseCoord, gx, gy, scale) {
  return {
    x: scale * baseCoord.x + gx,
    y: scale * baseCoord.y + gy
  };
}

function captureDrawing() {
  if (isDrawing) { // if person isdrawing
    if (inGraffitiCanvasMouseCheck()) { // and person isdrawing in the canvas
      let point = translateThenScale({ // grab the x and y of each point, translate then scale them to the base
        x: mouseX,
        y: mouseY
      }, graffitiCanvasX, graffitiCanvasY, GRAFFITI_TO_BASE_SCALE);
      currentDrawPath.path.push(point); // push that x and y into the currentDrawPath array
    }
  }
}

function drawTile(tile, hovered) {
  let hoverState = hovered || false;
  push();
  strokeWeight(0);
  if (tile.taken) {
    fill(DPINK);
  } else if(hovered) {
    // HOVER COLOR
    fill(LYELLOW);
  } else if (tile.writing != '' || tile.drawing.length > 0) {
    fill(DPEACH);
  } else {
    fill(LPEACH);
  }
  rect(tile.position.x, tile.position.y, tile.width, tile.height);
  pop();
}

function chooseColor() {
  return random(paintColors);
}

function chooseGraffitiFont() {
  let graffitiFont;
  fonts = [acki, amali, candy, clemina, jsKang, reallyFree, syifana];
  graffitiFont = random(fonts);
  return graffitiFont;
}

function chooseTextAngle() {
  let currentAngle;
  // angles = [];
  currentAngle = random(.5, 1);
  return currentAngle;
}

function drawTileDrawing(tile, scaleFactor, translateX, translateY) {
  push();
  noFill();
  strokeWeight(5 * scaleFactor / 2);
  let drawing = tile['drawing'];
  for (let i = 0; i < drawing.length; i++) { // foreach path in the drawing
    let pathObject = drawing[i]; // grab the next path
    if (typeof(pathObject.path) !== 'undefined') {
      stroke(pathObject.color);
      beginShape(); // draw
      for (let j = 0; j < pathObject.path.length; j++) { // for each coordinate in the path
        let pathCoord = scaleThenTranslate(pathObject.path[j], translateX, translateY, scaleFactor);
        vertex(pathCoord.x, pathCoord.y); // mark each vertex and draw a line between
      }
      endShape();
    }
  }
  pop();
}

function drawTileWriting(tile, scaleFactor, x, y, w, h) {
  push();
  noStroke();
  // how does this work? the power of modulus!
  // fonts  = [courier, helvetica, times]
  // fonts.length = 3;
  // tile.tile <-- ids for tiles, range from 0, 380
  // 117 % 3 = either 0, 1, or 2.
  let font = fonts[tile.tile % fonts.length];
  textFont(font);
  textSize(graffitiFontSize);
  fill(currentColor);
  scale(scaleFactor, scaleFactor);


  //experimenting with textToPoints to see if it's faster - it is!

  //if(tile.writingPoints) {
  //beginShape();
  //for(var i = 0 ; i < tile.writingPoints.length ; i++) {
  //let p = tile.writingPoints[i];
  //vertex(p.x, p.y);
  //}
  //endShape();
  //}
  // textAlign(CENTER, CENTER);
  // rectMode(CENTER);
  // translate(0, 0);
  // rotate(90);
  textAlign(CENTER, CENTER);
  text(tile['writing'], x, y, w, h);
  pop();
}

function graffitiTools(myColor) {
  // let toolSpacer = 10;
  // for (const tool in toolButtons) {
  //   let btn = toolButtons[tool];
  //   fill(myColor);
  //   // rect(10, 10, 100, 100);
  //   rect(btn.x, btn.y, btn.width, btn.height);
  //   fill('black');
  //   textAlign(CENTER, CENTER);
  //   textSize(12);
  //   text(btn.text, btn.x, btn.y, btn.width, btn.height);
  // }
}

function displayLargeTileGraffiti(tile) {
  if (graffitiCanvasOpen) {
    drawTileDrawing(tile, BASE_TO_GRAFFITI_SCALE, graffitiCanvasX, graffitiCanvasY); // draw it BIG
    drawTileWriting(tile, 1.0, graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);
  }
}

function displaySmallTileGraffitiForASingleTile(tile, hovered) {
  let hoverState = hovered || false;
  // why does this translate work?
  let drawtranslateX = tile.position.x / SCALEFACTOR - graffitiCanvasX;
  let drawtranslateY = tile.position.y / SCALEFACTOR - graffitiCanvasY;
  let writetranslateX = tile.position.x / SCALEFACTOR;
  let writetranslateY = tile.position.y / SCALEFACTOR;
  let translateWidth = tile.width / SCALEFACTOR;
  let translateHeight = tile.height / SCALEFACTOR;
  drawTile(tile, hoverState); // draw the actual tile rect
  if (tile['writing'] !== []) { // if not empty
    drawTileDrawing(tile, BASE_TO_SMALL_TILE_SCALE, tile.position.x, tile.position.y);
    drawTileWriting(tile, SCALEFACTOR, writetranslateX, writetranslateY, translateWidth, translateHeight);
  }
}

function displaySmallTileGraffiti() {
  for (let i = startIndex; i < endIndex; i++) {
    let tile = tiles[i];
    displaySmallTileGraffitiForASingleTile(tile);
  }
}

function tileMouseCheck() { // returns undefined when not clicking on a tile
  return tilesHelper.getTileForCoord(mouseX, mouseY, startIndex);
}

function saveTile(tile) {
  if (eventBuffer.length > 0) {
    let newBuffer = collapseEventBuffer(eventBuffer);
    let ref = database.ref('log');
    // submit all the events in order
    let promise = ref.push(newBuffer[0]);
    let tail = newBuffer.slice(1);
    for (const i in tail) {
      promise = promise.then(function() {
        return ref.push(tail[i]);
      });
    }
    eventBuffer = [];
  }
  redraw();
}

function hoverCheck(x, y, w, h) {
  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    return true;
  } else {
    return false;
  }
}

function drawIfMouseOver(x,y,w,h,bufferX, bufferY, img) {
  if (mouseX > (x - bufferX) && mouseX < x + w + bufferX && mouseY > (y - bufferY) && mouseY < y + h + bufferY) {
    image(img, x, y);
  }
}

function hoverReplace(x, y, w, h, img2, img1) {
  if (mouseX > x && mouseX < x + w && mouseY > h/1.2 && mouseY < y + h) {
    image(img2, x, y);
  } else {
    image(img1, x, y);
  }
}


function clearTile() {
  // this should instead clear UNPUSHED changes so people can't delete other people's work
  currentTile.drawing = [];
  currentTile.writing = '';
  eventBuffer.push({
    type: 'clear_tile',
    tile: currentTile.tile
  });
}

function clearTileChanges() {
  currentTile.drawing = [];
  currentTile.writing = '';
}

function handleToolClick(tool) {
  if (tool.text === 'write') {
    // ideally this opens Mobile Keyboard - seems impossible
    // input.elt.get(0).focus();
    // input.elt.focus();
    // document.getElementById('focus-me').focus();
    // console.log('focus!');
  } else if (tool.text === 'CLEAR') {
    clearTileChanges();
  } else {
    // do nothing
    console.log(`ERROR: handleToolClick received a text it could not handle: tool=${JSON.stringify(tool)}`);
  }
}


function toolMouseCheck() {
  var buttonClicked;
  for (const tool in toolButtons) {
    let btn = toolButtons[tool];
    if (mouseX > btn.x && mouseX < btn.x + btn.width && mouseY > btn.y && mouseY < btn.y + btn.height) {
      btn.select = true;
      buttonClicked = btn;
    } else {
      btn.select = false;
    }
  }
  return buttonClicked;
}

function toggleGraffitiCanvas(tileClicked) { // open and close canvas
  const previousCurrentTile = currentTile; // set opentile to the last value of currenttile ( this is whatever it was last time this ran)
  if (graffitiCanvasOpen) { //  if canvas being closed
    if (inGraffitiCanvasMouseCheck() == false) { // prevents accidental closing
      closeTileSound.play();
      previousCurrentTile['taken'] = false; //  remove hold on previousCurrentTile
      delete previousCurrentTile.takenTime;
      eventBuffer.push({
        type: 'untake',
        tile: previousCurrentTile.tile
      });
      saveTile(previousCurrentTile); // save the previousCurrentTile
      graffitiCanvasOpen = !graffitiCanvasOpen; // toggle canvas state
      noLoop(); // stop looping draw - for speed
    }
  } else { // if canvas is being opened
    openTileSound.play();
    currentColor = chooseColor();
    graffitiFont = chooseGraffitiFont();
    currentAngle = chooseTextAngle();
    loop(); // start looping draw
    currentTile = tileClicked // update 'current tile' to the tile that was clicked
    if (currentTile.taken === false) { // if the tile is not currently taken
      currentTile['taken'] = true; // 'take' (reserve) the tile
      const takenTime = Date.now();
      currentTile.takenTime = takenTime;
      eventBuffer.push({
        type: 'take',
        tile: currentTile.tile,
        session: SESSION_ID,
        ts: takenTime
      });
      saveTile(currentTile);
    }
    graffitiCanvasOpen = !graffitiCanvasOpen; // toggle canvas
  }
}

function inGraffitiCanvasMouseCheck() { // check if in the drawcanvas
  if (mouseX > graffitiCanvasX && mouseX < graffitiCanvasX + graffitiCanvasW && mouseY > graffitiCanvasY && mouseY < graffitiCanvasY + graffitiCanvasH) {
    return true;
  } else {
    return false;
  }
}

function drawGraffitiCanvas() {
  push();
  stroke(DPEACH);
  strokeWeight(3);
  fill(LPEACH);
  rect(graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH);
  pop();
}

function writtenMessage(message) {
  push();
  fill('white');
  rect(graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH / 2);
  fill('black');
  textSize(messageFontSize);
  textFont(messageFont);
  textAlign(CENTER, CENTER);
  text(message, graffitiCanvasX, graffitiCanvasY, graffitiCanvasW, graffitiCanvasH / 2);
  pop();
}

function stopSounds() {
  allSounds = [ // needs to happen here
    lineupSound,
    openTileSound,
    closeTileSound,
    writingSound,
    flushToiletSound,
    tpSound,
    mirrorSound,
    waterSound,
    leavingSound
  ];
  for (var i = 0; i < allSounds.length; i++) {
    let thisSound = allSounds[i];
    allSounds[i].pause();
  }
}

function displayWelcomeMessage() {
  writtenMessageViz = true;
  function runWhenTimeoutIsUp() {
    writtenMessageViz = false;
    redraw();
  }
  window.setTimeout(runWhenTimeoutIsUp, standardTimer);
}

function sceneSwitch() {
  if (scene == 'preline') {
    scene = 'line';

  } else if (scene == 'line') {
    scene = 'toilet';
    displayWelcomeMessage();
    leaveSceneTimer(standardTimer);
    noLoop(); // stop toilet from looping

  } else if (scene == 'toilet') {
    stopSounds();
    scene = 'sink';
    redraw();
    startIndex = 120;
    endIndex = 240;
    displayWelcomeMessage();
    leaveSceneTimer(standardTimer);
    noLoop();

  } else if (scene == 'sink') {
    stopSounds();
    scene = 'mirror'
    startIndex = 240;
    endIndex = 360;
    redraw();
    displayWelcomeMessage();
    leaveSceneTimer(standardTimer);
    noLoop();

  } else if (scene == 'mirror') {
    stopSounds();
    scene = 'end'
    startIndex = 360;
    endIndex = 480;
    redraw();
    displayWelcomeMessage();
    noLoop();
  }
}

function createTriangleParameters(length, orientation) {
  let y1, y2, y3, x1, x2, x3;

  if(orientation === 'horizontal') {
    y1 = canvasHeight / 1.2;
    y2 = y1 + length * 2;
    x3 = canvasWidth - length;
    y3 = y1 + length;
    x1 = x3 - length * 1.5;
  } else {
    y1 = canvasHeight / 1.2;
    y2 = y1 + length * 2;
    x3 = canvasWidth - length;
    y3 = y1 + length;
    x1 = x3 - length * 1.5;
  }

  return {
    length: length,
    y1: y1,
    y2: y2,
    x3: x3,
    y3: y3,
    x1: x1,
    x2: x1
  };
}

function drawSceneSwitchArrow(outercolor, innercolor) {
  sceneSwitchArrowViz = true;
  push();
  stroke(outercolor);
  fill(innercolor);
  strokeWeight(7);
  let params = triangleParams;
  triangle(params.x1, params.y1, params.x2, params.y2, params.x3, params.y3);
  pop();
}

function redrawSceneSwitchArrow() {
  sceneSwitchArrowViz = true; // keep drawing the arrow
  redraw();
}

function displaySceneSwitchArrow(){
  if(sceneSwitchArrowViz) {
    if(sceneSwitchArrowVizHover) {
      drawSceneSwitchArrow(DYELLOW, LYELLOW);
    } else {
      drawSceneSwitchArrow(DBLUE, LBLUE);
    }
  }
}

function leaveSceneTimer(waitTime) { // used to set the timeouts
  window.setTimeout(redrawSceneSwitchArrow, waitTime); // change this to be longer
}

function arrowMouseCheck() {
  // function inarrowMouseCheck(px, py, x1, y1, x2, y2, x3, y3) {
  let px = mouseX;
  let py = mouseY;
  //let {x1, y1, x2, y2, x3, y3} = triangleParams;
  let x1 = triangleParams.x1;
  let y1 = triangleParams.y1;
  let x2 = triangleParams.x2;
  let y2 = triangleParams.y2;
  let x3 = triangleParams.x3;
  let y3 = triangleParams.y3;

  var areaOrig = floor(abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)));
  var area1 = floor(abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py)));
  var area2 = floor(abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py)));
  var area3 = floor(abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py)));
  if (area1 + area2 + area3 <= areaOrig) {
    return true;
  } else {
    return false;
  }
}

function startTimer() {

}

function preLineupDraw() {
  //let lineText = "The imaginary bathroom is now closed.";
  let lineText = "Enter the imaginary bathroom?";
  push();
  background('black');
  // textFont(messageFont, messageFontSize);
  textAlign(CENTER, CENTER);
  fill(DBLUE);
  rectMode(CENTER);
  text(lineText, canvasWidth / 2, canvasHeight / 2, canvasWidth / 1.5, canvasHeight / 2);
  pop();
}

function lineupDraw() {
  //let lineText = "Seriously, we're closed. You can enter but new graffiti won't be saved." + "\n" + bathroomLineUpTime;
  let lineText = "You are in line" + "\n" + bathroomLineUpTime;
  push();
  background('black');
  if (frameCount % 60 == 0 && bathroomLineUpTime > -1) { // if the frameCount is divisible by 60, a second has passed. it will stop at 0
    bathroomLineUpTime--;
  }
  if (bathroomLineUpTime == -1) {
    bathroomLineUpTime = 0;
    lineupSound.pause();
    drawSceneSwitchArrow(DBLUE, LBLUE);
    noLoop();
  }

  // textFont(messageFont, messageFontSize);
  textAlign(CENTER, CENTER);
  fill(DBLUE);
  rectMode(CENTER);
  text(lineText, canvasWidth / 2, canvasHeight / 2, canvasWidth / 1.5, canvasHeight / 2);
  pop();
}

function toiletDraw() {
  // let frameStartTime = millis();
  if (graffitiCanvasOpen) { // if canvas is open
    drawGraffitiCanvas();
    // graffitiTools(DBLUE);
    displayLargeTileGraffiti(currentTile); // show the open drawing/text
    captureDrawing(); // run the code to catch the drawing
  } else {
    background(LBLUE);
    displaySmallTileGraffiti(); // show all the small drawings/text
    if(typeof(tileHovered) !== 'undefined') {
      displaySmallTileGraffitiForASingleTile(tileHovered,true);
    }

    //toiletImg1.imageSmoothingEnabled=false;
    // toiletImg2.elt.imageSmoothingEnabled=false;
    // toiletPaperImg1.elt.imageSmoothingEnabled=false;
    // toiletPaperImg2.elt.imageSmoothingEnabled=false;
    // mirrorImg1.elt.imageSmoothingEnabled=false;
    // mirrorImg2.elt.imageSmoothingEnabled=false;
    // sinkImg1.elt.imageSmoothingEnabled=false;
    // sinkImg2.elt.imageSmoothingEnabled=false;
    // towelImg1.elt.imageSmoothingEnabled=false;
    // towelImg2.elt.imageSmoothingEnabled=false;
    image(toiletImg1, canvasWidth / 2 - toiletImg1.width / 2, 0);
    image(toiletPaperImg1, canvasWidth / 1.5, 240);
    if (writtenMessageViz) {
      writtenMessage("what are you ready to flush away?");
    }
  }
  displaySceneSwitchArrow();
  // console.log('Amount of time to compute the frame:', millis() - frameStartTime);
  // console.log('Current frame rate:', frameRate());
}

function sinkDraw() {
  if (graffitiCanvasOpen) { // if canvas is open
    drawGraffitiCanvas();
    // graffitiTools(DBLUE);
    displayLargeTileGraffiti(currentTile); // show the open drawing/text
    captureDrawing(); // run the code to catch the drawing
  } else {
    background(LBLUE);
    displaySmallTileGraffiti(); // show all the small drawings/text
    image(sinkImg1, canvasWidth / 2 - sinkImg1.width / 2, 0);
    image(towelImg1, canvasWidth / 1.5, 240);
    if (writtenMessageViz) {
      writtenMessage("what do your hands want to do?");
    }
  }
  displaySceneSwitchArrow();


}

function mirrorDraw() {
  if (graffitiCanvasOpen) { // if canvas is open
    drawGraffitiCanvas();
    // graffitiTools(DBLUE);
    displayLargeTileGraffiti(currentTile); // show the open drawing/text
    captureDrawing(); // run the code to catch the drawing
  } else {
    background(LBLUE);
    displaySmallTileGraffiti(); // show all the small drawings/text
    image(mirrorImg1, canvasWidth / 2 - mirrorImg1.width / 2, 0);
    // image(toiletPaperImg1, canvasWidth / 1.5, 240);
    if (writtenMessageViz) {
      writtenMessage("what do you want to see?");
    }
  }
  displaySceneSwitchArrow();

}

function endDrawText() {
  push();
  let lineText = "Thank you for visiting the imaginary bathroom"
  textAlign(CENTER, CENTER);
  fill('black');
  rectMode(CENTER);
  textFont(messageFont);
  textSize(messageFontSize);
  text(lineText, canvasWidth / 2, canvasHeight / 2, canvasWidth / 1.5, canvasHeight / 2);
  pop();
}

function endDraw() {
  if (graffitiCanvasOpen) { // if canvas is open
    drawGraffitiCanvas();
    // graffitiTools(DBLUE);
    displayLargeTileGraffiti(currentTile); // show the open drawing/text
    captureDrawing(); // run the code to catch the drawing
  } else {
    background(LBLUE);
    displaySmallTileGraffiti(); // show all the small drawings/text
    endDrawText();
  }
}

function draw() {
  if (scene == 'preline') {
    preLineupDraw();
  } else if (scene == 'line') {
    lineupDraw();
  } else if (scene == 'toilet') {
    toiletDraw();
  } else if (scene == 'sink') {
    sinkDraw();
  } else if (scene == 'mirror') {
    mirrorDraw();
  } else if (scene == 'end') {
    endDraw();
  }
}

// integrate buildmap into tilemap
function buildMap(graffitiWall) {
  for(const tileId in tiles) {
    let tile = tiles[tileId];
    let graffitiWallTile = graffitiWall[tileId];
    if(typeof(graffitiWallTile) === 'undefined') {
      console.log(`ERROR - tileId=${tileId} in tiles map but not in snapshot`);
    } else {
      tile.drawing = graffitiWall[tileId].drawing || [];
      tile.writing = graffitiWall[tileId].writing || '';
      tile.taken = graffitiWall[tileId].taken || false;
    }
  }
  redraw(); // redraw everytime there is an update in the database
}

// this function collapses consecutive "add_character"
// events and smash them into a single event.
// events into a single writing event
function collapseEventBuffer(buffer) {

  let msg = "";
  let newBuffer = [];

  for (let i in buffer) {
    let event = buffer[i];
    if (event.type === 'add_character') {
      msg += event.char;
    } else if (event.type === 'remove_character') {
      msg = msg.slice(0, -1);
    } else {
      newBuffer.push(event);
    }
  }

  if (msg.length > 0) {
    newBuffer.push({
      tile: buffer[0].tile,
      type: 'update_writing',
      writing: msg
    });
  }
  return newBuffer;
}

function takeSnapshot() {
  database.ref('log').push({
    type: 'snapshot',
    session: SESSION_ID
  });
}

function handleEvent(event, key) {
  if (event.type === 'add_path') {
    // assume .tile has id, and .stroke
    let tileId = event.tile;
    let tile = tiles[tileId];
    tile.drawing.push(event.path);
    displaySmallTileGraffitiForASingleTile(tile);
    displayLargeTileGraffiti(tile);

  } else if (event.type === 'update_writing') {

    let tileId = event.tile;
    let tile = tiles[tileId];
    tile.writing = event.writing;
    displaySmallTileGraffitiForASingleTile(tile);
    displayLargeTileGraffiti(tile);

  } else if (event.type === 'clear_tile') {

    // assume .tile has id
    let tileId = event.tile;
    let tile = tiles[tileId];
    tile.drawing = {
      path: [],
      color: 'black'
    };
    tile.writing = "";
    tile.taken = false;
    delete tile.takenTime;
    displaySmallTileGraffitiForASingleTile(tile);
    displayLargeTileGraffiti(tile);
  } else if (event.type === 'take') {

    let tileId = event.tile;
    let tile = tiles[tileId];
    tile.taken = true;
    tile.takenTime = event.ts;

  } else if (event.type === 'untake') {

    let tileId = event.tile;
    let tile = tiles[tileId];
    tile.taken = false;
    delete tile.takenTime;

  } else if (event.type === 'snapshot') {
    // only take snapshots from your current session
    // otherwise skip the snapshot events
    if (event.session === SESSION_ID) {
      for(const id in tiles) {
        let tile = tiles[id];
        let now = Date.now();
        let takenTime = tile.takenTime || 0;
        if(tile.taken && now - takenTime > TAKEN_TIME_LIMIT) {
          tile.taken = false;
          delete tile.takenTime;
        }
      }
      let ref = database.ref('snapshot');
      ref.push({
        tiles: tiles,
        key: key,
        session: SESSION_ID
      });
    }
    return;
  } else {
    console.log(`received event type we could not handle: ${event.type}`);
  }
}

function initializeFromSnapshot(firebase) {
  let database = firebase.database();
  let snapshotRef = database.ref('/snapshot').orderByKey().limitToLast(1);

  var now = performance.now();

  snapshotRef.once('value', function(snapshot) {
    let dbSnapshot = snapshot.val();

    if (dbSnapshot === null) {
      // no snapshots exist, start from beginning of log
      let ref =
        database
        .ref('/log')
        .orderByKey()

      return ref.on('child_added', function(data) {
        let event = data.val();
        let key = data.key;
        handleEvent(event, key);
      }, printErrors);
    } else {
      // snapshots exist, so start from the most
      // recent snapshot
      database
        .ref('/snapshot')
        .orderByKey()
        .limitToLast(1)
        .once('child_added', function(snap) {

          let snapshot = snap.val();

          let snapshotKey = snapshot.key;
          buildMap(snapshot.tiles);
          // new reference
          let ref =
            database
            .ref('/log')
            .orderByKey()
            .startAt(snapshotKey);

          return ref.on('child_added', function(data) {
            let event = data.val();

            let key = data.key;
            handleEvent(event, key);
          }, printErrors);
        }, printErrors);
    }
  });
}


function printErrors(err) { // show me the errors please!
  console.log(err);
}

window.addEventListener('beforeunload', function(event) {
  currentTile['taken'] = false;
  delete currentTile.takenTime;
  eventBuffer.push({
    type: 'untake',
    tile: currentTile.tile
  });
  saveTile(currentTile);
});
