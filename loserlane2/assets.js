// Game Entities

// art: 
// [" o ", 
// " ╪", 
// " o "],

// console.log('Assets loaded:');


const DARLINGS = {
    BIKE: {
        art: 
        [" O ", 
         "^|^", 
         " O "],

        width: 3,
        height: 3
    },
    WANDERER: {
        UP: {
            art: [
                "○", 
                "╽"
            ],
            width: 1,
            height: 2
        },
        DOWN: {
            art: [
                "○", 
                "╿"
            ],
            width: 1,
            height: 2
        },
        CROSSING: {
            art: [
                "○", 
                "╿"
            ],
            width: 1,
            height: 2
        }
    },
    TTC: {
        art: [
            "┌0--─0┐",
            "│▀▀▀▀▀│",
            "│  T  │",
            "│  T  │",
            "│  C  │",
            "│     │",
            "│     │",
            "│     │",
            "└─────┘"
        ],
        width: 7,
        height: 9
    },

    MOVINGDEATHMACHINE: {
        art: [
            "┌.─.┐",
            "│▀▀▀│",
            "|   │",
            "│▀▀▀│",
            "╰───╯"
        ],
        width: 5,
        height: 6
    },
    ONCOMINGDEATHMACHINE: {
        art: [
            "┌───┐",
            "│▀▀▀│",
            "|   │",
            "│▀▀▀│",
            "╰.─.╯"
        ],
        width: 5,
        height: 6
    },
    DEATHMACHINE: {
        art: [
            " ┌.─.┐",
            " │▀▀▀│",
            " |   │ ",
            " │▀▀▀│",
            " ╰───╯"
        ],
        width: 7,
        height: 6
    },
    PARKED_DEATHMACHINE_STATES: [
        // State 0: Closed
        [
            "  ┌.─.┐ ",
            "  │▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ],
        // State 1: Slightly open
        [
            "  ┌.─.┐ ",
            "  /▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ],
        // State 2: More open
        [
            "  ┌.─.┐ ",
            " / ▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ],
        // State 3: Even more open
        [
            "  ┌.─.┐ ",
            " /-▀▀▀│ ",
            "/ |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ],
        // State 4: Fully open
        [
            "  ┌.─.┐ ",
            "── ▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ]
    ],
    
    EXPLOSION: {
        art: ["\\|/", "-X-", "/|\\"],
        width: 4,
        height: 3
    }
};

const EXPLOSION_FRAMES = {
    frame1: [
      "  \\|/  ",
      "--(X)--",
      "  /|\\  "
    ],
    frame2: [
      "  \\○/  ",
      "--(*>--",
      "  /○\\  "
    ],
    frame3: [
      " \\○●/  ",
      "-(*+)- ",
      " /●○\\  "
    ],
    frame4: [
      "\\○●⚡/ ",
      "(* ★ )-",
      "/●○⚡\\ "
    ],
    frame5: [
      "\\●★⚡/ ",
      "(*❂+)-",
      "/⚡★●\\ "
    ]
  };

