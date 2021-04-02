let timer = document.getElementsByClassName('js-timer')[0]; 
let timer_part = document.getElementsByClassName('js-timer_part');
let dur = "301s"
   
function reset_timer() {
   timer.classList.remove("start");
   void timer.offsetWidth;
   timer.classList.add("start");
   /*let new_timer = timer[0].cloneNode(true)
   timer[0].parentNode.replaceChild(new_timer, timer[0])*/

   for (var i = 0, len = timer_part.length; i < len; i++) {
      
      timer_part[i].style.animationDuration=dur
   }
}

function whichAnimationEvent(){
  var t

  var animations = {
    "animation"      : "animationend",
    "OAnimation"     : "oAnimationEnd",
    "MozAnimation"   : "animationend",
    "WebkitAnimation": "webkitAnimationEnd"
  }

  for (t in animations){
    if (timer_part[0].style[t] !== undefined){
      return animations[t];
    }
  }
}

var animationEvent = whichAnimationEvent();

timer_part[0].addEventListener(animationEvent, customFunction);

function customFunction(event) {
  reset_timer();
  console.log('timer done!')
}

reset_timer();  