gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
  toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
  // markers: true,
});

function init() {


  gsap.timeline({
    scrollTrigger: {
      trigger: "#beginLvl",
      start: "10", //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=500",
      // scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#seekBtn"
    },
  })
  .to(".beginLvlRow1", { y: -20})
  .to("#beginLvlRow2", { y: +20})
  .to("#beginBtn", { y: 20})
  .to("#greenGlow", { y: 200});

  // **elements: onenter onleave onEnterBack onLeaveBack
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "center center", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=300",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      },
    })
    .from("#spacer0", { opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginBtn",
        start: "10px", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=600",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    // .from("#playerQuestionLvl", { opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginBtn",
        // pin: true,
        start: "1px", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=550",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#plantLady", { scale: 0.3, autoAlpha: 0, y: -60 })
    .from("#whatDoYouSeek", { scale: 0.8, autoAlpha: 0 });
  // .from("#seekText", { scale: 0.7, autoAlpha: .2 })
  // .from("#seekBtn", { y: innerHeight * 1 })
  }

window.addEventListener("load", function () {
  init();
});

function questions3LvlAnimation() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#spacer1",
        start: "10", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=450",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
    .from("#greenSwimmer", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
    .from("#questionstxt2", { y: innerHeight, scale: 0.2, autoAlpha: 0 });

  }

  function greenGlowAnimation(){
    gsap.timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "10", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=500",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
        // toggleClass: "glow"
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .to("#greenGlow", { y: 200});
  }

  function blueSwimmerAnimation(){
    gsap
    .timeline({
      scrollTrigger: {
        trigger: "#findSongLvl",
        // pin: true,
        start: "5", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=550",
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#blueSwimmer", { scale: 0.8, autoAlpha: 0, y: -60, rotate: 360 });
  }