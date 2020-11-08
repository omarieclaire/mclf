gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
  toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
  // markers: false
});

function init() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=500",
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        pin: "#greenGlow",
      },
    })
    .to(".beginLvlRow1", { y: -20 })
    .to("#beginLvlRow2", { y: +20 })
    .to("#beginBtn", { y: 20 })
    .to("#greenGlow", { y: 350, scale: 1.2 });

  // **elements: onenter onleave onEnterBack onLeaveBack
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none
}

window.addEventListener("load", function () {
  init();
});

function spacer0Ani() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#beginLvl",
        start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        end: "+=300", // bottom of the trigger element hits the top of the viewport
        scrub: 3, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
      }
    })
    .from("#spacer0", { opacity: 0 });
}
function greenGlowAni() {
  gsap
    .timeline({
      scrollTrigger: {
        // markers: true,
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
    .to("#greenGlow", { y: 450 });
}

function playerQuestionLvlAni() {
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

function questions3LvlAni() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#spacer1",
        start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=150",
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    // .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
    .from("#greenSwimmer", { y: 200, scale: 0.2, autoAlpha: 0, rotate: 90 })
    .from("#questionstxt2", { scale: 0.2, autoAlpha: 0 })
}

function greenSwimmerFollowAni() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#questions3Lvl",
        start: "top top", //animation starts at this point  - 20 px above the top of the trigger element
        end: "+=850",
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    // .from("#questionstxt1", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
    .to("#greenSwimmer", { y: 650, rotate: -90 })
}

function choice1Ani() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#spacer2",
        start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        end: "+=200", // bottom of the trigger element hits the top of the viewport
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false
      },
    })
    .from(".choiceTxt", { y: 100, scale: 0.8 })
    // .from("#upImg", { y: 70, scale: 0.6 })
    // .from("#downImg", { y: 70, scale: 0.6 })
}

function choiceAni() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".choiceLvl",
        start: "center center", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        end: "+=200", // bottom of the trigger element hits the top of the viewport
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false
      },
    })
    .from(".choiceTxt", { y: 100, scale: 0.8 })
    // .from(".imageRow", { y: 70, scale: 0.6 })
}

function blueSwimmerAni() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#spacer5",
        // pin: true,
        start: "center top", //first value relates to the trigger element, the second to the scroller itsef (the viewport)
        // endtrigger: "#plantLady",
        end: "top bottom",
        // end: "+=50",
        scrub: 5, // locks animation to scrollbar - can use 1, 2, 3 etc
        pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    .from("#questionstxt", { scale: 0.4, autoAlpha: 0 })
    .from("#blueSwimmer", { scale: 0.8, autoAlpha: 0, y: -30, rotate: 90 })
}

function doNothing(){
  //nothing at all
}