// when you go to the website
// * you press a button and it plays three songs in a row.
// * pulls at random from a "database" of songs.
window.addEventListener('load', (event) => {

  function createAudioElement(url) {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = url;
    return audio;
  }

  const SONGS = [
    {
      url: "https://marieflanagan.com/throneroomclub/audio/letterSound.mp3",
      tags: ["drone", "uplifting"]
    },
    {
      url: "http://localhost:8000/sounds/Nature_Frogs.mp3",
      // url: "https://marieflanagan.com/throneroomclub/audio/lineupSound.mp3",
      tags: ["drone"]
    },
    {
      url: "https://marieflanagan.com/throneroomclub/audio/mirrorSound.mp3",
      tags: ["drone"]
    }
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  // amount of time in seconds
  var TOTAL_DURATION = 100;

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
    return cache.match(audioFileUrl)
      .then(cacheResponse => {
        // Let's return cached response if video is already in the cache.
        if (cacheResponse) {
          return cacheResponse;
        }
        // Otherwise, fetch the video from the network.
        return fetch(audioFileUrl)
          .then(networkResponse => {
            // Add the response to the cache and return network response in parallel.
            cache.put(audioFileUrl, networkResponse.clone());
            return networkResponse;
          });
      });
  }

  var audioContext = null;

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
    if(index == songs.length || TOTAL_DURATION - currentRuntime < 0) {
      return;
    }

    const song = songs[index];
    const url = song.url;
    const audio = song.audio;
    // hopefully tell the browser to start
    // downloading audio
    audio.preload = "auto";

    const track = audioContext.createMediaElementSource(audio);
    track.connect(audioContext.destination);

    // when the song has ended, queue up
    // the next one
    audio.addEventListener('ended', (e) => {
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
    audio.addEventListener('loadedmetadata', (e) => {
      const duration = audio.duration;

      if(currentRuntime + duration > TOTAL_DURATION) {
        const remainingMs = (TOTAL_DURATION - currentRuntime) * 1000;
        setTimeout(() => {
          audio.pause();
        }, remainingMs);
      } else if(index < songs.length - 1) {
        // set a timer to preload the next file
        const timeoutDurationMs = (duration - PREFETCH_BUFFER_SECONDS) * 1000;
        setTimeout(() => {
          const nextAudio = songs[index + 1];
          nextAudio.preload = "auto";
          fetchAndCache(nextAudio.url, cache).then((p) => console.log(`loaded ${nextAudio.url} into cache`));
        }, timeoutDurationMs);
      }
    });

    audio.play();
  }

  const button = document.getElementById('play');

  // largely following this article:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  button.addEventListener('click', (event) => {

    if(audioContext == null) {
      // Create an audio context. This must
      // happen when a button is clicked.
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      audioContext = new AudioContext();
    }


    // shuffle the songs around so
    // they play in a random order
    // first we copy the array
    const shuffledSongs = [...SONGS];
    // next we shuffle it
    shuffleArray(shuffledSongs);

    window.caches.open('audio-pre-cache')
      .then((cache) => playAndQueue(shuffledSongs, 0, 0, cache));

  });

  const totalDurationInput = document.getElementById('total-duration');
  totalDurationInput.value = TOTAL_DURATION;

  totalDurationInput.addEventListener('input', (event) => {
    TOTAL_DURATION = parseInt(event.target.value);
  });
});