
// const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
// const dayIDs = [];
// for (var i = 0; i < numbers.length; i++) {
//   let day = "day";
//   let dateNumber = numbers[i];
//   let oneDay = day.concat(dateNumber);
//   oneDay = document.getElementById(oneDay);
//   oneDay.addEventListener('click', openVideo(oneDay));
//   dayIDs.push(oneDay);  
// }


// need to find where I disable things. Is there a style making the link invisible?
// is something making the link unclickable? 

// To "disable" a link, you can remove its href attribute, or add a click handler that returns false.


var end = new Date('2021-11-17');
var now = new Date();
console.log(now);
if (end - now <= 0) {
    // var e = document.getElementById('locked');
    // e.parentElement.removeChild(e);
}


let numbers = {
  day1:{
    dayID:"day1",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day2:{
    dayID:"day2",
    youtube:"https://www.youtube.com/embed/3t13XOceq0Q"
  },
  day3:{
    dayID:"day3",
    youtube:"https://www.youtube.com/embed/u_cLu4XM1uM"
  },
  day4:{
    dayID:"day4",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day5:{
    dayID:"day5",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day6:{
    dayID:"day6",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day7:{
    dayID:"day7",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day8:{
    dayID:"day8",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day9:{
    dayID:"day9",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day10:{
    dayID:"day10",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day11:{
    dayID:"day11",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day12:{
    dayID:"day12",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day13:{
    dayID:"day13",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day14:{
    dayID:"day14",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day15:{
    dayID:"day15",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day16:{
    dayID:"day16",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day17:{
    dayID:"day17",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day18:{
    dayID:"day18",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day19:{
    dayID:"day19",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day20:{
    dayID:"day20",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day21:{
    dayID:"day21",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day22:{
    dayID:"day22",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day23:{
    dayID:"day23",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  },
  day24:{
    dayID:"day24",
    youtube:"https://www.youtube.com/embed/LJMRu0UAYRg"
  }
};

for (const number in numbers) {
  let thisDay = numbers[number].dayID;
  let thisVideo = numbers[number].youtube;
  thisDay = document.getElementById(thisDay);
  thisDay.addEventListener('click', openVideo());
}

// sRxrwjOtIag
function openVideo(e) {  
  function functionThatReceivesAnEvent(event) {
      for (const number in numbers) {
      }
      displayVidDiv(event);
  };
  return functionThatReceivesAnEvent;
}

let vidDiv = document.getElementById("vidDiv");

function displayVidDiv(e){
  let clickedDayID = e.path[1].id;
  // console.log(clickedDayID);
  let thisVideo = numbers[clickedDayID].youtube;
  // console.log(thisVideo);
  vidDiv.classList.add("vidDiv");

  vidDiv.innerHTML = "<iframe title='YouTube video player' type=\'text/html\' width='100%' height='100%' src=" + thisVideo + " frameborder='0' allowFullScreen></iframe>"
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
