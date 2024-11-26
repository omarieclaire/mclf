
// Add a building to LoserLane?

// https://marieflanagan.com/loserlane  

// ~~~Tips:
// *Max Width 10 characters / max height 9 characters
// *No Emoji (text only)

// ~~~Notes:
// *If drawing is scary, send me a building name instead and I’ll try to draw one for you.
// *If you want to improve an existing drawing, please do!



const TORONTO_BUILDINGS = [
    {
        name: "PIZZA_PIZZA",
        art: [
            "╔════════╗",
            "║ PIZZA  ║",
            "║PIZZA!! ║",
            "║ HOT &  ║",
            "║ GOOD & ║",
            "╚═══██═══╝"
        ]
    },
    {
        name: "SAIGON_LOTUS",
        artist: "mclf",
        art: [
            "┌~~~~~~~─┐",
            "│~~SAIGON│",
            "│LOTUS~~ │",
            "│ (/()\) │",
            "│\_\_/_/ │",
            "└~~~~~~~~┘"


     
        ]
    },
    {
        name: "TIM_HORTONS",
        art: [
            "┌✺─✺──✺─✺┐",
            "┌───┴┬───┘",
            "│ THE    │",
            "│COMMON  │",
            "│        │",
            "└────────┘"
        ]
    },
    {
        name: "DEATH_FACT",
        art: [
            "┌────────┐",
            "│74^^^^^ │",
            "│EACH^^^ │",
            "│YEAR^^^^│",
            "│74^^^^^ │",
            "└────────┘"
        ]
    },
    {
        name: "SHE_SAID_BOOM",
        art: [
            "┌────────┐",
            "│SHE     │",
            "│  SAID  │",
            "│BOOM    │",
            "└────────┘"
        ]
    },
    {
        name: "THE_LITTLE_JERRY",
        art: [
            "┌────────┐",
            "│ THE    │",
            "│LITTLE  │",
            "│ JERRY  │",
            "└────────┘"
        ]
    },

    {
        name: "SWEATY_BETTYS",
        art: [
            "┌────────┐",
            "│SWEATY  │",
            "│BETTY'S │",
            "│ *< >*  │",
            "└────────┘"
        ]
    },
    {
        name: "LCBO",
        art: [
            "   _____  ",
            "  ╱ ╲╱ ╲  ",
            "╭╴LCBO   │",
            "│ WINES  │",
            "│ GHOSTS │",
            "└────────┘"
        ]
    },
    {
        name: "MIMI",
        art: [
            "⸨⎻⎻⎻◄o►⎻⎻⸩",
            "│ MIMI'S │",
            "│⊰PLACE⊱ │",
            "│    ♡   │",
            "╚═⳺⳻⳺⳻⳺⳻═╝"
        ]
    },
    {
        name: "BARTLETTPARKETTE",
        art: [
            "┌────────┐",
            "│BARTLETT│",
            "│PARKETTE│",
            "│        │",
            "└────────┘"
        ]
    },
    {
        name: "WORLDOFPOSTERS",
        art: [
            "   ____   ",
            " ╱ ╲╱╲╱╲  ",
            "│WORLD OF│",
            "│ POSTERS│",
            "│ POSTERS│",
            "╰────────┘"
        ]
    },
    {
        name: "THEHOLYOAK",
        art: [
            "┌──╦──╦──┐",
            "│THE     │",
            "│HOLY    │",
            "│OAK     │",
            "└───╩────┘"
        ]
    },
    {
        name: "ROTIHOUSE",
        art: [
            "   ╱╲╱╲   ",
            " ╱╲╱╲╱╲╱╲ ",
            "╭─ROTI   │",
            "│ HOUSE  │",
            "│ FRESH! │",
            "└────────┘"
        ]
    },
    {
        name: "MOTHERINDIA",
        art: [
            "╔═══◊◊◊══╗",
            "│MOTHER  │",
            "│INDIA   │",
            "│ ROTI   │",
            "└────────┘"
        ]
    },
    {
        name: "DOUBLEDOUBLELAND",
        artist: "mclf",
        art: [
            "╒═════╤══╕",
            "│⋰⋱⋰⋱  │",
            "│ │DOUBLE│",
            "│ │DOUBLE│",
            "│ │LAND  │",
            "└ └──────│"
        ]
    },
    {
        name: "ARTSCAPE",
        art: [
            "┌───[]───┐",
            "│ART     │",
            "│SCAPE   │",
            "│  /|\\  │",
            "└────────┘"
        ]
    },
    {
        name: "WEEDWEED",
        art: [
            "┌═▲═▼═▼═─┐",
            "│WEED    │",
            "│ WEEED  │",
            "│  WEEEED│",
            "│  WEEEED│",
            "└────────┘"
        ]
    },
    {
        name: "GHANDIS",
        art: [
            "┌──(█)───┐",
            "│GHANDIS │",
            "│ ROTI   │",
            "│ YUM    │",
            "└────────┘"
        ]
    },
    {
        name: "VIDEOBOO",
        art: [
            "┌─(⌒∩∩⌒)─┐",
            "│VIDEO   │",
            "│ BOO    │",
            "│ BOO    │",
            "│ BOO    │",
            "│ *&*&*  │",
            "└────────┘"
        ]
    },
    {
        name: "HONESTEDS",
        art: [
            "┌────────┐",
            "│HONEST  │",
            "│ EDS    │",
            "│$$$$$$$$│",
            "│$$$$$$$$│",
            "│$$$$$$$$│",
            "└────────┘"
        ]
    },
    {
        name: "COFFEETHYME",
        art: [
            "┌───‡────┐",
            "│COFFEE  │",
            "« THYME  »",
            "│  ‡‡‡   │",
            "└────────┘"
        ]
    },
    {
        name: "CHRISTIE_PITS",
        art: [
            "┌────────┐",
            "│CHRISTIE│",
            "│  |   | │",
            "│  |   | │",
            "│  PITS  │",
            "└⚘─⚘──⚘─⚘┘"
        ]
    },
    {
        name: "HALO_HALO",
        art: [
            " ╭──────╮ ",
            "╭││HALO││╮",
            "│││HALO ││",
            "│││     ││",
            "╰┴┴─────┴╯"
        ]
    },
    {
        name: "SOYBOMB",
        artist: "mclf",
        art: [
            "┌◢╱╲◣◢╱╲◣",
            "│SOYBOMB │",
            "│(     ) │",
            "│ (___)  │",
            "└────────┘"
        ]
    },
    {
        name: "INFINITE_LIBRRY",
        art: [
            "┌────────┐",
            "│INFINITE│",
            "│LIBRARY │",
            "│        │",
            "└────────┘"
        ]
    },
    {
        name: "WHOSE_EMMA",
        art: [
            "┌────────┐",
            "│ WHO'S  │",
            "│ EMMA   │",
            "│ <><>   │",
            "└────────┘"
        ]
    },
    {
        name: "RANSACK_THE_UNIVERSE",
        art: [
            "┌─━━━╋━━─┐",
            "│RANSACK │",
            "│THE     │",
            "│UNIVERSE│",
            "└∞──∞∞──∞┘"
        ]
    },
    {
        name: "SNEAKY_DEES",
        art: [
            "┌─◢───◣──┐",
            "│SNEAKY  │",
            "│ DEES   │",
            "│        │",
            "└─◥───◤──┘"
        ]
    },
    {
        name: "LEES_PALACE",
        art: [
            "┏━━╋━━╋━━┓",
            "│LEE'S   │",
            "│ PALACE │",
            "│ %%%%   │",
            "┗━━╋━━╋━━┛"
        ]
    },
    {
        name: "TRINITY_BELLWOODS",
        art: [
            "┌────────┐",
            "│TRINITY │",
            "│BELL    │",
            "│   WOODS│",
            "└─⚘⚘⚘⚘⚘──┘"
        ]
    },
    {
        name: "THE_HO",
        art: [
            "┌─────‡──┐",
            "│ THE  ‡ │",
            "│ HO ‡   │",
            "│ PUB  ‡ │",
            "└∞──∞∞──∞┘"
        ]
    },
    {
        name: "THE_REX",
        art: [
            "┌◬◬◬◬◬◬◬◬┐",
            "│ THE    │",
            "│ REX    │",
            "│ JAZZ   │",
            "└─∿∿∿∿∿∿─┘"
        ]
    },
    {
        name: "QUEENS_PARK",
        art: [
            "┌──⫷─⫸──┐",
            "│QUEENS  │",
            "│ PARK   │",
            "│ GREEN  │",
            "└▒░▒▓░▓▒░┘"
        ]
    },
    {
        name: "BOVINE_SEX_CLUB",
        art: [
            "┌∃∃─∃∃─∃∃┐",
            "│ BOVINE │",
            "│ SEX    │",
            "│ CLUB   │",
            "└∄∄─∄∄─∄∄┘"
        ]
    },
    {
        name: "RIVOLI",
        art: [
            "    ┌✷─✷┐ ",
            "  ┌─✷─✷─┐ ",
            "┌─✷─✷─✷──┐",
            "│ RIVOLI │",
            "│ FOOD   │",
            "│ MUSIC  │",
            "└────────┘"
        ]
    },
    // {
    //     name: "KENSINGTON_MARKET",
    //     art: [
    //         "┌────────┐",
    //         "│KENSING │",
    //         "│TON     │",
    //         "│MARKET  │",
    //         "│MARKET  │",
    //         "└────────┘"
    //     ]
    // },
    {
        name: "CASA_LOMA",
        art: [
            "┌────ƒƒƒ─┐",
            "│ CASA ƒ │",
            "│LOMA ƒƒ │",
            "│    ƒƒ  │",
            "└─────ƒƒ─┘"
        ]
    },
    {
        name: "MONKEY_PAW",
        art: [
            "┌────────┐",
            "┌─⚘╱╲⚘╱╲─┐",
            "│ THE    │",
            "│MONKEY'S│",
            "│ PAW    │",
            "└≈≈≈≈≈≈≈≈┘"
        ]
    },
    {
        name: "BUDDHAS_RESTAURANT",
        art: [
            "┌────────┐",
            "│BUDDHA'S│",
            "│VEGAN   │",
            "│FOOOOOOD│",
            "└────────┘"
        ]
    },
    // {
    //     name: "CNE_EXHIBIT",
    //     art: [
    //         "┌✕─✕──✕─✕┐",
    //         "│ CNE ░░ │",
    //         "│EXHIBIT │",
    //         "│ FUN ░░░│",
    //         "└────────┘"
    //     ]
    // },
    {
        name: "OCAD",
        art: [
            "╭───╮╭───╮",
            "│   ││❀❀ │",
            "│❀❀ ││   │",
            "│___││❀❀ │",
            "│ ║╔═╣ ║ │",
            "│ ║╚═╣ ║ │",
            "│ ║ ║ ║ │ ",
            "╰─╨───╨─╯ "
        ]
    },
    {
        name: "OWLS_CLUB",
        art: [
            "    ∆     ",
            "  //║\\\  ",
            "///║║║\\\\",
            "║░▒▓ █▓▒░║",
            "║│ OWLS │║",
            "║│ CLUB │║",
            "╚╩══════╩╝"
        ]
    },
    {
        name: "DANK_BUDZ",
        art: [
            "╭═══╧════╮",
            "│ ░░░░░░ │",
            "│▒ DANK ▒│",
            "│ ░BUDZ░ │",
            "╰═╥═╦╦═╥═╯",
            " ▓▓▓  ▓▓▓ ",
            "╰═╥═╦╦═╥═╯",

        ]
    },

    {
        name: "HIGH_STUFFF",
        art: [
            "╭═══╧════╮",
            "│ ░HIGH░ │",
            "│▒STUFFF▒│",
            "╰═╥═╦╦═╥═╯",
            "  ║ ║║ ║  ",
            "╰┴┴─────┴╯"
        ]
    },


    {
        name: "WEEEED",
        art: [
            "╭═══╧════╮",
            "│∥≑≑≑∥∥≑≑│",
            "│≜ ≜ ≜≜ ≜│",
            "│∥∥≑∥∥≑∥∥│",
            "│⌡WEEEED⌠│",
            "│⌡⌠⌡⌠⌡⌠⌡⌠│",
            "└────────┘"
        ]
    },

    {
        name: "DANK_WEED",
        art: [
            "╭═══╧════╮",
            "│ ░DANK░ │",
            "│∷╳∷∷∷∷╳∷│",
            "│ ░WEED░ │",
            "╰═╥═╦╦═╥═╯",
            "  ║ ║║ ║  ",
            "└≈≈≈≈≈≈≈≈┘"
        ]
    },


    {
        name: "GREEN",
        art: [
            "╔═╌╌═╧═╌╌╗",
            "│╎╎GREEN╎│",
            "│╎╭╌╌╌╌╮╎│",
            "│╎│▞▚▞▚│╎│",
            "│╎│▞▚▞▚│╎│",
            "│╎│▞▚▞▚│╎│",
            "│╎╰╌╌╌╌╯╎│",
            "╰═╥═╦╦═╥═╯",
            " ║┆═══┆║ ",
            "└≈≈≈≈≈≈≈≈┘"
        ]
    },

    {
        name: "BwwwEOT",
        art: [
            "╭═══◇═══╮",
            "║   ╭╥╮  ║",
            "║  ╓╨╨╨╖ ║",
            "║┃ ┇⇋⇋┇ ┃║",
            "║┃ ┅┅ ┅ ┃║",
            "║WHY  GUY║",
            "║  ╙╨╨╨╜ ║",
            "║ ║║║ ║  ║",
            "╰════════╯"
        ]
    },
    {
        name: "JAVA_HUT",
        art: [
            ".__.__.__.", 
            "|__|__|__|",
            "|  |  |  |",
            "|JAVA HUT|",
            "|__|__|__|"
        ]
    },    
    {
        name: "SILVER_SNAIL",
        art: [
            "----..----",
            "|SILVER  |",
            "| SNAIL  |",
            "|/: || :\|",
            "|-' || '-|",
            "`---'`----"
        ]
    },

    {
        name: "BEEOT",
        art: [
            "╔═╌╌═╧═╌╌╗",
            "|\º /\ º/|",
            "| +-++-+ |",
            "| | || | |",
            "| |i||i| |",
            "| +-++-+ |",
            "|/__\/__\|",
            "└────────┘"

        ]
    },
    {
        name: "NAZARETH",
        art: [
          "██████████",
          "║ ░ ░░ ░ ║",
          "║NAZARETH║",
          "║ ▒▒▒▒▒▒ ║",
          "╰────────╯",
        ],
      },
    {
        name: "APT",
        art: [
            "▓▓▓▓▓▓▓▓▓▓",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ❐ ❒❒ ❒ ║",
            "║ ══════ ║",
            "║ ░░░░░░ ║",
            "╰╩╩╩╩╩╩╩╩╯"
        ]
    },

    {
        name: "APT1",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ❐ ❒❒ ❒ ║",
          "║ ❐ ❒❒ ❒ ║",
          "║ ══════ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
      {
        name: "VESTA_LUNCH",
        art: [
          "▓▓/▓|▓▓\▓▓",
          "║ ❐ ❒❒ ❒ ║",
          "║ VESTA  ║",
          "║ LUNCH  ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
    
      {
        name: "APT2",
        art: [
          "██████████",
          "║ ░ ░░ ░ ║",
          "║ ░ ░░ ░ ║",
          "║ ░ ░░ ░ ║",
          "║ ░ ░░ ░ ║",
          "║ ░ ░░ ░ ║",
          "║ ────── ║",
          "║ ▒▒▒▒▒▒ ║",
          "╰────────╯",
        ],
      },
    
      {
        name: "APT3",
        art: [
          "▓▓▓▓▓▓▓▓▓",
          "║ ○● ●● ║",
          "║ ○● ●● ║",
          "║ ○● ●● ║",
          "║ ───── ║",
          "║ ░░░░░ ║",
          "╰╩╩╩╩╩╩╩╯",
        ],
      },
    
      {
        name: "APT4",
        art: [
          "█████████",
          "║ ▒ ▒▒ ▒ ║",
          "║ ▒ ▒▒ ▒ ║",
          "║ ▒ ▒▒ ▒ ║",
          "║ ══════ ║",
          "║ ░░░░░░ ║",
          "╰────────╯",
        ],
      },
    
    //   {
    //     name: "APT5",
    //     art: [
    //       "▓▓▓▓▓▓▓▓▓▓",
    //       "║ ▲ ▲▲ ▲ ║",
    //       "║ ══════ ║",
    //       "║ ██████ ║",
    //       "╰╩╩╩╩╩╩╩╩╯",
    //     ],
    //   },
    
      {
        name: "APT6",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ≈ ≈≈ ≈ ║",
          "║ ▒ ▒▒ ▒ ║",
          "║ ≈ ≈≈ ≈ ║",
          "║ ────── ║",
          "║ ▒▒▒▒▒▒ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
      {
        name: "JANKIES_PLACE",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ▒▒▒▒▒▒ ║",
          "║JANKIE'S║",
          "║ ─PLACE-║",
          "║ ▒▒▒▒▒▒ ║",   
          "╰────────╯",
        ],
      },
      {
        name: "APT8",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ► ◄► ◄ ║",
          "║ ► ◄► ◄ ║",
          "║ ══════ ║",
          "║ ░░░░░░ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
      {
        name: "48_MILLION",
        art: [
          "██████████",
          "║ ◆ 48 ◆ ║",
          "║ MILLION║",
          "║ ══════ ║",
          "║ ▒▒▒▒▒▒ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
    
      {
        name: "APT10",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ✱ ✱✱ ✱ ║",
          "║ ✱ ✱✱ ✱ ║",
          "║ ────── ║",
          "║ ░░░░░░ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
      {
        name: "180_NAIRN",
        art: [
             "    ||    ",
             "  |    |  ",
             " |      │ ",
             "|  180   │",
             "│  NAIRN |",
             "╰────────╯"
          ],
      },
  
      {
        name: "APT11",
        art: [
          "██████████",
          "║ ░ ░░ ░ ║",
          "║ ░ ░░ ░ ║",
          "║ ────── ║",
          "║ ▒▒▒▒▒▒ ║",
          "╰────────╯",
        ],
      },
    
      {
        name: "APT12",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ○●● ●● ║",
          "║ ○●● ●● ║",
          "║ ○●● ●● ║",
          "║ ────── ║",
          "║ ░░░░░░ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
    
    //   {
    //     name: "APT13",
    //     art: [
    //       "██████████",
    //       "║ ══════ ║",
    //       "║ ░░░░░░ ║",
    //       "╰────────╯",
    //     ],
    //   },
    
      {
        name: "APT14",
        art: [
          "▓▓▓▓▓▓▓▓▓▓",
          "║ ▲ ▲ ▲  ║",
          "║ ▲ ▲ ▲  ║",
          "║ ██████ ║",
          "╰╩╩╩╩╩╩╩╩╯",
        ],
      },
      



      {
        name: "BROCKTON_HAUNT",
        art: [
            "╭────────╮",
            "│BROCK   │",
            "│TON     │",
            "│HAUNT   │",
            "༼つ╹ ╹ ༽つ│",
            "╰────────╯"
        ],
    },
    {
        name: "PHO_HUNG",
        art: [
            ":::::::::",
            "!       !",
            "!       !",
            "! PHO   !",
            "! HUNG  !",
            "!       !",
            "!       !",
            ":::::::::"
           
        ],
    },
    {
        name: "DUFFERIN_MALL",
        art: [
            "::::::::::",
            "!        !",
            "!DUFFERIN!",
            "! MALL   !",
            "!   __   !",
            "!  :  :  !",
            "!  :  :  !",
            "::::  ::::"           
        ],
    },
    {
       	name: "TAROT_CARDS",
   	    artist: "d6",
   	    art: [
           	" ◢⬒⬒◣◢⬒⬒◣",
           	"◢⊞TAROT♀⊞◣",
           	"││♂CARDS││",
           	"││⊞⊞∏∏⊞⊞││",
           	"╰┴──────┴╯"
        ]
    },


    {
        name: "VALLO_BIKES",
        artist: "B. R. Atislava",
        art: [
            " ︻︻︻︻︻︻︻︻ ",
            "| VALLO’S|",
            "|⌾BIKES⌾ |",
            "|========|",
            "|==〚  〛==|",
            ".........."
     ]
 },

 {
    name: "IRONIC",
    artist: "nexy",
    art: [
        " ♡♥♡♥♡♥♡♥ ",
        "││come as╮",
        "││you are│",
        "││☆.｡* ⚧││",
        "╰┴──────┴╯"

 ]
},

    {
        name: "HIVISCASTLE", 
        artist: "KDI",
        art: [
            "   /\   /\\",
            "/\ ||_/\||",
            "||/__ ||/|",
            "|Hi-Vis| |",
            "|Castle| |",
            "|______|/ "

     ]
 },

 {
    name: "WHOSE_TACOS",
    artist: "nexy",
    art: [
        "┌────────┐",
        "│ ⊞ ⊞ ⊞  │",
        "│GUSTACOS│",
        "│  ｡𖦹°‧ │",
		"│  ⊹ ࣪ ˖ │",
        "└────────┘"

 ]
},

{
    name: "BAY_STREET_VIDEO",
    artist: "katie jensen",
    art: [
        " ✦ ☾ ✧ ☁  ",
        "≡█▓≡█▓≡█▓≡",
        "⌼ BAY ☺  ⌼",
        "⌼ STREET ⌼",
        "⌼ VIDEO  ⌼",
 		"⌼ « ▶ ⏏  ⌼",
        "⌼ ⍁⍂ ⍁⍂  ⌼"

 ]
},
{
    name: "PRICE_WAR",
    artist: "katie jensen",
    art: [
        " _________",
        "↼↼↼↼↼⇀⇀⇀⇀⇀",
        "│₱R¡¢∑ωαπ│",
        "│⬚ ✳ ☠ $ │",
        "╰≛≛≛≛≛≛≛≛╯"
 ]
},


{
    name: "LARRYS_FOLLY",
    artist: "katie jensen",
    art: [
        "⌯⌯⌯⤚⤙⌯⌯⌯⌯⌯",
        "│ ⊹   ⬚  │",
        "│LARRY’S │",
        "│FOLLY ♨ │",
        "└───⟿───┘"
 ]
},

{
    name: "BEGUILING",
    artist: "FP",
    art: [
        "[[[[[]]]]]",
        "│{COMICS}│",
        "│││\\\\│││",
        "│││    │││",
        "╰┴┴────┴┴╯"

 ]
},

{
    name: "HECATEBEE",
    artist: "Bea",
    art: [
        " ❀⁑╲☾☽╱⁑❀",
        "╭│⁂BEE ⁂╮",
        "││⁂THE ⁂│",
        "││M❂☾☽N⁂│",
        "╰┴┴─────┴╯"

 ]
},

{
    name: "LANTERN_ROUGE_CUBHOUSE",
    artist: "MOTCH",
    art: [
       " ◢╱╲◣ ◢╱╲◣",
       "╭│LANTERN╮",
       "│  ROUGE │",
       "│CUBHOUSE│",
       "╰┴──────┴╯"
 ]
},



{
    name: "WEIRD_CABIN",
    artist: "FADA",
    art: [
        " ◢╱╲◣ ◢╱╲◣",
        "╭││WEIRD│╮",
        "│││CABIN││",
        "│││    ♾││",
        "╰┴┴─────┴╯"


 ]
},


{
    name: "THE_DOCK_ELLIS",
    artist: "Nathan",
    art: [
        " _______",
        "╭│THE   │╮",
        "││ DOCK ││",
        "││ELLIS ││",
        "╰┴──────┴╯"
 ]
},

{
    name: "THE_DOCK_ELLIS",
    artist: "Nathan",
    art: [
        " _________",
        "╭ FIF-   ╮",
        "│ TEEN   │",
        "│TWELVE  │",
        "|   ✂    |",
        "╰────────╯"

 ]
},

{
    name: "RIGHT__HOOK",
    artist: "KingBain",
    art: [
        "⬣⬒⬒⬒⬒⬒⬒⬒⬒⬣",
        "⬣Right ↱ ⬣",
        "⬣ ⇎⇎⇎⇎   ⬣",
        "⬣   HooK ⬣",
        "⬣⬓⬓⬓⬓⬓⬓⬓⬓⬣"

 ]
},

{
    name: "SQUIRLYS",
    artist: "weftandweaving",
    art: [
        "╭SQUIRLYS╮",
        "│││    ╭⌼│",
        "│││    │⌼│",
        "│││ ⊡  ╰⌼│",
        "╰┴┴─⍌────╯"
 ]
}

];

// console.log('Buildings loaded:', TORONTO_BUILDINGS.length);


function checkBuildingWidth(buildings) {
    const nonCompliantBuildings = buildings.filter(building => 
        building.art.some(line => line.length > 10)
    );

    if (nonCompliantBuildings.length > 0) {
        console.log("Non-compliant buildings (lines over 10 characters):");
        nonCompliantBuildings.forEach(building => console.log(building.name));
    } else {
        console.log("All buildings are compliant.");
    }
}

checkBuildingWidth(TORONTO_BUILDINGS);



    
                         

