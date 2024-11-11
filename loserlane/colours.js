const STYLES = {
  RESET: "</span>",
  TRAFFIC: "<span style='color: #FFFF00'>", // Yellow
  TTC: "<span style='color: #FF0000; background-color: #660000'>", // Red with Dark Red background
  BIKE: "<span style='color: #00FFFF'>", // Cyan
  PARKED: "<span style='color: #AAAAAA'>", // Medium Gray
  PEDESTRIAN: "<span style='color: #00FFFF'>", // Cyan
  SIDEWALK: "<span style='background-color: #333333'>", // Dark Gray
  SHOPS: "<span style='color: #FFFFFF'>", // White
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

const EXPLOSION_COLORS = [
  STYLES.TRAFFIC, // Default red
  STYLES.BIKE, // Player color
  STYLES.TRACKS, // Track color
  "<span style='color: #FFA500'>", // Orange
  "<span style='color: #FFD700'>", // Gold
  "<span style='color: #FF69B4'>", // Pink
  "<span style='color: #FF4500'>", // Orange Red
];
