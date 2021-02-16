function windowOnLoad() {
  var currBtn;

  const song1 = new Audio("audio/love.mp3");
  const song2 = new Audio("audio/ask.mp3");
  const song3 = new Audio("audio/face.mp3");
  const song4 = new Audio("audio/hey.mp3");
  const song5 = new Audio("audio/numb.mp3");
  const song6 = new Audio("audio/why.mp3");

  const songs = [song1, song2, song3, song4, song5, song6];

  var video = document.getElementById("video");
  var source = document.createElement("source");
  video.appendChild(source);

  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");
  const btn3 = document.getElementById("btn3");
  const btn4 = document.getElementById("btn4");
  const btn5 = document.getElementById("btn5");
  const btn6 = document.getElementById("btn6");

  btn1.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn1);
      source.setAttribute("src", "img/v1.mp4");
      video.load();
      playSong(song1);
    },
    false
  );
  btn2.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn2);
      source.setAttribute("src", "img/v2.mp4");
      video.load();
      playSong(song2);
    },
    false
  );
  btn3.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn3);
      source.setAttribute("src", "img/v3.mp4");
      video.load();
      playSong(song3);
    },
    false
  );
  btn4.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn4);
      source.setAttribute("src", "img/v4.mp4");
      video.load();
      playSong(song4);
    },
    false
  );
  btn5.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn5);
      source.setAttribute("src", "img/v5.mp4");
      video.load();
      playSong(song5);
    },
    false
  );
  btn6.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn6);
      source.setAttribute("src", "img/v6.mp4");
      video.load();
      playSong(song6);
    },
    false
  );

  function updateBtnStyle(clickedBtn) {
    // remove the class from the old button (which is the "current" button)
    if (currBtn !== undefined) {
      currBtn.classList.remove("currBtn");
    }
    currBtn = clickedBtn; // update the "current" button to the most recently clicked button
    clickedBtn.classList.add("currBtn");
  }

  function playSong(song) {
    for (i = 0; i < songs.length; i++) {
      songs[i].pause();
    }
    song.play();
  }
// three js
  const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

}

window.addEventListener("load", windowOnLoad);