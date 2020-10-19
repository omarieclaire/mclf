( function( d ) {
  'use strict';

  function makeAudioButton(id, containerId, audioPlayerId) {
    var test = true;
    var button = d.querySelector(id);
    var buttonContainer = d.querySelector(containerId);
    buttonContainer.classList.remove('hide');

    var audioPlayer = d.querySelector(audioPlayerId);
    audioPlayer.classList.add('remove');

    function changeSVG() {
       button.classList.remove( 'pause' );
       test = true;
    }
    button.addEventListener('click',
       function() {
          if ( test === true ) {
               button.classList.add( 'pause' );
               test = false;
               audioPlayer.play();
          }
          else {
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


  var button1 = makeAudioButton('#musicbutton1', '#musicbuttoncontainer1', '#player1');
  //var button2 = makeAudioButton('#musicbutton2', '#musicbuttoncontainer2', '#player2');
  //var button3 = makeAudioButton('#musicbutton3', '#musicbuttoncontainer3', '#player3');
  //var button4 = makeAudioButton('#musicbutton4', '#musicbuttoncontainer4', '#player4');
  //var button5 = makeAudioButton('#musicbutton5', '#musicbuttoncontainer5', '#player5');
  //var button6 = makeAudioButton('#musicbutton6', '#musicbuttoncontainer6', '#player6');
  //var button7 = makeAudioButton('#musicbutton7', '#musicbuttoncontainer7', '#player7');
  //var button8 = makeAudioButton('#musicbutton8', '#musicbuttoncontainer8', '#player8');

   // var test = true,
   //     but = d.querySelector( '#musicbutton' ),
   //     aud = d.querySelector( '#player' );
   //     aud.classList.add( 'remove' );
   //     d.querySelector( '#musicbuttoncontainer' ).classList.remove( 'hide' );
   //
   // but.addEventListener('click',
   //    function() {
   //       if ( test === true ) {
   //            but.classList.add( 'pause' );
   //            test = false;
   //            aud.play();
   //       }
   //       else {
   //            changeSVG();
   //            aud.pause();
   //       }
   //    }, false );
   //
   // aud.addEventListener( 'ended',
   //    function() {
   //       changeSVG();
   //       aud.load();
   //     }, false );
   //
   // function changeSVG() {
   //    but.classList.remove( 'pause' );
   //    test = true;
   //  }
 }( document ));
