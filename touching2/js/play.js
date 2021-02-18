function windowOnLoad() {

  var touchGen = [{
    word: 'Rock',
    video: 'img/ot1.mp4',
    sound: 'audio/rockpond.mp3',
    desc: 'I am touching you like a rock skates across a frozen pond.'
  }, {
    word: 'Face',
    video: 'img/ot2.mp4',
    sound: 'audio/facewindow.mp3',
    desc: 'I feel your touch like a face in a window.'
  }, {
    word: 'Spoon',
    video: 'img/ot3.mp4',
    sound: 'audio/spoonbatter.mp3',
    desc: 'I am touching you like a spoon stirs thick batter.'
  }, {
    word: 'Weight',
    video: 'img/ot4.mp4',
    sound: 'audio/weightscale.mp3',
    desc: 'I feel your touch like a weight presses on a scale.'
  }, {
    word: 'Hole',
    video: 'img/ot5.mp4',
    sound: 'audio/holehome.mp3',
    desc: 'I am touching you like the hole touches the place it makes its home.'
  }, {
    word: 'Dark',
    video: 'img/ot6.mp4',
    sound: 'audio/darkeye.mp3',
    desc: 'I feel your touch like the darkness touches an eye.'
  }, {
    word: 'Hand',
    video: 'img/ot7.mp4',
    sound: 'audio/handsilk.mp3',
    desc: 'I am touching you like a rough hand grazes across silk.'
  }, {
    word: 'No',
    video: 'img/ot8.mp4',
    sound: 'audio/no.mp3',
    desc: 'I do not feel your touch.'
  }, ];

  var usedTouches = [];

  const song1 = new Audio("audio/waterfall.mp3");
  const songs = [song1];

  var video = document.getElementById("video");
  const videos = [video];

  var source = document.createElement("source");
  video.appendChild(source);

  const button = document.getElementById("words");

  function randomSelector() {
    var dronegenLength = touchGen.length;

    var randomNumber = Math.floor(Math.random() * dronegenLength);

    var newword = touchGen[randomNumber].word;
    var newdesc = touchGen[randomNumber].desc;

    var newsound = new Audio('audio/handsilk.mp3');
    // var newsound = touchGen[randomNumber].sound;
    var newvideo = touchGen[randomNumber].video;

    source.setAttribute("src", newvideo);
    // source.setAttribute("src", "img/touching0.mp4");
    video.load();
    // console.log(newsound);
    // document.getElementById("vid").innerHTML = newword;
    document.getElementById("words").innerHTML = newdesc;
    newsound.play();

    usedTouches.push(touchGen[randomNumber]);
    touchGen.splice(randomNumber, 1);

    if (dronegenLength === 1) {
      touchGen = [...usedTouches]; // copy usedTouches into touchGen
      usedTouches = []; //empty bucket - so next time we don't have doubles
    }
  }

  button.addEventListener(
    "click",
    function () {
      // playSong(song1);
      randomSelector();

    },
    false
  );

  function playSong(song) {
    for (i = 0; i < songs.length; i++) {
      songs[i].pause();
    }
    song.play();
  }
}


window.addEventListener("load", windowOnLoad);