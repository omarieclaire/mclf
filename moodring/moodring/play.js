// stores what decision the user has made
var userState = {
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
	const startScreen = document.getElementById('startScreen');
	const yourQuestion = document.getElementById('yourQuestion');
	const questions3 = document.getElementById('questions3');
	const begin = document.getElementById('begin');
	const up = document.getElementById('up');
	const down = document.getElementById('down');
	const dark = document.getElementById('dark');
	const joy = document.getElementById('joy');
	const out = document.getElementById('out');
	const inner = document.getElementById('inner');
	const terminal = document.getElementById('terminal');
	const credits = document.getElementById('credits');

	// set each level to be invisible
	yourQuestion.style.display = "none";
	questions3.style.display = "none";
	begin.style.display = "none";
	up.style.display = "none";
	down.style.display = "none";
	dark.style.display = "none";
	joy.style.display = "none";
	out.style.display = "none";
	inner.style.display = "none";
	credits.style.display = "none";
	terminal.style.display = "none";

	var beginBtn = document.getElementById('beginBtn'); // get the button
	beginBtn.addEventListener('click', beginBtnButtonHandler); // add an eventlistener to the enter button
	function beginBtnButtonHandler(event) {  // set the begin to visible when you click on the enter button
		// window.location.hash='question'; // transport down the page
		yourQuestion.style.display = "block";
		playSound("begin");
		beginBtn.innerHTML = 'scroll';
	}

	const seekText = document.getElementById('seekText');
	const seekBtn = document.getElementById('seekBtn');

	seekBtn.addEventListener('click', questionBtnHandler); // add an eventlistener to the  button
	function questionBtnHandler(event) {
		userState.question = seekText.value;
		playSound("begin");
		seekBtn.innerHTML = 'received';
		seekText.classList.add('fade');
		questions3.style.display = "block";
		begin.style.display = "block";
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
			x[i].innerHTML = userState.question;
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

	function playSound(name) {
		var audio = new Audio("../sounds/" + name + "Ding.mp3");
		audio.play();
	}

	function renderSong(userState) {
		if(userState.q3 === undefined) {
			return;
		}

		var song = songMap[userState.q3];
		
		var audioSrc = document.getElementById('audioSource');
		audioSrc.setAttribute('src', `sounds/${song.file}`);
		
		var artistText = document.getElementById('artist');
		artistText.textContent = song.artist;

		var titleText = document.getElementById('title');
		titleText.textContent = song.title;

		terminal.display = 'block';
		console.log('render audio');
	}

	// draws the final images based on userState
	function renderUserState(userState) {
		var finalImageRow = document.getElementById("finalImageRow");
		// clear images inside <div> so you can add new ones
		finalImageRow.innerHTML = '';

		if (userState.q1 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${userState.q1}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (userState.q2 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${userState.q2}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (userState.q3 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${userState.q3}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}
		console.log('render user state');
	}

	// called when the links are clicked
	function makeLinkHandler(link, stateKey, stateValue, level) {
		function linkHandler(event) {
			playSound("gen");
			link.style.display = "block";
			userState[stateKey] = stateValue;
			console.log(JSON.stringify(userState))
			if (level === 1) {
				userState.q1 = stateValue;
				// only re-render if they've answered all the questions
				renderUserState(userState);
				renderSong(userState);
			} else if (level === 2) {
				userState.q2 = stateValue;
				renderUserState(userState);
				renderSong(userState);
			} else if (level === 3) {
				userState.q3 = stateValue;
				renderUserState(userState);
				renderSong(userState);
			}
		}
		return linkHandler;
	}

	//creates and runs a function makeLinkHandler which returns a function
	upLink.addEventListener('click', makeLinkHandler(up, 'upOrDown', 'up', 1));
	downLink.addEventListener('click', makeLinkHandler(down, 'upOrDown', 'down', 1));
	darkLink.addEventListener('click', makeLinkHandler(dark, 'darkOrJoy', 'dark', 2));
	joyLink.addEventListener('click', makeLinkHandler(joy, 'darkOrJoy', 'joy', 2));
	chaosLink.addEventListener('click', makeLinkHandler(terminal, 'chaosOrGentle', 'chaos', 3));
	gentleLink.addEventListener('click', makeLinkHandler(terminal, 'chaosOrGentle', 'gentle', 3));
	forestLink.addEventListener('click', makeLinkHandler(terminal, 'forestOrMeadow', 'forest', 3));
	meadowLink.addEventListener('click', makeLinkHandler(terminal, 'forestOrMeadow', 'meadow', 3));
	outLink.addEventListener('click', makeLinkHandler(out, 'outOrInner', 'out', 2));
	innerLink.addEventListener('click', makeLinkHandler(inner, 'outOrInner', 'inner', 2));
	morningLink.addEventListener('click', makeLinkHandler(terminal, 'morningOrNight', 'morning', 3));
	nightLink.addEventListener('click', makeLinkHandler(terminal, 'morningOrNight', 'night', 3));
	unfoldLink.addEventListener('click', makeLinkHandler(terminal, 'unfoldOrCycle', 'unfold', 3));
	cycleLink.addEventListener('click', makeLinkHandler(terminal, 'unfoldOrCycle', 'cycle', 3));

	upImg.addEventListener('click', makeLinkHandler(up, 'upOrDown', 'up', 1));
	downImg.addEventListener('click', makeLinkHandler(down, 'upOrDown', 'down', 1));
	darkImg.addEventListener('click', makeLinkHandler(dark, 'darkOrJoy', 'dark', 2));
	joyImg.addEventListener('click', makeLinkHandler(joy, 'darkOrJoy', 'joy', 2));
	chaosImg.addEventListener('click', makeLinkHandler(terminal, 'chaosOrGentle', 'chaos', 3));
	gentleImg.addEventListener('click', makeLinkHandler(terminal, 'chaosOrGentle', 'gentle', 3));
	forestImg.addEventListener('click', makeLinkHandler(terminal, 'forestOrMeadow', 'forest', 3));
	meadowImg.addEventListener('click', makeLinkHandler(terminal, 'forestOrMeadow', 'meadow', 3));
	outImg.addEventListener('click', makeLinkHandler(out, 'outOrInner', 'out', 2));
	innerImg.addEventListener('click', makeLinkHandler(inner, 'outOrInner', 'inner', 2));
	morningImg.addEventListener('click', makeLinkHandler(terminal, 'morningOrNight', 'morning', 3));
	nightImg.addEventListener('click', makeLinkHandler(terminal, 'morningOrNight', 'night', 3));
	unfoldImg.addEventListener('click', makeLinkHandler(terminal, 'unfoldOrCycle', 'unfold', 3));
	cycleImg.addEventListener('click', makeLinkHandler(terminal, 'unfoldOrCycle', 'cycle', 3));
}

window.addEventListener('load', windowOnLoad);
