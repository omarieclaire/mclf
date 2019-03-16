var timeleft = 10;
var ding;
var interval = false;

// Convert seconds to min:sec
function convertSeconds(s) {
	var min = floor(s / 60);
	var sec = s % 60;
	return nf(min, 2) + ':' + nf(sec, 2);
}

function preload() {
	ding = loadSound("ding.mp3");
}

// Set value of the DOM element
function timerText(text) {
	var timer = select('#timer');
	timer.html(text);
}

// Stop the timer
function stopTimer() {
	clearInterval(interval);
	interval = false;
}

function setup() {
	noCanvas();

	// Process URL ?minute=
	var params = getURLParams();
	if (params.minute) {
		var min = params.minute;
		timeleft = min * 60;
	}

	// Set initial value for DOM element
	timerText(convertSeconds(timeleft) + ' (paused)');

	// Timer interval
	function timeIt() {
		timeleft--;
		timerText(convertSeconds(timeleft));

		// Time's up
		if (timeleft <= 0) {
			// Ding spam
			var dingcount = 0;
			var dinginterval = setInterval(function() {
				ding.play();
				dingcount++;
				if(dingcount == 10) clearInterval(dinginterval);
			}, 100);
			//ding.play();
			stopTimer();
		}
	}

	// Set timer button
	timerbtn = createButton('set timer');
	timerbtn.mousePressed(setTimer);

	// Pause button
	pausebtn = createButton('pause/resume');
	pausebtn.mousePressed(pause);

	// Function when set timer btn is pressed
	function setTimer() {
		var entered = prompt('Enter the amount of minutes');

		if(!isNaN(entered) && entered >= 1) {
			stopTimer();
			timeleft = entered * 60;
			timerText(convertSeconds(timeleft) + ' (paused)');
		}
	}

	// When pause btn is pressed
	function pause() {
		if(!interval) {
			if(timeleft <= 0) return alert('No time set!');

			timerText(convertSeconds(timeleft));
			interval = setInterval(timeIt, 1000);
		}
		else
		{
			timerText(convertSeconds(timeleft) + ' (paused)');
			stopTimer();
		}
	}
}
