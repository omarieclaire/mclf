function windowOnLoad() {

  const song1 = new Audio("audio/drone.mp3");
  const songs = [song1];

  var srockpond = new Audio('audio/rockpond.mp3');
  var sfacewindow = new Audio('audio/facewindow.mp3');
  var sspoonbatter = new Audio('audio/spoonbatter.mp3');
  var sweightscale = new Audio('audio/weightscale.mp3');
  var sholehome = new Audio('audio/holehome.mp3');
  var sdarkeye = new Audio('audio/darkeye.mp3');
  var shandsilk = new Audio('audio/handsilk.mp3');
  var sno = new Audio('audio/no.mp3');

  const sounds = [srockpond, sfacewindow, sspoonbatter, sweightscale, sholehome, sdarkeye, shandsilk, sno]

  var touchGen = [{
    word: 'Rock',
    video: 'img/ot1.mp4',
    sound: srockpond,
    desc: 'I am touching you like a rock skates across a frozen pond.'
  }, {
    word: 'Face',
    video: 'img/ot2.mp4',
    sound: sfacewindow,
    desc: 'I feel your touch like a face in a window.'
  }, {
    word: 'Weight',
    video: 'img/ot4.mp4',
    sound: sweightscale,
    desc: 'I feel your touch like a weight presses on a scale.'
  }, {
    word: 'Hole',
    video: 'img/ot5.mp4',
    sound: sholehome,
    desc: 'I am touching you like the hole touches the place it makes its home.'
  }, {
    word: 'Dark',
    video: 'img/ot6.mp4',
    sound: sdarkeye,
    desc: 'I feel your touch like the darkness touches an eye.'
  }, {
    word: 'Hand',
    video: 'img/ot7.mp4',
    sound: shandsilk,
    desc: 'I am touching you like a rough hand grazes across silk.'
  }, {
    word: 'No',
    video: 'img/ot8.mp4',
    sound: sno,
    desc: 'I do not feel your touch.'
  }, ];

  var usedTouches = [];
  var video = document.getElementById("video");
  const videos = [video];

  var source = document.createElement("source");
  video.appendChild(source);

  const button = document.getElementById("wrapper");

  function randomSelector() {
    var touchGenLength = touchGen.length;

    var randomNumber = Math.floor(Math.random() * touchGenLength);

    var newword = touchGen[randomNumber].word;
    var newdesc = touchGen[randomNumber].desc;
    var newsound = touchGen[randomNumber].sound;
    var newvideo = touchGen[randomNumber].video;

    source.setAttribute("src", newvideo);
    // source.setAttribute("src", "img/touching0.mp4");
    video.load();
    document.getElementById("words").innerHTML = newdesc;
    newsound.play();

    usedTouches.push(touchGen[randomNumber]);
    touchGen.splice(randomNumber, 1);

    if (touchGenLength === 1) {
      touchGen = [...usedTouches]; // copy usedTouches into touchGen
      usedTouches = []; //empty bucket - so next time we don't have doubles
    }
  }

  button.addEventListener(
    "click",
    function () {
      playSong(song1);
      randomSelector();

    },
    false
  );

  function playSong(song) {
    if (typeof song.loop == 'boolean')
    {
      song.loop = true;
    }
    else
    {
      song.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
    song.play();
  }




  // function playSong(song) {
  //   for (i = 0; i < songs.length; i++) {
  //     songs[i].pause();
  //   }
  //   song.play();
  // }

}


window.addEventListener("load", windowOnLoad);