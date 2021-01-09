var currBtn;

const song1 = new Audio("audio/love.mp3");
const song2 = new Audio("audio/ask.mp3");
const song3 = new Audio("audio/face.mp3");
const song4 = new Audio("audio/hey.mp3");
const song5 = new Audio("audio/numb.mp3");
const song6 = new Audio("audio/why.mp3");

song1.preload = "auto";
song1.load();
song2.preload = "auto";
song2.load();
song3.preload = "auto";
song3.load();
song4.preload = "auto";
song4.load();
song5.preload = "auto";
song5.load();
song6.preload = "auto";
song6.load();

const songs = [song1, song2, song3, song4, song5, song6];

var video = document.getElementById('video');
var source = document.createElement('source');
video.appendChild(source);

const btn1 = document.getElementById("btn1")
const btn2 = document.getElementById("btn2")
const btn3 = document.getElementById("btn3")
const btn4 = document.getElementById("btn4")
const btn5 = document.getElementById("btn5")
const btn6 = document.getElementById("btn6")

btn1.addEventListener("click", function(){
	updateBtnStyle(btn1);
	source.setAttribute('src', 'img/v1.mp4');
	video.load();
    playSong(song1);
}, false);
btn2.addEventListener("click", function(){
	updateBtnStyle(btn2);
	source.setAttribute('src', 'img/v2.mp4');
	video.load();
    playSong(song2);
}, false);
btn3.addEventListener("click", function(){
	updateBtnStyle(btn3);
	source.setAttribute('src', 'img/v3.mp4');
	video.load();
    playSong(song3);
}, false); 
btn4.addEventListener("click", function(){
	updateBtnStyle(btn4);
	source.setAttribute('src', 'img/v4.mp4');
	video.load();
    playSong(song4);
}, false);
btn5.addEventListener("click", function(){
	updateBtnStyle(btn5);
	source.setAttribute('src', 'img/v5.mp4');
	video.load();
    playSong(song5);
}, false);
btn6.addEventListener("click", function(){
	updateBtnStyle(btn6);
	source.setAttribute('src', 'img/v6.mp4');
	video.load();
    playSong(song6);
}, false); 

// there are things that change: current button, previous button
// there are things that are specific to the event or context: clicked button



function updateBtnStyle(clickedBtn){
	// remove the class from the old button (which is the "current" button)
	if (currBtn !== undefined){
		currBtn.classList.remove("currBtn");
	}
	currBtn = clickedBtn; 	// update the "current" button to the most recently clicked button
	clickedBtn.classList.add("currBtn");
}

function playSong(song){
	for(i=0; i<songs.length; i++) {
		songs[i].pause();
	}
	song.play();
}


