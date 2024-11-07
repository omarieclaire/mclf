// Game Entities

// art: 
// [" o ", 
// " ╪", 
// " o "],


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
                " ○ ", 
                " ╽ "
            ],
            width: 1,
            height: 2
        },
        DOWN: {
            art: [
                " ○ ", 
                " ╿ "
            ],
            width: 1,
            height: 2
        },
        CROSSING: {
            art: [
                " ○ ", 
                " ┴ "
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
            "|   │ ",
            "│▀▀▀│",
            "╰───╯",
            "    "
        ],
        width: 5,
        height: 6
    },
    ONCOMINGCAR: {
        art: [
            "┌───┐",
            "│▀▀▀│",
            "|   │ ",
            "│▀▀▀│",
            "╰.─.╯",
            "    "
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
            " ╰───╯",
            "    "
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
            "  ╰───╯ ",
            "     "
        ],
        // State 1: Slightly open
        [
            "  ┌.─.┐ ",
            "  /▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ ",
            "    "
        ],
        // State 2: More open
        [
            "  ┌.─.┐ ",
            " / ▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ ",
            "    "
        ],
        // State 3: Even more open
        [
            "  ┌.─.┐ ",
            " /-▀▀▀│ ",
            "/ |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ ",
            "    "
        ],
        // State 4: Fully open
        [
            "  ┌.─.┐ ",
            "── ▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ ",
            "    "
        ]
    ],
    PEDESTRIAN: {
        UP: {
            art: ["○", "╽"],
            width: 1,
            height: 2
        },
        DOWN: {
            art: ["○", "╿"],
            width: 1,
            height: 2
        },
        CROSSING: {
            art: ["○", "┴"],
            width: 1,
            height: 2
        }
    },
    EXPLOSION: {
        art: ["\\|/", "-X-", "/|\\"],
        width: 4,
        height: 3
    }
};

const TORONTO_SHOPS = [
    {
        name: "PIZZA_PIZZA",
        art: [
            "┌────────┐",
            "│PIZZA   │",
            "│PIZZA   │",
            "│ HOT!   │",
            "└────────┘"
        ]
    },
    {
        name: "TIM_HORTONS",
        art: [
            "┌────────┐",
            "│TIMS    │",
            "│COFFEE  │",
            "│& FOOD  │",
            "└────────┘"
        ]
    },
    {
        name: "LCBO",
        art: [
            "┌────────┐",
            "│ LCBO   │",
            "│WINES   │",
            "│SPIRIT  │",
            "└────────┘"
        ]
    },
    {
        name: "SHOPPERS",
        art: [
            "┌────────┐",
            "│SHOPPERS│",
            "│DRUG    │",
            "│MART    │",
            "└────────┘"
        ]
    },
    {
        name: "ROTI",
        art: [
            "┌────────┐",
            "│ROTI    │",
            "│HOUSE   │",
            "│FRESH!  │",
            "└────────┘"
        ]
    },
    {
        name: "DOUBLE_DOUBLE_LAND",
        art: [
            "┌────────┐",
            "│DOUBLE  │",
            "│DOUBLE  │",
            "│ LAND   │",
            "└────────┘"
        ]
    },
    {
        name: "ARTSCAPE",
        art: [
            "┌────────┐",
            "│ART     │",
            "│SCAPE   │",
            "│ @@@    │",
            "└────────┘"
        ]
    },
    {
        name: "DISTILLERY_ARTS",
        art: [
            "┌────────┐",
            "│WEED    │",
            "│ WEEED  │",
            "│  WEEEED│",
            "└────────┘"
        ]
    },
    {
        name: "THE_LOON",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│ LOON   │",
            "│ SPACE  │",
            "└────────┘"
        ]
    },
    {
        name: "VIDEOFAG",
        art: [
            "┌────────┐",
            "│VIDEO   │",
            "│ TAG    │",
            "│ *&*&*  │",
            "└────────┘"
        ]
    },
    {
        name: "HONEST_EDS",
        art: [
            "┌────────┐",
            "│HONEST  │",
            "│ EDS    │",
            "│$$$$$$$$│",
            "└────────┘"
        ]
    },
    {
        name: "CHRISTIE_PITS",
        art: [
            "┌────────┐",
            "│CHRISTIE│",
            "│  PITS  │",
            "│PARK    │",
            "└────────┘"
        ]
    },
    {
        name: "HALO_HALO",
        art: [
            "┌────────┐",
            "│HALO    │",
            "│ HALO   │",
            "│DESSERT │",
            "└────────┘"
        ]
    },
    {
        name: "HONEST_EDS",
        art: [
            "┌────────┐",
            "│COFFEE  │",
            "│ THYME  │",
            "│        xs│",
            "└────────┘"
        ]
    },
    {
        name: "SOYBOMB",
        art: [
            "┌────────┐",
            "│SOY     │",
            "│BOMB    │",
            "│ !!!!!  │",
            "└────────┘"
        ]
    },
    {
        name: "INFINITE_LIBRARY",
        art: [
            "┌────────┐",
            "│INFINITE│",
            "│LIBRARY │",
            "│BOOKS   │",
            "└────────┘"
        ]
    },
    {
        name: "THE_DRAPE",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│ DRAPE  │",
            "│ LIVE   │",
            "└────────┘"
        ]
    },
    {
        name: "SNEAKY_DEES",
        art: [
            "┌────────┐",
            "│SNEAKY  │",
            "│ DEES   │",
            "│ NACHOS │",
            "└────────┘"
        ]
    },
    {
        name: "LEE'S_PALACE",
        art: [
            "┌────────┐",
            "│LEE'S   │",
            "│ PALACE │",
            "│ %%%%   │",
            "└────────┘"
        ]
    },
    {
        name: "TRINITY_BELLWOODS",
        art: [
            "┌────────┐",
            "│TRINITY │",
            "│BELLWDS │",
            "│ :::::  │",
            "└────────┘"
        ]
    },
    {
        name: "THE_HO",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│ HO     │",
            "│ PUB    │",
            "└────────┘"
        ]
    },
    {
        name: "THE_REX",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│ REX    │",
            "│ JAZZ   │",
            "└────────┘"
        ]
    },
    {
        name: "QUEENS_PARK",
        art: [
            "┌────────┐",
            "│QUEENS  │",
            "│ PARK   │",
            "│ GREEN  │",
            "└────────┘"
        ]
    },
    {
        name: "BOVINE_SEX_CLUB",
        art: [
            "┌────────┐",
            "│ BOVINE │",
            "│ SEX    │",
            "│ CLUB   │",
            "└────────┘"
        ]
    },
    {
        name: "RIVOLI",
        art: [
            "┌────────┐",
            "│ RIVOLI │",
            "│ FOOD   │",
            "│ MUSIC  │",
            "└────────┘"
        ]
    },
    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│ CN     │",
            "│TOWER   │",
            "│        │",
            "└────────┘"
        ]
    },
    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│KENSING │",
            "│TON     │",
            "│MARKET  │",
            "└────────┘"
        ]
    },
    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│ CASA   │",
            "│LOMA    │",
            "│        │",
            "└────────┘"
        ]
    },    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│MONKEYS │",
            "│ PAW    │",
            "└────────┘"
        ]
    },    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│BUDDHA'S│",
            "│VEGAN   │",
            "│RESTARNT│",
            "└────────┘"
        ]
    },    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│ CNE    │",
            "│EXHIBIT │",
            "│ FUN    │",
            "└────────┘"
        ]
    },    {
        name: "CNE",
        art: [
            "┌────────┐",
            "│ CNE    │",
            "│EXHIBIT │",
            "│ FUN    │",
            "└────────┘"
        ]
    }
];