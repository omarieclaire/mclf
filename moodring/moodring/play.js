var userState = {
	level: 'begin',
	upOrDown: false,
	darkOrJoy: false,
	chaosOrGentle: false,
	forestOrMeadow: false,
	outOrIn: false,
	morningOrNight: false,
	unfoldOrCyle: false,
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
		userState.level = "cool";
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

	function makeLinkHandler(link) {
		function linkHandler(event) {
			link.style.display = "block";
		}
		return linkHandler;
	}

	function myLinkHandler(event) {
		if(buttonName == 'up-link') {
			up.style.display = "block";
		} else if(buttonName = "down-link"){
			down.style.display = "block";
		}
	}

//creates and runs a function makeLinkHandler which returns a function
	upLink.addEventListener('click', makeLinkHandler(up));
	downLink.addEventListener('click', makeLinkHandler(down));
	darkLink.addEventListener('click', makeLinkHandler(dark));
	joyLink.addEventListener('click', makeLinkHandler(joy));
	chaosLink.addEventListener('click', makeLinkHandler(chaos));
	gentleLink.addEventListener('click', makeLinkHandler(gentle));
	forestLink.addEventListener('click', makeLinkHandler(forest));
	meadowLink.addEventListener('click', makeLinkHandler(meadow));
	outLink.addEventListener('click', makeLinkHandler(out));
	innerLink.addEventListener('click', makeLinkHandler(inner));
	morningLink.addEventListener('click', makeLinkHandler(morning));
	nightLink.addEventListener('click', makeLinkHandler(night));
	unfoldLink.addEventListener('click', makeLinkHandler(unfold));
	cycleLink.addEventListener('click', makeLinkHandler(cycle));
}

window.addEventListener('load', windowOnLoad);
