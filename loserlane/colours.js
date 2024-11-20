const STYLES = {
  RESET: "</span>",
  TRAFFIC: "<span style='color: #FFFF00'>", // Yellow
  TTC: "<span style='color: #FF0000; background-color: #660000'>", // Red with Dark Red background
  BIKE: "<span style='color: #00FFFF'>", // Cyan
  // PARKED: "<span style='color: #AAAAAA'>", // Medium Gray
  WANDERER: "<span style='color: #00FFFF'>", // Cyan
  SIDEWALK: "<span style='background-color: #333333'>", // Dark Gray
  // BUILDINGS: "<span style='color: #FFFFFF'>", // White
  TRACKS: "<span style='color: #444444'>", // Dark Gray
};

const COLOURS = {
  BUILDINGS: [
    "#FF9999", // Soft Pink
    "#99FF99", // Light Mint Green
    "#9999FF", // Soft Lavender
    "#FFFF99", // Soft Yellow
    "#FF99FF", // Light Orchid
    "#99FFFF", // Soft Aqua
    "#66FF66", // Bright Mint Green
    "#66B2FF", // Sky Blue
    "#FFFF66", // Lemon Yellow
    "#FF66FF", // Fuchsia
    "#FFCC99", // Peach
    "#FFCC66", // Soft Orange
    "#66FFCC", // Mint Aqua
    "#CC99FF", // Lavender Purple
    "#FF6666", // Coral
    "#66FF99", // Pale Green
    "#FF6699", // Rose Pink
    "#66FFFF", // Light Cyan
    "#FF9966", // Warm Peach
    "#99CCFF", // Light Sky Blue
  ],

  VEHICLES: [
    "#A07A7A", // Muted Pink
    "#7AA07A", // Muted Mint Green
    "#7A7AA0", // Muted Lavender
    "#A0A07A", // Muted Yellow
    "#A07AA0", // Muted Orchid
    "#7AA0A0", // Muted Aqua
    "#4F7A4F", // Muted Mint
    "#4F7A8C", // Muted Sky Blue
    "#A0A04F", // Muted Lemon
    "#A07AA0", // Muted Fuchsia
    "#A0806D", // Muted Peach
    "#A06D4F", // Muted Orange
    "#4F8C7A", // Muted Aqua Mint
    "#7A4FA0", // Muted Purple
    "#A04F4F", // Muted Coral
    "#7AA07A", // Muted Pale Green
    "#A07A7A", // Muted Rose
    "#4F7AA0", // Muted Cyan
    "#A07A6D", // Muted Warm Peach
    "#7A96A0", // Muted Light Sky Blue
  ],
};

// const EXPLOSION_COLOURS = [
//   STYLES.TRAFFIC, // Default red
//   STYLES.BIKE, // Bike colour
//   STYLES.TRACKS, // Track colour
//   "<span style='colour: #FFA500'>", // Orange
//   // "<span style='colour: #FF69B4'>", // Pink
//   "<span style='colour: #FF4500'>", // Orange Red
// ];
const EXPLOSION_COLOURS = [
  STYLES.TRAFFIC, // Default red
  // STYLES.BIKE,        // Bike colour
  STYLES.TRACKS, // Track colour
  "<span style='colour: #FF4500'>", // Orange Red
  "<span style='colour: #FF5722'>", // Deep Orange
  "<span style='colour: #FF6347'>", // Tomato
  "<span style='colour: #FF7043'>", // Deep Orange 400
  "<span style='colour: #FF7F50'>", // Coral
  "<span style='colour: #FF8C00'>", // Dark Orange
  "<span style='colour: #FFA07A'>", // Light Salmon
  "<span style='colour: #E65100'>", // Deep Orange 900
  "<span style='colour: #FF5252'>", // Red Accent 200
  "<span style='colour: #FF6E40'>", // Deep Orange Accent 200
  "<span style='colour: #FF3D00'>", // Deep Orange Accent 400
  "<span style='colour: #DD2C00'>", // Deep Orange Accent 700
  "<span style='colour: #BF360C'>", // Deep Orange 900
  "<span style='colour: #FF6B6B'>", // Reddish
  "<span style='colour: #FF7043'>", // Warm Orange
  "<span style='colour: #F4511E'>", // Deep Orange 600
  "<span style='colour: #FF5722'>", // Material Deep Orange
];

const peopleCol = [
  // '#FFE0BD', // Light
  // '#FF7F50', // Coral

  // '#FFD1AA', // Light medium
  // '#EEB38D', // Medium
  // '#C68642', // Medium dark
  // '#8D5524', // Dark
  // '#4C3024', // Very dark

  '#FFD1DC', // Pastel pink
  '#FFB6C1', // Light pink
  '#FFEC8B', // Light yellow
  '#B0E57C', // Pastel green
  '#ADD8E6', // Light blue
  '#D1C4E9', // Lavender
  '#F5DEB3', // Light wheat
  '#FFC0CB', // Baby pink
  '#FFFACD', // Lemon chiffon
  '#FFE4E1', // Misty rose
  '#E0FFFF', // Light cyan
  '#F0E68C', // Khaki
  '#FAEBD7', // Antique white
];
