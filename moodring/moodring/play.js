function windowOnLoad() {

  setTimeout(function(){
    document.body.classList.add('loaded');
    //$('h1').css('color','#222222');
}, 1000);

  ////////////////////////////
  ////////// MUSIC ///////////
  ////////////////////////////

  const songMap = {
    chaos: {
      artist: "Klapshmock!",
      title: "Attack Zone X",
      file: "AttackZoneX.mp3",
    },
    echoes: {
      artist: "Deidre",
      title: "Numb",
      file: "Numb.mp3",
    },
    forest: {
      artist: "Mas Aya",
      title: "Pasiva/Activa",
      file: "PasivaActiva.mp3",
    },
    meadow: {
      artist: "Orchidae",
      title: "Love (bedroom version)",
      file: "Love.mp3",
    },
    morning: {
      artist: "Century Egg",
      title: "I Will Make Up a Method",
      file: "IWillMakeUpaMethod.mp3",
    },
    night: {
      artist: "SlowPitchSound",
      title: "You Betta Change ft. Distant Dust",
      file: "YouBettaChangefeaturingDistantDust.mp3",
    },
    unfold: {
      artist: "Melody McKiver & Thomas Goguelin",
      title: "Berlinale Duet",
      file: "BerlinaleDuet.mp3",
    },
    cycle: {
      artist: "Bucko Art Machine",
      title: "PRO TESTING (3AM edit)",
      file: "Pro.mp3",
    },
  };

  const backgroundMusic = new Audio("./sounds/backgroundMusic.mp3");
  backgroundMusic.load();
  backgroundMusic.loop = true;

  const beginSound = new Audio("./sounds/beginSound.mp3");
  beginSound.load();
  const genSound = new Audio("./sounds/genSound.mp3");
  genSound.load();

  function playSound(audio) {
    audio.volume = 0.07;
    audio.play();
  }

  var muted = false;

  var muteBtn = document.getElementById("muteBtn"); // get the button
  muteBtn.addEventListener("click", muteBtnHandler); // add an eventlistener to the enter button
  function muteBtnHandler(event) {
    // console.log('pauseSound is called');
    // console.log(`muteBtn: ${muteBtn}`);
    if (muted == true) {
      // console.log("play audio");
      playSound(backgroundMusic);
      // muteBtn.classList.add("mute");
      muteBtn.style.background =
        "url('images/mute.png') no-repeat center center / contain";
    } else {
      // console.log("pause audio");
      backgroundMusic.pause();
      muteBtn.style.background =
        "url('images/unMute.png') no-repeat center center / contain";
    }
    muted = !muted;
  }

  function fadeSound() {
    // console.log(backgroundMusic.volume);
    if (backgroundMusic.volume > 0.01) {
      backgroundMusic.volume = Math.max(0, backgroundMusic.volume - 0.01);
      setTimeout(fadeSound, 800);
    } else {
      backgroundMusic.pause();
    }
  }

  (function (d) {
    "use strict";

    function makeAudioBtn(id, containerId, audioPlayerId) {
      var test = true;
      var btn = d.querySelector(id);
      var btnContainer = d.querySelector(containerId);
      btnContainer.classList.remove("hide");

      var audioPlayer = d.querySelector(audioPlayerId);
      audioPlayer.classList.add("remove");

      function changeSVG() {
        btn.classList.remove("pause");
        test = true;
      }
      btn.addEventListener(
        "click",
        function () {
          if (test === true) {
            musicBtnContainer1.classList.add("musicBtnContainerPlaying");
            btn.classList.add("pause");
            backgroundMusic.pause();

            test = false;
            audioPlayer.volume = 0.07;
            audioPlayer.play();
          } else {
            musicBtnContainer1.classList.remove("musicBtnContainerPlaying");

            changeSVG();
            audioPlayer.pause();
          }
        },
        false
      );

      audioPlayer.addEventListener(
        "ended",
        function () {
          changeSVG();
          audioPlayer.load();
        },
        false
      );
    }

    var btn1 = makeAudioBtn("#musicBtn1", "#musicBtnContainer1", "#player1");
  })(document);

  ////////////////////////////
  ////////// TRACERY /////////
  ////////////////////////////

  // http://www.crystalcodepalace.com/traceryTut.html

  var story = {
    sentence: [
      "Welcome to the bottom, #playerAdj# seeker. #playerDesc.capitalize# #playerVerb# in #natureDesc# #natureNoun.s#. Reaching #q2#, forever #q1#wards. "
    ],
    playerAdj: [
      "watchful",
      "thoughful",
      "curious",
      "unyielding",
      "hopeful",
      "triumphant",
      "silent",
    ],
    natureNoun: [
      "ocean",
      "mountain",
      "forest",
      "cloud",
      "river",
      "tree",
      "sky",
      "sea",
      "desert",
    ],
    playerDesc: [
      "quietly",
      "thoughtfully",
      "softly",
      "gently",
      "curiously",
      "firmly",
      "tentatively",
    ],
    playerVerb: [
      "humming",
      "watching",
      "waiting",
      "emerging",
      "instigating",
      "inviting",
      "awaiting",
    ],
    natureDesc: [
      "limitless",
      "blooming",
      "reaching",
      "inviting",
      "awaiting",
      "still",
      "infinite",
      "eternal",
    ],

    //up down
    q1: [],

    //dark joy out inner
    q2: [],
    // forest Meadow morning Night unfold Cyle chaos echoes
    q3: [],
  };

  function generateTracery() {
    var grammar = tracery.createGrammar(story);
    var result = grammar.flatten("#sentence#");
    document.getElementById("generatorTxt").innerHTML = result;
  }

  var playerState = {
    level: "none",
    question: "peace",
    q1: undefined,
    q2: undefined,
    q3: undefined,
    song: undefined,
  };

  const beginLvl = document.getElementById("beginLvl");
  const playerQuestionLvl = document.getElementById("playerQuestionLvl");
  const questions3Lvl = document.getElementById("questions3Lvl");
  const choice1Lvl = document.getElementById("choice1Lvl");
  const upLvl = document.getElementById("upLvl");
  const downLvl = document.getElementById("downLvl");
  const darkLvl = document.getElementById("darkLvl");
  const joyLvl = document.getElementById("joyLvl");
  const outLvl = document.getElementById("outLvl");
  const innerLvl = document.getElementById("innerLvl");
  const findSongLvl = document.getElementById("findSongLvl");
  const lastLvl = document.getElementById("lastLvl");
  const bottomLvl = document.getElementById("bottomLvl");
  const creditsLvl = document.getElementById("creditsLvl");

  const spacer0 = document.getElementById("spacer0");
  const spacer1 = document.getElementById("spacer1");
  const spacer2 = document.getElementById("spacer2");
  const spacer3 = document.getElementById("spacer3");
  const spacer4 = document.getElementById("spacer4");
  const spacer5 = document.getElementById("spacer5");
  const spacer6 = document.getElementById("spacer6");
  const spacer7 = document.getElementById("spacer7");

  // set each level to be invisible
  playerQuestionLvl.style.display = "none";
  questions3Lvl.style.display = "none";
  choice1Lvl.style.display = "none";
  upLvl.style.display = "none";
  downLvl.style.display = "none";
  darkLvl.style.display = "none";
  joyLvl.style.display = "none";
  outLvl.style.display = "none";
  innerLvl.style.display = "none";
  findSongLvl.style.display = "none";
  lastLvl.style.display = "none";
  bottomLvl.style.display = "none";
  creditsLvl.style.display = "none";

  spacer0.style.display = "none";
  spacer1.style.display = "none";
  spacer2.style.display = "none";
  spacer3.style.display = "none";
  spacer4.style.display = "none";
  spacer5.style.display = "none";
  spacer6.style.display = "none";
  spacer7.style.display = "none";

  muteBtn.style.display = "none";

  function displayScrollArrow(parent){
    console.log("ugh");
    const arrowDiv = document.createElement("div"); 
    arrowDiv.classList.add("arrow");
    arrowDiv.id ="arrow";
    const currentDiv = document.getElementById(parent);
    console.log(parent);
    currentDiv.appendChild(arrowDiv);

    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");
    for(var i =0;i < 3;i++) {
      const chevron = document.createElement("div");
      chevron.classList.add("chevron");
      containerDiv.appendChild(chevron);
    }
    arrowDiv.appendChild(containerDiv);
  }

  var beginBtn = document.getElementById("beginBtn"); // get the button
  beginBtn.addEventListener("click", beginBtnHandler); // add an eventlistener to the enter button
  function beginBtnHandler(event) {
    // set the begin to visible when you click on the enter button
    // window.location.hash='question'; // transport down the page
    playerQuestionLvl.style.display = "grid";
    spacer0.style.display = "grid";
    muteBtn.style.display = "block";
    playSound(beginSound);
    playSound(backgroundMusic);
    // beginBtn.innerHTML = "scroll";
    beginBtn.classList.add("fade");
    setTimeout(function(){
      displayScrollArrow("beginLvlRow4");
    }, 1000);
    moveArrow();
    greenGlowAni();
    spacer0Ani();
    playerQuestionLvlAni();
  }

  const seekText = document.getElementById("seekText");
  const seekBtn = document.getElementById("seekBtn");

  seekBtn.addEventListener("click", questionBtnHandler); // add an eventlistener to the  button
  function questionBtnHandler(event) {
    if (seekText.value !== ""){
      playerState.question = seekText.value;
    } else {
      playerState.question = "peace";
    }
    playSound(beginSound);
    seekBtn.innerHTML = "received";
    document.getElementById("whatDoYouSeek").innerHTML = "dive deeper, <br> seeker";
    seekBtn.classList.add("fade");
    seekText.classList.add("fade");
    questions3Lvl.style.display = "grid";
    spacer1.style.display = "grid";
    spacer2.style.display = "grid";
    choice1Lvl.style.display = "grid";
    displayPlayerQuestion();
    questions3LvlAni();
    choice1Ani();
    greenSwimmerFollowAni();
  }

  var findSongBtn = document.getElementById("findSongBtn");

  findSongBtn.addEventListener("click", findSongBtnHandler);
  function findSongBtnHandler(event) {
    spacer6.style.display = "grid";
    lastLvl.style.display = "grid";
    spacer7.style.display = "grid";
    bottomLvl.style.display = "grid";
    creditsLvl.style.display = "grid";
    generateTracery();
    playSound(beginSound);
    blueSwimmerFallAni();
    findSongBtn.innerHTML = "scroll";
    fadeSound();
  }

  function displayPlayerQuestion() {
    var x = document.getElementsByClassName("playerQuestion");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].innerHTML = playerState.question;
    }
  }

  // get all the links
  const upLink = document.getElementById("upLink");
  const downLink = document.getElementById("downLink");
  const darkLink = document.getElementById("darkLink");
  const joyLink = document.getElementById("joyLink");
  const chaosLink = document.getElementById("chaosLink");
  const echoesLink = document.getElementById("echoesLink");
  const forestLink = document.getElementById("forestLink");
  const meadowLink = document.getElementById("meadowLink");
  const outLink = document.getElementById("outLink");
  const innerLink = document.getElementById("innerLink");
  const morningLink = document.getElementById("morningLink");
  const nightLink = document.getElementById("nightLink");
  const unfoldLink = document.getElementById("unfoldLink");
  const cycleLink = document.getElementById("cycleLink");
  // get all the images
  const upImg = document.getElementById("upImg");
  const downImg = document.getElementById("downImg");
  const darkImg = document.getElementById("darkImg");
  const joyImg = document.getElementById("joyImg");
  const chaosImg = document.getElementById("chaosImg");
  const echoesImg = document.getElementById("echoesImg");
  const forestImg = document.getElementById("forestImg");
  const meadowImg = document.getElementById("meadowImg");
  const outImg = document.getElementById("outImg");
  const innerImg = document.getElementById("innerImg");
  const morningImg = document.getElementById("morningImg");
  const nightImg = document.getElementById("nightImg");
  const unfoldImg = document.getElementById("unfoldImg");
  const cycleImg = document.getElementById("cycleImg");

  function renderSong(playerState) {
    if (playerState.q3 === undefined) {
      return;
    }
    var song = songMap[playerState.q3];
    // console.log(`the song is: ${JSON.stringify(song)}`);

    var audioSrc = document.getElementById("audioSource");
    audioSrc.setAttribute("src", `sounds/${song.file}`);

    var artistText = document.getElementById("artist");
    artistText.textContent = song.artist;

    var titleText = document.getElementById("title");
    titleText.textContent = song.title;

    // force the browser to refresh the audio source
    var audio = document.getElementById("player1");
    audio.load();
  }

  // draws the final images based on playerState
  function renderplayerState(playerState) {
    var finalImageRow = document.getElementById("finalImageRow");
    // clear images inside <div> so you can add new ones
    finalImageRow.innerHTML = "";

    if (playerState.q1 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q1}.png`);
      img.setAttribute("class", "finalImage");
      finalImageRow.appendChild(img);
    }

    if (playerState.q2 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q2}.png`);
      img.setAttribute("class", "finalImage");
      finalImageRow.appendChild(img);
    }

    if (playerState.q3 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q3}.png`);
      img.setAttribute("class", "finalImage");
      finalImageRow.appendChild(img);
    }
    console.log("render player state");
  }

  // called when the links are clicked
  function makeLinkHandler(
    link,
    stateKey,
    chosenValue,
    unchosenValue,
    level,
    spacer,
    scrollTriggerFun
  ) {
    function linkHandler(event) {
      event.preventDefault();

      playSound(genSound);

      const chosenImageId = chosenValue + "Img";
      const chosenImageDOM = document.getElementById(chosenImageId);
      chosenImageDOM.classList.add("glow");

      // console.log(stateKey);

      const chosenTextId = stateKey + "Text";
      const textDom = document.getElementById(chosenTextId);

      const chosenTextPhrase = chosenValue + "Link";
      const textPhrase = document.getElementById(chosenTextPhrase).innerHTML;
      // console.log(textDom);
      textDom.innerHTML = textPhrase;
      textDom.classList.add("glow");

      const unchosenImageId = unchosenValue + "Img";
      const unchosenImageDOM = document.getElementById(unchosenImageId);
      unchosenImageDOM.classList.add("fade");
      unchosenImageDOM.classList.remove("styleChoiceImage");

      // const unchosenTextId = unchosenValue+"Link";
      // const unchosenTextDOM = document.getElementById(unchosenTextId);
      // unchosenTextDOM.classList.add('fade');

      scrollTriggerFun();

      link.style.display = "grid";
      spacer.style.display = "grid";

      playerState[stateKey] = chosenValue;
      // story[stateKey] = chosenValue;

      setTimeout(function(){
        displayScrollArrow(stateKey);
      }, 3000);
      // console.log(story[stateKey]);

      // console.log(JSON.stringify(playerState));
      if (level === 1) {
        playerState.q1 = chosenValue;
        story.q1.push(chosenValue);
        // only re-render if they've answered all the questions
        renderplayerState(playerState);
        renderSong(playerState);
      } else if (level === 2) {
        playerState.q2 = chosenValue;
        story.q2.push(chosenValue);

        renderplayerState(playerState);
        renderSong(playerState);
      } else if (level === 3) {
        playerState.q3 = chosenValue;
        story.q3.push(chosenValue);

        renderplayerState(playerState);
        renderSong(playerState);
      }
    }
    return linkHandler;
  }

  //creates and runs a function makeLinkHandler which returns a function
  // link,stateKey,chosenValue,unchosenValue,level,spacer,scrollTriggerFun
  upLink.addEventListener(
    "click",
    makeLinkHandler(upLvl, "upOrDown", "up", "down", 1, spacer3, choiceAni)
  );
  downLink.addEventListener(
    "click",
    makeLinkHandler(downLvl, "upOrDown", "down", "up", 1, spacer3, choiceAni)
  );
  darkLink.addEventListener(
    "click",
    makeLinkHandler(darkLvl, "darkOrJoy", "dark", "joy", 2, spacer4, choiceAni)
  );
  joyLink.addEventListener(
    "click",
    makeLinkHandler(joyLvl, "darkOrJoy", "joy", "dark", 2, spacer4, choiceAni)
  );
  chaosLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "chaosOrechoes",
      "chaos",
      "echoes",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  echoesLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "chaosOrEchoes",
      "echoes",
      "chaos",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  forestLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "forestOrMeadow",
      "forest",
      "meadow",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  meadowLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "forestOrMeadow",
      "meadow",
      "forest",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  outLink.addEventListener(
    "click",
    makeLinkHandler(outLvl, "outOrInner", "out", "inner", 2, spacer4, choiceAni)
  );
  innerLink.addEventListener(
    "click",
    makeLinkHandler(
      innerLvl,
      "outOrInner",
      "inner",
      "out",
      2,
      spacer4,
      choiceAni
    )
  );
  morningLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "morningOrNight",
      "morning",
      "night",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  nightLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "morningOrNight",
      "night",
      "morning",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  unfoldLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "unfoldOrCycle",
      "unfold",
      "cycle",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  cycleLink.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "unfoldOrCycle",
      "cycle",
      "unfold",
      3,
      spacer5,
      blueSwimmerAni
    )
  );

  upImg.addEventListener(
    "click",
    makeLinkHandler(upLvl, "upOrDown", "up", "down", 1, spacer3, choiceAni)
  );
  downImg.addEventListener(
    "click",
    makeLinkHandler(downLvl, "upOrDown", "down", "up", 1, spacer3, choiceAni)
  );
  darkImg.addEventListener(
    "click",
    makeLinkHandler(darkLvl, "darkOrJoy", "dark", "joy", 2, spacer4, choiceAni)
  );
  joyImg.addEventListener(
    "click",
    makeLinkHandler(joyLvl, "darkOrJoy", "joy", "dark", 2, spacer4, choiceAni)
  );
  chaosImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "chaosOrEchoes",
      "chaos",
      "echoes",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  echoesImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "chaosOrEchoes",
      "echoes",
      "chaos",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  forestImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "forestOrMeadow",
      "forest",
      "meadow",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  meadowImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "forestOrMeadow",
      "meadow",
      "forest",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  outImg.addEventListener(
    "click",
    makeLinkHandler(outLvl, "outOrInner", "out", "inner", 2, spacer4, choiceAni)
  );
  innerImg.addEventListener(
    "click",
    makeLinkHandler(
      innerLvl,
      "outOrInner",
      "inner",
      "out",
      2,
      spacer4,
      choiceAni
    )
  );
  morningImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "morningOrNight",
      "morning",
      "night",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  nightImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "morningOrNight",
      "night",
      "morning",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  unfoldImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "unfoldOrCycle",
      "unfold",
      "cycle",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
  cycleImg.addEventListener(
    "click",
    makeLinkHandler(
      findSongLvl,
      "unfoldOrCycle",
      "cycle",
      "unfold",
      3,
      spacer5,
      blueSwimmerAni
    )
  );
}

// https://codepen.io/Grilly86/pres/VKbLgP

  // CONFIGURATION:
// var spawn_every_nth_frame = 0;    // when not click
// var spawn_on_clicked = 2;
// var spawn_on_mousemove = 1;

// // every frame 
// var particle_start_speed = .25;   // start with this random speed 
// var particle_wobble_speed = .1; // change speed in random 
// var particle_alpha_factor = .97;  // fade out factor for every frame 

// function Mover(loc,c) {
//   this.loc = createVector(width/2, height/2);
//   this.vel = createVector();
//   this.acc = createVector();
//   this.r = random(3,7);
//   this.c = c;
//   this.alpha = 1;
  
//   if (typeof loc !== "undefined") {
//     this.loc = createVector(loc.x,loc.y);
//   }
//   this.applyForce = function(a) {
//     this.acc.add(a);
//   }
//   this.update = function() {
//     this.vel.add(this.acc);
//     this.acc.mult(0);
//     this.alpha *= particle_alpha_factor;
    
//     if (this.loc.x < 0 || this.loc.x > width) {
//       this.vel.x *= -.8;
//       if (this.loc.x < 0) this.loc.x = 0;
//       if (this.loc.x > width) this.loc.x = width;
//     }
//     if (this.loc.y < 0 || this.loc.y > height) {
//       this.vel.y *= -.8;
//       if (this.loc.y < 0) this.loc.y = 0;
//       if (this.loc.y > height) this.loc.y = height;
//     }
    
//     this.loc.add(this.vel);
//   }
//   this.display = function() {
//     fill(this.c, 255,255 , this.alpha);
//     noStroke();
//     ellipse(this.loc.x,this.loc.y, this.r + (1/this.alpha),this.r + (1/this.alpha));
//   }
// }

// var movers = [];

// function setup() {
//   colorMode(HSB);

//   var canvas = createCanvas(window.innerWidth,window.innerHeight * 2);   
//   // canvas.style('display', 'block');

//   // background(50);
//   canvas.parent('sketchHolder');

// }


// function draw() {
//   background(5);
  
//   if (mouseDown || frameCount%spawn_every_nth_frame==0 ) {    
//     for (var x = 0; x < (mouseDown?spawn_on_clicked:spawn_on_mousemove); x++) {
      
      
//       var m = new Mover(createVector(mouseX, mouseY), ((frameCount+128)/ 1 % 360));
     
//       var f = createVector(random(-1,1), random(-6,0)).mult(particle_start_speed)
      
            
//       if (mouseDown) {
//         f.mult(2);
//       }
//        m.applyForce(f);

//       movers.push(m);
//     }
//   }
    
//   for(var x = movers.length -1; x >= 0; x--) {
//     var mov = movers[x];
    
//     if (mov.alpha < .001) {
//       movers.shift(x);
//     } else {
    
      
//      // randomize movement a bit:
//      mov.applyForce(createVector(random(-1,1), random(1,-1)).mult(particle_wobble_speed));

//       // enables gravity:
//       mov.applyForce(createVector(0,.25));
      
//       mov.update();
//       mov.display(); 
//     }
//   }
  
// }

// var mouseDown = false;

// function mousePressed() {
//   mouseDown = true;
// }

// function mouseReleased() {
//   mouseDown = false;
// }



window.addEventListener("load", windowOnLoad);

