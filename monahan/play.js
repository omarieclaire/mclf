// opening sequence or sound?
// grab me a song from a, b, and c 
// grab a random a. if a is longer than half of the total duration grab a different a
// grab a random b. add a + b durations together 
// grab a random c. If c is longer than the remaining time grab a different c 
// calc the remaining time and fill it with a drone or other sound that can cut off when time is up


window.addEventListener("load", (event) => {
  // when you go to the website
  // * you press a button and it plays three songs in a row.
  // * pulls at random from a "database" of songs.

  var myLang = localStorage["lang"] || "defaultValue";
  var player;
  var audioContext = null;
  var gainNode = null;
  var previousVolume = "100";
  var timerInterval;
  var timerDuration;

  let playState = "play";
  let muteState = "unmute";


  function startplayer() {
    player = document.getElementById("music_player");
    player.controls = false;
  }

  function change_vol(event) {
    gainNode.gain.value = parseFloat(event.target.value);
  }

  // https://css-tricks.com/lets-create-a-custom-audio-player/
  function createHTMLMusicPlayer(musicPlayerDiv, musicPlayerh1) {
    // wrapper div
    let wrapperDiv = document.createElement("div");
    wrapperDiv.id = "wrapper";
    musicPlayerDiv.append(wrapperDiv);

    // player div
    let audioPlayerContainer = document.createElement("div");
    audioPlayerContainer.id = "audio-player-container";
    wrapperDiv.append(audioPlayerContainer);

    // music player audio element
    let musicPlayer = document.createElement("audio");
    musicPlayer.id = "music_player";
    audioPlayerContainer.append(musicPlayer);

    // inputs

    let currTime = document.createElement("span");
    currTime.classList.add("time");
    currTime.id = "current-time";
    currTime.innerHTML = "0:00";
    audioPlayerContainer.append(currTime);

    let playIconContainer = document.createElement("button");
    playIconContainer.id = "play-icon";
    playIconContainer.classList.add("play-icon");
    playIconContainer.classList.add("paused");
    // playIconContainer.innerHTML = "pause";
    audioPlayerContainer.append(playIconContainer);

    playIconContainer.addEventListener("click", () => {
      if (playState === "play") {
        // playIconContainer.innerHTML = "play";
        playIconContainer.classList.remove("paused");
        playState = "pause";
        audioContext.suspend();
        clearInterval(timerInterval);
      } else {
        player.currentTime = 0;
        // playIconContainer.innerHTML = "pause";
        playIconContainer.classList.add("paused");
        playState = "play";
        audioContext.resume();
        timerInterval = createTimerLoop(timerDuration);
      }
    });

    // let seekSlider = document.createElement("input");
    // seekSlider.type = "range";
    // seekSlider.id = "seek-slider";
    // seekSlider.value = "0";
    // seekSlider.max = "100";
    // audioPlayerContainer.append(seekSlider);
    // seekSlider.addEventListener('change', change_vol);

    // let duration = document.createElement("span");
    // duration.classList.add("time");
    // duration.id = "duration";
    // duration.innerHTML = "duration XX";
    // audioPlayerContainer.append(duration);

    // let volOutput = document.createElement("output");
    // volOutput.id = "volume-output";
    // volOutput.innerHTML = "100";
    // audioPlayerContainer.append(volOutput);

    let volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.id = "volume-slider";
    volumeSlider.max = "100";
    volumeSlider.min = "0";
    volumeSlider.value = "100";
    audioPlayerContainer.append(volumeSlider);
    volumeSlider.addEventListener("change", (event) => {
      gainNode.gain.value = getCurrentSliderVolume();
    });

    function getCurrentSliderVolume() {
      let value = volumeSlider.value;
      return parseFloat(value) / 100;
    }

    // let muteIconContainer = document.createElement("button");
    // muteIconContainer.id = "mute-icon";
    // muteIconContainer.classList.add("musicPlayerBtn");
    // muteIconContainer.innerHTML = "mute";
    // audioPlayerContainer.append(muteIconContainer);

    // muteIconContainer.addEventListener("click", (event) => {
    //   if (muteState === "unmute") {
    //     gainNode.gain.value = 0;
    //     previousVolume = getCurrentSliderVolume();
    //     volumeSlider.value = "0";
    //     muteState = "mute";
    //     event.target.innerHTML = "unmute";
    //   } else {
    //     gainNode.gain.value = previousVolume;
    //     volumeSlider.value = previousVolume * 100;
    //     muteState = "unmute";
    //     event.target.innerHTML = "mute";
    //   }
    // });

    // let volImg = document.createElement("img");
    // volImg.src = "images/icons/volume.png";
    // volImg.id = "vol_img";
    // playerDiv.append(volImg);

    // let volChange = document.createElement("input");
    // volChange.type = "range";
    // volChange.id = "change_vol";
    // volChange.addEventListener('change', change_vol);
    // volChange.step = "0.05";
    // volChange.min = "0";
    // volChange.max = "1";
    // volChange.value = "1";
    // playerDiv.append(volChange);

    // let exitA = document.createElement("a");
    // exitA.id = "exitLink";
    // let exitLink = document.createTextNode("exit");
    // exitA.appendChild(exitLink);
    // exitA.title = "exit";
    // exitA.href = "";
    // musicPlayerDiv.appendChild(exitA);

    // const showRangeProgress = (rangeInput) => {
    //     if(rangeInput === seekSlider) audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
    //     else audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
    // }

    // seekSlider.addEventListener('input', (e) => {
    //     showRangeProgress(e.target);
    // });
    // volumeSlider.addEventListener('input', (e) => {
    //     showRangeProgress(e.target);
    // });
    // end pasted in code

    let exitBtn = document.createElement("button");
    exitBtn.innerHTML = "exit";
    // exitBtn.type = "submit";
    exitBtn.name = "exitBtn";
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("btn");
    musicPlayerDiv.appendChild(exitBtn);

    exitBtn.addEventListener("click", (event) => {
      audioContext.suspend();
      clearInterval(timerInterval);

      musicPlayerh1.innerHTML = "Thank you for joining us";
      document.getElementById("wrapper").remove();
      document.getElementById("exitBtn").remove();

      let beginAgainBtn = document.createElement("button");
      beginAgainBtn.innerHTML = "Begin again";
      beginAgainBtn.name = "beginAgainBtn";
      beginAgainBtn.classList.add("beginAgainBtn");
      musicPlayerDiv.appendChild(beginAgainBtn);

      beginAgainBtn.addEventListener("click", (event) => {
        window.location.href = "monahan.html";
      });
    });

    startplayer();
    timerInterval = createTimerLoop(0);

  }

  function displayLoadingGif() {
    let musicPlayerDiv = document.getElementById("musicPlayerDiv");
    let musicPlayerh1 = document.getElementById("musicPlayerH1");
    // need language logic here
    musicPlayerh1.innerHTML =
      "Generating beautiful sounds for you, this might take a minute";
    document.getElementById("launchMusicPlayerForm").remove();
    document.getElementById("textTranscript").remove();
    // temp loader content
    let loaderDiv = document.createElement("div");
    loaderDiv.classList.add("loader");
    musicPlayerDiv.append(loaderDiv);
    setTimeout(() => {
      loaderDiv.remove();
      musicPlayerh1.innerHTML = "";
      createHTMLMusicPlayer(musicPlayerDiv, musicPlayerh1);
    }, 50);
  }

  function createAudioElement(url) {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = url;
    audio.controls = false;
    return audio;
  }

  const SONGS = [
    // {
    //   url: "./sounds/Story_WildWales.mp3",
    //   tags: ["drone", "uplifting"],
    // },
    {
      url: "./sounds/Story_WhatRemainsTheSame.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Story_TheSpirit.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Story_Carnations.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Poem_ToAnswerYou.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Nature_SnowyWalk.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Nature_Frogs.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Nature_Bubbling.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Music_WhatMadeUs.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Music_Fragments.mp3",
      tags: ["drone"],
    },
    {
      url: "/sounds/Excerpt_Zen.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Excerpt_Mycelium.mp3",
      tags: ["drone"],
    },
    // {
    //   url: "/sounds/writingSound.mp3",
    //   tags: ["drone"],
    // },
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  // amount of time in seconds
  var TOTAL_DURATION = 600;

  // how many seconds before a song is completed
  // that we should pre-fetch the next song
  const PREFETCH_BUFFER_SECONDS = 8;

  // shuffle an array
  // pulled from: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // function to fetch and cache audio
  function fetchAndCache(audioFileUrl, cache) {
    // Check first if video is in the cache.
    return cache.match(audioFileUrl).then((cacheResponse) => {
      // Let's return cached response if video is already in the cache.
      if (cacheResponse) {
        return cacheResponse;
      }
      // Otherwise, fetch the video from the network.
      return fetch(audioFileUrl).then((networkResponse) => {
        // Add the response to the cache and return network response in parallel.
        cache.put(audioFileUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  }

  // This is a recursive function. It processes
  // each audio file at a time and then queues up
  // work for the next audio file to be processed.
  //
  // For example: it plays the current audio. And then
  // the function adds an event listener for when the
  // current audio song ends. When this song ends,
  // this function is called on the next audio (the
  // recursion).
  function playAndQueue(songs, index, currentRuntime, cache) {
    // if we've reached the end, return
    if (index == songs.length || TOTAL_DURATION - currentRuntime < 0) {
      return;
    }

    const song = songs[index];
    const url = song.url;
    const audio = song.audio;

    // Update player to current audio
    player = audio;

    // hopefully tell the browser to start
    // downloading audio
    audio.preload = "auto";

    const track = audioContext.createMediaElementSource(audio);
    track.connect(gainNode);

    // when the song has ended, queue up
    // the next one
    audio.addEventListener("ended", (e) => {
      const duration = audio.duration;
      playAndQueue(songs, index + 1, currentRuntime + duration, cache);
    });

    // When metadata has been loaded, we know the
    // audio duration. With the audio duration, we
    // do two things depending on where we are in the
    // play queue:
    //
    // 1. If the currentRuntime is greater than the total
    //    duration, then we set a timeout to pause the song.
    // 2. else, if there is a next song, we set a timeout
    //    that will try and preload the song.
    audio.addEventListener("loadedmetadata", (e) => {
      const duration = audio.duration;

      if (currentRuntime + duration > TOTAL_DURATION) {
        const remainingMs = (TOTAL_DURATION - currentRuntime) * 1000;
        setTimeout(() => {
          audioContext.suspend();
          clearInterval(timerInterval);
        }, remainingMs);
      } else if (index < songs.length - 1) {
        // set a timer to preload the next file
        const timeoutDurationMs = (duration - PREFETCH_BUFFER_SECONDS) * 1000;
        setTimeout(() => {
          const nextAudio = songs[index + 1];
          nextAudio.preload = "auto";
          fetchAndCache(nextAudio.url, cache).then((p) =>
            console.log(`loaded ${nextAudio.url} into cache`)
          );
        }, timeoutDurationMs);
      }
    });

    audio.play();
  }

  const button = document.getElementById("play");

  // largely following this article:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  button.addEventListener("click", (event) => {
    displayLoadingGif();

    if (audioContext == null) {
      // for browser compatibility, redefine AudioContext
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
    }

    // shuffle the songs around so
    // they play in a random order
    // first we copy the array
    const shuffledSongs = [...SONGS];
  
    // next we shuffle it
    shuffleArray(shuffledSongs);

    window.caches
      .open("audio-pre-cache")
      .then((cache) => playAndQueue(shuffledSongs, 0, 0, cache));
  });

  const totalDurationInput = document.getElementById("total-duration");
  totalDurationInput.value = TOTAL_DURATION / 60;

  totalDurationInput.addEventListener("input", (event) => {
    TOTAL_DURATION = parseInt(event.target.value) * 60;
  });

  function updateProgress(seconds, previousDuration) {
    let currTime = document.getElementById("current-time");
    timerDuration = seconds + previousDuration;
    if (currTime == null) {
      //do nothing. there is a delay whe the player is made.
    } else {
      let remaining = TOTAL_DURATION - (seconds + previousDuration);
      let minutes = Math.floor(remaining / 60);
      if (remaining <= 0) {
        currTime.innerHTML = "done";
      } else {
        let remainingSeconds = (remaining % 60).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });
        currTime.innerHTML = `${minutes}:${remainingSeconds}`;
      }
    }
  }

  function createTimerLoop(previousDuration) {
    var start = Date.now();
    return setInterval(() => {
      let delta = Date.now() - start; // milliseconds since elapsed
      let deltaSeconds = Math.floor(delta / 1000);
      updateProgress(deltaSeconds, previousDuration);
    }, 200);
  }
});

// Music player

// document.addEventListener("DOMContentLoaded", function () {
//   startplayer();
// },
//   false
// );
