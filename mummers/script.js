// note to anyone reading this in the future: I made this very quickly, so you'll find some redundancy and unused code

let numbers = {
  day1: {
    day: new Date('November 1, 2021 00:00:01'),
    dayID: "day1",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/SSSvQ8ushNg"
  },
  day2: {
    day: new Date('November 2, 2021 00:00:01'),
    dayID: "day2",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/kUsLMGWUO0k"
  },
  day3: {
    day: new Date('November 3, 2021 00:00:01'),
    dayID: "day3",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/Sexmkj_8Fb0"
  },
  day4: {
    day: new Date('November 4, 2021 00:00:01'),
    dayID: "day4",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/qBJ2DIpYVbA"
  },
  day5: {
    day: new Date('November 5, 2021 00:00:01'),
    dayID: "day5",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/UkUvtcNyy4k"
  },
  day6: {
    day: new Date('November 6, 2021 00:00:01'),
    dayID: "day6",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/v-PTbVAHaUE"
  },
  day7: {
    day: new Date('November 7, 2021 00:00:01'),
    dayID: "day7",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/tv7YttVN_cM"
  },
  day8: {
    day: new Date('November 8, 2021 00:00:01'),
    dayID: "day8",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/61yxl36q7LI"
  },
  day9: {
    day: new Date('November 9, 2021 00:00:01'),
    dayID: "day9",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/NbkoNp5AM8E"
  },
  day10: {
    day: new Date('November 10, 2021 00:00:01'),
    dayID: "day10",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/N1-WBSbNpyo"
  },
  day11: {
    day: new Date('November 11, 2021 00:00:01'),
    dayID: "day11",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/XTkUcpFk6QE"
  },
  day12: {
    day: new Date('November 12, 2021 00:00:01'),
    dayID: "day12",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/GWpCWq4J5ss"
  },
  day13: {
    day: new Date('November 13, 2021 00:00:01'),
    dayID: "day13",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/uG7B7aVivAk"
  },
  day14: {
    day: new Date('November 14, 2021 00:00:01'),
    dayID: "day14",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/djn1iOaWUvc"
  },
  day15: {
    day: new Date('November 15, 2021 00:00:01'),
    dayID: "day15",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/R8Gd29pTDak"
  },
  day16: {
    day: new Date('December 16, 2021 00:00:01'),
    dayID: "day16",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/-ed3EfTKxuQ"
  },
  day17: {
    day: new Date('December 17, 2021 00:00:01'),
    dayID: "day17",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/zRdbQfv7rC0"
  },
  day18: {
    day: new Date('December 18, 2021 00:00:01'),
    dayID: "day18",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/LVAwLDGn-Vk"
  },
  day19: {
    day: new Date('December 19, 2021 00:00:01'),
    dayID: "day19",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/ayg6APzzyXg"
  },
  day20: {
    day: new Date('December 20, 2021 00:00:01'),
    dayID: "day20",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/QWsD_fiMB3o"
  },
  day21: {
    day: new Date('December 21, 2021 00:00:01'),
    dayID: "day21",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/qbZ4FTqOJKQ"
  },
  day22: {
    day: new Date('December 22, 2021 00:00:01'),
    dayID: "day22",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/ZIyLC9w5ro0"
  },
  day23: {
    day: new Date('December 23, 2021 00:00:01'),
    dayID: "day23",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/NnjHyaCVAho"
  },
  day24: {
    day: new Date('December 24, 2021 00:00:01'),
    dayID: "day24",
    isVisible: false,
    youtube: "https://www.youtube.com/embed/PA1RhS4ezYs"
  }
};

const today = new Date();
// console.log(itoday);

// const today = "Fri Nov 19 2021 12:53:31 GMT-0500 (Eastern Standard Time)"
// console.log(today);

function addEventListenersToDays(){
  for (const number in numbers) {
    let thisDay = numbers[number].dayID;
    let thisVideo = numbers[number].youtube;
    thisDay = document.getElementById(thisDay);
    thisDay.addEventListener('click', openVideo());
  }
}
addEventListenersToDays();

dateInPastArrow = (firstDate, secondDate) => firstDate <= secondDate;

// dateInPastArrow = (firstDate, secondDate) => firstDate <= secondDate;


function unBlurOpenDays (){
  // loop through all the days
  for (const number in numbers) {
    // get the day ID
    let thisDayID = numbers[number].dayID;
    let thisDay = numbers[number].day;


    // check if the firstDate is smaller than or equal to the second Date.
    if (dateInPastArrow(thisDay, today)) {
      let thisCalendarDay = document.getElementById(thisDayID);
      let thisIcon = document.getElementById(thisDayID).firstElementChild;
      // remove the blur class when needed
      thisIcon.classList.remove("blurIcon");
      // thisCalendarDay.classList.remove("inactiveTint");
    }
  }
  // add the good hover class 
}

unBlurOpenDays();

// sRxrwjOtIag
function openVideo(e) {
  function functionThatReceivesAnEvent(event) {

    let clickedDayID = event.srcElement.closest("li").id;
    let clickedDay = numbers[clickedDayID].day;
console.log("functionThatReceivesAnEvent");
    // check if the firstDate is smaller than or equal to the second Date.
    if (dateInPastArrow(clickedDay, today)) {
      displayVidDiv(event);
    }
  };
  return functionThatReceivesAnEvent;
}

let vidDiv = document.getElementById("vidDiv");

function displayVidDiv(e) {
  let clickedDayID = e.srcElement.closest("li").id;
  let thisVideo = numbers[clickedDayID].youtube;
  console.log(thisVideo);
  vidDiv.classList.add("vidDiv");
  vidDiv.innerHTML = "<iframe title='YouTube video player' type=\'text/html\' width='80%' height='80%' position='absolute' src=" + thisVideo + " frameborder='0' allowFullScreen></iframe>"
  var a = document.createElement('a');
  a.classList.add("close");
  a.id = "closeButton";
  a.href = "#";
  vidDiv.appendChild(a);
  a.addEventListener('click', hideVidDiv);
  vidDiv.classList.add("visible");
}

function hideVidDiv() {
  vidDiv.innerHTML = null;
  vidDiv.classList.remove("vidDiv");
  vidDiv.classList.remove("visible");
  // closeButton.classList.remove("visible"); 
}
