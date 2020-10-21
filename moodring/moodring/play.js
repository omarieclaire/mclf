// stores what decision the player has made
var playerState = {
	level: 'none',
	question: 'question',
	upOrDown: undefined,
	darkOrJoy: undefined,
	chaosOrGentle: undefined,
	forestOrMeadow: undefined,
	outOrIn: undefined,
	morningOrNight: undefined,
	unfoldOrCyle: undefined,
	numQuestionsAnswered: 0,
	q1: undefined,
	q2: undefined,
	q3: undefined,
	song: undefined
};

const songMap = {
	'chaos': {
		artist: 'Klapschmock',
		title: 'Attack Zone X',
		file: 'Klapshmock-AttackZoneX.mp3'
	},
	'gentle': {
		artist: 'Deidre',
		title: 'Numb',
		file: 'Deidre-Numb.mp3'
	},
	'forest': {
		artist: 'Mas Aya',
		title: 'AGAKHAN',
		file: 'MasAya-AGAKHAN.mp3'
	},
	'meadow': {
		artist: 'Orchidae',
		title: 'Love Demo',
		file: 'Orchidae-LoveDemo.mp3',
	},
	'morning': {
		artist: 'Century Egg',
		title: 'I Will Make Up A Method',
		file: 'CenturyEgg-IWillMakeUpAMethod.mp3'
	},
	'night': {
		artist: 'Slow Pitch Sound',
		title: 'You Betta Change ft. Distant Dust',
		file: 'SlowPitchSound-YouBettaChangeftDistantDust.mp3'
	},
	'unfold': {
		artist: 'Melody McKiver, Thomas Goguelin',
		title: 'Berlinale Duet',
		file: 'MelodyMcKiver_ThomasGoguelin-BerlinaleDuet.mp3'
	},
	'cycle': {
		artist: 'Bucko',
		title: 'Pro Testing',
		file: 'Bucko-ProTesting.mp3'
	}
}


// get each "level"
function windowOnLoad() {
	const beginLvl = document.getElementById('beginLvl');
	const playerQuestionLvl = document.getElementById('playerQuestionLvl');
	const questions3Lvl = document.getElementById('questions3Lvl');
	const choice1Lvl = document.getElementById('choice1Lvl');
	const upLvl = document.getElementById('upLvl');
	const downLvl = document.getElementById('downLvl');
	const darkLvl = document.getElementById('darkLvl');
	const joyLvl = document.getElementById('joyLvl');
	const outLvl = document.getElementById('outLvl');
	const innerLvl = document.getElementById('innerLvl');
	const lastLvl = document.getElementById('lastLvl');
	const creditsLvl = document.getElementById('creditsLvl');

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
	creditsLvl.style.display = "none";
	lastLvl.style.display = "none";

	var beginBtn = document.getElementById('beginBtn'); // get the button
	beginBtn.addEventListener('click', beginBtnButtonHandler); // add an eventlistener to the enter button
	function beginBtnButtonHandler(event) {  // set the begin to visible when you click on the enter button
		// window.location.hash='question'; // transport down the page
		playerQuestionLvl.style.display = "grid";
		playSound(beginSound);
		playSound(backgroundMusic);
		beginBtn.innerHTML = 'scroll';
	}

	const seekText = document.getElementById('seekText');
	const seekBtn = document.getElementById('seekBtn');

	seekBtn.addEventListener('click', questionBtnHandler); // add an eventlistener to the  button
	function questionBtnHandler(event) {
		playerState.question = seekText.value;
		playSound(beginSound);
		seekBtn.innerHTML = 'received';
		seekText.classList.add('fade');
		questions3Lvl.style.display = "grid";
		choice1Lvl.style.display = "grid";
		displayPlayerQuestion();
	}

	// var readyBtn = document.getElementById('readyBtn'); // get the button
	// readyBtn.addEventListener('click', readyBtnButtonHandler); // add an eventlistener to the enter button
	// function readyBtnButtonHandler(event) {  // set the begin to visible when you click on the enter button
	// 	begin.style.display = "block";
	// 	playSound("begin");
	// 	readyBtn.innerHTML = 'scroll';
	// }

	function displayPlayerQuestion() {
		var x = document.getElementsByClassName("playerQuestion");
		var i;
		for (i = 0; i < x.length; i++) {
			x[i].innerHTML = playerState.question;
		}
	}

	// get all the links
	const upLink = document.getElementById('upLink');
	const downLink = document.getElementById('downLink');
	const darkLink = document.getElementById('darkLink');
	const joyLink = document.getElementById('joyLink');
	const chaosLink = document.getElementById('chaosLink');
	const gentleLink = document.getElementById('gentleLink');
	const forestLink = document.getElementById('forestLink');
	const meadowLink = document.getElementById('meadowLink');
	const outLink = document.getElementById('outLink');
	const innerLink = document.getElementById('innerLink');
	const morningLink = document.getElementById('morningLink');
	const nightLink = document.getElementById('nightLink');
	const unfoldLink = document.getElementById('unfoldLink');
	const cycleLink = document.getElementById('cycleLink');
	// get all the images
	const upImg = document.getElementById('upImg');
	const downImg = document.getElementById('downImg');
	const darkImg = document.getElementById('darkImg');
	const joyImg = document.getElementById('joyImg');
	const chaosImg = document.getElementById('chaosImg');
	const gentleImg = document.getElementById('gentleImg');
	const forestImg = document.getElementById('forestImg');
	const meadowImg = document.getElementById('meadowImg');
	const outImg = document.getElementById('outImg');
	const innerImg = document.getElementById('innerImg');
	const morningImg = document.getElementById('morningImg');
	const nightImg = document.getElementById('nightImg');
	const unfoldImg = document.getElementById('unfoldImg');
	const cycleImg = document.getElementById('cycleImg');

	const backgroundMusic = new Audio("./sounds/backgroundMusic.mp3");
	const beginSound = new Audio("./sounds/beginSound.mp3");
	const genSound = new Audio("./sounds/genSound.mp3");

	function playSound(audio) {
		audio.play();
	}

	function renderSong(playerState) {
		if (playerState.q3 === undefined) {
			return;
		}

		var song = songMap[playerState.q3];
		console.log(`the song is: ${JSON.stringify(song)}`);

		var audioSrc = document.getElementById('audioSource');
		audioSrc.setAttribute('src', `sounds/${song.file}`);

		var artistText = document.getElementById('artist');
		artistText.textContent = song.artist;

		var titleText = document.getElementById('title');
		titleText.textContent = song.title;

		lastLvl.display = 'grid';
		console.log(document.getElementById('musicbutton1'));

		// force the browser to refresh the audio source
		var audio = document.getElementById('player1');
		audio.load();
		creditsLvl.style.display = 'grid';
		backgroundMusic.pause();

	}

	// draws the final images based on playerState
	function renderplayerState(playerState) {
		var finalImageRow = document.getElementById("finalImageRow");
		// clear images inside <div> so you can add new ones
		finalImageRow.innerHTML = '';

		if (playerState.q1 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q1}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (playerState.q2 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q2}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (playerState.q3 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q3}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}
		console.log('render player state');
	}

	// called when the links are clicked
	function makeLinkHandler(link, stateKey, chosenValue, otherImage, level) {
		function linkHandler(event) {
			event.preventDefault()

			playSound(genSound);

			otherImage.classList.add('fade');

			link.style.display = "grid";
			playerState[stateKey] = chosenValue;
			console.log(JSON.stringify(playerState))
			if (level === 1) {
				playerState.q1 = chosenValue;
				// only re-render if they've answered all the questions
				renderplayerState(playerState);
				renderSong(playerState);
			} else if (level === 2) {
				playerState.q2 = chosenValue;
				renderplayerState(playerState);
				renderSong(playerState);
			} else if (level === 3) {
				playerState.q3 = chosenValue;
				renderplayerState(playerState);
				renderSong(playerState);
			}
		}
		return linkHandler;
	}

	//creates and runs a function makeLinkHandler which returns a function
	upLink.addEventListener('click', makeLinkHandler(upLvl, 'upOrDown', 'up', downImg, 1));
	downLink.addEventListener('click', makeLinkHandler(downLvl, 'upOrDown', 'down', upImg, 1));
	darkLink.addEventListener('click', makeLinkHandler(darkLvl, 'darkOrJoy', 'dark', joyImg, 2));
	joyLink.addEventListener('click', makeLinkHandler(joyLvl, 'darkOrJoy', 'joy', darkImg,2));
	chaosLink.addEventListener('click', makeLinkHandler(lastLvl, 'chaosOrGentle', 'chaos', gentleImg,3));
	gentleLink.addEventListener('click', makeLinkHandler(lastLvl, 'chaosOrGentle', 'gentle', chaosImg,3));
	forestLink.addEventListener('click', makeLinkHandler(lastLvl, 'forestOrMeadow', 'forest', meadowImg,3));
	meadowLink.addEventListener('click', makeLinkHandler(lastLvl, 'forestOrMeadow', 'meadow', forestImg,3));
	outLink.addEventListener('click', makeLinkHandler(outLvl, 'outOrInner', 'out', innerImg,2));
	innerLink.addEventListener('click', makeLinkHandler(innerLvl, 'outOrInner', 'inner', outImg,2));
	morningLink.addEventListener('click', makeLinkHandler(lastLvl, 'morningOrNight', 'morning', nightImg, 3));
	nightLink.addEventListener('click', makeLinkHandler(lastLvl, 'morningOrNight', 'night', morningImg ,3));
	unfoldLink.addEventListener('click', makeLinkHandler(lastLvl, 'unfoldOrCycle', 'unfold', cycleImg,3));
	cycleLink.addEventListener('click', makeLinkHandler(lastLvl, 'unfoldOrCycle', 'cycle', unfoldImg,3));

	upImg.addEventListener('click', makeLinkHandler(upLvl, 'upOrDown', 'up', downImg,1));
	downImg.addEventListener('click', makeLinkHandler(downLvl, 'upOrDown', 'down', upImg,1));
	darkImg.addEventListener('click', makeLinkHandler(darkLvl, 'darkOrJoy', 'dark', joyImg,2));
	joyImg.addEventListener('click', makeLinkHandler(joyLvl, 'darkOrJoy', 'joy', darkImg,2));
	chaosImg.addEventListener('click', makeLinkHandler(lastLvl, 'chaosOrGentle', 'chaos', gentleImg,3));
	gentleImg.addEventListener('click', makeLinkHandler(lastLvl, 'chaosOrGentle', 'gentle', chaosImg,3));
	forestImg.addEventListener('click', makeLinkHandler(lastLvl, 'forestOrMeadow', 'forest', meadowImg,3));
	meadowImg.addEventListener('click', makeLinkHandler(lastLvl, 'forestOrMeadow', 'meadow', forestImg,3));
	outImg.addEventListener('click', makeLinkHandler(outLvl, 'outOrInner', 'out', innerImg,2));
	innerImg.addEventListener('click', makeLinkHandler(innerLvl, 'outOrInner', 'inner', outImg,2));
	morningImg.addEventListener('click', makeLinkHandler(lastLvl, 'morningOrNight', 'morning', nightImg,3));
	nightImg.addEventListener('click', makeLinkHandler(lastLvl, 'morningOrNight', 'night', morningImg,3));
	unfoldImg.addEventListener('click', makeLinkHandler(lastLvl, 'unfoldOrCycle', 'unfold', cycleImg,3));
	cycleImg.addEventListener('click', makeLinkHandler(lastLvl, 'unfoldOrCycle', 'cycle', unfoldImg,3));
}

window.addEventListener('load', windowOnLoad);
