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
        scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
        // pinSpacing: false,
        // pin: "#seekBtn"
      },
    })
    // .to(".beginLvlRow1", { y: -40})
    // .to("#beginLvlRow2", { y: -40})
    // .to("#beginBtn", { y: 50})
    //  .to("#spacer0", { opacity: 1})




  // **elements: onenter onleave onEnterBack onLeaveBack
  // toggleActions:"restart pause reverse reset"
  // **options: play pause restart reverse resume reset complete reverse none

  gsap.timeline({
    scrollTrigger: {
      trigger: "#spacer0",
      start: 50, //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=300",
      scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#seekBtn"
    },
  })
  .from("#spacer0", {opacity: 0})

  gsap.timeline({
    scrollTrigger: {
      trigger: "#playerQuestionLvl",
      start: 350, //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=300",
      scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#seekBtn"
    },
  })
  .from("#playerQuestionLvl", {opacity: 0})

  gsap.timeline({
    scrollTrigger: {
      trigger: "#beginBtn",
      start: "5", //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=550",
      scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#seekBtn"
    },
  })
  .from("#plantLady", { scale: 0.8, autoAlpha: 0, y: -60})
  .from("#whatDoYouSeek", { scale: 0.8, autoAlpha: 0})
  // .from("#seekText", { scale: 0.7, autoAlpha: .2 })
  // .from("#seekBtn", { y: innerHeight * 1 })


  gsap.timeline({
    scrollTrigger: {
      trigger: "#seekBtn",
      start: "10", //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=400",
      scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      // pinSpacing: false,
      // pin: "#seekBtn"
    },
  })
  .from("#greenSwimmer", { y: innerHeight, scale: 0.2, autoAlpha: 0 })
}

window.addEventListener("load", function () {
  init();
});
