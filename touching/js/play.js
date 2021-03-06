function windowOnLoad() {

  var touchGen = [{
    word: 'Lid',
    video: 'img/jar.mp4',
    desc: 'I am touching you like a lid touches a jar.'
  }, {
    word: 'Twig',
    video: 'img/twig.mp4',
    desc: 'I am touching you like a flame touches a twig.'
  }, {
    word: 'Truth',
    video: 'img/sandpaper.mp4',
    desc: 'I am touching you like sandpaper touches fingertips.'
  }, {
    word: 'Wall',
    video: 'img/touching0.mp4',
    desc: 'I am touching you like the sunlight touches the wall.'
  }, {
    word: 'Wave',
    video: 'img/waves.mp4',
    desc: 'I am touching you like a wave touches the shoreline.'
  }, {
    word: 'Door',
    video: 'img/knocker.mp4',
    desc: 'I am touching you like a knocker touches a door.'
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
    var newvideo = touchGen[randomNumber].video;

    source.setAttribute("src", newvideo);
    // source.setAttribute("src", "img/touching0.mp4");
    video.load();

    // document.getElementById("vid").innerHTML = newword;
    document.getElementById("words").innerHTML = newdesc;

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
      playSong(song1);
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