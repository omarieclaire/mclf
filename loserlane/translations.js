

// Translations - English and French side by side
const TRANSLATIONS = [
  // building generator
  { key: "title", en: "Join Us!", fr: "Dessine un bâtiment!" },


  
    { key: "subtitle", en: "Draw your building and see it appear on Toronto's virtual streets in", fr: "Créez votre bâtiment et voyez-le apparaître dans la rue virtuelle de Toronto en" },
  { key: "currentCharacter", en: "Current Character", fr: "Caractère actuel" },
  { key: "eraseAll", en: "Clear all", fr: "Tout Effacer" },
  { key: "eraser", en: "Eraser", fr: "Efface" },
  { key: "example", en: "Example?", fr: "Exemple?" },
  { key: "addButton", en: "Add to LoserLane", fr: "L'ajouter à LoserLane" },
  { key: "modalTitle", en: "Add to Game", fr: "Ajouter au jeu" },
  { key: "buildingName", en: "Building Name", fr: "Nom du bâtiment" },
  { key: "buildingPlaceholder", en: "EG CAFE DEI CAMPI", fr: "EX CAFE DEI CAMPI" },
  { key: "artistName", en: "Your Name / Handle", fr: "Ton nom / pseudo" },
  { key: "artistPlaceholder", en: "EG OMARIECLAIRE", fr: "EX CAFE DEI CAMPI" },
  { key: "cancel", en: "Cancel", fr: "Annuler" },
  { key: "submit", en: "Submit", fr: "Soumettre" },
  { key: "copied", en: "Copied!", fr: "Copié!" },
  { key: "gridCleared", en: "Grid cleared!", fr: "Grille effacée!" },
  { key: "loadedExample", en: "Loaded: ", fr: "Chargé: " },
  { key: "enterBuildingName", en: "Please enter a building name!", fr: "Entre un nom de bâtiment!" },
  { key: "enterArtistName", en: "Please enter your name or handle!", fr: "Entre ton nom ou pseudo!" },
  { key: "buildingNameTooLong", en: "Building name too long! Max 30 characters.", fr: "Nom trop long! Max 30 caractères." },
  { key: "artistNameTooLong", en: "Artist name too long! Max 30 characters.", fr: "Nom trop long! Max 30 caractères." },
  { key: "submitSuccess", en: "Building submitted successfully! Thank you!", fr: "Bâtiment soumis avec succès! Merci!" },
  { key: "submitFailed", en: "Submission may have failed. Please try again.", fr: "Soumission échouée. Réessaie!" },
  { key: "walls", en: "Walls", fr: "Murs" },
  { key: "basic", en: "Basic", fr: "Basique" },
  { key: "blocks", en: "Blocks", fr: "Blocs" },
  { key: "lines", en: "Lines", fr: "Lignes" },
  { key: "shapes", en: "Shapes", fr: "Formes" },
  { key: "accent", en: "Accent", fr: "Accent" },
  { key: "Toronto", en: "Toronto", fr: "Toronto" },
  { key: "landscapeHint", en: "rotate your phone? drawing is nicer in landscape mode", fr: "Tourne ton écran!" },

  



  { key: "shareMessage", en: 'Your building is on its way to LoserLane! Want to share your creation?', fr: 'Votre bâtiment est en route vers LoserLane! Voulez-vous partager votre création?' },
  { key: "copyLink", en: 'Copy Share Text', fr: 'Copier le texte' },
  { key: "done", en: 'Done', fr: 'Terminé' },
  { key: "recentBuildings", en: 'Gallery: Recent Buildings', fr: 'Bâtiments Récents' },



  { key: "shareTitle", en: "Success!", fr: "Succès!" },
{ key: "shareButton", en: "Share", fr: "Partager" },
{ key: "downloadButton", en: "Download", fr: "Télécharger" },
{ key: "copyTextButton", en: "Copy Text", fr: "Copier Texte" },
{ key: "sharedSuccess", en: "Shared!", fr: "Partagé!" },
{ key: "downloadSuccess", en: "Downloaded!", fr: "Téléchargé!" },
{ key: "copiedSuccess", en: "Copied!", fr: "Copié!" },
{ key: "copyFailed", en: "Failed to copy", fr: "Échec de la copie" },

{ key: "shareText", en: "I just created", fr: "Je viens de créer" },
{ key: "shareTextEnd", en: "for LoserLane Toronto!", fr: "pour LoserLane Toronto!" },
{ key: "buildingShareText", en: "I just created", fr: "Je viens de créer" },
{ key: "buildingShareTextEnd", en: "for LoserLane Toronto!", fr: "pour LoserLane Toronto!" },
  //GAME
  // Game title
  { key: "gameTitle", en: "LOSER LANE", fr: "LOSER LANE" },

  // Buttons
  { key: "restart", en: "RESTART", fr: "RECOMMENCER" },
  { key: "share", en: "SHARE", fr: "PARTAGER" },

  {
  key: "infoText",
  en: "Created by Marie LeBlanc Flanagan, who loves bike lanes",
  fr: "Créé par Marie LeBlanc Flanagan, qui aime les pistes cyclables"
},
{
  key: "infoButton",
  en: "ℹ",
  fr: "ℹ"
},

  // UI labels
  { key: "score", en: "Score", fr: "Pointage" },
  { key: "highScore", en: "High Score", fr: "Record" },
  { key: "timeAlive", en: "Time Alive", fr: "Temps de survie" },

  // Game messages
  { key: "gameStart", en: "Left/Right to swerve, double-tap to jump the curve", fr: "Gauche/Droite pour esquiver, double-clic pour sauter" },
  { key: "gameOver", en: "GAME OVER", fr: "GAME OVER" },
  { key: "outOfLuck", en: "Out of luck! Alive for", fr: "T'as pas eu de chance! Survécu pendant" },
  { key: "seconds", en: "seconds", fr: "secondes" },
  { key: "tapToTry", en: "Tap to try again!", fr: "Clique pour réessayer!" },

  // TRACKS death messages (reason + funny)
  // { key: "tracks_reason_1", en: "STM TRACKS", fr: "RAILS DE LA STM" },
  // { key: "tracks_funny_1", en: "Track smack! Blast past!", fr: "Boom sur le rail! Faut que tu te tailles!" },
  // { key: "tracks_funny_2", en: "Stuck on the rails? Bail fail", fr: "Pogné sur les rails? C'est plate en maudit!" },
  // { key: "tracks_funny_3", en: "Rail fail? Bad bail!", fr: "Rail raté? T'es dans le trouble mon gars!" },
  // { key: "tracks_funny_4", en: "Rail jail! Harsh bail!", fr: "Prison de rails! Ça fait mal!" },
  // { key: "tracks_funny_5", en: "Stuck in the groove? Move!", fr: "Pris dans l'rail? Faut que tu te grayes!" },
  // { key: "tracks_funny_6", en: "Track attack! Bounce back!", fr: "Attaque de rail! Faut que tu te revires!" },
  // { key: "tracks_funny_7", en: "On the rails? Sad fails!", fr: "Sur les rails? Ça va mal!" },
  // { key: "tracks_funny_8", en: "Tricky track! Step back!", fr: "Rail traître! Recule, tabarnak!" },
  // { key: "tracks_funny_9", en: "Rail fail! Bail!", fr: "Rail raté! Câlisse de steel!" },
  // { key: "tracks_funny_10", en: "Oops, track gap! Smack!", fr: "Oups, trou dans l'rail! Boom!" },
  // { key: "tracks_funny_11", en: "Track fast, can't last!", fr: "Rail rapide, t'as pas duré!" },

  // ONCOMING_DEATHMACHINE death messages
  { key: "oncoming_reason_1", en: "OH COME ON!", fr: "FRANCHEMENT LÀ!" },
{ key: "oncoming_funny_2", en: "Head-on horror!", fr: "Horreur frontale!" },
{ key: "oncoming_funny_3", en: "Wrong way wreck!", fr: "Désastre à contresens!" },
  { key: "oncoming_funny_4", en: "Clash crash cash!", fr: "Choc, bloc, croc!" },

{ key: "oncoming_funny_5", en: "Frontal disaster!", fr: "Désastre frontal!" },
{ key: "oncoming_funny_6", en: "Head to head dead!", fr: "Tête-à-tête mortel!" },
{ key: "oncoming_funny_7", en: "Wrong lane pain!", fr: "Mauvaise voie, aïe!" },

  // TRAFFIC death messages
  { key: "traffic_reason_1", en: "UGH DEATHMACHINES", fr: "OSTI D'CHARS" },
  { key: "traffic_funny_1", en: "Clash crash cash!", fr: "Crash! Smash! T'es cuit!" },
  { key: "traffic_funny_2", en: "Bam! Jam! Slam!", fr: "Bam! Pan! T'es dans l'ciment!" },
  { key: "traffic_funny_3", en: "Zoomed by doom!", fr: "Zoomé vers ton destin!" },
  { key: "traffic_funny_4", en: "Wheel squeal bad deal!", fr: "Pneu qui crie, t'es fini!" },
  { key: "traffic_funny_5", en: "Road rage! Off the stage!", fr: "Rage au volant! T'es dans l'champ!" },
  { key: "traffic_funny_6", en: "Bang! Clang!", fr: "Bang! Clang! T'es mort!" },
  { key: "traffic_funny_7", en: "Boom! No room to zoom!", fr: "Boum! Pas d'place pour zoomer!" },
  { key: "traffic_funny_8", en: "Bump thump! Traffic lump!", fr: "Bosse, choc! T'as mangé l'char!" },
  { key: "traffic_funny_9", en: "Car slam! Bad jam!", fr: "Auto smash! C'est fini le party!" },
  { key: "traffic_funny_10", en: "Traffic smack! Watch your back!", fr: "Coup d'char! Watch ton arrière!" },
  { key: "traffic_funny_11", en: "Bash! Dash! Avoid the crash!", fr: "Choc! Fonce! Évite le ciment!" },
  { key: "traffic_funny_12", en: "Wheel peel! That's the deal!", fr: "Roues qui crissent! T'es fini, c'est ça l'deal!" },
  { key: "traffic_funny_13", en: "Car crunch! Don't be lunch!", fr: "Char qui crunch! T'es l'lunch!" },
  { key: "traffic_funny_14", en: "Zoom boom! Traffic doom!", fr: "Zoom boum! Trafic qui tue!" },
  { key: "traffic_funny_15", en: "Horn blare! Scare!", fr: "Klaxon! T'es carrément mort!" },
  { key: "traffic_funny_16", en: "Yikes! They hate bikes!", fr: "Ayoye! Y'haïssent les vélos icitte!" },

  // DOOR death messages
  { key: "door_reason_1", en: "DOORED", fr: "PORTIÈRÉ" },
  { key: "door_funny_1", en: "Doored! Ignored!", fr: "Portièré! T'as volé!" },
  { key: "door_funny_2", en: "Door score!", fr: "Point portière!" },
  { key: "door_funny_3", en: "Sneak a peek!", fr: "Surprise fatale!" },
  { key: "door_funny_4", en: "Bam! Door slam!", fr: "Bam! Porte en pleine face!" },
  { key: "door_funny_5", en: "You-ho, peekaboo!", fr: "Coucou! Porte dans l'cou!" },
  { key: "door_funny_6", en: "Door smack! Hop back!", fr: "Coup d'porte! T'es mort!" },
  { key: "door_funny_7", en: "Hop back, door crack!", fr: "Recule! La porte te défonce!" },
  { key: "door_funny_8", en: "Door shock! Big knock!", fr: "Choc d'porte! Méchant coup!" },
  { key: "door_funny_9", en: "Bam! Door slam!", fr: "Bam! Porte claque!" },
  { key: "door_funny_10", en: "No way! Maybe it's ok?", fr: "Ayoye! Peut-être que c'est correct?" },
  { key: "door_funny_11", en: "Watch the door or hit the floor!", fr: "Watch la porte ou tu manges l'asphalte!" },
  { key: "door_funny_12", en: "Steer clear! Door too near!", fr: "Tasse-toi! Porte trop proche!" },
  { key: "door_funny_13", en: "Bang! Door clang!", fr: "Bang! Porte qui claque!" },
  { key: "door_funny_14", en: "Floored by a door!", fr: "Planté par une porte!" },
  { key: "door_funny_15", en: "Door dash! Avoid the clash!", fr: "Porte qui fonce! Évite le choc!" },
  { key: "door_funny_16", en: "Knock knock, door shock!", fr: "Toc toc, boom choc!" },

  // PARKEDDEATHMACHINE death messages
  { key: "parked_reason_1", en: "PARKED DEATHMACHINE", fr: "CHAR PARQUÉ" },
  { key: "parked_funny_1", en: "Crash flash! Hit a stash trash!", fr: "Crash! T'as rentré dans un char parké!" },
  { key: "parked_funny_2", en: "Boom thud, get out of the mud!", fr: "Boum! Sors d'là!" },
  { key: "parked_funny_3", en: "Ka-boom! Parked car zoom!", fr: "Ka-boum! Char parqué!" },
  { key: "parked_funny_4", en: "Bumped a junker! What a clunker!", fr: "Rentré dans un bazou! T'es fou!" },
  { key: "parked_funny_5", en: "Not the goal! Dodging's the role!", fr: "C'est pas l'but! Faut esquiver, verrat!" },
  { key: "parked_funny_6", en: "A parked car smack! Head back!", fr: "Char parqué smashé! T'es fini!" },
  { key: "parked_funny_7", en: "Hit the brakes! High stakes!", fr: "Freine donc! C'est intense!" },
  { key: "parked_funny_8", en: "Parked car doom! Clear that room!", fr: "Char stationné! T'es éliminé!" },
  { key: "parked_funny_9", en: "Bonk! Dunk! Car Junk!", fr: "Bonk! Plonk! Char funk!" },
  { key: "parked_funny_10", en: "Crash boom! More road room!", fr: "Crash boum! Faut d'la place sur l'chemin!" },
  { key: "parked_funny_11", en: "Smack attack! See black!", fr: "Coup fatal! Tu vois noir!" },
  { key: "parked_funny_12", en: "Junk blunder! Going under!", fr: "Erreur de bazou! T'es dans l'trou!" },
  { key: "parked_funny_13", en: "Gotcha! Parked car splotcha!", fr: "Gotcha! Char parqué t'a pogné!" },
  { key: "parked_funny_14", en: "Car crunch! Thanks a bunch!", fr: "Char qui crunch! Merci ben là!" },

  // BACKDOOR death messages
  { key: "backdoor_reason_1", en: "PARKED", fr: "PARQUÉ" },
  { key: "backdoor_funny_1", en: "DUUUMP", fr: "DUUUMP" },

  // HUMANBEING death messages
  { key: "wanderer_reason_1", en: "NOOOO", fr: "NOOON" },
  { key: "wanderer_funny_1", en: "Crash! Flash human bash!", fr: "Crash! T'as frappé quelqu'un!" },
  { key: "wanderer_funny_2", en: "Clock! Human roadblock!", fr: "Cloc! Piéton bloc!" },
  { key: "wanderer_funny_3", en: "People pop! You gotta stop!", fr: "Monde partout! Faut arrêter, tabarnouche!" },
  { key: "wanderer_funny_4", en: "Oops! Human boops!", fr: "Oups! T'as fessé du monde!" },
  { key: "wanderer_funny_5", en: "Sad, wow bad", fr: "Triste en osti" },
  { key: "wanderer_funny_6", en: "People jam! Big slam!", fr: "Trafic humain! Gros dégât!" },
  { key: "wanderer_funny_7", en: "Avoid a greet, dodge the meat!", fr: "Évite les piétons, mon chum!" },
  { key: "wanderer_funny_8", en: "Shuffle bad scuffle!", fr: "Bagarre de piétons! C'est pas bon!" },
  { key: "wanderer_funny_9", en: "Steer clear! Folks near!", fr: "Tasse-toi! Du monde partout!" },
  { key: "wanderer_funny_10", en: "Hop hop! People stop!", fr: "Hop hop! Monde stop!" },
  { key: "wanderer_funny_11", en: "Crowd rush! Don't crush!", fr: "Foule qui rush! Écrase-les pas!" },
  { key: "wanderer_funny_12", en: "Bad fight! Bike blight", fr: "Mauvais combat! Vélo K.O.!" },
  { key: "wanderer_funny_13", en: "Human block, avoid the shock!", fr: "Bloc humain, évite l'désastre!" },
  { key: "wanderer_funny_14", en: "Watch your stroll, dodge the roll!", fr: "Watch où tu roules, évite le monde!" },

  // BUILDING death messages
  { key: "building_reason_1", en: "OOPS", fr: "OUPS" },
  { key: "building_funny_1", en: "Shop drop! Street's your stop!", fr: "Boutique! T'es fini, c'est tragique!" },
  { key: "building_funny_2", en: "Boop! Into the shoop?", fr: "Boum! Dans l'magasin!" },
  { key: "building_funny_3", en: "Retail fail! Stay on the trail!", fr: "Magasin raté! Reste sur l'chemin!" },
  { key: "building_funny_4", en: "Shop smack! Street's where you pack!", fr: "Coup d'boutique! Reste dans rue!" },
  { key: "building_funny_5", en: "Crash! Bad stash!", fr: "Crash! T'es dans marde!" },
  { key: "building_funny_6", en: "Assurance, hope you have insurance!", fr: "Espère que t'as des assurances!" },
  { key: "building_funny_7", en: "Do the math! Stick to your path!", fr: "Fais le calcul! Reste sur l'chemin!" },
  { key: "building_funny_8", en: "Shopping splash, super rash!", fr: "Magasinage crash! Super dégât!" },
  { key: "building_funny_9", en: "Shop thump! Avoid the bump!", fr: "Coup d'boutique! Évite ça!" },
  { key: "building_funny_10", en: "Window bump! Time to jump!", fr: "Vitrine bump! Faut sauter!" },
  { key: "building_funny_11", en: "Crash a store, explore no more!", fr: "Crash dans magasin, c'est fini l'fun!" },
  { key: "building_funny_12", en: "Store pop! Time to stop!", fr: "Boutique pop! Temps d'arrêter!" },
  { key: "building_funny_13", en: "Watch the display, stay away!", fr: "Watch la vitrine! Reste loin!" },
  { key: "building_funny_14", en: "Store smack! Stick to the track!", fr: "Coup d'magasin! Reste dans rue!" },

  // TTC death messages
  { key: "ttc_reason_1", en: "STM SMOOCH", fr: "BISOU À LA STM" },
  { key: "ttc_funny_1", en: "STM zap! That's a wrap!", fr: "STM zap! T'es mort!" },
  { key: "ttc_funny_2", en: "STM clash! Hot bash!", fr: "STM clash! Chaud hot!" },
  { key: "ttc_funny_3", en: "Boom! STM in the room!", fr: "Boum! La STM te rentre dedans!" },
  { key: "ttc_funny_4", en: "Zap! Transit trap!", fr: "Zap! Piège de transport!" },
  { key: "ttc_funny_5", en: "Squash smash! STM crash!", fr: "Écrasé smash! STM crash!" },
  { key: "ttc_funny_6", en: "Zap and pop! Hard stop!", fr: "Zap et pop! Stop sec!" },
  { key: "ttc_funny_7", en: "STM meat, take a seat!", fr: "STM viande, assis-toi!" },
  { key: "ttc_funny_8", en: "STM greet, move your feet!", fr: "STM salut, bouge tes pieds!" },
  { key: "ttc_funny_9", en: "Ding ding! Watch that swing!", fr: "Ding ding! Watch le swing!" },
  { key: "ttc_funny_10", en: "Tram bam! Avoid the jam!", fr: "Tram bam! Évite ça!" },
  { key: "ttc_funny_11", en: "Clang clang! STM bang!", fr: "Clang clang! STM bang!" },

  // Tutorial messages
  {
    key: "tutorialLeftMobile",
    en: "Tap the <span class='highlight'>left side</span> of the screen to move left",
    fr: "Clique sur le <span class='highlight'>côté gauche</span> de l'écran pour aller à gauche",
  },
  {
    key: "tutorialLeftDesktop",
    en: "Use your <span class='highlight'>left arrow key</span> to move left",
    fr: "Utilise ta <span class='highlight'>flèche gauche</span> pour aller à gauche",
  },
  {
    key: "tutorialRightMobile",
    en: "Tap the <span class='highlight'>right side</span> of the screen to move right",
    fr: "Clique sur le <span class='highlight'>côté droit</span> de l'écran pour aller à droite",
  },
  {
    key: "tutorialRightDesktop",
    en: "Use your <span class='highlight'>right arrow key</span> to move right",
    fr: "Utilise ta <span class='highlight'>flèche droite</span> pour aller à droite",
  },

  // Tutorial error messages
  { key: "otherLeft", en: "Your other left!", fr: "Ton autre gauche!" },
  { key: "otherRight", en: "Your other right!", fr: "Ton autre droite!" },

  // Tutorial completion
  { key: "tutorialComplete", en: "TUTORIAL COMPLETE", fr: "TUTORIEL COMPLÉTÉ" },
  { key: "stayAlive", en: "STAY ALIVE? <br>(you won't)", fr: "RESTE EN VIE? <br>(tu vas mourir pareil)" },

  // Button text
  { key: "ride", en: "RIDE", fr: "GO!" },

  // Game UI
  { key: "stayAliveTimer", en: "STAY ALIVE", fr: "RESTE EN VIE" },
  { key: "addBuilding", en: "ADD A BUILDING?", fr: "AJOUTER UN BÂTIMENT?" },

  // Social sharing
  { key: "shareText", en: "I survived biking in Toronto for", fr: "J'ai survécu à vélo à Toronto pendant" },
  { key: "seconds", en: "seconds", fr: "secondes" },
  {
    key: "shareTextEnd",
    en: "seconds without a bike lane. How long will you survive? Try your luck at:",
    fr: "secondes sans piste cyclable. Combien de temps survivrez-vous? Tentez votre chance:",
  },
  { key: "survivedText", en: "I survived", fr: "J'ai survécu" },
  { key: "withoutLane", en: "without a bike lane", fr: "sans piste cyclable" },
  { key: "shareWithFriend", en: "SHARE", fr: "PARTAGER" },
  { key: "shareTitle", en: "We need bike lanes!", fr: "Pas de pistes cyclables?" },

  // Call to action messages
  { key: "fightForLanes", en: "FIGHT FOR YOUR BIKE LANES?", fr: "BATS-TOI POUR TES PISTES CYCLABLES?" },
  { key: "thanksDoug", en: "WE NEED BIKE LANES", fr: "TOUCHE PAS À NOS REVes" },

  // Meta/SEO content
  { key: "metaTitle", en: "Loser Lane", fr: "Loser Lane" },
  {
    key: "metaDescription",
    en: "Experience cycling between certain death and probable death in this totally accurate street survival simulator. Life without bike lanes? No thanks.",
    fr: "Vis l'expérience du vélo entre la mort certaine et la mort probable dans ce simulateur de survie urbaine totalement réaliste. La vie sans pistes cyclables? Non, Merci.",
  },
  { key: "metaTitleLong", en: "Loser Lane - Toronto Bike Survival Game", fr: "Loser Lane - Jeu de Survie à Vélo à Toronto" },


 // Death reasons
  { key: "deathTTC", en: "HIT BY A BUS", fr: "FRAPPÉ PAR UN BUS" },
  { key: "deathTraffic", en: "HIT BY A CAR", fr: "FRAPPÉ PAR UNE VOITURE" },
  { key: "deathParked", en: "YOU HIT A PARKED CAR", fr: "TU AS FRAPPÉ UNE VOITURE STATIONNÉE" },
  { key: "deathDoor", en: "YOU WERE DOORED", fr: "TU T'ES FAIT EMPORTIÉRER" },
  { key: "deathHuman", en: "YOU HIT A HUMAN!", fr: "TU AS FRAPPÉ UN HUMAIN!" },
  { key: "deathTracks", en: "STUCK IN THE TRACKS", fr: "COINCÉ DANS LES RAILS" },
  { key: "deathBuilding", en: "YOU HIT A BUILDING", fr: "TU AS FRAPPÉ UN BÂTIMENT" },
  { key: "deathDefault", en: "YOU DIED", fr: "TU ES MORT" },
];
