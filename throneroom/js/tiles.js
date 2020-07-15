// Come to the imaginary bathroom for graffiti, letting go, reaching out, and moving on.


// TODO

// TEXT
// ~ set up actual site namecheap
// ~fix draw order problem - big drawing > grafdrawcan > little drawings > toilet paper > tiles
// ~drawing works on mobile?
// ~make an animation on click
// ~integrate second scene - timer makes button appear "go to sink"
// ~integrate third scene - timer makes coundown appear
// *click on words in text to go to other words in text?*
// ~consider drawing tools - random color and random font (+font angle) when click on buttons
// ~click on toilet paper for special tile with flush button - flush sound when done and animation
// ~make sound effects - open tile, close tile, isdrawing
// ~make fonts and integrate fonts and text angle
// ~create entry and closing level
//
// ~ integrate handwashing
// ~ link to other video call - show off your makeup
// ~more tiles? mathmatically place them?
// add thematic colours to painting?
// make a lineup for the bathroon?
//
// THINKING
// ~how to handle clicks??? IF mouse on tile & canvas open -> save drawing, IF mouse on tile and canvas closed -> open canvas, ELSE if canvas open & mouse on canvas -> draw, ELSE if mouse on clickable object -> sound and animate



let tiles = {
    1: {
      'writing': '',
      'drawing': [],
      'tile': 1,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 0,
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
        'x': 0,
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
        'x': 0,
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
        'x': 0,
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
        'x': 0,
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
        'x': 0,
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
        'x': 0,
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
        'x': 0,
        'y': 400
      }
    },
    9: {
      'writing': '',
      'drawing': [],
      'tile': 9,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 0,
        'y': 450
      }
    },
    10: {
      'writing': '',
      'drawing': [],
      'tile': 10,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 0,
        'y': 500
      }
    },
    11: {
      'writing': '',
      'drawing': [],
      'tile': 11,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 50
      }
    },
    12: {
      'writing': '',
      'drawing': [],
      'tile': 12,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 100
      }
    },
    13: {
      'writing': '',
      'drawing': [],
      'tile': 13,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 150
      }
    },
    14: {
      'writing': '',
      'drawing': [],
      'tile': 14,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 200
      }
    },
    15: {
      'writing': '',
      'drawing': [],
      'tile': 15,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 250
      }
    },
    16: {
      'writing': '',
      'drawing': [],
      'tile': 16,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 300
      }
    },
    17: {
      'writing': '',
      'drawing': [],
      'tile': 17,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 350
      }
    },
    18: {
      'writing': '',
      'drawing': [],
      'tile': 18,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 400
      }
    },
    19: {
      'writing': '',
      'drawing': [],
      'tile': 19,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 450
      }
    },
    20: {
      'writing': '',
      'drawing': [],
      'tile': 20,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 100,
        'y': 500
      }
    },
    21: {
      'writing': '',
      'drawing': [],
      'tile': 21,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 50
      }
    },
    22: {
      'writing': '',
      'drawing': [],
      'tile': 22,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 100
      }
    },
    23: {
      'writing': '',
      'drawing': [],
      'tile': 23,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 150
      }
    },
    24: {
      'writing': '',
      'drawing': [],
      'tile': 24,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 200
      }
    },
    25: {
      'writing': '',
      'drawing': [],
      'tile': 25,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 250
      }
    },
    26: {
      'writing': '',
      'drawing': [],
      'tile': 26,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 300
      }
    },
    27: {
      'writing': '',
      'drawing': [],
      'tile': 27,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 350
      }
    },
    28: {
      'writing': '',
      'drawing': [],
      'tile': 28,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 400
      }
    },
    29: {
      'writing': '',
      'drawing': [],
      'tile': 29,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 450
      }
    },
    30: {
      'writing': '',
      'drawing': [],
      'tile': 30,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 200,
        'y': 500
      }
    },
    31: {
      'writing': '',
      'drawing': [],
      'tile': 31,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 50
      }
    },
    32: {
      'writing': '',
      'drawing': [],
      'tile': 32,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 100
      }
    },
    33: {
      'writing': '',
      'drawing': [],
      'tile': 33,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 150
      }
    },
    34: {
      'writing': '',
      'drawing': [],
      'tile': 34,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 200
      }
    },
    35: {
      'writing': '',
      'drawing': [],
      'tile': 35,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 250
      }
    },
    36: {
      'writing': '',
      'drawing': [],
      'tile': 36,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 300
      }
    },
    37: {
      'writing': '',
      'drawing': [],
      'tile': 37,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 350
      }
    },
    38: {
      'writing': '',
      'drawing': [],
      'tile': 38,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 400
      }
    },
    39: {
      'writing': '',
      'drawing': [],
      'tile': 39,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 450
      }
    },
    40: {
      'writing': '',
      'drawing': [],
      'tile': 40,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 600,
        'y': 500
      }
    },
    41: {
      'writing': '',
      'drawing': [],
      'tile': 41,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 50
      }
    },
    42: {
      'writing': '',
      'drawing': [],
      'tile': 42,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 100
      }
    },
    43: {
      'writing': '',
      'drawing': [],
      'tile': 43,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 150
      }
    },
    44: {
      'writing': '',
      'drawing': [],
      'tile': 44,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 200
      }
    },
    45: {
      'writing': '',
      'drawing': [],
      'tile': 45,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 250
      }
    },
    46: {
      'writing': '',
      'drawing': [],
      'tile': 46,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 300
      }
    },
    47: {
      'writing': '',
      'drawing': [],
      'tile': 47,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 350
      }
    },
    48: {
      'writing': '',
      'drawing': [],
      'tile': 48,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 400
      }
    },
    49: {
      'writing': '',
      'drawing': [],
      'tile': 49,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 450
      }
    },
    50: {
      'writing': '',
      'drawing': [],
      'tile': 50,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 700,
        'y': 500
      }
    },
    51: {
      'writing': '',
      'drawing': [],
      'tile': 51,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 50
      }
    },
    52: {
      'writing': '',
      'drawing': [],
      'tile': 52,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 100
      }
    },
    53: {
      'writing': '',
      'drawing': [],
      'tile': 53,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 150
      }
    },
    54: {
      'writing': '',
      'drawing': [],
      'tile': 54,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 200
      }
    },
    55: {
      'writing': '',
      'drawing': [],
      'tile': 55,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 250
      }
    },
    56: {
      'writing': '',
      'drawing': [],
      'tile': 56,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 300
      }
    },
    57: {
      'writing': '',
      'drawing': [],
      'tile': 57,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 350
      }
    },
    58: {
      'writing': '',
      'drawing': [],
      'tile': 58,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 400
      }
    },
    59: {
      'writing': '',
      'drawing': [],
      'tile': 59,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 450
      }
    },
    60: {
      'writing': '',
      'drawing': [],
      'tile': 60,
      'firebaseKey': null,
      'width': 70,
      'height': 40,
      'position': {
        'x': 800,
        'y': 500
      }
    },
  };

// Set 'taken': false to every tile.
for(const tileId in tiles) {
  tiles[tileId].taken = false;
}
