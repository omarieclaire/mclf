// Game Entities

// art: 
// [" o ", 
// " ╪", 
// " o "],

console.log('Assets loaded:');


const ENTITIES = {
    BIKE: {
        art: 
        [" O ", 
         "^|^", 
         " O "],

        width: 3,
        height: 3
    },
    PEDESTRIAN: {
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
    STREETCAR: {
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

    MOVINGCAR: {
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
    ONCOMINGCAR: {
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
    CAR: {
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
    PARKED_CAR_STATES: [
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

