// stores what decision the user has made
var userState = {
	level: 'begin',
	upOrDown: undefined,
	darkOrJoy: undefined,
	chaosOrGentle: undefined,
	forestOrMeadow: undefined,
	outOrIn: undefined,
	morningOrNight: undefined,
	unfoldOrCyle: undefined,
};

// get each "level"
function windowOnLoad() {
	const startScreen = document.getElementById('startScreen');
	const begin = document.getElementById('begin');
	const up = document.getElementById('up');
	const down = document.getElementById('down');
	const dark = document.getElementById('dark');
	const joy = document.getElementById('joy');
	const chaos = document.getElementById('chaos');
	const gentle = document.getElementById('gentle');
	const forest = document.getElementById('forest');
	const meadow = document.getElementById('meadow');
	const out = document.getElementById('out');
	const inner = document.getElementById('inner');
	const morning = document.getElementById('morning');
	const night = document.getElementById('night');
	const unfold = document.getElementById('unfold');
	const cycle = document.getElementById('cycle');

// set each level to be invisible
	begin.style.display = "none";
	up.style.display = "none";
	down.style.display = "none";
	dark.style.display = "none";
	joy.style.display = "none";
	chaos.style.display = "none";
	gentle.style.display = "none";
	forest.style.display = "none";
	meadow.style.display = "none";
	out.style.display = "none";
	inner.style.display = "none";
	morning.style.display = "none";
	night.style.display = "none";
	unfold.style.display = "none";
	cycle.style.display = "none";


	var enterbtn = document.getElementById('enterbtn'); // get the button
	enterbtn.addEventListener('click', myButtonHandler); // add an eventlistener to the enter button
	function myButtonHandler(event) {  // set the begin to visible when you click on the enter button
		begin.style.display = "block";
		enterbtn.innerHTML = 'scroll';
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

	function makeLinkHandler(link, stateKey, stateValue) {
		function linkHandler(event) {
			link.style.display = "block";
			userState[stateKey] = stateValue;
			console.log(JSON.stringify(userState));
		}
		return linkHandler;
	}

//creates and runs a function makeLinkHandler which returns a function
upLink.addEventListener('click', makeLinkHandler(up, 'upOrDown', 'up'));
downLink.addEventListener('click', makeLinkHandler(down, 'upOrDown', 'down'));
darkLink.addEventListener('click', makeLinkHandler(dark, 'darkOrJoy', 'dark'));
joyLink.addEventListener('click', makeLinkHandler(joy, 'darkOrJoy', 'joy'));
chaosLink.addEventListener('click', makeLinkHandler(chaos, 'chaosOrGentle', 'chaos'));
gentleLink.addEventListener('click', makeLinkHandler(gentle, 'chaosOrGentle', 'gentle'));
forestLink.addEventListener('click', makeLinkHandler(forest, 'forestOrMeadow', 'forest'));
meadowLink.addEventListener('click', makeLinkHandler(meadow, 'forestOrMeadow', 'meadow'));
outLink.addEventListener('click', makeLinkHandler(out, 'outOrInner', 'out'));
innerLink.addEventListener('click', makeLinkHandler(inner, 'outOrInner', 'inner'));
morningLink.addEventListener('click', makeLinkHandler(morning, 'morningOrNight', 'morning'));
nightLink.addEventListener('click', makeLinkHandler(night, 'morningOrNight', 'night'));
unfoldLink.addEventListener('click', makeLinkHandler(unfold, 'unfoldOrCycle', 'unfold'));
cycleLink.addEventListener('click', makeLinkHandler(cycle, 'unfoldOrCycle', 'cycle'));

upImg.addEventListener('click', makeLinkHandler(up, 'upOrDown', 'up'));
downImg.addEventListener('click', makeLinkHandler(down, 'upOrDown', 'down'));
darkImg.addEventListener('click', makeLinkHandler(dark, 'darkOrJoy', 'dark'));
joyImg.addEventListener('click', makeLinkHandler(joy, 'darkOrJoy', 'joy'));
chaosImg.addEventListener('click', makeLinkHandler(chaos, 'chaosOrGentle', 'chaos'));
gentleImg.addEventListener('click', makeLinkHandler(gentle, 'chaosOrGentle', 'gentle'));
forestImg.addEventListener('click', makeLinkHandler(forest, 'forestOrMeadow', 'forest'));
meadowImg.addEventListener('click', makeLinkHandler(meadow, 'forestOrMeadow', 'meadow'));
outImg.addEventListener('click', makeLinkHandler(out, 'outOrInner', 'out'));
innerImg.addEventListener('click', makeLinkHandler(inner, 'outOrInner', 'inner'));
morningImg.addEventListener('click', makeLinkHandler(morning, 'morningOrNight', 'morning'));
nightImg.addEventListener('click', makeLinkHandler(night, 'morningOrNight', 'night'));
unfoldImg.addEventListener('click', makeLinkHandler(unfold, 'unfoldOrCycle', 'unfold'));
cycleImg.addEventListener('click', makeLinkHandler(cycle, 'unfoldOrCycle', 'cycle'));
}

window.addEventListener('load', windowOnLoad);
