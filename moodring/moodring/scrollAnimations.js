gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
  toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
  // markers: false
});

function init() {
  gsap.timeline({
    scrollTrigger: {
      trigger: "#beginLvl",
      start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=500",
      scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
      pinSpacing: false,
      pin: "#greenGlow"
    },
  })
  .to(".beginLvlRow1", { y: -20})
  .to("#beginLvlRow2", { y: +20})
  .to("#beginBtn", { y: 20})
  .to("#greenGlow", { y: 350, scale: 1.2});

  // **elements: onenter onleave onEnterBack onLeaveBack
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        end: "+=300", // bottom of the trigger element hits the top of the viewport
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,

      },
    })
    .from("#spacer0", { opacity: 0 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginBtn",
        start: "10px", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=600",
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
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
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
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
        start: "1", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=250",
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    // .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
    .from("#greenSwimmer", { y: 300, scale: 0.2, autoAlpha: 0,  rotate: 90})
    .from("#questionstxt2", { scale: 0.2, autoAlpha: 0 });

  }

  function greenGlowAnimation(){
    gsap.timeline({
      scrollTrigger: {
        markers: true,
        trigger: "#beginLvl",
        start: "1%", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=800",
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
        // toggleClass: "glow"
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .to("#greenGlow", { y: 450});
  }

  function blueSwimmerAnimation(){
    gsap
    .timeline({
      scrollTrigger: {
        trigger: "#spacer5",
        // pin: true,
        start: "center top", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        endtrigger: "#plantLady",
        end:"top bottom",
        // end: "+=50",
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#blueSwimmer", { scale: 0.8, autoAlpha: 0, y: -30, rotate: 360 })
    .from("#questionstxt", {scale: 0.4, autoAlpha: 0 });

  }