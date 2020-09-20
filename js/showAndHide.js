function showAndHide() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("showAndHide");
  var btnText = document.getElementById("showAndHideBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read many more questions";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less questions";
    moreText.style.display = "inline";
  }
}
