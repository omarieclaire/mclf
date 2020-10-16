// when player arrives at a level, they scroll to cause scrollAnimations
//
// animations include:
//
// - a line/ladder winding down the last choice to the new choice (https://codepen.io/GreenSock/pen/rNOBLBV)
// - the emergence (From the bottom of the page) and animation (subtle movement) of small images (https://codepen.io/GreenSock/pen/gOabMXv)


gsap.registerPlugin(ScrollTrigger);


//mobile tutorial later https://www.youtube.com/watch?v=R7-3oEiDaZo
// create timeline
// let tl = gsap.timeline();
// one scales up and rotates
//the other scales back down
// tl.to(".desktop", {scale:2 rotation: 360})
// .to(".desktop", {scale:1});

ScrollTrigger.defaults({
  toggleActions: "restart pause reverse pause", // onEntry onLeaving onReEntry
  markers: true
});

function init() {
  gsap.timeline({
    scrollTrigger:{
      trigger: "#level0",
      start: "0", //animation starts at this point  - 20 px above the top of the trigger element
      end: "+=100",
      // scrub: true, // locks animation to scrollbar - can use 1, 2, 3 etc
      pinSpacing: false,
      // pin: "#climber"
    }
  })
  // .from('#level0Background', { y : innerHeight * 1})
  // .from("#climber", { x : innerWidth * .5 })
  // .from("#swimmer", { x : innerWidth * -.5 })
  // .from("#creaturesL", { x : innerHeight * .5 })
  // .from("#creaturesR", { x : innerWidth * -.5 })
  // .from("#titling", {
    // y : innerHeight * 1,
    // rotate : 180
   // })
   // .from("#begin", { y : innerHeight * 1 })

   gsap.timeline({
     scrollTrigger:{
       trigger: "#spacer1",
       start: "level1", //animation starts at this point
       end: "+=100",
       scrub: true,
       pin: true
     }
   })
   .from("#creaturesSpin", { y : innerHeight * 1 })
   .from("#question", { opacity : 0 })


  // gsap.to("#climber", {
  //   scrollTrigger: {
  //     trigger: "#climber",
  //     // start: "top top"
  //   },
  //   x: 100
  // });
  //
  // gsap.to("#swimmer", {
  //   scrollTrigger: "#swimmer",
  //   x: -10
  // });
  //
  //
  // gsap.from('#spacer1', {
  //   opacity: 0,
  //   scrollTrigger: {
  //     trigger: '#spacer1',
  //     scrub: true
  //   }
  // });
  //
  //
  // gsap.from("#creaturesSpin", {
  //       opacity: 0,
  //       rotation: 90,
  //       scrollTrigger: {
  //         trigger: '#creaturesSpin',
  //         // start: "top bottom",
  //         scrub: true,
  //         scale: 0.3,
  //         rotation:45,
  //         // end: "top top"
  //       }
  // });

        //   gsap.from("#creaturesSpin", {
        //   scrollTrigger: {
        //     trigger: "#creaturesSpin",
        //     scrub: true,
        //     start: "top bottom",
        //     end: "top top"
        //   },
        //   scaleX: 0,
        //   rotation: 360
        //   transformOrigin: "left center",
        //   ease: "none"
        // });


        // gsap.from(".line-2", {
        //   scrollTrigger: {
        //     trigger: ".orange",
        //     scrub: true,
        //     pin: true,
        //     start: "top top",
        //     end: "+=100%"
        //   },
        //   scaleX: 0,
        //   transformOrigin: "left center",
        //   ease: "none"
        // });


        // pin: true,
        // pin: "".someElementID",
        // markers: true,
        // start: "top 75%",
        // end: "bottom 75%",

        // **elements: onenter onleave onEnterBack onLeaveBack
        // toggleActions:"restart pause reverse reset"
        // **options: play pause restart reverse resume reset complete reverse none

      }

      window.addEventListener('load', function() {
        init();
      })
