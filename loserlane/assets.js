// Game Entities
const ENTITIES = {
    BIKE: {
        art: [" o ", " ╪", " o "],
        width: 3,
        height: 3
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

    ONCOMINGCAR: {
        art: [
            " ┌───┐",
            " │▀▀▀│",
            " |   │ ",
            " │▀▀▀│",
            " ╰.─.╯",
            "    "
        ],
        width: 7,
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
            "-- ▀▀▀│ ",
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
            "┌──────┐",
            "│PIZZA │",
            "│PIZZA │",
            "│ HOT! │",
            "└──────┘"
        ]
    },
    {
        name: "TIM_HORTONS",
        art: [
            "┌──────┐",
            "│TIMS  │",
            "│COFFEE│",
            "│& FOOD│",
            "└──────┘"
        ]
    },
    {
        name: "LCBO",
        art: [
            "┌──────┐",
            "│ LCBO │",
            "│WINES │",
            "│SPIRIT│",
            "└──────┘"
        ]
    },
    {
        name: "SHOPPERS",
        art: [
            "┌──────┐",
            "│SHOPR │",
            "│DRUG  │",
            "│MART  │",
            "└──────┘"
        ]
    },
    {
        name: "ROTI",
        art: [
            "┌──────┐",
            "│ROTI  │",
            "│HOUSE │",
            "│FRESH!│",
            "└──────┘"
        ]
    },
    {
        name: "DOUBLE_DOUBLE_LAND",
        art: [
            "┌──────┐",
            "│DOUBLE│",
            "│DOUBLE│",
            "│ LAND │",
            "└──────┘"
        ]
    },
    {
        name: "ARTSCAPE",
        art: [
            "┌──────┐",
            "│ART   │",
            "│SCAPE │",
            "│ HUB  │",
            "└──────┘"
        ]
    },
    {
        name: "DISTILLERY_ARTS",
        art: [
            "┌──────┐",
            "│DISTIL│",
            "│LERY  │",
            "│ ARTS │",
            "└──────┘"
        ]
    },
    {
        name: "THE_LOON",
        art: [
            "┌──────┐",
            "│ THE  │",
            "│ LOON │",
            "│ SPACE│",
            "└──────┘"
        ]
    },
    {
        name: "VIDEOFAG",
        art: [
            "┌──────┐",
            "│VIDEO │",
            "│ TAG  │",
            "│ SPACE│",
            "└──────┘"
        ]
    }
];
