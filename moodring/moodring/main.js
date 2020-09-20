gsap.registerPlugin(ScrollTrigger);


//mobile tutorial later https://www.youtube.com/watch?v=R7-3oEiDaZo
// create timeline
// let tl = gsap.timeline();
// one scales up and rotates
//the other scales back down
// tl.to(".desktop", {scale:2 rotation: 360})
// .to(".desktop", {scale:1});

ScrollTrigger.defaults({
  toggleActions: "restart pause resume none",
  // markers: true
});

function init(){
  gsap.from('#begin', {opacity: 0, scrollTrigger: {
    trigger: '#begin',
    scrub: true

    // pin: true,
// pin: "".someElementID",
    // markers: true,
    // start: "top 75%",
    // end: "bottom 75%",

    // **elements: onenter onleave onEnterBack onLeaveBack
    // toggleActions:"restart pause reverse reset"
    // **options: play pause restart reverse resume reset complete reverse none
  }});
}

window.addEventListener('load', function(){
  init()
})
