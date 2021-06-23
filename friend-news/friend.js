// const { debug } = require("console");

let currentNews = {
}

let adventureNews = [];
let seekingNews = [];
let feelingsNews = [];
let somethingIMadeNews = [];
let eventsNews = [];
let foodNews = [];
let victoryNews = [];
let todayInMyLifeNews = [];
let guestColumnNews = [];

var firebaseConfig = {
  apiKey: "AIzaSyDnDpeWhfeigPlDtN8I0UKVhFvZftMoMqw",
  authDomain: "friendnews-ca63b.firebaseapp.com",
  projectId: "friendnews-ca63b",
  storageBucket: "friendnews-ca63b.appspot.com",
  messagingSenderId: "969448591319",
  appId: "1:969448591319:web:953fce13e18afe987cc592",
  measurementId: "G-KYK7S5CLXM"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let newsRef = firebase.database().ref("news");
let storageRef = firebase.storage().ref();

newsRef.on("value", gotData, err);


function makeArticle(currArray, section) {
  for (let i = 0; i < currArray.length; i++) {
    const currItem = currArray[i];
    const newArticle = document.createElement("article");
    const newH3 = document.createElement('h3');
    const newSpan = document.createElement('span');
    const newImg = document.createElement('img');

    const currTitle = document.createTextNode(currItem.newsTitle);
    const currAuthor = document.createTextNode(currItem.newsAuthor);
    // const currImg = document.createTextNode(currItem.newImg);
    // console.log(currItem);
    newImg.setAttribute("src", currItem.newsImg);

    newSpan.appendChild(currAuthor);
    newSpan.classList.add("author");

    // newImg.(currImg);
    newImg.classList.add('img');

    const currText = document.createTextNode(currItem.newsText);
    newH3.appendChild(currTitle);
    newArticle.appendChild(currText);

    section.appendChild(newH3);
    section.appendChild(newSpan);
    section.appendChild(newArticle);
    section.appendChild(newImg);
  }
}

function printAllNews() {
  // console.log("printallnews");
  let adventureSection = document.getElementById("adventureSection");
  let seekingSection = document.getElementById("seekingSection");
  let feelingsSection = document.getElementById("feelingsSection");
  let somethingIMadeSection = document.getElementById("somethingIMadeSection");
  let eventsSection = document.getElementById("eventsSection");
  let foodSection = document.getElementById("foodSection");
  let victorySection = document.getElementById("victorySection");
  let todayInMyLifeSection = document.getElementById("todayInMyLifeSection");
  let guestColumnSection = document.getElementById("guestColumnSection");

  makeArticle(adventureNews, adventureSection);
  makeArticle(seekingNews, seekingSection);
  makeArticle(feelingsNews, feelingsSection);
  makeArticle(somethingIMadeNews, somethingIMadeSection);
  makeArticle(eventsNews, eventsSection);
  makeArticle(foodNews, foodSection);
  makeArticle(victoryNews, victorySection);
  makeArticle(todayInMyLifeNews, todayInMyLifeSection);
  makeArticle(guestColumnNews, guestColumnSection);
}




function gotData(data) {
  let news = data.val() || {}; //news is now an object containing a bunch of keys which each contain their own objects
  let keys = Object.keys(news); //keys is now an array? of two objects like this: "0: "-McHIbxzPVuYPIuT4dTk""
  for (let i = 0; i < keys.length; i++) { //here i will be 0 and 1
    let k = keys[i]; // this is -McHIbxzPVuYPIuT4dTk and then -McHJ74gvcHlxeBuI6UD
    currentNews[k] = {}; // currentNews[0] is now an empty object, as as currentNews[1]
    // currentNews[k].newsAuthor = news[k].newsAuthor;
    // currentNews[k].newsTitle = news[k].newsTitle;
    currentNews[k] = news[k]; // how 
  }

  for (const key in currentNews) {
    const newsObj = currentNews[key];
    if (newsObj.hasOwnProperty("newsType")) {
      const newsType = newsObj["newsType"];
      if (newsType === "adventure") {
        adventureNews.push(newsObj)
      } else if (newsType === "seeking") {
        seekingNews.push(newsObj);
      } else if (newsType === "feelings") {
        feelingsNews.push(newsObj);
      } else if (newsType === "something I made") {
        somethingIMadeNews.push(newsObj);
      } else if (newsType === "events") {
        eventsNews.push(newsObj);
      } else if (newsType === "food") {
        foodNews.push(newsObj);
      } else if (newsType === "victory") {
        victoryNews.push(newsObj);
      } else if (newsType === "today in my life") {
        todayInMyLifeNews.push(newsObj);
      } else if (newsType === "guest column") {
        guestColumnNews.push(newsObj);
      }
    } else {
      console.log("error: no newstype");
    }
  }

  //printAllNews();



}

function err() {
}

const newsSubmitButton = document.getElementById('newsSubmit');

newsSubmitButton.addEventListener('click', submitForm);

function submitForm(e) {
  e.preventDefault();
  let newsAuthor = getInputVal('newsAuthor');
  let newsTitle = getInputVal('newsTitle');
  let newsType = getInputVal('newsType');
  let newsText = getInputVal('newsText');
  //let newsImg = getInputVal('newsImg');
  // gets the first file from the list of files selected to be uploaded
  let newsImgFile = document.getElementById('newsImg').files[0];
  let relativeFileLocation = 'images/' + newsImgFile.name;

  let imgRef = storageRef.child(relativeFileLocation);

  imgRef.put(newsImgFile).then((snapshot) => {
    console.log(`uploaded file: ${snapshot.ref.name}`);


    let newsImg = snapshot.ref.name;
    saveNews(newsAuthor, newsTitle, newsType, newsText, newsImg);

    document.querySelector(".alert").style.display = "block";
    document.getElementById("newsForm").style.display = "none";


    // hide alert after 3s
    setTimeout(function () {
      document.querySelector(".alert").style.display = "none";
      document.getElementById("newsForm").style.display = "block";

    }, 6000);

    document.getElementById("newsForm").reset();


  });

  // now, we need to upload the file
  // and when the file upload is complete
  // we then save the data to the database

}

function getInputVal(id) {
  return document.getElementById(id).value;
}

function saveNews(newsAuthor, newsTitle, newsType, newsText, newsImg) {
  let newNewsRef = newsRef.push();
  newNewsRef.set({
    newsAuthor: newsAuthor,
    newsTitle: newsTitle,
    newsType: newsType,
    newsText: newsText,
    newsImg: newsImg
  });
  console.log("saving");
}