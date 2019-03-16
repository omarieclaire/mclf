
//start pretty var
// const canvas = 1080;
// let cZero;
// let cTick;
// let colours = [];
//end pretty var


var timeleft = 10;
var ding;
var interval = false;

// Convert seconds to min:sec
function convertSeconds(s) {
	var min = floor(s / 60);
	//modulus gives you the remainder of the division
	var sec = s % 60;
	//nf is number format, a p5 thing
	return nf(min, 2) + ':' + nf(sec, 2);
}

function preload() {
	ding = loadSound("ding.mp3");
}

// Set value of the DOM element
function timerText(text) {
	//select allows me to access an html element on the page
	var timer = select('#timer');
	timer.html(text);
}

// Stop the timer
function stopTimer() {
	clearInterval(interval);
	interval = false;
}

function setup() {
	//start pretty setup
	 // createCanvas(canvas, canvas);
	 // colorMode(RGB, 255, 255, 255, 1);
	 //
	 // cZero = PI + HALF_PI;
	 // cTick = TWO_PI / 60;
	 //
	 // colours = [
	 //   color('#083355'),
	 //   color('#74B8EE'),
	 //   color('#74B8EE'),
	 //   color('#5689B1'),
	 //   color('#3D617E'),
	 //  ];
//end pretty setup


	// Process URL ?minute=
	var params = getURLParams();
	if (params.minute) {
		var min = params.minute;
		timeleft = min * 60;
	}

//start pretty draw

// function draw() {
//   background(colours[0]);
//
//   const d = new Date();
// 	drawCircle(width * 0.8, Math.ceil(((d.getMilliseconds() + 1) / 100) * 6), colours[1], true);
// 	drawCircle(width * 0.6, d.getSeconds(), colours[2], false);
// 	drawCircle(width * 0.4, d.getMinutes(), colours[3], false);
//   let hour = d.getHours();
//   if (hour > 12) {
//     hour -= 12;
//   }
//   hour += (d.getMinutes() / 60);
//   hour *= 5 - 4;
//   drawCircle(width * 0.2, hour, colours[4], false);
// }
//
// function drawCircle(size, value, colour, fade) {
//   // Fade?
//   if (fade === true) {
//     const alpha = map(value, 1, 60, 1, 0);
//     stroke(70, 83, 135, alpha);
//   } else {
//     stroke(colour);
//   }
//
//   noFill();
//   strokeWeight(100.0);
//   strokeCap(ROUND);
//
//   // Draw full ellipse if loop is complete
//   if (value === 0) {
//     ellipse(width / 2, height / 2, size, size);
//   } else {
//     arc(width / 2, height / 2, size, size, cZero, (cTick * value) - HALF_PI);
//   }
// }

//end pretty draw


	// Set initial value for DOM element
	timerText(convertSeconds(timeleft) + ' (paused)');

	// Timer interval- function that runs every X amount of time
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
			//setinterval allows me to set sonething to happen every so often, here every 1000 miliseconds
			interval = setInterval(timeIt, 1000);
		}
		else
		{
			timerText(convertSeconds(timeleft) + ' (paused)');
			stopTimer();
		}
	}
}
