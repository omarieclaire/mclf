const ART = {
  BIKE: {
    art: [" O ", "^|^", " O "],
  },
  WANDERER: {
    art: ["○", "╽"],
  },
  TTC: {
    art: ["┌0--─0┐", "│▀▀▀▀▀│", "│  T  │", "│  T  │", "│  C  │", "│     │", "└─────┘"],
  },

  DEATHMACHINE: {
    art: ["┌.─.┐", "│▀▀▀│", "|   │", "│▀▀▀│", "╰───╯"],
    width: 5,
    height: 6,
  },
  TRAFFIC: {
    art: ["┌.─.┐", "│▀▀▀│", "|   │", "│▀▀▀│", "╰───╯"],
    width: 5,
    height: 6,
  },

  PARKEDDEATHMACHINE: {
    art: ["┌.─.┐", "│▀▀▀│", "|   │", "│▀▀▀│", "╰───╯"],
    width: 5,
    height: 6,
  },
  DOOR: {
    art: ["  ┌.─.┐ ", "── ▀▀▀│ ", "  |   │ ", "  │▀▀▀│ ", "  ╰───╯ "],
  },

  TRACKS: {
    art: [" ||  || ", " ||  || ", " ||  || ", " ||  || "],
  },
};

function generateSocialCardNoSS(canvas, reason, score, messageString, randomFace, gameInstance) {
  const overlay = document.createElement("div");
  overlay.className = "screenshot-overlay";
  overlay.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(71, 9, 6, 0.6);
    z-index: 10000;
`;

  const socialCard = document.createElement("div");
  socialCard.className = "social-card";
  socialCard.style.position = "relative";
  socialCard.style.width = "400px"; // Make it square
  socialCard.style.height = "400px"; // Make it square
  socialCard.style.margin = "0 auto"; // Center it

  // Create and add screenshot as background
  const cropSize = 500;
  const screenshotCanvas = document.createElement("canvas");
  screenshotCanvas.width = cropSize;
  screenshotCanvas.height = cropSize;
  const screenshotCtx = screenshotCanvas.getContext("2d");

  // Draw the game screen capture onto the screenshot canvas
  const startX = (canvas.width - cropSize) / 2;
  const startY = (canvas.height - cropSize) / 2;
  screenshotCtx.drawImage(canvas, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  // Set the background
  socialCard.style.backgroundImage = `url(${screenshotCanvas.toDataURL()})`;
  socialCard.style.backgroundSize = "cover";
  socialCard.style.backgroundPosition = "center";
  socialCard.style.backgroundRepeat = "no-repeat";

  // Semi-transparent overlay
  const backgroundOverlay = document.createElement("div");
  backgroundOverlay.style.position = "absolute";
  backgroundOverlay.style.top = "0";
  backgroundOverlay.style.left = "0";
  backgroundOverlay.style.width = "100%";
  backgroundOverlay.style.height = "100%";
  backgroundOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  socialCard.appendChild(backgroundOverlay);

  const entityData = ART[reason] || { art: ["N/A"] };
  const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "TRAFFIC";

  // Content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "sharebox-content-container"
  contentContainer.style.position = "relative";
  contentContainer.style.zIndex = "1";

  // Message text
  const messageText = document.createElement("p");
  messageText.className = "message-text";

  messageText.innerHTML = messageString;
  contentContainer.appendChild(messageText);

  // Score text
  const scoreText = document.createElement("p");
  scoreText.className = "score-text";
  scoreText.innerHTML = `I survived ${score} seconds without a bike lane`;
  contentContainer.appendChild(scoreText);

  // THANKS DOUG
  const doug2 = document.createElement("p");
  doug2.className = "cute-death-face";
  doug2.innerHTML = `THANKS DOUG`;
  contentContainer.appendChild(doug2);

  const asciiWrapper = document.createElement("div");
  asciiWrapper.style.position = "relative"; // Make sure this is set
  asciiWrapper.style.width = "fit-content"; // Add this
  asciiWrapper.style.margin = ".5rem auto"; // Add this to center the wrapper
  if (reason === "TTC") {
    asciiWrapper.style.transform = "scale(0.75)";
  }

  const asciiArt = document.createElement("pre");
  asciiArt.className = "ascii-art";
  asciiArt.innerHTML = art
    .split("")
    .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`))
    .join("");

  const asciiArtOverlay = document.createElement("pre");
  asciiArtOverlay.className = "ascii-art overlay";
  asciiArtOverlay.innerHTML = art
    .split("")
    .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`))
    .join("");
  asciiArtOverlay.style.position = "absolute";
  asciiArtOverlay.style.top = "1px";
  asciiArtOverlay.style.left = "1px";
  asciiArtOverlay.style.color = "#ff77df";
  asciiArtOverlay.style.opacity = "0.8";
  asciiArtOverlay.style.pointerEvents = "none";

  const asciiArtOverlay2 = document.createElement("pre");
  asciiArtOverlay2.className = "ascii-art overlay";
  asciiArtOverlay2.innerHTML = art
    .split("")
    .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(21deg);">${char}</span>`))
    .join("");
  asciiArtOverlay2.style.position = "absolute";
  asciiArtOverlay2.style.top = "0";
  asciiArtOverlay2.style.left = "0";
  asciiArtOverlay2.style.color = "#e7a900";
  asciiArtOverlay2.style.opacity = "0.6";
  asciiArtOverlay2.style.pointerEvents = "none";

  asciiWrapper.appendChild(asciiArt);
  asciiWrapper.appendChild(asciiArtOverlay);
  // asciiWrapper.appendChild(asciiArtOverlay2);
  contentContainer.appendChild(asciiWrapper);

  // Sad face
  // const faceContainer = document.createElement("div");
  // faceContainer.style.textAlign = "center";
  // const sadFace = document.createElement("span");
  // sadFace.className = "cute-death-face";
  // sadFace.innerHTML = randomFace;
  // faceContainer.appendChild(sadFace);
  // contentContainer.appendChild(faceContainer);

  // Score text
  const doug = document.createElement("p");
  doug.className = "doug";
  doug.innerHTML = `WE NEED BIKE LANES`;
  
  contentContainer.appendChild(doug);

  // Add the content container to the social card
  socialCard.appendChild(contentContainer);

  // Button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "8px";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.marginTop = "1rem";

  // First create a function to generate the image that we'll reuse
  const generateImage = () => {
    return html2canvas(socialCard).then(canvas => canvas.toDataURL('image/png'));
  };

  // Save Button
  const saveButton = document.createElement("button");
  saveButton.textContent = "SAVE";
  saveButton.onclick = () => {
    generateImage().then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `I-survived-${score}s-without-a-bike-lane-thanks-doug.png`;
      link.href = dataUrl;
      link.click();
    });
  };
  buttonContainer.appendChild(saveButton);

  // Facebook Share Button
  const fbButton = document.createElement("button");
  fbButton.textContent = "FB";
  fbButton.onclick = () => {
    generateImage().then((dataUrl) => {
      // Facebook requires an actual hosted image URL, not a data URL
      // We'll need to either:
      // 1. Upload the image to your server first, or
      // 2. Use Facebook's SDK for proper image sharing
      // For now, we'll share with just text and URL
      const shareUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent(`I survived for ${score} seconds without a bikelane! ${messageString}`);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`, '_blank');
    });
  };
  buttonContainer.appendChild(fbButton);

  // Instagram Share Button
  const igButton = document.createElement("button");
  igButton.textContent = "IG";
  igButton.onclick = () => {
    generateImage().then((dataUrl) => {
      // Unfortunately, Instagram doesn't have a web API for sharing
      // The best we can do is help users save the image and copy the text
      // First, save the image
      const link = document.createElement("a");
      link.download = `I-survived-${score}s-without-a-bike-lane-thanks-doug.png`;
      link.href = dataUrl;
      link.click();
      
      // Then copy the text
      const shareText = `I survived for ${score} seconds without a bikelane! ${messageString}\n\nPlay at: ${window.location.href}`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          igButton.textContent = "SAVED!";
          setTimeout(() => {
            igButton.textContent = "IG";
          }, 2000);
          alert("Image saved! Text copied to clipboard. You can now create a new post on Instagram with these.");
        })
        .catch(() => alert("Couldn't copy text for Instagram!"));
    });
  };
  buttonContainer.appendChild(igButton);

  const closeButton = document.createElement("button");
  closeButton.textContent = "CLOSE";
  closeButton.onclick = () => {
    overlay.remove();
    gameInstance.togglePause();
    gameInstance.restart();
  };
  buttonContainer.appendChild(closeButton);

  overlay.appendChild(socialCard);
  overlay.appendChild(buttonContainer);
  document.body.appendChild(overlay);
}