gsap.registerPlugin(ScrollTrigger);

function init(){
  gsap.from('#begin', {opacity: 0, scrollTrigger: {
    trigger: '#begin',
    scrub: true
  }});
}

window.addEventListener('load', function(){
  init()
})
