const MESSAGES = {
  DEATH: {
    TRACKS: [
      { reason: "TRACKS!", funny: "Track smack! Double tap to get past that" },
      { reason: "TRACKS!", funny: "Stuck on the rails? Give double-tap a sail!" },
      { reason: "TRACKS!", funny: "Rail fail! Tap twice and prevail!" }
    ],
    TRAFFIC: [
      { reason: "CAR!", funny: "Car crash clash!" },
      { reason: "CAR!", funny: "Bam! Car jam! Avoid that slam!" },
      { reason: "CAR!", funny: "Zoomed by doom! Dodge the room!" },
      { reason: "CAR!", funny: "Traffic smack! Hop back, don’t crack!" },
      { reason: "CAR!", funny: "Wheels squeal! Keep it real, no deal!" }
    ],
    DOOR: [
      { reason: "DOOR!", funny: "Doored! Next time, ignore!" },
      { reason: "DOOR!", funny: "Door score! Avoid that chore!" },
      { reason: "DOOR!", funny: "Sneak peek door smack! Tap and jump back!" },
      { reason: "DOOR!", funny: "Bam! Door slam! Avoid the jam!" },
      { reason: "DOOR!", funny: "Peekaboo – the door got you!" },
      { reason: "DOOR!", funny: "Door smack! Next time, hop back!" }
    ],
    PEDESTRIAN: [
      { reason: "NOOOO!", funny: "Pedestrian mess! Next time, finesse!" },
      { reason: "NOOOO!", funny: "Crash! Human bash! Try for a flash!" },
      { reason: "NOOOO!", funny: "Ouch! People pouch! Scoot away, crouch!" },
      { reason: "NOOOO!", funny: "Human roadblock! Next time, clock!" },
      { reason: "NOOOO!", funny: "Whoops! People pop – try to stop!" }
    ],
    SHOP: [
      { reason: "BAD BIKE!", funny: "Shop drop! Street's your stop!" },
      { reason: "BAD BIKE!", funny: "Oops! Into the shop – back to the prop!" },
      { reason: "BAD BIKE!", funny: "Retail fail! Stay on the trail!" },
      { reason: "BAD BIKE!", funny: "Shop smack! Street’s where you pack!" },
      { reason: "BAD BIKE!", funny: "Crash! Store stash! Stick to your path!" }
    ],
    STREETCAR: [
      { reason: "STREETCAR!", funny: "Streetcar zap! That’s a wrap!" },
      { reason: "STREETCAR!", funny: "Streetcar clash – hop, then dash!" },
      { reason: "STREETCAR!", funny: "Boom! Streetcar loom! Make some room!" },
      { reason: "STREETCAR!", funny: "Tracks defend – end of the bend!" },
      { reason: "STREETCAR!", funny: "Zap! Transit trap! Plan your next lap!" }
    ]
  },
  GAME: {
    START: "Left/Right to swerve, double-tap to jump the curve!",
    RESTART: (score) => `Out of luck! Alive for ${score} seconds - Tap to try again!`
  }
};