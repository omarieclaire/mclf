function windowOnLoad() {
  setTimeout(function () {
    document.body.classList.add("loaded");
    //$('h1').css('color','#222222');
  }, 1000);

  ////////////////////////////
  ////// scrolltrigger ///////
  ////////////////////////////

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({
    toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry onLeaveBack
    // markers: false
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: "#beginLvl",
      start: "bottom top", //animation starts at this point  - 20 px above the top of the trigger element
      // end: "+=500",
      // scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#greenGlow",
    },
  });
  // .to("#beginBtn", { y: 200 })
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none

  function moveArrow() {}

  function pushStartLvlAway() {
    return gsap
      .timeline({ repeat: 0, repeatDelay: 1, paused: true })
      .to(
        ".beginLvlRow1",
        { scale: 0.4, opacity: 0, duration: 12, y: 200, ease: "slow" },
        0.4,
        "Start"
      )
      .to(
        "#beginLvlRow2",
        { scale: 0.4, opacity: 0, duration: 12, y: 100, ease: "slow" },
        0.4,
        "Start"
      )
      .to("#greenGlow", { y: 90, duration: 7, ease: "slow" }, "+=0.5");
  }
  const pushStartLvlAwayAni = pushStartLvlAway();

  function bringBack() {
    gsap.timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "bottom top", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        //end: "-=300", //"bottom center" means "when the bottom of the endTrigger hits the center of the scroller". "center 100px" means "when the center of the endTrigger hits 80% down from the top of the scroller"
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        onLeaveBack: function () {
          pushStartLvlAwayAni.reverse();
        },
      },
    });
  }
  bringBack();

  function spacer0Ani() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#beginLvl",
          start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          end: "+=300", //"bottom center" means "when the bottom of the endTrigger hits the center of the scroller". "center 100px" means "when the center of the endTrigger hits 80% down from the top of the scroller"
          scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
        },
      })
      .from("#spacer0", { opacity: 0 });
  }

  function greenGlowAni() {
    gsap
      .timeline({
        scrollTrigger: {
          // markers: true,
          trigger: "#beginLvl",
          immediateRender: false,
          start: "1%", //animation starts at this point  - 20 px above the top of the trigger element
          endTrigger: "#plantLady",
          end: "bottom bottom",
          scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
          toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
          // toggleClass: "glow"
          pinSpacing: false,
          // from: “center”,
          // pin: "#greenGlow"
        },
      })
      // .to("#arrow", {hh y: 350, scale: 0, opacity: 0})
      .to("#greenGlow", { y: innerHeight * 0.7, rotate: 180 });
  }

  function playerQuestionLvlAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#beginBtn",
          // pin: true,
          start: "1px", //animation starts at this point  - 20 px above the top of the trigger element
          end: "+=550",
          scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      .from("#plantLady", { scale: 0.3, autoAlpha: 0, y: innerHeight * -0.1 })
      .from("#whatDoYouSeek", { scale: 0.8, autoAlpha: 0 });
    // .to("#seekText", { y: -60 })
    // .to("#seekBtn", { y: -60})
  }

  function seekBtnAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#beginBtn",
          // pin: true,
          start: "1px", //animation starts at this point  - 20 px above the top of the trigger element
          end: "+=550",
          scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      // .to("#seekText", { y: -60 })
      .from("#seekBtn", { y: -60 });
  }

  function questions3LvlAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#spacer1",
          start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
          end: "+=150",
          scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      // .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
      .from("#greenSwimmer", {
        y: innerHeight * 0.275,
        scale: 0.2,
        autoAlpha: 0,
        rotate: 90,
      })
      .from("#questionstxt2", { scale: 0.2, autoAlpha: 0 });
  }

  function greenSwimmerFollowAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#questions3Lvl",
          start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
          // end: "+=950",
          endTrigger: "#spacer2",
          end: "top top",
          scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      // .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
      .to("#greenSwimmer", { y: 750, rotate: -90 });
  }

  function choice1Ani() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#spacer2",
          start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          end: "+=200", // bottom of the trigger element hits the top of the viewport
          scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
        },
      })
      .from(".choiceTxt", { y: 100, scale: 0.8 });
    // .from("#upImg", { y: 70, scale: 0.6 })
    // .from("#downImg", { y: 70, scale: 0.6 })
  }

  function choiceAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".choiceLvl",
          start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          end: "+=200", // bottom of the trigger element hits the top of the viewport
          scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
        },
      })
      .from(".choiceTxt", { y: 100, scale: 0.8 });
    // .from(".imageRow", { y: 70, scale: 0.6 })
  }

  function blueSwimmerAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#spacer5",
          // pin: true,
          start: "center top", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          // endtrigger: "#plantLady",
          end: "top bottom",
          // end: "+=50",
          scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      .from("#questionstxt", { scale: 0.4, autoAlpha: 0 })
      .from("#blueSwimmer", { y: 100, scale: 0.4, autoAlpha: 0, rotate: 90 });
  }

  function blueSwimmerFallAni() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#spacer5",
          // pin: true,
          start: "center top", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          // endtrigger: "#plantLady",
          // end: "bottom bottom",
          // end: "+=950",
          endTrigger: "#displayQuestionRow",
          end: "top center",
          scrub: 2, // locks animation to scrollbar - can use 1, 2, 3 etc

          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      .to("#blueSwimmer", { y: 750, rotate: -360, scale: 0.75 });
    // .to("#blueSwimmer", { y: 750, rotate: -90 });
  }

  function displayEndPoem() {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#spacer6",
          // pin: true,
          start: "top bottom", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
          // endtrigger: "#plantLady",
          // end: "bottom bottom",
          // endTrigger: "poemLvl",
          // end: "bottom top",
          end: "+=900",
          scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
          pinSpacing: false,
          // pin: "#seekBtn"
        },
      })
      .from("#poemLine1", { y: 100, autoAlpha: 0, scale: 0.8 })
      .from("#poemLine2", { y: 100, autoAlpha: 0, scale: 0.8 })
      .from("#poemLine3", { y: 100, autoAlpha: 0, scale: 0.8 })
      .from("#finalplantLady", { y: 200, autoAlpha: 0, scale: 0.8 });
  }

  function doNothing() {
    //nothing at all
  }

  ////////////////////////////
  ////////// MUSIC ///////////
  ////////////////////////////

  const songMap = {
    chaos: {
      artist: "Klapshmock!",
      title: "Attack Zone X",
      file: "AttackZoneX.mp3",
    },
    calm: {
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
  playSound(backgroundMusic);

  backgroundMusic.loop = true;

  const beginSound = new Audio("./sounds/beginSound.mp3");
  beginSound.load();
  const genSound = new Audio("./sounds/genSound.mp3");
  genSound.load();

  function playSound(audio) {
    // audio.volume = 0.07;
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
    console.log("facde");
    // console.log(backgroundMusic.volume);
    if (backgroundMusic.volume > 0.01) {
      backgroundMusic.volume = Math.max(0, backgroundMusic.volume - 0.07);
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
            musicBtnContainer1.classList.add("spin");
            btn.classList.add("pause");
            backgroundMusic.pause();

            test = false;
            audioPlayer.volume = 0.9;
            audioPlayer.play();
          } else {
            musicBtnContainer1.classList.remove("musicBtnContainerPlaying");
            musicBtnContainer1.classList.remove("spin");

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
      '<span id="poemLine1">What is at the bottom for you, #playerAdj# seeker?</span><br><span id="poemLine2">Are you #playerVerb#?</span><br><span id="poemLine3">What would it mean to find #itemSought#?</span>',
      // "What is at the bottom, #playerAdj# seeker? #playerDesc.capitalize# #playerVerb# in #natureDesc# #natureNoun.s#. Reaching #q2#, forever #q1#wards. "
    ],
    playerAdj: [
      // "watchful",
      "thoughful",
      "curious",
      "resolute",
      "hopeful",
      "gentle",
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
      "watching",
      "waiting",
      "emerging",
      "inviting",
      "blooming",
      "limitless",
      "reaching",
      "awaiting",
      "eternal",
    ],
    natureDesc: [
      "limitless",
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
    // forest Meadow morning Night unfold Cyle chaos calm
    q3: [],
    itemSought: [],
  };

  function generateTracery() {
    var grammar = tracery.createGrammar(story);
    var result = grammar.flatten("#sentence#");
    document.getElementById("generatorTxt").innerHTML = result;
  }

  var playerState = {
    level: "none",
    itemSought: "peace",
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
  const poemLvl = document.getElementById("poemLvl");
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
  poemLvl.style.display = "none";
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

  function displayScrollArrow(parent) {
    const arrowDiv = document.createElement("div");
    arrowDiv.classList.add("arrow");
    arrowDiv.id = "arrow";
    const currentDiv = document.getElementById(parent);
    console.log(parent);
    currentDiv.appendChild(arrowDiv);

    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");
    for (var i = 0; i < 3; i++) {
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
    window.location.hash = "question"; // transport down the page
    playerQuestionLvl.style.display = "grid";
    spacer0.style.display = "grid";
    muteBtn.style.display = "block";
    playSound(beginSound);
    // playSound(backgroundMusic);
    beginBtn.classList.add("fade");
    setTimeout(function () {
      displayScrollArrow("beginBtnArrowDiv");
    }, 6000);
    // setTimeout(function(){
    //   beginBtn.innerHTML = "scroll down";
    //   beginBtn.classList.add("beginBtnToScroll");
    //   beginBtn.classList.remove("fade");
    // }, 10000);
    document.getElementById("beginLvlRow2").classList.remove("pulse");
    // setTimeout(function(){
    //   displayScrollArrow("beginLvlRow3");
    // }, 1000);
    pushStartLvlAwayAni.play();
    moveArrow();
    greenGlowAni();
    spacer0Ani();
    playerQuestionLvlAni();
    // var input = document.getElementById('seekText');
    // input.focus();
  }

  const seekText = document.getElementById("seekText");
  const seekBtn = document.getElementById("seekBtn");

  seekBtn.addEventListener("click", seekBtnHandler); // add an eventlistener to the  button
  function seekBtnHandler(event) {
    if (seekText.value !== "") {
      playerState.itemSought = seekText.value;
      story.itemSought.push(seekText.value);
    } else {
      playerState.itemSought = "peace";
      story.itemSought.push("peace");
    }
    playSound(beginSound);
    // seekBtn.innerHTML = "received";
    document.getElementById("whatDoYouSeek").innerHTML =
      "dive deeper,<br>seeker";
    seekBtn.classList.add("fade");
    seekText.classList.add("fade");
    setTimeout(function () {
      displayScrollArrow("seekBtnArrowDiv");
    }, 1000);
    questions3Lvl.style.display = "grid";
    spacer1.style.display = "grid";
    spacer2.style.display = "grid";
    choice1Lvl.style.display = "grid";
    // displayPlayerQuestion();
    questions3LvlAni();
    choice1Ani();
    greenSwimmerFollowAni();
  }

  var findSongBtn = document.getElementById("findSongBtn");
  findSongBtn.addEventListener("click", findSongBtnHandler);
  function findSongBtnHandler(event) {
    fadeSound();

    spacer6.style.display = "grid";
    poemLvl.style.display = "grid";
    lastLvl.style.display = "grid";
    spacer7.style.display = "grid";
    bottomLvl.style.display = "grid";
    generateTracery();
    playSound(beginSound);
    blueSwimmerFallAni();
    displayEndPoem();
    findSongBtn.classList.add("fade");
    setTimeout(function () {
      displayScrollArrow("findSongBtnArrowDiv");
    }, 1000);
    // findSongBtn.innerHTML = "scroll";
  }

  // is this an easier way to handle it?
  // https://codepen.io/GreenSock/pen/gPgVbN?editors=001
  // ci[counter].addEventListener("mouseover", () => hover.play());
  // ci[counter].addEventListener("mouseleave", () => hover.reverse());

  function setupLady(btn, lady, ladyHvr) {
    const ladyAni = gsap.to(lady, {
      opacity: 0,
      duration: 1,
      ease: "none",
      paused: true,
    });
    const ladyHvrAni = gsap.to(ladyHvr, {
      opacity: 1,
      duration: 1,
      ease: "none",
      paused: true,
    });

    function btnHvr(event) {
      ladyAni.play();
      ladyHvrAni.play();
    }

    function btnLeave(event) {
      ladyAni.reverse();
      ladyHvrAni.reverse();
    }

    btn.addEventListener("mouseover", btnHvr);
    btn.addEventListener("mouseleave", btnLeave);
  }

  var learnMoreBtn = document.getElementById("learnMoreBtn");
  var seatedLadyL = document.getElementById("seatedLadyL");
  var seatedLadyLHvr = document.getElementById("seatedLadyLHvr");
  var startOverBtn = document.getElementById("startOverBtn");
  var seatedLadyC = document.getElementById("seatedLadyC");
  var seatedLadyCHvr = document.getElementById("seatedLadyCHvr");
  var creditsBtn = document.getElementById("creditsBtn");
  var seatedLadyR = document.getElementById("seatedLadyR");
  var seatedLadyRHvr = document.getElementById("seatedLadyRHvr");

  setupLady(learnMoreBtn, seatedLadyL, seatedLadyLHvr);
  setupLady(startOverBtn, seatedLadyC, seatedLadyCHvr);
  setupLady(creditsBtn, seatedLadyR, seatedLadyRHvr);

  function learnMoreBtnHandler(event) {
    playSound(beginSound);
  }
  function startOverBtnHandler(event) {
    playSound(beginSound);
  }
  function creditsBtnHandler(event) {
    playSound(beginSound);
    creditsLvl.style.display = "grid";
  }
  learnMoreBtn.addEventListener("click", learnMoreBtnHandler);
  startOverBtn.addEventListener("click", startOverBtnHandler);
  creditsBtn.addEventListener("click", creditsBtnHandler);

  // function displayPlayerQuestion() {
  //   var x = document.getElementsByClassName("playerQuestion");
  //   var i;
  //   for (i = 0; i < x.length; i++) {
  //     x[i].innerHTML = playerState.itemSought;
  //   }
  // }

  // gsap.utils.toArray("choiceImage").forEach(choiceImage => {
  //   let hover = gsap.to(choiceImage, {scale: 3, color: "blue", duration: 1.5, paused: true, ease: "power1.inOut"});
  //   h1.addEventListener("mouseenter", () => hover.play());
  //   h1.addEventListener("mouseleave", () => hover.reverse());
  // });

  // function hoverOnChoiceImage() {

  var ci = document.getElementsByClassName("choiceImage");
  var counter;
  for (counter = 0; counter < ci.length; counter++) {
    const hover = gsap.to(ci[counter], {
      scale: 1.3,
      duration: 10,
      paused: true,
      ease: "Expo.easeOut",
    });
    ci[counter].addEventListener("mouseover", () => hover.play());
    ci[counter].addEventListener("mouseleave", () => hover.reverse());
  }

  // get all the links
  const upLink = document.getElementById("upLink");
  const downLink = document.getElementById("downLink");
  const darkLink = document.getElementById("darkLink");
  const joyLink = document.getElementById("joyLink");
  const chaosLink = document.getElementById("chaosLink");
  const calmLink = document.getElementById("calmLink");
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
  const calmImg = document.getElementById("calmImg");
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
    // finalImageRow.innerHTML = "";

    if (playerState.q1 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q1}.png`);
      img.setAttribute("class", "finalImage");
      // finalImageRow.appendChild(img);
    }

    if (playerState.q2 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q2}.png`);
      img.setAttribute("class", "finalImage");
      // finalImageRow.appendChild(img);
    }

    if (playerState.q3 !== undefined) {
      const img = document.createElement("img");
      img.setAttribute("src", `images/choices/${playerState.q3}.png`);
      img.setAttribute("class", "finalImage");
      // finalImageRow.appendChild(img);
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
      chosenImageDOM.classList.remove("cursorHand");
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
      unchosenImageDOM.classList.remove("styleChoiceImage");
      unchosenImageDOM.classList.remove("cursorHand");
      unchosenImageDOM.classList.add("fade");
      // unchosenImageDOM.removeEventListener("click" );

      // const unchosenTextId = unchosenValue+"Link";
      // const unchosenTextDOM = document.getElementById(unchosenTextId);
      // unchosenTextDOM.classList.add('fade');

      scrollTriggerFun();

      link.style.display = "grid";
      spacer.style.display = "grid";

      playerState[stateKey] = chosenValue;
      // story[stateKey] = chosenValue;

      setTimeout(function () {
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

  function singleHover(me, them) {
    me.addEventListener("mouseenter", function() {
      them.classList.add("highlight");
    })
    me.addEventListener("mouseleave", function() {
      them.classList.remove("highlight");
    })
  }
  function mutualHover(img, txt) {
    singleHover(img, txt);
    singleHover(txt, img);
  }

  function setupLvlHandlers(
    chosenDest,
    unChosenDest,
    stateKey,
    chosenValue,
    unChosenValue,
    level,
    spacer,
    scrollTriggerFun,
    chosenLink,
    chosenImg,
    unChosenLink,
    unChosenImg
  ) {
    const chosenHandler = makeLinkHandler(
      chosenDest,
      stateKey,
      chosenValue,
      unChosenValue,
      level,
      spacer,
      scrollTriggerFun
    );
    const unChosenHandler = makeLinkHandler(
      unChosenDest,
      stateKey,
      unChosenValue,
      chosenValue,
      level,
      spacer,
      scrollTriggerFun
    );

    chosenLink.addEventListener("click", chosenHandler);
    chosenLink.addEventListener("click", function () {
      unChosenLink.removeEventListener("click", unChosenHandler);
      chosenImg.removeEventListener("click", chosenHandler);
      unChosenImg.removeEventListener("click", unChosenHandler);
    });

    unChosenLink.addEventListener("click", unChosenHandler);
    unChosenLink.addEventListener("click", function () {
      chosenLink.removeEventListener("click", chosenHandler);
      unChosenImg.removeEventListener("click", unChosenHandler);
      chosenImg.removeEventListener("click", chosenHandler);
    });

    chosenImg.addEventListener("click", chosenHandler);
    chosenImg.addEventListener("click", function () {
      unChosenImg.removeEventListener("click", unChosenHandler);
    });

    unChosenImg.addEventListener("click", unChosenHandler);
    unChosenImg.addEventListener("click", function () {
      chosenImg.removeEventListener("click", chosenHandler);
    });

    mutualHover(chosenLink, chosenImg);
    mutualHover(unChosenLink, unChosenImg);
  }

  //creates and runs a function makeLinkHandler which returns a function
  setupLvlHandlers(
    upLvl,
    downLvl,
    "upOrDown",
    "up",
    "down",
    1,
    spacer3,
    choiceAni,
    upLink,
    upImg,
    downLink,
    downImg
  );
  setupLvlHandlers(
    darkLvl,
    joyLvl,
    "darkOrJoy",
    "dark",
    "joy",
    2,
    spacer4,
    choiceAni,
    darkLink,
    darkImg,
    joyLink,
    joyImg
  );
  setupLvlHandlers(
    findSongLvl,
    findSongLvl,
    "chaosOrCalm",
    "chaos",
    "calm",
    3,
    spacer5,
    blueSwimmerAni,
    chaosLink,
    chaosImg,
    calmLink,
    calmImg
  );
  setupLvlHandlers(
    findSongLvl,
    findSongLvl,
    "forestOrMeadow",
    "forest",
    "meadow",
    3,
    spacer5,
    blueSwimmerAni,
    forestLink,
    forestImg,
    meadowLink,
    meadowImg
  );
  setupLvlHandlers(
    outLvl,
    innerLvl,
    "outOrInner",
    "out",
    "inner",
    2,
    spacer4,
    choiceAni,
    outLink,
    outImg,
    innerLink,
    innerImg
  );
  setupLvlHandlers(
    findSongLvl,
    findSongLvl,
    "morningOrNight",
    "morning",
    "night",
    3,
    spacer5,
    blueSwimmerAni,
    morningLink,
    morningImg,
    nightLink,
    nightImg
  );
  setupLvlHandlers(
    findSongLvl,
    findSongLvl,
    "unfoldOrCycle",
    "unfold",
    "cycle",
    3,
    spacer5,
    blueSwimmerAni,
    unfoldLink,
    unfoldImg,
    cycleLink,
    cycleImg
  );
}

window.addEventListener("load", windowOnLoad);
