var prevBtn;
var newBtn;

const song1 = new Audio("./audio/love.mp3");
// song1.preload = "auto";
// song1.load();
const song2 = new Audio("./audio/ask.mp3");
const song3 = new Audio("./audio/face.mp3");
const song4 = new Audio("./audio/hey.mp3");
const song5 = new Audio("./audio/numb.mp3");
const song6 = new Audio("./audio/why.mp3");

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
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn1; // now set the new butn in the new butn var
	updateBtnStyle(prevBtn, btn1);
	source.setAttribute('src', 'img/v1.mp4');
	video.load();
    playSong(song1);
}, false);
btn2.addEventListener("click", function(){
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn2; // now set the new butn in the new butn var
	updateBtnStyle(prevBtn, btn2);
	source.setAttribute('src', 'img/v2.mp4');
	video.load();
    playSong(song2);
}, false);
btn3.addEventListener("click", function(){
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn3; // now set the new butn in the new butn var
	updateBtnStyle(prevBtn, btn3);
	source.setAttribute('src', 'img/v3.mp4');
	video.load();
    playSong(song3);
}, false); 
btn4.addEventListener("click", function(){
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn4; // now set the new butn in the new butn var
	updateBtnStyle(prevBtn, btn4);
	source.setAttribute('src', 'img/v4.mp4');
	video.load();
    playSong(song4);
}, false);
btn5.addEventListener("click", function(){
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn5; // now set the new butn in the new butn var
	source.setAttribute('src', 'img/v5.mp4');
	video.load();
    playSong(song5);
}, false);
btn6.addEventListener("click", function(){
	prevBtn = newBtn // move/store the last button value in the last button var
	newBtn = btn6; // now set the new butn in the new butn var
	source.setAttribute('src', 'img/v6.mp4');
	video.load();
    playSong(song6);
}, false); 

function updateBtnStyle(prevBtn, newBtn){
	if (prevBtn != undefined){
		prevBtn.classList.remove("currBtn");
	}
	console.log(newBtn);
	newBtn.classList.add("currBtn");
}

function playSong(song){
	for(i=0; i<songs.length; i++) {
		songs[i].pause();
	}
	song.play();
}


// setTimeout(function() {  
//     video.pause();

//     source.setAttribute('src', 'http://www.tools4movies.com/trailers/1012/Despicable%20Me%202.mp4'); 

//     video.load();
//     video.play();
// }, 3000);



