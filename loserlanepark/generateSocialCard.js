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
      "     I STILL ♡ U                /      ",
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
      "     _____        HELP?      ",
      "   _/_│O_\\_         __o     ",
      " /_ ____ _ _\\<      _\\<,_  ",
      "__(_)_____(_)______(*)/(*)___"
            ],
  },
  WANDERER: {
    art: [
      "       WHY HIT FRIEND? ",
      "                       ",
      "               o_/     ",
      "      __o    _/|       ",
      "     _\\<,_    /\\     ",
      "___(*)/(*)___\\_\\_____",
    ],
  },
  PARKEDDEATHMACHINE: {
    art: [
      "        NOOOO00  ______     ",
      "     __o      _/__││__\\__  ",
      "    _\\<,_   /_ ______ ___[ ", 
      " __(*)/(*)____(_)_____(_)___ "
    ],
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
    art: ["     RAIL BAIL //  //", "       __o   //   // ", "      _\\<,_    //  ", " ════(*)/(*)═══════ ", " ══════════════════ "],
  },
  BUILDING: {
    art: [
      " PLEASE DON'T   ╭═══╧════╮",
      "   WRITE THIS   │░ DANK ░│",
      "     IN MY OBIT │∷╳∷∷∷∷╳∷│",
      "                │░ WEED ░│",
      "     __o        │═╥═╦╦═╥═│",
      "    _\\<,_      │ ║ ║║ ║ ║",
      " ══(*)/(*)══════└≈≈≈≈≈≈≈≈┘",
    ],
  },
};

function createButton(backgroundColor, content, onClick, ariaLabel, isLarge = false) {
  const button = document.createElement("button");
  // background-color: ${backgroundColor};

  button.style.cssText = `
  padding: ${isLarge ? '12px' : '8px'};
    background-color: ${backgroundColor};
    border: 2px solid ${backgroundColor};
    width: ${isLarge ? '12rem' : '2.5rem'};
    height: ${isLarge ? '2.1rem' : '2.1rem'};
    font-size: ${isLarge ? '1.1rem' : '1.1rem'};
    opacity: .7;

    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
    color: white;
    font-weight: bold;
  `;
  button.innerHTML = content;
  button.setAttribute("aria-label", ariaLabel);
  button.onclick = onClick;
  button.onmouseover = () => (button.style.opacity = "0.8");
  button.onmouseout = () => (button.style.opacity = "1");
  return button;
}

function createSocialButtons(score, messageString) {
  const shareUrl = window.location.href;
  const shareText = `I survived biking in Toronto for ${score} seconds without a bike lane. How long will you survive? Try your luck at: `;

  const socialContainer = document.createElement("div");
  socialContainer.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 1rem;
  `;

  // Original SVG Icons (kept for reference)
  const icons = {
    share: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
    twitter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
    facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    bluesky: `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12.002 0a12 12 0 1 0 12 12 12 12 0 0 0-12-12zm0 21.6a9.6 9.6 0 1 1 9.6-9.6 9.6 9.6 0 0 1-9.6 9.6zm5.643-10.574l-2.327-3.674a3.764 3.764 0 0 0-6.632 0L6.359 11.026a3.764 3.764 0 0 0 3.316 5.558h4.652a3.764 3.764 0 0 0 3.316-5.558z"/></svg>`,
    mastodon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424z"/></svg>`,
  };

  // Share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/dialog/feed?app_id=452384931538596&link=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
      shareText
    )}&display=popup&redirect_uri=${encodeURIComponent(shareUrl)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
    mastodon: `https://mastodon.social/share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
  };

  // Social platforms config - using letters instead of icons
  const socialPlatforms = [
    { name: "twitter", color: "#1DA1F2", content: "X" }, // To use icon instead: content: icons.twitter
    { name: "facebook", color: "#1877F2", content: "f" }, // To use icon instead: content: icons.facebook
    { name: "bluesky", color: "#0085FF", content: "B" }, // To use icon instead: content: icons.bluesky
    { name: "mastodon", color: "#563ACC", content: "M" }, // To use icon instead: content: icons.mastodon
  ];

  // Add native share button if available
  if (navigator.share) {
    const shareButton = createButton(
      "#e7a900",
      // "#ff77df",

      "↑", // To use icon instead: icons.share
      async () => {
        try {
          await navigator.share({
            title: "No Bike Lanes?",
            text: shareText,
            url: shareUrl,
          });
        } catch (err) {
          console.log("Share failed:", err);
        }
      },
      "Share"
    );
    socialContainer.appendChild(shareButton);
  }

  // Add all social platform buttons
  socialPlatforms.forEach((platform) => {
    const button = createButton(platform.color, platform.content, () => window.open(shareUrls[platform.name], "_blank"), `Share on ${platform.name}`);
    socialContainer.appendChild(button);
  });

  return socialContainer;
}

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
  socialCard.style.width = "400px";
  socialCard.style.height = "400px";
  socialCard.style.margin = "0 auto";

  const cropSize = 500;
  const screenshotCanvas = document.createElement("canvas");
  screenshotCanvas.width = cropSize;
  screenshotCanvas.height = cropSize;
  const screenshotCtx = screenshotCanvas.getContext("2d");

  const startX = (canvas.width - cropSize) / 2;
  const startY = (canvas.height - cropSize) / 2;
  screenshotCtx.drawImage(canvas, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  socialCard.style.backgroundImage = `url(${screenshotCanvas.toDataURL()})`;
  socialCard.style.backgroundSize = "cover";
  socialCard.style.backgroundPosition = "center";
  socialCard.style.backgroundRepeat = "no-repeat";

  const backgroundOverlay = document.createElement("div");
  backgroundOverlay.classList.add("background-overlay");
  socialCard.appendChild(backgroundOverlay);

  const entityData = ART[reason] || { art: ["N/A"] };
  const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "TRAFFIC";

  const contentContainer = document.createElement("div");
  contentContainer.className = "sharebox-content-container";

  // buttonContainer.className = "button-container";
  // buttonContainer.style.display = "flex";
  // buttonContainer.style.gap = "8px";
  // buttonContainer.style.justifyContent = "center";
  // buttonContainer.style.marginTop = "1rem";

  const messageText = document.createElement("p");
  messageText.className = "message-text";
  messageText.innerHTML = messageString;

  const scoreText = document.createElement("p");
  scoreText.className = "score-text";
  scoreText.innerHTML = `I survived ${score} seconds without a bike lane`;
  contentContainer.appendChild(scoreText);

  

  const asciiWrapper = document.createElement("div");
  asciiWrapper.style.position = "relative";
  asciiWrapper.style.width = "fit-content";
  asciiWrapper.style.margin = ".5rem auto";
  if (reason === "TTC") {
    asciiWrapper.style.transform = "scale(0.75)";
  }

  const asciiArt = document.createElement("pre");
  asciiArt.className = "ascii-art";
  asciiArt.innerHTML = art.split("").join("");

  asciiWrapper.appendChild(asciiArt);
  contentContainer.appendChild(asciiWrapper);

  // const neverhadachance = document.createElement("p");
  // neverhadachance.className = "never-had-a-chance";
  // neverhadachance.innerHTML = `you never had a chance`;
  // contentContainer.appendChild(neverhadachance);

  const doug2 = document.createElement("p");
  doug2.className = "thanks-doug";
  doug2.innerHTML = `<br>THANKS DOUG`;
  contentContainer.appendChild(doug2);

  socialCard.appendChild(contentContainer);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

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
    messageElement.className = type;
    messageContainer.innerHTML = "";
    messageContainer.appendChild(messageElement);
  }

  const generateImage = () => {
    return html2canvas(socialCard).then((canvas) => canvas.toDataURL("image/png"));
  };

  
  const messageContainer = document.createElement("div");
  messageContainer.id = "message-container";

  const messageElement = document.createElement("p");
  messageElement.className = "CTO";
  messageElement.id = "CTO";
  messageElement.innerHTML = `<a target="_blank" href="https://www.cycleto.ca/keep_lanes_passable">FIGHT FOR YOUR BIKE LANES?</a>`;  

  messageContainer.appendChild(messageElement);

  // Create a single container for all buttons
  const allButtonsContainer = document.createElement("div");
  allButtonsContainer.className = "all-buttons-container";


  // Create download button
  const downloadButton = createButton(
    "#ff77df",
    // "#e7a900",
    "↓",
    () => {
      generateImage().then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `I-survived-${score}s-without-a-bike-lane-thanks-doug.png`;
        link.href = dataUrl;
        link.click();

        const shareText = `I survived for ${score} seconds biking in Toronto without a bike lane. How long will you survive? Try your luck at: ${window.location.href}`;
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            downloadButton.innerHTML = "✓";
            setTimeout(() => {
              downloadButton.innerHTML = "↓";
            }, 6000);
          })
          .catch(() => showMessage("Couldn't copy text", "error"));
      });
    },
    "Save Image and Copy Link",
    false
  );

  // Create social buttons
  const socialButtons = createSocialButtons(score, messageString);

  // Add all buttons to the container
  allButtonsContainer.appendChild(downloadButton);
  Array.from(socialButtons.children).forEach(button => {
    allButtonsContainer.appendChild(button);
  });

  // Add everything to the overlay in the correct order
  overlay.appendChild(socialCard);
  // overlay.appendChild(allButtonsContainer); // All buttons together
  overlay.appendChild(messageContainer); // Message appears before buttons


  document.body.appendChild(overlay);

  // Store the auto-restart timeout
  const autoRestartTimeout = setTimeout(() => {
    gameInstance.restart();
    if (overlay) overlay.remove();
  }, 3500);
}