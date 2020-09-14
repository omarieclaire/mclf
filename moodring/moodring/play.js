var userState = {
	name: "",
	level: 'begin',
	answerToQuestion1: false,
	answerToQuestion2: false,
	answerToQuestion3: false,
	answerToQuestion4: false,
	answerToQuestion5: false,
	answerToQuestion6: false,
	answerToQuestion7: false,
};

var begin;

function toggleSceneViz(lastScene, nextScene){
	lastScene.style.display = "none";
	nextScene.style.display = "block";
}

function windowOnLoad() {
	const gameSetup = document.getElementById('gameSetup');
	const scene1 = document.getElementById('begin');
	const scene2 = document.getElementById('submerge');
	const scene3 = document.getElementById('emerge');
	const scene4 = document.getElementById('soften');
	const scene5 = document.getElementById('stretch');
	const scene6 = document.getElementById('over');
	const scene7 = document.getElementById('under');
	const scene8 = document.getElementById('light');
	const scene9 = document.getElementById('dark');
	const scene10 = document.getElementById('branches');
	const scene11 = document.getElementById('roots');
	const scene12 = document.getElementById('northernlights');
	const scene13 = document.getElementById('rainbow');
	const scene14 = document.getElementById('destroy');
	const scene15 = document.getElementById('create');

	scene1.style.display = "none";
	scene2.style.display = "none";
	scene3.style.display = "none";
	scene4.style.display = "none";
	scene5.style.display = "none";
	scene6.style.display = "none";
	scene7.style.display = "none";
	scene8.style.display = "none";
	scene9.style.display = "none";
	scene10.style.display = "none";
	scene11.style.display = "none";
	scene12.style.display = "none";
	scene13.style.display = "none";
	scene14.style.display = "none";
	scene15.style.display = "none";


	// DOM element for the input field
	const seekInput = document.getElementById('seek');

	// DOM element for the span we'll use to update with
	// the value of the input field
	const nameSpanText = document.getElementById('nametext');
	// function that gets called whenever "keyup" event happens
	// on the input field
	function handleNameInput(event) {
		nameSpanText.innerHTML = seekInput.value;
	}
	// configure the input field to call the above function on the keyup event
	seekInput.addEventListener('keyup', handleNameInput);


	var enterbtn = document.getElementById('enterbtn');
	function myButtonHandler(event) {
		gameSetup.style.display = "none";
		scene1.style.display = "block";
		console.log("yup");

		// userState.level = "cool";

		event.preventDefault();
	}
	enterbtn.addEventListener('click', myButtonHandler);
}

window.addEventListener('load', windowOnLoad);
