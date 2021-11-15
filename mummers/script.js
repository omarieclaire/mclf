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

// sRxrwjOtIag
function openVideo(day) {
  function functionThatReceivesAnEvent(event) {
      for (var i = 0; i < dayIDs.length; i++) {
      }
      displayVidDiv();
  };
  return functionThatReceivesAnEvent;
}

let vidDiv = document.getElementById("vidDiv");

function displayVidDiv(){
  vidDiv.classList.add("vidDiv");
  vidDiv.innerHTML = "<iframe title='YouTube video player' type=\'text/html\' width='100%' height='100%' src='http://www.youtube.com/embed/LJMRu0UAYRg' frameborder='0' allowFullScreen></iframe>"
  var a = document.createElement('a');
  a.classList.add("close");
  a.id = "closeButton";
  a.href = "#";
  vidDiv.appendChild(a);
  a.addEventListener('click', hideVidDiv);
  vidDiv.classList.add("visible");
}

function hideVidDiv(){
  console.log("dgdf");
  vidDiv.innerHTML = null;
  vidDiv.classList.remove("vidDiv");
  vidDiv.classList.remove("visible");
  closeButton.classList.remove("visible"); 
}