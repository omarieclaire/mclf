const MESSAGES = {
  DEATH: {
    TRACKS: "Got stuck on the tracks! Double-tap to jump them!",
    TRAFFIC: "Hit by traffic! Watch out for vehicles!",
    DOOR: "Doored! Watch out for opening car doors!",
    PEDESTRIAN: "Pedestrian collision! Stay alert!",
    SHOP: "Crashed into a shop! Stay on the road!",
    STREETCAR: "Hit a streetcar! Watch out!", // New message for streetcar collision
  },
  GAME: {
    START: "Press LEFT/RIGHT arrow keys or click sides to move! Double-tap to jump tracks!",
    RESTART: (score) => `Game Over! Score: ${score} - Press any key to restart!`,
  },
};