( function( d ) {
  'use strict';

  function makeAudioBtn(id, containerId, audioPlayerId) {
    var test = true;
    var btn = d.querySelector(id);
    var btnContainer = d.querySelector(containerId);
    btnContainer.classList.remove('hide');

    var audioPlayer = d.querySelector(audioPlayerId);
    audioPlayer.classList.add('remove');

    function changeSVG() {
       btn.classList.remove( 'pause' );
       test = true;
    }
    btn.addEventListener('click',
       function() {

          if ( test === true ) {
               musicBtnContainer1.classList.add("spin");
               btn.classList.add( 'pause' );
               backgroundMusic.pause();

               test = false;
               audioPlayer.play();
          }
          else {
              musicBtnContainer1.classList.remove("spin");

               changeSVG();
               audioPlayer.pause();
          }
       }, false );

    audioPlayer.addEventListener( 'ended',
          function() {
             changeSVG();
             audioPlayer.load();
           }, false );
  }


  var btn1 = makeAudioBtn('#musicBtn1', '#musicBtnContainer1', '#player1');

 }( document ));
