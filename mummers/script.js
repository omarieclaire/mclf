const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
const dayIDs = [];
for (var i = 0; i < numbers.length; i++) {
  let day = "day";
  let dateNumber = numbers[i];
  let oneDay = day.concat(dateNumber);
  oneDay = document.getElementById(oneDay);
  oneDay.addEventListener('click', openVideo(oneDay));
  dayIDs.push(oneDay);  
}



var videoelement = document.createElement("video");
videoelement.setAttribute("id", "video1");

var sourceMP4 = document.createElement("source"); 
sourceMP4.type = "video/mp4";
sourceMP4.src = "https://www.youtube.com/watch?v=ejDbI_bwSbM";
videoelement.appendChild(sourceMP4);

// var sourceWEBM = document.createElement("source"); 
// sourceWEBM.type = "video/webm";
// sourceWEBM.src = "https://www.youtube.com/watch?v=ejDbI_bwSbM";
// videoelement.appendChild(sourceWEBM);

//maybe here I need to append the videoelement to the #vidDiv instead of whatever this says
var vidDiv = document.getElementById(vidDiv);
console.log(vidDiv);
// vidDiv.appendChild(videoelement);
// document.querySelector('vidDiv').html(videoelement);
// var video = document.getElementById("video1");
// video.play();





function openVideo(day) {
  function functionThatReceivesAnEvent(event) {
      for (var i = 0; i < dayIDs.length; i++) {
	      // dayIDs[i].style.backgroundColor = "blue"; 
      }
      // day.style.backgroundColor = "red";  
      displayVidDiv();
  };
  return functionThatReceivesAnEvent;
}

vidDiv = document.getElementById("vidDiv");
closeButton = document.getElementById("closeButton");
closeButton.addEventListener('click', hideVidDiv);

function displayVidDiv(){
  vidDiv.classList.add("vidDiv");
  closeButton.classList.add("visible");
}

function hideVidDiv(){
  vidDiv.classList.remove("vidDiv");
  closeButton.classList.remove("visible"); 
}