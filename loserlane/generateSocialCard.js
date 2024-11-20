const ART = {
  WANDERER: {
    art: [
      "       WHY HIT FRIEND? ",
      "                       ",
      "               o_/    ",
      "      __o    _/|      ",
      "     _\\<,_    /\\     ",
      "___(*)/(*)___\\_\\____",
    ],
  },
  TTC: {
    art: [
      "                               \\      ",
      "     I STILL ♡ PUBLIC TRANSIT   /      ",
      "     __o        ┌═════════^════^═══════",
      "    _\\<,_      / □□□ || □ TTC □||□□ ║║",
      " __(*)/(*)_____\\──═══────────────═══───",
    ],
  },
  ONCOMING_DEATHMACHINE: {
    art: [
      "SO THIS IS HOW IT ENDS____     ",
      "     __o          __/_O│_\\_   ",
      "    _\\<,_      >/_ ____ _ _\\  ",
      " __(*)/(*)_______(_)_____(_)___ ",
    ],
  },
  TRAFFIC: {
    art: [
    "     _____        GOODNIGHT  ",
    "   _/_│O_\\_         __o     ",
    " /_ ____ _ _\\<      _\\<,_  ",
    "__(_)_____(_)______(*)/(*)___"],

  },
  PARKEDDEATHMACHINE: {
    art: [
     "        NOOOO00  ______      ",
      "     __o      _/__││__\\__ ",
      "    _\\<,_   /_ ______ ___[ ",
      " __(*)/(*)____(_)_____(_)___ "],

  },
  DOOR: {
    art: [
      "          OOPSIE, DOOR SCORE!",
      "                   _____     ",
      "     __o        __/_│O_\\    ",
      "    _\\<,_     /_ _\\|/___\\ ",
      " __(*)/(*)_____(_)__/\\(_)__ ",
    ],
  },
  TRACKS: {
    art: [
        "     RAIL FAIL //  //",
        "       __o   //   // ",
        "      _\\<,_    //  ",
        " ════(*)/(*)═══════ ",
        " ══════════════════ "],
  },
  BUILDING: {
    art: [
      " PLEASE DON'T   ╭═══╧════╮",
      "   WRITE THIS   │ ░DANK░ │",
      "     IN MY OBIT │∷╳∷∷∷∷╳∷│",
      "                │ ░WEED░ │",
      "     __o        │═╥═╦╦═╥═│",
      "    _\\<,_      │ ║ ║║ ║ ║",
      " ══(*)/(*)══════└≈≈≈≈≈≈≈≈┘",
    ],
  },
};

// const ART = {
//   BIKE: {
//     art: [" O ", "^|^", " O "],
//   },
//   WANDERER: {
//       art: [
//         "       WHY HIT FRIEND? ",
//         "                       ",
//         "               o_/    ",
//         "      __o    _/|      ",
//         "     _\\<,_    /\\     ",
//         "___(*)/(*)___\\_\\____"
//     ],
//   },
//   TTC: {
//     art: [
//       "                               \\      ",
//       "       TTCCCCCC????             /      ",
//       "     __o        ┌═════════^════^═══════",
//       "    _\\<,_      / □□□ || □ TTC □||□□ ║║",
//       " __(*)/(*)_____\\──═══────────────═══───"
//   ],
//   },

//   DEATHMACHINE: {
//     art: [
//       "         OH NO!      _____     ",
//       "     __o          __/_O│_\\_   ",
//       "    _\\<,_      >/_ ____ _ _\\  ",
//       " __(*)/(*)_______(_)_____(_)___ "
//     ],
//   },
//   TRAFFIC: {
//     art: ["┌.─.┐", "│▀▀▀│", "|   │", "│▀▀▀│", "╰───╯"],
//   },

//   PARKEDDEATHMACHINE: {
//     art: [
//       "      OUCH!      _____      ",
//       "     __o      __/__││__\\_  ",
//       "    _\\<,_   /_ ______ __ \\( ",
//       " __(*)/(*)____(_)_____(_)___ "
//     ],

//     width: 5,
//     height: 6,
//   },
//   DOOR: {
//     art: ["  ┌.─.┐ ", "── ▀▀▀│ ", "  |   │ ", "  │▀▀▀│ ", "  ╰───╯ "],
//   },

//   TRACKS: {
//     art: [" ||  || ", " ||  || ", " ||  || ", " ||  || "],
//   },
//   BUILDING: {
//     art: ["┌────────┐", "│SHE     │", "│  SAID  │", "│BOOM    │", "└────────┘"],
//   },
// };

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
    background-color: rgba(2, 0, 0, 0.8);
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
  backgroundOverlay.classList.add("background-overlay"); // Add the CSS class
  socialCard.appendChild(backgroundOverlay);

  const entityData = ART[reason] || { art: ["N/A"] };
  // const entityData = ART["CRASH"]; // Forces it to always use CRASH art

  const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "TRAFFIC";

  // Content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "sharebox-content-container";
  // contentContainer.style.zIndex = "1";

  // Message text
  const messageText = document.createElement("p");
  messageText.className = "message-text";

  messageText.innerHTML = messageString;
  // contentContainer.appendChild(messageText);

  // Score text
  const scoreText = document.createElement("p");
  scoreText.className = "score-text";
  scoreText.innerHTML = `I survived ${score} seconds without a bike lane`;
  contentContainer.appendChild(scoreText);

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
    // .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`))
    .join("");

  const asciiArtOverlay = document.createElement("pre");
  asciiArtOverlay.className = "ascii-art overlay";
  asciiArtOverlay.innerHTML = art
    .split("")
    // .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`))
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
    // .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(21deg);">${char}</span>`))
    .join("");
  asciiArtOverlay2.style.position = "absolute";
  asciiArtOverlay2.style.top = "0";
  asciiArtOverlay2.style.left = "0";
  asciiArtOverlay2.style.color = "#e7a900";
  asciiArtOverlay2.style.opacity = "0.8";
  asciiArtOverlay2.style.pointerEvents = "none";

  asciiWrapper.appendChild(asciiArt);
  // asciiWrapper.appendChild(asciiArtOverlay);
  // asciiWrapper.appendChild(asciiArtOverlay2);
  contentContainer.appendChild(asciiWrapper);

  // Score text
  // const doug = document.createElement("p");
  // doug.className = "doug";
  // doug.innerHTML = `WE NEED BIKE LANES`;
  // contentContainer.appendChild(doug);

  // THANKS DOUG
  const doug2 = document.createElement("p");
  doug2.className = "thanks-doug";
  doug2.innerHTML = `THANKS DOUG`;
  contentContainer.appendChild(doug2);

  // Sad face
  // const faceContainer = document.createElement("div");
  // faceContainer.style.textAlign = "center";
  // const sadFace = document.createElement("span");
  // sadFace.className = "cute-death-face";
  // sadFace.innerHTML = randomFace;
  // faceContainer.appendChild(sadFace);
  // contentContainer.appendChild(faceContainer);
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
    return html2canvas(socialCard).then((canvas) => canvas.toDataURL("image/png"));
  };

  const downloadImageCopyLinkBtn = document.createElement("button");
  downloadImageCopyLinkBtn.textContent = "SAVE IMAGE + COPY LINK";
  downloadImageCopyLinkBtn.onclick = () => {
    generateImage().then((dataUrl) => {
      // Save the image
      const link = document.createElement("a");
      link.download = `I-survived-${score}s-without-a-bike-lane-thanks-doug.png`;
      link.href = dataUrl;
      link.click();

      // Then copy the text
      const shareText = `I survived for ${score} seconds without a bike lane. How long will you survive? ${messageString}\n\nPlay at: ${window.location.href}`;
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          downloadImageCopyLinkBtn.textContent = "IMAGE SAVED & LINK COPIED!";
          showMessage("Share this image and your story. Use your voice, save the bike lanes!", "CTO");
          setTimeout(() => {
            downloadImageCopyLinkBtn.textContent = "COPY";
          }, 9000);
        })
        .catch(() => showMessage("Couldn't copy text", "error"));
    });
  };

  buttonContainer.appendChild(downloadImageCopyLinkBtn);

  // Function to show messages in .screenshot-overlay
  function showMessage(text, type) {
    const overlay = document.querySelector(".screenshot-overlay");
    if (!overlay) {
      console.error("Error: .screenshot-overlay not found in DOM.");
      return;
    }

    let messageContainer = overlay.querySelector("#message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      overlay.appendChild(messageContainer);
    }

    const messageElement = document.createElement("p");
    messageElement.textContent = text;
    messageElement.className = type; // Add a class for styling (e.g., "success" or "error")
    messageContainer.innerHTML = ""; // Clear any existing messages
    messageContainer.appendChild(messageElement);
  }

  const closeButton = document.createElement("button");
  closeButton.textContent = "CLOSE";
  
  // Store the auto-restart timeout
  const autoRestartTimeout = setTimeout(() => {
    gameInstance.restart();
    if (overlay) overlay.remove();
  }, 6000);

  closeButton.onclick = () => {
    clearTimeout(autoRestartTimeout); // Cancel the auto-restart
    overlay.remove();
    gameInstance.restart();
  };
  buttonContainer.appendChild(closeButton);

  overlay.appendChild(socialCard);
  overlay.appendChild(buttonContainer);
  document.body.appendChild(overlay);
}