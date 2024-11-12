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

function generateSocialCard(reason, score, message, randomFace) {
    // Remove any existing social card to prevent duplicates
    const existingCard = document.getElementById("social-card");
    if (existingCard) {
      existingCard.remove();
    }
  
    // Create the social card
    const socialCard = document.createElement("div");
    socialCard.id = "social-card";
  
    // Retrieve art from ART based on reason
    const entityData = ART[reason] || { art: ["N/A"] };
    const art = Array.isArray(entityData.art) ? entityData.art.join('\n') : "N/A";
  
    // Set the content for the social card with separate elements
    // <p><strong>Reason:</strong> ${reason}</p>
    
    socialCard.innerHTML = `
      <h2>Game Over</h2>
      <pre>${art}</pre>
   

      <p>${message}</p>
      <span class="cute-death-face">${randomFace}</span>
      <p>Score: ${score}</p>
      <button id="download-card-btn">Save Card</button>
      <button id="share-card-btn">Share to Socials</button>
    `;
  
    document.getElementById("game-container").appendChild(socialCard);
  
    // Event listener for downloading the card
    document.getElementById("download-card-btn").addEventListener("click", () => {
      socialCard.classList.add("hide-buttons");
      html2canvas(socialCard).then((canvas) => {
        const link = document.createElement("a");
        link.download = "social_card.png";
        link.href = canvas.toDataURL();
        link.click();
        socialCard.classList.remove("hide-buttons");
      }).catch((error) => {
        alert("Failed to save image. Please try again.");
        socialCard.classList.remove("hide-buttons");
      });
    });
  
    // Event listener for sharing the card
    document.getElementById("share-card-btn").addEventListener("click", () => {
      socialCard.classList.add("hide-buttons");
      html2canvas(socialCard).then((canvas) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], "social_card.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: "My Game Over Card",
              text: `I scored ${score} in the game! ${message} ${randomFace}`
            }).catch(() => {
              alert("Failed to share image. Please try again.");
            });
          } else {
            alert("Your browser doesn't support direct sharing.");
          }
          socialCard.classList.remove("hide-buttons");
        });
      }).catch(() => {
        alert("Failed to share image. Please try again.");
        socialCard.classList.remove("hide-buttons");
      });
    });
  }
  