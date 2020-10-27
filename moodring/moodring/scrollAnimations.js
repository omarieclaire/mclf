gsap.registerPlugin(ScrollTrigger);

//mobile tutorial later https://www.youtube.com/watch?v=R7-3oEiDaZo
// tl.to(".desktop", {scale:2 rotation: 360})
// .to(".desktop", {scale:1});

// https://greensock.com/docs/v3/Plugins/MotionPathPlugin

ScrollTrigger.defaults({
  toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
  markers: true,
});

function init() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#playerQuestionLvl",
        start: "10", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=30",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#seekBtn", { y: innerHeight * 1 });


  // **elements: onenter onleave onEnterBack onLeaveBack
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none
}

window.addEventListener("load", function () {
  init();
});
