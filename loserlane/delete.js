function generateSocialCard(canvas, reason, score, message, randomFace) {
  const cropSize = 500;
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = cropSize;
  finalCanvas.height = cropSize;
  const finalCtx = finalCanvas.getContext("2d");

  // Draw the game screen capture onto the final canvas
  const startX = (canvas.width - cropSize) / 2;
  const startY = (canvas.height - cropSize) / 2;
  finalCtx.drawImage(canvas, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  // Get CSS styles from :root
  const styles = getComputedStyle(document.documentElement);
  const fontMain = styles.getPropertyValue("--font-main").trim();
  const colours = {
    gameOver: styles.getPropertyValue("--colour-game-over").trim(),
    reason: styles.getPropertyValue("--colour-reason").trim(),
    message: styles.getPropertyValue("--colour-message").trim(),
    face: styles.getPropertyValue("--colour-face").trim(),
    score: styles.getPropertyValue("--colour-score").trim(),
  };
  const fonts = {
    gameOver: styles.getPropertyValue("--font-game-over").trim(),
    reason: styles.getPropertyValue("--font-reason").trim(),
    message: styles.getPropertyValue("--font-message").trim(),
    face: styles.getPropertyValue("--font-face").trim(),
    score: styles.getPropertyValue("--font-score").trim(),
  };

  // Draw a semi-transparent box for legibility
  const boxYPosition = cropSize - 150;
  finalCtx.fillStyle = "rgba(0, 0, 0, 1)";
  finalCtx.fillRect(0, boxYPosition, cropSize, 130);

  // Define and draw each text element
  finalCtx.textAlign = "center";
  // { text: `Reason: ${reason}`, y: boxYPosition + 60, colour: colours.reason, font: fonts.reason },

  const textPositions = [
    { text: "D E A D", y: boxYPosition + 25, colour: colours.gameOver, font: fonts.gameOver },
    { text: message, y: boxYPosition + 60, colour: colours.message, font: fonts.message },
    { text: randomFace, y: boxYPosition + 90, colour: colours.face, font: fonts.face },
    { text: `Score: ${score}`, y: boxYPosition + 120, colour: colours.score, font: fonts.score },
  ];

  textPositions.forEach(({ text, y, colour, font }) => {
    finalCtx.font = font;
    finalCtx.fillStyle = colour;
    finalCtx.fillText(text, cropSize / 2, y);
  });

  // Generate an overlay for the screenshot
  const overlay = document.createElement("div");
  overlay.className = "screenshot-overlay";
  overlay.style.cssText = `
   
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-colour: rgba(0, 0, 0, 0.7);
      z-index: 10000;
  `;

  // Add screenshot image to overlay
  const screenshotImage = new Image();
  screenshotImage.src = finalCanvas.toDataURL();
  screenshotImage.alt = `Game Over screen. Reason: ${reason}, Message: ${message}, Face: ${randomFace}, Score: ${score}`;
  screenshotImage.style.width = `${cropSize}px`;
  screenshotImage.style.height = `${cropSize}px`;
  screenshotImage.style.border = "3px dashed var(--green)";
  overlay.appendChild(screenshotImage);

  // Button container with save, share, and close buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const saveButton = document.createElement("button");
  saveButton.textContent = "SAVE";
  saveButton.onclick = () => {
    const link = document.createElement("a");
    link.download = "game_over_screenshot.png";
    link.href = screenshotImage.src;
    link.click();
  };
  buttonContainer.appendChild(saveButton);

  const shareButton = document.createElement("button");
  shareButton.textContent = "SHARE";
  shareButton.onclick = () => {
    finalCanvas.toBlob((blob) => {
      const file = new File([blob], "game_over_screenshot.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator
          .share({
            files: [file],
            title: "D E A D",
            text: `I scored ${score} in the game! ${message} ${randomFace}`,
          })
          .catch(() => alert("Failed to share image. Please try again."));
      } else {
        alert("Your browser doesn't support direct sharing.");
      }
    });
  };
  buttonContainer.appendChild(shareButton);

  const closeButton = document.createElement("button");
  closeButton.textContent = "CLOSE";
  closeButton.onclick = () => {
    overlay.remove();
    this.restart(); // Restart the game after closing
  };
  buttonContainer.appendChild(closeButton);

  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "1rem";
  buttonContainer.style.marginTop = "1rem";
  overlay.appendChild(buttonContainer);

  document.body.appendChild(overlay);
}
// function generateSocialCardNoSS(canvas, reason, score, messageString, randomFace) {
//     const overlay = document.createElement("div");
//     overlay.className = "screenshot-overlay";

//     const entityData = ART[reason] || { art: ["N/A"] };
//     const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "TRAFFIC";

//     const socialCard = document.createElement("div");
//     socialCard.className = "social-card";

//  // 1. "WE NEED BIKE LANES" header
// //  const message2Reason = document.createElement("p");
// //  message2Reason.className = "message-reason";
// //  message2Reason.innerHTML = `LOSER LANE`;
// //  socialCard.appendChild(message2Reason);

//         // 2. Score text
//         const scoreText = document.createElement("p");
//         scoreText.className = "score-text";
//         scoreText.innerHTML = `I survived ${score} seconds without a bike lane`;
//         socialCard.appendChild(scoreText);

//     // 3. ASCII art with overlays
//     const asciiWrapper = document.createElement("div");
//     asciiWrapper.style.position = "relative";

//     const asciiArt = document.createElement("pre");
//     asciiArt.className = "ascii-art";
//     asciiArt.innerHTML = art.split('').map(char =>
//         char === '\n' ? '<br>' : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`
//     ).join('');

//     const asciiArtOverlay = document.createElement("pre");
//     asciiArtOverlay.className = "ascii-art overlay";
//     asciiArtOverlay.innerHTML = art.split('').map(char =>
//         char === '\n' ? '<br>' : `<span style="display: inline-block; transform: rotate(20deg);">${char}</span>`
//     ).join('');
//     asciiArtOverlay.style.position = "absolute";
//     asciiArtOverlay.style.top = "1px";
//     asciiArtOverlay.style.left = "1px";
//     asciiArtOverlay.style.color = "#FF0000";
//     asciiArtOverlay.style.opacity = "0.5";
//     asciiArtOverlay.style.pointerEvents = "none";

//     const asciiArtOverlay2 = document.createElement("pre");
//     asciiArtOverlay2.className = "ascii-art overlay";
//     asciiArtOverlay2.innerHTML = art.split('').map(char =>
//         char === '\n' ? '<br>' : `<span style="display: inline-block; transform: rotate(21deg);">${char}</span>`
//     ).join('');
//     asciiArtOverlay2.style.position = "absolute";
//     asciiArtOverlay2.style.top = "3px";
//     asciiArtOverlay2.style.left = "3px";
//     asciiArtOverlay2.style.color = "#63f863";
//     asciiArtOverlay2.style.opacity = "0.4";
//     asciiArtOverlay2.style.pointerEvents = "none";

//     asciiWrapper.appendChild(asciiArt);
//     asciiWrapper.appendChild(asciiArtOverlay);
//     asciiWrapper.appendChild(asciiArtOverlay2);
//     socialCard.appendChild(asciiWrapper);

//  // 4. Message text
//  const messageText = document.createElement("p");
//  messageText.className = "message-text";
//  messageText.innerHTML = messageString;
//  socialCard.appendChild(messageText);

//     // 5. Sad face
//     const faceContainer = document.createElement("div");
//     faceContainer.style.textAlign = "center";
//     const sadFace = document.createElement("span");
//     sadFace.className = "cute-death-face";
//     sadFace.innerHTML = randomFace;
//     faceContainer.appendChild(sadFace);
//     socialCard.appendChild(faceContainer);

//     // Button container
//     const buttonContainer = document.createElement("div");
//     buttonContainer.className = "button-container";

//     const saveButton = document.createElement("button");
//     saveButton.textContent = "SAVE";
//     saveButton.onclick = () => {
//         html2canvas(socialCard).then((canvas) => {
//             const link = document.createElement("a");
//             link.download = "game_over_card.png";
//             link.href = canvas.toDataURL();
//             link.click();
//         });
//     };
//     buttonContainer.appendChild(saveButton);

//     const shareButton = document.createElement("button");
//     shareButton.textContent = "SHARE";
//     shareButton.onclick = () => {
//         html2canvas(socialCard).then((canvas) => {
//             canvas.toBlob((blob) => {
//                 const file = new File([blob], "game_over_card.png", { type: "image/png" });
//                 if (navigator.canShare && navigator.canShare({ files: [file] })) {
//                     navigator.share({
//                         files: [file],
//                         title: "WE NEED BIKE LANES",
//                         text: `I survived for ${score} seconds without a bikelane! ${messageString} ${randomFace}`
//                     }).catch((error) => {
//                         console.error('Error sharing:', error);
//                         alert("Failed to share image. Please try again.");
//                     });
//                 } else {
//                     alert("Your browser doesn't support direct sharing.");
//                 }
//             });
//         });
//     };
//     buttonContainer.appendChild(shareButton);

//     const closeButton = document.createElement("button");
//     closeButton.textContent = "CLOSE";
//     closeButton.onclick = () => {
//         overlay.remove();
//         this.restart();
//     };
//     buttonContainer.appendChild(closeButton);

//     overlay.appendChild(socialCard);
//     overlay.appendChild(buttonContainer);
//     document.body.appendChild(overlay);
// }

function generateSocialCardNoSS(canvas, reason, score, messageString, randomFace) {
  const overlay = document.createElement("div");
  overlay.className = "screenshot-overlay";

  const socialCard = document.createElement("div");
  socialCard.className = "social-card";
  socialCard.style.position = "relative";

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
  backgroundOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  socialCard.appendChild(backgroundOverlay);

  const entityData = ART[reason] || { art: ["N/A"] };
  const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "TRAFFIC";

  // Content container
  const contentContainer = document.createElement("div");
  contentContainer.style.position = "relative";
  contentContainer.style.zIndex = "1";

  // Score text
  const scoreText = document.createElement("p");
  scoreText.className = "score-text";
  scoreText.innerHTML = `I survived ${score} seconds without a bike lane`;
  contentContainer.appendChild(scoreText);

  const asciiWrapper = document.createElement("div");
  asciiWrapper.style.position = "relative"; // Make sure this is set
  asciiWrapper.style.width = "fit-content"; // Add this
  asciiWrapper.style.margin = "1.5rem auto"; // Add this to center the wrapper

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
  asciiArtOverlay.style.top = "0"; // Changed to 0
  asciiArtOverlay.style.left = "0"; // Changed to 0
  asciiArtOverlay.style.color = "#FF0000";
  asciiArtOverlay.style.opacity = "0.5";
  asciiArtOverlay.style.pointerEvents = "none";

  const asciiArtOverlay2 = document.createElement("pre");
  asciiArtOverlay2.className = "ascii-art overlay";
  asciiArtOverlay2.innerHTML = art
    .split("")
    .map((char) => (char === "\n" ? "<br>" : `<span style="display: inline-block; transform: rotate(21deg);">${char}</span>`))
    .join("");
  asciiArtOverlay2.style.position = "absolute";
  asciiArtOverlay2.style.top = "0"; // Changed to 0
  asciiArtOverlay2.style.left = "0"; // Changed to 0
  asciiArtOverlay2.style.color = "#63f863";
  asciiArtOverlay2.style.opacity = "0.4";
  asciiArtOverlay2.style.pointerEvents = "none";

  asciiWrapper.appendChild(asciiArt);
  asciiWrapper.appendChild(asciiArtOverlay);
  asciiWrapper.appendChild(asciiArtOverlay2);
  contentContainer.appendChild(asciiWrapper);

  // Message text
  const messageText = document.createElement("p");
  messageText.className = "message-text";

  messageText.innerHTML = messageString;
  contentContainer.appendChild(messageText);

  // Sad face
  const faceContainer = document.createElement("div");
  faceContainer.style.textAlign = "center";
  const sadFace = document.createElement("span");
  sadFace.className = "cute-death-face";
  sadFace.innerHTML = randomFace;
  faceContainer.appendChild(sadFace);
  contentContainer.appendChild(faceContainer);

  // Add the content container to the social card
  socialCard.appendChild(contentContainer);

  // Button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const saveButton = document.createElement("button");
  saveButton.textContent = "SAVE";
  saveButton.onclick = () => {
    html2canvas(socialCard).then((canvas) => {
      const link = document.createElement("a");
      link.download = "game_over_card.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };
  buttonContainer.appendChild(saveButton);

  const shareButton = document.createElement("button");
  shareButton.textContent = "SHARE";
  shareButton.onclick = () => {
    html2canvas(socialCard).then((canvas) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], "game_over_card.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator
            .share({
              files: [file],
              title: "WE NEED BIKE LANES",
              text: `I survived for ${score} seconds without a bikelane! ${messageString} ${randomFace}`,
            })
            .catch((error) => {
              console.error("Error sharing:", error);
              alert("Failed to share image. Please try again.");
            });
        } else {
          alert("Your browser doesn't support direct sharing.");
        }
      });
    });
  };
  buttonContainer.appendChild(shareButton);

  const closeButton = document.createElement("button");
  closeButton.textContent = "CLOSE";
  closeButton.onclick = () => {
    overlay.remove();
    this.restart();
  };
  buttonContainer.appendChild(closeButton);

  overlay.appendChild(socialCard);
  overlay.appendChild(buttonContainer);
  document.body.appendChild(overlay);
}
