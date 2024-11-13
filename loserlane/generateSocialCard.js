const ART = {
    BIKE: {
        art: 
        [" O ", 
         "^|^", 
         " O "],
    },
    PEDESTRIAN: {
        art: [
            "○", 
            "╽"
        ]
    },
    STREETCAR: {
        art: [
            "┌0--─0┐",
            "│▀▀▀▀▀│",
            "│  T  │",
            "│  T  │",
            "│  C  │",
            "│     │",
            "│     │",
            "│     │",
            "└─────┘"
        ]
    },

    CAR: {
        art: [
            "┌.─.┐",
            "│▀▀▀│",
            "|   │",
            "│▀▀▀│",
            "╰───╯"
        ],
        width: 5,
        height: 6
    },

    PARKEDCAR: {
        art: [
            "┌.─.┐",
            "│▀▀▀│",
            "|   │",
            "│▀▀▀│",
            "╰───╯"
        ],
        width: 5,
        height: 6
    },
    DOOR: {
        art: [
            "  ┌.─.┐ ",
            "── ▀▀▀│ ",
            "  |   │ ",
            "  │▀▀▀│ ",
            "  ╰───╯ "
        ]
    },

    TRACKS: {
        art: [
            " ||  || ",
            " ||  || ",
            " ||  || ",
            " ||  || "
        ]
    },
};

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
        score: styles.getPropertyValue("--colour-score").trim()
    };
    const fonts = {
        gameOver: styles.getPropertyValue("--font-game-over").trim(),
        reason: styles.getPropertyValue("--font-reason").trim(),
        message: styles.getPropertyValue("--font-message").trim(),
        face: styles.getPropertyValue("--font-face").trim(),
        score: styles.getPropertyValue("--font-score").trim()
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
        { text: `Score: ${score}`, y: boxYPosition + 120, colour: colours.score, font: fonts.score }
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
                navigator.share({
                    files: [file],
                    title: "D E A D",
                    text: `I scored ${score} in the game! ${message} ${randomFace}`
                }).catch(() => alert("Failed to share image. Please try again."));
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



function generateSocialCardNoSS(reason, score, messageText, randomFace) {
    const overlay = document.createElement("div");
    overlay.className = "screenshot-overlay";

    const entityData = ART[reason] || { art: ["N/A"] };
    const art = Array.isArray(entityData.art) ? entityData.art.join("\n") : "N/A";

    const socialCard = document.createElement("div");
    socialCard.className = "social-card";
    // <p class="message-reason"><strong></strong> ${reason}</p>
    // <pre class="ascii-art">${art}</pre>

    socialCard.innerHTML = `
      <h2 class="game-over-title">DEAD</h2>
            <p class="message-text">${messageText}</p>
                  <span class="cute-death-face">${randomFace}</span>
      <p class="score-text">Score: ${score}</p>
    `;
    overlay.appendChild(socialCard);

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
                    navigator.share({
                        files: [file],
                        title: "D E A D",
                        text: `I scored ${score} in the game! ${messageText} ${randomFace}`
                    }).catch(() => alert("Failed to share image. Please try again."));
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

    overlay.appendChild(buttonContainer);
    document.body.appendChild(overlay);
}

