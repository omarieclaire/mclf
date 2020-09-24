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

function windowOnLoad() {
	const gameSetup = document.getElementById('gameSetup');
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


	var enterbtn = document.getElementById('enterbtn'); //get the button

	function myButtonHandler(event) {
		begin.style.display = "block";
		enterbtn.innerHTML = 'scroll';


		// userState.level = "cool";
		// event.preventDefault();
	}
	enterbtn.addEventListener('click', myButtonHandler);

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
}

window.addEventListener('load', windowOnLoad);
