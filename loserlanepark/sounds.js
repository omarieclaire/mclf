class SoundManager {
    constructor() {
      this.sounds = new Map(); // Store sounds by name
      this.isMuted = false; // Global mute state
      this.globalVolume = 1.0; // Master volume (0.0 to 1.0)
      this.muteKey = "m"; // Key to toggle mute
      this.loadSettings(); // Load saved settings
      this.setupMuteButton();
      this.setupKeyListener();
      this.keydownListener = (e) => {
        if (e.key.toLowerCase() === this.muteKey) {
          this.toggleMute();
        }
      };
      document.addEventListener("keydown", this.keydownListener);
      
    }

    
  
    // Add a sound to the manager
    addSound(name, src, loop = false) {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.volume = this.globalVolume;
      this.sounds.set(name, audio);
    }
  
    // Play a sound by name
    play(name, speed = 1.0) {
      const sound = this.sounds.get(name);
      if (!sound) {
        console.error(`Sound '${name}' not found.`);
        return;
      }
  
      sound.playbackRate = speed;
      sound.currentTime = 0; // Reset for replayability
      if (!this.isMuted) {
        sound.play().catch(error => console.error(`Error playing sound '${name}':`, error));
      }
    }
  
    // Stop a sound by name
    stop(name) {
      const sound = this.sounds.get(name);
      if (sound) {
        sound.pause();
        sound.currentTime = 0; // Reset to start
      }
    }
  
    // Set the global volume
    setGlobalVolume(volume) {
      this.globalVolume = Math.min(Math.max(volume, 0), 1); // Clamp between 0 and 1
      this.sounds.forEach(sound => (sound.volume = this.globalVolume));
      this.saveSettings();
    }
  
    // Mute all sounds
    muteAll() {
      this.isMuted = true;
      this.sounds.forEach(sound => sound.pause());
      this.saveSettings();
    }
  
    // Unmute all sounds
    unmuteAll() {
      this.isMuted = false;
      this.sounds.forEach(sound => {
        if (!sound.paused) {
          sound.play().catch(error => console.error("Error resuming sound:", error));
        }
      });
      this.saveSettings();
    }
  
    // Toggle mute state
    toggleMute() {
      this.isMuted ? this.unmuteAll() : this.muteAll();
    }
  
    // Reset all sounds
    resetAll() {
      this.sounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  
    // Load saved settings
    loadSettings() {
      const savedVolume = localStorage.getItem("globalVolume");
      const savedMutedState = localStorage.getItem("isMuted");
      if (savedVolume) this.globalVolume = parseFloat(savedVolume);
      if (savedMutedState) this.isMuted = savedMutedState === "true";
    }
  
    // Save settings to localStorage
    saveSettings() {
      localStorage.setItem("globalVolume", this.globalVolume);
      localStorage.setItem("isMuted", this.isMuted);
    }
  
    // Set up the mute button
    setupMuteButton() {
      const muteButton = document.getElementById("mute-button");
      if (muteButton) {
        muteButton.addEventListener("click", () => this.toggleMute());
      }
    }
  
    // Set up key listener for mute toggle
    setupKeyListener() {
      document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === this.muteKey) {
          this.toggleMute();
        }
      });
    }
  }
  



