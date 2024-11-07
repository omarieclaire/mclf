const MESSAGES = {
  DEATH: {
    TRACKS: [
      { reason: "STREETCAR TRACKS", funny: "Track smack! Double tap to get past that" },
      { reason: "STREETCAR TRACKS", funny: "Stuck on the rails? Double-tap won't fail" },
      { reason: "STREETCAR TRACKS", funny: "Rail fail? Tap twice to prevail!" }
    ],
    TRAFFIC: [
      { reason: "UGH CARS", funny: "Clash crash cash!" },
      { reason: "UGH CARS", funny: "Bam! Jam! Slam!" },
      { reason: "UGH CARS", funny: "Zoomed by doom!" },
      { reason: "UGH CARS", funny: "Chariot smack!" },
      { reason: "UGH CARS", funny: "Wheel squeal bad deal!" }
    ],
    DOOR: [
      { reason: "DOORED", funny: "Doored! Ignored!" },
      { reason: "DOORED", funny: "Door score!" },
      { reason: "DOORED", funny: "Sneak a peek don't freak!" },
      { reason: "DOORED", funny: "Bam! Door slam! Avoid the jam!" },
      { reason: "DOORED", funny: "Peekaboo!" },
      { reason: "DOORED", funny: "Door smack! Next time, hop back!" },
      { reason: "DOORED", funny: "Hop back, don’t crack!" },

    ],
    PEDESTRIAN: [
      { reason: "NOOOO", funny: "Pedestrian mess! Next time, finesse!" },
      { reason: "NOOOO", funny: "Crash! Flash human bash!" },
      { reason: "NOOOO", funny: "Ouch! Scoot away, pouch!" },
      { reason: "NOOOO", funny: "Clock! Human roadblock!" },
      { reason: "NOOOO", funny: "People pop! You gotta stop!" }
    ],
    SHOP: [
      { reason: "OOPS", funny: "Shop drop! Street's your stop!" },
      { reason: "OOPS", funny: "Boop! Into the shoop?" },
      { reason: "OOPS", funny: "Retail fail! Stay on the trail!" },
      { reason: "OOPS", funny: "Shop smack! Street’s where you pack!" },
      { reason: "OOPS", funny: "Crash! Store stash!" },
      { reason: "OOPS", funny: "Do the math! Stick to your path!" }

    ],
    STREETCAR: [
      { reason: "STREETCAR SMOOCH", funny: "Streetcar zap! That’s a wrap!" },
      { reason: "STREETCAR SMOOCH", funny: "Streetcar clash – hop, dash!" },
      { reason: "STREETCAR SMOOCH", funny: "Boom! Streetcar in the room!" },
      { reason: "STREETCAR SMOOCH", funny: "Tracks end! You bend!" },
      { reason: "STREETCAR SMOOCH", funny: "Zap! Transit trap!" }
    ]
  },
  GAME: {
    START: "Left/Right to swerve, double-tap to jump the curve",
    RESTART: (score) => `Out of luck! Alive for ${score} seconds - Tap to try again!`
  }
};