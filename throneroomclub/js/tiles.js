
//////// If time ////////
// keyboard focus for mobile?

////// If I Can Stop Time ////////
// choose sound or reading in lineup
// choose light or dark in lineup
// refactor code so canvas is only the drawcanvas
// resize bug: is it because height is changing and not width?: Uncaught DOMException: Failed to execute 'drawImage' on 'CanvasRenderingContext2D': The image argument is a canvas element with a width or height of 0.
// after 26 characters without a space or linebreak, insert a space
// how to integrate 'font' and (if time - random text angles) into database
// a - delete code saving to graffitiWall
// 'clear' should only clear unpushed updates - is this hard?
// command z removes last draw path
// improve functionality of lettersound


//////// BEFORE PUBLISHING ////////
// make the 'text' canvas tool invisible (also clear if clear still clears EVERYTHING)
// make database private
// hide js? or opposite?
// what do we do if firebase is full? 100 people? real line?


////////// Not Code /////////
// improve images
    // - p2 make water flowing out of sink, gifs, oh my!
// improve sounds
    // - p2 make some new if time
// improve text
    // - great
// select colors
    // - great
// playtest
    // - 5 minutes of drawing and testing
    // - other people

// DREAMIN AROUND
// add alt text to the lineup: (why are you here anyway?)
// what does handdrawn mean, on a computer? (art, fonts, etc)
// chat window
// ritual/request text appears and then fades at scene open
// anything to say before you go? (text in last scene)
// click on toilet paper for special tile with flush button - flush sound when done and animation
// should I draw *all present* mouse cursors? so you can *feel* connected to the others?
// click on words in text to go to other words in text?
// link to live makeup
// handwashing
// link to gossip call
// so you are crying in the bathroom zine

// what are you ready to flush away? see it in your mind and flush it away in our imaginary toilet
// what do you want to see when you look in the mirror? can you see it here, in our imaginary mirror?
// what do you want to do with your hands? can you gently, slowly, wash your hands here in our imaginary sink?



// THINKING
// Come to the imaginary bathroom for graffiti, letting go, reaching out, and moving on.
// toilet thoughts
// go to your bathroom to establish a psychic link to this imaginary public bathroom
// bathrooms are intimate spaces, special spaces, complicated spaces
// sometimes the bathroom is the only place you can go to be alone
// In bathrooms, people urinate, deficate, vomit, clean our bodies, put on makeup, use drugs, gossip, cry, masterbate.
// Bathroom walls used to be one of the few places you could write to people anonomously.
// if anyone wants me to read the tiles to them, I will!
// thanks aaron, august, sukanya, julia

class Tiles {
  constructor(canvasWidth, canvasHeight, existingTiles) {

    this.tileSpacer = 5;
    // let numberOfTiles = 8 * 15; // 120, 240, 360, 480
    let numberOfTiles = 480;

    if(canvasWidth <= canvasHeight) {
      // taller
      this.numColumns = 8;
      this.numRows = 15;

    } else {
      // wider
      this.numColumns = 15;
      this.numRows = 8;
    }

    this.tileWidth = (canvasWidth - this.tileSpacer * this.numColumns) / this.numColumns;
    this.tileHeight = 4 / 7 * this.tileWidth;

    // if we pass in existingTiles use that, otherwise use {}
    this.tiles = existingTiles || [];

    //let canvasWidthMinusSpaces = canvasWidth/1.5 - (numberOfColumns - 1) * tileSpacer;  // to get the height of the tile take the total canvas height and remove the spacers (for 10 tiles, there will be 9 spaces)
    //let tileWidth = canvasWidthMinusSpaces / numberOfColumns;   // now take the remaining canvas space after removing the spacers & divide that by the number of tiles in a row; that will be the tile height.
    //let tileHeight = 4/7 * tileWidth;   // to get the tileWidth - use the original tile ratio (70/40 or 7/4)

    let rowCounter = 0;
    let xVal = 0;
    let yVal = 0;
    this.ySpacer = this.tileHeight + this.tileSpacer;
    this.xSpacer = this.tileWidth + this.tileSpacer;

    for (var i = 0; i < numberOfTiles; i++) {
      // if i is divisible by 120 (remainder is zero) reset rowCounter
      if(i % 120 == 0) {
        rowCounter = 0;
        xVal = 0;
        yVal = 0;
      }

      rowCounter++; // increment rowCounter

      if(typeof(tile) === 'undefined') {
        // tile does not exist, so lets create a blank tile
        this.tiles.push({
          tile: i,
          writing: "",
          drawing: [],
          taken: false,
          width: this.tileWidth,
          height: this.tileHeight,
          position: {
            x: xVal,
            y: yVal
          }
        });
      } else {
        let tile = this.tiles[i];
        // only update the x and y
        tile.position.x = xVal;
        tile.position.y = yVal;
      }

      yVal += this.ySpacer; // increment y val
      if (rowCounter === this.numRows) { // if we have drawn all the rows
        rowCounter = 0; // reset rowcounter
        yVal = 0; // set y to 0
        xVal += this.xSpacer; // increment x val
      }
    }
  }

  getRowForCoord(y) {
    for(var i=1; i < this.numRows; i++) {
      let tile = this.tiles[i];
      if (y < tile.position.y) {
        // click is between tiles
        if(y > tile.position.y - this.tileSpacer) {
          return;
        } else {
          return i - 1;
        }
      }
    }
    let tile = this.tiles[this.numRows - 1];
    if(y > tile.position.y + tile.height) {
      return;
    } else {
      return this.numRows - 1;
    }
  }

  getColumnForCoord(x) {
    for(var i=1; i < this.numColumns; i++) {
      let tile = this.tiles[i * this.numRows];
      if(x < tile.position.x) {
        if(x > tile.position.x - this.tileSpacer) {
          return;
        } else {
          return (i - 1) * this.numRows;
        }
      }
    }
    let tile = this.tiles[(this.numColumns - 1) * this.numRows];
    if(x > tile.position.x + tile.width) {
      return;
    } else {
      return (this.numColumns - 1) * this.numRows;
    }
  }

  getTileForCoord(x, y, offset) {
    let indexOffset = offset || 0;
    const column = this.getColumnForCoord(x);
    if(typeof(column) === 'undefined') {
      return;
    }
    const row = this.getRowForCoord(y);
    if(typeof(row) === 'undefined') {
      return;
    }

    return this.tiles[column + row + indexOffset];
  }
}
